/** The stock ledger, as arithmetic.
 *
 *  Pure functions only — no React, no transport — so the invariant suite
 *  (`tests/inventory-invariant.test.ts`) can hold this client-side mirror to
 *  the contract rules case by case. */

/** The movement types the API accepts (`packages/contract/src/entities/part.ts`).
 *
 *  `return` is its own type so a customer return is never booked as receiving,
 *  and `adjust_down` records a shortfall without inflating consumption or
 *  damage — both added when the server closed F-017. */
export const MOVEMENT_TYPES = [
  'in',
  'out',
  'transfer',
  'adjust',
  'adjust_down',
  'return',
  'damage',
] as const
export type MovementType = (typeof MOVEMENT_TYPES)[number]

/** The sign a movement type applies to on-hand quantity.
 *
 *  A client-side mirror of `packages/contract/src/rules/inventory.ts`. The
 *  server is the authority — it locks the row, re-checks and writes the ledger.
 *  This exists so the form can refuse an impossible quantity while the user is
 *  still typing, and `tests/inventory-invariant.test.ts` proves the two agree
 *  case by case, so the mirror cannot drift into disagreeing with the endpoint
 *  it is meant to anticipate. */
export function movementDelta(type: MovementType, qty: number): number {
  switch (type) {
    case 'in':
    case 'return':
      return qty
    case 'out':
    case 'damage':
    case 'transfer':
    case 'adjust_down':
      return -qty
    case 'adjust':
      return qty
  }
}

export interface MovementCheckArgs {
  type: MovementType
  qty: number
  onHand: number
  reserved: number
  backorderable: boolean
  /** A consumption that draws down a reservation instead of competing with
   *  it: bounded by the reservation, not by the unreserved balance. */
  fromReservation?: boolean
}

/** No negative stock unless the part is backorderable, and never a consumption
 *  or transfer larger than the unreserved balance — unless the consumption
 *  draws on a reservation, whose quantity is then the bound. Mirror of
 *  `checkMovement`. */
export function checkMovement(args: MovementCheckArgs): { message: string; field: string } | null {
  if (!Number.isInteger(args.qty) || args.qty <= 0) {
    return { message: 'A movement quantity must be a positive whole number.', field: 'qty' }
  }
  if (args.type === 'out' && args.fromReservation && args.qty > args.reserved) {
    return { message: 'Cannot consume more than is reserved.', field: 'qty' }
  }
  const next = args.onHand + movementDelta(args.type, args.qty)
  if (next < 0 && !args.backorderable) {
    return {
      message: 'This movement would take stock negative and the part is not backorderable.',
      field: 'qty',
    }
  }
  if ((args.type === 'out' && !args.fromReservation) || args.type === 'transfer') {
    const available = args.onHand - args.reserved
    if (args.qty > available && !args.backorderable) {
      return { message: 'Only unreserved stock can be consumed or transferred.', field: 'qty' }
    }
  }
  return null
}

/** `Reserved ≤ On Hand`. A client-side mirror of the contract's
 *  `checkReservation`, so the reservation dialog can refuse an over-hold on the
 *  field before the round trip. The server holds the row lock and re-checks. */
export function checkReservation(args: {
  qty: number
  onHand: number
  reserved: number
}): { message: string; field: string } | null {
  if (!Number.isInteger(args.qty) || args.qty <= 0) {
    return { message: 'A reservation quantity must be a positive whole number.', field: 'qty' }
  }
  if (args.reserved + args.qty > args.onHand) {
    return { message: 'Cannot reserve more than is on hand.', field: 'qty' }
  }
  return null
}

/** A release cannot give back more than is held. Mirror of the contract's
 *  `checkReservationRelease`. */
export function checkReservationRelease(args: {
  qty: number
  reserved: number
}): { message: string; field: string } | null {
  if (!Number.isInteger(args.qty) || args.qty <= 0) {
    return { message: 'A release quantity must be a positive whole number.', field: 'qty' }
  }
  if (args.qty > args.reserved) {
    return { message: 'Cannot release more than is reserved.', field: 'qty' }
  }
  return null
}

/** One row of `GET /inventory/:id/movements`. */
export interface MovementRow {
  id: string
  type: string
  qty: number
  /** The signed effect the server recorded. On-hand is reconstructed by summing
   *  these, which is what makes the ledger the authority rather than a log. */
  delta: number
  ref: string | null
  reason: string | null
  toBranchId: string | null
  createdAt: string
  createdBy: string | null
}

/** The §A11 terms, each read off the ledger rather than stated. */
export interface LedgerTotals {
  received: number
  transferIn: number
  consumed: number
  transferOut: number
  adjustments: number
  returned: number
  damaged: number
  /** Rows whose recorded delta disagrees with their own type and quantity.
   *  Reported, never hidden: a ledger that does not add up is the one thing
   *  this screen must not smooth over. */
  inconsistent: MovementRow[]
}

export function ledgerTotals(rows: readonly MovementRow[]): LedgerTotals {
  const totals: LedgerTotals = {
    received: 0,
    transferIn: 0,
    consumed: 0,
    transferOut: 0,
    adjustments: 0,
    returned: 0,
    damaged: 0,
    inconsistent: [],
  }
  for (const row of rows) {
    switch (row.type) {
      case 'in':
        totals.received += row.qty
        break
      case 'return':
        totals.returned += row.qty
        break
      case 'out':
        totals.consumed += row.qty
        break
      case 'damage':
        totals.damaged += row.qty
        break
      case 'adjust':
        totals.adjustments += row.delta
        break
      case 'adjust_down':
        totals.adjustments -= row.qty
        break
      case 'transfer':
        // A transfer is signed: out of this branch, or into it.
        if (row.delta < 0) totals.transferOut += row.qty
        else totals.transferIn += row.qty
        break
      default:
        break
    }
    const expected = MOVEMENT_TYPES.includes(row.type as MovementType)
      ? movementDelta(row.type as MovementType, row.qty)
      : null
    // `adjust` and `transfer` carry their direction in the delta, so only the
    // magnitude can be checked for them.
    const agrees =
      expected === null
        ? false
        : row.type === 'adjust' || row.type === 'transfer'
          ? Math.abs(row.delta) === Math.abs(row.qty)
          : row.delta === expected
    if (!agrees) totals.inconsistent.push(row)
  }
  return totals
}

/** `OnHand = Opening + Received + TransferIn + Returned − Consumed
 *  − TransferOut ± Adjustments − Damaged`, as a function rather than as a
 *  comment. §A11 tracks Returned as its own quantity, which is why `return`
 *  is a movement type and not a receipt. */
export function onHandFrom(opening: number, totals: LedgerTotals): number {
  return (
    opening +
    totals.received +
    totals.transferIn +
    totals.returned -
    totals.consumed -
    totals.transferOut +
    totals.adjustments -
    totals.damaged
  )
}

/** The opening quantity implied by the current on-hand and the whole ledger.
 *  The part row does not carry it — `openingStock` becomes the first on-hand
 *  and is never stored again — so it is derived by running the ledger back. */
export function openingFrom(onHand: number, rows: readonly MovementRow[]): number {
  return rows.reduce((balance, row) => balance - row.delta, onHand)
}

/** On-hand after each row, oldest first, ending at the part's current on-hand. */
export function runningBalances(onHand: number, rows: readonly MovementRow[]): number[] {
  const out: number[] = new Array(rows.length)
  let balance = onHand
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    out[index] = balance
    balance -= rows[index]?.delta ?? 0
  }
  return out
}
