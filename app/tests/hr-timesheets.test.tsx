import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** Timesheets (`Timesheet-Management` / `Timeclock-Payroll`) on a live build.
 *
 *  The records grouped by employee — date, clock in/out, worked hours, status —
 *  with a status filter. `hours` is the server's decimal presentation, shown as
 *  is. The fixture path is in `hr-fixture.test.tsx`.
 */

const rows = vi.hoisted(() => ({ timesheets: [] }) as Record<string, Record<string, unknown>[]>)

vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  return { ...actual, isLive: true }
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

const { Timesheets } = await import('@/screens/hr/Timesheets')

function sheet(over: Record<string, unknown> = {}) {
  return {
    _id: '01TS0001',
    employeeId: '01EMP0001',
    employeeName: 'Yousef Al-Otaibi',
    workDate: '2026-08-12',
    clockIn: '08:00',
    clockOut: '16:30',
    minutes: 510,
    hours: 8.5,
    status: 'submitted',
    ...over,
  }
}

beforeEach(() => {
  rows.timesheets = [sheet()]
})

afterEach(() => vi.clearAllMocks())

describe('the live timesheets', () => {
  it('groups records by employee with date, clock and hours', () => {
    renderScreen(Timesheets, { role: 'hr' })
    const table = screen.getByRole('table')
    expect(within(table).getByText('2026-08-12')).toBeInTheDocument()
    expect(within(table).getByText('08:00')).toBeInTheDocument()
    expect(within(table).getByText('16:30')).toBeInTheDocument()
    expect(within(table).getByText('8.50')).toBeInTheDocument()
  })

  it('filters by status', () => {
    renderScreen(Timesheets, { role: 'hr' })
    fireEvent.click(screen.getByRole('tab', { name: 'approved' }))
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByText('No records match the current search and filter.')).toBeInTheDocument()
  })
})
