<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# Data dictionary

**Status:** GENERATED · **Source of truth:** `server/src/db/schema.ts` · **Sources as of:** 2026-09-18

Every column of every table, 1269 in total.

## `organizations`

Organizations sit above tenancy — a row *is* the tenant.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `name_ar` | varchar(200) | nullable | — | — | — |
| `slug` | varchar(80) | NOT NULL | — | — | — |
| `cr_number` | varchar(20) | nullable | — | — | — |
| `vat_number` | varchar(20) | nullable | — | — | — |
| `plan` | varchar(40) | NOT NULL | — | 'starter' | — |
| `status` | varchar(20) | NOT NULL | — | 'active' | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |

## `branches`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `name_ar` | varchar(200) | nullable | — | — | — |
| `city` | varchar(120) | nullable | — | — | — |
| `is_main` | boolean | NOT NULL | — | false | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `branches_org_idx` | no | orgId |

## `users`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `email` | varchar(254) | NOT NULL | — | — | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `name_ar` | varchar(200) | nullable | — | — | — |
| `role` | varchar(32) | NOT NULL | — | — | — |
| `acting_role` | varchar(32) | nullable | — | — | — |
| `customer_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `password_hash` | text | nullable | — | — | — |
| `status` | varchar(20) | NOT NULL | — | 'active' | — |
| `last_login_at` | timestamptz | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `users_org_email_idx` | yes | orgId, email |
| `users_customer_idx` | no | orgId, customerId |

## `user_sessions`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `user_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `refresh_token_hash` | text | NOT NULL | — | — | — |
| `family_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `user_agent` | text | nullable | — | — | — |
| `ip` | varchar(64) | nullable | — | — | — |
| `expires_at` | timestamptz | NOT NULL | — | — | — |
| `revoked_at` | timestamptz | nullable | — | — | — |
| `replaced_by` | varchar(ULID_LENGTH) | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `user_sessions_user_idx` | no | orgId, userId |

## `fleets`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `vehicle_count` | integer | NOT NULL | — | 0 | — |
| `active_count` | integer | NOT NULL | — | 0 | — |
| `contract_status` | varchar(32) | NOT NULL | — | 'active' | — |
| `contract_type` | varchar(32) | nullable | — | — | — |
| `contract_value_halalas` | bigint | nullable | — | — | money — integer halalas |
| `contract_start_date` | date | nullable | — | — | — |
| `contract_end_date` | date | nullable | — | — | — |
| `renewal_date` | date | nullable | — | — | — |
| `contact_name` | varchar(200) | nullable | — | — | — |
| `contact_phone` | varchar(32) | nullable | — | — | — |
| `contact_email` | varchar(254) | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `fleets_org_idx` | no | orgId |

## `customers`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `phone` | varchar(32) | NOT NULL | — | — | — |
| `email` | varchar(254) | nullable | — | — | — |
| `type` | varchar(16) | NOT NULL | — | 'individual' | — |
| `fleet_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `vehicle_count` | integer | NOT NULL | — | 0 | — |
| `total_spent_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `last_visit_at` | timestamptz | nullable | — | — | — |
| `last_visit_label` | varchar(64) | nullable | — | — | presentation string from the design bundle |
| `notes` | text | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `customers_org_idx` | no | orgId, branchId |
| `customers_org_phone_idx` | yes | orgId, phone |

## `vehicles`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `plate` | varchar(16) | NOT NULL | — | — | — |
| `make_model` | varchar(160) | NOT NULL | — | — | — |
| `customer_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `owner_name` | varchar(200) | nullable | — | — | — |
| `vin` | varchar(17) | nullable | — | — | — |
| `mileage_km` | integer | NOT NULL | — | 0 | — |
| `last_service_at` | timestamptz | nullable | — | — | — |
| `last_service_label` | varchar(64) | nullable | — | — | presentation string from the design bundle |
| `status` | varchar(16) | NOT NULL | — | 'active' | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `vehicles_org_idx` | no | orgId, branchId |
| `vehicles_org_plate_idx` | yes | orgId, plate |
| `vehicles_org_vin_idx` | yes | orgId, vin |

## `services`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `icon` | varchar(64) | NOT NULL | — | — | — |
| `label` | varchar(120) | NOT NULL | — | — | — |

## `job_cards`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `code` | varchar(32) | NOT NULL | — | — | — |
| `customer_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `customer_name` | varchar(200) | NOT NULL | — | — | — |
| `vehicle_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `vehicle_label` | varchar(160) | NOT NULL | — | — | presentation string from the design bundle |
| `service` | varchar(32) | NOT NULL | — | — | — |
| `status` | varchar(24) | NOT NULL | — | 'pending' | — |
| `stage` | varchar(24) | NOT NULL | — | 'checkin' | — |
| `priority` | varchar(16) | NOT NULL | — | 'medium' | — |
| `assigned_tech_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `complaint` | text | nullable | — | — | — |
| `qc_passed_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `appointment_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `job_cards_org_code_idx` | yes | orgId, code |
| `job_cards_org_idx` | no | orgId, branchId, status |
| `job_cards_tech_idx` | no | orgId, assignedTechId |
| `job_cards_appointment_idx` | no | orgId, appointmentId |

## `appointments`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `scheduled_date` | date | NOT NULL | — | — | — |
| `time_label` | varchar(16) | NOT NULL | — | — | presentation string from the design bundle |
| `start_minute` | integer | NOT NULL | — | — | — |
| `duration_mins` | integer | NOT NULL | — | — | — |
| `customer_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `customer_name` | varchar(200) | NOT NULL | — | — | — |
| `vehicle_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `vehicle_label` | varchar(160) | NOT NULL | — | — | presentation string from the design bundle |
| `plate` | varchar(16) | NOT NULL | — | — | — |
| `service_label` | varchar(80) | NOT NULL | — | — | presentation string from the design bundle |
| `bay` | varchar(32) | NOT NULL | — | — | — |
| `technician_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `technician_name` | varchar(200) | nullable | — | — | — |
| `status` | varchar(16) | NOT NULL | — | 'awaiting' | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `appointments_date_idx` | no | orgId, branchId, scheduledDate |
| `appointments_bay_idx` | no | orgId, scheduledDate, bay |

## `estimates`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `code` | varchar(32) | NOT NULL | — | — | — |
| `job_card_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `customer_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `customer_name` | varchar(200) | NOT NULL | — | — | — |
| `vehicle_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `vehicle_label` | varchar(160) | NOT NULL | — | — | presentation string from the design bundle |
| `subtotal_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `tax_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `discount_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `total_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `status` | varchar(16) | NOT NULL | — | 'draft' | — |
| `valid_until` | timestamptz | nullable | — | — | — |
| `submitted_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `approved_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `approved_at` | timestamptz | nullable | — | — | — |
| `customer_signed_at` | timestamptz | nullable | — | — | — |
| `customer_signature_channel` | varchar(16) | nullable | — | — | — |
| `customer_signature_challenge_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `notes` | text | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `estimates_org_code_idx` | yes | orgId, code |
| `estimates_org_idx` | no | orgId, branchId, status |

## `estimate_lines`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `estimate_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `description` | varchar(300) | NOT NULL | — | — | — |
| `description_ar` | varchar(300) | nullable | — | — | — |
| `kind` | varchar(16) | NOT NULL | — | — | — |
| `qty` | double precision | NOT NULL | — | — | — |
| `unit_price_halalas` | bigint | NOT NULL | — | — | money — integer halalas |
| `part_sku` | varchar(64) | nullable | — | — | — |
| `sort` | integer | NOT NULL | — | 0 | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `estimate_lines_estimate_idx` | no | orgId, estimateId |

## `declined_jobs`

Declined Job Tracking & Follow-Up (Sprint 1, P0). A row per estimate line — or per whole estimate when the customer declines the job outright — a customer said no to. Deliberately its own table rather than a status on `estimate_lines`: a decline starts a sales follow-up lifecycle (contacted, reconsidering, expired…) that has nothing to do with the estimate's own document lifecycle, and recording it separately means an estimate's money totals are never at risk of a follow-up-workflow bug. `estimateLineId` is null when the whole estimate was declined rather than one line of it.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `estimate_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `estimate_line_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `job_card_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `customer_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `customer_name` | varchar(200) | NOT NULL | — | — | — |
| `vehicle_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `vehicle_label` | varchar(160) | NOT NULL | — | — | presentation string from the design bundle |
| `advisor_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `description` | varchar(300) | NOT NULL | — | — | — |
| `reason_category` | varchar(32) | NOT NULL | — | 'other' | — |
| `reason_notes` | text | nullable | — | — | — |
| `safety_severity` | varchar(16) | NOT NULL | — | 'monitor' | — |
| `value_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `status` | varchar(24) | NOT NULL | — | 'declined' | — |
| `follow_up_date` | date | nullable | — | — | — |
| `follow_up_notes` | text | nullable | — | — | — |
| `declined_at` | timestamptz | NOT NULL | — | now() | — |
| `resolved_at` | timestamptz | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `declined_jobs_org_idx` | no | orgId, branchId, status |
| `declined_jobs_estimate_idx` | no | orgId, estimateId |
| `declined_jobs_line_once_idx` | yes | orgId, estimateLineId |

## `inspection_findings`

Digital Vehicle Health Check — inspection findings (Sprint 2, P0). One row per checklist point on one job card; see `packages/contract/src/entities/inspection.ts` for why `internalNote` and `customerNote` are kept apart.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `job_card_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `category` | varchar(64) | NOT NULL | — | — | — |
| `category_ar` | varchar(64) | nullable | — | — | — |
| `item` | varchar(120) | NOT NULL | — | — | — |
| `item_ar` | varchar(120) | nullable | — | — | — |
| `severity` | varchar(16) | NOT NULL | — | 'ok' | — |
| `internal_note` | text | nullable | — | — | — |
| `customer_note` | text | nullable | — | — | — |
| `estimate_line_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `recorded_by` | varchar(ULID_LENGTH) | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `inspection_findings_job_idx` | no | orgId, jobCardId |

## `inspection_media`

Photo/video evidence attached to an inspection finding. The bytes live on disk (`server/src/storage/media.ts`); `storageKey` is the only pointer to them a row carries — it is never returned to a client, which instead reads `GET /inspection-media/:id/file`.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `finding_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `job_card_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `kind` | varchar(8) | NOT NULL | — | — | — |
| `stage` | varchar(8) | NOT NULL | — | 'before' | — |
| `storage_key` | varchar(255) | NOT NULL | — | — | — |
| `mime_type` | varchar(100) | NOT NULL | — | — | — |
| `size_bytes` | integer | NOT NULL | — | — | — |
| `annotations` | jsonb | NOT NULL | — | sql`'[]'::jsonb` | — |
| `uploaded_by` | varchar(ULID_LENGTH) | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `inspection_media_finding_idx` | no | orgId, findingId |
| `inspection_media_job_idx` | no | orgId, jobCardId |

## `delivery_signoffs`

Customer sign-off at delivery (Sprint 2, P0). One row per job card — the signature image lives on disk (`server/src/storage/media.ts`), `storageKey` is the only pointer to it a row carries, and it is served only through `GET /delivery-signoffs/:id/signature`.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `job_card_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `signed_by_name` | varchar(200) | NOT NULL | — | — | — |
| `agreed_at` | timestamptz | NOT NULL | — | — | — |
| `checklist` | jsonb | NOT NULL | — | sql`'{}'::jsonb` | — |
| `odometer_out` | integer | nullable | — | — | — |
| `storage_key` | varchar(255) | NOT NULL | — | — | — |
| `mime_type` | varchar(100) | NOT NULL | — | — | — |
| `size_bytes` | integer | NOT NULL | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `delivery_signoffs_job_idx` | no | orgId, jobCardId |

## `canned_jobs`

Canned Jobs — predefined, priced service packages (build-order item 5). `priceHalalas`/`lineCount` are stored, computed at write time from `lines` the same way `estimates.subtotalHalalas` is computed from `estimate_lines` — never derived from a join at read time.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(160) | NOT NULL | — | — | — |
| `name_ar` | varchar(160) | nullable | — | — | — |
| `category` | varchar(64) | nullable | — | — | — |
| `description` | text | nullable | — | — | — |
| `active` | boolean | NOT NULL | — | true | — |
| `price_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `line_count` | integer | NOT NULL | — | 0 | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `canned_jobs_org_idx` | no | orgId, branchId, active |

## `canned_job_lines`

One line of a canned job's bundle — the same shape `estimate_lines` carries, copied verbatim into an estimate when the package is applied (never referenced live, so a later catalog price change cannot silently move an estimate someone already priced from it).

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `canned_job_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `description` | varchar(300) | NOT NULL | — | — | — |
| `description_ar` | varchar(300) | nullable | — | — | — |
| `kind` | varchar(16) | NOT NULL | — | — | — |
| `qty` | double precision | NOT NULL | — | — | — |
| `unit_price_halalas` | bigint | NOT NULL | — | — | money — integer halalas |
| `part_sku` | varchar(64) | nullable | — | — | — |
| `sort` | integer | NOT NULL | — | 0 | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `canned_job_lines_job_idx` | no | orgId, cannedJobId |

## `invoices`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `code` | varchar(32) | NOT NULL | — | — | — |
| `customer_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `customer_name` | varchar(200) | NOT NULL | — | — | — |
| `job_card_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `estimate_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `vehicle_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `due_date` | date | NOT NULL | — | — | — |
| `status` | varchar(16) | NOT NULL | — | 'draft' | — |
| `subtotal_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `tax_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `discount_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `total_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `paid_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `seller_vat_number` | varchar(20) | nullable | — | — | — |
| `buyer_vat_number` | varchar(20) | nullable | — | — | — |
| `qr_code` | text | nullable | — | — | — |
| `hash_prev` | varchar(64) | nullable | — | — | — |
| `hash_self` | varchar(64) | nullable | — | — | — |
| `issued_at` | timestamptz | nullable | — | — | — |
| `notes` | text | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `invoices_org_code_idx` | yes | orgId, code |
| `invoices_org_idx` | no | orgId, branchId, status |
| `invoices_estimate_idx` | no | orgId, estimateId |

## `invoice_lines`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `invoice_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `description` | varchar(300) | NOT NULL | — | — | — |
| `description_ar` | varchar(300) | nullable | — | — | — |
| `kind` | varchar(16) | NOT NULL | — | — | — |
| `qty` | double precision | NOT NULL | — | — | — |
| `unit_price_halalas` | bigint | NOT NULL | — | — | money — integer halalas |
| `part_sku` | varchar(64) | nullable | — | — | — |
| `sort` | integer | NOT NULL | — | 0 | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `invoice_lines_invoice_idx` | no | orgId, invoiceId |

## `payments`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `invoice_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `paid_on` | date | NOT NULL | — | — | — |
| `method` | varchar(40) | NOT NULL | — | — | — |
| `method_ar` | varchar(60) | nullable | — | — | — |
| `reference` | varchar(64) | nullable | — | — | — |
| `amount_halalas` | bigint | NOT NULL | — | — | money — integer halalas |
| `note` | text | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `payments_invoice_idx` | no | orgId, invoiceId |

## `receipts`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `code` | varchar(32) | NOT NULL | — | — | — |
| `receipt_date` | date | NOT NULL | — | — | — |
| `customer_name` | varchar(200) | NOT NULL | — | — | — |
| `invoice_code` | varchar(32) | nullable | — | — | — |
| `method` | varchar(40) | NOT NULL | — | — | — |
| `amount_halalas` | bigint | NOT NULL | — | — | money — integer halalas |
| `status` | varchar(16) | NOT NULL | — | 'pending' | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `receipts_org_code_idx` | yes | orgId, code |

## `parts`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `sku` | varchar(64) | NOT NULL | — | — | — |
| `price_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `cost_halalas` | bigint | nullable | — | — | money — integer halalas |
| `on_hand` | integer | NOT NULL | — | 0 | — |
| `reserved` | integer | NOT NULL | — | 0 | — |
| `reorder_level` | integer | NOT NULL | — | 0 | — |
| `backorderable` | boolean | NOT NULL | — | false | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `parts_org_sku_idx` | yes | orgId, sku |
| `parts_org_idx` | no | orgId, branchId |

## `inventory_movements`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `part_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `type` | varchar(16) | NOT NULL | — | — | — |
| `qty` | integer | NOT NULL | — | — | — |
| `delta` | integer | NOT NULL | — | — | — |
| `ref` | varchar(64) | nullable | — | — | — |
| `reason` | text | nullable | — | — | — |
| `to_branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `transfer_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `inventory_movements_part_idx` | no | orgId, partId |

## `suppliers`

A tenant-owned vendor directory. The parts network carried only free-text supplier names; a purchase order references a supplier row by id (F-022).

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `code` | varchar(32) | NOT NULL | — | — | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `name_ar` | varchar(200) | nullable | — | — | — |
| `contact_name` | varchar(200) | nullable | — | — | — |
| `contact_phone` | varchar(32) | nullable | — | — | — |
| `contact_email` | varchar(254) | nullable | — | — | — |
| `status` | varchar(16) | NOT NULL | — | 'active' | — |
| `notes` | text | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `suppliers_org_code_idx` | yes | orgId, code |
| `suppliers_org_idx` | no | orgId, branchId, status |

## `requisitions`

A request to buy, raised into a purchase order once approved (F-022). The estimated total is summed from the lines by the server, never sent.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `code` | varchar(32) | NOT NULL | — | — | — |
| `requester_name` | varchar(200) | NOT NULL | — | — | — |
| `department` | varchar(160) | nullable | — | — | — |
| `priority` | varchar(16) | NOT NULL | — | 'normal' | — |
| `status` | varchar(16) | NOT NULL | — | 'draft' | — |
| `needed_by` | date | nullable | — | — | — |
| `estimated_total_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `notes` | text | nullable | — | — | — |
| `submitted_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `approved_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `approved_at` | timestamptz | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `requisitions_org_code_idx` | yes | orgId, code |
| `requisitions_org_idx` | no | orgId, branchId, status |

## `requisition_lines`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `requisition_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `part_sku` | varchar(64) | nullable | — | — | — |
| `description` | varchar(300) | NOT NULL | — | — | — |
| `description_ar` | varchar(300) | nullable | — | — | — |
| `qty` | integer | NOT NULL | — | — | — |
| `est_unit_price_halalas` | bigint | NOT NULL | — | — | money — integer halalas |
| `sort` | integer | NOT NULL | — | 0 | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `requisition_lines_req_idx` | no | orgId, requisitionId |

## `purchase_orders`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `code` | varchar(32) | NOT NULL | — | — | — |
| `supplier_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `supplier_name` | varchar(200) | NOT NULL | — | — | — |
| `requisition_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `status` | varchar(24) | NOT NULL | — | 'draft' | — |
| `subtotal_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `tax_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `total_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `notes` | text | nullable | — | — | — |
| `ordered_at` | timestamptz | nullable | — | — | — |
| `expected_at` | timestamptz | nullable | — | — | — |
| `submitted_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `approved_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `approved_at` | timestamptz | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `purchase_orders_org_code_idx` | yes | orgId, code |
| `purchase_orders_org_idx` | no | orgId, branchId, status |

## `purchase_order_lines`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `purchase_order_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `part_sku` | varchar(64) | nullable | — | — | — |
| `description` | varchar(300) | NOT NULL | — | — | — |
| `description_ar` | varchar(300) | nullable | — | — | — |
| `qty` | integer | NOT NULL | — | — | — |
| `received_qty` | integer | NOT NULL | — | 0 | — |
| `unit_price_halalas` | bigint | NOT NULL | — | — | money — integer halalas |
| `sort` | integer | NOT NULL | — | 0 | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `po_lines_po_idx` | no | orgId, purchaseOrderId |

## `technicians`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `specialty` | varchar(160) | nullable | — | — | — |
| `active_jobs` | integer | NOT NULL | — | 0 | — |
| `rating` | double precision | nullable | — | — | — |
| `user_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `technicians_org_idx` | no | orgId, branchId |

## `departments`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `head` | varchar(200) | nullable | — | — | — |
| `headcount` | integer | NOT NULL | — | 0 | — |
| `cost_center` | varchar(40) | nullable | — | — | — |
| `branch_label` | varchar(160) | nullable | — | — | presentation string from the design bundle |
| `icon` | varchar(64) | nullable | — | — | — |

## `leads`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `company` | varchar(200) | nullable | — | — | — |
| `value_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `source` | varchar(64) | nullable | — | — | — |
| `stage` | varchar(32) | NOT NULL | — | 'new' | — |
| `lead_date` | date | nullable | — | — | — |
| `score` | integer | nullable | — | — | — |
| `converted_opportunity_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `leads_stage_idx` | no | orgId, stage |

## `opportunities`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `company` | varchar(200) | nullable | — | — | — |
| `value_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `stage` | varchar(32) | NOT NULL | — | — | — |
| `probability_pct` | integer | nullable | — | — | — |
| `close_date` | date | nullable | — | — | — |
| `owner_name` | varchar(200) | nullable | — | — | — |

## `campaigns`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `type` | varchar(24) | NOT NULL | — | — | — |
| `status` | varchar(24) | NOT NULL | — | — | — |
| `start_date` | date | nullable | — | — | — |
| `end_date` | date | nullable | — | — | — |
| `reach` | integer | NOT NULL | — | 0 | — |
| `opens` | integer | NOT NULL | — | 0 | — |
| `clicks` | integer | NOT NULL | — | 0 | — |
| `conversions` | integer | NOT NULL | — | 0 | — |
| `budget_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `spent_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `last_dispatched_at` | timestamptz | nullable | — | — | — |
| `last_dispatch_mock` | boolean | nullable | — | — | — |

## `segments`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `member_count` | integer | NOT NULL | — | 0 | — |
| `rules` | text | nullable | — | — | — |
| `last_updated_label` | varchar(64) | nullable | — | — | presentation string from the design bundle |

## `crm_tasks`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `title` | varchar(300) | NOT NULL | — | — | — |
| `assigned_to` | varchar(200) | nullable | — | — | — |
| `due_date` | date | nullable | — | — | — |
| `priority` | varchar(16) | NOT NULL | — | 'medium' | — |
| `status` | varchar(16) | NOT NULL | — | 'todo' | — |
| `type` | varchar(24) | nullable | — | — | — |

## `public_leads`

Public marketing intake (F-025). A raw, unauthenticated web submission — it carries a contact channel and a message and has earned no score or pipeline stage, which is why it is its own table rather than a row in the qualified `leads` pipeline. Every submission lands in one configured org (`PUBLIC_LEAD_ORG_ID`); the caller never chooses tenancy.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `email` | varchar(254) | nullable | — | — | — |
| `phone` | varchar(32) | nullable | — | — | — |
| `company` | varchar(200) | nullable | — | — | — |
| `message` | text | nullable | — | — | — |
| `source` | varchar(64) | nullable | — | — | — |
| `status` | varchar(16) | NOT NULL | — | 'new' | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `public_leads_org_idx` | no | orgId, status |

## `customer_feedback`

Customer feedback (F-027). A rating and optional comment against a job card / customer, tenant-scoped like everything else.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `rating` | integer | NOT NULL | — | — | — |
| `comment` | text | nullable | — | — | — |
| `job_card_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `customer_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `customer_name` | varchar(200) | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `customer_feedback_org_idx` | no | orgId, branchId |

## `chart_of_accounts`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `code` | varchar(24) | NOT NULL | — | — | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `type` | varchar(40) | NOT NULL | — | — | — |
| `balance_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `children_count` | integer | NOT NULL | — | 0 | — |
| `parent_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `coa_org_code_idx` | yes | orgId, code |

## `journal_entries`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `code` | varchar(32) | NOT NULL | — | — | — |
| `entry_date` | date | NOT NULL | — | — | — |
| `ref` | varchar(64) | nullable | — | — | — |
| `narration` | text | nullable | — | — | — |
| `debit_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `credit_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `status` | varchar(16) | NOT NULL | — | 'draft' | — |
| `source` | varchar(32) | nullable | — | — | — |
| `source_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `journal_org_code_idx` | yes | orgId, code |
| `journal_entries_source_idx` | no | orgId, source, sourceId |

## `journal_lines`

The lines that make a journal entry double-entry (DF-001, DF-003). `journal_entries` carries only a header total, so before this table an "entry" could not name the accounts it moved and `checkJournalBalanced` — which takes lines and requires at least two — had nothing to be called with. Every posting route writes a header and its lines together, in one transaction, after the rule has passed. `accountCode` sits beside `accountId` on purpose: the code is what a person reads on a trial balance and what the posting rules are written against, and it stays legible on the row if the account is later renamed.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `journal_entry_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `account_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `account_code` | varchar(24) | NOT NULL | — | — | — |
| `debit_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `credit_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `narration` | text | nullable | — | — | — |
| `sort` | integer | NOT NULL | — | 0 | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `journal_lines_entry_idx` | no | orgId, journalEntryId |
| `journal_lines_account_idx` | no | orgId, accountId |

## `expenses`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `code` | varchar(32) | NOT NULL | — | — | — |
| `expense_date` | date | NOT NULL | — | — | — |
| `category` | varchar(120) | nullable | — | — | — |
| `vendor` | varchar(200) | nullable | — | — | — |
| `amount_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `status` | varchar(16) | NOT NULL | — | 'pending' | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `expenses_org_code_idx` | yes | orgId, code |

## `bank_statements`

Bank statement lines (F-028). The *bank* side of a reconciliation — one row per line on an imported statement — so BankReconciliation has something to match the recorded receipts against. `direction` is 'credit' (money into the account) or 'debit' (money out); `matched` and the match columns record a line reconciled to a book entry. Money is integer halalas like everything else. Read-only through the generic router; the `match` action is the only write.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `statement_date` | date | NOT NULL | — | — | — |
| `description` | varchar(300) | NOT NULL | — | — | — |
| `reference` | varchar(64) | nullable | — | — | — |
| `bank_account` | varchar(120) | nullable | — | — | — |
| `amount_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `direction` | varchar(8) | NOT NULL | — | — | — |
| `matched` | boolean | NOT NULL | — | false | — |
| `matched_receipt_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `matched_at` | timestamptz | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `bank_statements_org_idx` | no | orgId, matched |

## `saved_reports`

Saved report definitions (F-028). Lets CustomReports persist a report — its name, the source it runs over, and the filter/column selection as JSON — so a user can rebuild it later. Scoped to the tenant by RLS; `ownerName` records who saved it. Writable through the generic router.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `source` | varchar(64) | nullable | — | — | — |
| `owner_name` | varchar(200) | nullable | — | — | — |
| `definition` | jsonb | NOT NULL | — | {} | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `saved_reports_org_idx` | no | orgId, createdBy |

## `insurance_policies`

Insurance policies — the cover a customer holds on a vehicle. Money is integer halalas (premium, coverage). Read-only through the generic router; gated on `accounting` (there is no dedicated `insurance` module in the RBAC matrix — see registry.ts).

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `policy_number` | varchar(40) | NOT NULL | — | — | — |
| `insurer` | varchar(160) | NOT NULL | — | — | — |
| `customer_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `holder_name` | varchar(200) | NOT NULL | — | — | — |
| `vehicle_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `vehicle_label` | varchar(160) | NOT NULL | — | — | presentation string from the design bundle |
| `type` | varchar(24) | NOT NULL | — | 'comprehensive' | — |
| `premium_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `coverage_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `start_date` | date | NOT NULL | — | — | — |
| `end_date` | date | NOT NULL | — | — | — |
| `status` | varchar(16) | NOT NULL | — | 'active' | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `insurance_policies_org_number_idx` | yes | orgId, policyNumber |
| `insurance_policies_org_idx` | no | orgId, branchId, status |

## `insurance_claims`

Insurance claims — a request against a policy, which may relate to a repair. Read-only through the generic router; the lifecycle (submit, approve, reject, pay) is the bespoke router in `routes/insurance-claims.ts`, with approval gated on the ceiling and segregation of duties like the estimate.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `claim_number` | varchar(40) | NOT NULL | — | — | — |
| `policy_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `policy_number` | varchar(40) | NOT NULL | — | — | — |
| `vehicle_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `vehicle_label` | varchar(160) | NOT NULL | — | — | presentation string from the design bundle |
| `job_card_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `amount_claimed_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `amount_approved_halalas` | bigint | nullable | — | — | money — integer halalas |
| `status` | varchar(16) | NOT NULL | — | 'submitted' | — |
| `incident_date` | date | NOT NULL | — | — | — |
| `description` | text | NOT NULL | — | — | — |
| `submitted_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `approved_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `approved_at` | timestamptz | nullable | — | — | — |
| `paid_at` | timestamptz | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `insurance_claims_org_number_idx` | yes | orgId, claimNumber |
| `insurance_claims_policy_idx` | no | orgId, policyId |
| `insurance_claims_org_idx` | no | orgId, branchId, status |

## `loan_contracts`

Auto-loan contracts — a financed principal at a rate over a term. The monthly instalment is a real amortised figure the server computes at origination (`rules/loans.ts`), stored as integer halalas. Read-only through the generic router; gated on `accounting`.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `contract_number` | varchar(40) | NOT NULL | — | — | — |
| `customer_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `borrower_name` | varchar(200) | NOT NULL | — | — | — |
| `principal_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `rate_bps` | integer | NOT NULL | — | 0 | — |
| `term_months` | integer | NOT NULL | — | — | — |
| `start_date` | date | NOT NULL | — | — | — |
| `status` | varchar(16) | NOT NULL | — | 'active' | — |
| `monthly_instalment_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |

| Index | Unique | Columns |
| --- | --- | --- |
| `loan_contracts_org_number_idx` | yes | orgId, contractNumber |
| `loan_contracts_org_idx` | no | orgId, branchId, status |

## `loan_repayments`

Loan repayments — the month-by-month schedule a contract's instalment implies. Money is integer halalas; the amounts sum to principal + interest across the schedule. Read-only through the generic router.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `loan_contract_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `contract_number` | varchar(40) | NOT NULL | — | — | — |
| `sequence` | integer | NOT NULL | — | — | — |
| `due_date` | date | NOT NULL | — | — | — |
| `amount_due_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `amount_paid_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `paid_date` | date | nullable | — | — | — |
| `status` | varchar(16) | NOT NULL | — | 'due' | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `loan_repayments_contract_idx` | no | orgId, loanContractId, sequence |

## `employees`

Employees — a member of staff who belongs to a department (the existing `departments` collection) and a branch. **Salary is sensitive**: the `Employee salary` field rule hides `salaryHalalas` from the roles it names, and the server nulls it on the way out (`GLOBAL_REDACTIONS`). Money is integer halalas. Gated on `hr`.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `employee_number` | varchar(40) | NOT NULL | — | — | — |
| `name` | varchar(200) | NOT NULL | — | — | — |
| `name_ar` | varchar(200) | nullable | — | — | — |
| `title` | varchar(160) | nullable | — | — | — |
| `department_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `hire_date` | date | nullable | — | — | — |
| `status` | varchar(16) | NOT NULL | — | 'active' | — |
| `salary_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |

| Index | Unique | Columns |
| --- | --- | --- |
| `employees_org_number_idx` | yes | orgId, employeeNumber |
| `employees_org_idx` | no | orgId, branchId, status |

## `payroll_runs`

Payroll runs — one calendar month. The totals (gross, allowances, deductions, net) are the column sums of the run's lines, computed by the server and **frozen when the run is posted**. A posted run cannot be reopened or edited (§5b invariant); the transition is the bespoke `/payroll/runs/:id/ post` route. Money is integer halalas. Gated on `hr`.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `period` | varchar(7) | NOT NULL | — | — | — |
| `status` | varchar(16) | NOT NULL | — | 'draft' | — |
| `gross_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `allowances_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `deductions_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `net_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `posted_at` | timestamptz | nullable | — | — | — |
| `posted_by` | varchar(ULID_LENGTH) | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `payroll_runs_org_period_idx` | yes | orgId, period |
| `payroll_runs_org_idx` | no | orgId, branchId, status |

## `payroll_lines`

Payroll lines — one employee's pay within a run. The net is computed by the server as `gross + allowances − deductions`, never sent by the client. Money is integer halalas; the run's totals are these summed. Gated on `hr`.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `payroll_run_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `employee_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `employee_name` | varchar(200) | NOT NULL | — | — | — |
| `gross_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `allowances_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `deductions_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `net_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |

| Index | Unique | Columns |
| --- | --- | --- |
| `payroll_lines_run_idx` | no | orgId, payrollRunId |

## `timesheets`

Timesheets — a day's clock-in/out or worked minutes for one employee. Worked minutes are stored as an integer, so no fractional-hour float. Gated on `hr`.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `employee_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `employee_name` | varchar(200) | NOT NULL | — | — | — |
| `work_date` | date | NOT NULL | — | — | — |
| `clock_in` | varchar(5) | nullable | — | — | — |
| `clock_out` | varchar(5) | nullable | — | — | — |
| `minutes` | integer | NOT NULL | — | 0 | — |
| `status` | varchar(16) | NOT NULL | — | 'submitted' | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `timesheets_employee_idx` | no | orgId, employeeId, workDate |

## `leave_requests`

Leave requests — a range of days an employee asks off. The approval (approve / reject) is the bespoke router, gated on the `hr` `a` grant and audited; the approver is recorded for segregation of duties. Gated on `hr`.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `employee_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `employee_name` | varchar(200) | NOT NULL | — | — | — |
| `type` | varchar(24) | NOT NULL | — | 'annual' | — |
| `start_date` | date | NOT NULL | — | — | — |
| `end_date` | date | NOT NULL | — | — | — |
| `days` | integer | NOT NULL | — | 1 | — |
| `status` | varchar(16) | NOT NULL | — | 'submitted' | — |
| `reason` | text | nullable | — | — | — |
| `approver_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `decided_at` | timestamptz | nullable | — | — | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `leave_requests_employee_idx` | no | orgId, employeeId, status |

## `obd_devices`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `code` | varchar(32) | NOT NULL | — | — | — |
| `bay` | varchar(32) | nullable | — | — | — |
| `vehicle_label` | varchar(160) | nullable | — | — | presentation string from the design bundle |
| `plate` | varchar(16) | nullable | — | — | — |
| `status` | varchar(24) | NOT NULL | — | — | — |
| `vin` | varchar(40) | nullable | — | — | — |
| `rpm` | integer | nullable | — | — | — |
| `coolant` | integer | nullable | — | — | — |
| `voltage` | double precision | nullable | — | — | — |
| `load` | integer | nullable | — | — | — |
| `dtc_count` | integer | NOT NULL | — | 0 | — |

## `obd_dtc_readings`

Per-device DTC readings (F-029). The device↔dtc link a re-scan or a clear-codes command records: which trouble codes a specific OBD device read, when, and whether the reading was a mock rather than a live scan. Real persisted data — the *command* is the external part, but the reading it produced is booked here so a diagnostic report can show a device's history even while the live bridge is an EXTERNAL_DEPENDENCY.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `device_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `device_code` | varchar(32) | nullable | — | — | — |
| `dtc_code` | varchar(16) | NOT NULL | — | — | — |
| `description` | varchar(300) | nullable | — | — | — |
| `severity` | varchar(16) | nullable | — | — | — |
| `source` | varchar(16) | NOT NULL | — | — | — |
| `cleared` | boolean | NOT NULL | — | false | — |
| `read_at` | timestamptz | NOT NULL | — | now() | — |
| `mock` | boolean | NOT NULL | — | false | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `obd_dtc_readings_device_idx` | no | orgId, deviceId |

## `dtc_codes`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `code` | varchar(16) | NOT NULL | — | — | — |
| `description` | varchar(300) | NOT NULL | — | — | — |
| `description_ar` | varchar(300) | nullable | — | — | — |
| `severity` | varchar(16) | NOT NULL | — | — | — |
| `system` | varchar(64) | nullable | — | — | — |
| `freeze_frame` | boolean | NOT NULL | — | false | — |

## `oem_tools`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `brand` | varchar(120) | NOT NULL | — | — | — |
| `tool` | varchar(120) | NOT NULL | — | — | — |
| `status` | varchar(24) | NOT NULL | — | — | — |
| `vehicle_count` | integer | NOT NULL | — | 0 | — |
| `protocol` | varchar(120) | nullable | — | — | — |
| `licence` | varchar(64) | nullable | — | — | — |
| `expires_on` | date | nullable | — | — | — |
| `expires_label` | varchar(32) | nullable | — | — | presentation string from the design bundle |

## `integrations`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(160) | NOT NULL | — | — | — |
| `name_ar` | varchar(160) | nullable | — | — | — |
| `category` | varchar(64) | nullable | — | — | — |
| `icon` | varchar(64) | nullable | — | — | — |
| `status` | varchar(24) | NOT NULL | — | — | — |
| `detail` | text | nullable | — | — | — |
| `detail_ar` | text | nullable | — | — | — |

## `kb_procedures`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `code` | varchar(32) | NOT NULL | — | — | — |
| `title` | varchar(300) | NOT NULL | — | — | — |
| `title_ar` | varchar(300) | nullable | — | — | — |
| `category` | varchar(64) | nullable | — | — | — |
| `make` | varchar(160) | nullable | — | — | — |
| `mins` | integer | nullable | — | — | — |
| `torque` | text | nullable | — | — | — |
| `torque_ar` | text | nullable | — | — | — |
| `steps` | integer | nullable | — | — | — |
| `views` | integer | nullable | — | — | — |
| `tsb` | boolean | NOT NULL | — | false | — |
| `media` | varchar(64) | nullable | — | — | — |

## `approval_lines`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `seq` | integer | NOT NULL | — | — | — |
| `item` | varchar(300) | NOT NULL | — | — | — |
| `item_ar` | varchar(300) | nullable | — | — | — |
| `qty` | double precision | NOT NULL | — | 1 | — |
| `unit_price_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `kind` | varchar(16) | nullable | — | — | — |
| `urgency` | varchar(16) | nullable | — | — | — |
| `note` | text | nullable | — | — | — |
| `note_ar` | text | nullable | — | — | — |

## `diag_stages`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `stage_key` | varchar(40) | NOT NULL | — | — | — |
| `role` | varchar(32) | nullable | — | — | — |
| `label` | varchar(160) | NOT NULL | — | — | — |
| `label_ar` | varchar(160) | nullable | — | — | — |
| `owner_name` | varchar(200) | nullable | — | — | — |
| `owner_name_ar` | varchar(200) | nullable | — | — | — |
| `at_label` | varchar(64) | nullable | — | — | presentation string from the design bundle |
| `action` | varchar(160) | nullable | — | — | — |
| `action_ar` | varchar(160) | nullable | — | — | — |
| `adds` | text | nullable | — | — | — |
| `adds_ar` | text | nullable | — | — | — |

## `diag_findings`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `dtc` | varchar(16) | nullable | — | — | — |
| `finding` | varchar(300) | NOT NULL | — | — | — |
| `finding_ar` | varchar(300) | nullable | — | — | — |
| `system` | varchar(64) | nullable | — | — | — |
| `system_ar` | varchar(64) | nullable | — | — | — |
| `severity` | varchar(16) | nullable | — | — | — |
| `evidence` | varchar(32) | nullable | — | — | — |

## `diag_parts`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `part_sku` | varchar(64) | NOT NULL | — | — | — |
| `description` | varchar(300) | NOT NULL | — | — | — |
| `description_ar` | varchar(300) | nullable | — | — | — |
| `qty` | double precision | NOT NULL | — | 1 | — |
| `price_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |
| `stock` | varchar(16) | nullable | — | — | — |
| `eta` | varchar(32) | nullable | — | — | — |

## `diag_labour`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `task` | varchar(300) | NOT NULL | — | — | — |
| `task_ar` | varchar(300) | nullable | — | — | — |
| `hours` | double precision | NOT NULL | — | 0 | — |
| `rate_halalas` | bigint | NOT NULL | — | 0 | money — integer halalas |

## `diag_copies`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `recipient` | varchar(120) | NOT NULL | — | — | — |
| `recipient_ar` | varchar(120) | nullable | — | — | — |
| `icon` | varchar(64) | nullable | — | — | — |
| `at_label` | varchar(64) | nullable | — | — | presentation string from the design bundle |
| `state` | varchar(24) | nullable | — | — | — |

## `ai_agents`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `name` | varchar(160) | NOT NULL | — | — | — |
| `role` | varchar(120) | nullable | — | — | — |
| `model` | varchar(120) | nullable | — | — | — |
| `status` | varchar(24) | NOT NULL | — | — | — |
| `tasks` | integer | NOT NULL | — | 0 | — |
| `success_rate_label` | varchar(16) | nullable | — | — | presentation string from the design bundle |
| `icon` | varchar(64) | nullable | — | — | — |

## `conversations`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `title` | varchar(300) | NOT NULL | — | — | — |
| `user_name` | varchar(200) | nullable | — | — | — |
| `message_count` | integer | NOT NULL | — | 0 | — |
| `conversation_date` | date | nullable | — | — | — |
| `tokens_label` | varchar(24) | nullable | — | — | presentation string from the design bundle |

## `garage_applications`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `legal_name` | varchar(200) | NOT NULL | — | — | — |
| `cr_number` | varchar(20) | nullable | — | — | — |
| `vat_number` | varchar(20) | nullable | — | — | — |
| `contact_name` | varchar(200) | NOT NULL | — | — | — |
| `phone` | varchar(32) | NOT NULL | — | — | — |
| `email` | varchar(254) | NOT NULL | — | — | — |
| `city` | varchar(120) | nullable | — | — | — |
| `plan_requested` | varchar(40) | nullable | — | — | — |
| `notes` | text | nullable | — | — | — |
| `status` | varchar(16) | NOT NULL | — | 'pending' | — |
| `reviewed_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `reviewed_at` | timestamptz | nullable | — | — | — |
| `rejection_reason` | text | nullable | — | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |

## `supplier_applications`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `company` | varchar(200) | NOT NULL | — | — | — |
| `cr_number` | varchar(20) | nullable | — | — | — |
| `vat_number` | varchar(20) | nullable | — | — | — |
| `contact_name` | varchar(200) | NOT NULL | — | — | — |
| `phone` | varchar(32) | NOT NULL | — | — | — |
| `email` | varchar(254) | NOT NULL | — | — | — |
| `categories` | jsonb | NOT NULL | — | [] | — |
| `regions` | jsonb | NOT NULL | — | [] | — |
| `status` | varchar(16) | NOT NULL | — | 'pending' | — |
| `reviewed_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `reviewed_at` | timestamptz | nullable | — | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |

## `subscription_requests`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `from_plan` | varchar(40) | NOT NULL | — | — | — |
| `to_plan` | varchar(40) | NOT NULL | — | — | — |
| `direction` | varchar(16) | NOT NULL | — | — | — |
| `reason` | text | nullable | — | — | — |
| `status` | varchar(16) | NOT NULL | — | 'pending' | — |
| `requested_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `reviewed_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `reviewed_at` | timestamptz | nullable | — | — | — |
| `effective_at` | timestamptz | nullable | — | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |

## `support_tickets`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | FK → organizations | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |
| `updated_at` | timestamptz | NOT NULL | — | now() | — |
| `created_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `updated_by` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `deleted_at` | timestamptz | nullable | — | — | — |
| `version` | integer | NOT NULL | — | 1 | — |
| `subject` | varchar(300) | NOT NULL | — | — | — |
| `body` | text | nullable | — | — | — |
| `priority` | varchar(16) | NOT NULL | — | 'low' | — |
| `status` | varchar(16) | NOT NULL | — | 'open' | — |
| `assigned_to` | varchar(ULID_LENGTH) | nullable | — | — | — |
| `thread` | jsonb | NOT NULL | — | [] | — |

## `system_health`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `ts` | timestamptz | NOT NULL | — | now() | — |
| `uptime_pct` | double precision | nullable | — | — | — |
| `queue_depth` | integer | nullable | — | — | — |
| `error_rate_pct` | double precision | nullable | — | — | — |
| `db_size_gb` | double precision | nullable | — | — | — |
| `active_sessions` | integer | nullable | — | — | — |
| `notes` | text | nullable | — | — | — |

## `otp_challenges`

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `channel` | varchar(8) | NOT NULL | — | — | — |
| `destination` | varchar(254) | NOT NULL | — | — | — |
| `code_hash` | text | NOT NULL | — | — | — |
| `expires_at` | timestamptz | NOT NULL | — | — | — |
| `attempts` | integer | NOT NULL | — | 0 | — |
| `verified_at` | timestamptz | nullable | — | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `otp_destination_idx` | no | destination, createdAt |

## `audit_log`

Append-only. A trigger refuses UPDATE and DELETE, so an application user cannot edit history even holding the application role.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `branch_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `actor_id` | varchar(ULID_LENGTH) | nullable | ref (no constraint) | — | — |
| `actor_role` | varchar(32) | nullable | — | — | — |
| `action` | varchar(40) | NOT NULL | — | — | — |
| `entity` | varchar(64) | NOT NULL | — | — | — |
| `entity_id` | varchar(64) | nullable | ref (no constraint) | — | — |
| `before` | jsonb | nullable | — | — | — |
| `after` | jsonb | nullable | — | — | — |
| `reason` | text | nullable | — | — | — |
| `source` | varchar(24) | NOT NULL | — | 'api' | — |
| `request_id` | varchar(64) | nullable | ref (no constraint) | — | — |
| `ip` | varchar(64) | nullable | — | — | — |
| `user_agent` | text | nullable | — | — | — |
| `ts` | timestamptz | NOT NULL | — | now() | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `audit_entity_idx` | no | orgId, entity, entityId |
| `audit_ts_idx` | no | orgId, ts |

## `idempotency_keys`

A replayed `Idempotency-Key` returns the stored response and creates no second business effect.

| Column | Type | Null | Key | Default | Notes |
| --- | --- | --- | --- | --- | --- |
| `id` | varchar(ULID_LENGTH) | nullable | PK | — | — |
| `org_id` | varchar(ULID_LENGTH) | NOT NULL | ref (no constraint) | — | — |
| `key` | varchar(128) | NOT NULL | — | — | — |
| `endpoint` | varchar(160) | NOT NULL | — | — | — |
| `request_hash` | varchar(64) | NOT NULL | — | — | — |
| `response_status` | integer | NOT NULL | — | — | — |
| `response_body` | jsonb | nullable | — | — | — |
| `created_at` | timestamptz | NOT NULL | — | now() | — |

| Index | Unique | Columns |
| --- | --- | --- |
| `idempotency_org_key_idx` | yes | orgId, key, endpoint |
