<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/scenarios.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - project-control/GOLDEN_PATHS.json
       - app/e2e/**
-->

# Golden paths

**Status:** GENERATED · **Sources as of:** 2026-09-17

23 end-to-end journeys, each a browser test that walks the whole path and asserts the content at every step. Status below is the **last recorded run**, from `project-control/GOLDEN_PATHS.json` — it is a measurement, not a claim this documentation makes.

| # | Journey | Spec | Last recorded status |
| --- | --- | --- | --- |
| 1 | New customer to paid invoice | `app/e2e/new-customer-to-paid-invoice.spec.ts` | passing |
| 2 | Existing customer service | `app/e2e/existing-customer-service.spec.ts` | passing |
| 3 | Mobile customer booking | `app/e2e/mobile-customer-booking.spec.ts` | passing |
| 4 | Technician job completion | `app/e2e/technician-job-completion.spec.ts` | passing |
| 5 | Customer estimate approval | `app/e2e/customer-estimate-approval.spec.ts` | passing |
| 6 | Parts procurement | `app/e2e/parts-procurement.spec.ts` | passing |
| 7 | Inventory receiving | `app/e2e/inventory-receiving.spec.ts` | passing |
| 8 | Inventory consumption | `app/e2e/inventory-consumption.spec.ts` | passing |
| 9 | Supplier order | `app/e2e/supplier-order.spec.ts` | passing |
| 10 | CRM lead conversion | `app/e2e/crm-lead-conversion.spec.ts` | passing |
| 11 | Insurance claim | `app/e2e/insurance-claim.spec.ts` | passing |
| 12 | Fleet contract | `app/e2e/fleet-contract.spec.ts` | passing |
| 13 | Loan workflow | `app/e2e/loan-workflow.spec.ts` | passing |
| 14 | Employee onboarding | `app/e2e/employee-onboarding.spec.ts` | passing |
| 15 | Organization / branch setup | `app/e2e/org-branch-setup.spec.ts` | passing |
| 16 | User invitation + RBAC | `app/e2e/user-invitation-rbac.spec.ts` | passing |
| 17 | Accounting reconciliation | `app/e2e/accounting-reconciliation.spec.ts` | passing |
| 18 | Report generation | `app/e2e/report-generation.spec.ts` | passing |
| 19 | Customer portal | `app/e2e/customer-portal.spec.ts` | passing |
| 20 | Technician portal | `app/e2e/technician-portal.spec.ts` | passing |
| 21 | Supplier portal | `app/e2e/supplier-portal.spec.ts` | passing |
| 22 | Call center | `app/e2e/call-center.spec.ts` | passing |
| 23 | Kiosk | `app/e2e/kiosk.spec.ts` | passing |

## Why these and not others

A golden path is a journey whose failure means the product is unusable for somebody, not merely degraded. They are the paths that get run before a release and the ones an incident is measured against. A journey that is nice to have is a test; a journey a garage cannot operate without is a golden path.
