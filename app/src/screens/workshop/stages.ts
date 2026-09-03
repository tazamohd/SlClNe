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

/** The rail position for a row of either shape.
 *
 *  An API row carries `stage`; a fixture row carries only the older `st`
 *  status, which says less but still says something — `in_progress` is a card
 *  under repair, `completed` is one waiting on its quality check. The Dashboard
 *  reads the same fallback, so a stage count there and a stage filter here
 *  agree on every row. */
export function railIndexForJob(job: Pick<JobRow, 'stage' | 'st'>): number {
  if (job.stage) return railIndexFor(job.stage)
  switch (job.st) {
    case 'in_progress':
      return 3
    case 'completed':
      return 4
    case 'delivered':
      return 5
    case 'pending':
    default:
      return 0
  }
}

/** The six rail steps by id — the ids the Dashboard's pipeline strip links
 *  to (`/job-cards?stage=<id>`), so the two screens speak one vocabulary. */
export const RAIL_STAGES: readonly { id: JobStage; label: string; icon: string }[] = [
  { id: 'checkin', label: 'Check-In', icon: 'Clock' },
  { id: 'inspection', label: 'Inspection', icon: 'Search' },
  { id: 'estimate', label: 'Estimate', icon: 'FileText' },
  { id: 'repair', label: 'Repair', icon: 'Wrench' },
  { id: 'qc', label: 'Quality Check', icon: 'ShieldCheck' },
  { id: 'delivery', label: 'Delivery', icon: 'Car' },
]

export function railStageIdFor(index: number): JobStage {
  return RAIL_STAGES[Math.max(0, Math.min(index, RAIL_STAGES.length - 1))].id
}

/** Human label for every API stage, including the two past the rail. */
export const STAGE_LABELS: Readonly<Record<JobStage, string>> = {
  checkin: 'Check-In',
  inspection: 'Inspection',
  estimate: 'Estimate',
  repair: 'Repair',
  qc: 'Quality Check',
  delivery: 'Delivery',
  invoiced: 'Invoiced',
  closed: 'Closed',
}

/** The screen where a card at each stage is worked. `repair` has no screen of
 *  its own: the hand-over out of repair happens on the QC screen. */
export const STAGE_ROUTES: Readonly<Record<JobStage, string | undefined>> = {
  checkin: '/workshop-check-in',
  inspection: '/workshop-inspection',
  estimate: '/workshop-estimate',
  repair: '/workshop-qc',
  qc: '/workshop-qc',
  delivery: '/workshop-delivery',
  invoiced: undefined,
  closed: undefined,
}

/** The forward move from a stage, or `null` at the end of the line. Mirrors
 *  `JOB_STAGE_TRANSITIONS`' happy path; the server still decides. */
export function nextStageOf(stage: string | undefined): JobStage | null {
  const current = isJobStage(stage) ? stage : 'checkin'
  const index = JOB_STAGES.indexOf(current)
  return index >= 0 && index < JOB_STAGES.length - 1 ? JOB_STAGES[index + 1] : null
}
