# SALIS AUTO -- ADR-008: ZATCA Phase 2 E-Invoicing XML Generation

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-ADR-008                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Accepted                     |
| Classification | Internal -- Confidential     |

## Status

Accepted

## Context

The Zakat, Tax and Customs Authority (ZATCA) of Saudi Arabia mandates Phase 2
(Integration Phase) e-invoicing for all businesses operating in the Kingdom.
SALIS AUTO, as an automotive workshop management platform processing invoices
for multiple organizations, must comply with these requirements for every issued
invoice across all tenants.

ZATCA Phase 2 imposes the following technical requirements:

1. **UBL 2.1 XML format**: Invoices must be represented in Universal Business
   Language (UBL) 2.1 XML, conforming to ZATCA's specific subset and extensions.
2. **QR code with TLV encoding**: Each invoice must carry a QR code containing
   5 mandatory fields encoded using Tag-Length-Value (TLV) binary format.
3. **SHA-256 hash chain**: Each invoice's cryptographic hash must incorporate
   the hash of the previous invoice, creating a tamper-evident sequential chain.
4. **X.509 digital certificates**: Invoices must be digitally signed using X.509
   certificates obtained from the ZATCA portal.
5. **Invoice type differentiation**: Standard invoices (B2B) require real-time
   clearance from ZATCA before they are considered valid. Simplified invoices
   (B2C) require batch reporting within 24 hours.
6. **Immutability after issuance**: Once an invoice is issued (stamped with ZATCA
   fields), it cannot be modified. Corrections require credit/debit notes.

The platform's invoice data model already carries all ZATCA-required fields
(see [ZATCA Integration](../integration/zatca-integration.md)): `seller_vat_number`,
`buyer_vat_number`, `qr_code`, `hash_prev`, `hash_self`, `issued_at`, and all
monetary columns in integer halalas (`subtotal_halalas`, `tax_halalas`,
`discount_halalas`, `total_halalas`, `paid_halalas`). VAT is computed at a
configurable rate via `VAT_RATE_BPS` (default 1500 = 15.00%).

The invoice lifecycle flows from `draft` through `unpaid`, `partial`, to `paid`
(or `cancelled` as terminal). Issuance (`POST /invoices/:id/issue`) is the
critical transition that populates ZATCA fields, generates the QR code, computes
the hash chain, and makes the invoice immutable.

## Decision

SALIS AUTO implements **server-side XML generation** for ZATCA Phase 2 compliance,
with QR code generation using TLV encoding, SHA-256 hash chain integrity, and
X.509 certificate-based digital signing. All cryptographic operations and ZATCA
API interactions occur exclusively on the server.

### XML Generation Pipeline

Invoice XML is generated server-side using UBL 2.1 templates. The pipeline:
(1) load invoice with line items and org VAT configuration from tenant-scoped
tables; (2) recompute totals server-side via `computeInvoiceTotals()` from
`@salis/contract/rules` (client totals never trusted); (3) populate UBL 2.1 XML
with seller/buyer VAT numbers, line items, and computed totals; (4) compute
SHA-256 hash incorporating the previous invoice's hash; (5) sign with X.509
certificate; (6) encode 5 TLV fields into QR code; (7) persist `hash_self`,
`hash_prev`, `qr_code`, and `issued_at` within the issuance transaction.

### QR Code TLV Encoding

The QR code contains 5 mandatory fields encoded in Tag-Length-Value format:

| Tag | Field                    | Type       | Source                          |
|-----|--------------------------|------------|---------------------------------|
| 1   | Seller name              | UTF-8 text | `organizations.name`            |
| 2   | VAT registration number  | UTF-8 text | `organizations.vat_number`      |
| 3   | Invoice timestamp        | ISO 8601   | `invoices.issued_at`            |
| 4   | Invoice total (with VAT) | Decimal    | `invoices.total_halalas / 100`  |
| 5   | VAT amount               | Decimal    | `invoices.tax_halalas / 100`    |

TLV binary encoding format:

```
[Tag: 1 byte][Length: 1 byte][Value: variable bytes]
```

Each field is encoded as a single byte for the tag number, a single byte for the
value length, and the value itself as UTF-8 bytes. The concatenated TLV buffer is
Base64-encoded for embedding in the QR code. Monetary values (tags 4 and 5) are
converted from integer halalas to SAR decimal strings with 2 decimal places for
the TLV payload.

### Hash Chain Implementation

The hash chain creates a tamper-evident sequence of invoices per organization:

```
Invoice 1: hash_prev = NULL (first invoice in org)
            hash_self = SHA-256(invoice_1_fields)

Invoice 2: hash_prev = Invoice_1.hash_self
            hash_self = SHA-256(invoice_2_fields + hash_prev)

Invoice N: hash_prev = Invoice_(N-1).hash_self
            hash_self = SHA-256(invoice_N_fields + hash_prev)
```

The `previousHash()` function queries the most recently issued invoice (ordered
by `issued_at`) within the tenant to retrieve its `hash_self` value. The chain
is tenant-scoped: each organization maintains its own independent hash chain.

Hash chain properties:

| Property        | Guarantee                                          |
|-----------------|----------------------------------------------------|
| Sequential      | Each invoice references its immediate predecessor  |
| Tamper-evident  | Modifying any issued invoice invalidates its hash   |
| Tenant-scoped   | Hash chains are per-organization (`org_id`)         |
| Null-started    | First invoice in an org has `hash_prev = NULL`      |
| Immutable       | Issued invoices cannot be updated (409 response)    |

### Invoice Types and ZATCA Interaction

| Type       | Arabic             | ZATCA Requirement      | Timing              |
|------------|--------------------|------------------------|----------------------|
| Standard   | فاتورة ضريبية      | Real-time clearance    | Before invoice valid |
| Simplified | فاتورة مبسطة       | Batch reporting        | Within 24 hours      |

**Standard (B2B)**: The platform submits signed XML to the ZATCA clearance API;
the invoice is only valid after receiving clearance. Rejection rolls back issuance.
**Simplified (B2C)**: Issued locally and queued for batch reporting within 24 hours.

### X.509 Certificate Management

Each organization obtains an X.509 digital certificate from the ZATCA portal.
The lifecycle: CSR generated server-side, submitted to ZATCA for issuance,
private key stored in secure configuration (environment variables or secrets
manager, never exposed to clients), invoice XML signed with the private key,
and certificate renewal tracked with administrator alerts before expiration.

### Issuance Transaction

The issuance operation (`POST /invoices/:id/issue`) is atomic. Within a single
database transaction: permission check (`requirePermission`), guards (not already
issued, not cancelled), approval ceiling check (`requireApproval`), hash chain
computation, QR generation via `zatcaQr()`, XML signing, timestamp and status
transition (`draft` to `unpaid`), and audit log recording. If any step fails,
the entire issuance rolls back and the invoice remains in `draft` status.

Once `issued_at` is set, the invoice is immutable (returns `409` on update
attempts). Only payment recording is permitted against issued invoices.

### VAT Computation

VAT is computed server-side using basis points for exact integer arithmetic:
`tax = Math.round(subtotal * VAT_RATE_BPS / 10000)` where `VAT_RATE_BPS` defaults
to 1500 (15.00%), configurable via environment variable. VAT is calculated at the
invoice level (on the subtotal), not per line item, matching ZATCA's requirement
for invoice-level tax calculation.

## Consequences

### Positive

- **Private key security**: X.509 private key never leaves the server; immune to
  XSS and client-side extraction.
- **Hash chain integrity**: Server-controlled computation prevents out-of-order or
  tampered entries; `previousHash()` operates under RLS per tenant.
- **Audit trail completeness**: Append-only `audit_log` (trigger refuses UPDATE/DELETE)
  records every invoice operation for ZATCA compliance reviews.
- **Atomic issuance**: Single-transaction guarantee -- fully ZATCA-compliant or
  not issued. No partial states.
- **Exact monetary values**: Integer halalas (see [ADR-006](./adr-006-integer-halalas.md))
  ensure XML amounts, QR values, and hash inputs are deterministic.
- **Tenant isolation**: Hash chain, VAT number, and certificate are per-org via
  `org_id` with RLS preventing cross-tenant access.

### Negative

- **Hash chain serialization**: Concurrent issuance within a tenant requires
  transaction-level locking to maintain chain integrity.
- **Certificate renewal**: Each org must renew its ZATCA certificate before
  expiration; a lapsed certificate blocks invoice issuance.
- **XML validation overhead**: Schema validation against ZATCA's UBL 2.1 subset
  adds processing time to the issuance path.
- **ZATCA API dependency**: Standard invoice clearance depends on ZATCA API
  availability. Mitigated by retry logic and a queuing mechanism.
- **Bilingual requirement**: Both `description` and `description_ar` must be
  populated for compliant XML generation.

### Neutral

- **Invoice export**: The CSV export endpoint (`GET /invoices/export`) supports up
  to 50,000 invoices with all ZATCA fields (MAX_EXPORT_ROWS limit), with formula
  injection protection applied to all exported cells.
- **VAT rate changes**: The `VAT_RATE_BPS` environment variable allows rate changes
  without code deployment. Historical invoices retain the rate they were computed
  under; the finance report endpoint names the rate used in each computation.
- **Approval ceilings**: Invoice issuance is gated by role-based approval ceilings
  (owner/superadmin: unlimited; manager: 50,000 SAR; accountant: 25,000 SAR;
  advisor: 5,000 SAR). Amounts exceeding the ceiling return `422 approval_required`
  (escalation, not denial).

## Alternatives Considered

### 1. Client-Side QR Code Generation

Generate the QR code in the browser or mobile app and submit it with the invoice.

**Rejected because:**
- The QR code encodes financial data (total, VAT amount) that must be
  server-computed. Client-generated QR codes could contain manipulated values.
- The TLV encoding includes the seller's VAT number from the `organizations`
  table, which should not be a client-side concern.
- QR generation depends on the hash chain state, which is server-side data.
- Any client-side cryptographic operation risks private key exposure through
  JavaScript inspection, browser extensions, or XSS attacks.

### 2. Third-Party ZATCA Compliance Service

Delegate XML generation, signing, and ZATCA API submission to an external vendor.

**Rejected because:**
- Data residency concerns: invoice data (customer PII, VAT numbers, financial
  amounts) would be processed externally, requiring careful PDPL vendor assessment.
- Per-invoice pricing becomes significant for a multi-tenant platform at scale.
- Vendor lock-in on a regulatory-critical path.
- Doubled latency on standard invoice clearance (vendor API + ZATCA API).
- In-house ownership enables immediate response to ZATCA specification changes.
- Not ruled out as a future validation/fallback layer.

### 3. Offline Invoice Signing with Sync

Sign invoices offline and sync when connectivity is restored.

**Rejected because:**
- ZATCA Phase 2 requires real-time clearance for standard (B2B) invoices; an
  offline-signed invoice without clearance is not legally valid.
- Hash chain integrity requires sequential issuance; offline signing across
  multiple clients creates chain conflicts.
- Simplified (B2C) invoices already support deferred reporting (within 24 hours),
  covering transient connectivity issues.

### 4. Database-Level Hash Chain (Triggers)

Implement the hash chain as a PostgreSQL trigger on INSERT.

**Rejected because:**
- Hash computation depends on business logic better expressed in application code
  than PL/pgSQL (field selection, ordering, serialization).
- The issuance flow includes non-database operations (QR generation, ZATCA API,
  certificate signing) that must be coordinated with hash computation.
- Application-level control provides better error handling and observability.

## References

- [ZATCA Integration](../integration/zatca-integration.md) -- SYS-INT-001
- [Database Design](../architecture/database-design.md) -- SYS-ARCH-003, Sections 4.5, 5
- [Auth Architecture](../architecture/auth-architecture.md) -- SYS-ARCH-005, Section 7
- [Data Protection](../security/data-protection.md) -- SYS-SEC-004, Sections 7, 10
- [ADR-006: Money as Integer Halalas](./adr-006-integer-halalas.md) -- SA-ADR-006
- [ADR-007: Multi-Tenancy via org_id](./adr-007-multi-tenant-orgid.md) -- SA-ADR-007
- ZATCA E-Invoicing Developer Portal -- Phase 2 Technical Specifications
- UBL 2.1 (OASIS Universal Business Language)
- Saudi Personal Data Protection Law (PDPL)
