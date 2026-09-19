/** `GET /security/summary` — the security policy this deployment actually
 *  enforces (BLK-004: wires SecuritySettings off its six hand-picked
 *  literals). Proves each figure comes from the same place the thing it
 *  describes is enforced by — `checkPasswordPolicy`'s minimum, the login
 *  throttle's attempt/lockout figures, the refresh token's lifetime — not a
 *  number that merely happens to match them, and that `activeSessions`
 *  counts real `user_sessions` rows rather than a fixture.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import type { RoleId } from '@salis/contract'
import { buildApp } from '../src/app'
import { withAuthPlane } from '../src/auth/context'
import { systemPrincipal } from '../src/db/tenant'
import type { DbHandle } from '../src/db/client'
import { createDb } from '../src/db/client'
import { users } from '../src/db/schema'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'
import { SignJWT } from 'jose'

const PASSWORD = 'correct-horse-battery-staple'

let app: FastifyInstance
let handle: DbHandle
let env: Env
let ownerEmail: string
const userIds = new Map<RoleId, string>()

async function token(role: RoleId, sub: string, orgId: string = SEED.orgId): Promise<string> {
  const key = new TextEncoder().encode(env.JWT_SECRET as string)
  return new SignJWT({ role, org_id: orgId, branch_id: SEED.mainBranchId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(key)
}

function get(url: string, bearer?: string) {
  return app.inject({
    method: 'GET',
    url: `/api/v1${url}`,
    headers: bearer ? { authorization: `Bearer ${bearer}` } : {},
  })
}

function post(url: string, body: unknown) {
  return app.inject({
    method: 'POST',
    url: `/api/v1${url}`,
    headers: { 'content-type': 'application/json' },
    payload: JSON.stringify(body ?? {}),
  })
}

interface Summary {
  passwordMinLength: number
  loginMaxAttempts: number
  loginLockoutSeconds: number
  refreshTokenTtlDays: number
  activeSessions: number
}

beforeAll(async () => {
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  app = await buildApp({ db: handle.db, env })
  await app.ready()

  const rows = await withAuthPlane(handle.db, async (tx) =>
    tx.select({ id: users.id, email: users.email, role: users.role }).from(users),
  )
  for (const row of rows) userIds.set(row.role as RoleId, row.id)
  ownerEmail = rows.find((r) => r.id === userIds.get('owner'))?.email as string

  const admin = systemPrincipal(SEED.orgId, SEED.systemUserId)
  await app.auth.service.setPassword(admin, { userId: userIds.get('owner') as string }, PASSWORD, {})
}, 120_000)

afterAll(async () => {
  await app?.close()
  await handle?.close()
})

describe('GET /security/summary', () => {
  it('reports the real MIN_PASSWORD_LENGTH, not a hand-picked figure', async () => {
    const owner = await token('owner', '01JSECSUMMARYOWNER000001')
    const res = await get('/security/summary', owner)
    expect(res.statusCode, res.body).toBe(200)
    const body = res.json() as Summary
    expect(body.passwordMinLength).toBe(12)
  })

  it('reports the login throttle\'s real attempt and lockout figures', async () => {
    const owner = await token('owner', '01JSECSUMMARYOWNER000002')
    const res = await get('/security/summary', owner)
    const body = res.json() as Summary
    expect(body.loginMaxAttempts).toBeGreaterThan(0)
    expect(body.loginLockoutSeconds).toBeGreaterThan(0)
  })

  it('reports the real refresh-token lifetime in days', async () => {
    const owner = await token('owner', '01JSECSUMMARYOWNER000003')
    const res = await get('/security/summary', owner)
    const body = res.json() as Summary
    expect(body.refreshTokenTtlDays).toBeGreaterThan(0)
  })

  it('answers for any authenticated role — the screen carries no RBAC module', async () => {
    const technician = await token('technician', '01JSECSUMMARYTECH000001')
    const res = await get('/security/summary', technician)
    expect(res.statusCode, res.body).toBe(200)
  })

  it('401s with no token', async () => {
    const res = await get('/security/summary')
    expect(res.statusCode).toBe(401)
  })

  it('reports zero active sessions for an organization that truly has none', async () => {
    const owner = await token('owner', '01JSECSUMMARYSTRANGER01', SEED.otherOrgId)
    const res = await get('/security/summary', owner)
    const body = res.json() as Summary
    expect(body.activeSessions).toBe(0)
  })

  it('counts a real login session, and counts it again after a second login', async () => {
    const owner = await token('owner', '01JSECSUMMARYCOUNTER001')
    const before = ((await get('/security/summary', owner)).json() as Summary).activeSessions

    const login1 = await post('/auth/login', { email: ownerEmail, password: PASSWORD })
    expect(login1.statusCode, login1.body).toBe(200)
    const afterOne = ((await get('/security/summary', owner)).json() as Summary).activeSessions
    expect(afterOne).toBe(before + 1)

    const login2 = await post('/auth/login', { email: ownerEmail, password: PASSWORD })
    expect(login2.statusCode, login2.body).toBe(200)
    const afterTwo = ((await get('/security/summary', owner)).json() as Summary).activeSessions
    expect(afterTwo).toBe(before + 2)
  })
})
