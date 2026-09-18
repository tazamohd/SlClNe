/** `GET /audit-log` — the org-wide audit trail feed AuditLog reads.
 *
 *  `routes/history.ts` answers "what happened to this one record"; this
 *  answers "what happened across the tenant", the feed the AuditLog screen
 *  shows. Same table, same RLS scoping (`audit_log` is org-scoped, and this
 *  read runs inside the caller's `withTenant` transaction like every other),
 *  different shape: a flat, most-recent-first list rather than one entity's
 *  history, with the actor's name joined in so a row reads as "who", not
 *  just an id.
 *
 *  Gated on `audit:v` — the same module the screen registry files
 *  D-AuditLog under. Read-only: nothing here writes, so it never itself
 *  produces a row in the feed it serves.
 *
 *  `category` is derived, not stored — the table has no such column. A
 *  `session` or `password_reset` entity is how a login, logout, token
 *  refresh or password reset already gets audited (`auth/service.ts`); a
 *  row with no human actor or written by something other than a live
 *  request (`source !== 'api'`) is the system acting, not a person. Every
 *  other row is a change to business data. The three are a partition of the
 *  same rows the query already reads, not a fourth classification that
 *  could drift from them.
 */
import { and, desc, eq, ilike, isNotNull, isNull, ne, or, type SQL } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { auditLog, users } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { principalOf } from '../http/context'
import { requirePermission } from '../security/permissions'
import type { RouteDeps } from './collections'

export type AuditLogCategory = 'auth' | 'data' | 'system'

export interface AuditLogEntry {
  id: string
  actorId: string | null
  actorName: string | null
  actorRole: string | null
  action: string
  entity: string
  entityId: string | null
  reason: string | null
  source: string
  ip: string | null
  category: AuditLogCategory
  at: string
}

const AUTH_ENTITIES = new Set(['session', 'password_reset'])

function categoryOf(entity: string, source: string, actorId: string | null): AuditLogCategory {
  if (AUTH_ENTITIES.has(entity)) return 'auth'
  if (source !== 'api' || !actorId) return 'system'
  return 'data'
}

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

function parseLimit(raw: unknown): number {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT
  return Math.min(Math.trunc(parsed), MAX_LIMIT)
}

/** Escapes `%`/`_` the way `query.ts`'s `?q=` search does, so a search term
 *  containing them matches literally rather than as a wildcard. */
function likeTerm(q: string): string {
  return `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`
}

/** Mirrors `categoryOf` as a SQL predicate, so the same three buckets that
 *  function assigns in JS are what `?category=` narrows to in the query —
 *  filtering by a fourth, independently-drifting notion of "auth" would be
 *  a bug waiting to surface as "this row is missing from its own category". */
function categoryCondition(category: string | undefined): SQL | undefined {
  const notAuth = and(ne(auditLog.entity, 'session'), ne(auditLog.entity, 'password_reset'))
  switch (category) {
    case 'auth':
      return or(eq(auditLog.entity, 'session'), eq(auditLog.entity, 'password_reset'))
    case 'data':
      return and(notAuth, eq(auditLog.source, 'api'), isNotNull(auditLog.actorId))
    case 'system':
      return and(notAuth, or(ne(auditLog.source, 'api'), isNull(auditLog.actorId)))
    default:
      return undefined
  }
}

async function readAuditLog(
  tx: Tx,
  options: { category?: string; q?: string; limit: number },
): Promise<AuditLogEntry[]> {
  const conditions: SQL[] = []

  const categoryFilter = categoryCondition(options.category)
  if (categoryFilter) conditions.push(categoryFilter)

  if (options.q) {
    const term = likeTerm(options.q)
    const matches = or(
      ilike(auditLog.action, term),
      ilike(auditLog.entity, term),
      ilike(auditLog.reason, term),
      ilike(users.name, term),
    )
    if (matches) conditions.push(matches)
  }

  const rows = await tx
    .select({
      id: auditLog.id,
      actorId: auditLog.actorId,
      actorName: users.name,
      actorRole: auditLog.actorRole,
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      reason: auditLog.reason,
      source: auditLog.source,
      ip: auditLog.ip,
      ts: auditLog.ts,
    })
    .from(auditLog)
    .leftJoin(users, eq(users.id, auditLog.actorId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLog.ts))
    .limit(options.limit)

  return rows.map((row) => ({
    id: row.id,
    actorId: row.actorId,
    actorName: row.actorName,
    actorRole: row.actorRole,
    action: row.action,
    entity: row.entity,
    entityId: row.entityId,
    reason: row.reason,
    source: row.source,
    ip: row.ip,
    category: categoryOf(row.entity, row.source, row.actorId),
    at: new Date(row.ts).toISOString(),
  }))
}

export function registerAuditLogRoutes(app: FastifyInstance, deps: RouteDeps): void {
  app.get('/audit-log', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'audit', 'v')
    const { category, q, limit } = request.query as { category?: string; q?: string; limit?: string }

    return withTenant(deps.db, principal, async (tx) => {
      const entries = await readAuditLog(tx, { category, q, limit: parseLimit(limit) })
      return { entries }
    })
  })
}
