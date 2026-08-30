import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import * as T from '../../app/src/data/generated/tables'
import { SEED_COHERENCE_EXTRAS } from '../scripts/seed'
import { api, setupDb, teardownDb, login, EMAILS } from './helpers.js'

/** Every row carries these alongside its domain columns. Named once so a shape
 *  assertion can say "the fixture's columns and nothing else" without
 *  restating the envelope, and so adding a fifth is one edit here. */
const ENVELOPE = ['_createdAt', '_id', '_updatedAt', '_version']

/** The domain columns of a row, with the envelope removed. */
const domainKeys = (row: object) => Object.keys(row).filter((k) => !k.startsWith('_')).sort()

let ownerToken: string
let techToken: string

beforeAll(async () => {
  await setupDb()
  ownerToken = await login(EMAILS.owner)
  techToken = await login(EMAILS.technician)
})
afterAll(teardownDb)

const auth = (t: string) => ({ Authorization: `Bearer ${t}` })

describe('collection list endpoints — shape parity with the frontend fixtures', () => {
  it('GET /jobs returns the seeded jobs in the exact contract shape', async () => {
    const res = await api.get('/api/v1/jobs').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.rows)).toBe(true)
    expect(res.body.rows).toHaveLength(T.JOBS.length)
    /* An exact set, not a subset: the point of this test is that no extra
     * column leaks out of the row presenter. `stage` and `assignedTechId` are
     * server-side state the fixture has no column for — the stage machine and
     * the technician assignment — and both are part of the contract shape. */
    expect(domainKeys(res.body.rows[0])).toEqual([
      'assignedTechId', 'cust', 'id', 'pr', 'st', 'stage', 'svc', 'veh',
    ])
    expect(Object.keys(res.body.rows[0]).filter((k) => k.startsWith('_')).sort()).toEqual(ENVELOPE)
    expect(res.body.rows[0]).toMatchObject({ id: 'A3F8B2C1', cust: 'Ahmed Al-Rashid', svc: 'maintenance', st: 'in_progress', pr: 'medium' })
    // No surrogate key leaks.
    expect(res.body.rows[0].pk).toBeUndefined()
  })

  it('GET /invoices returns the seeded invoices with the invoice shape', async () => {
    const res = await api.get('/api/v1/invoices').set(auth(ownerToken))
    expect(res.status).toBe(200)
    /* The fixture's five plus the three historical invoices the design's
     * receipts settle — money must not arrive against nothing (F-016). */
    expect(res.body.rows).toHaveLength(T.INVOICES.length + SEED_COHERENCE_EXTRAS.invoices)
    expect(domainKeys(res.body.rows[0])).toEqual(expect.arrayContaining(['amount', 'cust', 'due', 'id', 'status']))
    expect(res.body.rows[0].pk).toBeUndefined()
  })

  it('GET /inventory serves the PARTS fixtures (endpoints.ts maps parts → /inventory)', async () => {
    const res = await api.get('/api/v1/inventory').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(res.body.rows).toHaveLength(4)
    expect(res.body.rows[0]).toMatchObject({ sku: 'OF-TY-118', stock: 142 })
  })

  it('GET /crm/leads reads from the namespaced route', async () => {
    const res = await api.get('/api/v1/crm/leads').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(res.body.rows.length).toBeGreaterThan(0)
    expect(res.body.rows[0]).toHaveProperty('score')
  })

  it('GET /accounting/coa returns the chart of accounts', async () => {
    const res = await api.get('/api/v1/accounting/coa').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(res.body.rows[0]).toMatchObject({ code: '1000', type: 'Assets' })
  })

  it('every collection endpoint responds 200 with rows array for the owner', async () => {
    const paths = [
      '/api/v1/jobs', '/api/v1/appointments', '/api/v1/estimates', '/api/v1/invoices', '/api/v1/receipts',
      '/api/v1/customers', '/api/v1/vehicles', '/api/v1/fleets', '/api/v1/inventory', '/api/v1/technicians',
      '/api/v1/crm/leads', '/api/v1/crm/opportunities', '/api/v1/crm/tasks', '/api/v1/crm/segments', '/api/v1/crm/campaigns',
      '/api/v1/accounting/coa', '/api/v1/accounting/journal-entries', '/api/v1/accounting/expenses',
      '/api/v1/ai/agents', '/api/v1/ai/conversations', '/api/v1/kb/procedures',
    ]
    for (const p of paths) {
      const res = await api.get(p).set(auth(ownerToken))
      expect(res.status, `${p} should be 200`).toBe(200)
      expect(Array.isArray(res.body.rows), `${p} should return rows array`).toBe(true)
      expect(res.body.rows.length, `${p} should be seeded`).toBeGreaterThan(0)
    }
  })
})

describe('detail endpoints', () => {
  it('GET /invoices/:id returns one invoice', async () => {
    const res = await api.get('/api/v1/invoices/INV-2026-0142').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 'INV-2026-0142', cust: 'Ahmed Al-Rashid' })
  })

  it('GET /invoices/:id 404s for an unknown id with the error envelope', async () => {
    const res = await api.get('/api/v1/invoices/NOPE').set(auth(ownerToken))
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('not_found')
  })
})

describe('list query params', () => {
  it('filters by an exact field value', async () => {
    const res = await api.get('/api/v1/invoices?filter[status]=unpaid').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(res.body.rows.every((r: any) => r.status === 'unpaid')).toBe(true)
    expect(res.body.rows.length).toBeGreaterThan(0)
  })

  it('free-text q searches configured columns', async () => {
    const res = await api.get('/api/v1/customers?q=Ahmed').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(res.body.rows[0].name).toContain('Ahmed')
  })

  it('sorts by field:dir', async () => {
    const res = await api.get('/api/v1/crm/leads?sort=score:desc').set(auth(ownerToken))
    expect(res.status).toBe(200)
    const scores = res.body.rows.map((r: any) => r.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })

  /* 400, not 422: a column that does not exist on the collection means the
   * query never described a filter the server could run, so no rule was
   * consulted. 422 is for a well-formed request a rule then refuses. */
  it('rejects an unknown filter field (400)', async () => {
    const res = await api.get('/api/v1/invoices?filter[bogus]=x').set(auth(ownerToken))
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('bad_request')
    expect(res.body.error.field).toBe('bogus')
  })
})

describe('server-side RBAC re-check (mirrors app/src/data/rbac.ts)', () => {
  it('a technician cannot view invoices (403)', async () => {
    const res = await api.get('/api/v1/invoices').set(auth(techToken))
    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('forbidden')
  })

  it('a technician cannot view accounting (403)', async () => {
    const res = await api.get('/api/v1/accounting/coa').set(auth(techToken))
    expect(res.status).toBe(403)
  })

  it('a technician CAN view jobs (they have jobcards view)', async () => {
    const res = await api.get('/api/v1/jobs').set(auth(techToken))
    expect(res.status).toBe(200)
  })

  it('an accountant can view invoices but not appointments', async () => {
    const accToken = await login(EMAILS.accountant)
    expect((await api.get('/api/v1/invoices').set(auth(accToken))).status).toBe(200)
    expect((await api.get('/api/v1/appointments').set(auth(accToken))).status).toBe(403)
  })
})
