<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# CUSTOMER ERD

**Status:** GENERATED · **Sources as of:** 2026-09-18 · 5 tables

### CUSTOMER

```mermaid
erDiagram
  fleets {
    varchar id PK
    varchar name
    integer vehicle_count
    integer active_count
    varchar contract_status
    varchar contract_type
    bigint contract_value_halalas
    date contract_start_date
    date contract_end_date
    date renewal_date
    varchar contact_name
    varchar contact_phone
    varchar contact_email
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
  public_leads {
    varchar id PK
    varchar name
    varchar email
    varchar phone
    varchar company
    text message
    varchar source
    varchar status
  }
  customer_feedback {
    varchar id PK
    integer rating
    text comment
    varchar job_card_id FK
    varchar customer_id FK
    varchar customer_name
  }
  fleets |o--o{ customers : "fleet_id"
  customers |o--o{ vehicles : "customer_id"
  customers |o--o{ customer_feedback : "customer_id"
```


| Table | Purpose |
| --- | --- |
| `customers` | — |
| `vehicles` | — |
| `fleets` | — |
| `customer_feedback` | Customer feedback (F-027). A rating and optional comment against a job card / customer, tenant-scoped like everything else. |
| `public_leads` | Public marketing intake (F-025). A raw, unauthenticated web submission — it carries a contact channel and a message and has earned no score or pipeline stage, w |
