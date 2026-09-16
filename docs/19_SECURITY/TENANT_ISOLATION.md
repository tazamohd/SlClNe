<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/drizzle/*.sql
       - server/src/db/tenant.ts
-->

# Tenant and branch isolation

**Status:** GENERATED · **Source of truth:** the migrations · **Sources as of:** 2026-09-09

## Position

Isolation is a database policy, not a `WHERE` clause. A `WHERE` clause is something a developer has to remember; a policy is something the database applies whether they remembered or not.

**65 tables have row-level security enabled**, all of them with `FORCE` so the migration role that owns the table is subject to the same policies — without `FORCE` the owner silently bypasses isolation. Of 64 tenant-scoped tables, **0 lack a policy**.

## Request context

Set per transaction by the API with `SET LOCAL`. Each reader returns `NULL` when unset, and every policy compares against it — so a connection with no context set sees nothing at all. Failing closed is the only safe default for an isolation primitive.

| Function | Reads |
| --- | --- |
| `app_org()` | `app.org_id` / `app.scope` |
| `app_branch()` | `app.branch_id` / `app.scope` |
| `app_user()` | `app.user_id` / `app.scope` |
| `app_scope()` | `app.scope_id` / `app.scope` |

## Why the narrowing policies are RESTRICTIVE

Multiple PERMISSIVE policies are OR-ed. A "branch scope" permissive policy beside a "tenant scope" one would **widen** access rather than narrow it — a branch-scoped user would read the whole organization. The narrowing policies are therefore RESTRICTIVE, which is AND-ed.

## Policies

| Policy | Applies to | Type | Command | Predicate |
| --- | --- | --- | --- | --- |
| `p_tenant` | every table in the tenant_tables array | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | every table in the tenant_tables array | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `r_own` | `job_cards` | RESTRICTIVE | ALL | `app_scope() NOT IN ('own','self','assigned') OR assigned_tech_id = app_user() OR created_by = app_user()` |
| `r_own` | `appointments` | RESTRICTIVE | ALL | `app_scope() NOT IN ('own','self','assigned') OR technician_id = app_user() OR created_by = app_user()` |
| `r_own` | `crm_tasks` | RESTRICTIVE | ALL | `app_scope() NOT IN ('own','self','assigned') OR created_by = app_user() OR created_by = app_user()` |
| `r_own` | `user_sessions` | RESTRICTIVE | ALL | `app_scope() NOT IN ('own','self','assigned') OR user_id = app_user() OR created_by = app_user()` |
| `p_self` | `organizations` | PERMISSIVE | ALL | `app_scope() = 'platform' OR id = app_org()` |
| `p_tenant_read` | `audit_log` | PERMISSIVE | SELECT | `app_scope() = 'platform' OR org_id = app_org()` |
| `p_tenant_write` | `audit_log` | PERMISSIVE | INSERT | — |
| `p_tenant` | `idempotency_keys` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `p_tenant` | `subscription_requests` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_own` | `job_cards` | RESTRICTIVE | ALL | `app_scope() NOT IN ('own','self','assigned') OR created_by = app_user() OR assigned_tech_id IN (SELECT id FROM technicians WHERE user_id = app_user())` |
| `p_tenant` | `public_leads` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `public_leads` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `customer_feedback` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `customer_feedback` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `bank_statements` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `bank_statements` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `saved_reports` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `saved_reports` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `obd_dtc_readings` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `obd_dtc_readings` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `insurance_policies` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `insurance_policies` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `insurance_claims` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `insurance_claims` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `loan_contracts` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `loan_contracts` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `loan_repayments` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `loan_repayments` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `employees` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `employees` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `payroll_runs` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `payroll_runs` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `payroll_lines` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `payroll_lines` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `timesheets` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `timesheets` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `leave_requests` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `leave_requests` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `suppliers` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `suppliers` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `requisitions` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `requisitions` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `p_tenant` | `requisition_lines` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `requisition_lines` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `r_own` | `job_cards` | RESTRICTIVE | ALL | `app_scope() NOT IN ('own','assigned') OR created_by = app_user() OR assigned_tech_id IN (SELECT id FROM technicians WHERE user_id = app_user())` |
| `r_own` | `appointments` | RESTRICTIVE | ALL | `app_scope() NOT IN ('own','assigned') OR technician_id = app_user() OR created_by = app_user()` |
| `r_own` | `crm_tasks` | RESTRICTIVE | ALL | `app_scope() NOT IN ('own','assigned') OR created_by = app_user()` |
| `p_tenant` | `journal_lines` | PERMISSIVE | ALL | `app_scope() = 'platform' OR org_id = app_org()` |
| `r_branch` | `journal_lines` | RESTRICTIVE | ALL | `app_scope() NOT IN ('branch','own','self','assigned','external') OR branch_id IS NULL OR branch_id = app_branch()` |
| `r_self` | `journal_lines` | RESTRICTIVE | ALL | `app_scope() <> 'self'` |

## Triggers

| Trigger | Table | Function | Migration |
| --- | --- | --- | --- |
| `organizations_bump_version` | `organizations` | `bump_version` | `server/drizzle/0001_rls.sql` |
| `audit_log_no_update` | `audit_log` | `audit_log_is_immutable` | `server/drizzle/0001_rls.sql` |
| `audit_log_no_delete` | `audit_log` | `audit_log_is_immutable` | `server/drizzle/0001_rls.sql` |
| `<table>_bump_version` | `every table in the tenant_tables array` | `bump_version` | `server/drizzle/0001_rls.sql` |
| `public_leads_bump_version` | `public_leads` | `bump_version` | `server/drizzle/0004_crm_fleet_feedback.sql` |
| `customer_feedback_bump_version` | `customer_feedback` | `bump_version` | `server/drizzle/0004_crm_fleet_feedback.sql` |
| `bank_statements_bump_version` | `bank_statements` | `bump_version` | `server/drizzle/0005_bank_statements_saved_reports.sql` |
| `saved_reports_bump_version` | `saved_reports` | `bump_version` | `server/drizzle/0005_bank_statements_saved_reports.sql` |
| `obd_dtc_readings_bump_version` | `obd_dtc_readings` | `bump_version` | `server/drizzle/0006_obd_dtc_readings.sql` |
| `insurance_policies_bump_version` | `insurance_policies` | `bump_version` | `server/drizzle/0007_insurance.sql` |
| `insurance_claims_bump_version` | `insurance_claims` | `bump_version` | `server/drizzle/0007_insurance.sql` |
| `loan_contracts_bump_version` | `loan_contracts` | `bump_version` | `server/drizzle/0008_loans.sql` |
| `loan_repayments_bump_version` | `loan_repayments` | `bump_version` | `server/drizzle/0008_loans.sql` |
| `employees_bump_version` | `employees` | `bump_version` | `server/drizzle/0009_hr.sql` |
| `payroll_runs_bump_version` | `payroll_runs` | `bump_version` | `server/drizzle/0009_hr.sql` |
| `payroll_lines_bump_version` | `payroll_lines` | `bump_version` | `server/drizzle/0009_hr.sql` |
| `timesheets_bump_version` | `timesheets` | `bump_version` | `server/drizzle/0009_hr.sql` |
| `leave_requests_bump_version` | `leave_requests` | `bump_version` | `server/drizzle/0009_hr.sql` |
| `suppliers_bump_version` | `suppliers` | `bump_version` | `server/drizzle/0010_procurement.sql` |
| `requisitions_bump_version` | `requisitions` | `bump_version` | `server/drizzle/0010_procurement.sql` |
| `requisition_lines_bump_version` | `requisition_lines` | `bump_version` | `server/drizzle/0010_procurement.sql` |
| `audit_log_no_update` | `audit_log` | `audit_log_is_immutable` | `server/drizzle/0011_audit_log_statement_immutability.sql` |
| `audit_log_no_delete` | `audit_log` | `audit_log_is_immutable` | `server/drizzle/0011_audit_log_statement_immutability.sql` |
| `audit_log_no_truncate` | `audit_log` | `audit_log_is_immutable` | `server/drizzle/0011_audit_log_statement_immutability.sql` |
| `journal_lines_bump_version` | `journal_lines` | `bump_version` | `server/drizzle/0015_journal_lines.sql` |

## Sequence: a request that reads tenant data

```mermaid
sequenceDiagram
  participant C as Client
  participant A as Fastify app
  participant Z as Authn hook
  participant P as Permission check
  participant T as Transaction
  participant D as Postgres (RLS)
  C->>A: GET /api/v1/job-cards (Bearer token)
  A->>Z: onRequest — public path?
  Z-->>A: no; verify token, build principal
  A->>P: requirePermission(principal, 'jobcards', 'v')
  P-->>A: granted (or 403 before any query runs)
  A->>T: BEGIN
  T->>D: SET LOCAL app.org_id, app.branch_id, app.user_id, app.scope
  A->>D: SELECT ... FROM job_cards
  D-->>A: rows the policies allow — no WHERE org_id needed
  A->>T: COMMIT
  A-->>C: 200 with the presented rows
```
