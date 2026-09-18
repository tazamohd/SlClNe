<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — dashboard

**Status:** GENERATED · **Sources as of:** 2026-09-18 · 4 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/branches` | dashboard:v | token | `branches` | — | 2 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/branches/:id` | dashboard:v | token | `branches` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/branches/:id/history` | dashboard:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/branches/export` | dashboard:x | token | `branches` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| branches | `/branches` | `name`, `city` | `name`, `city`, `createdAt` | `isMain` | createdAt asc | read-only |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
