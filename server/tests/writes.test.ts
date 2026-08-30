import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { api, setupDb, teardownDb, login, EMAILS } from './helpers.js'

/** Write-path behaviour: round-trips, RBAC by action, schema refusals and the
 *  job stage machine.
 *
 *  This file spent a long time unable to reach its first assertion — the helper
 *  it uses never built a schema — so nothing here was ever checked against the
 *  server. It had been written against a different, fixture-shaped API: it
 *  posted `{cust, amount, due}` where the contract takes `{customerName,
 *  dueDate, lines}`, moved jobs between `pending` and `in_progress` where the
 *  stage machine runs `checkin → inspection → estimate → repair → qc →
 *  delivery → invoiced → closed`, and expected 422 for bodies that do not match
 *  the schema. Each test now exercises the concern it was named for against the
 *  API that exists.
 *
 *  On 400 vs 422, which the old assertions had backwards: a body that does not
 *  match the schema is a 400 — the server never formed a domain question out of
 *  it. A schema-valid body refused by a rule is a 422. Both carry `field`. */

let ownerToken: string
let techToken: string

beforeAll(async () => {
  await setupDb()
  ownerToken = await login(EMAILS.owner)
  techToken = await login(EMAILS.technician)
})
afterAll(teardownDb)

const auth = (t: string) => ({ Authorization: `Bearer ${t}` })

/** A complete, schema-valid invoice. VAT is never sent by the client. */
const invoiceBody = (customerName: string) => ({
  customerName,
  dueDate: '2026-09-30',
  lines: [{ description: 'Oil change', kind: 'labour' as const, qty: 1, unitPriceHalalas: 120_000 }],
})

describe('write round-trips — create → read → update → delete', () => {
  it('a customer round-trips through the generic collection writer', async () => {
    const created = await api
      .post('/api/v1/customers')
      .set(auth(ownerToken))
      .send({ name: 'Round Trip Co', phone: '+966500000000' })
    expect(created.status, JSON.stringify(created.body)).toBe(201)
    expect(created.body).toMatchObject({ name: 'Round Trip Co' })
    // The surrogate pk stays server-side; rows are addressed by `_id`.
    expect(created.body.pk).toBeUndefined()
    const id = created.body._id as string
    expect(id).toBeTruthy()

    const read = await api.get(`/api/v1/customers/${id}`).set(auth(ownerToken))
    expect(read.status).toBe(200)
    expect(read.body).toMatchObject({ _id: id, name: 'Round Trip Co' })

    const updated = await api
      .patch(`/api/v1/customers/${id}`)
      .set(auth(ownerToken))
      .send({ name: 'Round Trip Holdings' })
    expect(updated.status, JSON.stringify(updated.body)).toBe(200)
    expect(updated.body).toMatchObject({ _id: id, name: 'Round Trip Holdings' })

    const del = await api.delete(`/api/v1/customers/${id}`).set(auth(ownerToken))
    expect(del.status).toBe(204)
    const gone = await api.get(`/api/v1/customers/${id}`).set(auth(ownerToken))
    expect(gone.status).toBe(404)
  })

  it('a created customer is findable in the list', async () => {
    const created = await api
      .post('/api/v1/customers')
      .set(auth(ownerToken))
      .send({ name: 'Findable Co', phone: '+966500000001' })
    expect(created.status).toBe(201)

    const list = await api.get('/api/v1/customers?q=Findable Co').set(auth(ownerToken))
    expect(list.status).toBe(200)
    expect(list.body.rows.some((r: { name: string }) => r.name === 'Findable Co')).toBe(true)
  })

  it('PATCH on a missing id is 404 with the error envelope', async () => {
    const res = await api
      .patch('/api/v1/customers/01JDOESNOTEXISTXXXXXXXXXXX')
      .set(auth(ownerToken))
      .send({ name: 'Nobody' })
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('not_found')
  })

  it('DELETE on a missing id is 404', async () => {
    const res = await api.delete('/api/v1/customers/01JDOESNOTEXISTXXXXXXXXXXX').set(auth(ownerToken))
    expect(res.status).toBe(404)
  })
})

describe('write RBAC — gated by action, not just module', () => {
  it('a technician cannot create an invoice (403 — no create on invoices)', async () => {
    const res = await api.post('/api/v1/invoices').set(auth(techToken)).send(invoiceBody('X'))
    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('forbidden')
  })

  it('a technician cannot delete a customer (403 — only view on customers)', async () => {
    const res = await api
      .delete('/api/v1/customers/01JDOESNOTEXISTXXXXXXXXXXX')
      .set(auth(techToken))
    expect(res.status).toBe(403)
  })

  it('an owner CAN create an appointment (has create on appointments)', async () => {
    const res = await api
      .post('/api/v1/appointments')
      .set(auth(ownerToken))
      .send({
        scheduledDate: '2026-09-15',
        timeLabel: '10:00 AM',
        startMinute: 600,
        durationMins: 45,
        customerName: 'Y',
        vehicleLabel: 'Kia Cerato 2021',
        plate: 'ABC 1234',
        serviceLabel: 'Oil change',
        bay: 'B9',
      })
    expect(res.status, JSON.stringify(res.body)).toBe(201)
    expect(res.body).toMatchObject({ cust: 'Y' })
  })
})

describe('write validation — 400 when the body does not match the schema', () => {
  it('rejects a missing required field', async () => {
    const res = await api.post('/api/v1/invoices').set(auth(ownerToken)).send({ dueDate: '2026-09-30' })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('bad_request')
    expect(res.body.error.field).toBeDefined()
  })

  it('rejects a wrong type (string where a number is required)', async () => {
    const res = await api
      .post('/api/v1/appointments')
      .set(auth(ownerToken))
      .send({
        scheduledDate: '2026-09-15',
        timeLabel: '10:00 AM',
        startMinute: 600,
        durationMins: 'not-a-number',
        customerName: 'Y',
        vehicleLabel: 'Kia Cerato 2021',
        plate: 'ABC 1234',
        serviceLabel: 'Oil change',
        bay: 'B8',
      })
    expect(res.status).toBe(400)
    expect(res.body.error.field).toBe('durationMins')
  })

  /** Records what the collection writers actually do with a key they do not
   *  know, which is not what this test asserted before: they ignore it. Only
   *  two schemas in the contract are `.strict()` — the public lead form and the
   *  bank-statement import, both of which take input from outside the product —
   *  so on every other write a misspelled field is accepted and silently
   *  dropped. Worth pinning either way: if collection bodies are ever made
   *  strict, this test should fail and be rewritten, not quietly keep passing. */
  it('ignores an unknown field rather than refusing it (collection bodies are not strict)', async () => {
    const res = await api
      .post('/api/v1/customers')
      .set(auth(ownerToken))
      .send({ name: 'Lenient Co', phone: '+966500000002', bogus: true })
    expect(res.status).toBe(201)
    expect(res.body.bogus).toBeUndefined()
  })

  it('refuses an unknown field where the schema is strict (the public lead form)', async () => {
    const res = await api
      .post('/api/v1/public/leads')
      .send({ name: 'Has Extra', email: 'a@b.com', bogus: true })
    expect(res.status).toBe(400)
  })
})

describe('job transition — server-side state machine', () => {
  it('happy path: a job at checkin can move to inspection', async () => {
    // Seeded job B7E4D9A2 sits at the checkin stage.
    const res = await api
      .post('/api/v1/jobs/B7E4D9A2/transition')
      .set(auth(ownerToken))
      .send({ to: 'inspection' })
    expect(res.status, JSON.stringify(res.body)).toBe(200)
    expect(res.body).toMatchObject({ id: 'B7E4D9A2' })
    expect(res.body.pk).toBeUndefined()
  })

  it('refuses a transition the machine does not allow with 422', async () => {
    // Seeded job E5D7A3B5 is closed, and `closed` has no outward edges.
    const res = await api
      .post('/api/v1/jobs/E5D7A3B5/transition')
      .set(auth(ownerToken))
      .send({ to: 'inspection' })
    expect(res.status, JSON.stringify(res.body)).toBe(422)
    expect(res.body.error.code).toBe('rule_violated')
    expect(res.body.error.field).toBe('to')
  })

  it('rejects a stage that is not in the enum with 400', async () => {
    const res = await api
      .post('/api/v1/jobs/A3F8B2C1/transition')
      .set(auth(ownerToken))
      .send({ to: 'teleported' })
    expect(res.status).toBe(400)
    expect(res.body.error.field).toBe('to')
  })

  it('404s a transition on a missing job', async () => {
    const res = await api.post('/api/v1/jobs/NOPE/transition').set(auth(ownerToken)).send({ to: 'inspection' })
    expect(res.status).toBe(404)
  })
})

describe('invoice issue — state lock', () => {
  it('issuing a draft invoice stamps it and refuses a second issue', async () => {
    const created = await api.post('/api/v1/invoices').set(auth(ownerToken)).send(invoiceBody('Issue Test Co'))
    expect(created.status, JSON.stringify(created.body)).toBe(201)
    const id = created.body._id as string

    const issued = await api.post(`/api/v1/invoices/${id}/issue`).set(auth(ownerToken)).send({})
    expect(issued.status, JSON.stringify(issued.body)).toBe(200)
    expect(issued.body._id).toBe(id)

    /* Issuing is once-only: the second attempt is a state conflict, not a
     * validation failure, so it is a 409. */
    const again = await api.post(`/api/v1/invoices/${id}/issue`).set(auth(ownerToken)).send({})
    expect(again.status).toBe(409)
    expect(again.body.error.code).toBe('conflict')
  })

  it('404s issue on a missing invoice', async () => {
    const res = await api
      .post('/api/v1/invoices/01JDOESNOTEXISTXXXXXXXXXXX/issue')
      .set(auth(ownerToken))
      .send({})
    expect(res.status).toBe(404)
  })
})
