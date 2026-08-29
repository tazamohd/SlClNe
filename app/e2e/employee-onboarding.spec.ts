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

  test('HR management page loads', async ({ page }) => {
    await gotoReady(page, '/hr-management')
    const text = await bodyText(page)
    expect(text).toContain('HR Management')
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
    expect(text).toContain('Performance Reviews')
  })

  test('timesheet management page loads', async ({ page }) => {
    await gotoReady(page, '/timesheet-management')
    const text = await bodyText(page)
    expect(text).toContain('Timesheet Management')
  })

  test('leave requests page loads', async ({ page }) => {
    await gotoReady(page, '/leave-requests')
    const text = await bodyText(page)
    expect(text).toContain('Leave Requests')
  })

  test('training LMS page loads', async ({ page }) => {
    await gotoReady(page, '/training-lms')
    const text = await bodyText(page)
    expect(text).toContain('Training & LMS')
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
    expect(await bodyText(page)).toContain('Timesheet Management')

    await gotoReady(page, '/leave-requests')
    expect(await bodyText(page)).toContain('Leave Requests')

    await gotoReady(page, '/training-lms')
    expect(await bodyText(page)).toContain('Training & LMS')

    await gotoReady(page, '/payroll-management')
    expect(await bodyText(page)).toContain('Payroll Management')
  })
})
