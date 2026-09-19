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

# Domain — Parts and inventory

**Status:** GENERATED · **Capability:** CAP-INVENTORY · **Sources as of:** 2026-09-19

## Purpose and scope

This domain serves the objective **OBJ-MARGIN** (Protect parts and labour margin). It comprises 8 screens, 13 API endpoints and 1 entities, gated by the `inventory` permission module.


## Actors

| Role | Data scope | Approval ceiling | Grants in this domain |
| --- | --- | --- | --- |
| owner | all | unlimited | `inventory:vcedax` |
| superadmin | platform | unlimited | `inventory:v` |
| manager | branch | SAR 50,000 | `inventory:vcedax` |
| advisor | branch | SAR 5,000 | `inventory:v` |
| technician | own | may not approve | `inventory:v` |
| parts | branch | SAR 10,000 | `inventory:vcedax` |
| accountant | all | SAR 25,000 | `inventory:vx` |
| procurement | all | SAR 20,000 | `inventory:vcex` |
| test | all | unlimited | `inventory:vcedax` |

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

| Table | Columns | Tenant | Branch | Soft delete | RLS | Money columns |
| --- | --- | --- | --- | --- | --- | --- |
| `parts` | 17 | yes | yes | yes | yes | `price_halalas`, `cost_halalas` |

### Relationships

| From | Column | To | Optionality | Enforcement |
| --- | --- | --- | --- | --- |
| `parts` | `org_id` | `organizations` | mandatory | FK |
| `parts` | `branch_id` | `branches` | optional | **convention only** |

Relationships marked *convention only* have no database constraint: an orphaned reference is possible and nothing cascades.

## API surface

| Method | Path | Permission | Kind | Idempotent | Tests |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/inventory` | inventory:v | generated | — | 10 |
| POST | `/api/v1/inventory` | inventory:c | generated | — | 10 |
| DELETE | `/api/v1/inventory/:id` | inventory:d | generated | — | **0** |
| GET | `/api/v1/inventory/:id` | inventory:v | generated | — | **0** |
| PATCH | `/api/v1/inventory/:id` | inventory:e | generated | — | **0** |
| GET | `/api/v1/inventory/:id/history` | inventory:v | explicit | — | **0** |
| POST | `/api/v1/inventory/:id/movement` | inventory:e | explicit | yes | **0** |
| GET | `/api/v1/inventory/:id/movements` | inventory:v | explicit | — | 1 |
| DELETE | `/api/v1/inventory/:id/reservation` | inventory:e | explicit | — | **0** |
| POST | `/api/v1/inventory/:id/reservation` | inventory:e | explicit | — | **0** |
| POST | `/api/v1/inventory/bulk-delete` | inventory:d | generated | — | **0** |
| POST | `/api/v1/inventory/bulk-update` | inventory:e | generated | — | **0** |
| GET | `/api/v1/inventory/export` | inventory:x | generated | — | **0** |

## Business rules

| ID | Rule | Kind | Enforced in |
| --- | --- | --- | --- |
| BR-INVENTORY-checkMovement | No negative stock unless the part is explicitly backorderable, and never a consumption larger than what is unreserved — unless it consumes a reservation, in which case the reservation is the bound. | GUARD | `packages/contract/src/rules/inventory.ts` |
| BR-INVENTORY-checkReceipt | Receiving quantity ≤ ordered quantity; over-receipt needs approval. | GUARD | `packages/contract/src/rules/inventory.ts` |
| BR-INVENTORY-checkReservation | `Reserved ≤ Available`. | GUARD | `packages/contract/src/rules/inventory.ts` |
| BR-INVENTORY-checkReservationRelease | A release cannot give back more than is held. | GUARD | `packages/contract/src/rules/inventory.ts` |
| BR-INVENTORY-movementDelta | The sign a movement type applies to on-hand quantity. For a transfer this is the sign of the *debit* row. The route writes the paired credit row (+qty against the destination branch) in the same transaction, so the org's books conserve; this function answers "what does the requested row do", which is also the feasibility question the guard below asks. | HELPER | `packages/contract/src/rules/inventory.ts` |

## Lifecycles

_No lifecycle in the contract belongs to this domain._

## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-Inventory | `/inventory` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-PartsNetwork.Incoming | `/parts-network/incoming` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-PartsNetwork.Members | `/parts-network/members` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-PartsNetwork.Orders | `/parts-network/orders` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-PartsNetwork.Quotations | `/parts-network/quotations` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-PartsNetwork.Requests | `/parts-network/requests` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-PartsNetwork.SendRequest | `/parts-network/send-request` | app | yes | yes | yes | yes | PARTIAL | yes |
| F-064 | `/interactive-3-d-parts` | app | yes | yes | yes | yes | PARTIAL | yes |

## Known gaps in this domain

- **10 of 13 endpoints have no test matched to them by path.** Matching is by path string, so this over-reports where a test reaches the endpoint through a helper.
- **1 of 2 relationships have no foreign key.** Integrity depends on application code; nothing cascades.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | `server/src/routes/collections.ts (generated from server/src/registry.ts)`, `server/src/routes/history.ts`, `server/src/routes/inventory.ts` |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | `packages/contract/src/rules/inventory.ts` |
| Screens | `project-control/MASTER_REGISTRY.json` |
