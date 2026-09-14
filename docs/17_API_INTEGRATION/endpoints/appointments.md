<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — appointments

**Status:** GENERATED · **Sources as of:** 2026-09-14 · 9 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/appointments` | appointments:v | token | `appointments` | — | 6 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/appointments` | appointments:c | token | `appointments` | — | 6 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/appointments/:id` | appointments:d | token | `appointments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/appointments/:id` | appointments:v | token | `appointments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/appointments/:id` | appointments:e | token | `appointments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/appointments/:id/history` | appointments:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/appointments/bulk-delete` | appointments:d | token | `appointments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/appointments/bulk-update` | appointments:e | token | `appointments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/appointments/export` | appointments:x | token | `appointments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| appointments | `/appointments` | `customerName`, `vehicleLabel`, `plate`, `serviceLabel`, `technicianName` | `scheduledDate`, `startMinute`, `bay`, `status`, `createdAt` | `status`, `bay`, `scheduledDate`, `technicianId` | startMinute asc | yes |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
