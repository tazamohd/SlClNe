/** Procurement: requisitions, purchase orders and receiving (F-022).
 *
 *  The golden path is requisition → purchase order → receiving, and the money
 *  and stock invariants are enforced here rather than in a screen:
 *
 *   - A requisition is raised (draft), submitted, then approved or rejected.
 *     Its estimated total is summed from the lines by the server.
 *   - A purchase order is raised (optionally from an approved requisition), its
 *     total summed subtotal + VAT from the lines. Approval checks the same
 *     three things the estimate does, in order: the permission, the SAR ceiling
 *     for the role against the PO total, and segregation of duties — the raiser
 *     may not approve (`requireDifferentApprover`, SOD "Raise purchase order" /
 *     "Approve purchase order").
 *   - Receiving books quantities against the order's lines under the invariant
 *     `received ≤ ordered` (§5b). An over-receipt is refused unless it is
 *     explicitly approved by a caller who holds procurement approval authority —
 *     never accepted silently. Receiving is idempotent (`Idempotency-Key`, like
 *     inventory movements), because a retried receipt would otherwise book the
 *     quantity twice.
 *
 *  Receiving updates the purchase-order status and the running `received_qty`;
 *  it does **not** move stock. Linking a receipt to an inventory movement is a
 *  later integration (see the report): the PO line's part reference is optional
 *  free text that need not resolve to a `parts` row, and the movement endpoint
 *  carries its own mandatory idempotency, part lock and SOD checks. Booking
 *  stock for the lines that happen to resolve and silently skipping the rest
 *  would be the half-wired, dishonest behaviour §5b forbids, so the received
 *  quantity is the authoritative ledger until that integration lands.
 *
 *  Gated on `procurement`. Money is integer halalas; no total is client-sent.
 */
import { and, eq, isNull, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { ulid } from 'ulid'
import {
  IDEMPOTENCY_HEADER,
  idempotencyKey as idempotencyKeySchema,
  purchaseOrderApproveBody,
  purchaseOrderCreate,
  purchaseOrderReceiveBody,
  purchaseOrderUpdate,
  requisitionApproveBody,
  requisitionCreate,
  requisitionUpdate,
} from '@salis/contract'
import {
  checkPurchaseOrderApprovable,
  checkReceive,
  purchaseOrderTotals,
  requisitionEstimatedTotalHalalas,
} from '@salis/contract/rules'
import { writeAudit } from '../audit/audit'
import {
  purchaseOrderLines,
  purchaseOrders,
  requisitionLines,
  requisitions,
  suppliers,
} from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { badRequest, conflict, notFound, ruleViolated } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { findReplay, hashBody, recordResult } from '../http/idempotency'
import { collectionByKey } from '../registry'
import {
  hasPermission,
  requireApproval,
  requireDifferentApprover,
  requirePermission,
} from '../security/permissions'
import { presentRow, type RouteDeps } from './collections'

const MODULE = 'procurement'

function reqDef() {
  const found = collectionByKey('requisitions')
  if (!found) throw new Error('collection "requisitions" is not registered')
  return found
}

function poDef() {
  const found = collectionByKey('purchaseOrders')
  if (!found) throw new Error('collection "purchaseOrders" is not registered')
  return found
}

export function registerProcurementRoutes(app: FastifyInstance, deps: RouteDeps): void {
  /* ═══════════════════════════════════════════════════════════ requisitions */

  app.post('/procurement/requisitions', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, MODULE, 'c')
    const parsed = requisitionCreate.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid requisition.', issue?.path.join('.'))
    }
    const input = parsed.data

    const created = await withTenant(deps.db, principal, async (tx) => {
      const estimatedTotalHalalas = requisitionEstimatedTotalHalalas(input.lines)
      const id = ulid()
      const [row] = await tx
        .insert(requisitions)
        .values({
          id,
          orgId: principal.orgId,
          branchId: principal.branchId,
          code: await nextCode(tx, requisitions, 'REQ'),
          requesterName: input.requesterName,
          department: input.department ?? null,
          priority: input.priority ?? 'normal',
          status: 'draft',
          neededBy: input.neededBy ?? null,
          estimatedTotalHalalas,
          notes: input.notes ?? null,
          submittedBy: principal.userId,
          createdBy: principal.userId,
          updatedBy: principal.userId,
        })
        .returning()
      if (!row) throw notFound('Requisition')

      await insertRequisitionLines(tx, principal, id, input.lines)
      await writeAudit(tx, {
        actor: principal,
        action: 'create',
        entity: 'requisition',
        entityId: id,
        after: row,
        ...metaOf(request),
      })
      return presentRow(reqDef(), principal, row as Record<string, unknown>)
    })

    reply.code(201)
    return created
  })

  app.patch('/procurement/requisitions/:id', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, MODULE, 'e')
    const parsed = requisitionUpdate.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid requisition.', issue?.path.join('.'))
    }
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadRequisition(tx, id)
      if (before.status !== 'draft') {
        throw conflict('Only a draft requisition can be edited.')
      }

      const patch: Record<string, unknown> = { updatedBy: principal.userId }
      if (parsed.data.requesterName) patch.requesterName = parsed.data.requesterName
      if (parsed.data.department !== undefined) patch.department = parsed.data.department
      if (parsed.data.priority) patch.priority = parsed.data.priority
      if (parsed.data.neededBy !== undefined) patch.neededBy = parsed.data.neededBy
      if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes
      if (parsed.data.lines) {
        patch.estimatedTotalHalalas = requisitionEstimatedTotalHalalas(parsed.data.lines)
        await tx.delete(requisitionLines).where(eq(requisitionLines.requisitionId, before.id))
        await insertRequisitionLines(tx, principal, before.id, parsed.data.lines)
      }

      const after = await updateRow(tx, requisitions, before, patch)
      await writeAudit(tx, {
        actor: principal,
        action: 'update',
        entity: 'requisition',
        entityId: after.id,
        before,
        after,
        ...metaOf(request),
      })
      return presentRow(reqDef(), principal, after as Record<string, unknown>)
    })
  })

  app.post('/procurement/requisitions/:id/submit', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, MODULE, 'e')
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadRequisition(tx, id, { forUpdate: true })
      if (before.status !== 'draft') {
        throw conflict('Only a draft requisition can be submitted.')
      }
      const after = await updateRow(tx, requisitions, before, {
        status: 'submitted',
        submittedBy: principal.userId,
        updatedBy: principal.userId,
      })
      await writeAudit(tx, {
        actor: principal,
        action: 'transition',
        entity: 'requisition',
        entityId: after.id,
        before: { status: before.status },
        after: { status: after.status },
        ...metaOf(request),
      })
      return presentRow(reqDef(), principal, after as Record<string, unknown>)
    })
  })

  app.post('/procurement/requisitions/:id/approve', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, MODULE, 'a')
    const parsed = requisitionApproveBody.safeParse(request.body ?? {})
    if (!parsed.success) throw badRequest('Invalid approval body.')
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadRequisition(tx, id, { forUpdate: true })
      if (before.status === 'approved') throw conflict('This requisition is already approved.')
      if (before.status === 'rejected') throw conflict('This requisition was rejected.')
      if (before.status !== 'submitted') {
        throw conflict('A requisition must be submitted before it can be approved.')
      }

      /* Ceiling first (against the estimated total), then segregation of duties —
       * the same order as the estimate approval. */
      requireApproval(principal, before.estimatedTotalHalalas, MODULE)
      requireDifferentApprover(principal, before.submittedBy)

      const after = await updateRow(tx, requisitions, before, {
        status: 'approved',
        approvedBy: principal.userId,
        approvedAt: sql`now()`,
        updatedBy: principal.userId,
      })
      await writeAudit(tx, {
        actor: principal,
        action: 'approve',
        entity: 'requisition',
        entityId: after.id,
        before: { status: before.status, estimatedTotalHalalas: before.estimatedTotalHalalas },
        after: { status: after.status, approvedBy: after.approvedBy },
        reason: parsed.data.reason ?? null,
        ...metaOf(request),
      })
      return presentRow(reqDef(), principal, after as Record<string, unknown>)
    })
  })

  app.post('/procurement/requisitions/:id/reject', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, MODULE, 'a')
    const { id } = request.params as { id: string }
    const reason = (request.body as { reason?: string } | undefined)?.reason
    if (!reason) throw badRequest('A rejection must say why.', 'reason')

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadRequisition(tx, id, { forUpdate: true })
      if (before.status === 'approved') throw conflict('An approved requisition cannot be rejected.')
      if (before.status === 'ordered') throw conflict('An ordered requisition cannot be rejected.')
      const after = await updateRow(tx, requisitions, before, {
        status: 'rejected',
        updatedBy: principal.userId,
      })
      await writeAudit(tx, {
        actor: principal,
        action: 'reject',
        entity: 'requisition',
        entityId: after.id,
        before: { status: before.status },
        after: { status: after.status },
        reason,
        ...metaOf(request),
      })
      return presentRow(reqDef(), principal, after as Record<string, unknown>)
    })
  })

  app.get('/procurement/requisitions/:id/lines', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, MODULE, 'v')
    const { id } = request.params as { id: string }
    return withTenant(deps.db, principal, async (tx) => {
      const requisition = await loadRequisition(tx, id)
      const rows = await tx
        .select()
        .from(requisitionLines)
        .where(and(eq(requisitionLines.requisitionId, requisition.id), isNull(requisitionLines.deletedAt)))
        .orderBy(requisitionLines.sort)
      return { rows }
    })
  })

  /* ═══════════════════════════════════════════════════════ purchase orders */

  app.post('/procurement/purchase-orders', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, MODULE, 'c')
    const parsed = purchaseOrderCreate.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid purchase order.', issue?.path.join('.'))
    }
    const input = parsed.data

    const created = await withTenant(deps.db, principal, async (tx) => {
      /* A named supplier row must exist in the caller's tenant — RLS makes
       * another tenant's supplier invisible, so this 404s rather than leaks. */
      let supplierName = input.supplierName ?? null
      if (input.supplierId) {
        const supplier = await loadSupplier(tx, input.supplierId)
        supplierName = supplierName ?? supplier.name
      }
      if (!supplierName) throw badRequest('A purchase order needs a supplier.', 'supplierName')

      /* Raising from a requisition: it must be approved and in this tenant, and
       * it is marked ordered so it cannot be raised twice. */
      let requisitionId: string | null = null
      if (input.requisitionId) {
        const requisition = await loadRequisition(tx, input.requisitionId, { forUpdate: true })
        if (requisition.status !== 'approved') {
          throw ruleViolated(
            'A purchase order can only be raised from an approved requisition.',
            'requisitionId',
          )
        }
        requisitionId = requisition.id
      }

      const totals = purchaseOrderTotals(input.lines)
      const id = ulid()
      const [row] = await tx
        .insert(purchaseOrders)
        .values({
          id,
          orgId: principal.orgId,
          branchId: principal.branchId,
          code: await nextCode(tx, purchaseOrders, 'PO'),
          supplierId: input.supplierId ?? null,
          supplierName,
          requisitionId,
          status: 'draft',
          subtotalHalalas: totals.subtotalHalalas,
          taxHalalas: totals.taxHalalas,
          totalHalalas: totals.totalHalalas,
          notes: input.notes ?? null,
          orderedAt: input.place ? sql`now()` : null,
          expectedAt: input.expectedDate ? new Date(`${input.expectedDate}T00:00:00Z`) : null,
          submittedBy: principal.userId,
          createdBy: principal.userId,
          updatedBy: principal.userId,
        })
        .returning()
      if (!row) throw notFound('Purchase order')

      await insertPurchaseOrderLines(tx, principal, id, input.lines)

      if (requisitionId) {
        const requisition = await loadRequisition(tx, requisitionId, { forUpdate: true })
        await updateRow(tx, requisitions, requisition, {
          status: 'ordered',
          updatedBy: principal.userId,
        })
      }

      await writeAudit(tx, {
        actor: principal,
        action: 'create',
        entity: 'purchase_order',
        entityId: id,
        after: row,
        ...metaOf(request),
      })
      return presentRow(poDef(), principal, row as Record<string, unknown>)
    })

    reply.code(201)
    return created
  })

  app.patch('/procurement/purchase-orders/:id', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, MODULE, 'e')
    const parsed = purchaseOrderUpdate.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid purchase order.', issue?.path.join('.'))
    }
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadPurchaseOrder(tx, id)
      if (before.status !== 'draft') {
        throw conflict('Only a draft purchase order can be edited.')
      }

      const patch: Record<string, unknown> = { updatedBy: principal.userId }
      if (parsed.data.supplierId) {
        const supplier = await loadSupplier(tx, parsed.data.supplierId)
        patch.supplierId = supplier.id
        patch.supplierName = parsed.data.supplierName ?? supplier.name
      } else if (parsed.data.supplierName) {
        patch.supplierName = parsed.data.supplierName
      }
      if (parsed.data.expectedDate !== undefined) {
        patch.expectedAt = parsed.data.expectedDate
          ? new Date(`${parsed.data.expectedDate}T00:00:00Z`)
          : null
      }
      if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes
      if (parsed.data.lines) {
        const totals = purchaseOrderTotals(parsed.data.lines)
        patch.subtotalHalalas = totals.subtotalHalalas
        patch.taxHalalas = totals.taxHalalas
        patch.totalHalalas = totals.totalHalalas
        await tx.delete(purchaseOrderLines).where(eq(purchaseOrderLines.purchaseOrderId, before.id))
        await insertPurchaseOrderLines(tx, principal, before.id, parsed.data.lines)
      }

      const after = await updateRow(tx, purchaseOrders, before, patch)
      await writeAudit(tx, {
        actor: principal,
        action: 'update',
        entity: 'purchase_order',
        entityId: after.id,
        before,
        after,
        ...metaOf(request),
      })
      return presentRow(poDef(), principal, after as Record<string, unknown>)
    })
  })

  app.post('/procurement/purchase-orders/:id/approve', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, MODULE, 'a')
    const parsed = purchaseOrderApproveBody.safeParse(request.body ?? {})
    if (!parsed.success) throw badRequest('Invalid approval body.')
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadPurchaseOrder(tx, id, { forUpdate: true })
      const notApprovable = checkPurchaseOrderApprovable(before.status)
      if (notApprovable) throw conflict(notApprovable.message)

      /* The invariant: a purchase order cannot exceed the approver's ceiling.
       * Ceiling first (against the server-computed total), then segregation of
       * duties — the raiser may not approve. */
      requireApproval(principal, before.totalHalalas, MODULE)
      requireDifferentApprover(principal, before.submittedBy)

      const after = await updateRow(tx, purchaseOrders, before, {
        status: 'approved',
        approvedBy: principal.userId,
        approvedAt: sql`now()`,
        updatedBy: principal.userId,
      })
      await writeAudit(tx, {
        actor: principal,
        action: 'approve',
        entity: 'purchase_order',
        entityId: after.id,
        before: { status: before.status, totalHalalas: before.totalHalalas },
        after: { status: after.status, approvedBy: after.approvedBy },
        reason: parsed.data.reason ?? null,
        ...metaOf(request),
      })
      return presentRow(poDef(), principal, after as Record<string, unknown>)
    })
  })

  app.post('/procurement/purchase-orders/:id/receive', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, MODULE, 'e')
    const parsed = purchaseOrderReceiveBody.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid receipt.', issue?.path.join('.'))
    }
    const input = parsed.data
    const { id } = request.params as { id: string }

    /* Mandatory idempotency, like inventory movements: a receipt carries no
     * natural dedupe key, so a retry without one would book the quantity twice. */
    const rawKey = request.headers[IDEMPOTENCY_HEADER]
    const parsedKey = idempotencyKeySchema.safeParse(typeof rawKey === 'string' ? rawKey : '')
    if (!parsedKey.success) {
      throw badRequest(
        'Receiving requires an Idempotency-Key header of 8–128 characters, so a retry cannot book the receipt twice.',
      )
    }
    const key = parsedKey.data

    const outcome = await withTenant(deps.db, principal, async (tx) => {
      const endpoint = 'POST /procurement/purchase-orders/:id/receive'
      const requestHash = hashBody({ id, body: request.body })
      const replay = await findReplay(tx, { orgId: principal.orgId, key, endpoint, requestHash })
      if (replay) return replay

      const order = await loadPurchaseOrder(tx, id, { forUpdate: true })
      if (!['approved', 'sent', 'receiving'].includes(order.status)) {
        throw ruleViolated(
          `A ${order.status} purchase order cannot receive stock. Approve it first.`,
        )
      }

      /* An over-receipt is only allowed when it is explicitly approved AND the
       * caller holds procurement approval authority — never silent (§5b). */
      if (input.overReceiptApproved && !hasPermission(principal, MODULE, 'a')) {
        throw ruleViolated(
          'An over-receipt must be approved by someone who can approve on procurement.',
        )
      }

      /* Lock every line under one SELECT … FOR UPDATE, so the received quantity
       * checked is the quantity written against — two concurrent receipts of the
       * same last unit cannot both pass. */
      const lines = await tx
        .select()
        .from(purchaseOrderLines)
        .where(
          and(
            eq(purchaseOrderLines.purchaseOrderId, order.id),
            isNull(purchaseOrderLines.deletedAt),
          ),
        )
        .orderBy(purchaseOrderLines.sort)
        .for('update')
      const byId = new Map(lines.map((line) => [line.id, line]))

      for (const receipt of input.lines) {
        const line = byId.get(receipt.lineId)
        if (!line) throw badRequest('That line is not on this purchase order.', 'lineId')
        const outcome = checkReceive({
          orderedQty: line.qty,
          receivedQty: line.receivedQty,
          incomingQty: receipt.qty,
        })
        if (outcome.kind === 'invalid') throw ruleViolated(outcome.message, 'qty')
        if (outcome.kind === 'over' && !input.overReceiptApproved) {
          throw ruleViolated(outcome.message, 'qty')
        }
        await tx
          .update(purchaseOrderLines)
          .set({ receivedQty: line.receivedQty + receipt.qty, updatedBy: principal.userId })
          .where(eq(purchaseOrderLines.id, line.id))
      }

      /* The order's status follows the lines: fully received when every line has
       * met (or, with approval, exceeded) its ordered quantity, otherwise
       * receiving. Re-read under the same lock. */
      const after = await tx
        .select()
        .from(purchaseOrderLines)
        .where(
          and(
            eq(purchaseOrderLines.purchaseOrderId, order.id),
            isNull(purchaseOrderLines.deletedAt),
          ),
        )
      const complete = after.every((line) => line.receivedQty >= line.qty)
      const updated = await updateRow(tx, purchaseOrders, order, {
        status: complete ? 'received' : 'receiving',
        updatedBy: principal.userId,
      })

      await writeAudit(tx, {
        actor: principal,
        action: 'receive',
        entity: 'purchase_order',
        entityId: order.id,
        before: { status: order.status },
        after: {
          status: updated.status,
          received: input.lines.map((line: (typeof input.lines)[number]) => ({ lineId: line.lineId, qty: line.qty })),
          overReceiptApproved: input.overReceiptApproved ?? false,
        },
        reason: input.reason ?? null,
        ...metaOf(request),
      })

      const body = presentRow(poDef(), principal, updated as Record<string, unknown>)
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

  app.get('/procurement/purchase-orders/:id/lines', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, MODULE, 'v')
    const { id } = request.params as { id: string }
    return withTenant(deps.db, principal, async (tx) => {
      const order = await loadPurchaseOrder(tx, id)
      const rows = await tx
        .select()
        .from(purchaseOrderLines)
        .where(
          and(eq(purchaseOrderLines.purchaseOrderId, order.id), isNull(purchaseOrderLines.deletedAt)),
        )
        .orderBy(purchaseOrderLines.sort)
      return {
        rows: rows.map((line) => ({
          _id: line.id,
          partSku: line.partSku,
          description: line.description,
          descriptionAr: line.descriptionAr,
          qty: line.qty,
          receivedQty: line.receivedQty,
          unitPriceHalalas: line.unitPriceHalalas,
          lineTotalHalalas: line.qty * line.unitPriceHalalas,
          sort: line.sort,
        })),
      }
    })
  })
}

/* --------------------------------------------------------------- helpers */

type RequisitionRow = typeof requisitions.$inferSelect
type PurchaseOrderRow = typeof purchaseOrders.$inferSelect
type SupplierRow = typeof suppliers.$inferSelect

async function insertRequisitionLines(
  tx: Tx,
  principal: { orgId: string; branchId: string | null; userId: string },
  requisitionId: string,
  lines: readonly {
    partSku?: string
    description: string
    descriptionAr?: string
    qty: number
    estUnitPriceHalalas: number
  }[],
): Promise<void> {
  await tx.insert(requisitionLines).values(
    lines.map((line, index) => ({
      id: ulid(),
      orgId: principal.orgId,
      branchId: principal.branchId,
      requisitionId,
      partSku: line.partSku ?? null,
      description: line.description,
      descriptionAr: line.descriptionAr ?? null,
      qty: line.qty,
      estUnitPriceHalalas: line.estUnitPriceHalalas,
      sort: index,
      createdBy: principal.userId,
      updatedBy: principal.userId,
    })),
  )
}

async function insertPurchaseOrderLines(
  tx: Tx,
  principal: { orgId: string; branchId: string | null; userId: string },
  purchaseOrderId: string,
  lines: readonly {
    partSku?: string
    description: string
    descriptionAr?: string
    qty: number
    unitPriceHalalas: number
  }[],
): Promise<void> {
  await tx.insert(purchaseOrderLines).values(
    lines.map((line, index) => ({
      id: ulid(),
      orgId: principal.orgId,
      branchId: principal.branchId,
      purchaseOrderId,
      partSku: line.partSku ?? null,
      description: line.description,
      descriptionAr: line.descriptionAr ?? null,
      qty: line.qty,
      receivedQty: 0,
      unitPriceHalalas: line.unitPriceHalalas,
      sort: index,
      createdBy: principal.userId,
      updatedBy: principal.userId,
    })),
  )
}

async function loadRequisition(
  tx: Tx,
  ref: string,
  options: { forUpdate?: boolean } = {},
): Promise<RequisitionRow> {
  const base = tx
    .select()
    .from(requisitions)
    .where(
      and(
        isNull(requisitions.deletedAt),
        sql`(${requisitions.id} = ${ref} or ${requisitions.code} = ${ref})`,
      ),
    )
    .limit(1)
  const rows = options.forUpdate ? await base.for('update') : await base
  const row = rows[0]
  if (!row) throw notFound('Requisition')
  return row
}

async function loadPurchaseOrder(
  tx: Tx,
  ref: string,
  options: { forUpdate?: boolean } = {},
): Promise<PurchaseOrderRow> {
  const base = tx
    .select()
    .from(purchaseOrders)
    .where(
      and(
        isNull(purchaseOrders.deletedAt),
        sql`(${purchaseOrders.id} = ${ref} or ${purchaseOrders.code} = ${ref})`,
      ),
    )
    .limit(1)
  const rows = options.forUpdate ? await base.for('update') : await base
  const row = rows[0]
  if (!row) throw notFound('Purchase order')
  return row
}

async function loadSupplier(tx: Tx, ref: string): Promise<SupplierRow> {
  const [row] = await tx
    .select()
    .from(suppliers)
    .where(and(isNull(suppliers.deletedAt), sql`(${suppliers.id} = ${ref} or ${suppliers.code} = ${ref})`))
    .limit(1)
  if (!row) throw notFound('Supplier')
  return row
}

/** An optimistic-concurrency update guarded on the row's version, audited by
 *  the caller. Returns the new row or throws a 409 if it changed underfoot.
 *  Only the three procurement tables are passed here, all of which carry `id`
 *  and `version`; the cast keeps the call sites clean without a generic that
 *  the driver's column types fight. */
async function updateRow<T extends { id: string; version: number }>(
  tx: Tx,
  table: typeof requisitions | typeof purchaseOrders,
  before: T,
  patch: Record<string, unknown>,
): Promise<T> {
  const [after] = await tx
    .update(table)
    .set(patch)
    .where(and(eq(table.id, before.id), eq(table.version, before.version)))
    .returning()
  if (!after) throw conflict('This record changed since you loaded it.')
  return after as unknown as T
}

/** The next `PREFIX-0001` within the tenant. Counted so two rows never collide
 *  on the unique `(org_id, code)` index. */
async function nextCode(
  tx: Tx,
  table: typeof requisitions | typeof purchaseOrders,
  prefix: string,
): Promise<string> {
  const [row] = await tx.select({ value: sql<number>`count(*)::int` }).from(table)
  return `${prefix}-${String((row?.value ?? 0) + 1).padStart(4, '0')}`
}
