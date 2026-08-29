import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Organization / Branch Setup (Golden Path 15)', () => {
  test('superadmin views organizations', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'superadmin')
    const page = await ctx.newPage()
    await gotoReady(page, '/organizations')
    const text = await bodyText(page)
    expect(text).toContain('Organizations')
    await ctx.close()
  })

  test.describe('owner admin views', () => {
    test.beforeEach(async ({ context }) => {
      await seedRole(context, 'owner')
    })

    test('branches page loads', async ({ page }) => {
      await gotoReady(page, '/branches')
      const text = await bodyText(page)
      expect(text).toContain('Branches')
    })

    test('departments page loads', async ({ page }) => {
      await gotoReady(page, '/departments')
      const text = await bodyText(page)
      expect(text).toContain('Departments')
    })

    test('settings page loads', async ({ page }) => {
      await gotoReady(page, '/settings')
      const text = await bodyText(page)
      expect(text).toContain('Settings')
    })

    test('advanced settings page loads', async ({ page }) => {
      await gotoReady(page, '/advanced-settings')
      const text = await bodyText(page)
      expect(text).toContain('Settings')
    })
  })

  test('organization selection page loads', async ({ page }) => {
    await gotoReady(page, '/organization-selection')
    const text = await bodyText(page)
    expect(text).toContain('Organization Selection')
  })

  test('workspace selection page loads', async ({ page }) => {
    await gotoReady(page, '/workspace-selection')
    const text = await bodyText(page)
    expect(text).toContain('Workspace Selection')
  })
})

test.describe('Org/branch setup lifecycle', () => {
  test('superadmin views orgs → owner sets up branches → departments → settings', async ({ browser }) => {
    test.setTimeout(90_000)

    // Superadmin views organizations
    const adminCtx = await browser.newContext()
    await seedRole(adminCtx, 'superadmin')
    const adminPage = await adminCtx.newPage()
    await gotoReady(adminPage, '/organizations')
    expect(await bodyText(adminPage)).toContain('Organizations')
    await adminCtx.close()

    // Owner configures branches, departments, settings
    const ownerCtx = await browser.newContext()
    await seedRole(ownerCtx, 'owner')
    const ownerPage = await ownerCtx.newPage()

    await gotoReady(ownerPage, '/branches')
    expect(await bodyText(ownerPage)).toContain('Branches')

    await gotoReady(ownerPage, '/departments')
    expect(await bodyText(ownerPage)).toContain('Departments')

    await gotoReady(ownerPage, '/settings')
    expect(await bodyText(ownerPage)).toContain('Settings')

    await gotoReady(ownerPage, '/advanced-settings')
    expect(await bodyText(ownerPage)).toContain('Settings')

    await ownerCtx.close()
  })
})
