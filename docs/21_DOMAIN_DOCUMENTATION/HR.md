<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/domains.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - project-control/CAPABILITY_REGISTRY.json
       - project-control/API_REGISTRY.json
       - project-control/ENTITY_REGISTRY.json
       - project-control/PERMISSION_REGISTRY.json
       - project-control/BUSINESS_RULES.json
       - project-control/MASTER_REGISTRY.json
-->

# Domain — HR and payroll

**Status:** GENERATED · **Capability:** CAP-HR · **Sources as of:** 2026-09-19

## Purpose and scope

This domain serves the objective **OBJ-CAPACITY** (Use technician capacity well). It comprises 12 screens, 70 API endpoints and 3 entities, gated by the `hr`, `technicians` permission modules.


## Actors

| Role | Data scope | Approval ceiling | Grants in this domain |
| --- | --- | --- | --- |
| owner | all | unlimited | `hr:vcedax` `technicians:vcedax` |
| superadmin | platform | unlimited | `hr:v` `technicians:v` |
| manager | branch | SAR 50,000 | `hr:vx` `technicians:vcedax` |
| advisor | branch | SAR 5,000 | `technicians:v` |
| technician | own | may not approve | `technicians:v` |
| qc | branch | may not approve | `technicians:v` |
| accountant | all | SAR 25,000 | `hr:vx` |
| hr | all | SAR 15,000 | `hr:vcedax` `technicians:vcedx` |
| frontdesk | branch | may not approve | `technicians:v` |
| test | all | unlimited | `hr:vcedax` `technicians:vcedax` |

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

| Table | Columns | Tenant | Branch | Soft delete | RLS | Money columns |
| --- | --- | --- | --- | --- | --- | --- |
| `technicians` | 14 | yes | yes | yes | yes | — |
| `employees` | 17 | yes | yes | yes | yes | `salary_halalas` |
| `timesheets` | 16 | yes | yes | yes | yes | — |

### Relationships

| From | Column | To | Optionality | Enforcement |
| --- | --- | --- | --- | --- |
| `technicians` | `org_id` | `organizations` | mandatory | FK |
| `technicians` | `branch_id` | `branches` | optional | **convention only** |
| `technicians` | `user_id` | `users` | optional | **convention only** |
| `employees` | `org_id` | `organizations` | mandatory | FK |
| `employees` | `branch_id` | `branches` | optional | **convention only** |
| `employees` | `department_id` | `departments` | optional | **convention only** |
| `timesheets` | `org_id` | `organizations` | mandatory | FK |
| `timesheets` | `branch_id` | `branches` | optional | **convention only** |
| `timesheets` | `employee_id` | `employees` | mandatory | **convention only** |

Relationships marked *convention only* have no database constraint: an orphaned reference is possible and nothing cascades.

## API surface

| Method | Path | Permission | Kind | Idempotent | Tests |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/employees` | hr:v | generated | — | **0** |
| POST | `/api/v1/employees` | hr:c | generated | — | **0** |
| DELETE | `/api/v1/employees/:id` | hr:d | generated | — | **0** |
| GET | `/api/v1/employees/:id` | hr:v | generated | — | **0** |
| PATCH | `/api/v1/employees/:id` | hr:e | generated | — | **0** |
| GET | `/api/v1/employees/:id/history` | hr:v | explicit | — | **0** |
| POST | `/api/v1/employees/bulk-delete` | hr:d | generated | — | **0** |
| POST | `/api/v1/employees/bulk-update` | hr:e | generated | — | **0** |
| GET | `/api/v1/employees/export` | hr:x | generated | — | **0** |
| GET | `/api/v1/leave-requests` | hr:v | generated | — | 3 |
| POST | `/api/v1/leave-requests` | hr:c | generated | — | 3 |
| DELETE | `/api/v1/leave-requests/:id` | hr:d | generated | — | **0** |
| GET | `/api/v1/leave-requests/:id` | hr:v | generated | — | **0** |
| PATCH | `/api/v1/leave-requests/:id` | hr:e | generated | — | **0** |
| POST | `/api/v1/leave-requests/:id/approve` | hr:a | explicit | — | 1 |
| GET | `/api/v1/leave-requests/:id/history` | hr:v | explicit | — | **0** |
| POST | `/api/v1/leave-requests/:id/reject` | hr:a | explicit | — | 1 |
| POST | `/api/v1/leave-requests/bulk-delete` | hr:d | generated | — | **0** |
| POST | `/api/v1/leave-requests/bulk-update` | hr:e | generated | — | **0** |
| GET | `/api/v1/leave-requests/export` | hr:x | generated | — | **0** |
| GET | `/api/v1/payroll/lines` | hr:v | generated | — | 1 |
| POST | `/api/v1/payroll/lines` | hr:c | generated | — | 1 |
| DELETE | `/api/v1/payroll/lines/:id` | hr:d | generated | — | **0** |
| GET | `/api/v1/payroll/lines/:id` | hr:v | generated | — | **0** |
| PATCH | `/api/v1/payroll/lines/:id` | hr:e | generated | — | **0** |
| GET | `/api/v1/payroll/lines/:id/history` | hr:v | explicit | — | **0** |
| POST | `/api/v1/payroll/lines/bulk-delete` | hr:d | generated | — | **0** |
| POST | `/api/v1/payroll/lines/bulk-update` | hr:e | generated | — | **0** |
| GET | `/api/v1/payroll/lines/export` | hr:x | generated | — | **0** |
| GET | `/api/v1/payroll/runs` | hr:v | generated | — | 1 |
| POST | `/api/v1/payroll/runs` | hr:c | generated | — | 1 |
| DELETE | `/api/v1/payroll/runs/:id` | hr:d | generated | — | **0** |
| GET | `/api/v1/payroll/runs/:id` | hr:v | generated | — | **0** |
| PATCH | `/api/v1/payroll/runs/:id` | hr:e | generated | — | **0** |
| GET | `/api/v1/payroll/runs/:id/history` | hr:v | explicit | — | **0** |
| POST | `/api/v1/payroll/runs/:id/post` | hr:e | explicit | — | **0** |
| POST | `/api/v1/payroll/runs/bulk-delete` | hr:d | generated | — | **0** |
| POST | `/api/v1/payroll/runs/bulk-update` | hr:e | generated | — | **0** |
| GET | `/api/v1/payroll/runs/export` | hr:x | generated | — | **0** |
| GET | `/api/v1/technicians` | technicians:v | generated | — | 3 |
| GET | `/api/v1/technicians/:id` | technicians:v | generated | — | **0** |
| GET | `/api/v1/technicians/:id/history` | technicians:v | explicit | — | **0** |
| GET | `/api/v1/technicians/export` | technicians:x | generated | — | **0** |
| GET | `/api/v1/timesheets` | hr:v | generated | — | **0** |
| POST | `/api/v1/timesheets` | hr:c | generated | — | **0** |
| DELETE | `/api/v1/timesheets/:id` | hr:d | generated | — | **0** |
| GET | `/api/v1/timesheets/:id` | hr:v | generated | — | **0** |
| PATCH | `/api/v1/timesheets/:id` | hr:e | generated | — | **0** |
| GET | `/api/v1/timesheets/:id/history` | hr:v | explicit | — | **0** |
| POST | `/api/v1/timesheets/bulk-delete` | hr:d | generated | — | **0** |
| POST | `/api/v1/timesheets/bulk-update` | hr:e | generated | — | **0** |
| GET | `/api/v1/timesheets/export` | hr:x | generated | — | **0** |
| GET | `/api/v1/training/courses` | hr:v | generated | — | 1 |
| POST | `/api/v1/training/courses` | hr:c | generated | — | 1 |
| DELETE | `/api/v1/training/courses/:id` | hr:d | generated | — | **0** |
| GET | `/api/v1/training/courses/:id` | hr:v | generated | — | **0** |
| PATCH | `/api/v1/training/courses/:id` | hr:e | generated | — | **0** |
| GET | `/api/v1/training/courses/:id/history` | hr:v | explicit | — | **0** |
| POST | `/api/v1/training/courses/bulk-delete` | hr:d | generated | — | **0** |
| POST | `/api/v1/training/courses/bulk-update` | hr:e | generated | — | **0** |
| GET | `/api/v1/training/courses/export` | hr:x | generated | — | **0** |
| GET | `/api/v1/training/enrolments` | hr:v | generated | — | 1 |
| POST | `/api/v1/training/enrolments` | hr:c | generated | — | 1 |
| DELETE | `/api/v1/training/enrolments/:id` | hr:d | generated | — | **0** |
| GET | `/api/v1/training/enrolments/:id` | hr:v | generated | — | **0** |
| PATCH | `/api/v1/training/enrolments/:id` | hr:e | generated | — | **0** |
| GET | `/api/v1/training/enrolments/:id/history` | hr:v | explicit | — | **0** |
| POST | `/api/v1/training/enrolments/bulk-delete` | hr:d | generated | — | **0** |
| POST | `/api/v1/training/enrolments/bulk-update` | hr:e | generated | — | **0** |
| GET | `/api/v1/training/enrolments/export` | hr:x | generated | — | **0** |

## Business rules

| ID | Rule | Kind | Enforced in |
| --- | --- | --- | --- |
| BR-HR-payrollLineNetHalalas | A payroll line's net pay: earnings plus allowances, less deductions. Every input is integer halalas, so the result is too — no rounding, no float. | HELPER | `packages/contract/src/rules/hr.ts` |
| BR-HR-sumPayrollLines | `sumPayrollLines` | HELPER | `packages/contract/src/rules/hr.ts` |

## Lifecycles

### `trainingCourseStatus` (training)

**State set only** — states: `draft`, `active`, `archived`. No transition table is declared; legal moves are whatever the route handlers check.

### `trainingEnrolmentStatus` (training)

**State set only** — states: `enrolled`, `in_progress`, `completed`, `withdrawn`. No transition table is declared; legal moves are whatever the route handlers check.


## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-Departments | `/departments` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-HRPayroll | `/hrpayroll` | app | yes | yes | yes | — | PARTIAL | yes |
| D-TechnicianKB | `/technician-kb` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-Technicians | `/technicians` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-TechnicianSchedule | `/technician-schedule` | app | yes | yes | yes | yes | verified | yes |
| F-135 | `/hr-management` | app | yes | yes | yes | yes | PARTIAL | yes |
| F-136 | `/staff-directory` | app | yes | yes | yes | yes | PARTIAL | yes |
| F-139 | `/timesheet-management` | app | yes | yes | yes | yes | PARTIAL | yes |
| F-140 | `/timeclock-payroll` | app | yes | yes | yes | yes | PARTIAL | yes |
| F-141 | `/payroll-management` | app | yes | yes | yes | yes | PARTIAL | yes |
| F-142 | `/leave-requests` | app | yes | yes | yes | yes | PARTIAL | yes |
| F-143 | `/training-lms` | app | yes | yes | yes | yes | PARTIAL | yes |

## Known gaps in this domain

- **57 of 70 endpoints have no test matched to them by path.** Matching is by path string, so this over-reports where a test reaches the endpoint through a helper.
- **2 lifecycles (`trainingCourseStatus`, `trainingEnrolmentStatus`) declare states but no legal transitions.** An illegal move is refused only where a handler happens to check.
- **6 of 9 relationships have no foreign key.** Integrity depends on application code; nothing cascades.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | `server/src/routes/collections.ts (generated from server/src/registry.ts)`, `server/src/routes/history.ts`, `server/src/routes/leave.ts`, `server/src/routes/payroll.ts` |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | `packages/contract/src/rules/hr.ts` |
| Screens | `project-control/MASTER_REGISTRY.json` |
