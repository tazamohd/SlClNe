<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — inventory

**Status:** GENERATED · **Sources as of:** 2026-09-19 · 22 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/inventory` | inventory:v | token | `parts` | — | 11 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/inventory` | inventory:c | token | `parts` | — | 11 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/inventory/:id` | inventory:d | token | `parts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/inventory/:id` | inventory:v | token | `parts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/inventory/:id` | inventory:e | token | `parts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/inventory/:id/history` | inventory:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/inventory/:id/movement` | inventory:e | token | — | yes | — | `server/src/routes/inventory.ts` |
| GET | `/api/v1/inventory/:id/movements` | inventory:v | token | — | — | 1 | `server/src/routes/inventory.ts` |
| DELETE | `/api/v1/inventory/:id/reservation` | inventory:e | token | — | — | — | `server/src/routes/inventory.ts` |
| POST | `/api/v1/inventory/:id/reservation` | inventory:e | token | — | — | — | `server/src/routes/inventory.ts` |
| POST | `/api/v1/inventory/bulk-delete` | inventory:d | token | `parts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/inventory/bulk-update` | inventory:e | token | `parts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/inventory/export` | inventory:x | token | `parts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/warehouse-zones` | inventory:v | token | `warehouseZones` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/warehouse-zones` | inventory:c | token | `warehouseZones` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/warehouse-zones/:id` | inventory:d | token | `warehouseZones` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/warehouse-zones/:id` | inventory:v | token | `warehouseZones` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/warehouse-zones/:id` | inventory:e | token | `warehouseZones` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/warehouse-zones/:id/history` | inventory:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/warehouse-zones/bulk-delete` | inventory:d | token | `warehouseZones` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/warehouse-zones/bulk-update` | inventory:e | token | `warehouseZones` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/warehouse-zones/export` | inventory:x | token | `warehouseZones` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| parts | `/inventory` | `name`, `sku` | `name`, `sku`, `onHand`, `priceHalalas`, `createdAt` | `backorderable` | createdAt asc | yes |
| warehouseZones | `/warehouse-zones` | `code`, `name`, `nameAr` | `code`, `name`, `capacityUnits`, `status`, `createdAt` | `status`, `kind` | code asc | yes |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
