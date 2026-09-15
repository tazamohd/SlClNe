<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — customers

**Status:** GENERATED · **Sources as of:** 2026-09-15 · 19 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/customers` | customers:v | token | `customers` | — | 14 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/customers` | customers:c | token | `customers` | — | 14 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/customers/:id` | customers:d | token | `customers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/customers/:id` | customers:v | token | `customers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/customers/:id` | customers:e | token | `customers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/customers/:id/history` | customers:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/customers/bulk-delete` | customers:d | token | `customers` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/customers/bulk-update` | customers:e | token | `customers` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/customers/export` | customers:x | token | `customers` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/fleets` | customers:v | token | `fleets` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/fleets` | customers:c | token | `fleets` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/fleets/:id` | customers:d | token | `fleets` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/fleets/:id` | customers:v | token | `fleets` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/fleets/:id` | customers:e | token | `fleets` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/fleets/:id/history` | customers:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/fleets/:id/renew` | customers:e | token | — | — | — | `server/src/routes/fleets.ts` |
| POST | `/api/v1/fleets/bulk-delete` | customers:d | token | `fleets` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/fleets/bulk-update` | customers:e | token | `fleets` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/fleets/export` | customers:x | token | `fleets` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| customers | `/customers` | `name`, `phone`, `email` | `name`, `phone`, `totalSpentHalalas`, `vehicleCount`, `createdAt` | `type`, `fleetId` | createdAt asc | yes |
| fleets | `/fleets` | `name`, `contactName` | `name`, `vehicleCount`, `contractValueHalalas`, `renewalDate`, `createdAt` | `contractStatus`, `contractType` | createdAt asc | yes |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
