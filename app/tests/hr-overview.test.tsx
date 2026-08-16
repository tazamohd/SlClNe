import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** The HR & Payroll overview (`HRPayroll`) on a live build.
 *
 *  The landing screen's counts come from the list endpoints' `page.total` — a
 *  server figure, not a client sum — and the latest run's net is the run's own
 *  server total. The fixture path is in `hr-fixture.test.tsx`.
 */

const totals = vi.hoisted(
  () => ({ employees: 0, employeesOnLeave: 0, leavePending: 0 }) as Record<string, number>,
)
const rows = vi.hoisted(
  () => ({ payrollRuns: [], leaveRequests: [] }) as Record<string, Record<string, unknown>[]>,
)

vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  return { ...actual, isLive: true }
})

vi.mock('@/data/useCollection', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/useCollection')>()
  const page = (total: number) => ({
    data: { rows: [], page: { page: 1, pageSize: 1, total, totalPages: 1 } },
    isLoading: false,
    isError: false,
    error: null,
    refetch: () => undefined,
  })
  return {
    ...actual,
    usePagedCollection: (key: string, query?: { filter?: Record<string, string> }) => {
      if (key === 'employees') {
        return page(query?.filter?.status === 'on_leave' ? totals.employeesOnLeave : totals.employees)
      }
      if (key === 'leaveRequests') return page(totals.leavePending)
      return page(0)
    },
    useCollection: (key: string) => ({
      data: rows[key] ?? [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => undefined,
    }),
  }
})

const { HRPayroll } = await import('@/screens/hr/HRPayroll')

beforeEach(() => {
  totals.employees = 27
  totals.employeesOnLeave = 2
  totals.leavePending = 3
  rows.payrollRuns = [
    {
      _id: '01RUN0001',
      period: '2026-07',
      status: 'posted',
      netPay: 'SAR 38,750.00',
      netPayHalalas: 3_875_000,
      postedAt: '2026-07-31T12:00:00.000Z',
    },
  ]
  rows.leaveRequests = [
    { _id: '01LV', employeeId: '01E', employeeName: 'Faisal Al-Harbi', type: 'annual', days: 5, status: 'submitted' },
  ]
})

afterEach(() => vi.clearAllMocks())

describe('the live overview', () => {
  it('shows headcount, on-leave and pending-leave counts from page totals', () => {
    renderScreen(HRPayroll, { role: 'hr' })
    expect(screen.getByText('27')).toBeInTheDocument()
    expect(screen.getByText('Headcount')).toBeInTheDocument()
    expect(screen.getByText('On leave')).toBeInTheDocument()
    expect(screen.getByText('Pending leave')).toBeInTheDocument()
  })

  it('surfaces the latest run’s status and server net total', () => {
    renderScreen(HRPayroll, { role: 'hr' })
    expect(screen.getAllByText('2026-07').length).toBeGreaterThan(0)
    expect(screen.getByText('SAR 38,750.00')).toBeInTheDocument()
  })

  it('always links to the screens that do the work', () => {
    renderScreen(HRPayroll, { role: 'hr' })
    expect(screen.getByRole('link', { name: /Payroll Management/ })).toHaveAttribute(
      'href',
      '/payroll-management',
    )
    expect(screen.getByRole('link', { name: /Leave Requests/ })).toHaveAttribute('href', '/leave-requests')
  })
})
