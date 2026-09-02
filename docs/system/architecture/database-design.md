# Database Design

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-ARCH-003                               |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

The SALIS AUTO database runs on PostgreSQL with Drizzle ORM 0.36 as the schema definition and query layer. The schema defines 50+ tables across 13 business domains, enforcing multi-tenant isolation through row-level security (RLS). All monetary values are stored as integer halalas (bigint), identifiers are ULIDs (26-character varchar), and every tenant-owned table shares a universal column set.

## 2. Universal Column Pattern

Every tenant-owned table spreads a `tenant` object that provides:

| Column       | Type                    | Purpose                                    |
|--------------|-------------------------|--------------------------------------------|
| `id`         | `varchar(26)` PK        | ULID primary key                           |
| `org_id`     | `varchar(26)` NOT NULL  | Tenant identifier (FK to `organizations`)  |
| `branch_id`  | `varchar(26)` nullable  | Branch within the tenant                   |
| `created_at` | `timestamptz` NOT NULL  | Row creation timestamp                     |
| `updated_at` | `timestamptz` NOT NULL  | Last modification timestamp                |
| `created_by` | `varchar(26)` nullable  | User who created the row                   |
| `updated_by` | `varchar(26)` nullable  | User who last modified the row             |
| `deleted_at` | `timestamptz` nullable  | Soft-delete marker                         |
| `version`    | `integer` NOT NULL      | Optimistic concurrency counter (default 1) |

The `organizations` table sits above tenancy -- a row *is* the tenant -- and carries its own subset of these fields (id, name, slug, CR number, VAT number, plan, status, timestamps, version).

## 3. Key Design Decisions

### 3.1 ULID Primary Keys

All primary keys are ULIDs stored as `varchar(26)`. ULIDs are chosen over UUIDs because they are lexicographically sortable by creation time, which means B-tree indexes cluster temporally related rows together. The column is `varchar`, not `char`, to avoid blank-padding comparison bugs.

### 3.2 Money as Integer Halalas

Every monetary column uses `bigint` with names ending in `_halalas` (e.g., `total_halalas`, `paid_halalas`, `salary_halalas`). One Saudi Riyal equals 100 halalas. Using integer arithmetic prevents floating-point rounding errors from reaching the ledger. A helper function `money(name)` wraps `bigint(name, { mode: 'number' })` for consistency.

### 3.3 Soft Deletes

Rows are never physically removed. The `deleted_at` column is set to the current timestamp when a record is deleted. The query layer excludes soft-deleted rows by default; `?includeDeleted=true` requires the `d` (delete) permission.

### 3.4 Optimistic Concurrency

Every table carries an integer `version` column starting at 1. Updates include `WHERE version = :expected` -- a mismatch returns 409 (`version_conflict`), prompting the client to reload.

### 3.5 Bilingual Columns

Tables with user-facing text include `*_ar` columns (e.g., `name_ar`, `description_ar`, `title_ar`) for Arabic translations. These sit beside their English counterparts, not in a separate i18n table.

## 4. Table Catalog

### 4.1 Tenancy and Identity (3 tables)

| Table             | Key Columns                                           | Unique Constraints        |
|-------------------|-------------------------------------------------------|---------------------------|
| `organizations`   | name, slug, cr_number, vat_number, plan, status       | --                        |
| `branches`        | name, city, is_main                                   | --                        |
| `users`           | email, name, role, password_hash, status              | `(org_id, email)`         |

### 4.2 Session Management (2 tables)

| Table             | Key Columns                                           | Notes                     |
|-------------------|-------------------------------------------------------|---------------------------|
| `user_sessions`   | user_id, refresh_token_hash, family_id, expires_at    | Theft detection via family |
| `otp_challenges`  | channel, destination, code_hash, expires_at, attempts | Hashed OTP codes          |

### 4.3 Customers and Vehicles (4 tables)

| Table             | Key Columns                                           | Unique Constraints        |
|-------------------|-------------------------------------------------------|---------------------------|
| `fleets`          | name, vehicle_count, contract terms (money)            | --                        |
| `customers`       | name, phone, email, type, total_spent_halalas          | `(org_id, phone)`         |
| `vehicles`        | plate, make_model, vin, mileage_km, status             | `(org_id, plate)`, `(org_id, vin)` |
| `services`        | icon, label                                            | --                        |

### 4.4 Workshop Core (4 tables)

| Table             | Key Columns                                           | Unique Constraints        |
|-------------------|-------------------------------------------------------|---------------------------|
| `job_cards`       | code, stage, priority, assigned_tech_id, complaint     | `(org_id, code)`          |
| `appointments`    | scheduled_date, start_minute, duration_mins, bay       | --                        |
| `estimates`       | code, subtotal/tax/discount/total (halalas), status    | `(org_id, code)`          |
| `estimate_lines`  | estimate_id, description, kind, qty, unit_price        | --                        |

### 4.5 Invoicing and Payments (4 tables)

| Table             | Key Columns                                           | Unique Constraints        |
|-------------------|-------------------------------------------------------|---------------------------|
| `invoices`        | code, totals, ZATCA fields (VAT, QR, hash chain)      | `(org_id, code)`          |
| `invoice_lines`   | invoice_id, description, kind, qty, unit_price         | --                        |
| `payments`        | invoice_id, method, amount_halalas, reference          | --                        |
| `receipts`        | code, receipt_date, method, amount_halalas             | `(org_id, code)`          |

### 4.6 Inventory and Procurement (6 tables)

| Table                  | Key Columns                                      | Unique Constraints        |
|------------------------|--------------------------------------------------|---------------------------|
| `parts`                | sku, price/cost (halalas), on_hand, reserved      | `(org_id, sku)`           |
| `inventory_movements`  | part_id, type, qty, delta, transfer_id             | --                        |
| `suppliers`            | code, name, contact details, status                | `(org_id, code)`          |
| `requisitions`         | code, priority, estimated_total, submitted_by      | `(org_id, code)`          |
| `purchase_orders`      | code, supplier, totals, submitted_by, approved_by  | `(org_id, code)`          |
| `requisition_lines` / `purchase_order_lines` | qty, unit_price, received_qty    | --                        |

### 4.7 CRM (5 tables)

| Table             | Key Columns                                           |
|-------------------|-------------------------------------------------------|
| `leads`           | name, company, value_halalas, stage, score             |
| `opportunities`   | name, value_halalas, stage, probability_pct             |
| `campaigns`       | name, type, reach/opens/clicks/conversions, budget      |
| `segments`        | name, member_count, rules                               |
| `crm_tasks`       | title, assigned_to, due_date, priority, status           |

### 4.8 Accounting (5 tables)

| Table              | Key Columns                                          | Unique Constraints       |
|--------------------|------------------------------------------------------|--------------------------|
| `chart_of_accounts`| code, name, type, balance_halalas, parent_id          | `(org_id, code)`         |
| `journal_entries`  | code, entry_date, debit/credit_halalas, status        | `(org_id, code)`         |
| `expenses`         | code, expense_date, category, amount_halalas           | `(org_id, code)`         |
| `bank_statements`  | statement_date, amount_halalas, direction, matched     | --                       |
| `saved_reports`    | name, source, definition (JSONB)                       | --                       |

### 4.9 Financial Products (4 tables)

| Table               | Key Columns                                         | Unique Constraints           |
|---------------------|-----------------------------------------------------|------------------------------|
| `insurance_policies`| policy_number, type, premium/coverage (halalas)      | `(org_id, policy_number)`    |
| `insurance_claims`  | claim_number, amounts, submitted_by, approved_by     | `(org_id, claim_number)`     |
| `loan_contracts`    | contract_number, principal, rate_bps, term_months    | `(org_id, contract_number)`  |
| `loan_repayments`   | loan_contract_id, sequence, due/paid amounts          | --                           |

### 4.10 HR (4 tables)

| Table            | Key Columns                                           | Unique Constraints          |
|------------------|-------------------------------------------------------|-----------------------------|
| `employees`      | employee_number, name, salary_halalas, hire_date       | `(org_id, employee_number)` |
| `payroll_runs`   | period (YYYY-MM), gross/net totals, posted_at           | `(org_id, period)`          |
| `payroll_lines`  | payroll_run_id, employee, gross/allowances/deductions   | --                          |
| `timesheets`     | employee_id, work_date, clock_in/out, minutes           | --                          |

### 4.11 Diagnostics and Knowledge (6 tables)

`obd_devices`, `obd_dtc_readings`, `dtc_codes`, `oem_tools`, `integrations`, `kb_procedures`

### 4.12 Platform Control Plane (4 tables)

`garage_applications`, `supplier_applications`, `subscription_requests`, `support_tickets` -- these do not use the `tenant` spread; they exist above tenancy for platform administration.

### 4.13 Infrastructure (3 tables)

| Table              | Purpose                                                |
|--------------------|--------------------------------------------------------|
| `audit_log`        | Append-only mutation history (trigger refuses UPDATE/DELETE) |
| `idempotency_keys` | Request deduplication with body hash verification       |
| `system_health`    | Platform health metrics (uptime, queue depth, DB size)  |

## 5. Indexing Strategy

Every tenant-owned table has a compound index on `org_id` (often with `branch_id` or `status`), supporting RLS policy lookups. Additional indexes follow access patterns:

- **Code lookups**: Unique index on `(org_id, code)` for human-readable codes (invoices, estimates, POs, etc.)
- **Identity lookups**: Unique index on `(org_id, email)` for users, `(org_id, phone)` for customers, `(org_id, plate)` and `(org_id, vin)` for vehicles, `(org_id, sku)` for parts
- **Foreign key traversal**: `(org_id, parent_id)` pattern on line-item tables (invoice_lines, estimate_lines, PO lines)
- **Date-range queries**: `(org_id, branch_id, scheduled_date)` on appointments, `(org_id, ts)` on audit_log
- **Assignment lookups**: `(org_id, assigned_tech_id)` on job_cards for technician workload

## 6. Relationships

Drizzle ORM `relations()` declarations define:

- `organizations` -> many `branches`, many `users`
- `invoices` -> many `invoice_lines`, many `payments`
- `estimates` -> many `estimate_lines`
- `requisitions` -> many `requisition_lines`
- `purchase_orders` -> many `purchase_order_lines`
- `customers` -> many `vehicles`

## 7. Row-Level Security

The `TENANT_TABLES` array (53 entries) lists every table RLS is applied to. The migration script reads this list and applies `FORCE` RLS policies that filter on `current_setting('app.org_id')`. Tables in `OWNED_TABLES` apply additional narrowing under `own`/`assigned`/`self` scopes:

| Table          | Ownership Column    | Scope Meaning                     |
|----------------|---------------------|-----------------------------------|
| `job_cards`    | `assigned_tech_id`  | Technician sees only assigned jobs |
| `appointments` | `technician_id`     | Technician sees own appointments   |
| `crm_tasks`    | `created_by`        | Agent sees own CRM tasks           |
| `user_sessions`| `user_id`           | User sees only own sessions        |

## 8. Segregation of Duties Columns

Several tables carry `submitted_by` and `approved_by` columns to enforce that the person who creates a record cannot also approve it:

- `estimates` -- submitter may not approve
- `requisitions` -- submitter may not approve
- `purchase_orders` -- submitter may not approve
- `insurance_claims` -- submitter may not approve

## Related Documents

- [Backend Architecture](./backend-architecture.md)
- [Data Flow](./data-flow.md)
- [Security Architecture](../security/security-architecture.md)
- [Authorization Matrix](../security/authorization-matrix.md)
