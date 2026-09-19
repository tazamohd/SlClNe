<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# Entity catalogue

**Status:** GENERATED · **Source of truth:** `server/src/db/schema.ts` · **Sources as of:** 2026-09-19

76 tables. 71 are tenant-scoped (carry `org_id`) and 72 have row-level security enabled and forced.

## Conventions the schema holds everywhere

- **Identifiers** are ULIDs in `varchar(26)`. `char` would blank-pad and make an identifier of the wrong length compare unequal — a bug that surfaces as an authorization check silently failing.
- **Money is an integer count of halalas** in a `bigint` column named `*_halalas`. No `numeric`, so a rounding surprise cannot reach a ledger.
- **`org_id` on every tenant-owned table**, because row-level security anchors on it. Isolation does not depend on a `WHERE` clause someone remembered to write.
- **`*_label` columns** hold a presentation string the design bundle carried where it had no machine value (`"2 weeks ago"`). Where a machine value exists it sits beside them.
- **`version`** is incremented by a database trigger, not by the statement, so a hand-written `UPDATE` cannot leave a stale version behind.

## Catalogue

| Entity | Table | Cols | Tenant | Branch | Soft delete | Versioned | Audited | RLS | Money columns | Endpoints |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ENT-ORGANIZATIONS | `organizations` | 12 | no | no | yes | yes | no | yes | — | 0 |
| ENT-BRANCHES | `branches` | 13 | yes | yes | yes | yes | yes | yes | — | 3 |
| ENT-USERS | `users` | 18 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-USER-SESSIONS | `user_sessions` | 17 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-FLEETS | `fleets` | 21 | yes | yes | yes | yes | yes | yes | 1 | 8 |
| ENT-CUSTOMERS | `customers` | 19 | yes | yes | yes | yes | yes | yes | 1 | 8 |
| ENT-VEHICLES | `vehicles` | 18 | yes | yes | yes | yes | yes | yes | — | 8 |
| ENT-SERVICES | `services` | 11 | yes | yes | yes | yes | yes | yes | — | 3 |
| ENT-JOB-CARDS | `job_cards` | 22 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-APPOINTMENTS | `appointments` | 23 | yes | yes | yes | yes | yes | yes | — | 8 |
| ENT-ESTIMATES | `estimates` | 28 | yes | yes | yes | yes | yes | yes | 4 | 3 |
| ENT-ESTIMATE-LINES | `estimate_lines` | 17 | yes | yes | yes | yes | yes | yes | 1 | 0 |
| ENT-DECLINED-JOBS | `declined_jobs` | 27 | yes | yes | yes | yes | yes | yes | 1 | 0 |
| ENT-INSPECTION-FINDINGS | `inspection_findings` | 19 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-INSPECTION-MEDIA | `inspection_media` | 18 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-DELIVERY-SIGNOFFS | `delivery_signoffs` | 17 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-CANNED-JOBS | `canned_jobs` | 16 | yes | yes | yes | yes | yes | yes | 1 | 0 |
| ENT-CANNED-JOB-LINES | `canned_job_lines` | 17 | yes | yes | yes | yes | yes | yes | 1 | 0 |
| ENT-INVOICES | `invoices` | 29 | yes | yes | yes | yes | yes | yes | 5 | 3 |
| ENT-INVOICE-LINES | `invoice_lines` | 17 | yes | yes | yes | yes | yes | yes | 1 | 0 |
| ENT-PAYMENTS | `payments` | 16 | yes | yes | yes | yes | yes | yes | 1 | 3 |
| ENT-RECEIPTS | `receipts` | 16 | yes | yes | yes | yes | yes | yes | 1 | 3 |
| ENT-PARTS | `parts` | 17 | yes | yes | yes | yes | yes | yes | 2 | 8 |
| ENT-INVENTORY-MOVEMENTS | `inventory_movements` | 17 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-SUPPLIERS | `suppliers` | 17 | yes | yes | yes | yes | yes | yes | — | 8 |
| ENT-REQUISITIONS | `requisitions` | 20 | yes | yes | yes | yes | yes | yes | 1 | 3 |
| ENT-REQUISITION-LINES | `requisition_lines` | 16 | yes | yes | yes | yes | yes | yes | 1 | 0 |
| ENT-PURCHASE-ORDERS | `purchase_orders` | 23 | yes | yes | yes | yes | yes | yes | 3 | 0 |
| ENT-PURCHASE-ORDER-LINES | `purchase_order_lines` | 17 | yes | yes | yes | yes | yes | yes | 1 | 0 |
| ENT-TECHNICIANS | `technicians` | 14 | yes | yes | yes | yes | yes | yes | — | 3 |
| ENT-DEPARTMENTS | `departments` | 15 | yes | yes | yes | yes | yes | yes | — | 3 |
| ENT-LEADS | `leads` | 17 | yes | yes | yes | yes | yes | yes | 1 | 8 |
| ENT-OPPORTUNITIES | `opportunities` | 16 | yes | yes | yes | yes | yes | yes | 1 | 8 |
| ENT-CAMPAIGNS | `campaigns` | 22 | yes | yes | yes | yes | yes | yes | 2 | 8 |
| ENT-SEGMENTS | `segments` | 13 | yes | yes | yes | yes | yes | yes | — | 3 |
| ENT-CRM-TASKS | `crm_tasks` | 15 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-PUBLIC-LEADS | `public_leads` | 16 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-CUSTOMER-FEEDBACK | `customer_feedback` | 14 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-CHART-OF-ACCOUNTS | `chart_of_accounts` | 15 | yes | yes | yes | yes | yes | yes | 1 | 0 |
| ENT-JOURNAL-ENTRIES | `journal_entries` | 18 | yes | yes | yes | yes | yes | yes | 2 | 0 |
| ENT-JOURNAL-LINES | `journal_lines` | 16 | yes | yes | yes | yes | yes | yes | 2 | 0 |
| ENT-EXPENSES | `expenses` | 15 | yes | yes | yes | yes | yes | yes | 1 | 3 |
| ENT-BANK-STATEMENTS | `bank_statements` | 18 | yes | yes | yes | yes | yes | yes | 1 | 0 |
| ENT-SAVED-REPORTS | `saved_reports` | 13 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-INSURANCE-POLICIES | `insurance_policies` | 21 | yes | yes | yes | yes | yes | yes | 2 | 0 |
| ENT-INSURANCE-CLAIMS | `insurance_claims` | 24 | yes | yes | yes | yes | yes | yes | 2 | 0 |
| ENT-LOAN-CONTRACTS | `loan_contracts` | 18 | yes | yes | yes | yes | yes | yes | 2 | 0 |
| ENT-LOAN-REPAYMENTS | `loan_repayments` | 17 | yes | yes | yes | yes | yes | yes | 2 | 0 |
| ENT-EQUIPMENT-WARRANTIES | `equipment_warranties` | 19 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-EMPLOYEES | `employees` | 17 | yes | yes | yes | yes | yes | yes | 1 | 8 |
| ENT-PAYROLL-RUNS | `payroll_runs` | 17 | yes | yes | yes | yes | yes | yes | 4 | 0 |
| ENT-PAYROLL-LINES | `payroll_lines` | 16 | yes | yes | yes | yes | yes | yes | 4 | 0 |
| ENT-TIMESHEETS | `timesheets` | 16 | yes | yes | yes | yes | yes | yes | — | 8 |
| ENT-LEAVE-REQUESTS | `leave_requests` | 19 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-OBD-DEVICES | `obd_devices` | 20 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-OBD-DTC-READINGS | `obd_dtc_readings` | 18 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-DTC-CODES | `dtc_codes` | 15 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-OEM-TOOLS | `oem_tools` | 17 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-INTEGRATIONS | `integrations` | 16 | yes | yes | yes | yes | yes | yes | — | 3 |
| ENT-KB-PROCEDURES | `kb_procedures` | 21 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-APPROVAL-LINES | `approval_lines` | 18 | yes | yes | yes | yes | yes | yes | 1 | 0 |
| ENT-DIAG-STAGES | `diag_stages` | 20 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-DIAG-FINDINGS | `diag_findings` | 16 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-DIAG-PARTS | `diag_parts` | 16 | yes | yes | yes | yes | yes | yes | 1 | 0 |
| ENT-DIAG-LABOUR | `diag_labour` | 13 | yes | yes | yes | yes | yes | yes | 1 | 0 |
| ENT-DIAG-COPIES | `diag_copies` | 14 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-AI-AGENTS | `ai_agents` | 16 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-CONVERSATIONS | `conversations` | 14 | yes | yes | yes | yes | yes | yes | — | 3 |
| ENT-GARAGE-APPLICATIONS | `garage_applications` | 15 | no | no | no | no | no | **no** | — | 0 |
| ENT-SUPPLIER-APPLICATIONS | `supplier_applications` | 13 | no | no | no | no | no | **no** | — | 0 |
| ENT-SUBSCRIPTION-REQUESTS | `subscription_requests` | 12 | yes | no | no | no | no | yes | — | 0 |
| ENT-SUPPORT-TICKETS | `support_tickets` | 15 | yes | yes | yes | yes | yes | yes | — | 0 |
| ENT-SYSTEM-HEALTH | `system_health` | 8 | no | no | no | no | no | **no** | — | 0 |
| ENT-OTP-CHALLENGES | `otp_challenges` | 8 | no | no | no | no | no | **no** | — | 0 |
| ENT-AUDIT-LOG | `audit_log` | 16 | yes | yes | no | no | no | yes | — | 0 |
| ENT-IDEMPOTENCY-KEYS | `idempotency_keys` | 8 | yes | no | no | no | no | yes | — | 0 |

## Tables without full universal-column coverage

Not a defect in every case — `dtc_codes` is a reference table and has no tenant — but each one is a place where an assumption that holds elsewhere does not hold.

| Table | Missing universal columns |
| --- | --- |
| `organizations` | `org_id`, `branch_id`, `created_by`, `updated_by` |
| `garage_applications` | `org_id`, `branch_id`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `version` |
| `supplier_applications` | `org_id`, `branch_id`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `version` |
| `subscription_requests` | `branch_id`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `version` |
| `system_health` | `org_id`, `branch_id`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `version` |
| `otp_challenges` | `org_id`, `branch_id`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `version` |
| `audit_log` | `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `version` |
| `idempotency_keys` | `branch_id`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `version` |
