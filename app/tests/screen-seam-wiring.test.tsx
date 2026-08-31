import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'
import { setViewportWidth } from '@/test-setup'
import { OEMIntegrations } from '@/screens/admin/OEMIntegrations'
import { SystemIntegrations } from '@/screens/admin/SystemIntegrations'
import { ExpensesManagement } from '@/screens/accounting/ExpensesManagement'
import { EmailMarketingCampaigns } from '@/screens/marketing/EmailMarketingCampaigns'
import { Reports } from '@/screens/accounting/ReportSuite'

/** Screens moved off a hardcoded local array and onto the repository seam.
 *
 *  Two things are asserted for each, and the second matters more than the first:
 *  the rows on screen are the ones the repository returned, and the figures the
 *  collection cannot supply are **absent and disclosed** rather than carried over
 *  from the array they used to come from. A screen that kept a plausible-looking
 *  number after being "wired" would pass a render test and still be lying, so
 *  every case below pins the invented value as gone by name.
 *
 *  No API is configured here, so `repository` resolves to the design fixtures —
 *  the same seam a live build reads through, with the same shapes.
 */

beforeEach(() => {
  setViewportWidth(1280)
})

describe('OEM Integrations reads oemTools', () => {
  it('renders the tools the collection returned', async () => {
    renderScreen(OEMIntegrations, { role: 'owner' })

    expect(await screen.findByText('Techstream')).toBeInTheDocument()
    expect(screen.getByText('Toyota / Lexus')).toBeInTheDocument()
    // Coverage and licence are the row's own server values, shown as given.
    expect(screen.getByText('412')).toBeInTheDocument()
    expect(screen.getAllByText('J2534 · CAN').length).toBeGreaterThan(0)
  })

  it('GAP: drops the sync clock and record count it cannot source, and names the read', async () => {
    renderScreen(OEMIntegrations, { role: 'owner' })
    await screen.findByText('Techstream')

    // The old array's invented figures. `oemTools` carries neither.
    expect(screen.queryByText('10 min ago')).not.toBeInTheDocument()
    expect(screen.queryByText('42,500')).not.toBeInTheDocument()
    expect(screen.getByText(/GET \/diagnostics\/integrations/)).toBeInTheDocument()
  })
})

describe('System Integrations reads integrations', () => {
  it('renders the connectors and groups them by the category the data carries', async () => {
    renderScreen(SystemIntegrations, { role: 'owner' })

    expect(await screen.findByText('ZATCA E-Invoicing')).toBeInTheDocument()
    expect(screen.getByText('Phase 2 clearance · 15% VAT · QR')).toBeInTheDocument()
    expect(screen.getByText('Government')).toBeInTheDocument()
    // A category no longer in a fixed list — it comes from the rows themselves.
    expect(screen.getByText('Telematics')).toBeInTheDocument()
  })

  it('GAP: shows no adapter version or last-activity clock, and names the read', async () => {
    renderScreen(SystemIntegrations, { role: 'owner' })
    await screen.findByText('ZATCA E-Invoicing')

    expect(screen.queryByText('v3.1')).not.toBeInTheDocument()
    expect(screen.queryByText(/5 min ago/)).not.toBeInTheDocument()
    expect(screen.getByText(/GET \/diagnostics\/integrations/)).toBeInTheDocument()
  })
})

describe('Expenses Management reads expenses', () => {
  it('shows each expense with the amount the server formatted', async () => {
    renderScreen(ExpensesManagement, { role: 'accountant' })

    expect(await screen.findByText('EXP-0045')).toBeInTheDocument()
    expect(screen.getByText('Jarir Bookstore')).toBeInTheDocument()
    expect(screen.getByText('SAR 450.00')).toBeInTheDocument()
  })

  it('GAP: invents no budget, and names the aggregate that would supply one', async () => {
    renderScreen(ExpensesManagement, { role: 'accountant' })
    await screen.findByText('EXP-0045')

    // The eight budgeted categories the screen used to print were a local array.
    expect(screen.queryByText('Salaries & Wages')).not.toBeInTheDocument()
    expect(screen.queryByText('SAR 90,000.00')).not.toBeInTheDocument()
    expect(screen.queryByText('Under Budget')).not.toBeInTheDocument()
    expect(screen.getByText(/GET \/accounting\/expenses\/summary/)).toBeInTheDocument()
  })

  it('counts records rather than summing money', async () => {
    renderScreen(ExpensesManagement, { role: 'accountant' })
    await screen.findByText('EXP-0045')

    // Five fixture rows, reported as a count and captioned as the server's.
    expect(screen.getByText('records on the server')).toBeInTheDocument()
    expect(screen.getAllByText('Expenses by category').length).toBeGreaterThan(0)
  })
})

describe('Email Marketing Campaigns reads campaigns', () => {
  it('shows the email channel only, with each campaign’s own rates', async () => {
    renderScreen(EmailMarketingCampaigns, { role: 'owner' })

    expect(await screen.findByText('Summer Service Offer')).toBeInTheDocument()
    // 1,840 opens of 2,450 reached — this row's two counts, not a page average.
    expect(screen.getByText('75%')).toBeInTheDocument()
    // SMS and WhatsApp campaigns belong to the other channel screens.
    expect(screen.queryByText('Ramadan Discount')).not.toBeInTheDocument()
  })

  it('GAP: carries over no subject line, send count or send date', async () => {
    renderScreen(EmailMarketingCampaigns, { role: 'owner' })
    await screen.findByText('Summer Service Offer')

    expect(screen.queryByText('20% Off All AC Services')).not.toBeInTheDocument()
    expect(screen.queryByText('EC-001')).not.toBeInTheDocument()
    expect(screen.getByText(/GET \/crm\/campaigns\/:id\/messages/)).toBeInTheDocument()
  })
})

describe('the reports hub reads savedReports', () => {
  it('lists what the server holds, and says so honestly when it holds none', async () => {
    renderScreen(Reports, { role: 'accountant' })

    expect(await screen.findByText('Saved reports')).toBeInTheDocument()
    // The fixture build persists no report definitions — an empty collection
    // renders the empty state, never a blank panel.
    expect(await screen.findByText('No saved reports yet')).toBeInTheDocument()
  })

  it('keeps the report links, which are navigation rather than data', () => {
    renderScreen(Reports, { role: 'accountant' })
    expect(screen.getByRole('link', { name: /Sales Reports/ })).toHaveAttribute(
      'href',
      '/sales-reports',
    )
  })
})
