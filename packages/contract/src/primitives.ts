/** Primitive value schemas and the money representation.
 *
 *  Money is an **integer count of halalas** everywhere it crosses a boundary or
 *  rests in a column. `SAR 1,840` is `184000`. The browser never computes a
 *  financial value that the server then trusts — it may format one for display,
 *  which is what `formatSar` is for.
 */
import { z } from 'zod'

/** ULID — 26 chars, Crockford base32, no `I`, `L`, `O` or `U`. */
export const ulid = z
  .string()
  .length(26)
  .regex(/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/, 'not a ULID')

export type Ulid = z.infer<typeof ulid>

/** A resource reference accepted by detail routes: either the ULID primary key
 *  or the human business code the design shows (`INV-2026-0142`, `A3F8B2C1`). */
export const resourceRef = z.string().min(1).max(64)

/** Money in halalas. Non-negative unless a schema opts into `signedHalalas`. */
export const halalas = z
  .number()
  .int('money must be an integer count of halalas')
  .min(0, 'money cannot be negative')
  .max(Number.MAX_SAFE_INTEGER)

export const signedHalalas = z
  .number()
  .int('money must be an integer count of halalas')
  .min(-Number.MAX_SAFE_INTEGER)
  .max(Number.MAX_SAFE_INTEGER)

export const HALALAS_PER_SAR = 100

/** SAR (as a decimal number) → halalas, rounded half-up at the last halala. */
export function sarToHalalas(sar: number): number {
  return Math.round(sar * HALALAS_PER_SAR)
}

export function halalasToSar(value: number): number {
  return value / HALALAS_PER_SAR
}

const SAR_FORMAT = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** `184000` → `"SAR 1,840"`. The single formatter for every boundary that hands
 *  a money value to a screen, so two screens cannot disagree about a total. */
export function formatSar(value: number): string {
  return `SAR ${SAR_FORMAT.format(halalasToSar(value))}`
}

/** `"SAR 1,840"` / `"1,840"` / `1840` → `184000`. Throws on anything else
 *  rather than silently yielding `NaN` halalas. */
export function parseSarToHalalas(input: string | number): number {
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) throw new Error(`not a money value: ${input}`)
    return sarToHalalas(input)
  }
  const cleaned = input.replace(/SAR/gi, '').replace(/[\s,٬،]/g, '').trim()
  if (cleaned === '' || cleaned === '—' || cleaned === '-') return 0
  const parsed = Number(cleaned)
  if (!Number.isFinite(parsed)) throw new Error(`not a money value: ${input}`)
  return sarToHalalas(parsed)
}

/** Saudi phone, tolerant of the `+966 55 210 4471` spacing the design uses. */
export const phone = z
  .string()
  .min(6)
  .max(24)
  .regex(/^[+0-9][0-9\s()-]{5,23}$/, 'not a phone number')

export const email = z.string().email().max(254)

/** Saudi plate as rendered in the design: `RUH 4821`. Latin transliteration is
 *  what the mock carries; Arabic plates are accepted as free text of the same
 *  length so a real registration is never rejected at the API edge. */
export const plate = z.string().min(3).max(16)

/** 17-character VIN. `I`, `O`, `Q` are not valid VIN characters. The design's
 *  sample carries display spacing, which is stripped before validation. */
export const vin = z
  .string()
  .transform((v) => v.replace(/\s/g, '').toUpperCase())
  .pipe(z.string().length(17).regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'not a VIN'))

/** 15-digit Saudi VAT registration number, starting and ending with 3. */
export const vatNumber = z.string().regex(/^3\d{13}3$/, 'not a VAT number')

/** Commercial registration number. */
export const crNumber = z.string().regex(/^\d{10}$/, 'not a CR number')

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')
export const isoDateTime = z.string().datetime({ offset: true })

/** Optimistic-concurrency token. A mutation that carries one and loses the race
 *  gets 409 rather than overwriting the winner. */
export const version = z.number().int().min(0)

export const nonEmpty = z.string().trim().min(1)
