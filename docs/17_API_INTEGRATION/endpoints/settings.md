<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — settings

**Status:** GENERATED · **Sources as of:** 2026-09-14 · 8 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/integrations` | settings:v | token | `integrations` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/integrations/:id` | settings:v | token | `integrations` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/integrations/:id/history` | settings:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/integrations/export` | settings:x | token | `integrations` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/integrations/oem-tools` | settings:v | token | `oemTools` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/integrations/oem-tools/:id` | settings:v | token | `oemTools` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/integrations/oem-tools/:id/history` | settings:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/integrations/oem-tools/export` | settings:x | token | `oemTools` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| oemTools | `/integrations/oem-tools` | `brand`, `tool`, `protocol` | `brand`, `vehicleCount`, `expiresOn` | `status` | createdAt asc | read-only |
| integrations | `/integrations` | `name`, `category` | `name`, `category` | `status`, `category` | createdAt asc | read-only |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
