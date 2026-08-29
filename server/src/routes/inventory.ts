/** Stock movements and reservations.
 *
 *  On-hand quantity changes only here, never by a client writing `stock`. Each
 *  movement locks the part row, re-reads the quantity, applies the invariant
 *  and writes a ledger row — so two technicians consuming the same last part
 *  cannot both succeed. The `Idempotency-Key` header is *mandatory* on
 *  movements (F-017): the body carries no natural dedupe key — no job-card
 *  line, no goods-received-note id — so an unkeyed retry would be a second
 *  receipt as far as the server could tell. Refusing the request outright
 *  beats a partial unique index on `(org_id, part_id, type, ref)`, which would
 *  wrongly refuse legitimate repeats (two partial receipts of one PO line) and
 *  protect nothing for the majority of movements that carry no ref at all.
 *
 *  A transfer writes two ledger rows in one transaction — the debit and the
 *  paired credit against the destination branch, sharing a `transferId` — so
 *  stock never leaves the organization's books (F-017). Both rows carry the
 *  *source* branch in `branch_id` (RLS lets a branch-scoped storekeeper write
 *  only into their own branch) and the destination in `to_branch_id`; the
 *  credit is the row whose delta is positive.
 */
import { and, eq, isNull, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { ulid } from 'ulid'
import {
  IDEMPOTENCY_HEADER,
  idempotencyKey as idempotencyKeySchema,
  movementCreate,
  reservationBody,
  type MovementCreate,
} from '@salis/contract'
import {
  checkMovement,
  checkReservation,
  checkReservationRelease,
  movementDelta,
} from '@salis/contract/rules'
import { writeAudit } from '../audit/audit'
import { branches, inventoryMovements, parts } from '../db/schema'
import { withTenant, type Principal, type Tx } from '../db/tenant'
import { badRequest, notFound, ruleViolated } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { findReplay, hashBody, recordResult } from '../http/idempotency'
import { collectionByKey } from '../registry'
import { requirePermission } from '../security/permissions'
import { requireSodClear } from '../security/sod'
import { presentRow, type RouteDeps } from './collections'

function def() {
  const found = collectionByKey('parts')
  if (!found) throw new Error('collection "parts" is not registered')
  return found
}

/** The SOD activity a movement type evidences, if any. Only `out` and the two
 *  adjust types sit on a declared pair; a receipt, return or transfer is not
 *  an activity the SOD table names, and mapping it to "Adjust stock count" —
 *  as this route once did for everything that was not `out` — locked a
 *  storekeeper who had issued stock out of *receiving* stock into the same
 *  part, which no rule declares. */
function sodActivityOf(type: MovementCreate['type']): string | null {
  if (type === 'out') return 'Issue stock'
  if (type === 'adjust' || type === 'adjust_down') return 'Adjust stock count'
  return null
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

    /* Mandatory. See the file comment: no key means a retried receipt is a
     * double receipt. */
    const rawKey = request.headers[IDEMPOTENCY_HEADER]
    const parsedKey = idempotencyKeySchema.safeParse(typeof rawKey === 'string' ? rawKey : '')
    if (!parsedKey.success) {
      throw badRequest(
        'Stock movements require an Idempotency-Key header of 8–128 characters, so a retry cannot book the movement twice.',
      )
    }
    const key = parsedKey.data

    const outcome = await withTenant(deps.db, principal, async (tx) => {
      const endpoint = 'POST /inventory/:id/movement'
      const requestHash = hashBody({ id, body: request.body })
      const replay = await findReplay(tx, {
        orgId: principal.orgId,
        key,
        endpoint,
        requestHash,
      })
      if (replay) return replay

      /* SELECT … FOR UPDATE: the quantity we check is the quantity we write
       * against. Without the lock, two concurrent movements both read the old
       * on-hand and both pass a check that only one of them should. */
      const part = await lockPart(tx, id)

      /* "Issue stock" / "Adjust stock count" is the SOD pair the permission
       * matrix cannot express at all — both duties are `inventory:e`, so no
       * grant separates them. The audit log does: the movement type is on the
       * row, so the person who issued stock from this part cannot also be the
       * one who later adjusts its count to make the shortfall disappear. */
      const activity = sodActivityOf(input.type)
      if (activity) {
        await requireSodClear(deps.db, tx, principal, {
          activity,
          entity: 'part',
          entityId: part.id,
          ...metaOf(request),
        })
      }

      const failure = checkMovement({
        type: input.type,
        qty: input.qty,
        onHand: part.onHand,
        reserved: part.reserved,
        backorderable: part.backorderable,
        fromReservation: input.fromReservation,
      })
      if (failure) throw ruleViolated(failure.message, failure.field)

      const delta = movementDelta(input.type, input.qty)
      const isTransfer = input.type === 'transfer'

      if (isTransfer) {
        /* The destination must be a real branch of this organization — looked
         * up under the caller's RLS context, so another tenant's branch id is
         * simply invisible — and moving stock to where it already is would
         * book a pair of rows that mean nothing. */
        const [destination] = await tx
          .select({ id: branches.id })
          .from(branches)
          .where(and(eq(branches.id, input.toBranchId as string), isNull(branches.deletedAt)))
          .limit(1)
        if (!destination) {
          throw ruleViolated('That destination branch does not exist.', 'toBranchId')
        }
        if (destination.id === part.branchId) {
          throw ruleViolated('Stock is already at that branch.', 'toBranchId')
        }
      }

      /* A transfer relocates stock; it does not consume it. The debit and the
       * paired credit sum to zero, so the organization's on-hand is unchanged
       * and `TransferIn` stops being structurally zero. Consuming from a
       * reservation releases it as it goes. */
      const onHandDelta = isTransfer ? 0 : delta
      const reservedDelta = input.type === 'out' && input.fromReservation ? -input.qty : 0

      const [updated] = await tx
        .update(parts)
        .set({
          onHand: part.onHand + onHandDelta,
          reserved: part.reserved + reservedDelta,
          updatedBy: principal.userId,
        })
        .where(eq(parts.id, part.id))
        .returning()
      if (!updated) throw notFound('Part')

      const common = {
        orgId: principal.orgId,
        branchId: principal.branchId,
        partId: part.id,
        qty: input.qty,
        ref: input.ref ?? null,
        reason: input.reason ?? null,
        toBranchId: input.toBranchId ?? null,
        createdBy: principal.userId,
        updatedBy: principal.userId,
      }
      const transferId = isTransfer ? ulid() : null
      await tx.insert(inventoryMovements).values({
        id: ulid(),
        ...common,
        type: input.type,
        delta,
        transferId,
      })
      if (isTransfer) {
        await tx.insert(inventoryMovements).values({
          id: ulid(),
          ...common,
          type: 'transfer',
          delta: input.qty,
          transferId,
        })
      }

      await writeAudit(tx, {
        actor: principal,
        action: 'movement',
        entity: 'part',
        entityId: part.id,
        before: { onHand: part.onHand, reserved: part.reserved },
        after: {
          onHand: updated.onHand,
          reserved: updated.reserved,
          type: input.type,
          qty: input.qty,
          ...(transferId ? { transferId, toBranchId: input.toBranchId } : {}),
        },
        reason: input.reason ?? null,
        ...metaOf(request),
      })

      const body = presentRow(def(), principal, updated as Record<string, unknown>)
      await recordResult(tx, {
        orgId: principal.orgId,
        key,
        endpoint,
        requestHash,
        status: 200,
        body,
      })
      return { status: 200, body }
    })

    reply.code(outcome.status)
    return outcome.body
  })

  /* Reservations: the writes that make `parts.reserved` real (F-017). The
   * quantity is held under the same row lock the movements take, and the
   * already-written `checkReservation` rule finally has a caller. */
  app.post('/inventory/:id/reservation', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'inventory', 'e')
    const parsed = reservationBody.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid reservation.', issue?.path.join('.'))
    }
    const input = parsed.data
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const part = await lockPart(tx, id)
      const failure = checkReservation({
        qty: input.qty,
        onHand: part.onHand,
        reserved: part.reserved,
      })
      if (failure) throw ruleViolated(failure.message, failure.field)
      return applyReservation(tx, principal, request, part, input, part.reserved + input.qty, 'reserve')
    })
  })

  app.delete('/inventory/:id/reservation', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'inventory', 'e')
    const parsed = reservationBody.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid release.', issue?.path.join('.'))
    }
    const input = parsed.data
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const part = await lockPart(tx, id)
      const failure = checkReservationRelease({ qty: input.qty, reserved: part.reserved })
      if (failure) throw ruleViolated(failure.message, failure.field)
      return applyReservation(tx, principal, request, part, input, part.reserved - input.qty, 'release')
    })
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
        .orderBy(inventoryMovements.createdAt, inventoryMovements.id)
      return { rows }
    })
  })
}

type PartRow = typeof parts.$inferSelect

async function lockPart(tx: Tx, ref: string): Promise<PartRow> {
  const [row] = await tx
    .select()
    .from(parts)
    .where(and(isNull(parts.deletedAt), sql`(${parts.id} = ${ref} or ${parts.sku} = ${ref})`))
    .limit(1)
    .for('update')
  if (!row) throw notFound('Part')
  return row
}

async function loadPart(tx: Tx, ref: string): Promise<PartRow> {
  const [row] = await tx
    .select()
    .from(parts)
    .where(and(isNull(parts.deletedAt), sql`(${parts.id} = ${ref} or ${parts.sku} = ${ref})`))
    .limit(1)
  if (!row) throw notFound('Part')
  return row
}

async function applyReservation(
  tx: Tx,
  principal: Principal,
  request: Parameters<typeof metaOf>[0],
  part: PartRow,
  input: { qty: number; ref?: string; reason?: string },
  nextReserved: number,
  action: 'reserve' | 'release',
) {
  const [updated] = await tx
    .update(parts)
    .set({ reserved: nextReserved, updatedBy: principal.userId })
    .where(eq(parts.id, part.id))
    .returning()
  if (!updated) throw notFound('Part')

  await writeAudit(tx, {
    actor: principal,
    action,
    entity: 'part',
    entityId: part.id,
    before: { reserved: part.reserved },
    after: { reserved: updated.reserved, qty: input.qty, ref: input.ref ?? null },
    reason: input.reason ?? null,
    ...metaOf(request),
  })
  return presentRow(def(), principal, updated as Record<string, unknown>)
}
