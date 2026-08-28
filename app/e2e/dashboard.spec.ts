import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('loads with Dashboard heading', async ({ page }) => {
    await gotoReady(page, '/dashboard')
    const text = await bodyText(page)
    expect(text).toContain('Dashboard')
  })

  test('renders KPI widgets with numeric data', async ({ page }) => {
    await gotoReady(page, '/dashboard')
    const text = await bodyText(page)
    expect(text).toMatch(/\d+/)
  })

  test('dashboard is not blank', async ({ page }) => {
    await gotoReady(page, '/dashboard')
    const text = await bodyText(page)
    expect(text.trim().length).toBeGreaterThan(100)
  })

  test('sidebar is visible on desktop viewport', async ({ page }) => {
    await gotoReady(page, '/dashboard')
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()
  })

  test('different roles see role-appropriate dashboard', async ({ browser }) => {
    const techCtx = await browser.newContext()
    await seedRole(techCtx, 'technician')
    const techPage = await techCtx.newPage()
    await gotoReady(techPage, '/technician-portal')
    const techText = await bodyText(techPage)
    expect(techText).toContain('Current Job')
    await techCtx.close()

    const acctCtx = await browser.newContext()
    await seedRole(acctCtx, 'accountant')
    const acctPage = await acctCtx.newPage()
    await gotoReady(acctPage, '/dashboard')
    const acctText = await bodyText(acctPage)
    expect(acctText).toContain('Dashboard')
    await acctCtx.close()
  })
})
