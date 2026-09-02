import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Customer CRUD flow', () => {
  // CRUD modals and table actions require the desktop layout
  test.use({ viewport: { width: 1280, height: 720 } })

  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('customers list loads with seeded data', async ({ page }) => {
    await gotoReady(page, '/customers')
    const text = await bodyText(page)
    expect(text).toContain('Customers')
    expect(text.trim().length).toBeGreaterThan(100)
  })

  test('Add Customer button opens the create modal', async ({ page }) => {
    await gotoReady(page, '/customers')

    const addButton = page.getByRole('button', { name: /Add Customer/i })
    await expect(addButton).toBeVisible()
    await addButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Add New Customer')

    await expect(dialog.locator('label:has-text("Full Name")')).toBeVisible()
    await expect(dialog.locator('label:has-text("Phone")')).toBeVisible()
    await expect(dialog.locator('label:has-text("Email")')).toBeVisible()
  })

  test('create a new customer via the form modal', async ({ page }) => {
    test.setTimeout(30_000)
    await gotoReady(page, '/customers')

    await page.getByRole('button', { name: /Add Customer/i }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog.locator('input[name="name"]').fill('Khalid Al-Rashid')
    await dialog.locator('input[name="phone"]').fill('+966 55 123 4567')
    await dialog.locator('input[name="email"]').fill('khalid@example.com')

    await dialog.getByRole('button', { name: /Add Customer/i }).click()
    await expect(dialog).toBeHidden({ timeout: 5000 })

    // The new customer should appear in the table
    await page.waitForTimeout(500)
    const tableText = await page.locator('table').innerText()
    expect(tableText).toContain('Khalid Al-Rashid')
  })

  test('cancel button dismisses the create modal without saving', async ({ page }) => {
    await gotoReady(page, '/customers')

    await page.getByRole('button', { name: /Add Customer/i }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog.getByRole('button', { name: /Cancel/i }).click()
    await expect(dialog).toBeHidden({ timeout: 3000 })
  })

  test('create then edit a customer record', async ({ page }) => {
    test.setTimeout(30_000)
    await gotoReady(page, '/customers')

    const uniqueName = `E2E Edit ${Date.now()}`

    // CREATE (seeded rows have no _id so only freshly created ones support edit/delete)
    await page.getByRole('button', { name: /Add Customer/i }).click()
    let dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog.locator('input[name="name"]').fill(uniqueName)
    await dialog.locator('input[name="phone"]').fill('+966 50 111 2222')

    await dialog.getByRole('button', { name: /Add Customer/i }).click()
    await expect(dialog).toBeHidden({ timeout: 5000 })

    await page.waitForTimeout(500)
    const tableText = await page.locator('table').innerText()
    expect(tableText).toContain(uniqueName)

    // EDIT
    const editButton = page.locator(`button[aria-label="Edit ${uniqueName}"]`)
    await expect(editButton).toBeVisible({ timeout: 3000 })
    await editButton.click()

    dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Edit Customer')

    const nameField = dialog.locator('input[name="name"]')
    const editedName = uniqueName + ' Edited'
    await nameField.clear()
    await nameField.fill(editedName)

    await dialog.getByRole('button', { name: /Save Changes/i }).click()
    await expect(dialog).toBeHidden({ timeout: 5000 })

    await page.waitForTimeout(500)
    const updatedTableText = await page.locator('table').innerText()
    expect(updatedTableText).toContain(editedName)
  })

  test('create then delete a customer with confirmation', async ({ page }) => {
    test.setTimeout(30_000)
    await gotoReady(page, '/customers')

    const uniqueName = `E2E Delete ${Date.now()}`
    const rowsBefore = await page.locator('tbody tr').count()

    // CREATE
    await page.getByRole('button', { name: /Add Customer/i }).click()
    let dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog.locator('input[name="name"]').fill(uniqueName)
    await dialog.locator('input[name="phone"]').fill('+966 50 333 4444')

    await dialog.getByRole('button', { name: /Add Customer/i }).click()
    await expect(dialog).toBeHidden({ timeout: 5000 })

    await page.waitForTimeout(500)
    expect(await page.locator('table').innerText()).toContain(uniqueName)

    const rowsAfterCreate = await page.locator('tbody tr').count()
    expect(rowsAfterCreate).toBe(rowsBefore + 1)

    // DELETE
    const deleteButton = page.locator(`button[aria-label="Delete ${uniqueName}"]`)
    await expect(deleteButton).toBeVisible({ timeout: 3000 })
    await deleteButton.click()

    const confirmDialog = page.getByRole('dialog')
    await expect(confirmDialog).toBeVisible()
    await expect(confirmDialog).toContainText('Delete Customer')
    await expect(confirmDialog).toContainText(uniqueName)

    await confirmDialog.getByRole('button', { name: /^Delete$/i }).click()
    await expect(confirmDialog).toBeHidden({ timeout: 5000 })

    // Row count should return to the original
    await page.waitForTimeout(500)
    const rowsAfterDelete = await page.locator('tbody tr').count()
    expect(rowsAfterDelete).toBe(rowsBefore)
  })

  test('create + edit + delete full lifecycle', async ({ page }) => {
    test.setTimeout(45_000)
    await gotoReady(page, '/customers')

    const baseName = `E2E Lifecycle ${Date.now()}`

    // 1. CREATE
    await page.getByRole('button', { name: /Add Customer/i }).click()
    let dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog.locator('input[name="name"]').fill(baseName)
    await dialog.locator('input[name="phone"]').fill('+966 50 555 6666')
    await dialog.locator('input[name="email"]').fill('lifecycle@example.com')

    await dialog.getByRole('button', { name: /Add Customer/i }).click()
    await expect(dialog).toBeHidden({ timeout: 5000 })

    await page.waitForTimeout(500)
    expect(await page.locator('table').innerText()).toContain(baseName)

    // 2. EDIT
    const editedName = baseName + ' Updated'
    await page.locator(`button[aria-label="Edit ${baseName}"]`).click()

    dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    const nameField = dialog.locator('input[name="name"]')
    await nameField.clear()
    await nameField.fill(editedName)

    await dialog.getByRole('button', { name: /Save Changes/i }).click()
    await expect(dialog).toBeHidden({ timeout: 5000 })

    await page.waitForTimeout(500)
    expect(await page.locator('table').innerText()).toContain(editedName)

    // 3. DELETE
    await page.locator(`button[aria-label="Delete ${editedName}"]`).click()

    const confirmDialog = page.getByRole('dialog')
    await expect(confirmDialog).toBeVisible()
    await confirmDialog.getByRole('button', { name: /^Delete$/i }).click()
    await expect(confirmDialog).toBeHidden({ timeout: 5000 })

    // The deleted customer should no longer appear in the table
    await page.waitForTimeout(500)
    const tableText = await page.locator('table').innerText()
    expect(tableText).not.toContain(editedName)
  })
})

test.describe('Customer form validation', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('submitting an empty form keeps the modal open', async ({ page }) => {
    await gotoReady(page, '/customers')

    await page.getByRole('button', { name: /Add Customer/i }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog.getByRole('button', { name: /Add Customer/i }).click()

    // The modal should stay open (validation prevented submission)
    await page.waitForTimeout(500)
    await expect(dialog).toBeVisible()
  })
})
