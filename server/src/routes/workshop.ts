/** Job-card lifecycle: stage transitions and assignment.
 *
 *  The stepper in the UI is a convenience. The state machine is here, so a
 *  direct API call cannot skip a gate that the screen would have blocked.
 */
import { and, eq, isNull, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { jobAssignBody, jobTransitionBody, type JobStage } from '@salis/contract'
import { checkQcIndependence, checkStageTransition } from '@salis/contract/rules'
import { writeAudit } from '../audit/audit'
import { jobCards, technicians } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { badRequest, conflict, forbidden, notFound, ruleViolated } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { collectionByKey } from '../registry'
import { hasPermission, requirePermission } from '../security/permissions'
import { requireSodClear } from '../security/sod'
import { presentRow, type RouteDeps } from './collections'

function def() {
  const found = collectionByKey('jobs')
  if (!found) throw new Error('collection "jobs" is not registered')
  return found
}

/** Stages that also move the board status the design shows. */
const STATUS_FOR_STAGE: Partial<Record<JobStage, string>> = {
  checkin: 'pending',
  inspection: 'in_progress',
  estimate: 'in_progress',
  repair: 'in_progress',
  qc: 'in_progress',
  delivery: 'completed',
  invoiced: 'completed',
  closed: 'delivered',
}

export function registerWorkshopRoutes(app: FastifyInstance, deps: RouteDeps): void {
  app.post('/jobs/:id/transition', async (request) => {
    const principal = principalOf(request)
    /* A caller with neither edit nor approve authority is refused before the
     * body is even read, so an outsider probing this route still sees the
     * plain 403 and learns nothing about the transition schema. */
    if (!hasPermission(principal, 'jobcards', 'e') && !hasPermission(principal, 'jobcards', 'a')) {
      requirePermission(principal, 'jobcards', 'e')
    }
    const parsed = jobTransitionBody.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid transition.', issue?.path.join('.'))
    }
    /* F-014: passing QC is an *approval*, not an edit. The matrix gives qc
     * `va` on jobcards — it passes quality, it releases no money (F-002) — so
     * the one transition that *is* the QC gate, qc → delivery, is gated on
     * `jobcards:a`. Every other transition moves the work itself and still
     * requires `jobcards:e`. The matrix was right; this route was wrong. */
    requirePermission(principal, 'jobcards', parsed.data.to === 'delivery' ? 'a' : 'e')
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadJob(tx, id, { forUpdate: true })
      const failure = checkStageTransition(before.stage as JobStage, parsed.data.to)
      if (failure) throw ruleViolated(failure.message, failure.field)

      /* Passing QC is an approval action, and the technician who did the work
       * may not be the one who passes it. Two checks, because they catch
       * different things:
       *
       *  - the record check: the actor is the technician currently assigned;
       *  - the trail check: the actor *performed* the repair, whoever is
       *    assigned now. That is the control the SOD table actually declares —
       *    four of its six pairs are held on both sides by one role, so no role
       *    check can express any of them (F-004). A manager who moved the job
       *    through repair and then signs off their own work passes the first
       *    check and fails the second. */
      if (parsed.data.to === 'delivery' && before.stage === 'qc') {
        requirePermission(principal, 'jobcards', 'a')
        /* F-015: `assigned_tech_id` holds a `technicians.id`, and the actor is
         * a *user* id — comparing the two could never match, so this check was
         * dead and only the audit-trail check below fired. The assignment is
         * resolved through `technicians.user_id` before the comparison. */
        const conflictFound = checkQcIndependence({
          actorUserId: principal.userId,
          performedByUserId: await assignedTechUserId(tx, before.assignedTechId),
        })
        if (conflictFound) throw forbidden(conflictFound.message)
        await requireSodClear(deps.db, tx, principal, {
          activity: 'Pass quality check',
          entity: 'job_card',
          entityId: before.id,
          ...metaOf(request),
        })
      }

      const [after] = await tx
        .update(jobCards)
        .set({
          stage: parsed.data.to,
          status: STATUS_FOR_STAGE[parsed.data.to] ?? before.status,
          qcPassedBy: parsed.data.to === 'delivery' ? principal.userId : before.qcPassedBy,
          updatedBy: principal.userId,
        })
        .where(and(eq(jobCards.id, before.id), eq(jobCards.version, before.version)))
        .returning()
      if (!after) throw conflict('This job changed since you loaded it.')

      await writeAudit(tx, {
        actor: principal,
        action: 'transition',
        entity: 'job_card',
        entityId: after.id,
        before: { stage: before.stage, status: before.status },
        after: { stage: after.stage, status: after.status },
        reason: parsed.data.reason ?? null,
        ...metaOf(request),
      })
      return presentRow(def(), principal, after as Record<string, unknown>)
    })
  })

  app.post('/jobs/:id/assign', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'jobcards', 'e')
    const parsed = jobAssignBody.safeParse(request.body)
    if (!parsed.success) throw badRequest('Expected { techId }.', 'techId')
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadJob(tx, id)
      /* The technician is looked up under the caller's own RLS context, so a
       * job cannot be assigned to someone in another organization by id. */
      const [tech] = await tx
        .select()
        .from(technicians)
        .where(and(eq(technicians.id, parsed.data.techId), isNull(technicians.deletedAt)))
        .limit(1)
      if (!tech) throw notFound('Technician')

      const [after] = await tx
        .update(jobCards)
        .set({ assignedTechId: tech.id, updatedBy: principal.userId })
        .where(and(eq(jobCards.id, before.id), eq(jobCards.version, before.version)))
        .returning()
      if (!after) throw conflict('This job changed since you loaded it.')

      await writeAudit(tx, {
        actor: principal,
        action: 'assign',
        entity: 'job_card',
        entityId: after.id,
        before: { assignedTechId: before.assignedTechId },
        after: { assignedTechId: after.assignedTechId },
        ...metaOf(request),
      })
      return presentRow(def(), principal, after as Record<string, unknown>)
    })
  })
}

type JobRow = typeof jobCards.$inferSelect

/** The user behind a technician assignment, or null when the job is
 *  unassigned or the technician row carries no user mapping. Looked up under
 *  the caller's RLS context, like everything else in this file. */
async function assignedTechUserId(tx: Tx, assignedTechId: string | null): Promise<string | null> {
  if (!assignedTechId) return null
  const [tech] = await tx
    .select({ userId: technicians.userId })
    .from(technicians)
    .where(and(eq(technicians.id, assignedTechId), isNull(technicians.deletedAt)))
    .limit(1)
  return tech?.userId ?? null
}

async function loadJob(
  tx: Tx,
  ref: string,
  options: { forUpdate?: boolean } = {},
): Promise<JobRow> {
  const base = tx
    .select()
    .from(jobCards)
    .where(and(isNull(jobCards.deletedAt), sql`(${jobCards.id} = ${ref} or ${jobCards.code} = ${ref})`))
    .limit(1)
  const rows = options.forUpdate ? await base.for('update') : await base
  const row = rows[0]
  if (!row) throw notFound('Job card')
  return row
}
