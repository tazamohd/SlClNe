/** Boundary formatting.
 *
 *  Money rests in the database as an integer count of halalas and is formatted
 *  exactly here, on the way out. The design bundle renders money three
 *  different ways — `"SAR 1,840"`, a bare SAR number, and inside a wider
 *  sentence — so the *presentation* varies while the stored value does not.
 */
import { formatSar, halalasToSar } from '@salis/contract'

export { formatSar }

/** Money as the bare SAR number some tables render (`unit: 420`). */
export function sarNumber(halalas: number | null | undefined): number {
  return halalas == null ? 0 : halalasToSar(halalas)
}

export function sarString(halalas: number | null | undefined): string {
  return formatSar(halalas ?? 0)
}

const US_DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

const GB_DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function toUtcDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

/** `"2026-07-28"` → `"Jul 28, 2026"`. */
export function dateUS(value: string | Date | null | undefined): string {
  const date = toUtcDate(value)
  return date ? US_DATE.format(date) : ''
}

/** `"2026-07-22"` → `"22 Jul 2026"`. */
export function dateGB(value: string | Date | null | undefined): string {
  const date = toUtcDate(value)
  return date ? GB_DATE.format(date) : ''
}

/** The inverse of `dateUS` / `dateGB`, used by the seed to turn the design's
 *  display strings back into real dates. Returns null rather than an Invalid
 *  Date, so a row with an unparseable label seeds with a null date instead of
 *  a column full of `NaN`. */
export function parseDisplayDate(value: string | null | undefined): string | null {
  if (!value) return null
  const iso = /^\d{4}-\d{2}-\d{2}$/
  if (iso.test(value)) return value
  const parsed = new Date(`${value} UTC`)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

const KM = new Intl.NumberFormat('en-US')

/** `42180` → `"42,180 km"`. */
export function kilometres(value: number | null | undefined): string {
  return `${KM.format(value ?? 0)} km`
}

export function parseKilometres(value: string | null | undefined): number {
  if (!value) return 0
  const digits = value.replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

export function count(value: number | null | undefined): number {
  return value ?? 0
}

/** The entity metadata every row carries. Underscore-prefixed so it cannot
 *  collide with a design field, and so a screen reading the row is visibly
 *  reading plumbing when it touches one. */
export function meta(row: {
  id: string
  version: number
  createdAt: Date | string
  updatedAt: Date | string
}) {
  return {
    _id: row.id,
    _version: row.version,
    _createdAt: new Date(row.createdAt).toISOString(),
    _updatedAt: new Date(row.updatedAt).toISOString(),
  }
}
