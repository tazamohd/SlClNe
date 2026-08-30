# ZATCA Integration

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-INT-001                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

SALIS AUTO supports ZATCA (Zakat, Tax and Customs Authority) Phase 2 e-invoicing compliance for Saudi Arabia. Invoices carry seller and buyer VAT numbers, a QR code, a hash chain linking each invoice to its predecessor, and an issuance timestamp. VAT is computed server-side at a configurable rate (default 15%).

## 2. ZATCA Phase 2 Requirements

### 2.1 Regulatory Context

ZATCA Phase 2 (Integration Phase) requires that e-invoices:

1. Are generated in a specific XML format (ZATCA-compliant)
2. Carry the seller's and buyer's VAT registration numbers
3. Include a QR code containing invoice data
4. Are cryptographically stamped and sequentially linked
5. Are reported to the ZATCA platform for clearance or reporting

### 2.2 Current Implementation Status

The system implements the data model and business rules for ZATCA compliance. The invoice table carries all required fields, totals are computed server-side, and issued invoices are immutable. Integration with the ZATCA clearance API is prepared at the data layer but the live API connection is a deployment configuration.

## 3. Invoice Data Model

### 3.1 ZATCA-Specific Columns

The `invoices` table includes these ZATCA-related columns:

| Column              | Type           | Purpose                              |
|---------------------|----------------|--------------------------------------|
| `seller_vat_number` | varchar(20)    | Seller's VAT registration number     |
| `buyer_vat_number`  | varchar(20)    | Buyer's VAT registration number      |
| `qr_code`           | text           | ZATCA QR code data                   |
| `hash_prev`         | varchar(64)    | Hash of the previous invoice          |
| `hash_self`         | varchar(64)    | Hash of this invoice                  |
| `issued_at`         | timestamptz    | Issuance timestamp (immutable once set)|

### 3.2 Financial Columns

| Column               | Type     | Purpose                              |
|-----------------------|----------|--------------------------------------|
| `subtotal_halalas`   | bigint   | Sum of line items (net)              |
| `tax_halalas`        | bigint   | VAT amount (computed server-side)    |
| `discount_halalas`   | bigint   | Total discount                       |
| `total_halalas`      | bigint   | Final amount (subtotal + tax - discount) |
| `paid_halalas`       | bigint   | Amount paid to date                  |

All monetary values are integer halalas (1 SAR = 100 halalas), preventing floating-point rounding from reaching the ledger.

## 4. VAT Computation

### 4.1 Server-Side Computation

Invoice totals are always computed server-side using `computeInvoiceTotals()` from the `@salis/contract/rules` package. The client sends line items with quantities and net unit prices; the server computes:

```
subtotal = SUM(qty * unitPriceHalalas) for each line
tax      = subtotal * VAT_RATE_BPS / 10000
total    = subtotal + tax - discount
```

### 4.2 VAT Rate Configuration

| Variable       | Default | Meaning                              |
|----------------|---------|--------------------------------------|
| `VAT_RATE_BPS` | 1500    | VAT rate in basis points (15.00%)    |

The rate is a deployment setting, not a code literal. A Saudi rate change is applied by updating this environment variable. The finance report endpoint always names the rate it was computed under.

### 4.3 Basis Points

Using basis points (1/100th of a percent) provides exact integer arithmetic for rate calculations. 1500 basis points = 15.00% = the standard Saudi VAT rate.

## 5. Invoice Lifecycle

### 5.1 Status Flow

```
draft -> unpaid -> partial -> paid
draft -> cancelled (terminal)
```

| Status     | Meaning                                    |
|------------|--------------------------------------------|
| `draft`    | Invoice being composed; lines editable      |
| `unpaid`   | Issued; ZATCA fields populated; immutable    |
| `partial`  | Partially paid (0 < paid < total)           |
| `paid`     | Fully paid (paid >= total)                  |
| `cancelled`| Void; cannot be issued                       |

### 5.2 Issuance (`POST /invoices/:id/issue`)

Issuance is the critical transition that populates ZATCA fields and makes the invoice immutable:

1. **Permission check**: `requirePermission(principal, 'invoices', 'e')`
2. **Guard**: Invoice must not already be issued (`issuedAt` must be null)
3. **Guard**: Invoice must not be cancelled
4. **Approval ceiling**: `requireApproval(principal, totalHalalas)` -- the amount must be within the issuer's ceiling
5. **Hash chain**: Compute `hashPrev` (previous invoice's hash) and `hashSelf`
6. **QR code**: Generate `qrCode` via `zatcaQr(invoice)`
7. **Timestamp**: Set `issuedAt` to current time
8. **Status**: Move to `unpaid`
9. **Audit**: Record `issue` action with before/after state

### 5.3 Immutability After Issuance

Once `issuedAt` is set:
- The invoice cannot be updated (returns 409: "An issued invoice is immutable")
- Lines cannot be added, modified, or removed
- Only payment recording is permitted
- The hash chain guarantees the invoice content has not changed

## 6. Hash Chain

### 6.1 Purpose

The hash chain links each invoice to its predecessor, creating a tamper-evident sequence. Any modification to an issued invoice would invalidate its hash and break the chain from that point forward.

### 6.2 Implementation

```
previousHash = hashSelf of the most recently issued invoice in this org
               (NULL if this is the first)
hashSelf     = SHA-256(invoice fields + previousHash)
```

The `previousHash()` function queries the most recently issued invoice (by `issuedAt`) within the tenant to retrieve its `hash_self` value.

### 6.3 Chain Properties

| Property        | Guarantee                                    |
|-----------------|----------------------------------------------|
| Sequential      | Each invoice references its predecessor       |
| Tamper-evident  | Modifying any invoice invalidates its hash    |
| Tenant-scoped   | Hash chains are per-organization              |
| Null-started    | First invoice in an org has `hash_prev = NULL`|

## 7. QR Code

### 7.1 Content

The `zatcaQr()` function generates a QR code containing ZATCA-required invoice data:

- Seller name and VAT number
- Invoice date and time
- Total amount (with VAT)
- VAT amount

### 7.2 Storage

The QR code data is stored in the `qr_code` text column as part of the issuance transaction. It is generated server-side and never accepted from client input.

## 8. Organization VAT Configuration

### 8.1 Seller VAT Number

The seller's VAT number comes from the `organizations` table:

| Column       | Table           | Purpose                    |
|--------------|-----------------|----------------------------|
| `vat_number` | `organizations` | Seller VAT registration    |
| `cr_number`  | `organizations` | Commercial Registration    |

### 8.2 Buyer VAT Number

The buyer's VAT number is provided at invoice creation and stored on the invoice:

| Column              | Source         | Purpose                    |
|---------------------|----------------|----------------------------|
| `buyer_vat_number`  | Invoice input  | Buyer VAT registration     |

The buyer VAT number is redacted in logs (`req.body.buyerVatNumber` -> `[redacted]`).

## 9. Financial Reports

### 9.1 Tax Return Data

The finance report routes (`routes/finance-reports.ts`) provide aggregated data for tax return preparation:

- Total taxable sales per period
- Total VAT collected
- The VAT rate the computation was performed under (`VAT_RATE_BPS`)

### 9.2 Invoice Export

The CSV export endpoint (`GET /invoices/export`) can export up to 50,000 invoices with all ZATCA fields for external reporting tools. Formula injection protection is applied to all exported cells.

## 10. Audit Trail for ZATCA

Invoice-related audit actions:

| Action   | Trigger                        | ZATCA Relevance              |
|----------|--------------------------------|------------------------------|
| `create` | New invoice created            | Draft invoice recorded        |
| `update` | Draft invoice modified         | Pre-issuance changes tracked  |
| `issue`  | Invoice issued (ZATCA stamped) | Issuance event with hash chain|
| `pay`    | Payment recorded               | Payment against issued invoice|

The audit log is append-only (trigger prevents UPDATE/DELETE), providing a tamper-proof record of all invoice operations for ZATCA compliance reviews.

## 11. Line Items

### 11.1 Invoice Line Structure

| Column              | Type       | Purpose                        |
|---------------------|------------|--------------------------------|
| `description`       | varchar    | Line item description (EN)     |
| `description_ar`    | varchar    | Line item description (AR)     |
| `kind`              | varchar    | `part`, `labour`, etc.         |
| `qty`               | float      | Quantity                       |
| `unit_price_halalas`| bigint     | Net unit price in halalas      |
| `part_sku`          | varchar    | Part SKU reference (nullable)  |
| `sort`              | integer    | Display order                  |

VAT is computed at the invoice level (on the subtotal), never per line. This matches the ZATCA requirement for invoice-level tax calculation.

## Related Documents

- [Backend Architecture](../architecture/backend-architecture.md)
- [Database Design](../architecture/database-design.md)
- [Payment Gateway](./payment-gateway.md)
- [Data Protection](../security/data-protection.md)
