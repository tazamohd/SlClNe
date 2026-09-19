import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InternalWarehouse } from '@/screens/inventory/InternalWarehouse'
import { repository, type PartRow } from '@/data/repository'
import { renderWithProviders } from '../helpers/render'

/** Internal Warehouse (BLK-004) — the screen no longer renders the hardcoded
 *  `ZONES` array whose capacity, utilisation and item counts were invented and
 *  whose four KPIs were then computed from that invention. It reads
 *  `warehouseZones` (`GET/PATCH /warehouse-zones`) and `parts`
 *  (`GET /inventory`), and every count and percentage on it is derived from the
 *  parts actually assigned to each zone.
 *
 *  That derivation is the thing worth proving, so these cases do not merely
 *  check that a percentage appears: they put real stock into a bay through the
 *  repository and assert the bay's numbers follow. A recorded item count would
 *  pass a "renders a percentage" test and fail these.
 *
 *  The fixture repository is session-scoped and mutating, so every case removes
 *  what it added. Stock is added by `repository.parts.create(...)` rather than
 *  by re-assigning a seeded part: the design-bundle fixture rows carry no id of
 *  their own (they predate the API), so they cannot be the subject of a generic
 *  update in this build.
 */

type PartInput = Parameters<typeof repository.parts.create>[0]

async function addStock(part: {
  name: string
  sku: string
  stock: number
  zoneCode: string | null
}): Promise<string> {
  const created = await repository.parts.create({
    name: part.name,
    sku: part.sku,
    stock: part.stock,
    reorder: 5,
    price: 'SAR 100',
    zoneCode: part.zoneCode,
  } as unknown as PartInput)
  const id = (created as PartRow & { _id?: string })._id
  if (!id) throw new Error('expected the fixture repository to assign an id')
  return id
}

async function rowFor(name: string): Promise<HTMLElement> {
  const cell = await screen.findByText(name)
  const row = cell.closest('tr')
  if (!row) throw new Error(`expected a table row for ${name}`)
  return row
}

describe('InternalWarehouse (fixture build)', () => {
  it('derives each zone utilisation from the stock assigned to it', async () => {
    renderWithProviders(<InternalWarehouse />, { role: 'parts' })

    /* A1 Main Floor holds the oil filters (142) and the brake pads (18) — 160
     * of a recorded 500-unit capacity. */
    const mainFloor = await rowFor('Main Floor')
    expect(within(mainFloor).getByText('32%')).toBeInTheDocument()
    expect(within(mainFloor).getByText('160')).toBeInTheDocument()
    expect(within(mainFloor).getByText('500')).toBeInTheDocument()
    expect(within(mainFloor).getByText('2')).toBeInTheDocument()

    /* A2 Mezzanine holds the air filters (96) and spark plugs (12) of 200. */
    expect(within(await rowFor('Mezzanine')).getByText('54%')).toBeInTheDocument()

    /* An empty bay reads 0% and is not hidden — Golden Path 7 depends on the
     * Receiving bay being here whether or not stock is sitting in it. */
    expect(within(await rowFor('Receiving')).getByText('0%')).toBeInTheDocument()

    /* The KPI is the real totals over each other (268 of 1,100), not an average
     * of the per-zone percentages. */
    expect(screen.getByText('1100')).toBeInTheDocument()
    expect(screen.getByText('24%')).toBeInTheDocument()
  })

  it('follows the stock: putting units into an empty bay is what fills it', async () => {
    /* A4 Hazmat is empty and holds 50 units. */
    const id = await addStock({ name: 'Coolant Drum', sku: 'CL-DR-500', stock: 25, zoneCode: 'A4' })
    try {
      renderWithProviders(<InternalWarehouse />, { role: 'parts' })
      const hazmat = await rowFor('Hazmat')
      expect(within(hazmat).getByText('50%')).toBeInTheDocument()
      expect(within(hazmat).getByText('25')).toBeInTheDocument()
    } finally {
      await repository.parts.delete(id)
    }
  })

  it('shows a bay over its capacity as Full, a state nothing records', async () => {
    /* A6 Shipping holds 120 units; 150 in it is over capacity. */
    const id = await addStock({ name: 'Pallet Of Filters', sku: 'PL-FL-001', stock: 150, zoneCode: 'A6' })
    try {
      renderWithProviders(<InternalWarehouse />, { role: 'parts' })
      const shipping = await rowFor('Shipping')
      expect(within(shipping).getByText('125%')).toBeInTheDocument()
      expect(within(shipping).getByText('Full')).toBeInTheDocument()
    } finally {
      await repository.parts.delete(id)
    }
  })

  it('reports stock that is not put away instead of dropping it from the totals', async () => {
    const id = await addStock({ name: 'Unracked Hoses', sku: 'UH-000-1', stock: 7, zoneCode: null })
    try {
      renderWithProviders(<InternalWarehouse />, { role: 'parts' })
      expect(await screen.findByText(/Not yet put away/)).toBeInTheDocument()
      expect(screen.getByText(/1 items · 7 units/)).toBeInTheDocument()
    } finally {
      await repository.parts.delete(id)
    }
  })

  it('takes a bay out of service and back, a real status write rather than a label', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InternalWarehouse />, { role: 'parts' })

    const hazmat = await rowFor('Hazmat')
    await user.click(within(hazmat).getByRole('button', { name: /Under Maintenance/ }))

    await waitFor(async () => {
      const refreshed = await rowFor('Hazmat')
      expect(within(refreshed).getByText('Maintenance')).toBeInTheDocument()
    })
    expect(
      within(await rowFor('Hazmat')).getByRole('button', { name: /Return to Service/ }),
    ).toBeInTheDocument()

    await user.click(within(await rowFor('Hazmat')).getByRole('button', { name: /Return to Service/ }))
    await waitFor(async () => {
      expect(within(await rowFor('Hazmat')).getByText('Active')).toBeInTheDocument()
    })
  })

  it('hides the lifecycle action from a role with only inventory view', async () => {
    renderWithProviders(<InternalWarehouse />, { role: 'technician' })
    expect(await screen.findByText('Main Floor')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Under Maintenance/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Return to Service/ })).toBeNull()
  })
})
