import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Employee Onboarding (Golden Path 14)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('HR & Payroll hub loads', async ({ page }) => {
    await gotoReady(page, '/hrpayroll')
    const text = await bodyText(page)
    expect(text).toContain('HR & Payroll')
  })

  test('HR management page loads as the staff directory', async ({ page }) => {
    await gotoReady(page, '/hr-management')
    const text = await bodyText(page)
    expect(text).toContain('Staff Directory')
    // Employees live on the server; the fixture build shows the empty state
    // and names the collection rather than inventing a record.
    expect(text).toContain('No employees to show')
    expect(text).toContain('employees')
  })

  test('staff directory page loads', async ({ page }) => {
    await gotoReady(page, '/staff-directory')
    const text = await bodyText(page)
    expect(text).toContain('Staff Directory')
  })

  test('staff scheduling page loads', async ({ page }) => {
    await gotoReady(page, '/staff-scheduling')
    const text = await bodyText(page)
    expect(text).toContain('Staff Scheduling')
  })

  test('staff performance review page loads', async ({ page }) => {
    await gotoReady(page, '/staff-performance-review')
    const text = await bodyText(page)
    expect(text).toContain('Staff Performance Review')
    expect(text).toContain('performanceReviews')
  })

  test('timesheet management page loads', async ({ page }) => {
    await gotoReady(page, '/timesheet-management')
    const text = await bodyText(page)
    expect(text).toContain('Timesheets')
    expect(text).toContain('No timesheets to show')
  })

  test('leave requests page loads', async ({ page }) => {
    await gotoReady(page, '/leave-requests')
    const text = await bodyText(page)
    expect(text).toContain('Leave Requests')
  })

  test('training LMS page loads with the course catalogue', async ({ page }) => {
    await gotoReady(page, '/training-lms')
    const text = await bodyText(page)
    expect(text).toContain('Training')
    expect(text).toContain('Learning Management')
    expect(text).toContain('Total Courses')
    expect(text).toContain('Workplace Safety Essentials')
  })

  test('payroll management page loads', async ({ page }) => {
    await gotoReady(page, '/payroll-management')
    const text = await bodyText(page)
    expect(text).toContain('Payroll Management')
  })
})

test.describe('Employee onboarding lifecycle', () => {
  test('staff directory → scheduling → timesheets → leave → training → payroll', async ({ context, page }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    await gotoReady(page, '/staff-directory')
    expect(await bodyText(page)).toContain('Staff Directory')

    await gotoReady(page, '/staff-scheduling')
    expect(await bodyText(page)).toContain('Staff Scheduling')

    await gotoReady(page, '/timesheet-management')
    expect(await bodyText(page)).toContain('Timesheets')

    await gotoReady(page, '/leave-requests')
    expect(await bodyText(page)).toContain('Leave Requests')

    await gotoReady(page, '/training-lms')
    expect(await bodyText(page)).toContain('Learning Management')

    await gotoReady(page, '/payroll-management')
    expect(await bodyText(page)).toContain('Payroll Management')
  })
})
