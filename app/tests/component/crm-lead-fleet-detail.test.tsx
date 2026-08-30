import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../helpers/render'

/** `LeadDetail` and `FleetContract` on the shared `DetailPage` frame, wired to
 *  the F-027 writes.
 *
 *  Both render the fields their collection carries and gap what has no server
 *  source, and both now offer the real write controls the collections back — Edit
 *  and Convert to Opportunity on the lead, Renew on the fleet — so the assertions
 *  check the real data, the real controls, and the parts still honestly gapped.
 *  The fixture-refusal half lives in `crm-write-gaps.test.tsx`. */

const LEAD_ID = '01HQ8ZK3M4N5P6R7S8T9V0LEAD'
const FLEET_ID = '01HQ8ZK3M4N5P6R7S8T9V0FLT0'

const h = vi.hoisted(() => ({
  state: {
    leads: [] as Record<string, unknown>[],
    fleets: [] as Record<string, unknown>[],
    customers: [] as Record<string, unknown>[],
    vehicles: [] as Record<string, unknown>[],
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
      if (state.failList) throw new actual.RepositoryError('network', 'The server could not be reached.')
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
      return { _id: id, _version: 2, ...patch }
    },
    async delete() {},
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
    repository: new Proxy({}, { get: (_t, key: string) => collection(key) }),
  }
})

const { LeadDetail } = await import('@/screens/crm/LeadDetail')
const { FleetContract } = await import('@/screens/registry/FleetContract')

beforeEach(() => {
  h.state.failList = false
  h.state.leads = [
    {
      _id: LEAD_ID,
      _version: 1,
      _createdAt: '2026-07-18T09:00:00.000Z',
      name: 'Huda Al-Rashid',
      company: 'Riyadh Motors Group',
      value: 'SAR 120,000',
      source: 'Referral',
      stage: 'qualified',
      date: 'Jul 18, 2026',
      score: 91,
    },
  ]
  h.state.fleets = [
    {
      _id: FLEET_ID,
      _version: 1,
      name: 'Riyadh Logistics Co.',
      vehicles: 24,
      active: 6,
      contract: 'active',
      contractType: 'enterprise',
      contractValue: 'SAR 240,000',
      start: 'Jan 1, 2026',
      end: 'Dec 31, 2026',
      renewal: 'Nov 30, 2026',
      contact: 'Sara Al-Otaibi',
      contactPhone: '+966 55 000 1122',
    },
  ]
  h.state.customers = [
    { _id: 'CUST1', name: 'Nasser Al-Harbi', fleetId: FLEET_ID },
  ]
  h.state.vehicles = [
    { plate: 'RUH 7788', make: 'Toyota Hiace 2023', owner: 'Nasser Al-Harbi', customerId: 'CUST1', mileage: '18,000 km', status: 'active' },
  ]
})

const at = (route: string) => ({ route, role: 'owner' as const })

describe('LeadDetail', () => {
  it('renders the lead, the real deal fields and the conversion rail', async () => {
    renderWithProviders(<LeadDetail />, at(`/lead-detail?id=${LEAD_ID}`))

    expect(await screen.findByRole('heading', { name: 'Huda Al-Rashid' })).toBeInTheDocument()
    expect(screen.getAllByText('Riyadh Motors Group').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Qualified').length).toBeGreaterThan(0)
    expect(screen.getByRole('progressbar', { name: 'Lead Score' })).toHaveAttribute(
      'aria-valuenow',
      '91',
    )
    expect(screen.getByText('Negotiation')).toBeInTheDocument()
  })

  it('derives activity and notes from the lead fields', async () => {
    renderWithProviders(<LeadDetail />, at(`/lead-detail?id=${LEAD_ID}`))
    await screen.findByRole('heading', { name: 'Huda Al-Rashid' })

    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()
  })

  it('offers Edit and Convert now the lead collection and convert route are live', async () => {
    renderWithProviders(<LeadDetail />, at(`/lead-detail?id=${LEAD_ID}`))
    await screen.findByRole('heading', { name: 'Huda Al-Rashid' })

    expect(screen.getByRole('button', { name: /Edit/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Convert to Opportunity/ })).toBeInTheDocument()
  })

  it('opens the convert dialog, which describes what conversion does', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadDetail />, at(`/lead-detail?id=${LEAD_ID}`))
    await screen.findByRole('heading', { name: 'Huda Al-Rashid' })

    await user.click(screen.getByRole('button', { name: /Convert to Opportunity/ }))
    expect(await screen.findByText(/creates an opportunity from the lead/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Convert$/ })).toBeInTheDocument()
  })

  it('opens the edit dialog with the lead’s own values', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadDetail />, at(`/lead-detail?id=${LEAD_ID}`))
    await screen.findByRole('heading', { name: 'Huda Al-Rashid' })

    await user.click(screen.getByRole('button', { name: /Edit/ }))
    expect(await screen.findByDisplayValue('Riyadh Motors Group')).toBeInTheDocument()
  })

  it('shows the converted state and drops the convert action for a converted lead', async () => {
    h.state.leads[0].stage = 'converted'
    renderWithProviders(<LeadDetail />, at(`/lead-detail?id=${LEAD_ID}`))
    await screen.findByRole('heading', { name: 'Huda Al-Rashid' })

    expect(screen.getByText('Lead converted')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Convert to Opportunity/ })).not.toBeInTheDocument()
    // Edit is still available on a converted lead.
    expect(screen.getByRole('button', { name: /Edit/ })).toBeInTheDocument()
  })

  it('shows the off-pipeline state for a lost lead', async () => {
    h.state.leads[0].stage = 'lost'
    renderWithProviders(<LeadDetail />, at(`/lead-detail?id=${LEAD_ID}`))
    await screen.findByRole('heading', { name: 'Huda Al-Rashid' })
    expect(screen.getByText('Lead lost')).toBeInTheDocument()
  })

  it('falls back to a query by name, as the pipeline links do', async () => {
    renderWithProviders(<LeadDetail />, at('/lead-detail?name=Huda%20Al-Rashid'))
    expect(await screen.findByRole('heading', { name: 'Huda Al-Rashid' })).toBeInTheDocument()
  })

  it('says so when the link names no lead', async () => {
    renderWithProviders(<LeadDetail />, at('/lead-detail?id=nobody'))
    expect(await screen.findByText('Lead not found')).toBeInTheDocument()
  })

  it('offers a retry when the load fails', async () => {
    h.state.failList = true
    renderWithProviders(<LeadDetail />, at(`/lead-detail?id=${LEAD_ID}`))
    expect(await screen.findByRole('button', { name: /Retry/ })).toBeInTheDocument()
  })

  it('translates its chrome', async () => {
    renderWithProviders(<LeadDetail />, {
      route: `/lead-detail?id=${LEAD_ID}`,
      role: 'owner',
      language: 'ar',
    })
    await screen.findByRole('heading', { name: 'Huda Al-Rashid' })
    expect(screen.getAllByText('قيمة الصفقة').length).toBeGreaterThan(0)
  })
})

describe('FleetContract', () => {
  it('renders the fleet, its status and the two real counts', async () => {
    renderWithProviders(<FleetContract />, at(`/fleet-contract?id=${FLEET_ID}`))

    expect(await screen.findByRole('heading', { name: 'Riyadh Logistics Co.' })).toBeInTheDocument()
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
    expect(screen.getByText('Vehicles')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('Active Jobs')).toBeInTheDocument()
  })

  it('renders the contract terms now on the fleet row', async () => {
    renderWithProviders(<FleetContract />, at(`/fleet-contract?id=${FLEET_ID}`))
    await screen.findByRole('heading', { name: 'Riyadh Logistics Co.' })

    expect(screen.getByText('Contract Type')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
    expect(screen.getByText('SAR 240,000')).toBeInTheDocument()
    expect(screen.getByText('Sara Al-Otaibi')).toBeInTheDocument()
    // The "not on record" fallback is gone once terms are present.
    expect(screen.queryByText(/are not on record/)).not.toBeInTheDocument()
  })

  it('lists the fleet’s vehicles via the customers→vehicles join', async () => {
    renderWithProviders(<FleetContract />, at(`/fleet-contract?id=${FLEET_ID}`))
    await screen.findByRole('heading', { name: 'Riyadh Logistics Co.' })

    expect(await screen.findByText('Toyota Hiace 2023')).toBeInTheDocument()
  })

  it('offers Renew, and opens the renewal dialog', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FleetContract />, at(`/fleet-contract?id=${FLEET_ID}`))
    await screen.findByRole('heading', { name: 'Riyadh Logistics Co.' })

    await user.click(screen.getByRole('button', { name: /Renew Contract/ }))
    expect(await screen.findByLabelText(/New End Date/)).toBeInTheDocument()
  })

  it('still gaps service history honestly', async () => {
    renderWithProviders(<FleetContract />, at(`/fleet-contract?id=${FLEET_ID}`))
    await screen.findByRole('heading', { name: 'Riyadh Logistics Co.' })
    expect(screen.getByText('No service history')).toBeInTheDocument()
  })

  it('falls back to the "not on record" note for a fleet with no terms', async () => {
    h.state.fleets = [
      { _id: FLEET_ID, _version: 1, name: 'Bare Fleet', vehicles: 3, active: 0, contract: 'active' },
    ]
    renderWithProviders(<FleetContract />, at(`/fleet-contract?id=${FLEET_ID}`))
    await screen.findByRole('heading', { name: 'Bare Fleet' })
    expect(screen.getByText(/are not on record/)).toBeInTheDocument()
  })

  it('says so when the link names no fleet', async () => {
    renderWithProviders(<FleetContract />, at('/fleet-contract?id=nobody'))
    expect(await screen.findByText('Fleet not found')).toBeInTheDocument()
  })
})
