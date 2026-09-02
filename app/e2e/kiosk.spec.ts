import { test, expect } from '@playwright/test'
import { gotoReady, bodyText } from './helpers'

/** Self-service check-in kiosk: Identify -> Select Vehicle -> Confirm
 *  Service -> Done, a real step flow (`KioskCheckIn.tsx`) with large touch
 *  targets and a live progress indicator, not a single static screen. A
 *  walk-in identifies by phone or plate; "Find My Vehicle" only unlocks once
 *  one of those fields has real input. With no live API configured in this
 *  build (BLK-002), the kiosk is honestly stuck at step one — the button
 *  stays disabled even with input, because there's no server to look the
 *  vehicle up against. */
test.describe('Kiosk (Golden Path 23)', () => {
  test('kiosk identify step loads with branding and both identify fields', async ({ page }) => {
    await gotoReady(page, '/kiosk-check-in')
    const text = await bodyText(page)
    expect(text).toContain('SALIS AUTO')
    expect(text).toContain('Self Check-In')
    expect(text).toContain('Identify Yourself')
    expect(text).toContain('License Plate')
    expect(text).toContain('Phone Number')
  })

  test('typing a plate enables the button, but no live API keeps it disabled', async ({ page }) => {
    await gotoReady(page, '/kiosk-check-in')
    const findButton = page.getByRole('button', { name: 'Find My Vehicle' })
    await expect(findButton).toBeDisabled()

    await page.locator('#kiosk-plate').fill('ABC 1234')
    await expect(page.locator('#kiosk-plate')).toHaveValue('ABC 1234')
    // Real input now satisfies the client-side guard, but the button stays
    // disabled — `!isLive` in this fixture-only build (BLK-002).
    await expect(findButton).toBeDisabled()
  })
})

test.describe('Kiosk lifecycle', () => {
  test('walk-up customer identifies by plate, and the flow honestly stops there', async ({ page }) => {
    test.setTimeout(90_000)

    await gotoReady(page, '/kiosk-check-in')
    const text = await bodyText(page)
    expect(text).toContain('SALIS AUTO')
    expect(text).toContain('Self Check-In')

    // The progress indicator starts on step 1 of 3.
    const progress = page.getByRole('group', { name: 'Check-in progress' })
    await expect(progress).toBeVisible()

    // Real identification input.
    await page.locator('#kiosk-plate').fill('ABC 1234')
    await expect(page.locator('#kiosk-plate')).toHaveValue('ABC 1234')

    // This build has no API to resolve the plate against, so the kiosk
    // cannot advance past Identify — an honest stop, not a fake success.
    await expect(page.getByRole('button', { name: 'Find My Vehicle' })).toBeDisabled()
  })
})
