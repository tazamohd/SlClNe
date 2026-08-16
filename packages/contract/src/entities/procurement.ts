/** Procurement: suppliers, requisitions and purchase orders.
 *
 *  The golden path is requisition → purchase order → receiving. A requisition
 *  is a request to buy; once approved it can be raised into a purchase order,
 *  whose total the server sums from its lines (subtotal + VAT, integer halalas)
 *  and whose approval is gated on the raiser's ceiling with segregation of
 *  duties — the person who raised it may not approve it (`SOD`: "Raise purchase
 *  order" / "Approve purchase order"). Receiving books quantities against the
 *  order's lines under the invariant `received ≤ ordered`; an over-receipt is
 *  never accepted silently (§5b).
 *
 *  No money total is ever accepted from the client. The line arrays carry
 *  quantity and unit price; the server decides every currency value.
 */
import { z } from 'zod'
import { halalas, isoDate, nonEmpty, ulid } from '../primitives'
import { appRow } from './common'

/* ------------------------------------------------------------- enumerations */

export const supplierStatus = z.enum(['active', 'inactive'])
export type SupplierStatus = z.infer<typeof supplierStatus>

export const requisitionStatus = z.enum([
  'draft',
  'submitted',
  'approved',
  'rejected',
  'ordered',
])
export type RequisitionStatus = z.infer<typeof requisitionStatus>

export const requisitionPriority = z.enum(['low', 'normal', 'high', 'urgent'])
export type RequisitionPriority = z.infer<typeof requisitionPriority>

export const purchaseOrderStatus = z.enum([
  'draft',
  'approved',
  'sent',
  'receiving',
  'received',
  'closed',
])
export type PurchaseOrderStatus = z.infer<typeof purchaseOrderStatus>

/* ---------------------------------------------------------------- suppliers */

/** Suppliers are a simple tenant-owned directory, writable through the generic
 *  collection router — gated on `procurement`, audited, RLS-scoped. The server
 *  assigns `SUP-0001` when a code is not supplied. */
export const supplierCreate = z.object({
  code: z.string().max(32).optional(),
  name: nonEmpty.max(200),
  nameAr: z.string().max(200).optional(),
  contactName: z.string().max(200).optional(),
  contactPhone: z.string().max(32).optional(),
  contactEmail: z.string().max(254).optional(),
  status: supplierStatus.optional(),
  notes: z.string().max(2000).optional(),
})
export type SupplierCreate = z.infer<typeof supplierCreate>

export const supplierUpdate = supplierCreate.partial().omit({ code: true })
export type SupplierUpdate = z.infer<typeof supplierUpdate>

export const supplierRow = appRow({
  /** `SUP-0001` — the human code the design shows. */
  id: z.string(),
  code: z.string(),
  name: z.string(),
  nameAr: z.string().nullable(),
  contact: z.string().nullable(),
  contactPhone: z.string().nullable(),
  contactEmail: z.string().nullable(),
  status: supplierStatus,
})
export type SupplierRow = z.infer<typeof supplierRow>

/* ------------------------------------------------------------ requisitions */

export const requisitionLine = z.object({
  partSku: z.string().max(64).optional(),
  description: nonEmpty.max(300),
  descriptionAr: z.string().max(300).optional(),
  qty: z.number().int().min(1).max(1_000_000),
  /** Estimated unit price at request time; the real price is set on the PO. */
  estUnitPriceHalalas: halalas,
})
export type RequisitionLine = z.infer<typeof requisitionLine>

/** No estimated total is accepted — it is summed from the lines by the server. */
export const requisitionCreate = z.object({
  requesterName: nonEmpty.max(200),
  department: z.string().max(160).optional(),
  priority: requisitionPriority.optional(),
  neededBy: isoDate.optional(),
  notes: z.string().max(2000).optional(),
  lines: z.array(requisitionLine).min(1).max(200),
})
export type RequisitionCreate = z.infer<typeof requisitionCreate>

/** An edit may not move status — that is the submit / decide lifecycle's job. */
export const requisitionUpdate = requisitionCreate.partial()
export type RequisitionUpdate = z.infer<typeof requisitionUpdate>

export const requisitionApproveBody = z.object({
  reason: z.string().max(500).optional(),
})
export type RequisitionApproveBody = z.infer<typeof requisitionApproveBody>

export const requisitionRow = appRow({
  /** `REQ-0001` — the human code the design shows. */
  id: z.string(),
  code: z.string(),
  requester: z.string(),
  department: z.string().nullable(),
  priority: requisitionPriority,
  status: requisitionStatus,
  neededBy: z.string().nullable(),
  /** `"SAR 1,250"` — formatted from `estimatedTotalHalalas` at the boundary. */
  amount: z.string(),
  estimatedTotalHalalas: z.number().int().min(0),
  notes: z.string().nullable(),
  /** Who raised the requisition and who decided it — the pair the SOD row check
   *  reads. `approvedBy` is null until a decision has been recorded. */
  submittedBy: ulid.nullable(),
  approvedBy: ulid.nullable(),
})
export type RequisitionRow = z.infer<typeof requisitionRow>

/* --------------------------------------------------------- purchase orders */

export const purchaseOrderLine = z.object({
  partSku: z.string().max(64).optional(),
  description: nonEmpty.max(300),
  descriptionAr: z.string().max(300).optional(),
  qty: z.number().int().min(1).max(1_000_000),
  unitPriceHalalas: halalas,
})
export type PurchaseOrderLine = z.infer<typeof purchaseOrderLine>

/** Raised standalone or from an approved requisition. No total is accepted; the
 *  server sums subtotal + VAT from the lines. `supplierId` points at a supplier
 *  row when one is chosen; `supplierName` is always carried for display. */
export const purchaseOrderCreate = z
  .object({
    supplierId: ulid.optional(),
    supplierName: z.string().max(200).optional(),
    requisitionId: ulid.optional(),
    expectedDate: isoDate.optional(),
    /** `placed` raises the order straight to `sent`; `draft` keeps it editable
     *  until approval. Approval is a separate, ceiling-gated action either way. */
    place: z.boolean().optional(),
    notes: z.string().max(2000).optional(),
    lines: z.array(purchaseOrderLine).min(1).max(200),
  })
  .refine((body) => Boolean(body.supplierId) || Boolean(body.supplierName), {
    message: 'A purchase order needs a supplier — choose one or name it.',
    path: ['supplierName'],
  })
export type PurchaseOrderCreate = z.infer<typeof purchaseOrderCreate>

export const purchaseOrderUpdate = z.object({
  supplierId: ulid.optional(),
  supplierName: z.string().max(200).optional(),
  expectedDate: isoDate.optional(),
  notes: z.string().max(2000).optional(),
  lines: z.array(purchaseOrderLine).min(1).max(200).optional(),
})
export type PurchaseOrderUpdate = z.infer<typeof purchaseOrderUpdate>

export const purchaseOrderApproveBody = z.object({
  reason: z.string().max(500).optional(),
})
export type PurchaseOrderApproveBody = z.infer<typeof purchaseOrderApproveBody>

/** One line's incoming quantity, addressed by the line's ULID. */
export const purchaseOrderReceiptLine = z.object({
  lineId: ulid,
  qty: z.number().int().min(1).max(1_000_000),
})
export type PurchaseOrderReceiptLine = z.infer<typeof purchaseOrderReceiptLine>

export const purchaseOrderReceiveBody = z.object({
  lines: z.array(purchaseOrderReceiptLine).min(1).max(200),
  /** An over-receipt (incoming > ordered on a line) is refused unless this is
   *  set AND the caller holds procurement approval authority. Never silent. */
  overReceiptApproved: z.boolean().optional(),
  reason: z.string().max(500).optional(),
})
export type PurchaseOrderReceiveBody = z.infer<typeof purchaseOrderReceiveBody>

export const purchaseOrderRow = appRow({
  /** `PO-0001` — the human code the design shows. */
  id: z.string(),
  code: z.string(),
  supplierId: ulid.nullable(),
  supplierName: z.string(),
  requisitionId: ulid.nullable(),
  status: purchaseOrderStatus,
  /** `"SAR 1,840"` — formatted from `totalHalalas` at the boundary. */
  amount: z.string(),
  subtotalHalalas: z.number().int().min(0),
  taxHalalas: z.number().int().min(0),
  totalHalalas: z.number().int().min(0),
  orderedAt: z.string().nullable(),
  expectedAt: z.string().nullable(),
  /** Who raised the order and who approved it — the SOD row check pair. */
  submittedBy: ulid.nullable(),
  approvedBy: ulid.nullable(),
})
export type PurchaseOrderRow = z.infer<typeof purchaseOrderRow>

/** A purchase-order line as the lines sub-route returns it. */
export const purchaseOrderLineRow = z.object({
  _id: ulid,
  partSku: z.string().nullable(),
  description: z.string(),
  descriptionAr: z.string().nullable(),
  qty: z.number().int().min(0),
  receivedQty: z.number().int().min(0),
  unitPriceHalalas: z.number().int().min(0),
  lineTotalHalalas: z.number().int().min(0),
  sort: z.number().int().min(0),
})
export type PurchaseOrderLineRow = z.infer<typeof purchaseOrderLineRow>
