/** Fleet contract actions (F-027).
 *
 *  The fleet row itself is a plain writable collection; renewal is a distinct
 *  action because it means one specific thing — move the term forward, record
 *  the new value, and set the contract back to active — rather than an
 *  arbitrary patch of the same columns.
 */
import { and, eq, isNull } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { fleetRenewBody } from '@salis/contract'
import { writeAudit } from '../audit/audit'
import { fleets } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { badRequest, conflict, notFound } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { collectionByKey } from '../registry'
import { requirePermission } from '../security/permissions'
import { presentRow, type RouteDeps } from './collections'

function fleetDef() {
  const def = collectionByKey('fleets')
  if (!def) throw new Error('collection "fleets" is not registered')
  return def
}

export function registerFleetRoutes(app: FastifyInstance, deps: RouteDeps): void {
  app.post('/fleets/:id/renew', async (request, reply) => {
    const principal = principalOf(request)
    /* Fleets are gated on the customers module, like the collection. */
    requirePermission(principal, 'customers', 'e')

    const parsed = fleetRenewBody.safeParse(request.body ?? {})
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid renewal.', issue?.path.join('.'))
    }
    const { id } = request.params as { id: string }

    const updated = await withTenant(deps.db, principal, async (tx) => {
      const before = await loadFleet(tx, id)

      const patch: Record<string, unknown> = {
        contractStatus: 'active',
        contractEndDate: parsed.data.contractEndDate,
        updatedBy: principal.userId,
      }
      if (parsed.data.contractStartDate) patch.contractStartDate = parsed.data.contractStartDate
      if (parsed.data.renewalDate !== undefined) patch.renewalDate = parsed.data.renewalDate
      if (parsed.data.contractValueHalalas !== undefined) {
        patch.contractValueHalalas = parsed.data.contractValueHalalas
      }
      if (parsed.data.contractType) patch.contractType = parsed.data.contractType

      const [after] = await tx
        .update(fleets)
        .set(patch)
        .where(and(eq(fleets.id, before.id), eq(fleets.version, before.version)))
        .returning()
      if (!after) throw conflict('This fleet changed since you loaded it.')

      await writeAudit(tx, {
        actor: principal,
        action: 'update',
        entity: 'fleet',
        entityId: after.id,
        before: {
          contractStatus: before.contractStatus,
          contractEndDate: before.contractEndDate,
          contractValueHalalas: before.contractValueHalalas,
        },
        after: {
          contractStatus: after.contractStatus,
          contractEndDate: after.contractEndDate,
          contractValueHalalas: after.contractValueHalalas,
        },
        reason: 'contract renewed',
        ...metaOf(request),
      })
      return presentRow(fleetDef(), principal, after as Record<string, unknown>)
    })

    reply.code(200)
    return updated
  })
}

type FleetRow = typeof fleets.$inferSelect

async function loadFleet(tx: Tx, id: string): Promise<FleetRow> {
  const [row] = await tx
    .select()
    .from(fleets)
    .where(and(eq(fleets.id, id), isNull(fleets.deletedAt)))
    .limit(1)
  if (!row) throw notFound('Fleet')
  return row
}
