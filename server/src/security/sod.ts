/** Segregation of duties, enforced over the audit log.
 *
 *  F-004. The `SOD` table pairs **activities**, not roles: "Perform repair"
 *  must not be done by whoever will "Pass quality check". That is a question
 *  about a person and a record — *did this actor perform the counterpart on
 *  this entity?* — and the permission matrix cannot answer it. Four of the six
 *  pairs are held on both sides by a single role, and one pair ("Issue stock" /
 *  "Adjust stock count") maps to the same `(module, action)` entirely, so a
 *  role check cannot express any of them.
 *
 *  The audit log can. It already records `actor`, `action`, `entity` and
 *  `entityId` — which is exactly the input the control needs:
 *
 *      the actor who performed activity A on entity X
 *      may not perform the counterpart activity B on entity X
 *
 *  `SIGNATURES` is the missing half: it says which audit rows *evidence* which
 *  activity. An activity with no signature is honestly marked `observable:
 *  false` — the server writes nothing that would prove it happened, so the pair
 *  is unenforceable until the route that performs it exists. `unobservable()`
 *  reports that list rather than leaving it implied.
 */
import { and, desc, eq } from 'drizzle-orm'
import { SOD } from '@salis/contract'
import { auditLog } from '../db/schema'
import { writeAudit } from '../audit/audit'
import { withTenant, type Principal, type Tx } from '../db/tenant'
import type { Database } from '../db/client'
import { forbidden } from '../http/errors'

export interface SodRule {
  a: string
  b: string
  ar: readonly string[]
  risk: string
}

/** One audit row, reduced to what the control cares about. */
export interface AuditFact {
  actorId: string | null
  action: string
  entity: string
  before: unknown
  after: unknown
}

interface Signature {
  activity: string
  entity: string
  action: string
  /** Narrows further on the row's payload, e.g. which stage a job moved into. */
  when?: (fact: AuditFact) => boolean
}

function stage(value: unknown, key: 'stage'): string | undefined {
  if (!value || typeof value !== 'object') return undefined
  const candidate = (value as Record<string, unknown>)[key]
  return typeof candidate === 'string' ? candidate : undefined
}

function movementType(fact: AuditFact): string | undefined {
  if (!fact.after || typeof fact.after !== 'object') return undefined
  const candidate = (fact.after as Record<string, unknown>).type
  return typeof candidate === 'string' ? candidate : undefined
}

/** Which audit rows prove which activity. */
const SIGNATURES: readonly Signature[] = [
  /* Repair / QC. Two rows evidence the repair: moving the job *into* repair,
   * and moving it out of repair towards QC. Either is a claim to have done the
   * work, and both are the person the quality gate must not be. */
  {
    activity: 'Perform repair',
    entity: 'job_card',
    action: 'transition',
    when: (fact) => stage(fact.after, 'stage') === 'repair' || stage(fact.before, 'stage') === 'repair',
  },
  {
    activity: 'Pass quality check',
    entity: 'job_card',
    action: 'transition',
    when: (fact) =>
      stage(fact.before, 'stage') === 'qc' && stage(fact.after, 'stage') === 'delivery',
  },

  /* Stock. The pair the permission matrix cannot express at all — both duties
   * are `inventory:e` — and the one the audit log separates cleanly, because
   * the movement type is on the row. */
  {
    activity: 'Issue stock',
    entity: 'part',
    action: 'movement',
    when: (fact) => movementType(fact) === 'out',
  },
  {
    activity: 'Adjust stock count',
    entity: 'part',
    action: 'movement',
    /* Both directions of a count correction are the same duty — the shortfall
     * a thief hides is hidden by adjusting *down*. */
    when: (fact) => movementType(fact) === 'adjust' || movementType(fact) === 'adjust_down',
  },
]

/** Activities the table names but the server cannot yet observe, with the
 *  reason. Reported rather than silently absent — a control nobody can see is
 *  not a control. */
export const UNOBSERVABLE: Readonly<Record<string, string>> = {
  'Raise purchase order': 'no purchase-order route writes an audit row yet',
  'Approve purchase order': 'no purchase-order approval route exists yet',
  'Create supplier': 'suppliers are not a server-side entity yet',
  'Approve supplier payment': 'no supplier-payment approval route exists yet',
  'Post journal entry': 'journal entries are created through the generic collection route, which records `create` on `journal_entry`; the *posting* step has no route yet',
  'Approve journal entry': 'no journal approval route exists yet',
  'Create employee': 'HR has no server-side entity yet',
  'Approve payroll run': 'payroll has no route yet',
}

export function isObservable(activity: string): boolean {
  return SIGNATURES.some((signature) => signature.activity === activity)
}

/** The pairs this module can enforce today, and the ones it cannot. */
export function pairStatus(): { enforced: string[]; unenforced: { pair: string; why: string }[] } {
  const enforced: string[] = []
  const unenforced: { pair: string; why: string }[] = []
  for (const rule of SOD) {
    const pair = `${rule.a} + ${rule.b}`
    if (isObservable(rule.a) && isObservable(rule.b)) enforced.push(pair)
    else {
      unenforced.push({
        pair,
        why: UNOBSERVABLE[rule.a] ?? UNOBSERVABLE[rule.b] ?? 'no audit signature',
      })
    }
  }
  return { enforced, unenforced }
}

export function sodRuleFor(activity: string): SodRule | undefined {
  return SOD.find((rule) => rule.a === activity || rule.b === activity)
}

export function sodCounterpart(activity: string): string | undefined {
  const rule = sodRuleFor(activity)
  if (!rule) return undefined
  return rule.a === activity ? rule.b : rule.a
}

/** Every activity this audit row evidences. */
export function activitiesOf(fact: AuditFact): string[] {
  return SIGNATURES.filter(
    (signature) =>
      signature.entity === fact.entity &&
      signature.action === fact.action &&
      (signature.when ? signature.when(fact) : true),
  ).map((signature) => signature.activity)
}

/** The pure form of the control, so it is testable without a database. */
export function sodViolation(
  activity: string,
  actorId: string,
  history: readonly AuditFact[],
): SodRule | undefined {
  const counterpart = sodCounterpart(activity)
  if (!counterpart) return undefined
  const conflicted = history.some(
    (fact) => fact.actorId === actorId && activitiesOf(fact).includes(counterpart),
  )
  return conflicted ? sodRuleFor(activity) : undefined
}

/** How far back the trail is read for one record. A job card accumulates a
 *  handful of rows; the cap exists so a pathological history cannot turn one
 *  transition into an unbounded scan. */
const HISTORY_LIMIT = 200

export async function readHistory(
  tx: Tx,
  entity: string,
  entityId: string,
): Promise<AuditFact[]> {
  const rows = await tx
    .select({
      actorId: auditLog.actorId,
      action: auditLog.action,
      entity: auditLog.entity,
      before: auditLog.before,
      after: auditLog.after,
    })
    .from(auditLog)
    .where(and(eq(auditLog.entity, entity), eq(auditLog.entityId, entityId)))
    .orderBy(desc(auditLog.ts))
    .limit(HISTORY_LIMIT)
  return rows as AuditFact[]
}

export interface SodCheck {
  activity: string
  entity: string
  entityId: string
  requestId?: string
  ip?: string
  userAgent?: string
}

/** Throws if `principal` performing `check.activity` on this record would put
 *  both sides of a declared pair in one pair of hands.
 *
 *  The refusal is audited in a **separate** transaction. The caller's
 *  transaction is about to roll back, and an audit row written inside it would
 *  roll back with it — leaving the one event most worth keeping as the only one
 *  that vanishes. */
export async function requireSodClear(
  db: Database,
  tx: Tx,
  principal: Principal,
  check: SodCheck,
): Promise<void> {
  if (!isObservable(check.activity)) return
  const history = await readHistory(tx, check.entity, check.entityId)
  const rule = sodViolation(check.activity, principal.userId, history)
  if (!rule) return

  const counterpart = sodCounterpart(check.activity)
  const message =
    `Segregation of duties: you performed "${counterpart}" on this ${check.entity.replace('_', ' ')}, ` +
    `so you may not also "${check.activity}". Someone else must.`

  await withTenant(db, principal, async (audit) => {
    await writeAudit(audit, {
      actor: principal,
      action: 'reject',
      entity: check.entity,
      entityId: check.entityId,
      reason: `sod_violation:${rule.a} + ${rule.b}`,
      after: { rule: `${rule.a} + ${rule.b}`, risk: rule.risk, attempted: check.activity },
      requestId: check.requestId,
      ip: check.ip,
      userAgent: check.userAgent,
    })
  })

  throw forbidden(message)
}
