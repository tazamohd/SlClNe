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

# Domain — Workshop operations

**Status:** GENERATED · **Capability:** CAP-WORKSHOP · **Sources as of:** 2026-09-18

## Purpose and scope

This domain serves the objective **OBJ-THROUGHPUT** (Increase workshop throughput). It comprises 17 screens, 88 API endpoints and 3 entities, gated by the `jobcards`, `appointments`, `estimates` permission modules.


## Actors

| Role | Data scope | Approval ceiling | Grants in this domain |
| --- | --- | --- | --- |
| owner | all | unlimited | `jobcards:vcedax` `appointments:vcedax` `estimates:vcedax` |
| superadmin | platform | unlimited | `jobcards:v` `appointments:v` `estimates:v` |
| manager | branch | SAR 50,000 | `jobcards:vcedax` `appointments:vcedax` `estimates:vceax` |
| advisor | branch | SAR 5,000 | `jobcards:vcea` `appointments:vced` `estimates:vce` |
| technician | own | may not approve | `jobcards:ve` `appointments:v` `estimates:v` |
| qc | branch | may not approve | `jobcards:va` |
| parts | branch | SAR 10,000 | `jobcards:v` `estimates:v` |
| accountant | all | SAR 25,000 | `jobcards:vx` `estimates:vx` |
| frontdesk | branch | may not approve | `jobcards:vc` `appointments:vced` `estimates:v` |
| callcenter | all | may not approve | `jobcards:v` `appointments:vced` `estimates:v` |
| customer | self | may not approve | `jobcards:v` `appointments:vc` `estimates:v` |
| test | all | unlimited | `jobcards:vcedax` `appointments:vcedax` `estimates:vcedax` |

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

| Table | Columns | Tenant | Branch | Soft delete | RLS | Money columns |
| --- | --- | --- | --- | --- | --- | --- |
| `services` | 11 | yes | yes | yes | yes | — |
| `appointments` | 23 | yes | yes | yes | yes | — |
| `estimates` | 28 | yes | yes | yes | yes | `subtotal_halalas`, `tax_halalas`, `discount_halalas`, `total_halalas` |

### Relationships

| From | Column | To | Optionality | Enforcement |
| --- | --- | --- | --- | --- |
| `services` | `org_id` | `organizations` | mandatory | FK |
| `services` | `branch_id` | `branches` | optional | **convention only** |
| `appointments` | `org_id` | `organizations` | mandatory | FK |
| `appointments` | `branch_id` | `branches` | optional | **convention only** |
| `appointments` | `customer_id` | `customers` | optional | **convention only** |
| `appointments` | `vehicle_id` | `vehicles` | optional | **convention only** |
| `appointments` | `technician_id` | `technicians` | optional | **convention only** |
| `estimates` | `org_id` | `organizations` | mandatory | FK |
| `estimates` | `branch_id` | `branches` | optional | **convention only** |
| `estimates` | `job_card_id` | `job_cards` | optional | **convention only** |
| `estimates` | `customer_id` | `customers` | optional | **convention only** |
| `estimates` | `vehicle_id` | `vehicles` | optional | **convention only** |

Relationships marked *convention only* have no database constraint: an orphaned reference is possible and nothing cascades.

## API surface

| Method | Path | Permission | Kind | Idempotent | Tests |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/appointments` | appointments:v | generated | — | 6 |
| POST | `/api/v1/appointments` | appointments:c | generated | — | 6 |
| DELETE | `/api/v1/appointments/:id` | appointments:d | generated | — | **0** |
| GET | `/api/v1/appointments/:id` | appointments:v | generated | — | **0** |
| PATCH | `/api/v1/appointments/:id` | appointments:e | generated | — | **0** |
| GET | `/api/v1/appointments/:id/history` | appointments:v | explicit | — | **0** |
| POST | `/api/v1/appointments/:id/job-card` | jobcards:c | explicit | — | **0** |
| POST | `/api/v1/appointments/bulk-delete` | appointments:d | generated | — | **0** |
| POST | `/api/v1/appointments/bulk-update` | appointments:e | generated | — | **0** |
| GET | `/api/v1/appointments/export` | appointments:x | generated | — | **0** |
| GET | `/api/v1/declined-jobs` | estimates:v | generated | — | 1 |
| POST | `/api/v1/declined-jobs` | estimates:c | generated | — | 1 |
| DELETE | `/api/v1/declined-jobs/:id` | estimates:d | generated | — | **0** |
| GET | `/api/v1/declined-jobs/:id` | estimates:v | generated | — | **0** |
| PATCH | `/api/v1/declined-jobs/:id` | estimates:e | generated | — | **0** |
| GET | `/api/v1/declined-jobs/:id/history` | estimates:v | explicit | — | **0** |
| POST | `/api/v1/declined-jobs/bulk-delete` | estimates:d | generated | — | **0** |
| POST | `/api/v1/declined-jobs/bulk-update` | estimates:e | generated | — | **0** |
| GET | `/api/v1/declined-jobs/export` | estimates:x | generated | — | **0** |
| GET | `/api/v1/diagnostics/copies` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/diagnostics/copies/:id` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/diagnostics/copies/:id/history` | jobcards:v | explicit | — | **0** |
| GET | `/api/v1/diagnostics/copies/export` | jobcards:x | generated | — | **0** |
| GET | `/api/v1/diagnostics/devices` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/diagnostics/devices/:id` | jobcards:v | generated | — | **0** |
| POST | `/api/v1/diagnostics/devices/:id/clear-codes` | jobcards:e | explicit | — | **0** |
| GET | `/api/v1/diagnostics/devices/:id/history` | jobcards:v | explicit | — | **0** |
| GET | `/api/v1/diagnostics/devices/:id/readings` | jobcards:v | explicit | — | **0** |
| POST | `/api/v1/diagnostics/devices/:id/rescan` | jobcards:e | explicit | — | **0** |
| GET | `/api/v1/diagnostics/devices/export` | jobcards:x | generated | — | **0** |
| GET | `/api/v1/diagnostics/findings` | jobcards:v | generated | — | 1 |
| GET | `/api/v1/diagnostics/findings/:id` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/diagnostics/findings/:id/history` | jobcards:v | explicit | — | **0** |
| GET | `/api/v1/diagnostics/findings/export` | jobcards:x | generated | — | **0** |
| GET | `/api/v1/diagnostics/integrations` | jobcards:v | explicit | — | 1 |
| GET | `/api/v1/diagnostics/labour` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/diagnostics/labour/:id` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/diagnostics/labour/:id/history` | jobcards:v | explicit | — | **0** |
| GET | `/api/v1/diagnostics/labour/export` | jobcards:x | generated | — | **0** |
| GET | `/api/v1/diagnostics/parts` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/diagnostics/parts/:id` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/diagnostics/parts/:id/history` | jobcards:v | explicit | — | **0** |
| GET | `/api/v1/diagnostics/parts/export` | jobcards:x | generated | — | **0** |
| GET | `/api/v1/diagnostics/readings` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/diagnostics/readings/:id` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/diagnostics/readings/:id/history` | jobcards:v | explicit | — | **0** |
| GET | `/api/v1/diagnostics/readings/export` | jobcards:x | generated | — | **0** |
| GET | `/api/v1/diagnostics/stages` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/diagnostics/stages/:id` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/diagnostics/stages/:id/history` | jobcards:v | explicit | — | **0** |
| GET | `/api/v1/diagnostics/stages/export` | jobcards:x | generated | — | **0** |
| GET | `/api/v1/estimates` | estimates:v | generated | — | 9 |
| POST | `/api/v1/estimates` | estimates:c | explicit | — | 9 |
| GET | `/api/v1/estimates/:id` | estimates:v | generated | — | **0** |
| PATCH | `/api/v1/estimates/:id` | estimates:e | explicit | — | **0** |
| POST | `/api/v1/estimates/:id/approve` | estimates:a | explicit | — | 3 |
| GET | `/api/v1/estimates/:id/history` | estimates:v | explicit | — | **0** |
| GET | `/api/v1/estimates/:id/lines` | estimates:v | explicit | — | **0** |
| POST | `/api/v1/estimates/:id/lines/:lineId/decline` | estimates:a | explicit | — | **0** |
| POST | `/api/v1/estimates/:id/reject` | estimates:a | explicit | — | 1 |
| POST | `/api/v1/estimates/:id/request-approval-otp` | estimates:e | explicit | — | **0** |
| POST | `/api/v1/estimates/:id/verify-approval-otp` | estimates:e | explicit | — | 1 |
| GET | `/api/v1/estimates/export` | estimates:x | generated | — | **0** |
| GET | `/api/v1/jobs` | jobcards:v | generated | — | 7 |
| POST | `/api/v1/jobs` | jobcards:c | generated | — | 7 |
| DELETE | `/api/v1/jobs/:id` | jobcards:d | generated | — | **0** |
| GET | `/api/v1/jobs/:id` | jobcards:v | generated | — | **0** |
| PATCH | `/api/v1/jobs/:id` | jobcards:e | generated | — | **0** |
| POST | `/api/v1/jobs/:id/assign` | jobcards:e | explicit | — | **0** |
| GET | `/api/v1/jobs/:id/history` | jobcards:v | explicit | — | **0** |
| POST | `/api/v1/jobs/:id/transition` | jobcards:e | explicit | — | **0** |
| POST | `/api/v1/jobs/bulk-delete` | jobcards:d | generated | — | **0** |
| POST | `/api/v1/jobs/bulk-update` | jobcards:e | generated | — | **0** |
| GET | `/api/v1/jobs/export` | jobcards:x | generated | — | **0** |
| GET | `/api/v1/kb/dtc` | jobcards:v | generated | — | 1 |
| GET | `/api/v1/kb/dtc/:id` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/kb/dtc/:id/history` | jobcards:v | explicit | — | **0** |
| GET | `/api/v1/kb/dtc/export` | jobcards:x | generated | — | **0** |
| GET | `/api/v1/kb/procedures` | jobcards:v | generated | — | 2 |
| GET | `/api/v1/kb/procedures/:id` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/kb/procedures/:id/history` | jobcards:v | explicit | — | **0** |
| GET | `/api/v1/kb/procedures/export` | jobcards:x | generated | — | **0** |
| GET | `/api/v1/reports/declined-jobs` | estimates:v | explicit | — | 1 |
| GET | `/api/v1/reports/workshop` | jobcards:v | explicit | — | 1 |
| GET | `/api/v1/services` | jobcards:v | generated | — | 1 |
| GET | `/api/v1/services/:id` | jobcards:v | generated | — | **0** |
| GET | `/api/v1/services/:id/history` | jobcards:v | explicit | — | **0** |
| GET | `/api/v1/services/export` | jobcards:x | generated | — | **0** |

## Business rules

_No rule guard in `packages/contract/src/rules` is specific to this domain. Any constraint is in the route handlers, or absent._

## Lifecycles

### `appointmentStatus` (appointment)

**State set only** — states: `confirmed`, `awaiting`, `no-show`, `cancelled`, `completed`. No transition table is declared; legal moves are whatever the route handlers check.

### `declinedJobStatus` (declined-job)

**State set only** — states: `declined`, `follow_up_scheduled`, `contacted`, `reconsidering`, `approved_later`, `permanently_declined`, `expired`. No transition table is declared; legal moves are whatever the route handlers check.

### `estimateStatus` (estimate)

**State set only** — states: `draft`, `sent`, `approved`, `rejected`, `expired`. No transition table is declared; legal moves are whatever the route handlers check.


## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-AppointmentCalendar | `/appointment-calendar` | app | yes | yes | yes | — | PARTIAL | yes |
| D-Appointments | `/appointments` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-CustomerApproval | `/customer-approval` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-DeclinedJobs | `/declined-jobs` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-DiagnosticReport | `/diagnostic-report` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-EstimateDetail | `/estimate-detail` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-Estimates | `/estimates` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-JobCardDetail | `/job-card-detail` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-JobCards | `/job-cards` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-JobDetail | `/job-detail` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-OBDDiagnostics | `/obddiagnostics` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-WorkshopCheckIn | `/workshop-check-in` | app | yes | yes | yes | — | PARTIAL | yes |
| D-WorkshopDelivery | `/workshop-delivery` | app | yes | yes | — | yes | verified | yes |
| D-WorkshopEstimate | `/workshop-estimate` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-WorkshopInspection | `/workshop-inspection` | app | **mock** | — | — | — | PARTIAL | yes |
| D-WorkshopQC | `/workshop-qc` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-WorkshopSignature | `/workshop-signature` | app | yes | — | — | — | verified | yes |

## Known gaps in this domain

- **1 of 17 screens read design fixtures rather than the API.** They render and are asserted; they have not exchanged data with the server.
- **70 of 88 endpoints have no test matched to them by path.** Matching is by path string, so this over-reports where a test reaches the endpoint through a helper.
- **3 lifecycles (`appointmentStatus`, `declinedJobStatus`, `estimateStatus`) declare states but no legal transitions.** An illegal move is refused only where a handler happens to check.
- **9 of 12 relationships have no foreign key.** Integrity depends on application code; nothing cascades.
- **No rule guard in the shared contract is specific to this domain.** Any business constraint lives in route handlers, where it is not reusable by the form and not asserted by a contract test.
- **2 screens declare neither a loading nor an error state.** Acceptable for a static reference screen; a defect for one that fetches.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | `server/src/routes/collections.ts (generated from server/src/registry.ts)`, `server/src/routes/history.ts`, `server/src/routes/workshop.ts`, `server/src/routes/obd.ts` |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | — |
| Screens | `project-control/MASTER_REGISTRY.json` |
