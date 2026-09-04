/** With the OS asking for less motion, nothing animates.
 *
 *  Two layers make that true — `motion-reduce:animate-none` on every
 *  animated element (the static gate) and the global media block in
 *  `styles/index.css` — and this is the one check that measures the result
 *  rather than the source. */
import { test, expect } from '@playwright/test'
import { seedRole, gotoReady } from './helpers'

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  for (const route of ['/dashboard', '/job-cards', '/login']) {
    test(`${route} runs no animation`, async ({ page }) => {
      await gotoReady(page, route)
      const animated = await page.evaluate(() => {
        const offenders: string[] = []
        for (const el of document.querySelectorAll<HTMLElement>('[class*="animate-"]')) {
          const style = getComputedStyle(el)
          const duration = parseFloat(style.animationDuration || '0')
          if (style.animationName !== 'none' && duration > 0.05) {
            offenders.push(`${el.tagName.toLowerCase()}.${[...el.classList].filter((c) => c.startsWith('animate-')).join('.')}`)
          }
        }
        return offenders
      })
      expect(animated).toEqual([])
    })
  }

  test('the splash still redirects without its animation', async ({ page }) => {
    await page.goto('/splash', { waitUntil: 'domcontentloaded' })
    await page.waitForURL('**/welcome', { timeout: 10_000 })
  })
})
