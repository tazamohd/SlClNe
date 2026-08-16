import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../helpers/render'

/** `CRMCalendar` over `crmTasks`, and `CustomerFeedback` over a completed job,
 *  wired to the F-027 writes.
 *
 *  The calendar places real tasks on their real due dates and now creates new
 *  ones; the feedback form is fully interactive and now submits for real, with a
 *  success state. Both assertions check the real behaviour and the real write.
 *  The fixture-refusal half lives in `crm-write-gaps.test.tsx`. */

const h = vi.hoisted(() => ({
  state: {
    crmTasks: [] as Record<string, unknown>[],
    jobs: [] as Record<string, unknown>[],
    feedback: [] as Record<string, unknown>[],
    created: [] as Record<string, unknown>[],
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
    async create(input: Record<string, unknown>) {
      const row = { ...input, _id: `NEW-${state.created.length + 1}`, _version: 1 }
      state.created.push({ key, ...input })
      return row
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
  h.state.created = []
  h.state.feedback = []
  h.state.crmTasks = [
    { _id: 'T1', title: 'Call: Tariq Al-Dosari', assigned: 'Khalid Al-Amri', due: 'Jul 23, 2026', priority: 'high', status: 'todo', type: 'call' },
    { _id: 'T2', title: 'Demo: Al-Mamlaka', assigned: 'Fatima Al-Zahrani', due: 'Jul 25, 2026', priority: 'medium', status: 'todo', type: 'meeting' },
  ]
  h.state.jobs = [
    { id: 'A3F8B2C1', _id: '01HJOBULID0000000000000000', cust: 'Ahmed Al-Rashid', veh: 'Toyota Camry 2022', svc: 'maintenance', st: 'delivered', pr: 'medium' },
  ]
})

const at = (route: string) => ({ route, role: 'owner' as const })

describe('CRMCalendar', () => {
  it('opens on the month that holds tasks and places each on its due day', async () => {
    renderWithProviders(<CRMCalendar />, at('/crmcalendar'))

    expect(await screen.findByText('July 2026')).toBeInTheDocument()
    expect(screen.getAllByText('Call: Tariq Al-Dosari').length).toBeGreaterThan(0)
    expect(screen.getByText('Calls')).toBeInTheDocument()
    expect(screen.getByText('Meetings')).toBeInTheDocument()
  })

  it('offers New Task now the collection is writable, and still links to the list', async () => {
    renderWithProviders(<CRMCalendar />, at('/crmcalendar'))
    await screen.findByText('July 2026')

    expect(screen.getByRole('button', { name: /All Tasks/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /New Task/ })).toBeInTheDocument()
  })

  it('creates a task through the writable collection, pre-filled on the day in view', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CRMCalendar />, at('/crmcalendar'))
    await screen.findByText('July 2026')

    await user.click(screen.getByRole('button', { name: /New Task/ }))
    // The due date defaults to the day the calendar is showing (Jul 23).
    expect(await screen.findByDisplayValue('2026-07-23')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Task Title/), 'Prepare quarterly review')
    await user.click(screen.getByRole('button', { name: /Create Task/ }))

    // The write reached the crmTasks collection with the typed title.
    const created = h.state.created.find((c) => c.key === 'crmTasks')
    expect(created).toBeTruthy()
    expect(created).toMatchObject({ title: 'Prepare quarterly review', dueDate: '2026-07-23' })
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
    expect(await screen.findByText('Toyota Camry 2022')).toBeInTheDocument()
    expect(screen.getByText('A3F8B2C1')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: '5 stars' }))
    expect(screen.getByText('Excellent')).toBeInTheDocument()
  })

  it('submits the feedback for real and shows a success state', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerFeedback />, at('/customer-feedback'))
    await screen.findByText('Toyota Camry 2022')

    // No rating yet — the submit is held until an overall rating is chosen.
    expect(screen.getByRole('button', { name: /Submit Feedback/ })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: '4 stars' }))
    await user.type(screen.getByLabelText(/Additional Comments/), 'Great work, quick turnaround.')
    await user.click(screen.getByRole('button', { name: /Submit Feedback/ }))

    expect(await screen.findByText('Thank you for your feedback')).toBeInTheDocument()
    const created = h.state.created.find((c) => c.key === 'feedback')
    expect(created).toMatchObject({
      rating: 4,
      comment: 'Great work, quick turnaround.',
      jobCardId: '01HJOBULID0000000000000000',
    })
  })

  it('folds the category ratings into the stored comment so none is dropped', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerFeedback />, at('/customer-feedback'))
    await screen.findByText('Toyota Camry 2022')

    await user.click(screen.getByRole('radio', { name: '5 stars' }))
    await user.click(screen.getByRole('radio', { name: 'Work Quality: 5 stars' }))
    await user.click(screen.getByRole('button', { name: /Submit Feedback/ }))

    await screen.findByText('Thank you for your feedback')
    const created = h.state.created.find((c) => c.key === 'feedback')
    expect(String(created?.comment)).toMatch(/Work Quality 5\/5/)
  })

  it('shows an honest empty state when there is no completed service', async () => {
    h.state.jobs = []
    renderWithProviders(<CustomerFeedback />, at('/customer-feedback'))
    expect(await screen.findByText('No completed service to rate')).toBeInTheDocument()
  })
})
