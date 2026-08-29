/** Saved report definitions (F-028).
 *
 *  Lets CustomReports persist a report the user built — its name, the ledger
 *  source it runs over, and the filter/column selection as JSON — so it can be
 *  rebuilt later. Tenant-scoped like everything else; writable through the
 *  generic router.
 */
import { z } from 'zod'
import { appRow } from './common'

export const savedReportCreate = z.object({
  name: z.string().min(1).max(200),
  /** The ledger source the report runs over (e.g. `invoices`, `journal`). */
  source: z.string().max(64).optional(),
  ownerName: z.string().max(200).optional(),
  /** The filter/column selection the builder produced. An arbitrary JSON
   *  object — bounded to an object so it can never be a bare scalar or an array
   *  the reader would have to special-case. */
  definition: z.record(z.string(), z.unknown()).optional(),
})

export const savedReportUpdate = savedReportCreate.partial()

export type SavedReportCreate = z.infer<typeof savedReportCreate>
export type SavedReportUpdate = z.infer<typeof savedReportUpdate>

export const savedReportRow = appRow({
  name: z.string(),
  source: z.string(),
  owner: z.string(),
  definition: z.record(z.string(), z.unknown()),
})

export type SavedReportRow = z.infer<typeof savedReportRow>
