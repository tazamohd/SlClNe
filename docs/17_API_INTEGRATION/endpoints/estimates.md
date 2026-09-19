<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — estimates

**Status:** GENERATED · **Sources as of:** 2026-09-19 · 29 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/canned-jobs` | estimates:v | token | `cannedJobs` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/canned-jobs` | estimates:c | token | — | — | 1 | `server/src/routes/canned-jobs.ts` |
| GET | `/api/v1/canned-jobs/:id` | estimates:v | token | `cannedJobs` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/canned-jobs/:id` | estimates:e | token | — | — | — | `server/src/routes/canned-jobs.ts` |
| GET | `/api/v1/canned-jobs/:id/history` | estimates:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/canned-jobs/:id/lines` | estimates:v | token | — | — | — | `server/src/routes/canned-jobs.ts` |
| GET | `/api/v1/canned-jobs/export` | estimates:x | token | `cannedJobs` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/declined-jobs` | estimates:v | token | `declinedJobs` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/declined-jobs` | estimates:c | token | `declinedJobs` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/declined-jobs/:id` | estimates:d | token | `declinedJobs` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/declined-jobs/:id` | estimates:v | token | `declinedJobs` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/declined-jobs/:id` | estimates:e | token | `declinedJobs` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/declined-jobs/:id/history` | estimates:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/declined-jobs/bulk-delete` | estimates:d | token | `declinedJobs` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/declined-jobs/bulk-update` | estimates:e | token | `declinedJobs` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/declined-jobs/export` | estimates:x | token | `declinedJobs` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/estimates` | estimates:v | token | `estimates` | — | 9 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/estimates` | estimates:c | token | — | — | 9 | `server/src/routes/estimates.ts` |
| GET | `/api/v1/estimates/:id` | estimates:v | token | `estimates` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/estimates/:id` | estimates:e | token | — | — | — | `server/src/routes/estimates.ts` |
| POST | `/api/v1/estimates/:id/approve` | estimates:a | token | — | — | 3 | `server/src/routes/estimates.ts` |
| GET | `/api/v1/estimates/:id/history` | estimates:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/estimates/:id/lines` | estimates:v | token | — | — | — | `server/src/routes/estimates.ts` |
| POST | `/api/v1/estimates/:id/lines/:lineId/decline` | estimates:a | token | — | — | — | `server/src/routes/estimates.ts` |
| POST | `/api/v1/estimates/:id/reject` | estimates:a | token | — | — | 1 | `server/src/routes/estimates.ts` |
| POST | `/api/v1/estimates/:id/request-approval-otp` | estimates:e | token | — | — | — | `server/src/routes/estimate-otp.ts` |
| POST | `/api/v1/estimates/:id/verify-approval-otp` | estimates:e | token | — | — | 1 | `server/src/routes/estimate-otp.ts` |
| GET | `/api/v1/estimates/export` | estimates:x | token | `estimates` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/reports/declined-jobs` | estimates:v | token | — | — | 1 | `server/src/routes/declined-jobs-report.ts` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| estimates | `/estimates` | `code`, `customerName`, `vehicleLabel` | `code`, `customerName`, `totalHalalas`, `status`, `createdAt` | `status`, `jobCardId` | createdAt asc | read-only |
| cannedJobs | `/canned-jobs` | `name`, `category` | `name`, `priceHalalas`, `createdAt` | `active`, `category` | name asc | read-only |
| declinedJobs | `/declined-jobs` | `customerName`, `vehicleLabel`, `description` | `declinedAt`, `followUpDate`, `valueHalalas`, `status`, `createdAt` | `status`, `estimateId`, `reasonCategory`, `safetySeverity`, `advisorId` | declinedAt desc | yes |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
