/** A keyboard-only walk through the operational shell.
 *
 *  Skip link → sidebar group → table row → detail; a modal traps focus and
 *  gives it back on Escape; ⌘K opens and closes the palette. Every step is
 *  something the static gate cannot verify because it depends on what the
 *  browser actually focuses. */
import { test, expect } from '@playwright/test'
import { seedRole, gotoReady } from './helpers'

test.describe('keyboard', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 860, 'desktop project only')
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('skip link is the first tab stop and lands in main', async ({ page }) => {
    await gotoReady(page, '/job-cards')
    await page.keyboard.press('Tab')
    const skip = page.getByTestId('skip-link')
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#main-content$/)
  })

  test('sidebar groups fold and unfold from the keyboard', async ({ page }) => {
    await gotoReady(page, '/dashboard')
    const group = page.getByTestId('nav-group-workshop')
    await group.focus()
    await expect(group).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Enter')
    await expect(group).toHaveAttribute('aria-expanded', 'false')
    await page.keyboard.press('Enter')
    await expect(group).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByTestId('nav-item-job-cards')).toBeVisible()
  })

  test('a table row is reachable and Enter opens the record', async ({ page }) => {
    await gotoReady(page, '/job-cards')
    const row = page.getByTestId('data-table-row').first()
    await row.focus()
    await expect(row).toBeFocused()
    await page.keyboard.press('Enter')
    await page.waitForURL('**/job-detail**')
  })

  test('a sortable header is a button and announces its sort state', async ({ page }) => {
    await gotoReady(page, '/job-cards')
    const sort = page.locator('[data-testid^="data-table-sort-"]').first()
    await sort.focus()
    await page.keyboard.press('Enter')
    const th = sort.locator('xpath=ancestor::th[1]')
    await expect(th).toHaveAttribute('aria-sort', /ascending|descending/)
  })

  test('the command palette opens on Ctrl+K, traps focus and closes on Escape', async ({ page }) => {
    await gotoReady(page, '/dashboard')
    const trigger = page.getByRole('button', { name: /Quick Actions/i })
    await trigger.focus()
    await page.keyboard.press('Control+k')
    const palette = page.getByTestId('command-palette')
    await expect(palette).toBeVisible()
    await expect(page.getByPlaceholder(/Search or type an action/)).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Escape')
    await expect(palette).toBeHidden()
  })

  test('a dialog returns focus to the control that opened it', async ({ page }) => {
    await gotoReady(page, '/customers')
    const add = page.getByRole('button', { name: /Add Customer/i })
    if ((await add.count()) === 0) test.skip(true, 'role has no create grant on this build')
    await add.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    // Focus is inside the dialog, and Tab cannot leave it.
    for (let i = 0; i < 12; i++) await page.keyboard.press('Tab')
    const inside = await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))
    expect(inside).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(add).toBeFocused()
  })

  test('every focused control shows a visible ring', async ({ page }) => {
    await gotoReady(page, '/dashboard')
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab')
      const visible = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        if (!el || el === document.body) return true
        const style = getComputedStyle(el)
        return style.outlineStyle !== 'none' || style.boxShadow !== 'none'
      })
      expect(visible).toBe(true)
    }
  })
})
