<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# Master ERD — the tenancy spine

**Status:** GENERATED · **Sources as of:** 2026-09-19

The twelve tables a reader needs to understand how a tenant, a customer, a vehicle, a job and its money hang together. Every other table hangs off this spine; the domain ERDs show those.

Solid connectors are mandatory, open ones optional. **Only `org_id` links are database foreign keys** — see the relationship catalogue.

### Spine

```mermaid
erDiagram
  organizations {
    varchar id PK
    varchar name
    varchar name_ar
    varchar slug
    varchar cr_number
    varchar vat_number
    varchar plan
    varchar status
  }
  branches {
    varchar id PK
    varchar name
    varchar name_ar
    varchar city
    boolean is_main
  }
  users {
    varchar id PK
    varchar email
    varchar name
    varchar name_ar
    varchar role
    varchar acting_role
    varchar customer_id FK
    text password_hash
    varchar status
    timestamptz last_login_at
  }
  customers {
    varchar id PK
    varchar name
    varchar phone
    varchar email
    varchar type
    varchar fleet_id FK
    integer vehicle_count
    bigint total_spent_halalas
    timestamptz last_visit_at
    varchar last_visit_label
    text notes
  }
  vehicles {
    varchar id PK
    varchar plate
    varchar make_model
    varchar customer_id FK
    varchar owner_name
    varchar vin
    integer mileage_km
    timestamptz last_service_at
    varchar last_service_label
    varchar status
  }
  job_cards {
    varchar id PK
    varchar code
    varchar customer_id FK
    varchar customer_name
    varchar vehicle_id FK
    varchar vehicle_label
    varchar service
    varchar status
    varchar stage
    varchar priority
    varchar assigned_tech_id FK
    text complaint
    varchar qc_passed_by
    varchar appointment_id FK
  }
  estimates {
    varchar id PK
    varchar code
    varchar job_card_id FK
    varchar customer_id FK
    varchar customer_name
    varchar vehicle_id FK
    varchar vehicle_label
    bigint subtotal_halalas
    bigint tax_halalas
    bigint discount_halalas
    bigint total_halalas
    varchar status
    timestamptz valid_until
    varchar submitted_by
  }
  invoices {
    varchar id PK
    varchar code
    varchar customer_id FK
    varchar customer_name
    varchar job_card_id FK
    varchar estimate_id FK
    varchar vehicle_id FK
    date due_date
    varchar status
    bigint subtotal_halalas
    bigint tax_halalas
    bigint discount_halalas
    bigint total_halalas
    bigint paid_halalas
  }
  payments {
    varchar id PK
    varchar invoice_id FK
    date paid_on
    varchar method
    varchar method_ar
    varchar reference
    bigint amount_halalas
    text note
  }
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
  employees {
    varchar id PK
    varchar employee_number
    varchar name
    varchar name_ar
    varchar title
    varchar department_id FK
    date hire_date
    varchar status
    bigint salary_halalas
  }
  organizations ||--o{ branches : "org_id"
  organizations ||--o{ users : "org_id"
  branches |o--o{ users : "branch_id"
  customers |o--o{ users : "customer_id"
  organizations ||--o{ customers : "org_id"
  branches |o--o{ customers : "branch_id"
  organizations ||--o{ vehicles : "org_id"
  branches |o--o{ vehicles : "branch_id"
  customers |o--o{ vehicles : "customer_id"
  organizations ||--o{ job_cards : "org_id"
  branches |o--o{ job_cards : "branch_id"
  customers |o--o{ job_cards : "customer_id"
  vehicles |o--o{ job_cards : "vehicle_id"
  organizations ||--o{ estimates : "org_id"
  branches |o--o{ estimates : "branch_id"
  job_cards |o--o{ estimates : "job_card_id"
  customers |o--o{ estimates : "customer_id"
  vehicles |o--o{ estimates : "vehicle_id"
  organizations ||--o{ invoices : "org_id"
  branches |o--o{ invoices : "branch_id"
  customers |o--o{ invoices : "customer_id"
  job_cards |o--o{ invoices : "job_card_id"
  estimates |o--o{ invoices : "estimate_id"
  vehicles |o--o{ invoices : "vehicle_id"
  organizations ||--o{ payments : "org_id"
  branches |o--o{ payments : "branch_id"
  invoices |o--o{ payments : "invoice_id"
  organizations ||--o{ parts : "org_id"
  branches |o--o{ parts : "branch_id"
  organizations ||--o{ purchase_orders : "org_id"
  branches |o--o{ purchase_orders : "branch_id"
  organizations ||--o{ employees : "org_id"
  branches |o--o{ employees : "branch_id"
```
