<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — insurance

**Status:** GENERATED · **Sources as of:** 2026-09-19 · 22 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/insurance-claims` | insurance:v | token | `insuranceClaims` | — | 3 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/insurance-claims` | insurance:c | token | — | — | 3 | `server/src/routes/insurance-claims.ts` |
| GET | `/api/v1/insurance-claims/:id` | insurance:v | token | `insuranceClaims` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/insurance-claims/:id/approve` | insurance:a | token | — | — | 1 | `server/src/routes/insurance-claims.ts` |
| GET | `/api/v1/insurance-claims/:id/history` | insurance:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/insurance-claims/:id/pay` | insurance:e | token | — | — | — | `server/src/routes/insurance-claims.ts` |
| POST | `/api/v1/insurance-claims/:id/reject` | insurance:a | token | — | — | 1 | `server/src/routes/insurance-claims.ts` |
| GET | `/api/v1/insurance-claims/export` | insurance:x | token | `insuranceClaims` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/insurance-policies` | insurance:v | token | `insurancePolicies` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/insurance-policies/:id` | insurance:v | token | `insurancePolicies` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/insurance-policies/:id/history` | insurance:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/insurance-policies/export` | insurance:x | token | `insurancePolicies` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/insurance/claims/summary` | insurance:v | token | — | — | 1 | `server/src/routes/product-reports.ts` |
| GET | `/api/v1/loan-contracts` | insurance:v | token | `loanContracts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/loan-contracts/:id` | insurance:v | token | `loanContracts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/loan-contracts/:id/history` | insurance:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/loan-contracts/export` | insurance:x | token | `loanContracts` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/loan-repayments` | insurance:v | token | `loanRepayments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/loan-repayments/:id` | insurance:v | token | `loanRepayments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/loan-repayments/:id/history` | insurance:v | token | — | — | — | `server/src/routes/history.ts` |
| GET | `/api/v1/loan-repayments/export` | insurance:x | token | `loanRepayments` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/loans/summary` | insurance:v | token | — | — | 1 | `server/src/routes/product-reports.ts` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| insurancePolicies | `/insurance-policies` | `policyNumber`, `insurer`, `holderName`, `vehicleLabel` | `policyNumber`, `insurer`, `premiumHalalas`, `endDate`, `status`, `createdAt` | `status`, `type`, `customerId`, `vehicleId` | createdAt asc | read-only |
| insuranceClaims | `/insurance-claims` | `claimNumber`, `policyNumber`, `vehicleLabel`, `description` | `claimNumber`, `amountClaimedHalalas`, `status`, `incidentDate`, `createdAt` | `status`, `policyId`, `vehicleId`, `jobCardId` | createdAt asc | read-only |
| loanContracts | `/loan-contracts` | `contractNumber`, `borrowerName` | `contractNumber`, `principalHalalas`, `status`, `startDate`, `createdAt` | `status`, `customerId` | createdAt asc | read-only |
| loanRepayments | `/loan-repayments` | `contractNumber` | `sequence`, `dueDate`, `amountDueHalalas`, `status`, `createdAt` | `status`, `loanContractId` | sequence asc | read-only |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
