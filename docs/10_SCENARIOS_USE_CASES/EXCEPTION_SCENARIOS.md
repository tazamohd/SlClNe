<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/scenarios.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - packages/contract/src/rules/*.ts
-->

# Exception scenarios

**Status:** GENERATED · **Sources as of:** 2026-09-17

Every refusal the system can produce from a business rule, derived from the guard functions rather than imagined. Each is a scenario somebody has to design a screen for: a user who hits it needs to know what happened and what to do next.

16 guards, each returning a named failure with a message intended for the user.

| Scenario | Trigger | What the user is told | Enforced in |
| --- | --- | --- | --- |
| SCN-APPROVALS-checkApprovalCeiling | A value above the role's ceiling must escalate rather than be approved. | "This role may not approve." / "${formatSar(amountHalalas)} is above this role" | `packages/contract/src/rules/approvals.ts` |
| SCN-APPROVALS-checkQcIndependence | A technician cannot pass QC on a repair they performed. | "The technician who performed the repair cannot pass its quality check." | `packages/contract/src/rules/approvals.ts` |
| SCN-APPROVALS-checkSelfApproval | The approver must not be the submitter — the first and most-broken SOD pair, and the one that lets a single person move money on their own say-so. | "The person who raised this cannot also approve it." | `packages/contract/src/rules/approvals.ts` |
| SCN-INVENTORY-checkMovement | No negative stock unless the part is explicitly backorderable, and never a consumption larger than what is unreserved — unless it consumes a reservation, in which case the reservation is the bound. | "A movement quantity must be positive." / "Cannot consume more than is reserved." / "This movement would take stock negative and the part is not backorderable." / "Only unreserved stock can be consumed or transferred." | `packages/contract/src/rules/inventory.ts` |
| SCN-INVENTORY-checkReceipt | Receiving quantity ≤ ordered quantity; over-receipt needs approval. | "Receiving more than was ordered needs an approval." | `packages/contract/src/rules/inventory.ts` |
| SCN-INVENTORY-checkReservation | `Reserved ≤ Available`. | "Cannot reserve more than is on hand." | `packages/contract/src/rules/inventory.ts` |
| SCN-INVENTORY-checkReservationRelease | A release cannot give back more than is held. | "Cannot release more than is reserved." | `packages/contract/src/rules/inventory.ts` |
| SCN-MONEY-checkJournalBalanced | Double-entry: debits must equal credits. | "A journal entry needs at least two lines." / "Journal entry debits must equal credits." | `packages/contract/src/rules/money.ts` |
| SCN-MONEY-checkPayment | `Payment.amount ≤ invoice.balance`, and a cancelled invoice takes none. | "A cancelled invoice cannot take a payment." / "An invoice must be issued before it can take a payment." / "A payment must be greater than zero." / "A payment cannot exceed the outstanding balance." | `packages/contract/src/rules/money.ts` |
| SCN-MONEY-checkRefund | `Refund ≤ amount collected`. | "A refund cannot exceed the amount collected." | `packages/contract/src/rules/money.ts` |
| SCN-PROCUREMENT-checkPurchaseOrderApprovable | A purchase order may only be approved while it is a draft. | "This purchase order is already approved." / "A ${status} purchase order can no longer be approved." | `packages/contract/src/rules/procurement.ts` |
| SCN-PROCUREMENT-checkReceive | Receiving quantity ≤ ordered quantity (§5b). An over-receipt is never returned as `ok`: the caller must refuse it or route it to approval. | "Receive a positive whole number of units." / "Receiving ${incomingQty} takes this line to ${after} of ${orderedQty} ordered — ${" | `packages/contract/src/rules/procurement.ts` |
| SCN-WORKSHOP-checkBayFree | `checkBayFree` | "${candidate.bay} is already booked for that time." | `packages/contract/src/rules/workshop.ts` |
| SCN-WORKSHOP-checkEstimateFresh | An expired estimate cannot be approved. | "This estimate has expired and cannot be approved." | `packages/contract/src/rules/workshop.ts` |
| SCN-WORKSHOP-checkInvoiceable | A completed job card is required before invoicing. | "A job must reach delivery before it can be invoiced." | `packages/contract/src/rules/workshop.ts` |
| SCN-WORKSHOP-checkStageTransition | A stage gate cannot be skipped. | "The job is already at ${to}." / "A job at ${from} cannot move to ${to}." | `packages/contract/src/rules/workshop.ts` |

## Authorization refusals

Distinct from rule refusals, and the distinction matters to the user. A rule refusal says *this cannot be done*. An authorization refusal says *you cannot do this* — and one of those has a third form that a screen must not collapse into the other two.

| Scenario | Condition | Response | What the screen must say |
| --- | --- | --- | --- |
| SCN-AUTHZ-DENIED | The role holds no grant for the module and action | 403 | "The <role> role may not <action> <module>." Offering a retry is wrong; the answer will not change. |
| SCN-AUTHZ-ESCALATE | The role holds the approve grant but the amount is above its ceiling | approval-required | The amount, the ceiling, and that it **must be escalated**. Showing "forbidden" here sends the user to ask an administrator for a permission that would not help. |
| SCN-AUTHZ-SOD | The actor is the submitter, or the technician who did the work | 403 | Which duty conflicts, and who can do it instead. |
| SCN-AUTHZ-SCOPE | The row exists but falls outside the principal’s data scope | 404, not 403 | Not found. A 403 would confirm the row exists, which leaks across the tenant or branch boundary. |
| SCN-CONFLICT-VERSION | The submitted `version` is stale | 409 | That someone else changed this, and offer to reload — not a generic failure. |
| SCN-IDEMPOTENT-REPLAY | Same `Idempotency-Key`, same body | the stored response | Nothing. The replay is invisible by design, and no second effect occurs. |
| SCN-IDEMPOTENT-CONFLICT | Same `Idempotency-Key`, **different** body | refused | That the key was reused with different content — a bug on the caller’s side. |
