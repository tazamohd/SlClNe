<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — invoices

**Status:** GENERATED · **Sources as of:** 2026-09-18 · 14 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/estimates/:id/invoice` | invoices:c | token | — | — | — | `server/src/routes/invoices.ts` |
| GET | `/api/v1/invoice-lines` | invoices:v | token | `invoiceLines` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/invoice-lines/:id` | invoices:v | token | `invoiceLines` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/invoice-lines/:id/history` | invoices:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/invoice-lines/export` | invoices:x | token | `invoiceLines` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/invoices` | invoices:v | token | `invoices` | — | 9 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/invoices` | invoices:c | token | — | — | 9 | `server/src/routes/invoices.ts` |
| GET | `/api/v1/invoices/:id` | invoices:v | token | `invoices` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/invoices/:id` | invoices:e | token | — | — | — | `server/src/routes/invoices.ts` |
| GET | `/api/v1/invoices/:id/history` | invoices:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/invoices/:id/issue` | invoices:e | token | — | — | — | `server/src/routes/invoices.ts` |
| GET | `/api/v1/invoices/:id/lines` | invoices:v | token | — | — | — | `server/src/routes/invoices.ts` |
| GET | `/api/v1/invoices/export` | invoices:x | token | `invoices` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/invoices/summary` | invoices:v | token | — | — | 1 | `server/src/routes/finance-reports.ts` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| invoices | `/invoices` | `code`, `customerName` | `code`, `customerName`, `dueDate`, `totalHalalas`, `status`, `createdAt` | `status`, `customerId`, `jobCardId` | createdAt asc | read-only |
| invoiceLines | `/invoice-lines` | `description`, `partSku` | `sort`, `createdAt` | `invoiceId`, `kind` | sort asc | read-only |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
