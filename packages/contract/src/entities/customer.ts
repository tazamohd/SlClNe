/** Customers — individuals and fleet accounts (`DATA_MODEL.md` §Customers). */
import { z } from 'zod'
import { email, nonEmpty, phone, ulid } from '../primitives'
import { appRow } from './common'

export const customerType = z.enum(['individual', 'fleet'])
export type CustomerType = z.infer<typeof customerType>

/** What a client may send. `vehicleCount` and `totalSpent` are absent by
 *  design — they are derived from vehicles and paid invoices, so a client
 *  cannot inflate a customer's spend by asserting it. */
export const customerCreate = z.object({
  name: nonEmpty.max(160),
  phone,
  email: email.optional(),
  type: customerType.default('individual'),
  fleetId: ulid.optional(),
  notes: z.string().max(2000).optional(),
})

export const customerUpdate = customerCreate.partial()

export type CustomerCreate = z.infer<typeof customerCreate>
export type CustomerUpdate = z.infer<typeof customerUpdate>

/** The shape `Registries.tsx` renders today. */
export const customerRow = appRow({
  name: z.string(),
  phone: z.string(),
  /** Number of vehicles on the account — derived. */
  vehicles: z.number().int().min(0),
  /** Lifetime spend, formatted at the boundary: `"SAR 12,840"`. */
  spent: z.string(),
  /** Last visit, as the design words it: `"2 weeks ago"`, `"In Service"`. */
  last: z.string(),
  type: customerType,
  email: z.string().nullable(),
  /** Lifetime spend in halalas — the value any client-side arithmetic must use
   *  instead of re-parsing `spent`. */
  totalSpentHalalas: z.number().int().min(0),
})

export type CustomerRow = z.infer<typeof customerRow>
