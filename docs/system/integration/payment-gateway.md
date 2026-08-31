# Payment Gateway

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-INT-002                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

SALIS AUTO records payments against invoices through a dedicated payment route that enforces balance validation, concurrent payment safety, automatic receipt generation, and status management. All monetary values use integer halalas (bigint), and payment recording is idempotent through the `Idempotency-Key` mechanism.

## 2. Payment Data Model

### 2.1 Payments Table

| Column           | Type        | Purpose                              |
|------------------|-------------|--------------------------------------|
| `id`             | varchar(26) | ULID primary key                     |
| `invoice_id`     | varchar(26) | Parent invoice reference             |
| `paid_on`        | date        | Payment date                         |
| `method`         | varchar(40) | Payment method (e.g., cash, card, bank_transfer) |
| `method_ar`      | varchar(60) | Arabic label for the method          |
| `reference`      | varchar(64) | External reference number            |
| `amount_halalas` | bigint      | Payment amount in halalas            |
| `note`           | text        | Optional payment note                |

Plus universal tenant columns (org_id, branch_id, created_at, etc.).

### 2.2 Receipts Table

| Column           | Type        | Purpose                              |
|------------------|-------------|--------------------------------------|
| `id`             | varchar(26) | ULID primary key                     |
| `code`           | varchar(32) | Human-readable receipt code (RCP-xxx)|
| `receipt_date`   | date        | Receipt date                         |
| `customer_name`  | varchar(200)| Customer name (denormalized)         |
| `invoice_code`   | varchar(32) | Parent invoice code                  |
| `method`         | varchar(40) | Payment method                       |
| `amount_halalas` | bigint      | Receipt amount in halalas            |
| `status`         | varchar(16) | Receipt status (default: `pending`)  |

## 3. Payment Recording Flow

### 3.1 Endpoint

```
POST /api/v1/invoices/:id/payments
Authorization: Bearer <accessToken>
Idempotency-Key: <uuid>
Content-Type: application/json

{
  "amountHalalas": 50000,
  "method": "card",
  "paidOn": "2026-08-15",
  "reference": "TXN-12345",
  "note": "Credit card payment"
}
```

### 3.2 Processing Steps

1. **Authorization**: `requirePermission(principal, 'payments', 'c')`
2. **Validation**: Parse request body against `paymentCreate` Zod schema
3. **Tenant transaction**: `withTenant(db, principal, ...)`
4. **Idempotency check**: Look up `Idempotency-Key` in `idempotency_keys`:
   - Found, same body hash: return stored response (no side effects)
   - Found, different body hash: return 409 (caller bug)
   - Not found: proceed with payment
5. **Invoice lock**: `SELECT ... FOR UPDATE` on the invoice row
6. **Balance check**: `checkPayment()` validates:
   - `amountHalalas <= balance` (cannot overpay)
   - Invoice status allows payment (not cancelled)
7. **Insert payment**: Create payment row with ULID
8. **Update invoice**: Increment `paid_halalas`, update status
9. **Generate receipt**: Auto-create receipt with next code (RCP-xxx)
10. **Audit**: Record `pay` action with before/after state
11. **Store idempotency result**: Save response for replay

### 3.3 Response

```json
{
  "payment": {
    "id": "...",
    "invoiceId": "...",
    "paidOn": "2026-08-15",
    "method": "card",
    "amountHalalas": 50000,
    "reference": "TXN-12345"
  },
  "invoice": {
    "id": "...",
    "code": "INV-2026-001",
    "totalHalalas": 100000,
    "paidHalalas": 50000,
    "status": "partial"
  }
}
```

## 4. Balance and Status Management

### 4.1 Balance Calculation

The invoice balance is computed as:

```
balance = totalHalalas - paidHalalas
```

`paidHalalas` is a server-maintained running total. It is never accepted from client input.

### 4.2 Status Transitions

| Condition                | New Status |
|--------------------------|------------|
| `paidHalalas == 0`       | `unpaid`   |
| `0 < paidHalalas < total`| `partial`  |
| `paidHalalas >= total`   | `paid`     |

### 4.3 Payment Validation Rules

The `checkPayment()` function from `@salis/contract/rules` enforces:

| Rule                             | Error                              |
|----------------------------------|------------------------------------|
| Amount exceeds remaining balance | 422: amount exceeds balance         |
| Invoice is cancelled             | 422: cannot pay a cancelled invoice |
| Amount is zero or negative       | 400: invalid amount                |

## 5. Concurrent Payment Safety

### 5.1 Row-Level Locking

The invoice row is loaded with `FOR UPDATE` before processing a payment:

```sql
SELECT * FROM invoices WHERE id = :id FOR UPDATE
```

This ensures that two simultaneous payments against the same invoice are serialized. Without locking, both would read the same `paid_halalas` and both would pass the balance check, potentially resulting in overpayment.

### 5.2 Sequence

```
Payment A: SELECT ... FOR UPDATE (acquires lock)
Payment B: SELECT ... FOR UPDATE (waits)
Payment A: INSERT payment, UPDATE invoice, COMMIT (releases lock)
Payment B: SELECT ... FOR UPDATE (acquires lock, sees updated balance)
Payment B: INSERT payment, UPDATE invoice, COMMIT
```

## 6. Idempotency

### 6.1 Mechanism

Payment recording accepts an `Idempotency-Key` header to prevent duplicate payments from network retries:

| Scenario                     | Behavior                           |
|------------------------------|------------------------------------|
| New key                      | Execute payment, store result      |
| Same key, same body hash     | Return stored result (no payment)  |
| Same key, different body hash| 409 Conflict (caller error)        |

### 6.2 Key Storage

The `idempotency_keys` table stores:

| Column           | Purpose                              |
|------------------|--------------------------------------|
| `org_id`         | Tenant scope                         |
| `key`            | Client-provided key (8-128 chars)    |
| `endpoint`       | Route identifier                     |
| `request_hash`   | SHA-256 of request body              |
| `response_status`| Stored HTTP status code              |
| `response_body`  | Stored response JSONB                |

The key is scoped to `(org_id, key, endpoint)`, so different endpoints can use the same key without collision.

## 7. Receipt Generation

### 7.1 Automatic Creation

Every successful payment automatically creates a receipt in the `receipts` table. The receipt:

- Gets the next sequential code (`RCP-xxx`) via `nextCode(tx, 'RCP')`
- Copies the customer name from the invoice (denormalized)
- References the parent invoice code
- Records the payment method and amount
- Starts in `cleared` status

### 7.2 Receipt Fields

| Field            | Source                    |
|------------------|---------------------------|
| `code`           | Auto-generated (RCP-xxx)  |
| `receipt_date`   | Payment date              |
| `customer_name`  | From invoice              |
| `invoice_code`   | From invoice              |
| `method`         | From payment input        |
| `amount_halalas` | From payment input        |

## 8. Payment Methods

The system supports multiple payment methods through a free-text `method` field:

| Method           | Description                          |
|------------------|--------------------------------------|
| `cash`           | Cash payment at the workshop         |
| `card`           | Credit/debit card                    |
| `bank_transfer`  | Wire transfer                        |
| `mada`           | Saudi debit network                  |
| `stc_pay`        | STC Pay mobile payment               |
| `cheque`         | Bank cheque                          |

The method field is not constrained to an enum, allowing flexibility for new payment methods without schema changes.

## 9. Bank Reconciliation

### 9.1 Bank Statement Matching

The `bank_statements` table stores imported bank statement lines for reconciliation:

| Column              | Purpose                              |
|---------------------|--------------------------------------|
| `statement_date`    | Date of the bank transaction         |
| `description`       | Transaction description              |
| `reference`         | Bank reference number                |
| `bank_account`      | Account identifier                   |
| `amount_halalas`    | Transaction amount                   |
| `direction`         | `credit` (deposit) or `debit` (withdrawal) |
| `matched`           | Whether reconciled to a book entry   |
| `matched_receipt_id`| The receipt this line was matched to |

### 9.2 Matching Flow

The bank reconciliation route (`routes/bank.ts`) matches bank statement lines to receipts:

1. User selects a bank statement line and a receipt
2. System verifies amounts match (or flags discrepancy)
3. Statement line is marked `matched = true` with receipt reference
4. The match is audited

Bank statements are read-only through the generic collection router; the `match` action is the only write operation.

## 10. Audit Trail

All payment-related operations are recorded in the audit log:

| Action   | Trigger                          | Recorded Data                    |
|----------|----------------------------------|----------------------------------|
| `create` | Invoice created                  | Invoice details                  |
| `issue`  | Invoice issued                   | ZATCA fields, hash chain          |
| `pay`    | Payment recorded                 | Before/after paidHalalas, status |

The audit captures the running balance before and after each payment, creating a complete payment history that is tamper-proof (append-only audit log).

## Related Documents

- [ZATCA Integration](./zatca-integration.md)
- [Backend Architecture](../architecture/backend-architecture.md)
- [Database Design](../architecture/database-design.md)
- [Data Flow](../architecture/data-flow.md)
