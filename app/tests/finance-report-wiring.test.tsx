import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'
import { setViewportWidth } from '@/test-setup'

/** The tranche-5 wiring: each report shows the server-computed aggregate on the
 *  live path and keeps the honest AGGREGATE_GAP notice on the fixture path.
 *
 *  Both paths are proven per report. `isLive` is toggled through a mock of
 *  `@/data/repository`; the aggregate hooks are mocked so no real endpoint is
 *  hit — the point under test is that the screen *displays* the server figure
 *  and *drops the gap* only when live, and never sums a money total itself. */

const flags = vi.hoisted(() => ({ live: false }))
const finance = vi.hoisted(() => ({
  summary: null as Record<string, unknown> | null,
  tax: null as Record<string, unknown> | null,
  tb: null as Record<string, unknown> | null,
}))
const rows = vi.hoisted(() => ({
  invoices: [] as Record<string, unknown>[],
  expenses: [] as Record<string, unknown>[],
  chartOfAccounts: [] as Record<string, unknown>[],
  receipts: [] as Record<string, unknown>[],
  journalEntries: [] as Record<string, unknown>[],
  bankStatements: [] as Record<string, unknown>[],
  savedReports: [] as Record<string, unknown>[],
}))

vi.mock('@/data/repository', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/data/repository')>()
  return {
    ...mod,
    get isLive() {
      return flags.live
    },
  }
})

vi.mock('@/screens/accounting/useFinanceReports', () => ({
  useInvoicesSummary: () => ({ data: finance.summary, isLoading: false, error: null, refetch: () => undefined }),
  useTaxReturn: () => ({ data: finance.tax, isLoading: false, error: null, refetch: () => undefined }),
  useTrialBalance: () => ({ data: finance.tb, isLoading: false, error: null, refetch: () => undefined }),
}))

vi.mock('@/data/useCollection', async () => {
  const actual = await vi.importActual<typeof import('@/data/useCollection')>('@/data/useCollection')
  const store = () => rows as Record<string, Record<string, unknown>[]>
  return {
    ...actual,
    useCollection: (key: string) => ({
      data: store()[key] ?? [],
      isLoading: false,
      isError: false,
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

const SUMMARY = {
  range: { from: null, to: null },
  count: 3,
  invoicedHalalas: 500_000,
  subtotalHalalas: 430_000,
  vatHalalas: 75_000,
  discountHalalas: 5_000,
  paidHalalas: 300_000,
  outstandingHalalas: 200_000,
  byStatus: [{ status: 'unpaid', count: 1, invoicedHalalas: 200_000, outstandingHalalas: 200_000 }],
}

const TAX = {
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

const TRIAL_BALANCE = {
  accounts: [],
  totals: { debitHalalas: 268_350_000, creditHalalas: 294_055_000, differenceHalalas: -25_705_000 },
  balanced: false,
  balanceSheet: {
    assetsHalalas: 268_350_000,
    liabilitiesHalalas: 200_000_000,
    equityHalalas: 94_055_000,
    liabilitiesPlusEquityHalalas: 294_055_000,
    differenceHalalas: -25_705_000,
    balanced: false,
  },
  profitAndLoss: { revenueHalalas: 120_000_000, expenseHalalas: 80_000_000, netHalalas: 40_000_000 },
  journal: { postedDebitHalalas: 268_350_000, postedCreditHalalas: 294_055_000, postedCount: 42, draftCount: 3 },
}

const GAP_HEADING = 'Period totals are computed by the server'
const LIVE_HEADING = 'Totals computed by the server'

beforeEach(() => {
  flags.live = false
  finance.summary = null
  finance.tax = null
  finance.tb = null
  rows.invoices = [serverInvoice()]
  rows.expenses = []
  rows.chartOfAccounts = [
    { _id: 'A1', code: '1000', name: 'Cash', type: 'Assets', balance: 'SAR 500,000', children: 0 },
    { _id: 'A2', code: '2000', name: 'Payables', type: 'Liabilities', balance: 'SAR 200,000', children: 0 },
    { _id: 'A3', code: '3000', name: 'Capital', type: 'Equity', balance: 'SAR 100,000', children: 0 },
  ]
  rows.receipts = []
  rows.journalEntries = []
  rows.bankStatements = []
  rows.savedReports = []
})

afterEach(() => {
  vi.clearAllMocks()
  setViewportWidth(1280)
})

// ── SalesReports ─────────────────────────────────────────────────────────────

describe('SalesReports — invoicesSummary', () => {
  it('fixture: discloses the period gap, no server total', async () => {
    const { SalesReports } = await import('@/screens/accounting/ReportSuite')
    renderScreen(SalesReports, { role: 'accountant' })
    expect(screen.getByText(GAP_HEADING)).toBeInTheDocument()
    expect(screen.getByText(/GET \/invoices\/summary/)).toBeInTheDocument()
    expect(screen.queryByText(LIVE_HEADING)).not.toBeInTheDocument()
  })

  it('live: shows the server-computed invoiced/paid/outstanding/VAT totals and drops the gap', async () => {
    flags.live = true
    finance.summary = SUMMARY
    const { SalesReports } = await import('@/screens/accounting/ReportSuite')
    renderScreen(SalesReports, { role: 'accountant' })
    expect(screen.queryByText(GAP_HEADING)).not.toBeInTheDocument()
    expect(screen.getByText(LIVE_HEADING)).toBeInTheDocument()
    expect(screen.getByText('SAR 5,000.00')).toBeInTheDocument() // invoiced
    expect(screen.getByText('SAR 3,000.00')).toBeInTheDocument() // paid
    expect(screen.getByText('SAR 750.00')).toBeInTheDocument() // output VAT
  })
})

// ── TaxManagement ────────────────────────────────────────────────────────────

describe('TaxManagement — taxReturn', () => {
  it('fixture: discloses the VAT-return gap', async () => {
    const { TaxManagement } = await import('@/screens/finance/TaxManagement')
    renderScreen(TaxManagement, { role: 'accountant' })
    expect(screen.getByText(GAP_HEADING)).toBeInTheDocument()
    expect(screen.getByText(/GET \/accounting\/tax\/return/)).toBeInTheDocument()
  })

  it('live: shows output VAT at the rate and honours inputVatModelled:false (no net payable)', async () => {
    flags.live = true
    finance.tax = TAX
    const { TaxManagement } = await import('@/screens/finance/TaxManagement')
    renderScreen(TaxManagement, { role: 'accountant' })
    expect(screen.queryByText(GAP_HEADING)).not.toBeInTheDocument()
    expect(screen.getByText('SAR 750.00')).toBeInTheDocument() // output VAT figure
    expect(screen.getByText('Not modelled')).toBeInTheDocument()
    expect(screen.getByText(/no net payable is shown/)).toBeInTheDocument()
  })
})

// ── ReportsAnalytics ─────────────────────────────────────────────────────────

describe('ReportsAnalytics — trialBalance', () => {
  it('fixture: discloses the ledger gap', async () => {
    const { ReportsAnalytics } = await import('@/screens/accounting/ReportSuite')
    renderScreen(ReportsAnalytics, { role: 'owner' })
    expect(screen.getByText(GAP_HEADING)).toBeInTheDocument()
    expect(screen.getByText(/GET \/accounting\/reports\/trial-balance/)).toBeInTheDocument()
  })

  it('live: renders F-008’s imbalance honestly and drops the gap', async () => {
    flags.live = true
    finance.tb = TRIAL_BALANCE
    const { ReportsAnalytics } = await import('@/screens/accounting/ReportSuite')
    renderScreen(ReportsAnalytics, { role: 'owner' })
    expect(screen.queryByText(GAP_HEADING)).not.toBeInTheDocument()
    expect(screen.getByText(LIVE_HEADING)).toBeInTheDocument()
    expect(
      screen.getByText('Assets do not equal liabilities plus equity in the seeded ledger.'),
    ).toBeInTheDocument()
  })
})

// ── FinancialReports ─────────────────────────────────────────────────────────

describe('FinancialReports — trialBalance, F-008 banner stays visible', () => {
  it('live: shows the server trial balance and keeps the imbalance banner', async () => {
    flags.live = true
    finance.tb = TRIAL_BALANCE
    const { FinancialReports } = await import('@/screens/accounting/Reports')
    renderScreen(FinancialReports, { role: 'accountant' })
    // The protected client-derived F-008 banner is still present…
    expect(
      screen.getByText('Assets do not equal liabilities plus equity in the seeded ledger.'),
    ).toBeInTheDocument()
    // …and the server-computed section renders alongside it.
    expect(screen.getByText('Trial balance (server-computed)')).toBeInTheDocument()
    expect(
      screen.getByText(/server confirms assets do not equal liabilities plus equity/),
    ).toBeInTheDocument()
  })
})

// ── BankReconciliation ───────────────────────────────────────────────────────

describe('BankReconciliation — bankStatements + match', () => {
  it('fixture: honest that no statement source is connected', async () => {
    const { BankReconciliation } = await import('@/screens/finance/BankReconciliation')
    renderScreen(BankReconciliation, { role: 'accountant' })
    expect(screen.getByText('No bank statement source connected')).toBeInTheDocument()
  })

  it('live: renders the imported statement lines with a reconcile action', async () => {
    flags.live = true
    rows.bankStatements = [
      {
        _id: '01JXBANK000000000000000001',
        date: '2026-07-20',
        description: 'MADA settlement',
        reference: 'REF-8842',
        account: 'Main',
        amount: 'SAR 1,840',
        amountHalalas: 184_000,
        direction: 'credit',
        matched: false,
        matchedReceiptId: null,
      },
    ]
    rows.receipts = [{ _id: '01JXRCPT000000000000000001', id: 'RCT-9001', status: 'pending' }]
    const { BankReconciliation } = await import('@/screens/finance/BankReconciliation')
    renderScreen(BankReconciliation, { role: 'accountant' })
    expect(screen.queryByText('No bank statement source connected')).not.toBeInTheDocument()
    expect(screen.getByText('MADA settlement')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Reconcile/ }).length).toBeGreaterThan(0)
  })
})

// ── CustomReports ────────────────────────────────────────────────────────────

describe('CustomReports — savedReports persistence', () => {
  it('fixture: honest that saved definitions need a server collection', async () => {
    const { CustomReports } = await import('@/screens/accounting/ReportSuite')
    renderScreen(CustomReports, { role: 'accountant' })
    expect(screen.getByText(/savedReports collection on the server/)).toBeInTheDocument()
  })

  it('live: offers the saved-reports panel and drops the gap note', async () => {
    flags.live = true
    const { CustomReports } = await import('@/screens/accounting/ReportSuite')
    renderScreen(CustomReports, { role: 'accountant' })
    expect(screen.queryByText(/savedReports collection on the server/)).not.toBeInTheDocument()
    expect(screen.getByText('Saved reports')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Save definition/ })).toBeInTheDocument()
  })
})
