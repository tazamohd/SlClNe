<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/design.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - packages/contract/src/rules/*.ts
       - server/src/db/schema.ts
-->

# Money and business-rule design

**Status:** GENERATED · **Sources as of:** 2026-09-13

## Money is an integer count of halalas

Every money column is `bigint` named `*_halalas`. 30 tables carry money; 52 columns in total. There is no `numeric` money column and no floating-point money anywhere.

The reason is narrow and sufficient: a `numeric` rounding surprise must not be able to reach a ledger. An integer count of the smallest unit has no rounding behaviour to be surprised by.

## The arithmetic

| Property | Design |
| --- | --- |
| VAT rate | Basis points (`VAT_RATE_BPS = 1500`), so the rate itself is exact |
| Order | `total = subtotal + tax − discount`, with tax computed on the **discounted net** |
| Rounding | Half-up, applied once at the subtotal and once at the tax — **never per line**, so a 500-line invoice does not drift by 500 halalas |
| Discount clamping | Clamped to `[0, subtotal]`; a discount cannot exceed what is being discounted or go negative |
| Authority | Computed server-side. A client-sent total is never trusted, on any endpoint |

## Rules live in one place and are called from two

The rule functions are in `packages/contract/src/rules/`. The **server handler** calls them — that is the enforcement point. The **form** calls them too, for the inline message — that is the courtesy.

A rule that lives only in a component is a rule a second component will contradict. A rule that lives only in a handler gives the user no feedback until they submit. Both callers, one definition.

## The rule catalogue

| ID | Rule | Kind | Domain | Enforced in |
| --- | --- | --- | --- | --- |
| BR-APPROVALS-checkApprovalCeiling | A value above the role's ceiling must escalate rather than be approved. | GUARD | approvals | `approvals.ts` |
| BR-APPROVALS-checkQcIndependence | A technician cannot pass QC on a repair they performed. | GUARD | approvals | `approvals.ts` |
| BR-APPROVALS-checkSelfApproval | The approver must not be the submitter — the first and most-broken SOD pair, and the one that lets a single person move money on their own say-so. | GUARD | approvals | `approvals.ts` |
| BR-APPROVALS-SOD_PAIRS | The declared conflicting-duty pairs, exposed so a screen can explain one. | CONSTANT | approvals | `approvals.ts` |
| BR-HR-payrollLineNetHalalas | A payroll line's net pay: earnings plus allowances, less deductions. Every input is integer halalas, so the result is too — no rounding, no float. | HELPER | hr | `hr.ts` |
| BR-HR-sumPayrollLines | `sumPayrollLines` | HELPER | hr | `hr.ts` |
| BR-INVENTORY-checkMovement | No negative stock unless the part is explicitly backorderable, and never a consumption larger than what is unreserved — unless it consumes a reservation, in which case the reservation is the bound. | GUARD | inventory | `inventory.ts` |
| BR-INVENTORY-checkReceipt | Receiving quantity ≤ ordered quantity; over-receipt needs approval. | GUARD | inventory | `inventory.ts` |
| BR-INVENTORY-checkReservation | `Reserved ≤ Available`. | GUARD | inventory | `inventory.ts` |
| BR-INVENTORY-checkReservationRelease | A release cannot give back more than is held. | GUARD | inventory | `inventory.ts` |
| BR-INVENTORY-movementDelta | The sign a movement type applies to on-hand quantity. For a transfer this is the sign of the *debit* row. The route writes the paired credit row (+qty against the destination branch) in the same transaction, so the org's books conserve; this function answers "what does the requested row do", which is also the feasibility question the guard below asks. | HELPER | inventory | `inventory.ts` |
| BR-LOANS-amortisedInstalmentHalalas | The level monthly instalment that amortises `principalHalalas` over `termMonths` at `rateBps` annual, as an integer count of halalas. A zero-rate loan divides the principal evenly, rounded half-up; the schedule then absorbs any remainder in the final instalment. Otherwise the standard annuity formula `P·i / (1 − (1+i)^−n)` gives the payment, with `i` the monthly rate. The `Math.pow` is the one floating-point step, and its product with the principal is rounded to a whole halala before it is ever used — nothing fractional is returned or stored. | HELPER | loans | `loans.ts` |
| BR-LOANS-buildRepaymentPlan | The full amortised schedule for a loan. Each month: interest is computed on the running balance in integer halalas, the principal portion is the instalment minus that interest, and the balance is reduced by the principal portion. The final instalment is set to clear the balance exactly (`balance + interest`), so the amounts collect precisely `principalHalalas + Σ interest` with no drift, and no instalment ever amortises more principal than remains. | HELPER | loans | `loans.ts` |
| BR-LOANS-monthlyInterestHalalas | One month's interest on an outstanding balance, in integer halalas: `balance · rateBps / (10000 · 12)`, rounded half-up at the last halala. | HELPER | loans | `loans.ts` |
| BR-MONEY-checkJournalBalanced | Double-entry: debits must equal credits. | GUARD | money | `money.ts` |
| BR-MONEY-checkPayment | `Payment.amount ≤ invoice.balance`, and a cancelled invoice takes none. | GUARD | money | `money.ts` |
| BR-MONEY-checkRefund | `Refund ≤ amount collected`. | GUARD | money | `money.ts` |
| BR-MONEY-computeInvoiceTotals | `total = subtotal + tax − discount`, with tax computed on the discounted net. Rounding happens at the subtotal and at the tax, not on every line, so a 500-line invoice does not drift by 500 halalas. | CALCULATION | money | `money.ts` |
| BR-MONEY-ok | `ok` | HELPER | money | `money.ts` |
| BR-MONEY-roundHalfUp | Half-up rounding at the last halala, applied once — never per line. | HELPER | money | `money.ts` |
| BR-MONEY-VAT_RATE_BPS | ZATCA standard rate. Stored as basis points so the rate itself is exact. | CONSTANT | money | `money.ts` |
| BR-PROCUREMENT-checkPurchaseOrderApprovable | A purchase order may only be approved while it is a draft. | GUARD | procurement | `procurement.ts` |
| BR-PROCUREMENT-checkReceive | Receiving quantity ≤ ordered quantity (§5b). An over-receipt is never returned as `ok`: the caller must refuse it or route it to approval. | GUARD | procurement | `procurement.ts` |
| BR-PROCUREMENT-purchaseOrderTotals | `subtotal + VAT`, summed from the lines by the server. Never sent by the client — a purchase order's total is decided here. | HELPER | procurement | `procurement.ts` |
| BR-PROCUREMENT-requisitionEstimatedTotalHalalas | The VAT-exclusive estimated value of a requisition's lines. | HELPER | procurement | `procurement.ts` |
| BR-WORKSHOP-checkBayFree | `checkBayFree` | GUARD | workshop | `workshop.ts` |
| BR-WORKSHOP-checkEstimateFresh | An expired estimate cannot be approved. | GUARD | workshop | `workshop.ts` |
| BR-WORKSHOP-checkInvoiceable | A completed job card is required before invoicing. | GUARD | workshop | `workshop.ts` |
| BR-WORKSHOP-checkStageTransition | A stage gate cannot be skipped. | GUARD | workshop | `workshop.ts` |
| BR-WORKSHOP-overlaps | An appointment cannot double-book a bay. Half-open intervals, so a job ending at 10:30 and one starting at 10:30 do not collide. | HELPER | workshop | `workshop.ts` |

## Money rule detail

| Function | Statement |
| --- | --- |
| `checkJournalBalanced` | Double-entry: debits must equal credits. |
| `checkPayment` | `Payment.amount ≤ invoice.balance`, and a cancelled invoice takes none. |
| `checkRefund` | `Refund ≤ amount collected`. |
| `computeInvoiceTotals` | `total = subtotal + tax − discount`, with tax computed on the discounted net. Rounding happens at the subtotal and at the tax, not on every line, so a 500-line invoice does not drift by 500 halalas. |
| `ok` | — |
| `roundHalfUp` | Half-up rounding at the last halala, applied once — never per line. |
| `VAT_RATE_BPS` | ZATCA standard rate. Stored as basis points so the rate itself is exact. |

## Where a rule is missing

17 of 18 lifecycles have no declared transition table, so the legality of a status change on an invoice, a purchase order or a claim rests on whatever the route handler checks. For documents that move money that is a control gap, and it is listed in the gap report as one.
