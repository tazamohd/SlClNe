import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderScreen } from './helpers/render'
import { setViewportWidth } from '@/test-setup'

/** The reporting suite as a user meets it. The invariant under test across all
 *  four screens: figures shown are the server's per-record values, counts are
 *  counts of records, and no screen prints a money total it summed itself —
 *  where one belongs, the aggregate gap is disclosed instead. */

const rows = vi.hoisted(() => ({
  invoices: [] as Record<string, unknown>[],
  expenses: [] as Record<string, unknown>[],
  chartOfAccounts: [] as Record<string, unknown>[],
  receipts: [] as Record<string, unknown>[],
  journalEntries: [] as Record<string, unknown>[],
}))

vi.mock('@/data/useCollection', async () => {
  const actual = await vi.importActual<typeof import('@/data/useCollection')>('@/data/useCollection')
  const store = () => rows as Record<string, Record<string, unknown>[]>
  return {
    ...actual,
    useCollection: (key: string) => ({
      data: store()[key] ?? [],
      isLoading: false,
      error: null,
      refetch: () => undefined,
    }),
    usePagedCollection: (key: string) => ({
      data: {
        rows: store()[key] ?? [],
        page: { page: 1, pageSize: 50, total: (store()[key] ?? []).length, totalPages: 1 },
      },
      isLoading: false,
      error: null,
      refetch: () => undefined,
    }),
  }
})

function serverInvoice(over: Record<string, unknown> = {}) {
  return {
    _id: '01JX0000000000000000000001',
    id: 'INV-2026-0142',
    cust: 'Ahmed Al-Rashid',
    amount: 'SAR 1,840',
    due: 'Jul 28, 2026',
    status: 'unpaid',
    subtotalHalalas: 160_000,
    taxHalalas: 24_000,
    discountHalalas: 0,
    totalHalalas: 184_000,
    paidHalalas: 50_000,
    balanceHalalas: 134_000,
    issuedAt: '2026-07-14T09:00:00.000Z',
    ...over,
  }
}

beforeEach(() => {
  rows.invoices = [serverInvoice()]
  rows.expenses = [{ _id: 'E1', id: 'EXP-1', date: 'Jul 1, 2026', category: 'Utilities', vendor: 'SEC', amount: 'SAR 900', status: 'approved' }]
  rows.chartOfAccounts = [
    { _id: 'A1', code: '1000', name: 'Cash', type: 'Assets', balance: 'SAR 500,000', children: 0 },
    { _id: 'A2', code: '2000', name: 'Payables', type: 'Liabilities', balance: 'SAR 200,000', children: 0 },
  ]
  rows.receipts = []
  rows.journalEntries = []
})

afterEach(() => {
  vi.clearAllMocks()
  setViewportWidth(1280)
})

// ── Reports hub ──────────────────────────────────────────────────────────────

describe('the reports hub', () => {
  it('links to the revenue report and shows its server record count', async () => {
    const { Reports } = await import('@/screens/accounting/ReportSuite')
    renderScreen(Reports, { role: 'accountant' })

    const sales = screen.getByRole('link', { name: /Sales Reports/ })
    expect(sales).toHaveAttribute('href', '/sales-reports')
    expect(within(sales).getByText('1')).toBeInTheDocument()
    expect(within(sales).getByText(/records on the server/)).toBeInTheDocument()
  })
})

// ── SalesReports ─────────────────────────────────────────────────────────────

describe('sales reports', () => {
  it('shows each invoice’s server total and balance, and discloses the period gap', async () => {
    const { SalesReports } = await import('@/screens/accounting/ReportSuite')
    renderScreen(SalesReports, { role: 'accountant' })

    // The total appears in the table and again as one bar in the largest chart.
    expect(screen.getAllByText('SAR 1,840.00').length).toBeGreaterThan(0)
    // The balance is a table-only figure — the server's, not one it subtracted.
    expect(screen.getByText('SAR 1,340.00')).toBeInTheDocument()
    expect(screen.getByText('Period totals are computed by the server')).toBeInTheDocument()
    expect(screen.getByText(/GET \/invoices\/summary/)).toBeInTheDocument()
  })

  it('filters by status without spending a request', async () => {
    rows.invoices = [serverInvoice(), serverInvoice({ _id: 'X2', id: 'INV-2026-0140', status: 'paid' })]
    const user = userEvent.setup()
    const { SalesReports } = await import('@/screens/accounting/ReportSuite')
    renderScreen(SalesReports, { role: 'accountant' })

    expect(screen.getAllByText('INV-2026-0140').length).toBeGreaterThan(0)
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'unpaid')
    expect(screen.queryAllByText('INV-2026-0140')).toHaveLength(0)
    expect(screen.getAllByText('INV-2026-0142').length).toBeGreaterThan(0)
  })

  it('offers a CSV export of what is on screen', async () => {
    const { SalesReports } = await import('@/screens/accounting/ReportSuite')
    renderScreen(SalesReports, { role: 'accountant' })
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeEnabled()
  })
})

// ── ReportsAnalytics ─────────────────────────────────────────────────────────

describe('analytics overview', () => {
  it('counts records as integers and never dresses a count as money', async () => {
    const { ReportsAnalytics } = await import('@/screens/accounting/ReportSuite')
    renderScreen(ReportsAnalytics, { role: 'owner' })

    expect(screen.getByText('Invoices by status')).toBeInTheDocument()
    // A count of one invoice is a plain integer — never "SAR 1.00", which is
    // what a money chart would have made of it. Two account types, likewise.
    expect(screen.queryByText('SAR 1.00')).not.toBeInTheDocument()
    expect(screen.queryByText('SAR 2.00')).not.toBeInTheDocument()
    // The one money chart still shows a real server total per invoice.
    expect(screen.getByText('SAR 1,840.00')).toBeInTheDocument()
    // The money roll-up is disclosed as the server's, not summed here.
    expect(screen.getByText(/GET \/accounting\/reports\/trial-balance/)).toBeInTheDocument()
  })
})

// ── CustomReports ────────────────────────────────────────────────────────────

describe('custom reports', () => {
  it('previews live rows from the chosen source and exports them', async () => {
    const { CustomReports } = await import('@/screens/accounting/ReportSuite')
    renderScreen(CustomReports, { role: 'accountant' })

    // Default source is invoices; the server's formatted amount is shown as-is.
    expect(screen.getByText('INV-2026-0142')).toBeInTheDocument()
    expect(screen.getByText('SAR 1,840')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeEnabled()
  })

  it('switches the source and rebuilds the columns', async () => {
    const user = userEvent.setup()
    const { CustomReports } = await import('@/screens/accounting/ReportSuite')
    renderScreen(CustomReports, { role: 'accountant' })

    await user.selectOptions(screen.getByLabelText('Data source'), 'chartOfAccounts')
    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(screen.getByText('SAR 500,000')).toBeInTheDocument()
    expect(screen.queryByText('INV-2026-0142')).not.toBeInTheDocument()
  })

  it('GAP: is honest that saved report definitions need a server collection', async () => {
    const { CustomReports } = await import('@/screens/accounting/ReportSuite')
    renderScreen(CustomReports, { role: 'accountant' })
    expect(screen.getByText(/savedReports collection on the server/)).toBeInTheDocument()
  })
})
