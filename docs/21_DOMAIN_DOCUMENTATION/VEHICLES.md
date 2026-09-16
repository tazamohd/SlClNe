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

# Domain — Vehicle management

**Status:** GENERATED · **Capability:** CAP-VEHICLES · **Sources as of:** 2026-09-16

## Purpose and scope

This domain serves the objective **OBJ-THROUGHPUT** (Increase workshop throughput). It comprises 4 screens, 9 API endpoints and 1 entities, gated by the `vehicles` permission module.


## Actors

| Role | Data scope | Approval ceiling | Grants in this domain |
| --- | --- | --- | --- |
| owner | all | unlimited | `vehicles:vcedax` |
| superadmin | platform | unlimited | `vehicles:v` |
| manager | branch | SAR 50,000 | `vehicles:vcedx` |
| advisor | branch | SAR 5,000 | `vehicles:vce` |
| technician | own | may not approve | `vehicles:v` |
| qc | branch | may not approve | `vehicles:v` |
| accountant | all | SAR 25,000 | `vehicles:v` |
| frontdesk | branch | may not approve | `vehicles:vce` |
| callcenter | all | may not approve | `vehicles:v` |
| customer | self | may not approve | `vehicles:v` |
| test | all | unlimited | `vehicles:vcedax` |

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

| Table | Columns | Tenant | Branch | Soft delete | RLS | Money columns |
| --- | --- | --- | --- | --- | --- | --- |
| `vehicles` | 18 | yes | yes | yes | yes | — |

### Relationships

| From | Column | To | Optionality | Enforcement |
| --- | --- | --- | --- | --- |
| `vehicles` | `org_id` | `organizations` | mandatory | FK |
| `vehicles` | `branch_id` | `branches` | optional | **convention only** |
| `vehicles` | `customer_id` | `customers` | optional | **convention only** |

Relationships marked *convention only* have no database constraint: an orphaned reference is possible and nothing cascades.

## API surface

| Method | Path | Permission | Kind | Idempotent | Tests |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/vehicles` | vehicles:v | generated | — | 7 |
| POST | `/api/v1/vehicles` | vehicles:c | generated | — | 7 |
| DELETE | `/api/v1/vehicles/:id` | vehicles:d | generated | — | **0** |
| GET | `/api/v1/vehicles/:id` | vehicles:v | generated | — | **0** |
| PATCH | `/api/v1/vehicles/:id` | vehicles:e | generated | — | **0** |
| GET | `/api/v1/vehicles/:id/history` | vehicles:v | explicit | — | **0** |
| POST | `/api/v1/vehicles/bulk-delete` | vehicles:d | generated | — | **0** |
| POST | `/api/v1/vehicles/bulk-update` | vehicles:e | generated | — | **0** |
| GET | `/api/v1/vehicles/export` | vehicles:x | generated | — | **0** |

## Business rules

_No rule guard in `packages/contract/src/rules` is specific to this domain. Any constraint is in the route handlers, or absent._

## Lifecycles

### `vehicleStatus` (vehicle)

**State set only** — states: `active`, `service`, `inactive`. No transition table is declared; legal moves are whatever the route handlers check.


## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-FleetContract | `/fleet-contract` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-FleetManagement | `/fleet-management` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-VehicleDetail | `/vehicle-detail` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-Vehicles | `/vehicles` | app | yes | yes | yes | yes | PARTIAL | yes |

## Known gaps in this domain

- **7 of 9 endpoints have no test matched to them by path.** Matching is by path string, so this over-reports where a test reaches the endpoint through a helper.
- **1 lifecycle (`vehicleStatus`) declare states but no legal transitions.** An illegal move is refused only where a handler happens to check.
- **2 of 3 relationships have no foreign key.** Integrity depends on application code; nothing cascades.
- **No rule guard in the shared contract is specific to this domain.** Any business constraint lives in route handlers, where it is not reusable by the form and not asserted by a contract test.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | `server/src/routes/collections.ts (generated from server/src/registry.ts)`, `server/src/routes/history.ts` |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | — |
| Screens | `project-control/MASTER_REGISTRY.json` |
