/** Vertical A — insurance and loans (financial products).
 *
 *  Four collections (insurance policies + claims, loan contracts + repayments),
 *  all tenant-scoped by RLS and read-only through the generic router; the claim
 *  lifecycle (submit/approve/reject/pay) is the bespoke router, gated on the
 *  ceiling and segregation of duties like the estimate. This proves the
 *  isolation, the lifecycle controls, the seed coherence, and — first — that the
 *  loan amortisation is integer-safe.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import {
  amortisedInstalmentHalalas,
  buildRepaymentPlan,
  monthlyInterestHalalas,
} from '@salis/contract/rules'
import { insuranceClaims, insurancePolicies } from '../src/db/schema'
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

/* ------------------------------------------------------------- loan maths */

describe('loan amortisation is integer-safe', () => {
  const cases = [
    { principal: 6_000_000, rateBps: 600, term: 12 },
    { principal: 12_000_000, rateBps: 720, term: 24 },
    { principal: 5_000_000, rateBps: 0, term: 10 }, // zero-rate
    { principal: 999_999, rateBps: 1337, term: 7 }, // awkward figures
  ]

  for (const c of cases) {
    it(`${c.principal} @ ${c.rateBps}bps over ${c.term}m: whole halalas, schedule ties`, () => {
      const instalment = amortisedInstalmentHalalas(c.principal, c.rateBps, c.term)
      expect(Number.isInteger(instalment)).toBe(true)
      expect(instalment).toBeGreaterThan(0)

      const plan = buildRepaymentPlan(c.principal, c.rateBps, c.term, instalment)
      expect(plan).toHaveLength(c.term)

      let totalInterest = 0
      let totalDue = 0
      let totalPrincipal = 0
      for (const entry of plan) {
        expect(Number.isInteger(entry.amountDueHalalas)).toBe(true)
        expect(Number.isInteger(entry.interestHalalas)).toBe(true)
        expect(Number.isInteger(entry.principalHalalas)).toBe(true)
        expect(entry.amountDueHalalas).toBe(entry.interestHalalas + entry.principalHalalas)
        totalInterest += entry.interestHalalas
        totalDue += entry.amountDueHalalas
        totalPrincipal += entry.principalHalalas
      }

      /* The schedule collects exactly the principal plus the interest it charged,
       * and clears the balance to zero — no drift, no fractional halala. */
      expect(totalPrincipal).toBe(c.principal)
      expect(totalDue).toBe(c.principal + totalInterest)
      expect(plan[plan.length - 1]!.balanceAfterHalalas).toBe(0)
    })
  }

  it('zero-rate charges no interest', () => {
    const plan = buildRepaymentPlan(5_000_000, 0, 10)
    expect(plan.every((e) => e.interestHalalas === 0)).toBe(true)
    expect(plan.reduce((s, e) => s + e.amountDueHalalas, 0)).toBe(5_000_000)
  })

  it('computes one month of interest as an integer half-up', () => {
    // 6,000,000 halalas at 600bps annual → 0.5%/month → 30,000 halalas.
    expect(monthlyInterestHalalas(6_000_000, 600)).toBe(30_000)
  })
})

/* ------------------------------------------------------ seeded collections */

describe('the seeded financial-product collections', () => {
  it('serves the coherent policies, claims, contracts and repayments to accounting', async () => {
    const accountant = await harness.token('accountant')
    const totals = async (path: string) => {
      const res = await harness.app.inject({ method: 'GET', url: `/api/v1/${path}?pageSize=100`, ...json(accountant) })
      expect(res.statusCode, res.body).toBe(200)
      return res.json() as { rows: Record<string, unknown>[]; page: { total: number } }
    }
    expect((await totals('insurance-policies')).page.total).toBe(3)
    expect((await totals('insurance-claims')).page.total).toBe(2)
    expect((await totals('loan-contracts')).page.total).toBe(2)
    expect((await totals('loan-repayments')).page.total).toBe(36)
  })

  it('refuses a role without the accounting view grant', async () => {
    const technician = await harness.token('technician')
    for (const path of ['insurance-policies', 'insurance-claims', 'loan-contracts', 'loan-repayments']) {
      const res = await harness.app.inject({ method: 'GET', url: `/api/v1/${path}`, ...json(technician) })
      expect(res.statusCode, path).toBe(403)
    }
  })

  it('gives every claim a policy that exists (coherence)', async () => {
    const rows = await query<{ claim: string; policy: string | null }>(sql`
      select c.claim_number as claim, p.id as policy
      from insurance_claims c left join insurance_policies p on p.id = c.policy_id
      where c.org_id = ${SEED.orgId}
    `)
    expect(rows.length).toBe(2)
    for (const r of rows) expect(r.policy, `claim ${r.claim} has no policy`).toBeTruthy()
  })

  it('gives each contract a full schedule whose amounts amortise the principal', async () => {
    const contracts = await query<{
      id: string
      number: string
      principal: string
      term: number
      instalment: string
    }>(sql`
      select id, contract_number as number, principal_halalas::text as principal,
             term_months as term, monthly_instalment_halalas::text as instalment
      from loan_contracts where org_id = ${SEED.orgId} order by contract_number
    `)
    expect(contracts.length).toBe(2)

    for (const contract of contracts) {
      const [agg] = await query<{ n: number; due: string }>(sql`
        select count(*)::int as n, coalesce(sum(amount_due_halalas),0)::text as due
        from loan_repayments
        where org_id = ${SEED.orgId} and loan_contract_id = ${contract.id}
      `)
      expect(agg!.n, contract.number).toBe(contract.term)

      const principal = Number(contract.principal)
      const [terms] = await query<{ rate: number }>(sql`
        select rate_bps as rate from loan_contracts where id = ${contract.id}
      `)
      // The recorded instalment matches a fresh amortisation of the stored terms.
      expect(Number(contract.instalment)).toBe(
        amortisedInstalmentHalalas(principal, terms!.rate, contract.term),
      )
      const plan = buildRepaymentPlan(principal, terms!.rate, contract.term, Number(contract.instalment))
      const planDue = plan.reduce((s, e) => s + e.amountDueHalalas, 0)
      expect(Number(agg!.due), `${contract.number} scheduled total`).toBe(planDue)
      // And that total is principal plus the interest the schedule charges.
      const interest = plan.reduce((s, e) => s + e.interestHalalas, 0)
      expect(Number(agg!.due)).toBe(principal + interest)
    }
  })
})

/* ------------------------------------------------------- product reports */

describe('the financial-product aggregates', () => {
  it('summarises claims by status and loans outstanding, in SQL over the tenant', async () => {
    const accountant = await harness.token('accountant')
    const claims = await harness.app.inject({ method: 'GET', url: '/api/v1/insurance/claims/summary', ...json(accountant) })
    expect(claims.statusCode, claims.body).toBe(200)
    const cs = claims.json() as { count: number; claimedHalalas: number; byStatus: unknown[] }
    expect(cs.count).toBe(2)
    // 500,000 + 1,200,000 claimed across the two seeded claims.
    expect(cs.claimedHalalas).toBe(1_700_000)
    expect(Array.isArray(cs.byStatus)).toBe(true)

    const loans = await harness.app.inject({ method: 'GET', url: '/api/v1/loans/summary', ...json(accountant) })
    expect(loans.statusCode, loans.body).toBe(200)
    const ls = loans.json() as { contractCount: number; principalHalalas: number; outstandingHalalas: number }
    expect(ls.contractCount).toBe(2)
    expect(ls.principalHalalas).toBe(18_000_000) // 6,000,000 + 12,000,000
    // Some instalments are paid in the seed, so outstanding is below the scheduled total.
    expect(ls.outstandingHalalas).toBeGreaterThan(0)
  })

  it('refuses the aggregates to a role without accounting view', async () => {
    const technician = await harness.token('technician')
    const res = await harness.app.inject({ method: 'GET', url: '/api/v1/loans/summary', ...json(technician) })
    expect(res.statusCode).toBe(403)
  })
})

/* ------------------------------------------------------- claim lifecycle */

describe('the insurance-claim lifecycle', () => {
  async function firstPolicyId(token: string): Promise<string> {
    const res = await harness.app.inject({ method: 'GET', url: '/api/v1/insurance-policies?pageSize=1', ...json(token) })
    return (res.json() as { rows: { _id: string }[] }).rows[0]!._id
  }

  it('submits, refuses self-approval (SOD), approves via a different approver, then pays', async () => {
    const accountant = await harness.token('accountant')
    const policyId = await firstPolicyId(accountant)

    const submitted = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/insurance-claims',
      ...json(accountant, {
        policyId,
        amountClaimedHalalas: 700_000,
        incidentDate: '2026-07-15',
        description: 'Rear-quarter panel damage.',
      }),
    })
    expect(submitted.statusCode, submitted.body).toBe(201)
    const claim = submitted.json() as { _id: string; status: string; claimNumber: string }
    expect(claim.status).toBe('submitted')
    expect(claim.claimNumber).toMatch(/^INS-CLM-/)

    /* Segregation of duties: the accountant who submitted may not approve. */
    const selfApprove = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/insurance-claims/${claim._id}/approve`,
      ...json(accountant, {}),
    })
    expect(selfApprove.statusCode).toBe(403)

    /* Owner holds accounting `a` and an unlimited ceiling — a different approver. */
    const owner = await harness.token('owner')
    const approved = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/insurance-claims/${claim._id}/approve`,
      ...json(owner, { approvedAmountHalalas: 600_000 }),
    })
    expect(approved.statusCode, approved.body).toBe(200)
    const approvedRow = approved.json() as { status: string; amountApprovedHalalas: number }
    expect(approvedRow.status).toBe('approved')
    expect(approvedRow.amountApprovedHalalas).toBe(600_000)

    /* Paying settles an approved claim; accounting `e`, which the accountant holds. */
    const paid = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/insurance-claims/${claim._id}/pay`,
      ...json(accountant, {}),
    })
    expect(paid.statusCode, paid.body).toBe(200)
    expect((paid.json() as { status: string }).status).toBe('paid')

    /* The lifecycle is audited: submit + approve + pay each wrote a row. */
    const audits = await query<{ action: string }>(sql`
      select action from audit_log
      where org_id = ${SEED.orgId} and entity = 'insurance_claim' and entity_id = ${claim._id}
      order by ts
    `)
    expect(audits.map((a) => a.action)).toEqual(['create', 'approve', 'transition'])
  })

  it('refuses an approval above the role ceiling', async () => {
    const accountant = await harness.token('accountant')
    const policyId = await firstPolicyId(accountant)
    const submitted = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/insurance-claims',
      ...json(accountant, {
        policyId,
        amountClaimedHalalas: 3_000_000, // SAR 30,000 — above the accountant's SAR 25,000 ceiling
        incidentDate: '2026-07-16',
        description: 'Major front-end collision.',
      }),
    })
    const claimId = (submitted.json() as { _id: string })._id

    /* A different accountant (so SOD passes) still cannot approve above the ceiling. */
    const other = await harness.token('accountant', { sub: 'accountant-approver-two' })
    const approve = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/insurance-claims/${claimId}/approve`,
      ...json(other, {}),
    })
    expect(approve.statusCode).toBe(403)
    expect((approve.json() as { error: { code: string } }).error.code).toBe('approval_required')
  })

  it('rejects a claim with a reason, and refuses a reason-less rejection', async () => {
    const accountant = await harness.token('accountant')
    const policyId = await firstPolicyId(accountant)
    const submitted = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/insurance-claims',
      ...json(accountant, {
        policyId,
        amountClaimedHalalas: 400_000,
        incidentDate: '2026-07-17',
        description: 'Minor scratch, disputed.',
      }),
    })
    const claimId = (submitted.json() as { _id: string })._id
    const owner = await harness.token('owner')

    const noReason = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/insurance-claims/${claimId}/reject`,
      ...json(owner, {}),
    })
    expect(noReason.statusCode).toBe(400)

    const rejected = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/insurance-claims/${claimId}/reject`,
      ...json(owner, { reason: 'Not covered under third-party terms.' }),
    })
    expect(rejected.statusCode, rejected.body).toBe(200)
    expect((rejected.json() as { status: string }).status).toBe('rejected')
  })
})

/* ----------------------------------------------------------- RLS isolation */

describe('financial products never cross the tenant boundary', () => {
  it('shows a neighbour tenant none of our policies, and 404s a claim approval across the boundary', async () => {
    const neighbour = await harness.token('accountant', {
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
    })
    const listed = await harness.app.inject({ method: 'GET', url: '/api/v1/insurance-policies?pageSize=50', ...json(neighbour) })
    expect(listed.statusCode).toBe(200)
    expect((listed.json() as { page: { total: number } }).page.total).toBe(0)

    /* One of our claim ids, approved by the neighbour, is a 404 — RLS makes it
     * invisible rather than forbidden. */
    const [ours] = await harness.handle.db.transaction(async (tx) => {
      await tx.execute(
        sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
      )
      return tx.select().from(insuranceClaims).where(eq(insuranceClaims.orgId, SEED.orgId)).limit(1)
    })
    const crossed = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/insurance-claims/${ours!.id}/approve`,
      ...json(neighbour, {}),
    })
    expect(crossed.statusCode).toBe(404)
  })

  it('keeps the seeded policies addressable within the tenant', async () => {
    const [policy] = await harness.handle.db.transaction(async (tx) => {
      await tx.execute(
        sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
      )
      return tx.select().from(insurancePolicies).where(eq(insurancePolicies.orgId, SEED.orgId)).limit(1)
    })
    expect(policy).toBeDefined()
    const accountant = await harness.token('accountant')
    const byNumber = await harness.app.inject({
      method: 'GET',
      url: `/api/v1/insurance-policies/${policy!.policyNumber}`,
      ...json(accountant),
    })
    expect(byNumber.statusCode, byNumber.body).toBe(200)
  })
})

/** Runs a read under the tenant's own scope, the way seed-coherence does. */
async function query<T>(text: ReturnType<typeof sql>): Promise<T[]> {
  return harness.handle.db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
    )
    return (await tx.execute(text)) as unknown as T[]
  })
}
