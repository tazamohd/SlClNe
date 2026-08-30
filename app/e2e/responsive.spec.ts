import { test, expect } from '@playwright/test'
import { seedRole, gotoReady } from './helpers'

test.describe('Mobile responsiveness', () => {
  test('job cards render as cards (not table) at 390px', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/job-cards')
    const tables = await page.locator('table').count()
    expect(tables).toBe(0)
    const menu = await page.getByRole('button', { name: 'Open menu' }).count()
    expect(menu).toBeGreaterThan(0)
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    )
    expect(overflows).toBe(false)
    await ctx.close()
  })

  test('customer app shell renders at 430px with bottom tab bar', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'customer')
    const page = await ctx.newPage()
    await gotoReady(page, '/customer-app/home')
    const sidebar = await page.locator('aside').count()
    expect(sidebar).toBe(0)
    const tabs = await page.getByRole('navigation').count()
    expect(tabs).toBeGreaterThan(0)
    const width = await page.evaluate(() => {
      const main = document.querySelector('main')
      return main ? main.getBoundingClientRect().width : 0
    })
    expect(width).toBeLessThanOrEqual(431)
    await ctx.close()
  })

  test('customers list renders as cards on mobile', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/customers')

    // On mobile, tables should not be shown — data renders as cards
    const tables = await page.locator('table').count()
    expect(tables).toBe(0)

    // Page should not scroll horizontally
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    )
    expect(overflows).toBe(false)

    // The mobile header should be present
    const text = await page.locator('body').innerText()
    expect(text).toContain('Customers')

    await ctx.close()
  })

  test('invoices list renders as cards on mobile', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/invoices')

    const tables = await page.locator('table').count()
    expect(tables).toBe(0)

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    )
    expect(overflows).toBe(false)

    await ctx.close()
  })

  test('mobile nav drawer opens and shows navigation groups', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/dashboard')

    // The hamburger menu button should be visible on mobile
    const menuButton = page.getByRole('button', { name: 'Open menu' })
    await expect(menuButton).toBeVisible()

    // Tap the hamburger to open the drawer
    await menuButton.click()
    await page.waitForTimeout(300)

    // The drawer should show navigation groups
    const bodyContent = (await page.locator('body').innerText()).toUpperCase()
    expect(bodyContent).toContain('WORKSHOP')

    await ctx.close()
  })

  test('forms are usable on mobile', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/customers')

    // On mobile the "Add Customer" button might be in the page header
    // Try to find any add/create button
    const addButton = page.getByRole('button', { name: /Add Customer/i })
    const addCount = await addButton.count()

    if (addCount > 0) {
      await addButton.click()

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()

      // On mobile, modal should be visible and usable
      // Check that form fields are accessible
      const nameField = dialog.locator('input[name="name"]')
      await expect(nameField).toBeVisible()

      // Fill in a field to verify it is interactive
      await nameField.fill('Mobile Test')
      await expect(nameField).toHaveValue('Mobile Test')

      // The dialog should not cause horizontal scroll
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      )
      expect(overflows).toBe(false)

      // Close the dialog
      const cancelButton = dialog.getByRole('button', { name: /Cancel/i })
      await cancelButton.click()
      await expect(dialog).toBeHidden({ timeout: 3000 })
    }

    await ctx.close()
  })

  test('page does not overflow horizontally at 390px on key routes', async ({ browser }) => {
    const routes = ['/dashboard', '/job-cards', '/customers', '/invoices', '/appointments']

    for (const route of routes) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
      await seedRole(ctx, 'owner')
      const page = await ctx.newPage()
      await gotoReady(page, route)

      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      )
      expect(overflows, `${route} overflows horizontally at 390px`).toBe(false)

      await ctx.close()
    }
  })
})

test.describe('Language and RTL', () => {
  test('switching to Arabic sets RTL direction', async ({ page }) => {
    await gotoReady(page, '/language-selection')
    await page.getByRole('button', { name: /Arabic|العربية/ }).click()
    // Wait for the language change to take effect
    await page.waitForTimeout(500)
    const dir = await page.evaluate(() => document.documentElement.dir)
    expect(dir).toBe('rtl')
  })
})

test.describe('Tablet layouts', () => {
  const tabletViewports = [
    { width: 768, height: 1024, label: 'iPad Mini portrait' },
    { width: 1024, height: 768, label: 'iPad Mini landscape' },
  ]

  for (const vp of tabletViewports) {
    test(`sidebar visible at ${vp.label} (${vp.width}x${vp.height})`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
      await seedRole(ctx, 'owner')
      const page = await ctx.newPage()
      await gotoReady(page, '/dashboard')

      const asideWidth = await page.evaluate(() => {
        const aside = document.querySelector('aside')
        return aside ? Math.round(aside.getBoundingClientRect().width) : 0
      })
      expect(asideWidth).toBeGreaterThan(100)

      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      )
      expect(overflows).toBe(false)

      await ctx.close()
    })
  }
})
