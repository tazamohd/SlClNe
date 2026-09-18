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

# Domain — Approvals and governance

**Status:** GENERATED · **Capability:** CAP-GOVERNANCE · **Sources as of:** 2026-09-18

## Purpose and scope

This domain serves the objective **OBJ-CONTROL** (Keep financial control auditable). It comprises 2 screens, 5 API endpoints and 0 entities, gated by the `approvals`, `audit` permission modules.


## Actors

| Role | Data scope | Approval ceiling | Grants in this domain |
| --- | --- | --- | --- |
| owner | all | unlimited | `approvals:vax` `audit:vx` |
| superadmin | platform | unlimited | `approvals:vx` `audit:vx` |
| manager | branch | SAR 50,000 | `approvals:vax` `audit:vx` |
| advisor | branch | SAR 5,000 | `approvals:va` |
| parts | branch | SAR 10,000 | `approvals:va` |
| accountant | all | SAR 25,000 | `approvals:vax` `audit:vx` |
| hr | all | SAR 15,000 | `approvals:va` |
| procurement | all | SAR 20,000 | `approvals:vax` |
| test | all | unlimited | `approvals:vcedax` `audit:vcedax` |

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

_No entity is owned exclusively by this domain._



## API surface

| Method | Path | Permission | Kind | Idempotent | Tests |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/approvals` | approvals:v | explicit | — | 1 |
| GET | `/api/v1/approvals/lines` | approvals:v | generated | — | **0** |
| GET | `/api/v1/approvals/lines/:id` | approvals:v | generated | — | **0** |
| GET | `/api/v1/approvals/lines/:id/history` | approvals:v | explicit | — | **0** |
| GET | `/api/v1/approvals/lines/export` | approvals:x | generated | — | **0** |

## Business rules

| ID | Rule | Kind | Enforced in |
| --- | --- | --- | --- |
| BR-APPROVALS-checkApprovalCeiling | A value above the role's ceiling must escalate rather than be approved. | GUARD | `packages/contract/src/rules/approvals.ts` |
| BR-APPROVALS-checkQcIndependence | A technician cannot pass QC on a repair they performed. | GUARD | `packages/contract/src/rules/approvals.ts` |
| BR-APPROVALS-checkSelfApproval | The approver must not be the submitter — the first and most-broken SOD pair, and the one that lets a single person move money on their own say-so. | GUARD | `packages/contract/src/rules/approvals.ts` |
| BR-APPROVALS-SOD_PAIRS | The declared conflicting-duty pairs, exposed so a screen can explain one. | CONSTANT | `packages/contract/src/rules/approvals.ts` |

## Lifecycles

_No lifecycle in the contract belongs to this domain._

## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-ApprovalInbox | `/approval-inbox` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-AuditLog | `/audit-log` | app | **mock** | — | — | yes | verified | yes |

## Known gaps in this domain

- **1 of 2 screens read design fixtures rather than the API.** They render and are asserted; they have not exchanged data with the server.
- **4 of 5 endpoints have no test matched to them by path.** Matching is by path string, so this over-reports where a test reaches the endpoint through a helper.
- **1 screens declare neither a loading nor an error state.** Acceptable for a static reference screen; a defect for one that fetches.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | `server/src/routes/approvals.ts`, `server/src/routes/collections.ts (generated from server/src/registry.ts)`, `server/src/routes/history.ts` |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | `packages/contract/src/rules/approvals.ts` |
| Screens | `project-control/MASTER_REGISTRY.json` |
