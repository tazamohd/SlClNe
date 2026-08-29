import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Fleet Contract (Golden Path 12)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('fleet management page loads', async ({ page }) => {
    await gotoReady(page, '/fleet-management')
    const text = await bodyText(page)
    expect(text).toContain('Fleet Management')
  })

  test('fleet contract detail loads', async ({ page }) => {
    await gotoReady(page, '/fleet-contract')
    const text = await bodyText(page)
    expect(text).toContain('Fleet Contract')
  })

  test('fleet tracking page loads', async ({ page }) => {
    await gotoReady(page, '/fleet-tracking')
    const text = await bodyText(page)
    expect(text).toContain('Fleet Tracking')
  })

  test('contract management page loads', async ({ page }) => {
    await gotoReady(page, '/contract-management')
    const text = await bodyText(page)
    expect(text).toContain('Contract Management')
  })

  test('loaner vehicles page loads', async ({ page }) => {
    await gotoReady(page, '/loaner-vehicles')
    const text = await bodyText(page)
    expect(text).toContain('Loaner Vehicles')
  })
})

test.describe('Fleet contract lifecycle', () => {
  test('fleet overview → contract details → tracking → loaner vehicles', async ({ context, page }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    await gotoReady(page, '/fleet-management')
    expect(await bodyText(page)).toContain('Fleet Management')

    await gotoReady(page, '/fleet-contract')
    expect(await bodyText(page)).toContain('Fleet Contract')

    await gotoReady(page, '/fleet-tracking')
    expect(await bodyText(page)).toContain('Fleet Tracking')

    await gotoReady(page, '/contract-management')
    expect(await bodyText(page)).toContain('Contract Management')

    await gotoReady(page, '/loaner-vehicles')
    expect(await bodyText(page)).toContain('Loaner Vehicles')
  })
})
