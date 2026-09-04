/** The vehicle catalogue's shape.
 *
 *  A make owns models; a model is a run of generations, each with a factory
 *  code (E65, W222, XV70), the model years it covered and the trims sold in
 *  the Gulf. `twins` names the same car sold under another badge or built
 *  on the same platform — a workshop that knows a Patrol Y62 is an Infiniti
 *  QX80 underneath can reuse the procedure and the parts lookup.
 *
 *  Nothing here is fetched: it is reference data curated for the brands a
 *  Saudi workshop sees, from model year 2000. Manuals are *references* to the
 *  factory owner's manual — a title and the maker's owner portal where one is
 *  known — never a document invented to fill the field. */
export type Body =
  | 'sedan'
  | 'hatchback'
  | 'coupe'
  | 'suv'
  | 'crossover'
  | 'pickup'
  | 'van'
  | 'mpv'
  | 'sports'

export interface Generation {
  /** Factory chassis / platform code, e.g. `G12`, `W222`, `XV70`. */
  code?: string
  /** First model year. */
  from: number
  /** Last model year; omitted while still on sale. */
  to?: number
  /** Trims or engine designations sold in the region. */
  trims?: readonly string[]
}

export interface Twin {
  make: string
  model: string
  /** English source string — what the two cars share. */
  note: string
}

export interface VehicleModel {
  make: string
  model: string
  body: Body
  generations: readonly Generation[]
  twins?: readonly Twin[]
}

export interface VehicleMake {
  name: string
  country: string
  /** The maker's official owner's-manual portal, when one is known. */
  manualPortal?: string
  /** The volume brand this luxury badge belongs to (Lexus → Toyota). */
  luxuryOf?: string
}

/** Shorthand for a generation line: `g('W222', 2013, 2020, ['S 450', 'S 560'])`. */
export function g(code: string | undefined, from: number, to?: number, trims?: readonly string[]): Generation {
  return { code, from, to, trims }
}
