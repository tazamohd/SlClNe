# Master glossary

**Status:** NORMATIVE · **Owner:** Documentation architect

Every term below is grounded in code that exists in this repository. Where a term
has a specific spelling in the source, that spelling is given in backticks and
the file naming it is cited. Where a definition has a consequence — a bug it
prevents, a guarantee it carries — the consequence is stated, because a
definition that omits it is decoration.

---

## 1. Domain terms — workshop and automotive

**Job card.** The central workshop entity: one vehicle, one visit, one unit of
work. Declared in `packages/contract/src/entities/jobCard.ts` and stored in
`job_cards` (`server/src/db/schema.ts`). It carries two orthogonal
position values — `status` for the board and `stage` for the gate machine —
because the board must be able to say `in_progress` while the gate machine
insists the job is still at `repair`.

**Job status.** The operational state the board shows: `pending`,
`in_progress`, `completed`, `delivered`, `cancelled` (`jobStatus`,
`packages/contract/src/entities/jobCard.ts`).

**Job stage.** The workflow position, walked one step at a time through
`JOB_STAGE_TRANSITIONS`: `checkin` → `inspection` → `estimate` → `repair` →
`qc` → `delivery` → `invoiced` → `closed`, with two backward edges (`estimate`
→ `inspection`, `qc` → `repair`). A transition not in that table is refused
with 422. Stage and status are deliberately absent from the generic PATCH shape
(`jobCardUpdate` omits them): leaving them there let any role holding
`jobcards:e` send `{ stage: 'delivery' }` and walk a car past QC.

**Check-in.** The first stage of a job card (`checkin`) and the act of
receiving a vehicle into the workshop. Also the kiosk journey — the `kiosk`
permission module and the `/kiosk-check-in` route tracked in
`project-control/BASELINE.json`.

**Inspection / diagnosis.** The stage between check-in and estimate. Diagnosis
is modelled as its own set of tables — `diag_stages`, `diag_findings`,
`diag_parts`, `diag_labour`, `diag_copies` (`server/src/db/schema.ts`) — and
`diagnostic` is one of the eight `jobService` values.

**Job service.** The kind of work a job card is for: `maintenance`, `repair`,
`diagnostic`, `inspection`, `tire_service`, `body_paint`, `ac_service`,
`oil_change` (`jobService`).

**Job priority.** `low`, `medium`, `high`, `urgent` (`jobPriority`).

**Estimate.** A priced proposal of parts and labour lines, offered to a
customer before work proceeds. Statuses are `draft`, `sent`, `approved`,
`rejected`, `expired` (`packages/contract/src/entities/estimate.ts`). No total
is accepted from the client — it is summed from the lines server-side. An
approved estimate becomes invoice lines; a total above the approver's ceiling
escalates rather than approving.

**Estimate line.** One priced row of an estimate, of `kind` `part` or `labour`,
with `qty` and `unitPriceHalalas`. Between 1 and 200 lines per estimate.

**Appointment.** A booked slot: a date, a `startMinute` (minutes past
midnight), a `durationMins`, a vehicle, and a bay. Stored in `appointments`
(`server/src/db/schema.ts`).

**Bay.** A named working position in the workshop. It is a first-class column
(`bay`) on both `appointments` and `obd_devices`, and it is indexed as
`appointments_bay_idx` on `(org_id, scheduled_date, bay)` because the bay is
what the overlap check reads — two appointments must not occupy one bay at one
time.

**Technician.** The person who performs the work. A `technicians` table, a
`technician` role, and `job_cards.assigned_tech_id` — which is also the column
the `own`/`assigned` RLS policy narrows by (`owner_columns` in
`server/drizzle/0001_rls.sql`).

**Service advisor.** The customer-facing role that raises jobs and estimates,
spelled `advisor` in `roleId` and "Service Advisor" in the screen
specifications (`app/src/data/generated/spec-screens.ts`). Branch-scoped, with
an approval ceiling of SAR 5,000.

**QC — quality check.** The gate between `repair` and `delivery`. Passing QC is
an *approval*, not an edit: the `qc` → `delivery` transition is gated on
`jobcards:a` while every other transition requires `jobcards:e`
(`server/src/routes/workshop.ts`), and the passer is recorded in
`job_cards.qc_passed_by`. The `qc` role holds `va` on `jobcards` with an
approval ceiling of zero — it passes quality, it releases no money.

**Requisition.** An internal request to buy, raised before any supplier is
committed. `requisitions` + `requisition_lines`, with a per-organization unique
`code`. Its estimated total is summed from its lines by the server
(`server/src/routes/procurement.ts`).

**Purchase order (PO).** The committed order to a supplier, optionally raised
from an approved requisition (`purchase_orders.requisition_id`). Its total is
summed subtotal + VAT from its lines. Approval checks three things in order:
the permission, the SAR ceiling for the role against the PO total, and
segregation of duties — the raiser may not approve their own order.

**Receiving.** Booking delivered quantities against a purchase order's lines,
under the invariant `received ≤ ordered`, tracked in
`purchase_order_lines.received_qty`. An over-receipt is refused, never absorbed
silently. (The repository calls this step *receiving*; there is no "goods
receipt" entity.)

**Golden path.** The named end-to-end journey a domain is expected to complete.
In procurement it is `requisition → purchase order → receiving`
(`packages/contract/src/entities/procurement.ts`). Golden paths are also a
release gate: `goldenPathsUnwritten` and `goldenPathsFailing` are ratcheted at
zero in `project-control/BASELINE.json`.

**OBD — on-board diagnostics.** The vehicle diagnostic interface. `obd_devices`
records a connected reader by `code`, `bay`, `plate`, `vin` and live telemetry
(`rpm`, `coolant`, `voltage`, `load`, `dtc_count`); `obd_dtc_readings` records
what it read.

**DTC — diagnostic trouble code.** A standardised fault code read from the
vehicle. `dtc_codes` holds `code`, bilingual `description`/`description_ar`,
`severity`, the `system` it belongs to, and whether a `freeze_frame` was
captured.

**OEM tool.** A manufacturer-specific diagnostic tool, catalogued per `brand`
in `oem_tools` with a connection `status`.

**Fleet.** A customer that owns many vehicles under one contract. `fleets`
carries `vehicle_count`, `active_count`, `contract_status`, `contract_type` and
`contract_value_halalas`; customers link to it through `customers.fleet_id`.

**VIN — vehicle identification number.** `vehicles.vin`, `varchar(17)` — the
standard VIN length.

**Invoice / payment / receipt.** The billing chain. An invoice must be issued
before it can take a payment, a cancelled invoice takes none, a payment may not
exceed the outstanding balance, and a refund may not exceed the amount
collected (`checkPayment`, `checkRefund` in
`packages/contract/src/rules/money.ts`).

**Knowledge base procedure.** A written repair procedure, stored in
`kb_procedures` and gated with the workshop modules.

---

## 2. Money and tax

**Halala.** The minor unit of the Saudi riyal; 100 halalas = 1 SAR. **Every
money value in this system is an integer count of halalas.** Any column holding
money is `bigint` and named `*_halalas` (`server/src/db/schema.ts`, rule 2),
and the `halalas` primitive validates the same on the wire. The consequence is
the point: a `numeric` or float rounding surprise cannot reach a ledger,
because there is no fractional representation to round.

**SAR.** Saudi riyal, the display currency. It appears only at presentation
(`sarString`, `sarNumber` in `server/src/present.ts`) and in the approval
ceilings, which are declared in riyals (`limitSar`) and converted to halalas
before comparison (`approvalCeilingHalalas`).

**VAT — value added tax.** `VAT_RATE_BPS = 1500`
(`packages/contract/src/rules/money.ts`).

**Basis point (bps).** One hundredth of one percent. The VAT rate is stored in
basis points rather than as a decimal fraction so the rate itself is exact:
1500 bps is 15%, divided by `BPS_DIVISOR = 10_000` at the point of use.

**ZATCA.** The Zakat, Tax and Customs Authority — the Saudi tax authority whose
standard rate `VAT_RATE_BPS` encodes. The invoice schema carries ZATCA phase-2
fields, and `server/src/routes/invoices.ts` builds the phase-2 TLV QR payload
and the invoice hash chain.

**Subtotal.** The sum of `qty × unitPriceHalalas` across all lines, rounded
once at the end (`subtotalHalalas`).

**Discount.** Clamped into `[0, subtotal]` — a discount can neither be negative
nor exceed what is being discounted (`discountHalalas`).

**Net.** `subtotal − discount`. VAT is computed on the net, not on the gross.

**Tax.** `roundHalfUp(net × vatRateBps / 10_000)` (`taxHalalas`).

**Total.** `net + tax`, equivalently `subtotal + tax − discount`
(`totalHalalas`).

**Half-up rounding, applied once.** `roundHalfUp` rounds away from zero at the
last halala, preserving sign. It is applied exactly twice per document — at the
subtotal and at the tax — and **never per line**. Rounding each line would let
a 500-line invoice drift by up to 500 halalas from the figure the customer was
quoted.

**Server-computed totals.** No client-sent total is ever trusted. Totals are
derived from the lines in the handler; the same pure functions run in the form
only to produce the inline message.

**Double entry.** A journal entry needs at least two lines and its debits must
equal its credits (`checkJournalBalanced`).

---

## 3. Security and tenancy

**Tenant.** The isolation unit. A row in `organizations` *is* the tenant —
organizations sit above tenancy rather than inside it.

**Organization.** The tenant row itself: name (EN/AR), `slug`, `cr_number`,
`vat_number`, `plan`, `status`. Every tenant-owned table carries `org_id`
referencing it, because row-level security anchors on that column.

**Branch.** A physical location within an organization (`branches`). Rows owned
by the organization rather than by one location carry `branch_id = NULL`, and
the branch policy treats NULL as visible to everyone in the organization.

**Request context.** The four (in practice five) settings the API pushes into
PostgreSQL with `set_config(..., true)` — i.e. `SET LOCAL` — at the start of
every transaction: `app.org_id`, `app.branch_id`, `app.user_id`, `app.scope`
and `app.customer_id` (`applyTenantContext`, `server/src/db/tenant.ts`). The
policies read them through `app_org()`, `app_branch()`, `app_user()` and
`app_scope()` (`server/drizzle/0001_rls.sql`), each of which returns NULL when
unset — so a connection with no context set sees nothing at all. Failing closed
is the only safe default for an isolation primitive.

**Principal.** The authenticated caller as the server models it: `userId`,
`orgId`, `branchId`, `role`, `scope`, and `customerId` for portal logins
(`server/src/db/tenant.ts`).

**RLS — row-level security.** Tenant isolation implemented as PostgreSQL
policies rather than as a `WHERE` clause, because a `WHERE` clause is something
a developer has to remember and a policy is something the database applies
whether they remembered or not. A handler that adds `WHERE org_id = …` is
writing a second, redundant defence — not the only one.

**PERMISSIVE policy.** OR-ed with the other permissive policies on the table.
`p_tenant` is permissive: `app_scope() = 'platform' OR org_id = app_org()`.
Because permissive policies widen, a "branch scope" policy added as permissive
beside the tenant one would *grant* the whole organization to a branch-scoped
user.

**RESTRICTIVE policy.** AND-ed with everything else, so it can only narrow.
`r_branch` and `r_own` are restrictive for exactly that reason. This is the
one place where copying the illustrative three-permissive-policy snippet from
the handoff would have produced a live isolation hole.

**FORCE ROW LEVEL SECURITY.** `ALTER TABLE … FORCE ROW LEVEL SECURITY` makes
the table's *owner* subject to its own policies. Without it the migration role
that owns the table silently bypasses isolation — enabling RLS without forcing
it protects everyone except the account most likely to run an ad-hoc query.

**Data scope.** Which *rows* a role may see, as distinct from which module it
may act on. Declared as `dataScope` in `packages/contract/src/rbac.ts` and
enforced by RLS:

| Scope | Meaning |
| --- | --- |
| `platform` | Every tenant. The only scope for which `p_tenant` short-circuits the `org_id` comparison. Held by `superadmin` alone. |
| `all` | The whole organization, every branch. Not cross-tenant: `p_tenant` still applies. |
| `org` | Declared in the `dataScope` enum but assigned to no role in `ROLE_META` and named by no policy. Reserved, not in force. |
| `branch` | The caller's own branch, plus organization-level rows where `branch_id IS NULL`. Enforced by the restrictive `r_branch`. |
| `own` | Rows the caller owns — `r_own` compares the table's owner column (e.g. `job_cards.assigned_tech_id`) or `created_by` against `app_user()`. Held by `technician`. |
| `self` | A portal login sees the rows belonging to the `customers` row it *is*. It narrows by `users.customer_id` against `app_customer()` in the `r_self` policies added by `drizzle/0014`. A self-scoped account with no customer link sees nothing, because NULL matches no row. Held by `customer`. |
| `assigned` | Rows assigned to the caller. Named alongside `own` and `self` in both the branch and owner predicates, so an assigned-scope principal is narrowed by branch *and* by the owner column. |
| `external` | A counterparty outside the organization's staff. Narrowed by `r_branch` like the internal narrow scopes. Held by `supplier`. |

**Grant letters.** The six-letter action alphabet in
`packages/contract/src/rbac.ts`: `v` view, `c` create, `e` edit, `d` delete,
`a` approve, **`x` export — not delete**. A cell is the concatenation of the
letters granted (`'vcedax'` is the full set); `''` means denied.

**Why `x` mattered.** The handoff documented five letters and called `x`
delete. `server/src/routes/collections.ts` checked `'x'` on DELETE, which under
the correct six-letter reading granted delete to every role holding
view-plus-export: accountant on the audit log, job cards, estimates and
inventory; technician and customer on their portals. Roughly twenty cells, live
until it was caught. The matrix is what is enforced, and the matrix says
export.

**Module.** The 28 permission subjects a grant is expressed against
(`moduleId`). A grant answers "which module", never "which rows" — `jobcards:
'v'` also covers the diagnostic and knowledge-base collections, and what keeps
a customer out of them is the deny-by-default `r_self` policy, not the matrix.

**Approval ceiling.** The maximum value a role may approve, declared in riyals
as `ROLE_META[role].limitSar` and compared in halalas by
`approvalCeilingHalalas`. `null` is unlimited; `0` means may not approve.
Authority and ceiling answer different questions and both must hold:
`canApprove` first checks the `a` grant on the module, then the ceiling.
Reading the ceiling alone said yes for `superadmin` on every business document
— a tenant-boundary violation.

**SOD — segregation of duties.** Two responsibilities one person must not hold
at once, listed with a risk rating in `SOD`. Six pairs, four rated high: raise
vs approve a purchase order, create a supplier vs approve its payment, post vs
approve a journal entry, perform a repair vs pass its quality check; and two
medium: issue stock vs adjust stock count, create an employee vs approve the
payroll run. Enforced in the handlers, not merely documented — the procurement
approval route refuses the raiser.

**Field redaction.** Hiding named fields from named roles, independent of the
row being visible at all. `FIELD_RULES` lists seven bilingual fields — part
cost/margin, labour cost rate, employee salary, supplier purchase price,
customer contact details, bank account details, branch P&L — each with the
roles it is hidden from. A row a role may read is not a row every column of
which it may read.

**Audit log, append-only.** `audit_log` is insert-only for *everyone including
the table owner*: `audit_log_is_immutable()` raises
`insufficient_privilege` on UPDATE and DELETE via triggers. Reads are
org-scoped.

**Frontend RBAC is not a security boundary.** The generated copy in
`app/src/data/generated/rbac.ts` hides and disables; every request is re-checked
server-side. `server/tests/rbac-parity.test.ts` asserts the two copies are
identical, so a divergence fails a test rather than quietly granting more than
the sidebar shows.

**Acting role.** `users.acting_role` — the role an account is currently acting
as, settable only by the all-access `test` account through
`POST /auth/switch-role`. The effective role every check reads is
`actingRole ?? role`. It is a column rather than a token claim so a switch
takes effect, and can be taken away, within the access token's lifetime rather
than the refresh token's.

---

## 4. Platform terms

**ULID.** Universally Unique Lexicographically Sortable Identifier — the
26-character primary key used by every table. Columns are
`varchar(26)`, never `char`: `char` blank-pads to its declared width, so an
identifier that is not exactly 26 characters would compare unequal to the value
that was written, which surfaces as an authorization check silently failing.

**Universal fields.** The columns spread into every tenant-owned table by the
`tenant` object: `id`, `org_id`, `branch_id`, `created_at`, `updated_at`,
`created_by`, `updated_by`, `deleted_at`, `version`.

**Soft delete.** A row is retired by setting `deleted_at`, never by removing
it. Every query filters on it, and partial indexes
(`… WHERE deleted_at IS NULL`, e.g. `job_cards_live_idx`) keep those queries on
an index rather than a sequential scan. 61 of 68 entities carry it
(`project-control/ENTITY_REGISTRY.json`).

**Optimistic concurrency / `version`.** Each row carries an integer `version`;
a write names the version it read and is refused if the row has moved on. The
version is bumped by the database (`bump_version()` trigger, BEFORE UPDATE on
every tenant table), not by the statement, so a hand-written UPDATE cannot
leave a stale version behind and let the next writer overwrite a change they
never saw. In HTTP terms a stale write is a 409, not a silent overwrite.

**Idempotency key.** The `Idempotency-Key` header on endpoints that move money
or stock. A replay returns the stored response and creates no second business
effect; the same key with a *different* body is a caller bug and is refused
with 409 rather than replayed, because a client that reuses a key by accident
would otherwise silently lose the second payment. Records live in
`idempotency_keys`, which is itself tenant-scoped under RLS
(`server/src/http/idempotency.ts`).

**Collection.** One uniform, described resource. `server/src/registry.ts`
declares each of the 52 collections once — key, path, table, the permission
module that gates it, the columns `?q=` searches and `?sort=`/`?filter[]=`
accept, the default sort, an optional human `codeColumn`, whether it is
`writable`, and how a row is `present`ed. The alternative, 52 hand-written
routers, guarantees that one of them forgets the soft-delete filter or the
permission check.

**Generated route.** A route produced from a `CollectionDef` by
`server/src/routes/collections.ts`. 172 of the 303 endpoints.

**Explicit route.** A hand-written route, for anything with behaviour of its
own: estimates, invoices and payments carry line items, derived money and
idempotency; procurement carries approval ceilings; authentication is its own
surface. 131 of the 303 endpoints.

**`present`.** The per-collection function that maps a database row to the
exact shape the screens already consume, with entity metadata added. It is what
kept the mock → HTTP swap non-destructive: no screen had to change.

**Repository seam.** The single boundary through which the SPA reads and writes
data — `app/src/data/repository.ts` with its TanStack Query bindings
(`useCollection`) and HTTP transport (`app/src/data/http/client.ts`).
Persistence logic lives there and nowhere else; a visual component never knows
about cache keys, rollback or version conflicts. It is the seam that let the
design fixtures be swapped for the API screen by screen. See
`docs/system/adr/adr-003-repository-seam.md`.

**Surface.** A distinct delivery context a screen belongs to, as recorded in
the screen registry: `app`, `auth`, `portal`, `public`, `kiosk`, `customer-app`,
`call-center`, `native`, `reference`. Also used loosely in the server for a
group of related endpoints ("the auth surface").

**Shell.** The single layout component wrapping every screen of a surface —
`AppShell` for operational screens, plus `PortalShell`, `PublicShell`,
`CustomerAppShell`, `MobileShell` (`app/src/components/shell/`). The design
bundle copy-pasted the same chrome into 191 desktop files; one shell replaces
them, so a change to the sidebar is one edit rather than 191.

**Capability.** A grouping of permission modules and screen domains — the two
taxonomies the implementation already agrees on — used as the unit of the
business capability map (`CAP-WORKSHOP`, `CAP-BILLING`, …). Inventing a third
taxonomy for the documentation would give a map that looks tidy and drifts from
the product within a release. Every registered screen and every endpoint maps
to exactly one capability, and an unmapped one fails `docs:check`.

**Screen registry.** `project-control/MASTER_REGISTRY.json`, built by
`app/scripts/build-registry.mjs` from the screen sources and the design bundle.
It is the measured inventory of screens; the generated
`docs/20_UI_UX_EXPERIENCE/SCREEN_REGISTRY.md` is a reading of it, not a second
copy.

**Data-backed.** A screen that reads the live API through the repository seam.
99 of 424 registered capabilities.

**Mock-only.** A screen that still renders the ported design fixtures rather
than the API. 285 of 424. "Rendered and asserted" is not the same as "wired to
production data", and the registry keeps the two columns apart so the
difference cannot be reported away.

**Ratchet.** A recorded measurement that may fall but never rise. The a11y
colour-contrast counts, placeholder routes, source markers, forbidden colours,
inline tokens and golden-path failures are all ratcheted in
`project-control/BASELINE.json`, whose own note says: "These numbers may fall,
never rise. Update only when lowering them, and never to accommodate a
regression."

**Baseline.** The stored ratchet file itself, `project-control/BASELINE.json`,
against which `npm run gates` re-checks each run.

**Presentational column (`*_label`).** A column holding a presentation string
the design bundle carried where it had no machine value at all — `"2 weeks
ago"`, `"9:00 AM"`. Seeded verbatim so a rebuilt screen renders exactly what
the prototype rendered; where a machine value exists it sits beside the label
(`appointments.time_label` beside `appointments.start_minute`).

**Code column.** A human business code the design shows — `INV-2026-0142`,
`A3F8B2C1` — unique per organization. Detail routes accept either the code or
the ULID.

**Access token / refresh token.** A 15-minute JWT carrying the claims a request
is authorized against, and a 30-day JWT naming a `user_sessions` row. Signed
with `jose`, HS256 (`server/src/auth/tokens.ts`). Revocation works because the
session row, not the token, is the authority.

---

## 5. Roles

Fifteen roles (`roleId`, `packages/contract/src/rbac.ts`). The grant says
*which module*; the scope says *which rows* and is enforced by RLS; the ceiling
says *how much money a role may release*. Ceilings are declared in SAR
(`limitSar`) and compared in halalas.

| Role | Data scope | Approval ceiling (SAR) | In halalas | Notes |
| --- | --- | --- | --- | --- |
| `owner` | `all` | unlimited | — | The organization's principal. Full grants on every business module. |
| `superadmin` | `platform` | unlimited | — | Platform administrator: the only role that crosses the tenant boundary. Holds `a` only on `ai`, `admin` and `settings`, so the unlimited ceiling never applies to a tenant's documents. |
| `manager` | `branch` | 50,000 | 5,000,000 | Branch management. Highest business ceiling. |
| `advisor` | `branch` | 5,000 | 500,000 | Service advisor. Raises jobs and estimates. |
| `technician` | `own` | 0 (may not approve) | 0 | Sees only jobs assigned to them, via `job_cards.assigned_tech_id`. |
| `qc` | `branch` | 0 (may not approve) | 0 | Holds `jobcards:a` — it passes quality, it releases no money. |
| `parts` | `branch` | 10,000 | 1,000,000 | Full grants on `inventory`. |
| `accountant` | `all` | 25,000 | 2,500,000 | Full grants on `accounting`, `invoices`, `payments`. |
| `hr` | `all` | 15,000 | 1,500,000 | Full grants on `hr`. |
| `frontdesk` | `branch` | 0 (may not approve) | 0 | Owns the `kiosk` module (`vcex`). |
| `callcenter` | `all` | 0 (may not approve) | 0 | Organization-wide reach, no approval authority. |
| `procurement` | `all` | 20,000 | 2,000,000 | Full grants on `procurement` and `network`. |
| `supplier` | `external` | 0 (may not approve) | 0 | A counterparty. `v` on `procurement`, `vx` on `portalsupplier`. |
| `customer` | `self` | 0 (may not approve) | 0 | Portal login. `v` on `jobcards`, `estimates`, `invoices`, `vehicles`; `vc` on `appointments` because booking creates one. Safe only because `self` has an identity to narrow by (`users.customer_id`). |
| `test` | `all` | unlimited | — | The all-access QA account, not a business role: every action on every module, and the only role `/auth/switch-role` will act as another from. Scoped `all` rather than `platform` on purpose — "do everything" stops at the tenant boundary. Every request it makes is audited under its own user id. |
