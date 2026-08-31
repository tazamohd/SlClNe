# Finance & Accounting — Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | FR-FIN-003                               |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Domain      | Finance, Accounting                      |
| Modules     | invoices, payments, accounting           |

## 1. Overview

The Finance and Accounting domain handles invoice lifecycle management with ZATCA Phase 2 e-invoicing compliance, payment recording, receipt generation, chart of accounts, journal entries, expenses, bank reconciliation, and financial reporting. All monetary values are stored as integer halalas (bigint) to eliminate floating-point rounding in ledger operations.

## 2. Invoices

### 2.1 Data Model

The `invoices` table (header) and `invoice_lines` table (line items):

**Header fields:**

| Field                | Type           | Description                              |
|----------------------|----------------|------------------------------------------|
| id                   | varchar(26)    | ULID primary key                         |
| org_id               | varchar(26)    | Tenant isolation                         |
| code                 | varchar(32)    | Human-readable code, unique per org      |
| customer_id          | varchar(26)    | FK to customers                          |
| customer_name        | varchar(200)   | Denormalized for display                 |
| job_card_id          | varchar(26)    | FK to originating job card               |
| vehicle_id           | varchar(26)    | FK to vehicle                            |
| due_date             | date           | Payment due date                         |
| status               | varchar(16)    | draft, issued, paid, overdue             |
| subtotal_halalas     | bigint         | Sum of line totals                       |
| tax_halalas          | bigint         | VAT amount (15% of subtotal)            |
| discount_halalas     | bigint         | Discount amount                          |
| total_halalas        | bigint         | subtotal + tax - discount               |
| paid_halalas         | bigint         | Sum of cleared payments (server-maintained) |
| seller_vat_number    | varchar(20)    | ZATCA: seller VAT registration           |
| buyer_vat_number     | varchar(20)    | ZATCA: buyer VAT registration            |
| qr_code              | text           | ZATCA: QR code data                      |
| hash_prev            | varchar(64)    | ZATCA: hash of previous invoice          |
| hash_self            | varchar(64)    | ZATCA: hash of this invoice              |
| issued_at            | timestamptz    | Invoice issue timestamp                  |

**Line item fields:**

| Field               | Type          | Description                              |
|---------------------|---------------|------------------------------------------|
| invoice_id          | varchar(26)   | FK to invoice header                     |
| description         | varchar(300)  | Line description (EN)                    |
| description_ar      | varchar(300)  | Line description (AR)                    |
| kind                | varchar(16)   | `part` or `labour`                       |
| qty                 | double        | Quantity                                 |
| unit_price_halalas  | bigint        | Net unit price in halalas                |
| part_sku            | varchar(64)   | Part reference (when kind = part)        |
| sort                | integer       | Display order                            |

### 2.2 Invoice Status Lifecycle

```
draft → issued → paid
                → overdue (when past due_date and not fully paid)
```

### 2.3 VAT Calculation

Saudi Arabia mandates 15% VAT:

```
tax_halalas = subtotal_halalas * 15 / 100
total_halalas = subtotal_halalas + tax_halalas - discount_halalas
```

VAT is computed at the invoice level, never per line. This simplifies rounding and matches ZATCA reporting requirements.

### 2.4 ZATCA Phase 2 E-Invoicing

SALIS AUTO implements ZATCA Phase 2 (integration phase) compliance:

| Field             | Purpose                                              |
|-------------------|------------------------------------------------------|
| seller_vat_number | Organization's VAT registration from `organizations.vat_number` |
| buyer_vat_number  | Customer's VAT registration (for B2B invoices)       |
| qr_code           | TLV-encoded QR containing seller name, VAT, timestamp, total, VAT amount |
| hash_prev         | SHA-256 hash of the previous invoice in the chain    |
| hash_self         | SHA-256 hash of this invoice                         |

**Hash Chain**: Each invoice references the hash of its predecessor (`hash_prev`) and stores its own hash (`hash_self`). This creates a tamper-evident chain — altering any invoice in the sequence breaks the chain from that point forward.

**QR Code**: Generated at issuance, encoding the five mandatory TLV fields per ZATCA specification.

**XML Format**: Invoice data must be exportable in UBL 2.1 XML format for ZATCA submission.

### 2.5 Balance Tracking

`paid_halalas` is maintained by the payment route, never by a client-supplied figure. It represents the sum of cleared payments against this invoice. The outstanding balance is `total_halalas - paid_halalas`.

### 2.6 Permissions

| Role         | Grants  | Notes                               |
|--------------|---------|-------------------------------------|
| Owner        | vcedax  | Full access                         |
| Manager      | vceax   | All except delete                   |
| Advisor      | vc      | View and create                     |
| Accountant   | vcedax  | Full access                         |
| Receptionist | vc      | View and create                     |
| Call Center  | v       | View only                           |
| Super Admin  | v       | View only                           |

## 3. Payments

### 3.1 Data Model

The `payments` table:

| Field           | Type          | Description                           |
|-----------------|---------------|---------------------------------------|
| id              | varchar(26)   | ULID primary key                      |
| org_id          | varchar(26)   | Tenant isolation                      |
| invoice_id      | varchar(26)   | FK to invoice                         |
| paid_on         | date          | Payment date                          |
| method          | varchar(40)   | Payment method (cash, card, bank_transfer, mada) |
| method_ar       | varchar(60)   | Arabic payment method label           |
| reference       | varchar(64)   | Payment reference number              |
| amount_halalas  | bigint        | Payment amount in halalas             |
| note            | text          | Optional note                         |

### 3.2 Payment Methods

Supported methods for Saudi market:

- Cash
- Credit/debit card
- Bank transfer
- Mada (Saudi debit network)
- SADAD (bill payment)

### 3.3 Invoice Balance Tracking

When a payment is recorded, the server updates `invoices.paid_halalas` by summing all payments for that invoice. When `paid_halalas >= total_halalas`, the invoice status transitions to `paid`.

### 3.4 Receipt Generation

The `receipts` table stores payment receipt records:

| Field           | Type          | Description                     |
|-----------------|---------------|---------------------------------|
| code            | varchar(32)   | Receipt code, unique per org    |
| receipt_date    | date          | Date of receipt                 |
| customer_name   | varchar(200)  | Customer name                   |
| invoice_code    | varchar(32)   | Related invoice code            |
| method          | varchar(40)   | Payment method                  |
| amount_halalas  | bigint        | Receipt amount                  |
| status          | varchar(16)   | pending, confirmed, voided      |

### 3.5 Permissions

| Role         | Grants  | Notes                               |
|--------------|---------|-------------------------------------|
| Owner        | vcedax  | Full access                         |
| Manager      | vcax    | View, create, approve, export       |
| Advisor      | vc      | View and create                     |
| Accountant   | vcedax  | Full access                         |
| Receptionist | vc      | View and create                     |

## 4. Chart of Accounts

### 4.1 Data Model

The `chart_of_accounts` table:

| Field            | Type          | Description                         |
|------------------|---------------|-------------------------------------|
| code             | varchar(24)   | Account code, unique per org        |
| name             | varchar(200)  | Account name                        |
| type             | varchar(40)   | Account type (asset, liability, equity, revenue, expense) |
| balance_halalas  | bigint        | Current balance in halalas          |
| children_count   | integer       | Number of child accounts            |
| parent_id        | varchar(26)   | FK to parent account (tree structure) |

### 4.2 Tree Structure

Accounts form a hierarchical tree via `parent_id`. The `children_count` field enables efficient leaf/branch detection without querying children.

### 4.3 Permissions

Only Owner (`vax`), Manager (`vx`), Accountant (`vcedax`), and Super Admin (`v`) have access to the `accounting` module.

## 5. Journal Entries

### 5.1 Data Model

The `journal_entries` table:

| Field           | Type          | Description                          |
|-----------------|---------------|--------------------------------------|
| code            | varchar(32)   | Entry code, unique per org           |
| entry_date      | date          | Journal entry date                   |
| ref             | varchar(64)   | Reference number                     |
| narration       | text          | Entry description                    |
| debit_halalas   | bigint        | Total debit amount                   |
| credit_halalas  | bigint        | Total credit amount                  |
| status          | varchar(16)   | draft, posted                        |

### 5.2 Segregation of Duties

The SOD pair "Post journal entry / Approve journal entry" is declared in the rules. Currently, journal entry routes use the generic collection router; the dedicated posting and approval routes are planned, at which point the SOD enforcement will become observable via audit signatures.

### 5.3 Double-Entry Principle

Every journal entry must satisfy: `debit_halalas = credit_halalas`. This invariant is validated server-side before a journal entry can be posted.

## 6. Expenses

### 6.1 Data Model

The `expenses` table:

| Field           | Type          | Description                          |
|-----------------|---------------|--------------------------------------|
| code            | varchar(32)   | Expense code, unique per org         |
| expense_date    | date          | Date of expense                      |
| category        | varchar(120)  | Expense category                     |
| vendor          | varchar(200)  | Vendor name                          |
| amount_halalas  | bigint        | Expense amount in halalas            |
| status          | varchar(16)   | pending, approved, rejected, paid    |

### 6.2 Approval Flow

Expenses follow the same amount-based approval routing as estimates and purchase orders, with the ceiling table applied per role.

## 7. Bank Reconciliation

### 7.1 Data Model

The `bank_statements` table stores imported bank statement lines:

| Field              | Type          | Description                           |
|--------------------|---------------|---------------------------------------|
| statement_date     | date          | Statement line date                   |
| description        | varchar(300)  | Transaction description               |
| reference          | varchar(64)   | Bank reference                        |
| bank_account       | varchar(120)  | Bank account identifier               |
| amount_halalas     | bigint        | Transaction amount                    |
| direction          | varchar(8)    | `credit` (deposit) or `debit` (withdrawal) |
| matched            | boolean       | Whether reconciled to a book entry    |
| matched_receipt_id | varchar(26)   | FK to matched receipt                 |
| matched_at         | timestamptz   | When the match was recorded           |

### 7.2 Matching Process

The `BankReconciliation` screen and its `match` action route allow matching statement lines to recorded receipts. Once matched, the `matched` flag is set with the receipt reference and timestamp.

## 8. Financial Reporting

### 8.1 Saved Reports

The `saved_reports` table allows users to persist report definitions:

- Report name and source (e.g., `invoices`, `journal`)
- Filter and column selection stored as JSON (`definition` field)
- Owner tracking for personal report management

### 8.2 Report Screens

| Screen              | Module       | Description                        |
|---------------------|--------------|------------------------------------|
| FinancialReports    | accounting   | Standard financial statements      |
| FinancialStatements | accounting   | Balance sheet, P&L, cash flow      |
| CustomReports       | reports      | User-defined report builder        |
| SalesReports        | execreports  | Revenue and sales analytics        |
| InsuranceReports    | execreports  | Insurance claims and policy reports |
| LoanReports         | execreports  | Loan portfolio reporting           |

### 8.3 Field-Level Redaction in Reports

The "Branch P&L" field rule hides profit-related fields from all roles except Owner, Manager, Accountant, HR Manager, and Super Admin.

## 9. Cross-References

- [Workshop Operations](./workshop-operations.md) — Job cards generate invoices on completion
- [Registry](./registry.md) — Customer spend tracking derived from paid invoices
- [Inventory & Procurement](./inventory-procurement.md) — Parts cost flows into invoice line items
- [Compliance](../non-functional/compliance.md) — ZATCA e-invoicing requirements
- [Security](../non-functional/security.md) — Approval ceilings and SoD enforcement
