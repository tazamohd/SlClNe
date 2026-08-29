/** Vehicles. VIN is unique per tenant (`DATA_MODEL.md` §VEHICLES). */
import { z } from 'zod'
import { nonEmpty, plate, ulid, vin } from '../primitives'
import { appRow } from './common'

export const vehicleStatus = z.enum(['active', 'service', 'inactive'])
export type VehicleStatus = z.infer<typeof vehicleStatus>

export const vehicleCreate = z.object({
  plate,
  /** `"Toyota Camry 2022"` as the design carries it. */
  makeModel: nonEmpty.max(120),
  customerId: ulid.optional(),
  /** Denormalised owner name, kept when no customer record exists yet. */
  ownerName: nonEmpty.max(160).optional(),
  vin: vin.optional(),
  mileageKm: z.number().int().min(0).max(10_000_000).default(0),
  status: vehicleStatus.default('active'),
})

export const vehicleUpdate = vehicleCreate.partial()

export type VehicleCreate = z.infer<typeof vehicleCreate>
export type VehicleUpdate = z.infer<typeof vehicleUpdate>

export const vehicleRow = appRow({
  plate: z.string(),
  make: z.string(),
  owner: z.string(),
  /** `"42,180 km"` — formatted at the boundary. */
  mileage: z.string(),
  last: z.string(),
  status: vehicleStatus,
  mileageKm: z.number().int().min(0),
  vin: z.string().nullable(),
  customerId: ulid.nullable(),
})

export type VehicleRow = z.infer<typeof vehicleRow>
