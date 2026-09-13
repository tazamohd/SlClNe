<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — ai

**Status:** GENERATED · **Generated:** 2026-09-13 · 6 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/ai/agents/:id` | ai:v | token | `aiAgents` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/ai/agents/:id/history` | ai:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/ai/agents/export` | ai:x | token | `aiAgents` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/ai/conversations/:id` | ai:v | token | `conversations` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/ai/conversations/:id/history` | ai:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/ai/conversations/export` | ai:x | token | `conversations` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| aiAgents | `/ai/agents` | `name`, `role`, `model` | `name`, `tasks`, `createdAt` | `status` | createdAt asc | read-only |
| conversations | `/ai/conversations` | `title`, `userName` | `title`, `conversationDate`, `messageCount` | — | createdAt asc | read-only |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
