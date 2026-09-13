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

# Domain — Invoicing and payments

**Status:** GENERATED · **Capability:** CAP-BILLING · **Generated:** 2026-09-13

## Purpose and scope

This domain serves the objective **OBJ-CASH** (Shorten the cash cycle). It comprises 6 screens, 20 API endpoints and 3 entities, gated by the `invoices`, `payments` permission modules.


## Actors

| Role | Data scope | Approval ceiling | Grants in this domain |
| --- | --- | --- | --- |
| owner | all | unlimited | `invoices:vcedax` `payments:vcedax` |
| superadmin | platform | unlimited | `invoices:v` `payments:v` |
| manager | branch | SAR 50,000 | `invoices:vceax` `payments:vcax` |
| advisor | branch | SAR 5,000 | `invoices:vc` `payments:vc` |
| accountant | all | SAR 25,000 | `invoices:vcedax` `payments:vcedax` |
| frontdesk | branch | may not approve | `invoices:vc` `payments:vc` |
| callcenter | all | may not approve | `invoices:v` |
| customer | self | may not approve | `invoices:v` |
| test | all | unlimited | `invoices:vcedax` `payments:vcedax` |

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

| Table | Columns | Tenant | Branch | Soft delete | RLS | Money columns |
| --- | --- | --- | --- | --- | --- | --- |
| `invoices` | 28 | yes | yes | yes | yes | `subtotal_halalas`, `tax_halalas`, `discount_halalas`, `total_halalas`, `paid_halalas` |
| `payments` | 16 | yes | yes | yes | yes | `amount_halalas` |
| `receipts` | 16 | yes | yes | yes | yes | `amount_halalas` |

### Relationships

| From | Column | To | Optionality | Enforcement |
| --- | --- | --- | --- | --- |
| `invoices` | `org_id` | `organizations` | mandatory | FK |
| `invoices` | `branch_id` | `branches` | optional | **convention only** |
| `invoices` | `customer_id` | `customers` | optional | **convention only** |
| `invoices` | `job_card_id` | `job_cards` | optional | **convention only** |
| `invoices` | `vehicle_id` | `vehicles` | optional | **convention only** |
| `payments` | `org_id` | `organizations` | mandatory | FK |
| `payments` | `branch_id` | `branches` | optional | **convention only** |
| `payments` | `invoice_id` | `invoices` | optional | **convention only** |
| `receipts` | `org_id` | `organizations` | mandatory | FK |
| `receipts` | `branch_id` | `branches` | optional | **convention only** |

Relationships marked *convention only* have no database constraint: an orphaned reference is possible and nothing cascades.

## API surface

| Method | Path | Permission | Kind | Idempotent | Tests |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/invoice-lines/:id` | invoices:v | generated | — | **0** |
| GET | `/api/v1/invoice-lines/:id/history` | invoices:v | explicit | — | **0** |
| GET | `/api/v1/invoice-lines/export` | invoices:x | generated | — | **0** |
| POST | `/api/v1/invoices` | invoices:c | explicit | — | 8 |
| GET | `/api/v1/invoices/:id` | invoices:v | generated | — | **0** |
| PATCH | `/api/v1/invoices/:id` | invoices:e | explicit | — | **0** |
| GET | `/api/v1/invoices/:id/history` | invoices:v | explicit | — | **0** |
| POST | `/api/v1/invoices/:id/issue` | invoices:e | explicit | — | **0** |
| GET | `/api/v1/invoices/:id/lines` | invoices:v | explicit | — | **0** |
| GET | `/api/v1/invoices/:id/payments` | payments:v | explicit | — | 2 |
| POST | `/api/v1/invoices/:id/payments` | payments:c | explicit | — | 2 |
| GET | `/api/v1/invoices/export` | invoices:x | generated | — | **0** |
| GET | `/api/v1/invoices/summary` | invoices:v | explicit | — | 1 |
| GET | `/api/v1/payments/:id` | payments:v | generated | — | **0** |
| GET | `/api/v1/payments/:id/history` | payments:v | explicit | — | **0** |
| GET | `/api/v1/payments/export` | payments:x | generated | — | **0** |
| POST | `/api/v1/receipts` | payments:c | explicit | — | 3 |
| GET | `/api/v1/receipts/:id` | payments:v | generated | — | **0** |
| GET | `/api/v1/receipts/:id/history` | payments:v | explicit | — | **0** |
| GET | `/api/v1/receipts/export` | payments:x | generated | — | **0** |

## Business rules

_No rule guard in `packages/contract/src/rules` is specific to this domain. Any constraint is in the route handlers, or absent._

## Lifecycles

### `invoiceStatus` (invoice)

**State set only** — states: `draft`, `unpaid`, `partial`, `paid`, `overdue`, `cancelled`. No transition table is declared; legal moves are whatever the route handlers check.


## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-InvoiceCreate | `/invoice-create` | app | yes | yes | — | — | PARTIAL | yes |
| D-InvoiceDetail | `/invoice-detail` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-InvoicePreview | `/invoice-preview` | app | yes | yes | — | — | verified | yes |
| D-Invoices | `/invoices` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-Payments | `/payments` | app | yes | yes | yes | yes | verified | yes |
| D-Receipts | `/receipts` | app | yes | yes | yes | yes | PARTIAL | yes |

## Known gaps in this domain

- **15 of 20 endpoints have no test matched to them by path.** Matching is by path string, so this over-reports where a test reaches the endpoint through a helper.
- **1 lifecycle (`invoiceStatus`) declare states but no legal transitions.** An illegal move is refused only where a handler happens to check.
- **7 of 10 relationships have no foreign key.** Integrity depends on application code; nothing cascades.
- **No rule guard in the shared contract is specific to this domain.** Any business constraint lives in route handlers, where it is not reusable by the form and not asserted by a contract test.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | `server/src/routes/collections.ts (generated from server/src/registry.ts)`, `server/src/routes/history.ts`, `server/src/routes/invoices.ts`, `server/src/routes/finance-reports.ts` |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | — |
| Screens | `project-control/MASTER_REGISTRY.json` |
