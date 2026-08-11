/** Refresh-token sessions: rotation, reuse detection and revocation.
 *
 *  A session row *is* the refresh token as far as validity is concerned. The
 *  JWT the client holds only names the row and proves we issued it; this table
 *  decides whether it still counts. That indirection is what makes "sign this
 *  device out" and "sign every device out" possible at all.
 *
 *  **Rotation.** Every successful refresh retires the presented session and
 *  issues a new one in the same *family*. The retired row keeps `replaced_by`,
 *  so the chain is reconstructable.
 *
 *  **Reuse detection.** A refresh token is meant to be used exactly once. If a
 *  retired one is presented again, there are two possibilities and no way to
 *  tell them apart: the legitimate client lost the response and retried, or an
 *  attacker is replaying a stolen token. Both are handled the same way and it
 *  is the strict one — the **entire family is revoked**, every device in that
 *  chain is signed out, and a security event is written. A stolen token
 *  therefore buys at most one refresh before the theft becomes visible to the
 *  real user, who is forced to sign in again.
 *
 *  All of this runs under the ordinary tenant context with `scope: 'own'`, so
 *  `user_sessions`' row-level policy (`user_id = app_user()`) is the floor
 *  underneath every query here — a handler that asked for someone else's
 *  session by id would get nothing back.
 */
import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm'
import { ulid } from 'ulid'
import { userSessions } from '../db/schema'
import type { Principal, Tx } from '../db/tenant'
import { digestsMatch } from './tokens'

export type SessionRow = typeof userSessions.$inferSelect

export interface NewSession {
  /** Chosen by the caller so the refresh token can be signed for this row
   *  *before* it is written — one insert, and no window in which a session
   *  exists carrying a placeholder credential. */
  id: string
  familyId: string
  secretHash: string
  expiresAt: Date
  userAgent?: string | null
  ip?: string | null
}

export async function createSession(
  tx: Tx,
  principal: Principal,
  input: NewSession,
): Promise<SessionRow> {
  const [row] = await tx
    .insert(userSessions)
    .values({
      id: input.id,
      orgId: principal.orgId,
      branchId: principal.branchId,
      userId: principal.userId,
      familyId: input.familyId,
      refreshTokenHash: input.secretHash,
      expiresAt: input.expiresAt,
      userAgent: input.userAgent ?? null,
      ip: input.ip ?? null,
      createdBy: principal.userId,
      updatedBy: principal.userId,
    })
    .returning()
  if (!row) throw new Error('the session row was refused by row-level security')
  return row
}

export async function loadSession(tx: Tx, sessionId: string): Promise<SessionRow | undefined> {
  const [row] = await tx
    .select()
    .from(userSessions)
    .where(and(eq(userSessions.id, sessionId), isNull(userSessions.deletedAt)))
    .limit(1)
    .for('update')
  return row
}

export type SessionVerdict =
  | { kind: 'valid'; session: SessionRow }
  | { kind: 'unknown' }
  | { kind: 'expired'; session: SessionRow }
  /** The signal that a token was stolen, or that a client is replaying one. */
  | { kind: 'reused'; session: SessionRow }

/** Decides what a presented refresh token means, without changing anything. */
export function judge(session: SessionRow | undefined, secretHash: string, now = new Date()): SessionVerdict {
  if (!session) return { kind: 'unknown' }
  /* A retired or revoked row being presented again is the reuse signal, and it
   * is checked before the digest: a rotated-out token has the *right* digest
   * for the row it names until the row is overwritten, and an attacker
   * presenting a revoked token must not be told merely "expired". */
  if (session.revokedAt || session.replacedBy) return { kind: 'reused', session }
  if (!digestsMatch(session.refreshTokenHash, secretHash)) return { kind: 'reused', session }
  if (session.expiresAt.getTime() <= now.getTime()) return { kind: 'expired', session }
  return { kind: 'valid', session }
}

/** Retires `session` and records which row replaced it. */
export async function retire(
  tx: Tx,
  principal: Principal,
  session: SessionRow,
  replacedById: string,
): Promise<void> {
  await tx
    .update(userSessions)
    .set({ revokedAt: new Date(), replacedBy: replacedById, updatedBy: principal.userId })
    .where(eq(userSessions.id, session.id))
}

/** Revokes every live session in a family. Returns how many were still live,
 *  which is the number that goes in the security event. */
export async function revokeFamily(
  tx: Tx,
  principal: Principal,
  familyId: string,
): Promise<number> {
  const rows = await tx
    .update(userSessions)
    .set({ revokedAt: new Date(), updatedBy: principal.userId })
    .where(and(eq(userSessions.familyId, familyId), isNull(userSessions.revokedAt)))
    .returning({ id: userSessions.id })
  return rows.length
}

/** Revokes one session by id. Returns false when the id names nothing this
 *  principal can see — which, under RLS, includes another user's session. */
export async function revokeSession(
  tx: Tx,
  principal: Principal,
  sessionId: string,
): Promise<boolean> {
  const rows = await tx
    .update(userSessions)
    .set({ revokedAt: new Date(), updatedBy: principal.userId })
    .where(
      and(
        eq(userSessions.id, sessionId),
        eq(userSessions.userId, principal.userId),
        isNull(userSessions.revokedAt),
      ),
    )
    .returning({ id: userSessions.id })
  return rows.length > 0
}

/** Signs every device out. `exceptId` keeps the caller's current session alive,
 *  which is what "sign out my other devices" means. */
export async function revokeAllSessions(
  tx: Tx,
  principal: Principal,
  exceptId?: string,
): Promise<number> {
  const rows = await tx
    .update(userSessions)
    .set({ revokedAt: new Date(), updatedBy: principal.userId })
    .where(
      and(
        eq(userSessions.userId, principal.userId),
        isNull(userSessions.revokedAt),
        exceptId ? sql`${userSessions.id} <> ${exceptId}` : sql`true`,
      ),
    )
    .returning({ id: userSessions.id })
  return rows.length
}

export interface DeviceSummary {
  id: string
  current: boolean
  userAgent: string | null
  ip: string | null
  createdAt: string
  expiresAt: string
  lastRotatedAt: string
}

/** The device list. Never returns the token digest — a session list that leaks
 *  the credential it is listing would be worse than not having one. */
export async function listSessions(
  tx: Tx,
  principal: Principal,
  currentId?: string,
): Promise<DeviceSummary[]> {
  const rows = await tx
    .select({
      id: userSessions.id,
      userAgent: userSessions.userAgent,
      ip: userSessions.ip,
      createdAt: userSessions.createdAt,
      updatedAt: userSessions.updatedAt,
      expiresAt: userSessions.expiresAt,
    })
    .from(userSessions)
    .where(
      and(
        eq(userSessions.userId, principal.userId),
        isNull(userSessions.revokedAt),
        isNull(userSessions.deletedAt),
        gt(userSessions.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(userSessions.createdAt))

  return rows.map((row) => ({
    id: row.id,
    current: row.id === currentId,
    userAgent: row.userAgent,
    ip: row.ip,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    lastRotatedAt: row.updatedAt.toISOString(),
  }))
}

export function newFamilyId(): string {
  return ulid()
}

export function newSessionId(): string {
  return ulid()
}
