/** Money for the finance screens — integer halalas, never floating point.
 *
 *  `SAR 1,840` is `184000`. Nothing in here adds, multiplies or compares two
 *  amounts as decimals: a subtotal assembled from seven lines at 0.1 + 0.2
 *  precision is how an invoice ends up one halala short of its own payments.
 *
 *  **The server decides every figure this file can also compute.**
 *  `packages/contract/src/rules/money.ts` is the authority — the API calls it
 *  before it writes a row, and the screens display what comes back.
 *  `computeInvoiceTotals` below is here only so a draft that has not been saved
 *  yet can show the customer a provisional total, and it is a transcription of
 *  that rule rather than an independent implementation.
 *
 *  It is transcribed rather than imported because `@salis/contract` is not one
 *  of the app's dependencies, and adding it means editing `app/package.json`,
 *  which is serialised through the orchestrator. `app/tests/finance-money.test.ts`
 *  imports the contract rule directly and asserts the two agree case for case,
 *  so the copy cannot drift silently. **If that parity test is ever deleted,
 *  delete this file with it** — an unverified second implementation of the VAT
 *  rule is worse than no second implementation.
 */

export const HALALAS_PER_SAR = 100

/** ZATCA standard rate, in basis points, so the rate itself is exact. */
export const VAT_RATE_BPS = 1500
const BPS_DIVISOR = 10_000

/** Half-up at the last halala, away from zero, applied once — never per line. */
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

/** `total = subtotal + tax − discount`, tax on the discounted net.
 *
 *  Rounding happens at the subtotal and at the tax, not on every line, so a
 *  500-line invoice does not drift by 500 halalas. Provisional only — see the
 *  module note. */
export function computeInvoiceTotals(
  lines: readonly LineInput[],
  discountHalalas = 0,
  vatRateBps: number = VAT_RATE_BPS
): InvoiceTotals {
  const subtotal = roundHalfUp(
    lines.reduce((sum, line) => sum + line.qty * line.unitPriceHalalas, 0)
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

/** Halalas → the SAR number `<Money>` and `formatSar` take.
 *
 *  A display conversion, deliberately the only division by 100 in the domain.
 *  The result is never fed back into a calculation. */
export function fromHalalas(halalas: number): number {
  return halalas / HALALAS_PER_SAR
}

/** A SAR amount as a user typed it → halalas, or `null` when it is not a
 *  number at all.
 *
 *  Parsed as decimal text rather than through `Number(x) * 100`, because the
 *  float round-trip is exactly what this representation exists to avoid:
 *  `Number('8.07') * 100` is `806.9999999999999`. `null` rather than `0` for
 *  unreadable input, so a form can say "that is not an amount" instead of
 *  silently billing nothing.
 *
 *  Accounting brackets are honoured — `(1,200)` is −1,200 — because that is how
 *  a ledger writes a negative and reading it as a credit is a 2,400 swing. */
export function toHalalas(input: string | number): number | null {
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) return null
    return roundHalfUp(input * HALALAS_PER_SAR)
  }

  const trimmed = input.replace(/SAR/gi, '').trim()
  if (trimmed === '') return null

  const bracketed = /^\((.*)\)$/.exec(trimmed)
  const body = (bracketed ? bracketed[1] : trimmed).replace(/[\s,٬،_]/g, '')

  const match = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(body)
  if (!match) return null
  const [, sign, whole = '', fraction = ''] = match
  if (whole === '' && fraction === '') return null

  const units = whole === '' ? 0 : Number(whole)
  if (!Number.isSafeInteger(units)) return null

  /* Two digits of halalas, with the third deciding the rounding — done on the
   * digits so 8.075 rounds up rather than inheriting a binary artefact. */
  const halalaDigits = Number((fraction + '00').slice(0, 2))
  const next = Number((fraction + '000').slice(2, 3))
  const magnitude = units * HALALAS_PER_SAR + halalaDigits + (next >= 5 ? 1 : 0)

  const negative = sign === '-' || Boolean(bracketed)
  return negative ? -magnitude : magnitude
}

/** What the row says the invoice is worth, in halalas.
 *
 *  The API presents `subtotalHalalas` / `taxHalalas` / `totalHalalas` /
 *  `paidHalalas` / `balanceHalalas` on every invoice, all computed server-side.
 *  The design-bundle fixtures predate those columns and carry only the display
 *  string `"SAR 1,840"`, so a build with no API still renders — but only the
 *  total is knowable there, and `derived` says so rather than inventing a split.
 */
export interface InvoiceMoney {
  subtotalHalalas: number
  taxHalalas: number
  discountHalalas: number
  totalHalalas: number
  paidHalalas: number
  balanceHalalas: number
  /** True when these figures came from the server. False for a fixture row,
   *  where only the total is known and the rest is unavailable. */
  fromServer: boolean
}

type MoneyBearing = {
  amount?: unknown
  subtotalHalalas?: unknown
  taxHalalas?: unknown
  discountHalalas?: unknown
  totalHalalas?: unknown
  paidHalalas?: unknown
  balanceHalalas?: unknown
}

function intOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : fallback
}

export function invoiceMoney(row: MoneyBearing | undefined): InvoiceMoney {
  const fromServer = typeof row?.totalHalalas === 'number'
  const total = fromServer
    ? intOr(row?.totalHalalas, 0)
    : (toHalalas(typeof row?.amount === 'string' ? row.amount : '') ?? 0)
  const paid = intOr(row?.paidHalalas, 0)
  return {
    subtotalHalalas: intOr(row?.subtotalHalalas, 0),
    taxHalalas: intOr(row?.taxHalalas, 0),
    discountHalalas: intOr(row?.discountHalalas, 0),
    totalHalalas: total,
    paidHalalas: paid,
    balanceHalalas: intOr(row?.balanceHalalas, total - paid),
    fromServer,
  }
}

/** Net unit price of a line in halalas.
 *
 *  The API sends `unitPriceHalalas`; the fixtures send `unit` in SAR. Both are
 *  read here so one screen does not have to know which backend it is on. */
export function lineUnitHalalas(line: { unitPriceHalalas?: unknown; unit?: unknown }): number {
  if (typeof line.unitPriceHalalas === 'number' && Number.isFinite(line.unitPriceHalalas)) {
    return Math.trunc(line.unitPriceHalalas)
  }
  return typeof line.unit === 'number' ? (toHalalas(line.unit) ?? 0) : 0
}

/** Amount of a payment in halalas — `amountHalalas` from the API, `amount` in
 *  SAR from the fixtures. */
export function paymentHalalas(payment: { amountHalalas?: unknown; amount?: unknown }): number {
  if (typeof payment.amountHalalas === 'number' && Number.isFinite(payment.amountHalalas)) {
    return Math.trunc(payment.amountHalalas)
  }
  return typeof payment.amount === 'number' ? (toHalalas(payment.amount) ?? 0) : 0
}
