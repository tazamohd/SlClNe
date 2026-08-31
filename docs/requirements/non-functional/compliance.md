# Compliance — Non-Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | NFR-CMP-008                              |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Category    | Compliance                               |

## 1. Overview

This document defines the regulatory and compliance requirements for SALIS AUTO, covering ZATCA Phase 2 e-invoicing, VAT calculation, Saudi labor law considerations, data residency, privacy and PII handling, audit trail completeness, and segregation of duties enforcement. The platform operates exclusively in the Kingdom of Saudi Arabia and must comply with applicable Saudi regulations.

## 2. ZATCA Phase 2 E-Invoicing

### 2.1 Regulatory Context

The Zakat, Tax and Customs Authority (ZATCA) mandates electronic invoicing for all VAT-registered businesses in Saudi Arabia. Phase 2 (Integration Phase) requires real-time or near-real-time integration with ZATCA's Fatoora platform.

### 2.2 Invoice Data Requirements

The `invoices` table implements all mandatory ZATCA fields:

| ZATCA Requirement       | Database Column        | Type          | Description                      |
|-------------------------|------------------------|---------------|----------------------------------|
| Seller VAT Number       | seller_vat_number      | varchar(20)   | Organization's VAT registration  |
| Buyer VAT Number        | buyer_vat_number       | varchar(20)   | Customer's VAT registration      |
| Invoice Hash            | hash_self              | varchar(64)   | SHA-256 hash of this invoice     |
| Previous Invoice Hash   | hash_prev              | varchar(64)   | SHA-256 hash of previous invoice |
| QR Code                 | qr_code                | text          | TLV-encoded QR data              |
| Issue Date/Time         | issued_at              | timestamptz   | When the invoice was issued      |

### 2.3 Hash Chain

Each invoice maintains a cryptographic link to its predecessor:

```
Invoice N: hash_prev = hash_self of Invoice N-1
           hash_self = SHA-256(invoice_data)
```

Properties of the hash chain:

- **Tamper evidence**: Altering any invoice breaks the chain from that point forward
- **Sequential integrity**: The chain proves invoice ordering and completeness
- **Non-repudiation**: Once an invoice is in the chain, it cannot be retroactively modified

### 2.4 QR Code Generation

The QR code contains five mandatory TLV (Tag-Length-Value) fields per ZATCA specification:

| Tag | Field              | Source                           |
|-----|--------------------|----------------------------------|
| 1   | Seller Name        | organizations.name               |
| 2   | Seller VAT Number  | invoices.seller_vat_number       |
| 3   | Invoice Timestamp  | invoices.issued_at (ISO 8601)    |
| 4   | Invoice Total      | invoices.total_halalas / 100     |
| 5   | VAT Amount         | invoices.tax_halalas / 100       |

The QR code is generated at invoice issuance and stored in the `qr_code` field.

### 2.5 XML Format

Invoices must be exportable in UBL 2.1 (Universal Business Language) XML format for ZATCA submission. The XML includes:

- Invoice header (seller, buyer, dates, totals)
- Line items (description, quantity, unit price, VAT)
- Cryptographic stamp (hash chain reference)
- QR code data

### 2.6 Invoice Types

| Type              | ZATCA Category    | Buyer VAT Required |
|-------------------|-------------------|--------------------|
| B2B Invoice       | Tax Invoice       | Yes                |
| B2C Invoice       | Simplified        | No                 |
| Credit Note       | Tax Credit Note   | Per original       |
| Debit Note        | Tax Debit Note    | Per original       |

## 3. VAT Calculation

### 3.1 Standard Rate

Saudi Arabia's standard VAT rate is **15%**, effective since July 1, 2020.

### 3.2 Calculation Method

```
tax_halalas = subtotal_halalas * 15 / 100
total_halalas = subtotal_halalas + tax_halalas - discount_halalas
```

### 3.3 Calculation Rules

- VAT is calculated at the invoice level, never per line item
- All monetary values stored as integer halalas (bigint) to prevent floating-point rounding
- Subtotal is the sum of `qty * unit_price_halalas` across all lines
- Discount applied after subtotal, before VAT (or configurable per business requirement)

### 3.4 Organization VAT Registration

The `organizations` table stores:

- `vat_number` (varchar(20)) — Organization's VAT registration number
- `cr_number` (varchar(20)) — Commercial Registration number

These feed into invoice ZATCA fields as `seller_vat_number`.

## 4. Saudi Labor Law Considerations

### 4.1 Employment Data

The `employees` table captures data relevant to Saudi labor compliance:

- `hire_date` — Employment start date for service period calculations
- `status` — active, inactive, terminated status tracking
- `salary_halalas` — Salary stored in halalas for precision

### 4.2 Leave Management

The `leave_requests` table supports Saudi labor law leave types:

| Leave Type | Arabic              | Regulatory Basis                    |
|------------|---------------------|-------------------------------------|
| annual     | إجازة سنوية         | 21-30 days per year per Saudi law   |
| sick       | إجازة مرضية         | Up to 120 days per Saudi labor law  |
| emergency  | إجازة طارئة         | Up to 5 days per year               |
| unpaid     | إجازة بدون راتب     | By agreement                        |

### 4.3 Payroll Compliance

Payroll runs track:

- Gross pay, allowances, deductions, net pay — all in integer halalas
- Period in `YYYY-MM` format
- Posted payroll runs are immutable (cannot be reopened)
- Salary data redacted from non-authorized roles

### 4.4 Working Hours

Timesheets track:

- Clock-in/out times (HH:MM format)
- Worked minutes as integer (no fractional hours)
- Saudi labor law limits: 8 hours/day, 48 hours/week (reduced during Ramadan)

## 5. Data Residency

### 5.1 Requirements

- All customer PII and financial data must reside within Saudi Arabia or approved jurisdictions
- Database hosting must comply with Saudi data localization requirements
- Backups and replicas subject to the same residency constraints

### 5.2 Data Classification

| Classification     | Examples                                         | Residency Requirement |
|--------------------|--------------------------------------------------|-----------------------|
| Financial          | Invoices, payments, journal entries              | Saudi Arabia          |
| Personal (PII)     | Customer names, phones, emails, employee data    | Saudi Arabia          |
| Operational        | Job cards, appointments, inventory               | Saudi Arabia          |
| System             | Audit logs, configurations                       | Saudi Arabia          |
| Authentication     | Password hashes, tokens, sessions                | Saudi Arabia          |

## 6. Privacy and PII Handling

### 6.1 PII Fields in the System

| Table         | PII Fields                                         |
|---------------|-----------------------------------------------------|
| customers     | name, phone, email, notes                           |
| users         | name, email, password_hash                          |
| employees     | name, name_ar, salary_halalas                       |
| fleets        | contact_name, contact_phone, contact_email          |
| suppliers     | contact_name, contact_phone, contact_email          |
| user_sessions | ip, user_agent                                      |
| audit_log     | actor_id, ip, user_agent                            |

### 6.2 Field-Level Redaction

Seven redaction rules protect sensitive data based on role:

| Rule                      | Protected Data                                     |
|---------------------------|----------------------------------------------------|
| Part cost / margin        | Cost prices and profit margins                     |
| Labour cost rate          | Labour rate information                            |
| Employee salary           | Salary and compensation details                    |
| Supplier purchase price   | Vendor pricing data                                |
| Customer contact details  | Phone, email, address                              |
| Bank account details      | Banking information                                |
| Branch P&L                | Profit and loss figures                            |

Redaction is enforced server-side — protected values are nulled before serialization via the `redact()` function and `GLOBAL_REDACTIONS` array. The data never reaches the network.

### 6.3 Audit Log PII Protection

Credentials are scrubbed before audit insertion via the `scrub()` function. The following keys are always redacted:

- password, passwordHash, password_hash
- refreshToken, refreshTokenHash, refresh_token_hash
- accessToken, token
- codeHash, code_hash
- secret, otp

### 6.4 Data Minimization

- Derived fields (`vehicle_count`, `total_spent_halalas`) computed server-side, not collected
- `_label` fields carry presentation strings; machine values stored separately
- Soft deletes preserve data for audit while removing from active queries

## 7. Audit Trail

### 7.1 Completeness

Every mutation writes an audit row in the same transaction:

| Property              | Implementation                                    |
|-----------------------|---------------------------------------------------|
| Append-only           | Database trigger refuses UPDATE and DELETE         |
| Same-transaction      | Audit and change in one transaction                |
| Actor tracking        | actor_id, actor_role recorded                      |
| Before/after state    | JSON snapshots of changed data                     |
| Correlation           | request_id links audit to API request              |
| Source tracking        | api, seed, job, import                             |
| Forensic data         | IP address, user agent                             |

### 7.2 Audit Actions

18 defined audit actions cover all mutation types:

create, update, delete, restore, bulk_update, bulk_delete, transition, assign, approve, reject, post, issue, pay, movement, receive, reserve, release, command, seed

### 7.3 Audit Indexes

- `audit_entity_idx` on `(org_id, entity, entity_id)` — Entity history lookups
- `audit_ts_idx` on `(org_id, ts)` — Chronological queries

### 7.4 Audit Retention

Audit log data is retained indefinitely per regulatory requirements. The append-only nature ensures historical records cannot be modified or deleted.

## 8. Segregation of Duties Enforcement

### 8.1 Declared Pairs

| # | Activity A              | Activity B                | Risk   |
|---|-------------------------|---------------------------|--------|
| 1 | Raise purchase order    | Approve purchase order    | High   |
| 2 | Create supplier         | Approve supplier payment  | High   |
| 3 | Post journal entry      | Approve journal entry     | High   |
| 4 | Perform repair          | Pass quality check        | High   |
| 5 | Issue stock             | Adjust stock count        | Medium |
| 6 | Create employee         | Approve payroll run       | Medium |

### 8.2 Enforcement Mechanism

For enforced pairs, `requireSodClear()` checks the audit trail:

1. Look up audit history for the entity (limited to 200 rows)
2. Match audit rows to activity signatures
3. If the current actor performed the counterpart activity on this entity, reject with 403
4. Log the rejection in a separate transaction (so it survives the caller's rollback)

### 8.3 Observable vs. Unobservable Pairs

| Pair # | Status        | Reason                                            |
|--------|---------------|---------------------------------------------------|
| 1      | Enforced      | create/approve audit signatures on purchase_order |
| 2      | Unobservable  | No supplier-payment approval route                |
| 3      | Unobservable  | No journal approval route                         |
| 4      | Enforced      | transition audit signatures on job_card            |
| 5      | Enforced      | movement audit signatures on part                  |
| 6      | Unobservable  | No payroll approval route                         |

Unobservable pairs are honestly reported via `pairStatus()` and `UNOBSERVABLE` — the system does not pretend to enforce what it cannot observe.

## 9. Cross-References

- [Finance & Accounting](../functional/finance-accounting.md) — Invoice and ZATCA implementation
- [HR & Team](../functional/hr-team.md) — Employment and payroll data
- [Inventory & Procurement](../functional/inventory-procurement.md) — SoD on purchase orders
- [Security](./security.md) — Authentication and authorization framework
- [Reliability](./reliability.md) — Audit trail integrity and transaction isolation
