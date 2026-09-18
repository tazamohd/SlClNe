/** Declined Job Tracking & Follow-Up (Sprint 1, P0, `DATA_MODEL.md` §CRM).
 *
 *  A row per estimate line — or per whole estimate — a customer said no to.
 *  Created server-side by `POST /estimates/:id/lines/:lineId/decline` and by
 *  `POST /estimates/:id/reject` (one row per line of a whole-estimate
 *  rejection); never by a direct collection create, so a decline is always
 *  traceable to the estimate action that produced it. Everything after that —
 *  the follow-up lifecycle — goes through the generic collection's `PATCH`,
 *  narrowed by `declinedJobUpdate` to exactly the follow-up fields: an advisor
 *  can move a job through its lifecycle but can never rewrite what was
 *  declined, its value or which customer it belongs to.
 */
import { z } from 'zod'
import { halalas, isoDate, nonEmpty, ulid } from '../primitives'
import { appRow } from './common'

export const declinedJobReasonCategory = z.enum([
  'cost',
  'timing',
  'second_opinion',
  'not_urgent',
  'trust',
  'other',
])
export type DeclinedJobReasonCategory = z.infer<typeof declinedJobReasonCategory>

/** Mirrors the DVHC severity ladder minus `ok` — a declined job is by
 *  definition not OK — so a report can line the two scales up. */
export const declinedJobSeverity = z.enum(['monitor', 'attention', 'urgent', 'unsafe'])
export type DeclinedJobSeverity = z.infer<typeof declinedJobSeverity>

export const declinedJobStatus = z.enum([
  'declined',
  'follow_up_scheduled',
  'contacted',
  'reconsidering',
  'approved_later',
  'permanently_declined',
  'expired',
])
export type DeclinedJobStatus = z.infer<typeof declinedJobStatus>

/** Body of `POST /estimates/:id/lines/:lineId/decline` and
 *  `POST /estimates/:id/reject`'s per-line fan-out. Not a collection-create
 *  schema — the route derives `estimateId`, the customer/vehicle snapshot and
 *  the value from the estimate and line it is called on. */
export const declinedJobDeclineBody = z.object({
  reasonCategory: declinedJobReasonCategory.default('other'),
  reasonNotes: z.string().max(1000).optional(),
  safetySeverity: declinedJobSeverity.default('monitor'),
  followUpDate: isoDate.optional(),
})
export type DeclinedJobDeclineBody = z.infer<typeof declinedJobDeclineBody>

/** What the generic collection router accepts on `PATCH` — the follow-up
 *  lifecycle only. A declined job's description, value and estimate/line
 *  links are set once, by the decline action, and are not in this shape at
 *  all, so a `PATCH` cannot rewrite what was declined. */
export const declinedJobUpdate = z.object({
  status: declinedJobStatus.optional(),
  followUpDate: isoDate.nullable().optional(),
  followUpNotes: z.string().max(1000).nullable().optional(),
})
export type DeclinedJobUpdate = z.infer<typeof declinedJobUpdate>

/* No `declinedJobCreate` — the collection is read + follow-up-update only
 * (see `writable` in `server/src/registry.ts`); creation is exclusively the
 * two estimate actions above. */
export const declinedJobCreate = z.never()

export const declinedJobRow = appRow({
  estimateId: ulid,
  estimateLineId: ulid.nullable(),
  jobCardId: ulid.nullable(),
  customer: nonEmpty,
  vehicle: nonEmpty,
  advisorId: ulid.nullable(),
  description: z.string(),
  reasonCategory: declinedJobReasonCategory,
  reasonNotes: z.string().nullable(),
  safetySeverity: declinedJobSeverity,
  value: z.string(),
  status: declinedJobStatus,
  followUpDate: z.string().nullable(),
  followUpNotes: z.string().nullable(),
  declinedAt: z.string(),
  resolvedAt: z.string().nullable(),
})
export type DeclinedJobRow = z.infer<typeof declinedJobRow>

/** `GET /reports/declined-jobs` — lost/recovered revenue and decline reasons,
 *  server-aggregated (§A10: no financial figure is client-summed). */
export const declinedJobsReport = z.object({
  lostRevenueHalalas: halalas,
  recoveredRevenueHalalas: halalas,
  openCount: z.number().int(),
  resolvedCount: z.number().int(),
  byReason: z.array(z.object({ reason: declinedJobReasonCategory, count: z.number().int(), valueHalalas: halalas })),
  byAdvisor: z.array(
    z.object({
      advisorId: ulid.nullable(),
      declinedCount: z.number().int(),
      recoveredCount: z.number().int(),
      recoveredHalalas: halalas,
    })
  ),
})
export type DeclinedJobsReport = z.infer<typeof declinedJobsReport>
