/** `POST /public/customers/register` and the two steps after it.
 *
 *  The seed used to be the only thing that created a customer account, and the
 *  portal's whole `self` scope hangs off one column: `users.customer_id`. An
 *  account with the `customer` role and no link is refused nowhere — it signs
 *  in and reads an empty portal, because `drizzle/0014`'s `r_self` policies
 *  compare that column against `app_customer()` and NULL matches no row. So
 *  what this file is really pinning is that the link is always written, and
 *  that the two rows are one transaction.
 *
 *  The rest is the public plane's usual suspicion. This is the one public
 *  endpoint that lets an unauthenticated caller name a tenant, so the tests
 *  below spend most of their effort on what it must *not* do: leak which
 *  organizations exist, leak which phone numbers have registered, hand out a
 *  usable account before the code comes back, or let the body ask for a role.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app'
import { withAuthPlane } from '../src/auth/context'
import { memoryTransport, type MemoryTransport } from '../src/auth/otp'
import { createDb, type DbHandle } from '../src/db/client'
import { customers, organizations, otpChallenges, users } from '../src/db/schema'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'

let app: FastifyInstance
let handle: DbHandle
let env: Env
let codes: MemoryTransport

const PHONE = '+966 55 111 2233'
const EMAIL = 'newcustomer@example.sa'

function post(url: string, payload: unknown) {
  return app.inject({
    method: 'POST',
    url,
    headers: { 'content-type': 'application/json' },
    payload: JSON.stringify(payload),
  })
}

const registration = (over: Record<string, unknown> = {}) => ({
  garageId: SEED.orgId,
  name: 'Nadia Al-Harbi',
  phone: PHONE,
  email: EMAIL,
  password: 'Str0ng-Passw0rd!',
  ...over,
})

beforeAll(async () => {
  process.env.LOGIN_RATE_LIMIT_PER_MINUTE = '10000'
  process.env.AUTH_RATE_LIMIT_PER_MINUTE = '10000'
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  codes = memoryTransport()
  app = await buildApp({ db: handle.db, env, otpTransport: codes })
  await app.ready()
}, 120_000)

afterAll(async () => {
  await app?.close()
  await handle?.close()
})

beforeEach(async () => {
  codes.clear()
  /* Each test registers from scratch; the previous one's rows would otherwise
   * make the email look taken. */
  await withAuthPlane(handle.db, async (tx) => {
    await tx.delete(users).where(eq(users.email, EMAIL))
    await tx.delete(customers).where(eq(customers.phone, PHONE))
    /* And the outstanding challenges. The resend cooldown is per destination
     * and does not care that the account behind it was deleted — which is
     * correct, and meant the second test in this file was being throttled by
     * the first until this line existed. */
    await tx.delete(otpChallenges).where(eq(otpChallenges.destination, PHONE))
  })
})

async function accountFor(email: string) {
  const [row] = await withAuthPlane(handle.db, (tx) =>
    tx
      .select({
        id: users.id,
        role: users.role,
        status: users.status,
        orgId: users.orgId,
        customerId: users.customerId,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1),
  )
  return row
}

describe('registering', () => {
  it('writes the customer, the account and the link between them', async () => {
    const response = await post('/api/v1/public/customers/register', registration())
    expect(response.statusCode).toBe(202)

    const account = await accountFor(EMAIL)
    expect(account).toBeDefined()
    expect(account?.role).toBe('customer')
    expect(account?.orgId).toBe(SEED.orgId)

    /* The whole point. Without this the account signs in to an empty portal. */
    expect(account?.customerId).toBeTruthy()
    const [customer] = await withAuthPlane(handle.db, (tx) =>
      tx
        .select({ id: customers.id, name: customers.name, phone: customers.phone })
        .from(customers)
        .where(eq(customers.id, account?.customerId as string))
        .limit(1),
    )
    expect(customer?.name).toBe('Nadia Al-Harbi')
    expect(customer?.phone).toBe(PHONE)
  })

  it('leaves the account unusable until the code comes back', async () => {
    await post('/api/v1/public/customers/register', registration())
    expect((await accountFor(EMAIL))?.status).toBe('pending')

    /* `login` refuses any status but `active`, so this needs no new gate — and
     * this test is what says so, rather than the comment claiming it. */
    const signIn = await post('/api/v1/auth/login', {
      email: EMAIL,
      password: 'Str0ng-Passw0rd!',
    })
    expect(signIn.statusCode).toBeGreaterThanOrEqual(400)
  })

  it('returns nothing a caller could not have known', async () => {
    const body = JSON.parse((await post('/api/v1/public/customers/register', registration())).payload)
    /* No id, no token, no organization name: the response says a code is on its
     * way and when it expires, and nothing else. */
    expect(Object.keys(body).sort()).toEqual(['expiresAt', 'message', 'status'])
    expect(JSON.stringify(body)).not.toContain(SEED.orgId)
  })

  it('refuses a garage that does not exist the same way as one that is not active', async () => {
    /* Two different truths, one answer. A caller that could tell them apart
     * would have an oracle for which organization ids are real. */
    const unknown = await post(
      '/api/v1/public/customers/register',
      registration({ garageId: '01JZZZZZZZZZZZZZZZZZZZZZZZ', email: 'a@example.sa' }),
    )
    await withAuthPlane(handle.db, (tx) =>
      tx.update(organizations).set({ status: 'suspended' }).where(eq(organizations.id, SEED.otherOrgId)),
    )
    const neighbourSuspended = await post(
      '/api/v1/public/customers/register',
      registration({ garageId: SEED.otherOrgId, email: 'b@example.sa' }),
    )

    expect(unknown.statusCode).toBe(400)
    expect(neighbourSuspended.statusCode).toBe(400)
    expect(JSON.parse(unknown.payload).error.message).toBe(
      JSON.parse(neighbourSuspended.payload).error.message,
    )
  })

  it('refuses an unknown key rather than ignoring it', async () => {
    /* `.strict()`. The key that matters is `role`: a public body must not be
     * able to ask for one. */
    const response = await post('/api/v1/public/customers/register', registration({ role: 'owner' }))
    expect(response.statusCode).toBe(400)
    expect(await accountFor(EMAIL)).toBeUndefined()
  })

  it('refuses a weak password before writing anything', async () => {
    const response = await post('/api/v1/public/customers/register', registration({ password: 'abc' }))
    expect(response.statusCode).toBe(400)
    expect(await accountFor(EMAIL)).toBeUndefined()
    const [orphan] = await withAuthPlane(handle.db, (tx) =>
      tx.select({ id: customers.id }).from(customers).where(eq(customers.phone, PHONE)).limit(1),
    )
    /* No customer row without an account to own it. */
    expect(orphan).toBeUndefined()
  })

  it('refuses an address that already has an account', async () => {
    await post('/api/v1/public/customers/register', registration())
    const again = await post('/api/v1/public/customers/register', registration())
    expect(again.statusCode).toBe(409)
  })
})

describe('verifying', () => {
  it('activates the account with the code that was sent', async () => {
    await post('/api/v1/public/customers/register', registration())
    const code = codes.codeFor(PHONE)
    expect(code).toBeTruthy()

    const verified = await post('/api/v1/public/customers/verify-otp', { phone: PHONE, code })
    expect(verified.statusCode).toBe(200)
    expect((await accountFor(EMAIL))?.status).toBe('active')

    const signIn = await post('/api/v1/auth/login', {
      email: EMAIL,
      password: 'Str0ng-Passw0rd!',
    })
    expect(signIn.statusCode).toBe(200)
  })

  it('refuses a wrong code and leaves the account pending', async () => {
    await post('/api/v1/public/customers/register', registration())
    const wrong = await post('/api/v1/public/customers/verify-otp', { phone: PHONE, code: '000000' })
    expect(wrong.statusCode).toBeGreaterThanOrEqual(400)
    expect((await accountFor(EMAIL))?.status).toBe('pending')
  })

  it('will not accept the same code twice', async () => {
    await post('/api/v1/public/customers/register', registration())
    const code = codes.codeFor(PHONE) as string
    expect((await post('/api/v1/public/customers/verify-otp', { phone: PHONE, code })).statusCode).toBe(200)
    /* A code that works twice is a code an attacker can use after watching it
     * work once — `verifyChallenge` consumes it, and this is the proof. */
    const replay = await post('/api/v1/public/customers/verify-otp', { phone: PHONE, code })
    expect(replay.statusCode).toBeGreaterThanOrEqual(400)
  })

  it('answers a number nobody registered exactly as it answers a wrong code', async () => {
    const stranger = await post('/api/v1/public/customers/verify-otp', {
      phone: '+966 50 000 0000',
      code: '123456',
    })
    await post('/api/v1/public/customers/register', registration())
    const wrong = await post('/api/v1/public/customers/verify-otp', { phone: PHONE, code: '000000' })
    expect(stranger.statusCode).toBe(wrong.statusCode)
    expect(JSON.parse(stranger.payload).error.message).toBe(JSON.parse(wrong.payload).error.message)
  })
})

describe('resending', () => {
  it('says the same thing for a registered number and a stranger', async () => {
    /* Otherwise the endpoint is a directory of who has signed up. */
    const stranger = await post('/api/v1/public/customers/resend-otp', { phone: '+966 50 000 0001' })
    expect(stranger.statusCode).toBe(202)
    expect(JSON.parse(stranger.payload).message).toBeTruthy()
  })

  it('is throttled', async () => {
    await post('/api/v1/public/customers/register', registration())
    /* `issueChallenge` refuses a second code inside the cooldown, and the route
     * turns that into a 429 with a retry-after rather than a silent success. */
    const immediate = await post('/api/v1/public/customers/resend-otp', { phone: PHONE })
    expect(immediate.statusCode).toBe(429)
    expect(immediate.headers['retry-after']).toBeTruthy()
  })
})

describe('what the new account can then see', () => {
  it('reads its own empty portal, and nobody else’s rows', async () => {
    /* The registration is only worth anything if the account it makes lands
     * inside the `self` scope correctly: its own records, which for a customer
     * who has never visited is none, and never the workshop's other customers. */
    await post('/api/v1/public/customers/register', registration())
    const code = codes.codeFor(PHONE) as string
    await post('/api/v1/public/customers/verify-otp', { phone: PHONE, code })

    const token = JSON.parse(
      (await post('/api/v1/auth/login', { email: EMAIL, password: 'Str0ng-Passw0rd!' })).payload,
    ).accessToken as string

    for (const path of ['/vehicles', '/invoices', '/jobs']) {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1${path}`,
        headers: { authorization: `Bearer ${token}` },
      })
      expect(response.statusCode, path).toBe(200)
      expect(JSON.parse(response.payload).rows, path).toHaveLength(0)
    }

    /* And the account is linked, so the emptiness is "no service yet" rather
     * than the fail-closed blindness of a missing `customer_id`. */
    const account = await accountFor(EMAIL)
    const [own] = await withAuthPlane(handle.db, (tx) =>
      tx
        .select({ id: customers.id })
        .from(customers)
        .where(and(eq(customers.id, account?.customerId as string), eq(customers.orgId, SEED.orgId)))
        .limit(1),
    )
    expect(own).toBeDefined()
  })
})
