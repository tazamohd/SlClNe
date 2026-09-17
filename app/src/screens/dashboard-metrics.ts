/** Pure helpers for the Dashboard's KPI row. Split out from Dashboard.tsx so
 *  the guard logic — the part a bad input can actually break — is unit
 *  testable without mounting the screen. */

/** yyyy-mm-dd for a date, in the local timezone (matches the `date` inputs
 *  the reporting screens use, so the same range reads the same way
 *  everywhere the app shows one). */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Percentage change from `previous` to `current`, or `null` when it cannot
 *  be stated honestly: either figure is missing/non-finite, or the base is
 *  zero or negative (a real division would be `Infinity`, `-Infinity` or
 *  `NaN`). The caller renders no badge rather than one of those strings —
 *  §32 (dashboards): never render `NaN%` or `Infinity%`. */
export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return null
  const change = ((current - previous) / previous) * 100
  return Number.isFinite(change) ? change : null
}
