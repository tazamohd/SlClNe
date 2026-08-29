/** The authentication plane's database context.
 *
 *  Every other part of the API runs inside `withTenant`, which pins
 *  `app.org_id` before a single row is read. Authentication cannot: the whole
 *  point of signing in is that the tenant is not known yet. `POST /auth/login`
 *  is handed an email address and has to find which organization it belongs to.
 *
 *  So this module is the one place that opens a transaction with **platform**
 *  scope, and it is deliberately small and deliberately loud about it. Three
 *  rules hold for anything using it:
 *
 *  1. Only `src/auth/**` may call it. `tests/isolation-plane.test.ts` fails if
 *     another module imports it.
 *  2. Every query inside it is keyed by a value the caller *proved* — an email
 *     plus a password that verified, or a session id out of a JWT we signed.
 *     Never by a value the caller merely asserted.
 *  3. The moment a principal exists, work moves to `withTenant`. Nothing that
 *     could run under a tenant context runs here.
 *
 *  `sessionPrincipal` is how rule 3 is kept: it turns verified refresh-token
 *  claims into an ordinary tenant principal whose scope is `own`, so the
 *  session table's row-level policies apply to session management exactly as
 *  they apply to everything else.
 */
import { sql } from 'drizzle-orm'
import type { RoleId } from '@salis/contract'
import type { Database } from '../db/client'
import type { Principal, Tx } from '../db/tenant'

/** Runs `fn` in a transaction that can see every tenant. Authentication only. */
export async function withAuthPlane<T>(db: Database, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.scope', 'platform', true)`)
    return fn(tx as Tx)
  })
}

/** A principal for operating on one's own sessions.
 *
 *  `scope: 'own'` is not cosmetic. `user_sessions` carries the `r_own`
 *  restrictive policy (`user_id = app_user()`), so under this principal the
 *  database itself refuses to return, revoke or rotate another user's session —
 *  even if a handler asked it to by id. The role is carried only for the audit
 *  row's `actor_role`; nothing authorizes off it. */
export function sessionPrincipal(claims: {
  userId: string
  orgId: string
  branchId: string | null
  role: RoleId
}): Principal {
  return {
    userId: claims.userId,
    orgId: claims.orgId,
    branchId: claims.branchId,
    role: claims.role,
    scope: 'own',
  }
}
