# External-Partner Tenancy Design (Supplier, Fleet, Insurance)

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-ARCH-006                               |
| Version     | 2.0 — widened from Supplier-only to the general pattern |
| Date        | 2026-09-18                                 |
| Status      | Proposed — not implemented                  |

## 1. Overview

Today, a "supplier" is a row inside one garage's own tenant data (`suppliers` table, `...tenant` spread, scoped by that garage's `orgId`). It has no login, no employees, and no existence independent of the garage that typed it in. Two different suppliers doing business with two different garages are two unrelated rows; the same real-world supplier company doing business with three garages on the platform would need three separate, disconnected rows, each maintained by hand by that garage's own staff. **Fleet operators and insurance companies have the same shape of gap** — a `fleets` row and an `insurer` free-text field, respectively, both equally garage-owned with no account or login behind them — and are folded into this document rather than each getting a bespoke design, because the fix is the same in all three cases.

This is a deliberate scoping decision made while building the live registration paths for the other portals (technician, procurement, and staff-created customer accounts — see [Onboarding Flows: Path D](../../user-documentation/workflows/onboarding-flows.md#path-d-garage-employee-accounts-live) and Path B's "Inviting Customers"). Those roles fit the existing single-tenant-type model (`organizations` = garages; `users.orgId` = which garage). A supplier, a fleet operator, and an insurance company do not: each is a second kind of account holder on the platform, one that should exist once and be usable by more than one garage, with its own staff and its own login — closer in shape to how `organizations` itself works than to how `technicians` does.

Building that is a materially different piece of work — it touches the tenancy model (`server/src/db/tenant.ts`, every RLS policy keyed on `org_id`), not just an auth route. It is proposed here, separately, so it can be built and reviewed as its own change, additive to the schema, without touching the technician/procurement/customer paths that already work.

**Scope note**: of the three, only Supplier has any groundwork laid (an unwired `supplierApplications` table and a `SupplierPortal` shell — see §2). Fleet and Insurance have neither a portal screen, a role, nor an application table today; this document proposes the same account-and-tenancy layer for all three, but the portal screens themselves (what a Fleet Portal or Insurance Portal actually shows) are a separate design pass per portal, not specified here.

## 2. What exists today (for contrast)

- `organizations` (`server/src/db/schema.ts:44`) has no `orgType` — every row is implicitly a garage.
- **Supplier**: `suppliers` (`schema.ts:458`) is `...tenant`-scoped — a garage's own vendor list, referenced by `purchaseOrders.supplierId` for that garage's own purchasing. `roleId` (`packages/contract/src/rbac.ts`) already includes a `supplier` role and `PERMS` already grants it `portalsupplier: 'vx'` — the authorization side is ready and waiting for an account type to use it. `supplierApplications` (`schema.ts:1246`) is a platform-level table (no `orgId`, its own `id` PK) shaped exactly like an application-and-review queue: `company`, `crNumber`, `vatNumber`, `contactName`, `phone`, `email`, `categories`, `regions`, `status`, `reviewedBy`, `reviewedAt`. **No route reads or writes it.** It was evidently drawn up for this feature and never wired up — this design reuses it rather than proposing a new table. `app/src/screens/portals/*` already has a `SupplierPortal` shell (fixture-backed) to extend.
- **Fleet**: `fleets` (`schema.ts:146`) is `...tenant`-scoped — a garage's own record of one corporate fleet customer (`contractType`, `contractValueHalalas`, `contactName`/`contactPhone`/`contactEmail`, `vehicleCount`). Nothing here is a login, there is no `fleet` role in `roleId`, no `fleetApplications` table, and no Fleet Portal screen anywhere in `app/src/screens`.
- **Insurance**: `insurancePolicies` (`schema.ts:821`) and `insuranceClaims` (`schema.ts:850`) are `...tenant`-scoped. `insurancePolicies.insurer` is a free-text `varchar` — not even a foreign key to a `suppliers`-like row, let alone an account. There is no `insurance` role, no application table, and no Insurance Portal screen.
- `garageApplications` (`schema.ts:1228`) is the same application/review pattern as `supplierApplications`, for onboarding a new garage org onto the platform, equally unwired. Out of scope here, but worth wiring alongside this for parity if that work is ever picked up.
- The generic "PortalCommunications" screen (`app/src/screens/portals/misc/PortalCommunications.tsx`) is a static, admin-facing message log with fixture data — not a garage↔partner channel of any kind, despite the description in some specs.

## 3. Proposed shape

### 3.1 `organizations.orgType`

Add `orgType: varchar('org_type', { length: 16 }).notNull().default('garage')` to `organizations`, with the new kind selected from `'garage' | 'supplier' | 'fleet' | 'insurance'`. Additive and non-breaking: every existing row defaults to `'garage'` with no migration of existing data required. A supplier company, a fleet operator, or an insurance company becomes its own `organizations` row with the matching `orgType`.

This is the load-bearing decision the rest of the design depends on, and it is one decision shared by all three partner types, not three separate ones. Alternatives considered and rejected:

- **A `partnerId` column on `users`, pointing at a `suppliers`/`fleets`/`insurancePolicies`-adjacent row, with that table promoted to hold its own auth fields.** Rejected: each of those tables is `...tenant`-scoped to one garage today, so a partner serving three garages would still need three rows, defeating the point. Promoting any of them to a cross-tenant table would break existing foreign references (`purchaseOrders.supplierId`, etc.) and every RLS policy that assumes the table is garage-owned.
- **A wholly separate table per partner type (`supplier_organizations`, `fleet_organizations`, `insurance_organizations`), parallel to `organizations`.** Rejected: three-way duplication of branches, users-per-org, RLS policy shape, and the audit/session plumbing that already exists for `organizations`, for no benefit over one discriminator column on the table that already has all of that.

### 3.2 Application and approval

- **Supplier**: wire the existing, unused `supplierApplications` table. `POST /public/supplier-applications` — public, unauthenticated, same posture as `POST /public/customers/register`: rate-limited, no session, writes a row with `status: 'pending'`. `GET /superadmin/supplier-applications` / `POST /superadmin/supplier-applications/:id/approve` / `.../reject` — gated on `superadmin`.
- **Fleet** and **Insurance**: no existing application table to reuse — add `fleetApplications` and `insuranceApplications` following the exact same shape as `supplierApplications` (company/contact/CR/VAT, plus whatever's type-specific: fleet size and vehicle types for Fleet; licence number and coverage lines for Insurance), reviewed through the same `superadmin` approve/reject pattern. Three tables with one shared shape, not one polymorphic table — keeps each type's specific fields typed rather than stuffed into a shared JSON blob, matching how `garageApplications`/`supplierApplications` are already two separate tables rather than one.
- On approval (any of the three): create an `organizations` row with the matching `orgType`, and a `users` row for the applicant's `email`/`contactName` with the matching role (`supplier`, or a new `fleet`/`insurance` role — open question §5.1). This is `register()`'s org-creation logic (`server/src/auth/service.ts`), parameterized by `orgType` and role — one shared helper, not three copies of `register()`.
- The new user is issued a `channel: 'invite'` link exactly as `createStaffUser`'s invite mode already does (`server/src/auth/otp.ts`'s `issueChallenge`/`verifyRecoveryToken`, `acceptInvite` in `service.ts`). No new credential mechanism for any of the three — the one built for Phase A already fits.
- Mirrors the also-unwired `garageApplications` pattern (`schema.ts:1228`) — worth wiring the same way for parity if that work is ever picked up, but not required by this design.

### 3.3 Partner-org staff

Once a partner org exists — supplier, fleet, or insurance — its `owner`-equivalent user should be able to add their own staff, the same way a garage owner adds a technician. This reuses `createStaffUser`/`POST /admin/staff` (`server/src/auth/service.ts`) as-is, scoped by `principal.orgId` as it already is — **no change needed there** for any of the three types, only a decision (open question, §5.2) about whether each partner org's own staff all hold one role or need an internal owner/staff distinction.

### 3.4 Linking a partner org to more than one garage

One generalized join table, `partner_garage_links`, rather than three near-identical `supplier_garage_links` / `fleet_garage_links` / `insurance_garage_links` tables:

| Column | Notes |
|---|---|
| `id` | ULID |
| `partnerOrgId` | references `organizations.id` where `orgType != 'garage'` |
| `garageOrgId` | references `organizations.id` where `orgType = 'garage'` |
| `partnerType` | `'supplier' \| 'fleet' \| 'insurance'` — denormalized from `partnerOrgId`'s org for cheap filtering, not a second source of truth |
| `status` | `active` / `inactive` |
| `createdAt`, `createdBy` | which side initiated the link |

Purely additive: today's `suppliers`/`fleets`/`insurancePolicies` rows (garage-owned, still referenced by `purchaseOrders.supplierId` and their own respective foreign keys) are untouched. A garage's Procurement screen, Fleet Accounts screen, or Insurance Claims screen would, once this ships, offer "link to a platform partner" as an alternative to (or alongside) its own private row — that per-screen UI decision is left open rather than specified here (open question §5.3).

### 3.5 Garage↔partner messaging

One table (name TBD — `partner_messages`, or a scoped use of the existing `conversations` table), keyed by a `partner_garage_links` row so a message always has a real, approved relationship behind it — shared across all three partner types rather than three separate message tables. Surfaced as a real screen on each partner's own portal (`SupplierPortal` today; a Fleet Portal and Insurance Portal once those exist) plus a matching garage-side screen — replacing the static `PortalCommunications.tsx` fixture for these channels specifically. `PortalCommunications`'s other message types (system alerts, customer messages) are out of scope for this change and keep working exactly as they do today.

### 3.6 Fleet and Insurance portal screens — not designed here

Unlike Supplier, which has `project/spec/070-Vendor-Supplier-Portal.README.md` and a `SupplierPortal` shell to extend, **no spec or screen exists for a Fleet Portal or an Insurance Portal**. This document proposes the account/tenancy layer (§3.1–§3.5) that any such portal would sit on top of; what a fleet operator or an insurance company actually needs to see and do once logged in — a fleet's vehicle list and service history across garages, an insurer's claims queue and approval workflow — needs its own design pass, informed by whoever owns the Fleet and Insurance domains today, before screens are built.

## 4. Sequencing and isolation

Per the decision that produced this document: build this on its own branch, additive-only against the schema (a new `orgType` column with a safe default, new tables, no edits to `suppliers`/`purchaseOrders`/`fleets`/`insurancePolicies`/`insuranceClaims`/existing RLS policies), and merge only once a full vertical slice — application, approval, partner org creation, partner staff, garage links, messaging, for at least one partner type — works end to end. The technician/procurement/customer paths this document contrasts against (§2) ship independently of this and are not blocked on it. Supplier is the natural first slice to build, since it alone has existing groundwork (§2); Fleet and Insurance can follow once the shared layer (§3.1, §3.3–§3.5) is proven against Supplier, needing only their own application table (§3.2) and portal screens (§3.6) on top.

## 5. Open questions before implementation starts

1. Do `fleet` and `insurance` need their own `roleId` entries (`packages/contract/src/rbac.ts`), or does each reuse `supplier`'s `external` scope under a generic partner role, and do they need their own `portalfleet`/`portalinsurance` permission modules (there is no such module today, unlike `portalsupplier`)? Any of these is a coordinated frontend-parity change (`rbac-parity.test.ts`; see the note on that in `server/src/auth/routes.ts`'s `/admin/staff` handler).
2. Within one partner org — supplier, fleet, or insurance — does staff all share one role, or need an owner/staff distinction the way a garage has `owner` vs `manager`? One answer for all three, or does it vary by type?
3. How does a garage's existing private `suppliers`/`fleets`/`insurancePolicies` row reconcile with a linked platform partner — are they merged, cross-referenced, or left as two separate concepts a garage chooses between? Likely answered differently per screen (Procurement vs. Fleet Accounts vs. Insurance Claims), not with one shared rule.
4. Should `garageApplications` be wired up in the same pass, for one shared review-queue UI across all four application types, or kept as a separate follow-up?
5. Who designs the Fleet Portal and Insurance Portal screens themselves (§3.6), and on what timeline relative to the account layer?

## References

- [Onboarding Flows](../../user-documentation/workflows/onboarding-flows.md) — the live paths this document contrasts against
- [Supplier Portal Guide](../../user-documentation/portals/supplier-portal-guide.md) — the user-facing guide, marked planned pending this work
- [Portals domain doc](../../21_DOMAIN_DOCUMENTATION/PORTALS.md) — generated actor/grant matrix
- `server/src/auth/service.ts`, `server/src/auth/otp.ts` — the invite/credential mechanism this design reuses rather than duplicates
