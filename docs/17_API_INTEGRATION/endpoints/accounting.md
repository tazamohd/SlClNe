<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — accounting

**Status:** GENERATED · **Sources as of:** 2026-09-19 · 38 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/accounting/coa` | accounting:v | token | `chartOfAccounts` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/accounting/coa/:id` | accounting:v | token | `chartOfAccounts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/accounting/coa/:id/history` | accounting:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/accounting/coa/export` | accounting:x | token | `chartOfAccounts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/accounting/expenses` | accounting:v | token | `expenses` | — | 5 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/accounting/expenses/:id` | accounting:v | token | `expenses` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/accounting/expenses/:id/history` | accounting:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/accounting/expenses/export` | accounting:x | token | `expenses` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/accounting/journal-entries` | accounting:v | token | `journalEntries` | — | 4 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/accounting/journal-entries/:id` | accounting:v | token | `journalEntries` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/accounting/journal-entries/:id/history` | accounting:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/accounting/journal-entries/export` | accounting:x | token | `journalEntries` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/accounting/reports/trial-balance` | accounting:v | token | — | — | 1 | `server/src/routes/finance-reports.ts` |
| GET | `/api/v1/accounting/tax/return` | accounting:v | token | — | — | 2 | `server/src/routes/finance-reports.ts` |
| GET | `/api/v1/bank-statements` | accounting:v | token | `bankStatements` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/bank-statements/:id` | accounting:v | token | `bankStatements` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/bank-statements/:id/history` | accounting:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/bank-statements/:id/match` | accounting:e | token | — | — | — | `server/src/routes/bank.ts` |
| GET | `/api/v1/bank-statements/export` | accounting:x | token | `bankStatements` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/equipment-warranties` | accounting:v | token | `equipmentWarranties` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/equipment-warranties` | accounting:c | token | `equipmentWarranties` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/equipment-warranties/:id` | accounting:d | token | `equipmentWarranties` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/equipment-warranties/:id` | accounting:v | token | `equipmentWarranties` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/equipment-warranties/:id` | accounting:e | token | `equipmentWarranties` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/equipment-warranties/:id/history` | accounting:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/equipment-warranties/bulk-delete` | accounting:d | token | `equipmentWarranties` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/equipment-warranties/bulk-update` | accounting:e | token | `equipmentWarranties` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/equipment-warranties/export` | accounting:x | token | `equipmentWarranties` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/organization/tax-profile` | accounting:v | token | — | — | 1 | `server/src/routes/organization.ts` |
| GET | `/api/v1/saved-reports` | accounting:v | token | `savedReports` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/saved-reports` | accounting:c | token | `savedReports` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/saved-reports/:id` | accounting:d | token | `savedReports` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/saved-reports/:id` | accounting:v | token | `savedReports` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/saved-reports/:id` | accounting:e | token | `savedReports` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/saved-reports/:id/history` | accounting:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/saved-reports/bulk-delete` | accounting:d | token | `savedReports` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/saved-reports/bulk-update` | accounting:e | token | `savedReports` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/saved-reports/export` | accounting:x | token | `savedReports` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| chartOfAccounts | `/accounting/coa` | `code`, `name` | `code`, `name`, `balanceHalalas` | `type`, `parentId` | code asc | read-only |
| journalEntries | `/accounting/journal-entries` | `code`, `ref`, `narration` | `code`, `entryDate`, `debitHalalas`, `status` | `status` | createdAt asc | read-only |
| expenses | `/accounting/expenses` | `code`, `category`, `vendor` | `code`, `expenseDate`, `amountHalalas`, `status` | `status`, `category` | createdAt asc | read-only |
| bankStatements | `/bank-statements` | `description`, `reference` | `statementDate`, `amountHalalas`, `createdAt` | `matched`, `direction` | statementDate desc | read-only |
| savedReports | `/saved-reports` | `name`, `source` | `name`, `createdAt` | `source` | createdAt desc | yes |
| equipmentWarranties | `/equipment-warranties` | `warrantyNumber`, `itemName`, `provider` | `warrantyNumber`, `itemName`, `endDate`, `status`, `createdAt` | `status`, `coverage` | endDate asc | yes |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
