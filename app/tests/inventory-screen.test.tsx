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
import { AR_OVERRIDES } from '@/data/ar-overrides'
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
  reservations: { ref: string; action: 'reserve' | 'release'; qty: number }[]
}

function fakeApi(
  options: { rows?: MovementRow[]; fail?: Error; hold?: boolean; reservationFail?: Error } = {}
): FakeApi {
  const recorded: FakeApi['recorded'] = []
  const reservations: FakeApi['reservations'] = []
  return {
    recorded,
    reservations,
    async list() {
      return options.rows ?? []
    },
    async record(ref, input, key) {
      recorded.push({ ref, input, key })
      if (options.fail) throw options.fail
      if (options.hold) await new Promise(() => {})
      return options.rows ?? []
    },
    async reserve(ref, input) {
      reservations.push({ ref, action: 'reserve', qty: input.qty })
      if (options.reservationFail) throw options.reservationFail
    },
    async release(ref, input) {
      reservations.push({ ref, action: 'release', qty: input.qty })
      if (options.reservationFail) throw options.reservationFail
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

  it('names the panel the active tab controls, so it is reachable and announced', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    expect(screen.getByRole('tabpanel', { name: /overview/i })).toBeInTheDocument()
    await openTab(user, /alerts/i)
    expect(screen.getByRole('tabpanel', { name: /alerts/i })).toBeInTheDocument()
  })

  it('keeps the search visible on every tab it still filters', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await user.type(screen.getByRole('searchbox'), PARTS[0]!.sku)
    await waitFor(() => expect(screen.queryByText(PARTS[1]!.name)).not.toBeInTheDocument())

    await openTab(user, /pricing/i)
    // The filter still applies, so the box that set it has to still be there.
    expect(screen.getByRole('searchbox')).toHaveValue(PARTS[0]!.sku)
    expect(screen.queryByText(PARTS[1]!.name)).not.toBeInTheDocument()
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

  it('states which stock it is showing instead of offering a branch picker that cannot work', async () => {
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    expect(screen.getByText(/branch this session belongs to/i)).toBeInTheDocument()
    // The prototype's three invented branch names are gone: reads are scoped by
    // the server, and nothing in the client can list branches.
    expect(screen.queryByRole('combobox', { name: /branch/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Riyadh Central')).not.toBeInTheDocument()
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

  it('follows the refreshed quantity after a movement instead of showing the one it opened with', async () => {
    const user = userEvent.setup()
    const part = PARTS[0]!
    const repository = (await import('@/data/repository')).repository
    let reads = 0
    const spy = vi.spyOn(repository.parts, 'list').mockImplementation(async () => {
      const rows = PARTS.map((row) =>
        row.sku === part.sku && reads > 0 ? { ...row, stock: row.stock + 5 } : { ...row },
      )
      reads += 1
      return {
        rows,
        page: { page: 1, pageSize: rows.length, total: rows.length, totalPages: 1 },
      }
    })

    renderWithProviders(<Inventory api={fakeApi()} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(part.name)).toBeInTheDocument())
    await user.click(screen.getByText(part.name))
    const ledger = await screen.findByRole('dialog')
    await user.click(within(ledger).getByRole('button', { name: /receive stock/i }))
    const dialogs = await screen.findAllByRole('dialog')
    const form = dialogs[dialogs.length - 1] as HTMLElement
    await user.type(within(form).getByLabelText(/quantity received/i), '5')
    await user.click(within(form).getByRole('button', { name: /receive stock/i }))

    // The server owns the resulting quantity; the dialog re-reads it rather
    // than keeping the figure it was opened with, which every derived number
    // in it depends on.
    await waitFor(() => {
      // The figures strip at the top of the dialog; the reconciliation strip
      // carries the same label lower down and is asserted separately.
      const onHand = within(ledger).getAllByText('On Hand')[0]!.parentElement as HTMLElement
      expect(within(onHand).getByText(String(part.stock + 5))).toBeInTheDocument()
    })
    spy.mockRestore()
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

  it('sends a branch id the contract accepts, and refuses a branch name', async () => {
    const user = userEvent.setup()
    const api = fakeApi()
    renderWithProviders(<Inventory api={api} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())
    await user.click(screen.getByText(PARTS[0]!.name))
    const ledger = await screen.findByRole('dialog')
    await user.click(within(ledger).getByRole('button', { name: /^transfer$/i }))

    const dialogs = await screen.findAllByRole('dialog')
    const dialog = dialogs[dialogs.length - 1] as HTMLElement

    // The one-sided transfer is stated before the operator commits to it, not
    // discovered afterwards in a stock count.
    expect(within(dialog).getByText(/destination branch is not credited/i)).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText(/quantity transferred/i), '2')
    await user.type(within(dialog).getByLabelText(/reason/i), 'Rebalancing')
    await user.type(within(dialog).getByLabelText(/destination branch/i), 'Riyadh Central')
    await user.click(within(dialog).getByRole('button', { name: /^transfer$/i }))

    // A friendly branch name is what the prototype offered and what the API
    // refuses: `toBranchId` is a ULID.
    expect(await within(dialog).findByText(/branch id is 26 characters/i)).toBeInTheDocument()
    expect(api.recorded).toHaveLength(0)

    await user.clear(within(dialog).getByLabelText(/destination branch/i))
    await user.type(
      within(dialog).getByLabelText(/destination branch/i),
      '01JB7KQ2M4N8P0R2T4V6X8Z0AB',
    )
    await user.click(within(dialog).getByRole('button', { name: /^transfer$/i }))

    await waitFor(() => expect(api.recorded).toHaveLength(1))
    expect(api.recorded[0]!.input).toEqual({
      type: 'transfer',
      qty: 2,
      reason: 'Rebalancing',
      toBranchId: '01JB7KQ2M4N8P0R2T4V6X8Z0AB',
    })
  })

  it('offers adjustment in both directions, each carrying the sign in its type', async () => {
    const user = userEvent.setup()
    const api = fakeApi()
    renderWithProviders(<Inventory api={api} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())
    await user.click(screen.getByText(PARTS[0]!.name))
    const ledger = await screen.findByRole('dialog')

    // Down: quantity stays positive, the type carries the minus — the rule the
    // server enforces (it refuses a negative quantity outright).
    await user.click(within(ledger).getByRole('button', { name: /adjust down/i }))
    let dialogs = await screen.findAllByRole('dialog')
    let dialog = dialogs[dialogs.length - 1] as HTMLElement
    await user.type(within(dialog).getByLabelText(/quantity to remove/i), '3')
    await user.type(within(dialog).getByLabelText(/reason/i), 'Miscount')
    await user.click(within(dialog).getByRole('button', { name: /adjust down/i }))
    await waitFor(() => expect(api.recorded).toHaveLength(1))
    expect(api.recorded[0]!.input).toMatchObject({ type: 'adjust_down', qty: 3 })

    // Up is still there and distinct.
    await user.click(within(ledger).getByRole('button', { name: /adjust up/i }))
    dialogs = await screen.findAllByRole('dialog')
    dialog = dialogs[dialogs.length - 1] as HTMLElement
    await user.type(within(dialog).getByLabelText(/quantity to add/i), '2')
    await user.type(within(dialog).getByLabelText(/reason/i), 'Found more')
    await user.click(within(dialog).getByRole('button', { name: /adjust up/i }))
    await waitFor(() => expect(api.recorded).toHaveLength(2))
    expect(api.recorded[1]!.input).toMatchObject({ type: 'adjust', qty: 2 })
  })

  it('books a return through its own type, not as receiving', async () => {
    const user = userEvent.setup()
    const api = fakeApi()
    renderWithProviders(<Inventory api={api} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())
    await user.click(screen.getByText(PARTS[0]!.name))
    const ledger = await screen.findByRole('dialog')

    await user.click(within(ledger).getByRole('button', { name: /return to stock/i }))
    const dialogs = await screen.findAllByRole('dialog')
    const dialog = dialogs[dialogs.length - 1] as HTMLElement
    await user.type(within(dialog).getByLabelText(/quantity returned/i), '4')
    await user.type(within(dialog).getByLabelText(/reason/i), 'Customer return')
    await user.click(within(dialog).getByRole('button', { name: /return to stock/i }))

    await waitFor(() => expect(api.recorded).toHaveLength(1))
    // The type is `return`, never `in` — the server keeps Returned out of the
    // Received total, and the UI must not fold it back in.
    expect(api.recorded[0]!.input).toMatchObject({ type: 'return', qty: 4 })
  })

  it('shows the server’s own words when it refuses a return, and records nothing', async () => {
    const { RepositoryError } = await import('@/data/repository')
    const user = userEvent.setup()
    const api = fakeApi({
      fail: new RepositoryError(
        'forbidden',
        'Segregation of duties: you performed "Issue stock" on this part.'
      ),
    })
    renderWithProviders(<Inventory api={api} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())
    await user.click(screen.getByText(PARTS[0]!.name))
    const ledger = await screen.findByRole('dialog')
    await user.click(within(ledger).getByRole('button', { name: /return to stock/i }))
    const dialogs = await screen.findAllByRole('dialog')
    const dialog = dialogs[dialogs.length - 1] as HTMLElement

    await user.type(within(dialog).getByLabelText(/quantity returned/i), '3')
    await user.type(within(dialog).getByLabelText(/reason/i), 'Wrong part')
    await user.click(within(dialog).getByRole('button', { name: /return to stock/i }))

    expect(await within(dialog).findByText(/segregation of duties/i)).toBeInTheDocument()
    expect(screen.queryByText(/movement recorded/i)).not.toBeInTheDocument()
  })

  it('maps the server’s refusal of an over-large adjust_down onto the quantity field', async () => {
    const { RepositoryError } = await import('@/data/repository')
    const user = userEvent.setup()
    // A shortfall the client's own mirror would pass (small qty) but the server
    // refuses on its authoritative row — proven to land on the field it names.
    const api = fakeApi({
      fail: new RepositoryError(
        'rule_violated',
        'This movement would take stock negative and the part is not backorderable.',
        { field: 'qty' }
      ),
    })
    renderWithProviders(<Inventory api={api} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())
    await user.click(screen.getByText(PARTS[0]!.name))
    const ledger = await screen.findByRole('dialog')
    await user.click(within(ledger).getByRole('button', { name: /adjust down/i }))
    const dialogs = await screen.findAllByRole('dialog')
    const dialog = dialogs[dialogs.length - 1] as HTMLElement

    await user.type(within(dialog).getByLabelText(/quantity to remove/i), '1')
    await user.type(within(dialog).getByLabelText(/reason/i), 'Miscount')
    await user.click(within(dialog).getByRole('button', { name: /adjust down/i }))

    expect(await within(dialog).findByText(/would take stock negative/i)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/quantity to remove/i)).toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })
})

describe('reservations hold stock without moving it', () => {
  async function openLedger(user: ReturnType<typeof userEvent.setup>, api: MovementApi) {
    renderWithProviders(<Inventory api={api} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())
    await user.click(screen.getByText(PARTS[0]!.name))
    return screen.findByRole('dialog')
  }

  /** A parts list where the first part already holds a reservation, so the
   *  release and draw-down paths — which the fixtures cannot reach — have a hold
   *  to act on. */
  function withReserved(reserved: number) {
    const load = import('@/data/repository').then(({ repository }) =>
      vi.spyOn(repository.parts, 'list').mockImplementation(async () => {
        const rows = PARTS.map((row, index) =>
          index === 0
            ? ({ ...row, reserved, available: row.stock - reserved } as unknown as (typeof PARTS)[number])
            : { ...row }
        )
        return { rows, page: { page: 1, pageSize: rows.length, total: rows.length, totalPages: 1 } }
      })
    )
    return load
  }

  it('refuses a hold larger than what is on hand, without asking the server', async () => {
    const user = userEvent.setup()
    const api = fakeApi()
    const ledger = await openLedger(user, api)

    await user.click(within(ledger).getByRole('button', { name: /reserve stock/i }))
    const dialogs = await screen.findAllByRole('dialog')
    const dialog = dialogs[dialogs.length - 1] as HTMLElement

    await user.type(within(dialog).getByLabelText(/quantity to reserve/i), String(PARTS[0]!.stock + 1))
    await user.click(within(dialog).getByRole('button', { name: /reserve stock/i }))

    expect(await within(dialog).findByText(/cannot reserve more than is on hand/i)).toBeInTheDocument()
    expect(api.reservations).toHaveLength(0)
  })

  it('reserves stock against the reservation endpoint, not a movement', async () => {
    const user = userEvent.setup()
    const api = fakeApi()
    const ledger = await openLedger(user, api)

    await user.click(within(ledger).getByRole('button', { name: /reserve stock/i }))
    const dialogs = await screen.findAllByRole('dialog')
    const dialog = dialogs[dialogs.length - 1] as HTMLElement

    await user.type(within(dialog).getByLabelText(/quantity to reserve/i), '10')
    await user.click(within(dialog).getByRole('button', { name: /reserve stock/i }))

    await waitFor(() => expect(api.reservations).toHaveLength(1))
    expect(api.reservations[0]).toMatchObject({ action: 'reserve', qty: 10 })
    // A reservation is not a ledger entry, so it records no movement.
    expect(api.recorded).toHaveLength(0)
    await waitFor(() => expect(screen.getByText(/stock reserved/i)).toBeInTheDocument())
  })

  it('releases only up to what is held, and maps the over-release onto the field', async () => {
    const user = userEvent.setup()
    const spy = await withReserved(20)
    const api = fakeApi()
    const ledger = await openLedger(user, api)

    await user.click(within(ledger).getByRole('button', { name: /release reservation/i }))
    const dialogs = await screen.findAllByRole('dialog')
    const dialog = dialogs[dialogs.length - 1] as HTMLElement

    await user.type(within(dialog).getByLabelText(/quantity to release/i), '25')
    await user.click(within(dialog).getByRole('button', { name: /release reservation/i }))
    expect(await within(dialog).findByText(/cannot release more than is reserved/i)).toBeInTheDocument()
    expect(api.reservations).toHaveLength(0)

    await user.clear(within(dialog).getByLabelText(/quantity to release/i))
    await user.type(within(dialog).getByLabelText(/quantity to release/i), '5')
    await user.click(within(dialog).getByRole('button', { name: /release reservation/i }))
    await waitFor(() => expect(api.reservations).toHaveLength(1))
    expect(api.reservations[0]).toMatchObject({ action: 'release', qty: 5 })
    spy.mockRestore()
  })

  it('lets a consumption draw on the reservation, bounded by the hold', async () => {
    const user = userEvent.setup()
    const spy = await withReserved(20)
    const api = fakeApi()
    const ledger = await openLedger(user, api)

    await user.click(within(ledger).getByRole('button', { name: /^consume$/i }))
    const dialogs = await screen.findAllByRole('dialog')
    const dialog = dialogs[dialogs.length - 1] as HTMLElement

    const draw = within(dialog).getByRole('checkbox', { name: /draw this consumption from the held reservation/i })
    await user.click(draw)

    // Bounded by the hold: 21 exceeds the 20 reserved.
    await user.type(within(dialog).getByLabelText(/quantity consumed/i), '21')
    await user.click(within(dialog).getByRole('button', { name: /^consume$/i }))
    expect(await within(dialog).findByText(/cannot consume more than is reserved/i)).toBeInTheDocument()
    expect(api.recorded).toHaveLength(0)

    await user.clear(within(dialog).getByLabelText(/quantity consumed/i))
    await user.type(within(dialog).getByLabelText(/quantity consumed/i), '10')
    await user.click(within(dialog).getByRole('button', { name: /^consume$/i }))
    await waitFor(() => expect(api.recorded).toHaveLength(1))
    expect(api.recorded[0]!.input).toMatchObject({ type: 'out', qty: 10, fromReservation: true })
    spy.mockRestore()
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

  it(‘sends the price in halalas and creates the part’, async () => {
    const user = userEvent.setup()
    const repository = (await import(‘@/data/repository’)).repository
    const spy = vi.spyOn(repository.parts, ‘create’)
    renderWithProviders(<Inventory api={null} />, { role: ‘parts’ })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await user.click(screen.getByRole(‘button’, { name: /add part/i }))
    const dialog = await screen.findByRole(‘dialog’)
    await user.type(within(dialog).getByLabelText(/part name/i), ‘Cabin Filter’)
    await user.type(within(dialog).getByLabelText(/sku/i), ‘CF-UN-001’)
    await user.type(within(dialog).getByLabelText(/sell price/i), ‘75’)
    await user.type(within(dialog).getByLabelText(/reorder at/i), ‘5’)
    await user.type(within(dialog).getByLabelText(/opening quantity/i), ‘12’)
    await user.click(within(dialog).getByRole(‘button’, { name: /add part/i }))

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
    expect(spy.mock.calls[0]![0]).toMatchObject({
      name: ‘Cabin Filter’,
      sku: ‘CF-UN-001’,
      priceHalalas: 7500,
      reorderLevel: 5,
      openingStock: 12,
    })
    expect(spy.mock.calls[0]![1]?.idempotencyKey).toBeTruthy()

    await waitFor(() => {
      expect(screen.queryByRole(‘dialog’)).not.toBeInTheDocument()
    })
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
    // The heading translates through the same merged lookup the app uses
    // ({ ...AR, ...AR_OVERRIDES }); this key's Arabic now lives in the overrides
    // supplement, so read it there rather than the generated dictionary alone.
    const arHeading =
      AR_OVERRIDES['Inventory & Parts Management'] ??
      AR['Inventory & Parts Management'] ??
      'Inventory & Parts Management'
    expect(screen.getByText(arHeading)).toBeInTheDocument()
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
