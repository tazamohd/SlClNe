/** The uniform part of every collection: list, get, create, update, delete and
 *  the two bulk operations.
 *
 *  Each handler does the same six things in the same order — authorise, open a
 *  tenant transaction, validate, apply, audit, present — because a route that
 *  does them in its own order is a route where one of them is missing.
 */
import { and, eq, getTableColumns, isNull, sql } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'
import type { FastifyInstance } from 'fastify'
import { ulid } from 'ulid'
import {
  bulkDeleteBody,
  bulkUpdateBody,
  IF_MATCH_VERSION_HEADER,
  SERVER_OWNED_KEYS,
} from '@salis/contract'
import { writeAudit } from '../audit/audit'
import type { Database } from '../db/client'
import { withTenant, type Principal, type Tx } from '../db/tenant'
import { badRequest, forbidden, notFound, versionConflict } from '../http/errors'
import { metaOf, parseListQuery, principalOf } from '../http/context'
import { findOne, listRows } from '../query'
import { COLLECTIONS, REDACTIONS, type CollectionDef } from '../registry'
import { redact, requirePermission } from '../security/permissions'
import { WRITERS, type Writer } from '../writers'

export interface RouteDeps {
  db: Database
}

/** Applies field-level redaction on the way out, so a value a role may not see
 *  never reaches the wire — hiding it in the client would have been too late. */
export function presentRow(def: CollectionDef, principal: Principal, row: Record<string, unknown>) {
  const presented = def.present(row)
  const rules = REDACTIONS[def.key]
  if (!rules || presented === null || typeof presented !== 'object' || Array.isArray(presented)) {
    return presented
  }
  return redact(principal, presented as Record<string, unknown>, rules)
}

function tenantColumns(def: CollectionDef, principal: Principal) {
  const cols = getTableColumns(def.table) as unknown as Record<string, PgColumn>
  const values: Record<string, unknown> = {}
  if (cols.orgId) values.orgId = principal.orgId
  if (cols.branchId) values.branchId = principal.branchId
  return values
}

/** A body that tries to set `orgId`, `version` or `createdBy` is not a
 *  validation slip — it is an attempt to write a column the server owns, and
 *  it is refused rather than quietly stripped, so the caller learns. */
function rejectServerOwnedKeys(body: unknown): void {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return
  for (const key of Object.keys(body as Record<string, unknown>)) {
    if ((SERVER_OWNED_KEYS as readonly string[]).includes(key)) {
      throw badRequest(`"${key}" is set by the server and cannot be sent.`, key)
    }
  }
}

function parseOr422(schema: Writer['create'], body: unknown) {
  const parsed = schema.safeParse(body ?? {})
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    throw badRequest(issue?.message ?? 'Invalid request body.', issue?.path.join('.'))
  }
  return parsed.data as Record<string, unknown>
}

function expectedVersion(headerValue: unknown, body: unknown): number | null {
  const fromHeader = typeof headerValue === 'string' ? Number(headerValue) : Number.NaN
  if (Number.isInteger(fromHeader)) return fromHeader
  const candidate = (body as Record<string, unknown> | undefined)?._version
  if (typeof candidate === 'number' && Number.isInteger(candidate)) return candidate
  return null
}

export function registerCollectionRoutes(app: FastifyInstance, deps: RouteDeps): void {
  for (const def of COLLECTIONS) {
    registerOne(app, deps, def)
  }
}

function registerOne(app: FastifyInstance, deps: RouteDeps, def: CollectionDef): void {
  const base = `/${def.path}`
  const writer: Writer | undefined = def.writable ? WRITERS[def.key] : undefined

  app.get(base, async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, def.module, 'v')
    const query = parseListQuery(request.query)
    if (query.includeDeleted) requirePermission(principal, def.module, 'x')

    return withTenant(deps.db, principal, async (tx) => {
      const result = await listRows(tx, def, query)
      return {
        rows: result.rows.map((row) => presentRow(def, principal, row)),
        page: result.page,
      }
    })
  })

  app.get(`${base}/:id`, async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, def.module, 'v')
    const { id } = request.params as { id: string }
    return withTenant(deps.db, principal, async (tx) => {
      const row = await findOne(tx, def, id)
      return presentRow(def, principal, row)
    })
  })

  if (!writer) return

  app.post(base, async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, def.module, 'c')
    rejectServerOwnedKeys(request.body)
    const parsed = parseOr422(writer.create, request.body)

    const created = await withTenant(deps.db, principal, async (tx) => {
      const columns = await writer.toColumns(parsed, { tx, principal }, null)
      const [row] = (await tx
        .insert(def.table)
        .values({
          id: ulid(),
          ...tenantColumns(def, principal),
          ...columns,
          createdBy: principal.userId,
          updatedBy: principal.userId,
        } as never)
        .returning()) as unknown as Record<string, unknown>[]
      if (!row) throw notFound(def.entity)

      await writeAudit(tx, {
        actor: principal,
        action: 'create',
        entity: def.entity,
        entityId: String(row.id),
        after: row,
        ...metaOf(request),
      })
      return presentRow(def, principal, row)
    })

    reply.code(201)
    return created
  })

  app.patch(`${base}/:id`, async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, def.module, 'e')
    rejectServerOwnedKeys(request.body)
    const parsed = parseOr422(writer.update, request.body)
    const { id } = request.params as { id: string }
    const claimed = expectedVersion(request.headers[IF_MATCH_VERSION_HEADER], request.body)

    return withTenant(deps.db, principal, async (tx) => {
      const before = await findOne(tx, def, id)
      const columns = await writer.toColumns(parsed, { tx, principal }, before)
      const after = await applyUpdate(tx, def, {
        id: String(before.id),
        claimedVersion: claimed,
        currentVersion: Number(before.version),
        values: { ...columns, updatedBy: principal.userId },
      })

      await writeAudit(tx, {
        actor: principal,
        action: 'update',
        entity: def.entity,
        entityId: String(after.id),
        before,
        after,
        ...metaOf(request),
      })
      return presentRow(def, principal, after)
    })
  })

  app.delete(`${base}/:id`, async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, def.module, 'x')
    const { id } = request.params as { id: string }

    await withTenant(deps.db, principal, async (tx) => {
      const before = await findOne(tx, def, id)
      await softDelete(tx, def, String(before.id), principal)
      await writeAudit(tx, {
        actor: principal,
        action: 'delete',
        entity: def.entity,
        entityId: String(before.id),
        before,
        ...metaOf(request),
      })
    })

    reply.code(204)
    return null
  })

  app.post(`${base}/bulk-update`, async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, def.module, 'e')
    const body = bulkUpdateBody.safeParse(request.body)
    if (!body.success) throw badRequest('Expected { ids: [...], patch: {...} }.')
    rejectServerOwnedKeys(body.data.patch)
    const parsed = parseOr422(writer.update, body.data.patch)

    return withTenant(deps.db, principal, async (tx) => {
      const rows: unknown[] = []
      for (const id of body.data.ids) {
        const before = await findOne(tx, def, id)
        const columns = await writer.toColumns(parsed, { tx, principal }, before)
        const after = await applyUpdate(tx, def, {
          id: String(before.id),
          claimedVersion: null,
          currentVersion: Number(before.version),
          values: { ...columns, updatedBy: principal.userId },
        })
        await writeAudit(tx, {
          actor: principal,
          action: 'bulk_update',
          entity: def.entity,
          entityId: String(after.id),
          before,
          after,
          ...metaOf(request),
        })
        rows.push(presentRow(def, principal, after))
      }
      return { rows }
    })
  })

  app.post(`${base}/bulk-delete`, async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, def.module, 'x')
    const body = bulkDeleteBody.safeParse(request.body)
    if (!body.success) throw badRequest('Expected { ids: [...] }.')

    return withTenant(deps.db, principal, async (tx) => {
      for (const id of body.data.ids) {
        const before = await findOne(tx, def, id)
        await softDelete(tx, def, String(before.id), principal)
        await writeAudit(tx, {
          actor: principal,
          action: 'bulk_delete',
          entity: def.entity,
          entityId: String(before.id),
          before,
          ...metaOf(request),
        })
      }
      return { deleted: body.data.ids.length }
    })
  })
}

/** The optimistic-concurrency write.
 *
 *  The `version` predicate is what turns "last writer wins" into a 409: if the
 *  row moved between the read and the write, no row matches and the caller is
 *  told rather than silently overwriting someone. The new version number comes
 *  from the database trigger, not from this statement. */
export async function applyUpdate(
  tx: Tx,
  def: CollectionDef,
  args: {
    id: string
    claimedVersion: number | null
    currentVersion: number
    values: Record<string, unknown>
  },
): Promise<Record<string, unknown>> {
  const cols = getTableColumns(def.table) as unknown as Record<string, PgColumn>
  const expected = args.claimedVersion ?? args.currentVersion
  const [row] = (await tx
    .update(def.table)
    .set(args.values as never)
    .where(and(eq(cols.id as PgColumn, args.id), eq(cols.version as PgColumn, expected)))
    .returning()) as unknown as Record<string, unknown>[]

  if (!row) throw versionConflict()
  return row
}

export async function softDelete(
  tx: Tx,
  def: CollectionDef,
  id: string,
  principal: Principal,
): Promise<void> {
  const cols = getTableColumns(def.table) as unknown as Record<string, PgColumn>
  if (!cols.deletedAt) throw forbidden('This collection cannot be deleted.')
  const result = (await tx
    .update(def.table)
    .set({ deletedAt: sql`now()`, updatedBy: principal.userId } as never)
    .where(and(eq(cols.id as PgColumn, id), isNull(cols.deletedAt)))
    .returning()) as unknown as Record<string, unknown>[]
  if (result.length === 0) throw notFound(def.entity)
}
