/** Estimates. An approved estimate becomes invoice lines; a total above the
 *  approver's ceiling escalates instead of approving (`RBAC.md` §ceilings). */
import { z } from 'zod'
import { halalas, isoDateTime, nonEmpty, ulid } from '../primitives'
import { appRow } from './common'

export const estimateStatus = z.enum(['draft', 'sent', 'approved', 'rejected', 'expired'])
export type EstimateStatus = z.infer<typeof estimateStatus>

export const estimateLine = z.object({
  description: nonEmpty.max(300),
  descriptionAr: z.string().max(300).optional(),
  kind: z.enum(['part', 'labour']),
  qty: z.number().min(0.01).max(100_000),
  unitPriceHalalas: halalas,
  partSku: z.string().max(64).optional(),
})

export type EstimateLine = z.infer<typeof estimateLine>

/** No total is accepted from the client — it is summed from the lines by the
 *  server, which is the only place a money value is decided. */
export const estimateCreate = z.object({
  jobCardId: ulid.optional(),
  customerId: ulid.optional(),
  customerName: nonEmpty.max(160),
  vehicleId: ulid.optional(),
  vehicleLabel: nonEmpty.max(120),
  lines: z.array(estimateLine).min(1).max(200),
  validUntil: isoDateTime.optional(),
  notes: z.string().max(2000).optional(),
})

export const estimateUpdate = estimateCreate.partial().extend({
  status: estimateStatus.optional(),
})

export const estimateApproveBody = z.object({
  reason: z.string().max(500).optional(),
  /** Line ids the customer accepted; omitted means all of them. */
  acceptedLineIds: z.array(ulid).optional(),
})

export type EstimateCreate = z.infer<typeof estimateCreate>
export type EstimateUpdate = z.infer<typeof estimateUpdate>

export const estimateRow = appRow({
  id: z.string(),
  cust: z.string(),
  veh: z.string(),
  /** `"SAR 1,250"` — formatted from `totalHalalas` at the boundary. */
  amount: z.string(),
  status: estimateStatus,
  /** The VAT breakdown (F-029). `subtotal + tax - discount = total`, all summed
   *  from the lines by the server so a screen shows a split it never computed. */
  subtotalHalalas: z.number().int().min(0),
  taxHalalas: z.number().int().min(0),
  discountHalalas: z.number().int().min(0),
  totalHalalas: z.number().int().min(0),
  jobCardId: ulid.nullable(),
  /** Who raised the estimate, and who approved it once one has — the pair the
   *  segregation-of-duties row check reads (F-004 client half). */
  submittedBy: ulid.nullable(),
  approvedBy: ulid.nullable(),
})

export type EstimateRow = z.infer<typeof estimateRow>
