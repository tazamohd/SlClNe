/** The audit trail.
 *
 *  Every mutation writes one row, inside the same transaction as the change it
 *  records — so there is no state in which the change happened and the record
 *  of it did not. The table is append-only at the database level
 *  (`drizzle/0001_rls.sql`), not merely by convention.
 */
import { ulid } from 'ulid'
import { auditLog } from '../db/schema'
import type { Tx } from '../db/tenant'
import type { Principal } from '../db/tenant'

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'restore'
  | 'bulk_update'
  | 'bulk_delete'
  | 'transition'
  | 'assign'
  | 'approve'
  | 'reject'
  | 'issue'
  | 'pay'
  | 'movement'
  | 'reserve'
  | 'release'
  | 'seed'

export interface AuditInput {
  actor: Principal
  action: AuditAction
  entity: string
  entityId: string | null
  before?: unknown
  after?: unknown
  reason?: string | null
  source?: 'api' | 'seed' | 'job' | 'import'
  requestId?: string
  ip?: string
  userAgent?: string
}

/** Values that must never be copied into an audit payload. The log is read by
 *  support staff; a password hash or a token in it is a credential leak with a
 *  long retention period. */
const REDACTED_KEYS = new Set([
  'password',
  'passwordHash',
  'password_hash',
  'refreshToken',
  'refreshTokenHash',
  'refresh_token_hash',
  'accessToken',
  'token',
  'codeHash',
  'code_hash',
  'secret',
  'otp',
])

export function scrub(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(scrub)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = REDACTED_KEYS.has(key) ? '[redacted]' : scrub(item)
    }
    return out
  }
  return value
}

export async function writeAudit(tx: Tx, input: AuditInput): Promise<void> {
  await tx.insert(auditLog).values({
    id: ulid(),
    orgId: input.actor.orgId,
    branchId: input.actor.branchId,
    actorId: input.actor.userId,
    actorRole: input.actor.role,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId,
    before: input.before === undefined ? null : scrub(input.before),
    after: input.after === undefined ? null : scrub(input.after),
    reason: input.reason ?? null,
    source: input.source ?? 'api',
    requestId: input.requestId ?? null,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
  })
}
