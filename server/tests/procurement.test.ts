/** Procurement over HTTP (F-022) — the requisition → purchase order → receiving
 *  path, and the two invariants that make it safe:
 *
 *    Purchase order cannot exceed the approval ceiling
 *    Receiving quantity ≤ ordered quantity (over-receipt needs approval)
 *
 *  Both are proven as refusals over the wire, plus segregation of duties (the
 *  raiser may not approve), idempotent receiving, and tenant isolation on every
 *  new collection (a cross-tenant read is a 404, not a 403).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SEED, startHarness, type Harness } from './harness'

let harness: Harness

const json = (token: string, body?: unknown) => ({
  headers: {
    authorization: `Bearer ${token}`,
    ...(body === undefined ? {} : { 'content-type': 'application/json' }),
  },
  ...(body === undefined ? {} : { payload: body as object }),
})

const withKey = (token: string, key: string, body: unknown) => ({
  headers: {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    'idempotency-key': key,
  },
  payload: body as object,
})

const API = '/api/v1'

beforeAll(async () => {
  harness = await startHarness()
}, 120_000)

afterAll(async () => {
  await harness?.close()
})

/** Raises a purchase order (as the owner, so it can then be approved by someone
 *  else) and returns its code. */
async function raisePo(
  token: string,
  lines: { description: string; qty: number; unitPriceHalalas: number }[],
): Promise<{ code: string; totalHalalas: number }> {
  const response = await harness.app.inject({
    method: 'POST',
    url: `${API}/procurement/purchase-orders`,
    ...json(token, { supplierName: 'Ad-hoc Supplier', lines }),
  })
  expect(response.statusCode, response.body).toBe(201)
  const body = response.json() as { code: string; totalHalalas: number; status: string }
  expect(body.status).toBe('draft')
  return { code: body.code, totalHalalas: body.totalHalalas }
}

describe('the seed carries a coherent golden path', () => {
  it('serves an ordered requisition, the PO raised from it, and a partial receipt', async () => {
    const owner = await harness.token('owner')

    const req = await harness.app.inject({
      method: 'GET',
      url: `${API}/procurement/requisitions/REQ-0001`,
      ...json(owner),
    })
    expect(req.statusCode, req.body).toBe(200)
    expect(req.json()).toMatchObject({ code: 'REQ-0001', status: 'ordered' })

    const po = await harness.app.inject({
      method: 'GET',
      url: `${API}/procurement/purchase-orders/PO-0001`,
      ...json(owner),
    })
    expect(po.statusCode, po.body).toBe(200)
    const poBody = po.json() as { requisitionId: string | null; status: string; supplierId: string | null }
    expect(poBody.status).toBe('receiving')
    expect(poBody.supplierId).toBeTruthy()
    expect(poBody.requisitionId).toBeTruthy()

    const lines = await harness.app.inject({
      method: 'GET',
      url: `${API}/procurement/purchase-orders/PO-0001/lines`,
      ...json(owner),
    })
    const rows = (lines.json() as { rows: { qty: number; receivedQty: number }[] }).rows
    expect(rows).toHaveLength(2)
    // The pads arrived in full; the filters have not — a partial receipt.
    expect(rows.some((r) => r.receivedQty === r.qty)).toBe(true)
    expect(rows.some((r) => r.receivedQty === 0)).toBe(true)
  })
})

describe('the requisition → PO lifecycle', () => {
  it('creates, submits and approves a requisition, then raises a PO from it', async () => {
    const procurement = await harness.token('procurement')
    const owner = await harness.token('owner')

    const created = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/requisitions`,
      ...json(procurement, {
        requesterName: 'Workshop',
        priority: 'normal',
        lines: [{ description: 'Wiper blades', qty: 10, estUnitPriceHalalas: 3000 }],
      }),
    })
    expect(created.statusCode, created.body).toBe(201)
    const reqCode = (created.json() as { code: string; status: string; estimatedTotalHalalas: number })
    expect(reqCode.status).toBe('draft')
    expect(reqCode.estimatedTotalHalalas).toBe(30000)

    const submit = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/requisitions/${reqCode.code}/submit`,
      ...json(procurement, {}),
    })
    expect(submit.statusCode, submit.body).toBe(200)
    expect(submit.json()).toMatchObject({ status: 'submitted' })

    // The submitter (procurement) may not approve their own requisition; the
    // owner does. Estimated total is within every ceiling here.
    const selfApprove = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/requisitions/${reqCode.code}/approve`,
      ...json(procurement, {}),
    })
    expect(selfApprove.statusCode).toBe(403)

    const approve = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/requisitions/${reqCode.code}/approve`,
      ...json(owner, {}),
    })
    expect(approve.statusCode, approve.body).toBe(200)
    expect(approve.json()).toMatchObject({ status: 'approved' })

    // Raise a PO from the approved requisition; it becomes ordered.
    const po = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/purchase-orders`,
      ...json(owner, {
        supplierName: 'Wiper Wholesale',
        requisitionId: (approve.json() as { _id: string })._id,
        lines: [{ description: 'Wiper blades', qty: 10, unitPriceHalalas: 3200 }],
      }),
    })
    expect(po.statusCode, po.body).toBe(201)

    const reqAfter = await harness.app.inject({
      method: 'GET',
      url: `${API}/procurement/requisitions/${reqCode.code}`,
      ...json(owner),
    })
    expect(reqAfter.json()).toMatchObject({ status: 'ordered' })
  })

  it('refuses to raise a PO from a requisition that is not approved', async () => {
    const procurement = await harness.token('procurement')
    const owner = await harness.token('owner')
    const draft = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/requisitions`,
      ...json(procurement, {
        requesterName: 'Workshop',
        lines: [{ description: 'Coolant', qty: 4, estUnitPriceHalalas: 2500 }],
      }),
    })
    const id = (draft.json() as { _id: string })._id
    const po = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/purchase-orders`,
      ...json(owner, {
        supplierName: 'Coolant Co',
        requisitionId: id,
        lines: [{ description: 'Coolant', qty: 4, unitPriceHalalas: 2500 }],
      }),
    })
    expect(po.statusCode).toBe(422)
    expect(po.json()).toMatchObject({ error: { code: 'rule_violated' } })
  })
})

describe('invariant: a purchase order cannot exceed the approval ceiling', () => {
  it('refuses approval above the role ceiling and allows it below', async () => {
    const owner = await harness.token('owner')
    const procurement = await harness.token('procurement')
    const manager = await harness.token('manager')

    // Subtotal SAR 30,000 → total SAR 34,500 = 3,450,000 halalas. Above the
    // procurement ceiling (SAR 20,000) and below the manager ceiling (SAR 50,000).
    const { code, totalHalalas } = await raisePo(owner, [
      { description: 'Bulk brake kit', qty: 100, unitPriceHalalas: 30000 },
    ])
    expect(totalHalalas).toBe(3_450_000)

    const overCeiling = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/purchase-orders/${code}/approve`,
      ...json(procurement, {}),
    })
    expect(overCeiling.statusCode, overCeiling.body).toBe(403)
    expect(overCeiling.json()).toMatchObject({ error: { code: 'approval_required' } })

    // The manager is within ceiling and is not the raiser.
    const approved = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/purchase-orders/${code}/approve`,
      ...json(manager, {}),
    })
    expect(approved.statusCode, approved.body).toBe(200)
    expect(approved.json()).toMatchObject({ status: 'approved' })
  })

  it('refuses the raiser approving their own order (segregation of duties)', async () => {
    const owner = await harness.token('owner')
    const { code } = await raisePo(owner, [
      { description: 'Small part', qty: 1, unitPriceHalalas: 5000 },
    ])
    // Owner has an unlimited ceiling, so this is purely the SOD refusal.
    const selfApprove = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/purchase-orders/${code}/approve`,
      ...json(owner, {}),
    })
    expect(selfApprove.statusCode).toBe(403)
    expect(selfApprove.json()).toMatchObject({ error: { code: 'forbidden' } })
  })
})

describe('invariant: receiving quantity ≤ ordered quantity', () => {
  async function approvedPo(): Promise<string> {
    const owner = await harness.token('owner')
    const procurement = await harness.token('procurement')
    const { code } = await raisePo(owner, [
      { description: 'Filters', qty: 5, unitPriceHalalas: 4000 },
    ])
    const approve = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/purchase-orders/${code}/approve`,
      ...json(procurement, {}),
    })
    expect(approve.statusCode, approve.body).toBe(200)
    return code
  }

  async function lineId(token: string, code: string): Promise<string> {
    const lines = await harness.app.inject({
      method: 'GET',
      url: `${API}/procurement/purchase-orders/${code}/lines`,
      ...json(token),
    })
    return (lines.json() as { rows: { _id: string }[] }).rows[0]!._id
  }

  it('receives up to ordered, then refuses an over-receipt that is not approved', async () => {
    const procurement = await harness.token('procurement')
    const code = await approvedPo()
    const id = await lineId(procurement, code)

    const first = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/purchase-orders/${code}/receive`,
      ...withKey(procurement, 'recv-partial-1', { lines: [{ lineId: id, qty: 3 }] }),
    })
    expect(first.statusCode, first.body).toBe(200)
    expect(first.json()).toMatchObject({ status: 'receiving' })

    // 3 already received + 5 more = 8 > 5 ordered, and no over-receipt approval.
    const over = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/purchase-orders/${code}/receive`,
      ...withKey(procurement, 'recv-over-1', { lines: [{ lineId: id, qty: 5 }] }),
    })
    expect(over.statusCode, over.body).toBe(422)
    expect(over.json()).toMatchObject({ error: { code: 'rule_violated' } })

    // The remaining 2 complete the line and the order.
    const rest = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/purchase-orders/${code}/receive`,
      ...withKey(procurement, 'recv-rest-1', { lines: [{ lineId: id, qty: 2 }] }),
    })
    expect(rest.statusCode, rest.body).toBe(200)
    expect(rest.json()).toMatchObject({ status: 'received' })
  })

  it('accepts an over-receipt only when explicitly approved by an authorised caller', async () => {
    const procurement = await harness.token('procurement')
    const code = await approvedPo()
    const id = await lineId(procurement, code)

    // procurement holds both procurement:e (receive) and procurement:a (approve),
    // so it may authorise the over-receipt — but only when it says so.
    const approvedOver = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/purchase-orders/${code}/receive`,
      ...withKey(procurement, 'recv-approved-over-1', {
        lines: [{ lineId: id, qty: 8 }],
        overReceiptApproved: true,
        reason: 'supplier shipped a bonus carton',
      }),
    })
    expect(approvedOver.statusCode, approvedOver.body).toBe(200)
    expect(approvedOver.json()).toMatchObject({ status: 'received' })
  })

  it('is idempotent — a replayed receipt books the quantity once', async () => {
    const procurement = await harness.token('procurement')
    const code = await approvedPo()
    const id = await lineId(procurement, code)

    const body = { lines: [{ lineId: id, qty: 2 }] }
    const first = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/purchase-orders/${code}/receive`,
      ...withKey(procurement, 'recv-idem-1', body),
    })
    expect(first.statusCode, first.body).toBe(200)
    const replay = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/purchase-orders/${code}/receive`,
      ...withKey(procurement, 'recv-idem-1', body),
    })
    expect(replay.statusCode, replay.body).toBe(200)

    const lines = await harness.app.inject({
      method: 'GET',
      url: `${API}/procurement/purchase-orders/${code}/lines`,
      ...json(procurement),
    })
    const received = (lines.json() as { rows: { receivedQty: number }[] }).rows[0]!.receivedQty
    expect(received).toBe(2)
  })

  it('refuses receiving without an idempotency key', async () => {
    const procurement = await harness.token('procurement')
    const code = await approvedPo()
    const id = await lineId(procurement, code)
    const noKey = await harness.app.inject({
      method: 'POST',
      url: `${API}/procurement/purchase-orders/${code}/receive`,
      ...json(procurement, { lines: [{ lineId: id, qty: 1 }] }),
    })
    expect(noKey.statusCode).toBe(400)
  })
})

describe('tenant isolation — a cross-tenant read is a 404', () => {
  it('hides another organization’s requisition, PO and suppliers', async () => {
    const other = await harness.token('owner', {
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
      sub: '01JUSEROTHERXXXXXXXXXXXXXXX',
    })

    const req = await harness.app.inject({
      method: 'GET',
      url: `${API}/procurement/requisitions/REQ-0001`,
      ...json(other),
    })
    expect(req.statusCode).toBe(404)

    const po = await harness.app.inject({
      method: 'GET',
      url: `${API}/procurement/purchase-orders/PO-0001`,
      ...json(other),
    })
    expect(po.statusCode).toBe(404)

    // The neighbouring org has no suppliers of its own, and cannot see ours.
    const suppliers = await harness.app.inject({
      method: 'GET',
      url: `${API}/procurement/suppliers?pageSize=50`,
      ...json(other),
    })
    expect(suppliers.statusCode, suppliers.body).toBe(200)
    expect((suppliers.json() as { rows: unknown[] }).rows).toHaveLength(0)
  })

  it('refuses a role without procurement access and serves one with it', async () => {
    const technician = await harness.token('technician')
    const denied = await harness.app.inject({
      method: 'GET',
      url: `${API}/procurement/purchase-orders`,
      ...json(technician),
    })
    expect(denied.statusCode).toBe(403)

    const procurement = await harness.token('procurement')
    const allowed = await harness.app.inject({
      method: 'GET',
      url: `${API}/procurement/purchase-orders`,
      ...json(procurement),
    })
    expect(allowed.statusCode, allowed.body).toBe(200)
  })
})
