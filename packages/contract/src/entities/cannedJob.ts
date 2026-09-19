/** Canned Jobs — predefined service packages an advisor can drop onto an
 *  estimate instead of typing every line by hand (build-order item 5, after
 *  customer sign-off at delivery).
 *
 *  An estimate today is priced line by line, with no way to reuse a standard
 *  bundle — the same "30k Mile Service" gets retyped from scratch on every
 *  visit, at whatever price the advisor remembers or guesses. A canned job is
 *  a named, priced bundle of the same `estimateLine` shape estimates already
 *  use (`./estimate`'s `estimateLine`), so applying one to an estimate is a
 *  straight copy into `PATCH /estimates/:id`'s `lines` array — the same
 *  full-replace-and-recompute machinery `server/src/routes/estimates.ts`
 *  already runs, not a second pricing engine.
 *
 *  Reuses the `estimates` RBAC module rather than declaring a new one: the
 *  catalog is maintained by whoever can create/edit estimates (owner,
 *  manager, advisor), read by whoever can read an estimate, and — like
 *  `declinedJobs` — carries nothing a customer has any business browsing, so
 *  RLS denies the `self` scope outright rather than narrowing it. */
import { z } from 'zod'
import { nonEmpty } from '../primitives'
import { appRow } from './common'
import { estimateLine } from './estimate'

export const cannedJobCreate = z.object({
  name: nonEmpty.max(160),
  nameAr: z.string().max(160).optional(),
  category: z.string().max(64).optional(),
  description: z.string().max(2000).optional(),
  lines: z.array(estimateLine).min(1).max(50),
})
export type CannedJobCreate = z.infer<typeof cannedJobCreate>

/** `active` is the only field the create body omits and update allows on its
 *  own — every canned job is born active, and retiring one is a deliberate
 *  edit, not a creation-time choice. */
export const cannedJobUpdate = cannedJobCreate.partial().extend({
  active: z.boolean().optional(),
})
export type CannedJobUpdate = z.infer<typeof cannedJobUpdate>

export const cannedJobRow = appRow({
  name: nonEmpty,
  nameAr: z.string().nullable(),
  category: z.string().nullable(),
  description: z.string().nullable(),
  active: z.boolean(),
  /** Sum of the lines' `qty × unitPriceHalalas` (`computeInvoiceTotals`'s
   *  `subtotalHalalas`) — the pre-tax list price. VAT is not this catalog's
   *  business; it is added once a copy of these lines lands on a real
   *  estimate. */
  priceHalalas: z.number().int().min(0),
  lineCount: z.number().int().min(0),
})
export type CannedJobRow = z.infer<typeof cannedJobRow>
