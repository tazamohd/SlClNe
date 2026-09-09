import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Workshop golden path', () => {
  // Workshop forms and table interactions need the desktop layout
  test.use({ viewport: { width: 1280, height: 720 } })

  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('navigate to Job Cards and see the list', async ({ page }) => {
    await gotoReady(page, '/job-cards')
    const text = await bodyText(page)
    expect(text).toContain('Job Cards')
    // The list should have seeded data
    expect(text.length).toBeGreaterThan(50)
  })

  test('open New Job Card modal and see form fields', async ({ page }) => {
    await gotoReady(page, '/job-cards')

    // Click the "New Job Card" button
    const newButton = page.getByRole('button', { name: /New Job Card/i })
    await expect(newButton).toBeVisible()
    await newButton.click()

    // Modal should appear with the form
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // The modal title should say "New Job Card"
    await expect(dialog).toContainText('New Job Card')

    // Form fields should be present
    // "Customer *" — not the "Customer Authorization" label further down.
    await expect(dialog.locator('label', { hasText: /^Customer\s*\*?$/ })).toBeVisible()
    await expect(dialog.locator('label:has-text("Vehicle")')).toBeVisible()
    await expect(dialog.locator('label:has-text("Service")')).toBeVisible()
    await expect(dialog.locator('label:has-text("Priority")')).toBeVisible()
  })

  test('fill New Job Card form fields', async ({ page }) => {
    await gotoReady(page, '/job-cards')

    const newButton = page.getByRole('button', { name: /New Job Card/i })
    await newButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Fill in the customer name
    const customerField = dialog.locator('input[name="customerName"]')
    await customerField.fill('Test Customer')
    await expect(customerField).toHaveValue('Test Customer')

    // Fill in the vehicle
    const vehicleField = dialog.locator('input[name="vehicleLabel"]')
    await vehicleField.fill('Toyota Camry 2024')
    await expect(vehicleField).toHaveValue('Toyota Camry 2024')

    // Select a service type
    const serviceSelect = dialog.locator('select[name="service"]')
    await serviceSelect.selectOption('repair')

    // Select priority
    const prioritySelect = dialog.locator('select[name="priority"]')
    await prioritySelect.selectOption('high')

    // Cancel the form
    const cancelButton = dialog.getByRole('button', { name: /Cancel/i })
    await cancelButton.click()
  })

  test('navigate from job cards list to job detail', async ({ page }) => {
    await gotoReady(page, '/job-cards')
    const text = await bodyText(page)
    expect(text).toContain('Job Cards')

    // Click on a job card row in the table to navigate to detail
    const firstRow = page.locator('tbody tr').first()
    const rowCount = await firstRow.count()
    if (rowCount > 0) {
      await firstRow.click()
      // Should navigate to job detail
      await page.waitForURL('**/job-detail**')
      // Wait for the detail page content to render
      await page.waitForFunction(
        () => document.body.innerText.trim().length > 100,
        null,
        { timeout: 10_000 },
      )
      const detailText = await bodyText(page)
      expect(detailText).toContain('Timeline')
    }
  })

  test('workshop full lifecycle renders each stage', async ({ page }) => {
    test.setTimeout(60_000)

    // Check-in
    await gotoReady(page, '/workshop-check-in')
    expect(await bodyText(page)).toContain('Vehicle Check-In')

    // Inspection
    await gotoReady(page, '/workshop-inspection')
    expect(await bodyText(page)).toContain('Vehicle Inspection')

    // Estimate
    await gotoReady(page, '/workshop-estimate')
    const estimateText = await bodyText(page)
    expect(estimateText).toContain('Cost Estimate')
    // Estimate should show computed totals
    expect(estimateText).toContain('SAR')

    // QC
    await gotoReady(page, '/workshop-qc')
    expect(await bodyText(page)).toContain('Quality Check')

    // Signature
    await gotoReady(page, '/workshop-signature')
    expect(await bodyText(page)).toContain('Customer Signature')

    // Delivery
    await gotoReady(page, '/workshop-delivery')
    expect(await bodyText(page)).toContain('Vehicle Delivery')
  })

  test('technician cannot approve QC (segregation of duties)', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'technician')
    const page = await ctx.newPage()
    await gotoReady(page, '/workshop-qc')
    const approve = page.getByRole('button', { name: /Approve QC/ })
    await expect(approve).toBeDisabled()
    await ctx.close()
  })

  test('estimate totals are computed from line items', async ({ page }) => {
    await gotoReady(page, '/workshop-estimate')
    const text = await bodyText(page)
    // The design fixtures compute these totals from line items
    expect(text).toContain('SAR 1,345.00')
    expect(text).toContain('SAR 201.75')
    expect(text).toContain('SAR 1,546.75')
  })
})
