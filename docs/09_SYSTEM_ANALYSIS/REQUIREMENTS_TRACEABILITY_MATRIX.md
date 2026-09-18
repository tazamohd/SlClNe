<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/requirements.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts + server/src/routes/*.ts (functional behaviour)
       - packages/contract/src/rules/*.ts (business rules)
       - packages/contract/src/rbac.ts (security requirements)
       - server/src/db/schema.ts (data requirements)
       - server/drizzle/*.sql (isolation requirements)
       - project-control/MASTER_REGISTRY.json (interface requirements)
-->

# Requirements traceability matrix

**Status:** GENERATED · **Sources as of:** 2026-09-18

## The chain

```
STRATEGIC OBJECTIVE → BUSINESS CAPABILITY → REQUIREMENT → ENTITY → API → PERMISSION → SCREEN → TEST
```

Every link below is derived from a real identifier — a permission module, a table name, a route path. Nothing is linked on resemblance, so a blank cell means *no link exists in the source*, not *the generator could not find one*.

## Forward: objective down to test

| Objective | Capability | Requirement | Entities | Endpoints | Permissioned roles | Screens | Rules | Linked test suites |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OBJ-THROUGHPUT | CAP-WORKSHOP | FR-WORKSHOP-001 | 14 | 88 | 12 | 17 | 0 | 21 |
| OBJ-RETENTION | CAP-CUSTOMERS | FR-CUSTOMERS-001 | 2 | 19 | 9 | 3 | 0 | 14 |
| OBJ-THROUGHPUT | CAP-VEHICLES | FR-VEHICLES-001 | 1 | 9 | 11 | 4 | 0 | 8 |
| OBJ-MARGIN | CAP-INVENTORY | FR-INVENTORY-001 | 1 | 13 | 9 | 7 | 5 | 11 |
| OBJ-MARGIN | CAP-PROCUREMENT | FR-PROCUREMENT-001 | 3 | 28 | 8 | 1 | 4 | 3 |
| OBJ-CASH | CAP-BILLING | FR-BILLING-001 | 4 | 25 | 9 | 6 | 0 | 13 |
| OBJ-CASH | CAP-ACCOUNTING | FR-ACCOUNTING-001 | 9 | 50 | 5 | 7 | 0 | 12 |
| OBJ-CAPACITY | CAP-HR | FR-HR-001 | 6 | 52 | 10 | 5 | 2 | 8 |
| OBJ-RETENTION | CAP-CRM | FR-CRM-001 | 6 | 45 | 7 | 12 | 0 | 6 |
| OBJ-VISIBILITY | CAP-REPORTING | FR-REPORTING-001 | 0 | 0 | 10 | 11 | 0 | **0** |
| OBJ-CONTROL | CAP-GOVERNANCE | FR-GOVERNANCE-001 | 1 | 5 | 9 | 2 | 4 | 1 |
| OBJ-RETENTION | CAP-PORTALS | FR-PORTALS-001 | 0 | 0 | 14 | 11 | 0 | **0** |
| OBJ-THROUGHPUT | CAP-AI | FR-AI-001 | 2 | 8 | 6 | 19 | 0 | 1 |
| OBJ-CONTROL | CAP-PLATFORM | FR-PLATFORM-001 | 4 | 19 | 14 | 36 | 0 | 6 |
| OBJ-CONTROL | CAP-IDENTITY | FR-IDENTITY-001 | 0 | 24 | 0 | 18 | 0 | 16 |
| OBJ-RETENTION | CAP-WEBSITE | FR-WEBSITE-001 | 0 | 0 | 0 | 34 | 0 | **0** |
| OBJ-RETENTION | CAP-CUSTOMERAPP | FR-CUSTOMERAPP-001 | 0 | 0 | 0 | 11 | 0 | **0** |
| OBJ-VISIBILITY | CAP-DESIGNSYSTEM | FR-DESIGNSYSTEM-001 | 0 | 0 | 0 | 224 | 0 | **0** |

## Reverse: from an artefact back to why it exists

Given a table, an endpoint, a permission or a screen, the registries answer the reverse question directly:

| Start from | Look in | Answers |
| --- | --- | --- |
| A database table | `project-control/ENTITY_REGISTRY.json` | Which endpoints read and write it, which relationships bind it, whether RLS protects it, which tests touch it |
| An endpoint | `project-control/API_REGISTRY.json` | Its capability, permission module and action, tenant scope, entity, and linked tests |
| A permission cell | `project-control/PERMISSION_REGISTRY.json` | Which role holds which action on which module, that role’s data scope and approval ceiling |
| A screen | `project-control/MASTER_REGISTRY.json` | Its route, module, permissions, data backing, states, and e2e coverage |
| A business rule | `project-control/BUSINESS_RULES.json` | The function that enforces it, the file it lives in, and the message a user sees |
| A test | `project-control/TEST_REGISTRY.json` | Its suite, kind, the paths and roles it exercises |

## Where the chain breaks

The honest part of a traceability matrix is the list of links that do not exist.

### Capabilities with no linked test suite (5 of 18)

| Capability | Endpoints | Screens |
| --- | --- | --- |
| CAP-REPORTING | 0 | 11 |
| CAP-PORTALS | 0 | 11 |
| CAP-WEBSITE | 0 | 34 |
| CAP-CUSTOMERAPP | 0 | 11 |
| CAP-DESIGNSYSTEM | 0 | 224 |

A capability with endpoints but no linked suite is a real gap. A capability with **no endpoints** — the website, the design system, the feature map — is linked through the screen registry’s end-to-end coverage instead, which is the appropriate evidence for a surface with no API behind it.

### Endpoints with no linked test (277 of 385)

Linkage here is by path match between a spec file and a route. A test that exercises an endpoint indirectly — through a helper, or through a golden path — will not match, so this over-reports. It is still the right number to drive down.

| Method | Path | Permission |
| --- | --- | --- |
| GET | `/api/v1/accounting/coa/:id` | accounting:v |
| GET | `/api/v1/accounting/coa/:id/history` | accounting:v |
| GET | `/api/v1/accounting/coa/export` | accounting:x |
| GET | `/api/v1/accounting/expenses/:id` | accounting:v |
| GET | `/api/v1/accounting/expenses/:id/history` | accounting:v |
| GET | `/api/v1/accounting/expenses/export` | accounting:x |
| GET | `/api/v1/accounting/journal-entries/:id` | accounting:v |
| GET | `/api/v1/accounting/journal-entries/:id/history` | accounting:v |
| GET | `/api/v1/accounting/journal-entries/export` | accounting:x |
| GET | `/api/v1/admin/departments/:id` | admin:v |
| GET | `/api/v1/admin/departments/:id/history` | admin:v |
| GET | `/api/v1/admin/departments/export` | admin:x |
| GET | `/api/v1/ai/agents/:id` | ai:v |
| GET | `/api/v1/ai/agents/:id/history` | ai:v |
| GET | `/api/v1/ai/agents/export` | ai:x |
| GET | `/api/v1/ai/conversations/:id` | ai:v |
| GET | `/api/v1/ai/conversations/:id/history` | ai:v |
| GET | `/api/v1/ai/conversations/export` | ai:x |
| DELETE | `/api/v1/appointments/:id` | appointments:d |
| GET | `/api/v1/appointments/:id` | appointments:v |
| PATCH | `/api/v1/appointments/:id` | appointments:e |
| GET | `/api/v1/appointments/:id/history` | appointments:v |
| POST | `/api/v1/appointments/:id/job-card` | jobcards:c |
| POST | `/api/v1/appointments/bulk-delete` | appointments:d |
| POST | `/api/v1/appointments/bulk-update` | appointments:e |
| GET | `/api/v1/appointments/export` | appointments:x |
| GET | `/api/v1/approvals/lines` | approvals:v |
| GET | `/api/v1/approvals/lines/:id` | approvals:v |
| GET | `/api/v1/approvals/lines/:id/history` | approvals:v |
| GET | `/api/v1/approvals/lines/export` | approvals:x |
| DELETE | `/api/v1/auth/sessions/:id` | — |
| POST | `/api/v1/auth/social/:provider` | — |
| GET | `/api/v1/bank-statements/:id` | accounting:v |
| GET | `/api/v1/bank-statements/:id/history` | accounting:v |
| POST | `/api/v1/bank-statements/:id/match` | accounting:e |
| GET | `/api/v1/bank-statements/export` | accounting:x |
| GET | `/api/v1/branches/:id` | dashboard:v |
| GET | `/api/v1/branches/:id/history` | dashboard:v |
| GET | `/api/v1/branches/export` | dashboard:x |
| GET | `/api/v1/crm/campaigns/:id` | crm:v |
| GET | `/api/v1/crm/campaigns/:id/history` | crm:v |
| GET | `/api/v1/crm/campaigns/export` | crm:x |
| DELETE | `/api/v1/crm/leads/:id` | crm:d |
| GET | `/api/v1/crm/leads/:id` | crm:v |
| PATCH | `/api/v1/crm/leads/:id` | crm:e |
| POST | `/api/v1/crm/leads/:id/convert` | crm:c |
| GET | `/api/v1/crm/leads/:id/history` | crm:v |
| POST | `/api/v1/crm/leads/bulk-delete` | crm:d |
| POST | `/api/v1/crm/leads/bulk-update` | crm:e |
| GET | `/api/v1/crm/leads/export` | crm:x |
| DELETE | `/api/v1/crm/opportunities/:id` | crm:d |
| GET | `/api/v1/crm/opportunities/:id` | crm:v |
| PATCH | `/api/v1/crm/opportunities/:id` | crm:e |
| GET | `/api/v1/crm/opportunities/:id/history` | crm:v |
| POST | `/api/v1/crm/opportunities/bulk-delete` | crm:d |
| POST | `/api/v1/crm/opportunities/bulk-update` | crm:e |
| GET | `/api/v1/crm/opportunities/export` | crm:x |
| GET | `/api/v1/crm/segments/:id` | crm:v |
| GET | `/api/v1/crm/segments/:id/history` | crm:v |
| GET | `/api/v1/crm/segments/export` | crm:x |

_…and 217 more. The full list is in `project-control/API_REGISTRY.json` — every endpoint whose `tests` array is empty._

### Rule guards with no test naming them (2 of 17)

| Rule | Statement | Enforced in |
| --- | --- | --- |
| BR-APPROVALS-checkApprovalCeiling | A value above the role's ceiling must escalate rather than be approved. | `packages/contract/src/rules/approvals.ts` |
| BR-INVENTORY-checkReceipt | Receiving quantity ≤ ordered quantity; over-receipt needs approval. | `packages/contract/src/rules/inventory.ts` |
