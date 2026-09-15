<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/design.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/app.ts
       - server/src/security/*.ts
       - server/src/http/*.ts
       - server/src/db/tenant.ts
       - server/src/audit/audit.ts
       - server/src/registry.ts
       - packages/contract/src/rules/*.ts
       - server/drizzle/*.sql
-->

# Data access design

**Status:** GENERATED · **Sources as of:** 2026-09-15

Covers: the collection registry, the generic router, query contract, presentation, soft delete, the repository seam.

## One description, many routes

`server/src/registry.ts` describes each of the 52 collections once. `server/src/routes/collections.ts` generates 241 endpoints from those descriptions — list, export, detail, and for the 17 writable ones create, update, delete, bulk-update and bulk-delete.

The argument is about people rather than elegance: fifty-two hand-written routers guarantee that the twenty-ninth forgets the soft-delete filter or the permission check. One description means the filter and the check exist once.

## What a collection description carries

| Field | Decides |
| --- | --- |
| `key` | The name the frontend repository uses |
| `path` | The URL segment under `/api/v1` |
| `table` | The Drizzle table |
| `module` | The permission module every generated route checks against |
| `entity` | The name recorded in the audit log |
| `search` | Columns `?q=` matches, as `ilike` |
| `sortable` | Columns `?sort=` accepts. **Anything else is a 400**, not a silent fallback, so a typo is visible rather than ignored |
| `filterable` | Columns `?filter[x]=` matches for equality |
| `defaultSort` | The order when none is asked for |
| `codeColumn` | The human business code (`INV-2026-0142`); detail routes accept either it or the ULID |
| `present` | How a row is shaped for a screen |
| `writable` | Whether the generated write routes exist at all |

## Presentation, and why it exists

`present` returns the exact shape the ported design fixtures carried, with entity metadata added. That is what makes the fixture-to-HTTP swap non-destructive: a screen moving from fixtures to the API does not change. Without it every screen would need editing on the day its collection was connected, and the migration would be all-or-nothing instead of one collection at a time.

`services` presents as a two-element tuple rather than an object, because that is the shape the design's service picker destructures.

## Soft delete

`DELETE` sets `deleted_at`; the row stays. 61 tables carry the column and the generic router filters on it. A hard delete is not exposed through the API at all.

## Collections

| Collection | Path | Module | Writable | Search | Sortable | Filterable |
| --- | --- | --- | --- | --- | --- | --- |
| branches | `/branches` | dashboard | read-only | 2 | 3 | 1 |
| customers | `/customers` | customers | yes | 3 | 5 | 2 |
| vehicles | `/vehicles` | vehicles | yes | 4 | 5 | 2 |
| fleets | `/fleets` | customers | yes | 2 | 5 | 2 |
| services | `/services` | jobcards | read-only | 1 | 2 | 0 |
| jobs | `/jobs` | jobcards | yes | 3 | 5 | 5 |
| appointments | `/appointments` | appointments | yes | 5 | 5 | 4 |
| estimates | `/estimates` | estimates | read-only | 3 | 5 | 2 |
| invoices | `/invoices` | invoices | read-only | 2 | 6 | 3 |
| invoiceLines | `/invoice-lines` | invoices | read-only | 2 | 2 | 2 |
| invoicePayments | `/payments` | payments | read-only | 2 | 3 | 2 |
| receipts | `/receipts` | payments | read-only | 3 | 4 | 2 |
| parts | `/inventory` | inventory | yes | 2 | 5 | 1 |
| technicians | `/technicians` | technicians | read-only | 2 | 4 | 0 |
| departments | `/admin/departments` | admin | read-only | 3 | 3 | 0 |
| leads | `/crm/leads` | crm | yes | 3 | 5 | 2 |
| opportunities | `/crm/opportunities` | crm | yes | 3 | 5 | 1 |
| campaigns | `/crm/campaigns` | crm | read-only | 1 | 4 | 2 |
| segments | `/crm/segments` | crm | read-only | 2 | 3 | 0 |
| crmTasks | `/crm/tasks` | crm | yes | 2 | 5 | 3 |
| feedback | `/customer-feedback` | crm | yes | 2 | 2 | 3 |
| chartOfAccounts | `/accounting/coa` | accounting | read-only | 2 | 3 | 2 |
| journalEntries | `/accounting/journal-entries` | accounting | read-only | 3 | 4 | 1 |
| expenses | `/accounting/expenses` | accounting | read-only | 3 | 4 | 2 |
| bankStatements | `/bank-statements` | accounting | read-only | 2 | 3 | 2 |
| savedReports | `/saved-reports` | accounting | yes | 2 | 2 | 1 |
| insurancePolicies | `/insurance-policies` | accounting | read-only | 4 | 6 | 4 |
| insuranceClaims | `/insurance-claims` | accounting | read-only | 4 | 5 | 4 |
| loanContracts | `/loan-contracts` | accounting | read-only | 2 | 5 | 2 |
| loanRepayments | `/loan-repayments` | accounting | read-only | 1 | 5 | 2 |
| employees | `/employees` | hr | yes | 4 | 5 | 2 |
| payrollRuns | `/payroll/runs` | hr | yes | 2 | 4 | 2 |
| payrollLines | `/payroll/lines` | hr | yes | 1 | 3 | 2 |
| timesheets | `/timesheets` | hr | yes | 1 | 4 | 2 |
| leaveRequests | `/leave-requests` | hr | yes | 2 | 4 | 3 |
| aiAgents | `/ai/agents` | ai | read-only | 3 | 3 | 1 |
| conversations | `/ai/conversations` | ai | read-only | 2 | 3 | 0 |
| obdDevices | `/diagnostics/devices` | jobcards | read-only | 4 | 3 | 2 |
| obdReadings | `/diagnostics/readings` | jobcards | read-only | 2 | 3 | 4 |
| dtcCodes | `/kb/dtc` | jobcards | read-only | 2 | 2 | 2 |
| oemTools | `/integrations/oem-tools` | settings | read-only | 3 | 3 | 1 |
| integrations | `/integrations` | settings | read-only | 2 | 2 | 2 |
| kbProcedures | `/kb/procedures` | jobcards | read-only | 4 | 4 | 2 |
| approvalLines | `/approvals/lines` | approvals | read-only | 1 | 1 | 2 |
| diagStages | `/diagnostics/stages` | jobcards | read-only | 2 | 1 | 1 |
| diagFindings | `/diagnostics/findings` | jobcards | read-only | 2 | 2 | 2 |
| diagParts | `/diagnostics/parts` | jobcards | read-only | 2 | 1 | 1 |
| diagLabour | `/diagnostics/labour` | jobcards | read-only | 1 | 1 | 0 |
| diagCopies | `/diagnostics/copies` | jobcards | read-only | 1 | 1 | 1 |
| suppliers | `/procurement/suppliers` | procurement | yes | 4 | 4 | 1 |
| requisitions | `/procurement/requisitions` | procurement | read-only | 3 | 6 | 2 |
| purchaseOrders | `/procurement/purchase-orders` | procurement | read-only | 2 | 6 | 3 |
