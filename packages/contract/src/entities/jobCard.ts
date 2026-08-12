/** Job cards — the central workshop entity (`DATA_MODEL.md` §JOBS).
 *
 *  The design's `st` values are the operational statuses the board shows; the
 *  handoff's stage list is the workflow the job walks through. Both are
 *  modelled: `status` for the board, `stage` for the gate machine, because a
 *  gate cannot be skipped and the board must still say `in_progress`. */
import { z } from 'zod'
import { nonEmpty, ulid } from '../primitives'
import { appRow } from './common'

export const jobStatus = z.enum(['pending', 'in_progress', 'completed', 'delivered', 'cancelled'])
export type JobStatus = z.infer<typeof jobStatus>

export const jobStage = z.enum([
  'checkin',
  'inspection',
  'estimate',
  'repair',
  'qc',
  'delivery',
  'invoiced',
  'closed',
])
export type JobStage = z.infer<typeof jobStage>

/** The stage machine. A transition not listed here is refused with 422 — the
 *  client's stepper is a convenience, this is the rule. */
export const JOB_STAGE_TRANSITIONS: Readonly<Record<JobStage, readonly JobStage[]>> = {
  checkin: ['inspection'],
  inspection: ['estimate'],
  estimate: ['repair', 'inspection'],
  repair: ['qc'],
  qc: ['delivery', 'repair'],
  delivery: ['invoiced'],
  invoiced: ['closed'],
  closed: [],
}

export function canTransition(from: JobStage, to: JobStage): boolean {
  return JOB_STAGE_TRANSITIONS[from].includes(to)
}

export const jobPriority = z.enum(['low', 'medium', 'high', 'urgent'])
export type JobPriority = z.infer<typeof jobPriority>

export const jobService = z.enum([
  'maintenance',
  'repair',
  'diagnostic',
  'inspection',
  'tire_service',
  'body_paint',
  'ac_service',
  'oil_change',
])

export const jobCardCreate = z.object({
  customerId: ulid.optional(),
  customerName: nonEmpty.max(160),
  vehicleId: ulid.optional(),
  vehicleLabel: nonEmpty.max(120),
  service: jobService,
  status: jobStatus.default('pending'),
  stage: jobStage.default('checkin'),
  priority: jobPriority.default('medium'),
  assignedTechId: ulid.optional(),
  complaint: z.string().max(4000).optional(),
})

/** A general edit may change who and what the job is for — never where it is in
 *  the workflow. `stage` and `status` move only through `POST /jobs/:id/transition`,
 *  which runs the state machine, the QC approval gate and the segregation-of-duties
 *  check. Leaving them on the generic PATCH was a live bypass: any role with
 *  `jobcards:e` could send `{ stage: 'delivery' }` and walk a car past QC without
 *  a repair, past the SOD control, and into a `completed` status the transition
 *  route would have refused. Omitting them here is the fix — a `stage` key on a
 *  PATCH is now ignored, not obeyed. `qcPassedBy` was never in this shape and
 *  cannot be sent. */
export const jobCardUpdate = jobCardCreate.partial().omit({ stage: true, status: true })

export const jobTransitionBody = z.object({
  to: jobStage,
  reason: z.string().max(500).optional(),
})

export const jobAssignBody = z.object({ techId: ulid })

export type JobCardCreate = z.infer<typeof jobCardCreate>
export type JobCardUpdate = z.infer<typeof jobCardUpdate>

export const jobCardRow = appRow({
  /** The human code the board shows, e.g. `A3F8B2C1`. */
  id: z.string(),
  cust: z.string(),
  veh: z.string(),
  svc: jobService,
  st: jobStatus,
  pr: jobPriority,
  stage: jobStage,
  assignedTechId: ulid.nullable(),
})

export type JobCardRow = z.infer<typeof jobCardRow>
