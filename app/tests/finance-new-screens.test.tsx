import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderScreen } from './helpers/render'
import { setViewportWidth } from '@/test-setup'

/** InvoicePreview, TaxManagement and BankReconciliation as a user meets them.
 *
 *  The proof these share: every money figure on screen is a value the server
 *  computed for one record, and where a screen would want a cross-record total
 *  or a data source the server lacks, it says so rather than inventing it. */

const rows = vi.hoisted(() => ({
  invoices: [] as Record<string, unknown>[],
  invoiceLines: [] as Record<string, unknown>[],
  receipts: [] as Record<string, unknown>[],
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
    useEntity: (key: string, id?: string) => ({
      data:
        id === undefined
          ? undefined
          : (store()[key] ?? []).find((row) => row.id === id || row._id === id),
      isLoading: false,
      error: null,
      refetch: () => undefined,
    }),
    usePagedCollection: (key: string) => ({
      data: { rows: store()[key] ?? [], page: { page: 1, pageSize: 50, total: (store()[key] ?? []).length, totalPages: 1 } },
      isLoading: false,
      error: null,
      refetch: () => undefined,
    }),
  }
})

function serverInvoice(over: Record<string, unknown> = {}) {
  return {
    _id: '01JX0000000000000000000001',
    _version: 1,
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
    qrCode: 'AQ5TQUxJUw==',
    ...over,
  }
}

beforeEach(() => {
  rows.invoices = [serverInvoice()]
  rows.invoiceLines = []
  rows.receipts = []
})

afterEach(() => {
  vi.clearAllMocks()
  setViewportWidth(1280)
})

// ── InvoicePreview ───────────────────────────────────────────────────────────

describe('the invoice preview', () => {
  it('prints the server’s subtotal, VAT, total and balance', async () => {
    rows.invoiceLines = [{ desc: 'Brake pads', ar: '', kind: 'part', qty: 1, unitPriceHalalas: 160_000, part: 'BP-1' }]
    const { InvoicePreview } = await import('@/screens/finance/InvoicePreview')
    renderScreen(InvoicePreview, { role: 'accountant' })

    expect(screen.getAllByText('SAR 1,600.00').length).toBeGreaterThan(0)
    expect(screen.getAllByText('SAR 240.00').length).toBeGreaterThan(0)
    expect(screen.getAllByText('SAR 1,840.00').length).toBeGreaterThan(0)
    expect(screen.getAllByText('SAR 1,340.00').length).toBeGreaterThan(0)
  })

  it('offers a Print action and carries the invoice code LTR', async () => {
    const { InvoicePreview } = await import('@/screens/finance/InvoicePreview')
    renderScreen(InvoicePreview, { role: 'accountant' })
    expect(screen.getByRole('button', { name: 'Print' })).toBeEnabled()
    const heading = screen.getByRole('heading', { name: 'INV-2026-0142' })
    expect(heading).toHaveAttribute('dir', 'ltr')
  })

  it('says the server’s figure prints when the lines disagree with the subtotal', async () => {
    rows.invoiceLines = [{ desc: 'Brake pads', ar: '', kind: 'part', qty: 1, unitPriceHalalas: 145_000, part: 'BP-1' }]
    const { InvoicePreview } = await import('@/screens/finance/InvoicePreview')
    renderScreen(InvoicePreview, { role: 'accountant' })

    const notice = screen.getByRole('status')
    expect(notice).toHaveTextContent('These lines total')
    expect(notice).toHaveTextContent('SAR 1,450.00')
  })

  it('names the missing invoice rather than an empty document', async () => {
    rows.invoices = []
    const { InvoicePreview } = await import('@/screens/finance/InvoicePreview')
    renderScreen(InvoicePreview, { role: 'accountant' })
    expect(screen.getByText('Invoice not found')).toBeInTheDocument()
  })
})

// ── TaxManagement ────────────────────────────────────────────────────────────

describe('tax management', () => {
  it('shows the VAT rate from the single configured source, not a literal', async () => {
    const { TaxManagement } = await import('@/screens/finance/TaxManagement')
    const { VAT_RATE_BPS } = await import('@/screens/finance/money')
    renderScreen(TaxManagement, { role: 'accountant' })
    // The rate on screen is derived from the same constant the pricing rule uses.
    expect(screen.getByText(`${(VAT_RATE_BPS / 100).toFixed(2)}%`)).toBeInTheDocument()
  })

  it('shows the server’s VAT for an issued invoice and never a period total', async () => {
    const { TaxManagement } = await import('@/screens/finance/TaxManagement')
    renderScreen(TaxManagement, { role: 'accountant' })
    // The per-invoice VAT figure, server-computed.
    expect(screen.getAllByText('SAR 240.00').length).toBeGreaterThan(0)
    // The aggregate is disclosed as the server's, not summed on the page.
    expect(screen.getByText('Period totals are computed by the server')).toBeInTheDocument()
    expect(screen.getByText(/GET \/accounting\/tax\/return/)).toBeInTheDocument()
  })

  it('leaves a draft invoice out — a draft has committed no output VAT', async () => {
    rows.invoices = [serverInvoice({ status: 'draft' })]
    const { TaxManagement } = await import('@/screens/finance/TaxManagement')
    renderScreen(TaxManagement, { role: 'accountant' })
    expect(screen.getByText('No output VAT in range')).toBeInTheDocument()
  })
})

// ── BankReconciliation ───────────────────────────────────────────────────────

describe('bank reconciliation', () => {
  beforeEach(() => {
    rows.receipts = [
      {
        _id: 'R1',
        id: 'RCP-2026-0001',
        date: '22 Jul 2026',
        customer: 'Ahmed Al-Rashid',
        invoice: 'INV-2026-0142',
        method: 'Mada',
        amount: 'SAR 1,840',
        status: 'cleared',
        amountHalalas: 184_000,
      },
    ]
  })

  it('shows the book side with the server’s receipt amount', async () => {
    const { BankReconciliation } = await import('@/screens/finance/BankReconciliation')
    renderScreen(BankReconciliation, { role: 'accountant' })
    expect(screen.getByText('RCP-2026-0001')).toBeInTheDocument()
    expect(screen.getByText('SAR 1,840.00')).toBeInTheDocument()
  })

  it('GAP: is honest that there is no bank-statement collection to match against', async () => {
    const { BankReconciliation } = await import('@/screens/finance/BankReconciliation')
    renderScreen(BankReconciliation, { role: 'accountant' })
    expect(screen.getByText('No bank statement source connected')).toBeInTheDocument()
    expect(screen.getByText(/bankStatements/)).toBeInTheDocument()
    // The action that would need the missing service is shown disabled, not wired to nothing.
    expect(screen.getByRole('button', { name: 'Import statement' })).toBeDisabled()
  })

  it('does not add up the receipts into a cleared-cash total', async () => {
    const { BankReconciliation } = await import('@/screens/finance/BankReconciliation')
    renderScreen(BankReconciliation, { role: 'accountant' })
    // The statement-lines stat is an em dash, not a browser sum of the book side.
    const statementStat = screen.getByText('Statement lines').closest('div')?.parentElement as HTMLElement
    expect(within(statementStat).getByText('—')).toBeInTheDocument()
  })
})
