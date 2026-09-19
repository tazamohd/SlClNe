<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/architecture.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# Database design

**Status:** GENERATED · **Sources as of:** 2026-09-19

PostgreSQL, accessed through Drizzle ORM. 82 tables, 1417 columns, 27 migrations.

## Migrations

| Migration | Adds |
| --- | --- |
| `server/drizzle/0000_init.sql` | Initial schema |
| `server/drizzle/0000_lonely_black_widow.sql` | Initial schema (drizzle-kit generated) |
| `server/drizzle/0001_rls.sql` | Row-level security, version trigger, audit immutability |
| `server/drizzle/0002_own_scope_tech.sql` | Own-scope policy for technicians |
| `server/drizzle/0003_transfer_pair_branches.sql` | Branch pairing for inventory transfers |
| `server/drizzle/0004_crm_fleet_feedback.sql` | CRM, fleet and customer feedback |
| `server/drizzle/0005_bank_statements_saved_reports.sql` | Bank statements and saved reports |
| `server/drizzle/0006_obd_dtc_readings.sql` | OBD diagnostic trouble code readings |
| `server/drizzle/0007_insurance.sql` | Insurance policies and claims |
| `server/drizzle/0008_loans.sql` | Loan contracts and repayments |
| `server/drizzle/0009_hr.sql` | HR, payroll, timesheets, leave |
| `server/drizzle/0010_procurement.sql` | Requisitions and purchase orders |
| `server/drizzle/0011_audit_log_statement_immutability.sql` | Audit log append-only enforcement |
| `server/drizzle/0012_snapshot_realign.sql` | Drizzle snapshot realignment |
| `server/drizzle/0013_users_acting_role.sql` | Acting-role support for role switching |
| `server/drizzle/0014_customer_id_link.sql` | Customer link giving the `self` scope something to narrow by |
| `server/drizzle/0015_journal_lines.sql` | — |
| `server/drizzle/0016_document_chain.sql` | — |
| `server/drizzle/0017_declined_jobs.sql` | — |
| `server/drizzle/0018_inspection_findings.sql` | — |
| `server/drizzle/0019_delivery_signoff.sql` | — |
| `server/drizzle/0020_canned_jobs.sql` | — |
| `server/drizzle/0021_campaign_messaging.sql` | — |
| `server/drizzle/0022_equipment_warranties.sql` | — |
| `server/drizzle/0023_notifications.sql` | — |
| `server/drizzle/0024_parts_network.sql` | — |
| `server/drizzle/0025_warehouse_zones.sql` | — |

## Structural guarantees

| Guarantee | Mechanism | Coverage |
| --- | --- | --- |
| Tenant isolation | RLS policy `p_tenant` on `org_id`, PERMISSIVE | 78 tables |
| Branch narrowing | RLS policy `r_branch`, RESTRICTIVE so it is AND-ed | 78 tables |
| Row ownership | RLS policy `r_own` for the own/self/assigned scopes | 11 tables |
| Owner cannot bypass | `FORCE ROW LEVEL SECURITY` | 78 tables |
| Optimistic concurrency | `bump_version` BEFORE UPDATE trigger | every table in the tenant array |
| Audit immutability | Trigger raising `insufficient_privilege` on UPDATE/DELETE | `audit_log` |
| Idempotency | Unique index on `(org_id, key, endpoint)` + stored response | `idempotency_keys` |
| Soft delete | `deleted_at`, filtered by the generic router | 75 tables |
| Money integrity | `bigint` halalas, never `numeric` | 36 tables carry money |

## Referential integrity — read this before drawing conclusions from an ERD

Only **76 of 207** relationships are backed by a database foreign key, and those are almost entirely `org_id`. The remaining 131 are `*_id` columns with no constraint. Integrity for those is the application's job, and there is no cascade.

The practical consequences: an orphaned reference is possible and will not be refused by the database; deleting a parent does not clean up children (though deletes are soft anyway); and a join that assumes a row exists needs to handle its absence.

## Indexes

| Table | Index | Unique | Columns |
| --- | --- | --- | --- |
| `branches` | `branches_org_idx` | no | orgId |
| `users` | `users_org_email_idx` | yes | orgId, email |
| `users` | `users_customer_idx` | no | orgId, customerId |
| `user_sessions` | `user_sessions_user_idx` | no | orgId, userId |
| `fleets` | `fleets_org_idx` | no | orgId |
| `customers` | `customers_org_idx` | no | orgId, branchId |
| `customers` | `customers_org_phone_idx` | yes | orgId, phone |
| `vehicles` | `vehicles_org_idx` | no | orgId, branchId |
| `vehicles` | `vehicles_org_plate_idx` | yes | orgId, plate |
| `vehicles` | `vehicles_org_vin_idx` | yes | orgId, vin |
| `job_cards` | `job_cards_org_code_idx` | yes | orgId, code |
| `job_cards` | `job_cards_org_idx` | no | orgId, branchId, status |
| `job_cards` | `job_cards_tech_idx` | no | orgId, assignedTechId |
| `job_cards` | `job_cards_appointment_idx` | no | orgId, appointmentId |
| `appointments` | `appointments_date_idx` | no | orgId, branchId, scheduledDate |
| `appointments` | `appointments_bay_idx` | no | orgId, scheduledDate, bay |
| `estimates` | `estimates_org_code_idx` | yes | orgId, code |
| `estimates` | `estimates_org_idx` | no | orgId, branchId, status |
| `estimate_lines` | `estimate_lines_estimate_idx` | no | orgId, estimateId |
| `declined_jobs` | `declined_jobs_org_idx` | no | orgId, branchId, status |
| `declined_jobs` | `declined_jobs_estimate_idx` | no | orgId, estimateId |
| `declined_jobs` | `declined_jobs_line_once_idx` | yes | orgId, estimateLineId |
| `inspection_findings` | `inspection_findings_job_idx` | no | orgId, jobCardId |
| `inspection_media` | `inspection_media_finding_idx` | no | orgId, findingId |
| `inspection_media` | `inspection_media_job_idx` | no | orgId, jobCardId |
| `delivery_signoffs` | `delivery_signoffs_job_idx` | no | orgId, jobCardId |
| `canned_jobs` | `canned_jobs_org_idx` | no | orgId, branchId, active |
| `canned_job_lines` | `canned_job_lines_job_idx` | no | orgId, cannedJobId |
| `invoices` | `invoices_org_code_idx` | yes | orgId, code |
| `invoices` | `invoices_org_idx` | no | orgId, branchId, status |
| `invoices` | `invoices_estimate_idx` | no | orgId, estimateId |
| `invoice_lines` | `invoice_lines_invoice_idx` | no | orgId, invoiceId |
| `payments` | `payments_invoice_idx` | no | orgId, invoiceId |
| `receipts` | `receipts_org_code_idx` | yes | orgId, code |
| `parts` | `parts_org_sku_idx` | yes | orgId, sku |
| `parts` | `parts_org_idx` | no | orgId, branchId |
| `parts` | `parts_org_zone_idx` | no | orgId, zoneCode |
| `inventory_movements` | `inventory_movements_part_idx` | no | orgId, partId |
| `suppliers` | `suppliers_org_code_idx` | yes | orgId, code |
| `suppliers` | `suppliers_org_idx` | no | orgId, branchId, status |
| `requisitions` | `requisitions_org_code_idx` | yes | orgId, code |
| `requisitions` | `requisitions_org_idx` | no | orgId, branchId, status |
| `requisition_lines` | `requisition_lines_req_idx` | no | orgId, requisitionId |
| `purchase_orders` | `purchase_orders_org_code_idx` | yes | orgId, code |
| `purchase_orders` | `purchase_orders_org_idx` | no | orgId, branchId, status |
| `purchase_order_lines` | `po_lines_po_idx` | no | orgId, purchaseOrderId |
| `technicians` | `technicians_org_idx` | no | orgId, branchId |
| `leads` | `leads_stage_idx` | no | orgId, stage |
| `public_leads` | `public_leads_org_idx` | no | orgId, status |
| `customer_feedback` | `customer_feedback_org_idx` | no | orgId, branchId |
| `chart_of_accounts` | `coa_org_code_idx` | yes | orgId, code |
| `journal_entries` | `journal_org_code_idx` | yes | orgId, code |
| `journal_entries` | `journal_entries_source_idx` | no | orgId, source, sourceId |
| `journal_lines` | `journal_lines_entry_idx` | no | orgId, journalEntryId |
| `journal_lines` | `journal_lines_account_idx` | no | orgId, accountId |
| `expenses` | `expenses_org_code_idx` | yes | orgId, code |
| `bank_statements` | `bank_statements_org_idx` | no | orgId, matched |
| `saved_reports` | `saved_reports_org_idx` | no | orgId, createdBy |
| `insurance_policies` | `insurance_policies_org_number_idx` | yes | orgId, policyNumber |
| `insurance_policies` | `insurance_policies_org_idx` | no | orgId, branchId, status |
| `insurance_claims` | `insurance_claims_org_number_idx` | yes | orgId, claimNumber |
| `insurance_claims` | `insurance_claims_policy_idx` | no | orgId, policyId |
| `insurance_claims` | `insurance_claims_org_idx` | no | orgId, branchId, status |
| `loan_contracts` | `loan_contracts_org_number_idx` | yes | orgId, contractNumber |
| `loan_contracts` | `loan_contracts_org_idx` | no | orgId, branchId, status |
| `loan_repayments` | `loan_repayments_contract_idx` | no | orgId, loanContractId, sequence |
| `equipment_warranties` | `equipment_warranties_org_number_idx` | yes | orgId, warrantyNumber |
| `equipment_warranties` | `equipment_warranties_org_idx` | no | orgId, branchId, status |
| `warehouse_zones` | `warehouse_zones_org_code_idx` | yes | orgId, code |
| `warehouse_zones` | `warehouse_zones_org_idx` | no | orgId, branchId, status |
| `notifications` | `notifications_org_idx` | no | orgId, branchId, readAt |
| `notifications` | `notifications_org_created_idx` | no | orgId, createdAt |
| `parts_network_members` | `parts_network_members_org_code_idx` | yes | orgId, code |
| `parts_network_members` | `parts_network_members_org_idx` | no | orgId, branchId, status |
| `parts_network_requests` | `parts_network_requests_org_code_idx` | yes | orgId, code |
| `parts_network_requests` | `parts_network_requests_org_idx` | no | orgId, branchId, direction, status |
| `parts_network_quotations` | `parts_network_quotations_org_code_idx` | yes | orgId, code |
| `parts_network_quotations` | `parts_network_quotations_request_idx` | no | orgId, requestId, status |
| `parts_network_orders` | `parts_network_orders_org_code_idx` | yes | orgId, code |
| `parts_network_orders` | `parts_network_orders_org_idx` | no | orgId, branchId, direction, status |
| `employees` | `employees_org_number_idx` | yes | orgId, employeeNumber |
| `employees` | `employees_org_idx` | no | orgId, branchId, status |
| `payroll_runs` | `payroll_runs_org_period_idx` | yes | orgId, period |
| `payroll_runs` | `payroll_runs_org_idx` | no | orgId, branchId, status |
| `payroll_lines` | `payroll_lines_run_idx` | no | orgId, payrollRunId |
| `timesheets` | `timesheets_employee_idx` | no | orgId, employeeId, workDate |
| `leave_requests` | `leave_requests_employee_idx` | no | orgId, employeeId, status |
| `obd_dtc_readings` | `obd_dtc_readings_device_idx` | no | orgId, deviceId |
| `otp_challenges` | `otp_destination_idx` | no | destination, createdAt |
| `audit_log` | `audit_entity_idx` | no | orgId, entity, entityId |
| `audit_log` | `audit_ts_idx` | no | orgId, ts |
| `idempotency_keys` | `idempotency_org_key_idx` | yes | orgId, key, endpoint |
