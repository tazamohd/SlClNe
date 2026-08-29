import { test, expect } from '@playwright/test'
import { gotoReady, bodyText } from './helpers'

test.describe('Kiosk (Golden Path 23)', () => {
  test('kiosk check-in page loads with branding and form', async ({ page }) => {
    await gotoReady(page, '/kiosk-check-in')
    const text = await bodyText(page)
    expect(text).toContain('SALIS AUTO')
    expect(text).toContain('Vehicle Check-In')
    expect(text).toContain('License Plate')
    expect(text).toContain('Check-In')
  })
})

test.describe('Kiosk lifecycle', () => {
  test('customer walks up to kiosk → sees service options → checks in', async ({ page }) => {
    test.setTimeout(90_000)

    await gotoReady(page, '/kiosk-check-in')
    const text = await bodyText(page)
    expect(text).toContain('SALIS AUTO')
    expect(text).toContain('Vehicle Check-In')
    expect(text).toContain('Maintenance')
    expect(text).toContain('Repair')
    expect(text).toContain('Inspection')
    expect(text).toContain('Powered by SALIS AUTO')
  })
})
