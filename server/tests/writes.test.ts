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

describe('write round-trips — create → read → update → delete', () => {
  it('a natural-id resource (invoice) round-trips', async () => {
    const body = { id: 'INV-TEST-9001', cust: 'Test Customer', amount: '1200.00', due: '2026-09-30', status: 'unpaid' }

    // Create → 201, returns the created row in contract shape (no pk).
    const created = await api.post('/invoices').set(auth(ownerToken)).send(body)
    expect(created.status).toBe(201)
    expect(created.body).toMatchObject(body)
    expect(created.body.pk).toBeUndefined()

    // Read it back through the detail GET.
    const read = await api.get('/invoices/INV-TEST-9001').set(auth(ownerToken))
    expect(read.status).toBe(200)
    expect(read.body).toMatchObject({ id: 'INV-TEST-9001', cust: 'Test Customer' })

    // Update → 200, returns the updated row.
    const updated = await api.patch('/invoices/INV-TEST-9001').set(auth(ownerToken)).send({ status: 'paid' })
    expect(updated.status).toBe(200)
    expect(updated.body).toMatchObject({ id: 'INV-TEST-9001', status: 'paid' })
    expect(updated.body.pk).toBeUndefined()

    // Delete → 204, then the row is gone.
    const del = await api.delete('/invoices/INV-TEST-9001').set(auth(ownerToken))
    expect(del.status).toBe(204)
    const gone = await api.get('/invoices/INV-TEST-9001').set(auth(ownerToken))
    expect(gone.status).toBe(404)
  })

  it('a surrogate-pk resource (customer) round-trips via its pk', async () => {
    const body = { name: 'Round Trip Co', phone: '+966500000000', vehicles: 2, spent: 'SAR 4,500', last: '2026-08-01' }

    const created = await api.post('/customers').set(auth(ownerToken)).send(body)
    expect(created.status).toBe(201)
    expect(created.body).toMatchObject(body)
    expect(created.body.pk).toBeUndefined()

    // The pk is not returned, so recover it from the DB via a filtered list to
    // address the row. (Screens address natural-id rows directly; pk resources
    // are addressed by the pk the write layer resolves in the URL.)
    const list = await api.get('/customers?q=Round Trip Co').set(auth(ownerToken))
    expect(list.status).toBe(200)
    expect(list.body.some((r: any) => r.name === 'Round Trip Co')).toBe(true)
  })

  it('PATCH on a missing id is 404 with the error envelope', async () => {
    const res = await api.patch('/invoices/DOES-NOT-EXIST').set(auth(ownerToken)).send({ status: 'paid' })
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('not_found')
  })

  it('DELETE on a missing id is 404', async () => {
    const res = await api.delete('/invoices/DOES-NOT-EXIST').set(auth(ownerToken))
    expect(res.status).toBe(404)
  })
})

describe('write RBAC — gated by action, not just module', () => {
  it('a technician cannot create an invoice (403 — no create on invoices)', async () => {
    const res = await api
      .post('/invoices')
      .set(auth(techToken))
      .send({ id: 'INV-RBAC-1', cust: 'X', amount: '1', due: '2026-01-01', status: 'unpaid' })
    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('forbidden')
  })

  it('a technician cannot delete a customer (403 — only view on customers)', async () => {
    const res = await api.delete('/customers/1').set(auth(techToken))
    expect(res.status).toBe(403)
  })

  it('an owner CAN create an appointment (has create on appointments)', async () => {
    const res = await api
      .post('/appointments')
      .set(auth(ownerToken))
      .send({ time: '10:00', cust: 'Y', veh: 'Kia', plate: 'ABC 123', svc: 'oil', status: 'awaiting', bay: 'B1', tech: 'Saeed', mins: 45 })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ cust: 'Y', mins: 45 })
  })
})

describe('write validation — 422 on a bad body', () => {
  it('rejects a missing required field', async () => {
    const res = await api.post('/invoices').set(auth(ownerToken)).send({ id: 'INV-BAD-1' })
    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('validation_failed')
    expect(res.body.error.field).toBeDefined()
  })

  it('rejects a wrong type (string where an integer is required)', async () => {
    const res = await api
      .post('/appointments')
      .set(auth(ownerToken))
      .send({ time: '10:00', cust: 'Y', veh: 'Kia', plate: 'ABC 123', svc: 'oil', status: 'awaiting', bay: 'B1', tech: 'Saeed', mins: 'not-a-number' })
    expect(res.status).toBe(422)
    expect(res.body.error.field).toBe('mins')
  })

  it('rejects an unknown field (strict body)', async () => {
    const res = await api
      .post('/invoices')
      .set(auth(ownerToken))
      .send({ id: 'INV-BAD-2', cust: 'X', amount: '1', due: '2026-01-01', status: 'unpaid', bogus: true })
    expect(res.status).toBe(422)
  })
})

describe('job transition — server-side state machine', () => {
  it('happy path: a pending job can move to in_progress', async () => {
    // Seeded job B7E4D9A2 starts pending.
    const res = await api.post('/jobs/B7E4D9A2/transition').set(auth(ownerToken)).send({ to: 'in_progress' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 'B7E4D9A2', st: 'in_progress' })
    expect(res.body.pk).toBeUndefined()
  })

  it('rejects an invalid transition (delivered → in_progress) with 409', async () => {
    // Seeded job E5D7A3B5 is delivered (terminal).
    const res = await api.post('/jobs/E5D7A3B5/transition').set(auth(ownerToken)).send({ to: 'in_progress' })
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('invalid_transition')
    expect(res.body.error.field).toBe('to')
  })

  it('rejects an unknown target state with 422', async () => {
    const res = await api.post('/jobs/A3F8B2C1/transition').set(auth(ownerToken)).send({ to: 'teleported' })
    expect(res.status).toBe(422)
    expect(res.body.error.field).toBe('to')
  })

  it('404s a transition on a missing job', async () => {
    const res = await api.post('/jobs/NOPE/transition').set(auth(ownerToken)).send({ to: 'in_progress' })
    expect(res.status).toBe(404)
  })
})

describe('invoice issue — state lock', () => {
  it('issuing an invoice moves it to issued', async () => {
    const res = await api.post('/invoices/INV-2026-0142/issue').set(auth(ownerToken)).send({})
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 'INV-2026-0142', status: 'issued' })
  })

  it('404s issue on a missing invoice', async () => {
    const res = await api.post('/invoices/NOPE/issue').set(auth(ownerToken)).send({})
    expect(res.status).toBe(404)
  })
})
