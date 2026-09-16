<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# WORKSHOP ERD

**Status:** GENERATED · **Sources as of:** 2026-09-09 · 12 tables

### WORKSHOP

```mermaid
erDiagram
  services {
    varchar id PK
    varchar icon
    varchar label
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
  appointments {
    varchar id PK
    date scheduled_date
    varchar time_label
    integer start_minute
    integer duration_mins
    varchar customer_id FK
    varchar customer_name
    varchar vehicle_id FK
    varchar vehicle_label
    varchar plate
    varchar service_label
    varchar bay
    varchar technician_id FK
    varchar technician_name
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
  estimate_lines {
    varchar id PK
    varchar estimate_id FK
    varchar description
    varchar description_ar
    varchar kind
    double_precision qty
    bigint unit_price_halalas
    varchar part_sku
    integer sort
  }
  technicians {
    varchar id PK
    varchar name
    varchar specialty
    integer active_jobs
    double_precision rating
    varchar user_id FK
  }
  kb_procedures {
    varchar id PK
    varchar code
    varchar title
    varchar title_ar
    varchar category
    varchar make
    integer mins
    text torque
    text torque_ar
    integer steps
    integer views
    boolean tsb
    varchar media
  }
  diag_stages {
    varchar id PK
    varchar stage_key
    varchar role
    varchar label
    varchar label_ar
    varchar owner_name
    varchar owner_name_ar
    varchar at_label
    varchar action
    varchar action_ar
    text adds
    text adds_ar
  }
  diag_findings {
    varchar id PK
    varchar dtc
    varchar finding
    varchar finding_ar
    varchar system
    varchar system_ar
    varchar severity
    varchar evidence
  }
  diag_parts {
    varchar id PK
    varchar part_sku
    varchar description
    varchar description_ar
    double_precision qty
    bigint price_halalas
    varchar stock
    varchar eta
  }
  diag_labour {
    varchar id PK
    varchar task
    varchar task_ar
    double_precision hours
    bigint rate_halalas
  }
  diag_copies {
    varchar id PK
    varchar recipient
    varchar recipient_ar
    varchar icon
    varchar at_label
    varchar state
  }
  technicians |o--o{ job_cards : "assigned_tech_id"
  appointments |o--o{ job_cards : "appointment_id"
  technicians |o--o{ appointments : "technician_id"
  job_cards |o--o{ estimates : "job_card_id"
  estimates ||--o{ estimate_lines : "estimate_id"
```


| Table | Purpose |
| --- | --- |
| `job_cards` | — |
| `appointments` | — |
| `services` | — |
| `technicians` | — |
| `estimates` | — |
| `estimate_lines` | — |
| `diag_stages` | — |
| `diag_findings` | — |
| `diag_parts` | — |
| `diag_labour` | — |
| `diag_copies` | — |
| `kb_procedures` | — |
