<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/scenarios.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - project-control/GOLDEN_PATHS.json
       - project-control/BUSINESS_RULES.json
       - project-control/API_REGISTRY.json
       - project-control/PERMISSION_REGISTRY.json
       - app/e2e/**
-->

# Use case catalogue

**Status:** GENERATED · **Sources as of:** 2026-09-18

One use case per write endpoint that has behaviour of its own. The generated collection routes — create, update, delete on a described collection — are uniform and are covered by a single pattern rather than 172 near-identical entries; that pattern is stated at the end.

68 behavioural use cases.

| UC | Goal | Primary actor | Permission | Approval | Idempotent | Transactional | Validates | Implemented in |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UC-POST-APPOINTMENTS-ID-JOB-CARD | POST /appointments/:id/job-card | owner, manager, advisor, frontdesk, test | jobcards:c | — | — | — | yes | `server/src/routes/workshop.ts` |
| UC-POST-AUTH-2FA-ENROL | POST /auth/2fa/enrol | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-2FA-VERIFY | POST /auth/2fa/verify | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-BIOMETRIC-CHALLENGE | POST /auth/biometric/challenge | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-BIOMETRIC-ENROL | POST /auth/biometric/enrol | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-FORGOT-PASSWORD | POST /auth/forgot-password | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-LOGIN | POST /auth/login | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-LOGOUT | POST /auth/logout | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-REFRESH | POST /auth/refresh | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-REGISTER | POST /auth/register | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-REQUEST-OTP | POST /auth/request-otp | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-RESET-PASSWORD | POST /auth/reset-password | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-DELETE-AUTH-SESSIONS-ID | DELETE /auth/sessions/:id | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-SESSIONS-REVOKE-ALL | POST /auth/sessions/revoke-all | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-SOCIAL-PROVIDER | POST /auth/social/:provider | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-SSO-CALLBACK | POST /auth/sso/callback | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-SSO-START | POST /auth/sso/start | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-SWITCH-ROLE | POST /auth/switch-role | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-AUTH-VERIFY-OTP | POST /auth/verify-otp | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-BANK-STATEMENTS-ID-MATCH | POST /bank-statements/:id/match | accountant, test | accounting:e | — | — | — | yes | `server/src/routes/bank.ts` |
| UC-POST-CANNED-JOBS | POST /canned-jobs | owner, manager, advisor, test | estimates:c | — | — | — | yes | `server/src/routes/canned-jobs.ts` |
| UC-PATCH-CANNED-JOBS-ID | PATCH /canned-jobs/:id | owner, manager, advisor, test | estimates:e | — | — | — | yes | `server/src/routes/canned-jobs.ts` |
| UC-POST-CRM-CAMPAIGNS-ID-SEND | POST /crm/campaigns/:id/send | owner, manager, advisor, callcenter, test | crm:e | — | — | — | — | `server/src/routes/crm.ts` |
| UC-POST-CRM-LEADS-ID-CONVERT | POST /crm/leads/:id/convert | owner, manager, advisor, callcenter, test | crm:c | — | — | — | yes | `server/src/routes/crm.ts` |
| UC-POST-DIAGNOSTICS-DEVICES-ID-CLEAR-CODES | POST /diagnostics/devices/:id/clear-codes | owner, manager, advisor, technician, test | jobcards:e | — | — | — | — | `server/src/routes/obd.ts` |
| UC-POST-DIAGNOSTICS-DEVICES-ID-RESCAN | POST /diagnostics/devices/:id/rescan | owner, manager, advisor, technician, test | jobcards:e | — | — | — | — | `server/src/routes/obd.ts` |
| UC-POST-ESTIMATES | POST /estimates | owner, manager, advisor, test | estimates:c | — | — | — | yes | `server/src/routes/estimates.ts` |
| UC-PATCH-ESTIMATES-ID | PATCH /estimates/:id | owner, manager, advisor, test | estimates:e | — | — | — | yes | `server/src/routes/estimates.ts` |
| UC-POST-ESTIMATES-ID-APPROVE | POST /estimates/:id/approve | owner, manager, test | estimates:a | yes | — | — | yes | `server/src/routes/estimates.ts` |
| UC-POST-ESTIMATES-ID-INVOICE | POST /estimates/:id/invoice | owner, manager, advisor, accountant, frontdesk +1 | invoices:c | — | — | — | yes | `server/src/routes/invoices.ts` |
| UC-POST-ESTIMATES-ID-LINES-LINEID-DECLINE | POST /estimates/:id/lines/:lineId/decline | owner, manager, test | estimates:a | — | — | — | yes | `server/src/routes/estimates.ts` |
| UC-POST-ESTIMATES-ID-REJECT | POST /estimates/:id/reject | owner, manager, test | estimates:a | — | — | — | — | `server/src/routes/estimates.ts` |
| UC-POST-ESTIMATES-ID-REQUEST-APPROVAL-OTP | POST /estimates/:id/request-approval-otp | owner, manager, advisor, test | estimates:e | — | — | — | — | `server/src/routes/estimate-otp.ts` |
| UC-POST-ESTIMATES-ID-VERIFY-APPROVAL-OTP | POST /estimates/:id/verify-approval-otp | owner, manager, advisor, test | estimates:e | — | — | — | yes | `server/src/routes/estimate-otp.ts` |
| UC-POST-FLEETS-ID-RENEW | POST /fleets/:id/renew | owner, manager, advisor, frontdesk, callcenter +1 | customers:e | — | — | — | yes | `server/src/routes/fleets.ts` |
| UC-POST-INSPECTION-FINDINGS-ID-MEDIA | POST /inspection-findings/:id/media | owner, manager, advisor, technician, test | jobcards:e | — | — | — | — | `server/src/routes/inspection.ts` |
| UC-POST-INSURANCE-CLAIMS | POST /insurance-claims | accountant, test | accounting:c | — | — | — | yes | `server/src/routes/insurance-claims.ts` |
| UC-POST-INSURANCE-CLAIMS-ID-APPROVE | POST /insurance-claims/:id/approve | owner, accountant, test | accounting:a | yes | — | — | yes | `server/src/routes/insurance-claims.ts` |
| UC-POST-INSURANCE-CLAIMS-ID-PAY | POST /insurance-claims/:id/pay | accountant, test | accounting:e | — | — | — | — | `server/src/routes/insurance-claims.ts` |
| UC-POST-INSURANCE-CLAIMS-ID-REJECT | POST /insurance-claims/:id/reject | owner, accountant, test | accounting:a | — | — | — | — | `server/src/routes/insurance-claims.ts` |
| UC-POST-INVENTORY-ID-MOVEMENT | POST /inventory/:id/movement | owner, manager, parts, procurement, test | inventory:e | — | yes | — | yes | `server/src/routes/inventory.ts` |
| UC-DELETE-INVENTORY-ID-RESERVATION | DELETE /inventory/:id/reservation | owner, manager, parts, procurement, test | inventory:e | — | — | — | yes | `server/src/routes/inventory.ts` |
| UC-POST-INVENTORY-ID-RESERVATION | POST /inventory/:id/reservation | owner, manager, parts, procurement, test | inventory:e | — | — | — | yes | `server/src/routes/inventory.ts` |
| UC-POST-INVOICES | POST /invoices | owner, manager, advisor, accountant, frontdesk +1 | invoices:c | — | — | — | yes | `server/src/routes/invoices.ts` |
| UC-PATCH-INVOICES-ID | PATCH /invoices/:id | owner, manager, accountant, test | invoices:e | — | — | — | yes | `server/src/routes/invoices.ts` |
| UC-POST-INVOICES-ID-ISSUE | POST /invoices/:id/issue | owner, manager, accountant, test | invoices:e | yes | — | — | — | `server/src/routes/invoices.ts` |
| UC-POST-INVOICES-ID-PAYMENTS | POST /invoices/:id/payments | owner, manager, advisor, accountant, frontdesk +1 | payments:c | — | — | — | yes | `server/src/routes/invoices.ts` |
| UC-POST-JOB-CARDS-ID-DELIVERY-SIGNOFF | POST /job-cards/:id/delivery-signoff | owner, manager, advisor, technician, test | jobcards:e | — | — | — | — | `server/src/routes/delivery.ts` |
| UC-POST-JOB-CARDS-ID-INSPECTION-FINDINGS | POST /job-cards/:id/inspection-findings | owner, manager, advisor, technician, test | jobcards:e | — | — | — | yes | `server/src/routes/inspection.ts` |
| UC-POST-JOBS-ID-ASSIGN | POST /jobs/:id/assign | owner, manager, advisor, technician, test | jobcards:e | — | — | — | yes | `server/src/routes/workshop.ts` |
| UC-POST-JOBS-ID-TRANSITION | POST /jobs/:id/transition | owner, manager, advisor, technician, test | jobcards:e | — | — | — | yes | `server/src/routes/workshop.ts` |
| UC-POST-LEAVE-REQUESTS-ID-APPROVE | POST /leave-requests/:id/approve | owner, hr, test | hr:a | — | — | — | yes | `server/src/routes/leave.ts` |
| UC-POST-LEAVE-REQUESTS-ID-REJECT | POST /leave-requests/:id/reject | owner, hr, test | hr:a | — | — | — | — | `server/src/routes/leave.ts` |
| UC-POST-PAYROLL-RUNS-ID-POST | POST /payroll/runs/:id/post | owner, hr, test | hr:e | — | — | — | — | `server/src/routes/payroll.ts` |
| UC-POST-PROCUREMENT-PURCHASE-ORDERS | POST /procurement/purchase-orders | owner, manager, parts, procurement, test | procurement:c | — | — | — | yes | `server/src/routes/procurement.ts` |
| UC-PATCH-PROCUREMENT-PURCHASE-ORDERS-ID | PATCH /procurement/purchase-orders/:id | owner, procurement, test | procurement:e | — | — | — | yes | `server/src/routes/procurement.ts` |
| UC-POST-PROCUREMENT-PURCHASE-ORDERS-ID-APPROVE | POST /procurement/purchase-orders/:id/approve | owner, manager, accountant, procurement, test | procurement:a | yes | — | — | yes | `server/src/routes/procurement.ts` |
| UC-POST-PROCUREMENT-PURCHASE-ORDERS-ID-RECEIVE | POST /procurement/purchase-orders/:id/receive | owner, procurement, test | procurement:e | — | yes | — | yes | `server/src/routes/procurement.ts` |
| UC-POST-PROCUREMENT-REQUISITIONS | POST /procurement/requisitions | owner, manager, parts, procurement, test | procurement:c | — | — | — | yes | `server/src/routes/procurement.ts` |
| UC-PATCH-PROCUREMENT-REQUISITIONS-ID | PATCH /procurement/requisitions/:id | owner, procurement, test | procurement:e | — | — | — | yes | `server/src/routes/procurement.ts` |
| UC-POST-PROCUREMENT-REQUISITIONS-ID-APPROVE | POST /procurement/requisitions/:id/approve | owner, manager, accountant, procurement, test | procurement:a | yes | — | — | yes | `server/src/routes/procurement.ts` |
| UC-POST-PROCUREMENT-REQUISITIONS-ID-REJECT | POST /procurement/requisitions/:id/reject | owner, manager, accountant, procurement, test | procurement:a | — | — | — | — | `server/src/routes/procurement.ts` |
| UC-POST-PROCUREMENT-REQUISITIONS-ID-SUBMIT | POST /procurement/requisitions/:id/submit | owner, procurement, test | procurement:e | — | — | — | — | `server/src/routes/procurement.ts` |
| UC-POST-PUBLIC-CUSTOMERS-REGISTER | POST /public/customers/register | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-PUBLIC-CUSTOMERS-RESEND-OTP | POST /public/customers/resend-otp | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-PUBLIC-CUSTOMERS-VERIFY-OTP | POST /public/customers/verify-otp | — | public / auth | — | — | — | — | `server/src/auth/routes.ts` |
| UC-POST-PUBLIC-LEADS | POST /public/leads | — | public / auth | — | — | — | yes | `server/src/routes/public.ts` |
| UC-POST-RECEIPTS | POST /receipts | owner, manager, advisor, accountant, frontdesk +1 | payments:c | — | — | — | — | `server/src/routes/invoices.ts` |

## The generated-collection pattern

Every writable collection gets the same five write use cases, so they are documented once:

| Use case | Route | Grant | Behaviour |
| --- | --- | --- | --- |
| Create one row | `POST /<collection>` | `c` | Validated, tenant-stamped, audited |
| Update one row | `PATCH /<collection>/:id` | `e` | Optimistic concurrency on `version`; a stale write is a 409 |
| Soft-delete one row | `DELETE /<collection>/:id` | `d` | Sets `deleted_at`; the row stays and is filtered out |
| Bulk update | `POST /<collection>/bulk-update` | `e` | One patch applied to many rows |
| Bulk delete | `POST /<collection>/bulk-delete` | `d` | Soft-deletes many rows |

All five run under row-level security, so a row outside the principal's scope is not merely refused — it is not visible to the statement at all.
