/** BLK-004 — `GET /organization/tax-profile`, the read behind the VAT and ZATCA
 *  compliance screens.
 *
 *  Those screens carried a hardcoded VAT registration number and a hardcoded
 *  `15%`. Both are tested here for the property that makes them safe to display:
 *  the registration number is whatever the organization's own row records —
 *  including *nothing*, for an organization that has recorded none — and the
 *  rate is whatever this deployment enforces, read from the same configuration
 *  the pricing rule and the tax return read. Neither can be a literal that
 *  happens to look right.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SEED, startHarness, type Harness } from './harness'

let harness: Harness

const auth = (token: string) => ({ headers: { authorization: `Bearer ${token}` } })

interface TaxProfile {
  name: string
  nameAr: string | null
  vatNumber: string | null
  crNumber: string | null
  vatRateBps: number
  vatRateSource: string
}

async function profile(token: string): Promise<{ status: number; body: TaxProfile }> {
  const res = await harness.app.inject({
    method: 'GET',
    url: '/api/v1/organization/tax-profile',
    ...auth(token),
  })
  return { status: res.statusCode, body: res.json() as TaxProfile }
}

beforeAll(async () => {
  harness = await startHarness()
}, 120_000)

afterAll(async () => {
  await harness?.close()
})

describe('GET /organization/tax-profile', () => {
  it('returns the caller organization’s own recorded registration numbers', async () => {
    const accountant = await harness.token('accountant')
    const { status, body } = await profile(accountant)
    expect(status, JSON.stringify(body)).toBe(200)
    expect(body.name).toBe('SALIS AUTO Riyadh')
    /* The number `POST /invoices/:id/issue` stamps onto an issued invoice and
     * into its ZATCA QR payload — one recorded value, one source. */
    expect(body.vatNumber).toBe('300123456700003')
  })

  it('reports the VAT rate this deployment enforces, not a literal', async () => {
    const accountant = await harness.token('accountant')
    const { body } = await profile(accountant)
    /* The assertion follows the configuration rather than restating 1500: a
     * deployment at another rate must move this number, which is the whole
     * reason the screen reads it instead of printing `15%`. */
    expect(body.vatRateBps).toBe(harness.env.VAT_RATE_BPS)
    expect(body.vatRateSource).toBe('deployment-configuration')
  })

  it('is the same rate the tax-return endpoint reports', async () => {
    const accountant = await harness.token('accountant')
    const { body } = await profile(accountant)
    const res = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/accounting/tax/return',
      ...auth(accountant),
    })
    expect(res.statusCode, res.body).toBe(200)
    expect((res.json() as { rateBps: number }).rateBps).toBe(body.vatRateBps)
  })

  it('returns null — never a plausible number — for an organization with none recorded', async () => {
    /* The neighbouring tenant records no VAT number, which is exactly the state
     * in which invoicing is blocked. The API says so with null. */
    const neighbour = await harness.token('accountant', {
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
    })
    const { status, body } = await profile(neighbour)
    expect(status, JSON.stringify(body)).toBe(200)
    expect(body.name).toBe('Neighbouring Garage')
    expect(body.vatNumber).toBeNull()
  })

  it('never returns another tenant’s registration number', async () => {
    const neighbour = await harness.token('accountant', {
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
    })
    const { body } = await profile(neighbour)
    expect(body.vatNumber).not.toBe('300123456700003')
  })

  it('refuses a role without accounting view — tax registration is not floor data', async () => {
    for (const role of ['technician', 'frontdesk', 'parts'] as const) {
      const res = await harness.app.inject({
        method: 'GET',
        url: '/api/v1/organization/tax-profile',
        ...auth(await harness.token(role)),
      })
      expect(res.statusCode, `${role}: ${res.body}`).toBe(403)
    }
  })

  it('refuses an unauthenticated caller', async () => {
    const res = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/organization/tax-profile',
    })
    expect(res.statusCode).toBe(401)
  })
})
