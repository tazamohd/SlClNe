<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/domains.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - project-control/CAPABILITY_REGISTRY.json
       - project-control/API_REGISTRY.json
       - project-control/ENTITY_REGISTRY.json
       - project-control/PERMISSION_REGISTRY.json
       - project-control/BUSINESS_RULES.json
       - project-control/MASTER_REGISTRY.json
-->

# Domain — Reporting and analytics

**Status:** GENERATED · **Capability:** CAP-REPORTING · **Sources as of:** 2026-09-13

## Purpose and scope

This domain serves the objective **OBJ-VISIBILITY** (Give owners operational visibility). It comprises 11 screens, 0 API endpoints and 0 entities, gated by the `reports`, `execreports` permission modules.


## Actors

| Role | Data scope | Approval ceiling | Grants in this domain |
| --- | --- | --- | --- |
| owner | all | unlimited | `reports:vx` `execreports:vx` |
| superadmin | platform | unlimited | `reports:vx` `execreports:vx` |
| manager | branch | SAR 50,000 | `reports:vx` `execreports:vx` |
| advisor | branch | SAR 5,000 | `reports:v` |
| qc | branch | may not approve | `reports:v` |
| parts | branch | SAR 10,000 | `reports:vx` |
| accountant | all | SAR 25,000 | `reports:vx` `execreports:vx` |
| hr | all | SAR 15,000 | `reports:vx` |
| procurement | all | SAR 20,000 | `reports:vx` |
| test | all | unlimited | `reports:vcedax` `execreports:vcedax` |

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
| D-BIDashboard | `/bidashboard` | app | yes | yes | yes | — | PARTIAL | yes |
| D-CustomReports | `/custom-reports` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-ExecutiveReports | `/executive-reports` | app | yes | yes | yes | — | PARTIAL | yes |
| D-InsuranceReports | `/insurance-reports` | app | **mock** | yes | — | yes | PARTIAL | yes |
| D-InventoryReports | `/inventory-reports` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-LoanReports | `/loan-reports` | app | **mock** | yes | — | yes | PARTIAL | yes |
| D-OperationalReports | `/operational-reports` | app | yes | yes | yes | — | PARTIAL | yes |
| D-Reports | `/reports` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-ReportsAnalytics | `/reports-analytics` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-SalesReports | `/sales-reports` | app | yes | yes | yes | yes | PARTIAL | yes |
| D-WorkshopReports | `/workshop-reports` | app | yes | yes | yes | — | PARTIAL | yes |

## Known gaps in this domain

- **2 of 11 screens read design fixtures rather than the API.** They render and are asserted; they have not exchanged data with the server.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | — |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | — |
| Screens | `project-control/MASTER_REGISTRY.json` |
