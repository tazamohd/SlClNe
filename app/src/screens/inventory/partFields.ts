import { parseSar } from '@/components/ui/Money'
import type { RowOf } from '@/data/useCollection'

export type Part = RowOf<'parts'>

/* ══════════════════════════════════════════════════════ reading a part's row */

/** The API row carries more than the fixture row does. Read through accessors
 *  so the screen works against both without claiming a number it never got:
 *  `null` means "this dataset does not say", which is not the same as zero. */
interface PartExtras {
  _id?: string
  reserved?: number
  available?: number
  priceHalalas?: number
  costHalalas?: number | null
  backorderable?: boolean
}

const extras = (part: Part): PartExtras => part as Part & PartExtras

/** How the movement endpoints address this part. Both accept the ULID or the
 *  SKU, and the SKU is the only one the fixtures have. */
export function partRef(part: Part): string {
  return extras(part)._id ?? part.sku
}

export function reservedOf(part: Part): number | null {
  const value = extras(part).reserved
  return typeof value === 'number' ? value : null
}

export function availableOf(part: Part): number | null {
  const value = extras(part).available
  return typeof value === 'number' ? value : part.stock - (reservedOf(part) ?? 0)
}

export function priceHalalasOf(part: Part): number {
  const value = extras(part).priceHalalas
  return typeof value === 'number' ? value : Math.round(parseSar(part.price) * 100)
}

export function costHalalasOf(part: Part): number | null {
  const value = extras(part).costHalalas
  return typeof value === 'number' ? value : null
}

export function backorderableOf(part: Part): boolean {
  return extras(part).backorderable === true
}

/** At or under the reorder point — the one signal every tab agrees on. */
export function isBelowReorder(part: Part): boolean {
  return part.stock <= part.reorder
}

/** How far under the reorder point, never negative. */
export function shortfallOf(part: Part): number {
  return Math.max(0, part.reorder - part.stock)
}

/** 0 = out of stock, 1 = low, 2 = in stock — so a status column can sort. */
export function stockRank(part: Part): number {
  if (part.stock <= 0) return 0
  return isBelowReorder(part) ? 1 : 2
}
