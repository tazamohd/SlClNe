import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderScreen, renderWithProviders } from './helpers/render'
import { setViewportWidth } from '@/test-setup'

/** The finance screens, as a user meets them.
 *
 *  The wire format is proven in `finance-transport.test.ts`; what is proven
 *  here is the layer above it — that the screens call the API with what the
 *  user actually entered, that they refuse what the server would refuse before
 *  spending a request on it, that a duplicate submission is one payment, and
 *  that every figure on screen is the server's rather than the browser's.
 *
 *  `@/screens/finance/api` is substituted so the calls can be observed. The
 *  module it stands in for is the one the transport suite drives against a
 *  stubbed `fetch`, so between the two there is no seam left unexercised. */

const spies = vi.hoisted(() => ({
  recordPayment: vi.fn(),
  issueInvoice: vi.fn(),
  cancelInvoice: vi.fn(),
  createInvoice: vi.fn(),
}))

vi.mock('@/screens/finance/api', async () => {
  const actual = await vi.importActual<typeof import('@/screens/finance/api')>(
    '@/screens/finance/api'
  )
  return { ...actual, ...spies }
})

const rows = vi.hoisted(() => ({
  invoices: [] as Record<string, unknown>[],
  invoiceLines: [] as Record<string, unknown>[],
  invoicePayments: [] as Record<string, unknown>[],
}))

vi.mock('@/data/useCollection', async () => {
  const actual = await vi.importActual<typeof import('@/data/useCollection')>('@/data/useCollection')
  return {
    ...actual,
    useCollection: (key: string) => ({
      data: (rows as Record<string, unknown[]>)[key] ?? [],
      isLoading: false,
      error: null,
      refetch: () => undefined,
    }),
    useEntity: (key: string, id?: string) => ({
      data:
        id === undefined
          ? undefined
          : ((rows as Record<string, Record<string, unknown>[]>)[key] ?? []).find(
              (row) => row.id === id || row._id === id
            ),
      isLoading: false,
      error: null,
      refetch: () => undefined,
    }),
  }
})

/** An invoice as the API presents one: every money column server-computed. */
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
    qrCode: null,
    ...over,
  }
}

beforeEach(() => {
  // The create screen autosaves its draft to local storage; a test must not
  // inherit the lines another one typed.
  window.localStorage.clear()
  rows.invoices = [serverInvoice()]
  rows.invoiceLines = []
  rows.invoicePayments = []
})

afterEach(() => {
  vi.clearAllMocks()
  setViewportWidth(1280)
})

// ── The register ────────────────────────────────────────────────────────────

describe('the invoice register', () => {
  it('shows the server’s total and balance, not a figure it worked out', async () => {
    const { Invoices } = await import('@/screens/finance/Invoices')
    renderScreen(Invoices, { role: 'accountant' })

    expect(screen.getByText('SAR 1,840.00')).toBeInTheDocument()
    expect(screen.getByText('SAR 1,340.00')).toBeInTheDocument()
  })

  it('offers the row actions the design drew and never wired', async () => {
    const { Invoices } = await import('@/screens/finance/Invoices')
    renderScreen(Invoices, { role: 'accountant' })

    expect(screen.getByRole('button', { name: 'Record payment' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel invoice' })).toBeEnabled()
  })

  it('offers no payment action to a role with no create on payments', async () => {
    const { Invoices } = await import('@/screens/finance/Invoices')
    // callcenter holds view on invoices and nothing at all on payments.
    renderScreen(Invoices, { role: 'callcenter' })

    expect(screen.queryByRole('button', { name: 'Record payment' })).not.toBeInTheDocument()
    expect(screen.getByText('No actions')).toBeInTheDocument()
  })

  it('offers no payment action on a cancelled invoice', async () => {
    rows.invoices = [serverInvoice({ status: 'cancelled' })]
    const { Invoices } = await import('@/screens/finance/Invoices')
    renderScreen(Invoices, { role: 'accountant' })

    expect(screen.queryByRole('button', { name: 'Record payment' })).not.toBeInTheDocument()
  })

  it('offers no payment action once the balance is nothing', async () => {
    rows.invoices = [serverInvoice({ status: 'paid', paidHalalas: 184_000, balanceHalalas: 0 })]
    const { Invoices } = await import('@/screens/finance/Invoices')
    renderScreen(Invoices, { role: 'accountant' })

    expect(screen.queryByRole('button', { name: 'Record payment' })).not.toBeInTheDocument()
  })

  it('replaces the table with the designed card list at 390px, actions and all', async () => {
    setViewportWidth(390)
    const { Invoices } = await import('@/screens/finance/Invoices')
    const { container } = renderScreen(Invoices, { role: 'accountant' })

    expect(container.querySelector('table')).toBeNull()
    expect(screen.getByText('INV-2026-0142')).toBeInTheDocument()
    // Labelled rather than icon-only, because a phone has no hover to explain.
    expect(screen.getByRole('button', { name: 'Record payment' })).toHaveTextContent(
      'Record payment'
    )
  })
})

// ── Recording a payment ─────────────────────────────────────────────────────

async function openPaymentDialog(role = 'accountant' as const, language?: 'ar') {
  const { Invoices } = await import('@/screens/finance/Invoices')
  const user = userEvent.setup()
  renderScreen(Invoices, { role, ...(language ? { language } : {}) })
  await user.click(screen.getAllByRole('button', { name: /Record payment|تسجيل/ })[0])
  return user
}

describe('recording a payment', () => {
  it('opens on the invoice, showing the balance the server reports', async () => {
    await openPaymentDialog()
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('INV-2026-0142 · Ahmed Al-Rashid')).toBeInTheDocument()
    // The balance banner, and the amount field pre-filled with the same figure.
    expect(within(dialog).getAllByText('SAR 1,340.00').length).toBeGreaterThan(0)
  })

  it('defaults the amount to the outstanding balance, which is the common case', async () => {
    await openPaymentDialog()
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByLabelText(/Amount received/)).toHaveValue('1340.00')
  })

  it('refuses a payment larger than the balance without spending a request', async () => {
    const user = await openPaymentDialog()
    const dialog = await screen.findByRole('dialog')
    const amount = within(dialog).getByLabelText(/Amount received/)

    await user.clear(amount)
    await user.type(amount, '1340.01')
    await user.click(within(dialog).getByRole('button', { name: /Record payment/ }))

    expect(
      await within(dialog).findByText('A payment cannot exceed the outstanding balance.')
    ).toBeInTheDocument()
    expect(spies.recordPayment).not.toHaveBeenCalled()
  })

  it('refuses zero and refuses nothing at all', async () => {
    const user = await openPaymentDialog()
    const dialog = await screen.findByRole('dialog')
    const amount = within(dialog).getByLabelText(/Amount received/)

    await user.clear(amount)
    await user.type(amount, '0')
    await user.click(within(dialog).getByRole('button', { name: /Record payment/ }))
    expect(await within(dialog).findByText('A payment must be greater than zero.')).toBeInTheDocument()

    await user.clear(amount)
    await user.click(within(dialog).getByRole('button', { name: /Record payment/ }))
    expect(await within(dialog).findByText('Enter the amount received.')).toBeInTheDocument()
    expect(spies.recordPayment).not.toHaveBeenCalled()
  })

  it('sends halalas, the method and the reference — never a total off the page', async () => {
    spies.recordPayment.mockResolvedValue({
      payment: { amountHalalas: 100_000 },
      invoice: { balanceHalalas: 34_000 },
    })
    const user = await openPaymentDialog()
    const dialog = await screen.findByRole('dialog')
    const amount = within(dialog).getByLabelText(/Amount received/)

    await user.clear(amount)
    await user.type(amount, '1,000.00')
    await user.type(within(dialog).getByLabelText(/Reference/), 'TXN-884201')
    await user.click(within(dialog).getByRole('button', { name: /Record payment/ }))

    await waitFor(() => expect(spies.recordPayment).toHaveBeenCalledTimes(1))
    const [reference, input, key] = spies.recordPayment.mock.calls[0]
    expect(reference).toBe('01JX0000000000000000000001')
    expect(input).toMatchObject({
      amountHalalas: 100_000,
      method: 'Mada',
      reference: 'TXN-884201',
    })
    expect(typeof key).toBe('string')
    expect(key.length).toBeGreaterThanOrEqual(8)
  })

  it('shows the balance the server returned, not the one the page subtracted', async () => {
    spies.recordPayment.mockResolvedValue({
      payment: { amountHalalas: 100_000 },
      // The server says 999.99 remains — deliberately not 1,340 − 1,000.
      invoice: { balanceHalalas: 99_999 },
    })
    const user = await openPaymentDialog()
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /Record payment/ }))

    // Twice over: the dialog's own heading, and the toast behind it.
    expect((await screen.findAllByText('Payment recorded')).length).toBeGreaterThan(0)
    expect(screen.getByText('SAR 999.99')).toBeInTheDocument()
  })

  it('takes a duplicate submission only once, and with the same key', async () => {
    let release: (value: unknown) => void = () => undefined
    spies.recordPayment.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve
        })
    )
    const user = await openPaymentDialog()
    const dialog = await screen.findByRole('dialog')
    const submit = within(dialog).getByRole('button', { name: /Record payment/ })

    await user.click(submit)
    await waitFor(() => expect(submit).toBeDisabled())
    // The impatient second click, while the first is still in flight.
    await user.click(submit)

    expect(spies.recordPayment).toHaveBeenCalledTimes(1)
    release({ payment: {}, invoice: { balanceHalalas: 0 } })
    await screen.findAllByText('Payment recorded')
  })

  it('reuses the key when the same payment is retried after a failure', async () => {
    spies.recordPayment.mockRejectedValueOnce(new Error('The server could not be reached.'))
    spies.recordPayment.mockResolvedValueOnce({ payment: {}, invoice: { balanceHalalas: 0 } })
    const user = await openPaymentDialog()
    const dialog = await screen.findByRole('dialog')
    const submit = within(dialog).getByRole('button', { name: /Record payment/ })

    await user.click(submit)
    await within(dialog).findByText('The server could not be reached.')
    await user.click(submit)

    await waitFor(() => expect(spies.recordPayment).toHaveBeenCalledTimes(2))
    // Same payment, same key: the server replays rather than taking it twice.
    expect(spies.recordPayment.mock.calls[0][2]).toBe(spies.recordPayment.mock.calls[1][2])
  })

  it('mints a new key when the amount changes, because that is a different payment', async () => {
    spies.recordPayment.mockRejectedValue(new Error('Nope.'))
    const user = await openPaymentDialog()
    const dialog = await screen.findByRole('dialog')
    const amount = within(dialog).getByLabelText(/Amount received/)
    const submit = within(dialog).getByRole('button', { name: /Record payment/ })

    await user.click(submit)
    await waitFor(() => expect(spies.recordPayment).toHaveBeenCalledTimes(1))
    await user.clear(amount)
    await user.type(amount, '100')
    await user.click(submit)

    await waitFor(() => expect(spies.recordPayment).toHaveBeenCalledTimes(2))
    expect(spies.recordPayment.mock.calls[0][2]).not.toBe(spies.recordPayment.mock.calls[1][2])
  })

  it('shows the server’s own words when it refuses, and claims nothing', async () => {
    const { RepositoryError } = await import('@/data/repository')
    spies.recordPayment.mockRejectedValue(
      new RepositoryError('rule_violated', 'A cancelled invoice cannot take a payment.')
    )
    const user = await openPaymentDialog()
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /Record payment/ }))

    expect(
      await within(dialog).findByText('A cancelled invoice cannot take a payment.')
    ).toBeInTheDocument()
    expect(screen.queryByText('Payment recorded')).not.toBeInTheDocument()
  })
})

describe('recording a payment in Arabic', () => {
  it('renders the page RTL and keeps the amount LTR, prefix and all', async () => {
    await openPaymentDialog('accountant', 'ar')
    const dialog = await screen.findByRole('dialog')
    expect(document.documentElement.dir).toBe('rtl')
    const amount = within(dialog).getAllByText(/^SAR /)[0]
    expect(amount).toHaveAttribute('dir', 'ltr')
    expect(amount.className).toContain('font-mono')
  })
})

// ── The detail page ─────────────────────────────────────────────────────────

describe('the invoice detail page', () => {
  it('shows the server’s subtotal, VAT, total and balance', async () => {
    rows.invoiceLines = [
      { desc: 'Brake pads', ar: '', kind: 'part', qty: 1, unit: 1600, unitPriceHalalas: 160_000, part: 'BP-1' },
    ]
    const { InvoiceDetail } = await import('@/screens/finance/InvoiceDetail')
    renderWithProviders(<InvoiceDetail />, { role: 'accountant' })

    const totals = screen.getByText('Subtotal').parentElement?.parentElement as HTMLElement
    expect(within(totals).getByText('SAR 1,600.00')).toBeInTheDocument()
    expect(within(totals).getByText('SAR 240.00')).toBeInTheDocument()
    expect(within(totals).getByText('SAR 1,840.00')).toBeInTheDocument()
    expect(within(totals).getByText('SAR 1,340.00')).toBeInTheDocument()
  })

  it('says so when the lines do not add up to the subtotal the server holds', async () => {
    // The seeded invoice has exactly this shape: a header claiming SAR 1,600
    // net over lines totalling SAR 1,450.
    rows.invoiceLines = [
      { desc: 'Brake pads', ar: '', kind: 'part', qty: 1, unit: 1450, unitPriceHalalas: 145_000, part: 'BP-1' },
    ]
    const { InvoiceDetail } = await import('@/screens/finance/InvoiceDetail')
    renderWithProviders(<InvoiceDetail />, { role: 'accountant' })

    const notice = screen.getByRole('status')
    expect(notice).toHaveTextContent('These lines total')
    expect(notice).toHaveTextContent('SAR 1,450.00')
    expect(notice).toHaveTextContent('SAR 1,600.00')
  })

  it('stays quiet when the lines and the server agree', async () => {
    rows.invoiceLines = [
      { desc: 'Brake pads', ar: '', kind: 'part', qty: 2, unit: 800, unitPriceHalalas: 80_000, part: 'BP-1' },
    ]
    const { InvoiceDetail } = await import('@/screens/finance/InvoiceDetail')
    renderWithProviders(<InvoiceDetail />, { role: 'accountant' })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('offers an empty state rather than a bare table when there are no lines', async () => {
    const { InvoiceDetail } = await import('@/screens/finance/InvoiceDetail')
    renderWithProviders(<InvoiceDetail />, { role: 'accountant' })
    expect(screen.getByText('No line items')).toBeInTheDocument()
    expect(screen.getByText('No payments yet')).toBeInTheDocument()
  })

  it('names the missing invoice instead of rendering an empty document', async () => {
    rows.invoices = []
    const { InvoiceDetail } = await import('@/screens/finance/InvoiceDetail')
    renderWithProviders(<InvoiceDetail />, { role: 'accountant' })
    expect(screen.getByText('Invoice not found')).toBeInTheDocument()
  })
})

// ── Raising one ─────────────────────────────────────────────────────────────

describe('creating an invoice', () => {
  it('calls its preview a preview until the server has priced it', async () => {
    const { InvoiceCreate } = await import('@/screens/finance/InvoiceCreate')
    renderScreen(InvoiceCreate, { role: 'accountant' })
    expect(screen.getByText('Provisional')).toBeInTheDocument()
    expect(
      screen.getByText('A preview. The server prices the invoice when the draft is saved.')
    ).toBeInTheDocument()
    expect(screen.queryByText('From the server')).not.toBeInTheDocument()
  })

  it('will not raise an invoice for a customer it cannot name', async () => {
    const user = userEvent.setup()
    const { InvoiceCreate } = await import('@/screens/finance/InvoiceCreate')
    renderScreen(InvoiceCreate, { role: 'accountant' })

    await user.click(screen.getByRole('button', { name: /Issue invoice/ }))

    expect(await screen.findByText('Name the customer this invoice bills.')).toBeInTheDocument()
    expect(spies.createInvoice).not.toHaveBeenCalled()
  })

  it('sends the lines in halalas and lets the server price them', async () => {
    spies.createInvoice.mockResolvedValue({
      _id: 'ULID',
      id: 'INV-2026-0143',
      subtotalHalalas: 184_000,
      taxHalalas: 27_600,
      discountHalalas: 0,
      totalHalalas: 211_600,
    })
    const user = userEvent.setup()
    const { InvoiceCreate } = await import('@/screens/finance/InvoiceCreate')
    renderScreen(InvoiceCreate, { role: 'accountant' })

    await user.type(screen.getByLabelText(/Customer/), 'Ahmed Al-Rashid')
    await user.click(screen.getByRole('button', { name: /Save draft/ }))

    await waitFor(() => expect(spies.createInvoice).toHaveBeenCalledTimes(1))
    const [input, options] = spies.createInvoice.mock.calls[0]
    expect(input.customerName).toBe('Ahmed Al-Rashid')
    expect(input.lines[0]).toEqual({
      description: 'Brake Pads (Front) — Repair',
      kind: 'part',
      qty: 1,
      unitPriceHalalas: 31_000,
    })
    expect(input).not.toHaveProperty('totalHalalas')
    expect(typeof options.idempotencyKey).toBe('string')

    // …and once it has been priced, the figures on screen are the server's.
    expect(await screen.findByText('From the server')).toBeInTheDocument()
    expect(screen.getByText('INV-2026-0143')).toBeInTheDocument()
  })

  it('says so when the server prices the invoice differently from the preview', async () => {
    spies.createInvoice.mockResolvedValue({
      id: 'INV-2026-0143',
      subtotalHalalas: 184_000,
      taxHalalas: 27_600,
      // A total the client's rule would never produce.
      totalHalalas: 999_999,
      discountHalalas: 0,
    })
    const user = userEvent.setup()
    const { InvoiceCreate } = await import('@/screens/finance/InvoiceCreate')
    renderScreen(InvoiceCreate, { role: 'accountant' })

    await user.type(screen.getByLabelText(/Customer/), 'Ahmed Al-Rashid')
    await user.click(screen.getByRole('button', { name: /Save draft/ }))

    expect(
      await screen.findByText(/The preview and the server disagree about this invoice/)
    ).toBeInTheDocument()
    expect(screen.getByText('SAR 9,999.99')).toBeInTheDocument()
  })

  it('does not offer the screen at all to a role that cannot raise an invoice', async () => {
    const { InvoiceCreate } = await import('@/screens/finance/InvoiceCreate')
    renderScreen(InvoiceCreate, { role: 'technician' })
    expect(screen.getByText('Your role can view invoices but not raise them.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Save draft/ })).not.toBeInTheDocument()
  })
})

// ── Raising a receipt ───────────────────────────────────────────────────────

describe('raising a receipt', () => {
  it('opens the New Receipt CTA the design drew and never wired', async () => {
    const user = userEvent.setup()
    const { Receipts } = await import('@/screens/accounting/Accounting')
    renderScreen(Receipts, { role: 'accountant' })

    await user.click(screen.getByRole('button', { name: /New Receipt/ }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByLabelText(/Invoice/)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/Method/)).toBeInTheDocument()
  })

  it('will not raise one without naming the invoice it settles', async () => {
    const user = userEvent.setup()
    const { Receipts } = await import('@/screens/accounting/Accounting')
    renderScreen(Receipts, { role: 'accountant' })

    await user.click(screen.getByRole('button', { name: /New Receipt/ }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /Raise receipt/ }))

    expect(
      await within(dialog).findByText('Choose the invoice this receipt settles.')
    ).toBeInTheDocument()
  })

  it('offers only invoices with something still outstanding', async () => {
    rows.invoices = [
      serverInvoice(),
      serverInvoice({ id: 'INV-2026-0140', _id: 'B', status: 'paid', balanceHalalas: 0 }),
      serverInvoice({ id: 'INV-2026-0139', _id: 'C', status: 'cancelled' }),
    ]
    const user = userEvent.setup()
    const { Receipts } = await import('@/screens/accounting/Accounting')
    renderScreen(Receipts, { role: 'accountant' })

    await user.click(screen.getByRole('button', { name: /New Receipt/ }))
    const dialog = await screen.findByRole('dialog')
    const choices = within(dialog)
      .getByLabelText(/Invoice/)
      .querySelectorAll('option')

    expect([...choices].map((option) => option.textContent)).toEqual([
      'Choose an invoice',
      'INV-2026-0142 · Ahmed Al-Rashid',
    ])
  })

  it('hides the CTA from a role that cannot take money', async () => {
    const { Receipts } = await import('@/screens/accounting/Accounting')
    renderScreen(Receipts, { role: 'callcenter' })
    expect(screen.queryByRole('button', { name: /New Receipt/ })).not.toBeInTheDocument()
  })
})

// ── Issuing and cancelling from the register ────────────────────────────────

describe('the lifecycle actions', () => {
  it('asks before issuing, and issues the invoice the row named', async () => {
    rows.invoices = [serverInvoice({ status: 'draft', paidHalalas: 0, balanceHalalas: 184_000 })]
    spies.issueInvoice.mockResolvedValue({ id: 'INV-2026-0142', status: 'unpaid' })
    const user = userEvent.setup()
    const { Invoices } = await import('@/screens/finance/Invoices')
    renderScreen(Invoices, { role: 'accountant' })

    await user.click(screen.getByRole('button', { name: 'Issue' }))
    const confirm = await screen.findByRole('dialog')
    expect(confirm).toHaveTextContent('Issuing commits the amount to the customer')

    await user.click(within(confirm).getByRole('button', { name: /Issue invoice/ }))
    await waitFor(() => expect(spies.issueInvoice).toHaveBeenCalledWith('01JX0000000000000000000001'))
  })

  it('does nothing at all when the confirmation is declined', async () => {
    rows.invoices = [serverInvoice({ status: 'draft', paidHalalas: 0, balanceHalalas: 184_000 })]
    const user = userEvent.setup()
    const { Invoices } = await import('@/screens/finance/Invoices')
    renderScreen(Invoices, { role: 'accountant' })

    await user.click(screen.getByRole('button', { name: 'Cancel invoice' }))
    const confirm = await screen.findByRole('dialog')
    await user.click(within(confirm).getByRole('button', { name: /Keep it/ }))

    expect(spies.cancelInvoice).not.toHaveBeenCalled()
  })

  it('warns that the amount is above the role’s ceiling, and still lets the server decide', async () => {
    // An accountant's ceiling is SAR 25,000; this draft is SAR 40,000.
    rows.invoices = [
      serverInvoice({ status: 'draft', totalHalalas: 4_000_000, paidHalalas: 0, balanceHalalas: 4_000_000 }),
    ]
    spies.issueInvoice.mockRejectedValue(new Error('Above your approval ceiling.'))
    const user = userEvent.setup()
    const { Invoices } = await import('@/screens/finance/Invoices')
    renderScreen(Invoices, { role: 'accountant' })

    await user.click(screen.getByRole('button', { name: 'Issue' }))
    const confirm = await screen.findByRole('dialog')
    expect(confirm).toHaveTextContent('above your approval ceiling')

    // Frontend RBAC is not the boundary: the attempt is made and the server's
    // refusal is what the user is told.
    await user.click(within(confirm).getByRole('button', { name: /Issue invoice/ }))
    await waitFor(() => expect(spies.issueInvoice).toHaveBeenCalledTimes(1))
    expect(await screen.findByText('Above your approval ceiling.')).toBeInTheDocument()
  })
})

// ── Collections ─────────────────────────────────────────────────────────────

describe('the collections view', () => {
  it('counts a part-paid invoice on both sides, not wholly on one', async () => {
    rows.invoices = [
      // 1,840 total, 500 already received.
      serverInvoice({ status: 'partial' }),
      serverInvoice({ id: 'INV-2026-0140', _id: 'B', status: 'paid', paidHalalas: 62_000, totalHalalas: 62_000, balanceHalalas: 0 }),
    ]
    const { Payments } = await import('@/screens/finance/Payments')
    renderScreen(Payments, { role: 'accountant' })

    // Outstanding is the balance, not the invoice; collected includes the part
    // payment the old screen threw away.
    expect(screen.getByText('SAR 1,340.00')).toBeInTheDocument()
    expect(screen.getByText('SAR 1,120.00')).toBeInTheDocument()
  })

  it('leaves a cancelled invoice out of what is owed, keeping what was taken', async () => {
    rows.invoices = [
      serverInvoice({ status: 'cancelled', paidHalalas: 40_000, balanceHalalas: 144_000 }),
    ]
    const { Payments } = await import('@/screens/finance/Payments')
    renderScreen(Payments, { role: 'accountant' })

    expect(screen.getByText('SAR 0.00')).toBeInTheDocument()
    expect(screen.getByText('SAR 400.00')).toBeInTheDocument()
  })

  it('renders the designed card list at 390px rather than a squeezed table', async () => {
    setViewportWidth(390)
    const { Payments } = await import('@/screens/finance/Payments')
    const { container } = renderScreen(Payments, { role: 'accountant' })

    expect(container.querySelector('table')).toBeNull()
    expect(screen.getByText('INV-2026-0142')).toBeInTheDocument()
  })
})
