import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setViewportWidth } from '@/test-setup'
import { renderWithProviders } from '../helpers/render'

/** `CustomerDetail` and `VehicleDetail` against the data they actually join.
 *
 *  Both are designed screens with a separate `.Mobile.dc.html`, so the phone
 *  assertions are not "does it still fit" — they check that the phone screen
 *  shows the different set of things its own design shows. */

const CUSTOMER_ID = '01HQ8ZK3M4N5P6R7S8T9V0WXYZ'
const VEHICLE_ID = '01HQ8ZK3M4N5P6R7S8T9V0WXY1'

const h = vi.hoisted(() => ({
  state: {
    customers: [] as Record<string, unknown>[],
    vehicles: [] as Record<string, unknown>[],
    jobs: [] as Record<string, unknown>[],
    invoices: [] as Record<string, unknown>[],
    estimates: [] as Record<string, unknown>[],
    deleted: [] as string[],
    failList: false,
  },
}))

vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  const { state } = h
  const rowsOf = (key: string) =>
    (state as unknown as Record<string, Record<string, unknown>[]>)[key] ?? []

  const collection = (key: string) => ({
    async list() {
      if (state.failList) {
        throw new actual.RepositoryError('network', 'The server could not be reached.')
      }
      const rows = rowsOf(key)
      return { rows, page: { page: 1, pageSize: rows.length || 1, total: rows.length, totalPages: 1 } }
    },
    async get(id: string) {
      const row = rowsOf(key).find((r) => r._id === id)
      if (!row) throw new actual.RepositoryError('not_found', 'No record.')
      return row
    },
    async create(input: Record<string, unknown>) {
      return { ...input, _id: 'NEW', _version: 1 }
    },
    async update(id: string, patch: Record<string, unknown>) {
      const row = rowsOf(key).find((r) => r._id === id)
      Object.assign(row ?? {}, patch)
      return row
    },
    async delete(id: string) {
      state.deleted.push(id)
      const rows = rowsOf(key)
      const at = rows.findIndex((r) => r._id === id)
      if (at >= 0) rows.splice(at, 1)
    },
    async bulkCreate() {
      return []
    },
    async bulkUpdate() {
      return []
    },
    async bulkDelete() {},
  })

  return {
    ...actual,
    isLive: true,
    repository: new Proxy({}, { get: (_target, key: string) => collection(key) }),
  }
})

const { CustomerDetail } = await import('@/screens/registry/CustomerDetail')
const { VehicleDetail } = await import('@/screens/registry/VehicleDetail')

beforeEach(() => {
  h.state.failList = false
  h.state.deleted = []
  h.state.customers = [
    {
      _id: CUSTOMER_ID,
      _version: 1,
      _createdAt: '2024-03-11T09:00:00.000Z',
      name: 'Ahmed Al-Rashid',
      phone: '+966 55 210 4471',
      email: 'ahmed@email.com',
      type: 'individual',
      vehicles: 2,
      spent: 'SAR 12,840',
      last: '2 weeks ago',
    },
  ]
  h.state.vehicles = [
    {
      _id: VEHICLE_ID,
      _version: 1,
      plate: 'RUH 4821',
      make: 'Toyota Camry 2022',
      owner: 'Ahmed Al-Rashid',
      mileage: '42,180 km',
      mileageKm: 42180,
      last: '2 weeks ago',
      status: 'service',
      customerId: CUSTOMER_ID,
      vin: '6T1BF1FK5CX123456',
    },
  ]
  h.state.jobs = [
    { id: 'A3F8B2C1', cust: 'Ahmed Al-Rashid', veh: 'Toyota Camry 2022', svc: 'maintenance', st: 'in_progress', pr: 'medium' },
  ]
  h.state.invoices = [
    { id: 'INV-2026-0142', cust: 'Ahmed Al-Rashid', amount: 'SAR 1,840', due: 'Jul 28, 2026', status: 'unpaid' },
  ]
  h.state.estimates = [
    { id: 'EST-0231', cust: 'Ahmed Al-Rashid', veh: 'Toyota Camry 2022', amount: 'SAR 1,250', status: 'draft' },
  ]
})

const at = (route: string) => ({ route, role: 'owner' as const })

describe('CustomerDetail', () => {
  it('renders the profile, the stats and both related panels the design draws', async () => {
    renderWithProviders(<CustomerDetail />, at(`/customer-detail?id=${CUSTOMER_ID}`))

    expect(await screen.findByRole('heading', { name: 'Ahmed Al-Rashid' })).toBeInTheDocument()
    expect(screen.getByText('ahmed@email.com')).toBeInTheDocument()
    expect(screen.getByText('Total Jobs')).toBeInTheDocument()
    // Member Since comes from the record's own creation timestamp.
    expect(screen.getByText('2024')).toBeInTheDocument()

    // The vehicle is joined by owner and is a link to its own detail page.
    expect(screen.getByRole('link', { name: /Toyota Camry 2022/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /INV-2026-0142/ })).toBeInTheDocument()
    // The service-history table shows the columns a job card actually carries.
    expect(within(screen.getByRole('table')).getByText('A3F8B2C1')).toBeInTheDocument()
  })

  it('falls back to a query by name, as the registry links do', async () => {
    renderWithProviders(<CustomerDetail />, at('/customer-detail?name=Ahmed%20Al-Rashid'))
    expect(await screen.findByRole('heading', { name: 'Ahmed Al-Rashid' })).toBeInTheDocument()
  })

  it('says so when the link names nobody', async () => {
    renderWithProviders(<CustomerDetail />, at('/customer-detail?id=nobody'))
    expect(await screen.findByText('Customer not found')).toBeInTheDocument()
  })

  it('offers a retry when the load fails', async () => {
    h.state.failList = true
    renderWithProviders(<CustomerDetail />, at(`/customer-detail?id=${CUSTOMER_ID}`))
    expect(await screen.findByRole('button', { name: /Retry/ })).toBeInTheDocument()
  })

  it('shows the phone design at 390 — three different stats, one panel', async () => {
    renderWithProviders(<CustomerDetail />, at(`/customer-detail?id=${CUSTOMER_ID}`))
    await screen.findByRole('heading', { name: 'Ahmed Al-Rashid' })

    act(() => setViewportWidth(390))
    expect(screen.getByText('Vehicles Count')).toBeInTheDocument()
    expect(screen.getByText('Last Visit')).toBeInTheDocument()
    expect(screen.queryByText('Member Since')).not.toBeInTheDocument()
    // Vehicles stays; invoices and the history table are desktop-only.
    expect(screen.getByText('Toyota Camry 2022')).toBeInTheDocument()
    expect(screen.queryByText('INV-2026-0142')).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('redacts contact details for a technician rather than blanking them', async () => {
    renderWithProviders(<CustomerDetail />, {
      route: `/customer-detail?id=${CUSTOMER_ID}`,
      role: 'technician',
    })
    await screen.findByRole('heading', { name: 'Ahmed Al-Rashid' })

    expect(screen.queryByText('ahmed@email.com')).not.toBeInTheDocument()
    expect(screen.queryByText('+966 55 210 4471')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Edit/ })).not.toBeInTheDocument()
    expect(screen.getByText(/Read-only/)).toBeInTheDocument()
  })

  it('deletes from the detail page after a confirmation that names the record', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerDetail />, at(`/customer-detail?id=${CUSTOMER_ID}`))
    await screen.findByRole('heading', { name: 'Ahmed Al-Rashid' })

    // Delete is a tertiary action, behind the header's overflow menu.
    await user.click(screen.getByRole('button', { name: /More actions/ }))
    await user.click(await screen.findByRole('menuitem', { name: /Delete/ }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Ahmed Al-Rashid')).toBeInTheDocument()
    // The count is the vehicles actually joined to this customer, not a guess.
    expect(dialog).toHaveTextContent('vehicles stay in the registry')

    await user.click(within(dialog).getByRole('button', { name: /^Delete$/ }))
    await waitFor(() => expect(h.state.deleted).toEqual([CUSTOMER_ID]))
  })

  it('opens the edit modal on the record', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerDetail />, at(`/customer-detail?id=${CUSTOMER_ID}`))
    await screen.findByRole('heading', { name: 'Ahmed Al-Rashid' })

    await user.click(screen.getByRole('button', { name: /Edit/ }))
    expect(within(screen.getByRole('dialog')).getByLabelText(/Full Name/)).toHaveValue(
      'Ahmed Al-Rashid'
    )
  })

  it('translates its chrome and leaves the record own words alone', async () => {
    renderWithProviders(<CustomerDetail />, {
      route: `/customer-detail?id=${CUSTOMER_ID}`,
      role: 'owner',
      language: 'ar',
    })
    await screen.findByRole('heading', { name: 'Ahmed Al-Rashid' })
    expect(screen.getByText('إجمالي الأعمال')).toBeInTheDocument()
    // "Vehicles" is both a stat and a panel title, so it appears twice.
    expect(screen.getAllByText('المركبات').length).toBeGreaterThan(0)
    expect(screen.getByText('سجل الخدمة')).toBeInTheDocument()
  })
})

describe('VehicleDetail', () => {
  it('leads with the make on desktop and carries the plate and VIN beneath', async () => {
    renderWithProviders(<VehicleDetail />, at(`/vehicle-detail?id=${VEHICLE_ID}`))

    expect(await screen.findByRole('heading', { name: 'Toyota Camry 2022' })).toBeInTheDocument()
    expect(screen.getByText('RUH 4821')).toBeInTheDocument()
    expect(screen.getByText('6T1BF1FK5CX123456')).toBeInTheDocument()
    expect(screen.getByText('In Service')).toBeInTheDocument()
    expect(screen.getByText('Odometer')).toBeInTheDocument()

    // Joined the way the mobile design joins them: jobs by make, estimates too.
    expect(screen.getByRole('link', { name: /A3F8B2C1/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /EST-0231/ })).toBeInTheDocument()
  })

  it('leads with the plate on a phone, and drops the estimates panel', async () => {
    renderWithProviders(<VehicleDetail />, at(`/vehicle-detail?id=${VEHICLE_ID}`))
    await screen.findByRole('heading', { name: 'Toyota Camry 2022' })

    act(() => setViewportWidth(390))
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('RUH 4821')
    expect(heading).toHaveAttribute('dir', 'ltr')
    expect(screen.getByText('Latest Job Cards')).toBeInTheDocument()
    expect(screen.queryByText('EST-0231')).not.toBeInTheDocument()
  })

  it('accepts the plate as the reference, as the registry links do', async () => {
    renderWithProviders(<VehicleDetail />, at('/vehicle-detail?plate=RUH%204821'))
    expect(await screen.findByRole('heading', { name: 'Toyota Camry 2022' })).toBeInTheDocument()
  })

  it('says so when the link names no vehicle', async () => {
    renderWithProviders(<VehicleDetail />, at('/vehicle-detail?id=nothing'))
    expect(await screen.findByText('Vehicle not found')).toBeInTheDocument()
  })

  it('shows an empty related panel with copy rather than a blank card', async () => {
    h.state.jobs = []
    h.state.estimates = []
    renderWithProviders(<VehicleDetail />, at(`/vehicle-detail?id=${VEHICLE_ID}`))
    await screen.findByRole('heading', { name: 'Toyota Camry 2022' })

    expect(screen.getByText('No job cards yet')).toBeInTheDocument()
    expect(screen.getByText('No estimates yet')).toBeInTheDocument()
  })

  it('gives an accountant a read-only vehicle', async () => {
    renderWithProviders(<VehicleDetail />, {
      route: `/vehicle-detail?id=${VEHICLE_ID}`,
      role: 'accountant',
    })
    await screen.findByRole('heading', { name: 'Toyota Camry 2022' })

    expect(screen.queryByRole('button', { name: /Edit/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Delete/ })).not.toBeInTheDocument()
    expect(screen.getByText(/Read-only/)).toBeInTheDocument()
  })
})
