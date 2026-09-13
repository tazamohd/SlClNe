<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# ACCOUNTING ERD

**Status:** GENERATED · **Generated:** 2026-09-13 · 5 tables

### ACCOUNTING

```mermaid
erDiagram
  chart_of_accounts {
    varchar id PK
    varchar code
    varchar name
    varchar type
    bigint balance_halalas
    integer children_count
    varchar parent_id FK
  }
  journal_entries {
    varchar id PK
    varchar code
    date entry_date
    varchar ref
    text narration
    bigint debit_halalas
    bigint credit_halalas
    varchar status
  }
  expenses {
    varchar id PK
    varchar code
    date expense_date
    varchar category
    varchar vendor
    bigint amount_halalas
    varchar status
  }
  bank_statements {
    varchar id PK
    date statement_date
    varchar description
    varchar reference
    varchar bank_account
    bigint amount_halalas
    varchar direction
    boolean matched
    varchar matched_receipt_id FK
    timestamptz matched_at
  }
  saved_reports {
    varchar id PK
    varchar name
    varchar source
    varchar owner_name
    jsonb definition
  }
```


| Table | Purpose |
| --- | --- |
| `chart_of_accounts` | — |
| `journal_entries` | — |
| `expenses` | — |
| `bank_statements` | Bank statement lines (F-028). The *bank* side of a reconciliation — one row per line on an imported statement — so BankReconciliation has something to match the |
| `saved_reports` | Saved report definitions (F-028). Lets CustomReports persist a report — its name, the source it runs over, and the filter/column selection as JSON — so a user c |
