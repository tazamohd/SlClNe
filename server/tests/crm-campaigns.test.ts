/** CRM messaging dispatch — build-order item 7.
 *
 *  `campaigns` had a real DB table and a real read, but no writer registered
 *  (`writable` was missing from its collection definition), so the
 *  create/edit/delete UI that already existed called an endpoint that was
 *  never wired up. This suite proves the writes now work, and that
 *  `POST /crm/campaigns/:id/send` follows the same EXTERNAL_DEPENDENCY idiom
 *  as the OBD bridge and the OTP transport: refuses honestly by default,
 *  dispatches through an explicit mock in tests, and never invents a reach or
 *  delivery count nothing produced.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'
import type { FastifyInstance } from 'fastify'
import type { RoleId } from '@salis/contract'
import { buildApp } from '../src/app'
import { createDb, type DbHandle } from '../src/db/client'
import type { Env } from '../src/env'
import { mockMessagingTransport, unconfiguredMessagingTransport } from '../src/integrations/messaging'
import { resetDatabase, SEED } from './harness'

let handle: DbHandle
let env: Env
/** The default (unconfigured) app, to prove the refusal, and a mock-wired one
 *  to prove the dispatch contract. */
let liveApp: FastifyInstance
let mockApp: FastifyInstance

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

function req(app: FastifyInstance, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', url: string, bearer: string, body?: unknown) {
  return app.inject({
    method,
    url: `/api/v1${url}`,
    headers: { authorization: `Bearer ${bearer}`, ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
    ...(body === undefined ? {} : { payload: JSON.stringify(body) }),
  })
}

const MANAGER = '01JCAMPMANAGER0000000001X'
const TECH = '01JCAMPTECH000000000001X'

beforeAll(async () => {
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  liveApp = await buildApp({ db: handle.db, env })
  mockApp = await buildApp({ db: handle.db, env, messagingTransport: mockMessagingTransport })
  await liveApp.ready()
  await mockApp.ready()
})

afterAll(async () => {
  await liveApp?.close()
  await mockApp?.close()
  await handle?.close()
})

describe('campaign CRUD — the write route the generic router was missing', () => {
  it('creates a campaign through the generic collection route', async () => {
    const manager = await tokenFor('manager', MANAGER)
    const created = await req(liveApp, 'POST', '/crm/campaigns', manager, {
      name: 'Autumn Service Drive',
      type: 'email',
      budgetHalalas: 500_000,
    })
    expect(created.statusCode, created.body).toBe(201)
    const row = created.json() as { _id: string; name: string; type: string; status: string; budget: string }
    expect(row.name).toBe('Autumn Service Drive')
    expect(row.status).toBe('draft')
    expect(row.budget).toContain('5,000')
  })

  it('updates a field without touching the others', async () => {
    const manager = await tokenFor('manager', MANAGER)
    const created = await req(liveApp, 'POST', '/crm/campaigns', manager, { name: 'Winter Tyres', type: 'sms' })
    const id = (created.json() as { _id: string })._id

    const updated = await req(liveApp, 'PATCH', `/crm/campaigns/${id}`, manager, { status: 'scheduled' })
    expect(updated.statusCode, updated.body).toBe(200)
    const row = updated.json() as { name: string; status: string }
    expect(row.name).toBe('Winter Tyres')
    expect(row.status).toBe('scheduled')
  })

  it('deletes a campaign', async () => {
    const manager = await tokenFor('manager', MANAGER)
    const created = await req(liveApp, 'POST', '/crm/campaigns', manager, { name: 'Discontinued', type: 'social' })
    const id = (created.json() as { _id: string })._id

    const deleted = await req(liveApp, 'DELETE', `/crm/campaigns/${id}`, manager)
    expect(deleted.statusCode).toBe(204)
    const gone = await req(liveApp, 'GET', `/crm/campaigns/${id}`, manager)
    expect(gone.statusCode).toBe(404)
  })

  it('refuses an empty name', async () => {
    const manager = await tokenFor('manager', MANAGER)
    const response = await req(liveApp, 'POST', '/crm/campaigns', manager, { name: '' })
    expect(response.statusCode).toBe(400)
  })

  it('refuses a role with no crm grant', async () => {
    const tech = await tokenFor('technician', TECH)
    const response = await req(liveApp, 'POST', '/crm/campaigns', tech, { name: 'Should Not Exist', type: 'email' })
    expect(response.statusCode).toBe(403)
  })
})

describe('POST /crm/campaigns/:id/send — messaging as EXTERNAL_DEPENDENCY', () => {
  it('the default transport refuses with a 503 naming the missing config', async () => {
    expect(unconfiguredMessagingTransport.configured).toBe(false)
    const manager = await tokenFor('manager', MANAGER)
    const created = await req(liveApp, 'POST', '/crm/campaigns', manager, { name: 'SMS Blast', type: 'sms' })
    const id = (created.json() as { _id: string })._id

    const sent = await req(liveApp, 'POST', `/crm/campaigns/${id}/send`, manager)
    expect(sent.statusCode).toBe(503)
    const body = sent.json() as { error: { code: string; message: string } }
    expect(body.error.code).toBe('external_dependency_unavailable')
    expect(body.error.message).toContain('MESSAGING_PROVIDER_URL')

    // Refusing to dispatch leaves the campaign exactly as it was.
    const after = await req(liveApp, 'GET', `/crm/campaigns/${id}`, manager)
    expect((after.json() as { status: string }).status).toBe('draft')
  })

  it('the mock transport dispatches, flips draft to running, and flags the response mock', async () => {
    const manager = await tokenFor('manager', MANAGER)
    const created = await req(mockApp, 'POST', '/crm/campaigns', manager, { name: 'WhatsApp Reminder', type: 'whatsapp' })
    const id = (created.json() as { _id: string })._id
    const before = created.json() as { reach: number; opens: number }

    const sent = await req(mockApp, 'POST', `/crm/campaigns/${id}/send`, manager)
    expect(sent.statusCode, sent.body).toBe(200)
    const row = sent.json() as { status: string; reach: number; opens: number }
    expect(row.status).toBe('running')
    /* Never a fabricated reach/open count: this deployment resolves no
     * audience for a campaign, so a dispatch leaves them exactly as they
     * were rather than inventing a plausible number. */
    expect(row.reach).toBe(before.reach)
    expect(row.opens).toBe(before.opens)
  })

  it('refuses an email campaign — there is no email provider to dispatch to here', async () => {
    const manager = await tokenFor('manager', MANAGER)
    const created = await req(mockApp, 'POST', '/crm/campaigns', manager, { name: 'Newsletter', type: 'email' })
    const id = (created.json() as { _id: string })._id

    const sent = await req(mockApp, 'POST', `/crm/campaigns/${id}/send`, manager)
    expect(sent.statusCode).toBe(400)
    expect((sent.json() as { error: { field: string } }).error.field).toBe('type')
  })

  it('refuses to re-send a completed campaign', async () => {
    const manager = await tokenFor('manager', MANAGER)
    const created = await req(mockApp, 'POST', '/crm/campaigns', manager, { name: 'Already Done', type: 'sms', status: 'completed' })
    const id = (created.json() as { _id: string })._id

    const sent = await req(mockApp, 'POST', `/crm/campaigns/${id}/send`, manager)
    expect(sent.statusCode).toBe(400)
    expect((sent.json() as { error: { field: string } }).error.field).toBe('status')
  })

  it('refuses a role with no crm edit grant', async () => {
    const manager = await tokenFor('manager', MANAGER)
    const created = await req(mockApp, 'POST', '/crm/campaigns', manager, { name: 'Gated', type: 'sms' })
    const id = (created.json() as { _id: string })._id

    const tech = await tokenFor('technician', TECH)
    const sent = await req(mockApp, 'POST', `/crm/campaigns/${id}/send`, tech)
    expect(sent.statusCode).toBe(403)
  })
})

describe('GET /diagnostics/integrations — messaging reported honestly', () => {
  it('lists the messaging transport alongside OBD and OTP, unconfigured by default', async () => {
    const manager = await tokenFor('manager', MANAGER)
    const status = (await req(liveApp, 'GET', '/diagnostics/integrations', manager)).json() as {
      integrations: { id: string; configured: boolean; dependency: string }[]
    }
    const messaging = status.integrations.find((i) => i.id === 'messaging')
    expect(messaging?.configured).toBe(false)
    expect(messaging?.dependency).toContain('provider')
  })
})
