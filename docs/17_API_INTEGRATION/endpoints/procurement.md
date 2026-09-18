<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — procurement

**Status:** GENERATED · **Sources as of:** 2026-09-18 · 28 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/procurement/purchase-orders` | procurement:v | token | `purchaseOrders` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/procurement/purchase-orders` | procurement:c | token | — | — | 1 | `server/src/routes/procurement.ts` |
| GET | `/api/v1/procurement/purchase-orders/:id` | procurement:v | token | `purchaseOrders` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/procurement/purchase-orders/:id` | procurement:e | token | — | — | — | `server/src/routes/procurement.ts` |
| POST | `/api/v1/procurement/purchase-orders/:id/approve` | procurement:a | token | — | — | 1 | `server/src/routes/procurement.ts` |
| GET | `/api/v1/procurement/purchase-orders/:id/history` | procurement:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/procurement/purchase-orders/:id/lines` | procurement:v | token | — | — | — | `server/src/routes/procurement.ts` |
| POST | `/api/v1/procurement/purchase-orders/:id/receive` | procurement:e | token | — | yes | — | `server/src/routes/procurement.ts` |
| GET | `/api/v1/procurement/purchase-orders/export` | procurement:x | token | `purchaseOrders` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/procurement/requisitions` | procurement:v | token | `requisitions` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/procurement/requisitions` | procurement:c | token | — | — | 1 | `server/src/routes/procurement.ts` |
| GET | `/api/v1/procurement/requisitions/:id` | procurement:v | token | `requisitions` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/procurement/requisitions/:id` | procurement:e | token | — | — | — | `server/src/routes/procurement.ts` |
| POST | `/api/v1/procurement/requisitions/:id/approve` | procurement:a | token | — | — | 1 | `server/src/routes/procurement.ts` |
| GET | `/api/v1/procurement/requisitions/:id/history` | procurement:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/procurement/requisitions/:id/lines` | procurement:v | token | — | — | — | `server/src/routes/procurement.ts` |
| POST | `/api/v1/procurement/requisitions/:id/reject` | procurement:a | token | — | — | 1 | `server/src/routes/procurement.ts` |
| POST | `/api/v1/procurement/requisitions/:id/submit` | procurement:e | token | — | — | — | `server/src/routes/procurement.ts` |
| GET | `/api/v1/procurement/requisitions/export` | procurement:x | token | `requisitions` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/procurement/suppliers` | procurement:v | token | `suppliers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/procurement/suppliers` | procurement:c | token | `suppliers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/procurement/suppliers/:id` | procurement:d | token | `suppliers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/procurement/suppliers/:id` | procurement:v | token | `suppliers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/procurement/suppliers/:id` | procurement:e | token | `suppliers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/procurement/suppliers/:id/history` | procurement:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/procurement/suppliers/bulk-delete` | procurement:d | token | `suppliers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/procurement/suppliers/bulk-update` | procurement:e | token | `suppliers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/procurement/suppliers/export` | procurement:x | token | `suppliers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| suppliers | `/procurement/suppliers` | `code`, `name`, `nameAr`, `contactName` | `code`, `name`, `status`, `createdAt` | `status` | createdAt asc | yes |
| requisitions | `/procurement/requisitions` | `code`, `requesterName`, `department` | `code`, `requesterName`, `estimatedTotalHalalas`, `status`, `neededBy`, `createdAt` | `status`, `priority` | createdAt asc | read-only |
| purchaseOrders | `/procurement/purchase-orders` | `code`, `supplierName` | `code`, `supplierName`, `totalHalalas`, `status`, `expectedAt`, `createdAt` | `status`, `supplierId`, `requisitionId` | createdAt asc | read-only |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
