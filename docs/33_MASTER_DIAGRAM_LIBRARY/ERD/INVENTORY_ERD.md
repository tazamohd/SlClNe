<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# INVENTORY ERD

**Status:** GENERATED · **Generated:** 2026-09-13 · 2 tables

### INVENTORY

```mermaid
erDiagram
  parts {
    varchar id PK
    varchar name
    varchar sku
    money price_halalas
    money cost_halalas
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
