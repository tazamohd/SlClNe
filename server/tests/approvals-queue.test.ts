/** F-029 (3) — the unified approval queue.
 *
 *  `GET /approvals` aggregates pending approvals into one shape the
 *  ApprovalInbox reads. It starts with estimates (the `sent` state), carries
 *  each row's amount and module so the client's `canApprove` reads honestly,
 *  and computes the caller's standing server-side so the gate on the row is the
 *  gate the server would enforce (F-002). Permission-gated on `approvals:v`;
 *  tenant-scoped by RLS.
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

function get(url: string, bearer: string) {
  return harness.app.inject({
    method: 'GET',
    url: `/api/v1${url}`,
    headers: { authorization: `Bearer ${bearer}` },
  })
}

interface ApprovalRow {
  kind: string
  module: string
  reference: string
  amountHalalas: number
  submittedBy: string | null
  approval: { canApprove: boolean; ceilingHalalas: number | null; withinCeiling: boolean; isSubmitter: boolean }
}
interface Queue {
  rows: ApprovalRow[]
  summary: { count: number; pendingHalalas: number; byModule: Record<string, { count: number; totalHalalas: number }> }
}

describe('GET /approvals', () => {
  it('returns the seeded pending estimate with its amount and module', async () => {
    const manager = await harness.token('manager')
    const response = await get('/approvals', manager)
    expect(response.statusCode, response.body).toBe(200)
    const queue = response.json() as Queue
    /* EST-0230 is the one seeded estimate in the `sent` state, SAR 3,600. */
    const est = queue.rows.find((row) => row.reference === 'EST-0230')
    expect(est).toBeDefined()
    expect(est?.kind).toBe('estimate')
    expect(est?.module).toBe('estimates')
    expect(est?.amountHalalas).toBe(360000)
    expect(queue.summary.count).toBe(queue.rows.length)
    expect(queue.summary.pendingHalalas).toBe(
      queue.rows.reduce((sum, row) => sum + row.amountHalalas, 0),
    )
    expect(queue.summary.byModule.estimates?.count).toBe(
      queue.rows.filter((row) => row.module === 'estimates').length,
    )
  })

  it('says a manager may approve the SAR 3,600 estimate (within a SAR 50,000 ceiling, not the submitter)', async () => {
    const manager = await harness.token('manager')
    const est = (get('/approvals', manager))
    const queue = (await est).json() as Queue
    const row = queue.rows.find((r) => r.reference === 'EST-0230')
    expect(row?.approval.isSubmitter).toBe(false)
    expect(row?.approval.withinCeiling).toBe(true)
    expect(row?.approval.canApprove).toBe(true)
    expect(row?.approval.ceilingHalalas).toBe(5_000_000)
  })

  it('shows the row to an advisor but says they may not approve it (no approve authority)', async () => {
    /* advisor holds estimates:v (so sees the row) but only `vce` — no `a` — so
     * the queue's own gate says canApprove:false, matching what the server
     * would enforce. */
    const advisor = await harness.token('advisor')
    const queue = (await get('/approvals', advisor)).json() as Queue
    const row = queue.rows.find((r) => r.reference === 'EST-0230')
    expect(row).toBeDefined()
    expect(row?.approval.canApprove).toBe(false)
  })

  it('refuses a role without view on approvals (403)', async () => {
    // technician holds no approvals grant.
    const tech = await harness.token('technician', { sub: '01JAPPROVALSTECH000000001' })
    const response = await get('/approvals', tech)
    expect(response.statusCode).toBe(403)
  })

  it("does not surface another organization's pending estimates", async () => {
    const stranger = await harness.token('manager', { orgId: '01JBBBBBBBBBBBBBBBBBBBBBB2' })
    const queue = (await get('/approvals', stranger)).json() as Queue
    expect(queue.rows.some((row) => row.reference === 'EST-0230')).toBe(false)
  })
})
