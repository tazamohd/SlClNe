<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — payments

**Status:** GENERATED · **Generated:** 2026-09-13 · 11 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/invoices/:id/payments` | payments:v | token | — | — | 2 | `server/src/routes/invoices.ts` |
| POST | `/api/v1/invoices/:id/payments` | payments:c | token | — | — | 2 | `server/src/routes/invoices.ts` |
| GET | `/api/v1/payments` | payments:v | token | `payments` | — | 2 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/payments/:id` | payments:v | token | `payments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/payments/:id/history` | payments:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/payments/export` | payments:x | token | `payments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/receipts` | payments:v | token | `receipts` | — | 3 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/receipts` | payments:c | token | — | — | 3 | `server/src/routes/invoices.ts` |
| GET | `/api/v1/receipts/:id` | payments:v | token | `receipts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/receipts/:id/history` | payments:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/receipts/export` | payments:x | token | `receipts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| invoicePayments | `/payments` | `reference`, `method` | `paidOn`, `amountHalalas`, `createdAt` | `invoiceId`, `method` | paidOn asc | read-only |
| receipts | `/receipts` | `code`, `customerName`, `invoiceCode` | `code`, `receiptDate`, `amountHalalas`, `createdAt` | `status`, `method` | createdAt asc | read-only |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
