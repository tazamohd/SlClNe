<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# INVENTORY ERD

**Status:** GENERATED · **Sources as of:** 2026-09-18 · 2 tables

### INVENTORY

```mermaid
erDiagram
  parts {
    varchar id PK
    varchar name
    varchar sku
    bigint price_halalas
    bigint cost_halalas
    integer on_hand
    integer reserved
    integer reorder_level
    boolean backorderable
  }
  inventory_movements {
    varchar id PK
    varchar part_id FK
    varchar type
    integer qty
    integer delta
    varchar ref
    text reason
    varchar to_branch_id FK
    varchar transfer_id FK
  }
  parts ||--o{ inventory_movements : "part_id"
```


| Table | Purpose |
| --- | --- |
| `parts` | — |
| `inventory_movements` | — |
