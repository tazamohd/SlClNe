/** Stock invariants (`MASTER_BUSINESS_RULES.md` §Inventory). */
import type { MovementType } from '../entities/part'
import type { RuleFailure } from './money'

/** The sign a movement type applies to on-hand quantity. */
export function movementDelta(type: MovementType, qty: number): number {
  switch (type) {
    case 'in':
      return qty
    case 'out':
    case 'damage':
    case 'transfer':
      return -qty
    case 'adjust':
      return qty
  }
}

/** No negative stock unless the part is explicitly backorderable, and never a
 *  consumption larger than what is unreserved. */
export function checkMovement(args: {
  type: MovementType
  qty: number
  onHand: number
  reserved: number
  backorderable: boolean
}): RuleFailure | null {
  if (args.qty <= 0) {
    return { code: 'rule_violated', message: 'A movement quantity must be positive.', field: 'qty' }
  }
  const next = args.onHand + movementDelta(args.type, args.qty)
  if (next < 0 && !args.backorderable) {
    return {
      code: 'rule_violated',
      message: 'This movement would take stock negative and the part is not backorderable.',
      field: 'qty',
    }
  }
  if (args.type === 'out' || args.type === 'transfer') {
    const available = args.onHand - args.reserved
    if (args.qty > available && !args.backorderable) {
      return {
        code: 'rule_violated',
        message: 'Only unreserved stock can be consumed or transferred.',
        field: 'qty',
      }
    }
  }
  return null
}

/** `Reserved ≤ Available`. */
export function checkReservation(args: {
  qty: number
  onHand: number
  reserved: number
}): RuleFailure | null {
  if (args.reserved + args.qty > args.onHand) {
    return {
      code: 'rule_violated',
      message: 'Cannot reserve more than is on hand.',
      field: 'qty',
    }
  }
  return null
}

/** Receiving quantity ≤ ordered quantity; over-receipt needs approval. */
export function checkReceipt(args: {
  receivingQty: number
  orderedQty: number
  alreadyReceivedQty: number
  approved: boolean
}): RuleFailure | null {
  const total = args.alreadyReceivedQty + args.receivingQty
  if (total > args.orderedQty && !args.approved) {
    return {
      code: 'rule_violated',
      message: 'Receiving more than was ordered needs an approval.',
      field: 'receivingQty',
    }
  }
  return null
}
