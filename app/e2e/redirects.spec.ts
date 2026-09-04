/** Duplicate-concept routes hand off to their canonical screen.
 *
 *  Read from the same `route-redirects.json` the router, the registry and
 *  the smoke runner use, so the spec cannot disagree with them. */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { test, expect } from '@playwright/test'
import { seedRole, gotoReady } from './helpers'

const table = JSON.parse(
  readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'route-redirects.json'), 'utf8')
) as Record<string, string>
const REDIRECTS = Object.entries(table).filter(([from]) => from.startsWith('/'))

test.describe('redirects', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  for (const [from, to] of REDIRECTS) {
    test(`${from} → ${to}`, async ({ page }) => {
      await gotoReady(page, from)
      await expect(page).toHaveURL(new RegExp(`${to.replace(/\//g, '\\/')}(\\?|#|$)`))
      await expect(page.getByTestId('page-header-title').first()).toBeVisible()
      // `replace`, so the back button never lands on the loser.
      const depth = await page.evaluate(() => window.history.length)
      expect(depth).toBeLessThanOrEqual(2)
    })
  }
})
