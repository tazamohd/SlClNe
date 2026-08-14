/** Parts and stock.
 *
 *  Stock changes only through a movement, never by writing `stock` directly —
 *  that is what makes `OnHand = Opening + Received + TransferIn − Consumed
 *  − TransferOut ± Adjustments − Damaged` an invariant instead of a hope. */
import { z } from 'zod'
import { halalas, nonEmpty } from '../primitives'
import { appRow } from './common'

export const partCreate = z.object({
  name: nonEmpty.max(160),
  sku: nonEmpty.max(64),
  /** Sell price in halalas. */
  priceHalalas: halalas,
  /** Cost price in halalas — redacted from roles that may not see margin. */
  costHalalas: halalas.optional(),
  reorderLevel: z.number().int().min(0).default(0),
  backorderable: z.boolean().default(false),
  /** Opening quantity. Later changes go through `/inventory/:id/movement`. */
  openingStock: z.number().int().min(0).default(0),
})

export const partUpdate = partCreate.omit({ openingStock: true }).partial()

export type PartCreate = z.infer<typeof partCreate>
export type PartUpdate = z.infer<typeof partUpdate>

/** `return` is its own type so a customer return is never booked as receiving
 *  — §A11 tracks `Returned` as its own quantity, and folding it into `in`
 *  would corrupt the receiving total and make "no double receiving" unprovable
 *  from the ledger. `adjust_down` rather than a signed `adjust` quantity,
 *  because "qty is always positive; the type decides the sign" is the rule
 *  that stops a caller turning a receipt into a consumption, and a signed
 *  adjust would be the one exception every attacker looks for (F-017). */
export const movementType = z.enum([
  'in',
  'out',
  'transfer',
  'adjust',
  'adjust_down',
  'return',
  'damage',
])
export type MovementType = z.infer<typeof movementType>

export const movementCreate = z
  .object({
    type: movementType,
    /** Always positive; `type` decides the sign. A negative quantity would let
     *  a caller turn a receipt into a consumption. */
    qty: z.number().int().min(1).max(1_000_000),
    ref: z.string().max(64).optional(),
    reason: z.string().max(500).optional(),
    toBranchId: z.string().length(26).optional(),
    /** A consumption that draws down a reservation instead of competing with
     *  it: `reserved` falls with `onHand`, and the quantity is bounded by the
     *  reservation rather than by the unreserved balance. */
    fromReservation: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'transfer' && !value.toBranchId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['toBranchId'],
        message: 'A transfer needs a destination branch.',
      })
    }
    if (value.fromReservation && value.type !== 'out') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fromReservation'],
        message: 'Only a consumption can draw on a reservation.',
      })
    }
  })

export type MovementCreate = z.infer<typeof movementCreate>

/** `POST /inventory/:id/reservation` and its DELETE — the writes that make
 *  `parts.reserved` real instead of a column nothing sets (F-017). */
export const reservationBody = z.object({
  qty: z.number().int().min(1).max(1_000_000),
  ref: z.string().max(64).optional(),
  reason: z.string().max(500).optional(),
})

export type ReservationBody = z.infer<typeof reservationBody>

export const partRow = appRow({
  name: z.string(),
  sku: z.string(),
  stock: z.number().int(),
  reorder: z.number().int(),
  /** `"SAR 45"`. */
  price: z.string(),
  priceHalalas: z.number().int().min(0),
  /** Null when the role may not see cost or margin (`FIELD_RULES`). */
  costHalalas: z.number().int().min(0).nullable(),
  reserved: z.number().int().min(0),
  available: z.number().int(),
})

export type PartRow = z.infer<typeof partRow>
