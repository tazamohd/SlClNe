import { z } from 'zod'
import type { MovementType } from './ledger'

export interface MovementKind {
  id: string
  type: MovementType
  /** Button and dialog title. */
  label: string
  title: string
  description: string
  icon: string
  /** What the reference field is called for this kind of movement. */
  refLabel: string
  refHint: string
  quantityLabel: string
  reasonRequired?: boolean
  destructive?: boolean
  needsBranch?: boolean
  /** Shown under the quantity field when the endpoint constrains this kind. */
  note?: string
  /** A consequence of recording this movement that the operator has to know
   *  before deciding, not after. Shown in the dialog, not buried in a hint. */
  warning?: string
  /** Whether this kind can draw its quantity down from a held reservation. Only
   *  a consumption may (contract `movementCreate`), and the modal offers the
   *  choice only when there is a reservation to draw on. */
  allowFromReservation?: boolean
}

/** The movement kinds the API can record.
 *
 *  Seven of them, one per `movementType` (`packages/contract/src/entities/part.ts`).
 *  `return` is its own kind so a customer or job return is booked as Returned,
 *  never folded into Received; `adjust_down` is the signed counterpart to
 *  `adjust`, its quantity kept positive with the type carrying the sign (the
 *  server refuses a negative quantity). Both were added when the server closed
 *  F-017; a reservation is not here because it is a hold, not a ledger entry —
 *  it has its own endpoint and its own control on the ledger dialog. */
export const MOVEMENT_KINDS: readonly MovementKind[] = [
  {
    id: 'receive',
    type: 'in',
    label: 'Receive Stock',
    title: 'Receive Stock',
    description: 'Book received stock against this part. On hand rises by the quantity received.',
    icon: 'ArrowDown',
    refLabel: 'Purchase Order / Delivery Note',
    refHint: 'The document this delivery arrived against, so the receipt can be traced.',
    quantityLabel: 'Quantity Received',
  },
  {
    id: 'consume',
    type: 'out',
    label: 'Consume',
    title: 'Consume Stock',
    description: 'Issue stock to a job card. Only unreserved stock can be consumed, unless the consumption draws on a reservation.',
    icon: 'ArrowUp',
    refLabel: 'Job Card',
    refHint: 'The job this stock was issued to.',
    quantityLabel: 'Quantity Consumed',
    allowFromReservation: true,
  },
  {
    id: 'transfer',
    type: 'transfer',
    label: 'Transfer',
    title: 'Transfer Stock',
    description: 'Move stock to another branch. It leaves this branch immediately.',
    icon: 'ArrowLeftRight',
    refLabel: 'Transfer Note',
    refHint: 'The transfer document, so both branches can reconcile against it.',
    quantityLabel: 'Quantity Transferred',
    needsBranch: true,
    reasonRequired: true,
    warning:
      'The API books the outgoing half only: the destination branch is not credited, so until the paired movement exists a transfer lowers the total stock held across branches. Record the receiving side at the destination.',
  },
  {
    id: 'return',
    type: 'return',
    label: 'Return to Stock',
    title: 'Return to Stock',
    description: 'Book a part returned from a job or a customer back onto the shelf. Recorded as Returned, never as receiving, so the receiving total stays honest.',
    icon: 'RotateCcw',
    refLabel: 'Return Authorisation / Credit Note',
    refHint: 'The return this stock came back against, so the credit can be traced.',
    quantityLabel: 'Quantity Returned',
    reasonRequired: true,
  },
  {
    id: 'adjust',
    type: 'adjust',
    label: 'Adjust Up',
    title: 'Adjust Count Up',
    description: 'Correct the recorded quantity upward after a physical count found more than the books show.',
    icon: 'SlidersHorizontal',
    refLabel: 'Count Sheet',
    refHint: 'The stock count this correction came from.',
    quantityLabel: 'Quantity To Add',
    reasonRequired: true,
  },
  {
    id: 'adjust_down',
    type: 'adjust_down',
    label: 'Adjust Down',
    title: 'Adjust Count Down',
    description: 'Correct the recorded quantity downward after a physical count found fewer than the books show.',
    icon: 'Minus',
    refLabel: 'Count Sheet',
    refHint: 'The stock count this correction came from.',
    quantityLabel: 'Quantity To Remove',
    reasonRequired: true,
    note: 'Quantity stays positive — the correction subtracts it. A count cannot take stock below zero.',
  },
  {
    id: 'damage',
    type: 'damage',
    label: 'Record Damage',
    title: 'Record Damaged Stock',
    description: 'Write off stock that can no longer be sold or fitted.',
    icon: 'AlertTriangle',
    refLabel: 'Incident Reference',
    refHint: 'The report this write-off was raised under.',
    quantityLabel: 'Quantity Damaged',
    reasonRequired: true,
    destructive: true,
  },
]

/** Positive whole numbers only. A float in a stock count is not a rounding
 *  problem, it is a quantity nobody can pick off a shelf. */
export const quantitySchema = z
  .string()
  .trim()
  .min(1, 'Enter a quantity.')
  .regex(/^\d+$/, 'Quantity must be a whole number of units.')
  .refine((value) => Number(value) >= 1, 'Quantity must be at least one unit.')
  .refine((value) => Number(value) <= 1_000_000, 'That is larger than a single movement can be.')

export function movementSchema(kind: MovementKind) {
  return z.object({
    qty: quantitySchema,
    ref: z.string().trim().max(64, 'A reference can be at most 64 characters.'),
    reason: kind.reasonRequired
      ? z.string().trim().min(1, 'Say why this movement was made.').max(500)
      : z.string().trim().max(500, 'A reason can be at most 500 characters.'),
    // The contract takes a branch ULID, and nothing in the client can list
    // branches to choose from — so it is entered, and checked here exactly as
    // `packages/contract/src/primitives.ts` checks it. A friendly branch name
    // would be refused by the server, which is a worse experience than being
    // told the shape up front.
    toBranchId: kind.needsBranch
      ? z
          .string()
          .trim()
          .min(1, 'Enter the destination branch id.')
          .length(26, 'A branch id is 26 characters.')
          .regex(/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/, 'That is not a branch id.')
      : z.string().trim(),
  })
}
