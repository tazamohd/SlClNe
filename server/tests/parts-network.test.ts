/** Parts Network (BLK-004) — the four collections behind the eight
 *  parts-network screens that all rendered an honest "no data source yet"
 *  shell: members, requests, quotations and orders.
 *
 *  Three things this suite is specifically about, beyond ordinary CRUD:
 *
 *  1. **The accept-quotation invariant.** Accepting one quotation must reject
 *     the request's other pending quotations, move the request to `ordered` and
 *     create the order — atomically. The generic `PATCH` cannot reach
 *     `accepted` at all, which is asserted rather than assumed.
 *  2. **RBAC.** `network` already expresses parts-network authority and no
 *     grant was widened for this feature. `technician` holds nothing on it, so
 *     a technician can neither read the network nor place an order; `parts`
 *     holds `vced` but not `a`, so it may send requests and never commit an
 *     order; `supplier` holds `vce` and so may quote but not delete or accept.
 *  3. **The tenant boundary.** This is the domain whose *business* concept
 *     spans organizations, so it is worth proving that its *rows* do not. A
 *     token for the neighbouring organization sees an empty network and gets a
 *     404 — never a 403 — on the primary tenant's ids.
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

interface TokenShape {
  role: RoleId
  sub: string
  orgId?: string
  branchId?: string | null
}

async function tokenFor(shape: TokenShape): Promise<string> {
  const key = new TextEncoder().encode(env.JWT_SECRET as string)
  return new SignJWT({
    role: shape.role,
    org_id: shape.orgId ?? SEED.orgId,
    branch_id: shape.branchId === undefined ? SEED.mainBranchId : shape.branchId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(shape.sub)
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

const PROCUREMENT = '01JPNETPROCURE00000000001X'
const PARTS = '01JPNETPARTS0000000000001X'
const TECH = '01JPNETTECH00000000000001X'
const SUPPLIER = '01JPNETSUPPLIER000000001X1'
const NEIGHBOUR = '01JPNETNEIGHBOUR00000001X1'

/** The procurement role holds `network: vcedax` — the widest set any business
 *  role holds here — so it is what the CRUD cases write with. */
const asProcurement = () => tokenFor({ role: 'procurement', sub: PROCUREMENT })

/** Seeds a request plus two competing quotations on it, and returns the ids.
 *  Every case that exercises the accept invariant needs its own, because
 *  accepting is a one-way move. */
async function seedContested(bearer: string) {
  const request = await req('POST', '/parts-network/requests', bearer, {
    partName: 'Brake Pads (Front)',
    partSku: 'BP-FR-220',
    qty: 10,
    urgency: 'high',
    vehicleInfo: 'Toyota Camry 2022',
  })
  expect(request.statusCode, request.body).toBe(201)
  const requestId = (request.json() as { _id: string })._id

  const cheap = await req('POST', '/parts-network/quotations', bearer, {
    requestId,
    memberName: 'Al Jazira Auto Parts',
    unitPriceHalalas: 8500,
    qtyAvailable: 40,
    leadTimeDays: 2,
  })
  expect(cheap.statusCode, cheap.body).toBe(201)
  const dear = await req('POST', '/parts-network/quotations', bearer, {
    requestId,
    memberName: 'Gulf Spare Co.',
    unitPriceHalalas: 9100,
    qtyAvailable: 60,
    condition: 'oem',
  })
  expect(dear.statusCode, dear.body).toBe(201)

  return {
    requestId,
    cheapId: (cheap.json() as { _id: string })._id,
    dearId: (dear.json() as { _id: string })._id,
    dearCode: (dear.json() as { code: string }).code,
  }
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

describe('parts network members', () => {
  it('lists the seeded member directory, including the two suppliers it reuses', async () => {
    const bearer = await asProcurement()
    const response = await req('GET', '/parts-network/members', bearer)
    expect(response.statusCode, response.body).toBe(200)
    const body = response.json() as {
      rows: Array<{ name: string; kind: string; supplierId: string | null; rating: number | null }>
    }
    expect(body.rows.length).toBeGreaterThanOrEqual(3)
    const aljazira = body.rows.find((m) => m.name === 'Al Jazira Auto Parts')
    expect(aljazira?.kind).toBe('supplier')
    /* Reuse over invention: the member points at the existing `suppliers` row
     * rather than duplicating the vendor. */
    expect(aljazira?.supplierId).not.toBeNull()
    expect(aljazira?.rating).toBe(4.6)
    /* Unrated stays null — no fabricated zero. */
    expect(body.rows.find((m) => m.name === 'Neighbouring Garage')?.rating).toBeNull()
  })

  it('creates a member, assigning NWM-0001 sequentially server-side', async () => {
    const bearer = await asProcurement()
    const first = await req('POST', '/parts-network/members', bearer, { name: 'Sequential One' })
    const second = await req('POST', '/parts-network/members', bearer, { name: 'Sequential Two' })
    expect(first.statusCode, first.body).toBe(201)
    expect(second.statusCode, second.body).toBe(201)
    const a = (first.json() as { code: string }).code
    const b = (second.json() as { code: string }).code
    expect(a).toMatch(/^NWM-\d{4}$/)
    expect(a).not.toBe(b)
  })

  it('updates a member without touching its other fields, and deletes it', async () => {
    const bearer = await asProcurement()
    const created = await req('POST', '/parts-network/members', bearer, {
      name: 'Editable Member',
      kind: 'dealer',
      city: 'Jeddah',
    })
    const id = (created.json() as { _id: string })._id

    const updated = await req('PATCH', `/parts-network/members/${id}`, bearer, { status: 'suspended' })
    expect(updated.statusCode, updated.body).toBe(200)
    const row = updated.json() as { name: string; kind: string; city: string | null; status: string }
    expect(row.status).toBe('suspended')
    expect(row.name).toBe('Editable Member')
    expect(row.kind).toBe('dealer')
    expect(row.city).toBe('Jeddah')

    const deleted = await req('DELETE', `/parts-network/members/${id}`, bearer)
    expect(deleted.statusCode).toBe(204)
    expect((await req('GET', `/parts-network/members/${id}`, bearer)).statusCode).toBe(404)
  })

  it('is reachable by its human member code as well as its id', async () => {
    const bearer = await asProcurement()
    const created = await req('POST', '/parts-network/members', bearer, { name: 'Code Lookup Member' })
    const { code } = created.json() as { code: string }
    const byCode = await req('GET', `/parts-network/members/${code}`, bearer)
    expect(byCode.statusCode, byCode.body).toBe(200)
    expect((byCode.json() as { name: string }).name).toBe('Code Lookup Member')
  })

  it('refuses a supplierId that is not one of this tenant’s suppliers', async () => {
    const bearer = await asProcurement()
    const response = await req('POST', '/parts-network/members', bearer, {
      name: 'Bad Vendor Link',
      supplierId: '01JZZZZZZZZZZZZZZZZZZZZZZZ',
    })
    expect(response.statusCode, response.body).toBe(404)
  })

  it('refuses an empty name', async () => {
    const bearer = await asProcurement()
    expect((await req('POST', '/parts-network/members', bearer, { name: '' })).statusCode).toBe(400)
  })
})

describe('parts network requests', () => {
  it('serves the Incoming view as a filtered read over one collection', async () => {
    const bearer = await asProcurement()
    const incoming = await req('GET', '/parts-network/requests?filter[direction]=incoming', bearer)
    expect(incoming.statusCode, incoming.body).toBe(200)
    const rows = (incoming.json() as { rows: Array<{ direction: string; memberName: string | null }> }).rows
    expect(rows.length).toBeGreaterThanOrEqual(1)
    /* Every row really is incoming — the filter narrows rather than decorating. */
    expect(rows.every((r) => r.direction === 'incoming')).toBe(true)
    expect(rows.some((r) => r.memberName === 'Neighbouring Garage')).toBe(true)

    const outgoing = await req('GET', '/parts-network/requests?filter[direction]=outgoing', bearer)
    const outRows = (outgoing.json() as { rows: Array<{ direction: string }> }).rows
    expect(outRows.length).toBeGreaterThanOrEqual(3)
    expect(outRows.every((r) => r.direction === 'outgoing')).toBe(true)
  })

  it('creates a request that starts open with no quotations', async () => {
    const bearer = await asProcurement()
    const created = await req('POST', '/parts-network/requests', bearer, {
      partName: 'Spark Plug Set',
      partSku: 'SP-SET-04',
      qty: 8,
      urgency: 'urgent',
      jobCode: 'B7E4D9A2',
      vehicleInfo: 'Nissan Patrol 2021',
    })
    expect(created.statusCode, created.body).toBe(201)
    const row = created.json() as {
      code: string
      direction: string
      status: string
      quotationCount: number
      quotedAt: string | null
    }
    expect(row.code).toMatch(/^NRQ-\d{4}$/)
    expect(row.direction).toBe('outgoing')
    expect(row.status).toBe('open')
    expect(row.quotationCount).toBe(0)
    expect(row.quotedAt).toBeNull()
  })

  it('takes memberName from the directory rather than the request body', async () => {
    const bearer = await asProcurement()
    const members = await req('GET', '/parts-network/members', bearer)
    const neighbour = (members.json() as { rows: Array<{ _id: string; name: string }> }).rows.find(
      (m) => m.name === 'Neighbouring Garage',
    )
    if (!neighbour) throw new Error('expected the seeded Neighbouring Garage member')

    const created = await req('POST', '/parts-network/requests', bearer, {
      partName: 'Air Filter (Universal)',
      memberId: neighbour._id,
      /* A name that disagrees with the directory is overwritten, not trusted. */
      memberName: 'Somebody Else Entirely',
    })
    expect(created.statusCode, created.body).toBe(201)
    expect((created.json() as { memberName: string }).memberName).toBe('Neighbouring Garage')
  })

  it('derives the lifecycle timestamps from the status transition', async () => {
    const bearer = await asProcurement()
    const created = await req('POST', '/parts-network/requests', bearer, { partName: 'Lifecycle Part' })
    const id = (created.json() as { _id: string })._id

    const closed = await req('PATCH', `/parts-network/requests/${id}`, bearer, { status: 'closed' })
    expect(closed.statusCode, closed.body).toBe(200)
    expect((closed.json() as { closedAt: string | null }).closedAt).not.toBeNull()

    /* Reopening clears the stale date rather than leaving it behind. */
    const reopened = await req('PATCH', `/parts-network/requests/${id}`, bearer, { status: 'open' })
    expect((reopened.json() as { closedAt: string | null }).closedAt).toBeNull()
  })

  it('ignores a client-supplied quotationCount or closedAt', async () => {
    const bearer = await asProcurement()
    const response = await req('POST', '/parts-network/requests', bearer, {
      partName: 'Forged Counts',
      quotationCount: 99,
      closedAt: '2020-01-01T00:00:00Z',
    })
    expect(response.statusCode, response.body).toBe(201)
    const row = response.json() as { quotationCount: number; closedAt: string | null }
    /* Neither field is in the create schema, so neither reaches a column: the
     * count is the server's (zero quotations so far) and the close date is null
     * because the request has not closed. A caller cannot backdate either. */
    expect(row.quotationCount).toBe(0)
    expect(row.closedAt).toBeNull()
  })

  it('deletes a request', async () => {
    const bearer = await asProcurement()
    const created = await req('POST', '/parts-network/requests', bearer, { partName: 'Deletable Part' })
    const id = (created.json() as { _id: string })._id
    expect((await req('DELETE', `/parts-network/requests/${id}`, bearer)).statusCode).toBe(204)
    expect((await req('GET', `/parts-network/requests/${id}`, bearer)).statusCode).toBe(404)
  })
})

describe('parts network quotations', () => {
  it('a quotation arriving moves its request to quoted and counts itself', async () => {
    const bearer = await asProcurement()
    const request = await req('POST', '/parts-network/requests', bearer, { partName: 'Counted Part', qty: 4 })
    const requestId = (request.json() as { _id: string })._id

    const quote = await req('POST', '/parts-network/quotations', bearer, {
      requestId,
      memberName: 'Al Jazira Auto Parts',
      unitPriceHalalas: 4200,
      qtyAvailable: 20,
    })
    expect(quote.statusCode, quote.body).toBe(201)
    const row = quote.json() as { code: string; status: string; unitPrice: string; acceptedAt: string | null }
    expect(row.code).toMatch(/^NQT-\d{4}$/)
    expect(row.status).toBe('pending')
    /* Money formatted at the one boundary that formats it. */
    expect(row.unitPrice).toBe('SAR 42')
    expect(row.acceptedAt).toBeNull()

    const after = await req('GET', `/parts-network/requests/${requestId}`, bearer)
    const request2 = after.json() as { status: string; quotationCount: number; quotedAt: string | null }
    expect(request2.status).toBe('quoted')
    expect(request2.quotationCount).toBe(1)
    expect(request2.quotedAt).not.toBeNull()
  })

  it('refuses a quotation against a closed request', async () => {
    const bearer = await asProcurement()
    const request = await req('POST', '/parts-network/requests', bearer, { partName: 'Shut Part' })
    const requestId = (request.json() as { _id: string })._id
    await req('PATCH', `/parts-network/requests/${requestId}`, bearer, { status: 'closed' })

    const response = await req('POST', '/parts-network/quotations', bearer, {
      requestId,
      memberName: 'Gulf Spare Co.',
      unitPriceHalalas: 1000,
      qtyAvailable: 1,
    })
    expect(response.statusCode, response.body).toBe(422)
  })

  it('refuses a quotation against a request that does not exist', async () => {
    const bearer = await asProcurement()
    const response = await req('POST', '/parts-network/quotations', bearer, {
      requestId: '01JZZZZZZZZZZZZZZZZZZZZZZZ',
      memberName: 'Nobody',
      unitPriceHalalas: 1,
      qtyAvailable: 1,
    })
    expect(response.statusCode, response.body).toBe(404)
  })

  it('cannot be moved to accepted through the generic PATCH', async () => {
    const bearer = await asProcurement()
    const { cheapId } = await seedContested(bearer)
    const response = await req('PATCH', `/parts-network/quotations/${cheapId}`, bearer, { status: 'accepted' })
    /* The contract's update schema omits `accepted`, so the only way there is
     * the accept route — which also rejects the siblings and raises the order. */
    expect(response.statusCode, response.body).toBe(400)
  })

  it('rejecting a quotation stamps rejectedAt and leaves the others alone', async () => {
    const bearer = await asProcurement()
    const { cheapId, dearId } = await seedContested(bearer)
    const rejected = await req('PATCH', `/parts-network/quotations/${cheapId}`, bearer, { status: 'rejected' })
    expect(rejected.statusCode, rejected.body).toBe(200)
    expect((rejected.json() as { rejectedAt: string | null }).rejectedAt).not.toBeNull()

    const other = await req('GET', `/parts-network/quotations/${dearId}`, bearer)
    expect((other.json() as { status: string }).status).toBe('pending')
  })
})

describe('accepting a quotation', () => {
  it('accepts one, rejects the siblings, orders the request and raises the order atomically', async () => {
    const bearer = await asProcurement()
    const { requestId, cheapId, dearId, dearCode } = await seedContested(bearer)

    const accepted = await req('POST', `/parts-network/quotations/${cheapId}/accept`, bearer, {})
    expect(accepted.statusCode, accepted.body).toBe(201)
    const result = accepted.json() as {
      quotation: { status: string; acceptedAt: string | null }
      order: {
        code: string
        status: string
        qty: number
        unitPriceHalalas: number
        totalHalalas: number
        total: string
        direction: string
        quotationId: string | null
      }
      rejectedQuotationCodes: string[]
    }

    expect(result.quotation.status).toBe('accepted')
    expect(result.quotation.acceptedAt).not.toBeNull()
    /* The sibling is rejected in the same transaction — a request is sourced
     * once, so two members can never both hold an accepted quote for it. */
    expect(result.rejectedQuotationCodes).toEqual([dearCode])
    const sibling = await req('GET', `/parts-network/quotations/${dearId}`, bearer)
    expect((sibling.json() as { status: string }).status).toBe('rejected')

    /* The request moved to ordered. */
    const request = await req('GET', `/parts-network/requests/${requestId}`, bearer)
    const requestRow = request.json() as { status: string; orderedAt: string | null }
    expect(requestRow.status).toBe('ordered')
    expect(requestRow.orderedAt).not.toBeNull()

    /* The order exists, with the quantity the request asked for, the price the
     * quotation offered, and a total computed rather than posted. */
    expect(result.order.code).toMatch(/^NOR-\d{4}$/)
    expect(result.order.status).toBe('placed')
    expect(result.order.direction).toBe('outbound')
    expect(result.order.qty).toBe(10)
    expect(result.order.unitPriceHalalas).toBe(8500)
    expect(result.order.totalHalalas).toBe(10 * 8500)
    expect(result.order.total).toBe('SAR 850')
    expect(result.order.quotationId).toBe(cheapId)

    const listed = await req('GET', '/parts-network/orders', bearer)
    const codes = (listed.json() as { rows: Array<{ code: string }> }).rows.map((o) => o.code)
    expect(codes).toContain(result.order.code)
  })

  it('refuses a second acceptance on the same request', async () => {
    const bearer = await asProcurement()
    const { cheapId, dearId } = await seedContested(bearer)
    expect((await req('POST', `/parts-network/quotations/${cheapId}/accept`, bearer, {})).statusCode).toBe(201)

    /* The sibling is already rejected, so it is no longer acceptable, and the
     * request is already ordered — either check alone would refuse this. */
    const second = await req('POST', `/parts-network/quotations/${dearId}/accept`, bearer, {})
    expect(second.statusCode, second.body).toBe(422)
  })

  it('refuses ordering more than the quoting member said they have', async () => {
    const bearer = await asProcurement()
    const { cheapId } = await seedContested(bearer)
    const response = await req('POST', `/parts-network/quotations/${cheapId}/accept`, bearer, { qty: 999 })
    expect(response.statusCode, response.body).toBe(422)
  })

  it('an incoming request becomes an inbound order — the direction we fulfil', async () => {
    const bearer = await asProcurement()
    const request = await req('POST', '/parts-network/requests', bearer, {
      direction: 'incoming',
      partName: 'Oil Filter (Toyota)',
      partSku: 'OF-TY-118',
      qty: 6,
    })
    const requestId = (request.json() as { _id: string })._id
    const quote = await req('POST', '/parts-network/quotations', bearer, {
      requestId,
      memberName: 'Neighbouring Garage',
      unitPriceHalalas: 4500,
      qtyAvailable: 12,
    })
    const quotationId = (quote.json() as { _id: string })._id

    const accepted = await req('POST', `/parts-network/quotations/${quotationId}/accept`, bearer, {})
    expect(accepted.statusCode, accepted.body).toBe(201)
    expect((accepted.json() as { order: { direction: string } }).order.direction).toBe('inbound')
  })

  it('is reachable by the quotation’s human code as well as its id', async () => {
    const bearer = await asProcurement()
    const { cheapId } = await seedContested(bearer)
    const quotation = await req('GET', `/parts-network/quotations/${cheapId}`, bearer)
    const { code } = quotation.json() as { code: string }
    expect((await req('POST', `/parts-network/quotations/${code}/accept`, bearer, {})).statusCode).toBe(201)
  })
})

describe('parts network orders', () => {
  it('computes the total server-side and refuses one posted with the body', async () => {
    const bearer = await asProcurement()
    const created = await req('POST', '/parts-network/orders', bearer, {
      memberName: 'Gulf Spare Co.',
      partName: 'Air Filter (Universal)',
      qty: 5,
      unitPriceHalalas: 7800,
    })
    expect(created.statusCode, created.body).toBe(201)
    const row = created.json() as { totalHalalas: number; total: string; status: string }
    expect(row.totalHalalas).toBe(5 * 7800)
    expect(row.total).toBe('SAR 390')
    expect(row.status).toBe('placed')

    /* A posted total has no effect: it is not in the create schema, so the
       server's `qty x unitPrice` is what lands. */
    const forged = await req('POST', '/parts-network/orders', bearer, {
      memberName: 'Gulf Spare Co.',
      partName: 'Forged Total',
      qty: 3,
      unitPriceHalalas: 100,
      totalHalalas: 1,
    })
    expect(forged.statusCode, forged.body).toBe(201)
    expect((forged.json() as { totalHalalas: number }).totalHalalas).toBe(300)
  })

  it('reprices the total when the quantity changes on a patch', async () => {
    const bearer = await asProcurement()
    const created = await req('POST', '/parts-network/orders', bearer, {
      memberName: 'Al Jazira Auto Parts',
      partName: 'Repriced Part',
      qty: 2,
      unitPriceHalalas: 5000,
    })
    const id = (created.json() as { _id: string })._id
    const updated = await req('PATCH', `/parts-network/orders/${id}`, bearer, { qty: 7 })
    expect(updated.statusCode, updated.body).toBe(200)
    expect((updated.json() as { totalHalalas: number }).totalHalalas).toBe(7 * 5000)
  })

  it('derives shippedAt and receivedAt from the status transition', async () => {
    const bearer = await asProcurement()
    const created = await req('POST', '/parts-network/orders', bearer, {
      memberName: 'Al Jazira Auto Parts',
      partName: 'Shippable Part',
      qty: 1,
      unitPriceHalalas: 1000,
    })
    const id = (created.json() as { _id: string })._id

    const shipped = await req('PATCH', `/parts-network/orders/${id}`, bearer, {
      status: 'shipped',
      trackingRef: 'AJ-SHP-00001',
    })
    expect(shipped.statusCode, shipped.body).toBe(200)
    const shippedRow = shipped.json() as { shippedAt: string | null; receivedAt: string | null }
    expect(shippedRow.shippedAt).not.toBeNull()
    expect(shippedRow.receivedAt).toBeNull()

    const received = await req('PATCH', `/parts-network/orders/${id}`, bearer, { status: 'received' })
    const receivedRow = received.json() as { shippedAt: string | null; receivedAt: string | null }
    /* Receiving keeps the ship date — the row passed through shipped to get
     * here — and adds its own. */
    expect(receivedRow.shippedAt).not.toBeNull()
    expect(receivedRow.receivedAt).not.toBeNull()
  })

  it('serves the in-transit Incoming view as a filtered read over one collection', async () => {
    const bearer = await asProcurement()
    const response = await req('GET', '/parts-network/orders?filter[direction]=outbound&filter[status]=shipped', bearer)
    expect(response.statusCode, response.body).toBe(200)
    const rows = (response.json() as { rows: Array<{ direction: string; status: string }> }).rows
    expect(rows.length).toBeGreaterThanOrEqual(1)
    expect(rows.every((o) => o.direction === 'outbound' && o.status === 'shipped')).toBe(true)
  })

  it('deletes an order', async () => {
    const bearer = await asProcurement()
    const created = await req('POST', '/parts-network/orders', bearer, {
      memberName: 'Gulf Spare Co.',
      partName: 'Deletable Order Part',
    })
    const id = (created.json() as { _id: string })._id
    expect((await req('DELETE', `/parts-network/orders/${id}`, bearer)).statusCode).toBe(204)
  })
})

describe('parts network RBAC', () => {
  it('refuses a technician everything, including reading the network at all', async () => {
    const bearer = await tokenFor({ role: 'technician', sub: TECH })
    /* `network` grants `technician` nothing, so the view is refused too — a
     * technician has no business knowing who this workshop buys parts from or
     * at what price. */
    expect((await req('GET', '/parts-network/members', bearer)).statusCode).toBe(403)
    expect((await req('GET', '/parts-network/requests', bearer)).statusCode).toBe(403)
    expect(
      (await req('POST', '/parts-network/requests', bearer, { partName: 'Should Not Exist' })).statusCode,
    ).toBe(403)
    expect(
      (await req('POST', '/parts-network/orders', bearer, { memberName: 'X', partName: 'Y' })).statusCode,
    ).toBe(403)
  })

  it('lets parts send requests but never commit an order against a quotation', async () => {
    const procurement = await asProcurement()
    const { cheapId } = await seedContested(procurement)
    const bearer = await tokenFor({ role: 'parts', sub: PARTS })

    /* `parts` holds `network: vced` — it may maintain the directory and raise
     * requests... */
    expect((await req('GET', '/parts-network/requests', bearer)).statusCode).toBe(200)
    const created = await req('POST', '/parts-network/requests', bearer, { partName: 'Parts-Raised Part' })
    expect(created.statusCode, created.body).toBe(201)

    /* ...but not `a`, so accepting a quotation — which commits the money — is
     * refused. A 403, not a 404: the row is in its own tenant, it simply may
     * not do this. */
    const accept = await req('POST', `/parts-network/quotations/${cheapId}/accept`, bearer, {})
    expect(accept.statusCode, accept.body).toBe(403)
  })

  it('lets a supplier quote but not delete or accept', async () => {
    const procurement = await asProcurement()
    const { requestId, cheapId } = await seedContested(procurement)
    const bearer = await tokenFor({ role: 'supplier', sub: SUPPLIER })

    /* `supplier` holds `network: vce`. Quoting is a create. */
    const quote = await req('POST', '/parts-network/quotations', bearer, {
      requestId,
      memberName: 'Al Jazira Auto Parts',
      unitPriceHalalas: 8000,
      qtyAvailable: 15,
    })
    expect(quote.statusCode, quote.body).toBe(201)
    const quoteId = (quote.json() as { _id: string })._id

    /* No `d`, and no `a`. */
    expect((await req('DELETE', `/parts-network/quotations/${quoteId}`, bearer)).statusCode).toBe(403)
    expect((await req('POST', `/parts-network/quotations/${cheapId}/accept`, bearer, {})).statusCode).toBe(403)
  })
})

describe('the tenant boundary', () => {
  it('a neighbouring organization sees an empty network, not the primary tenant’s', async () => {
    const bearer = await tokenFor({
      role: 'procurement',
      sub: NEIGHBOUR,
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
    })
    for (const path of ['members', 'requests', 'quotations', 'orders']) {
      const response = await req('GET', `/parts-network/${path}`, bearer)
      expect(response.statusCode, `${path}: ${response.body}`).toBe(200)
      expect((response.json() as { rows: unknown[] }).rows, path).toHaveLength(0)
    }
  })

  it('a neighbouring organization gets 404, never 403, on the primary tenant’s ids', async () => {
    const procurement = await asProcurement()
    const { requestId, cheapId } = await seedContested(procurement)
    const members = await req('GET', '/parts-network/members', procurement)
    const memberId = (members.json() as { rows: Array<{ _id: string }> }).rows[0]!._id

    const bearer = await tokenFor({
      role: 'procurement',
      sub: NEIGHBOUR,
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
    })
    /* 404 rather than 403 throughout: a 403 would confirm the row exists,
     * which is the fact the isolation is protecting. */
    expect((await req('GET', `/parts-network/members/${memberId}`, bearer)).statusCode).toBe(404)
    expect((await req('GET', `/parts-network/requests/${requestId}`, bearer)).statusCode).toBe(404)
    expect((await req('GET', `/parts-network/quotations/${cheapId}`, bearer)).statusCode).toBe(404)
    expect((await req('PATCH', `/parts-network/requests/${requestId}`, bearer, { qty: 1 })).statusCode).toBe(404)
    expect((await req('DELETE', `/parts-network/members/${memberId}`, bearer)).statusCode).toBe(404)
  })

  it('a neighbouring organization cannot accept the primary tenant’s quotation', async () => {
    const procurement = await asProcurement()
    const { cheapId, dearId } = await seedContested(procurement)
    const bearer = await tokenFor({
      role: 'procurement',
      sub: NEIGHBOUR,
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
    })
    const response = await req('POST', `/parts-network/quotations/${cheapId}/accept`, bearer, {})
    expect(response.statusCode, response.body).toBe(404)

    /* And nothing moved: the sibling is still pending in the owning tenant. */
    const sibling = await req('GET', `/parts-network/quotations/${dearId}`, procurement)
    expect((sibling.json() as { status: string }).status).toBe('pending')
  })

  it('a member row names a counterparty, never exposes another tenant’s data', async () => {
    const bearer = await asProcurement()
    const members = await req('GET', '/parts-network/members', bearer)
    const neighbour = (members.json() as {
      rows: Array<{ name: string; orgId?: unknown; supplierId: string | null }>
    }).rows.find((m) => m.name === 'Neighbouring Garage')
    if (!neighbour) throw new Error('expected the seeded Neighbouring Garage member')
    /* The directory entry for that garage carries a name and contact details
     * this workshop keeps — there is no `orgId` on it and no route from it into
     * the neighbouring organization's rows. */
    expect(neighbour.orgId).toBeUndefined()
    expect(neighbour.supplierId).toBeNull()
  })
})
