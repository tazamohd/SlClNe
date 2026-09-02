# PR #48 reconciliation — create-forms work vs. the parallel CRUD effort

**Date:** 2026-08-29
**Status:** PR #48 closed as superseded. This document records every piece of
it and what happened to it, so nothing is silently lost.

## What happened

PR #48 (`claude/wire-create-forms`) wired six create/booking forms to a write
seam it introduced (`useCollectionWrite` + a `FormModal` primitive). While it
was in review, `main` advanced ~15 PRs from a parallel effort that had already
built a more complete CRUD/modal system:

- `app/src/components/ui/Modal.tsx` + `useModal`
- ~17 `*FormModal` components (CRM Lead/Opportunity/CrmTask/Segment/Campaign,
  accounting Account/JournalEntry/Expense/Department, registry
  Customer/Vehicle/Technician/Fleet, finance Receipt/Payment)
- a full mutation layer in `app/src/data/useCollection.ts`
  (`useCreate`/`useUpdate`/`useDelete`, optimistic updates + invalidation)
- in-memory CRUD in the repository, plus 3,300+ unit/component/e2e tests

Merging #48 would have created two competing modal + write systems. Per the
owner's decision, #48 was **closed**, the still-unwired flow was **redone
against `main`'s own patterns**, and the rest is documented here.

## Disposition of each part of #48

| #48 introduced | Disposition |
|---|---|
| `components/ui/FormModal.tsx` | **Dropped.** Superseded by `components/ui/Modal.tsx` + `useModal`. |
| `data/useCollectionWrite.ts` | **Dropped.** Superseded by `useCreate`/`useUpdate`/`useDelete` in `data/useCollection.ts` (optimistic, invalidating). |
| Accounting "New Expense" wiring | **Dropped.** Superseded by `screens/accounting/ExpenseFormModal.tsx`. |
| Accounting shared `Field`/`runCreate` helpers | **Dropped.** Not needed; the `*FormModal` components own their forms. |
| Registries "Add Customer" / "Add Vehicle" wiring | **Dropped.** Superseded by `screens/registry/CustomerForm.tsx` / `VehicleForm.tsx`. |
| `CustomerPortalBooking` → appointment create | **Dropped.** `main` already wires it (`useCreate('appointments')` in `CustomerPortalBooking.tsx`). |
| `WorkshopCheckIn` → job create | **Dropped (and #48 was semantically wrong).** `main` wires check-in as a job **stage transition** (`stage.advance('inspection', …)`), which is correct — check-in advances an existing job card, it does not create one. |
| `KioskCheckIn` → appointment create | **Redone.** This was the one flow `main` left unwired (`handleConfirm` only advanced the step). Rewired on branch `claude/wire-portal-flows` using `main`'s `useCreate('appointments')`. |
| 15 AR override strings | Covered by `main`'s dictionary already, except the kiosk strings which are present in `ar-overrides.ts`. |

## Live-contract facts #48 discovered (kept for the FormModal maintainers)

These were found by POSTing bodies against the running server — typecheck could
not catch them. They apply to whoever maintains the `*FormModal` components:

1. **customers** has no `email` column — the server's strict schema 422s on it.
2. **appointments** create requires **every** column, and uses a create-schema
   distinct from the display row: `scheduledDate, timeLabel, startMinute,
   durationMins, customerName, vehicleLabel, plate, serviceLabel, bay, status`
   (not `time/cust/veh/svc/mins`). `CustomerPortalBooking` is the reference.
3. **expenses** is a natural-id resource — create requires an `id`.
4. **accounting** create is RBAC-gated: `owner` lacks `c` on `accounting`;
   `accountant` (finance@salisauto.sa) holds it.

## KioskCheckIn — what was redone

`app/src/screens/portals/KioskCheckIn.tsx`: `handleConfirm` now registers the
walk-in via `useCreate('appointments')` using the same create-schema keys as
`CustomerPortalBooking`, then advances to the confirmation step; a
`RepositoryError` surfaces inline (orange) and stays on the step. The button
keeps `main`'s live-only gate (`!isLive`) so the kiosk behaves consistently
with its other steps, and shows a "Checking in..." pending state.
