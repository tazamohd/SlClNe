import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { api, setupDb, teardownDb, login, EMAILS } from './helpers.js'

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
  it('GET /jobs returns the 5 seeded jobs in the exact contract shape', async () => {
    const res = await api.get('/jobs').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(5)
    expect(Object.keys(res.body[0]).sort()).toEqual(['cust', 'id', 'pr', 'st', 'svc', 'veh'])
    expect(res.body[0]).toMatchObject({ id: 'A3F8B2C1', cust: 'Ahmed Al-Rashid', svc: 'maintenance', st: 'in_progress', pr: 'medium' })
    // No surrogate key leaks.
    expect(res.body[0].pk).toBeUndefined()
  })

  it('GET /invoices returns 5 invoices with the invoice shape', async () => {
    const res = await api.get('/invoices').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(5)
    expect(Object.keys(res.body[0]).sort()).toEqual(['amount', 'cust', 'due', 'id', 'status'])
  })

  it('GET /inventory serves the PARTS fixtures (endpoints.ts maps parts → /inventory)', async () => {
    const res = await api.get('/inventory').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(4)
    expect(res.body[0]).toMatchObject({ sku: 'OF-TY-118', stock: 142 })
  })

  it('GET /crm/leads reads from the namespaced route', async () => {
    const res = await api.get('/crm/leads').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0]).toHaveProperty('score')
  })

  it('GET /accounting/coa returns the chart of accounts', async () => {
    const res = await api.get('/accounting/coa').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(res.body[0]).toMatchObject({ code: '1000', type: 'Assets' })
  })

  it('every collection endpoint responds 200 with an array for the owner', async () => {
    const paths = [
      '/jobs', '/appointments', '/estimates', '/invoices', '/receipts',
      '/customers', '/vehicles', '/fleets', '/inventory', '/technicians',
      '/crm/leads', '/crm/opportunities', '/crm/tasks', '/crm/segments', '/crm/campaigns',
      '/accounting/coa', '/accounting/journal-entries', '/accounting/expenses',
      '/ai/agents', '/ai/conversations', '/kb/procedures',
    ]
    for (const p of paths) {
      const res = await api.get(p).set(auth(ownerToken))
      expect(res.status, `${p} should be 200`).toBe(200)
      expect(Array.isArray(res.body), `${p} should return an array`).toBe(true)
      expect(res.body.length, `${p} should be seeded`).toBeGreaterThan(0)
    }
  })
})

describe('detail endpoints', () => {
  it('GET /invoices/:id returns one invoice', async () => {
    const res = await api.get('/invoices/INV-2026-0142').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 'INV-2026-0142', cust: 'Ahmed Al-Rashid' })
  })

  it('GET /invoices/:id 404s for an unknown id with the error envelope', async () => {
    const res = await api.get('/invoices/NOPE').set(auth(ownerToken))
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('not_found')
  })
})

describe('list query params', () => {
  it('filters by an exact field value', async () => {
    const res = await api.get('/invoices?filter[status]=unpaid').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(res.body.every((r: any) => r.status === 'unpaid')).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('free-text q searches configured columns', async () => {
    const res = await api.get('/customers?q=Ahmed').set(auth(ownerToken))
    expect(res.status).toBe(200)
    expect(res.body[0].name).toContain('Ahmed')
  })

  it('sorts by field:dir', async () => {
    const res = await api.get('/crm/leads?sort=score:desc').set(auth(ownerToken))
    expect(res.status).toBe(200)
    const scores = res.body.map((r: any) => r.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })

  it('rejects an unknown filter field (422)', async () => {
    const res = await api.get('/invoices?filter[bogus]=x').set(auth(ownerToken))
    expect(res.status).toBe(422)
    expect(res.body.error.field).toBe('bogus')
  })
})

describe('server-side RBAC re-check (mirrors app/src/data/rbac.ts)', () => {
  it('a technician cannot view invoices (403)', async () => {
    const res = await api.get('/invoices').set(auth(techToken))
    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('forbidden')
  })

  it('a technician cannot view accounting (403)', async () => {
    const res = await api.get('/accounting/coa').set(auth(techToken))
    expect(res.status).toBe(403)
  })

  it('a technician CAN view jobs (they have jobcards view)', async () => {
    const res = await api.get('/jobs').set(auth(techToken))
    expect(res.status).toBe(200)
  })

  it('an accountant can view invoices but not appointments', async () => {
    const accToken = await login(EMAILS.accountant)
    expect((await api.get('/invoices').set(auth(accToken))).status).toBe(200)
    expect((await api.get('/appointments').set(auth(accToken))).status).toBe(403)
  })
})
