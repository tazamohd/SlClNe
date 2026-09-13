<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# Relationship catalogue

**Status:** GENERATED · **Source of truth:** `server/src/db/schema.ts` · **Generated:** 2026-09-13

## The one thing to read first

Of 164 relationships in the model, **61 are backed by a database foreign key** and **103 are not**. The declared ones are almost entirely `org_id` — the tenancy anchor, spread into every tenant-owned table. Every other association between business entities is a `*_id` column with no constraint behind it.

Referential integrity for those rests on application code and on row-level security, not on the database. That is a deliberate architectural position and it has consequences a reader needs to know about: an orphaned `customer_id` is possible, a cascade is not automatic, and a `DELETE` is a soft delete anyway. It is recorded here rather than smoothed over, because an ERD that draws all 164 lines identically implies a guarantee that 103 of them do not carry.

## Catalogue

| ID | From | Column | To | Cardinality | Optionality | Enforcement | Indexed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| REL-BRANCHES-ORG-ID | `branches` | `org_id` | `organizations` | one-to-many | mandatory | DECLARED (FK) | yes |
| REL-BRANCHES-BRANCH-ID | `branches` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-USERS-ORG-ID | `users` | `org_id` | `organizations` | one-to-many | mandatory | DECLARED (FK) | yes |
| REL-USERS-BRANCH-ID | `users` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-USERS-CUSTOMER-ID | `users` | `customer_id` | `customers` | many-to-one | optional | **INFERRED** | yes |
| REL-USER-SESSIONS-ORG-ID | `user_sessions` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-USER-SESSIONS-BRANCH-ID | `user_sessions` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-USER-SESSIONS-USER-ID | `user_sessions` | `user_id` | `users` | many-to-one | mandatory | **INFERRED** | yes |
| REL-FLEETS-ORG-ID | `fleets` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-FLEETS-BRANCH-ID | `fleets` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-CUSTOMERS-ORG-ID | `customers` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-CUSTOMERS-BRANCH-ID | `customers` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-CUSTOMERS-FLEET-ID | `customers` | `fleet_id` | `fleets` | many-to-one | optional | **INFERRED** | no |
| REL-VEHICLES-ORG-ID | `vehicles` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-VEHICLES-BRANCH-ID | `vehicles` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-VEHICLES-CUSTOMER-ID | `vehicles` | `customer_id` | `customers` | one-to-many | optional | **INFERRED** | no |
| REL-SERVICES-ORG-ID | `services` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-SERVICES-BRANCH-ID | `services` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-JOB-CARDS-ORG-ID | `job_cards` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-JOB-CARDS-BRANCH-ID | `job_cards` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-JOB-CARDS-CUSTOMER-ID | `job_cards` | `customer_id` | `customers` | many-to-one | optional | **INFERRED** | no |
| REL-JOB-CARDS-VEHICLE-ID | `job_cards` | `vehicle_id` | `vehicles` | many-to-one | optional | **INFERRED** | no |
| REL-JOB-CARDS-ASSIGNED-TECH-ID | `job_cards` | `assigned_tech_id` | `technicians` | many-to-one | optional | **INFERRED** | yes |
| REL-APPOINTMENTS-ORG-ID | `appointments` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-APPOINTMENTS-BRANCH-ID | `appointments` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-APPOINTMENTS-CUSTOMER-ID | `appointments` | `customer_id` | `customers` | many-to-one | optional | **INFERRED** | no |
| REL-APPOINTMENTS-VEHICLE-ID | `appointments` | `vehicle_id` | `vehicles` | many-to-one | optional | **INFERRED** | no |
| REL-APPOINTMENTS-TECHNICIAN-ID | `appointments` | `technician_id` | `technicians` | many-to-one | optional | **INFERRED** | no |
| REL-ESTIMATES-ORG-ID | `estimates` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-ESTIMATES-BRANCH-ID | `estimates` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-ESTIMATES-JOB-CARD-ID | `estimates` | `job_card_id` | `job_cards` | many-to-one | optional | **INFERRED** | no |
| REL-ESTIMATES-CUSTOMER-ID | `estimates` | `customer_id` | `customers` | many-to-one | optional | **INFERRED** | no |
| REL-ESTIMATES-VEHICLE-ID | `estimates` | `vehicle_id` | `vehicles` | many-to-one | optional | **INFERRED** | no |
| REL-ESTIMATE-LINES-ORG-ID | `estimate_lines` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-ESTIMATE-LINES-BRANCH-ID | `estimate_lines` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-ESTIMATE-LINES-ESTIMATE-ID | `estimate_lines` | `estimate_id` | `estimates` | one-to-many | mandatory | **INFERRED** | yes |
| REL-INVOICES-ORG-ID | `invoices` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-INVOICES-BRANCH-ID | `invoices` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-INVOICES-CUSTOMER-ID | `invoices` | `customer_id` | `customers` | many-to-one | optional | **INFERRED** | no |
| REL-INVOICES-JOB-CARD-ID | `invoices` | `job_card_id` | `job_cards` | many-to-one | optional | **INFERRED** | no |
| REL-INVOICES-VEHICLE-ID | `invoices` | `vehicle_id` | `vehicles` | many-to-one | optional | **INFERRED** | no |
| REL-INVOICE-LINES-ORG-ID | `invoice_lines` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-INVOICE-LINES-BRANCH-ID | `invoice_lines` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-INVOICE-LINES-INVOICE-ID | `invoice_lines` | `invoice_id` | `invoices` | one-to-many | mandatory | **INFERRED** | yes |
| REL-PAYMENTS-ORG-ID | `payments` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-PAYMENTS-BRANCH-ID | `payments` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-PAYMENTS-INVOICE-ID | `payments` | `invoice_id` | `invoices` | one-to-many | optional | **INFERRED** | yes |
| REL-RECEIPTS-ORG-ID | `receipts` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-RECEIPTS-BRANCH-ID | `receipts` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-PARTS-ORG-ID | `parts` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-PARTS-BRANCH-ID | `parts` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-INVENTORY-MOVEMENTS-ORG-ID | `inventory_movements` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-INVENTORY-MOVEMENTS-BRANCH-ID | `inventory_movements` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-INVENTORY-MOVEMENTS-PART-ID | `inventory_movements` | `part_id` | `parts` | many-to-one | mandatory | **INFERRED** | yes |
| REL-SUPPLIERS-ORG-ID | `suppliers` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-SUPPLIERS-BRANCH-ID | `suppliers` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-REQUISITIONS-ORG-ID | `requisitions` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-REQUISITIONS-BRANCH-ID | `requisitions` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-REQUISITION-LINES-ORG-ID | `requisition_lines` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-REQUISITION-LINES-BRANCH-ID | `requisition_lines` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-REQUISITION-LINES-REQUISITION-ID | `requisition_lines` | `requisition_id` | `requisitions` | one-to-many | mandatory | **INFERRED** | yes |
| REL-PURCHASE-ORDERS-ORG-ID | `purchase_orders` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-PURCHASE-ORDERS-BRANCH-ID | `purchase_orders` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-PURCHASE-ORDERS-SUPPLIER-ID | `purchase_orders` | `supplier_id` | `suppliers` | many-to-one | optional | **INFERRED** | no |
| REL-PURCHASE-ORDERS-REQUISITION-ID | `purchase_orders` | `requisition_id` | `requisitions` | many-to-one | optional | **INFERRED** | no |
| REL-PURCHASE-ORDER-LINES-ORG-ID | `purchase_order_lines` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-PURCHASE-ORDER-LINES-BRANCH-ID | `purchase_order_lines` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-PURCHASE-ORDER-LINES-PURCHASE-ORDER-ID | `purchase_order_lines` | `purchase_order_id` | `purchase_orders` | one-to-many | mandatory | **INFERRED** | yes |
| REL-TECHNICIANS-ORG-ID | `technicians` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-TECHNICIANS-BRANCH-ID | `technicians` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-TECHNICIANS-USER-ID | `technicians` | `user_id` | `users` | many-to-one | optional | **INFERRED** | no |
| REL-DEPARTMENTS-ORG-ID | `departments` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-DEPARTMENTS-BRANCH-ID | `departments` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-LEADS-ORG-ID | `leads` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-LEADS-BRANCH-ID | `leads` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-OPPORTUNITIES-ORG-ID | `opportunities` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-OPPORTUNITIES-BRANCH-ID | `opportunities` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-CAMPAIGNS-ORG-ID | `campaigns` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-CAMPAIGNS-BRANCH-ID | `campaigns` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-SEGMENTS-ORG-ID | `segments` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-SEGMENTS-BRANCH-ID | `segments` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-CRM-TASKS-ORG-ID | `crm_tasks` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-CRM-TASKS-BRANCH-ID | `crm_tasks` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-PUBLIC-LEADS-ORG-ID | `public_leads` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-PUBLIC-LEADS-BRANCH-ID | `public_leads` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-CUSTOMER-FEEDBACK-ORG-ID | `customer_feedback` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-CUSTOMER-FEEDBACK-BRANCH-ID | `customer_feedback` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-CUSTOMER-FEEDBACK-JOB-CARD-ID | `customer_feedback` | `job_card_id` | `job_cards` | many-to-one | optional | **INFERRED** | no |
| REL-CUSTOMER-FEEDBACK-CUSTOMER-ID | `customer_feedback` | `customer_id` | `customers` | many-to-one | optional | **INFERRED** | no |
| REL-CHART-OF-ACCOUNTS-ORG-ID | `chart_of_accounts` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-CHART-OF-ACCOUNTS-BRANCH-ID | `chart_of_accounts` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-JOURNAL-ENTRIES-ORG-ID | `journal_entries` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-JOURNAL-ENTRIES-BRANCH-ID | `journal_entries` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-EXPENSES-ORG-ID | `expenses` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-EXPENSES-BRANCH-ID | `expenses` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-BANK-STATEMENTS-ORG-ID | `bank_statements` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-BANK-STATEMENTS-BRANCH-ID | `bank_statements` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-SAVED-REPORTS-ORG-ID | `saved_reports` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-SAVED-REPORTS-BRANCH-ID | `saved_reports` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-INSURANCE-POLICIES-ORG-ID | `insurance_policies` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-INSURANCE-POLICIES-BRANCH-ID | `insurance_policies` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-INSURANCE-POLICIES-CUSTOMER-ID | `insurance_policies` | `customer_id` | `customers` | many-to-one | optional | **INFERRED** | no |
| REL-INSURANCE-POLICIES-VEHICLE-ID | `insurance_policies` | `vehicle_id` | `vehicles` | many-to-one | optional | **INFERRED** | no |
| REL-INSURANCE-CLAIMS-ORG-ID | `insurance_claims` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-INSURANCE-CLAIMS-BRANCH-ID | `insurance_claims` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-INSURANCE-CLAIMS-POLICY-ID | `insurance_claims` | `policy_id` | `insurance_policies` | many-to-one | optional | **INFERRED** | yes |
| REL-INSURANCE-CLAIMS-VEHICLE-ID | `insurance_claims` | `vehicle_id` | `vehicles` | many-to-one | optional | **INFERRED** | no |
| REL-INSURANCE-CLAIMS-JOB-CARD-ID | `insurance_claims` | `job_card_id` | `job_cards` | many-to-one | optional | **INFERRED** | no |
| REL-LOAN-CONTRACTS-ORG-ID | `loan_contracts` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-LOAN-CONTRACTS-BRANCH-ID | `loan_contracts` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-LOAN-CONTRACTS-CUSTOMER-ID | `loan_contracts` | `customer_id` | `customers` | many-to-one | optional | **INFERRED** | no |
| REL-LOAN-REPAYMENTS-ORG-ID | `loan_repayments` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-LOAN-REPAYMENTS-BRANCH-ID | `loan_repayments` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-LOAN-REPAYMENTS-LOAN-CONTRACT-ID | `loan_repayments` | `loan_contract_id` | `loan_contracts` | many-to-one | mandatory | **INFERRED** | yes |
| REL-EMPLOYEES-ORG-ID | `employees` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-EMPLOYEES-BRANCH-ID | `employees` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-EMPLOYEES-DEPARTMENT-ID | `employees` | `department_id` | `departments` | many-to-one | optional | **INFERRED** | no |
| REL-PAYROLL-RUNS-ORG-ID | `payroll_runs` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-PAYROLL-RUNS-BRANCH-ID | `payroll_runs` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | yes |
| REL-PAYROLL-LINES-ORG-ID | `payroll_lines` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-PAYROLL-LINES-BRANCH-ID | `payroll_lines` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-PAYROLL-LINES-PAYROLL-RUN-ID | `payroll_lines` | `payroll_run_id` | `payroll_runs` | many-to-one | mandatory | **INFERRED** | yes |
| REL-PAYROLL-LINES-EMPLOYEE-ID | `payroll_lines` | `employee_id` | `employees` | many-to-one | mandatory | **INFERRED** | no |
| REL-TIMESHEETS-ORG-ID | `timesheets` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-TIMESHEETS-BRANCH-ID | `timesheets` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-TIMESHEETS-EMPLOYEE-ID | `timesheets` | `employee_id` | `employees` | many-to-one | mandatory | **INFERRED** | yes |
| REL-LEAVE-REQUESTS-ORG-ID | `leave_requests` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-LEAVE-REQUESTS-BRANCH-ID | `leave_requests` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-LEAVE-REQUESTS-EMPLOYEE-ID | `leave_requests` | `employee_id` | `employees` | many-to-one | mandatory | **INFERRED** | yes |
| REL-OBD-DEVICES-ORG-ID | `obd_devices` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-OBD-DEVICES-BRANCH-ID | `obd_devices` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-OBD-DTC-READINGS-ORG-ID | `obd_dtc_readings` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | yes |
| REL-OBD-DTC-READINGS-BRANCH-ID | `obd_dtc_readings` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-OBD-DTC-READINGS-DEVICE-ID | `obd_dtc_readings` | `device_id` | `obd_devices` | many-to-one | mandatory | **INFERRED** | yes |
| REL-DTC-CODES-ORG-ID | `dtc_codes` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-DTC-CODES-BRANCH-ID | `dtc_codes` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-OEM-TOOLS-ORG-ID | `oem_tools` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-OEM-TOOLS-BRANCH-ID | `oem_tools` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-INTEGRATIONS-ORG-ID | `integrations` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-INTEGRATIONS-BRANCH-ID | `integrations` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-KB-PROCEDURES-ORG-ID | `kb_procedures` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-KB-PROCEDURES-BRANCH-ID | `kb_procedures` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-APPROVAL-LINES-ORG-ID | `approval_lines` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-APPROVAL-LINES-BRANCH-ID | `approval_lines` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-DIAG-STAGES-ORG-ID | `diag_stages` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-DIAG-STAGES-BRANCH-ID | `diag_stages` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-DIAG-FINDINGS-ORG-ID | `diag_findings` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-DIAG-FINDINGS-BRANCH-ID | `diag_findings` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-DIAG-PARTS-ORG-ID | `diag_parts` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-DIAG-PARTS-BRANCH-ID | `diag_parts` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-DIAG-LABOUR-ORG-ID | `diag_labour` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-DIAG-LABOUR-BRANCH-ID | `diag_labour` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-DIAG-COPIES-ORG-ID | `diag_copies` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-DIAG-COPIES-BRANCH-ID | `diag_copies` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-AI-AGENTS-ORG-ID | `ai_agents` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-AI-AGENTS-BRANCH-ID | `ai_agents` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-CONVERSATIONS-ORG-ID | `conversations` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-CONVERSATIONS-BRANCH-ID | `conversations` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-SUBSCRIPTION-REQUESTS-ORG-ID | `subscription_requests` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-SUPPORT-TICKETS-ORG-ID | `support_tickets` | `org_id` | `organizations` | many-to-one | mandatory | DECLARED (FK) | no |
| REL-SUPPORT-TICKETS-BRANCH-ID | `support_tickets` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-AUDIT-LOG-ORG-ID | `audit_log` | `org_id` | `organizations` | many-to-one | optional | **INFERRED** | yes |
| REL-AUDIT-LOG-BRANCH-ID | `audit_log` | `branch_id` | `branches` | many-to-one | optional | **INFERRED** | no |
| REL-IDEMPOTENCY-KEYS-ORG-ID | `idempotency_keys` | `org_id` | `organizations` | many-to-one | mandatory | **INFERRED** | yes |

## Reference columns with no resolvable target

A `*_id` column whose name does not resolve to a table. Some are legitimate (`audit_log.entity_id` is polymorphic by design, `chart_of_accounts.parent_id` is a self-reference); each is listed so the reader can tell which is which rather than assume.

| Table | Column |
| --- | --- |
| `user_sessions` | `family_id` |
| `inventory_movements` | `to_branch_id` |
| `inventory_movements` | `transfer_id` |
| `leads` | `converted_opportunity_id` |
| `chart_of_accounts` | `parent_id` |
| `bank_statements` | `matched_receipt_id` |
| `leave_requests` | `approver_id` |
| `audit_log` | `actor_id` |
| `audit_log` | `entity_id` |
| `audit_log` | `request_id` |
