import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Call Center (Golden Path 22)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('call center page loads', async ({ page }) => {
    await gotoReady(page, '/call-center')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('call center logs page loads', async ({ page }) => {
    await gotoReady(page, '/call-center/logs')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })
})

test.describe('Call center lifecycle', () => {
  test('call center → call logs', async ({ context, page }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    await gotoReady(page, '/call-center')
    expect((await bodyText(page)).length).toBeGreaterThan(0)

    await gotoReady(page, '/call-center/logs')
    expect((await bodyText(page)).length).toBeGreaterThan(0)
  })
})
