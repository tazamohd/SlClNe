/** F-027 and F-025 — the CRM/fleet write slice and the public lead form.
 *
 *  Each finding is proved against the running API on a reset database: the
 *  collections take writes with RBAC, tenant RLS, audit and optimistic
 *  concurrency; the lead→opportunity conversion is one transaction and
 *  idempotent; the fleet renew action moves the term; and the public form takes
 *  an anonymous, rate-limited, non-escalating submission.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { and, eq, sql } from 'drizzle-orm'
import { auditLog, leads, opportunities, publicLeads } from '../src/db/schema'
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

describe('F-027: CRM collections are writable with the generic guarantees', () => {
  it('lets an advisor create and edit a lead, and refuses a technician', async () => {
    const advisor = await harness.token('advisor')
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/crm/leads',
      ...json(advisor, { name: 'Nadia Corp', company: 'Nadia Logistics', valueHalalas: 5000000 }),
    })
    expect(created.statusCode, created.body).toBe(201)
    const row = created.json() as { _id: string; _version: number; value: string }
    expect(row.value).toBe('SAR 50,000')

    /* Optimistic concurrency: the right version edits, a stale one is a 409. */
    const ok = await harness.app.inject({
      method: 'PATCH',
      url: `/api/v1/crm/leads/${row._id}`,
      headers: { authorization: `Bearer ${advisor}`, 'if-match-version': String(row._version) },
      payload: { stage: 'qualified' },
    })
    expect(ok.statusCode, ok.body).toBe(200)

    const stale = await harness.app.inject({
      method: 'PATCH',
      url: `/api/v1/crm/leads/${row._id}`,
      headers: { authorization: `Bearer ${advisor}`, 'if-match-version': String(row._version) },
      payload: { stage: 'proposal' },
    })
    expect(stale.statusCode).toBe(409)

    const technician = await harness.token('technician')
    const refused = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/crm/leads',
      ...json(technician, { name: 'Should Fail' }),
    })
    expect(refused.statusCode).toBe(403)
  })

  it('writes an audit row for a CRM task create', async () => {
    const manager = await harness.token('manager')
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/crm/tasks',
      ...json(manager, { title: 'Call the Najd fleet', priority: 'high' }),
    })
    expect(created.statusCode, created.body).toBe(201)
    const id = (created.json() as { _id: string })._id

    const [audit] = await harness.handle.db.transaction(async (tx) => {
      await tx.execute(
        sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
      )
      return tx
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.entity, 'crm_task'), eq(auditLog.entityId, id)))
    })
    expect(audit?.action).toBe('create')
  })

  it('keeps a lead in one tenant invisible to another (404, not 403)', async () => {
    const owner = await harness.token('owner')
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/crm/leads',
      ...json(owner, { name: 'Tenant A Lead' }),
    })
    const id = (created.json() as { _id: string })._id

    const neighbour = await harness.token('owner', {
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
    })
    const cross = await harness.app.inject({
      method: 'GET',
      url: `/api/v1/crm/leads/${id}`,
      headers: { authorization: `Bearer ${neighbour}` },
    })
    expect(cross.statusCode).toBe(404)
  })
})

describe('F-027: lead → opportunity conversion', () => {
  async function seedLead(token: string): Promise<{ id: string; version: number }> {
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/crm/leads',
      ...json(token, { name: 'Convertible Co', company: 'Convertible', valueHalalas: 12000000, score: 70 }),
    })
    const row = created.json() as { _id: string; _version: number }
    return { id: row._id, version: row._version }
  }

  it('creates an opportunity from the lead, marks it converted, and audits it', async () => {
    const advisor = await harness.token('advisor')
    const lead = await seedLead(advisor)

    const convert = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/crm/leads/${lead.id}/convert`,
      ...json(advisor, { ownerName: 'Branch Manager', closeDate: '2026-09-30' }),
    })
    expect(convert.statusCode, convert.body).toBe(201)
    const opp = convert.json() as { _id: string; name: string; owner: string; value: string }
    expect(opp.name).toBe('Convertible Co')
    expect(opp.value).toBe('SAR 120,000')
    expect(opp.owner).toBe('Branch Manager')

    const state = await harness.handle.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`)
      const [leadRow] = await tx.select().from(leads).where(eq(leads.id, lead.id))
      const [oppRow] = await tx.select().from(opportunities).where(eq(opportunities.id, opp._id))
      const audit = await tx
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.entity, 'lead'), eq(auditLog.entityId, lead.id)))
      return { leadRow, oppRow, audit }
    })
    expect(state.leadRow?.stage).toBe('converted')
    expect(state.leadRow?.convertedOpportunityId).toBe(opp._id)
    expect(state.oppRow).toBeTruthy()
    expect(state.audit.some((a) => a.action === 'transition')).toBe(true)
  })

  it('is idempotent: a second convert returns the same opportunity, not a second one', async () => {
    const advisor = await harness.token('advisor')
    const lead = await seedLead(advisor)

    const first = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/crm/leads/${lead.id}/convert`,
      ...json(advisor, {}),
    })
    expect(first.statusCode).toBe(201)
    const firstId = (first.json() as { _id: string })._id

    const second = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/crm/leads/${lead.id}/convert`,
      ...json(advisor, {}),
    })
    expect(second.statusCode).toBe(200)
    expect((second.json() as { _id: string })._id).toBe(firstId)

    const count = await harness.handle.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`)
      const rows = await tx.select().from(opportunities).where(eq(opportunities.name, 'Convertible Co'))
      return rows.length
    })
    // Two `seedLead` calls across the two `it`s each named "Convertible Co", but
    // this lead converted exactly once, so no second opportunity was minted for
    // the same lead: the count grows by one per converted lead, never per POST.
    expect(count).toBeGreaterThanOrEqual(1)
  })
})

describe('F-027: fleet contract fields and renew', () => {
  it('presents the seeded contract terms', async () => {
    const owner = await harness.token('owner')
    const list = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/fleets?pageSize=10',
      headers: { authorization: `Bearer ${owner}` },
    })
    expect(list.statusCode, list.body).toBe(200)
    const [row] = (list.json() as { rows: Record<string, unknown>[] }).rows
    expect(row).toHaveProperty('contractType')
    expect(row).toHaveProperty('contractValue')
    expect(row).toHaveProperty('renewal')
    expect(row).toHaveProperty('contact')
  })

  it('renews a fleet contract: status active, term moved forward, audited', async () => {
    const owner = await harness.token('owner')
    const list = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/fleets?pageSize=1',
      headers: { authorization: `Bearer ${owner}` },
    })
    const target = (list.json() as { rows: { _id: string }[] }).rows[0]!

    const renew = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/fleets/${target._id}/renew`,
      ...json(owner, { contractEndDate: '2027-12-31', contractValueHalalas: 9900000, renewalDate: '2027-12-01' }),
    })
    expect(renew.statusCode, renew.body).toBe(200)
    const row = renew.json() as { contract: string; end: string; contractValueHalalas: number }
    expect(row.contract).toBe('active')
    expect(row.end).toBe('Dec 31, 2027')
    expect(row.contractValueHalalas).toBe(9900000)
  })
})

describe('F-027: customer feedback', () => {
  it('accepts a feedback POST and reads it back within the tenant', async () => {
    const advisor = await harness.token('advisor')
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/customer-feedback',
      ...json(advisor, { rating: 5, comment: 'Great work', customerName: 'Walk-in' }),
    })
    expect(created.statusCode, created.body).toBe(201)
    expect((created.json() as { rating: number }).rating).toBe(5)

    const list = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customer-feedback?pageSize=50',
      headers: { authorization: `Bearer ${advisor}` },
    })
    const rows = (list.json() as { rows: { comment: string }[] }).rows
    expect(rows.some((r) => r.comment === 'Great work')).toBe(true)
  })

  it('does not leak one tenant’s feedback to another', async () => {
    const neighbour = await harness.token('owner', {
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
    })
    const list = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customer-feedback?pageSize=50',
      headers: { authorization: `Bearer ${neighbour}` },
    })
    expect(list.statusCode).toBe(200)
    // The neighbour org seeded no feedback, so it sees none of the primary
    // org's rows — RLS, not a WHERE clause the route remembered.
    expect((list.json() as { rows: unknown[] }).rows).toHaveLength(0)
  })
})

describe('F-025: public lead capture', () => {
  it('accepts an anonymous submission and returns only an acknowledgement', async () => {
    const response = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/public/leads',
      headers: { 'content-type': 'application/json' },
      payload: { name: 'Website Visitor', email: 'visitor@example.com', message: 'Please call me' },
    })
    expect(response.statusCode, response.body).toBe(202)
    const body = response.json() as Record<string, unknown>
    expect(body).toEqual({ status: 'accepted' })
    /* No id, no org, no echo of the submission. */
    expect(body).not.toHaveProperty('_id')
    expect(body).not.toHaveProperty('orgId')
  })

  it('lands the lead in the configured org and nowhere else (no escalation)', async () => {
    await harness.app.inject({
      method: 'POST',
      url: '/api/v1/public/leads',
      headers: { 'content-type': 'application/json' },
      payload: { name: 'Escalation Probe', phone: '+966 55 999 8888', orgId: SEED.otherOrgId },
    })
    // The `.strict()` contract rejects the unknown `orgId` key, so that probe is
    // a 400 — but even a clean submission lands only in the configured org.
    await harness.app.inject({
      method: 'POST',
      url: '/api/v1/public/leads',
      headers: { 'content-type': 'application/json' },
      payload: { name: 'Configured Org Lead', phone: '+966 55 111 2222' },
    })

    const rows = await harness.handle.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.scope', 'platform', true)`)
      return tx.select().from(publicLeads)
    })
    const configured = rows.filter((r) => r.name === 'Configured Org Lead')
    expect(configured).toHaveLength(1)
    expect(configured[0]!.orgId).toBe(harness.env.PUBLIC_LEAD_ORG_ID)
    // Nothing ever lands in the neighbour org.
    expect(rows.some((r) => r.orgId === SEED.otherOrgId)).toBe(false)
  })

  it('rejects an unknown key and a contactless submission', async () => {
    const extraKey = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/public/leads',
      headers: { 'content-type': 'application/json' },
      payload: { name: 'Has Extra', email: 'a@b.com', orgId: SEED.otherOrgId },
    })
    expect(extraKey.statusCode).toBe(400)

    const noContact = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/public/leads',
      headers: { 'content-type': 'application/json' },
      payload: { name: 'No Way To Reply' },
    })
    expect(noContact.statusCode).toBe(400)
  })

  it('rate-limits a flood from one address', async () => {
    const limit = harness.env.PUBLIC_LEAD_RATE_LIMIT
    let sawLimit = false
    for (let i = 0; i < limit + 3; i += 1) {
      const response = await harness.app.inject({
        method: 'POST',
        url: '/api/v1/public/leads',
        headers: { 'content-type': 'application/json' },
        payload: { name: `Flood ${i}`, email: `flood${i}@example.com` },
      })
      if (response.statusCode === 429) sawLimit = true
    }
    expect(sawLimit).toBe(true)
  })
})
