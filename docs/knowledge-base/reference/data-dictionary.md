# Data Dictionary

Complete database schema reference for SALIS AUTO. All tables use Drizzle ORM with PostgreSQL (or PGlite for local development). This document covers all 50+ tables grouped by domain.

---

## Conventions

### Universal Columns

Every tenant-owned table includes these columns (the `tenant` spread):

| Column | SQL Type | Nullable | Default | Description |
|--------|----------|----------|---------|-------------|
| `id` | `varchar(26)` | No | — | ULID primary key |
| `org_id` | `varchar(26)` | No | — | FK to `organizations.id`. Tenant isolation anchor. |
| `branch_id` | `varchar(26)` | Yes | — | FK to `branches.id`. Null for org-level records. |
| `created_at` | `timestamptz` | No | `now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | No | `now()` | Last update timestamp |
| `created_by` | `varchar(26)` | Yes | — | User who created the record |
| `updated_by` | `varchar(26)` | Yes | — | User who last updated the record |
| `deleted_at` | `timestamptz` | Yes | — | Soft-delete timestamp. Non-null = deleted. |
| `version` | `integer` | No | `1` | Optimistic concurrency version counter |

### Money Convention

All monetary values are stored as `bigint` integer halalas (1 SAR = 100 halalas). Column names end in `_halalas`. No `numeric` or `float` types are used for money to prevent rounding errors.

### Primary Keys

All primary keys are ULIDs — 26-character `varchar`, not `char` (to avoid blank-padding comparison issues).

---

## Tenancy

### organizations

The root tenant entity. A row IS the tenant.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | varchar(26) | No | — | PK |
| `name` | varchar(200) | No | — | Organization name |
| `name_ar` | varchar(200) | Yes | — | Arabic name |
| `slug` | varchar(80) | No | — | URL-safe identifier |
| `cr_number` | varchar(20) | Yes | — | Saudi Commercial Registration number |
| `vat_number` | varchar(20) | Yes | — | ZATCA VAT registration number |
| `plan` | varchar(40) | No | `'starter'` | Subscription plan |
| `status` | varchar(20) | No | `'active'` | Organization status |
| `created_at` | timestamptz | No | `now()` | — |
| `updated_at` | timestamptz | No | `now()` | — |
| `deleted_at` | timestamptz | Yes | — | Soft delete |
| `version` | integer | No | `1` | — |

### branches

Physical workshop locations within an organization.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `name` | varchar(200) | No | — | Branch name |
| `name_ar` | varchar(200) | Yes | — | Arabic name |
| `city` | varchar(120) | Yes | — | City location |
| `is_main` | boolean | No | `false` | Primary/headquarters flag |

**Indexes:** `branches_org_idx` on `(org_id)`

### users

User accounts within an organization.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `email` | varchar(254) | No | — | Login email |
| `name` | varchar(200) | No | — | Display name |
| `name_ar` | varchar(200) | Yes | — | Arabic display name |
| `role` | varchar(32) | No | — | One of 14 RBAC role identifiers |
| `password_hash` | text | Yes | — | bcrypt hash |
| `status` | varchar(20) | No | `'active'` | Account status |
| `last_login_at` | timestamptz | Yes | — | Last successful login |

**Indexes:** `users_org_email_idx` UNIQUE on `(org_id, email)`

### user_sessions

Refresh token sessions for authentication.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `user_id` | varchar(26) | No | — | FK to users |
| `refresh_token_hash` | text | No | — | bcrypt hash of the refresh token |
| `family_id` | varchar(26) | No | — | Token family for reuse detection |
| `user_agent` | text | Yes | — | Browser user agent |
| `ip` | varchar(64) | Yes | — | Client IP address |
| `expires_at` | timestamptz | No | — | Token expiration |
| `revoked_at` | timestamptz | Yes | — | Revocation timestamp |
| `replaced_by` | varchar(26) | Yes | — | ID of the replacement token |

**Indexes:** `user_sessions_user_idx` on `(org_id, user_id)`

---

## Customers & Vehicles

### customers

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `name` | varchar(200) | No | — | Customer name |
| `phone` | varchar(32) | No | — | Phone number (unique per org) |
| `email` | varchar(254) | Yes | — | Email address |
| `type` | varchar(16) | No | `'individual'` | `individual` or `corporate` |
| `fleet_id` | varchar(26) | Yes | — | FK to fleets (corporate customers) |
| `vehicle_count` | integer | No | `0` | Derived from vehicles table |
| `total_spent_halalas` | bigint | No | `0` | Derived from paid invoices |
| `last_visit_at` | timestamptz | Yes | — | Machine-readable last visit |
| `last_visit_label` | varchar(64) | Yes | — | Display label (e.g., "2 weeks ago") |
| `notes` | text | Yes | — | Free-text notes |

**Indexes:** `customers_org_idx` on `(org_id, branch_id)`, `customers_org_phone_idx` UNIQUE on `(org_id, phone)`

### vehicles

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `plate` | varchar(16) | No | — | License plate (unique per org) |
| `make_model` | varchar(160) | No | — | Make and model (e.g., "Toyota Camry 2023") |
| `customer_id` | varchar(26) | Yes | — | FK to customers |
| `owner_name` | varchar(200) | Yes | — | Vehicle owner name |
| `vin` | varchar(17) | Yes | — | Vehicle Identification Number (unique per org) |
| `mileage_km` | integer | No | `0` | Current odometer reading in km |
| `last_service_at` | timestamptz | Yes | — | Last service date |
| `last_service_label` | varchar(64) | Yes | — | Display label |
| `status` | varchar(16) | No | `'active'` | Vehicle status |

**Indexes:** `vehicles_org_idx` on `(org_id, branch_id)`, `vehicles_org_plate_idx` UNIQUE on `(org_id, plate)`, `vehicles_org_vin_idx` UNIQUE on `(org_id, vin)`

### fleets

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `name` | varchar(200) | No | — | Fleet name |
| `vehicle_count` | integer | No | `0` | Total vehicles |
| `active_count` | integer | No | `0` | Active vehicles |
| `contract_status` | varchar(32) | No | `'active'` | Contract status |
| `contract_type` | varchar(32) | Yes | — | Contract type |
| `contract_value_halalas` | bigint | Yes | — | Contract value in halalas |
| `contract_start_date` | date | Yes | — | Contract start |
| `contract_end_date` | date | Yes | — | Contract end |
| `renewal_date` | date | Yes | — | Renewal date |
| `contact_name` | varchar(200) | Yes | — | Fleet contact person |
| `contact_phone` | varchar(32) | Yes | — | Contact phone |
| `contact_email` | varchar(254) | Yes | — | Contact email |

**Indexes:** `fleets_org_idx` on `(org_id)`

---

## Workshop

### job_cards

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `code` | varchar(32) | No | — | Human-readable code (e.g., `A3F8B2C1`), unique per org |
| `customer_id` | varchar(26) | Yes | — | FK to customers |
| `customer_name` | varchar(200) | No | — | Denormalized customer name |
| `vehicle_id` | varchar(26) | Yes | — | FK to vehicles |
| `vehicle_label` | varchar(160) | No | — | Denormalized vehicle label |
| `service` | varchar(32) | No | — | Service type key |
| `status` | varchar(24) | No | `'pending'` | Job status |
| `stage` | varchar(24) | No | `'checkin'` | Current workflow stage |
| `priority` | varchar(16) | No | `'medium'` | Priority level |
| `assigned_tech_id` | varchar(26) | Yes | — | FK to users/technicians. `own`/`assigned` scope keys on this. |
| `complaint` | text | Yes | — | Customer complaint text |
| `qc_passed_by` | varchar(26) | Yes | — | User who passed QC (must differ from tech) |

**Indexes:** `job_cards_org_code_idx` UNIQUE on `(org_id, code)`, `job_cards_org_idx` on `(org_id, branch_id, status)`, `job_cards_tech_idx` on `(org_id, assigned_tech_id)`

### appointments

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `scheduled_date` | date | No | — | Appointment date |
| `time_label` | varchar(16) | No | — | Display time (e.g., "9:00 AM") |
| `start_minute` | integer | No | — | Minutes past midnight (for overlap check) |
| `duration_mins` | integer | No | — | Duration in minutes |
| `customer_id` | varchar(26) | Yes | — | FK to customers |
| `customer_name` | varchar(200) | No | — | Denormalized |
| `vehicle_id` | varchar(26) | Yes | — | FK to vehicles |
| `vehicle_label` | varchar(160) | No | — | Denormalized |
| `plate` | varchar(16) | No | — | License plate |
| `service_label` | varchar(80) | No | — | Service description |
| `bay` | varchar(32) | No | — | Workshop bay assignment |
| `technician_id` | varchar(26) | Yes | — | FK to users/technicians |
| `technician_name` | varchar(200) | Yes | — | Denormalized |
| `status` | varchar(16) | No | `'awaiting'` | Appointment status |

**Indexes:** `appointments_date_idx` on `(org_id, branch_id, scheduled_date)`, `appointments_bay_idx` on `(org_id, scheduled_date, bay)`

### estimates / estimate_lines

See universal columns plus financial fields (`subtotal_halalas`, `tax_halalas`, `discount_halalas`, `total_halalas`, `status`, `submitted_by`, `approved_by`, `approved_at`, `valid_until`). Lines carry `estimate_id`, `description`, `kind`, `qty`, `unit_price_halalas`, `part_sku`, `sort`.

---

## Finance

### invoices

Key ZATCA fields: `seller_vat_number`, `buyer_vat_number`, `qr_code`, `hash_prev`, `hash_self`, `issued_at`. Plus `paid_halalas` (server-maintained sum of cleared payments).

**Indexes:** `invoices_org_code_idx` UNIQUE on `(org_id, code)`, `invoices_org_idx` on `(org_id, branch_id, status)`

### invoice_lines

Same structure as estimate_lines with `invoice_id` FK.

### payments

| Column | Type | Description |
|--------|------|-------------|
| `invoice_id` | varchar(26) | FK to invoices |
| `paid_on` | date | Payment date |
| `method` | varchar(40) | Payment method |
| `method_ar` | varchar(60) | Arabic method name |
| `reference` | varchar(64) | Transaction reference |
| `amount_halalas` | bigint | Payment amount |
| `note` | text | Payment notes |

### receipts

Code-bearing receipt records with `receipt_date`, `customer_name`, `invoice_code`, `method`, `amount_halalas`, `status`.

---

## Parts & Purchase

### parts

| Column | Type | Description |
|--------|------|-------------|
| `name` | varchar(200) | Part name |
| `sku` | varchar(64) | Unique per org |
| `price_halalas` | bigint | Selling price |
| `cost_halalas` | bigint | Cost price (redacted for some roles) |
| `on_hand` | integer | Current stock |
| `reserved` | integer | Reserved quantity |
| `reorder_level` | integer | Reorder threshold |
| `backorderable` | boolean | Can be promised when out of stock |

**Indexes:** `parts_org_sku_idx` UNIQUE on `(org_id, sku)`, `parts_org_idx` on `(org_id, branch_id)`

### inventory_movements

Append-only ledger. Key columns: `part_id`, `type`, `qty`, `delta` (signed), `ref`, `reason`, `to_branch_id`, `transfer_id`.

### suppliers, requisitions, requisition_lines, purchase_orders, purchase_order_lines

Full procurement chain. PO lines track `received_qty` (invariant: `received_qty <= qty`). Requisitions and POs carry `submitted_by` / `approved_by` for segregation of duties.

---

## People

### technicians

`name`, `specialty`, `active_jobs`, `rating`, `user_id` (link to user account).

### departments

`name`, `head`, `headcount`, `cost_center`, `branch_label`, `icon`.

### employees

`employee_number` (unique per org), `name`, `name_ar`, `title`, `department_id`, `hire_date`, `status`, `salary_halalas` (redacted field).

### payroll_runs / payroll_lines

Payroll periods (`YYYY-MM`). Runs carry `gross_halalas`, `allowances_halalas`, `deductions_halalas`, `net_halalas`. Lines per employee. Posted runs cannot be reopened.

### timesheets

`employee_id`, `work_date`, `clock_in`, `clock_out`, `minutes`, `status`.

### leave_requests

`employee_id`, `type` (annual, sick, etc.), `start_date`, `end_date`, `days`, `status`, `reason`, `approver_id`.

---

## CRM

### leads, opportunities, campaigns, segments, crm_tasks

Full CRM pipeline. Leads carry `converted_opportunity_id` (set on conversion, makes it idempotent). Campaigns track `reach`, `opens`, `clicks`, `conversions`, `budget_halalas`, `spent_halalas`.

### public_leads

Unauthenticated web form submissions. Lands in a configured org (`PUBLIC_LEAD_ORG_ID`). Promoted to the `leads` pipeline after triage.

### customer_feedback

`rating` (integer), `comment`, `job_card_id`, `customer_id`, `customer_name`.

---

## Accounting

### chart_of_accounts

`code` (unique per org), `name`, `type`, `balance_halalas`, `children_count`, `parent_id` (self-referencing hierarchy).

### journal_entries

`code`, `entry_date`, `ref`, `narration`, `debit_halalas`, `credit_halalas`, `status`.

### expenses

`code`, `expense_date`, `category`, `vendor`, `amount_halalas`, `status`.

### bank_statements

Bank reconciliation lines: `statement_date`, `description`, `reference`, `bank_account`, `amount_halalas`, `direction` (`credit`/`debit`), `matched`, `matched_receipt_id`, `matched_at`.

### saved_reports

`name`, `source`, `owner_name`, `definition` (JSONB filter/column config).

---

## Financial Products

### insurance_policies

`policy_number` (unique per org), `insurer`, `customer_id`, `holder_name`, `vehicle_id`, `type` (`comprehensive`/`third_party`/`own_damage`), `premium_halalas`, `coverage_halalas`, `start_date`, `end_date`, `status`.

### insurance_claims

`claim_number`, `policy_id`, `vehicle_id`, `job_card_id`, `amount_claimed_halalas`, `amount_approved_halalas`, `status`, `incident_date`, `description`, `submitted_by`, `approved_by`.

### loan_contracts

`contract_number`, `customer_id`, `borrower_name`, `principal_halalas`, `rate_bps` (basis points; 600 = 6.00%), `term_months`, `start_date`, `monthly_instalment_halalas`.

### loan_repayments

`loan_contract_id`, `sequence` (1-based), `due_date`, `amount_due_halalas`, `amount_paid_halalas`, `paid_date`, `status`.

---

## Diagnostics & Knowledge

### obd_devices

`code`, `bay`, `vehicle_label`, `plate`, `status`, `vin`, `rpm`, `coolant`, `voltage`, `load`, `dtc_count`.

### obd_dtc_readings

`device_id`, `dtc_code`, `description`, `severity`, `source` (`rescan`/`clear`/`manual`), `cleared`, `read_at`, `mock`.

### dtc_codes / oem_tools / kb_procedures

Reference data for diagnostics and repair procedures.

---

## Platform Control Plane

### garage_applications / supplier_applications / subscription_requests

Onboarding and lifecycle management. Not tenant-scoped (platform-level).

### support_tickets

`subject`, `body`, `priority`, `status`, `assigned_to`, `thread` (JSONB array).

### system_health

`uptime_pct`, `queue_depth`, `error_rate_pct`, `db_size_gb`, `active_sessions`.

---

## Audit & Idempotency

### audit_log

Append-only (triggers refuse UPDATE/DELETE). Columns: `actor_id`, `actor_role`, `action`, `entity`, `entity_id`, `before` (JSONB), `after` (JSONB), `reason`, `source` (`api`/`seed`/`job`/`import`), `request_id`, `ip`, `user_agent`, `ts`.

**Indexes:** `audit_entity_idx` on `(org_id, entity, entity_id)`, `audit_ts_idx` on `(org_id, ts)`

### idempotency_keys

`key` (varchar 128), `endpoint`, `request_hash` (SHA-256 of body), `response_status`, `response_body` (JSONB). Unique on `(org_id, key, endpoint)`.

### otp_challenges

`channel`, `destination`, `code_hash`, `expires_at`, `attempts`, `verified_at`.

---

## Owned Tables (Scope Narrowing)

These tables narrow further under `own`/`assigned`/`self` scopes:

| Table | Ownership Column |
|-------|-----------------|
| `job_cards` | `assigned_tech_id` |
| `appointments` | `technician_id` |
| `crm_tasks` | `created_by` |
| `user_sessions` | `user_id` |

---

## See Also

- [Glossary](./glossary.md) — Term definitions
- [API Cookbook](./api-cookbook.md) — How to query these tables via the API
- [Configuration Reference](./configuration-reference.md) — Database connection settings
