import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { renderWithProviders } from '../helpers/render'

/** The two screens wired to the repository seam in this pass.
 *
 *  `Interactive3DParts` used to carry six part models as a constant, and
 *  `PurchaseAgentSuppliers` eight vendors with ratings and delivery times. Both
 *  now read their collection, so what is under test is: the rows on screen are
 *  the rows the repository handed over; an empty collection says so rather than
 *  rendering nothing; a failed read offers a retry; and the fields the record
 *  genuinely does not carry are named as absent instead of being invented
 *  again.
 *
 *  The repository is substituted rather than the hook, so the real query keys,
 *  the real `select`, and the real loading and error paths all run. */

const h = vi.hoisted(() => ({
  state: {
    parts: [] as Record<string, unknown>[],
    suppliers: [] as Record<string, unknown>[],
    fail: null as Error | null,
  },
}))

vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  const { state } = h
  const rowsOf = (key: string) =>
    (state as unknown as Record<string, Record<string, unknown>[]>)[key] ?? []

  const refuse = () => Promise.reject(new actual.RepositoryError('forbidden', 'Read-only test double.'))

  const collection = (key: string) => ({
    async list() {
      if (state.fail) throw state.fail
      const rows = rowsOf(key)
      return {
        rows,
        page: { page: 1, pageSize: rows.length || 1, total: rows.length, totalPages: 1 },
      }
    },
    get: refuse,
    create: refuse,
    update: refuse,
    delete: refuse,
    bulkCreate: refuse,
    bulkUpdate: refuse,
    bulkDelete: refuse,
  })

  return {
    ...actual,
    isLive: true,
    repository: new Proxy({}, { get: (_target, key: string) => collection(key) }),
  }
})

const { Interactive3DParts } = await import('@/screens/parts/Interactive3DParts')
const { PurchaseAgentSuppliers } = await import('@/screens/portals/purchase/PurchaseAgentSuppliers')
const { RepositoryError } = await import('@/data/repository')

const OIL_FILTER = {
  _id: 'P1',
  _version: 1,
  name: 'Oil Filter (Toyota)',
  sku: 'OF-TY-118',
  stock: 142,
  reorder: 40,
  price: 'SAR 45',
}

const SPARK_PLUGS = {
  _id: 'P2',
  _version: 1,
  name: 'Spark Plug Set',
  sku: 'SP-SET-04',
  stock: 12,
  reorder: 20,
  price: 'SAR 140',
}

const GULF = {
  _id: 'S1',
  _version: 1,
  id: 'S1',
  code: 'SUP-0001',
  name: 'Gulf Motor Supply',
  nameAr: null,
  contact: 'Fahad Al-Harbi',
  contactPhone: '+966 55 000 1122',
  contactEmail: 'orders@gulfmotor.example',
  status: 'active',
}

const DORMANT = {
  _id: 'S2',
  _version: 1,
  id: 'S2',
  code: 'SUP-0002',
  name: 'Tabuk Motors Wholesale',
  nameAr: null,
  contact: null,
  contactPhone: null,
  contactEmail: null,
  status: 'inactive',
}

beforeEach(() => {
  h.state.parts = []
  h.state.suppliers = []
  h.state.fail = null
})

describe('Interactive 3D Parts reads the parts collection', () => {
  it('lists the parts the repository supplies, not a catalog typed into the file', async () => {
    h.state.parts = [{ ...OIL_FILTER }, { ...SPARK_PLUGS }]
    renderWithProviders(<Interactive3DParts />, { role: 'parts' })

    expect(await screen.findByText('Oil Filter (Toyota)')).toBeInTheDocument()
    expect(screen.getByText('OF-TY-118')).toBeInTheDocument()
    expect(screen.getByText('Spark Plug Set')).toBeInTheDocument()

    // The part numbers the screen used to invent are gone for good.
    expect(screen.queryByText('47750-06140')).not.toBeInTheDocument()
    expect(screen.queryByText('Toyota Camry 2020-2025')).not.toBeInTheDocument()
  })

  it('derives the stock badge from the row rather than asserting a status', async () => {
    h.state.parts = [{ ...OIL_FILTER }, { ...SPARK_PLUGS }]
    renderWithProviders(<Interactive3DParts />, { role: 'parts' })

    // 142 against a reorder level of 40, then 12 against 20.
    expect(await screen.findByText('In Stock')).toBeInTheDocument()
    expect(screen.getByText('Low Stock')).toBeInTheDocument()
  })

  it('renders the empty state when the collection is empty', async () => {
    renderWithProviders(<Interactive3DParts />, { role: 'parts' })
    expect(await screen.findByText('No parts listed')).toBeInTheDocument()
  })

  it('offers a retry when the read fails', async () => {
    h.state.fail = new RepositoryError('network', 'The server did not answer.')
    renderWithProviders(<Interactive3DParts />, { role: 'parts' })

    expect(await screen.findByRole('alert')).toHaveTextContent('The server did not answer.')
    expect(screen.getByRole('button', { name: /Retry/ })).toBeInTheDocument()
  })

  it('names the catalog fields the inventory record does not carry', async () => {
    h.state.parts = [{ ...OIL_FILTER }]
    renderWithProviders(<Interactive3DParts />, { role: 'parts' })

    await screen.findByText('Oil Filter (Toyota)')
    const note = screen.getByRole('note')
    expect(note).toHaveTextContent('Not recorded in this dataset')
    for (const field of ['Category', 'Fits', 'Views', '3D Viewer']) {
      expect(note).toHaveTextContent(field)
    }
    expect(screen.getAllByText('Not connected')).toHaveLength(4)
  })
})

describe('Purchase agent supplier directory reads the suppliers collection', () => {
  it('lists the suppliers the repository supplies, with the counts of what it showed', async () => {
    h.state.suppliers = [{ ...GULF }, { ...DORMANT }]
    renderWithProviders(<PurchaseAgentSuppliers />, { role: 'procurement' })

    expect(await screen.findByText('Gulf Motor Supply')).toBeInTheDocument()
    expect(screen.getByText('SUP-0001')).toBeInTheDocument()
    expect(screen.getByText('orders@gulfmotor.example')).toBeInTheDocument()
    expect(screen.getByText('Tabuk Motors Wholesale')).toBeInTheDocument()

    // Two rows, one of them active — counted, never quoted from the design.
    const total = screen.getByText('Total Suppliers').closest('div')?.parentElement
    expect(total).toHaveTextContent('2')
    expect(screen.queryByText('48')).not.toBeInTheDocument()
    expect(screen.queryByText('4.3')).not.toBeInTheDocument()
  })

  it('shows a supplier with no contact details as unknown rather than blank', async () => {
    h.state.suppliers = [{ ...DORMANT }]
    renderWithProviders(<PurchaseAgentSuppliers />, { role: 'procurement' })

    await screen.findByText('Tabuk Motors Wholesale')
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    expect(within(screen.getByRole('table')).getByText('Inactive')).toBeInTheDocument()
  })

  it('renders the empty state when no supplier is on file', async () => {
    renderWithProviders(<PurchaseAgentSuppliers />, { role: 'procurement' })
    expect(await screen.findByText('No suppliers on file yet')).toBeInTheDocument()
  })

  it('offers a retry when the read fails', async () => {
    h.state.fail = new RepositoryError('network', 'The server did not answer.')
    renderWithProviders(<PurchaseAgentSuppliers />, { role: 'procurement' })

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('The server did not answer.')
    )
    expect(screen.getByRole('button', { name: /Retry/ })).toBeInTheDocument()
  })

  it('names the directory columns the supplier record does not carry', async () => {
    h.state.suppliers = [{ ...GULF }]
    renderWithProviders(<PurchaseAgentSuppliers />, { role: 'procurement' })

    await screen.findByText('Gulf Motor Supply')
    const note = screen.getByRole('note')
    for (const field of ['Category', 'City', 'Rating', 'Orders', 'Avg Delivery']) {
      expect(note).toHaveTextContent(field)
    }
    expect(screen.getAllByText('Not connected')).toHaveLength(5)
  })
})
