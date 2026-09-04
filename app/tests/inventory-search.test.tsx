import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Inventory } from '@/screens/feature/Inventory'
import { PARTS } from '@/data/generated/tables'
import { renderWithProviders } from './helpers/render'

/** The Inventory header: scanner-friendly search, the quick filters and the
 *  page's one primary action.
 *
 *  A barcode scanner types a SKU and sends Enter, so Enter on a search that
 *  lands on one part must open that part's ledger without a second tap. The
 *  chips narrow the table, never the KPIs. "Record Movement" starts from a
 *  part picker because a movement is only ever checked against a part's own
 *  figures, which live on its ledger. */

const LOW_STOCK = PARTS.filter((part) => part.stock <= part.reorder)
const HEALTHY = PARTS.filter((part) => part.stock > part.reorder)

describe('scanner-friendly SKU search', () => {
  it('pins the search box LTR and asks the keyboard for capitals', async () => {
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    const box = screen.getByRole('searchbox')
    expect(box).toHaveAttribute('dir', 'ltr')
    expect(box).toHaveAttribute('autocapitalize', 'characters')
    expect(box).toHaveAttribute('inputmode', 'text')
  })

  it('opens the one matching part on Enter, as a scanner would', async () => {
    const user = userEvent.setup()
    const part = PARTS[1]!
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await user.type(screen.getByRole('searchbox'), `${part.sku.toLowerCase()}{Enter}`)

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(part.sku)).toBeInTheDocument()
    expect(within(dialog).getByText(part.name)).toBeInTheDocument()
  })

  it('does nothing on Enter while the search still matches several parts', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    // "Filter" matches the oil filter and the air filter.
    await user.type(screen.getByRole('searchbox'), 'filter{Enter}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('quick filters', () => {
  it('narrows the table to parts under their reorder point, and back', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())
    expect(LOW_STOCK.length).toBeGreaterThan(0)
    expect(HEALTHY.length).toBeGreaterThan(0)

    const chip = screen.getByRole('checkbox', { name: /below reorder/i })
    await user.click(chip)
    expect(chip).toHaveAttribute('aria-checked', 'true')
    for (const part of LOW_STOCK) expect(screen.getByText(part.name)).toBeInTheDocument()
    for (const part of HEALTHY) expect(screen.queryByText(part.name)).not.toBeInTheDocument()

    await user.click(chip)
    for (const part of HEALTHY) expect(screen.getByText(part.name)).toBeInTheDocument()
  })

  it('offers no reservation chip when the dataset records no reservations', async () => {
    renderWithProviders(<Inventory api={null} />)
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    expect(screen.queryByRole('checkbox', { name: /^reserved$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /backorderable/i })).not.toBeInTheDocument()
  })
})

describe('the primary action', () => {
  it('asks which part, then opens that part\'s ledger', async () => {
    const user = userEvent.setup()
    const part = PARTS[2]!
    renderWithProviders(<Inventory api={null} />, { role: 'parts' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /record movement/i }))
    const picker = await screen.findByRole('dialog')
    await user.selectOptions(within(picker).getByRole('combobox', { name: /part/i }), part.sku)
    await user.click(within(picker).getByRole('button', { name: /open ledger/i }))

    await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(1))
    const ledger = screen.getByRole('dialog')
    expect(within(ledger).getByText(part.sku)).toBeInTheDocument()
    expect(within(ledger).getByText(/the stock ledger is unavailable/i)).toBeInTheDocument()
  })

  it('is not offered to a role that cannot record movements', async () => {
    renderWithProviders(<Inventory api={null} />, { role: 'technician' })
    await waitFor(() => expect(screen.getByText(PARTS[0]!.name)).toBeInTheDocument())

    expect(screen.queryByRole('button', { name: /record movement/i })).not.toBeInTheDocument()
  })
})
