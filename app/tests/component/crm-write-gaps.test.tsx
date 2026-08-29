import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../helpers/render'

/** The fixture half of the F-027 CRM / fleet writes.
 *
 *  With no `VITE_API_URL` the app reads demo data and refuses writes — it never
 *  reports a save the next reload would contradict (§60). Every write control
 *  the four CRM surfaces now offer must therefore *say so* against the fixtures
 *  rather than fake it: this mounts each with `isLive` false and checks the
 *  honest "set VITE_API_URL" notice is on the write path. The live half lives in
 *  the two sibling detail/calendar tests. */

const LEAD_ID = '01HQ8ZK3M4N5P6R7S8T9V0LEAD'
const FLEET_ID = '01HQ8ZK3M4N5P6R7S8T9V0FLT0'

const h = vi.hoisted(() => ({
  state: {
    leads: [] as Record<string, unknown>[],
    fleets: [] as Record<string, unknown>[],
    customers: [] as Record<string, unknown>[],
    vehicles: [] as Record<string, unknown>[],
    crmTasks: [] as Record<string, unknown>[],
    jobs: [] as Record<string, unknown>[],
  },
}))

vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  const { state } = h
  const rowsOf = (key: string) =>
    (state as unknown as Record<string, Record<string, unknown>[]>)[key] ?? []

  // The fixture repository refuses every write, exactly as the real one does.
  const refuse = () => {
    throw new actual.RepositoryError(
      'unsupported',
      'The fixture repository cannot write. Set VITE_API_URL to run against the API.',
    )
  }

  const collection = (key: string) => ({
    async list() {
      const rows = rowsOf(key)
      return { rows, page: { page: 1, pageSize: rows.length || 1, total: rows.length, totalPages: 1 } }
    },
    async get(id: string) {
      const row = rowsOf(key).find((r) => r._id === id)
      if (!row) throw new actual.RepositoryError('not_found', 'No record.')
      return row
    },
    create: refuse,
    update: refuse,
    async delete() {
      refuse()
    },
    async bulkCreate() {
      return refuse()
    },
    async bulkUpdate() {
      return refuse()
    },
    async bulkDelete() {
      refuse()
    },
  })

  return {
    ...actual,
    isLive: false,
    repository: new Proxy({}, { get: (_t, key: string) => collection(key) }),
  }
})

const { LeadDetail } = await import('@/screens/crm/LeadDetail')
const { FleetContract } = await import('@/screens/registry/FleetContract')
const { CRMCalendar } = await import('@/screens/crm/CRMCalendar')
const { CustomerFeedback } = await import('@/screens/registry/CustomerFeedback')

beforeEach(() => {
  h.state.leads = [
    { _id: LEAD_ID, _version: 1, name: 'Huda Al-Rashid', company: 'Riyadh Motors Group', value: 'SAR 120,000', source: 'Referral', stage: 'qualified', date: 'Jul 18, 2026', score: 91 },
  ]
  h.state.fleets = [
    { _id: FLEET_ID, _version: 1, name: 'Riyadh Logistics Co.', vehicles: 24, active: 6, contract: 'active' },
  ]
  h.state.customers = []
  h.state.vehicles = []
  h.state.crmTasks = [
    { _id: 'T1', title: 'Call: Tariq', assigned: 'Khalid', due: 'Jul 23, 2026', priority: 'high', status: 'todo', type: 'call' },
  ]
  h.state.jobs = [
    { id: 'A3F8B2C1', cust: 'Ahmed Al-Rashid', veh: 'Toyota Camry 2022', svc: 'maintenance', st: 'delivered', pr: 'medium' },
  ]
})

const at = (route: string) => ({ route, role: 'owner' as const })
const NOTICE = /set VITE_API_URL/

describe('CRM writes against the fixtures say so rather than fake it', () => {
  it('LeadDetail edit shows the honest no-API notice', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadDetail />, at(`/lead-detail?id=${LEAD_ID}`))
    await screen.findByRole('heading', { name: 'Huda Al-Rashid' })

    await user.click(screen.getByRole('button', { name: /Edit/ }))
    expect(await screen.findByText(NOTICE)).toBeInTheDocument()
  })

  it('LeadDetail convert shows the honest no-API notice', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LeadDetail />, at(`/lead-detail?id=${LEAD_ID}`))
    await screen.findByRole('heading', { name: 'Huda Al-Rashid' })

    await user.click(screen.getByRole('button', { name: /Convert to Opportunity/ }))
    expect(await screen.findByText(NOTICE)).toBeInTheDocument()
  })

  it('FleetContract renew shows the honest no-API notice', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FleetContract />, at(`/fleet-contract?id=${FLEET_ID}`))
    await screen.findByRole('heading', { name: 'Riyadh Logistics Co.' })

    await user.click(screen.getByRole('button', { name: /Renew Contract/ }))
    expect(await screen.findByText(NOTICE)).toBeInTheDocument()
  })

  it('CRMCalendar new task shows the honest no-API notice', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CRMCalendar />, at('/crmcalendar'))
    await screen.findByText('July 2026')

    await user.click(screen.getByRole('button', { name: /New Task/ }))
    expect(await screen.findByText(NOTICE)).toBeInTheDocument()
  })

  it('CustomerFeedback shows the honest no-API notice and refuses the submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerFeedback />, at('/customer-feedback'))
    await screen.findByText('Toyota Camry 2022')

    expect(screen.getByText(NOTICE)).toBeInTheDocument()

    // The submit is enabled once a rating is chosen, but the fixture refuses it —
    // honestly, with the server's message, not a faked success.
    await user.click(screen.getByRole('radio', { name: '4 stars' }))
    await user.click(screen.getByRole('button', { name: /Submit Feedback/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/Set VITE_API_URL/i)
    expect(screen.queryByText('Thank you for your feedback')).not.toBeInTheDocument()
  })
})
