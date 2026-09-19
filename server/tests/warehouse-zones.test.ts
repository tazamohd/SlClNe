/** Warehouse zones (BLK-004) — the bays stock is put away in, and the
 *  `parts.zone_code` reference that makes each zone's item count and
 *  utilisation *derived* from the stock rather than recorded on the zone.
 *
 *  What is worth proving here is exactly that boundary: a zone row can record
 *  its capacity, and cannot record a count or a utilisation; a part can only be
 *  put away in one of this tenant's own zones; and the one lifecycle timestamp
 *  is derived from the status transition, never posted.
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
    headers: {
      authorization: `Bearer ${bearer}`,
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    ...(body === undefined ? {} : { payload: JSON.stringify(body) }),
  })
}

const STOREKEEPER = '01JZONESTOREKEEPER00001X'
const TECH = '01JZONETECH00000000001X'

type ZoneRow = {
  _id: string
  id: string
  code: string
  name: string
  kind: string
  capacityUnits: number
  status: string
  maintenanceSince: string | null
  notes: string | null
}

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

describe('the seeded zone directory', () => {
  it('serves the six bays, keyed by the code painted on the floor', async () => {
    const parts = await tokenFor('parts', STOREKEEPER)
    const response = await req('GET', '/warehouse-zones?pageSize=50', parts)
    expect(response.statusCode, response.body).toBe(200)
    const { rows } = response.json() as { rows: ZoneRow[] }
    expect(rows.map((zone) => zone.code)).toEqual(['A1', 'A2', 'A3', 'A4', 'A5', 'A6'])
    /* Golden Path 7 depends on the Receiving bay being a real row rather than
     * a label in static copy. */
    const receiving = rows.find((zone) => zone.code === 'A5')
    expect(receiving?.name).toBe('Receiving')
    expect(receiving?.kind).toBe('receiving')
    expect(receiving?.capacityUnits).toBe(150)
  })

  it('records capacity and status, and no item count or utilisation at all', async () => {
    const parts = await tokenFor('parts', STOREKEEPER)
    const response = await req('GET', '/warehouse-zones/A1', parts)
    expect(response.statusCode, response.body).toBe(200)
    const zone = response.json() as ZoneRow & Record<string, unknown>
    expect(zone.capacityUnits).toBe(500)
    /* The whole point of the change: a zone row cannot carry a stock number,
     * so nothing can present a typed-in count as a computed utilisation. */
    expect(zone.itemCount).toBeUndefined()
    expect(zone.utilization).toBeUndefined()
    expect(zone.utilized).toBeUndefined()
  })
})

describe('the per-zone counts are derived from the parts assigned to the zone', () => {
  it('serves each part with the bay it is racked in', async () => {
    const parts = await tokenFor('parts', STOREKEEPER)
    const response = await req('GET', '/inventory?pageSize=50', parts)
    expect(response.statusCode, response.body).toBe(200)
    const { rows } = response.json() as { rows: { sku: string; stock: number; zoneCode: string | null }[] }
    const bySku = new Map(rows.map((row) => [row.sku, row]))
    expect(bySku.get('OF-TY-118')?.zoneCode).toBe('A1')
    expect(bySku.get('BP-FR-220')?.zoneCode).toBe('A1')
    expect(bySku.get('AF-UN-002')?.zoneCode).toBe('A2')
    expect(bySku.get('SP-SET-04')?.zoneCode).toBe('A2')
  })

  it('a stock count that follows the parts: moving a part moves the quantity with it', async () => {
    const storekeeper = await tokenFor('parts', STOREKEEPER)
    const before = await req('GET', '/inventory?pageSize=50', storekeeper)
    const rows = (before.json() as { rows: { _id: string; sku: string; stock: number; zoneCode: string | null }[] }).rows
    const unitsIn = (code: string, list: { stock: number; zoneCode: string | null }[]) =>
      list.filter((row) => row.zoneCode === code).reduce((sum, row) => sum + row.stock, 0)

    const brakePads = rows.find((row) => row.sku === 'BP-FR-220')
    if (!brakePads) throw new Error('expected the seeded brake pads')
    const a1Before = unitsIn('A1', rows)
    const a6Before = unitsIn('A6', rows)

    const moved = await req('PATCH', `/inventory/${brakePads._id}`, storekeeper, { zoneCode: 'A6' })
    expect(moved.statusCode, moved.body).toBe(200)
    expect((moved.json() as { zoneCode: string | null }).zoneCode).toBe('A6')

    const after = (
      (await req('GET', '/inventory?pageSize=50', storekeeper)).json() as {
        rows: { stock: number; zoneCode: string | null }[]
      }
    ).rows
    expect(unitsIn('A1', after)).toBe(a1Before - brakePads.stock)
    expect(unitsIn('A6', after)).toBe(a6Before + brakePads.stock)

    /* Put it back, so the rest of this file sees the seeded assignment. */
    await req('PATCH', `/inventory/${brakePads._id}`, storekeeper, { zoneCode: 'A1' })
  })

  it('refuses a part put away in a zone that does not exist', async () => {
    const storekeeper = await tokenFor('parts', STOREKEEPER)
    const response = await req('POST', '/inventory', storekeeper, {
      name: 'Cabin Filter (Nissan)',
      sku: 'CF-NS-900',
      priceHalalas: 7500,
      openingStock: 10,
      zoneCode: 'ZZ9',
    })
    expect(response.statusCode, response.body).toBe(404)
  })

  it('accepts a null zone — stock not put away yet is a real state, not an error', async () => {
    const storekeeper = await tokenFor('parts', STOREKEEPER)
    const created = await req('POST', '/inventory', storekeeper, {
      name: 'Wiper Blade Pair',
      sku: 'WB-PR-311',
      priceHalalas: 6000,
      openingStock: 24,
    })
    expect(created.statusCode, created.body).toBe(201)
    expect((created.json() as { zoneCode: string | null }).zoneCode).toBeNull()
  })
})

describe('zone CRUD through the generic router', () => {
  it('creates a zone, assigning a counted code when none is supplied', async () => {
    const storekeeper = await tokenFor('parts', STOREKEEPER)
    const created = await req('POST', '/warehouse-zones', storekeeper, {
      name: 'Overflow Yard',
      capacityUnits: 300,
    })
    expect(created.statusCode, created.body).toBe(201)
    const zone = created.json() as ZoneRow
    expect(zone.code).toMatch(/^ZN-\d{4}$/)
    expect(zone.id).toBe(zone.code)
    expect(zone.kind).toBe('storage')
    expect(zone.status).toBe('active')
    expect(zone.maintenanceSince).toBeNull()
  })

  it('keeps a code a caller supplies, since a bay already has one painted on it', async () => {
    const storekeeper = await tokenFor('parts', STOREKEEPER)
    const created = await req('POST', '/warehouse-zones', storekeeper, {
      code: 'B1',
      name: 'Bodyshop Rack',
      kind: 'storage',
      capacityUnits: 60,
    })
    expect(created.statusCode, created.body).toBe(201)
    expect((created.json() as ZoneRow).code).toBe('B1')
  })

  it('refuses a second zone on a code the tenant already uses', async () => {
    const storekeeper = await tokenFor('parts', STOREKEEPER)
    const response = await req('POST', '/warehouse-zones', storekeeper, {
      code: 'A1',
      name: 'Duplicate Main Floor',
    })
    expect(response.statusCode).toBe(409)
  })

  it('refuses a negative capacity', async () => {
    const storekeeper = await tokenFor('parts', STOREKEEPER)
    const response = await req('POST', '/warehouse-zones', storekeeper, {
      name: 'Impossible Bay',
      capacityUnits: -10,
    })
    expect(response.statusCode).toBe(400)
  })

  it('refuses a role with no inventory create grant', async () => {
    const tech = await tokenFor('technician', TECH)
    const response = await req('POST', '/warehouse-zones', tech, {
      name: 'Should Not Exist',
      capacityUnits: 10,
    })
    expect(response.statusCode).toBe(403)
  })

  it('is reachable by its zone code as well as its id', async () => {
    const storekeeper = await tokenFor('parts', STOREKEEPER)
    const byCode = await req('GET', '/warehouse-zones/A2', storekeeper)
    expect(byCode.statusCode, byCode.body).toBe(200)
    expect((byCode.json() as ZoneRow).name).toBe('Mezzanine')
  })
})

describe('the active <-> maintenance lifecycle move', () => {
  it('derives maintenanceSince from the transition and clears it on the way back', async () => {
    const storekeeper = await tokenFor('parts', STOREKEEPER)
    const created = await req('POST', '/warehouse-zones', storekeeper, {
      code: 'B2',
      name: 'Loading Dock',
      kind: 'receiving',
      capacityUnits: 90,
    })
    const id = (created.json() as ZoneRow)._id

    const down = await req('PATCH', `/warehouse-zones/${id}`, storekeeper, {
      status: 'maintenance',
      notes: 'Dock leveller jammed.',
    })
    expect(down.statusCode, down.body).toBe(200)
    const downRow = down.json() as ZoneRow
    expect(downRow.status).toBe('maintenance')
    expect(downRow.maintenanceSince).not.toBeNull()

    const up = await req('PATCH', `/warehouse-zones/${id}`, storekeeper, { status: 'active' })
    expect(up.statusCode, up.body).toBe(200)
    const upRow = up.json() as ZoneRow
    expect(upRow.status).toBe('active')
    expect(upRow.maintenanceSince).toBeNull()
  })

  it('ignores a posted maintenanceSince: only the transition writes it', async () => {
    const storekeeper = await tokenFor('parts', STOREKEEPER)
    const created = await req('POST', '/warehouse-zones', storekeeper, {
      code: 'B3',
      name: 'Tyre Bay',
      capacityUnits: 40,
      maintenanceSince: '2001-01-01T00:00:00.000Z',
    })
    /* A server-owned key in the body is refused outright rather than stripped,
     * the same treatment `orgId` gets. Either way what must not happen is the
     * posted timestamp landing on the row. */
    if (created.statusCode === 201) {
      expect((created.json() as ZoneRow).maintenanceSince).toBeNull()
    } else {
      expect(created.statusCode).toBe(400)
    }
  })

  it('has no `full` status to record — fullness is derived from the stock in the bay', async () => {
    const storekeeper = await tokenFor('parts', STOREKEEPER)
    const response = await req('PATCH', '/warehouse-zones/A4', storekeeper, { status: 'full' })
    expect(response.statusCode).toBe(400)
  })
})

describe('tenant and scope boundaries', () => {
  it('shows a customer on the portal nothing at all', async () => {
    const customer = await tokenFor('customer', '01JZONECUSTOMER0000001X')
    const response = await req('GET', '/warehouse-zones', customer)
    /* The `inventory` module grants a customer nothing, so the RBAC gate
     * refuses before the `r_self` policy is reached; either answer is a
     * refusal, and neither is a row. */
    expect([401, 403]).toContain(response.statusCode)
  })
})
