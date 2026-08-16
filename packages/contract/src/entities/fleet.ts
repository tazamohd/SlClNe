/** Fleet accounts and their service contracts (`DATA_MODEL.md` §Fleets).
 *
 *  A fleet's contract carries money (`contractValueHalalas`, integer halalas),
 *  a term (start/end) and a renewal date. `vehicleCount` and `activeCount` are
 *  derived from the vehicles on the account and are never accepted from a
 *  client, so a caller cannot inflate a fleet's size by asserting it.
 */
import { z } from 'zod'
import { halalas, isoDate, nonEmpty, phone } from '../primitives'
import { appRow } from './common'

export const fleetContractType = z.enum(['standard', 'premium', 'enterprise', 'custom'])
export type FleetContractType = z.infer<typeof fleetContractType>

export const fleetContractStatus = z.enum(['active', 'renewal', 'expired', 'suspended'])
export type FleetContractStatus = z.infer<typeof fleetContractStatus>

export const fleetCreate = z.object({
  name: nonEmpty.max(200),
  contractStatus: fleetContractStatus.default('active'),
  contractType: fleetContractType.optional(),
  contractValueHalalas: halalas.optional(),
  contractStartDate: isoDate.optional(),
  contractEndDate: isoDate.optional(),
  renewalDate: isoDate.optional(),
  contactName: z.string().max(200).optional(),
  contactPhone: phone.optional(),
  contactEmail: z.string().email().max(254).optional(),
})

export const fleetUpdate = fleetCreate.partial()

export type FleetCreate = z.infer<typeof fleetCreate>
export type FleetUpdate = z.infer<typeof fleetUpdate>

/** Renewing a fleet contract. A renewal moves the term forward and records the
 *  new value; the new end/renewal dates are supplied by the caller, and the
 *  action sets the status back to `active`. */
export const fleetRenewBody = z.object({
  contractValueHalalas: halalas.optional(),
  contractStartDate: isoDate.optional(),
  contractEndDate: isoDate,
  renewalDate: isoDate.optional(),
  contractType: fleetContractType.optional(),
})

export type FleetRenewBody = z.infer<typeof fleetRenewBody>

export const fleetRow = appRow({
  name: z.string(),
  vehicles: z.number().int().min(0),
  active: z.number().int().min(0),
  contract: z.string(),
  contractType: z.string(),
  contractValue: z.string(),
  contractValueHalalas: z.number().int().min(0),
  start: z.string(),
  end: z.string(),
  renewal: z.string(),
  contact: z.string(),
  contactPhone: z.string(),
})

export type FleetRow = z.infer<typeof fleetRow>
