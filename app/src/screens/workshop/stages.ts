/** The job-card stage vocabulary, as the API speaks it.
 *
 *  `packages/contract` owns the authoritative list (`jobStage`,
 *  `JOB_STAGE_TRANSITIONS`) and the server enforces it. The app does not depend
 *  on that package — `app/package.json` has no `@salis/contract` entry and
 *  adding one is agent 05's call, not this domain's — so the vocabulary is
 *  mirrored here, deliberately and in one file rather than spread across six
 *  screens the way the design bundle spread it.
 *
 *  This is a **display** mirror. Nothing here is a guarantee: the stage machine
 *  runs server-side on `POST /jobs/:id/transition`, and a client that got the
 *  order wrong would be corrected by a 422 rather than allowed through (§36
 *  applies to business rules for the same reason it applies to permissions).
 */
import { WORKSHOP_STAGES } from '@/components/ui/WorkflowStepper'
import type { RowOf } from '@/data/useCollection'

/** `packages/contract/src/entities/jobCard.ts` → `jobStage`. */
export const JOB_STAGES = [
  'checkin',
  'inspection',
  'estimate',
  'repair',
  'qc',
  'delivery',
  'invoiced',
  'closed',
] as const

export type JobStage = (typeof JOB_STAGES)[number]

export function isJobStage(value: unknown): value is JobStage {
  return typeof value === 'string' && (JOB_STAGES as readonly string[]).includes(value)
}

/** The job row as the **API** presents it.
 *
 *  `RowOf<'jobs'>` is inferred from the design fixtures, which predate the
 *  database and carry neither `stage` nor `assignedTechId` nor the entity
 *  metadata. Both shapes reach a screen — fixtures with `VITE_API_URL` unset,
 *  API rows with it set — so the extra columns are optional here rather than
 *  required. A screen must degrade honestly when they are absent instead of
 *  rendering `undefined`.
 */
export type JobRow = RowOf<'jobs'> & {
  stage?: string
  assignedTechId?: string | null
  _id?: string
  _version?: number
  _createdAt?: string
  _updatedAt?: string
}

/** Where each stage sits on the six-step rail the design draws.
 *
 *  Eight stages, six steps: `invoiced` and `closed` are both past delivery, and
 *  the rail has nowhere further to go — it stays full rather than inventing a
 *  seventh dot the design does not have. */
const RAIL_POSITION: Readonly<Record<JobStage, number>> = {
  checkin: 0,
  inspection: 1,
  estimate: 2,
  repair: 3,
  qc: 4,
  delivery: 5,
  invoiced: 5,
  closed: 5,
}

/** The stepper label for a stage, or Check-In for a row that carries no stage
 *  at all — which is every fixture row, and is the honest reading: a job card
 *  that has not recorded a stage has not moved past the one it opens in. */
export function railLabelFor(stage: string | undefined): string {
  const index = isJobStage(stage) ? RAIL_POSITION[stage] : 0
  return WORKSHOP_STAGES[index] ?? WORKSHOP_STAGES[0]
}

export function railIndexFor(stage: string | undefined): number {
  return isJobStage(stage) ? RAIL_POSITION[stage] : 0
}
