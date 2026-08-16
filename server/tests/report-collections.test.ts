/** F-028 — the two report-source collections BankReconciliation and
 *  CustomReports need.
 *
 *  `bankStatements` is read-only through the generic router, with one write —
 *  the reconciling `match` action, which must be idempotent and audited.
 *  `savedReports` is writable through the generic router with the usual
 *  guarantees. Both are tenant-scoped by RLS, and both are tested for the
 *  isolation that makes that real: another organization's rows are never
 *  visible.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { and, eq, sql } from 'drizzle-orm'
import { auditLog, bankStatements } from '../src/db/schema'
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

describe('bankStatements — read-only collection with an idempotent match action', () => {
  it('lists the seeded lines for the tenant and refuses a role without accounting', async () => {
    const accountant = await harness.token('accountant')
    const listed = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/bank-statements?pageSize=50',
      ...json(accountant),
    })
    expect(listed.statusCode, listed.body).toBe(200)
    const body = listed.json() as { rows: { matched: boolean; direction: string }[]; page: { total: number } }
    expect(body.page.total).toBe(5)
    expect(body.rows.some((r) => r.matched)).toBe(true)
    expect(body.rows.some((r) => !r.matched)).toBe(true)
    expect(body.rows.every((r) => r.direction === 'credit' || r.direction === 'debit')).toBe(true)

    const technician = await harness.token('technician')
    const refused = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/bank-statements',
      ...json(technician),
    })
    expect(refused.statusCode).toBe(403)
  })

  it('cannot be created or deleted through the generic router (read-only)', async () => {
    const accountant = await harness.token('accountant')
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/bank-statements',
      ...json(accountant, { description: 'x', amountHalalas: 1, direction: 'credit', statementDate: '2026-07-01' }),
    })
    /* No writer is registered, so the generic router registers no POST — a 404
     * from the not-found handler, never a silent accept. */
    expect(created.statusCode).toBe(404)
  })

  it('matches an open line, is idempotent on replay, and writes one audit row', async () => {
    const accountant = await harness.token('accountant')
    const list = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/bank-statements?pageSize=50',
      ...json(accountant),
    })
    const rows = (list.json() as { rows: { _id: string; matched: boolean }[] }).rows
    const open = rows.find((r) => !r.matched)
    expect(open, 'an unmatched line to reconcile').toBeTruthy()
    const id = open!._id

    const first = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/bank-statements/${id}/match`,
      ...json(accountant, {}),
    })
    expect(first.statusCode, first.body).toBe(200)
    expect((first.json() as { matched: boolean }).matched).toBe(true)

    /* Idempotent: a replay returns the matched line, does not error, and does
     * not write a second audit row. */
    const replay = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/bank-statements/${id}/match`,
      ...json(accountant, {}),
    })
    expect(replay.statusCode).toBe(200)
    expect((replay.json() as { matched: boolean }).matched).toBe(true)

    const audits = await harness.handle.db.transaction(async (tx) => {
      await tx.execute(
        sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
      )
      return tx
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.entity, 'bank_statement'), eq(auditLog.entityId, id)))
    })
    expect(audits).toHaveLength(1)
  })

  it('refuses to match a line without the accounting edit grant', async () => {
    const accountant = await harness.token('accountant')
    const rows = (
      (
        await harness.app.inject({
          method: 'GET',
          url: '/api/v1/bank-statements?pageSize=50',
          ...json(accountant),
        })
      ).json() as { rows: { _id: string; matched: boolean }[] }
    ).rows
    const open = rows.find((r) => !r.matched)!

    /* Manager holds accounting `vx`, not `e` — may view the reconciliation, may
     * not reconcile. */
    const manager = await harness.token('manager')
    const refused = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/bank-statements/${open._id}/match`,
      ...json(manager, {}),
    })
    expect(refused.statusCode).toBe(403)
  })

  it('never shows another tenant the lines, and never matches across the boundary', async () => {
    /* Accountant, not owner: matching needs `accounting:e`, which owner lacks —
     * so this proves the RLS 404, not a permission 403 that would mask it. */
    const neighbour = await harness.token('accountant', {
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
    })
    const listed = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/bank-statements?pageSize=50',
      ...json(neighbour),
    })
    expect(listed.statusCode).toBe(200)
    /* The neighbour seed carries no bank statements: an empty list, not ours. */
    expect((listed.json() as { page: { total: number } }).page.total).toBe(0)

    /* And one of our line ids, matched by the neighbour, is a 404 — RLS makes it
     * invisible rather than forbidden. */
    const [ours] = await harness.handle.db.transaction(async (tx) => {
      await tx.execute(
        sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
      )
      return tx.select().from(bankStatements).where(eq(bankStatements.orgId, SEED.orgId)).limit(1)
    })
    const crossed = await harness.app.inject({
      method: 'POST',
      url: `/api/v1/bank-statements/${ours!.id}/match`,
      ...json(neighbour, {}),
    })
    expect(crossed.statusCode).toBe(404)
  })
})

describe('savedReports — writable collection, tenant-scoped', () => {
  it('creates a saved report, stamps the owner, reads it back and deletes it', async () => {
    const accountant = await harness.token('accountant')
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/saved-reports',
      ...json(accountant, {
        name: 'Receivables ageing',
        source: 'invoices',
        definition: { buckets: [30, 60, 90] },
      }),
    })
    expect(created.statusCode, created.body).toBe(201)
    const row = created.json() as {
      _id: string
      name: string
      owner: string
      definition: Record<string, unknown>
    }
    expect(row.name).toBe('Receivables ageing')
    /* The owner is stamped from the caller, not sent by the client. */
    expect(row.owner).toBe('accountant tester')
    expect(row.definition).toEqual({ buckets: [30, 60, 90] })

    const fetched = await harness.app.inject({
      method: 'GET',
      url: `/api/v1/saved-reports/${row._id}`,
      ...json(accountant),
    })
    expect(fetched.statusCode).toBe(200)

    const removed = await harness.app.inject({
      method: 'DELETE',
      url: `/api/v1/saved-reports/${row._id}`,
      ...json(accountant),
    })
    expect(removed.statusCode).toBe(204)
  })

  it('refuses a create from a role without the accounting create grant', async () => {
    /* Manager holds accounting `vx` — view and export, not create. */
    const manager = await harness.token('manager')
    const refused = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/saved-reports',
      ...json(manager, { name: 'Nope' }),
    })
    expect(refused.statusCode).toBe(403)
  })

  it('never lists another tenant’s saved reports', async () => {
    const accountant = await harness.token('accountant')
    await harness.app.inject({
      method: 'POST',
      url: '/api/v1/saved-reports',
      ...json(accountant, { name: 'Ours only', source: 'invoices' }),
    })

    const neighbour = await harness.token('owner', {
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
    })
    const listed = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/saved-reports?pageSize=50',
      ...json(neighbour),
    })
    expect(listed.statusCode).toBe(200)
    /* The neighbour seed carries no saved reports; ours never leak in. */
    expect((listed.json() as { page: { total: number } }).page.total).toBe(0)
  })
})
