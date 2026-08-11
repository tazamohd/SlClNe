/** Payments against an invoice.
 *
 *  `amount ≤ invoice.balance`, a cancelled invoice takes no normal payment, and
 *  a replayed `Idempotency-Key` returns the first receipt rather than taking
 *  the money twice. */
import { z } from 'zod'
import { halalas, isoDate, nonEmpty, ulid } from '../primitives'
import { appRow } from './common'

export const paymentMethod = z.enum([
  'Mada',
  'Cash',
  'Visa',
  'Mastercard',
  'Bank transfer',
  'Bank Transfer',
  'Cheque',
  'Credit',
])
export type PaymentMethod = z.infer<typeof paymentMethod>

export const paymentCreate = z.object({
  /** Halalas. The client sends what the customer handed over, not a total it
   *  computed from a page it may have stale. */
  amountHalalas: halalas.refine((v) => v > 0, 'a payment must be greater than zero'),
  method: paymentMethod,
  reference: z.string().max(64).optional(),
  paidOn: isoDate.optional(),
  note: z.string().max(500).optional(),
})

export const paymentUpdate = z.object({
  reference: z.string().max(64).optional(),
  note: z.string().max(500).optional(),
})

export type PaymentCreate = z.infer<typeof paymentCreate>
export type PaymentUpdate = z.infer<typeof paymentUpdate>

export const paymentRow = appRow({
  /** `"22 Jul 2026"`. */
  date: z.string(),
  method: z.string(),
  ar_method: z.string(),
  ref: z.string(),
  /** Amount in **SAR**, as the invoice's payment table renders it. */
  amount: z.number(),
  amountHalalas: z.number().int().min(0),
  invoiceId: ulid.nullable(),
})

export type PaymentRow = z.infer<typeof paymentRow>

export const receiptRow = appRow({
  id: z.string(),
  date: z.string(),
  customer: z.string(),
  invoice: z.string(),
  method: z.string(),
  /** `"SAR 1,840"`. */
  amount: z.string(),
  status: z.enum(['cleared', 'pending', 'bounced']),
  amountHalalas: z.number().int().min(0),
})

export const receiptCreate = z.object({
  invoiceId: ulid,
  customerName: nonEmpty.max(160),
  amountHalalas: halalas,
  method: paymentMethod,
})

export type ReceiptRow = z.infer<typeof receiptRow>
