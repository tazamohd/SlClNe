<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# LOANS ERD

**Status:** GENERATED · **Sources as of:** 2026-09-09 · 2 tables

### LOANS

```mermaid
erDiagram
  loan_contracts {
    varchar id PK
    varchar contract_number
    varchar customer_id FK
    varchar borrower_name
    bigint principal_halalas
    integer rate_bps
    integer term_months
    date start_date
    varchar status
    bigint monthly_instalment_halalas
  }
  loan_repayments {
    varchar id PK
    varchar loan_contract_id FK
    varchar contract_number
    integer sequence
    date due_date
    bigint amount_due_halalas
    bigint amount_paid_halalas
    date paid_date
    varchar status
  }
  loan_contracts ||--o{ loan_repayments : "loan_contract_id"
```


| Table | Purpose |
| --- | --- |
| `loan_contracts` | Auto-loan contracts — a financed principal at a rate over a term. The monthly instalment is a real amortised figure the server computes at origination (`rules/l |
| `loan_repayments` | Loan repayments — the month-by-month schedule a contract's instalment implies. Money is integer halalas; the amounts sum to principal + interest across the sche |
