import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InventoryReports } from '@/screens/feature/InventoryReports'
import type { MovementApi, MovementRow } from '@/screens/feature/Inventory'
import { AR } from '@/data/generated/ar'
import { PARTS } from '@/data/generated/tables'
import { renderWithProviders } from './helpers/render'

/** The Inventory Reports screen.
 *
 *  Everything here is derived from the real `parts` collection and — when the
 *  movement API is injected — the per-part ledger, never from the prototype's
 *  baked figures. The two halves under test: the parts-only report (KPIs, value
 *  breakdown, details, export) that works against the fixtures, and the
 *  movement-driven panels (trend, breakdown) that degrade honestly to a "needs
 *  the API" state when there is no transport. */

const LOW_STOCK = PARTS.filter((part) => part.stock <= part.reorder)
const HEALTHY = PARTS.filter((part) => part.stock > part.reorder)

function movement(over: Partial<MovementRow> = {}): MovementRow {
  return {
    id: 'MV1',
    type: 'in',
    qty: 10,
    delta: 10,
    ref: null,
    reason: null,
    toBranchId: null,
    createdAt: new Date().toISOString(),
    createdBy: 'u1',
    ...over,
  }
}

function fakeApi(rowsByRef: Record<string, MovementRow[]> = {}): MovementApi {
  return {
    async list(ref) {
      return rowsByRef[ref] ?? []
    },
    async record() {
      return []
    },
    async reserve() {},
    async release() {},
  }
}

describe('Inventory Reports over the real parts data', () => {
  it('derives the KPIs and lists every part in the details table', async () => {
    renderWithProviders(<InventoryReports api={null} />)
    await waitFor(() => expect(screen.getAllByText(PARTS[0]!.name).length).toBeGreaterThan(0))

    expect(screen.getByText('Stock Value')).toBeInTheDocument()
    expect(screen.getByText('Below Reorder')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /reorder level/i })).toBeInTheDocument()
    const table = screen.getByRole('table')
    for (const part of PARTS) expect(within(table).getByText(part.name)).toBeInTheDocument()
  })

  it('offers the period tabs and an export control', async () => {
    renderWithProviders(<InventoryReports api={null} />)
    await waitFor(() => expect(screen.getAllByText(PARTS[0]!.name).length).toBeGreaterThan(0))

    expect(screen.getByRole('tab', { name: /this week/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /this month/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export report/i })).toBeInTheDocument()
  })

  it('filters the details table to parts below their reorder point', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InventoryReports api={null} />)
    await waitFor(() => expect(screen.getAllByText(PARTS[0]!.name).length).toBeGreaterThan(0))
    expect(LOW_STOCK.length).toBeGreaterThan(0)
    expect(HEALTHY.length).toBeGreaterThan(0)

    await user.click(screen.getByRole('checkbox', { name: /below reorder only/i }))

    // The filter acts on the details table; the value breakdown is not filtered.
    const table = screen.getByRole('table')
    for (const part of LOW_STOCK) expect(within(table).getByText(part.name)).toBeInTheDocument()
    for (const part of HEALTHY) expect(within(table).queryByText(part.name)).not.toBeInTheDocument()
  })

  it('says the movement trend needs the API when there is no transport', async () => {
    renderWithProviders(<InventoryReports api={null} />)
    await waitFor(() => expect(screen.getAllByText(PARTS[0]!.name).length).toBeGreaterThan(0))
    expect(screen.getByText(/the movement trend needs the api/i)).toBeInTheDocument()
    // The movement-type breakdown is not drawn at all without a ledger.
    expect(screen.queryByText(/movement breakdown/i)).not.toBeInTheDocument()
  })

  it('draws the trend and the movement breakdown from the ledger when the API is present', async () => {
    const rows: Record<string, MovementRow[]> = {}
    rows[PARTS[0]!.sku] = [movement({ id: 'A', type: 'in', qty: 12, delta: 12 })]
    rows[PARTS[1]!.sku] = [movement({ id: 'B', type: 'out', qty: 5, delta: -5 })]
    renderWithProviders(<InventoryReports api={fakeApi(rows)} />)
    await waitFor(() => expect(screen.getAllByText(PARTS[0]!.name).length).toBeGreaterThan(0))

    // The trend renders as a labelled chart image, not the unavailable state.
    await waitFor(() =>
      expect(screen.getByRole('img', { name: /stock movement trend/i })).toBeInTheDocument()
    )
    const breakdown = await screen.findByText(/movement breakdown/i)
    expect(breakdown).toBeInTheDocument()
    // 12 received in the window is read off the ledger, not stated.
    const received = screen.getByText('Received').parentElement as HTMLElement
    expect(within(received).getByText('12')).toBeInTheDocument()
  })

  it('exports the parts currently in view as a CSV', async () => {
    const user = userEvent.setup()
    const createUrl = vi.fn(() => 'blob:report')
    const revokeUrl = vi.fn()
    vi.stubGlobal('URL', { ...URL, createObjectURL: createUrl, revokeObjectURL: revokeUrl })
    const clicks: string[] = []
    const originalCreate = document.createElement.bind(document)
    const spy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreate(tag) as HTMLElement
      if (tag === 'a') el.click = () => clicks.push((el as HTMLAnchorElement).download)
      return el
    })

    renderWithProviders(<InventoryReports api={null} />)
    await waitFor(() => expect(screen.getAllByText(PARTS[0]!.name).length).toBeGreaterThan(0))
    await user.click(screen.getByRole('button', { name: /export report/i }))

    await waitFor(() => expect(screen.getByText(/exported/i)).toBeInTheDocument())
    expect(createUrl).toHaveBeenCalled()
    expect(clicks).toContain('inventory-report.csv')
    spy.mockRestore()
    vi.unstubAllGlobals()
  })

  it('renders in Arabic without leaving the title in English', async () => {
    renderWithProviders(<InventoryReports api={null} />, { language: 'ar' })
    await waitFor(() => expect(screen.getAllByText(PARTS[0]!.name).length).toBeGreaterThan(0))
    expect(
      screen.getByText(AR['Inventory Reports'] ?? 'Inventory Reports')
    ).toBeInTheDocument()
  })

  it('surfaces a failed parts load with a retry', async () => {
    const failing = await import('@/data/repository')
    const spy = vi
      .spyOn(failing.repository.parts, 'list')
      .mockRejectedValue(new failing.RepositoryError('network', 'The server could not be reached.'))

    renderWithProviders(<InventoryReports api={null} />)
    expect(await screen.findByText(/couldn't load the parts list/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    spy.mockRestore()
  })
})
