/** F-039: the departments collection had no writer at all — `def.writable`
 *  was unset, so `registerOne` in `routes/collections.ts` skipped POST/PATCH/
 *  DELETE registration entirely (`if (!writer) return`). "Add Department"
 *  404'd for every role, owner and superadmin included, regardless of
 *  permission — a route-registration gap, not a permissions one. This proves
 *  the route now exists, that the new `departments` module (F-038) gates it
 *  correctly (hr may create but not edit; manager and accountant may view but
 *  not write), and that the generic guarantees (RLS, audit, optimistic
 *  concurrency) hold for it same as any other collection.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { and, eq, sql } from 'drizzle-orm'
import { auditLog } from '../src/db/schema'
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

describe('F-039: departments takes writes through the generic router', () => {
  it('lets hr create a department, defaulting headcount to zero', async () => {
    const hr = await harness.token('hr')
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/admin/departments',
      ...json(hr, { name: 'Customer Success', head: 'Sara Al-Mutairi', costCenter: 'CC-900' }),
    })
    expect(created.statusCode, created.body).toBe(201)
    const row = created.json() as {
      _id: string
      name: string
      head: string
      headcount: number
      costCenter: string
    }
    expect(row.name).toBe('Customer Success')
    expect(row.head).toBe('Sara Al-Mutairi')
    expect(row.costCenter).toBe('CC-900')
    expect(row.headcount).toBe(0)
  })

  it('writes an audit row for the create', async () => {
    const owner = await harness.token('owner')
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/admin/departments',
      ...json(owner, { name: 'Quality Assurance' }),
    })
    expect(created.statusCode, created.body).toBe(201)
    const id = (created.json() as { _id: string })._id

    const [audit] = await harness.handle.db.transaction(async (tx) => {
      await tx.execute(
        sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
      )
      return tx.select().from(auditLog).where(and(eq(auditLog.entity, 'department'), eq(auditLog.entityId, id)))
    })
    expect(audit?.action).toBe('create')
  })

  it('refuses create to a role with only a view grant on departments', async () => {
    const manager = await harness.token('manager')
    const refused = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/admin/departments',
      ...json(manager, { name: 'Should Fail' }),
    })
    expect(refused.statusCode).toBe(403)

    const accountant = await harness.token('accountant')
    const alsoRefused = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/admin/departments',
      ...json(accountant, { name: 'Should Also Fail' }),
    })
    expect(alsoRefused.statusCode).toBe(403)
  })

  it('lets an owner edit and delete, but refuses hr — the "vc" grant is create-only', async () => {
    const owner = await harness.token('owner')
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/admin/departments',
      ...json(owner, { name: 'Fleet Operations' }),
    })
    const row = created.json() as { _id: string; _version: number }

    const hr = await harness.token('hr')
    const hrEdit = await harness.app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/departments/${row._id}`,
      headers: { authorization: `Bearer ${hr}`, 'if-match-version': String(row._version) },
      payload: { head: 'Should Fail' },
    })
    expect(hrEdit.statusCode).toBe(403)

    const ownerEdit = await harness.app.inject({
      method: 'PATCH',
      url: `/api/v1/admin/departments/${row._id}`,
      headers: { authorization: `Bearer ${owner}`, 'if-match-version': String(row._version) },
      payload: { head: 'Omar Al-Ghamdi' },
    })
    expect(ownerEdit.statusCode, ownerEdit.body).toBe(200)
    expect((ownerEdit.json() as { head: string }).head).toBe('Omar Al-Ghamdi')

    const deleted = await harness.app.inject({
      method: 'DELETE',
      url: `/api/v1/admin/departments/${row._id}`,
      headers: { authorization: `Bearer ${owner}` },
    })
    expect(deleted.statusCode).toBe(204)
  })
})
