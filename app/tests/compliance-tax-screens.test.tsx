import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'
import { setViewportWidth } from '@/test-setup'

/** BLK-004 — the three tax-compliance screens.
 *
 *  What is under test is not "does 15% render". A test asserting that would have
 *  passed against the hardcoded `'15%'` these screens used to carry, which is
 *  exactly the defect. Each assertion here pins the *source*: the rate follows
 *  whatever the server reports (proved with a deployment at 5%, not 15%), the
 *  registration number is whatever the organization's row records (proved by the
 *  null case, which must read as "not recorded" and never as a number), and no
 *  monetary figure appears unless the server computed it.
 *
 *  The fabricated literals are asserted *absent* by value, so a future edit that
 *  reintroduces one fails here.
 */

const flags = vi.hoisted(() => ({ live: false }))
const org = vi.hoisted(() => ({
  profile: null as Record<string, unknown> | null,
  fail: false,
}))
const finance = vi.hoisted(() => ({ tax: null as Record<string, unknown> | null }))

vi.mock('@/data/repository', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/data/repository')>()
  return {
    ...mod,
    get isLive() {
      return flags.live
    },
    /* Null on the fixture path, exactly as the real accessor is when
     * `VITE_API_URL` is unset — there is no mock tax profile, by design. */
    get organizationApi() {
      return org.profile || org.fail
        ? {
            taxProfile: async () => {
              if (org.fail) throw new Error('boom')
              return org.profile
            },
          }
        : null
    },
  }
})

vi.mock('@/screens/accounting/useFinanceReports', () => ({
  useInvoicesSummary: () => ({ data: null, isLoading: false, error: null, refetch: () => undefined }),
  useTaxReturn: () => ({ data: finance.tax, isLoading: false, error: null, refetch: () => undefined }),
  useTrialBalance: () => ({ data: null, isLoading: false, error: null, refetch: () => undefined }),
}))

/** A registration number of the right shape that is *not* the one the old
 *  screens hardcoded, so "renders the recorded number" cannot pass by accident. */
const RECORDED_VAT = '300123456700003'
const FABRICATED = ['311234567890003', '300075588700003']

const profile = (over: Record<string, unknown> = {}) => ({
  name: 'SALIS AUTO Riyadh',
  nameAr: null,
  vatNumber: RECORDED_VAT,
  crNumber: '1010999888',
  vatRateBps: 1500,
  vatRateSource: 'deployment-configuration',
  ...over,
})

const TAX_RETURN = {
  range: { from: null, to: null },
  rateBps: 1500,
  invoiceCount: 3,
  taxableSalesHalalas: 500_000,
  grossSalesHalalas: 575_000,
  outputVatHalalas: 75_000,
  inputVatModelled: false,
  inputVatHalalas: 0,
  netVatPayableHalalas: 75_000,
}

beforeEach(() => {
  flags.live = false
  org.profile = null
  org.fail = false
  finance.tax = null
})

// ── VATSettings ──────────────────────────────────────────────────────────────

describe('VATSettings', () => {
  it('fixture: shows the contract rate from the shared constant, not a literal', async () => {
    const { VAT_RATE_BPS } = await import('@/screens/finance/money')
    const { VATSettings } = await import('@/screens/compliance/VATSettings')
    renderScreen(VATSettings, { role: 'accountant' })
    /* Follows the constant the pricing rule uses: change the constant and this
     * assertion moves with it. */
    expect(screen.getByText(`${(VAT_RATE_BPS / 100).toFixed(2)}%`)).toBeInTheDocument()
    expect(screen.getByText('Contract standard rate')).toBeInTheDocument()
  })

  it('live: shows the rate this deployment enforces — 5%, not 15%', async () => {
    flags.live = true
    org.profile = profile({ vatRateBps: 500 })
    const { VATSettings } = await import('@/screens/compliance/VATSettings')
    renderScreen(VATSettings, { role: 'accountant' })
    expect(await screen.findByText('5.00%')).toBeInTheDocument()
    expect(screen.queryByText('15.00%')).not.toBeInTheDocument()
    expect(screen.getByText('Deployment configuration')).toBeInTheDocument()
  })

  it('live: shows the VAT number the organization record holds', async () => {
    flags.live = true
    org.profile = profile()
    const { VATSettings } = await import('@/screens/compliance/VATSettings')
    renderScreen(VATSettings, { role: 'accountant' })
    expect(await screen.findByText(RECORDED_VAT)).toBeInTheDocument()
    expect(screen.getByText('1010999888')).toBeInTheDocument()
  })

  it('live: an organization with no VAT number reads as not recorded, with the consequence', async () => {
    flags.live = true
    org.profile = profile({ vatNumber: null, crNumber: null })
    const { VATSettings } = await import('@/screens/compliance/VATSettings')
    renderScreen(VATSettings, { role: 'accountant' })
    expect(await screen.findAllByText('Not recorded')).toHaveLength(2)
    expect(screen.getByText(/refuses to issue an invoice/)).toBeInTheDocument()
  })

  it('live: a failed read is an error state, never a substituted number', async () => {
    flags.live = true
    org.fail = true
    const { VATSettings } = await import('@/screens/compliance/VATSettings')
    renderScreen(VATSettings, { role: 'accountant' })
    expect(await screen.findByText('Could not read the organization record')).toBeInTheDocument()
    for (const fake of FABRICATED) expect(screen.queryByText(fake)).not.toBeInTheDocument()
  })

  it('live: output VAT is the server’s figure, and no net VAT is shown', async () => {
    flags.live = true
    org.profile = profile()
    finance.tax = TAX_RETURN
    const { VATSettings } = await import('@/screens/compliance/VATSettings')
    renderScreen(VATSettings, { role: 'accountant' })
    expect(await screen.findByText('SAR 750.00')).toBeInTheDocument() // outputVatHalalas
    expect(screen.getByText('Not modelled')).toBeInTheDocument()
    /* `netVatPayableHalalas` is in the payload and deliberately never rendered:
     * with input VAT unmodelled it is not a filing figure. */
    expect(screen.queryByText(/Net VAT/)).not.toBeInTheDocument()
  })

  it('fixture: discloses the VAT-return gap instead of a period total', async () => {
    const { VATSettings } = await import('@/screens/compliance/VATSettings')
    renderScreen(VATSettings, { role: 'accountant' })
    expect(screen.getByText(/GET \/accounting\/tax\/return/)).toBeInTheDocument()
  })

  it('no fabricated registration number or invented tax total survives', async () => {
    flags.live = true
    org.profile = profile()
    finance.tax = TAX_RETURN
    const { VATSettings } = await import('@/screens/compliance/VATSettings')
    renderScreen(VATSettings, { role: 'accountant' })
    await screen.findByText(RECORDED_VAT)
    for (const fake of FABRICATED) expect(screen.queryByText(fake)).not.toBeInTheDocument()
    // The old SUMMARY figures: 187,500 / 62,300 / 125,200.
    for (const amount of ['SAR 187,500.00', 'SAR 62,300.00', 'SAR 125,200.00']) {
      expect(screen.queryByText(amount)).not.toBeInTheDocument()
    }
    // The old CONFIG filing fields.
    expect(screen.queryByText('Quarterly')).not.toBeInTheDocument()
    expect(screen.queryByText('2026-09-30')).not.toBeInTheDocument()
    expect(screen.getByText(/no filing frequency or filing date is recorded/)).toBeInTheDocument()
  })
})

describe('who may open these screens', () => {
  /** The screens are gated on the same module as the endpoints behind them
   *  (`accounting:v`, server-side), so no role can open a screen whose data it
   *  would be refused. This narrows access — they were ungated — and widens
   *  nothing: the module and its grants already existed. */
  it('follows the accounting module, the same gate the endpoints enforce', async () => {
    const { canScreen } = await import('@/data/rbac')
    for (const screen of ['VAT-Settings', 'ZATCA-Settings', 'Zakat-Settings']) {
      for (const role of ['owner', 'superadmin', 'manager', 'accountant', 'test']) {
        expect(canScreen(screen, role), `${role} on ${screen}`).toBe(true)
      }
      for (const role of ['technician', 'frontdesk', 'parts', 'advisor', 'qc', 'hr', 'customer', 'supplier']) {
        expect(canScreen(screen, role), `${role} on ${screen}`).toBe(false)
      }
    }
  })
})

describe('the mobile branch renders the same sourced values', () => {
  beforeEach(() => {
    setViewportWidth(390)
  })

  afterEach(() => {
    setViewportWidth(1440)
  })

  it('VATSettings: the enforced rate and the recorded number, on a phone', async () => {
    flags.live = true
    org.profile = profile({ vatRateBps: 500 })
    finance.tax = TAX_RETURN
    const { VATSettings } = await import('@/screens/compliance/VATSettings')
    renderScreen(VATSettings, { role: 'accountant' })
    expect(await screen.findByText(RECORDED_VAT)).toBeInTheDocument()
    expect(screen.getByText('5.00%')).toBeInTheDocument()
    for (const fake of FABRICATED) expect(screen.queryByText(fake)).not.toBeInTheDocument()
  })

  it('ZATCASettings: the seller identity and the integration gap, on a phone', async () => {
    flags.live = true
    org.profile = profile()
    const { ZATCASettings } = await import('@/screens/compliance/ZATCASettings')
    renderScreen(ZATCASettings, { role: 'accountant' })
    expect(await screen.findByText(RECORDED_VAT)).toBeInTheDocument()
    expect(screen.getByText(/no ZATCA integration is configured/)).toBeInTheDocument()
  })

  it('ZakatSettings: the filing registration and the zakat gap, on a phone', async () => {
    flags.live = true
    org.profile = profile()
    const { ZakatSettings } = await import('@/screens/compliance/ZakatSettings')
    renderScreen(ZakatSettings, { role: 'accountant' })
    expect(await screen.findByText(RECORDED_VAT)).toBeInTheDocument()
    expect(screen.getByText(/no zakat base, zakat due/)).toBeInTheDocument()
  })
})

// ── ZATCASettings ────────────────────────────────────────────────────────────

describe('ZATCASettings', () => {
  it('live: the seller VAT number is the recorded one, and the rate follows the server', async () => {
    flags.live = true
    org.profile = profile({ vatRateBps: 500 })
    const { ZATCASettings } = await import('@/screens/compliance/ZATCASettings')
    renderScreen(ZATCASettings, { role: 'accountant' })
    expect(await screen.findByText(RECORDED_VAT)).toBeInTheDocument()
    expect(screen.getByText('5.00%')).toBeInTheDocument()
  })

  it('declares the integration gap and drops the fabricated status, phase and sync', async () => {
    flags.live = true
    org.profile = profile()
    const { ZATCASettings } = await import('@/screens/compliance/ZATCASettings')
    renderScreen(ZATCASettings, { role: 'accountant' })
    await screen.findByText(RECORDED_VAT)
    expect(screen.getByText(/no ZATCA integration is configured/)).toBeInTheDocument()
    expect(screen.queryByText('Connected')).not.toBeInTheDocument()
    expect(screen.queryByText('Phase 2')).not.toBeInTheDocument()
    expect(screen.queryByText('2026-08-17 14:32')).not.toBeInTheDocument()
    /* A button that called no endpoint. */
    expect(screen.queryByRole('button', { name: 'Test Connection' })).not.toBeInTheDocument()
  })

  it('drops the fabricated organization TIN entirely — nothing records one', async () => {
    flags.live = true
    org.profile = profile()
    const { ZATCASettings } = await import('@/screens/compliance/ZATCASettings')
    renderScreen(ZATCASettings, { role: 'accountant' })
    await screen.findByText(RECORDED_VAT)
    for (const fake of FABRICATED) expect(screen.queryByText(fake)).not.toBeInTheDocument()
    expect(screen.queryByText('Organization TIN')).not.toBeInTheDocument()
  })

  it('fixture: shows no registration number at all rather than a stand-in', async () => {
    const { ZATCASettings } = await import('@/screens/compliance/ZATCASettings')
    renderScreen(ZATCASettings, { role: 'accountant' })
    expect(screen.getByText(/can only be read from the API/)).toBeInTheDocument()
    for (const fake of FABRICATED) expect(screen.queryByText(fake)).not.toBeInTheDocument()
  })
})

// ── ZakatSettings ────────────────────────────────────────────────────────────

describe('ZakatSettings', () => {
  it('declares the zakat gap and shows no invented base or amount', async () => {
    flags.live = true
    org.profile = profile()
    const { ZakatSettings } = await import('@/screens/compliance/ZakatSettings')
    renderScreen(ZakatSettings, { role: 'accountant' })
    expect(await screen.findByText(RECORDED_VAT)).toBeInTheDocument()
    expect(screen.getByText(/no zakat base, zakat due, assessment year or filing status/)).toBeInTheDocument()
    // The old CONFIG: zakatBase 4,850,000 and estimatedZakat 121,250.
    for (const amount of ['SAR 4,850,000.00', 'SAR 121,250.00', 'SAR 4,850,000', 'SAR 121,250']) {
      expect(screen.queryByText(amount)).not.toBeInTheDocument()
    }
    expect(screen.queryByText('Pending')).not.toBeInTheDocument()
    expect(screen.queryByText('2026')).not.toBeInTheDocument()
  })

  it('states the statutory rate as law, not as a configured setting', async () => {
    flags.live = true
    org.profile = profile()
    const { ZakatSettings } = await import('@/screens/compliance/ZakatSettings')
    renderScreen(ZakatSettings, { role: 'accountant' })
    await screen.findByText(RECORDED_VAT)
    expect(screen.getByText(/stated here as law, not as a setting/)).toBeInTheDocument()
    /* The rate never appears as a value row of its own. */
    expect(screen.queryByText('2.5%')).not.toBeInTheDocument()
  })

  it('fixture: reads no registration number rather than inventing one', async () => {
    const { ZakatSettings } = await import('@/screens/compliance/ZakatSettings')
    renderScreen(ZakatSettings, { role: 'accountant' })
    expect(screen.getByText(/can only be read from the API/)).toBeInTheDocument()
    for (const fake of FABRICATED) expect(screen.queryByText(fake)).not.toBeInTheDocument()
  })
})
