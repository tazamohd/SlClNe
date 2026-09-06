/** The all-access test account, and sign-up from scratch.
 *
 *  Two features that only make sense together: an account that can walk the
 *  whole product, and a registration flow it can walk *through* rather than
 *  read about. Both are checked here over HTTP, because what matters is what
 *  the endpoint does — that a public sign-up cannot ask for a role, that a
 *  role switch is refused for every account but one, and that the audit log
 *  ends up holding the evidence for both.
 *
 *  The audit assertions are not decoration. "Give it the ability to do
 *  everything" is only safe if everything it does is written down, so the log
 *  is asserted on directly rather than assumed from the fact that a writer
 *  exists.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { decodeJwt } from 'jose'
import { and, desc, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { ROLE_IDS } from '@salis/contract'
import { buildApp } from '../src/app'
import { withAuthPlane } from '../src/auth/context'
import { createDb, type DbHandle } from '../src/db/client'
import { auditLog, organizations, users } from '../src/db/schema'
import { systemPrincipal } from '../src/db/tenant'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'

const TEST_ACCOUNT = 'test@salisauto.sa'
const OWNER_ACCOUNT = 'owner@salisauto.sa'
const PASSWORD = 'a-perfectly-ordinary-password'

let app: FastifyInstance
let handle: DbHandle
let env: Env
const userIds = new Map<string, string>()

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

async function signIn(email: string): Promise<string> {
  const response = await post('/auth/login', { email, password: PASSWORD })
  expect(response.statusCode, response.body).toBe(200)
  return response.json().accessToken as string
}

/** The newest audit row for an entity, whichever tenant it belongs to. */
async function latestAudit(entity: string, entityId: string) {
  const [row] = await withAuthPlane(handle.db, async (tx) =>
    tx
      .select()
      .from(auditLog)
      .where(and(eq(auditLog.entity, entity), eq(auditLog.entityId, entityId)))
      .orderBy(desc(auditLog.id))
      .limit(1),
  )
  return row
}

beforeAll(async () => {
  process.env.LOGIN_RATE_LIMIT_PER_MINUTE = '10000'
  process.env.AUTH_RATE_LIMIT_PER_MINUTE = '10000'
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  app = await buildApp({ db: handle.db, env })
  await app.ready()

  const rows = await withAuthPlane(handle.db, async (tx) =>
    tx.select({ id: users.id, email: users.email }).from(users),
  )
  for (const row of rows) userIds.set(row.email, row.id)

  /* The seed ships no password hashes on purpose, so the two accounts this
   * suite signs in as get theirs through the same service an administrator
   * would use. */
  const admin = systemPrincipal(SEED.orgId, SEED.systemUserId)
  for (const email of [TEST_ACCOUNT, OWNER_ACCOUNT]) {
    await app.auth.service.setPassword(admin, { userId: userIds.get(email) as string }, PASSWORD, {})
  }
})

afterAll(async () => {
  await app?.close()
  await handle?.close()
})

describe('the seeded test account', () => {
  it('is one of the demo identities, in the same tenant as the rest', async () => {
    const response = await post('/auth/login', { email: TEST_ACCOUNT, password: PASSWORD })
    expect(response.statusCode, response.body).toBe(200)
    const body = response.json()
    expect(body.user.role).toBe('test')
    expect(body.user.baseRole).toBe('test')
    expect(body.user.orgId).toBe(SEED.orgId)
  })

  it('carries the organization scope, not the platform one', async () => {
    // "Do everything" stops at the tenant boundary: a test account that could
    // read a neighbouring organization's rows would make every isolation
    // guarantee conditional on which demo user is signed in.
    const claims = decodeJwt(await signIn(TEST_ACCOUNT)) as Record<string, unknown>
    expect(claims.role).toBe('test')
    expect(claims.scope).toBe('all')
  })

  it('is granted every module the matrix defines, at every action', async () => {
    const response = await get('/auth/me', await signIn(TEST_ACCOUNT))
    expect(response.statusCode).toBe(200)
    const { entitlements } = response.json()
    expect(entitlements.scope).toBe('all')
    expect(entitlements.approvalCeilingSar).toBeNull()
    for (const grant of Object.values(entitlements.modules) as string[]) {
      expect(grant).toBe('vcedax')
    }
    expect(Object.keys(entitlements.modules)).toHaveLength(28)
  })
})

describe('POST /auth/switch-role', () => {
  it('lets the test account act as any role in the matrix, and back again', async () => {
    for (const role of ROLE_IDS) {
      const token = await signIn(TEST_ACCOUNT)
      const response = await post('/auth/switch-role', { role }, token)
      expect(response.statusCode, `${role}: ${response.body}`).toBe(200)
      expect(response.json().user.role).toBe(role)
      // The account itself never changes — that is what lets it switch back
      // out of a role, like `customer`, that could never have got here.
      expect(response.json().user.baseRole).toBe('test')
    }
    const back = await post('/auth/switch-role', { role: 'test' }, await signIn(TEST_ACCOUNT))
    expect(back.json().user.role).toBe('test')
  })

  it('issues a token that carries the acting role and its data scope', async () => {
    const token = await signIn(TEST_ACCOUNT)
    const switched = await post('/auth/switch-role', { role: 'technician' }, token)
    const claims = decodeJwt(switched.json().accessToken) as Record<string, unknown>
    expect(claims.role).toBe('technician')
    // Switching narrows as readily as it widens: a technician sees `own`.
    expect(claims.scope).toBe('own')
    expect(switched.json().entitlements.approvalCeilingSar).toBe(0)

    await post('/auth/switch-role', { role: 'test' }, switched.json().accessToken)
  })

  it('enforces the acting role on a real request, not just in the response', async () => {
    const token = await signIn(TEST_ACCOUNT)
    // As itself, the account reads the customer registry.
    expect((await get('/customers', token)).statusCode).toBe(200)

    const asCustomer = await post('/auth/switch-role', { role: 'customer' }, token)
    const customerToken = asCustomer.json().accessToken as string

    /* `customer` holds nothing on the `customers` module, and the API says so
     * — the switch is enforced by the same permission check every other
     * request goes through, not by the client hiding a menu item. */
    const refused = await get('/customers', customerToken)
    expect(refused.statusCode).toBe(403)

    const restored = await post('/auth/switch-role', { role: 'test' }, customerToken)
    expect(restored.statusCode, restored.body).toBe(200)
  })

  it('refuses an account that is not the test one', async () => {
    const response = await post('/auth/switch-role', { role: 'customer' }, await signIn(OWNER_ACCOUNT))
    expect(response.statusCode).toBe(403)
    expect(response.json().error.code).toBe('forbidden')
  })

  it('refuses a role the matrix does not define', async () => {
    const response = await post('/auth/switch-role', { role: 'superuser' }, await signIn(TEST_ACCOUNT))
    expect(response.statusCode).toBe(403)
  })

  it('writes an audit row naming who switched, from what, to what', async () => {
    const token = await signIn(TEST_ACCOUNT)
    await post('/auth/switch-role', { role: 'accountant' }, token)
    const row = await latestAudit('user', userIds.get(TEST_ACCOUNT) as string)
    expect(row).toBeDefined()
    expect((row.after as Record<string, unknown>).event).toBe('role_switched')
    expect((row.after as Record<string, unknown>).actingRole).toBe('accountant')
    expect(row.actorId).toBe(userIds.get(TEST_ACCOUNT))

    await post('/auth/switch-role', { role: 'test' }, await signIn(TEST_ACCOUNT))
  })

  it('audits every request the account makes under its own user id, not the acting role’s', async () => {
    const token = await signIn(TEST_ACCOUNT)
    const switched = await post('/auth/switch-role', { role: 'manager' }, token)
    const managerToken = switched.json().accessToken as string

    const created = await post(
      '/customers',
      { name: 'Audited By Test', phone: '+966 55 111 2222', type: 'individual' },
      managerToken,
    )
    expect(created.statusCode, created.body).toBe(201)

    const [row] = await withAuthPlane(handle.db, async (tx) =>
      tx
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.entity, 'customer'), eq(auditLog.action, 'create')))
        .orderBy(desc(auditLog.id))
        .limit(1),
    )
    expect(row.actorId).toBe(userIds.get(TEST_ACCOUNT))
    // The acting role is what the row records, which is the honest answer:
    // the request really was made with a manager's authority, by this user.
    expect(row.actorRole).toBe('manager')

    await post('/auth/switch-role', { role: 'test' }, managerToken)
  })
})

describe('POST /auth/register', () => {
  const fresh = () => `founder-${Math.random().toString(36).slice(2, 10)}@example.sa`

  it('creates an organization, a main branch and its owner, and signs them in', async () => {
    const email = fresh()
    const response = await post('/auth/register', {
      name: 'Sara Al-Harbi',
      email,
      password: PASSWORD,
      phone: '+966 55 000 1111',
      organizationName: 'Harbi Motors',
    })
    expect(response.statusCode, response.body).toBe(201)
    const body = response.json()
    expect(body.user.email).toBe(email)
    expect(body.user.role).toBe('owner')
    expect(body.accessToken).toBeTypeOf('string')
    expect(body.refreshToken).toBeTypeOf('string')

    // A tenant of its own, not a seat in the seeded one.
    expect(body.user.orgId).not.toBe(SEED.orgId)
    const [org] = await withAuthPlane(handle.db, async (tx) =>
      tx.select().from(organizations).where(eq(organizations.id, body.user.orgId)).limit(1),
    )
    expect(org.name).toBe('Harbi Motors')
    expect(org.slug).toBe('harbi-motors')

    // And the token works: registration ends signed in, not at a login form.
    const me = await get('/auth/me', body.accessToken)
    expect(me.statusCode).toBe(200)
    expect(me.json().user.email).toBe(email)
  })

  it('ignores any role the caller asks for — sign-up is not a role grant', async () => {
    const email = fresh()
    const response = await post('/auth/register', {
      name: 'Optimistic Registrant',
      email,
      password: PASSWORD,
      role: 'superadmin',
      baseRole: 'test',
    })
    expect(response.statusCode, response.body).toBe(201)
    expect(response.json().user.role).toBe('owner')
  })

  it('refuses an address that already has an account', async () => {
    const email = fresh()
    const first = await post('/auth/register', { name: 'First', email, password: PASSWORD })
    expect(first.statusCode).toBe(201)
    const second = await post('/auth/register', { name: 'Second', email, password: PASSWORD })
    expect(second.statusCode).toBe(409)
    expect(second.json().error.field).toBe('email')
  })

  it('refuses a seeded address too, so a demo identity cannot be shadowed', async () => {
    const response = await post('/auth/register', {
      name: 'Impostor',
      email: OWNER_ACCOUNT,
      password: PASSWORD,
    })
    expect(response.statusCode).toBe(409)
  })

  it('applies the password policy, naming the field that failed', async () => {
    const response = await post('/auth/register', {
      name: 'Short Password',
      email: fresh(),
      password: 'short',
    })
    expect(response.statusCode).toBe(400)
    expect(response.json().error.field).toBe('password')
  })

  it('never returns or logs the password', async () => {
    const email = fresh()
    const response = await post('/auth/register', { name: 'Quiet', email, password: PASSWORD })
    expect(response.body).not.toContain(PASSWORD)
    expect(response.body).not.toContain('argon2')

    const row = await latestAudit('user', response.json().user.id as string)
    expect(JSON.stringify(row.after)).not.toContain(PASSWORD)
  })

  it('audits the organization and the user it created', async () => {
    const email = fresh()
    const body = (
      await post('/auth/register', { name: 'Audited', email, password: PASSWORD, phone: '+966 5' })
    ).json()

    const orgRow = await latestAudit('organization', body.user.orgId as string)
    expect(orgRow.action).toBe('create')
    expect((orgRow.after as Record<string, unknown>).event).toBe('registered')

    const userRow = await latestAudit('user', body.user.id as string)
    expect(userRow.actorId).toBe(body.user.id)
    expect((userRow.after as Record<string, unknown>).role).toBe('owner')
  })

  it('lets the new account sign in with the password it chose', async () => {
    const email = fresh()
    await post('/auth/register', { name: 'Returning', email, password: PASSWORD })
    const login = await post('/auth/login', { email, password: PASSWORD })
    expect(login.statusCode, login.body).toBe(200)
    expect(login.json().user.role).toBe('owner')
  })

  it('gives two workshops of the same name distinct slugs', async () => {
    const one = await post('/auth/register', {
      name: 'A',
      email: fresh(),
      password: PASSWORD,
      organizationName: 'Twin Motors',
    })
    const two = await post('/auth/register', {
      name: 'B',
      email: fresh(),
      password: PASSWORD,
      organizationName: 'Twin Motors',
    })
    const slugs = await withAuthPlane(handle.db, async (tx) =>
      tx
        .select({ id: organizations.id, slug: organizations.slug })
        .from(organizations)
        .where(eq(organizations.name, 'Twin Motors')),
    )
    expect(new Set(slugs.map((s) => s.slug)).size).toBe(2)
    expect(one.statusCode).toBe(201)
    expect(two.statusCode).toBe(201)
  })
})
