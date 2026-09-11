# Database ER Diagram

Key entities and relationships from the 50+ table PostgreSQL schema (Drizzle ORM). Every tenant-owned table carries the universal `tenant` column set (`id` ULID PK, `org_id`, `branch_id`, `created_at`/`updated_at`, `created_by`/`updated_by`, `deleted_at`, `version`) — omitted below per entity for readability and shown once in the multi-tenant pattern note. Source: `docs/system/architecture/database-design.md`, `docs/knowledge-base/reference/data-dictionary.md`.

```mermaid
erDiagram
    organizations ||--o{ branches : "has"
    organizations ||--o{ users : "employs"
    organizations ||--o{ customers : "owns tenant data for"

    users ||--o{ user_sessions : "authenticates via"
    users ||--o{ otp_challenges : "verifies via"

    customers ||--o{ vehicles : "owns"
    customers ||--o{ job_cards : "requests"
    vehicles ||--o{ job_cards : "serviced in"

    job_cards ||--o{ appointments : "scheduled as"
    job_cards ||--|| estimates : "generates"
    estimates ||--o{ estimate_lines : "itemizes"
    job_cards ||--o{ invoices : "billed as"

    invoices ||--o{ invoice_lines : "itemizes"
    invoices ||--o{ payments : "collects"
    payments ||--o| receipts : "generates"

    suppliers ||--o{ requisitions : "fulfills"
    requisitions ||--o{ requisition_lines : "itemizes"
    requisitions ||--o{ purchase_orders : "approved into"
    purchase_orders ||--o{ purchase_order_lines : "itemizes"
    purchase_orders }o--|| suppliers : "sent to"
    parts ||--o{ purchase_order_lines : "ordered as"
    parts ||--o{ inventory_movements : "tracked by"

    employees ||--o{ payroll_lines : "paid via"
    payroll_runs ||--o{ payroll_lines : "contains"
    employees ||--o{ timesheets : "logs"

    chart_of_accounts ||--o{ journal_entries : "posted to"

    users ||--o{ audit_log : "acts, recorded in"
    job_cards ||--o{ audit_log : "history in"
    invoices ||--o{ audit_log : "history in"

    organizations {
        varchar id PK
        varchar name
        varchar cr_number
        varchar vat_number
        varchar plan
    }
    branches {
        varchar id PK
        varchar org_id FK
        varchar name
        boolean is_main
    }
    users {
        varchar id PK
        varchar org_id FK
        varchar email
        varchar role "1 of 14 roles"
        varchar password_hash
    }
    customers {
        varchar id PK
        varchar org_id FK
        varchar name
        varchar phone
        bigint total_spent_halalas
    }
    vehicles {
        varchar id PK
        varchar org_id FK
        varchar plate
        varchar vin
        integer mileage_km
    }
    job_cards {
        varchar id PK
        varchar org_id FK
        varchar code
        varchar stage "8-state lifecycle"
        varchar assigned_tech_id FK
    }
    estimates {
        varchar id PK
        varchar org_id FK
        varchar code
        bigint total_halalas
        varchar status
    }
    estimate_lines {
        varchar id PK
        varchar estimate_id FK
        varchar kind "part or labour"
        bigint unit_price_halalas
    }
    invoices {
        varchar id PK
        varchar org_id FK
        varchar code
        bigint total_halalas
        varchar seller_vat_number
        varchar hash_prev
        varchar hash_self
        timestamptz issued_at "immutable once set"
    }
    invoice_lines {
        varchar id PK
        varchar invoice_id FK
        bigint unit_price_halalas
    }
    payments {
        varchar id PK
        varchar invoice_id FK
        varchar method
        bigint amount_halalas
    }
    receipts {
        varchar id PK
        varchar code
        bigint amount_halalas
    }
    parts {
        varchar id PK
        varchar org_id FK
        varchar sku
        bigint cost_halalas
        integer on_hand
    }
    inventory_movements {
        varchar id PK
        varchar part_id FK
        varchar type
        integer delta
    }
    suppliers {
        varchar id PK
        varchar org_id FK
        varchar code
        varchar status
    }
    requisitions {
        varchar id PK
        varchar org_id FK
        varchar code
        varchar submitted_by FK
    }
    requisition_lines {
        varchar id PK
        varchar requisition_id FK
        integer qty
    }
    purchase_orders {
        varchar id PK
        varchar org_id FK
        varchar code
        varchar submitted_by FK
        varchar approved_by FK
        bigint total_halalas
    }
    purchase_order_lines {
        varchar id PK
        varchar purchase_order_id FK
        integer received_qty
    }
    employees {
        varchar id PK
        varchar org_id FK
        varchar employee_number
        bigint salary_halalas
    }
    payroll_runs {
        varchar id PK
        varchar org_id FK
        varchar period
        timestamptz posted_at
    }
    payroll_lines {
        varchar id PK
        varchar payroll_run_id FK
        varchar employee_id FK
    }
    timesheets {
        varchar id PK
        varchar employee_id FK
        date work_date
    }
    chart_of_accounts {
        varchar id PK
        varchar org_id FK
        varchar code
        bigint balance_halalas
    }
    journal_entries {
        varchar id PK
        varchar org_id FK
        varchar code
        bigint debit_halalas
        bigint credit_halalas
    }
    audit_log {
        varchar id PK
        varchar org_id FK
        varchar actor_id FK
        varchar action "18 action types"
        jsonb before
        jsonb after
    }
```

## Multi-tenant `org_id` pattern

Every tenant-owned table (53 of them, per `TENANT_TABLES`) spreads the same universal column set and is protected by a `FORCE` row-level-security policy filtering on `current_setting('app.org_id')`:

```mermaid
flowchart LR
    ORG[("organizations\n(the tenant itself)")] -->|org_id FK| T1["Any tenant-owned table\n(job_cards, invoices, parts, ...)"]
    T1 -->|"SET LOCAL app.org_id"| RLS{"RLS policy\nFORCE ROW LEVEL SECURITY"}
    RLS -->|"matches"| ROWS["Rows visible to this org"]
    RLS -->|"no match"| HIDDEN["Rows invisible\n(cross-tenant read = 404, never 403)"]
```

Additional notes:
- All primary keys are **ULIDs** (`varchar(26)`), lexicographically sortable by creation time (ADR-004 / database-design.md §3.1).
- All money columns are **integer halalas** (`bigint`, 1 SAR = 100 halalas) — never floats (ADR-006).
- **Soft deletes** everywhere via `deleted_at`; **optimistic concurrency** via an incrementing `version` column.
- **Segregation-of-duties** columns (`submitted_by` / `approved_by`) appear on `estimates`, `requisitions`, `purchase_orders`, and `insurance_claims`.
