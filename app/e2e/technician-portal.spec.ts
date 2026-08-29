import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Technician Portal (Golden Path 20)', () => {
  test.describe('technician views', () => {
    test.beforeEach(async ({ context }) => {
      await seedRole(context, 'technician')
    })

    test('technician portal loads', async ({ page }) => {
      await gotoReady(page, '/technician-portal')
      const text = await bodyText(page)
      expect(text).toContain('Current Job')
    })

    test('technician job detail loads', async ({ page }) => {
      await gotoReady(page, '/technician-portal/job-detail')
      const text = await bodyText(page)
      expect(text.length).toBeGreaterThan(0)
    })
  })

  test.describe('owner views', () => {
    test.beforeEach(async ({ context }) => {
      await seedRole(context, 'owner')
    })

    test('technician schedule page loads', async ({ page }) => {
      await gotoReady(page, '/technician-schedule')
      const text = await bodyText(page)
      expect(text).toContain('Technician Schedule')
    })

    test('technician knowledge base loads', async ({ page }) => {
      await gotoReady(page, '/technician-kb')
      const text = await bodyText(page)
      expect(text.length).toBeGreaterThan(0)
    })

    test('technicians directory loads', async ({ page }) => {
      await gotoReady(page, '/technicians')
      const text = await bodyText(page)
      expect(text).toContain('Technicians')
    })
  })
})

test.describe('Technician portal lifecycle', () => {
  test('technician views job → owner manages schedule → technician directory', async ({ context, page, browser }) => {
    test.setTimeout(90_000)

    // Technician views assigned job and detail
    await seedRole(context, 'technician')

    await gotoReady(page, '/technician-portal')
    expect(await bodyText(page)).toContain('Current Job')

    await gotoReady(page, '/technician-portal/job-detail')
    expect((await bodyText(page)).length).toBeGreaterThan(0)

    // Owner manages schedule and reviews directory
    const ownerCtx = await browser.newContext()
    await seedRole(ownerCtx, 'owner')
    const ownerPage = await ownerCtx.newPage()

    await gotoReady(ownerPage, '/technician-schedule')
    expect(await bodyText(ownerPage)).toContain('Technician Schedule')

    await gotoReady(ownerPage, '/technicians')
    expect(await bodyText(ownerPage)).toContain('Technicians')

    await ownerCtx.close()
  })
})
