<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/domains.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - project-control/CAPABILITY_REGISTRY.json
       - project-control/API_REGISTRY.json
       - project-control/ENTITY_REGISTRY.json
       - project-control/PERMISSION_REGISTRY.json
       - project-control/BUSINESS_RULES.json
       - project-control/MASTER_REGISTRY.json
-->

# Domain — Accounting and finance

**Status:** GENERATED · **Capability:** CAP-ACCOUNTING · **Sources as of:** 2026-09-18

## Purpose and scope

This domain serves the objective **OBJ-CASH** (Shorten the cash cycle). It comprises 7 screens, 50 API endpoints and 1 entities, gated by the `accounting` permission module.


## Actors

| Role | Data scope | Approval ceiling | Grants in this domain |
| --- | --- | --- | --- |
| owner | all | unlimited | `accounting:vax` |
| superadmin | platform | unlimited | `accounting:v` |
| manager | branch | SAR 50,000 | `accounting:vx` |
| accountant | all | SAR 25,000 | `accounting:vcedax` |
| test | all | unlimited | `accounting:vcedax` |

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

| Table | Columns | Tenant | Branch | Soft delete | RLS | Money columns |
| --- | --- | --- | --- | --- | --- | --- |
| `expenses` | 15 | yes | yes | yes | yes | `amount_halalas` |

### Relationships

| From | Column | To | Optionality | Enforcement |
| --- | --- | --- | --- | --- |
| `expenses` | `org_id` | `organizations` | mandatory | FK |
| `expenses` | `branch_id` | `branches` | optional | **convention only** |

Relationships marked *convention only* have no database constraint: an orphaned reference is possible and nothing cascades.

## API surface

| Method | Path | Permission | Kind | Idempotent | Tests |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/accounting/coa` | accounting:v | generated | — | 1 |
| GET | `/api/v1/accounting/coa/:id` | accounting:v | generated | — | **0** |
| GET | `/api/v1/accounting/coa/:id/history` | accounting:v | explicit | — | **0** |
| GET | `/api/v1/accounting/coa/export` | accounting:x | generated | — | **0** |
| GET | `/api/v1/accounting/expenses` | accounting:v | generated | — | 5 |
| GET | `/api/v1/accounting/expenses/:id` | accounting:v | generated | — | **0** |
| GET | `/api/v1/accounting/expenses/:id/history` | accounting:v | explicit | — | **0** |
| GET | `/api/v1/accounting/expenses/export` | accounting:x | generated | — | **0** |
| GET | `/api/v1/accounting/journal-entries` | accounting:v | generated | — | 4 |
| GET | `/api/v1/accounting/journal-entries/:id` | accounting:v | generated | — | **0** |
| GET | `/api/v1/accounting/journal-entries/:id/history` | accounting:v | explicit | — | **0** |
| GET | `/api/v1/accounting/journal-entries/export` | accounting:x | generated | — | **0** |
| GET | `/api/v1/accounting/reports/trial-balance` | accounting:v | explicit | — | 1 |
| GET | `/api/v1/accounting/tax/return` | accounting:v | explicit | — | 1 |
| GET | `/api/v1/bank-statements` | accounting:v | generated | — | 1 |
| GET | `/api/v1/bank-statements/:id` | accounting:v | generated | — | **0** |
| GET | `/api/v1/bank-statements/:id/history` | accounting:v | explicit | — | **0** |
| POST | `/api/v1/bank-statements/:id/match` | accounting:e | explicit | — | **0** |
| GET | `/api/v1/bank-statements/export` | accounting:x | generated | — | **0** |
| GET | `/api/v1/insurance-claims` | accounting:v | generated | — | 3 |
| POST | `/api/v1/insurance-claims` | accounting:c | explicit | — | 3 |
| GET | `/api/v1/insurance-claims/:id` | accounting:v | generated | — | **0** |
| POST | `/api/v1/insurance-claims/:id/approve` | accounting:a | explicit | — | 1 |
| GET | `/api/v1/insurance-claims/:id/history` | accounting:v | explicit | — | **0** |
| POST | `/api/v1/insurance-claims/:id/pay` | accounting:e | explicit | — | **0** |
| POST | `/api/v1/insurance-claims/:id/reject` | accounting:a | explicit | — | 1 |
| GET | `/api/v1/insurance-claims/export` | accounting:x | generated | — | **0** |
| GET | `/api/v1/insurance-policies` | accounting:v | generated | — | **0** |
| GET | `/api/v1/insurance-policies/:id` | accounting:v | generated | — | **0** |
| GET | `/api/v1/insurance-policies/:id/history` | accounting:v | explicit | — | **0** |
| GET | `/api/v1/insurance-policies/export` | accounting:x | generated | — | **0** |
| GET | `/api/v1/insurance/claims/summary` | accounting:v | explicit | — | 1 |
| GET | `/api/v1/loan-contracts` | accounting:v | generated | — | **0** |
| GET | `/api/v1/loan-contracts/:id` | accounting:v | generated | — | **0** |
| GET | `/api/v1/loan-contracts/:id/history` | accounting:v | explicit | — | **0** |
| GET | `/api/v1/loan-contracts/export` | accounting:x | generated | — | **0** |
| GET | `/api/v1/loan-repayments` | accounting:v | generated | — | **0** |
| GET | `/api/v1/loan-repayments/:id` | accounting:v | generated | — | **0** |
| GET | `/api/v1/loan-repayments/:id/history` | accounting:v | explicit | — | **0** |
| GET | `/api/v1/loan-repayments/export` | accounting:x | generated | — | **0** |
| GET | `/api/v1/loans/summary` | accounting:v | explicit | — | 1 |
| GET | `/api/v1/saved-reports` | accounting:v | generated | — | 1 |
| POST | `/api/v1/saved-reports` | accounting:c | generated | — | 1 |
| DELETE | `/api/v1/saved-reports/:id` | accounting:d | generated | — | **0** |
| GET | `/api/v1/saved-reports/:id` | accounting:v | generated | — | **0** |
| PATCH | `/api/v1/saved-reports/:id` | accounting:e | generated | — | **0** |
| GET | `/api/v1/saved-reports/:id/history` | accounting:v | explicit | — | **0** |
| POST | `/api/v1/saved-reports/bulk-delete` | accounting:d | generated | — | **0** |
| POST | `/api/v1/saved-reports/bulk-update` | accounting:e | generated | — | **0** |
| GET | `/api/v1/saved-reports/export` | accounting:x | generated | — | **0** |

## Business rules

_No rule guard in `packages/contract/src/rules` is specific to this domain. Any constraint is in the route handlers, or absent._

## Lifecycles

### `insurancePolicyStatus` (insurance)

**State set only** — states: `active`, `expired`, `cancelled`. No transition table is declared; legal moves are whatever the route handlers check.

### `insuranceClaimStatus` (insurance)

**State set only** — states: `submitted`, `under_review`, `approved`, `rejected`, `paid`. No transition table is declared; legal moves are whatever the route handlers check.

### `loanContractStatus` (loan)

**State set only** — states: `active`, `settled`, `defaulted`, `cancelled`. No transition table is declared; legal moves are whatever the route handlers check.

### `loanRepaymentStatus` (loan)

**State set only** — states: `due`, `paid`, `overdue`. No transition table is declared; legal moves are whatever the route handlers check.


## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-BankReconciliation | `/bank-reconciliation` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-ChartOfAccounts | `/chart-of-accounts` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-Expenses | `/expenses` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-FinancialReports | `/financial-reports` | app | **mock** | yes | yes | — | PARTIAL | yes |
| D-FinancialStatements | `/financial-statements` | app | **mock** | yes | yes | — | PARTIAL | yes |
| D-JournalEntries | `/journal-entries` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-TaxManagement | `/tax-management` | app | yes | yes | yes | yes | PARTIAL | yes |

## Known gaps in this domain

- **2 of 7 screens read design fixtures rather than the API.** They render and are asserted; they have not exchanged data with the server.
- **36 of 50 endpoints have no test matched to them by path.** Matching is by path string, so this over-reports where a test reaches the endpoint through a helper.
- **4 lifecycles (`insurancePolicyStatus`, `insuranceClaimStatus`, `loanContractStatus`, `loanRepaymentStatus`) declare states but no legal transitions.** An illegal move is refused only where a handler happens to check.
- **1 of 2 relationships have no foreign key.** Integrity depends on application code; nothing cascades.
- **No rule guard in the shared contract is specific to this domain.** Any business constraint lives in route handlers, where it is not reusable by the form and not asserted by a contract test.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | `server/src/routes/collections.ts (generated from server/src/registry.ts)`, `server/src/routes/history.ts`, `server/src/routes/finance-reports.ts`, `server/src/routes/bank.ts` |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | — |
| Screens | `project-control/MASTER_REGISTRY.json` |
