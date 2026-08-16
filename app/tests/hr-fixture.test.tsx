import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'
import { HRPayroll } from '@/screens/hr/HRPayroll'
import { StaffDirectory } from '@/screens/hr/StaffDirectory'
import { PayrollManagement } from '@/screens/hr/PayrollManagement'
import { Timesheets } from '@/screens/hr/Timesheets'
import { LeaveRequests } from '@/screens/hr/LeaveRequests'
import { StaffScheduling, StaffPerformanceReview } from '@/screens/hr/StaffGap'

/** The HR screens on the fixture build (no VITE_API_URL, so `isLive` is false).
 *
 *  Every HR accessor is empty — an employee, a payroll line or a leave decision
 *  is a server record over a live tenant, and a mock that invented one would be
 *  the fake-completion this project gates against. Each screen meets that with an
 *  honest "connect the API" state naming the collection it needs, never a fake
 *  row and never a fabricated zero.
 */

describe('the honest fixture gap', () => {
  it('StaffDirectory names the employees collection and renders no table', () => {
    renderScreen(StaffDirectory, { role: 'hr' })
    expect(screen.getByText('No employees to show')).toBeInTheDocument()
    expect(screen.getByText('employees')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('PayrollManagement names the payrollRuns collection', () => {
    renderScreen(PayrollManagement, { role: 'hr' })
    expect(screen.getByText('No payroll runs to show')).toBeInTheDocument()
    expect(screen.getByText('payrollRuns')).toBeInTheDocument()
  })

  it('Timesheets names the timesheets collection', () => {
    renderScreen(Timesheets, { role: 'hr' })
    expect(screen.getByText('No timesheets to show')).toBeInTheDocument()
    expect(screen.getByText('timesheets')).toBeInTheDocument()
  })

  it('LeaveRequests names the leaveRequests collection', () => {
    renderScreen(LeaveRequests, { role: 'hr' })
    expect(screen.getByText('No leave requests to show')).toBeInTheDocument()
    expect(screen.getByText('leaveRequests')).toBeInTheDocument()
  })

  it('HRPayroll names all three source collections and still links onward', () => {
    renderScreen(HRPayroll, { role: 'hr' })
    expect(screen.getByText('Nothing to summarise yet')).toBeInTheDocument()
    expect(screen.getByText('employees · payrollRuns · leaveRequests')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Staff Directory/ })).toHaveAttribute('href', '/staff-directory')
  })
})

describe('GAP: HR feature-map screens with no backend collection', () => {
  // Staff-Scheduling and Staff-Performance-Review appear on the feature map, but
  // the HR backend serves no schedule or review collection. These pin the gap so
  // it cannot quietly graduate to invented rows — the day a `staffSchedules` or
  // `performanceReviews` collection lands, these screens get built against it.
  it('Staff-Scheduling declares its missing staffSchedules source', () => {
    renderScreen(StaffScheduling, { role: 'hr' })
    expect(screen.getByText('Staff Scheduling has no data source yet')).toBeInTheDocument()
    expect(screen.getByText('staffSchedules')).toBeInTheDocument()
  })

  it('Staff-Performance-Review declares its missing performanceReviews source', () => {
    renderScreen(StaffPerformanceReview, { role: 'hr' })
    expect(screen.getByText('Staff Performance Review has no data source yet')).toBeInTheDocument()
    expect(screen.getByText('performanceReviews')).toBeInTheDocument()
  })
})
