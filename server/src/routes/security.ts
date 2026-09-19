/** `GET /security/summary` — the security policy this deployment actually
 *  enforces, and how many of the caller's sessions are currently live.
 *
 *  `Security-Settings` used to hold six hand-picked values: a password
 *  minimum, a "Require 2FA" toggle, a session timeout, a max-login-attempts
 *  figure, an "IP Whitelist Enabled" toggle and an audit-log retention
 *  period — none of it read from anywhere, all of it a plausible-looking
 *  guess. Three of those six describe features this system does not have at
 *  all (2FA, IP allow-listing, audit-log retention) and are dropped rather
 *  than re-sourced. The other three are genuinely enforced, just not by a
 *  database row:
 *
 *  - **`passwordMinLength`** — `MIN_PASSWORD_LENGTH` (`auth/password.ts`),
 *    the same constant `checkPasswordPolicy` rejects a weak password against
 *    on every sign-up and password change.
 *  - **`loginMaxAttempts` / `loginLockoutSeconds`** — `AuthConfig`'s
 *    `LOGIN_MAX_ATTEMPTS` / `LOGIN_LOCKOUT_SECONDS`, the same figures
 *    `LoginThrottle` (`auth/service.ts`) locks a repeatedly-failing sign-in
 *    out with.
 *  - **`refreshTokenTtlDays`** — `AuthConfig`'s `REFRESH_TOKEN_TTL_DAYS`,
 *    how long a signed-in session stays valid before it must sign in again.
 *
 *  **`activeSessions`** is a real count from `user_sessions`
 *  (`revoked_at IS NULL AND expires_at > now()`), read the ordinary way
 *  through `withTenant` with no scope override — the same row-level policy
 *  that narrows every other read narrows this one: an owner sees every
 *  live session in the organization, a `own`-scoped role sees only its own.
 *  That is not a special case written for this endpoint; it is what the
 *  policy already does for anyone who queries this table.
 *
 *  **Authenticated but ungated**, the same reasoning as `GET /organization`:
 *  nothing returned here is more sensitive than the policy already printed
 *  on every sign-up and login-lockout error message, and the row-level
 *  policy — not an RBAC module — is what keeps one caller from seeing past
 *  their own scope on the one figure (`activeSessions`) that could vary by
 *  caller.
 */
import { and, gt, isNull, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { AuthConfig } from '../auth/config'
import { MIN_PASSWORD_LENGTH } from '../auth/password'
import type { Database } from '../db/client'
import { userSessions } from '../db/schema'
import { withTenant } from '../db/tenant'
import { principalOf } from '../http/context'

export interface SecurityDeps {
  db: Database
  authConfig: AuthConfig
}

export function registerSecurityRoutes(app: FastifyInstance, deps: SecurityDeps): void {
  app.get('/security/summary', async (request) => {
    const principal = principalOf(request)

    const activeSessions = await withTenant(deps.db, principal, async (tx) => {
      const [row] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(userSessions)
        .where(and(isNull(userSessions.revokedAt), gt(userSessions.expiresAt, new Date())))
      return row?.count ?? 0
    })

    return {
      passwordMinLength: MIN_PASSWORD_LENGTH,
      loginMaxAttempts: deps.authConfig.LOGIN_MAX_ATTEMPTS,
      loginLockoutSeconds: deps.authConfig.LOGIN_LOCKOUT_SECONDS,
      refreshTokenTtlDays: deps.authConfig.REFRESH_TOKEN_TTL_DAYS,
      activeSessions,
    }
  })
}
