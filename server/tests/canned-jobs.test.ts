/** Canned Jobs — predefined, priced service packages (build-order item 5).
 *
 *  Covers the loop the feature exists for: an advisor bundles labour and
 *  parts lines into a named package, the server prices it the same way
 *  `POST /estimates` prices an estimate (never trusting a client-sent
 *  total), a role that can only view estimates cannot create or edit the
 *  catalog, updating replaces the lines and reprices rather than merging,
 *  and a customer — who has no more business browsing the shop's price list
 *  than its parts costs — sees none of it.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app'
import { createDb, type DbHandle } from '../src/db/client'
import type { Env } from '../src/env'
import { customers, users } from '../src/db/schema'
import { withAuthPlane } from '../src/auth/context'
import { resetDatabase, SEED } from './harness'

let app: FastifyInstance
let handle: DbHandle
let admin: DbHandle
let env: Env

const ADVISOR = '01JCANNEDJOBADVISOR00001'
const MANAGER = '01JCANNEDJOBMANAGER00001'
const TECH = '01JCANNEDJOBTECH0000001'
let ahmedUserId = ''
let ahmedCustomerId = ''

async function token(role: string, sub: string, extra: Record<string, unknown> = {}): Promise<string> {
  const { SignJWT } = await import('jose')
  const key = new TextEncoder().encode(env.JWT_SECRET as string)
  return new SignJWT({ role, org_id: SEED.orgId, branch_id: SEED.mainBranchId, ...extra })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(key)
}

function post(url: string, bearer: string, body: unknown) {
  return app.inject({
    method: 'POST',
    url: `/api/v1${url}`,
    headers: { authorization: `Bearer ${bearer}`, 'content-type': 'application/json' },
    payload: JSON.stringify(body),
  })
}

function patch(url: string, bearer: string, body: unknown) {
  return app.inject({
    method: 'PATCH',
    url: `/api/v1${url}`,
    headers: { authorization: `Bearer ${bearer}`, 'content-type': 'application/json' },
    payload: JSON.stringify(body),
  })
}

function get(url: string, bearer: string) {
  return app.inject({
    method: 'GET',
    url: `/api/v1${url}`,
    headers: { authorization: `Bearer ${bearer}` },
  })
}

async function asPlatform<T>(fn: Parameters<typeof withAuthPlane<T>>[1]): Promise<T> {
  return withAuthPlane(admin.db, fn)
}

beforeAll(async () => {
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  admin = createDb(env.DATABASE_ADMIN_URL ?? env.DATABASE_URL, 2)
  app = await buildApp({ db: handle.db, env })
  await app.ready()

  const [user] = await asPlatform((tx) =>
    tx.select({ id: users.id }).from(users).where(eq(users.email, 'ahmed@example.sa')).limit(1),
  )
  if (!user) throw new Error('the seed carries no customer demo login')
  ahmedUserId = user.id

  const [customer] = await asPlatform((tx) =>
    tx.select({ id: customers.id }).from(customers).where(eq(customers.name, 'Ahmed Al-Rashid')).limit(1),
  )
  if (!customer) throw new Error('the seed carries no "Ahmed Al-Rashid" customer')
  ahmedCustomerId = customer.id
}, 120_000)

afterAll(async () => {
  await app?.close()
  await handle?.close()
  await admin?.close()
})

const OIL_CHANGE = {
  name: 'Standard Oil Change',
  nameAr: 'تغيير زيت عادي',
  category: 'Maintenance',
  lines: [
    { description: 'Synthetic oil, 5L', kind: 'part' as const, qty: 5, unitPriceHalalas: 4000 },
    { description: 'Oil filter', kind: 'part' as const, qty: 1, unitPriceHalalas: 2500 },
    { description: 'Labour', kind: 'labour' as const, qty: 0.5, unitPriceHalalas: 15000 },
  ],
}

describe('creating a canned job', () => {
  it('lets an advisor create a package and prices it from the lines', async () => {
    const advisor = await token('advisor', ADVISOR)
    const response = await post('/canned-jobs', advisor, OIL_CHANGE)
    expect(response.statusCode, response.body).toBe(201)
    const row = response.json() as {
      name: string
      nameAr: string
      category: string
      active: boolean
      priceHalalas: number
      lineCount: number
    }
    expect(row.name).toBe('Standard Oil Change')
    expect(row.active).toBe(true)
    // 5*4000 + 1*2500 + 0.5*15000 = 20000 + 2500 + 7500 = 30000
    expect(row.priceHalalas).toBe(30000)
    expect(row.lineCount).toBe(3)
  })

  it('lets a manager create one too', async () => {
    const manager = await token('manager', MANAGER)
    const response = await post('/canned-jobs', manager, {
      name: 'Brake Pad Replacement — Front',
      lines: [{ description: 'Front brake pads', kind: 'part', qty: 1, unitPriceHalalas: 35000 }],
    })
    expect(response.statusCode, response.body).toBe(201)
  })

  it('refuses a role that can only view estimates', async () => {
    const tech = await token('technician', TECH)
    const response = await post('/canned-jobs', tech, OIL_CHANGE)
    expect(response.statusCode).toBe(403)
  })

  it('rejects a body with no lines', async () => {
    const advisor = await token('advisor', ADVISOR)
    const response = await post('/canned-jobs', advisor, { name: 'Empty Package', lines: [] })
    expect(response.statusCode).toBe(400)
  })

  it('rejects a body missing a name', async () => {
    const advisor = await token('advisor', ADVISOR)
    const response = await post('/canned-jobs', advisor, { lines: OIL_CHANGE.lines })
    expect(response.statusCode).toBe(400)
  })
})

describe('updating a canned job', () => {
  async function createJob() {
    const advisor = await token('advisor', ADVISOR)
    const created = await post('/canned-jobs', advisor, OIL_CHANGE)
    return { advisor, id: (created.json() as { _id: string })._id }
  }

  it('changes a field without touching the price', async () => {
    const { advisor, id } = await createJob()
    const patched = await patch(`/canned-jobs/${id}`, advisor, { category: 'Fluids' })
    expect(patched.statusCode, patched.body).toBe(200)
    const row = patched.json() as { category: string; priceHalalas: number }
    expect(row.category).toBe('Fluids')
    expect(row.priceHalalas).toBe(30000)
  })

  it('replaces the lines and reprices when a new lines array is sent', async () => {
    const { advisor, id } = await createJob()
    const patched = await patch(`/canned-jobs/${id}`, advisor, {
      lines: [{ description: 'Synthetic oil, 6L', kind: 'part', qty: 6, unitPriceHalalas: 4000 }],
    })
    expect(patched.statusCode, patched.body).toBe(200)
    const row = patched.json() as { priceHalalas: number; lineCount: number }
    expect(row.priceHalalas).toBe(24000)
    expect(row.lineCount).toBe(1)

    const lines = await get(`/canned-jobs/${id}/lines`, advisor)
    expect(lines.statusCode, lines.body).toBe(200)
    const body = lines.json() as { rows: { description: string }[] }
    expect(body.rows).toHaveLength(1)
    expect(body.rows[0]?.description).toBe('Synthetic oil, 6L')
  })

  it('can retire a package without touching its lines', async () => {
    const { advisor, id } = await createJob()
    const patched = await patch(`/canned-jobs/${id}`, advisor, { active: false })
    expect(patched.statusCode, patched.body).toBe(200)
    expect((patched.json() as { active: boolean; lineCount: number }).active).toBe(false)
    expect((patched.json() as { active: boolean; lineCount: number }).lineCount).toBe(3)
  })

  it('refuses a role that can only view estimates', async () => {
    const { id } = await createJob()
    const tech = await token('technician', TECH)
    const response = await patch(`/canned-jobs/${id}`, tech, { category: 'Fluids' })
    expect(response.statusCode).toBe(403)
  })
})

describe('reading canned jobs', () => {
  it('lists a created package through the generic collection route', async () => {
    const advisor = await token('advisor', ADVISOR)
    await post('/canned-jobs', advisor, OIL_CHANGE)
    const response = await get('/canned-jobs', advisor)
    expect(response.statusCode, response.body).toBe(200)
    const body = response.json() as { rows: { name: string }[] }
    expect(body.rows.some((r) => r.name === 'Standard Oil Change')).toBe(true)
  })

  it('returns the bundle lines', async () => {
    const advisor = await token('advisor', ADVISOR)
    const created = await post('/canned-jobs', advisor, OIL_CHANGE)
    const id = (created.json() as { _id: string })._id
    const response = await get(`/canned-jobs/${id}/lines`, advisor)
    expect(response.statusCode, response.body).toBe(200)
    const body = response.json() as { rows: { description: string; kind: string; qty: number }[] }
    expect(body.rows).toHaveLength(3)
    expect(body.rows.map((r) => r.description)).toContain('Labour')
  })

  it('shows no canned jobs to a customer', async () => {
    const advisor = await token('advisor', ADVISOR)
    await post('/canned-jobs', advisor, OIL_CHANGE)

    const customer = await token('customer', ahmedUserId, { customer_id: ahmedCustomerId })
    const response = await get('/canned-jobs', customer)
    expect(response.statusCode, response.body).toBe(200)
    const body = response.json() as { rows: unknown[] }
    expect(body.rows).toHaveLength(0)
  })
})
