import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** Leave Requests (`Leave-Requests`) on a live build.
 *
 *  The list, and the approve/reject decision gated on `hr:a`: a rejection needs a
 *  reason, and a role without the approve grant never sees the buttons. The
 *  server re-checks and records the approver; here the action wrappers are mocked
 *  to observe the calls. The fixture path is in `hr-fixture.test.tsx`.
 */

const approve = vi.hoisted(() => vi.fn())
const reject = vi.hoisted(() => vi.fn())

const rows = vi.hoisted(() => ({ leaveRequests: [] }) as Record<string, Record<string, unknown>[]>)

vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  return { ...actual, isLive: true }
})

vi.mock('@/screens/hr/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/screens/hr/api')>()
  return { ...actual, approveLeave: approve, rejectLeave: reject }
})

vi.mock('@/data/useCollection', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/useCollection')>()
  return {
    ...actual,
    useCollection: (key: string) => ({
      data: rows[key] ?? [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => undefined,
    }),
  }
})

const { LeaveRequests } = await import('@/screens/hr/LeaveRequests')

function request(over: Record<string, unknown> = {}) {
  return {
    _id: '01LV0001',
    employeeId: '01EMP0001',
    employeeName: 'Faisal Al-Harbi',
    type: 'annual',
    startDate: '2026-08-10',
    endDate: '2026-08-14',
    days: 5,
    status: 'submitted',
    reason: null,
    approverId: null,
    ...over,
  }
}

beforeEach(() => {
  rows.leaveRequests = [request()]
  approve.mockResolvedValue(request({ status: 'approved' }))
  reject.mockResolvedValue(request({ status: 'rejected' }))
})

afterEach(() => vi.clearAllMocks())

describe('the live leave list', () => {
  it('lists a request with employee, type, dates, days and status', () => {
    renderScreen(LeaveRequests, { role: 'hr' })
    expect(screen.getByText('Faisal Al-Harbi')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    // "submitted" is also a filter tab; assert the row's status pill specifically.
    const item = screen.getByText('Faisal Al-Harbi').closest('li') as HTMLElement
    expect(within(item).getByText('submitted')).toBeInTheDocument()
  })

  it('filters the list by status', () => {
    renderScreen(LeaveRequests, { role: 'hr' })
    fireEvent.click(screen.getByRole('tab', { name: 'approved' }))
    expect(screen.queryByText('Faisal Al-Harbi')).not.toBeInTheDocument()
    expect(screen.getByText('No requests match this status.')).toBeInTheDocument()
  })
})

describe('the decision, gated on hr:a', () => {
  it('approves a submitted request', async () => {
    renderScreen(LeaveRequests, { role: 'hr' })
    fireEvent.click(screen.getByRole('button', { name: 'Review' }))
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))
    await waitFor(() => expect(approve).toHaveBeenCalledWith('01LV0001', undefined))
  })

  it('requires a reason to reject, then posts it', async () => {
    renderScreen(LeaveRequests, { role: 'hr' })
    fireEvent.click(screen.getByRole('button', { name: 'Review' }))

    expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Insufficient annual balance.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }))
    await waitFor(() =>
      expect(reject).toHaveBeenCalledWith('01LV0001', 'Insufficient annual balance.'),
    )
  })

  it('hides the decision from a role without the approve grant', () => {
    // `manager` holds `hr:vx` — view and export, no approve.
    renderScreen(LeaveRequests, { role: 'manager' })
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
    expect(
      within(dialog).getByText('This request is awaiting a decision. Your role can view it but not decide it.'),
    ).toBeInTheDocument()
  })
})
