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

# Domain — Customer mobile application

**Status:** GENERATED · **Capability:** CAP-CUSTOMERAPP · **Sources as of:** 2026-09-18

## Purpose and scope

This domain serves the objective **OBJ-RETENTION** (Retain customers). It comprises 11 screens, 0 API endpoints and 0 entities, gated by the `customerapp` screen domain.

**This domain has no permission module of its own.** Its screens are grouped by their registry `domain` instead — the registry files them that way because they are pre-authorization, unauthenticated, or reference material rather than a gated business surface.

## Actors

_No permission module gates this domain, so no grants apply. Access is controlled at the route level or the surface is unauthenticated._

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

_No entity is owned exclusively by this domain._



## API surface

_No API endpoints. This domain is presentation-only._

## Business rules

_No rule guard in `packages/contract/src/rules` is specific to this domain. Any constraint is in the route handlers, or absent._

## Lifecycles

_No lifecycle in the contract belongs to this domain._

## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-CustomerApp.Appointments | `/customer-app/appointments` | customer-app | yes | yes | yes | yes | PARTIAL | yes |
| D-CustomerApp.Garage | `/customer-app/garage` | customer-app | yes | yes | yes | yes | PARTIAL | yes |
| D-CustomerApp.Home | `/customer-app/home` | customer-app | yes | yes | yes | yes | PARTIAL | yes |
| D-CustomerApp.Insurance | `/customer-app/insurance` | customer-app | yes | yes | yes | yes | PARTIAL | yes |
| D-CustomerApp.Loans | `/customer-app/loans` | customer-app | yes | yes | yes | yes | PARTIAL | yes |
| D-CustomerApp.Marketplace | `/customer-app/marketplace` | customer-app | **mock** | yes | yes | yes | PARTIAL | yes |
| D-CustomerApp.Notifications | `/customer-app/notifications` | customer-app | **mock** | yes | yes | yes | PARTIAL | yes |
| D-CustomerApp.Orders | `/customer-app/orders` | customer-app | **mock** | yes | yes | yes | PARTIAL | yes |
| D-CustomerApp.Profile | `/customer-app/profile` | customer-app | **mock** | yes | yes | yes | PARTIAL | yes |
| D-CustomerApp.ServiceTracking | `/customer-app/service-tracking` | customer-app | **mock** | yes | yes | yes | PARTIAL | yes |
| D-CustomerApp.Wallet | `/customer-app/wallet` | customer-app | **mock** | yes | yes | yes | PARTIAL | yes |

## Known gaps in this domain

- **6 of 11 screens read design fixtures rather than the API.** They render and are asserted; they have not exchanged data with the server.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | — |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | — |
| Screens | `project-control/MASTER_REGISTRY.json` |
