/** Money rules from `MASTER_BUSINESS_RULES.md` §Money, as pure functions.
 *
 *  Called from the server handler — that is the enforcement point — and from
 *  the form for the inline message, which is the courtesy. A rule that lives
 *  only in a component is a rule a second component will contradict. */

/** ZATCA standard rate. Stored as basis points so the rate itself is exact. */
export const VAT_RATE_BPS = 1500
const BPS_DIVISOR = 10_000

/** Half-up rounding at the last halala, applied once — never per line. */
export function roundHalfUp(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value))
}

export interface LineInput {
  qty: number
  unitPriceHalalas: number
}

export interface InvoiceTotals {
  subtotalHalalas: number
  taxHalalas: number
  discountHalalas: number
  totalHalalas: number
}

/** `total = subtotal + tax − discount`, with tax computed on the discounted
 *  net. Rounding happens at the subtotal and at the tax, not on every line, so
 *  a 500-line invoice does not drift by 500 halalas. */
export function computeInvoiceTotals(
  lines: readonly LineInput[],
  discountHalalas = 0,
  vatRateBps: number = VAT_RATE_BPS,
): InvoiceTotals {
  const subtotal = roundHalfUp(
    lines.reduce((sum, line) => sum + line.qty * line.unitPriceHalalas, 0),
  )
  const discount = Math.min(Math.max(discountHalalas, 0), subtotal)
  const net = subtotal - discount
  const tax = roundHalfUp((net * vatRateBps) / BPS_DIVISOR)
  return {
    subtotalHalalas: subtotal,
    taxHalalas: tax,
    discountHalalas: discount,
    totalHalalas: net + tax,
  }
}

export type RuleFailure = { code: 'rule_violated'; message: string; field?: string }

export function ok(): null {
  return null
}

/** `Payment.amount ≤ invoice.balance`, and a cancelled invoice takes none. */
export function checkPayment(args: {
  amountHalalas: number
  balanceHalalas: number
  invoiceStatus: string
}): RuleFailure | null {
  if (args.invoiceStatus === 'cancelled') {
    return { code: 'rule_violated', message: 'A cancelled invoice cannot take a payment.' }
  }
  if (args.invoiceStatus === 'draft') {
    return {
      code: 'rule_violated',
      message: 'An invoice must be issued before it can take a payment.',
    }
  }
  if (args.amountHalalas <= 0) {
    return {
      code: 'rule_violated',
      message: 'A payment must be greater than zero.',
      field: 'amountHalalas',
    }
  }
  if (args.amountHalalas > args.balanceHalalas) {
    return {
      code: 'rule_violated',
      message: 'A payment cannot exceed the outstanding balance.',
      field: 'amountHalalas',
    }
  }
  return null
}

/** `Refund ≤ amount collected`. */
export function checkRefund(args: {
  refundHalalas: number
  collectedHalalas: number
}): RuleFailure | null {
  if (args.refundHalalas > args.collectedHalalas) {
    return {
      code: 'rule_violated',
      message: 'A refund cannot exceed the amount collected.',
      field: 'refundHalalas',
    }
  }
  return null
}

/** Double-entry: debits must equal credits. */
export function checkJournalBalanced(
  lines: readonly { debitHalalas: number; creditHalalas: number }[],
): RuleFailure | null {
  if (lines.length < 2) {
    return { code: 'rule_violated', message: 'A journal entry needs at least two lines.' }
  }
  const debits = lines.reduce((sum, l) => sum + l.debitHalalas, 0)
  const credits = lines.reduce((sum, l) => sum + l.creditHalalas, 0)
  if (debits !== credits) {
    return { code: 'rule_violated', message: 'Journal entry debits must equal credits.' }
  }
  return null
}
