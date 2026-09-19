/** Shared row shapes and small derivations for the portal screens.
 *
 *  These used to widen the fixture-inferred `RowOf<…>` by hand with the
 *  columns only the API serves (`scheduledDate`, `balanceHalalas`, entity
 *  metadata) — that widening is typed on `Repository` itself now (F-020), so
 *  each of these is a plain alias, kept because the screens below already
 *  import it by this name. */
import type { RowOf } from '@/data/useCollection'
import type { JobRow } from '@/screens/workshop/stages'

export type AppointmentRow = RowOf<'appointments'>
export type VehicleRow = RowOf<'vehicles'>
export type CustomerRow = RowOf<'customers'>
export type InvoiceRow = RowOf<'invoices'>
export type EstimateRow = RowOf<'estimates'>

/** Job states the board treats as finished. `st` is the design's status
 *  vocabulary; `stage` (API only) is the machine's. Either saying "done" wins. */
export function isDone(job: JobRow): boolean {
  if (job.stage === 'invoiced' || job.stage === 'closed' || job.stage === 'delivery') return true
  return job.st === 'completed' || job.st === 'delivered'
}

export function isInProgress(job: JobRow): boolean {
  return !isDone(job) && job.st === 'in_progress'
}

/** Local calendar date as the API's `scheduledDate` stores it (YYYY-MM-DD). */
export function todayIso(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** `"9:00 AM"` → `540`. Mirrors `minuteOfDay` in `packages/contract` — the app
 *  deliberately has no dependency on that package (agent 05's call), so the
 *  arithmetic is restated here and the server remains the authority. */
export function minuteOf(label: string): number {
  const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(label.trim())
  if (!match) return 0
  const hour12 = Number(match[1]) % 12
  const minutes = Number(match[2])
  return (match[3] === 'PM' ? hour12 + 12 : hour12) * 60 + minutes
}

/** The technician job-detail route for a job code. */
export function detailRoute(code: string): string {
  return `/technician-portal/job-detail?id=${encodeURIComponent(code)}`
}
