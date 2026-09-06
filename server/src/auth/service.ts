/** The authentication service: everything `API_ENDPOINTS.md` §Auth promises,
 *  with the database work in one place and the HTTP shape in `routes.ts`.
 *
 *  The properties worth stating, because they are the ones a reviewer should
 *  check rather than take on trust:
 *
 *  - **The role always comes from the database, never from a token.** A refresh
 *    re-reads the user row, so a role that was revoked or downgraded stops
 *    working within the access token's fifteen minutes rather than within the
 *    refresh token's thirty days.
 *  - **Failure messages do not distinguish "no such user" from "wrong
 *    password".** Both are `invalid credentials`, and both pay for an argon2
 *    verification, so neither the message nor the clock enumerates accounts.
 *  - **`forgot-password` always answers the same way.** Whether or not the
 *    address exists. Anything else is a user directory with a web form.
 *  - **A password change signs every device out.** Changing a password because
 *    it may have leaked is worthless if the sessions opened with it survive.
 */
import { and, eq, isNull } from 'drizzle-orm'
import { ulid } from 'ulid'
import { roleId, type RoleId } from '@salis/contract'
import { writeAudit } from '../audit/audit'
import { branches, organizations, users } from '../db/schema'
import type { Database } from '../db/client'
import { withTenant, type Principal, type Tx } from '../db/tenant'
import { sessionPrincipal, withAuthPlane } from './context'
import type { AuthConfig } from './config'
import {
  ResendTooSoon,
  issueChallenge,
  recoveryToken,
  verifyChallenge,
  verifyRecoveryToken,
  type OtpChannel,
  type OtpTransport,
} from './otp'
import { checkPasswordPolicy, hashPassword, needsRehash, verifyPassword } from './password'
import {
  createSession,
  judge,
  listSessions,
  loadSession,
  newFamilyId,
  newSessionId,
  retire,
  revokeAllSessions,
  revokeFamily,
  revokeSession,
  type DeviceSummary,
} from './sessions'
import { InvalidRefreshToken, hashSecret, type TokenSigner } from './tokens'

export class AuthFailure extends Error {
  readonly code: 'invalid_credentials' | 'account_disabled' | 'session_invalid' | 'reuse_detected'
  constructor(code: AuthFailure['code'], message: string) {
    super(message)
    this.name = 'AuthFailure'
    this.code = code
  }
}

export class LockedOut extends Error {
  readonly retryAfterSeconds: number
  constructor(retryAfterSeconds: number) {
    super(`Too many failed sign-in attempts. Try again in ${retryAfterSeconds}s.`)
    this.name = 'LockedOut'
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  /** The role every check runs against: the acting role when one is set. */
  role: RoleId
  /** The role the account actually holds. Differs from `role` only while the
   *  `test` account is acting as another one. */
  baseRole: RoleId
  orgId: string
  branchId: string | null
  status: string
}

/** The only role permitted to act as another one. */
const SWITCHABLE_BASE_ROLE: RoleId = 'test'

export class RegistrationRefused extends Error {
  readonly code: 'email_taken' | 'weak_password'
  readonly field: string
  constructor(code: RegistrationRefused['code'], message: string, field: string) {
    super(message)
    this.name = 'RegistrationRefused'
    this.code = code
    this.field = field
  }
}

export class RoleSwitchRefused extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RoleSwitchRefused'
  }
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
  sessionId: string
}

export interface RequestFacts {
  ip?: string
  userAgent?: string
  requestId?: string
}

/** Brute-force throttle.
 *
 *  In-process, and honestly so: with more than one API instance an attacker
 *  gets `LOGIN_MAX_ATTEMPTS` per instance rather than in total. It is a
 *  speed bump on top of the per-IP rate limiter, not a distributed lockout;
 *  moving it to the database or to Redis is a deliberate future step, recorded
 *  rather than implied. */
export class LoginThrottle {
  private readonly failures = new Map<string, { count: number; until: number }>()

  constructor(private readonly config: AuthConfig) {}

  check(key: string, now = Date.now()): void {
    const entry = this.failures.get(key)
    if (!entry) return
    if (entry.until > now) {
      throw new LockedOut(Math.ceil((entry.until - now) / 1000))
    }
    if (entry.until !== 0 && entry.until <= now) this.failures.delete(key)
  }

  fail(key: string, now = Date.now()): void {
    const entry = this.failures.get(key) ?? { count: 0, until: 0 }
    entry.count += 1
    if (entry.count >= this.config.LOGIN_MAX_ATTEMPTS) {
      entry.until = now + this.config.LOGIN_LOCKOUT_SECONDS * 1000
      entry.count = 0
    }
    this.failures.set(key, entry)
  }

  succeed(key: string): void {
    this.failures.delete(key)
  }
}

export interface AuthDeps {
  db: Database
  config: AuthConfig
  signer: TokenSigner
  transport: OtpTransport
  throttle: LoginThrottle
}

type UserRow = typeof users.$inferSelect

function toUser(row: UserRow): AuthenticatedUser {
  const parsed = roleId.safeParse(row.role)
  if (!parsed.success) {
    /* A role in the database that is not one of the matrix's is a data defect,
     * and the safe reading of it is *no access*, not a default. Failing closed
     * here is the server-side half of F-006. */
    throw new AuthFailure(
      'account_disabled',
      'This account carries a role the system does not recognise. Contact an administrator.',
    )
  }
  /* `acting_role` is read with the same suspicion as `role`: an unparseable
   * value is a data defect, and the safe reading of a defect is the account's
   * own role rather than a guess. A stored acting role is honoured only for the
   * one account allowed to have set it, so a value written into this column for
   * any other user grants nothing. */
  const acting = row.actingRole ? roleId.safeParse(row.actingRole) : null
  const effective =
    acting?.success && parsed.data === SWITCHABLE_BASE_ROLE ? acting.data : parsed.data
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: effective,
    baseRole: parsed.data,
    orgId: row.orgId,
    branchId: row.branchId,
    status: row.status,
  }
}

function principalOf(user: AuthenticatedUser): Principal {
  return sessionPrincipal({
    userId: user.id,
    orgId: user.orgId,
    branchId: user.branchId,
    role: user.role,
  })
}


/** A URL-safe, unique-in-the-database slug for a newly registered tenant.
 *
 *  Derived from the organization's name, falling back to the local part of the
 *  registrant's address when the name transliterates to nothing (an all-Arabic
 *  workshop name does exactly that). A numeric suffix resolves collisions;
 *  slugs are not secrets and a predictable one is fine. */
async function uniqueSlug(tx: Tx, orgName: string, email: string): Promise<string> {
  const base =
    orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || email.split('@')[0].replace(/[^a-z0-9]+/g, '-').slice(0, 60) || 'workshop'
  for (let attempt = 0; ; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`
    const clash = await tx
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, candidate))
      .limit(1)
    if (clash.length === 0) return candidate
  }
}

export function createAuthService(deps: AuthDeps) {
  const { db, config, signer, transport, throttle } = deps

  /** Issues a token pair and the session row behind it. */
  async function openSession(
    user: AuthenticatedUser,
    facts: RequestFacts,
    familyId = newFamilyId(),
  ): Promise<TokenPair> {
    const principal = principalOf(user)
    /* The session id is chosen before anything is written, so the refresh token
     * can be signed for the row that is about to exist. One insert carrying the
     * real digest, rather than an insert with a placeholder and a follow-up
     * update that could be interrupted between the two. */
    const sessionId = newSessionId()
    const refresh = await signer.signRefreshToken({
      sessionId,
      familyId,
      userId: user.id,
      orgId: user.orgId,
      branchId: user.branchId,
    })
    return withTenant(db, principal, async (tx) => {
      await createSession(tx, principal, {
        id: sessionId,
        familyId,
        secretHash: refresh.secretHash,
        expiresAt: new Date(Date.now() + signer.refreshTokenTtlSeconds * 1000),
        userAgent: facts.userAgent ?? null,
        ip: facts.ip ?? null,
      })
      await tx.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id))
      const accessToken = await signer.signAccessToken({
        userId: user.id,
        role: user.role,
        orgId: user.orgId,
        branchId: user.branchId,
        name: user.name,
      })
      return {
        accessToken,
        refreshToken: refresh.token,
        expiresIn: signer.accessTokenTtlSeconds,
        tokenType: 'Bearer' as const,
        sessionId,
      }
    })
  }

  return {
    /** `POST /auth/login`. */
    async login(
      input: { email: string; password: string; orgSlug?: string },
      facts: RequestFacts,
    ): Promise<{ tokens: TokenPair; user: AuthenticatedUser }> {
      const email = input.email.trim().toLowerCase()
      const throttleKey = `${email}|${facts.ip ?? 'no-ip'}`
      throttle.check(throttleKey)

      /* The one query that genuinely spans tenants: an email address does not
       * say which organization it belongs to. Everything after this runs under
       * the user's own tenant context. */
      const candidates = await withAuthPlane(db, async (tx) =>
        tx
          .select()
          .from(users)
          .where(and(eq(users.email, email), isNull(users.deletedAt))),
      )

      const matched = input.orgSlug
        ? candidates.filter((row) => row.orgId === input.orgSlug)
        : candidates

      if (matched.length > 1) {
        /* The unique index is (org_id, email), so one address can legitimately
         * exist in two tenants. Guessing which one is meant would sign the user
         * into the wrong organization, which is a tenancy breach dressed as a
         * convenience. */
        throttle.fail(throttleKey)
        throw new AuthFailure(
          'invalid_credentials',
          'That email address exists in more than one organization. Sign in from your organization’s address.',
        )
      }

      const row = matched[0]
      const ok = await verifyPassword(input.password, row?.passwordHash ?? null, config)
      if (!row || !ok) {
        throttle.fail(throttleKey)
        throw new AuthFailure('invalid_credentials', 'That email or password is not correct.')
      }
      if (row.status !== 'active') {
        throttle.fail(throttleKey)
        throw new AuthFailure('account_disabled', 'This account is not active.')
      }

      const user = toUser(row)
      throttle.succeed(throttleKey)

      /* Cost parameters can be raised without a migration: a hash made under
       * weaker settings is upgraded the moment its owner proves they know the
       * password. */
      if (row.passwordHash && needsRehash(row.passwordHash, config)) {
        const upgraded = await hashPassword(input.password, config)
        await withTenant(db, principalOf(user), async (tx) => {
          await tx.update(users).set({ passwordHash: upgraded }).where(eq(users.id, user.id))
        })
      }

      const tokens = await openSession(user, facts)
      await withTenant(db, principalOf(user), async (tx) => {
        await writeAudit(tx, {
          actor: principalOf(user),
          action: 'create',
          entity: 'session',
          entityId: tokens.sessionId,
          after: { event: 'login' },
          ...facts,
        })
      })
      return { tokens, user }
    },

    /** `POST /auth/register` — a brand-new organization and its first user.
     *
     *  Sign-up is the one flow with no tenant to run in: the caller is asking
     *  for the organization to exist. So it runs on the authentication plane,
     *  like `login`, and it is deliberately the smallest thing that can be
     *  called sign-up — one organization, its main branch, and one `owner` who
     *  is the owner of *that* organization and of nothing else.
     *
     *  The role is not an input. A public endpoint that took one would be a
     *  self-service grant of any role in the matrix; what a registrant gets is
     *  ownership of the tenant they just created, which is the only authority
     *  that can be handed out without anybody deciding to hand it out.
     *
     *  A taken address is answered as a conflict rather than silently, because
     *  registration cannot be made non-enumerable in any case — an address that
     *  is free can be registered, and that is observable whatever the response
     *  says. Login and password recovery, where the leak is avoidable, still
     *  answer identically for known and unknown addresses.
     */
    async register(
      input: { name: string; email: string; password: string; phone?: string; organizationName?: string },
      facts: RequestFacts,
    ): Promise<{ tokens: TokenPair; user: AuthenticatedUser }> {
      const email = input.email.trim().toLowerCase()
      const name = input.name.trim()
      const policy = checkPasswordPolicy(input.password)
      if (policy) throw new RegistrationRefused('weak_password', policy.message, policy.field)

      const taken = await withAuthPlane(db, async (tx) =>
        tx
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.email, email), isNull(users.deletedAt)))
          .limit(1),
      )
      if (taken.length > 0) {
        throw new RegistrationRefused(
          'email_taken',
          'That email address already has an account. Sign in instead, or use password recovery.',
          'email',
        )
      }

      const orgName = input.organizationName?.trim() || `${name}’s Workshop`
      const passwordHash = await hashPassword(input.password, config)
      const orgId = ulid()
      const branchId = ulid()
      const userId = ulid()

      const created = await withAuthPlane(db, async (tx) => {
        await tx.insert(organizations).values({
          id: orgId,
          name: orgName,
          slug: await uniqueSlug(tx, orgName, email),
          plan: 'starter',
          status: 'active',
        })
        await tx.insert(branches).values({
          id: branchId,
          orgId,
          branchId,
          name: 'Main Branch',
          isMain: true,
          createdBy: userId,
          updatedBy: userId,
        })
        const [row] = await tx
          .insert(users)
          .values({
            id: userId,
            orgId,
            branchId,
            email,
            name,
            role: 'owner',
            passwordHash,
            status: 'active',
            createdBy: userId,
            updatedBy: userId,
          })
          .returning()
        return toUser(row as UserRow)
      })

      const tokens = await openSession(created, facts)
      const principal = principalOf(created)
      await withTenant(db, principal, async (tx) => {
        await writeAudit(tx, {
          actor: principal,
          action: 'create',
          entity: 'organization',
          entityId: orgId,
          after: { event: 'registered', name: orgName, branchId },
          ...facts,
        })
        await writeAudit(tx, {
          actor: principal,
          action: 'create',
          entity: 'user',
          entityId: created.id,
          /* `phone` is recorded as *given*, not stored on the user row: there
           * is no column for it, and an audit entry claiming a field the row
           * does not carry would be a fiction the log is meant to be free of. */
          after: { event: 'registered', email, role: created.role, phoneProvided: !!input.phone?.trim() },
          ...facts,
        })
      })
      return { tokens, user: created }
    },

    /** `POST /auth/switch-role` — the `test` account acts as another role.
     *
     *  Two things make this a feature rather than a privilege-escalation hole:
     *  the caller must already hold `test`, which no business account does and
     *  which is granted only by provisioning; and switching *narrows* as often
     *  as it widens — acting as a technician gives the `own` data scope and a
     *  zero approval ceiling, enforced by row-level security exactly as it is
     *  for a real technician.
     *
     *  The acting role is written to the user row rather than minted into a
     *  token, so every later request re-reads it: the switch survives a refresh
     *  and is revoked by one, and the audit log records who switched, from what
     *  to what, and when. */
    async switchRole(
      principal: Principal,
      role: string,
      facts: RequestFacts,
    ): Promise<{ tokens: TokenPair; user: AuthenticatedUser }> {
      const target = roleId.safeParse(role)
      if (!target.success) {
        throw new RoleSwitchRefused(`"${role}" is not a role this system defines.`)
      }

      const [row] = await withTenant(db, { ...principal, scope: 'own' }, async (tx) =>
        tx
          .select()
          .from(users)
          .where(and(eq(users.id, principal.userId), isNull(users.deletedAt)))
          .limit(1),
      )
      if (!row) throw new AuthFailure('session_invalid', 'That session no longer exists.')

      const current = toUser(row)
      if (current.baseRole !== SWITCHABLE_BASE_ROLE) {
        /* Refused on the account's *own* role, never on the acting one: an
         * account that switched into `owner` must not be able to keep switching
         * because `owner` looks powerful, and one that is not the test account
         * must not be able to switch at all. */
        throw new RoleSwitchRefused('This account may not act as another role.')
      }

      /* Acting as `test` is how the account returns to itself, so it clears the
       * column rather than storing the base role back into it. */
      const acting = target.data === SWITCHABLE_BASE_ROLE ? null : target.data
      const updated = await withTenant(db, { ...principal, scope: 'own' }, async (tx) => {
        const [next] = await tx
          .update(users)
          .set({ actingRole: acting, updatedAt: new Date(), updatedBy: current.id })
          .where(eq(users.id, current.id))
          .returning()
        const user = toUser(next as UserRow)
        await writeAudit(tx, {
          actor: principalOf(current),
          action: 'update',
          entity: 'user',
          entityId: current.id,
          before: { actingRole: current.role },
          after: { event: 'role_switched', actingRole: user.role },
          ...facts,
        })
        return user
      })

      /* A fresh pair so the caller is not carrying an access token that still
       * claims the old role for up to its full lifetime. The previous session's
       * refresh token stays valid and picks the new role up on its next
       * rotation — the role is read from the row, never from the token. */
      const tokens = await openSession(updated, facts)
      return { tokens, user: updated }
    },

    /** `POST /auth/refresh` — rotating, with reuse detection. */
    async refresh(refreshToken: string, facts: RequestFacts): Promise<{ tokens: TokenPair; user: AuthenticatedUser }> {
      let claims
      try {
        claims = await signer.verifyRefreshToken(refreshToken)
      } catch (error) {
        throw new AuthFailure(
          'session_invalid',
          error instanceof InvalidRefreshToken ? error.message : 'That refresh token is not valid.',
        )
      }

      /* Keyed by ids out of a token this server signed, and re-read rather than
       * trusted: the role on the token is never used. */
      const [row] = await withAuthPlane(db, async (tx) =>
        tx
          .select()
          .from(users)
          .where(and(eq(users.id, claims.userId), eq(users.orgId, claims.orgId), isNull(users.deletedAt)))
          .limit(1),
      )
      if (!row) throw new AuthFailure('session_invalid', 'That session no longer exists.')
      if (row.status !== 'active') throw new AuthFailure('account_disabled', 'This account is not active.')

      const user = toUser(row)
      const principal = principalOf(user)
      const secretHash = hashSecret(claims.secret)

      const outcome = await withTenant(db, principal, async (tx) => {
        const session = await loadSession(tx, claims.sessionId)
        const verdict = judge(session, secretHash)

        if (verdict.kind === 'reused') {
          /* The whole family goes. See the module comment in `sessions.ts`:
           * one refresh is the most a stolen token can buy, and the theft
           * becomes visible because the real user is signed out. */
          const revoked = await revokeFamily(tx, principal, verdict.session.familyId)
          await writeAudit(tx, {
            actor: principal,
            action: 'reject',
            entity: 'session',
            entityId: verdict.session.id,
            reason: 'refresh_token_reuse',
            after: {
              event: 'refresh_token_reuse',
              familyId: verdict.session.familyId,
              sessionsRevoked: revoked,
            },
            ...facts,
          })
          return { kind: 'reused' as const }
        }
        if (verdict.kind !== 'valid') return { kind: verdict.kind }

        const nextId = newSessionId()
        const refreshed = await signer.signRefreshToken({
          sessionId: nextId,
          familyId: verdict.session.familyId,
          userId: user.id,
          orgId: user.orgId,
          branchId: user.branchId,
        })
        await createSession(tx, principal, {
          id: nextId,
          familyId: verdict.session.familyId,
          secretHash: refreshed.secretHash,
          expiresAt: new Date(Date.now() + signer.refreshTokenTtlSeconds * 1000),
          userAgent: facts.userAgent ?? verdict.session.userAgent,
          ip: facts.ip ?? verdict.session.ip,
        })
        await retire(tx, principal, verdict.session, nextId)
        await writeAudit(tx, {
          actor: principal,
          action: 'update',
          entity: 'session',
          entityId: nextId,
          before: { sessionId: verdict.session.id },
          after: { event: 'refresh_rotated', familyId: verdict.session.familyId },
          ...facts,
        })
        return { kind: 'rotated' as const, sessionId: nextId, refreshToken: refreshed.token }
      })

      if (outcome.kind === 'reused') {
        throw new AuthFailure(
          'reuse_detected',
          'This refresh token was already used. Every session in its family has been signed out. Sign in again.',
        )
      }
      if (outcome.kind !== 'rotated') {
        throw new AuthFailure('session_invalid', 'That session has expired or been signed out.')
      }

      const accessToken = await signer.signAccessToken({
        userId: user.id,
        role: user.role,
        orgId: user.orgId,
        branchId: user.branchId,
        name: user.name,
      })
      return {
        tokens: {
          accessToken,
          refreshToken: outcome.refreshToken,
          expiresIn: signer.accessTokenTtlSeconds,
          tokenType: 'Bearer',
          sessionId: outcome.sessionId,
        },
        user,
      }
    },

    /** `POST /auth/logout` — invalidates the presented refresh token.
     *
     *  Idempotent on purpose: signing out twice is not an error, and telling a
     *  caller that a token was already invalid is information they should not
     *  need and an attacker should not get. */
    async logout(refreshToken: string, facts: RequestFacts): Promise<void> {
      let claims
      try {
        claims = await signer.verifyRefreshToken(refreshToken)
      } catch {
        return
      }
      const [row] = await withAuthPlane(db, async (tx) =>
        tx.select().from(users).where(eq(users.id, claims.userId)).limit(1),
      )
      if (!row) return
      const principal = principalOf(toUser(row))
      await withTenant(db, principal, async (tx) => {
        const revoked = await revokeSession(tx, principal, claims.sessionId)
        if (!revoked) return
        await writeAudit(tx, {
          actor: principal,
          action: 'delete',
          entity: 'session',
          entityId: claims.sessionId,
          after: { event: 'logout' },
          ...facts,
        })
      })
    },

    /** The device list for the signed-in user. */
    async sessions(principal: Principal, currentSessionId?: string): Promise<DeviceSummary[]> {
      return withTenant(db, { ...principal, scope: 'own' }, async (tx) =>
        listSessions(tx, principal, currentSessionId),
      )
    },

    /** Revoke one device. */
    async revokeOne(principal: Principal, sessionId: string, facts: RequestFacts): Promise<boolean> {
      return withTenant(db, { ...principal, scope: 'own' }, async (tx) => {
        const revoked = await revokeSession(tx, principal, sessionId)
        if (revoked) {
          await writeAudit(tx, {
            actor: principal,
            action: 'delete',
            entity: 'session',
            entityId: sessionId,
            after: { event: 'session_revoked' },
            ...facts,
          })
        }
        return revoked
      })
    },

    /** Revoke every device, optionally keeping the current one. */
    async revokeAll(
      principal: Principal,
      options: { exceptSessionId?: string },
      facts: RequestFacts,
    ): Promise<number> {
      return withTenant(db, { ...principal, scope: 'own' }, async (tx) => {
        const count = await revokeAllSessions(tx, principal, options.exceptSessionId)
        await writeAudit(tx, {
          actor: principal,
          action: 'delete',
          entity: 'session',
          entityId: null,
          after: { event: 'all_sessions_revoked', count, kept: options.exceptSessionId ?? null },
          ...facts,
        })
        return count
      })
    },

    /** `POST /auth/forgot-password`.
     *
     *  Answers identically for a known and an unknown address. The challenge is
     *  only created when there is somebody to create it for, but the caller
     *  cannot tell the difference from the response or from its timing beyond
     *  the noise a network already adds. */
    async forgotPassword(email: string, facts: RequestFacts): Promise<{ cooldownSeconds: number }> {
      const normalized = email.trim().toLowerCase()
      const rows = await withAuthPlane(db, async (tx) =>
        tx
          .select()
          .from(users)
          .where(and(eq(users.email, normalized), isNull(users.deletedAt))),
      )
      if (rows.length !== 1) return { cooldownSeconds: config.OTP_RESEND_SECONDS }

      const user = toUser(rows[0] as UserRow)
      try {
        const challenge = await withAuthPlane(db, async (tx) =>
          issueChallenge(tx, { channel: 'reset', destination: user.id }, config),
        )
        await transport.send({
          channel: 'reset',
          destination: user.email,
          code: recoveryToken(challenge),
        })
        await withTenant(db, principalOf(user), async (tx) => {
          await writeAudit(tx, {
            actor: principalOf(user),
            action: 'create',
            entity: 'password_reset',
            entityId: challenge.id,
            after: { event: 'reset_requested' },
            ...facts,
          })
        })
      } catch (error) {
        if (error instanceof ResendTooSoon) return { cooldownSeconds: error.retryAfterSeconds }
        throw error
      }
      return { cooldownSeconds: config.OTP_RESEND_SECONDS }
    },

    /** `POST /auth/reset-password`. */
    async resetPassword(
      input: { token: string; password: string },
      facts: RequestFacts,
    ): Promise<{ ok: true } | { ok: false; reason: string }> {
      const policy = checkPasswordPolicy(input.password)
      if (policy) return { ok: false, reason: policy.message }

      const verdict = await withAuthPlane(db, async (tx) =>
        verifyRecoveryToken(tx, input.token, config),
      )
      if (verdict.kind !== 'verified') {
        return { ok: false, reason: 'That recovery link is invalid or has expired.' }
      }

      const [row] = await withAuthPlane(db, async (tx) =>
        tx.select().from(users).where(eq(users.id, verdict.destination)).limit(1),
      )
      if (!row) return { ok: false, reason: 'That recovery link is invalid or has expired.' }

      const user = toUser(row)
      const principal = principalOf(user)
      const hashed = await hashPassword(input.password, config)
      await withTenant(db, principal, async (tx) => {
        await tx.update(users).set({ passwordHash: hashed, updatedBy: user.id }).where(eq(users.id, user.id))
        /* Every device, including the one doing the reset. A password changed
         * because it may have leaked is worthless if the sessions opened with
         * it survive. */
        const revoked = await revokeAllSessions(tx, principal)
        await writeAudit(tx, {
          actor: principal,
          action: 'update',
          entity: 'user',
          entityId: user.id,
          after: { event: 'password_reset', sessionsRevoked: revoked },
          ...facts,
        })
      })
      return { ok: true }
    },

    /** Sets a password directly. Used by administrative provisioning and by the
     *  test suite; never reachable without an already-authorized caller. */
    async setPassword(
      actor: Principal,
      target: { userId: string },
      password: string,
      facts: RequestFacts,
    ): Promise<void> {
      const policy = checkPasswordPolicy(password)
      if (policy) throw new AuthFailure('invalid_credentials', policy.message)
      const hashed = await hashPassword(password, config)
      await withTenant(db, actor, async (tx) => {
        const updated = await tx
          .update(users)
          .set({ passwordHash: hashed, updatedBy: actor.userId })
          .where(and(eq(users.id, target.userId), isNull(users.deletedAt)))
          .returning({ id: users.id })
        if (updated.length === 0) {
          throw new AuthFailure('invalid_credentials', 'No such user in this organization.')
        }
        await writeAudit(tx, {
          actor,
          action: 'update',
          entity: 'user',
          entityId: target.userId,
          after: { event: 'password_set' },
          ...facts,
        })
      })
    },

    /** `POST /auth/request-otp` — the issuing half of `verify-otp`. */
    async requestOtp(input: {
      channel: Exclude<OtpChannel, 'reset'>
      destination: string
    }): Promise<{ cooldownSeconds: number; transport: string }> {
      const challenge = await withAuthPlane(db, async (tx) =>
        issueChallenge(tx, { channel: input.channel, destination: input.destination }, config),
      )
      await transport.send({
        channel: input.channel,
        destination: input.destination,
        code: challenge.code,
      })
      return { cooldownSeconds: config.OTP_RESEND_SECONDS, transport: transport.name }
    },

    /** `POST /auth/verify-otp`. */
    async verifyOtp(input: { destination: string; code: string }) {
      return withAuthPlane(db, async (tx) =>
        verifyChallenge(tx, { destination: input.destination, code: input.code }, config),
      )
    },

    /** `GET /auth/me`. */
    async me(principal: Principal): Promise<AuthenticatedUser | null> {
      const [row] = await withTenant(db, principal, async (tx) =>
        tx
          .select()
          .from(users)
          .where(and(eq(users.id, principal.userId), isNull(users.deletedAt)))
          .limit(1),
      )
      return row ? toUser(row) : null
    },
  }
}

export type AuthService = ReturnType<typeof createAuthService>
