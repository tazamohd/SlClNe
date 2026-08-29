import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ProcurementRequisitions,
  type NewPurchaseOrderInput,
  type NewRequisitionInput,
  type ProcurementApi,
} from '@/screens/network/Procurement'
import { PurchaseOrder, poTotals } from '@/screens/network/ProcurementPurchaseOrder'
import type {
  PurchaseOrderLineRow,
  PurchaseOrderRow,
  RequisitionRow,
  SupplierRow,
} from '@/data/repository'
import { RepositoryError } from '@/data/repository'
import { PARTS } from '@/data/generated/tables'
import { parseSar } from '@/components/ui/Money'
import { setViewportWidth } from '@/test-setup'
import { renderWithProviders } from './helpers/render'

/** The two procurement screens, wired to the live transport (F-022).
 *
 *  The transport is injected: production gets the real one from
 *  `repository.procurement` when an API URL is set, and null on a fixture build.
 *  So the `api={null}` tests prove the honest absent-capability states (the mock
 *  holds no procurement records), and the fake-api tests prove the full
 *  lifecycle — requisition create-with-lines / submit / approve, purchase-order
 *  raise / approve (ceiling + SOD refused by the server, surfaced in its own
 *  words) and receiving by line id. Nothing here "persists" into local state. */

const LOW_STOCK = PARTS.filter((part) => part.stock <= part.reorder)

/* ── row builders in the server's presented shape ─────────────────────────── */

function reqRow(over: Partial<RequisitionRow> = {}): RequisitionRow {
  return {
    _id: 'req-ulid-1',
    _version: 1,
    id: 'REQ-1000',
    code: 'REQ-1000',
    requester: 'Riyadh Main',
    department: 'Inventory',
    priority: 'normal',
    status: 'submitted',
    neededBy: null,
    amount: 'SAR 1,850',
    estimatedTotalHalalas: 185_000,
    notes: null,
    submittedBy: 'user-someone',
    approvedBy: null,
    ...over,
  }
}

function supplierRow(over: Partial<SupplierRow> = {}): SupplierRow {
  return {
    _id: 'sup-ulid-1',
    id: 'SUP-0001',
    code: 'SUP-0001',
    name: 'United Auto Parts Co.',
    nameAr: null,
    contact: null,
    contactPhone: null,
    contactEmail: null,
    status: 'active',
    ...over,
  }
}

function poRow(over: Partial<PurchaseOrderRow> = {}): PurchaseOrderRow {
  return {
    _id: 'po-ulid-1',
    id: 'PO-2026-0090',
    code: 'PO-2026-0090',
    supplierId: 'sup-ulid-1',
    supplierName: 'United Auto Parts Co.',
    requisitionId: null,
    status: 'draft',
    amount: 'SAR 5,554.50',
    subtotalHalalas: 483_000,
    taxHalalas: 72_450,
    totalHalalas: 555_450, // SAR 5,554.50 — within the 20k procurement ceiling
    orderedAt: null,
    expectedAt: null,
    submittedBy: 'user-someone',
    approvedBy: null,
    ...over,
  }
}

function poLine(over: Partial<PurchaseOrderLineRow> = {}): PurchaseOrderLineRow {
  return {
    _id: 'poline-ulid-1',
    partSku: 'BP-FR-220',
    description: 'Brake Pads (Front)',
    descriptionAr: null,
    qty: 10,
    receivedQty: 0,
    unitPriceHalalas: 2800,
    lineTotalHalalas: 28_000,
    sort: 0,
  }
}

/** A fully working fake transport. Every method is a spy so a test can assert
 *  what crossed the seam; the collections mutate in place so the lifecycle is
 *  observable across refetches. Individual tests override single methods (e.g.
 *  to make the server refuse an approval). */
function fakeApi(
  options: {
    requisitions?: RequisitionRow[]
    orders?: PurchaseOrderRow[]
    lines?: PurchaseOrderLineRow[]
    suppliers?: SupplierRow[]
  } = {}
): ProcurementApi {
  const requisitions = options.requisitions ?? []
  const orders = options.orders ?? []
  const lines = options.lines ?? []
  const suppliers = options.suppliers ?? [supplierRow()]
  return {
    listRequisitions: vi.fn(async () => requisitions),
    createRequisition: vi.fn(async (input: NewRequisitionInput) =>
      reqRow({ id: 'REQ-9999', code: 'REQ-9999', status: 'draft', requester: input.requesterName })
    ),
    updateRequisition: vi.fn(async (_id: string, input: NewRequisitionInput) =>
      reqRow({ requester: input.requesterName })
    ),
    submitRequisition: vi.fn(async (id: string) => reqRow({ id, code: id, status: 'submitted' })),
    approveRequisition: vi.fn(async (id: string) => reqRow({ id, code: id, status: 'approved' })),
    rejectRequisition: vi.fn(async (id: string) => reqRow({ id, code: id, status: 'rejected' })),
    requisitionLines: vi.fn(async () => []),
    listSuppliers: vi.fn(async () => suppliers),
    createSupplier: vi.fn(async (input) => supplierRow({ name: input.name })),
    listPurchaseOrders: vi.fn(async () => orders),
    raisePurchaseOrder: vi.fn(async (input: NewPurchaseOrderInput) =>
      poRow({ id: 'PO-NEW', code: 'PO-2026-0001', supplierName: input.supplierName, status: 'draft' })
    ),
    approvePurchaseOrder: vi.fn(async (id: string) => poRow({ id, code: id, status: 'approved' })),
    receivePurchaseOrder: vi.fn(async (id: string) => poRow({ id, code: id, status: 'receiving' })),
    purchaseOrderLines: vi.fn(async () => lines),
  }
}

const spy = (fn: unknown) => fn as ReturnType<typeof vi.fn>

const topDialog = () => {
  const dialogs = screen.getAllByRole('dialog')
  return within(dialogs[dialogs.length - 1]!)
}

/* ═══════════════════════════════════════════════ requisitions: fixture reads */

describe('ProcurementRequisitions — the design fixture on a build with no API', () => {
  it('shows the four submitted rows by default and counts every tab', async () => {
    renderWithProviders(<ProcurementRequisitions api={null} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('REQ-0518')).toBeInTheDocument())
    expect(screen.getByText('REQ-0517')).toBeInTheDocument()
    expect(screen.queryByText('REQ-0509')).not.toBeInTheDocument() // approved, other tab
    const all = screen.getByRole('radio', { name: /All/ })
    expect(all).toHaveTextContent('7')
    expect(screen.getByRole('radio', { name: /Pending/ })).toHaveTextContent('4')
  })

  it('the PO Raised and Rejected tabs carry the design rows the old fixture dropped', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={null} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('REQ-0518')).toBeInTheDocument())
    await user.click(screen.getByRole('radio', { name: /PO Raised/ }))
    expect(screen.getByText('REQ-0504')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /Rejected/ }))
    expect(screen.getByText('REQ-0498')).toBeInTheDocument()
  })

  it('search narrows within the tab', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={null} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('REQ-0518')).toBeInTheDocument())
    await user.type(screen.getByRole('searchbox'), 'scanner')
    expect(screen.getByText('REQ-0517')).toBeInTheDocument()
    expect(screen.queryByText('REQ-0518')).not.toBeInTheDocument()
  })

  it('renders as cards at 390px, not a narrowed table', async () => {
    setViewportWidth(390)
    try {
      renderWithProviders(<ProcurementRequisitions api={null} />, { role: 'procurement' })
      await waitFor(() => expect(screen.getByText('REQ-0518')).toBeInTheDocument())
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    } finally {
      setViewportWidth(1280)
    }
  })
})

/* ═══════════════════════════════════ requisitions: the honest absent state */

describe('ProcurementRequisitions — no transport (a fixture build)', () => {
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
    expect(dialog.queryByLabelText(/Requested by/)).not.toBeInTheDocument()
  })

  it('a requisition opens read-only: no lifecycle actions, and the reason on show', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={null} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('REQ-0518')).toBeInTheDocument())
    await user.click(screen.getByText('REQ-0518'))
    const dialog = topDialog()
    expect(dialog.queryByRole('button', { name: /^Approve$/ })).not.toBeInTheDocument()
    expect(dialog.queryByRole('button', { name: /^Submit$/ })).not.toBeInTheDocument()
    expect(dialog.getByText(/refuse writes rather than pretending/)).toBeInTheDocument()
  })
})

/* ═══════════════════════════════ requisitions: lifecycle through a transport */

describe('ProcurementRequisitions — lifecycle against an injected transport', () => {
  it('reads live rows from the transport, not the design fixture', async () => {
    const api = fakeApi({ requisitions: [reqRow({ code: 'REQ-2001' })] })
    renderWithProviders(<ProcurementRequisitions api={api} />, { role: 'procurement' })
    await waitFor(() => expect(spy(api.listRequisitions)).toHaveBeenCalled())
    expect(await screen.findByText('REQ-2001')).toBeInTheDocument()
    expect(screen.queryByText('REQ-0518')).not.toBeInTheDocument() // no design fixture
  })

  it('creates a requisition from a line array: validation first, then integer halalas on the wire', async () => {
    const api = fakeApi()
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={api} />, { role: 'procurement' })
    await waitFor(() => expect(spy(api.listRequisitions)).toHaveBeenCalled())

    await user.click(screen.getByRole('button', { name: /New Requisition/ }))
    const dialog = topDialog()

    // An empty submit is refused, not sent.
    await user.click(dialog.getByRole('button', { name: /Create Requisition/ }))
    expect(await screen.findByText(/Name the branch and department/)).toBeInTheDocument()
    expect(api.createRequisition).not.toHaveBeenCalled()

    await user.type(dialog.getByLabelText(/Requested by/), 'Riyadh Main · Inventory')
    await user.selectOptions(dialog.getByLabelText(/Priority/), 'normal')
    await user.type(dialog.getByLabelText(/Description/), 'Coolant 4L ×40')
    const qty = dialog.getByLabelText(/^Qty$/)
    await user.clear(qty)
    await user.type(qty, '40')
    await user.type(dialog.getByLabelText(/Est\. Unit SAR/), '32.50')
    await user.click(dialog.getByRole('button', { name: /Create Requisition/ }))

    await waitFor(() => expect(api.createRequisition).toHaveBeenCalledTimes(1))
    const [input] = spy(api.createRequisition).mock.calls[0]!
    expect(input).toMatchObject({
      requesterName: 'Riyadh Main · Inventory',
      priority: 'normal',
    })
    expect(input.lines).toHaveLength(1)
    expect(input.lines[0]).toMatchObject({
      description: 'Coolant 4L ×40',
      qty: 40,
      estUnitPriceHalalas: 3250, // integer halalas, not SAR
    })
  })

  it('submits a draft requisition into the approval queue', async () => {
    const api = fakeApi({ requisitions: [reqRow({ status: 'draft' })] })
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={api} />, { role: 'procurement' })
    await user.click(screen.getByRole('radio', { name: /Draft/ }))
    await user.click(await screen.findByText('REQ-1000'))
    await user.click(topDialog().getByRole('button', { name: /^Submit$/ }))
    await user.click(topDialog().getByRole('button', { name: /^Submit$/ })) // confirm

    await waitFor(() => expect(api.submitRequisition).toHaveBeenCalledWith('REQ-1000'))
  })

  it('approves a submitted requisition within the ceiling', async () => {
    const api = fakeApi({ requisitions: [reqRow({ status: 'submitted' })] })
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={api} />, { role: 'procurement' })
    await user.click(await screen.findByRole('checkbox', { name: /Select REQ-1000/ }))
    await user.click(screen.getByRole('button', { name: /^Approve$/ }))
    await user.click(topDialog().getByRole('button', { name: /^Approve$/ }))

    await waitFor(() => expect(api.approveRequisition).toHaveBeenCalledWith('REQ-1000'))
  })

  it('refuses to approve above the ceiling: 28,000 escalates, nothing is sent', async () => {
    const api = fakeApi({
      requisitions: [reqRow({ status: 'submitted', estimatedTotalHalalas: 2_800_000 })],
    })
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={api} />, { role: 'procurement' })
    await user.click(await screen.findByRole('checkbox', { name: /Select REQ-1000/ }))
    await user.click(screen.getByRole('button', { name: /^Approve$/ }))

    expect(await screen.findByText(/Above your approval limit/)).toBeInTheDocument()
    expect(api.approveRequisition).not.toHaveBeenCalled()
  })

  it('a manager clears the same requisition — the ceiling is the role, not the screen', async () => {
    const api = fakeApi({
      requisitions: [reqRow({ status: 'submitted', estimatedTotalHalalas: 2_800_000 })],
    })
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={api} />, { role: 'manager' })
    await user.click(await screen.findByRole('checkbox', { name: /Select REQ-1000/ }))
    await user.click(screen.getByRole('button', { name: /^Approve$/ }))
    await user.click(topDialog().getByRole('button', { name: /^Approve$/ }))

    await waitFor(() => expect(api.approveRequisition).toHaveBeenCalledWith('REQ-1000'))
  })

  it('rejects a submitted requisition with a reason', async () => {
    const api = fakeApi({ requisitions: [reqRow({ status: 'submitted' })] })
    const user = userEvent.setup()
    renderWithProviders(<ProcurementRequisitions api={api} />, { role: 'procurement' })
    await user.click(await screen.findByText('REQ-1000'))
    await user.click(topDialog().getByRole('button', { name: /Reject/ }))
    const reason = topDialog()
    await user.type(reason.getByLabelText(/Reason/), 'Duplicate of REQ-0509.')
    await user.click(reason.getByRole('button', { name: /Reject/ }))

    await waitFor(() =>
      expect(api.rejectRequisition).toHaveBeenCalledWith('REQ-1000', 'Duplicate of REQ-0509.')
    )
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

  it('refuses to raise an order with no items', async () => {
    const api = fakeApi()
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByLabelText(/Supplier/)).toBeInTheDocument())

    await user.selectOptions(screen.getByLabelText(/Supplier/), 'sup-ulid-1')
    await user.type(screen.getByLabelText(/Expected Delivery/), '2026-08-20')
    await user.click(screen.getByRole('button', { name: /Raise Order/ }))

    expect(await screen.findByText(/Add at least one item/)).toBeInTheDocument()
    expect(api.raisePurchaseOrder).not.toHaveBeenCalled()
  })

  it('raises the order through the transport, picking the supplier by id, in integer halalas', async () => {
    const api = fakeApi()
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    const part = LOW_STOCK[0]!
    await waitFor(() => expect(screen.getByText(part.name)).toBeInTheDocument())

    await user.click(screen.getAllByRole('button', { name: /^Order$/ })[0]!)
    await user.selectOptions(screen.getByLabelText(/Supplier/), 'sup-ulid-1')
    await user.type(screen.getByLabelText(/Expected Delivery/), '2026-08-20')
    await user.click(screen.getByRole('button', { name: /Raise Order/ }))

    await waitFor(() => expect(api.raisePurchaseOrder).toHaveBeenCalledTimes(1))
    const [input] = spy(api.raisePurchaseOrder).mock.calls[0]!
    expect(input.supplierId).toBe('sup-ulid-1')
    expect(input.supplierName).toBe('United Auto Parts Co.')
    expect(input.place).toBe(true)
    expect(input.lines).toHaveLength(1)
    expect(Number.isInteger(input.lines[0].unitPriceHalalas)).toBe(true)
  })

  it('adds a supplier to the directory so the order references it', async () => {
    const api = fakeApi({ suppliers: [] })
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText(/No suppliers yet/)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /^Add$/ }))
    const dialog = topDialog()
    await user.type(dialog.getByLabelText(/Supplier Name/), 'New Parts Depot')
    await user.click(dialog.getByRole('button', { name: /Add Supplier/ }))

    await waitFor(() =>
      expect(api.createSupplier).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Parts Depot' })
      )
    )
  })

  it('with no transport, saving is disabled and says why; receiving names its missing state', async () => {
    renderWithProviders(<PurchaseOrder api={null} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByLabelText(/Supplier/)).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Raise Order/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Save Draft/ })).toBeDisabled()
    expect(screen.getByText(/no API to carry the order/)).toBeInTheDocument()
    expect(screen.getByText(/nothing to approve or receive against/)).toBeInTheDocument()
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

/* ═══════════════════════════════ purchase order: approve — ceiling and SOD */

describe('PurchaseOrder — approval, the ceiling and SOD enforced by the server', () => {
  it("approves someone else's draft order inside the ceiling", async () => {
    const api = fakeApi({ orders: [poRow({ status: 'draft' })] })
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('PO-2026-0090')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /^Approve$/ }))
    await user.click(topDialog().getByRole('button', { name: /^Approve$/ }))
    await waitFor(() => expect(api.approvePurchaseOrder).toHaveBeenCalledWith('PO-2026-0090'))
  })

  it('surfaces the server ceiling refusal in its own words', async () => {
    const api = fakeApi({ orders: [poRow({ status: 'draft', totalHalalas: 2_800_000 })] })
    api.approvePurchaseOrder = vi.fn(async () => {
      throw new RepositoryError(
        'approval_required',
        'SAR 28,000.00 is above your SAR 20,000 approval ceiling on procurement.'
      )
    })
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('PO-2026-0090')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /^Approve$/ }))
    await user.click(topDialog().getByRole('button', { name: /^Approve$/ }))

    expect(await screen.findByText(/above your SAR 20,000 approval ceiling/)).toBeInTheDocument()
  })

  it('surfaces the server self-approval refusal (segregation of duties)', async () => {
    const api = fakeApi({ orders: [poRow({ status: 'draft' })] })
    api.approvePurchaseOrder = vi.fn(async () => {
      throw new RepositoryError(
        'forbidden',
        'You raised this purchase order, so you may not also approve it.'
      )
    })
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('PO-2026-0090')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /^Approve$/ }))
    await user.click(topDialog().getByRole('button', { name: /^Approve$/ }))

    expect(await screen.findByText(/you may not also approve it/)).toBeInTheDocument()
  })
})

/* ═══════════════════════════════════ purchase order: receiving by line id */

describe('PurchaseOrder — receiving against the order by line id', () => {
  it('books a receipt within the ordered quantity, addressed by line id, with an idempotency key', async () => {
    const api = fakeApi({ orders: [poRow({ status: 'approved' })], lines: [poLine()] })
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('PO-2026-0090')).toBeInTheDocument())

    await user.click(await screen.findByRole('button', { name: /Receive/ }))
    const dialog = topDialog()
    await user.type(dialog.getByLabelText(/Quantity Received/), '4')
    await user.click(dialog.getByRole('button', { name: /^Receive$/ }))

    await waitFor(() => expect(api.receivePurchaseOrder).toHaveBeenCalledTimes(1))
    const [id, lines, overApproved, key] = spy(api.receivePurchaseOrder).mock.calls[0]!
    expect(id).toBe('PO-2026-0090')
    expect(lines).toEqual([{ lineId: 'poline-ulid-1', qty: 4 }])
    expect(overApproved).toBe(false)
    expect(typeof key).toBe('string')
    expect(key.length).toBeGreaterThanOrEqual(8)
  })

  it('routes an over-receipt through explicit approval and flags overReceiptApproved', async () => {
    const api = fakeApi({ orders: [poRow({ status: 'approved' })], lines: [poLine()] })
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('PO-2026-0090')).toBeInTheDocument())

    await user.click(await screen.findByRole('button', { name: /Receive/ }))
    await user.type(topDialog().getByLabelText(/Quantity Received/), '12') // ordered 10
    await user.click(topDialog().getByRole('button', { name: /^Receive$/ }))

    // Not silent: the excess is named and must be approved out loud.
    expect(await screen.findByText(/Over-receipt needs approval/)).toBeInTheDocument()
    await user.click(topDialog().getByRole('button', { name: /Approve Over-Receipt/ }))

    await waitFor(() => expect(api.receivePurchaseOrder).toHaveBeenCalledTimes(1))
    const [, lines, overApproved] = spy(api.receivePurchaseOrder).mock.calls[0]!
    expect(lines).toEqual([{ lineId: 'poline-ulid-1', qty: 12 }])
    expect(overApproved).toBe(true)
  })

  it('an over-receipt that is not approved out loud is never booked', async () => {
    const api = fakeApi({ orders: [poRow({ status: 'approved' })], lines: [poLine()] })
    const user = userEvent.setup()
    renderWithProviders(<PurchaseOrder api={api} />, { role: 'procurement' })
    await waitFor(() => expect(screen.getByText('PO-2026-0090')).toBeInTheDocument())

    await user.click(await screen.findByRole('button', { name: /Receive/ }))
    await user.type(topDialog().getByLabelText(/Quantity Received/), '12')
    await user.click(topDialog().getByRole('button', { name: /^Receive$/ }))

    expect(await screen.findByText(/Over-receipt needs approval/)).toBeInTheDocument()
    await user.click(topDialog().getByRole('button', { name: /Cancel/ }))

    expect(await screen.findByText(/Over-receipt was not approved/)).toBeInTheDocument()
    expect(api.receivePurchaseOrder).not.toHaveBeenCalled()
  })
})
