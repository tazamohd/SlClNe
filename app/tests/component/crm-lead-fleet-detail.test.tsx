import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../helpers/render'

/** `LeadDetail` and `FleetContract` on the shared `DetailPage` frame.
 *
 *  Both render the fields their collection actually carries and gap the rest
 *  honestly, so the assertions check both halves: the real data shows, and the
 *  parts with no server source render an explained empty state rather than
 *  invented rows or a dead write control. */

const LEAD_ID = '01HQ8ZK3M4N5P6R7S8T9V0LEAD'
const FLEET_ID = '01HQ8ZK3M4N5P6R7S8T9V0FLT0'

const h = vi.hoisted(() => ({
  state: {
    leads: [] as Record<string, unknown>[],
    fleets: [] as Record<string, unknown>[],
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
    async update() {
      return {}
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
    { _id: FLEET_ID, _version: 1, name: 'Riyadh Logistics Co.', vehicles: 24, active: 6, contract: 'active' },
  ]
})

const at = (route: string) => ({ route, role: 'owner' as const })

describe('LeadDetail', () => {
  it('renders the lead, the real deal fields and the conversion rail', async () => {
    renderWithProviders(<LeadDetail />, at(`/lead-detail?id=${LEAD_ID}`))

    expect(await screen.findByRole('heading', { name: 'Huda Al-Rashid' })).toBeInTheDocument()
    expect(screen.getAllByText('Riyadh Motors Group').length).toBeGreaterThan(0)
    // Stage badge (header + deal panel), deal value and score meter are real.
    expect(screen.getAllByText('Qualified').length).toBeGreaterThan(0)
    expect(screen.getByRole('progressbar', { name: 'Lead Score' })).toHaveAttribute(
      'aria-valuenow',
      '91'
    )
    // Conversion path rail carries the pipeline stages.
    expect(screen.getByText('Negotiation')).toBeInTheDocument()
  })

  it('gaps activity and notes honestly rather than inventing a timeline', async () => {
    renderWithProviders(<LeadDetail />, at(`/lead-detail?id=${LEAD_ID}`))
    await screen.findByRole('heading', { name: 'Huda Al-Rashid' })

    expect(screen.getByText('No activity yet')).toBeInTheDocument()
    expect(screen.getByText('No notes yet')).toBeInTheDocument()
  })

  it('offers no write control the read-only lead collection cannot back', async () => {
    renderWithProviders(<LeadDetail />, at(`/lead-detail?id=${LEAD_ID}`))
    await screen.findByRole('heading', { name: 'Huda Al-Rashid' })

    expect(screen.queryByRole('button', { name: /Edit/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Convert/ })).not.toBeInTheDocument()
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
    // "Deal Value" is both a stat and a field label, so it appears twice.
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

  it('gaps contract terms, assigned vehicles and service history honestly', async () => {
    renderWithProviders(<FleetContract />, at(`/fleet-contract?id=${FLEET_ID}`))
    await screen.findByRole('heading', { name: 'Riyadh Logistics Co.' })

    expect(screen.getByText(/Contract terms/)).toBeInTheDocument()
    expect(screen.getByText('Vehicles not linked')).toBeInTheDocument()
    expect(screen.getByText('No service history')).toBeInTheDocument()
    // No renew control the read-only fleet collection cannot back.
    expect(screen.queryByRole('button', { name: /Renew/ })).not.toBeInTheDocument()
  })

  it('says so when the link names no fleet', async () => {
    renderWithProviders(<FleetContract />, at('/fleet-contract?id=nobody'))
    expect(await screen.findByText('Fleet not found')).toBeInTheDocument()
  })
})
