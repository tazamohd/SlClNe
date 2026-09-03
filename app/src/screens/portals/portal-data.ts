/** Shared row shapes and small derivations for the portal screens.
 *
 *  Like `workshop/stages.ts`, the row types widen the fixture-inferred
 *  `RowOf<…>` with the columns only the API serves (`scheduledDate`,
 *  `balanceHalalas`, entity metadata). Both shapes reach these screens —
 *  fixtures with `VITE_API_URL` unset, API rows with it set — so every extra
 *  column is optional and every screen degrades honestly when one is absent. */
import type { RowOf } from '@/data/useCollection'
import type { JobRow } from '@/screens/workshop/stages'

export type AppointmentRow = RowOf<'appointments'> & {
  _id?: string
  /** ISO date the API stores; fixture rows carry only the time label. */
  scheduledDate?: string | null
  startMinute?: number
}

export type VehicleRow = RowOf<'vehicles'> & {
  _id?: string
  customerId?: string | null
}

export type InvoiceRow = RowOf<'invoices'> & {
  _id?: string
  totalHalalas?: number
  paidHalalas?: number
  balanceHalalas?: number
}

export type EstimateRow = RowOf<'estimates'> & {
  _id?: string
  totalHalalas?: number
}

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

/** Narrows a portal list to the signed-in customer's rows — when a field lets
 *  it. The server's own scope is the access control: a customer principal is
 *  only ever sent their rows, so this is a display courtesy for staff roles
 *  reading the same screen, never a boundary. It applies only when the rows
 *  carry `customerId` and at least one matches the signed-in user; a fixture
 *  list (no ids) or a mismatch (staff viewing a branch) passes through whole
 *  rather than hiding everything behind a guess. */
export function mineOnly<TRow extends { customerId?: string | null }>(
  rows: readonly TRow[],
  userId: string | null | undefined
): readonly TRow[] {
  if (!userId) return rows
  const mine = rows.filter((row) => row.customerId === userId)
  return mine.length > 0 ? mine : rows
}
