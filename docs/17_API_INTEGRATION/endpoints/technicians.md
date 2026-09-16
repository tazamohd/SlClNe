<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — technicians

**Status:** GENERATED · **Sources as of:** 2026-09-09 · 4 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/technicians` | technicians:v | token | `technicians` | — | 3 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/technicians/:id` | technicians:v | token | `technicians` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/technicians/:id/history` | technicians:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/technicians/export` | technicians:x | token | `technicians` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| technicians | `/technicians` | `name`, `specialty` | `name`, `activeJobs`, `rating`, `createdAt` | — | createdAt asc | read-only |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
