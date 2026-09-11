/** With the OS asking for less motion, nothing animates.
 *
 *  Two layers make that true — `motion-reduce:animate-none` on every animated
 *  element (the static gate) and the global media block in `styles/index.css` —
 *  and this is the one check that measures the result rather than the source.
 *
 *  It was measuring nothing. `test.use({ reducedMotion: 'reduce' })` did not
 *  reach the page in this configuration: inside the test,
 *  `matchMedia('(prefers-reduced-motion: reduce)').matches` was `false`, so the
 *  `motion-reduce:` variants correctly did not apply and the spec reported the
 *  app as animating through a preference it had never actually been asked for.
 *  A context created explicitly with the option does emulate it, so that is what
 *  these tests use — and each one now asserts the preference is live before it
 *  asserts anything about animation, because a media-query check that silently
 *  stops emulating is a test that passes for the wrong reason.
 */
import { test, expect, type Page } from '@playwright/test'
import { seedRole, gotoReady } from './helpers'

/** Elements still running a real animation, named so a failure says which. */
async function animatingElements(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const offenders: string[] = []
    for (const el of document.querySelectorAll<HTMLElement>('[class*="animate-"]')) {
      const style = getComputedStyle(el)
      const duration = parseFloat(style.animationDuration || '0')
      if (style.animationName !== 'none' && duration > 0.05) {
        const names = [...el.classList].filter((c) => c.startsWith('animate-')).join('.')
        offenders.push(`${el.tagName.toLowerCase()}.${names}`)
      }
    }
    return offenders
  })
}

test.describe('reduced motion', () => {
  for (const route of ['/dashboard', '/job-cards', '/login']) {
    test(`${route} runs no animation`, async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'reduce' })
      await seedRole(context, 'owner')
      const page = await context.newPage()

      await gotoReady(page, route)

      // The preference has to be live, or everything below is vacuous.
      expect(
        await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
        'reduced-motion emulation is not reaching the page',
      ).toBe(true)

      const animated = await animatingElements(page)
      expect(animated, animated.join(', ')).toEqual([])

      await context.close()
    })
  }

  test('motion returns when it is not refused', async ({ browser }) => {
    // The complement, so a stylesheet that disabled animation outright would
    // fail here rather than quietly passing every test above.
    const context = await browser.newContext({ reducedMotion: 'no-preference' })
    await seedRole(context, 'owner')
    const page = await context.newPage()

    await gotoReady(page, '/dashboard')
    expect(
      await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
    ).toBe(false)
    expect((await animatingElements(page)).length).toBeGreaterThan(0)

    await context.close()
  })

  test('the splash still redirects without its animation', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto('/splash', { waitUntil: 'domcontentloaded' })
    await page.waitForURL('**/welcome', { timeout: 10_000 })
    await context.close()
  })
})
