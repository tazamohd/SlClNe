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

# Domain — Public website and acquisition

**Status:** GENERATED · **Capability:** CAP-WEBSITE · **Sources as of:** 2026-09-17

## Purpose and scope

This domain serves the objective **OBJ-RETENTION** (Retain customers). It comprises 32 screens, 0 API endpoints and 0 entities, gated by the `website` screen domain.

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
| D-PublicPortal.About | `/public-portal/about` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.Accounting | `/public-portal/accounting` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.AI | `/public-portal/ai` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.Automation | `/public-portal/automation` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.Blog | `/public-portal/blog` | public | **mock** | — | — | — | PARTIAL | yes |
| D-PublicPortal.BookDemo | `/public-portal/book-demo` | public | **mock** | — | — | — | PARTIAL | yes |
| D-PublicPortal.Careers | `/public-portal/careers` | public | **mock** | — | — | — | PARTIAL | yes |
| D-PublicPortal.Contact | `/public-portal/contact` | public | **mock** | — | — | — | PARTIAL | yes |
| D-PublicPortal.CRM | `/public-portal/crm` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.CustomerPortal | `/public-portal/customer-portal` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.DealsOffers | `/public-portal/deals-offers` | public | **mock** | — | — | — | PARTIAL | yes |
| D-PublicPortal.FAQ | `/public-portal/faq` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.Features | `/public-portal/features` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.Fleet | `/public-portal/fleet` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.Industries | `/public-portal/industries` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.Insurance | `/public-portal/insurance` | public | **mock** | — | — | — | PARTIAL | yes |
| D-PublicPortal.Integrations | `/public-portal/integrations` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.Landing | `/public-portal/landing` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.Loans | `/public-portal/loans` | public | **mock** | — | — | — | PARTIAL | yes |
| D-PublicPortal.MiniERP | `/public-portal/mini-erp` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.PartsAccessories | `/public-portal/parts-accessories` | public | **mock** | — | — | — | PARTIAL | yes |
| D-PublicPortal.Pricing | `/public-portal/pricing` | public | **mock** | — | — | — | PARTIAL | yes |
| D-PublicPortal.Products | `/public-portal/products` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.RequestDemo | `/public-portal/request-demo` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.Resources | `/public-portal/resources` | public | **mock** | — | — | — | PARTIAL | yes |
| D-PublicPortal.Services | `/public-portal/services` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.Solutions | `/public-portal/solutions` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.SpareParts | `/public-portal/spare-parts` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.SupplierPortal | `/public-portal/supplier-portal` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.Support | `/public-portal/support` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.TechnicianPortal | `/public-portal/technician-portal` | public | **mock** | — | — | — | verified | yes |
| D-PublicPortal.Workshop | `/public-portal/workshop` | public | **mock** | — | — | — | verified | yes |

## Known gaps in this domain

- **32 of 32 screens read design fixtures rather than the API.** They render and are asserted; they have not exchanged data with the server.
- **32 screens declare neither a loading nor an error state.** Acceptable for a static reference screen; a defect for one that fetches.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | — |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | — |
| Screens | `project-control/MASTER_REGISTRY.json` |
