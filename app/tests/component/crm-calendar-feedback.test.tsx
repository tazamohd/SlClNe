import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../helpers/render'

/** `CRMCalendar` over `crmTasks`, and `CustomerFeedback` over a completed job.
 *
 *  The calendar places real tasks on their real due dates; the feedback form is
 *  fully interactive but honestly cannot submit, since no feedback endpoint
 *  exists. Both assertions check the real behaviour and the honest gap. */

const h = vi.hoisted(() => ({
  state: {
    crmTasks: [] as Record<string, unknown>[],
    jobs: [] as Record<string, unknown>[],
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
    async get() {
      throw new actual.RepositoryError('not_found', 'No record.')
    },
    async create() {
      return {}
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

const { CRMCalendar } = await import('@/screens/crm/CRMCalendar')
const { CustomerFeedback } = await import('@/screens/registry/CustomerFeedback')

beforeEach(() => {
  h.state.failList = false
  h.state.crmTasks = [
    { _id: 'T1', title: 'Call: Tariq Al-Dosari', assigned: 'Khalid Al-Amri', due: 'Jul 23, 2026', priority: 'high', status: 'todo', type: 'call' },
    { _id: 'T2', title: 'Demo: Al-Mamlaka', assigned: 'Fatima Al-Zahrani', due: 'Jul 25, 2026', priority: 'medium', status: 'todo', type: 'meeting' },
  ]
  h.state.jobs = [
    { id: 'A3F8B2C1', cust: 'Ahmed Al-Rashid', veh: 'Toyota Camry 2022', svc: 'maintenance', st: 'delivered', pr: 'medium' },
  ]
})

const at = (route: string) => ({ route, role: 'owner' as const })

describe('CRMCalendar', () => {
  it('opens on the month that holds tasks and places each on its due day', async () => {
    renderWithProviders(<CRMCalendar />, at('/crmcalendar'))

    expect(await screen.findByText('July 2026')).toBeInTheDocument()
    expect(screen.getAllByText('Call: Tariq Al-Dosari').length).toBeGreaterThan(0)
    // The legend the design lists.
    expect(screen.getByText('Calls')).toBeInTheDocument()
    expect(screen.getByText('Meetings')).toBeInTheDocument()
  })

  it('links to the task list and offers no create the read-only collection cannot back', async () => {
    renderWithProviders(<CRMCalendar />, at('/crmcalendar'))
    await screen.findByText('July 2026')

    expect(screen.getByRole('button', { name: /All Tasks/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /New Task/ })).not.toBeInTheDocument()
  })

  it('pages to the next month on demand', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CRMCalendar />, at('/crmcalendar'))
    await screen.findByText('July 2026')

    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByText('August 2026')).toBeInTheDocument()
  })

  it('shows an honest empty state when nothing is scheduled', async () => {
    h.state.crmTasks = []
    renderWithProviders(<CRMCalendar />, at('/crmcalendar'))
    expect(await screen.findByText('No scheduled tasks')).toBeInTheDocument()
  })

  it('offers a retry when the load fails', async () => {
    h.state.failList = true
    renderWithProviders(<CRMCalendar />, at('/crmcalendar'))
    expect(await screen.findByRole('button', { name: /Retry/ })).toBeInTheDocument()
  })
})

describe('CustomerFeedback', () => {
  it('anchors on a real completed job and lets the rating be chosen', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerFeedback />, at('/customer-feedback'))

    await screen.findByRole('heading', { name: 'Service Feedback' })
    // Service summary is the real job, not the prototype's invented Camry copy.
    expect(await screen.findByText('Toyota Camry 2022')).toBeInTheDocument()
    expect(screen.getByText('A3F8B2C1')).toBeInTheDocument()

    // Choosing stars is local UI state and updates the label.
    await user.click(screen.getByRole('radio', { name: '5 stars' }))
    expect(screen.getByText('Excellent')).toBeInTheDocument()
  })

  it('cannot submit — the feedback endpoint does not exist, and says so', async () => {
    renderWithProviders(<CustomerFeedback />, at('/customer-feedback'))
    await screen.findByText('Toyota Camry 2022')

    expect(screen.getByRole('button', { name: /Submit Feedback/ })).toBeDisabled()
    expect(screen.getByText(/needs the feedback service/)).toBeInTheDocument()
  })

  it('shows an honest empty state when there is no completed service', async () => {
    h.state.jobs = []
    renderWithProviders(<CustomerFeedback />, at('/customer-feedback'))
    expect(await screen.findByText('No completed service to rate')).toBeInTheDocument()
  })
})
