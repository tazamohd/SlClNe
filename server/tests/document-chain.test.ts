/** DF-007 — the document chain's three joins, over the wire.
 *
 *  Each link used to be manual re-keying: read one document on one screen, type
 *  its figures into another. That is where a transcription error enters a
 *  financial chain, and nothing afterwards records that the two were meant to
 *  be the same numbers. Three endpoints close them:
 *
 *    POST /estimates/:id/invoice        an approved estimate → a draft invoice
 *    POST /estimates/:id/verify-…-otp   a verified customer signature → the row
 *    POST /appointments/:id/job-card    a kept appointment → a job card
 *
 *  The second is proven in `obd-otp.test.ts`, where the OTP transport is wired
 *  to the mock. This suite proves the other two, and — as much as the joining —
 *  proves what they refuse: an unapproved estimate, a second invoice from the
 *  same one, a cancelled appointment, a second job card.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { and, eq, isNull } from 'drizzle-orm'
import { withAuthPlane } from '../src/auth/context'
import { estimates, invoiceLines, invoices, jobCards } from '../src/db/schema'
import { SEED, startHarness, type Harness } from './harness'

let harness: Harness

const json = (token: string, body?: unknown) => ({
  headers: {
    authorization: `Bearer ${token}`,
    ...(body === undefined ? {} : { 'content-type': 'application/json' }),
  },
  ...(body === undefined ? {} : { payload: body as object }),
})

const API = '/api/v1'

function post(url: string, token: string, body?: unknown) {
  return harness.app.inject({ method: 'POST', url: `${API}${url}`, ...json(token, body ?? {}) })
}

function get(url: string, token: string) {
  return harness.app.inject({ method: 'GET', url: `${API}${url}`, ...json(token) })
}

beforeAll(async () => {
  harness = await startHarness()
}, 120_000)

afterAll(async () => {
  await harness?.close()
})

/* ═══════════════════════════════ join one: estimate → invoice ═══════════ */

describe('POST /estimates/:id/invoice', () => {
  /** An estimate raised by the advisor and approved by the owner, so the
   *  segregation-of-duties check on `/approve` is satisfied by two real
   *  actors rather than bypassed. Returns its code and its total. */
  async function approvedEstimate(
    lines: { description: string; kind: string; qty: number; unitPriceHalalas: number }[],
  ): Promise<{ code: string; id: string; totalHalalas: number }> {
    const advisor = await harness.token('advisor')
    const created = await post('/estimates', advisor, {
      customerName: 'Chain Test Customer',
      vehicleLabel: 'Toyota Camry 2021',
      lines,
    })
    expect(created.statusCode, created.body).toBe(201)
    const estimate = created.json() as { _id: string; id: string; totalHalalas: number }

    const owner = await harness.token('owner')
    const approved = await post(`/estimates/${estimate._id}/approve`, owner, {})
    expect(approved.statusCode, approved.body).toBe(200)
    expect((approved.json() as { status: string }).status).toBe('approved')

    return { code: estimate.id, id: estimate._id, totalHalalas: estimate.totalHalalas }
  }

  const LINES = [
    { description: 'Front brake pads', kind: 'part', qty: 1, unitPriceHalalas: 45_000 },
    { description: 'Labour, 2h', kind: 'labour', qty: 2, unitPriceHalalas: 15_000 },
  ]

  it('copies the approved estimate onto a draft invoice, lines and totals intact', async () => {
    const estimate = await approvedEstimate(LINES)
    const accountant = await harness.token('accountant')

    const raised = await post(`/estimates/${estimate.id}/invoice`, accountant, {
      dueDate: '2026-12-31',
    })
    expect(raised.statusCode, raised.body).toBe(201)
    const invoice = raised.json() as {
      _id: string
      id: string
      status: string
      estimateId: string
      totalHalalas: number
      subtotalHalalas: number
      taxHalalas: number
    }

    expect(invoice.status).toBe('draft')
    /* The link — the whole point of the join. */
    expect(invoice.estimateId).toBe(estimate.id)
    /* The figures are the ones that were approved, not re-typed ones. */
    expect(invoice.totalHalalas).toBe(estimate.totalHalalas)
    /* 45,000 + 2 × 15,000 = 75,000 net, 15% VAT = 11,250. */
    expect(invoice.subtotalHalalas).toBe(75_000)
    expect(invoice.taxHalalas).toBe(11_250)

    /* And the lines really travelled, in order, read back from Postgres. */
    const rows = await withAuthPlane(harness.handle.db, async (tx) =>
      tx
        .select()
        .from(invoiceLines)
        .where(and(eq(invoiceLines.invoiceId, invoice._id), isNull(invoiceLines.deletedAt)))
        .orderBy(invoiceLines.sort),
    )
    expect(rows).toHaveLength(2)
    expect(rows[0]!.description).toBe('Front brake pads')
    expect(rows[0]!.unitPriceHalalas).toBe(45_000)
    expect(rows[1]!.description).toBe('Labour, 2h')
    expect(rows[1]!.qty).toBe(2)
  })

  it('refuses an estimate that has not been approved', async () => {
    const advisor = await harness.token('advisor')
    const created = await post('/estimates', advisor, {
      customerName: 'Unapproved Customer',
      vehicleLabel: 'Nissan Patrol 2019',
      lines: LINES,
    })
    const draft = created.json() as { _id: string }

    const accountant = await harness.token('accountant')
    const refused = await post(`/estimates/${draft._id}/invoice`, accountant, {
      dueDate: '2026-12-31',
    })
    expect(refused.statusCode, refused.body).toBe(422)
    const body = refused.json() as { error: { code: string; message: string } }
    expect(body.error.code).toBe('rule_violated')
    expect(body.error.message).toMatch(/approved estimate/)

    /* Nothing was written. */
    const written = await withAuthPlane(harness.handle.db, async (tx) =>
      tx.select().from(invoices).where(eq(invoices.estimateId, draft._id)),
    )
    expect(written).toHaveLength(0)
  })

  it('invoices an estimate exactly once', async () => {
    const estimate = await approvedEstimate(LINES)
    const accountant = await harness.token('accountant')

    const first = await post(`/estimates/${estimate.id}/invoice`, accountant, {
      dueDate: '2026-12-31',
    })
    expect(first.statusCode, first.body).toBe(201)
    const invoiceCode = (first.json() as { id: string }).id

    const second = await post(`/estimates/${estimate.id}/invoice`, accountant, {
      dueDate: '2026-12-31',
    })
    expect(second.statusCode, second.body).toBe(409)
    /* The refusal names the invoice that already exists, so the caller can go
     * and look at it rather than guess. */
    expect((second.json() as { error: { message: string } }).error.message).toContain(invoiceCode)

    const all = await withAuthPlane(harness.handle.db, async (tx) =>
      tx
        .select()
        .from(invoices)
        .where(and(eq(invoices.estimateId, estimate.id), isNull(invoices.deletedAt))),
    )
    expect(all).toHaveLength(1)
  })

  it('refuses a caller who may read estimates but not create invoices', async () => {
    const estimate = await approvedEstimate(LINES)
    /* frontdesk holds `estimates:v` and `invoices:vc` — so it passes. parts
     * holds `estimates:v` and nothing on invoices, which is the refusal. */
    const parts = await harness.token('parts')
    const refused = await post(`/estimates/${estimate.id}/invoice`, parts, {
      dueDate: '2026-12-31',
    })
    expect(refused.statusCode).toBe(403)
  })

  it("404s an estimate belonging to another organization", async () => {
    const estimate = await approvedEstimate(LINES)
    const stranger = await harness.token('accountant', {
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
      sub: '01JCHAINSTRANGER000000001',
    })
    const response = await post(`/estimates/${estimate.id}/invoice`, stranger, {
      dueDate: '2026-12-31',
    })
    expect(response.statusCode).toBe(404)
  })

  it('requires a due date rather than inventing payment terms', async () => {
    const estimate = await approvedEstimate(LINES)
    const accountant = await harness.token('accountant')
    const refused = await post(`/estimates/${estimate.id}/invoice`, accountant, {})
    expect(refused.statusCode, refused.body).toBe(400)
    expect((refused.json() as { error: { field?: string } }).error.field).toBe('dueDate')
  })

  it('refuses to bill an estimate whose lines moved after it was approved', async () => {
    const estimate = await approvedEstimate(LINES)
    /* Reach past the API to change one line, which is the situation the check
     * exists for: the authorised amount and the billed amount would differ. */
    await withAuthPlane(harness.handle.db, async (tx) =>
      tx
        .update(estimates)
        .set({ totalHalalas: estimate.totalHalalas + 100_000 })
        .where(eq(estimates.id, estimate.id)),
    )

    const accountant = await harness.token('accountant')
    const refused = await post(`/estimates/${estimate.id}/invoice`, accountant, {
      dueDate: '2026-12-31',
    })
    expect(refused.statusCode, refused.body).toBe(409)
    expect((refused.json() as { error: { message: string } }).error.message).toMatch(/Re-approve/)
  })
})

/* ════════════════════════ join three: appointment → job card ════════════ */

describe('POST /appointments/:id/job-card', () => {
  /** A booking for tomorrow in a bay nothing else is using, so the bay-overlap
   *  rule in the appointment writer does not refuse the fixture. */
  let bay = 900
  async function booking(
    overrides: Record<string, unknown> = {},
  ): Promise<{ _id: string; plate: string }> {
    const frontdesk = await harness.token('frontdesk')
    bay += 1
    const created = await harness.app.inject({
      method: 'POST',
      url: `${API}/appointments`,
      ...json(frontdesk, {
        scheduledDate: '2026-11-04',
        timeLabel: '9:00 AM',
        startMinute: 540,
        durationMins: 60,
        customerName: 'Chain Test Customer',
        vehicleLabel: 'Toyota Camry 2021',
        plate: `CHN ${bay}`,
        serviceLabel: 'Full service — 40,000 km',
        bay: `Bay ${bay}`,
        ...overrides,
      }),
    })
    expect(created.statusCode, created.body).toBe(201)
    const row = created.json() as { _id: string }
    return { _id: row._id, plate: `CHN ${bay}` }
  }

  it('opens a job card carrying the appointment, the customer and the vehicle', async () => {
    const appointment = await booking()
    const manager = await harness.token('manager')

    const opened = await post(`/appointments/${appointment._id}/job-card`, manager, {
      service: 'maintenance',
    })
    expect(opened.statusCode, opened.body).toBe(201)
    const job = opened.json() as {
      _id: string
      id: string
      cust: string
      veh: string
      svc: string
      st: string
      stage: string
      appointmentId: string
    }

    /* The link. */
    expect(job.appointmentId).toBe(appointment._id)
    /* Copied from the appointment, not retyped by the caller. */
    expect(job.cust).toBe('Chain Test Customer')
    expect(job.veh).toBe('Toyota Camry 2021')
    /* The start of the stage machine, always — opening a job card is not a
     * transition and must not become a way to enter the workflow part-way. */
    expect(job.stage).toBe('checkin')
    expect(job.st).toBe('pending')
    expect(job.svc).toBe('maintenance')

    /* The appointment's own words are kept where a technician will read them,
     * since a free-text service label cannot be mapped into the job enum. */
    const [row] = await withAuthPlane(harness.handle.db, async (tx) =>
      tx.select().from(jobCards).where(eq(jobCards.id, job._id)),
    )
    expect(row!.complaint).toBe('Full service — 40,000 km')

    /* And the booking is closed out — the work is the job card's to track now. */
    const after = await get(`/appointments/${appointment._id}`, manager)
    expect((after.json() as { status: string }).status).toBe('completed')
  })

  it('refuses an appointment that was cancelled or a no-show', async () => {
    const manager = await harness.token('manager')
    for (const status of ['cancelled', 'no-show']) {
      const appointment = await booking({ status })
      const refused = await post(`/appointments/${appointment._id}/job-card`, manager, {
        service: 'repair',
      })
      expect(refused.statusCode, refused.body).toBe(422)
      expect((refused.json() as { error: { message: string } }).error.message).toContain('not kept')
    }
  })

  it('opens at most one job card per appointment', async () => {
    const appointment = await booking()
    const manager = await harness.token('manager')

    const first = await post(`/appointments/${appointment._id}/job-card`, manager, {
      service: 'repair',
    })
    expect(first.statusCode, first.body).toBe(201)
    const code = (first.json() as { id: string }).id

    const second = await post(`/appointments/${appointment._id}/job-card`, manager, {
      service: 'repair',
    })
    expect(second.statusCode, second.body).toBe(409)
    expect((second.json() as { error: { message: string } }).error.message).toContain(code)

    const all = await withAuthPlane(harness.handle.db, async (tx) =>
      tx
        .select()
        .from(jobCards)
        .where(and(eq(jobCards.appointmentId, appointment._id), isNull(jobCards.deletedAt))),
    )
    expect(all).toHaveLength(1)
  })

  it('requires the service kind, because an appointment cannot supply it', async () => {
    const appointment = await booking()
    const manager = await harness.token('manager')
    const refused = await post(`/appointments/${appointment._id}/job-card`, manager, {})
    expect(refused.statusCode, refused.body).toBe(400)
    expect((refused.json() as { error: { field?: string } }).error.field).toBe('service')
  })

  it('refuses a caller without job-card create', async () => {
    const appointment = await booking()
    /* callcenter holds `appointments:vced` but only `jobcards:v`. */
    const callcenter = await harness.token('callcenter')
    const refused = await post(`/appointments/${appointment._id}/job-card`, callcenter, {
      service: 'repair',
    })
    expect(refused.statusCode).toBe(403)
  })

  it("404s an appointment belonging to another organization", async () => {
    const appointment = await booking()
    const stranger = await harness.token('manager', {
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
      sub: '01JCHAINSTRANGER000000002',
    })
    const response = await post(`/appointments/${appointment._id}/job-card`, stranger, {
      service: 'repair',
    })
    expect(response.statusCode).toBe(404)
  })
})
