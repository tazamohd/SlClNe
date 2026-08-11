/** Stock movements.
 *
 *  On-hand quantity changes only here, never by a client writing `stock`. Each
 *  movement locks the part row, re-reads the quantity, applies the invariant
 *  and writes a ledger row — so two technicians consuming the same last part
 *  cannot both succeed. An `Idempotency-Key` makes a retried receipt safe.
 */
import { and, eq, isNull, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { ulid } from 'ulid'
import {
  IDEMPOTENCY_HEADER,
  idempotencyKey as idempotencyKeySchema,
  movementCreate,
} from '@salis/contract'
import { checkMovement, movementDelta } from '@salis/contract/rules'
import { writeAudit } from '../audit/audit'
import { inventoryMovements, parts } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { badRequest, notFound, ruleViolated } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { findReplay, hashBody, recordResult } from '../http/idempotency'
import { collectionByKey } from '../registry'
import { requirePermission } from '../security/permissions'
import { presentRow, type RouteDeps } from './collections'

function def() {
  const found = collectionByKey('parts')
  if (!found) throw new Error('collection "parts" is not registered')
  return found
}

export function registerInventoryRoutes(app: FastifyInstance, deps: RouteDeps): void {
  app.post('/inventory/:id/movement', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'inventory', 'e')
    const parsed = movementCreate.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid movement.', issue?.path.join('.'))
    }
    const input = parsed.data
    const { id } = request.params as { id: string }

    const outcome = await withTenant(deps.db, principal, async (tx) => {
      const rawKey = request.headers[IDEMPOTENCY_HEADER]
      const key = typeof rawKey === 'string' ? rawKey : undefined
      const endpoint = 'POST /inventory/:id/movement'
      const requestHash = hashBody({ id, body: request.body })

      if (key) {
        const parsedKey = idempotencyKeySchema.safeParse(key)
        if (!parsedKey.success) throw badRequest('Idempotency-Key must be 8–128 characters.')
        const replay = await findReplay(tx, {
          orgId: principal.orgId,
          key: parsedKey.data,
          endpoint,
          requestHash,
        })
        if (replay) return replay
      }

      /* SELECT … FOR UPDATE: the quantity we check is the quantity we write
       * against. Without the lock, two concurrent movements both read the old
       * on-hand and both pass a check that only one of them should. */
      const [part] = await tx
        .select()
        .from(parts)
        .where(and(isNull(parts.deletedAt), sql`(${parts.id} = ${id} or ${parts.sku} = ${id})`))
        .limit(1)
        .for('update')
      if (!part) throw notFound('Part')

      const failure = checkMovement({
        type: input.type,
        qty: input.qty,
        onHand: part.onHand,
        reserved: part.reserved,
        backorderable: part.backorderable,
      })
      if (failure) throw ruleViolated(failure.message, failure.field)

      const delta = movementDelta(input.type, input.qty)
      const [updated] = await tx
        .update(parts)
        .set({ onHand: part.onHand + delta, updatedBy: principal.userId })
        .where(eq(parts.id, part.id))
        .returning()
      if (!updated) throw notFound('Part')

      await tx.insert(inventoryMovements).values({
        id: ulid(),
        orgId: principal.orgId,
        branchId: principal.branchId,
        partId: part.id,
        type: input.type,
        qty: input.qty,
        delta,
        ref: input.ref ?? null,
        reason: input.reason ?? null,
        toBranchId: input.toBranchId ?? null,
        createdBy: principal.userId,
        updatedBy: principal.userId,
      })

      await writeAudit(tx, {
        actor: principal,
        action: 'movement',
        entity: 'part',
        entityId: part.id,
        before: { onHand: part.onHand },
        after: { onHand: updated.onHand, type: input.type, qty: input.qty },
        reason: input.reason ?? null,
        ...metaOf(request),
      })

      const body = presentRow(def(), principal, updated as Record<string, unknown>)
      if (key) {
        await recordResult(tx, {
          orgId: principal.orgId,
          key,
          endpoint,
          requestHash,
          status: 200,
          body,
        })
      }
      return { status: 200, body }
    })

    reply.code(outcome.status)
    return outcome.body
  })

  app.get('/inventory/:id/movements', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'inventory', 'v')
    const { id } = request.params as { id: string }
    return withTenant(deps.db, principal, async (tx) => {
      const part = await loadPart(tx, id)
      const rows = await tx
        .select()
        .from(inventoryMovements)
        .where(eq(inventoryMovements.partId, part.id))
        .orderBy(inventoryMovements.createdAt)
      return { rows }
    })
  })
}

async function loadPart(tx: Tx, ref: string) {
  const [row] = await tx
    .select()
    .from(parts)
    .where(and(isNull(parts.deletedAt), sql`(${parts.id} = ${ref} or ${parts.sku} = ${ref})`))
    .limit(1)
  if (!row) throw notFound('Part')
  return row
}
