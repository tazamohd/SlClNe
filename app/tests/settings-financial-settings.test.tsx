import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** `FinancialSettings` (BLK-004).
 *
 *  Previously seven hand-picked values, none read from anywhere:
 *  `Default Currency: 'SAR'`, `Fiscal Year Start: 'January 1'`, `Invoice
 *  Prefix: 'INV-'`, `Invoice Numbering: 'Sequential'`, `Payment Terms: 'Net
 *  30'`, `Tax Rate: '15%'` and `Rounding: '2 decimal places'`. `Tax Rate` was
 *  the exact hardcoded-VAT-literal bug PR #165 fixed on the tax-compliance
 *  screens, just not yet triggered here — now read from the same
 *  `organizationApi.taxProfile()` accessor those screens already use.
 *  `Fiscal Year Start` and `Payment Terms` describe policies this system does
 *  not have (no fiscal year in the schema; `dueDate` is required per invoice
 *  precisely because there is no default term) and are dropped.
 */

const flags = vi.hoisted(() => ({ live: false }))
const org = vi.hoisted(() => ({
  profile: null as Record<string, unknown> | null,
  fail: false,
}))

vi.mock('@/data/repository', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/data/repository')>()
  return {
    ...mod,
    get isLive() {
      return flags.live
    },
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

const PROFILE = {
  name: 'SALIS AUTO Riyadh',
  nameAr: null,
  vatNumber: '300123456700003',
  crNumber: '1010999888',
  vatRateBps: 1500,
  vatRateSource: 'deployment-configuration',
}

const FABRICATED = ['Fiscal Year Start', 'January 1', 'Payment Terms', 'Net 30', 'Rounding', '2 decimal places', 'Sequential']

beforeEach(() => {
  flags.live = false
  org.profile = null
  org.fail = false
})

describe('FinancialSettings', () => {
  it('fixture: reads no tax rate at all rather than showing a hand-picked one', async () => {
    const { FinancialSettings } = await import('@/screens/settings/FinancialSettings')
    renderScreen(FinancialSettings, { role: 'owner' })
    expect(screen.getByText(/can only be read from the API/)).toBeInTheDocument()
    expect(screen.queryByText('15%')).not.toBeInTheDocument()
    for (const fake of FABRICATED) expect(screen.queryByText(fake)).not.toBeInTheDocument()
  })

  it('live: shows the rate this deployment enforces — 5%, not the old 15% literal', async () => {
    flags.live = true
    org.profile = { ...PROFILE, vatRateBps: 500 }
    const { FinancialSettings } = await import('@/screens/settings/FinancialSettings')
    renderScreen(FinancialSettings, { role: 'owner' })
    expect(await screen.findByText('5.00%')).toBeInTheDocument()
    expect(screen.queryByText('15.00%')).not.toBeInTheDocument()
    expect(screen.queryByText('15%')).not.toBeInTheDocument()
  })

  it('live: shows the real invoice-numbering scheme and currency fact, not the old fixture rows', async () => {
    flags.live = true
    org.profile = PROFILE
    const { FinancialSettings } = await import('@/screens/settings/FinancialSettings')
    renderScreen(FinancialSettings, { role: 'owner' })
    await screen.findByText('15.00%')
    expect(screen.getByText('INV-<year>-<sequence>, assigned by the server')).toBeInTheDocument()
    for (const fake of FABRICATED) expect(screen.queryByText(fake)).not.toBeInTheDocument()
  })

  it('live: a failed read is an error state, never a substituted rate', async () => {
    flags.live = true
    org.fail = true
    const { FinancialSettings } = await import('@/screens/settings/FinancialSettings')
    renderScreen(FinancialSettings, { role: 'owner' })
    expect(await screen.findByText('Could not read the tax rate')).toBeInTheDocument()
    expect(screen.queryByText('15%')).not.toBeInTheDocument()
  })
})
