# API Endpoints — SALIS AUTO

REST/JSON. All routes tenant-scoped by JWT; all responses re-check RBAC on the server (never trust the client). Payloads referenced as `Entity` map to shapes in `DATA_MODEL.md`.

Conventions:
- **List** endpoints support `?page=1&pageSize=25&sort=field:desc&q=search&filter[field]=value`.
- **Detail** endpoints return the full entity + expanded relations.
- All mutating endpoints return the updated entity, not `{ok:true}`.
- Errors: `{ error: { code, message, field? } }`, HTTP status 400/401/403/404/409/422.
- Timestamps: ISO 8601 UTC.
- Amounts: minor-units integer in the DB (`halalas`), formatted at the API boundary.

## Auth
- `POST /auth/login` — body: `{email, password}`. Returns `{accessToken, refreshToken, user}`. Access token embeds `{sub, role, org_id, branch_id, scope}`.
- `POST /auth/refresh` — body: `{refreshToken}`.
- `POST /auth/logout` — invalidates the refresh token.
- `POST /auth/forgot-password` — starts recovery.
- `POST /auth/reset-password` — with recovery token.
- `POST /auth/verify-otp` — 6-digit OTP (email or SMS).
- `POST /auth/2fa/enrol`, `POST /auth/2fa/verify` — TOTP.
- `POST /auth/biometric/enrol`, `POST /auth/biometric/challenge` — WebAuthn.
- `POST /auth/sso/start`, `POST /auth/sso/callback` — enterprise SSO.
- `POST /auth/social/:provider` — Google, Apple.
- `GET /auth/me` — the signed-in user, role, entitlements.

## Public (unauthenticated)
- `POST /public/garage-applications` — a business applies to join the platform.
- `POST /public/supplier-applications` — a supplier applies.
- `POST /public/customers/register` — body: `{garageId, name, phone, email?, password}`. Sends OTP.
- `POST /public/customers/verify-otp` — body: `{phone, otp}`.
- `POST /public/customers/resend-otp` — 60s throttle.
- `GET  /public/plans` — subscription catalog (marketing page).

## Platform (superadmin only)
- `GET  /platform/applications?type=garage|supplier&status=pending`
- `POST /platform/applications/:id/approve`
- `POST /platform/applications/:id/reject` — body `{reason}`
- `GET  /platform/subscription-requests?status=pending`
- `POST /platform/subscription-requests/:id/approve`
- `POST /platform/subscription-requests/:id/reject`
- `GET  /platform/stores` — all garages on the platform
- `GET  /platform/support-tickets`
- `POST /platform/support-tickets/:id/assign`
- `GET  /platform/system-health`
- `GET  /platform/audit-log`

## Subscription (tenant admin)
- `GET  /subscription` — current plan + entitlements + usage
- `GET  /subscription/plans`
- `POST /subscription/change` — body `{toPlanId, reason}`. Immediate if same-or-cheaper; otherwise creates a subscription_requests row.
- `POST /subscription/cancel` — immediate.
- `POST /subscription/reactivate`
- `GET  /subscription/invoices` — billing invoices for the tenant.

## Users, roles, teams, tenants
- `GET  /admin/users`, `POST /admin/users`, `PATCH /admin/users/:id`, `DELETE /admin/users/:id`
- `POST /admin/users/:id/reset-password`
- `POST /admin/users/invite` — sends invite email/SMS.
- `GET  /admin/roles`, `POST /admin/roles`
- `PATCH /admin/permissions` — body `{roleId, module, actions}`. Backs the matrix editor.
- `GET  /admin/teams`, CRUD.
- `GET  /admin/departments`, CRUD.
- `GET  /admin/branches`, CRUD.
- `GET  /admin/organizations` — platform-scoped.
- `GET  /admin/audit-log?entity=&actor=&from=&to=`

## Workshop core
- `GET  /jobs`, `GET /jobs/:id`, `POST /jobs`, `PATCH /jobs/:id`, `DELETE /jobs/:id`
- `POST /jobs/:id/transition` — body `{to: 'inspection'|'estimate'|...}`. Server validates state machine.
- `POST /jobs/:id/assign` — body `{techId}`.
- `POST /jobs/:id/upload` — inspection photos, docs.
- `GET  /appointments`, CRUD + `GET /appointments/calendar?from=&to=`.
- `GET  /estimates`, CRUD.
- `POST /estimates/:id/send-for-customer-approval` — triggers OTP + link.
- `POST /estimates/:id/customer-approve` — customer submits signature + selected line ids.
- `GET  /invoices`, CRUD.
- `POST /invoices/:id/issue` — locks the invoice, generates ZATCA QR, immutable.
- `POST /invoices/:id/payments` — body `{amount, method, ref}`.
- `GET  /receipts`, `POST /receipts`, `GET /receipts/:id/pdf`.

## Customers, vehicles, fleets
- `GET  /customers`, CRUD. `GET /customers/:id/360` — full profile with vehicles, jobs, invoices, notes.
- `GET  /vehicles`, CRUD. `GET /vehicles/:id/history` — every job, part, service.
- `POST /vehicles/:id/documents` — upload registration, insurance.
- `GET  /fleets`, CRUD. `POST /fleets/:id/contracts`.

## Inventory & Parts
- `GET  /inventory`, CRUD. Movements: `POST /inventory/:id/movement` body `{type: 'in'|'out'|'transfer'|'adjust', qty, ref}`.
- `GET  /purchase-orders`, CRUD, `POST /purchase-orders/:id/receive`.
- **Parts Network (B2B):**
  - `GET  /parts-network/requests` — my outgoing RFQs
  - `POST /parts-network/requests` — send a new RFQ (broadcast to targeted regions)
  - `GET  /parts-network/requests/:id/quotes` — incoming quotes for one RFQ
  - `POST /parts-network/requests/:id/quotes/:qid/accept` — creates a PO
  - `GET  /parts-network/incoming` — RFQs sent to me (I'm a supplier)
  - `POST /parts-network/incoming/:id/quote` — submit a quote
  - `GET  /parts-network/members` — network partners
  - `GET  /parts-network/orders` — orders across both sides

## Team
- `GET  /technicians`, CRUD.
- `GET  /technicians/schedule?date=&branchId=`
- `POST /technicians/:id/assign` — assign to a job.
- `GET  /hr/payroll`, generation endpoints.

## CRM & Marketing
- `GET  /crm/leads`, CRUD, `POST /crm/leads/:id/convert` (→ Opportunity).
- `GET  /crm/opportunities`, CRUD, stage transitions.
- `GET  /crm/tasks`, CRUD.
- `GET  /crm/segments`, CRUD, `GET /crm/segments/:id/members`.
- `GET  /crm/campaigns`, CRUD.
- `POST /crm/campaigns/:id/send` — dispatch (email/SMS/WhatsApp).
- `GET  /crm/campaigns/:id/stats` — sent/delivered/opened/clicked/replied.

## Accounting
- `GET  /accounting/coa`, CRUD (tree).
- `GET  /accounting/journal-entries`, CRUD, `POST /accounting/journal-entries/:id/post`.
- `GET  /accounting/expenses`, CRUD, approval workflow.
- `GET  /accounting/tax`, `POST /accounting/tax/zatca-return`.
- `GET  /accounting/bank-recon`, `POST /accounting/bank-recon/import` (CSV or bank feed).
- `GET  /accounting/statements/trial-balance?asOf=`
- `GET  /accounting/statements/income?from=&to=`
- `GET  /accounting/statements/balance-sheet?asOf=`
- `GET  /accounting/statements/cash-flow?from=&to=`

## Reports
- `GET  /reports/executive?range=`
- `GET  /reports/operational?range=&branchId=`
- `GET  /reports/workshop?range=`
- `GET  /reports/inventory`
- `GET  /reports/sales`
- `GET  /reports/insurance`
- `GET  /reports/loans`
- `POST /reports/custom` — the report builder submits its config JSON.
- `GET  /reports/bi/dashboard/:id`

## Diagnostics
- `POST /diagnostics/sessions` — start a scan on a VIN.
- `GET  /diagnostics/sessions/:id` — live sensor stream (SSE).
- `GET  /diagnostics/sessions/:id/dtc` — trouble codes read.
- `POST /diagnostics/reports` — generate a diagnostic report (PDF + shareables).
- `POST /diagnostics/reports/:id/share` — body `{recipients: ['reception','customer','storekeeper','supervisor']}`. Backend fans out notifications.

## Knowledge base
- `GET  /kb/procedures`, `GET /kb/procedures/:id`
- `GET  /kb/dtc/:code` — full DTC reference (symptoms, causes, steps)
- `GET  /kb/torque?make=&model=`
- `GET  /kb/wiring?make=&model=`

## AI Platform
- `POST /ai/chat` — body `{message, threadId?}`. Streams via SSE.
- `GET  /ai/prompts`, CRUD.
- `GET  /ai/agents`, `POST /ai/agents/:id/run`.
- `GET  /ai/agents/:id/runs` — history.
- `GET  /ai/conversations`
- `GET  /ai/analytics` — usage, cost.
- `GET  /ai/model-settings`, `PATCH /ai/model-settings`.

## Portals
- `GET  /portal/technician/jobs` — jobs assigned to me
- `POST /portal/technician/jobs/:id/step` — check-off inspection step
- `GET  /portal/customer/vehicles` — my vehicles
- `POST /portal/customer/bookings` — request an appointment
- `GET  /portal/customer/service-tracking/:jobId` — live status
- `GET  /portal/supplier/orders` — POs I received
- `POST /portal/supplier/orders/:id/confirm`
- `GET  /portal/procurement/requisitions`

## Notifications
- `GET  /notifications` — inbox
- `POST /notifications/:id/read`
- `POST /notifications/read-all`
- `GET  /notifications/preferences`, `PATCH` — per-channel opt-in

## Files
- `POST /files/upload` — multipart, returns `{id, url, mime, size}`. Signed short-URLs on read.
- `GET  /files/:id` — 307 redirect to signed URL.

## Search
- `GET  /search?q=&scope=jobs|customers|vehicles|invoices|all` — cross-entity federated search.

## WebSockets / SSE

Where live updates matter, stream via SSE (simpler than sockets for one-way):
- `GET /streams/jobs/:id` — job status changes
- `GET /streams/diagnostics/:sessionId` — live sensors
- `GET /streams/notifications` — push new notifications
- `GET /streams/ai/chat/:threadId` — streamed AI responses
