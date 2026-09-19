<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — network

**Status:** GENERATED · **Sources as of:** 2026-09-19 · 37 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/parts-network/members` | network:v | token | `partsNetworkMembers` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/parts-network/members` | network:c | token | `partsNetworkMembers` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/parts-network/members/:id` | network:d | token | `partsNetworkMembers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/parts-network/members/:id` | network:v | token | `partsNetworkMembers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/parts-network/members/:id` | network:e | token | `partsNetworkMembers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/parts-network/members/:id/history` | network:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/parts-network/members/bulk-delete` | network:d | token | `partsNetworkMembers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/parts-network/members/bulk-update` | network:e | token | `partsNetworkMembers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/parts-network/members/export` | network:x | token | `partsNetworkMembers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/parts-network/orders` | network:v | token | `partsNetworkOrders` | — | 4 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/parts-network/orders` | network:c | token | `partsNetworkOrders` | — | 4 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/parts-network/orders/:id` | network:d | token | `partsNetworkOrders` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/parts-network/orders/:id` | network:v | token | `partsNetworkOrders` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/parts-network/orders/:id` | network:e | token | `partsNetworkOrders` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/parts-network/orders/:id/history` | network:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/parts-network/orders/bulk-delete` | network:d | token | `partsNetworkOrders` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/parts-network/orders/bulk-update` | network:e | token | `partsNetworkOrders` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/parts-network/orders/export` | network:x | token | `partsNetworkOrders` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/parts-network/quotations` | network:v | token | `partsNetworkQuotations` | — | 4 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/parts-network/quotations` | network:c | token | `partsNetworkQuotations` | — | 4 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/parts-network/quotations/:id` | network:d | token | `partsNetworkQuotations` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/parts-network/quotations/:id` | network:v | token | `partsNetworkQuotations` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/parts-network/quotations/:id` | network:e | token | `partsNetworkQuotations` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/parts-network/quotations/:id/accept` | network:a | token | — | — | — | `server/src/routes/parts-network.ts` |
| GET | `/api/v1/parts-network/quotations/:id/history` | network:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/parts-network/quotations/bulk-delete` | network:d | token | `partsNetworkQuotations` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/parts-network/quotations/bulk-update` | network:e | token | `partsNetworkQuotations` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/parts-network/quotations/export` | network:x | token | `partsNetworkQuotations` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/parts-network/requests` | network:v | token | `partsNetworkRequests` | — | 4 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/parts-network/requests` | network:c | token | `partsNetworkRequests` | — | 4 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/parts-network/requests/:id` | network:d | token | `partsNetworkRequests` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/parts-network/requests/:id` | network:v | token | `partsNetworkRequests` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/parts-network/requests/:id` | network:e | token | `partsNetworkRequests` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/parts-network/requests/:id/history` | network:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/parts-network/requests/bulk-delete` | network:d | token | `partsNetworkRequests` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/parts-network/requests/bulk-update` | network:e | token | `partsNetworkRequests` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/parts-network/requests/export` | network:x | token | `partsNetworkRequests` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| partsNetworkMembers | `/parts-network/members` | `code`, `name`, `city`, `contactName` | `code`, `name`, `kind`, `city`, `status`, `ratingTenths`, `createdAt` | `kind`, `status` | name asc | yes |
| partsNetworkRequests | `/parts-network/requests` | `code`, `partName`, `partNumber`, `memberName`, `vehicleInfo` | `code`, `partName`, `qty`, `urgency`, `status`, `neededBy`, `createdAt` | `direction`, `status`, `urgency`, `memberId` | createdAt desc | yes |
| partsNetworkQuotations | `/parts-network/quotations` | `code`, `memberName` | `code`, `memberName`, `unitPriceHalalas`, `leadTimeDays`, `status`, `createdAt` | `requestId`, `status`, `condition`, `memberId` | unitPriceHalalas asc | yes |
| partsNetworkOrders | `/parts-network/orders` | `code`, `memberName`, `partName`, `trackingRef` | `code`, `memberName`, `partName`, `totalHalalas`, `status`, `expectedAt`, `createdAt` | `direction`, `status`, `memberId`, `requestId` | createdAt desc | yes |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
