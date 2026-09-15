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

# Domain — Identity and access

**Status:** GENERATED · **Capability:** CAP-IDENTITY · **Sources as of:** 2026-09-15

## Purpose and scope

This domain serves the objective **OBJ-CONTROL** (Keep financial control auditable). It comprises 18 screens, 24 API endpoints and 0 entities, gated by the `auth` permission module.


## Actors

_No permission module gates this domain, so no grants apply. Access is controlled at the route level or the surface is unauthenticated._

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

_No entity is owned exclusively by this domain._



## API surface

| Method | Path | Permission | Kind | Idempotent | Tests |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/2fa/enrol` | — | explicit | — | 1 |
| POST | `/api/v1/auth/2fa/verify` | — | explicit | — | 1 |
| POST | `/api/v1/auth/biometric/challenge` | — | explicit | — | 1 |
| POST | `/api/v1/auth/biometric/enrol` | — | explicit | — | 1 |
| POST | `/api/v1/auth/forgot-password` | — | explicit | — | 2 |
| POST | `/api/v1/auth/login` | — | explicit | — | 12 |
| POST | `/api/v1/auth/logout` | — | explicit | — | 1 |
| GET | `/api/v1/auth/me` | — | explicit | — | 2 |
| GET | `/api/v1/auth/providers` | — | explicit | — | 1 |
| POST | `/api/v1/auth/refresh` | — | explicit | — | 1 |
| POST | `/api/v1/auth/register` | — | explicit | — | 5 |
| POST | `/api/v1/auth/request-otp` | — | explicit | — | 1 |
| POST | `/api/v1/auth/reset-password` | — | explicit | — | 1 |
| GET | `/api/v1/auth/sessions` | — | explicit | — | 1 |
| DELETE | `/api/v1/auth/sessions/:id` | — | explicit | — | **0** |
| POST | `/api/v1/auth/sessions/revoke-all` | — | explicit | — | 1 |
| POST | `/api/v1/auth/social/:provider` | — | explicit | — | **0** |
| POST | `/api/v1/auth/sso/callback` | — | explicit | — | 1 |
| POST | `/api/v1/auth/sso/start` | — | explicit | — | 1 |
| POST | `/api/v1/auth/switch-role` | — | explicit | — | 1 |
| POST | `/api/v1/auth/verify-otp` | — | explicit | — | 1 |
| POST | `/api/v1/public/customers/register` | — | explicit | — | 5 |
| POST | `/api/v1/public/customers/resend-otp` | — | explicit | — | 1 |
| POST | `/api/v1/public/customers/verify-otp` | — | explicit | — | 1 |

## Business rules

_No rule guard in `packages/contract/src/rules` is specific to this domain. Any constraint is in the route handlers, or absent._

## Lifecycles

_No lifecycle in the contract belongs to this domain._

## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-BiometricSetup | `/biometric-setup` | auth | **mock** | — | — | — | verified | yes |
| D-CreatePIN | `/create-pin` | auth | **mock** | — | — | — | verified | yes |
| D-ForgotPassword | `/forgot-password` | auth | **mock** | — | — | — | verified | yes |
| D-InviteAcceptance | `/invite-acceptance` | auth | **mock** | — | — | — | verified | yes |
| D-LanguageSelection | `/language-selection` | auth | **mock** | — | — | — | verified | yes |
| D-LogoutConfirmation | `/logout-confirmation` | auth | **mock** | — | — | — | verified | yes |
| D-Onboarding | `/onboarding` | auth | **mock** | — | — | — | verified | yes |
| D-OrganizationSelection | `/organization-selection` | auth | **mock** | — | — | — | verified | yes |
| D-OTPVerification | `/otpverification` | auth | **mock** | — | — | — | verified | yes |
| D-ProfileCompletion | `/profile-completion` | auth | **mock** | — | — | — | PARTIAL | yes |
| D-RegionSelection | `/region-selection` | auth | **mock** | — | — | — | PARTIAL | yes |
| D-Register | `/register` | auth | **mock** | — | — | — | PARTIAL | yes |
| D-ResetPassword | `/reset-password` | auth | **mock** | — | — | — | verified | yes |
| D-RoleSelection | `/role-selection` | auth | **mock** | — | — | — | PARTIAL | yes |
| D-SocialLogin | `/social-login` | auth | **mock** | — | — | — | verified | yes |
| D-SSOLogin | `/ssologin` | auth | **mock** | — | — | — | PARTIAL | yes |
| D-TwoFactorVerification | `/two-factor-verification` | auth | **mock** | — | — | — | verified | yes |
| D-WorkspaceSelection | `/workspace-selection` | auth | **mock** | — | — | — | verified | yes |

## Known gaps in this domain

- **18 of 18 screens read design fixtures rather than the API.** They render and are asserted; they have not exchanged data with the server.
- **2 of 24 endpoints have no test matched to them by path.** Matching is by path string, so this over-reports where a test reaches the endpoint through a helper.
- **No rule guard in the shared contract is specific to this domain.** Any business constraint lives in route handlers, where it is not reusable by the form and not asserted by a contract test.
- **18 screens declare neither a loading nor an error state.** Acceptable for a static reference screen; a defect for one that fetches.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | `server/src/auth/routes.ts` |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | — |
| Screens | `project-control/MASTER_REGISTRY.json` |
