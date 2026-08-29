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

/** The bulk-egress ceiling. An export larger than this is served truncated —
 *  with `X-Export-Truncated: true` and a logged warning — rather than quietly
 *  cut off. The number is a memory/latency guard, not a permission: whoever
 *  holds `x` may pull the whole table, but one request materialising millions of
 *  rows into a string would take the process down, and a spreadsheet silently
 *  missing its tail is worse than one that admits it is incomplete. */
const MAX_EXPORT_ROWS = 50_000
/** Gather the export in full pages at the contract's list ceiling. */
const EXPORT_PAGE_SIZE = 200

/* A field must be CSV-quoted when it carries the delimiter, a quote or a line
 * break; a field is a spreadsheet-formula risk when it *starts* with one of the
 * trigger characters. The two are different problems and are handled in that
 * order below. */
const CSV_NEEDS_QUOTING = /[",\n\r]/
const CSV_FORMULA_LEAD = /^[=+\-@\t\r]/

/** One CSV cell, hardened against both delimiter corruption and formula
 *  injection.
 *
 *  Two escaping problems are routinely conflated; this keeps them apart:
 *
 *  1. **RFC 4180 quoting.** A value containing a comma, a double quote or a
 *     newline is wrapped in double quotes and its own quotes doubled, so the
 *     column structure survives a round-trip through any conforming parser.
 *
 *  2. **Formula injection (OWASP).** A cell whose first character is `=`, `+`,
 *     `-`, `@`, a tab or a carriage return is executed as a formula the instant
 *     Excel / Google Sheets / LibreOffice opens the file — `=cmd|'/c calc'!A1`,
 *     `=HYPERLINK(...)`, `@SUM(...)`. An export of customer names, notes and
 *     phone numbers is precisely a channel for attacker-controlled text, so the
 *     value is neutralised by prefixing a single quote, which those apps strip
 *     on display but never evaluate. This is deliberately conservative: a
 *     legitimate negative number or a `+966…` phone becomes `'-5` / `'+966…`,
 *     which the guidance accepts as the price of not shipping live formulas.
 *
 *  The formula guard runs on the *logical* value first, so the quote lands
 *  inside any RFC-4180 quoting rather than outside it where a parser could peel
 *  it back off. */
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  let text = typeof value === 'object' ? JSON.stringify(value) : String(value)
  if (CSV_FORMULA_LEAD.test(text)) text = `'${text}`
  if (CSV_NEEDS_QUOTING.test(text)) text = `"${text.replace(/"/g, '""')}"`
  return text
}

/** Serialise presented rows to a CSV document (CRLF line endings, per RFC 4180).
 *
 *  The header is the **stable union** of every presented row's keys in
 *  first-seen order: a column that only some rows carry (a redacted field nulled
 *  for one row, an optional attribute) still gets a heading and every row lines
 *  up under it. The rows are already through `presentRow`, so a field a role may
 *  not see arrives as `null` and serialises to an empty cell — the redaction is
 *  honoured here for free rather than re-implemented. Rows that present as an
 *  array (the `services` tuple) fall back to their positional keys. */
export function toCsv(rows: readonly unknown[]): string {
  const keys: string[] = []
  const seen = new Set<string>()
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key)
        keys.push(key)
      }
    }
  }

  const lines: string[] = [keys.map(csvCell).join(',')]
  for (const row of rows) {
    const record = row && typeof row === 'object' ? (row as Record<string, unknown>) : {}
    lines.push(keys.map((key) => csvCell(record[key])).join(','))
  }
  return `${lines.join('\r\n')}\r\n`
}

/** Applies field-level redaction on the way out, so a value a role may not see
 *  never reaches the wire — hiding it in the client would have been too late. */
export function presentRow(def: CollectionDef, principal: Principal, row: Record<string, unknown>) {
  const presented = def.present(row)
  if (presented === null || typeof presented !== 'object' || Array.isArray(presented)) {
    return presented
  }
  /* `redact` is called even when this collection declares no rules of its own:
   * it also applies `GLOBAL_REDACTIONS`, the module-independent sweep that makes
   * the two otherwise-dead `FIELD_RULES` entries fire the day a payload starts
   * carrying a salary or a branch P&L figure (F-005). */
  return redact(principal, presented as Record<string, unknown>, REDACTIONS[def.key])
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
    /* Soft-deleted rows are visible to whoever may delete, not to whoever may
     * export — same six-letter correction as the DELETE route below. */
    if (query.includeDeleted) requirePermission(principal, def.module, 'd')

    return withTenant(deps.db, principal, async (tx) => {
      const result = await listRows(tx, def, query)
      return {
        rows: result.rows.map((row) => presentRow(def, principal, row)),
        page: result.page,
      }
    })
  })

  /* The gated bulk-egress path.
   *
   *  Registered before `/:id` so the literal segment `export` is never read as a
   *  record id. find-my-way (Fastify's router) already prefers a static segment
   *  over a parametric one regardless of registration order, so `GET
   *  /inventory/export` resolves here and not into the detail route — but placing
   *  it first states the intent and survives a future router swap that might not
   *  make the same guarantee.
   *
   *  Export is a **stricter** gate than view: it checks `x`, not `v`. A role may
   *  hold `v` and read a screenful on `GET /{path}` yet be refused the whole
   *  table as a downloadable file, because bulk egress is exactly what the
   *  matrix's export column exists to control — the accountant who may read a
   *  job card is not thereby entitled to walk out with every job card as a
   *  spreadsheet. That `v`-but-not-`x` 403 is the whole point of this route.
   *
   *  The rows travel through the *same* RLS transaction, the *same* `listRows`
   *  query (so `?q=`, `?sort=`, `?filter[]=` narrow the export just as they
   *  narrow the list) and the *same* `presentRow` as the list route. Field-level
   *  redaction and tenant scoping therefore hold on the CSV byte-for-byte: an
   *  exporter never receives a column their role cannot see on screen, nor a row
   *  belonging to another org. */
  app.get(`${base}/export`, async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, def.module, 'x')
    const query = parseListQuery(request.query)
    /* Soft-deleted rows in an export need the delete grant too, mirroring the
     * list route — an export is not a back door around that check. */
    if (query.includeDeleted) requirePermission(principal, def.module, 'd')

    const { rows, truncated, total } = await withTenant(deps.db, principal, async (tx) => {
      /* Gather the *whole* scoped set, not a single page. `listRows` is paged
       * (its ceiling is the contract's 200), so an export that took only page
       * one would silently ship the first 200 rows and drop the rest — the kind
       * of quiet truncation §5 forbids. Walk the pages until the set is complete
       * or the egress cap is reached, and report the cap rather than hide it. */
      const gathered: Record<string, unknown>[] = []
      let page = 1
      let total = 0
      for (;;) {
        const result = await listRows(tx, def, { ...query, page, pageSize: EXPORT_PAGE_SIZE })
        total = result.page.total
        for (const row of result.rows) gathered.push(row)
        if (gathered.length >= MAX_EXPORT_ROWS) {
          gathered.length = MAX_EXPORT_ROWS
          break
        }
        if (result.rows.length === 0 || page >= result.page.totalPages) break
        page += 1
      }
      return { rows: gathered, truncated: total > gathered.length, total }
    })

    const presented = rows.map((row) => presentRow(def, principal, row))
    const csv = toCsv(presented)

    /* Date from the request clock, never hardcoded, so the filename reflects
     * when the export was actually pulled. */
    const date = new Date().toISOString().slice(0, 10)
    reply
      .header('content-type', 'text/csv; charset=utf-8')
      .header('content-disposition', `attachment; filename="${def.entity}-${date}.csv"`)

    if (truncated) {
      /* No silent cut: the caller is told on the wire and the operator is told
       * in the log, so a report that stops at 50,000 rows is a visible fact and
       * not a data-integrity mystery three weeks later. */
      reply.header('x-export-truncated', 'true')
      request.log.warn(
        { collection: def.key, cap: MAX_EXPORT_ROWS, total },
        'export truncated at the egress row cap',
      )
    }
    return csv
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
    /* `d`, not `x`. The matrix uses six grant letters and `x` is **export**;
     * `handoff/RBAC.md` documents five and mislabels it (F-001). Checking `x`
     * here granted delete to every role holding view-and-export — accountant on
     * job cards, estimates, inventory and the audit log, technician on the
     * technician portal, customer on the customer portal. */
    requirePermission(principal, def.module, 'd')
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
    requirePermission(principal, def.module, 'd')
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
