<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — approvals

**Status:** GENERATED · **Sources as of:** 2026-09-17 · 5 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/approvals` | approvals:v | token | — | — | 1 | `server/src/routes/approvals.ts` |
| GET | `/api/v1/approvals/lines` | approvals:v | token | `approvalLines` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/approvals/lines/:id` | approvals:v | token | `approvalLines` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/approvals/lines/:id/history` | approvals:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/approvals/lines/export` | approvals:x | token | `approvalLines` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| approvalLines | `/approvals/lines` | `item` | `seq` | `kind`, `urgency` | seq asc | read-only |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
