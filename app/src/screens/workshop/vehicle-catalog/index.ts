import { AMERICAN } from './american'
import { GERMAN } from './german'
import { JAPANESE } from './japanese'
import { KOREAN } from './korean'
import { OTHER } from './other'
import type { Generation, Twin, VehicleMake, VehicleModel } from './types'

export type { Body, Generation, Twin, VehicleMake, VehicleModel } from './types'

/** The catalogue starts at model year 2000; the picker offers nothing older. */
export const CATALOG_FROM_YEAR = 2000

/** Makes, with the official owner's-manual portal where one is known. A
 *  portal is listed only when it is the maker's own; the rest say who
 *  publishes the manual and leave the link out rather than invent one. */
export const MAKES: readonly VehicleMake[] = [
  { name: 'Toyota', country: 'Japan', manualPortal: 'https://www.toyota.com/owners/resources/warranty-owners-manuals' },
  { name: 'Lexus', country: 'Japan', luxuryOf: 'Toyota', manualPortal: 'https://drivers.lexus.com/lexusdrivers/manuals' },
  { name: 'Nissan', country: 'Japan' },
  { name: 'Infiniti', country: 'Japan', luxuryOf: 'Nissan' },
  { name: 'Honda', country: 'Japan' },
  { name: 'Mitsubishi', country: 'Japan' },
  { name: 'Mazda', country: 'Japan' },
  { name: 'Suzuki', country: 'Japan' },
  { name: 'Subaru', country: 'Japan' },
  { name: 'Isuzu', country: 'Japan' },
  { name: 'Hyundai', country: 'South Korea', manualPortal: 'https://owners.hyundaiusa.com/us/en/resources/manuals-warranties.html' },
  { name: 'Kia', country: 'South Korea' },
  { name: 'Genesis', country: 'South Korea', luxuryOf: 'Hyundai' },
  { name: 'BMW', country: 'Germany' },
  { name: 'MINI', country: 'Germany', luxuryOf: 'BMW' },
  { name: 'Mercedes-Benz', country: 'Germany', manualPortal: 'https://www.mbusa.com/en/owners/manuals' },
  { name: 'Audi', country: 'Germany' },
  { name: 'Volkswagen', country: 'Germany' },
  { name: 'Porsche', country: 'Germany' },
  { name: 'Land Rover', country: 'United Kingdom', manualPortal: 'https://www.ownerinfo.landrover.com/' },
  { name: 'Jaguar', country: 'United Kingdom', manualPortal: 'https://www.ownerinfo.jaguar.com/' },
  { name: 'Ford', country: 'United States', manualPortal: 'https://www.ford.com/support/owner-manuals/' },
  { name: 'Lincoln', country: 'United States', luxuryOf: 'Ford', manualPortal: 'https://www.lincoln.com/support/owner-manuals/' },
  { name: 'Chevrolet', country: 'United States' },
  { name: 'GMC', country: 'United States' },
  { name: 'Cadillac', country: 'United States', luxuryOf: 'Chevrolet' },
  { name: 'Dodge', country: 'United States', manualPortal: 'https://www.mopar.com/en-us/care/owners-manual.html' },
  { name: 'Chrysler', country: 'United States', manualPortal: 'https://www.mopar.com/en-us/care/owners-manual.html' },
  { name: 'Jeep', country: 'United States', manualPortal: 'https://www.mopar.com/en-us/care/owners-manual.html' },
  { name: 'RAM', country: 'United States', manualPortal: 'https://www.mopar.com/en-us/care/owners-manual.html' },
  { name: 'MG', country: 'China' },
  { name: 'Geely', country: 'China' },
  { name: 'Chery', country: 'China' },
  { name: 'Jetour', country: 'China' },
  { name: 'Haval', country: 'China' },
  { name: 'GWM', country: 'China' },
  { name: 'Changan', country: 'China' },
  { name: 'GAC', country: 'China' },
  { name: 'Renault', country: 'France' },
  { name: 'Peugeot', country: 'France' },
  { name: 'Skoda', country: 'Czech Republic' },
  { name: 'Volvo', country: 'Sweden' },
]

export const MODELS: readonly VehicleModel[] = [...JAPANESE, ...KOREAN, ...GERMAN, ...AMERICAN, ...OTHER]

export function makeNamed(name: string): VehicleMake | undefined {
  return MAKES.find((make) => make.name === name)
}

export function modelsFor(make: string): readonly VehicleModel[] {
  return MODELS.filter((model) => model.make === make)
}

export function modelNamed(make: string, model: string): VehicleModel | undefined {
  return MODELS.find((entry) => entry.make === make && entry.model === model)
}

/** The model years the catalogue can place a car in, newest first. Clamped
 *  to `CATALOG_FROM_YEAR` and to next year's model year. */
export function yearsFor(model: VehicleModel, now = new Date().getFullYear()): readonly number[] {
  const first = Math.max(CATALOG_FROM_YEAR, Math.min(...model.generations.map((gen) => gen.from)))
  const last = Math.min(now + 1, Math.max(...model.generations.map((gen) => gen.to ?? now + 1)))
  const out: number[] = []
  for (let year = last; year >= first; year -= 1) out.push(year)
  return out
}

/** The generation a model year falls in. Where two overlap (a run-out year
 *  sold alongside its successor, as with the Y61 and Y62 Patrol) the newer
 *  one wins, since that is what a workshop is more likely to see. */
export function generationFor(model: VehicleModel, year: number): Generation | undefined {
  const hits = model.generations.filter((gen) => year >= gen.from && (gen.to === undefined || year <= gen.to))
  return hits.length ? hits[hits.length - 1] : undefined
}

export function twinsFor(model: VehicleModel): readonly Twin[] {
  return model.twins ?? []
}

export interface ManualReference {
  /** "2022 BMW 7 Series Owner's Manual (G11/G12)". */
  title: string
  /** Who issued it — the maker, or the group brand behind a luxury badge. */
  publisher: string
  /** The maker's official portal, when the catalogue knows it. */
  portal?: string
}

/** The factory owner's manual a car shipped with. It is a reference, not a
 *  file: the title a parts desk or a distributor can be asked for, and the
 *  maker's own portal when it has one. */
export function manualFor(model: VehicleModel, year: number): ManualReference {
  const make = makeNamed(model.make)
  const generation = generationFor(model, year)
  const suffix = generation?.code ? ` (${generation.code})` : ''
  return {
    title: `${year} ${model.make} ${model.model} Owner's Manual${suffix}`,
    publisher: make?.luxuryOf ? `${model.make} (${make.luxuryOf} group)` : model.make,
    portal: make?.manualPortal,
  }
}

/** "BMW 7 Series 740Li 2022" — the label the job card stores. Trim and year
 *  are optional so a half-chosen picker still yields something usable. */
export function formatVehicleLabel(parts: { make: string; model: string; trim?: string; year?: number }): string {
  return [parts.make, parts.model, parts.trim?.trim(), parts.year].filter(Boolean).join(' ')
}
