/** Canned Jobs — predefined, priced service packages (build-order item 5).
 *
 *  Two things live here that the generic collection router cannot do, for
 *  exactly the reason `estimates`' own create/update do not go through it
 *  either: a canned job's `lines` are a full-replace write with a price
 *  recomputed from them, never a partial column update.
 *
 *  - **Create.** `computeInvoiceTotals` (the same function
 *    `POST /estimates` uses) prices the bundle from its lines; nothing about
 *    the price is accepted from the client.
 *  - **Update.** A `lines` array replaces every existing line and reprices
 *    the job, the same delete-then-insert `PATCH /estimates/:id` runs.
 *    Other fields (`name`, `category`, `active`, …) may be sent alone.
 *
 *  Gated on the `estimates` module — the same people who can create or edit
 *  an estimate maintain the packages that get copied onto one.
 */
import { and, eq, isNull } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { ulid } from 'ulid'
import { cannedJobCreate, cannedJobUpdate } from '@salis/contract'
import { computeInvoiceTotals } from '@salis/contract/rules'
import { writeAudit } from '../audit/audit'
import { cannedJobLines, cannedJobs } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { badRequest, conflict, notFound } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { collectionByKey } from '../registry'
import { requirePermission } from '../security/permissions'
import { presentRow, type RouteDeps } from './collections'

function def() {
  const found = collectionByKey('cannedJobs')
  if (!found) throw new Error('collection "cannedJobs" is not registered')
  return found
}

async function loadCannedJob(tx: Tx, id: string) {
  const [row] = await tx
    .select()
    .from(cannedJobs)
    .where(and(eq(cannedJobs.id, id), isNull(cannedJobs.deletedAt)))
    .limit(1)
  if (!row) throw notFound('Canned job')
  return row
}

export function registerCannedJobRoutes(app: FastifyInstance, deps: RouteDeps): void {
  app.post('/canned-jobs', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'estimates', 'c')
    const parsed = cannedJobCreate.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid canned job.', issue?.path.join('.'))
    }
    const input = parsed.data

    const created = await withTenant(deps.db, principal, async (tx) => {
      const { subtotalHalalas } = computeInvoiceTotals(
        input.lines.map((line) => ({ qty: line.qty, unitPriceHalalas: line.unitPriceHalalas })),
      )
      const id = ulid()
      const [row] = await tx
        .insert(cannedJobs)
        .values({
          id,
          orgId: principal.orgId,
          branchId: null,
          name: input.name,
          nameAr: input.nameAr ?? null,
          category: input.category ?? null,
          description: input.description ?? null,
          active: true,
          priceHalalas: subtotalHalalas,
          lineCount: input.lines.length,
          createdBy: principal.userId,
          updatedBy: principal.userId,
        } as never)
        .returning()
      if (!row) throw notFound('Canned job')

      await tx.insert(cannedJobLines).values(
        input.lines.map((line, index) => ({
          id: ulid(),
          orgId: principal.orgId,
          branchId: null,
          cannedJobId: id,
          description: line.description,
          descriptionAr: line.descriptionAr ?? null,
          kind: line.kind,
          qty: line.qty,
          unitPriceHalalas: line.unitPriceHalalas,
          partSku: line.partSku ?? null,
          sort: index,
          createdBy: principal.userId,
          updatedBy: principal.userId,
        })) as never,
      )

      await writeAudit(tx, {
        actor: principal,
        action: 'create',
        entity: 'canned_job',
        entityId: id,
        after: row as Record<string, unknown>,
        ...metaOf(request),
      })
      return presentRow(def(), principal, row as Record<string, unknown>)
    })

    reply.code(201)
    return created
  })

  app.patch('/canned-jobs/:id', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'estimates', 'e')
    const parsed = cannedJobUpdate.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid canned job.', issue?.path.join('.'))
    }
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadCannedJob(tx, id)

      const patch: Record<string, unknown> = { updatedBy: principal.userId }
      if (parsed.data.name !== undefined) patch.name = parsed.data.name
      if (parsed.data.nameAr !== undefined) patch.nameAr = parsed.data.nameAr ?? null
      if (parsed.data.category !== undefined) patch.category = parsed.data.category ?? null
      if (parsed.data.description !== undefined) patch.description = parsed.data.description ?? null
      if (parsed.data.active !== undefined) patch.active = parsed.data.active

      if (parsed.data.lines) {
        const { subtotalHalalas } = computeInvoiceTotals(
          parsed.data.lines.map((l) => ({ qty: l.qty, unitPriceHalalas: l.unitPriceHalalas })),
        )
        patch.priceHalalas = subtotalHalalas
        patch.lineCount = parsed.data.lines.length
        await tx.delete(cannedJobLines).where(eq(cannedJobLines.cannedJobId, before.id))
        await tx.insert(cannedJobLines).values(
          parsed.data.lines.map((line, index) => ({
            id: ulid(),
            orgId: principal.orgId,
            branchId: null,
            cannedJobId: before.id,
            description: line.description,
            descriptionAr: line.descriptionAr ?? null,
            kind: line.kind,
            qty: line.qty,
            unitPriceHalalas: line.unitPriceHalalas,
            partSku: line.partSku ?? null,
            sort: index,
            createdBy: principal.userId,
            updatedBy: principal.userId,
          })) as never,
        )
      }

      const [after] = await tx
        .update(cannedJobs)
        .set(patch)
        .where(and(eq(cannedJobs.id, before.id), eq(cannedJobs.version, before.version)))
        .returning()
      if (!after) throw conflict('This canned job changed since you loaded it.')

      await writeAudit(tx, {
        actor: principal,
        action: 'update',
        entity: 'canned_job',
        entityId: after.id,
        before,
        after,
        ...metaOf(request),
      })
      return presentRow(def(), principal, after as Record<string, unknown>)
    })
  })

  /** `GET /canned-jobs/:id/lines` — the bundle's line items, the same
   *  sub-resource shape `GET /estimates/:id/lines` returns (raw drizzle
   *  rows, money in halalas), so converting one into estimate lines on the
   *  client is a field rename, not a translation. */
  app.get('/canned-jobs/:id/lines', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'estimates', 'v')
    const { id } = request.params as { id: string }
    return withTenant(deps.db, principal, async (tx) => {
      const job = await loadCannedJob(tx, id)
      const rows = await tx
        .select()
        .from(cannedJobLines)
        .where(and(eq(cannedJobLines.cannedJobId, job.id), isNull(cannedJobLines.deletedAt)))
        .orderBy(cannedJobLines.sort)
      return { rows }
    })
  })
}
