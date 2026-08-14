/** F-017 — the inventory prohibitions, enforced where they must be.
 *
 *  Agent 10 proved the On Hand equation over the rule engine and left a `GAP:`
 *  test for each prohibition the server did not implement. Each of those gaps
 *  is closed here, against real Postgres, through the HTTP boundary:
 *
 *  - a transfer credits the destination in the same transaction (paired rows
 *    sharing a transferId; the org's books conserve);
 *  - `toBranchId` is required for a transfer and must be a real branch;
 *  - reservations exist: `parts.reserved` is written under the row lock and
 *    `checkReservation` is load-bearing instead of dead code;
 *  - consumption may not exceed available (on-hand − reserved) unless it
 *    consumes a reservation, which it draws down;
 *  - `adjust_down` records a shortfall without booking it as consumption or
 *    damage, with the negative-stock guard on the result;
 *  - `return` is its own movement type, not a receipt;
 *  - the Idempotency-Key header is mandatory (400 without), so two identical
 *    unkeyed POSTs can no longer be two movements.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startHarness, SEED, type Harness } from './harness'

let harness: Harness

interface PartView {
  _id: string
  sku: string
  stock: number
  reserved: number
  available: number
}

interface MovementView {
  id: string
  type: string
  qty: number
  delta: number
  toBranchId: string | null
  transferId: string | null
}

let keySeq = 0
const freshKey = () => `inv-enforce-${Date.now()}-${(keySeq += 1)}`

async function ownerToken(): Promise<string> {
  return harness.token('owner')
}

async function createPart(sku: string, openingStock: number): Promise<PartView> {
  const response = await harness.app.inject({
    method: 'POST',
    url: '/api/v1/inventory',
    headers: {
      authorization: `Bearer ${await ownerToken()}`,
      'content-type': 'application/json',
    },
    payload: { name: `Enforcement ${sku}`, sku, priceHalalas: 1000, openingStock },
  })
  expect(response.statusCode, response.body).toBe(201)
  return response.json() as PartView
}

async function move(
  partId: string,
  body: Record<string, unknown>,
  options: { key?: string | null; role?: 'owner' | 'parts'; sub?: string } = {},
) {
  const headers: Record<string, string> = {
    authorization: `Bearer ${await harness.token(options.role ?? 'owner', options.sub ? { sub: options.sub } : {})}`,
    'content-type': 'application/json',
  }
  if (options.key !== null) headers['idempotency-key'] = options.key ?? freshKey()
  return harness.app.inject({
    method: 'POST',
    url: `/api/v1/inventory/${partId}/movement`,
    headers,
    payload: body,
  })
}

async function reservation(method: 'POST' | 'DELETE', partId: string, body: Record<string, unknown>) {
  return harness.app.inject({
    method,
    url: `/api/v1/inventory/${partId}/reservation`,
    headers: {
      authorization: `Bearer ${await ownerToken()}`,
      'content-type': 'application/json',
    },
    payload: body,
  })
}

async function readPart(partId: string): Promise<PartView> {
  const response = await harness.app.inject({
    method: 'GET',
    url: `/api/v1/inventory/${partId}`,
    headers: { authorization: `Bearer ${await ownerToken()}` },
  })
  expect(response.statusCode, response.body).toBe(200)
  return response.json() as PartView
}

async function ledger(partId: string): Promise<MovementView[]> {
  const response = await harness.app.inject({
    method: 'GET',
    url: `/api/v1/inventory/${partId}/movements`,
    headers: { authorization: `Bearer ${await ownerToken()}` },
  })
  expect(response.statusCode, response.body).toBe(200)
  return (response.json() as { rows: MovementView[] }).rows
}

beforeAll(async () => {
  harness = await startHarness()
}, 120_000)

afterAll(async () => {
  await harness?.close()
})

describe('idempotency is mandatory on movements', () => {
  it('refuses a movement with no Idempotency-Key with 400, applying nothing', async () => {
    const part = await createPart('ENF-KEY-1', 10)
    const response = await move(part._id, { type: 'in', qty: 5 }, { key: null })
    expect(response.statusCode, response.body).toBe(400)
    expect(response.json().error.message).toMatch(/Idempotency-Key/)
    expect((await readPart(part._id)).stock).toBe(10)
    expect(await ledger(part._id)).toHaveLength(0)
  })

  it('replays the same key instead of booking the receipt twice', async () => {
    const part = await createPart('ENF-KEY-2', 0)
    const key = freshKey()
    const first = await move(part._id, { type: 'in', qty: 10 }, { key })
    expect(first.statusCode, first.body).toBe(200)
    const replay = await move(part._id, { type: 'in', qty: 10 }, { key })
    expect(replay.statusCode, replay.body).toBe(200)
    expect((await readPart(part._id)).stock).toBe(10)
    expect(await ledger(part._id)).toHaveLength(1)
  })
})

describe('a transfer conserves the organization’s books', () => {
  it('writes the paired credit row in the same transaction, sharing a transferId', async () => {
    const part = await createPart('ENF-TRF-1', 30)
    const response = await move(part._id, {
      type: 'transfer',
      qty: 5,
      toBranchId: SEED.secondBranchId,
      reason: 'restock Jeddah',
    })
    expect(response.statusCode, response.body).toBe(200)

    const rows = await ledger(part._id)
    expect(rows).toHaveLength(2)
    const debit = rows.find((row) => row.delta < 0)
    const credit = rows.find((row) => row.delta > 0)
    expect(debit).toMatchObject({ type: 'transfer', qty: 5, delta: -5, toBranchId: SEED.secondBranchId })
    expect(credit).toMatchObject({ type: 'transfer', qty: 5, delta: 5, toBranchId: SEED.secondBranchId })
    expect(debit!.transferId).toBeTruthy()
    expect(credit!.transferId).toBe(debit!.transferId)

    // The deltas sum to zero: five units moved, none left the books.
    expect((await readPart(part._id)).stock).toBe(30)
  })

  it('requires toBranchId on a transfer', async () => {
    const part = await createPart('ENF-TRF-2', 10)
    const response = await move(part._id, { type: 'transfer', qty: 2 })
    expect(response.statusCode, response.body).toBe(400)
    expect(response.json().error.field).toBe('toBranchId')
  })

  it('refuses a destination branch that does not exist in this organization', async () => {
    const part = await createPart('ENF-TRF-3', 10)
    // The neighbour tenant's branch: real in the database, invisible under RLS.
    const foreign = await move(part._id, { type: 'transfer', qty: 2, toBranchId: SEED.otherBranchId })
    expect(foreign.statusCode, foreign.body).toBe(422)
    expect(foreign.json().error.field).toBe('toBranchId')

    const invented = await move(part._id, {
      type: 'transfer',
      qty: 2,
      toBranchId: '01JBRANCHXXXXXXXXXXXXXXXXX'.slice(0, 26),
    })
    expect(invented.statusCode, invented.body).toBe(422)
  })

  it('refuses a transfer to the branch the stock is already at', async () => {
    const part = await createPart('ENF-TRF-4', 10)
    const response = await move(part._id, { type: 'transfer', qty: 2, toBranchId: SEED.mainBranchId })
    expect(response.statusCode, response.body).toBe(422)
    expect(response.json().error.message).toMatch(/already at that branch/)
  })

  it('still refuses to relocate more than is available', async () => {
    const part = await createPart('ENF-TRF-5', 4)
    const response = await move(part._id, { type: 'transfer', qty: 5, toBranchId: SEED.secondBranchId })
    expect(response.statusCode, response.body).toBe(422)
    expect((await readPart(part._id)).stock).toBe(4)
    expect(await ledger(part._id)).toHaveLength(0)
  })
})

describe('reservations are real and checkReservation is load-bearing', () => {
  it('reserves under the row lock and reports availability net of the hold', async () => {
    const part = await createPart('ENF-RSV-1', 10)
    const response = await reservation('POST', part._id, { qty: 6, ref: 'JOB-RSV-1' })
    expect(response.statusCode, response.body).toBe(200)
    const after = await readPart(part._id)
    expect(after.reserved).toBe(6)
    expect(after.available).toBe(4)
  })

  it('refuses to reserve more than is on hand — the rule that used to be dead code', async () => {
    const part = await createPart('ENF-RSV-2', 10)
    expect((await reservation('POST', part._id, { qty: 11 })).statusCode).toBe(422)
    await reservation('POST', part._id, { qty: 6 })
    const second = await reservation('POST', part._id, { qty: 5 })
    expect(second.statusCode, second.body).toBe(422)
    expect(second.json().error.message).toMatch(/more than is on hand/)
    expect((await readPart(part._id)).reserved).toBe(6)
  })

  it('releases a hold, but never more than is held', async () => {
    const part = await createPart('ENF-RSV-3', 10)
    await reservation('POST', part._id, { qty: 6 })
    const over = await reservation('DELETE', part._id, { qty: 7 })
    expect(over.statusCode, over.body).toBe(422)
    expect(over.json().error.message).toMatch(/more than is reserved/)
    const release = await reservation('DELETE', part._id, { qty: 4 })
    expect(release.statusCode, release.body).toBe(200)
    expect((await readPart(part._id)).reserved).toBe(2)
  })

  it('refuses a consumption that would eat into a reservation', async () => {
    const part = await createPart('ENF-RSV-4', 10)
    await reservation('POST', part._id, { qty: 6 })
    const tooMuch = await move(part._id, { type: 'out', qty: 5 })
    expect(tooMuch.statusCode, tooMuch.body).toBe(422)
    expect(tooMuch.json().error.message).toMatch(/unreserved/)
    const withinAvailable = await move(part._id, { type: 'out', qty: 4 })
    expect(withinAvailable.statusCode, withinAvailable.body).toBe(200)
    const after = await readPart(part._id)
    expect(after.stock).toBe(6)
    expect(after.reserved).toBe(6)
  })

  it('lets a consumption draw down its own reservation, releasing as it goes', async () => {
    const part = await createPart('ENF-RSV-5', 10)
    await reservation('POST', part._id, { qty: 6 })
    // Everything unreserved is gone; only the reservation can be consumed.
    const consumed = await move(part._id, { type: 'out', qty: 4 })
    expect(consumed.statusCode, consumed.body).toBe(200)

    const beyond = await move(part._id, { type: 'out', qty: 1 })
    expect(beyond.statusCode, beyond.body).toBe(422)

    const fromHold = await move(part._id, { type: 'out', qty: 5, fromReservation: true })
    expect(fromHold.statusCode, fromHold.body).toBe(200)
    const after = await readPart(part._id)
    expect(after.stock).toBe(1)
    expect(after.reserved).toBe(1)

    // And a reservation is a ceiling, not a suggestion.
    const overHold = await move(part._id, { type: 'out', qty: 2, fromReservation: true })
    expect(overHold.statusCode, overHold.body).toBe(422)
    expect(overHold.json().error.message).toMatch(/more than is reserved/)
  })

  it('rejects fromReservation on anything that is not a consumption', async () => {
    const part = await createPart('ENF-RSV-6', 10)
    const response = await move(part._id, { type: 'in', qty: 1, fromReservation: true })
    expect(response.statusCode, response.body).toBe(400)
    expect(response.json().error.field).toBe('fromReservation')
  })
})

describe('adjust_down and return are their own movement types', () => {
  it('records a shortfall as adjust_down without inflating consumption or damage', async () => {
    const part = await createPart('ENF-ADJ-1', 10)
    const response = await move(part._id, { type: 'adjust_down', qty: 3, reason: 'count came up short' })
    expect(response.statusCode, response.body).toBe(200)
    expect((await readPart(part._id)).stock).toBe(7)
    const rows = await ledger(part._id)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ type: 'adjust_down', qty: 3, delta: -3 })
  })

  it('keeps the negative-stock guard on the adjusted result', async () => {
    const part = await createPart('ENF-ADJ-2', 2)
    const response = await move(part._id, { type: 'adjust_down', qty: 3, reason: 'impossible count' })
    expect(response.statusCode, response.body).toBe(422)
    expect((await readPart(part._id)).stock).toBe(2)
  })

  it('books a return as Returned, not as Received', async () => {
    const part = await createPart('ENF-RET-1', 5)
    const response = await move(part._id, { type: 'return', qty: 2, ref: 'RMA-1' })
    expect(response.statusCode, response.body).toBe(200)
    expect((await readPart(part._id)).stock).toBe(7)
    const rows = await ledger(part._id)
    expect(rows[0]).toMatchObject({ type: 'return', qty: 2, delta: 2 })
    expect(rows.filter((row) => row.type === 'in')).toHaveLength(0)
  })

  it('SOD: adjust_down is the same duty as adjust — refused to whoever issued stock', async () => {
    const part = await createPart('ENF-SOD-1', 10)
    const sub = '01JENFSODSTOREKEEPER00001'
    const issued = await move(part._id, { type: 'out', qty: 1 }, { role: 'parts', sub })
    expect(issued.statusCode, issued.body).toBe(200)
    const covered = await move(
      part._id,
      { type: 'adjust_down', qty: 1, reason: 'recount' },
      { role: 'parts', sub },
    )
    expect(covered.statusCode, covered.body).toBe(403)
    expect(covered.json().error.message).toMatch(/Issue stock/)
  })

  it('SOD: a receipt is not an adjustment — issuing stock does not lock out receiving', async () => {
    const part = await createPart('ENF-SOD-2', 10)
    const sub = '01JENFSODSTOREKEEPER00002'
    const issued = await move(part._id, { type: 'out', qty: 1 }, { role: 'parts', sub })
    expect(issued.statusCode, issued.body).toBe(200)
    const received = await move(part._id, { type: 'in', qty: 5 }, { role: 'parts', sub })
    expect(received.statusCode, received.body).toBe(200)
  })
})

describe('the branches directory a transfer destination is picked from', () => {
  it('lists the organization’s branches read-only, even to a branch-scoped role', async () => {
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/branches',
      headers: { authorization: `Bearer ${await harness.token('parts')}` },
    })
    expect(response.statusCode, response.body).toBe(200)
    const rows = (response.json() as { rows: { name: string; _id: string }[] }).rows
    expect(rows.map((row) => row.name).sort()).toEqual(['Jeddah Branch', 'Riyadh Main'])
    // And never the neighbour tenant's branch.
    expect(rows.map((row) => row._id)).not.toContain(SEED.otherBranchId)
  })

  it('is read-only: there is no write surface to it', async () => {
    const response = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/branches',
      headers: {
        authorization: `Bearer ${await ownerToken()}`,
        'content-type': 'application/json',
      },
      payload: { name: 'Rogue Branch' },
    })
    expect(response.statusCode).toBe(404)
  })

  it('is hidden from external roles', async () => {
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/branches',
      headers: { authorization: `Bearer ${await harness.token('supplier')}` },
    })
    expect(response.statusCode).toBe(403)
  })
})
