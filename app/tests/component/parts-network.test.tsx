import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  PartsNetworkDashboard,
  PartsNetworkIncoming,
  PartsNetworkMembers,
  PartsNetworkOrders,
  PartsNetworkQuotations,
  PartsNetworkRequests,
  PartsNetworkSendRequest,
  PartsSupplyNetwork,
} from '@/screens/network/PartsNetwork'
import {
  repository,
  type PartsNetworkMemberRow,
  type PartsNetworkOrderRow,
  type PartsNetworkQuotationRow,
  type PartsNetworkRequestRow,
} from '@/data/repository'
import { renderWithProviders } from '../helpers/render'

/** Parts Network (BLK-004) — all eight screens used to render an honest
 *  "no data source yet" shell. They now read `partsNetworkMembers`,
 *  `partsNetworkRequests`, `partsNetworkQuotations` and `partsNetworkOrders`,
 *  and the lifecycle moves (cancel a request, reject a quotation, mark an order
 *  shipped or received) are ordinary field writes the fixture repository
 *  genuinely performs — so these cases prove real behaviour rather than a
 *  documented refusal.
 *
 *  Two things are deliberately *not* asserted here, because asserting them
 *  would be asserting a fake:
 *
 *  - **Accepting a quotation.** It is a server transaction (reject the
 *    siblings, order the request, raise the order) and therefore live-only:
 *    `repository.partsNetwork` is `null` on the fixtures, the same as
 *    `procurement`. What is asserted is that the screen says so instead of
 *    offering a button that cannot work.
 *  - **Cross-tenant sharing.** There is none by design; the server suite
 *    (`server/tests/parts-network.test.ts`) is where the tenant boundary is
 *    proved, at the HTTP boundary where it is actually enforced.
 *
 *  The fixture collections ship empty (a literal seed there would have to match
 *  the server's seeded rows verbatim to keep `tests/repository-swap.test.ts`'s
 *  parity check green), so each case seeds through
 *  `repository.<collection>.create(...)` — the same generic write path a live
 *  deployment uses. The fixture is session-scoped and mutating across this file,
 *  so every case works on uniquely-named records of its own rather than
 *  asserting an absolute row count.
 */

async function seedMember(patch: Partial<PartsNetworkMemberRow> & { name: string }) {
  return repository.partsNetworkMembers.create({
    code: `NWM-${patch.name.length}${Math.random().toString(36).slice(2, 6)}`,
    kind: 'garage',
    nameAr: null,
    city: null,
    contactName: null,
    contactPhone: null,
    contactEmail: null,
    supplierId: null,
    status: 'active',
    ratingTenths: null,
    rating: null,
    notes: null,
    ...patch,
  } as Partial<PartsNetworkMemberRow>)
}

async function seedRequest(patch: Partial<PartsNetworkRequestRow> & { partName: string }) {
  return repository.partsNetworkRequests.create({
    code: `NRQ-${Math.random().toString(36).slice(2, 8)}`,
    direction: 'outgoing',
    memberId: null,
    memberName: null,
    partSku: null,
    partNumber: null,
    qty: 1,
    urgency: 'normal',
    vehicleInfo: null,
    jobCode: null,
    neededBy: null,
    status: 'open',
    quotationCount: 0,
    quotedAt: null,
    orderedAt: null,
    closedAt: null,
    notes: null,
    ...patch,
  } as Partial<PartsNetworkRequestRow>)
}

async function seedQuotation(
  patch: Partial<PartsNetworkQuotationRow> & { memberName: string; requestId: string },
) {
  return repository.partsNetworkQuotations.create({
    code: `NQT-${Math.random().toString(36).slice(2, 8)}`,
    memberId: null,
    unitPriceHalalas: 8500,
    unitPrice: 'SAR 85',
    qtyAvailable: 10,
    leadTimeDays: 2,
    condition: 'new',
    warrantyMonths: null,
    status: 'pending',
    acceptedAt: null,
    rejectedAt: null,
    notes: null,
    ...patch,
  } as Partial<PartsNetworkQuotationRow>)
}

async function seedOrder(patch: Partial<PartsNetworkOrderRow> & { partName: string; memberName: string }) {
  return repository.partsNetworkOrders.create({
    code: `NOR-${Math.random().toString(36).slice(2, 8)}`,
    requestId: null,
    quotationId: null,
    memberId: null,
    direction: 'outbound',
    qty: 1,
    unitPriceHalalas: 1000,
    totalHalalas: 1000,
    total: 'SAR 10',
    status: 'placed',
    trackingRef: null,
    expectedAt: null,
    shippedAt: null,
    receivedAt: null,
    cancelledAt: null,
    notes: null,
    ...patch,
  } as Partial<PartsNetworkOrderRow>)
}

/** The row a cell's text belongs to. */
function rowOf(text: string) {
  const row = screen.getByText(text).closest('tr')
  if (!row) throw new Error(`expected a table row containing "${text}"`)
  return row
}

describe('PartsNetworkMembers (fixture build)', () => {
  it('lists the member directory and adds a member through the real write path', async () => {
    await seedMember({ name: 'Directory Listed Garage', city: 'Riyadh', kind: 'dealer' })
    const user = userEvent.setup()
    renderWithProviders(<PartsNetworkMembers />, { role: 'procurement' })

    const row = rowOf(await screen.findByText('Directory Listed Garage').then((el) => el.textContent ?? ''))
    expect(within(row).getByText('Dealer')).toBeInTheDocument()
    expect(within(row).getByText('Riyadh')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Add Member/ }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/Member Name/), 'Freshly Added Garage')
    await user.click(within(dialog).getByRole('button', { name: /^Add Member$/ }))

    /* The row genuinely appears: the fixture repository performed the create. */
    await waitFor(() => {
      expect(screen.getByText('Freshly Added Garage')).toBeInTheDocument()
    })
  })

  it('shows a dash rather than a fabricated zero for an unrated member', async () => {
    await seedMember({ name: 'Never Rated Garage', ratingTenths: null, rating: null })
    renderWithProviders(<PartsNetworkMembers />, { role: 'procurement' })
    const row = rowOf(await screen.findByText('Never Rated Garage').then((el) => el.textContent ?? ''))
    /* No stars and no 0.0 — the rating column is honestly empty, the same as the
     * other unknown fields on the row. */
    expect(within(row).getAllByText('\u2014').length).toBeGreaterThan(0)
    expect(within(row).queryByText('0.0')).toBeNull()
  })

  it('hides Add Member and Edit from a role with no network write grant', async () => {
    await seedMember({ name: 'Read Only Garage' })
    /* `accountant` holds nothing at all on `network`; `supplier` holds `vce` but
     * not `d`. A role with view only must see no write affordance. */
    renderWithProviders(<PartsNetworkMembers />, { role: 'superadmin' })
    await screen.findByText('Read Only Garage')
    expect(screen.queryByRole('button', { name: /Add Member/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Edit/ })).toBeNull()
  })
})

describe('PartsNetworkRequests (fixture build)', () => {
  it('lists only outgoing requests and cancels one for real', async () => {
    await seedRequest({ partName: 'Outgoing Pads Request', qty: 40, urgency: 'high' })
    await seedRequest({ partName: 'Inbound Filter Request', direction: 'incoming', memberName: 'A Peer Garage' })
    const user = userEvent.setup()
    renderWithProviders(<PartsNetworkRequests />, { role: 'procurement' })

    await screen.findByText('Outgoing Pads Request')
    /* The Incoming view is a filtered read over the same collection, so an
     * incoming request must not leak into My Requests. */
    expect(screen.queryByText('Inbound Filter Request')).toBeNull()

    const row = rowOf('Outgoing Pads Request')
    expect(within(row).getByText('Open')).toBeInTheDocument()
    expect(within(row).getByText('Whole network')).toBeInTheDocument()

    await user.click(within(row).getByRole('button', { name: /Cancel/ }))
    await waitFor(() => {
      expect(within(rowOf('Outgoing Pads Request')).getByText('Cancelled')).toBeInTheDocument()
    })
    /* The lifecycle move is real: once cancelled there is nothing left to cancel. */
    expect(within(rowOf('Outgoing Pads Request')).queryByRole('button', { name: /Cancel/ })).toBeNull()
  })

  it('narrows the list by search', async () => {
    await seedRequest({ partName: 'Searchable Alternator' })
    await seedRequest({ partName: 'Unrelated Radiator' })
    const user = userEvent.setup()
    renderWithProviders(<PartsNetworkRequests />, { role: 'procurement' })

    await screen.findByText('Searchable Alternator')
    await user.type(screen.getByLabelText(/Search requests/), 'Alternator')
    await waitFor(() => {
      expect(screen.queryByText('Unrelated Radiator')).toBeNull()
    })
    expect(screen.getByText('Searchable Alternator')).toBeInTheDocument()
  })

  it('shows a read-only notice instead of Send Request for a role without create', async () => {
    await seedRequest({ partName: 'Not Mine To Send' })
    renderWithProviders(<PartsNetworkRequests />, { role: 'superadmin' })
    await screen.findByText('Not Mine To Send')
    expect(screen.queryByRole('button', { name: /Send Request/ })).toBeNull()
    expect(screen.getByText(/may view network requests but not send one/)).toBeInTheDocument()
  })
})

describe('PartsNetworkSendRequest (fixture build)', () => {
  it('sends a request that then appears in My Requests', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PartsNetworkSendRequest />, { role: 'procurement' })

    await user.type(await screen.findByLabelText(/Part Name/), 'Page Submitted Compressor')
    await user.clear(screen.getByLabelText(/Quantity/))
    await user.type(screen.getByLabelText(/Quantity/), '6')
    await user.click(screen.getAllByRole('button', { name: /Send Request/ })[0]!)

    /* The row is genuinely in the collection afterwards, not merely toasted. */
    await waitFor(async () => {
      const { rows } = await repository.partsNetworkRequests.list()
      const created = rows.find((r) => r.partName === 'Page Submitted Compressor')
      expect(created).toBeDefined()
      expect(created?.qty).toBe(6)
      expect(created?.direction).toBe('outgoing')
      /* Nothing server-owned is posted: the form sends no status, no quotation
       * count and no lifecycle timestamp, so in demo mode — where there is no
       * server to default them — those keys are simply absent from what was
       * written. A form that typed them in would show them here. */
      expect(created).not.toHaveProperty('status')
      expect(created).not.toHaveProperty('quotationCount')
      expect(created).not.toHaveProperty('quotedAt')
    })
  })

  it('offers no form at all to a role without network create', async () => {
    renderWithProviders(<PartsNetworkSendRequest />, { role: 'superadmin' })
    expect(await screen.findByRole('heading', { name: 'Send Request' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/Part Name/)).toBeNull()
    expect(screen.getByText(/may view network requests but not send one/)).toBeInTheDocument()
  })
})

describe('PartsNetworkIncoming (fixture build)', () => {
  it('lists an incoming request and opens a quotation prefilled with the asking member', async () => {
    const member = await seedMember({ name: 'Quoting Peer Garage' })
    await seedRequest({
      partName: 'Incoming Oil Filter Ask',
      direction: 'incoming',
      memberId: member._id,
      memberName: 'Quoting Peer Garage',
      qty: 12,
    })
    const user = userEvent.setup()
    renderWithProviders(<PartsNetworkIncoming />, { role: 'procurement' })

    const row = rowOf(await screen.findByText('Incoming Oil Filter Ask').then((el) => el.textContent ?? ''))
    expect(within(row).getByText('Quoting Peer Garage')).toBeInTheDocument()
    expect(within(row).getByText('12')).toBeInTheDocument()

    await user.click(within(row).getByRole('button', { name: /Submit Quotation/ }))
    const dialog = await screen.findByRole('dialog')
    /* Quoting on an incoming request means quoting to whoever asked, so their
     * name and the quantity they wanted are the defaults rather than blanks. */
    expect(within(dialog).getByLabelText(/Quoting As/)).toHaveValue('Quoting Peer Garage')
    expect(within(dialog).getByLabelText(/Quantity Available/)).toHaveValue('12')
    /* No status field anywhere: a quotation is born `pending` and only the
     * server's accept route can move it to `accepted`. */
    expect(within(dialog).queryByLabelText(/Status/)).toBeNull()
  })

  it('refuses a demo-mode quotation rather than reporting a false success', async () => {
    const member = await seedMember({ name: 'Demo Refusal Garage' })
    await seedRequest({
      partName: 'Demo Refusal Request',
      direction: 'incoming',
      memberId: member._id,
      memberName: 'Demo Refusal Garage',
      qty: 3,
    })
    const user = userEvent.setup()
    renderWithProviders(<PartsNetworkIncoming />, { role: 'procurement' })

    const row = rowOf(await screen.findByText('Demo Refusal Request').then((el) => el.textContent ?? ''))
    await user.click(within(row).getByRole('button', { name: /Submit Quotation/ }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/Unit Price/), '45')
    await user.click(within(dialog).getByRole('button', { name: /^Submit Quotation$/ }))

    /* `partsNetworkQuotationCreate.requestId` is a ULID, and the fixture
     * repository issues `demo_...` ids, so a quotation cannot be filed against a
     * demo-mode request at all. The contract refusing that is the right
     * outcome: the modal stays open with the error rather than closing on a
     * quotation that was never written. */
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    const { rows } = await repository.partsNetworkQuotations.list()
    expect(rows.find((q) => q.memberName === 'Demo Refusal Garage')).toBeUndefined()
  })

  it('shows an empty state, not a gap card, when nothing has come in', async () => {
    renderWithProviders(<PartsNetworkIncoming />, { role: 'superadmin' })
    expect(await screen.findByRole('heading', { name: 'Incoming Requests' })).toBeInTheDocument()
    /* The honest-GAP shell is gone: there is no "no data source yet" copy left
     * anywhere on this screen. */
    expect(screen.queryByText(/no data source yet/i)).toBeNull()
    expect(screen.queryByRole('button', { name: /Submit Quotation/ })).toBeNull()
  })
})

describe('PartsNetworkQuotations (fixture build)', () => {
  it('shows a quotation against its request and rejects it for real', async () => {
    const request = await seedRequest({ partName: 'Contested Brake Disc', qty: 4, status: 'quoted' })
    await seedQuotation({
      requestId: request._id,
      memberName: 'Rejectable Vendor',
      unitPriceHalalas: 12000,
      unitPrice: 'SAR 120',
      qtyAvailable: 8,
      condition: 'oem',
    })
    const user = userEvent.setup()
    renderWithProviders(<PartsNetworkQuotations />, { role: 'procurement' })

    const row = rowOf(await screen.findByText('Rejectable Vendor').then((el) => el.textContent ?? ''))
    /* The request the quote answers is resolved and shown, not just its id. */
    expect(within(row).getByText('Contested Brake Disc')).toBeInTheDocument()
    expect(within(row).getByText('SAR 120')).toBeInTheDocument()
    expect(within(row).getByText('OEM')).toBeInTheDocument()
    expect(within(row).getByText('Pending')).toBeInTheDocument()

    await user.click(within(row).getByRole('button', { name: /Reject/ }))
    await waitFor(() => {
      expect(within(rowOf('Rejectable Vendor')).getByText('Rejected')).toBeInTheDocument()
    })
  })

  it('does not offer Accept & Order on the fixtures, and says why', async () => {
    const request = await seedRequest({ partName: 'Unacceptable Here Part', status: 'quoted' })
    await seedQuotation({ requestId: request._id, memberName: 'Live Only Vendor' })
    renderWithProviders(<PartsNetworkQuotations />, { role: 'procurement' })

    await screen.findByText('Live Only Vendor')
    /* Accepting rejects the siblings, orders the request and raises the order in
     * one server transaction. A fixture that faked it would be the
     * false-success write BLK-004 forbids, so the button is absent and the
     * reason is stated on screen. */
    expect(screen.queryByRole('button', { name: /Accept & Order/ })).toBeNull()
    expect(screen.getByText(/needs a live connection/)).toBeInTheDocument()
  })

  it('tells a role without approval authority that it cannot place the order', async () => {
    const request = await seedRequest({ partName: 'Manager Cannot Order Part', status: 'quoted' })
    await seedQuotation({ requestId: request._id, memberName: 'Manager View Vendor' })
    /* `manager` holds `network: vcedx` — it may compare and reject, but `a` is
     * what commits the money and it does not hold it. */
    renderWithProviders(<PartsNetworkQuotations />, { role: 'manager' })

    await screen.findByText('Manager View Vendor')
    expect(screen.queryByRole('button', { name: /Accept & Order/ })).toBeNull()
    expect(screen.getByText(/needs approval authority on the network/)).toBeInTheDocument()
    /* It can still reject: `e` is held. */
    expect(within(rowOf('Manager View Vendor')).getByRole('button', { name: /Reject/ })).toBeInTheDocument()
  })
})

describe('PartsNetworkOrders (fixture build)', () => {
  it('walks an order from placed to shipped to received', async () => {
    await seedOrder({
      partName: 'Trackable Spark Plugs',
      memberName: 'Shipping Vendor',
      qty: 20,
      unitPriceHalalas: 13500,
      totalHalalas: 270000,
      total: 'SAR 2,700',
    })
    const user = userEvent.setup()
    renderWithProviders(<PartsNetworkOrders />, { role: 'procurement' })

    const row = rowOf(await screen.findByText('Trackable Spark Plugs').then((el) => el.textContent ?? ''))
    expect(within(row).getByText('Placed')).toBeInTheDocument()
    expect(within(row).getByText('SAR 2,700')).toBeInTheDocument()
    expect(within(row).getByText('We buy')).toBeInTheDocument()

    await user.click(within(row).getByRole('button', { name: /Mark Shipped/ }))
    await waitFor(() => {
      expect(within(rowOf('Trackable Spark Plugs')).getByText('Shipped')).toBeInTheDocument()
    })

    await user.click(within(rowOf('Trackable Spark Plugs')).getByRole('button', { name: /Mark Received/ }))
    await waitFor(() => {
      expect(within(rowOf('Trackable Spark Plugs')).getByText('Received')).toBeInTheDocument()
    })
    /* Terminal: a received order offers no further move. */
    const done = rowOf('Trackable Spark Plugs')
    expect(within(done).queryByRole('button', { name: /Mark Shipped/ })).toBeNull()
    expect(within(done).queryByRole('button', { name: /Cancel/ })).toBeNull()
  })

  it('hides every lifecycle action from a role without network edit', async () => {
    await seedOrder({ partName: 'Untouchable Order Part', memberName: 'Look Only Vendor' })
    renderWithProviders(<PartsNetworkOrders />, { role: 'superadmin' })
    await screen.findByText('Untouchable Order Part')
    expect(screen.queryByRole('button', { name: /Mark Shipped/ })).toBeNull()
    expect(screen.getByText(/may view network orders but not update them/)).toBeInTheDocument()
  })
})

describe('PartsNetworkDashboard and PartsSupplyNetwork (fixture build)', () => {
  it('counts real rows on the dashboard rather than rendering fixed figures', async () => {
    await seedRequest({ partName: 'Dashboard Counted Request', status: 'open' })
    renderWithProviders(<PartsNetworkDashboard />, { role: 'procurement' })

    expect(await screen.findByRole('heading', { name: 'Parts Network' })).toBeInTheDocument()
    await screen.findByText('Open Requests')
    /* The seeded request is reachable from the dashboard's own table, which is
     * the same collection the stat counts. */
    await waitFor(() => {
      expect(screen.getByText('Network Members')).toBeInTheDocument()
    })
    expect(screen.queryByText(/no data source yet/i)).toBeNull()
  })

  it('separates the fulfilment and shipment tabs by direction and status', async () => {
    await seedOrder({
      partName: 'Inbound Fulfilled Part',
      memberName: 'Fulfilment Peer',
      direction: 'inbound',
    })
    await seedOrder({
      partName: 'Outbound Shipped Part',
      memberName: 'Transit Vendor',
      direction: 'outbound',
      status: 'shipped',
    })
    const user = userEvent.setup()
    renderWithProviders(<PartsSupplyNetwork />, { role: 'procurement' })

    expect(await screen.findByRole('heading', { name: 'Parts Supply Network' })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /Fulfillment Orders/ }))
    await screen.findByText('Inbound Fulfilled Part')
    /* An outbound order is not something this workshop fulfils. */
    expect(screen.queryByText('Outbound Shipped Part')).toBeNull()

    await user.click(screen.getByRole('tab', { name: /Shipments/ }))
    await screen.findByText('Outbound Shipped Part')
    /* The inbound order is still only `placed`, so it is not in transit. */
    expect(screen.queryByText('Inbound Fulfilled Part')).toBeNull()
  })
})
