# Flow Spec — SALIS AUTO

The cross-screen workflows the UI expects. Everything below is designed in the `.dc.html` files — this document names the moving parts and the events that connect them so Claude Code can orchestrate them server-side.

## 1. Approvals

Any action whose amount exceeds the actor's `approvals.limit` (see RBAC) is routed to the next role up the chain.

**Chain (highest first):** owner → superadmin → manager → advisor → parts / accountant / procurement → self

Encoded as `APPROVAL_LINES` in `gms-data.js`.

**Screens:**
- The submitter sees `ApprovalInbox.dc.html` for their own pending items.
- The approver sees the same inbox filtered by "assigned to me".
- Decisions write to the entity's audit log.

**Server implementation:**
- On any mutating request that crosses a threshold, insert an `approval_lines` row referencing the entity (`estimate`, `purchase_order`, `expense`, `refund`) and set the entity's status to `pending_approval`.
- The approver's `approve` action re-runs the original mutation server-side under the approver's identity.
- Rejection returns the entity to `draft` with the reason attached.
- Segregation-of-duties: submitter ≠ approver is enforced by DB constraint, not just UI.

## 2. Customer estimate approval (with e-signature)

The estimate the workshop drafts becomes a document the customer signs off on:

1. Advisor issues estimate → `POST /estimates/:id/send-for-customer-approval`.
2. Backend generates a signed short-URL to `CustomerApproval.dc.html` + sends SMS/WhatsApp.
3. Customer opens the link, picks lines to include or defer (per-line checkboxes), views revised total.
4. Customer enters the SMS OTP → signs with finger/stylus (canvas → PNG).
5. `POST /estimates/:id/customer-approve` with `{selectedLineIds, otp, signatureBlob}`.
6. Server verifies OTP, stores signature, flips estimate to `customer_approved`, opens the corresponding job to `repair`.

Note the state-batching bug we fixed on the design: use setState with an updater to build the `selectedLineIds` set so rapid taps don't lose deselections. In your stack, use `setSelected(prev => …)`, never `setSelected(next)`.

## 3. Diagnostic report chain (OBD)

The chain you described:

1. Technician runs OBD (`OBDDiagnostics.dc.html`) — live sensors + DTC read.
2. Technician generates a report (`DiagnosticReport.dc.html`) — findings, photos, recommended parts, labour estimate.
3. Report submits with a `shareWith` array. Backend fans out:
   - **Reception** — receives it in `NotificationCenter` with a "discuss with customer" CTA.
   - **Customer** — receives an SMS/email link (PDF or web view).
   - **Vehicle history** — attached to `VehicleDetail`, permanent record.
   - **Storekeeper** — receives a parts-list task in `Inventory`; storekeeper enters prices → sends back.
   - **Workshop supervisor** — receives the priced report; adds labour hours + handling fee + ETA → sends back to reception as an estimate.
4. Reception hands the finalised estimate to the customer via the estimate-approval flow (§2).

**One entity, many notifications.** Model as one `diagnostic_report` row with a `diagnostic_report_shares` join table (report_id, recipient_type, recipient_id, ack_at) so you can query "who's still waiting".

## 4. Job lifecycle

Every workshop job walks the same state machine:

```
checkin → inspection → estimate → (customer_approved | rejected)
                         ↓
                       repair → qc → delivery → invoiced → closed
```

- `POST /jobs/:id/transition` validates the transition; illegal transitions return 409.
- Each transition writes an `audit_log` row and may emit a notification (e.g. customer notified at `repair` and `delivery`).
- The technician portal only allows transitions the tech is authorised for.

## 5. Notifications

Every notification has `{userId, type, entityRef, title, body, cta, readAt, ts}`. Fan-out is by `user + preference`:

- **In-app** — always (writes to inbox)
- **SMS** — for OTPs, customer estimate ready, appointment reminders
- **WhatsApp** — same triggers as SMS if opted in
- **Email** — receipts, invoices, statement summaries
- **Push** — mobile app only

User's preferences live at `GET /notifications/preferences` — the LanguageSelection screen writes the initial opt-in to `salis-notif` (localStorage today; a user preference row in your DB).

## 6. Multi-tenant onboarding

Two entry points converge into the app:

**Path A — Existing garage joins the platform:**
1. Owner submits `POST /public/garage-applications` (public marketing page).
2. Platform admin sees it in `SuperAdmin.dc.html` → approves.
3. Approval creates the `organizations` row, owner user, seed branches, and emails credentials.
4. Owner logs in → onboarding wizard (branches, users, sample data).

**Path B — Customer signs up under an existing garage:**
1. Customer arrives at `/garage/:slug/signup` (QR, link from reception).
2. Fills `Register.dc.html` → OTP verify (`OTPVerification.dc.html`).
3. Lands on `CustomerPortal.dc.html` with vehicles, appointments, invoices for that garage only.

**Path C — Supplier joins a garage network:**
1. Supplier submits `POST /public/supplier-applications` with categories + regions.
2. Platform (or garage owner, depending on policy) approves.
3. Supplier receives credentials, lands in `SupplierPortal.dc.html`.

## 7. Subscription changes

- Downgrade / cancel → immediate. `POST /subscription/change` with a cheaper plan applies now.
- Upgrade / paid change → creates `subscription_requests` row (pending), platform admin approves, plan flips on approval.
- UI shows "Pending approval — your plan will change to X on approval" between request and approval.
- Grace period: if a subscription lapses, the tenant enters read-only mode for 7 days before soft-suspend.

## 8. RBAC in flight

- **JWT** carries `role` and `org_id` — never `permissions` (server-side lookup, always fresh).
- **UI** hides / disables based on `can(mod, action)` — matches the same PERMS table.
- **API middleware** re-checks `can()` on every request; a 403 here is the last line of defence.
- **DB RLS** enforces data scope — even if a bug bypasses the middleware, the query itself sees no cross-tenant rows.

Three layers, same table. Never let them drift.
