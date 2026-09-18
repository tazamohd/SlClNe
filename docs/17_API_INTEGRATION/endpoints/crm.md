<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — crm

**Status:** GENERATED · **Sources as of:** 2026-09-19 · 45 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/crm/campaigns` | crm:v | token | `campaigns` | — | 2 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/campaigns/:id` | crm:v | token | `campaigns` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/campaigns/:id/history` | crm:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/crm/campaigns/export` | crm:x | token | `campaigns` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/leads` | crm:v | token | `leads` | — | 2 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/crm/leads` | crm:c | token | `leads` | — | 2 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/crm/leads/:id` | crm:d | token | `leads` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/leads/:id` | crm:v | token | `leads` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/crm/leads/:id` | crm:e | token | `leads` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/crm/leads/:id/convert` | crm:c | token | — | — | — | `server/src/routes/crm.ts` |
| GET | `/api/v1/crm/leads/:id/history` | crm:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/crm/leads/bulk-delete` | crm:d | token | `leads` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/crm/leads/bulk-update` | crm:e | token | `leads` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/leads/export` | crm:x | token | `leads` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/opportunities` | crm:v | token | `opportunities` | — | 2 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/crm/opportunities` | crm:c | token | `opportunities` | — | 2 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/crm/opportunities/:id` | crm:d | token | `opportunities` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/opportunities/:id` | crm:v | token | `opportunities` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/crm/opportunities/:id` | crm:e | token | `opportunities` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/opportunities/:id/history` | crm:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/crm/opportunities/bulk-delete` | crm:d | token | `opportunities` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/crm/opportunities/bulk-update` | crm:e | token | `opportunities` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/opportunities/export` | crm:x | token | `opportunities` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/segments` | crm:v | token | `segments` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/segments/:id` | crm:v | token | `segments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/segments/:id/history` | crm:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/crm/segments/export` | crm:x | token | `segments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/tasks` | crm:v | token | `crmTasks` | — | 2 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/crm/tasks` | crm:c | token | `crmTasks` | — | 2 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/crm/tasks/:id` | crm:d | token | `crmTasks` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/tasks/:id` | crm:v | token | `crmTasks` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/crm/tasks/:id` | crm:e | token | `crmTasks` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/tasks/:id/history` | crm:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/crm/tasks/bulk-delete` | crm:d | token | `crmTasks` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/crm/tasks/bulk-update` | crm:e | token | `crmTasks` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/crm/tasks/export` | crm:x | token | `crmTasks` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/customer-feedback` | crm:v | token | `customerFeedback` | — | 5 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/customer-feedback` | crm:c | token | `customerFeedback` | — | 5 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/customer-feedback/:id` | crm:d | token | `customerFeedback` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/customer-feedback/:id` | crm:v | token | `customerFeedback` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/customer-feedback/:id` | crm:e | token | `customerFeedback` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/customer-feedback/:id/history` | crm:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/customer-feedback/bulk-delete` | crm:d | token | `customerFeedback` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/customer-feedback/bulk-update` | crm:e | token | `customerFeedback` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/customer-feedback/export` | crm:x | token | `customerFeedback` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| leads | `/crm/leads` | `name`, `company`, `source` | `name`, `valueHalalas`, `score`, `stage`, `createdAt` | `stage`, `source` | createdAt asc | yes |
| opportunities | `/crm/opportunities` | `name`, `company`, `ownerName` | `name`, `valueHalalas`, `stage`, `closeDate`, `createdAt` | `stage` | createdAt asc | yes |
| campaigns | `/crm/campaigns` | `name` | `name`, `reach`, `conversions`, `createdAt` | `type`, `status` | createdAt asc | read-only |
| segments | `/crm/segments` | `name`, `rules` | `name`, `memberCount`, `createdAt` | — | createdAt asc | read-only |
| crmTasks | `/crm/tasks` | `title`, `assignedTo` | `title`, `dueDate`, `priority`, `status`, `createdAt` | `status`, `priority`, `type` | createdAt asc | yes |
| feedback | `/customer-feedback` | `comment`, `customerName` | `rating`, `createdAt` | `rating`, `jobCardId`, `customerId` | createdAt desc | yes |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
