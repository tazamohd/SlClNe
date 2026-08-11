/** The `API_ENDPOINTS.md` §Auth surface.
 *
 *  Two groups, and the split is the security boundary:
 *
 *  - **Public** — login, refresh, logout, password recovery, OTP and the
 *    unconfigured provider stubs. These run before a principal exists, so they
 *    carry their own rate limits rather than inheriting the per-tenant one
 *    (there is no tenant yet to key it on).
 *  - **Authenticated** — `/auth/me`, the device list and revocation. These go
 *    through the same `onRequest` verification as every other route; nothing
 *    here re-implements token checking.
 *
 *  `isPublicAuthPath` is exported for `app.ts`, so the list of paths that skip
 *  authentication is written once, next to the handlers it describes, instead
 *  of drifting apart in two files.
 */
import { z } from 'zod'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { PERMS, ROLE_META, type ModuleId } from '@salis/contract'
import { badRequest } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { GRANT_ACTIONS, describeAction } from '../security/actions'
import { ceilingHalalas } from '../security/approvals'
import type { AuthConfig } from './config'
import { ProviderNotConfigured, providerStatus, type Providers } from './providers'
import { ResendTooSoon, TransportUnavailable } from './otp'
import { AuthFailure, LockedOut, type AuthService, type RequestFacts } from './service'

const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/request-otp',
  '/auth/verify-otp',
  '/auth/2fa/enrol',
  '/auth/2fa/verify',
  '/auth/biometric/enrol',
  '/auth/biometric/challenge',
  '/auth/sso/start',
  '/auth/sso/callback',
  '/auth/providers',
] as const

const PUBLIC_AUTH_PREFIXES = ['/auth/social/'] as const

/** Does this request path skip the access-token check?
 *
 *  Matched against the full path including the API prefix, and anchored: a
 *  path merely *containing* `/auth/login` is not public. */
export function isPublicAuthPath(path: string, apiPrefix = '/api/v1'): boolean {
  if (!path.startsWith(apiPrefix)) return false
  const rest = path.slice(apiPrefix.length)
  return (
    (PUBLIC_AUTH_PATHS as readonly string[]).includes(rest) ||
    PUBLIC_AUTH_PREFIXES.some((prefix) => rest.startsWith(prefix) && rest.length > prefix.length)
  )
}

const loginBody = z.object({
  email: z.string().trim().min(3).max(254),
  password: z.string().min(1).max(200),
  /** Optional tenant hint. One address can legitimately exist in two
   *  organizations — the unique index is `(org_id, email)`. */
  orgSlug: z.string().trim().min(1).max(80).optional(),
})

const refreshBody = z.object({ refreshToken: z.string().min(10).max(4096) })
const forgotBody = z.object({ email: z.string().trim().min(3).max(254) })
const resetBody = z.object({
  token: z.string().min(10).max(512),
  password: z.string().min(1).max(200),
})
const requestOtpBody = z.object({
  channel: z.enum(['email', 'sms']),
  destination: z.string().trim().min(3).max(254),
})
const verifyOtpBody = z.object({
  destination: z.string().trim().min(3).max(254),
  otp: z.string().trim().regex(/^\d{6}$/, 'A one-time code is six digits.'),
})
const revokeAllBody = z.object({ keepCurrent: z.boolean().optional(), sessionId: z.string().optional() })

function parse<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const parsed = schema.safeParse(body ?? {})
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    throw badRequest(issue?.message ?? 'Invalid request body.', issue?.path.join('.'))
  }
  return parsed.data
}

function facts(request: FastifyRequest): RequestFacts {
  const meta = metaOf(request)
  return { ip: meta.ip, userAgent: meta.userAgent, requestId: meta.requestId }
}

/** A refusal that is a *deployment state*, not a caller error.
 *
 *  503 rather than 501 or a 200 with `{configured:false}`: the endpoint exists
 *  and would work, the dependency behind it does not. The body keeps the
 *  `{error:{code,message}}` envelope every other route uses so a client parses
 *  it the same way. */
function unavailable(reply: FastifyReply, request: FastifyRequest, message: string) {
  request.log.warn({ path: request.url }, message)
  return reply.code(503).send({
    error: {
      code: 'external_dependency_unavailable',
      message,
      requestId: request.id,
    },
  })
}

export interface AuthRouteDeps {
  service: AuthService
  config: AuthConfig
  providers: Providers
}

export function registerAuthRoutes(app: FastifyInstance, deps: AuthRouteDeps): void {
  const { service, config, providers } = deps

  /* Sign-in and one-time-code endpoints get their own budget. The global
   * limiter keys on `orgId:ip`, and on these routes there is no `orgId` yet —
   * every anonymous caller in the world would otherwise share one bucket. */
  const strictLimit = {
    config: { rateLimit: { max: config.AUTH_RATE_LIMIT_PER_MINUTE, timeWindow: '1 minute' } },
  }
  const veryStrictLimit = {
    config: { rateLimit: { max: config.LOGIN_RATE_LIMIT_PER_MINUTE, timeWindow: '1 minute' } },
  }

  /* ------------------------------------------------------------- public */

  app.post('/auth/login', veryStrictLimit, async (request, reply) => {
    const body = parse(loginBody, request.body)
    try {
      const { tokens, user } = await service.login(body, facts(request))
      return reply.code(200).send({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        tokenType: tokens.tokenType,
        user: presentUser(user),
      })
    } catch (error) {
      return authFailureReply(reply, request, error)
    }
  })

  app.post('/auth/refresh', strictLimit, async (request, reply) => {
    const body = parse(refreshBody, request.body)
    try {
      const { tokens, user } = await service.refresh(body.refreshToken, facts(request))
      return reply.code(200).send({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        tokenType: tokens.tokenType,
        user: presentUser(user),
      })
    } catch (error) {
      return authFailureReply(reply, request, error)
    }
  })

  app.post('/auth/logout', strictLimit, async (request, reply) => {
    const body = parse(refreshBody, request.body)
    await service.logout(body.refreshToken, facts(request))
    /* Always 204. Whether the token was already invalid is not the caller's
     * business and is an oracle if reported. */
    return reply.code(204).send()
  })

  app.post('/auth/forgot-password', veryStrictLimit, async (request, reply) => {
    const body = parse(forgotBody, request.body)
    try {
      const result = await service.forgotPassword(body.email, facts(request))
      return reply.code(202).send({
        /* Identical for a known and an unknown address. */
        message: 'If that address belongs to an account, a recovery link is on its way.',
        resendAfterSeconds: result.cooldownSeconds,
      })
    } catch (error) {
      if (error instanceof TransportUnavailable) {
        return unavailable(reply, request, `${error.message} ${error.detail}`)
      }
      throw error
    }
  })

  app.post('/auth/reset-password', veryStrictLimit, async (request, reply) => {
    const body = parse(resetBody, request.body)
    const result = await service.resetPassword(body, facts(request))
    if (!result.ok) {
      return reply.code(400).send({
        error: { code: 'bad_request', message: result.reason, requestId: request.id },
      })
    }
    return reply.code(200).send({
      message: 'Your password has been changed and every session has been signed out.',
    })
  })

  app.post('/auth/request-otp', veryStrictLimit, async (request, reply) => {
    const body = parse(requestOtpBody, request.body)
    try {
      const result = await service.requestOtp(body)
      return reply.code(202).send({
        message: 'A one-time code has been sent.',
        resendAfterSeconds: result.cooldownSeconds,
        transport: result.transport,
      })
    } catch (error) {
      if (error instanceof ResendTooSoon) {
        reply.header('retry-after', String(error.retryAfterSeconds))
        return reply.code(429).send({
          error: { code: 'rate_limited', message: error.message, requestId: request.id },
        })
      }
      if (error instanceof TransportUnavailable) {
        return unavailable(reply, request, `${error.message} ${error.detail}`)
      }
      throw error
    }
  })

  app.post('/auth/verify-otp', veryStrictLimit, async (request, reply) => {
    const body = parse(verifyOtpBody, request.body)
    const verdict = await service.verifyOtp({ destination: body.destination, code: body.otp })
    if (verdict.kind === 'verified') {
      return reply.code(200).send({ verified: true, destination: verdict.destination })
    }
    const message =
      verdict.kind === 'expired'
        ? 'That code has expired. Request a new one.'
        : verdict.kind === 'exhausted'
          ? 'Too many incorrect attempts. Request a new code.'
          : verdict.kind === 'wrong_code'
            ? `That code is not correct. ${verdict.attemptsLeft} attempts left.`
            : 'There is no code outstanding for that destination.'
    return reply.code(401).send({
      error: { code: 'unauthenticated', message, requestId: request.id },
    })
  })

  /* ------------------------------------- unconfigured external providers */

  app.get('/auth/providers', async () => ({ providers: providerStatus(config) }))

  const refuse = (run: () => Promise<unknown>) =>
    async function handler(request: FastifyRequest, reply: FastifyReply) {
      try {
        await run()
        /* Unreachable while every adapter is the refusing one. Kept so that a
         * real adapter dropping in does not silently fall through to a 503. */
        return unavailable(
          reply,
          request,
          'This provider returned without producing a session. Refusing rather than issuing one.',
        )
      } catch (error) {
        if (error instanceof ProviderNotConfigured) {
          return unavailable(reply, request, error.message)
        }
        throw error
      }
    }

  app.post(
    '/auth/sso/start',
    refuse(() => providers.sso.start({ orgSlug: '', redirectUri: '' })),
  )
  app.post(
    '/auth/sso/callback',
    refuse(() => providers.sso.callback({ code: '', state: '' })),
  )
  app.post(
    '/auth/biometric/enrol',
    refuse(() => providers.webauthn.enrolOptions({ userId: '', userName: '' })),
  )
  app.post(
    '/auth/biometric/challenge',
    refuse(() => providers.webauthn.challengeOptions({ userId: '' })),
  )
  app.post(
    '/auth/social/:provider',
    refuse(() => providers.social.exchange({ provider: '', idToken: '' })),
  )
  app.post('/auth/2fa/enrol', async (request, reply) =>
    unavailable(
      reply,
      request,
      'TOTP enrolment has no adapter in this build: the user record carries no enrolment store. ' +
        'No secret was generated.',
    ),
  )
  app.post('/auth/2fa/verify', async (request, reply) =>
    unavailable(
      reply,
      request,
      'TOTP verification has no adapter in this build: nothing has been enrolled, so nothing can be verified.',
    ),
  )

  /* ------------------------------------------------------- authenticated */

  app.get('/auth/me', async (request) => {
    const principal = principalOf(request)
    const user = await service.me(principal)
    if (!user) {
      /* The token verified but the row is gone — deleted while a token was
       * still live. Not an error: an absent user is simply not signed in. */
      return { user: null, entitlements: null }
    }
    return { user: presentUser(user), entitlements: entitlementsFor(user.role) }
  })

  app.get('/auth/sessions', async (request) => {
    const principal = principalOf(request)
    return { sessions: await service.sessions(principal) }
  })

  app.delete('/auth/sessions/:id', async (request, reply) => {
    const principal = principalOf(request)
    const { id } = request.params as { id: string }
    const revoked = await service.revokeOne(principal, id, facts(request))
    if (!revoked) {
      /* 404, never 403 — a 403 would confirm that a session id belonging to
       * someone else exists. */
      return reply.code(404).send({
        error: { code: 'not_found', message: 'Session not found.', requestId: request.id },
      })
    }
    return reply.code(204).send()
  })

  app.post('/auth/sessions/revoke-all', async (request) => {
    const principal = principalOf(request)
    const body = parse(revokeAllBody, request.body)
    const count = await service.revokeAll(
      principal,
      { exceptSessionId: body.keepCurrent ? body.sessionId : undefined },
      facts(request),
    )
    return { revoked: count }
  })
}

function presentUser(user: {
  id: string
  email: string
  name: string
  role: string
  orgId: string
  branchId: string | null
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    orgId: user.orgId,
    branchId: user.branchId,
  }
}

/** What `GET /auth/me` means by "entitlements": the role's own row of the
 *  matrix, its data scope and its approval ceiling. The client uses it to hide
 *  and disable; the server has already decided, and decides again on every
 *  request. */
function entitlementsFor(role: string) {
  const modules: Record<string, string> = {}
  for (const [module, row] of Object.entries(PERMS)) {
    const grant = (row as Record<string, string>)[role] ?? ''
    if (grant) modules[module as ModuleId] = grant
  }
  const meta = (ROLE_META as Record<string, { scope: string; limitSar: number | null } | undefined>)[
    role
  ]
  return {
    modules,
    /* The grant alphabet, spelled out. `handoff/RBAC.md` documents five letters
     * and calls `x` delete; the matrix uses six and `x` is export. A client
     * that reads the letters from here cannot inherit the wrong reading. */
    actions: Object.fromEntries(GRANT_ACTIONS.map((a) => [a, describeAction(a)])),
    scope: meta?.scope ?? 'self',
    /* `?? 0` would be wrong here and wrong in the dangerous direction's mirror:
     * `limitSar` is legitimately `null` for the two unlimited roles, and `??`
     * would flatten that to "cannot approve". An *unknown* role is the case
     * that must read 0, and it is the `meta` that is missing, not the field. */
    approvalCeilingSar: meta ? meta.limitSar : 0,
    approvalCeilingHalalas: ceilingHalalas(role),
  }
}

function authFailureReply(reply: FastifyReply, request: FastifyRequest, error: unknown) {
  if (error instanceof LockedOut) {
    reply.header('retry-after', String(error.retryAfterSeconds))
    return reply.code(429).send({
      error: { code: 'rate_limited', message: error.message, requestId: request.id },
    })
  }
  if (error instanceof AuthFailure) {
    request.log.warn({ code: error.code }, error.message)
    return reply.code(401).send({
      error: { code: 'unauthenticated', message: error.message, requestId: request.id },
    })
  }
  throw error
}
