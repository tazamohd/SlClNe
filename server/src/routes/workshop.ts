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
import { requirePermission } from '../security/permissions'
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
    requirePermission(principal, 'jobcards', 'e')
    const parsed = jobTransitionBody.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid transition.', issue?.path.join('.'))
    }
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadJob(tx, id, { forUpdate: true })
      const failure = checkStageTransition(before.stage as JobStage, parsed.data.to)
      if (failure) throw ruleViolated(failure.message, failure.field)

      /* Passing QC is an approval action, and the technician who did the work
       * may not be the one who passes it. */
      if (parsed.data.to === 'delivery' && before.stage === 'qc') {
        requirePermission(principal, 'jobcards', 'a')
        const conflictFound = checkQcIndependence({
          actorUserId: principal.userId,
          performedByUserId: before.assignedTechId,
        })
        if (conflictFound) throw forbidden(conflictFound.message)
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
