import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ProcurementRequisitions,
  REQUISITION_ROWS,
  type ProcurementApi,
  type PurchaseOrderRecord,
} from '@/screens/network/Procurement'
import { PurchaseOrder, poTotals } from '@/screens/network/ProcurementPurchaseOrder'
import { PARTS } from '@/data/generated/tables'
import { parseSar } from '@/components/ui/Money'
import { setViewportWidth } from '@/test-setup'
import { renderWithProviders } from './helpers/render'

/** The two procurement screens.
 *
 *  The transport is injected: production has none — the server has no
 *  procurement endpoints, and `procurement-gaps.test.ts` pins that — so the
 *  default-render tests prove the honest absent-capability states, and the
 *  fake-api tests prove the full lifecycle the screens will run the day the
 *  endpoints land. Nothing here "persists" into local state. */

const LOW_STOCK = PARTS.filter((part) => part.stock <= part.reorder)

function fakeApi(
  options: { orders?: PurchaseOrderRecord[] } = {}
): ProcurementApi & { orders: PurchaseOrderRecord[] } {
  const orders: PurchaseOrderRecord[] = options.orders ?? []
  const api = {
    orders,
    listRequisitions: vi.fn(async () => [...REQUISITION_ROWS]),
    createRequisition: vi.fn(async (input: { what: string; from: string; priority: 'urgent' | 'high' | 'medium' | 'low'; amountHalalas: number }) => ({
      status: 'pending' as const,
      id: 'REQ-9999',
      priority: input.priority,
      what: input.what,
      from: input.from,
      age: 'now',
      amount: input.amountHalalas / 100,
    })),
    updateRequisition: vi.fn(async (id: string) => {
      const found = REQUISITION_ROWS.find((r) => r.id === id)
      if (!found) throw new Error('not found')
      return found
    }),
    decideRequisition: vi.fn(async (id: string) => {
      const found = REQUISITION_ROWS.find((r) => r.id === id)
      if (!found) throw new Error('not found')
      return { ...found, status: 'approved' as const }
    }),
    listPurchaseOrders: vi.fn(async () => [...orders]),
    placePurchaseOrder: vi.fn(async (input: Parameters<ProcurementApi['placePurchaseOrder']>[0]) => {
      const record: PurchaseOrderRecord = {
        id: 'po-new',
        code: 'PO-2026-0001',
        status: input.status,
        supplierName: input.supplierName,
        totalHalalas: poTotals(input.lines).totalHalalas,
        raisedBy: 'demo:procurement',
        lines: input.lines.map((line) => ({ ...line, receivedQty: 0 })),
      }
      orders.push(record)
      return record
    }),
    approvePurchaseOrder: vi.fn(async (id: string) => {
      const order = orders.find((o) => o.id === id)
      if (!order) throw new Error('not found')
      return { ...order, status: 'approved' as const }
    }),
    receiveLine: vi.fn(async (orderId: string, lineIndex: number, qty: number) => {
      const order = orders.find((o) => o.id === orderId)
      if (!order) throw new Error('not found')
      const lines = order.lines.map((line, at) =>
        at === lineIndex ? { ...line, receivedQty: line.receivedQty + qty } : line
      )
      return { ...order, lines }
    }),
  }
  return api as unknown as ProcurementApi & { orders: PurchaseOrderRecord[] }
}

function order(over: Partial<PurchaseOrderRecord> = {}): PurchaseOrderRecord {
  return {
    id: 'po-1',
    code: 'PO-2026-0090',
    status: 'placed',
    supplierName: 'United Auto Parts Co.',
    totalHalalas: 555_450, // SAR 5,554.50 — the design's total, within the 20k ceiling
    raisedBy: 'someone-else',
    lines: [
      { sku: 'BP-FR-220', description: 'Brake Pads (Front)', qty: 10, receivedQty: 0, unitPriceHalalas: 2800 },
    ],
    ...over,
  }
}

const topDialog = () => {
  const dialogs = screen.getAllByRole('dialog')
  return within(dialogs[dialogs.length - 1]!)
}

/* ═══════════════════════════════════════════════════════ requisitions: reads */

describe('ProcurementRequisitions — list, tabs, search', () => {
  it('shows the four pending rows by default and counts every tab', async () => {
    renderWithProviders(<ProcurementRequisitions />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('REQ-0518')).toBeInTheDocument())
    expect(screen.getByText('REQ-0517')).toBeInTheDocument()
    expect(screen.queryByText('REQ-0509')).not.toBeInTheDocument() // approved, other tab
    const all = screen.getByRole('tab', { name: /All/ })
    expect(all).toHaveTextContent('7')
    expect(screen.getByRole('tab', { name: /Pending/ })).toHaveTextContent('4')
  })

  it('the PO Raised and Rejected tabs carry the design rows the old fixture dropped', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('REQ-0518')).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: /PO Raised/ }))
    expect(screen.getByText('REQ-0504')).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: /Rejected/ }))
    expect(screen.getByText('REQ-0498')).toBeInTheDocument()
  })

  it('search narrows within the tab', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('REQ-0518')).toBeInTheDocument())
    await user.type(screen.getByRole('searchbox'), 'scanner')
    expect(screen.getByText('REQ-0517')).toBeInTheDocument()
    expect(screen.queryByText('REQ-0518')).not.toBeInTheDocument()
  })

  it('renders as cards at 390px, not a narrowed table', async () => {
    setViewportWidth(390)
    try {
      renderWithProviders(<ProcurementRequisitions />, { role: 'procurement' })
      await waitFor(() => expect(screen.getByText('REQ-0518')).toBeInTheDocument())
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    } finally {
      setViewportWidth(1280)
    }
  })
})

/* ═══════════════════════════════════ requisitions: the honest absent state */

describe('ProcurementRequisitions — no transport (production today)', () => {
  it('says why writes cannot happen instead of pretending', async () => {
    renderWithProviders(<ProcurementRequisitions api={null} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('REQ-0518')).toBeInTheDocument())
    expect(screen.getByText(/refuse writes rather than pretending/)).toBeInTheDocument()
  })

  it('New Requisition opens the dependency notice, not a form that cannot save', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={null} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('REQ-0518')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /New Requisition/ }))
    const dialog = topDialog()
    expect(dialog.getByText(/not available yet/i)).toBeInTheDocument()
    expect(dialog.queryByLabelText(/Request/)).not.toBeInTheDocument()
  })

  it('a pending requisition opens read-only: no Approve, and the reason on show', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={null} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('REQ-0518')).toBeInTheDocument())
    await user.click(screen.getByText('REQ-0518'))
    const dialog = topDialog()
    expect(dialog.queryByRole('button', { name: /^Approve$/ })).not.toBeInTheDocument()
    expect(dialog.queryByRole('button', { name: /Edit/ })).not.toBeInTheDocument()
  })
})

/* ═══════════════════════════════ requisitions: lifecycle through a transport */

describe('ProcurementRequisitions — lifecycle against an injected transport', () => {
  it('creates a requisition: validation first, then integer halalas on the wire', async () => {
    const api = fakeApi()
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('REQ-0518')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /New Requisition/ }))
    const dialog = topDialog()

    // An empty submit is refused on the fields, not sent.
    await user.click(dialog.getByRole('button', { name: /Submit Requisition/ }))
    expect(await screen.findByText(/Describe what is being requested/)).toBeInTheDocument()
    expect(api.createRequisition).not.toHaveBeenCalled()

    await user.type(dialog.getByLabelText(/Request/), 'Coolant 4L ×40')
    await user.type(dialog.getByLabelText(/From/), 'Riyadh Main · Inventory')
    await user.selectOptions(dialog.getByLabelText(/Priority/), 'medium')
    await user.type(dialog.getByLabelText(/Estimated Amount/), '1,250.50')
    await user.click(dialog.getByRole('button', { name: /Submit Requisition/ }))

    await waitFor(() => expect(api.createRequisition).toHaveBeenCalledTimes(1))
    const [input, key] = (api.createRequisition as ReturnType<typeof vi.fn>).mock.calls[0]!
    expect(input).toMatchObject({
      what: 'Coolant 4L ×40',
      from: 'Riyadh Main · Inventory',
      priority: 'medium',
      amountHalalas: 125_050,
    })
    expect(typeof key).toBe('string')
    expect(key.length).toBeGreaterThanOrEqual(8)
  })

  it('approves within the ceiling: REQ-0512 at 1,850 clears the 20,000 limit', async () => {
    const api = fakeApi()
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('REQ-0512')).toBeInTheDocument())

    await user.click(screen.getByRole('checkbox', { name: /Select REQ-0512/ }))
    await user.click(screen.getByRole('button', { name: /^Approve$/ }))
    await user.click(topDialog().getByRole('button', { name: /^Approve$/ }))

    await waitFor(() => expect(api.decideRequisition).toHaveBeenCalledTimes(1))
    expect(api.decideRequisition).toHaveBeenCalledWith('REQ-0512', 'approve', expect.any(String))
  })

  it('refuses above the ceiling: REQ-0517 at 28,000 escalates, nothing is sent', async () => {
    const api = fakeApi()
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('REQ-0517')).toBeInTheDocument())

    await user.click(screen.getByRole('checkbox', { name: /Select REQ-0517/ }))
    await user.click(screen.getByRole('button', { name: /^Approve$/ }))

    expect(await screen.findByText(/Above your approval limit/)).toBeInTheDocument()
    expect(api.decideRequisition).not.toHaveBeenCalled()
  })

  it('a manager clears the same requisition — the ceiling is the role, not the screen', async () => {
    const api = fakeApi()
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={api} />, { role: 'manager' })
    await waitFor(() => expect(screen.getByText('REQ-0517')).toBeInTheDocument())

    await user.click(screen.getByRole('checkbox', { name: /Select REQ-0517/ }))
    await user.click(screen.getByRole('button', { name: /^Approve$/ }))
    await user.click(topDialog().getByRole('button', { name: /^Approve$/ }))

    await waitFor(() =>
      expect(api.decideRequisition).toHaveBeenCalledWith('REQ-0517', 'approve', expect.any(String))
    )
  })

  it('edits a pending requisition from its detail view', async () => {
    const api = fakeApi()
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('REQ-0515')).toBeInTheDocument())

    await user.click(screen.getByText('REQ-0515'))
    await user.click(topDialog().getByRole('button', { name: /Edit/ }))
    const form = topDialog()
    const request = form.getByLabelText(/Request/)
    expect(request).toHaveValue('Oil Filter (Toyota) ×120 — routine restock')
    await user.clear(request)
    await user.type(request, 'Oil Filter (Toyota) ×150 — restock')
    await user.click(form.getByRole('button', { name: /Save Changes/ }))

    await waitFor(() => expect(api.updateRequisition).toHaveBeenCalledTimes(1))
    const [id, patch] = (api.updateRequisition as ReturnType<typeof vi.fn>).mock.calls[0]!
    expect(id).toBe('REQ-0515')
    expect(patch).toMatchObject({ what: 'Oil Filter (Toyota) ×150 — restock' })
  })
})

/* ═══════════════════════════════════════════════ purchase order: the builder */

describe('PurchaseOrder — the order builder over live inventory reads', () => {
  it('derives the stock alert rail from the parts collection', async () => {
    expect(LOW_STOCK.length).toBeGreaterThan(0)
    renderWithProviders(<PurchaseOrder api={null} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText(LOW_STOCK[0]!.name)).toBeInTheDocument())
    expect(screen.getByText(/items below reorder level/)).toBeInTheDocument()
  })

  it('orders a low-stock part with the shortfall as the default quantity, and totals in the summary', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={fakeApi()} />, { role: 'procurement' })
    const part = LOW_STOCK[0]!
    await waitFor(() => expect(screen.getByText(part.name)).toBeInTheDocument())

    await user.click(screen.getAllByRole('button', { name: /^Order$/ })[0]!)

    const qty = Math.max(part.reorder - part.stock, 1)
    const unit = Math.round(parseSar(part.price) * 100)
    const totals = poTotals([{ qty, unitPriceHalalas: unit }])
    const expected = `SAR ${(totals.totalHalalas / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
    await waitFor(() => expect(screen.getAllByText(expected).length).toBeGreaterThan(0))
  })

  it('refuses to place an order with no items', async () => {
    const api = fakeApi()
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByLabelText(/Supplier Name/)).toBeInTheDocument())

    await user.type(screen.getByLabelText(/Supplier Name/), 'United Auto Parts Co.')
    await user.type(screen.getByLabelText(/Expected Delivery/), '2026-08-20')
    await user.click(screen.getByRole('button', { name: /Place Order/ }))

    expect(await screen.findByText(/Add at least one item/)).toBeInTheDocument()
    expect(api.placePurchaseOrder).not.toHaveBeenCalled()
  })

  it('places the order through the transport, in integer halalas', async () => {
    const api = fakeApi()
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    const part = LOW_STOCK[0]!
    await waitFor(() => expect(screen.getByText(part.name)).toBeInTheDocument())

    await user.click(screen.getAllByRole('button', { name: /^Order$/ })[0]!)
    await user.type(screen.getByLabelText(/Supplier Name/), 'United Auto Parts Co.')
    await user.type(screen.getByLabelText(/Expected Delivery/), '2026-08-20')
    await user.click(screen.getByRole('button', { name: /Place Order/ }))

    await waitFor(() => expect(api.placePurchaseOrder).toHaveBeenCalledTimes(1))
    const [input, key] = (api.placePurchaseOrder as ReturnType<typeof vi.fn>).mock.calls[0]!
    expect(input.status).toBe('placed')
    expect(input.supplierName).toBe('United Auto Parts Co.')
    expect(input.lines).toHaveLength(1)
    expect(Number.isInteger(input.lines[0].unitPriceHalalas)).toBe(true)
    expect(typeof key).toBe('string')
  })

  it('with no transport, saving is disabled and says why; receiving names its missing endpoint', async () => {
    renderWithProviders(<PurchaseOrder api={null} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByLabelText(/Supplier Name/)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Place Order/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Save Draft/ })).toBeDisabled()
    expect(screen.getByText(/no purchase-order endpoint yet/)).toBeInTheDocument()
    expect(screen.getByText(/cannot stand in — it carries no ordered quantity/)).toBeInTheDocument()
  })

  it('warns when the total is above the role ceiling instead of blocking the raise', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={fakeApi()} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByRole('button', { name: /Add Item/ })).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /Add Item/ }))
    const dialog = topDialog()
    await user.type(dialog.getByLabelText(/Description/), 'Diagnostic scanner')
    await user.type(dialog.getByLabelText(/Order Qty/), '1')
    await user.type(dialog.getByLabelText(/Unit Cost/), '28,000')
    await user.click(dialog.getByRole('button', { name: /Add Item/ }))

    expect(await screen.findByText(/above your approval ceiling/)).toBeInTheDocument()
  })
})

/* ═══════════════════════════════ purchase order: approve and receive against */

describe('PurchaseOrder — approval within the ceiling, SOD by record', () => {
  it('refuses the raiser approving their own order — identity, not role', async () => {
    const api = fakeApi({ orders: [order({ raisedBy: 'demo:procurement' })] })
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('PO-2026-0090')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /^Approve$/ }))
    expect(await screen.findByText(/Segregation of duties/)).toBeInTheDocument()
    expect(api.approvePurchaseOrder).not.toHaveBeenCalled()
  })

  it("approves someone else's order inside the ceiling", async () => {
    const api = fakeApi({ orders: [order({ raisedBy: 'someone-else' })] })
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('PO-2026-0090')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /^Approve$/ }))
    await user.click(topDialog().getByRole('button', { name: /^Approve$/ }))
    await waitFor(() => expect(api.approvePurchaseOrder).toHaveBeenCalledWith('po-1', expect.any(String)))
  })

  it('refuses an order above the ceiling and names the limit', async () => {
    const api = fakeApi({
      orders: [order({ raisedBy: 'someone-else', totalHalalas: 2_800_000 })], // SAR 28,000
    })
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('PO-2026-0090')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /^Approve$/ }))
    expect(await screen.findByText(/Above your approval limit/)).toBeInTheDocument()
    expect(api.approvePurchaseOrder).not.toHaveBeenCalled()
  })
})

describe('PurchaseOrder — receiving against the order', () => {
  it('books a receipt within the ordered quantity', async () => {
    const api = fakeApi({ orders: [order({ status: 'approved' })] })
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('PO-2026-0090')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /Receive/ }))
    const dialog = topDialog()
    await user.type(dialog.getByLabelText(/Quantity Received/), '4')
    await user.click(dialog.getByRole('button', { name: /^Receive$/ }))

    await waitFor(() =>
      expect(api.receiveLine).toHaveBeenCalledWith('po-1', 0, 4, false, expect.any(String))
    )
  })

  it('routes over-receipt through explicit approval for a role with authority', async () => {
    const api = fakeApi({ orders: [order({ status: 'approved' })] })
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('PO-2026-0090')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /Receive/ }))
    await user.type(topDialog().getByLabelText(/Quantity Received/), '12') // ordered 10
    await user.click(topDialog().getByRole('button', { name: /^Receive$/ }))

    // Not silent: the excess is named and must be approved out loud.
    expect(await screen.findByText(/Over-receipt needs approval/)).toBeInTheDocument()
    await user.click(topDialog().getByRole('button', { name: /Approve Over-Receipt/ }))

    await waitFor(() =>
      expect(api.receiveLine).toHaveBeenCalledWith('po-1', 0, 12, true, expect.any(String))
    )
  })

  it('refuses over-receipt outright for a role without approve authority', async () => {
    const api = fakeApi({ orders: [order({ status: 'approved' })] })
    const user = userEvent.setup()
    // parts holds procurement:"vc" — it can raise and receive, not approve.
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText('PO-2026-0090')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /Receive/ }))
    const dialog = topDialog()
    await user.type(dialog.getByLabelText(/Quantity Received/), '12')
    await user.click(dialog.getByRole('button', { name: /^Receive$/ }))

    expect(await screen.findByText(/exceeds the ordered quantity by 2/)).toBeInTheDocument()
    expect(api.receiveLine).not.toHaveBeenCalled()
  })
})
