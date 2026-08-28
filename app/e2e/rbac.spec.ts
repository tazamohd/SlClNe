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

  test('procurement sees both Approve and Escalate on requisitions', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'procurement')
    const page = await ctx.newPage()
    await gotoReady(page, '/procurement-portal/requisitions')
    const text = await bodyText(page)
    expect((text.match(/Approve/g) || []).length).toBeGreaterThan(0)
    expect((text.match(/Escalate/g) || []).length).toBeGreaterThan(0)
    await ctx.close()
  })

  test('appointments filter narrows results', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/appointments')
    const before = await page.locator('tbody tr').count()
    await page.getByRole('tab', { name: /No Show/ }).click()
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
    { role: 'customer', path: '/customer-portal', expect: 'JC-A3F8B2C1' },
    { role: 'supplier', path: '/supplier-portal', expect: 'AutoParts KSA' },
    { role: 'superadmin', path: '/super-admin', expect: 'Platform Overview' },
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
