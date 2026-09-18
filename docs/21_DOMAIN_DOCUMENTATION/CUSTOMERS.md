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

# Domain — Customer management

**Status:** GENERATED · **Capability:** CAP-CUSTOMERS · **Sources as of:** 2026-09-17

## Purpose and scope

This domain serves the objective **OBJ-RETENTION** (Retain customers). It comprises 3 screens, 19 API endpoints and 2 entities, gated by the `customers` permission module.


## Actors

| Role | Data scope | Approval ceiling | Grants in this domain |
| --- | --- | --- | --- |
| owner | all | unlimited | `customers:vcedax` |
| superadmin | platform | unlimited | `customers:v` |
| manager | branch | SAR 50,000 | `customers:vcedx` |
| advisor | branch | SAR 5,000 | `customers:vce` |
| technician | own | may not approve | `customers:v` |
| accountant | all | SAR 25,000 | `customers:vx` |
| frontdesk | branch | may not approve | `customers:vce` |
| callcenter | all | may not approve | `customers:vce` |
| test | all | unlimited | `customers:vcedax` |

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

| Table | Columns | Tenant | Branch | Soft delete | RLS | Money columns |
| --- | --- | --- | --- | --- | --- | --- |
| `fleets` | 21 | yes | yes | yes | yes | `contract_value_halalas` |
| `customers` | 19 | yes | yes | yes | yes | `total_spent_halalas` |

### Relationships

| From | Column | To | Optionality | Enforcement |
| --- | --- | --- | --- | --- |
| `fleets` | `org_id` | `organizations` | mandatory | FK |
| `fleets` | `branch_id` | `branches` | optional | **convention only** |
| `customers` | `org_id` | `organizations` | mandatory | FK |
| `customers` | `branch_id` | `branches` | optional | **convention only** |
| `customers` | `fleet_id` | `fleets` | optional | **convention only** |

Relationships marked *convention only* have no database constraint: an orphaned reference is possible and nothing cascades.

## API surface

| Method | Path | Permission | Kind | Idempotent | Tests |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/customers` | customers:v | generated | — | 14 |
| POST | `/api/v1/customers` | customers:c | generated | — | 14 |
| DELETE | `/api/v1/customers/:id` | customers:d | generated | — | **0** |
| GET | `/api/v1/customers/:id` | customers:v | generated | — | **0** |
| PATCH | `/api/v1/customers/:id` | customers:e | generated | — | **0** |
| GET | `/api/v1/customers/:id/history` | customers:v | explicit | — | **0** |
| POST | `/api/v1/customers/bulk-delete` | customers:d | generated | — | 1 |
| POST | `/api/v1/customers/bulk-update` | customers:e | generated | — | **0** |
| GET | `/api/v1/customers/export` | customers:x | generated | — | 1 |
| GET | `/api/v1/fleets` | customers:v | generated | — | 1 |
| POST | `/api/v1/fleets` | customers:c | generated | — | 1 |
| DELETE | `/api/v1/fleets/:id` | customers:d | generated | — | **0** |
| GET | `/api/v1/fleets/:id` | customers:v | generated | — | **0** |
| PATCH | `/api/v1/fleets/:id` | customers:e | generated | — | **0** |
| GET | `/api/v1/fleets/:id/history` | customers:v | explicit | — | **0** |
| POST | `/api/v1/fleets/:id/renew` | customers:e | explicit | — | **0** |
| POST | `/api/v1/fleets/bulk-delete` | customers:d | generated | — | **0** |
| POST | `/api/v1/fleets/bulk-update` | customers:e | generated | — | **0** |
| GET | `/api/v1/fleets/export` | customers:x | generated | — | **0** |

## Business rules

_No rule guard in `packages/contract/src/rules` is specific to this domain. Any constraint is in the route handlers, or absent._

## Lifecycles

### `fleetContractStatus` (fleet)

**State set only** — states: `active`, `renewal`, `expired`, `suspended`. No transition table is declared; legal moves are whatever the route handlers check.


## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-CustomerDetail | `/customer-detail` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-CustomerFeedback | `/customer-feedback` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-Customers | `/customers` | app | yes | yes | yes | yes | PARTIAL | yes |

## Known gaps in this domain

- **13 of 19 endpoints have no test matched to them by path.** Matching is by path string, so this over-reports where a test reaches the endpoint through a helper.
- **1 lifecycle (`fleetContractStatus`) declare states but no legal transitions.** An illegal move is refused only where a handler happens to check.
- **3 of 5 relationships have no foreign key.** Integrity depends on application code; nothing cascades.
- **No rule guard in the shared contract is specific to this domain.** Any business constraint lives in route handlers, where it is not reusable by the form and not asserted by a contract test.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | `server/src/routes/collections.ts (generated from server/src/registry.ts)`, `server/src/routes/history.ts`, `server/src/routes/fleets.ts` |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | — |
| Screens | `project-control/MASTER_REGISTRY.json` |
