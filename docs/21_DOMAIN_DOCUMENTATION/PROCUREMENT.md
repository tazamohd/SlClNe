<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/domains.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - project-control/CAPABILITY_REGISTRY.json
       - project-control/API_REGISTRY.json
       - project-control/ENTITY_REGISTRY.json
       - project-control/PERMISSION_REGISTRY.json
       - project-control/BUSINESS_RULES.json
       - project-control/MASTER_REGISTRY.json
-->

# Domain — Procurement

**Status:** GENERATED · **Capability:** CAP-PROCUREMENT · **Sources as of:** 2026-09-14

## Purpose and scope

This domain serves the objective **OBJ-MARGIN** (Protect parts and labour margin). It comprises 1 screens, 28 API endpoints and 2 entities, gated by the `procurement` permission module.


## Actors

| Role | Data scope | Approval ceiling | Grants in this domain |
| --- | --- | --- | --- |
| owner | all | unlimited | `procurement:vcedax` |
| superadmin | platform | unlimited | `procurement:v` |
| manager | branch | SAR 50,000 | `procurement:vcax` |
| parts | branch | SAR 10,000 | `procurement:vc` |
| accountant | all | SAR 25,000 | `procurement:vax` |
| procurement | all | SAR 20,000 | `procurement:vcedax` |
| supplier | external | may not approve | `procurement:v` |
| test | all | unlimited | `procurement:vcedax` |

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

| Table | Columns | Tenant | Branch | Soft delete | RLS | Money columns |
| --- | --- | --- | --- | --- | --- | --- |
| `suppliers` | 17 | yes | yes | yes | yes | — |
| `requisitions` | 20 | yes | yes | yes | yes | `estimated_total_halalas` |

### Relationships

| From | Column | To | Optionality | Enforcement |
| --- | --- | --- | --- | --- |
| `suppliers` | `org_id` | `organizations` | mandatory | FK |
| `suppliers` | `branch_id` | `branches` | optional | **convention only** |
| `requisitions` | `org_id` | `organizations` | mandatory | FK |
| `requisitions` | `branch_id` | `branches` | optional | **convention only** |

Relationships marked *convention only* have no database constraint: an orphaned reference is possible and nothing cascades.

## API surface

| Method | Path | Permission | Kind | Idempotent | Tests |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/procurement/purchase-orders` | procurement:v | generated | — | **0** |
| POST | `/api/v1/procurement/purchase-orders` | procurement:c | explicit | — | **0** |
| GET | `/api/v1/procurement/purchase-orders/:id` | procurement:v | generated | — | **0** |
| PATCH | `/api/v1/procurement/purchase-orders/:id` | procurement:e | explicit | — | **0** |
| POST | `/api/v1/procurement/purchase-orders/:id/approve` | procurement:a | explicit | — | **0** |
| GET | `/api/v1/procurement/purchase-orders/:id/history` | procurement:v | explicit | — | **0** |
| GET | `/api/v1/procurement/purchase-orders/:id/lines` | procurement:v | explicit | — | **0** |
| POST | `/api/v1/procurement/purchase-orders/:id/receive` | procurement:e | explicit | yes | **0** |
| GET | `/api/v1/procurement/purchase-orders/export` | procurement:x | generated | — | **0** |
| GET | `/api/v1/procurement/requisitions` | procurement:v | generated | — | **0** |
| POST | `/api/v1/procurement/requisitions` | procurement:c | explicit | — | **0** |
| GET | `/api/v1/procurement/requisitions/:id` | procurement:v | generated | — | **0** |
| PATCH | `/api/v1/procurement/requisitions/:id` | procurement:e | explicit | — | **0** |
| POST | `/api/v1/procurement/requisitions/:id/approve` | procurement:a | explicit | — | **0** |
| GET | `/api/v1/procurement/requisitions/:id/history` | procurement:v | explicit | — | **0** |
| GET | `/api/v1/procurement/requisitions/:id/lines` | procurement:v | explicit | — | **0** |
| POST | `/api/v1/procurement/requisitions/:id/reject` | procurement:a | explicit | — | **0** |
| POST | `/api/v1/procurement/requisitions/:id/submit` | procurement:e | explicit | — | **0** |
| GET | `/api/v1/procurement/requisitions/export` | procurement:x | generated | — | **0** |
| GET | `/api/v1/procurement/suppliers` | procurement:v | generated | — | **0** |
| POST | `/api/v1/procurement/suppliers` | procurement:c | generated | — | **0** |
| DELETE | `/api/v1/procurement/suppliers/:id` | procurement:d | generated | — | **0** |
| GET | `/api/v1/procurement/suppliers/:id` | procurement:v | generated | — | **0** |
| PATCH | `/api/v1/procurement/suppliers/:id` | procurement:e | generated | — | **0** |
| GET | `/api/v1/procurement/suppliers/:id/history` | procurement:v | explicit | — | **0** |
| POST | `/api/v1/procurement/suppliers/bulk-delete` | procurement:d | generated | — | **0** |
| POST | `/api/v1/procurement/suppliers/bulk-update` | procurement:e | generated | — | **0** |
| GET | `/api/v1/procurement/suppliers/export` | procurement:x | generated | — | **0** |

## Business rules

| ID | Rule | Kind | Enforced in |
| --- | --- | --- | --- |
| BR-PROCUREMENT-checkPurchaseOrderApprovable | A purchase order may only be approved while it is a draft. | GUARD | `packages/contract/src/rules/procurement.ts` |
| BR-PROCUREMENT-checkReceive | Receiving quantity ≤ ordered quantity (§5b). An over-receipt is never returned as `ok`: the caller must refuse it or route it to approval. | GUARD | `packages/contract/src/rules/procurement.ts` |
| BR-PROCUREMENT-purchaseOrderTotals | `subtotal + VAT`, summed from the lines by the server. Never sent by the client — a purchase order's total is decided here. | HELPER | `packages/contract/src/rules/procurement.ts` |
| BR-PROCUREMENT-requisitionEstimatedTotalHalalas | The VAT-exclusive estimated value of a requisition's lines. | HELPER | `packages/contract/src/rules/procurement.ts` |

## Lifecycles

_No lifecycle in the contract belongs to this domain._

## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-PurchaseOrder | `/purchase-order` | app | yes | yes | yes | yes | PARTIAL | yes |

## Known gaps in this domain

- **28 of 28 endpoints have no test matched to them by path.** Matching is by path string, so this over-reports where a test reaches the endpoint through a helper.
- **2 of 4 relationships have no foreign key.** Integrity depends on application code; nothing cascades.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | `server/src/routes/collections.ts (generated from server/src/registry.ts)`, `server/src/routes/procurement.ts`, `server/src/routes/history.ts` |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | `packages/contract/src/rules/procurement.ts` |
| Screens | `project-control/MASTER_REGISTRY.json` |
