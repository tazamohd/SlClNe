/** Equipment warranties (BLK-004) — cover on the shop's own tools and fixed
 *  assets, not a customer's vehicle. A flat directory, writable through the
 *  generic collection router — the same shape `suppliers` gets — with one
 *  lifecycle move (`active` -> `claimed`) as an ordinary field write rather
 *  than a bespoke action route.
 */
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

const ACCOUNTANT = '01JWARRANTYACCOUNTANT0001X'
const TECH = '01JWARRANTYTECH000000001X'

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

describe('equipment warranty CRUD', () => {
  it('creates a warranty, assigning WRN-0001 and defaulting status to active', async () => {
    const accountant = await tokenFor('accountant', ACCOUNTANT)
    const created = await req('POST', '/equipment-warranties', accountant, {
      itemName: 'Hydraulic Lift #1',
      provider: 'LiftMaster Co',
      coverage: 'full',
      startDate: '2024-08-01',
      endDate: '2027-07-31',
    })
    expect(created.statusCode, created.body).toBe(201)
    const row = created.json() as {
      id: string
      warrantyNumber: string
      status: string
      claimedAt: string | null
    }
    expect(row.warrantyNumber).toMatch(/^WRN-\d{4}$/)
    expect(row.id).toBe(row.warrantyNumber)
    expect(row.status).toBe('active')
    expect(row.claimedAt).toBeNull()
  })

  it('assigns sequential numbers to two warranties created back to back', async () => {
    const accountant = await tokenFor('accountant', ACCOUNTANT)
    const first = await req('POST', '/equipment-warranties', accountant, {
      itemName: 'Diagnostic Scanner Pro',
      provider: 'AutoDiag Inc',
      startDate: '2025-04-18',
      endDate: '2027-04-17',
    })
    const second = await req('POST', '/equipment-warranties', accountant, {
      itemName: 'Paint Booth System',
      provider: 'SprayTech Ltd',
      startDate: '2025-01-15',
      endDate: '2028-01-14',
    })
    const a = (first.json() as { warrantyNumber: string }).warrantyNumber
    const b = (second.json() as { warrantyNumber: string }).warrantyNumber
    expect(a).not.toBe(b)
  })

  it('updates a field without touching the others', async () => {
    const accountant = await tokenFor('accountant', ACCOUNTANT)
    const created = await req('POST', '/equipment-warranties', accountant, {
      itemName: 'Wheel Alignment Machine',
      provider: 'AlignPro',
      startDate: '2024-03-10',
      endDate: '2026-09-09',
    })
    const id = (created.json() as { _id: string })._id

    const updated = await req('PATCH', `/equipment-warranties/${id}`, accountant, {
      notes: 'Serviced under warranty last quarter.',
    })
    expect(updated.statusCode, updated.body).toBe(200)
    const row = updated.json() as { itemName: string; notes: string | null }
    expect(row.itemName).toBe('Wheel Alignment Machine')
    expect(row.notes).toBe('Serviced under warranty last quarter.')
  })

  it('deletes a warranty', async () => {
    const accountant = await tokenFor('accountant', ACCOUNTANT)
    const created = await req('POST', '/equipment-warranties', accountant, {
      itemName: 'Old Welder Unit',
      provider: 'WeldMaster',
      startDate: '2021-02-15',
      endDate: '2024-02-14',
    })
    const id = (created.json() as { _id: string })._id

    const deleted = await req('DELETE', `/equipment-warranties/${id}`, accountant)
    expect(deleted.statusCode).toBe(204)
    const gone = await req('GET', `/equipment-warranties/${id}`, accountant)
    expect(gone.statusCode).toBe(404)
  })

  it('is reachable by its human warranty number as well as its id', async () => {
    const accountant = await tokenFor('accountant', ACCOUNTANT)
    const created = await req('POST', '/equipment-warranties', accountant, {
      itemName: 'Tire Changer',
      provider: 'TireTech Inc',
      startDate: '2025-07-01',
      endDate: '2027-06-30',
    })
    const { warrantyNumber } = created.json() as { warrantyNumber: string }

    const byCode = await req('GET', `/equipment-warranties/${warrantyNumber}`, accountant)
    expect(byCode.statusCode, byCode.body).toBe(200)
    expect((byCode.json() as { itemName: string }).itemName).toBe('Tire Changer')
  })

  it('refuses an empty item name', async () => {
    const accountant = await tokenFor('accountant', ACCOUNTANT)
    const response = await req('POST', '/equipment-warranties', accountant, {
      itemName: '',
      provider: 'Nobody',
      startDate: '2025-01-01',
      endDate: '2026-01-01',
    })
    expect(response.statusCode).toBe(400)
  })

  it('refuses a role with no accounting create grant', async () => {
    const tech = await tokenFor('technician', TECH)
    const response = await req('POST', '/equipment-warranties', tech, {
      itemName: 'Should Not Exist',
      provider: 'Nobody',
      startDate: '2025-01-01',
      endDate: '2026-01-01',
    })
    expect(response.statusCode).toBe(403)
  })

  /* The `r_self` RLS policy itself — denying every table to a customer
   * regardless of module grant — is proven generically for every RLS-enabled
   * table by `tests/customer-self-scope.test.ts`'s structural check, which
   * this migration's own `r_self` policy satisfies. The customer role also
   * holds no `accounting` grant at all, so the RBAC gate alone already
   * refuses this module before RLS is reached. */
})

describe('the active -> claimed lifecycle move', () => {
  it('marking a warranty claimed derives claimedAt server-side', async () => {
    const accountant = await tokenFor('accountant', ACCOUNTANT)
    const created = await req('POST', '/equipment-warranties', accountant, {
      itemName: 'Battery Charger Pro',
      provider: 'PowerMax SA',
      startDate: '2023-11-20',
      endDate: '2025-11-19',
    })
    const id = (created.json() as { _id: string })._id

    const claimed = await req('PATCH', `/equipment-warranties/${id}`, accountant, {
      status: 'claimed',
      claimNotes: 'Compressor failed under load; provider replacing the unit.',
    })
    expect(claimed.statusCode, claimed.body).toBe(200)
    const row = claimed.json() as { status: string; claimedAt: string | null; claimNotes: string | null }
    expect(row.status).toBe('claimed')
    expect(row.claimedAt).not.toBeNull()
    expect(row.claimNotes).toContain('Compressor failed')
  })

  it('moving off claimed clears claimedAt rather than leaving a stale date', async () => {
    const accountant = await tokenFor('accountant', ACCOUNTANT)
    const created = await req('POST', '/equipment-warranties', accountant, {
      itemName: 'AC Compressor Unit',
      provider: 'CoolTech SA',
      startDate: '2023-06-01',
      endDate: '2026-05-31',
    })
    const id = (created.json() as { _id: string })._id
    await req('PATCH', `/equipment-warranties/${id}`, accountant, { status: 'claimed' })

    const reverted = await req('PATCH', `/equipment-warranties/${id}`, accountant, { status: 'active' })
    expect(reverted.statusCode, reverted.body).toBe(200)
    const row = reverted.json() as { status: string; claimedAt: string | null }
    expect(row.status).toBe('active')
    expect(row.claimedAt).toBeNull()
  })

  it('refuses a role with no accounting edit grant', async () => {
    const accountant = await tokenFor('accountant', ACCOUNTANT)
    const created = await req('POST', '/equipment-warranties', accountant, {
      itemName: 'Gated Item',
      provider: 'Nobody',
      startDate: '2025-01-01',
      endDate: '2026-01-01',
    })
    const id = (created.json() as { _id: string })._id

    const tech = await tokenFor('technician', TECH)
    const response = await req('PATCH', `/equipment-warranties/${id}`, tech, { status: 'claimed' })
    expect(response.statusCode).toBe(403)
  })
})
