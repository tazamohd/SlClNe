/** The audit-history read — the client half of F-004.
 *
 *  The server enforces segregation of duties over the audit trail (`security/
 *  sod.ts`): the actor who performed a repair may not pass its QC, and the
 *  actor who raised an estimate may not approve it. But a *screen* could not
 *  flag that per row, because no endpoint returned the trail. WorkshopQC and
 *  EstimateDetail therefore showed a control they could not evidence. These two
 *  reads close that gap.
 *
 *  Three properties hold, and each is tested:
 *
 *  1. **Tenant-scoped.** The entity is resolved first under the caller's RLS
 *     context, so another organization's id is a 404 before any trail is read;
 *     the `audit_log` read is itself RLS-scoped on `org_id` (drizzle/0001), so
 *     the entries can only be the caller's own org. Two defences, not one.
 *  2. **Permission-gated.** The history of a record is gated on the same module
 *     the record is — `estimates:v`, `jobcards:v`. If you may not see the
 *     estimate, you may not see who did what to it.
 *  3. **Read-only.** Nothing here writes. It reports the trail and annotates
 *     each row with the SOD activities it evidences, plus the conflicts a single
 *     actor holding both sides of a pair would create, so the client can flag a
 *     row rather than re-deriving the control from scratch.
 */
import { and, asc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ModuleId } from '@salis/contract'
import { auditLog } from '../db/schema'
import { withTenant, type Principal, type Tx } from '../db/tenant'
import { principalOf } from '../http/context'
import { requirePermission, redact } from '../security/permissions'
import { activitiesOf, sodCounterpart, sodRuleFor, type AuditFact } from '../security/sod'
import { collectionByKey } from '../registry'
import { findOne } from '../query'
import type { RouteDeps } from './collections'

/** One presented history entry — what a screen renders as a row in the trail. */
interface HistoryEntry {
  id: string
  actorId: string | null
  actorRole: string | null
  action: string
  at: string | null
  reason: string | null
  before: unknown
  after: unknown
  /** The SOD activities this row evidences (empty for most rows). */
  activities: string[]
}

/** A single actor holding both sides of a declared pair on this record. */
interface SodConflict {
  actorId: string
  a: string
  b: string
  risk: string
}

async function readEntries(
  tx: Tx,
  principal: Principal,
  entity: string,
  entityId: string,
): Promise<{ entries: HistoryEntry[]; facts: (AuditFact & { actorId: string | null })[] }> {
  const rows = await tx
    .select({
      id: auditLog.id,
      actorId: auditLog.actorId,
      actorRole: auditLog.actorRole,
      action: auditLog.action,
      entity: auditLog.entity,
      reason: auditLog.reason,
      before: auditLog.before,
      after: auditLog.after,
      ts: auditLog.ts,
    })
    .from(auditLog)
    .where(and(eq(auditLog.entity, entity), eq(auditLog.entityId, entityId)))
    .orderBy(asc(auditLog.ts))

  const entries: HistoryEntry[] = []
  const facts: (AuditFact & { actorId: string | null })[] = []
  for (const row of rows) {
    const fact: AuditFact = {
      actorId: row.actorId,
      action: row.action,
      entity: row.entity,
      before: row.before,
      after: row.after,
    }
    facts.push(fact)
    entries.push({
      id: row.id,
      actorId: row.actorId,
      actorRole: row.actorRole,
      action: row.action,
      at: row.ts ? new Date(row.ts).toISOString() : null,
      reason: row.reason ?? null,
      /* Defence in depth: the trail's snapshots pass through the same redaction
       * the live rows do, so a field a role may not see on the record is not
       * handed back through its history either. */
      before: redact(principal, wrap(row.before)),
      after: redact(principal, wrap(row.after)),
      activities: activitiesOf(fact),
    })
  }
  return { entries, facts }
}

/** `redact` operates on an object; a scalar or null audit payload is wrapped so
 *  it survives the pass unchanged and is unwrapped on return. */
function wrap(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return { value }
}

/** Every SOD conflict the trail evidences: an actor who performed both an
 *  activity and its declared counterpart on this record. This is the reporting
 *  form of `sodViolation` — it names the conflicts rather than throwing on the
 *  next attempt, so a screen can highlight the offending rows. */
function conflictsIn(facts: (AuditFact & { actorId: string | null })[]): SodConflict[] {
  /* actorId → the set of activities that actor evidenced on this record. */
  const byActor = new Map<string, Set<string>>()
  for (const fact of facts) {
    if (!fact.actorId) continue
    const set = byActor.get(fact.actorId) ?? new Set<string>()
    for (const activity of activitiesOf(fact)) set.add(activity)
    byActor.set(fact.actorId, set)
  }

  const seen = new Set<string>()
  const conflicts: SodConflict[] = []
  for (const [actorId, activities] of byActor) {
    for (const activity of activities) {
      const counterpart = sodCounterpart(activity)
      if (!counterpart || !activities.has(counterpart)) continue
      const rule = sodRuleFor(activity)
      if (!rule) continue
      /* One conflict per (actor, pair), not one per direction. */
      const key = `${actorId}:${[rule.a, rule.b].sort().join('|')}`
      if (seen.has(key)) continue
      seen.add(key)
      conflicts.push({ actorId, a: rule.a, b: rule.b, risk: rule.risk })
    }
  }
  return conflicts
}

function registerOne(
  app: FastifyInstance,
  deps: RouteDeps,
  collectionKey: string,
  module: ModuleId,
): void {
  const def = collectionByKey(collectionKey)
  if (!def) throw new Error(`collection "${collectionKey}" is not registered`)

  app.get(`/${def.path}/:id/history`, async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, module, 'v')
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      /* Resolve the record under RLS first: another org's id or code is a 404
       * here (findOne throws notFound), before a single audit row is read. The
       * resolved ULID is what the audit log keys `entityId` on. */
      const row = await findOne(tx, def, id)
      const entityId = String(row.id)
      const { entries, facts } = await readEntries(tx, principal, def.entity, entityId)
      return { entityId, entries, sodConflicts: conflictsIn(facts) }
    })
  })
}

export function registerHistoryRoutes(app: FastifyInstance, deps: RouteDeps): void {
  registerOne(app, deps, 'estimates', 'estimates')
  registerOne(app, deps, 'jobs', 'jobcards')
}
