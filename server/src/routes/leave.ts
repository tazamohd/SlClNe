/** Leave request decisions: approve or reject a submitted request.
 *
 *  The `leaveRequests` collection is writable through the generic router for
 *  submission (registry.ts / writers.ts). The decision — which is not a plain
 *  edit — lives here, modelled on the insurance-claim approval:
 *
 *   - approve — POST /leave-requests/:id/approve   submitted → approved
 *   - reject  — POST /leave-requests/:id/reject    submitted → rejected (with a reason)
 *
 *  Both are gated on `hr:a`, the approval grant the owner and the HR manager
 *  hold, and both are audited. The approver is recorded on the row for
 *  segregation of duties. A request that is already decided cannot be decided
 *  again.
 */
import { and, eq, isNull, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { leaveDecisionBody } from '@salis/contract'
import { writeAudit } from '../audit/audit'
import { leaveRequests } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { badRequest, conflict, notFound } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { collectionByKey } from '../registry'
import { requirePermission } from '../security/permissions'
import { presentRow, type RouteDeps } from './collections'

const LEAVE_MODULE = 'hr'

function def() {
  const found = collectionByKey('leaveRequests')
  if (!found) throw new Error('collection "leaveRequests" is not registered')
  return found
}

export function registerLeaveRoutes(app: FastifyInstance, deps: RouteDeps): void {
  app.post('/leave-requests/:id/approve', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, LEAVE_MODULE, 'a')
    const parsed = leaveDecisionBody.safeParse(request.body ?? {})
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid decision body.', issue?.path.join('.'))
    }
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadDecidable(tx, id)
      const [after] = await tx
        .update(leaveRequests)
        .set({
          status: 'approved',
          approverId: principal.userId,
          decidedAt: sql`now()`,
          reason: parsed.data.reason ?? before.reason ?? null,
          updatedBy: principal.userId,
        })
        .where(and(eq(leaveRequests.id, before.id), eq(leaveRequests.version, before.version)))
        .returning()
      if (!after) throw conflict('This leave request changed since you loaded it.')

      await writeAudit(tx, {
        actor: principal,
        action: 'approve',
        entity: 'leave_request',
        entityId: after.id,
        before: { status: before.status },
        after: { status: after.status },
        reason: parsed.data.reason ?? null,
        ...metaOf(request),
      })
      return presentRow(def(), principal, after as Record<string, unknown>)
    })
  })

  app.post('/leave-requests/:id/reject', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, LEAVE_MODULE, 'a')
    const { id } = request.params as { id: string }
    const reason = (request.body as { reason?: string } | undefined)?.reason
    if (!reason) throw badRequest('A rejection must say why.', 'reason')

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadDecidable(tx, id)
      const [after] = await tx
        .update(leaveRequests)
        .set({
          status: 'rejected',
          approverId: principal.userId,
          decidedAt: sql`now()`,
          reason,
          updatedBy: principal.userId,
        })
        .where(and(eq(leaveRequests.id, before.id), eq(leaveRequests.version, before.version)))
        .returning()
      if (!after) throw conflict('This leave request changed since you loaded it.')

      await writeAudit(tx, {
        actor: principal,
        action: 'reject',
        entity: 'leave_request',
        entityId: after.id,
        before: { status: before.status },
        after: { status: after.status },
        reason,
        ...metaOf(request),
      })
      return presentRow(def(), principal, after as Record<string, unknown>)
    })
  })
}

type LeaveRow = typeof leaveRequests.$inferSelect

/** Loads a request that may still be decided. A cross-tenant request is
 *  invisible under RLS and 404s; one already approved or rejected conflicts. */
async function loadDecidable(tx: Tx, ref: string): Promise<LeaveRow> {
  const [row] = await tx
    .select()
    .from(leaveRequests)
    .where(and(eq(leaveRequests.id, ref), isNull(leaveRequests.deletedAt)))
    .limit(1)
    .for('update')
  if (!row) throw notFound('Leave request')
  if (row.status === 'approved') throw conflict('This leave request is already approved.')
  if (row.status === 'rejected') throw conflict('This leave request is already rejected.')
  return row
}
