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

# Domain — CRM and sales

**Status:** GENERATED · **Capability:** CAP-CRM · **Sources as of:** 2026-09-16

## Purpose and scope

This domain serves the objective **OBJ-RETENTION** (Retain customers). It comprises 12 screens, 45 API endpoints and 4 entities, gated by the `crm`, `callcenter` permission modules.


## Actors

| Role | Data scope | Approval ceiling | Grants in this domain |
| --- | --- | --- | --- |
| owner | all | unlimited | `crm:vcedax` `callcenter:vx` |
| superadmin | platform | unlimited | `crm:v` `callcenter:v` |
| manager | branch | SAR 50,000 | `crm:vcedx` `callcenter:vx` |
| advisor | branch | SAR 5,000 | `crm:vce` `callcenter:v` |
| frontdesk | branch | may not approve | `callcenter:v` |
| callcenter | all | may not approve | `crm:vced` `callcenter:vcedx` |
| test | all | unlimited | `crm:vcedax` `callcenter:vcedax` |

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

| Table | Columns | Tenant | Branch | Soft delete | RLS | Money columns |
| --- | --- | --- | --- | --- | --- | --- |
| `leads` | 17 | yes | yes | yes | yes | `value_halalas` |
| `opportunities` | 16 | yes | yes | yes | yes | `value_halalas` |
| `campaigns` | 18 | yes | yes | yes | yes | `budget_halalas`, `spent_halalas` |
| `segments` | 13 | yes | yes | yes | yes | — |

### Relationships

| From | Column | To | Optionality | Enforcement |
| --- | --- | --- | --- | --- |
| `leads` | `org_id` | `organizations` | mandatory | FK |
| `leads` | `branch_id` | `branches` | optional | **convention only** |
| `opportunities` | `org_id` | `organizations` | mandatory | FK |
| `opportunities` | `branch_id` | `branches` | optional | **convention only** |
| `campaigns` | `org_id` | `organizations` | mandatory | FK |
| `campaigns` | `branch_id` | `branches` | optional | **convention only** |
| `segments` | `org_id` | `organizations` | mandatory | FK |
| `segments` | `branch_id` | `branches` | optional | **convention only** |

Relationships marked *convention only* have no database constraint: an orphaned reference is possible and nothing cascades.

## API surface

| Method | Path | Permission | Kind | Idempotent | Tests |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/crm/campaigns` | crm:v | generated | — | 2 |
| GET | `/api/v1/crm/campaigns/:id` | crm:v | generated | — | **0** |
| GET | `/api/v1/crm/campaigns/:id/history` | crm:v | explicit | — | **0** |
| GET | `/api/v1/crm/campaigns/export` | crm:x | generated | — | **0** |
| GET | `/api/v1/crm/leads` | crm:v | generated | — | 2 |
| POST | `/api/v1/crm/leads` | crm:c | generated | — | 2 |
| DELETE | `/api/v1/crm/leads/:id` | crm:d | generated | — | **0** |
| GET | `/api/v1/crm/leads/:id` | crm:v | generated | — | **0** |
| PATCH | `/api/v1/crm/leads/:id` | crm:e | generated | — | **0** |
| POST | `/api/v1/crm/leads/:id/convert` | crm:c | explicit | — | **0** |
| GET | `/api/v1/crm/leads/:id/history` | crm:v | explicit | — | **0** |
| POST | `/api/v1/crm/leads/bulk-delete` | crm:d | generated | — | **0** |
| POST | `/api/v1/crm/leads/bulk-update` | crm:e | generated | — | **0** |
| GET | `/api/v1/crm/leads/export` | crm:x | generated | — | **0** |
| GET | `/api/v1/crm/opportunities` | crm:v | generated | — | 2 |
| POST | `/api/v1/crm/opportunities` | crm:c | generated | — | 2 |
| DELETE | `/api/v1/crm/opportunities/:id` | crm:d | generated | — | **0** |
| GET | `/api/v1/crm/opportunities/:id` | crm:v | generated | — | **0** |
| PATCH | `/api/v1/crm/opportunities/:id` | crm:e | generated | — | **0** |
| GET | `/api/v1/crm/opportunities/:id/history` | crm:v | explicit | — | **0** |
| POST | `/api/v1/crm/opportunities/bulk-delete` | crm:d | generated | — | **0** |
| POST | `/api/v1/crm/opportunities/bulk-update` | crm:e | generated | — | **0** |
| GET | `/api/v1/crm/opportunities/export` | crm:x | generated | — | **0** |
| GET | `/api/v1/crm/segments` | crm:v | generated | — | 1 |
| GET | `/api/v1/crm/segments/:id` | crm:v | generated | — | **0** |
| GET | `/api/v1/crm/segments/:id/history` | crm:v | explicit | — | **0** |
| GET | `/api/v1/crm/segments/export` | crm:x | generated | — | **0** |
| GET | `/api/v1/crm/tasks` | crm:v | generated | — | 2 |
| POST | `/api/v1/crm/tasks` | crm:c | generated | — | 2 |
| DELETE | `/api/v1/crm/tasks/:id` | crm:d | generated | — | **0** |
| GET | `/api/v1/crm/tasks/:id` | crm:v | generated | — | **0** |
| PATCH | `/api/v1/crm/tasks/:id` | crm:e | generated | — | **0** |
| GET | `/api/v1/crm/tasks/:id/history` | crm:v | explicit | — | **0** |
| POST | `/api/v1/crm/tasks/bulk-delete` | crm:d | generated | — | **0** |
| POST | `/api/v1/crm/tasks/bulk-update` | crm:e | generated | — | **0** |
| GET | `/api/v1/crm/tasks/export` | crm:x | generated | — | **0** |
| GET | `/api/v1/customer-feedback` | crm:v | generated | — | 5 |
| POST | `/api/v1/customer-feedback` | crm:c | generated | — | 5 |
| DELETE | `/api/v1/customer-feedback/:id` | crm:d | generated | — | **0** |
| GET | `/api/v1/customer-feedback/:id` | crm:v | generated | — | **0** |
| PATCH | `/api/v1/customer-feedback/:id` | crm:e | generated | — | **0** |
| GET | `/api/v1/customer-feedback/:id/history` | crm:v | explicit | — | **0** |
| POST | `/api/v1/customer-feedback/bulk-delete` | crm:d | generated | — | **0** |
| POST | `/api/v1/customer-feedback/bulk-update` | crm:e | generated | — | **0** |
| GET | `/api/v1/customer-feedback/export` | crm:x | generated | — | **0** |

## Business rules

_No rule guard in `packages/contract/src/rules` is specific to this domain. Any constraint is in the route handlers, or absent._

## Lifecycles

### `crmTaskStatus` (crm)

**State set only** — states: `todo`, `in_progress`, `done`. No transition table is declared; legal moves are whatever the route handlers check.


## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-CallCenter | `/call-center` | call-center | **mock** | — | — | yes | PARTIAL | yes |
| D-CallCenter.Logs | `/call-center/logs` | call-center | **mock** | — | — | yes | PARTIAL | yes |
| D-Campaigns | `/campaigns` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-CRMCalendar | `/crmcalendar` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-CRMTasks | `/crmtasks` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-CustomerSegments | `/customer-segments` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-EmailMarketing | `/email-marketing` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-LeadDetail | `/lead-detail` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-LeadPipeline | `/lead-pipeline` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-Opportunities | `/opportunities` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-SMSCampaigns | `/smscampaigns` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-WhatsAppCampaigns | `/whats-app-campaigns` | app | yes | yes | yes | yes | PARTIAL | yes |

## Known gaps in this domain

- **2 of 12 screens read design fixtures rather than the API.** They render and are asserted; they have not exchanged data with the server.
- **35 of 45 endpoints have no test matched to them by path.** Matching is by path string, so this over-reports where a test reaches the endpoint through a helper.
- **1 lifecycle (`crmTaskStatus`) declare states but no legal transitions.** An illegal move is refused only where a handler happens to check.
- **4 of 8 relationships have no foreign key.** Integrity depends on application code; nothing cascades.
- **No rule guard in the shared contract is specific to this domain.** Any business constraint lives in route handlers, where it is not reusable by the form and not asserted by a contract test.
- **2 screens declare neither a loading nor an error state.** Acceptable for a static reference screen; a defect for one that fetches.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | `server/src/routes/collections.ts (generated from server/src/registry.ts)`, `server/src/routes/history.ts`, `server/src/routes/crm.ts` |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | — |
| Screens | `project-control/MASTER_REGISTRY.json` |
