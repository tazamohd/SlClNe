import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('RBAC access control', () => {
  test('advisor is redirected from executive reports', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'advisor')
    const page = await ctx.newPage()
    await gotoReady(page, '/executive-reports')
    expect(page.url()).toContain('/unauthorized')
    await ctx.close()
  })

  test('owner can access executive reports with SAR figures', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/executive-reports')
    const text = await bodyText(page)
    expect(text).toMatch(/SAR [\d,]+\.\d\d/)
    await ctx.close()
  })

  test('procurement opens a requisition and is refused a decision this build cannot record', async ({ browser }) => {
    // Approve / Escalate are real writes (`POST /procurement/requisitions/:id/…`)
    // that the server re-checks against the role's ceiling. With no API in
    // this build they are not offered at all: the detail says why, rather than
    // showing a button whose click would be pretend.
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    await seedRole(ctx, 'procurement')
    const page = await ctx.newPage()
    await gotoReady(page, '/procurement-portal/requisitions')
    expect(await bodyText(page)).toContain('Pending')

    const table = page.getByRole('table', { name: 'Procurement requisitions' })
    await expect(table).toBeVisible()
    await table.locator('tbody tr').first().click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Close' }).first()).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Approve' })).toHaveCount(0)
    await expect(dialog).toContainText('refuse writes rather than pretending')
    await ctx.close()
  })

  test('appointments filter narrows results', async ({ browser }) => {
    // Desktop viewport in both projects: the count below reads table rows,
    // and the phone layout renders the same appointments as cards.
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/appointments')
    const before = await page.locator('tbody tr').count()
    await page.getByRole('radio', { name: 'No Show' }).click()
    const after = await page.locator('tbody tr').count()
    expect(before).toBeGreaterThan(0)
    expect(after).toBeGreaterThan(0)
    expect(after).toBeLessThan(before)
    await ctx.close()
  })
})

test.describe('Role-specific landing pages', () => {
  const roleLandings = [
    { role: 'owner', path: '/dashboard', expect: 'Dashboard' },
    { role: 'technician', path: '/technician-portal', expect: 'Current Job' },
    { role: 'customer', path: '/customer-portal', expect: 'A3F8B2C1' },
    { role: 'supplier', path: '/supplier-portal', expect: 'Al-Jazira Parts Co.' },
    { role: 'superadmin', path: '/super-admin', expect: 'Platform Control' },
  ]

  for (const landing of roleLandings) {
    test(`${landing.role} landing page renders correctly`, async ({ browser }) => {
      const ctx = await browser.newContext()
      await seedRole(ctx, landing.role)
      const page = await ctx.newPage()
      await gotoReady(page, landing.path)
      const text = await bodyText(page)
      expect(text).toContain(landing.expect)
      await ctx.close()
    })
  }
})
