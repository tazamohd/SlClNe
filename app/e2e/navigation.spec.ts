import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Sidebar navigation', () => {
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
    { path: '/inventory', expect: 'Inventory & Parts Management' },
    { path: '/chart-of-accounts', expect: 'Chart of Accounts' },
    { path: '/journal-entries', expect: 'Journal Entries' },
    { path: '/expenses', expect: 'Expenses' },
    { path: '/settings', expect: 'Workshop Profile' },
    { path: '/profile', expect: 'Change Password' },
    { path: '/users-teams', expect: 'Users & Teams' },
    { path: '/roles-permissions', expect: 'Permission Matrix' },
    { path: '/lead-pipeline', expect: 'Open Pipeline' },
    { path: '/reports', expect: 'Report Categories' },
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
    { path: '/register', expect: "Don't have an account?" },
    { path: '/error404', expect: "doesn't exist or has been moved" },
    { path: '/privacy-policy', expect: 'Privacy Policy' },
    { path: '/terms-conditions', expect: 'I have read and agree to the' },
  ]

  for (const route of publicRoutes) {
    test(`${route.path} renders without auth`, async ({ page }) => {
      await gotoReady(page, route.path)
      const text = await bodyText(page)
      expect(text).toContain(route.expect)
    })
  }
})
