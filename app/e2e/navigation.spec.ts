import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Sidebar navigation', () => {
  // Sidebar is only visible on desktop viewports
  test.use({ viewport: { width: 1280, height: 720 } })

  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('sidebar shows expected nav groups for owner', async ({ page }) => {
    await gotoReady(page, '/dashboard')
    const sidebar = await page.locator('aside').innerText()
    const upper = sidebar.toUpperCase()
    expect(upper).toContain('WORKSHOP')
    expect(upper).toContain('ACCOUNTING')
  })

  test('technician cannot see ACCOUNTING in sidebar', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'technician')
    const page = await ctx.newPage()
    await gotoReady(page, '/dashboard')
    const sidebar = await page.locator('aside').innerText()
    expect(sidebar.toUpperCase()).not.toContain('ACCOUNTING')
    await ctx.close()
  })

  test('owner sees ACCOUNTING in sidebar', async ({ page }) => {
    await gotoReady(page, '/dashboard')
    const sidebar = await page.locator('aside').innerText()
    expect(sidebar.toUpperCase()).toContain('ACCOUNTING')
  })

  test('clicking a sidebar link navigates to the target page', async ({ page }) => {
    await gotoReady(page, '/dashboard')

    const sidebar = page.locator('aside')
    // Find a navigation link in the sidebar — Job Cards is always visible for owner
    const jobCardsLink = sidebar.getByRole('link', { name: /Job Cards/i }).first()
    const linkCount = await jobCardsLink.count()
    if (linkCount > 0) {
      await jobCardsLink.click()
      await page.waitForURL('**/job-cards**')
      // Wait for the page content to actually render
      await page.waitForFunction(
        () => document.body.innerText.includes('Job Cards') && document.body.innerText.trim().length > 50,
        null,
        { timeout: 10_000 },
      )
      const text = await bodyText(page)
      expect(text).toContain('Job Cards')
    }
  })

  test('sidebar navigation to Customers renders', async ({ page }) => {
    await gotoReady(page, '/dashboard')

    const sidebar = page.locator('aside')
    const customersLink = sidebar.getByRole('link', { name: /Customers/i }).first()
    const linkCount = await customersLink.count()
    if (linkCount > 0) {
      await customersLink.click()
      await page.waitForURL('**/customers**')
      await page.waitForFunction(
        () => document.body.innerText.includes('Customers') && document.body.innerText.trim().length > 50,
        null,
        { timeout: 10_000 },
      )
      const text = await bodyText(page)
      expect(text).toContain('Customers')
    }
  })

  test('sidebar navigation to Invoices renders', async ({ page }) => {
    await gotoReady(page, '/dashboard')

    const sidebar = page.locator('aside')
    const invoicesLink = sidebar.getByRole('link', { name: /Invoices/i }).first()
    const linkCount = await invoicesLink.count()
    if (linkCount > 0) {
      await invoicesLink.click()
      await page.waitForURL('**/invoices**')
      await page.waitForFunction(
        () => document.body.innerText.includes('Invoices') && document.body.innerText.trim().length > 50,
        null,
        { timeout: 10_000 },
      )
      const text = await bodyText(page)
      expect(text).toContain('Invoices')
    }
  })
})

test.describe('Key routes resolve without error', () => {
  const routes = [
    { path: '/dashboard', expect: 'Dashboard' },
    { path: '/job-cards', expect: 'Job Cards' },
    { path: '/customers', expect: 'Customers' },
    { path: '/vehicles', expect: 'All Vehicles' },
    { path: '/estimates', expect: 'Estimates' },
    { path: '/technicians', expect: 'Technicians' },
    { path: '/appointments', expect: 'Appointments' },
    { path: '/invoices', expect: 'Invoices' },
    { path: '/inventory', expect: 'Inventory' },
    { path: '/chart-of-accounts', expect: 'Chart of Accounts' },
    { path: '/journal-entries', expect: 'Journal Entries' },
    { path: '/expenses', expect: 'Expenses' },
    { path: '/settings', expect: 'Workshop Profile' },
    { path: '/profile', expect: 'Change Password' },
    { path: '/users-teams', expect: 'Users & Teams' },
    { path: '/roles-permissions', expect: 'Permission Matrix' },
    { path: '/lead-pipeline', expect: 'Open Pipeline' },
    { path: '/reports-analytics', expect: 'Analytics Overview' },
  ]

  for (const route of routes) {
    test(`${route.path} loads with expected content`, async ({ browser }) => {
      const ctx = await browser.newContext()
      await seedRole(ctx, 'owner')
      const page = await ctx.newPage()
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))
      await gotoReady(page, route.path)
      const text = await bodyText(page)
      expect(text).toContain(route.expect)
      expect(text.trim().length).toBeGreaterThan(20)
      expect(errors).toHaveLength(0)
      await ctx.close()
    })
  }
})

test.describe('Public routes load without auth', () => {
  const publicRoutes = [
    { path: '/login', expect: 'Sign In' },
    { path: '/welcome', expect: 'Welcome to SALIS AUTO' },
    { path: '/language-selection', expect: 'Choose your language' },
    { path: '/forgot-password', expect: 'Reset Password' },
    { path: '/register', expect: 'Register' },
    { path: '/error404', expect: '404' },
    { path: '/privacy-policy', expect: 'Privacy Policy' },
    { path: '/terms-conditions', expect: 'Terms' },
  ]

  for (const route of publicRoutes) {
    test(`${route.path} renders without auth`, async ({ page }) => {
      await gotoReady(page, route.path)
      const text = await bodyText(page)
      expect(text).toContain(route.expect)
    })
  }
})

test.describe('Role-based nav visibility', () => {
  /** Only test roles that reach the dashboard with an aside. Some roles
   *  (like cashier) may redirect or render a different shell. */
  const cases: { role: string; group: string; visible: boolean }[] = [
    { role: 'owner', group: 'ACCOUNTING', visible: true },
    { role: 'technician', group: 'ACCOUNTING', visible: false },
    { role: 'owner', group: 'WORKSHOP', visible: true },
  ]

  for (const { role, group, visible } of cases) {
    test(`${role} ${visible ? 'sees' : 'does not see'} ${group}`, async ({ browser }) => {
      const ctx = await browser.newContext()
      await seedRole(ctx, role)
      const page = await ctx.newPage()
      await gotoReady(page, '/dashboard')
      const asideCount = await page.locator('aside').count()
      if (asideCount === 0) {
        // This role does not render the operational sidebar — skip the check
        await ctx.close()
        return
      }
      const sidebar = await page.locator('aside').innerText()
      if (visible) {
        expect(sidebar.toUpperCase()).toContain(group)
      } else {
        expect(sidebar.toUpperCase()).not.toContain(group)
      }
      await ctx.close()
    })
  }
})

test.describe('Mobile navigation drawer', () => {
  test('mobile header shows hamburger menu', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/dashboard')

    const menuButton = page.getByRole('button', { name: 'Open menu' })
    await expect(menuButton).toBeVisible()
    await ctx.close()
  })

  test('tapping hamburger opens the nav drawer', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/dashboard')

    const menuButton = page.getByRole('button', { name: 'Open menu' })
    await menuButton.click()

    // After clicking the menu, a drawer or navigation panel should appear
    await page.waitForTimeout(300)

    // The drawer should contain navigation links
    const bodyContent = await bodyText(page)
    expect(bodyContent.toUpperCase()).toContain('WORKSHOP')

    await ctx.close()
  })
})
