/** Notifications (BLK-004) — a per-tenant feed of job, appointment, invoice
 *  and stock alerts. A flat directory, writable through the generic
 *  collection router — the same shape `equipmentWarranties` gets — with one
 *  lifecycle move (unread -> read) as an ordinary field write rather than a
 *  bespoke action route.
 *
 *  `dashboard` grants `c` only to `test` — a real notification is filed by
 *  the system, not typed in by a staff member, so no operating role can
 *  `POST` one through the API. Every fixture row below is created with the
 *  `test` token for that reason; the interesting assertions are what
 *  `advisor`/`technician` can do to a row that already exists — read, mark
 *  read and dismiss, which `dashboard`'s broad `v`/`e`/`d` grant covers for
 *  every operating role. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'
import type { FastifyInstance } from 'fastify'
import type { RoleId } from '@salis/contract'
import { buildApp } from '../src/app'
import { createDb, type DbHandle } from '../src/db/client'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'

let handle: DbHandle
let env: Env
let app: FastifyInstance

async function tokenFor(role: RoleId, sub: string): Promise<string> {
  const key = new TextEncoder().encode(env.JWT_SECRET as string)
  return new SignJWT({ role, org_id: SEED.orgId, branch_id: SEED.mainBranchId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(key)
}

function req(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', url: string, bearer: string, body?: unknown) {
  return app.inject({
    method,
    url: `/api/v1${url}`,
    headers: { authorization: `Bearer ${bearer}`, ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
    ...(body === undefined ? {} : { payload: JSON.stringify(body) }),
  })
}

const SYSTEM = '01JNOTIFSYSTEM0000000001X'
const ADVISOR = '01JNOTIFADVISOR0000000001X'
const TECHNICIAN = '01JNOTIFTECH0000000000001X'
const CUSTOMER = '01JNOTIFCUSTOMER000000001X'

beforeAll(async () => {
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  app = await buildApp({ db: handle.db, env })
  await app.ready()
})

afterAll(async () => {
  await app?.close()
  await handle?.close()
})

describe('notifications CRUD', () => {
  it('lists the seeded notification feed', async () => {
    const advisor = await tokenFor('advisor', ADVISOR)
    const response = await req('GET', '/notifications', advisor)
    expect(response.statusCode, response.body).toBe(200)
    const body = response.json() as { rows: Array<{ title: string; category: string }> }
    expect(body.rows.length).toBeGreaterThanOrEqual(8)
    expect(body.rows.some((n) => n.category === 'invoice')).toBe(true)
  })

  it('creates a notification, defaulting category/severity and read to false', async () => {
    const system = await tokenFor('test', SYSTEM)
    const created = await req('POST', '/notifications', system, {
      title: 'New parts shipment arrived',
      message: 'A shipment of 40 oil filters has been received into stock.',
    })
    expect(created.statusCode, created.body).toBe(201)
    const row = created.json() as {
      category: string
      severity: string
      read: boolean
      readAt: string | null
    }
    expect(row.category).toBe('system')
    expect(row.severity).toBe('info')
    expect(row.read).toBe(false)
    expect(row.readAt).toBeNull()
  })

  it('creates a notification already read when the client asks for it', async () => {
    const system = await tokenFor('test', SYSTEM)
    const created = await req('POST', '/notifications', system, {
      category: 'stock',
      severity: 'warning',
      title: 'Filed after the fact',
      message: 'Handled before this notice was even written down.',
      read: true,
    })
    expect(created.statusCode, created.body).toBe(201)
    const row = created.json() as { read: boolean; readAt: string | null }
    expect(row.read).toBe(true)
    expect(row.readAt).not.toBeNull()
  })

  it('lets an advisor update a field without touching the others', async () => {
    const system = await tokenFor('test', SYSTEM)
    const created = await req('POST', '/notifications', system, {
      category: 'appointment',
      title: 'Reschedule requested',
      message: 'Customer asked to move Tuesday’s slot.',
    })
    const id = (created.json() as { _id: string })._id

    const advisor = await tokenFor('advisor', ADVISOR)
    const updated = await req('PATCH', `/notifications/${id}`, advisor, {
      message: 'Customer asked to move Tuesday’s slot to Wednesday.',
    })
    expect(updated.statusCode, updated.body).toBe(200)
    const row = updated.json() as { title: string; message: string }
    expect(row.title).toBe('Reschedule requested')
    expect(row.message).toContain('Wednesday')
  })

  it('lets a technician delete (dismiss) a notification', async () => {
    const system = await tokenFor('test', SYSTEM)
    const created = await req('POST', '/notifications', system, {
      title: 'Dismiss me',
      message: 'This one gets cleared.',
    })
    const id = (created.json() as { _id: string })._id

    const technician = await tokenFor('technician', TECHNICIAN)
    const deleted = await req('DELETE', `/notifications/${id}`, technician)
    expect(deleted.statusCode).toBe(204)
    const gone = await req('GET', `/notifications/${id}`, technician)
    expect(gone.statusCode).toBe(404)
  })

  it('refuses an empty title', async () => {
    const system = await tokenFor('test', SYSTEM)
    const response = await req('POST', '/notifications', system, {
      title: '',
      message: 'No title, should be refused.',
    })
    expect(response.statusCode).toBe(400)
  })

  it('refuses any operating role trying to create one directly — a notification is filed by the system, not typed in', async () => {
    const advisor = await tokenFor('advisor', ADVISOR)
    const response = await req('POST', '/notifications', advisor, {
      title: 'Should not be creatable by an advisor',
      message: 'Nobody types these in.',
    })
    expect(response.statusCode).toBe(403)
  })

  it('refuses a role with no dashboard grant at all', async () => {
    const customer = await tokenFor('customer', CUSTOMER)
    const response = await req('GET', '/notifications', customer)
    expect(response.statusCode).toBe(403)
  })

  /* The `r_self` RLS policy itself — denying every table to a customer
   * regardless of module grant — is proven generically for every RLS-enabled
   * table by `tests/customer-self-scope.test.ts`'s structural check, which
   * this migration's own `r_self` policy satisfies. The customer role also
   * holds no `dashboard` grant at all, so the RBAC gate alone already
   * refuses this module before RLS is reached. */
})

describe('the unread -> read lifecycle move', () => {
  it('marking a notification read derives readAt server-side', async () => {
    const system = await tokenFor('test', SYSTEM)
    const created = await req('POST', '/notifications', system, {
      category: 'invoice',
      severity: 'critical',
      title: 'Invoice INV-2026-0141 overdue',
      message: "Fatima Al-Zahrani's invoice for SAR 4,250 is overdue.",
      link: 'INV-2026-0141',
    })
    const id = (created.json() as { _id: string })._id

    const advisor = await tokenFor('advisor', ADVISOR)
    const marked = await req('PATCH', `/notifications/${id}`, advisor, { read: true })
    expect(marked.statusCode, marked.body).toBe(200)
    const row = marked.json() as { read: boolean; readAt: string | null }
    expect(row.read).toBe(true)
    expect(row.readAt).not.toBeNull()
  })

  it('marking a notification unread again clears readAt rather than leaving a stale date', async () => {
    const system = await tokenFor('test', SYSTEM)
    const created = await req('POST', '/notifications', system, {
      title: 'Toggle me',
      message: 'Read then unread.',
      read: true,
    })
    const id = (created.json() as { _id: string })._id

    const advisor = await tokenFor('advisor', ADVISOR)
    const reverted = await req('PATCH', `/notifications/${id}`, advisor, { read: false })
    expect(reverted.statusCode, reverted.body).toBe(200)
    const row = reverted.json() as { read: boolean; readAt: string | null }
    expect(row.read).toBe(false)
    expect(row.readAt).toBeNull()
  })

  it('a technician can mark their own tenant feed read too — dashboard write is broad, not accounting-gated', async () => {
    const system = await tokenFor('test', SYSTEM)
    const created = await req('POST', '/notifications', system, {
      title: 'Bay 2 job ready for inspection',
      message: 'Technician-visible notice.',
    })
    const id = (created.json() as { _id: string })._id

    const technician = await tokenFor('technician', TECHNICIAN)
    const marked = await req('PATCH', `/notifications/${id}`, technician, { read: true })
    expect(marked.statusCode, marked.body).toBe(200)
  })

  it('refuses a role with no dashboard edit grant', async () => {
    const system = await tokenFor('test', SYSTEM)
    const created = await req('POST', '/notifications', system, {
      title: 'Gated item',
      message: 'Nobody outside dashboard can touch this.',
    })
    const id = (created.json() as { _id: string })._id

    const customer = await tokenFor('customer', CUSTOMER)
    const response = await req('PATCH', `/notifications/${id}`, customer, { read: true })
    expect(response.statusCode).toBe(403)
  })
})
