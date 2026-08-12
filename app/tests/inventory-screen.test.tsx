import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Inventory,
  type MovementApi,
  type MovementInput,
  type MovementRow,
} from '@/screens/feature/Inventory'
import { AR } from '@/data/generated/ar'
import { PARTS } from '@/data/generated/tables'
import { setViewportWidth } from '@/test-setup'
import { renderWithProviders } from './helpers/render'

/** The Inventory screen.
 *
 *  Two things are under test. First, the six-tabs-one-table defect: every tab
 *  rendered the same parts table, so the screen could not be told apart from
 *  one that was lying about its content. Each tab is asserted to show its own
 *  thing, and the two with nothing behind them are asserted to say so rather
 *  than to borrow another tab's table.
 *
 *  Second, the movement flow — the states the Definition of Done requires
 *  (loading, empty, error, success, permission denied) and the two correctness
 *  properties a stock screen owes: one movement per submission, and no
 *  optimistic quantity that the server did not confirm.
 *
 *  The transport is injected. The real one is proved separately in
 *  `inventory-transport.test.ts`; here a fake stands in so the screen's own
 *  behaviour is what fails when it breaks. */

const LOW_STOCK = PARTS.filter((part) => part.stock <= part.reorder)
const HEALTHY = PARTS.filter((part) => part.stock > part.reorder)

function movement(over: Partial<MovementRow> = {}): MovementRow {
  return {
    id: 'MV1',
    type: 'in',
    qty: 20,
    delta: 20,
    ref: 'PO-2026-0001',
    reason: 'Opening delivery',
    toBranchId: null,
    createdAt: '2026-08-01T08:00:00.000Z',
    createdBy: 'u1',
    ...over,
  }
}

interface FakeApi extends MovementApi {
  recorded: { ref: string; input: MovementInput; key: string }[]
}

function fakeApi(options: { rows?: MovementRow[]; fail?: Error; hold?: boolean } = {}): FakeApi {
  const recorded: FakeApi['recorded'] = []
  return {
    recorded,
    async list() {
      return options.rows ?? []
    },
    async record(ref, input, key) {
      recorded.push({ ref, input, key })
      if (options.fail) throw options.fail
      if (options.hold) await new Promise(() => {})
      return options.rows ?? []
    },
  }
}

async function openTab(user: ReturnType<typeof userEvent.setup>, name: RegExp) {
  await user.click(screen.getByRole('tab', { name }))
}

describe('Inventory tabs each show their own content', () => {
  it('lists every part on Overview, with the stock figures', async () => {
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())
    for (const part of PARTS) {
      expect(screen.getByText(part.name)).toBeInTheDocument()
    }
    expect(screen.getByRole('columnheader', { name: /on hand/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /available/i })).toBeInTheDocument()
  })

  it('shows only the parts below their reorder point on Alerts, worst first', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await openTab(user, /alerts/i)

    expect(LOW_STOCK.length).toBeGreaterThan(0)
    expect(HEALTHY.length).toBeGreaterThan(0)
    for (const part of LOW_STOCK) expect(screen.getByText(part.name)).toBeInTheDocument()
    // The defect this tab was built to fix: a healthy part must not appear.
    for (const part of HEALTHY) expect(screen.queryByText(part.name)).not.toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /shortfall/i })).toBeInTheDocument()
  })

  it('says outright that no auto-reorder rule can exist yet, rather than showing the parts table', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await openTab(user, /auto-reorder/i)

    expect(screen.getByText(/no auto-reorder rules exist yet/i)).toBeInTheDocument()
    expect(screen.getByText(/no table, no endpoint/i)).toBeInTheDocument()
    for (const part of PARTS) expect(screen.queryByText(part.name)).not.toBeInTheDocument()
  })

  it('prices parts on Pricing, and explains a dataset that carries no cost', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await openTab(user, /pricing/i)

    expect(screen.getByRole('columnheader', { name: /sell price/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /stock value/i })).toBeInTheDocument()
    // The fixtures carry no cost, so margin is not invented from a guess.
    expect(screen.queryByRole('columnheader', { name: /^margin$/i })).not.toBeInTheDocument()
    expect(screen.getByText(/carries no cost figures/i)).toBeInTheDocument()
  })

  it('offers a part to inspect on Transfers and on Audit, not the parts table again', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Inventory api={fakeApi()} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await openTab(user, /transfers/i)
    expect(screen.getByRole('combobox', { name: /part/i })).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText(/this part has never been transferred/i)).toBeInTheDocument(),
    )

    await openTab(user, /audit/i)
    await waitFor(() =>
      expect(screen.getByText(/nothing has moved this part's stock/i)).toBeInTheDocument(),
    )
  })

  it('reconciles the ledger against the recorded quantity on Audit', async () => {
    const user = userEvent.setup()
    const part = PARTS[0]!
    // 142 on hand, reached by receiving 20 and consuming 5 → opening 127.
    const rows = [
      movement({ id: 'A', type: 'in', qty: 20, delta: 20 }),
      movement({ id: 'B', type: 'out', qty: 5, delta: -5 }),
    ]
    renderWithProviders(<Inventory api={fakeApi({ rows })} />)
    await waitFor(() => expect(screen.getByText(part.name)).toBeInTheDocument())

    await openTab(user, /audit/i)

    await waitFor(() => expect(screen.getByText(/the ledger reconciles/i)).toBeInTheDocument())
    const opening = screen.getByText('Opening').parentElement
    expect(within(opening as HTMLElement).getByText(String(part.stock - 15))).toBeInTheDocument()
  })

  it('reports a ledger that does not add up instead of hiding it', async () => {
    const user = userEvent.setup()
    // A row whose recorded effect contradicts its own type and quantity.
    const rows = [movement({ id: 'BAD', type: 'in', qty: 20, delta: -20 })]
    renderWithProviders(<Inventory api={fakeApi({ rows })} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await openTab(user, /audit/i)

    await waitFor(() =>
      expect(screen.getByText(/disagrees with their own type and quantity/i)).toBeInTheDocument(),
    )
  })
})

describe('the stock ledger for one part', () => {
  it('opens from a row and lists the movements with the balance each left behind', async () => {
    const user = userEvent.setup()
    const part = PARTS[0]!
    renderWithProviders(<Inventory api={fakeApi({ rows: [movement()] })} />)
    await waitFor(() => expect(screen.getByText(part.name)).toBeInTheDocument())

    await user.click(screen.getByText(part.name))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(part.sku)).toBeInTheDocument()
    await waitFor(() =>
      expect(within(dialog).getByText('PO-2026-0001')).toBeInTheDocument(),
    )
    // On hand after the only movement is the part's current quantity.
    expect(within(dialog).getAllByText(String(part.stock)).length).toBeGreaterThan(0)
  })

  it('explains why the ledger is unreachable when there is no transport', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await user.click(screen.getByText(PARTS[0]!.name))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/the stock ledger is unavailable/i)).toBeInTheDocument()
    expect(within(dialog).getAllByText(/design fixtures/i).length).toBeGreaterThan(0)
    // No movement button is offered, because none of them could work.
    expect(within(dialog).queryByRole('button', { name: /receive stock/i })).not.toBeInTheDocument()
  })
})

describe('recording a movement', () => {
  async function openReceive(api: MovementApi) {
    const user = userEvent.setup()
    renderWithProviders(<Inventory api={api} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())
    await user.click(screen.getByText(PARTS[0]!.name))
    const ledger = await screen.findByRole('dialog')
    await user.click(within(ledger).getByRole('button', { name: /receive stock/i }))
    const dialogs = await screen.findAllByRole('dialog')
    return { user, dialog: dialogs[dialogs.length - 1] as HTMLElement }
  }

  it('sends one movement of the right type, with an idempotency key', async () => {
    const api = fakeApi()
    const { user, dialog } = await openReceive(api)

    await user.type(within(dialog).getByLabelText(/quantity received/i), '25')
    await user.type(within(dialog).getByLabelText(/purchase order/i), 'PO-99')
    await user.click(within(dialog).getByRole('button', { name: /receive stock/i }))

    await waitFor(() => expect(api.recorded).toHaveLength(1))
    expect(api.recorded[0]!.input).toEqual({ type: 'in', qty: 25, ref: 'PO-99' })
    expect(api.recorded[0]!.ref).toBe(PARTS[0]!.sku)
    expect(api.recorded[0]!.key.length).toBeGreaterThanOrEqual(8)
    await waitFor(() => expect(screen.getByText(/movement recorded/i)).toBeInTheDocument())
  })

  it('refuses a fractional or empty quantity before anything is sent', async () => {
    const api = fakeApi()
    const { user, dialog } = await openReceive(api)

    await user.click(within(dialog).getByRole('button', { name: /receive stock/i }))
    expect(await within(dialog).findByText(/enter a quantity/i)).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText(/quantity received/i), '2.5')
    await user.click(within(dialog).getByRole('button', { name: /receive stock/i }))
    expect(await within(dialog).findByText(/whole number of units/i)).toBeInTheDocument()

    expect(api.recorded).toHaveLength(0)
  })

  it('refuses a consumption larger than the available quantity without asking the server', async () => {
    const user = userEvent.setup()
    const api = fakeApi()
    const part = PARTS[0]!
    renderWithProviders(<Inventory api={api} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(part.name)).toBeInTheDocument())
    await user.click(screen.getByText(part.name))
    const ledger = await screen.findByRole('dialog')
    await user.click(within(ledger).getByRole('button', { name: /^consume$/i }))
    const dialogs = await screen.findAllByRole('dialog')
    const dialog = dialogs[dialogs.length - 1] as HTMLElement

    await user.type(
      within(dialog).getByLabelText(/quantity consumed/i),
      String(part.stock + 1),
    )
    await user.click(within(dialog).getByRole('button', { name: /^consume$/i }))

    expect(
      await within(dialog).findByText(/only unreserved stock can be consumed/i),
    ).toBeInTheDocument()
    expect(api.recorded).toHaveLength(0)
  })

  it('shows the server’s own words when the server refuses, and records nothing', async () => {
    const { RepositoryError } = await import('@/data/repository')
    const api = fakeApi({
      fail: new RepositoryError(
        'forbidden',
        'Segregation of duties: you performed "Issue stock" on this part.',
      ),
    })
    const { user, dialog } = await openReceive(api)

    await user.type(within(dialog).getByLabelText(/quantity received/i), '5')
    await user.click(within(dialog).getByRole('button', { name: /receive stock/i }))

    expect(await within(dialog).findByText(/segregation of duties/i)).toBeInTheDocument()
    expect(screen.queryByText(/movement recorded/i)).not.toBeInTheDocument()
  })

  it('attaches a field-level rejection to the field it names', async () => {
    const { RepositoryError } = await import('@/data/repository')
    const api = fakeApi({
      fail: new RepositoryError('rule_violated', 'This movement would take stock negative.', {
        field: 'qty',
      }),
    })
    const { user, dialog } = await openReceive(api)

    await user.type(within(dialog).getByLabelText(/quantity received/i), '5')
    await user.click(within(dialog).getByRole('button', { name: /receive stock/i }))

    const message = await within(dialog).findByText(/would take stock negative/i)
    expect(message).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/quantity received/i)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('cannot be submitted twice while the first submission is in flight', async () => {
    const api = fakeApi({ hold: true })
    const { user, dialog } = await openReceive(api)

    await user.type(within(dialog).getByLabelText(/quantity received/i), '5')
    const submit = within(dialog).getByRole('button', { name: /receive stock/i })
    await user.click(submit)

    await waitFor(() => expect(submit).toBeDisabled())
    await user.click(submit)
    expect(api.recorded).toHaveLength(1)
    expect(within(dialog).getByRole('button', { name: /saving/i })).toBeInTheDocument()
  })

  it('demands a reason for a transfer, a write-off and a stock-count correction', async () => {
    const user = userEvent.setup()
    const api = fakeApi()
    renderWithProviders(<Inventory api={api} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())
    await user.click(screen.getByText(PARTS[0]!.name))
    const ledger = await screen.findByRole('dialog')

    await user.click(within(ledger).getByRole('button', { name: /record damage/i }))
    const dialogs = await screen.findAllByRole('dialog')
    const dialog = dialogs[dialogs.length - 1] as HTMLElement
    await user.type(within(dialog).getByLabelText(/quantity damaged/i), '2')
    await user.click(within(dialog).getByRole('button', { name: /record damage/i }))

    expect(await within(dialog).findByText(/say why this movement was made/i)).toBeInTheDocument()
    expect(api.recorded).toHaveLength(0)
  })

  it('says an adjustment can only ever increase the count', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Inventory api={fakeApi()} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())
    await user.click(screen.getByText(PARTS[0]!.name))
    const ledger = await screen.findByRole('dialog')
    await user.click(within(ledger).getByRole('button', { name: /adjust count/i }))

    const dialogs = await screen.findAllByRole('dialog')
    const dialog = dialogs[dialogs.length - 1] as HTMLElement
    expect(within(dialog).getByText(/increase only/i)).toBeInTheDocument()
  })

  it('offers no return to stock, because the API has no movement type for one', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Inventory api={fakeApi()} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())
    await user.click(screen.getByText(PARTS[0]!.name))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).queryByRole('button', { name: /return/i })).not.toBeInTheDocument()
  })
})

describe('adding a part', () => {
  it('validates the opening quantity as whole units before anything is sent', async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn((await import('@/data/repository')).repository.parts, 'create')
    renderWithProviders(<Inventory api={null} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /add part/i }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/part name/i), 'Cabin Filter')
    await user.type(within(dialog).getByLabelText(/sku/i), 'CF-UN-001')
    await user.type(within(dialog).getByLabelText(/sell price/i), '75')
    await user.type(within(dialog).getByLabelText(/reorder at/i), '5')
    await user.type(within(dialog).getByLabelText(/opening quantity/i), '10.5')
    await user.click(within(dialog).getByRole('button', { name: /add part/i }))

    expect(await within(dialog).findByText(/whole number of units/i)).toBeInTheDocument()
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('sends the price in halalas, and reports the fixture build’s refusal to write', async () => {
    const user = userEvent.setup()
    const repository = (await import('@/data/repository')).repository
    const spy = vi.spyOn(repository.parts, 'create')
    renderWithProviders(<Inventory api={null} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /add part/i }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/part name/i), 'Cabin Filter')
    await user.type(within(dialog).getByLabelText(/sku/i), 'CF-UN-001')
    await user.type(within(dialog).getByLabelText(/sell price/i), '75')
    await user.type(within(dialog).getByLabelText(/reorder at/i), '5')
    await user.type(within(dialog).getByLabelText(/opening quantity/i), '12')
    await user.click(within(dialog).getByRole('button', { name: /add part/i }))

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
    expect(spy.mock.calls[0]![0]).toMatchObject({
      name: 'Cabin Filter',
      sku: 'CF-UN-001',
      // Money crosses the wire as an integer count of halalas, never as SAR.
      priceHalalas: 7500,
      reorderLevel: 5,
      openingStock: 12,
    })
    expect(spy.mock.calls[0]![1]?.idempotencyKey).toBeTruthy()

    // No server, so the write is refused — and said so, not swallowed.
    expect(await within(dialog).findByText(/fixture repository cannot create/i)).toBeInTheDocument()
    spy.mockRestore()
  })
})

describe('permissions are explained, never merely hidden', () => {
  it('gives a technician the stock figures and no way to move them', async () => {
    const user = userEvent.setup()
    const api = fakeApi()
    renderWithProviders(<Inventory api={api} />, { role: 'technician' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    expect(screen.getByText(/can view stock but not record movements/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add part/i })).not.toBeInTheDocument()

    await user.click(screen.getByText(PARTS[0]!.name))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).queryByRole('button', { name: /receive stock/i })).not.toBeInTheDocument()
  })

  it('drops the price column for a role that may not see purchase price', async () => {
    renderWithProviders(<Inventory api={null} />, { role: 'technician' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())
    expect(screen.queryByRole('columnheader', { name: /^price$/i })).not.toBeInTheDocument()
  })

  it('refuses the whole Pricing tab to a role that may see neither price nor cost', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Inventory api={null} />, { role: 'technician' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await openTab(user, /pricing/i)

    expect(screen.getByText(/may see stock levels but not part prices/i)).toBeInTheDocument()
  })
})

describe('Arabic', () => {
  it('renders the screen in Arabic without leaving the tab labels in English', async () => {
    renderWithProviders(<Inventory api={null} />, { language: 'ar' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    expect(screen.getByRole('tab', { name: AR['Overview'] })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: AR['Alerts'] })).toBeInTheDocument()
    expect(screen.getByText(AR['Inventory & Parts Management'] ?? 'Inventory & Parts Management'))
      .toBeInTheDocument()
  })

  it('keeps quantities and SKUs pinned LTR so the digits are not reordered', async () => {
    renderWithProviders(<Inventory api={null} />, { language: 'ar' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    const sku = screen.getByText(PARTS[0]!.sku)
    expect(sku.closest('[dir="ltr"]')).not.toBeNull()
  })
})

describe('at 390px, the designed mobile layout', () => {
  it('replaces the table with the card list rather than narrowing it', async () => {
    setViewportWidth(390)
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    // `Inventory.Mobile.dc.html` is a stack of tappable cards, one per part.
    const card = screen.getByText(PARTS[0]!.name).closest('[role="button"]')
    expect(card).not.toBeNull()
    expect(card).toHaveAttribute('tabindex', '0')
    expect(within(card as HTMLElement).getByText(PARTS[0]!.sku)).toBeInTheDocument()
  })

  it('carries the shortfall onto the alert cards', async () => {
    setViewportWidth(390)
    const user = userEvent.setup()
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await openTab(user, /alerts/i)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    const low = LOW_STOCK[0]!
    expect(screen.getByText(low.name)).toBeInTheDocument()
    expect(screen.getByText(String(low.reorder - low.stock))).toBeInTheDocument()
  })

  it('opens the movement form as a full-screen sheet a thumb can reach', async () => {
    setViewportWidth(390)
    const user = userEvent.setup()
    const api = fakeApi()
    renderWithProviders(<Inventory api={api} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await user.click(screen.getByText(PARTS[0]!.name))
    const ledger = await screen.findByRole('dialog')
    await user.click(within(ledger).getByRole('button', { name: /receive stock/i }))

    const dialogs = await screen.findAllByRole('dialog')
    const sheet = dialogs[dialogs.length - 1] as HTMLElement
    expect(sheet.className).toContain('h-full')
    await user.type(within(sheet).getByLabelText(/quantity received/i), '4')
    await user.click(within(sheet).getByRole('button', { name: /receive stock/i }))
    await waitFor(() => expect(api.recorded).toHaveLength(1))
  })
})

describe('the parts list itself', () => {
  it('shows the load failure with a retry rather than an empty table', async () => {
    const failing = await import('@/data/repository')
    const spy = vi
      .spyOn(failing.repository.parts, 'list')
      .mockRejectedValue(new failing.RepositoryError('network', 'The server could not be reached.'))

    renderWithProviders(<Inventory api={null} />)

    expect(await screen.findByText(/couldn't load the parts list/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    spy.mockRestore()
  })
})
