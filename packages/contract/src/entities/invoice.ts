/** Invoices — ZATCA-compliant, immutable once issued.
 *
 *  `total = subtotal + tax − discount`, with VAT computed at the ZATCA rate by
 *  the server. The client may display a total; the server decides it. */
import { z } from 'zod'
import { halalas, isoDate, isoDateTime, nonEmpty, ulid, vatNumber } from '../primitives'
import { appRow } from './common'

export const invoiceStatus = z.enum(['draft', 'unpaid', 'partial', 'paid', 'overdue', 'cancelled'])
export type InvoiceStatus = z.infer<typeof invoiceStatus>

export const invoiceLineKind = z.enum(['part', 'labour', 'fee'])

export const invoiceLineCreate = z.object({
  description: nonEmpty.max(300),
  descriptionAr: z.string().max(300).optional(),
  kind: invoiceLineKind,
  qty: z.number().min(0.01).max(100_000),
  /** Net unit price in halalas. VAT is never sent by the client. */
  unitPriceHalalas: halalas,
  partSku: z.string().max(64).optional(),
})

export type InvoiceLineCreate = z.infer<typeof invoiceLineCreate>

export const invoiceCreate = z.object({
  customerId: ulid.optional(),
  customerName: nonEmpty.max(160),
  jobCardId: ulid.optional(),
  vehicleId: ulid.optional(),
  dueDate: isoDate,
  lines: z.array(invoiceLineCreate).min(1).max(500),
  discountHalalas: halalas.default(0),
  buyerVatNumber: vatNumber.optional(),
  notes: z.string().max(2000).optional(),
})

/** An issued invoice is immutable — the server refuses a patch to one with 409
 *  rather than accepting the fields it happens to allow. */
export const invoiceUpdate = invoiceCreate.partial().extend({
  status: z.enum(['draft', 'cancelled']).optional(),
})

export type InvoiceCreate = z.infer<typeof invoiceCreate>
export type InvoiceUpdate = z.infer<typeof invoiceUpdate>

export const invoiceRow = appRow({
  id: z.string(),
  cust: z.string(),
  /** `"SAR 1,840"`. */
  amount: z.string(),
  /** `"Jul 28, 2026"`. */
  due: z.string(),
  status: invoiceStatus,
  subtotalHalalas: z.number().int().min(0),
  taxHalalas: z.number().int().min(0),
  discountHalalas: z.number().int().min(0),
  totalHalalas: z.number().int().min(0),
  paidHalalas: z.number().int().min(0),
  balanceHalalas: z.number().int(),
  issuedAt: isoDateTime.nullable(),
  qrCode: z.string().nullable(),
})

export type InvoiceRow = z.infer<typeof invoiceRow>

export const invoiceLineRow = appRow({
  desc: z.string(),
  ar: z.string(),
  kind: invoiceLineKind,
  qty: z.number(),
  /** Net unit price in **SAR**, as the design's line table renders it. */
  unit: z.number(),
  part: z.string(),
  unitPriceHalalas: z.number().int().min(0),
  invoiceId: ulid,
})

export type InvoiceLineRow = z.infer<typeof invoiceLineRow>
