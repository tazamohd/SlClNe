/** The behaviours a screen cannot be trusted to enforce.
 *
 *  Every case here is written from the attacker's or the unlucky user's side:
 *  the request that bypasses the UI, the second click that arrives twice, the
 *  two people editing one record. Passing the UI is not evidence; passing this
 *  is.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { and, eq } from 'drizzle-orm'
import { auditLog, payments } from '../src/db/schema'
import { SEED, startHarness, type Harness } from './harness'

let harness: Harness

const json = (token: string, body?: unknown) => ({
  headers: {
    authorization: `Bearer ${token}`,
    ...(body === undefined ? {} : { 'content-type': 'application/json' }),
  },
  ...(body === undefined ? {} : { payload: body as object }),
})

beforeAll(async () => {
  harness = await startHarness()
}, 120_000)

afterAll(async () => {
  await harness?.close()
})

describe('probes', () => {
  it('answers /health without touching the database', async () => {
    const response = await harness.app.inject({ method: 'GET', url: '/health' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ status: 'ok' })
  })

  it('answers /ready when the database is reachable', async () => {
    const response = await harness.app.inject({ method: 'GET', url: '/ready' })
    expect(response.statusCode).toBe(200)
  })
})

describe('authentication', () => {
  it('refuses an unauthenticated request', async () => {
    const response = await harness.app.inject({ method: 'GET', url: '/api/v1/customers' })
    expect(response.statusCode).toBe(401)
    expect(response.json().error.code).toBe('unauthenticated')
  })

  it('refuses a forged token', async () => {
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customers',
      headers: { authorization: 'Bearer not.a.token' },
    })
    expect(response.statusCode).toBe(401)
  })
})

describe('authorization is re-checked on the server', () => {
  it('lets a front-desk user create a customer', async () => {
    const token = await harness.token('frontdesk')
    const response = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/customers',
      ...json(token, { name: 'Walk-in Customer', phone: '+966 55 111 2233' }),
    })
    expect(response.statusCode, response.body).toBe(201)
  })

  it('refuses a technician creating a customer even by direct API call', async () => {
    const token = await harness.token('technician')
    const response = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/customers',
      ...json(token, { name: 'Should Not Exist', phone: '+966 55 999 0000' }),
    })
    expect(response.statusCode).toBe(403)
    expect(response.json().error.code).toBe('forbidden')
  })

  it('redacts customer contact details from a technician on the wire, not just in the client', async () => {
    // A technician holds `v` on customers, so the read is allowed — but
    // FIELD_RULES hides "Customer contact details" from that role. The client
    // hid the column; the API used to ship phone and email in the row anyway.
    // §36: the wire is the boundary, so the value must be gone here.
    const [tech, owner] = await Promise.all([
      harness.token('technician'),
      harness.token('owner'),
    ])
    const asTech = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customers?pageSize=5',
      headers: { authorization: `Bearer ${tech}` },
    })
    expect(asTech.statusCode, asTech.body).toBe(200)
    const techRows = asTech.json().rows as Array<Record<string, unknown>>
    expect(techRows.length).toBeGreaterThan(0)
    for (const row of techRows) {
      expect(row.phone, 'phone leaked to a technician').toBeNull()
      expect(row.email, 'email leaked to a technician').toBeNull()
    }
    // The owner, who is not in the rule's hidden list, still sees the contact.
    const asOwner = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customers?pageSize=5',
      headers: { authorization: `Bearer ${owner}` },
    })
    const ownerRows = asOwner.json().rows as Array<Record<string, unknown>>
    expect(ownerRows.some((r) => typeof r.phone === 'string' && r.phone.length > 0)).toBe(true)
  })

  it('refuses a role with no view permission on the module', async () => {
    const token = await harness.token('technician')
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/accounting/expenses',
      ...json(token),
    })
    expect(response.statusCode).toBe(403)
  })

  it('refuses a body that tries to set a server-owned column', async () => {
    const token = await harness.token('owner')
    const response = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/customers',
      ...json(token, {
        name: 'Tenant Hopper',
        phone: '+966 55 222 3344',
        orgId: SEED.otherOrgId,
      }),
    })
    expect(response.statusCode).toBe(400)
    expect(response.json().error.field).toBe('orgId')
  })
})

describe('tenant isolation', () => {
  it('returns 404, not 403, for a record in another organization', async () => {
    const owner = await harness.token('owner')
    const neighbour = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/invoices/INV-NEIGHBOUR-0001',
      ...json(owner),
    })
    expect(neighbour.statusCode).toBe(404)
    expect(neighbour.json().error.code).toBe('not_found')
  })

  it('hides the other organization from list endpoints entirely', async () => {
    const owner = await harness.token('owner')
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/invoices?pageSize=200',
      ...json(owner),
    })
    const codes = (response.json() as { rows: { id: string }[] }).rows.map((r) => r.id)
    expect(codes).not.toContain('INV-NEIGHBOUR-0001')
  })

  it('ignores an inflated scope claim in the token', async () => {
    /* Every token this harness mints claims `scope: 'platform'`. The server
     * derives scope from the role instead, so an owner still sees one org. */
    const owner = await harness.token('owner')
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customers?pageSize=200',
      ...json(owner),
    })
    const names = (response.json() as { rows: { name: string }[] }).rows.map((r) => r.name)
    expect(names).not.toContain('Neighbour Customer')
  })

  it('returns 404 when writing to a record in another organization', async () => {
    const owner = await harness.token('owner')
    const response = await harness.app.inject({
      method: 'PATCH',
      url: '/api/v1/invoices/INV-NEIGHBOUR-0001',
      ...json(owner, { customerName: 'Taken Over' }),
    })
    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe('not_found')
  })

  it('shows a branch-scoped user nothing from another branch', async () => {
    const otherBranch = await harness.token('manager', { branchId: SEED.secondBranchId })
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customers?pageSize=200',
      ...json(otherBranch),
    })
    expect(response.statusCode).toBe(200)
    expect((response.json() as { rows: unknown[] }).rows).toHaveLength(0)
  })

  it('shows an own-scoped technician only the jobs assigned to them', async () => {
    const tech = await harness.token('technician')
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/jobs?pageSize=200',
      ...json(tech),
    })
    expect(response.statusCode).toBe(200)
    expect((response.json() as { rows: unknown[] }).rows).toHaveLength(0)
  })
})

describe('list query', () => {
  it('paginates', async () => {
    const token = await harness.token('owner')
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/vehicles?page=2&pageSize=2',
      ...json(token),
    })
    const body = response.json() as { rows: unknown[]; page: { total: number; totalPages: number } }
    expect(body.rows).toHaveLength(2)
    expect(body.page.total).toBe(5)
    expect(body.page.totalPages).toBe(3)
  })

  it('searches', async () => {
    const token = await harness.token('owner')
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/vehicles?q=Patrol',
      ...json(token),
    })
    const rows = (response.json() as { rows: { make: string }[] }).rows
    expect(rows).toHaveLength(1)
    expect(rows[0]?.make).toContain('Patrol')
  })

  it('filters', async () => {
    const token = await harness.token('owner')
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/vehicles?filter[status]=service',
      ...json(token),
    })
    const rows = (response.json() as { rows: { status: string }[] }).rows
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.every((r) => r.status === 'service')).toBe(true)
  })

  it('refuses an unknown sort key rather than ignoring it', async () => {
    const token = await harness.token('owner')
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/vehicles?sort=notAColumn:asc',
      ...json(token),
    })
    expect(response.statusCode).toBe(400)
  })

  it('refuses an unknown filter key rather than ignoring it', async () => {
    const token = await harness.token('owner')
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/vehicles?filter[secret]=1',
      ...json(token),
    })
    expect(response.statusCode).toBe(400)
  })
})

describe('optimistic concurrency', () => {
  it('gives the second of two editors a 409 instead of silently overwriting', async () => {
    const token = await harness.token('owner')
    const list = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customers?pageSize=1',
      ...json(token),
    })
    const row = (list.json() as { rows: { _id: string; _version: number }[] }).rows[0]
    expect(row).toBeDefined()

    const first = await harness.app.inject({
      method: 'PATCH',
      url: `/api/v1/customers/${row!._id}`,
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'if-match-version': String(row!._version),
      },
      payload: { notes: 'edited by the first user' },
    })
    expect(first.statusCode, first.body).toBe(200)
    expect((first.json() as { _version: number })._version).toBe(row!._version + 1)

    const second = await harness.app.inject({
      method: 'PATCH',
      url: `/api/v1/customers/${row!._id}`,
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'if-match-version': String(row!._version),
      },
      payload: { notes: 'edited by the second user' },
    })
    expect(second.statusCode).toBe(409)
    expect(second.json().error.code).toBe('version_conflict')
  })
})

describe('invoices and payments', () => {
  async function createInvoice(token: string, unitPriceHalalas = 100_000) {
    const response = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/invoices',
      ...json(token, {
        customerName: 'Ahmed Al-Rashid',
        dueDate: '2026-09-01',
        lines: [
          { description: 'Brake pads', kind: 'part', qty: 1, unitPriceHalalas },
        ],
      }),
    })
    expect(response.statusCode, response.body).toBe(201)
    return response.json() as { _id: string; totalHalalas: number; amount: string; status: string }
  }

  it('computes the total from the lines and ignores anything the client claims', async () => {
    const token = await harness.token('accountant')
    const invoice = await createInvoice(token)
    expect(invoice.totalHalalas).toBe(115_000)
    expect(invoice.amount).toBe('SAR 1,150')
  })

  it('replays a create with the same Idempotency-Key instead of billing twice', async () => {
    const token = await harness.token('accountant')
    const payload = {
      customerName: 'Idempotent Customer',
      dueDate: '2026-09-02',
      lines: [{ description: 'Oil change', kind: 'labour', qty: 1, unitPriceHalalas: 20_000 }],
    }
    const headers = {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'idempotency-key': 'invoice-key-0001',
    }
    const first = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/invoices',
      headers,
      payload,
    })
    const second = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/invoices',
      headers,
      payload,
    })
    expect(first.statusCode).toBe(201)
    expect(second.statusCode).toBe(201)
    expect(second.json()._id).toBe(first.json()._id)
  })

  it('refuses the same Idempotency-Key with a different body', async () => {
    const token = await harness.token('accountant')
    const headers = {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'idempotency-key': 'invoice-key-0002',
    }
    await harness.app.inject({
      method: 'POST',
      url: '/api/v1/invoices',
      headers,
      payload: {
        customerName: 'A',
        dueDate: '2026-09-03',
        lines: [{ description: 'x', kind: 'fee', qty: 1, unitPriceHalalas: 1_000 }],
      },
    })
    const conflicting = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/invoices',
      headers,
      payload: {
        customerName: 'B',
        dueDate: '2026-09-03',
        lines: [{ description: 'x', kind: 'fee', qty: 1, unitPriceHalalas: 9_000 }],
      },
    })
    expect(conflicting.statusCode).toBe(409)
    expect(conflicting.json().error.code).toBe('idempotency_conflict')
  })

  it('refuses a payment against an unissued invoice, then accepts it once issued', async () => {
    const token = await harness.token('accountant')
    const invoice = await createInvoice(token)

    const early = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/invoices/${invoice._id}/payments`,
      ...json(token, { amountHalalas: 1_000, method: 'Mada' }),
    })
    expect(early.statusCode).toBe(422)

    const issued = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/invoices/${invoice._id}/issue`,
      ...json(token, {}),
    })
    expect(issued.statusCode, issued.body).toBe(200)
    expect(issued.json().status).toBe('unpaid')
    expect(typeof issued.json().qrCode).toBe('string')

    const paid = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/invoices/${invoice._id}/payments`,
      ...json(token, { amountHalalas: 115_000, method: 'Mada', reference: 'TXN-1' }),
    })
    expect(paid.statusCode, paid.body).toBe(201)
    expect(paid.json().invoice.status).toBe('paid')
  })

  it('refuses a payment larger than the balance', async () => {
    const token = await harness.token('accountant')
    const invoice = await createInvoice(token)
    await harness.app.inject({
      method: 'POST',
      url: `/api/v1/invoices/${invoice._id}/issue`,
      ...json(token, {}),
    })
    const response = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/invoices/${invoice._id}/payments`,
      ...json(token, { amountHalalas: 115_001, method: 'Cash' }),
    })
    expect(response.statusCode).toBe(422)
    expect(response.json().error.code).toBe('rule_violated')
  })

  it('takes a duplicate payment submission only once', async () => {
    const token = await harness.token('accountant')
    const invoice = await createInvoice(token)
    await harness.app.inject({
      method: 'POST',
      url: `/api/v1/invoices/${invoice._id}/issue`,
      ...json(token, {}),
    })
    const headers = {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'idempotency-key': `payment-${invoice._id}`,
    }
    const payload = { amountHalalas: 50_000, method: 'Mada', reference: 'TXN-DUP' }
    const first = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/invoices/${invoice._id}/payments`,
      headers,
      payload,
    })
    const replay = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/invoices/${invoice._id}/payments`,
      headers,
      payload,
    })
    expect(first.statusCode).toBe(201)
    expect(replay.statusCode).toBe(201)

    const rows = await harness.handle.db.transaction(async (tx) => {
      await tx.execute(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (await import('drizzle-orm')).sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
      )
      return tx.select().from(payments).where(eq(payments.reference, 'TXN-DUP'))
    })
    expect(rows).toHaveLength(1)
  })

  it('lets only one of two simultaneous payments take the last of the balance', async () => {
    /* No Idempotency-Key here on purpose: this is the race the row lock has to
     * win, not the replay the key protects against. Both requests read the
     * balance, both would pass `amount ≤ balance` without the lock. */
    const token = await harness.token('accountant')
    const invoice = await createInvoice(token)
    await harness.app.inject({
      method: 'POST',
      url: `/api/v1/invoices/${invoice._id}/issue`,
      ...json(token, {}),
    })

    const attempt = () =>
      harness.app.inject({
        method: 'POST',
        url: `/api/v1/invoices/${invoice._id}/payments`,
        ...json(token, { amountHalalas: 115_000, method: 'Cash' }),
      })
    const [first, second] = await Promise.all([attempt(), attempt()])
    const codes = [first.statusCode, second.statusCode].sort()
    expect(codes).toEqual([201, 422])

    const settled = await harness.app.inject({
      method: 'GET',
      url: `/api/v1/invoices/${invoice._id}`,
      ...json(token),
    })
    expect(settled.json().paidHalalas).toBe(115_000)
    expect(settled.json().balanceHalalas).toBe(0)
  })

  it('refuses to edit an issued invoice', async () => {
    const token = await harness.token('accountant')
    const invoice = await createInvoice(token)
    await harness.app.inject({
      method: 'POST',
      url: `/api/v1/invoices/${invoice._id}/issue`,
      ...json(token, {}),
    })
    const response = await harness.app.inject({
      method: 'PATCH',
      url: `/api/v1/invoices/${invoice._id}`,
      ...json(token, { customerName: 'Someone Else' }),
    })
    expect(response.statusCode).toBe(409)
  })

  it('refuses to issue above the issuer’s approval ceiling', async () => {
    /* A branch manager may edit and issue invoices, but may only commit up to
     * SAR 50,000 — so a SAR 69,000 invoice has to be escalated, not issued. */
    const manager = await harness.token('manager')
    const invoice = await createInvoice(manager, 6_000_000)
    const response = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/invoices/${invoice._id}/issue`,
      ...json(manager, {}),
    })
    expect(response.statusCode).toBe(403)
    expect(response.json().error.code).toBe('approval_required')
    expect(response.json().error.message).toContain('SAR 50,000')
  })

  it('refuses a role that may create an invoice but not edit one', async () => {
    /* An advisor holds `vc` on invoices: they may raise one, and may not issue
     * it. The distinction only exists on the server. */
    const advisor = await harness.token('advisor')
    const invoice = await createInvoice(advisor, 100_000)
    const response = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/invoices/${invoice._id}/issue`,
      ...json(advisor, {}),
    })
    expect(response.statusCode).toBe(403)
    expect(response.json().error.code).toBe('forbidden')
  })
})

describe('estimates and approval', () => {
  async function createEstimate(token: string, unitPriceHalalas: number) {
    const response = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/estimates',
      ...json(token, {
        customerName: 'Ahmed Al-Rashid',
        vehicleLabel: 'Toyota Camry 2022',
        lines: [{ description: 'Brake job', kind: 'labour', qty: 1, unitPriceHalalas }],
      }),
    })
    expect(response.statusCode, response.body).toBe(201)
    return response.json() as { _id: string; totalHalalas: number }
  }

  it('escalates a total above the approver’s ceiling', async () => {
    /* SAR 60,000 net is SAR 69,000 with VAT — past a manager's SAR 50,000. */
    const submitter = await harness.token('manager', { sub: '01JUSERMANAGERSUBMIT000001' })
    const estimate = await createEstimate(submitter, 6_000_000)
    const approver = await harness.token('manager', { sub: '01JUSERMANAGERAPPROVE00001' })
    const response = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/estimates/${estimate._id}/approve`,
      ...json(approver, {}),
    })
    expect(response.statusCode).toBe(403)
    expect(response.json().error.code).toBe('approval_required')
  })

  it('refuses a role with no approve action on estimates', async () => {
    const manager = await harness.token('manager', { sub: '01JUSERMANAGERAPPROVE00002' })
    const estimate = await createEstimate(manager, 100_000)
    const advisor = await harness.token('advisor')
    const response = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/estimates/${estimate._id}/approve`,
      ...json(advisor, {}),
    })
    expect(response.statusCode).toBe(403)
    expect(response.json().error.code).toBe('forbidden')
  })

  it('refuses to let the submitter approve their own estimate', async () => {
    const manager = await harness.token('manager', { sub: '01JUSERMANAGER0000000001A' })
    const estimate = await createEstimate(manager, 100_000)
    const response = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/estimates/${estimate._id}/approve`,
      ...json(manager, {}),
    })
    expect(response.statusCode).toBe(403)
    expect(response.json().error.message).toMatch(/cannot also approve/i)
  })

  it('approves once, and refuses the second approval of the same estimate', async () => {
    const submitter = await harness.token('manager', { sub: '01JUSERMANAGER0000000002A' })
    const estimate = await createEstimate(submitter, 100_000)
    const approver = await harness.token('manager', { sub: '01JUSERMANAGER0000000003A' })
    const first = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/estimates/${estimate._id}/approve`,
      ...json(approver, { reason: 'within ceiling' }),
    })
    expect(first.statusCode, first.body).toBe(200)
    expect(first.json().status).toBe('approved')

    const second = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/estimates/${estimate._id}/approve`,
      ...json(approver, {}),
    })
    expect(second.statusCode).toBe(409)
  })
})

describe('workshop stage machine', () => {
  it('refuses a skipped gate and accepts the legal step', async () => {
    const token = await harness.token('owner')
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      ...json(token, {
        customerName: 'Ahmed Al-Rashid',
        vehicleLabel: 'Toyota Camry 2022',
        service: 'maintenance',
      }),
    })
    expect(created.statusCode, created.body).toBe(201)
    const id = created.json()._id

    const skipped = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/jobs/${id}/transition`,
      ...json(token, { to: 'delivery' }),
    })
    expect(skipped.statusCode).toBe(422)

    const legal = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/jobs/${id}/transition`,
      ...json(token, { to: 'inspection' }),
    })
    expect(legal.statusCode, legal.body).toBe(200)
    expect(legal.json().stage).toBe('inspection')
  })

  it('will not let a generic PATCH move the stage around the gate', async () => {
    // The transition route above refuses checkin→delivery with a 422. The
    // generic collection PATCH must not be a second door onto the same column:
    // it runs neither the state machine nor the QC/SOD check, so if it can set
    // `stage` at all, every gate the transition route enforces is optional.
    const token = await harness.token('owner')
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/jobs',
      ...json(token, {
        customerName: 'Layla Haddad',
        vehicleLabel: 'Nissan Patrol 2021',
        service: 'maintenance',
      }),
    })
    expect(created.statusCode, created.body).toBe(201)
    const id = created.json()._id

    const patched = await harness.app.inject({
      method: 'PATCH',
      url: `/api/v1/jobs/${id}`,
      ...json(token, { stage: 'delivery', status: 'completed' }),
    })
    // The write itself may succeed — it edits nothing it is allowed to edit —
    // but the stage and status must be exactly where the job started.
    const reread = await harness.app.inject({
      method: 'GET',
      url: `/api/v1/jobs/${id}`,
      headers: { authorization: `Bearer ${token}` },
    })
    expect(reread.statusCode, reread.body).toBe(200)
    expect(reread.json().stage, patched.body).toBe('checkin')
    // The jobs presenter exposes status under `st`.
    expect(reread.json().st).toBe('pending')
  })
})

describe('inventory', () => {
  it('moves stock only through a movement, and never below zero', async () => {
    const token = await harness.token('parts')
    const list = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/inventory?q=Oil Filter',
      ...json(token),
    })
    const part = (list.json() as { rows: { _id: string; stock: number }[] }).rows[0]
    expect(part).toBeDefined()

    const withKey = (body: unknown) => {
      const base = json(token, body)
      return {
        ...base,
        headers: { ...base.headers, 'idempotency-key': `api-test-${crypto.randomUUID()}` },
      }
    }
    const consume = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/inventory/${part!._id}/movement`,
      ...withKey({ type: 'out', qty: 2, ref: 'JOB-1' }),
    })
    expect(consume.statusCode, consume.body).toBe(200)
    expect(consume.json().stock).toBe(part!.stock - 2)

    const overdraw = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/inventory/${part!._id}/movement`,
      ...withKey({ type: 'out', qty: 10_000 }),
    })
    expect(overdraw.statusCode).toBe(422)
  })

  it('redacts part cost from a role that may not see margin', async () => {
    const advisor = await harness.token('advisor')
    const response = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/inventory?pageSize=1',
      ...json(advisor),
    })
    const row = (response.json() as { rows: { costHalalas: number | null }[] }).rows[0]
    expect(row?.costHalalas).toBeNull()

    const owner = await harness.token('owner')
    const visible = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/inventory?pageSize=1',
      ...json(owner),
    })
    expect((visible.json() as { rows: { costHalalas: number }[] }).rows[0]?.costHalalas)
      .toBeGreaterThan(0)
  })
})

describe('soft delete', () => {
  it('hides a deleted row from the list without destroying it', async () => {
    const token = await harness.token('owner')
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/customers',
      ...json(token, { name: 'Temporary Customer', phone: '+966 55 777 8899' }),
    })
    const id = created.json()._id

    const removed = await harness.app.inject({
      method: 'DELETE',
      url: `/api/v1/customers/${id}`,
      ...json(token),
    })
    expect(removed.statusCode).toBe(204)

    const gone = await harness.app.inject({
      method: 'GET',
      url: `/api/v1/customers/${id}`,
      ...json(token),
    })
    expect(gone.statusCode).toBe(404)

    const included = await harness.app.inject({
      method: 'GET',
      url: `/api/v1/customers?includeDeleted=true&pageSize=200`,
      ...json(token),
    })
    const names = (included.json() as { rows: { name: string }[] }).rows.map((r) => r.name)
    expect(names).toContain('Temporary Customer')
  })
})

describe('audit', () => {
  it('records actor, role, entity, before and after for every mutation', async () => {
    const token = await harness.token('owner', { sub: '01JUSERAUDIT000000000001A' })
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/customers',
      ...json(token, { name: 'Audited Customer', phone: '+966 55 123 4567' }),
    })
    const id = created.json()._id

    const rows = await harness.handle.db.transaction(async (tx) => {
      const { sql } = await import('drizzle-orm')
      await tx.execute(
        sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
      )
      return tx
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.entity, 'customer'), eq(auditLog.entityId, id)))
    })

    expect(rows).toHaveLength(1)
    const entry = rows[0]!
    expect(entry.actorId).toBe('01JUSERAUDIT000000000001A')
    expect(entry.actorRole).toBe('owner')
    expect(entry.orgId).toBe(SEED.orgId)
    expect(entry.action).toBe('create')
    expect(entry.source).toBe('api')
    expect(entry.requestId).toBeTruthy()
    expect((entry.after as { name: string }).name).toBe('Audited Customer')
  })

  /** Runs outside a tenant context, which is the case that used to slip
   *  through. The guard triggers were FOR EACH ROW, and RLS decides row
   *  visibility before a row trigger is consulted: with `app.org_id` unset
   *  `p_tenant_read` matched nothing, so these statements touched no rows,
   *  fired no trigger and returned success. Nothing was altered — there was
   *  nothing visible to alter — but a refusal and a no-op are not the same
   *  guarantee, and the difference would matter the moment a policy widened.
   *  The triggers are FOR EACH STATEMENT now, so the refusal does not depend
   *  on how much the caller can see. */
  it('cannot be edited, deleted or truncated, even by the application role', async () => {
    const { sql } = await import('drizzle-orm')
    /* Either defence may answer first, and which one does is a property of the
     * deployment rather than of the guarantee:
     *
     *  - where the API role differs from the migration role, `scripts/migrate.ts`
     *    revokes update and delete on this table, so the privilege check refuses
     *    with "permission denied" before a trigger is reached;
     *  - where the two roles are the same, that revoke is skipped and the
     *    trigger answers with "append-only".
     *
     * TRUNCATE is covered by the trigger in both, no revoke naming it. Asserting
     * one wording would pin the test to one deployment shape, so both are
     * accepted and what is actually asserted is that the write is refused. */
    const refused = /append-only|permission denied/
    await expect(
      harness.handle.db.execute(sql`update audit_log set action = 'tampered'`),
    ).rejects.toThrow(refused)
    await expect(harness.handle.db.execute(sql`delete from audit_log`)).rejects.toThrow(refused)
    /* TRUNCATE is neither an UPDATE nor a DELETE and produces no rows for a
     * row-level trigger to see, so it would have emptied the table in one
     * statement regardless of how the other two were written. */
    await expect(harness.handle.db.execute(sql`truncate audit_log`)).rejects.toThrow(refused)
  })

  it('still accepts the inserts it exists to record', async () => {
    /* The counterpart to the test above: append-only has to keep allowing the
     * append, and a guard broad enough to catch TRUNCATE is broad enough to be
     * worth proving does not also catch INSERT. */
    const token = await harness.token('owner', { sub: '01JUSERAUDIT000000000002B' })
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/customers',
      ...json(token, { name: 'Audit Insert Probe', phone: '+966 55 123 4568' }),
    })
    expect(created.statusCode).toBe(201)
    const id = created.json()._id

    const rows = await harness.handle.db.transaction(async (tx) => {
      const { sql } = await import('drizzle-orm')
      await tx.execute(
        sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
      )
      return tx
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.entity, 'customer'), eq(auditLog.entityId, id)))
    })
    expect(rows).toHaveLength(1)
  })
})
