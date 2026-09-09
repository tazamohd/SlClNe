# SALIS AUTO -- ADR-006: Money Storage as Integer Halalas

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-ADR-006                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Accepted                     |
| Classification | Internal -- Confidential     |

## Status

Accepted

## Context

SALIS AUTO is an automotive workshop management platform that processes a high volume
of financial transactions: invoicing (with ZATCA Phase 2 e-invoicing compliance),
payments, payroll, purchase orders, expense tracking, insurance claims, loan
repayments, and accounting journal entries. The platform's database schema defines
50+ tables across 13 business domains, with monetary columns appearing in at least
15 tables (see [Database Design](../architecture/database-design.md)).

Financial calculations in the system include:

- **VAT computation**: Saudi VAT at 15% (1500 basis points), configured via
  `VAT_RATE_BPS` environment variable. Applied as:
  `tax = subtotal * VAT_RATE_BPS / 10000`
- **Invoice totals**: `total = subtotal + tax - discount`, computed server-side by
  `computeInvoiceTotals()` from the `@salis/contract/rules` package
- **Payroll**: gross pay, allowances, deductions, net pay across all employees
- **Approval ceilings**: role-based limits ranging from 0 to 5,000,000 halalas
  (50,000 SAR for branch managers)
- **Purchase orders**: supplier totals with multi-line item aggregation
- **Accounting**: chart of accounts balances, journal entry debits/credits, expense
  tracking, bank reconciliation

Floating-point arithmetic is fundamentally unsuitable for these calculations.
IEEE 754 double-precision floating-point cannot exactly represent many decimal
fractions:

```
0.1 + 0.2 === 0.30000000000000004  // not 0.3
1.005 * 100 === 100.49999999999999  // rounds to 100, not 101
```

These rounding errors accumulate across transactions and produce ledger imbalances,
incorrect VAT amounts, and ZATCA rejection of e-invoices with imprecise totals.
ZATCA Phase 2 e-invoicing demands exact SAR amounts in the UBL 2.1 XML format,
QR code TLV fields, and hash chain computation. A 1-halala discrepancy between
the computed total and the reported total invalidates the invoice hash.

The Saudi Riyal (SAR) subdivides into 100 halalas. Multi-currency support is not
required in Phase 1 of the platform.

## Decision

All monetary values in SALIS AUTO are stored as **integer halalas** using PostgreSQL
`bigint` columns. One Saudi Riyal equals 100 halalas. All arithmetic operations on
monetary values occur in the integer domain. The display layer converts halalas to
SAR with exactly 2 decimal places for user-facing presentation.

### Storage Convention

Every monetary column uses `bigint` with a name ending in `_halalas`:

| Column Pattern          | Example Tables                              |
|-------------------------|---------------------------------------------|
| `total_halalas`         | invoices, estimates, purchase_orders        |
| `subtotal_halalas`      | invoices, estimates                         |
| `tax_halalas`           | invoices, estimates                         |
| `paid_halalas`          | invoices                                    |
| `amount_halalas`        | payments, receipts, expenses                |
| `salary_halalas`        | employees                                   |
| `unit_price_halalas`    | invoice_lines, estimate_lines, PO lines     |
| `cost_halalas`          | parts                                       |
| `balance_halalas`       | chart_of_accounts                           |
| `total_spent_halalas`   | customers                                   |

The Drizzle ORM schema uses a `money(name)` helper that wraps
`bigint(name, { mode: 'number' })` for consistency across all monetary column
definitions.

### Arithmetic Rules

1. **All computation in integers**: Addition, subtraction, multiplication by
   quantities, and percentage calculations all operate on halalas.
2. **VAT calculation**: `Math.round(subtotalHalalas * VAT_RATE_BPS / 10000)` --
   rounding occurs once, at the final step, on the integer result.
3. **Server-side computation only**: Invoice totals, payroll sums, and tax amounts
   are always computed by the server. Client-submitted totals are ignored; the
   server recomputes from line items.
4. **No floating-point intermediaries**: The computation pipeline never converts
   halalas to SAR for arithmetic purposes. SAR formatting is a presentation concern.

### Display Conversion

```typescript
// Halalas to SAR display string
function formatSAR(halalas: number): string {
  return (halalas / 100).toFixed(2)
}

// SAR input to halalas
function toHalalas(sar: number): number {
  return Math.round(sar * 100)
}
```

### VAT Computation Example

```typescript
const VAT_RATE_BPS = 1500 // 15.00%

const subtotalHalalas = 150000 // 1,500.00 SAR
const taxHalalas = Math.round(subtotalHalalas * VAT_RATE_BPS / 10000) // 22500
const totalHalalas = subtotalHalalas + taxHalalas - discountHalalas
// Result: exact integer, no rounding error
```

### Approval Ceiling Integration

Role-based approval ceilings are defined in halalas, enabling direct integer
comparison without conversion:

| Role        | Ceiling (SAR) | Ceiling (halalas) | Comparison           |
|-------------|---------------|-------------------|----------------------|
| owner       | Unlimited     | `null`            | Always passes        |
| superadmin  | Unlimited     | `null`            | Always passes        |
| manager     | 50,000        | 5,000,000         | `amount <= 5000000`  |
| accountant  | 25,000        | 2,500,000         | `amount <= 2500000`  |
| procurement | 20,000        | 2,000,000         | `amount <= 2000000`  |
| hr          | 15,000        | 1,500,000         | `amount <= 1500000`  |
| parts       | 10,000        | 1,000,000         | `amount <= 1000000`  |
| advisor     | 5,000         | 500,000           | `amount <= 500000`   |

### Why bigint Over integer

PostgreSQL `integer` is a 32-bit signed type with a maximum value of 2,147,483,647.
In halalas, this represents 21,474,836.47 SAR (~21.5 million SAR). While sufficient
for most individual invoices, this ceiling is uncomfortably close for:

- Aggregate accounting balances (chart of accounts)
- Annual payroll totals for large workshops
- Cumulative `total_spent_halalas` on high-volume fleet customers
- Insurance policy coverage amounts

PostgreSQL `bigint` is a 64-bit signed type supporting values up to
9,223,372,036,854,775,807 halalas (~92.2 quadrillion SAR), eliminating overflow
concerns for any foreseeable business scenario. The storage overhead is 8 bytes
versus 4 bytes per value -- negligible relative to the safety margin gained.

## Consequences

### Positive

- **Exact arithmetic**: No rounding errors in financial calculations. Invoice totals,
  VAT amounts, and payroll figures are deterministic and reproducible.
- **ZATCA compliance**: E-invoice XML generation, QR code TLV encoding, and hash
  chain computation all operate on exact integer values, preventing rejection due
  to precision mismatches.
- **Simplified equality checks**: `a === b` works correctly for monetary comparisons.
  No need for epsilon-based approximate equality (`Math.abs(a - b) < 0.01`).
- **Database query clarity**: `WHERE paid_halalas >= total_halalas` is exact. No
  rounding mode considerations in SQL aggregations (`SUM`, `AVG`).
- **Cross-language consistency**: Integer arithmetic produces identical results in
  TypeScript, PostgreSQL, and any future service, unlike floating-point which varies
  by platform and rounding mode.
- **Naming convention prevents ambiguity**: The `_halalas` suffix makes the unit
  explicit at every usage site. A developer cannot accidentally treat a halala value
  as SAR or vice versa.

### Negative

- **API contract overhead**: All API endpoints return and accept monetary values in
  halalas. Frontend applications must format values for display and parse user input
  back to halalas. This is a small amount of consistent conversion logic.
- **Developer onboarding**: New developers must understand the halalas convention.
  Mitigated by the `_halalas` naming suffix and the `money()` helper that enforces
  the pattern at the schema level.
- **Reporting queries**: Business intelligence queries must divide by 100 for
  human-readable SAR amounts. Mitigated by creating database views or report-layer
  formatting functions.

### Neutral

- **No multi-currency impact**: The decision is specific to SAR/halalas. If
  multi-currency support is added in a future phase, the integer-minor-units
  pattern extends naturally (e.g., USD/cents, EUR/cents, KWD/fils with 1000
  subdivisions). A `currency` column would be added alongside the halalas column,
  and the minor-unit divisor would vary by currency.
- **Field-level redaction compatibility**: The 7 salary-related fields and 6 P&L
  fields subject to field-level redaction (see [Data Protection](../security/data-protection.md),
  Section 5) all follow the `_halalas` naming convention, making redaction rules
  pattern-matchable.

## Alternatives Considered

### 1. PostgreSQL DECIMAL / NUMERIC Type

Store monetary values as `DECIMAL(15, 2)` or `NUMERIC` with fixed scale.

**Rejected because:**
- `DECIMAL` arithmetic in PostgreSQL is exact but slower than integer arithmetic
  (variable-length storage, software-emulated operations).
- Requires explicit rounding mode decisions (`ROUND_HALF_UP`, `ROUND_HALF_EVEN`)
  at every computation boundary.
- Equality checks on `DECIMAL` can produce surprising results when scales differ.
- The Drizzle ORM maps `DECIMAL` to JavaScript `string` (to preserve precision),
  requiring manual parsing at every usage site -- more error-prone than integer
  arithmetic.
- Integer `bigint` provides the same precision guarantee for 2-decimal-place
  currencies with simpler, faster operations.

### 2. Floating-Point with Rounding

Store as `double precision` (PostgreSQL `float8`) and round at display boundaries.

**Rejected because:**
- Rounding errors accumulate across transactions. A payroll run summing hundreds
  of salary calculations can drift by multiple halalas.
- `SUM()` over floating-point columns produces non-deterministic results depending
  on row order.
- ZATCA hash chain computation requires byte-exact reproducibility; floating-point
  formatting variations would break the chain.
- Financial auditing standards require exact reproducibility of calculations.

### 3. Money Library (dinero.js, currency.js)

Use a JavaScript money library that encapsulates the integer-minor-units pattern
with currency-aware arithmetic.

**Rejected for Phase 1 because:**
- Adds an external dependency to a critical financial path.
- SALIS AUTO operates in a single currency (SAR) in Phase 1; the library's
  multi-currency features are unused overhead.
- The `bigint` + `_halalas` convention is sufficient and transparent.
- Library patterns (value objects, immutable operations) can be adopted in a future
  phase without data migration, since the underlying storage format (integer halalas)
  is identical to what these libraries use internally.

## References

- [Database Design](../architecture/database-design.md) -- SYS-ARCH-003, Section 3.2
- [Data Protection](../security/data-protection.md) -- SYS-SEC-004, Section 11
- [ZATCA Integration](../integration/zatca-integration.md) -- SYS-INT-001, Sections 3-4
- [Auth Architecture](../architecture/auth-architecture.md) -- SYS-ARCH-005, Section 7 (Approval Authority)
- IEEE 754-2019 -- floating-point standard limitations
- ZATCA Phase 2 E-Invoicing Technical Requirements
