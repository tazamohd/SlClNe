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

# Domain — Portals and channels

**Status:** GENERATED · **Capability:** CAP-PORTALS · **Generated:** 2026-09-13

## Purpose and scope

This domain serves the objective **OBJ-RETENTION** (Retain customers). It comprises 11 screens, 0 API endpoints and 0 entities, gated by the `portaltech`, `portalcustomer`, `portalsupplier`, `portalprocure`, `kiosk` permission modules.


## Actors

| Role | Data scope | Approval ceiling | Grants in this domain |
| --- | --- | --- | --- |
| owner | all | unlimited | `portaltech:v` `portalcustomer:v` `portalsupplier:v` `portalprocure:v` `kiosk:v` |
| superadmin | platform | unlimited | `portaltech:v` `portalcustomer:v` `portalsupplier:v` `portalprocure:v` `kiosk:v` |
| manager | branch | SAR 50,000 | `portaltech:v` `portalcustomer:v` `portalsupplier:v` `portalprocure:v` `kiosk:v` |
| advisor | branch | SAR 5,000 | `portaltech:v` `portalcustomer:v` `kiosk:v` |
| technician | own | may not approve | `portaltech:vx` |
| qc | branch | may not approve | `portaltech:vx` |
| parts | branch | SAR 10,000 | `portalsupplier:v` `portalprocure:v` |
| accountant | all | SAR 25,000 | `portalprocure:v` |
| frontdesk | branch | may not approve | `portalcustomer:v` `kiosk:vcex` |
| callcenter | all | may not approve | `portalcustomer:v` `kiosk:v` |
| procurement | all | SAR 20,000 | `portalsupplier:v` `portalprocure:vx` |
| supplier | external | may not approve | `portalsupplier:vx` |
| customer | self | may not approve | `portalcustomer:vx` |
| test | all | unlimited | `portaltech:vcedax` `portalcustomer:vcedax` `portalsupplier:vcedax` `portalprocure:vcedax` `kiosk:vcedax` |

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
| D-CustomerPortal | `/customer-portal` | portal | yes | yes | yes | yes | PARTIAL | yes |
| D-CustomerPortal.Booking | `/customer-portal/booking` | portal | yes | yes | yes | — | PARTIAL | yes |
| D-KioskCheckIn | `/kiosk-check-in` | kiosk | yes | — | — | yes | PARTIAL | yes |
| D-Native.Android | `/native/android` | native | **mock** | — | — | — | PARTIAL | yes |
| D-Native.iOS | `/native/i-os` | native | **mock** | — | — | — | PARTIAL | yes |
| D-ProcurementPortal | `/procurement-portal` | portal | **mock** | yes | yes | yes | PARTIAL | yes |
| D-ProcurementPortal.Requisitions | `/procurement-portal/requisitions` | portal | **mock** | yes | yes | yes | PARTIAL | yes |
| D-SupplierPortal | `/supplier-portal` | portal | yes | yes | yes | yes | PARTIAL | yes |
| D-SupplierPortal.Orders | `/supplier-portal/orders` | portal | yes | yes | yes | yes | PARTIAL | yes |
| D-TechnicianPortal | `/technician-portal` | portal | yes | yes | yes | yes | PARTIAL | yes |
| D-TechnicianPortal.JobDetail | `/technician-portal/job-detail` | portal | yes | yes | yes | yes | PARTIAL | yes |

## Known gaps in this domain

- **4 of 11 screens read design fixtures rather than the API.** They render and are asserted; they have not exchanged data with the server.
- **3 screens declare neither a loading nor an error state.** Acceptable for a static reference screen; a defect for one that fetches.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | — |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | — |
| Screens | `project-control/MASTER_REGISTRY.json` |
