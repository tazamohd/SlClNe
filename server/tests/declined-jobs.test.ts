/** Declined Job Tracking & Follow-Up (Sprint 1, P0).
 *
 *  Covers the whole loop: a line is declined off a real estimate, the record
 *  it creates carries the right money and reason, a second decline of the
 *  same line is refused, a whole-estimate rejection fans out one row per
 *  remaining line, the follow-up lifecycle moves through the generic
 *  collection's `PATCH` with `resolvedAt` server-derived from `status`, the
 *  collection's `POST` is refused (creation is only ever an estimate action),
 *  tenant isolation holds, and the reporting aggregate sums correctly.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startHarness, type Harness } from './harness'

let harness: Harness

beforeAll(async () => {
  harness = await startHarness()
}, 120_000)

afterAll(async () => {
  await harness?.close()
})

async function api(
  method: 'GET' | 'POST' | 'PATCH',
  url: string,
  bearer: string,
  payload?: unknown,
  version?: number,
) {
  return await harness.app.inject({
    method,
    url: `/api/v1${url}`,
    headers: {
      authorization: `Bearer ${bearer}`,
      'content-type': 'application/json',
      ...(version !== undefined ? { 'if-match-version': String(version) } : {}),
    },
    payload: payload as object | undefined,
  })
}

async function seedEstimate(bearer: string) {
  const created = await api('POST', '/estimates', bearer, {
    customerName: 'Declined Job Test Customer',
    vehicleLabel: 'Nissan Altima 2022',
    lines: [
      { description: 'Brake pad replacement', kind: 'labour', qty: 1, unitPriceHalalas: 25_000 },
      { description: 'Cabin air filter', kind: 'part', qty: 1, unitPriceHalalas: 8_000 },
    ],
  })
  expect(created.statusCode, created.body).toBe(201)
  const estimate = created.json() as { _id: string }
  const linesResponse = await api('GET', `/estimates/${estimate._id}/lines`, bearer)
  const { rows } = linesResponse.json() as { rows: { id: string; description: string }[] }
  return { estimate, lines: rows }
}

describe('declining an estimate line', () => {
  it('creates a tracked declined job carrying the line value and reason', async () => {
    const advisor = await harness.token('advisor')
    const manager = await harness.token('manager')
    const { estimate, lines } = await seedEstimate(advisor)
    const brakePads = lines.find((l) => l.description === 'Brake pad replacement')!

    const declined = await api('POST', `/estimates/${estimate._id}/lines/${brakePads.id}/decline`, manager, {
      reasonCategory: 'cost',
      reasonNotes: 'Customer wants a second opinion first.',
      safetySeverity: 'attention',
      followUpDate: '2026-10-01',
    })
    expect(declined.statusCode, declined.body).toBe(201)
    const row = declined.json() as {
      _id: string
      estimateId: string
      estimateLineId: string
      description: string
      value: string
      valueHalalas: number
      reasonCategory: string
      safetySeverity: string
      status: string
      followUpDate: string
    }
    expect(row.estimateId).toBe(estimate._id)
    expect(row.estimateLineId).toBe(brakePads.id)
    expect(row.description).toBe('Brake pad replacement')
    expect(row.valueHalalas).toBe(25_000)
    expect(row.reasonCategory).toBe('cost')
    expect(row.safetySeverity).toBe('attention')
    expect(row.status).toBe('declined')
    expect(row.followUpDate).toBe('2026-10-01')
  })

  it('refuses a second decline of the same line while the first is still active', async () => {
    const advisor = await harness.token('advisor')
    const manager = await harness.token('manager')
    const { estimate, lines } = await seedEstimate(advisor)
    const line = lines[0]!

    const first = await api('POST', `/estimates/${estimate._id}/lines/${line.id}/decline`, manager, {})
    expect(first.statusCode, first.body).toBe(201)

    const second = await api('POST', `/estimates/${estimate._id}/lines/${line.id}/decline`, manager, {})
    expect(second.statusCode).toBe(409)
  })

  it("advisor — who lacks estimates:a — cannot decline a line", async () => {
    const advisor = await harness.token('advisor')
    const { estimate, lines } = await seedEstimate(advisor)
    const response = await api('POST', `/estimates/${estimate._id}/lines/${lines[0]!.id}/decline`, advisor, {})
    expect(response.statusCode).toBe(403)
  })

  it('refuses a line id that does not belong to the estimate', async () => {
    const advisor = await harness.token('advisor')
    const manager = await harness.token('manager')
    const a = await seedEstimate(advisor)
    const b = await seedEstimate(advisor)
    const response = await api('POST', `/estimates/${a.estimate._id}/lines/${b.lines[0]!.id}/decline`, manager, {})
    expect(response.statusCode).toBe(404)
  })
})

describe('rejecting a whole estimate fans out one declined job per line', () => {
  it('declines every line, skipping one already tracked', async () => {
    const advisor = await harness.token('advisor')
    const manager = await harness.token('manager')
    const { estimate, lines } = await seedEstimate(advisor)

    const preDeclined = await api('POST', `/estimates/${estimate._id}/lines/${lines[0]!.id}/decline`, manager, {
      reasonCategory: 'timing',
    })
    expect(preDeclined.statusCode, preDeclined.body).toBe(201)
    const preDeclinedId = (preDeclined.json() as { _id: string })._id

    const rejected = await api('POST', `/estimates/${estimate._id}/reject`, manager, {
      reason: 'Customer declined the whole job at pickup.',
    })
    expect(rejected.statusCode, rejected.body).toBe(200)

    const list = await api('GET', `/declined-jobs?filter[estimateId]=${estimate._id}&pageSize=50`, manager)
    const { rows } = list.json() as { rows: { _id: string; estimateLineId: string; reasonCategory: string }[] }
    expect(rows).toHaveLength(2)
    // The pre-declined line keeps its own reason rather than being duplicated
    // or overwritten by the rejection fan-out.
    const kept = rows.find((r) => r._id === preDeclinedId)
    expect(kept?.reasonCategory).toBe('timing')
    const fannedOut = rows.find((r) => r.estimateLineId === lines[1]!.id)
    expect(fannedOut?.reasonCategory).toBe('other')
  })
})

describe('the follow-up lifecycle', () => {
  it('moves through PATCH and derives resolvedAt from status', async () => {
    const advisor = await harness.token('advisor')
    const manager = await harness.token('manager')
    const { estimate, lines } = await seedEstimate(advisor)
    const created = await api('POST', `/estimates/${estimate._id}/lines/${lines[0]!.id}/decline`, manager, {})
    const id = (created.json() as { _id: string; _version: number })._id
    const version = (created.json() as { _version: number })._version

    const scheduled = await api(
      'PATCH',
      `/declined-jobs/${id}`,
      manager,
      { status: 'follow_up_scheduled', followUpDate: '2026-11-01' },
      version,
    )
    expect(scheduled.statusCode, scheduled.body).toBe(200)
    const scheduledRow = scheduled.json() as { status: string; resolvedAt: string | null; _version: number }
    expect(scheduledRow.status).toBe('follow_up_scheduled')
    expect(scheduledRow.resolvedAt).toBeNull()

    const approved = await api(
      'PATCH',
      `/declined-jobs/${id}`,
      manager,
      { status: 'approved_later' },
      scheduledRow._version,
    )
    expect(approved.statusCode, approved.body).toBe(200)
    const approvedRow = approved.json() as { status: string; resolvedAt: string | null; _version: number }
    expect(approvedRow.status).toBe('approved_later')
    expect(approvedRow.resolvedAt).not.toBeNull()

    /* Reopened — a customer who "approved later" changes their mind again —
     * clears the stale resolution rather than leaving it dangling. */
    const reopened = await api(
      'PATCH',
      `/declined-jobs/${id}`,
      manager,
      { status: 'reconsidering' },
      approvedRow._version,
    )
    expect(reopened.statusCode, reopened.body).toBe(200)
    expect((reopened.json() as { resolvedAt: string | null }).resolvedAt).toBeNull()
  })

  it('cannot be created directly through the generic collection route', async () => {
    const manager = await harness.token('manager')
    const response = await api('POST', '/declined-jobs', manager, {
      estimateId: '01JFAKE0000000000000000001',
      customerName: 'Direct Create Attempt',
      vehicleLabel: 'N/A',
      description: 'Should never be accepted',
    })
    expect(response.statusCode).toBe(400)
  })
})

describe('tenant isolation', () => {
  it("does not serve another organization's declined job", async () => {
    const advisor = await harness.token('advisor')
    const manager = await harness.token('manager')
    const { estimate, lines } = await seedEstimate(advisor)
    const created = await api('POST', `/estimates/${estimate._id}/lines/${lines[0]!.id}/decline`, manager, {})
    const id = (created.json() as { _id: string })._id

    const stranger = await harness.token('manager', { orgId: '01JBBBBBBBBBBBBBBBBBBBBBB2' })
    const response = await api('GET', `/declined-jobs/${id}`, stranger)
    expect(response.statusCode).toBe(404)
  })

  it('a customer-scoped principal sees none of it, even with estimates:v', async () => {
    const advisor = await harness.token('advisor')
    const manager = await harness.token('manager')
    const { estimate, lines } = await seedEstimate(advisor)
    await api('POST', `/estimates/${estimate._id}/lines/${lines[0]!.id}/decline`, manager, {})

    const customer = await harness.token('customer')
    const response = await api('GET', '/declined-jobs?pageSize=50', customer)
    expect(response.statusCode, response.body).toBe(200)
    expect((response.json() as { rows: unknown[] }).rows).toHaveLength(0)
  })
})

describe('GET /reports/declined-jobs', () => {
  it('sums lost and recovered revenue server-side', async () => {
    const advisor = await harness.token('advisor')
    const manager = await harness.token('manager')
    const { estimate, lines } = await seedEstimate(advisor)

    const declinedA = await api('POST', `/estimates/${estimate._id}/lines/${lines[0]!.id}/decline`, manager, {
      reasonCategory: 'cost',
    })
    const declinedB = await api('POST', `/estimates/${estimate._id}/lines/${lines[1]!.id}/decline`, manager, {
      reasonCategory: 'timing',
    })
    const idB = (declinedB.json() as { _id: string; _version: number })._id
    const versionB = (declinedB.json() as { _version: number })._version
    expect(declinedA.statusCode).toBe(201)

    const patched = await api('PATCH', `/declined-jobs/${idB}`, manager, { status: 'approved_later' }, versionB)
    expect(patched.statusCode, patched.body).toBe(200)

    const report = await api('GET', '/reports/declined-jobs', manager)
    expect(report.statusCode, report.body).toBe(200)
    const body = report.json() as {
      lostRevenueHalalas: number
      recoveredRevenueHalalas: number
      openCount: number
      resolvedCount: number
      byReason: { reason: string; count: number; valueHalalas: number }[]
    }
    /* At least the two rows this test just created — other suites' data may
     * also be present since reports sum the whole seeded tenant, so these are
     * lower-bound checks, not exact totals. */
    expect(body.lostRevenueHalalas).toBeGreaterThanOrEqual(25_000)
    expect(body.recoveredRevenueHalalas).toBeGreaterThanOrEqual(8_000)
    expect(body.openCount).toBeGreaterThanOrEqual(1)
    expect(body.resolvedCount).toBeGreaterThanOrEqual(1)
    expect(body.byReason.length).toBeGreaterThan(0)
  })
})
