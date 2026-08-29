/** Procurement business rules, as pure functions.
 *
 *  Enforced server-side (the boundary) and reused by the form for the inline
 *  message (the courtesy). A rule that lives only in a component is a rule a
 *  second component will contradict.
 *
 *  Money is an integer count of halalas throughout. A purchase-order total is
 *  subtotal + VAT at the ZATCA rate — the same computation the invoice uses —
 *  so the figure the ceiling is checked against is the figure the order is
 *  raised for. A requisition's estimated total is a plain sum, VAT-exclusive:
 *  it is a budget request, not a tax document.
 */
import { computeInvoiceTotals, type LineInput, type RuleFailure } from './money'

/** `subtotal + VAT`, summed from the lines by the server. Never sent by the
 *  client — a purchase order's total is decided here. */
export function purchaseOrderTotals(lines: readonly LineInput[]): {
  subtotalHalalas: number
  taxHalalas: number
  totalHalalas: number
} {
  const totals = computeInvoiceTotals(lines)
  return {
    subtotalHalalas: totals.subtotalHalalas,
    taxHalalas: totals.taxHalalas,
    totalHalalas: totals.totalHalalas,
  }
}

/** The VAT-exclusive estimated value of a requisition's lines. */
export function requisitionEstimatedTotalHalalas(
  lines: readonly { qty: number; estUnitPriceHalalas: number }[],
): number {
  return lines.reduce((sum, line) => sum + line.qty * line.estUnitPriceHalalas, 0)
}

export type ReceiveOutcome =
  | { kind: 'ok' }
  | { kind: 'invalid'; message: string }
  | { kind: 'over'; overBy: number; message: string }

/** Receiving quantity ≤ ordered quantity (§5b). An over-receipt is never
 *  returned as `ok`: the caller must refuse it or route it to approval. */
export function checkReceive(args: {
  orderedQty: number
  receivedQty: number
  incomingQty: number
}): ReceiveOutcome {
  const { orderedQty, receivedQty, incomingQty } = args
  if (!Number.isInteger(incomingQty) || incomingQty <= 0) {
    return { kind: 'invalid', message: 'Receive a positive whole number of units.' }
  }
  const after = receivedQty + incomingQty
  if (after > orderedQty) {
    return {
      kind: 'over',
      overBy: after - orderedQty,
      message: `Receiving ${incomingQty} takes this line to ${after} of ${orderedQty} ordered — ${
        after - orderedQty
      } over. An over-receipt needs approval.`,
    }
  }
  return { kind: 'ok' }
}

/** A purchase order may only be approved while it is a draft. */
export function checkPurchaseOrderApprovable(status: string): RuleFailure | null {
  if (status === 'draft') return null
  if (status === 'approved') {
    return { code: 'rule_violated', message: 'This purchase order is already approved.' }
  }
  return {
    code: 'rule_violated',
    message: `A ${status} purchase order can no longer be approved.`,
  }
}
