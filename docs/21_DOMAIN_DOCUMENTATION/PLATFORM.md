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

# Domain — Administration and platform

**Status:** GENERATED · **Capability:** CAP-PLATFORM · **Sources as of:** 2026-09-18

## Purpose and scope

This domain serves the objective **OBJ-CONTROL** (Keep financial control auditable). It comprises 36 screens, 19 API endpoints and 3 entities, gated by the `admin`, `departments`, `settings`, `superadmin`, `dashboard`, `network`, `ungated`, `platform` permission modules.


## Actors

| Role | Data scope | Approval ceiling | Grants in this domain |
| --- | --- | --- | --- |
| owner | all | unlimited | `admin:vcedax` `dashboard:vx` |
| superadmin | platform | unlimited | `admin:vcedax` `dashboard:vx` |
| manager | branch | SAR 50,000 | `admin:v` `dashboard:vx` |
| advisor | branch | SAR 5,000 | `dashboard:v` |
| technician | own | may not approve | `dashboard:v` |
| qc | branch | may not approve | `dashboard:v` |
| parts | branch | SAR 10,000 | `dashboard:v` |
| accountant | all | SAR 25,000 | `dashboard:vx` |
| hr | all | SAR 15,000 | `dashboard:v` |
| frontdesk | branch | may not approve | `dashboard:v` |
| callcenter | all | may not approve | `dashboard:v` |
| procurement | all | SAR 20,000 | `dashboard:v` |
| test | all | unlimited | `admin:vcedax` `dashboard:vcedax` |

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

| Table | Columns | Tenant | Branch | Soft delete | RLS | Money columns |
| --- | --- | --- | --- | --- | --- | --- |
| `branches` | 13 | yes | yes | yes | yes | — |
| `departments` | 15 | yes | yes | yes | yes | — |
| `integrations` | 16 | yes | yes | yes | yes | — |

### Relationships

| From | Column | To | Optionality | Enforcement |
| --- | --- | --- | --- | --- |
| `branches` | `org_id` | `organizations` | mandatory | FK |
| `branches` | `branch_id` | `branches` | optional | **convention only** |
| `departments` | `org_id` | `organizations` | mandatory | FK |
| `departments` | `branch_id` | `branches` | optional | **convention only** |
| `integrations` | `org_id` | `organizations` | mandatory | FK |
| `integrations` | `branch_id` | `branches` | optional | **convention only** |

Relationships marked *convention only* have no database constraint: an orphaned reference is possible and nothing cascades.

## API surface

| Method | Path | Permission | Kind | Idempotent | Tests |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/admin/departments` | departments:v | generated | — | 1 |
| GET | `/api/v1/admin/departments/:id` | departments:v | generated | — | **0** |
| GET | `/api/v1/admin/departments/:id/history` | departments:v | explicit | — | **0** |
| GET | `/api/v1/admin/departments/export` | departments:x | generated | — | **0** |
| GET | `/api/v1/branches` | dashboard:v | generated | — | 2 |
| GET | `/api/v1/branches/:id` | dashboard:v | generated | — | **0** |
| GET | `/api/v1/branches/:id/history` | dashboard:v | explicit | — | **0** |
| GET | `/api/v1/branches/export` | dashboard:x | generated | — | **0** |
| GET | `/api/v1/integrations` | settings:v | generated | — | **0** |
| GET | `/api/v1/integrations/:id` | settings:v | generated | — | **0** |
| GET | `/api/v1/integrations/:id/history` | settings:v | explicit | — | **0** |
| GET | `/api/v1/integrations/export` | settings:x | generated | — | **0** |
| GET | `/api/v1/integrations/oem-tools` | settings:v | generated | — | **0** |
| GET | `/api/v1/integrations/oem-tools/:id` | settings:v | generated | — | **0** |
| GET | `/api/v1/integrations/oem-tools/:id/history` | settings:v | explicit | — | **0** |
| GET | `/api/v1/integrations/oem-tools/export` | settings:x | generated | — | **0** |
| POST | `/api/v1/public/leads` | — | explicit | — | 2 |
| GET | `/health` | — | explicit | — | 2 |
| GET | `/ready` | — | explicit | — | 1 |

## Business rules

_No rule guard in `packages/contract/src/rules` is specific to this domain. Any constraint is in the route handlers, or absent._

## Lifecycles

_No lifecycle in the contract belongs to this domain._

## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-AccountLocked | `/account-locked` | auth | **mock** | — | — | — | verified | yes |
| D-AdvancedSettings | `/advanced-settings` | app | **mock** | — | — | — | verified | yes |
| D-Backup | `/backup` | app | **mock** | — | — | — | verified | yes |
| D-Branches | `/branches` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-CookiePolicy | `/cookie-policy` | app | **mock** | — | — | — | verified | yes |
| D-Dashboard | `/dashboard` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-Error404 | `/error404` | auth | **mock** | — | — | — | verified | yes |
| D-FlowSpec | `/flow-spec` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-GlobalSearch | `/global-search` | app | **mock** | — | — | yes | PARTIAL | yes |
| D-Index | `/index` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-Integrations | `/integrations` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-Login | `/login` | auth | **mock** | — | — | — | verified | yes |
| D-Maintenance | `/maintenance` | auth | **mock** | — | — | — | verified | yes |
| D-NotificationCenter | `/notification-center` | app | **mock** | — | — | yes | PARTIAL | yes |
| D-OEMIntegrations | `/oemintegrations` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-Organizations | `/organizations` | app | **mock** | — | — | yes | PARTIAL | yes |
| D-PartsNetwork | `/parts-network` | app | **mock** | — | — | yes | PARTIAL | yes |
| D-PartsSupplyNetwork | `/parts-supply-network` | app | **mock** | yes | yes | yes | PARTIAL | yes |
| D-PrivacyPolicy | `/privacy-policy` | auth | **mock** | — | — | — | verified | yes |
| D-Profile | `/profile` | app | **mock** | — | — | — | verified | yes |
| D-RBACSpec | `/rbacspec` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-RolesPermissions | `/roles-permissions` | app | **mock** | — | — | — | PARTIAL | yes |
| D-SessionExpired | `/session-expired` | auth | **mock** | — | — | — | verified | yes |
| D-Settings | `/settings` | app | **mock** | — | — | — | verified | yes |
| D-Splash | `/splash` | auth | **mock** | — | — | — | verified | yes |
| D-Subscription | `/subscription` | app | **mock** | — | — | — | PARTIAL | yes |
| D-SuperAdmin | `/super-admin` | app | **mock** | — | — | — | verified | yes |
| D-SystemIntegrations | `/system-integrations` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-Templates | `/templates` | app | **mock** | — | — | — | verified | yes |
| D-TermsConditions | `/terms-conditions` | auth | **mock** | — | — | — | verified | yes |
| D-UI.EmptyStates | `/ui/empty-states` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.FormValidation | `/ui/form-validation` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.LoadingStates | `/ui/loading-states` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-Unauthorized | `/unauthorized` | auth | **mock** | — | — | — | verified | yes |
| D-UsersTeams | `/users-teams` | app | **mock** | — | — | yes | PARTIAL | yes |
| D-Welcome | `/welcome` | auth | **mock** | — | — | — | verified | yes |

## Known gaps in this domain

- **31 of 36 screens read design fixtures rather than the API.** They render and are asserted; they have not exchanged data with the server.
- **14 of 19 endpoints have no test matched to them by path.** Matching is by path string, so this over-reports where a test reaches the endpoint through a helper.
- **3 of 6 relationships have no foreign key.** Integrity depends on application code; nothing cascades.
- **No rule guard in the shared contract is specific to this domain.** Any business constraint lives in route handlers, where it is not reusable by the form and not asserted by a contract test.
- **24 screens declare neither a loading nor an error state.** Acceptable for a static reference screen; a defect for one that fetches.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | `server/src/routes/collections.ts (generated from server/src/registry.ts)`, `server/src/routes/history.ts`, `server/src/routes/public.ts`, `server/src/routes/health.ts` |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | — |
| Screens | `project-control/MASTER_REGISTRY.json` |
