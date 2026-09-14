<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — admin

**Status:** GENERATED · **Sources as of:** 2026-09-14 · 4 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/admin/departments` | admin:v | token | `departments` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/admin/departments/:id` | admin:v | token | `departments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/admin/departments/:id/history` | admin:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/admin/departments/export` | admin:x | token | `departments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| departments | `/admin/departments` | `name`, `head`, `costCenter` | `name`, `headcount`, `createdAt` | — | createdAt asc | read-only |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
