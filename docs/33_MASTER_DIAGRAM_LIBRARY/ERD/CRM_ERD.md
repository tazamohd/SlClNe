<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# CRM ERD

**Status:** GENERATED · **Sources as of:** 2026-09-09 · 5 tables

### CRM

```mermaid
erDiagram
  leads {
    varchar id PK
    varchar name
    varchar company
    bigint value_halalas
    varchar source
    varchar stage
    date lead_date
    integer score
    varchar converted_opportunity_id FK
  }
  opportunities {
    varchar id PK
    varchar name
    varchar company
    bigint value_halalas
    varchar stage
    integer probability_pct
    date close_date
    varchar owner_name
  }
  campaigns {
    varchar id PK
    varchar name
    varchar type
    varchar status
    integer reach
    integer opens
    integer clicks
    integer conversions
    bigint budget_halalas
    bigint spent_halalas
  }
  segments {
    varchar id PK
    varchar name
    integer member_count
    text rules
    varchar last_updated_label
  }
  crm_tasks {
    varchar id PK
    varchar title
    varchar assigned_to
    date due_date
    varchar priority
    varchar status
    varchar type
  }
```


| Table | Purpose |
| --- | --- |
| `leads` | — |
| `opportunities` | — |
| `campaigns` | — |
| `segments` | — |
| `crm_tasks` | — |
