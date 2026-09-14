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

# Domain — AI and automation

**Status:** GENERATED · **Capability:** CAP-AI · **Sources as of:** 2026-09-14

## Purpose and scope

This domain serves the objective **OBJ-THROUGHPUT** (Increase workshop throughput). It comprises 10 screens, 8 API endpoints and 1 entities, gated by the `ai` permission module.


## Actors

| Role | Data scope | Approval ceiling | Grants in this domain |
| --- | --- | --- | --- |
| owner | all | unlimited | `ai:vcedax` |
| superadmin | platform | unlimited | `ai:vcedax` |
| manager | branch | SAR 50,000 | `ai:vce` |
| advisor | branch | SAR 5,000 | `ai:v` |
| accountant | all | SAR 25,000 | `ai:v` |
| test | all | unlimited | `ai:vcedax` |

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

| Table | Columns | Tenant | Branch | Soft delete | RLS | Money columns |
| --- | --- | --- | --- | --- | --- | --- |
| `conversations` | 14 | yes | yes | yes | yes | — |

### Relationships

| From | Column | To | Optionality | Enforcement |
| --- | --- | --- | --- | --- |
| `conversations` | `org_id` | `organizations` | mandatory | FK |
| `conversations` | `branch_id` | `branches` | optional | **convention only** |

Relationships marked *convention only* have no database constraint: an orphaned reference is possible and nothing cascades.

## API surface

| Method | Path | Permission | Kind | Idempotent | Tests |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/ai/agents` | ai:v | generated | — | 1 |
| GET | `/api/v1/ai/agents/:id` | ai:v | generated | — | **0** |
| GET | `/api/v1/ai/agents/:id/history` | ai:v | explicit | — | **0** |
| GET | `/api/v1/ai/agents/export` | ai:x | generated | — | **0** |
| GET | `/api/v1/ai/conversations` | ai:v | generated | — | 1 |
| GET | `/api/v1/ai/conversations/:id` | ai:v | generated | — | **0** |
| GET | `/api/v1/ai/conversations/:id/history` | ai:v | explicit | — | **0** |
| GET | `/api/v1/ai/conversations/export` | ai:x | generated | — | **0** |

## Business rules

_No rule guard in `packages/contract/src/rules` is specific to this domain. Any constraint is in the route handlers, or absent._

## Lifecycles

_No lifecycle in the contract belongs to this domain._

## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-AgentDashboard | `/agent-dashboard` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-AgentRegistry | `/agent-registry` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-AIAnalytics | `/aianalytics` | app | **mock** | — | — | — | verified | yes |
| D-AIAssistant | `/aiassistant` | app | **mock** | — | — | — | verified | yes |
| D-AutomationRules | `/automation-rules` | app | **mock** | — | — | — | PARTIAL | yes |
| D-ConversationHistory | `/conversation-history` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-KnowledgeBase | `/knowledge-base` | app | **mock** | — | — | — | verified | yes |
| D-ModelSettings | `/model-settings` | app | **mock** | — | — | — | PARTIAL | yes |
| D-PromptLibrary | `/prompt-library` | app | **mock** | — | — | — | verified | yes |
| D-WorkflowBuilder | `/workflow-builder` | app | **mock** | — | — | — | PARTIAL | yes |

## Known gaps in this domain

- **7 of 10 screens read design fixtures rather than the API.** They render and are asserted; they have not exchanged data with the server.
- **6 of 8 endpoints have no test matched to them by path.** Matching is by path string, so this over-reports where a test reaches the endpoint through a helper.
- **1 of 2 relationships have no foreign key.** Integrity depends on application code; nothing cascades.
- **No rule guard in the shared contract is specific to this domain.** Any business constraint lives in route handlers, where it is not reusable by the form and not asserted by a contract test.
- **7 screens declare neither a loading nor an error state.** Acceptable for a static reference screen; a defect for one that fetches.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | `server/src/routes/collections.ts (generated from server/src/registry.ts)`, `server/src/routes/history.ts` |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | — |
| Screens | `project-control/MASTER_REGISTRY.json` |
