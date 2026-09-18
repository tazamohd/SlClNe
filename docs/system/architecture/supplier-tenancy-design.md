# Supplier Tenancy Design

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-ARCH-006                               |
| Version     | 1.0                                        |
| Date        | 2026-09-18                                 |
| Status      | Proposed — not implemented                  |

## 1. Overview

Today, a "supplier" is a row inside one garage's own tenant data (`suppliers` table, `...tenant` spread, scoped by that garage's `orgId`). It has no login, no employees, and no existence independent of the garage that typed it in. Two different suppliers doing business with two different garages are two unrelated rows; the same real-world supplier company doing business with three garages on the platform would need three separate, disconnected rows, each maintained by hand by that garage's own staff.

This is a deliberate scoping decision made while building the live registration paths for the other portals (technician, procurement, and staff-created customer accounts — see [Onboarding Flows: Path D](../../user-documentation/workflows/onboarding-flows.md#path-d-garage-employee-accounts-live) and Path B's "Inviting Customers"). Those roles fit the existing single-tenant-type model (`organizations` = garages; `users.orgId` = which garage). A supplier does not: it is a second kind of account holder on the platform, one that should exist once and be usable by more than one garage, with its own staff and its own login — closer in shape to how `organizations` itself works than to how `technicians` does.

Building that is a materially different piece of work — it touches the tenancy model (`server/src/db/tenant.ts`, every RLS policy keyed on `org_id`), not just an auth route. It is proposed here, separately, so it can be built and reviewed as its own change, additive to the schema, without touching the technician/procurement/customer paths that already work.

## 2. What exists today (for contrast)

- `organizations` (`server/src/db/schema.ts:44`) has no `orgType` — every row is implicitly a garage.
- `suppliers` (`schema.ts:458`) is `...tenant`-scoped: a garage's own vendor list, referenced by `purchaseOrders.supplierId` for that garage's own purchasing. Nothing here is a login.
- `roleId` (`packages/contract/src/rbac.ts`) already includes a `supplier` role and `PERMS` already grants it `portalsupplier: 'vx'` — the authorization side is ready and waiting for an account type to use it.
- `supplierApplications` (`schema.ts:1246`) is a platform-level table (no `orgId`, its own `id` PK) shaped exactly like an application-and-review queue: `company`, `crNumber`, `vatNumber`, `contactName`, `phone`, `email`, `categories`, `regions`, `status`, `reviewedBy`, `reviewedAt`. **No route reads or writes it.** It was evidently drawn up for this feature and never wired up — this design reuses it rather than proposing a new table.
- `garageApplications` (`schema.ts:1228`) is the same pattern for onboarding a new garage org onto the platform, equally unwired. Out of scope here, but worth wiring alongside this for parity if that work is ever picked up.
- The generic "PortalCommunications" screen (`app/src/screens/portals/misc/PortalCommunications.tsx`) is a static, admin-facing message log with fixture data — not a garage↔supplier channel of any kind, despite the description in some specs.

## 3. Proposed shape

### 3.1 `organizations.orgType`

Add `orgType: varchar('org_type', { length: 16 }).notNull().default('garage')` to `organizations`. Additive and non-breaking: every existing row defaults to `'garage'` with no migration of existing data required. A supplier company becomes its own `organizations` row with `orgType: 'supplier'`.

This is the load-bearing decision the rest of the design depends on. Alternatives considered and rejected:

- **A `supplierId` column on `users`, pointing at a `suppliers` row, with `suppliers` promoted to hold its own auth fields.** Rejected: `suppliers` is `...tenant`-scoped to one garage today, so a supplier serving three garages would still need three rows, defeating the point. Promoting it to a cross-tenant table would break the existing `purchaseOrders.supplierId` foreign reference and every RLS policy that assumes `suppliers` is garage-owned.
- **A wholly separate `supplier_organizations` table, parallel to `organizations`.** Rejected: it would duplicate branches, users-per-org, RLS policy shape, and the audit/session plumbing that already exists for `organizations`, for no benefit over a discriminator column on the table that already has all of that.

### 3.2 Application and approval — wiring the existing table

- `POST /public/supplier-applications` — public, unauthenticated, same posture as `POST /public/customers/register`: rate-limited, no session, writes a `supplierApplications` row with `status: 'pending'`.
- `GET /superadmin/supplier-applications` / `POST /superadmin/supplier-applications/:id/approve` / `.../reject` — gated on `superadmin`, mirroring how `garageApplications` would be reviewed (build both together if this is picked up, for one review-queue UI rather than two).
- On approval: create an `organizations` row (`orgType: 'supplier'`) from the application's `company`/`crNumber`/`vatNumber`, and a `users` row for the applicant's `email`/`contactName` with `role: 'supplier'`. This is `register()`'s org-creation logic (`server/src/auth/service.ts`), parameterized by `orgType`, not a new code path — the two should share a helper.
- The new user is issued a `channel: 'invite'` link exactly as `createStaffUser`'s invite mode already does (`server/src/auth/otp.ts`'s `issueChallenge`/`verifyRecoveryToken`, `acceptInvite` in `service.ts`). No new credential mechanism — the one built for Phase A already fits.

### 3.3 Supplier staff

Once a supplier org exists, its `owner`-equivalent user should be able to add their own staff, the same way a garage owner adds a technician. This reuses `createStaffUser`/`POST /admin/staff` (`server/src/auth/service.ts`) as-is, scoped by `principal.orgId` as it already is — no change needed there, only a decision (open question, §5) about whether a supplier org's own staff all hold the single `supplier` role or need an internal owner/staff distinction.

### 3.4 Linking a supplier to more than one garage

New table `supplier_garage_links`:

| Column | Notes |
|---|---|
| `id` | ULID |
| `supplierOrgId` | references `organizations.id` where `orgType = 'supplier'` |
| `garageOrgId` | references `organizations.id` where `orgType = 'garage'` |
| `status` | `active` / `inactive` |
| `createdAt`, `createdBy` | which garage (or the supplier) initiated the link |

Purely additive: today's `suppliers` table (a garage's own vendor record, still used by `purchaseOrders.supplierId`) is untouched. A garage's Procurement screen would, once this ships, offer "link to a platform supplier" as an alternative to (or alongside) its own private vendor row — that UI decision is left open rather than specified here, since it depends on how Procurement wants to reconcile "my private vendor list" with "platform suppliers I'm linked to."

### 3.5 Garage↔supplier messaging

New table (name TBD — `supplier_messages` or a scoped use of the existing `conversations` table), keyed by a `supplier_garage_links` row so a message always has a real, approved relationship behind it. Surfaced as a real screen on both sides — the supplier's own `SupplierPortal`, and a new garage-side screen — replacing the static `PortalCommunications.tsx` fixture for this one channel type specifically. `PortalCommunications`'s other message types (system alerts, customer messages) are out of scope for this change and keep working exactly as they do today.

## 4. Sequencing and isolation

Per the decision that produced this document: build this on its own branch, additive-only against the schema (a new `orgType` column with a safe default, new tables, no edits to `suppliers`/`purchaseOrders`/existing RLS policies), and merge only once the whole vertical slice — application, approval, supplier org creation, supplier staff, garage links, messaging — works end to end. The technician/procurement/customer paths this document contrasts against (§2) ship independently of this and are not blocked on it.

## 5. Open questions before implementation starts

1. Does a supplier org's own staff all share the single `supplier` role, or does it need an owner/staff distinction the way a garage has `owner` vs `manager`? The `roleId` enum has room to add one (e.g. `supplier-staff`) if needed — this is a `packages/contract/src/rbac.ts` change with the coordinated frontend-parity regeneration that implies (`rbac-parity.test.ts`; see the note on that in `server/src/auth/routes.ts`'s `/admin/staff` handler).
2. How does a garage's existing private `suppliers` vendor list reconcile with a linked platform supplier — are they merged, cross-referenced, or left as two separate concepts a garage chooses between?
3. Should `garageApplications` be wired up in the same pass, for one shared review-queue UI, or kept as a separate follow-up?

## References

- [Onboarding Flows](../../user-documentation/workflows/onboarding-flows.md) — the live paths this document contrasts against
- [Supplier Portal Guide](../../user-documentation/portals/supplier-portal-guide.md) — the user-facing guide, marked planned pending this work
- [Portals domain doc](../../21_DOMAIN_DOCUMENTATION/PORTALS.md) — generated actor/grant matrix
- `server/src/auth/service.ts`, `server/src/auth/otp.ts` — the invite/credential mechanism this design reuses rather than duplicates
