/** Estimates: created from lines, approved against a ceiling.
 *
 *  The total is summed from the lines by the server. Approval checks three
 *  things in order — the permission, the SAR ceiling for the role, and
 *  segregation of duties — and an estimate that is already approved is a 409
 *  rather than a second approval on the same record.
 */
import { and, eq, isNull, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { ulid } from 'ulid'
import { estimateApproveBody, estimateCreate, estimateUpdate } from '@salis/contract'
import { checkEstimateFresh, computeInvoiceTotals } from '@salis/contract/rules'
import { writeAudit } from '../audit/audit'
import { estimateLines, estimates } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { badRequest, conflict, notFound, ruleViolated } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { collectionByKey } from '../registry'
import {
  requireApproval,
  requireDifferentApprover,
  requirePermission,
} from '../security/permissions'
import { presentRow, type RouteDeps } from './collections'

function def() {
  const found = collectionByKey('estimates')
  if (!found) throw new Error('collection "estimates" is not registered')
  return found
}

export function registerEstimateRoutes(app: FastifyInstance, deps: RouteDeps): void {
  app.post('/estimates', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'estimates', 'c')
    const parsed = estimateCreate.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid estimate.', issue?.path.join('.'))
    }
    const input = parsed.data

    const created = await withTenant(deps.db, principal, async (tx) => {
      const totals = computeInvoiceTotals(
        input.lines.map((line: (typeof input.lines)[number]) => ({ qty: line.qty, unitPriceHalalas: line.unitPriceHalalas })),
      )
      const id = ulid()
      const [row] = await tx
        .insert(estimates)
        .values({
          id,
          orgId: principal.orgId,
          branchId: principal.branchId,
          code: await nextEstimateCode(tx),
          jobCardId: input.jobCardId ?? null,
          customerId: input.customerId ?? null,
          customerName: input.customerName,
          vehicleId: input.vehicleId ?? null,
          vehicleLabel: input.vehicleLabel,
          subtotalHalalas: totals.subtotalHalalas,
          taxHalalas: totals.taxHalalas,
          discountHalalas: totals.discountHalalas,
          totalHalalas: totals.totalHalalas,
          status: 'draft',
          validUntil: input.validUntil ? new Date(input.validUntil) : null,
          submittedBy: principal.userId,
          notes: input.notes ?? null,
          createdBy: principal.userId,
          updatedBy: principal.userId,
        })
        .returning()
      if (!row) throw notFound('Estimate')

      await tx.insert(estimateLines).values(
        input.lines.map((line: (typeof input.lines)[number], index: number) => ({
          id: ulid(),
          orgId: principal.orgId,
          branchId: principal.branchId,
          estimateId: id,
          description: line.description,
          descriptionAr: line.descriptionAr ?? null,
          kind: line.kind,
          qty: line.qty,
          unitPriceHalalas: line.unitPriceHalalas,
          partSku: line.partSku ?? null,
          sort: index,
          createdBy: principal.userId,
          updatedBy: principal.userId,
        })),
      )

      await writeAudit(tx, {
        actor: principal,
        action: 'create',
        entity: 'estimate',
        entityId: id,
        after: row,
        ...metaOf(request),
      })
      return presentRow(def(), principal, row as Record<string, unknown>)
    })

    reply.code(201)
    return created
  })

  app.patch('/estimates/:id', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'estimates', 'e')
    const parsed = estimateUpdate.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid estimate.', issue?.path.join('.'))
    }
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadEstimate(tx, id)
      if (before.status === 'approved') {
        throw conflict('An approved estimate cannot be edited. Raise a revision instead.')
      }

      const patch: Record<string, unknown> = { updatedBy: principal.userId }
      if (parsed.data.customerName) patch.customerName = parsed.data.customerName
      if (parsed.data.vehicleLabel) patch.vehicleLabel = parsed.data.vehicleLabel
      if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes
      if (parsed.data.status) patch.status = parsed.data.status

      if (parsed.data.lines) {
        const totals = computeInvoiceTotals(
          parsed.data.lines.map((l: (typeof parsed.data.lines)[number]) => ({ qty: l.qty, unitPriceHalalas: l.unitPriceHalalas })),
        )
        Object.assign(patch, totals)
        await tx.delete(estimateLines).where(eq(estimateLines.estimateId, before.id))
        await tx.insert(estimateLines).values(
          parsed.data.lines.map((line: (typeof parsed.data.lines)[number], index: number) => ({
            id: ulid(),
            orgId: principal.orgId,
            branchId: principal.branchId,
            estimateId: before.id,
            description: line.description,
            descriptionAr: line.descriptionAr ?? null,
            kind: line.kind,
            qty: line.qty,
            unitPriceHalalas: line.unitPriceHalalas,
            partSku: line.partSku ?? null,
            sort: index,
            createdBy: principal.userId,
            updatedBy: principal.userId,
          })),
        )
      }

      const [after] = await tx
        .update(estimates)
        .set(patch)
        .where(and(eq(estimates.id, before.id), eq(estimates.version, before.version)))
        .returning()
      if (!after) throw conflict('This estimate changed since you loaded it.')

      await writeAudit(tx, {
        actor: principal,
        action: 'update',
        entity: 'estimate',
        entityId: after.id,
        before,
        after,
        ...metaOf(request),
      })
      return presentRow(def(), principal, after as Record<string, unknown>)
    })
  })

  app.get('/estimates/:id/lines', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'estimates', 'v')
    const { id } = request.params as { id: string }
    return withTenant(deps.db, principal, async (tx) => {
      const estimate = await loadEstimate(tx, id)
      const rows = await tx
        .select()
        .from(estimateLines)
        .where(and(eq(estimateLines.estimateId, estimate.id), isNull(estimateLines.deletedAt)))
        .orderBy(estimateLines.sort)
      return { rows }
    })
  })

  app.post('/estimates/:id/approve', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'estimates', 'a')
    const parsed = estimateApproveBody.safeParse(request.body ?? {})
    if (!parsed.success) throw badRequest('Invalid approval body.')
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadEstimate(tx, id, { forUpdate: true })
      if (before.status === 'approved') throw conflict('This estimate is already approved.')
      if (before.status === 'rejected') throw conflict('This estimate was rejected.')

      const stale = checkEstimateFresh({
        validUntil: before.validUntil ? before.validUntil.toISOString() : null,
      })
      if (stale) throw ruleViolated(stale.message)

      /* Ceiling first, then segregation of duties. Both are refusals, but they
       * mean different things: one says escalate, the other says find someone
       * else. */
      requireApproval(principal, before.totalHalalas)
      requireDifferentApprover(principal, before.submittedBy)

      const [after] = await tx
        .update(estimates)
        .set({
          status: 'approved',
          approvedBy: principal.userId,
          approvedAt: sql`now()`,
          updatedBy: principal.userId,
        })
        .where(and(eq(estimates.id, before.id), eq(estimates.version, before.version)))
        .returning()
      if (!after) throw conflict('This estimate changed since you loaded it.')

      await writeAudit(tx, {
        actor: principal,
        action: 'approve',
        entity: 'estimate',
        entityId: after.id,
        before: { status: before.status, totalHalalas: before.totalHalalas },
        after: { status: after.status, approvedBy: after.approvedBy },
        reason: parsed.data.reason ?? null,
        ...metaOf(request),
      })
      return presentRow(def(), principal, after as Record<string, unknown>)
    })
  })

  app.post('/estimates/:id/reject', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'estimates', 'a')
    const { id } = request.params as { id: string }
    const reason = (request.body as { reason?: string } | undefined)?.reason
    if (!reason) throw badRequest('A rejection must say why.', 'reason')

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadEstimate(tx, id)
      if (before.status === 'approved') throw conflict('An approved estimate cannot be rejected.')
      const [after] = await tx
        .update(estimates)
        .set({ status: 'rejected', updatedBy: principal.userId })
        .where(and(eq(estimates.id, before.id), eq(estimates.version, before.version)))
        .returning()
      if (!after) throw conflict('This estimate changed since you loaded it.')

      await writeAudit(tx, {
        actor: principal,
        action: 'reject',
        entity: 'estimate',
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

type EstimateRow = typeof estimates.$inferSelect

async function loadEstimate(
  tx: Tx,
  ref: string,
  options: { forUpdate?: boolean } = {},
): Promise<EstimateRow> {
  const base = tx
    .select()
    .from(estimates)
    .where(
      and(isNull(estimates.deletedAt), sql`(${estimates.id} = ${ref} or ${estimates.code} = ${ref})`),
    )
    .limit(1)
  const rows = options.forUpdate ? await base.for('update') : await base
  const row = rows[0]
  if (!row) throw notFound('Estimate')
  return row
}

async function nextEstimateCode(tx: Tx): Promise<string> {
  const [row] = await tx.select({ value: sql<number>`count(*)::int` }).from(estimates)
  return `EST-${String((row?.value ?? 0) + 1).padStart(4, '0')}`
}
