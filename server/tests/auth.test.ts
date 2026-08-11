/** Authentication, end to end against a real PostgreSQL.
 *
 *  Mostly through HTTP rather than by calling the service, because the things
 *  worth checking here — that a rotated-out refresh token is dead, that a
 *  cross-user session id yields 404 and not 403, that the access token carries
 *  exactly the claims `API_ENDPOINTS.md` promises — are properties of the
 *  endpoint, not of a function.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { decodeJwt } from 'jose'
import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { PERMS, type RoleId } from '@salis/contract'
import { buildApp } from '../src/app'
import { withAuthPlane } from '../src/auth/context'
import { memoryTransport, type MemoryTransport } from '../src/auth/otp'
import { hashSecret } from '../src/auth/tokens'
import { createDb, type DbHandle } from '../src/db/client'
import { auditLog, userSessions, users } from '../src/db/schema'
import { systemPrincipal } from '../src/db/tenant'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'

const PASSWORD = 'correct-horse-battery-staple'
const OTHER_PASSWORD = 'a-second-perfectly-fine-password'

let app: FastifyInstance
let handle: DbHandle
let env: Env
let codes: MemoryTransport
const userIds = new Map<RoleId, string>()

function post(url: string, body: unknown, token?: string) {
  return app.inject({
    method: 'POST',
    url: `/api/v1${url}`,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    payload: JSON.stringify(body ?? {}),
  })
}

function get(url: string, token?: string) {
  return app.inject({
    method: 'GET',
    url: `/api/v1${url}`,
    headers: token ? { authorization: `Bearer ${token}` } : {},
  })
}

async function login(email: string, password = PASSWORD) {
  return post('/auth/login', { email, password })
}

beforeAll(async () => {
  /* The per-route budgets exist and are exercised by their own test below; the
   * rest of the suite would otherwise spend its time being rate limited. */
  process.env.LOGIN_RATE_LIMIT_PER_MINUTE = '10000'
  process.env.AUTH_RATE_LIMIT_PER_MINUTE = '10000'
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  codes = memoryTransport()
  app = await buildApp({ db: handle.db, env, otpTransport: codes })
  await app.ready()

  const rows = await withAuthPlane(handle.db, async (tx) =>
    tx.select({ id: users.id, email: users.email, role: users.role }).from(users),
  )
  for (const row of rows) userIds.set(row.role as RoleId, row.id)

  /* The seed deliberately ships no password hashes — a seeded credential in a
   * repository is a credential in a repository. Passwords are set here through
   * the same service an administrator would use. */
  const admin = systemPrincipal(SEED.orgId, SEED.systemUserId)
  await app.auth.service.setPassword(admin, { userId: userIds.get('owner') as string }, PASSWORD, {})
  await app.auth.service.setPassword(
    admin,
    { userId: userIds.get('manager') as string },
    OTHER_PASSWORD,
    {},
  )
  await app.auth.service.setPassword(
    admin,
    { userId: userIds.get('technician') as string },
    PASSWORD,
    {},
  )
})

afterAll(async () => {
  await app?.close()
  await handle?.close()
})

describe('POST /auth/login', () => {
  it('returns an access token, a refresh token and the user', async () => {
    const response = await login('owner@salisauto.sa')
    expect(response.statusCode, response.body).toBe(200)
    const body = response.json()
    expect(body.accessToken).toBeTypeOf('string')
    expect(body.refreshToken).toBeTypeOf('string')
    expect(body.tokenType).toBe('Bearer')
    expect(body.user.email).toBe('owner@salisauto.sa')
    expect(body.user.role).toBe('owner')
    expect(body.user.orgId).toBe(SEED.orgId)
  })

  it('embeds exactly the claims API_ENDPOINTS.md specifies, and expires in 15 minutes', async () => {
    const body = (await login('owner@salisauto.sa')).json()
    const claims = decodeJwt(body.accessToken) as Record<string, unknown>
    expect(claims.sub).toBe(userIds.get('owner'))
    expect(claims.role).toBe('owner')
    expect(claims.org_id).toBe(SEED.orgId)
    expect(claims.branch_id).toBe(SEED.mainBranchId)
    expect(claims.scope).toBe('all')
    const ttl = (claims.exp as number) - (claims.iat as number)
    expect(ttl).toBe(15 * 60)
  })

  it('never puts a password or a token digest in the response', async () => {
    const raw = (await login('owner@salisauto.sa')).body
    expect(raw).not.toContain('argon2')
    expect(raw).not.toContain('passwordHash')
    expect(raw).not.toContain('password_hash')
  })

  it('answers a wrong password and an unknown address identically', async () => {
    const wrong = await login('owner@salisauto.sa', 'not-the-password')
    const unknown = await login('nobody@salisauto.sa', 'not-the-password')
    expect(wrong.statusCode).toBe(401)
    expect(unknown.statusCode).toBe(401)
    // Same message and same code: the endpoint is not a user directory.
    expect(wrong.json().error.message).toBe(unknown.json().error.message)
    expect(wrong.json().error.code).toBe('unauthenticated')
  })

  it('refuses a seeded account that has never had a password set', async () => {
    // `advisor` was left without a hash. It must fail as invalid credentials
    // rather than throw, and rather than succeed on an empty password.
    const response = await login('advisor@salisauto.sa', '')
    expect(response.statusCode).toBe(400)
    const blank = await login('advisor@salisauto.sa', 'anything-at-all')
    expect(blank.statusCode).toBe(401)
  })

  it('stores an argon2id hash, never the password', async () => {
    const [row] = await withAuthPlane(handle.db, async (tx) =>
      tx
        .select({ hash: users.passwordHash })
        .from(users)
        .where(eq(users.id, userIds.get('owner') as string)),
    )
    expect(row?.hash).toMatch(/^\$argon2id\$v=19\$m=\d+,t=\d+,p=\d+\$/)
    expect(row?.hash).not.toContain(PASSWORD)
  })

  it('lets the issued token straight into an authenticated route', async () => {
    const body = (await login('owner@salisauto.sa')).json()
    const me = await get('/auth/me', body.accessToken)
    expect(me.statusCode, me.body).toBe(200)
    expect(me.json().user.id).toBe(userIds.get('owner'))
  })

  it('locks out after repeated failures', async () => {
    process.env.LOGIN_MAX_ATTEMPTS = '3'
    const isolated = await buildApp({ db: handle.db, env, otpTransport: memoryTransport() })
    await isolated.ready()
    try {
      const attempt = () =>
        isolated.inject({
          method: 'POST',
          url: '/api/v1/auth/login',
          headers: { 'content-type': 'application/json' },
          payload: JSON.stringify({ email: 'owner@salisauto.sa', password: 'wrong' }),
        })
      expect((await attempt()).statusCode).toBe(401)
      expect((await attempt()).statusCode).toBe(401)
      expect((await attempt()).statusCode).toBe(401)
      const locked = await attempt()
      expect(locked.statusCode).toBe(429)
      expect(locked.headers['retry-after']).toBeDefined()
    } finally {
      await isolated.close()
      delete process.env.LOGIN_MAX_ATTEMPTS
    }
  })
})

describe('POST /auth/refresh — rotation and reuse detection', () => {
  it('rotates: the new token works and the presented one is spent', async () => {
    const first = (await login('owner@salisauto.sa')).json()
    const rotated = await post('/auth/refresh', { refreshToken: first.refreshToken })
    expect(rotated.statusCode, rotated.body).toBe(200)
    const second = rotated.json()
    expect(second.refreshToken).not.toBe(first.refreshToken)
    expect(second.accessToken).toBeTypeOf('string')

    const again = await post('/auth/refresh', { refreshToken: second.refreshToken })
    expect(again.statusCode, again.body).toBe(200)
  })

  it('kills the whole family when a rotated-out token comes back', async () => {
    const first = (await login('owner@salisauto.sa')).json()
    const second = (await post('/auth/refresh', { refreshToken: first.refreshToken })).json()

    // The stolen copy of the first token, replayed after it was rotated out.
    const replay = await post('/auth/refresh', { refreshToken: first.refreshToken })
    expect(replay.statusCode).toBe(401)
    expect(replay.json().error.message).toMatch(/already used/i)

    // And the legitimate holder is signed out too — that is the point. A thief
    // gets one refresh; the theft becomes visible because the real user has to
    // sign in again.
    const afterwards = await post('/auth/refresh', { refreshToken: second.refreshToken })
    expect(afterwards.statusCode).toBe(401)
  })

  it('audits the reuse as a security event', async () => {
    const first = (await login('owner@salisauto.sa')).json()
    await post('/auth/refresh', { refreshToken: first.refreshToken })
    await post('/auth/refresh', { refreshToken: first.refreshToken })

    const rows = await withAuthPlane(handle.db, async (tx) =>
      tx
        .select({ reason: auditLog.reason, entity: auditLog.entity, action: auditLog.action })
        .from(auditLog)
        .where(and(eq(auditLog.entity, 'session'), eq(auditLog.reason, 'refresh_token_reuse'))),
    )
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0]?.action).toBe('reject')
  })

  it('re-reads the role from the database rather than trusting the token', async () => {
    const first = (await login('technician@nowhere.invalid', PASSWORD)).statusCode
    expect(first).toBe(401)

    const session = (await login('tech@salisauto.sa')).json()
    expect(decodeJwt(session.accessToken).role).toBe('technician')

    await withAuthPlane(handle.db, async (tx) => {
      await tx
        .update(users)
        .set({ role: 'frontdesk' })
        .where(eq(users.id, userIds.get('technician') as string))
    })
    const rotated = (await post('/auth/refresh', { refreshToken: session.refreshToken })).json()
    expect(decodeJwt(rotated.accessToken).role).toBe('frontdesk')
    expect(decodeJwt(rotated.accessToken).scope).toBe('branch')

    await withAuthPlane(handle.db, async (tx) => {
      await tx
        .update(users)
        .set({ role: 'technician' })
        .where(eq(users.id, userIds.get('technician') as string))
    })
  })

  it('refuses a refresh token presented as an access token', async () => {
    // Different audience, so the API's verifier rejects it. Without that split
    // a refresh token would be a bearer credential that lasts thirty days.
    const body = (await login('owner@salisauto.sa')).json()
    const response = await get('/auth/me', body.refreshToken)
    expect(response.statusCode).toBe(401)
  })

  it('refuses a token this server did not sign', async () => {
    const forged =
      'eyJhbGciOiJIUzI1NiJ9.eyJzaWQiOiJ4IiwiZmlkIjoieCIsInN1YiI6IngiLCJvcmdfaWQiOiJ4Iiwic2VjcmV0IjoieCJ9.' +
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    const response = await post('/auth/refresh', { refreshToken: forged })
    expect(response.statusCode).toBe(401)
  })

  it('stores only a digest of the refresh secret', async () => {
    const body = (await login('owner@salisauto.sa')).json()
    const claims = decodeJwt(body.refreshToken) as Record<string, string>
    const [row] = await withAuthPlane(handle.db, async (tx) =>
      tx
        .select({ hash: userSessions.refreshTokenHash })
        .from(userSessions)
        .where(eq(userSessions.id, claims.sid as string)),
    )
    expect(row?.hash).toBe(hashSecret(claims.secret as string))
    expect(row?.hash).not.toBe(claims.secret)
    expect(row?.hash).not.toContain(body.refreshToken)
  })
})

describe('sessions and revocation', () => {
  it('lists this user’s devices and marks nothing it should not', async () => {
    const session = (await login('owner@salisauto.sa')).json()
    const response = await get('/auth/sessions', session.accessToken)
    expect(response.statusCode, response.body).toBe(200)
    const list = response.json().sessions as Record<string, unknown>[]
    expect(list.length).toBeGreaterThan(0)
    for (const device of list) {
      expect(Object.keys(device)).not.toContain('refreshTokenHash')
      expect(Object.keys(device)).not.toContain('refreshToken')
    }
  })

  it('signs one device out, and that device’s refresh token dies with it', async () => {
    const doomed = (await login('owner@salisauto.sa')).json()
    const keeper = (await login('owner@salisauto.sa')).json()
    const doomedId = (decodeJwt(doomed.refreshToken) as Record<string, string>).sid

    const revoke = await app.inject({
      method: 'DELETE',
      url: `/api/v1/auth/sessions/${doomedId}`,
      headers: { authorization: `Bearer ${keeper.accessToken}` },
    })
    expect(revoke.statusCode, revoke.body).toBe(204)

    expect((await post('/auth/refresh', { refreshToken: doomed.refreshToken })).statusCode).toBe(401)
    expect((await post('/auth/refresh', { refreshToken: keeper.refreshToken })).statusCode).toBe(200)
  })

  it('returns 404, not 403, for another user’s session id', async () => {
    // A 403 would confirm the id names a real session belonging to someone
    // else. Row-level security refuses the row, so the handler cannot even tell
    // the difference — which is the property, not the status code alone.
    const mine = (await login('owner@salisauto.sa')).json()
    const theirs = (await post('/auth/login', {
      email: 'manager@salisauto.sa',
      password: OTHER_PASSWORD,
    })).json()
    const theirSessionId = (decodeJwt(theirs.refreshToken) as Record<string, string>).sid

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/v1/auth/sessions/${theirSessionId}`,
      headers: { authorization: `Bearer ${mine.accessToken}` },
    })
    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe('not_found')

    // And theirs still works, so the 404 was a refusal and not a silent success.
    expect((await post('/auth/refresh', { refreshToken: theirs.refreshToken })).statusCode).toBe(200)
  })

  it('signs every device out at once', async () => {
    const one = (await login('owner@salisauto.sa')).json()
    const two = (await login('owner@salisauto.sa')).json()
    const response = await post('/auth/sessions/revoke-all', {}, one.accessToken)
    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().revoked).toBeGreaterThanOrEqual(2)
    expect((await post('/auth/refresh', { refreshToken: one.refreshToken })).statusCode).toBe(401)
    expect((await post('/auth/refresh', { refreshToken: two.refreshToken })).statusCode).toBe(401)
  })

  it('logs out idempotently and tells the caller nothing either way', async () => {
    const session = (await login('owner@salisauto.sa')).json()
    const first = await post('/auth/logout', { refreshToken: session.refreshToken })
    const second = await post('/auth/logout', { refreshToken: session.refreshToken })
    expect(first.statusCode).toBe(204)
    expect(second.statusCode).toBe(204)
    expect((await post('/auth/refresh', { refreshToken: session.refreshToken })).statusCode).toBe(401)
  })
})

describe('GET /auth/me', () => {
  it('returns the signed-in user, the role and its entitlements', async () => {
    const session = (await login('owner@salisauto.sa')).json()
    const body = (await get('/auth/me', session.accessToken)).json()
    expect(body.user.role).toBe('owner')
    expect(body.entitlements.scope).toBe('all')
    expect(body.entitlements.approvalCeilingSar).toBeNull()
    // The entitlement row is the matrix row, not a summary of it.
    expect(body.entitlements.modules.jobcards).toBe(PERMS.jobcards.owner)
    expect(body.entitlements.modules.audit).toBe(PERMS.audit.owner)
    // And the letters are spelled out, so no client inherits the wrong reading.
    expect(body.entitlements.actions.x).toBe('export')
    expect(body.entitlements.actions.d).toBe('delete')
  })

  it('refuses without a token', async () => {
    expect((await get('/auth/me')).statusCode).toBe(401)
  })
})

describe('one-time codes', () => {
  it('issues a code, keeps only its digest and verifies it once', async () => {
    const destination = '+966550000111'
    const issued = await post('/auth/request-otp', { channel: 'sms', destination })
    expect(issued.statusCode, issued.body).toBe(202)
    const code = codes.codeFor(destination)
    expect(code).toMatch(/^\d{6}$/)
    expect(issued.body).not.toContain(code as string)

    const wrong = await post('/auth/verify-otp', { destination, otp: '000000' })
    expect(wrong.statusCode).toBe(401)

    const right = await post('/auth/verify-otp', { destination, otp: code })
    expect(right.statusCode, right.body).toBe(200)
    expect(right.json().verified).toBe(true)

    // Spent. A code that works twice is a code an attacker can use after
    // watching it work once.
    const replay = await post('/auth/verify-otp', { destination, otp: code })
    expect(replay.statusCode).toBe(401)
  })

  it('throttles a resend to 60 seconds (README §6b)', async () => {
    const destination = '+966550000222'
    expect((await post('/auth/request-otp', { channel: 'sms', destination })).statusCode).toBe(202)
    const again = await post('/auth/request-otp', { channel: 'sms', destination })
    expect(again.statusCode).toBe(429)
    expect(Number(again.headers['retry-after'])).toBeGreaterThan(0)
    expect(Number(again.headers['retry-after'])).toBeLessThanOrEqual(60)
  })

  it('gives up after too many wrong guesses', async () => {
    const destination = '+966550000333'
    await post('/auth/request-otp', { channel: 'sms', destination })
    let last = await post('/auth/verify-otp', { destination, otp: '111111' })
    for (let attempt = 0; attempt < 6; attempt += 1) {
      last = await post('/auth/verify-otp', { destination, otp: '111111' })
    }
    expect(last.statusCode).toBe(401)
    expect(last.json().error.message).toMatch(/too many/i)
    // Even the right code is refused once the challenge is exhausted.
    const code = codes.codeFor(destination) as string
    expect((await post('/auth/verify-otp', { destination, otp: code })).statusCode).toBe(401)
  })

  it('refuses to pretend when no transport is configured', async () => {
    // The default transport is `unconfigured`, and it fails visibly rather than
    // returning a cheerful 202 for a message nobody sent.
    const previous = process.env.OTP_TRANSPORT
    process.env.OTP_TRANSPORT = 'unconfigured'
    const bare = await buildApp({ db: handle.db, env })
    await bare.ready()
    try {
      const response = await bare.inject({
        method: 'POST',
        url: '/api/v1/auth/request-otp',
        headers: { 'content-type': 'application/json' },
        payload: JSON.stringify({ channel: 'sms', destination: '+966550000444' }),
      })
      expect(response.statusCode).toBe(503)
      expect(response.json().error.message).toMatch(/OTP_TRANSPORT/)
    } finally {
      await bare.close()
      if (previous === undefined) delete process.env.OTP_TRANSPORT
      else process.env.OTP_TRANSPORT = previous
    }
  })
})

describe('password recovery', () => {
  it('answers identically for a known and an unknown address', async () => {
    const known = await post('/auth/forgot-password', { email: 'owner@salisauto.sa' })
    const unknown = await post('/auth/forgot-password', { email: 'nobody@salisauto.sa' })
    expect(known.statusCode).toBe(202)
    expect(unknown.statusCode).toBe(202)
    expect(known.json().message).toBe(unknown.json().message)
  })

  it('resets the password, enforces the policy and signs every device out', async () => {
    const email = 'tech@salisauto.sa'
    const live = (await login(email)).json()

    await post('/auth/forgot-password', { email })
    const token = codes.codeFor(email)
    expect(token).toBeTypeOf('string')

    const weak = await post('/auth/reset-password', { token, password: 'short' })
    expect(weak.statusCode).toBe(400)
    expect(weak.json().error.message).toMatch(/at least 12/)

    const next = 'a-brand-new-and-quite-long-password'
    const done = await post('/auth/reset-password', { token, password: next })
    expect(done.statusCode, done.body).toBe(200)

    // Sessions opened with the old password are gone.
    expect((await post('/auth/refresh', { refreshToken: live.refreshToken })).statusCode).toBe(401)
    // The old password no longer works, the new one does.
    expect((await login(email, PASSWORD)).statusCode).toBe(401)
    expect((await login(email, next)).statusCode).toBe(200)
    // And the recovery token is spent.
    expect((await post('/auth/reset-password', { token, password: next })).statusCode).toBe(400)
  })
})

describe('SSO, WebAuthn, social and TOTP', () => {
  it('refuse visibly, naming the configuration that is missing', async () => {
    const cases: [string, RegExp][] = [
      ['/auth/sso/start', /SSO_ISSUER_URL/],
      ['/auth/sso/callback', /SSO_CLIENT_ID/],
      ['/auth/biometric/enrol', /WEBAUTHN_RP_ID/],
      ['/auth/biometric/challenge', /WEBAUTHN_ORIGIN/],
      ['/auth/social/google', /not configured/],
      ["/auth/2fa/enrol", /no adapter in this build/],
      ["/auth/2fa/verify", /no adapter in this build/],
    ]
    for (const [path, expected] of cases) {
      const response = await post(path, {})
      expect(response.statusCode, `${path} → ${response.body}`).toBe(503)
      expect(response.json().error.message).toMatch(expected)
      // Never a token. The whole failure mode being guarded against is a stub
      // that returns a plausible session.
      expect(response.body).not.toContain('accessToken')
    }
  })

  it('reports each provider’s state rather than leaving it to be inferred', async () => {
    const body = (await get('/auth/providers')).json()
    const ids = (body.providers as { id: string; configured: boolean }[]).map((p) => p.id)
    expect(ids.sort()).toEqual(['social', 'sso', 'totp', 'webauthn'])
    for (const provider of body.providers) {
      expect(provider.configured).toBe(false)
      expect(provider.state.length).toBeGreaterThan(0)
    }
  })
})

describe('the public/authenticated split', () => {
  it('serves the sign-in routes without a token and nothing else', async () => {
    expect((await post('/auth/login', { email: 'x@y.z', password: 'nope' })).statusCode).toBe(401)
    // A path that merely contains a public one is not public.
    expect((await get('/auth/me')).statusCode).toBe(401)
    expect((await get('/auth/sessions')).statusCode).toBe(401)
    expect((await get('/customers')).statusCode).toBe(401)
  })
})
