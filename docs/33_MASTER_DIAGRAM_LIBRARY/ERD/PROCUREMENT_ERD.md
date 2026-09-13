<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# PROCUREMENT ERD

**Status:** GENERATED · **Generated:** 2026-09-13 · 6 tables

### PROCUREMENT

```mermaid
erDiagram
  suppliers {
    varchar id PK
    varchar code
    varchar name
    varchar name_ar
    varchar contact_name
    varchar contact_phone
    varchar contact_email
    varchar status
    text notes
  }
  requisitions {
    varchar id PK
    varchar code
    varchar requester_name
    varchar department
    varchar priority
    varchar status
    date needed_by
    bigint estimated_total_halalas
    text notes
    varchar submitted_by
    varchar approved_by
    timestamptz approved_at
  }
  requisition_lines {
    varchar id PK
    varchar requisition_id FK
    varchar part_sku
    varchar description
    varchar description_ar
    integer qty
    bigint est_unit_price_halalas
    integer sort
  }
  purchase_orders {
    varchar id PK
    varchar code
    varchar supplier_id FK
    varchar supplier_name
    varchar requisition_id FK
    varchar status
    bigint subtotal_halalas
    bigint tax_halalas
    bigint total_halalas
    text notes
    timestamptz ordered_at
    timestamptz expected_at
    varchar submitted_by
    varchar approved_by
  }
  purchase_order_lines {
    varchar id PK
    varchar purchase_order_id FK
    varchar part_sku
    varchar description
    varchar description_ar
    integer qty
    integer received_qty
    bigint unit_price_halalas
    integer sort
  }
  approval_lines {
    varchar id PK
    integer seq
    varchar item
    varchar item_ar
    double_precision qty
    bigint unit_price_halalas
    varchar kind
    varchar urgency
    text note
    text note_ar
  }
  requisitions ||--o{ requisition_lines : "requisition_id"
  suppliers |o--o{ purchase_orders : "supplier_id"
  requisitions |o--o{ purchase_orders : "requisition_id"
  purchase_orders ||--o{ purchase_order_lines : "purchase_order_id"
```


| Table | Purpose |
| --- | --- |
| `suppliers` | A tenant-owned vendor directory. The parts network carried only free-text supplier names; a purchase order references a supplier row by id (F-022). |
| `requisitions` | A request to buy, raised into a purchase order once approved (F-022). The estimated total is summed from the lines by the server, never sent. |
| `requisition_lines` | — |
| `purchase_orders` | — |
| `purchase_order_lines` | — |
| `approval_lines` | — |
