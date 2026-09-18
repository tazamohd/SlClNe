/** Equipment warranties (BLK-004) — cover on the shop's own tools and fixed
 *  assets (a lift, a scanner, a paint booth), never a customer's vehicle.
 *
 *  A flat, tenant-owned directory, writable through the generic collection
 *  router — the same shape `supplierCreate`/`supplierRow` gives `suppliers`:
 *  the server assigns `WRN-0001` when a number is not supplied, and there is
 *  no line-item or money computation behind it that would need a bespoke
 *  router. The one lifecycle move a warranty makes — `active` to `claimed` —
 *  is an ordinary field write; `claimedAt` is never accepted as input, only
 *  derived server-side from the transition (`server/src/writers.ts`), so a
 *  claim date always reflects when the status actually changed.
 */
import { z } from 'zod'
import { isoDate, nonEmpty } from '../primitives'
import { appRow } from './common'

export const warrantyCoverage = z.enum(['full', 'limited', 'extended'])
export type WarrantyCoverage = z.infer<typeof warrantyCoverage>

export const warrantyStatus = z.enum(['active', 'claimed', 'expired'])
export type WarrantyStatus = z.infer<typeof warrantyStatus>

/** `status`/`claimNotes` are accepted on create as well as update — a
 *  backdated entry for equipment already out of warranty is a legitimate
 *  row, not a two-step create-then-claim — so the same schema covers both
 *  and a screen's form does not need two shapes for one record. */
export const warrantyCreate = z.object({
  warrantyNumber: z.string().max(32).optional(),
  itemName: nonEmpty.max(200),
  provider: nonEmpty.max(200),
  coverage: warrantyCoverage.optional(),
  startDate: isoDate,
  endDate: isoDate,
  status: warrantyStatus.optional(),
  claimNotes: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
})
export type WarrantyCreate = z.infer<typeof warrantyCreate>

export const warrantyUpdate = warrantyCreate.partial().omit({ warrantyNumber: true })
export type WarrantyUpdate = z.infer<typeof warrantyUpdate>

export const warrantyRow = appRow({
  /** `WRN-0001` — the human warranty number the design shows. */
  id: z.string(),
  warrantyNumber: z.string(),
  itemName: z.string(),
  provider: z.string(),
  coverage: warrantyCoverage,
  start: z.string(),
  end: z.string(),
  status: warrantyStatus,
  /** Null until the warranty is claimed. */
  claimedAt: z.string().nullable(),
  claimNotes: z.string().nullable(),
  notes: z.string().nullable(),
})
export type WarrantyRow = z.infer<typeof warrantyRow>
