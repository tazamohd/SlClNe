<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# BILLING ERD

**Status:** GENERATED · **Generated:** 2026-09-13 · 4 tables

### BILLING

```mermaid
erDiagram
  invoices {
    varchar id PK
    varchar code
    varchar customer_id FK
    varchar customer_name
    varchar job_card_id FK
    varchar vehicle_id FK
    date due_date
    varchar status
    money subtotal_halalas
    money tax_halalas
    money discount_halalas
    money total_halalas
    money paid_halalas
    varchar seller_vat_number
  }
  invoice_lines {
    varchar id PK
    varchar invoice_id FK
    varchar description
    varchar description_ar
    varchar kind
    double_precision qty
    money unit_price_halalas
    varchar part_sku
    integer sort
  }
  payments {
    varchar id PK
    varchar invoice_id FK
    date paid_on
    varchar method
    varchar method_ar
    varchar reference
    money amount_halalas
    text note
  }
  receipts {
    varchar id PK
    varchar code
    date receipt_date
    varchar customer_name
    varchar invoice_code
    varchar method
    money amount_halalas
    varchar status
  }
  invoices ||--o{ invoice_lines : "invoice_id"
  invoices |o--o{ payments : "invoice_id"
```


| Table | Purpose |
| --- | --- |
| `invoices` | — |
| `invoice_lines` | — |
| `payments` | — |
| `receipts` | — |
