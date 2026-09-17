/** F-029 (1) — the estimate money breakdown and submitter reach the wire.
 *
 *  `estimates` `present()` used to expose only `totalHalalas`, so no screen
 *  could render the VAT split EstimateDetail / DiagnosticReport show (§5b
 *  forbids re-deriving it client-side), and the SOD row check had no submitter
 *  to read. This pins that the subtotal/tax/discount split and `submittedBy`
 *  are on the presented row, with the seeded numbers, and stay tenant-scoped.
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

describe('F-029 · the estimate money fields are on the wire', () => {
  it('presents subtotal, tax, discount and total, summing to the seeded gross', async () => {
    const manager = await harness.token('manager')
    /* EST-0230 is the seeded "sent" estimate, SAR 3,600 gross. The seed backs
     * out the VAT from the gross: subtotal = round(360000 / 1.15). */
    const response = await get('/estimates/EST-0230', manager)
    expect(response.statusCode, response.body).toBe(200)
    const row = response.json() as {
      subtotalHalalas: number
      taxHalalas: number
      discountHalalas: number
      totalHalalas: number
      submittedBy: string | null
    }
    expect(row.totalHalalas).toBe(360000)
    expect(row.subtotalHalalas).toBe(313043)
    expect(row.taxHalalas).toBe(46957)
    expect(row.discountHalalas).toBe(0)
    /* subtotal + tax - discount reconstructs the gross exactly (integer halalas). */
    expect(row.subtotalHalalas + row.taxHalalas - row.discountHalalas).toBe(row.totalHalalas)
  })

  it('presents the submitter the SOD row check reads', async () => {
    const manager = await harness.token('manager')
    const response = await get('/estimates/EST-0230', manager)
    /* The seed records the system user as the raiser of every fixture estimate;
     * a live create captures the acting principal instead. */
    expect((response.json() as { submittedBy: string | null }).submittedBy).toBeTruthy()
  })

  it("does not serve another organization's estimate", async () => {
    const stranger = await harness.token('manager', { orgId: '01JBBBBBBBBBBBBBBBBBBBBBB2' })
    const response = await get('/estimates/EST-0230', stranger)
    expect(response.statusCode).toBe(404)
  })

  it('presents validUntil null when the seed set none', async () => {
    const manager = await harness.token('manager')
    const response = await get('/estimates/EST-0230', manager)
    expect((response.json() as { validUntil: string | null }).validUntil).toBeNull()
  })

  it('presents validUntil for an estimate created with one, unchanged by the round trip', async () => {
    const advisor = await harness.token('advisor')
    const validUntil = '2026-12-01T00:00:00.000Z'
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/estimates',
      headers: { authorization: `Bearer ${advisor}`, 'content-type': 'application/json' },
      payload: {
        customerName: 'Expiry Test Customer',
        vehicleLabel: 'Toyota Camry 2021',
        validUntil,
        lines: [{ description: 'Oil filter', kind: 'part', qty: 1, unitPriceHalalas: 4_500 }],
      },
    })
    expect(created.statusCode, created.body).toBe(201)
    const row = created.json() as { _id: string; validUntil: string | null }
    expect(row.validUntil).toBe(validUntil)

    const response = await get(`/estimates/${row._id}`, advisor)
    expect((response.json() as { validUntil: string | null }).validUntil).toBe(validUntil)
  })
})
