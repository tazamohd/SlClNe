<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — vehicles

**Status:** GENERATED · **Sources as of:** 2026-09-09 · 9 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/vehicles` | vehicles:v | token | `vehicles` | — | 7 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/vehicles` | vehicles:c | token | `vehicles` | — | 7 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/vehicles/:id` | vehicles:d | token | `vehicles` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/vehicles/:id` | vehicles:v | token | `vehicles` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/vehicles/:id` | vehicles:e | token | `vehicles` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/vehicles/:id/history` | vehicles:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/vehicles/bulk-delete` | vehicles:d | token | `vehicles` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/vehicles/bulk-update` | vehicles:e | token | `vehicles` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/vehicles/export` | vehicles:x | token | `vehicles` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| vehicles | `/vehicles` | `plate`, `makeModel`, `ownerName`, `vin` | `plate`, `makeModel`, `mileageKm`, `status`, `createdAt` | `status`, `customerId` | createdAt asc | yes |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
