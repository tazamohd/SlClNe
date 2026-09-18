/** F-029 (3) / DF-005 — the unified approval queue.
 *
 *  `GET /approvals` aggregates pending approvals into one shape the
 *  ApprovalInbox reads. It carries four sources — estimates (`sent`),
 *  requisitions (`submitted`), purchase orders (`draft`) and insurance claims
 *  (`submitted`/`under_review`) — which are exactly the documents with a
 *  ceiling-gated approve endpoint behind them. Each row carries its amount and
 *  module so the client's `canApprove` reads honestly, the caller's standing
 *  computed server-side so the gate on the row is the gate the server would
 *  enforce (F-002), and the endpoint that decides *that* row so a mixed queue
 *  cannot post a requisition to `/estimates/:id/approve`. Permission-gated on
 *  `approvals:v` with a per-source view gate; tenant-scoped by RLS.
 *
 *  Payroll runs are deliberately absent: posting a run is gated on `hr:e` as an
 *  edit, not on a ceiling, so there is no approval standing to report. The test
 *  at the bottom pins that absence so it is a decision, not an oversight.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { RoleId } from '@salis/contract'
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
  entityId: string
  reference: string
  title: string
  party: string
  subject: string
  amountHalalas: number
  status: string
  approvePath: string
  rejectPath: string | null
  submittedBy: string | null
  approval: { canApprove: boolean; ceilingHalalas: number | null; withinCeiling: boolean; isSubmitter: boolean }
}
type Roll = Record<string, { count: number; totalHalalas: number }>
interface Queue {
  rows: ApprovalRow[]
  summary: { count: number; pendingHalalas: number; byModule: Roll; byKind: Roll }
}

const json = (token: string, body?: unknown) => ({
  headers: {
    authorization: `Bearer ${token}`,
    ...(body === undefined ? {} : { 'content-type': 'application/json' }),
  },
  ...(body === undefined ? {} : { payload: body as object }),
})

function post(url: string, token: string, body?: unknown) {
  return harness.app.inject({ method: 'POST', url: `/api/v1${url}`, ...json(token, body ?? {}) })
}

async function queueFor(role: RoleId): Promise<Queue> {
  const token = await harness.token(role)
  const response = await get('/approvals', token)
  expect(response.statusCode, response.body).toBe(200)
  return response.json() as Queue
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

/* ------------------------------------------------- DF-005: the other sources */

describe('GET /approvals carries every source with a ceiling-gated approve route', () => {
  /** Raises the three non-estimate documents as the owner, so the *manager* is
   *  never their submitter and the segregation-of-duties half of `canApprove`
   *  does not mask the authority half. Returns their references. */
  async function raisePending(): Promise<{
    requisition: string
    purchaseOrder: string
    claim: string
    claimHalalas: number
  }> {
    const owner = await harness.token('owner')

    const req = await post('/procurement/requisitions', owner, {
      requesterName: 'Bay 3',
      department: 'Workshop',
      lines: [{ description: 'Brake fluid, 5L', qty: 4, estUnitPriceHalalas: 12_500 }],
    })
    expect(req.statusCode, req.body).toBe(201)
    const requisition = req.json() as { _id: string; code: string }
    /* Only a *submitted* requisition is awaiting a decision. */
    const submit = await post(`/procurement/requisitions/${requisition._id}/submit`, owner)
    expect(submit.statusCode, submit.body).toBe(200)

    const po = await post('/procurement/purchase-orders', owner, {
      supplierName: 'Gulf Parts Co.',
      lines: [{ description: 'Timing belt kit', qty: 2, unitPriceHalalas: 48_000 }],
    })
    expect(po.statusCode, po.body).toBe(201)
    const purchaseOrder = po.json() as { code: string }

    /* The claim needs a policy that exists in this tenant; accounting:c is the
     * accountant's, so it is raised by them — again, not the manager. */
    const accountant = await harness.token('accountant')
    const policies = await get('/insurance-policies?pageSize=1', accountant)
    const policyId = (policies.json() as { rows: { _id: string }[] }).rows[0]!._id
    const claimHalalas = 700_000
    const claim = await post('/insurance-claims', accountant, {
      policyId,
      amountClaimedHalalas: claimHalalas,
      incidentDate: '2026-07-15',
      description: 'Rear-quarter panel damage.',
    })
    expect(claim.statusCode, claim.body).toBe(201)
    const claimRow = claim.json() as { claimNumber: string }

    return {
      requisition: requisition.code,
      purchaseOrder: purchaseOrder.code,
      claim: claimRow.claimNumber,
      claimHalalas,
    }
  }

  it('shows a submitted requisition, a draft purchase order and a submitted claim beside the estimate', async () => {
    const raised = await raisePending()
    const queue = await queueFor('accountant')

    /* The accountant holds view on estimates, procurement and accounting, so
     * all four sources are in reach of one read. */
    const req = queue.rows.find((row) => row.reference === raised.requisition)
    const po = queue.rows.find((row) => row.reference === raised.purchaseOrder)
    const claim = queue.rows.find((row) => row.reference === raised.claim)
    const est = queue.rows.find((row) => row.reference === 'EST-0230')

    expect(req?.kind).toBe('requisition')
    expect(req?.module).toBe('procurement')
    expect(req?.status).toBe('submitted')
    /* 4 × SAR 125.00, summed by the server from the lines. */
    expect(req?.amountHalalas).toBe(50_000)
    expect(req?.party).toBe('Bay 3')
    expect(req?.subject).toBe('Workshop')

    expect(po?.kind).toBe('purchase_order')
    expect(po?.module).toBe('procurement')
    expect(po?.status).toBe('draft')
    expect(po?.party).toBe('Gulf Parts Co.')

    expect(claim?.kind).toBe('insurance_claim')
    expect(claim?.module).toBe('accounting')
    expect(claim?.amountHalalas).toBe(raised.claimHalalas)

    expect(est?.kind).toBe('estimate')
  })

  it('names the endpoint that decides each row, and null where no reject route exists', async () => {
    const raised = await raisePending()
    const queue = await queueFor('accountant')

    const req = queue.rows.find((row) => row.reference === raised.requisition)!
    const po = queue.rows.find((row) => row.reference === raised.purchaseOrder)!
    const claim = queue.rows.find((row) => row.reference === raised.claim)!
    const est = queue.rows.find((row) => row.reference === 'EST-0230')!

    expect(req.approvePath).toBe(`procurement/requisitions/${req.entityId}/approve`)
    expect(req.rejectPath).toBe(`procurement/requisitions/${req.entityId}/reject`)
    expect(po.approvePath).toBe(`procurement/purchase-orders/${po.entityId}/approve`)
    /* A purchase order has no reject route — it is edited or left unapproved.
     * Reporting null keeps the inbox from offering a button that would 404. */
    expect(po.rejectPath).toBeNull()
    expect(claim.approvePath).toBe(`insurance-claims/${claim.entityId}/approve`)
    expect(claim.rejectPath).toBe(`insurance-claims/${claim.entityId}/reject`)
    expect(est.approvePath).toBe(`estimates/${est.entityId}/approve`)
  })

  it('the path a row names is the path that actually approves it', async () => {
    const raised = await raisePending()
    const queue = await queueFor('manager')
    const req = queue.rows.find((row) => row.reference === raised.requisition)!
    expect(req.approval.canApprove).toBe(true)

    const manager = await harness.token('manager')
    const approved = await post(`/${req.approvePath}`, manager, {})
    expect(approved.statusCode, approved.body).toBe(200)
    expect((approved.json() as { status: string }).status).toBe('approved')

    /* And a decided document drops out of the queue. */
    const after = await queueFor('manager')
    expect(after.rows.some((row) => row.reference === raised.requisition)).toBe(false)
  })

  it('withholds a source the caller cannot view, without withholding the queue', async () => {
    const raised = await raisePending()
    /* advisor: approvals `va`, estimates `vce`, procurement `''`, accounting
     * `''`. They see the queue and its estimates, and no procurement or
     * accounting row leaks through the `approvals:v` gate. */
    const queue = await queueFor('advisor')
    expect(queue.rows.some((row) => row.reference === 'EST-0230')).toBe(true)
    expect(queue.rows.some((row) => row.reference === raised.requisition)).toBe(false)
    expect(queue.rows.some((row) => row.reference === raised.purchaseOrder)).toBe(false)
    expect(queue.rows.some((row) => row.reference === raised.claim)).toBe(false)
    expect(queue.summary.byModule.procurement).toBeUndefined()
    expect(queue.summary.byModule.accounting).toBeUndefined()
  })

  it("answers the caller's standing per module, not per queue", async () => {
    const raised = await raisePending()
    /* manager: procurement `vcax` (may approve) but accounting `vx` (may see a
     * claim, may not approve it). One read, two honest answers. */
    const queue = await queueFor('manager')
    const po = queue.rows.find((row) => row.reference === raised.purchaseOrder)!
    const claim = queue.rows.find((row) => row.reference === raised.claim)!

    expect(po.approval.canApprove).toBe(true)
    expect(po.approval.withinCeiling).toBe(true)
    expect(claim.approval.canApprove).toBe(false)
    /* Not the ceiling refusing — SAR 7,000 is well inside SAR 50,000. The
     * manager simply holds no `accounting:a`. */
    expect(claim.approval.withinCeiling).toBe(true)
    expect(claim.approval.isSubmitter).toBe(false)
  })

  it('refuses to let the raiser approve their own requisition', async () => {
    const owner = await harness.token('owner')
    const req = await post('/procurement/requisitions', owner, {
      requesterName: 'Bay 7',
      lines: [{ description: 'Air filter', qty: 1, estUnitPriceHalalas: 9_000 }],
    })
    const row = req.json() as { _id: string }
    await post(`/procurement/requisitions/${row._id}/submit`, owner)

    const queue = await queueFor('owner')
    const mine = queue.rows.find((r) => r.entityId === row._id)!
    expect(mine.approval.isSubmitter).toBe(true)
    /* The owner holds `procurement:a` and has no ceiling, and still may not
     * approve — the F-004 submitter half wins over both. */
    expect(mine.approval.withinCeiling).toBe(true)
    expect(mine.approval.canApprove).toBe(false)
  })

  it('rolls up by kind as well as by module, because two kinds share one module', async () => {
    const raised = await raisePending()
    const queue = await queueFor('accountant')

    const reqs = queue.rows.filter((row) => row.kind === 'requisition')
    const pos = queue.rows.filter((row) => row.kind === 'purchase_order')
    expect(reqs.length).toBeGreaterThan(0)
    expect(pos.length).toBeGreaterThan(0)
    expect(queue.summary.byKind.requisition?.count).toBe(reqs.length)
    expect(queue.summary.byKind.purchase_order?.count).toBe(pos.length)
    /* Both land in the one procurement bucket, which is exactly why `byKind`
     * exists beside it. */
    expect(queue.summary.byModule.procurement?.count).toBe(reqs.length + pos.length)
    expect(queue.summary.count).toBe(queue.rows.length)
    expect(queue.summary.pendingHalalas).toBe(
      queue.rows.reduce((sum, row) => sum + row.amountHalalas, 0),
    )
    expect(queue.rows.some((row) => row.reference === raised.claim)).toBe(true)
  })

  it('carries no payroll row, because posting a run is not an approval', async () => {
    /* `POST /payroll/runs/:id/post` is gated on `hr:e` and moves a draft run to
     * posted; there is no ceiling and no approve route. The hr role holds
     * `approvals:va` and `hr:vcedax`, so if payroll were a source it would show
     * here. It must not — an unactionable row carrying a fabricated approval
     * standing is worse than an absent one. */
    const queue = await queueFor('hr')
    expect(queue.rows.every((row) => row.kind !== 'payroll_run')).toBe(true)
    expect(queue.summary.byModule.hr).toBeUndefined()
  })
})
