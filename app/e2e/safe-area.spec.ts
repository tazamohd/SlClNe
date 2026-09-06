import { test, expect, type Page } from '@playwright/test'
import { seedRole, gotoReady } from './helpers'

/** Safe-area insets and dynamic viewport height.
 *
 *  Two failure modes that only appear on real hardware, and that no other spec
 *  in this suite can see:
 *
 *  1. **The insets.** `env(safe-area-inset-*)` is 0 in a headless browser and 0
 *     on any device without a notch, so a shell that never applied them looks
 *     identical here and puts its bottom tab bar under the home indicator on an
 *     iPhone. These tests therefore *inject* the insets — they override the
 *     `--safe-*` custom properties with values large enough to measure, then
 *     assert the chrome moved by exactly that much. That tests the wiring, which
 *     is the part that regresses; the real values come from the device.
 *
 *  2. **The height unit.** `100vh` on a phone is the height the viewport would
 *     have with the browser toolbars hidden, which is taller than what you can
 *     see, so a `h-screen` shell hangs its last row behind Safari's toolbar.
 *     `--vh-full` resolves to `100dvh` wherever `dvh` is supported.
 *
 *  Injection goes in through an init script rather than `addStyleTag` so the
 *  values are present at first paint, before any measurement.
 */

const INSET = 40

/** Override the four inset tokens before the app's own stylesheet loads.
 *  `!important` beats the `:root` declarations without depending on order. */
async function withInsets(page: Page): Promise<void> {
  await page.addInitScript((px) => {
    const css = `:root{--safe-top:${px}px!important;--safe-bottom:${px}px!important;--safe-start:${px}px!important;--safe-end:${px}px!important}`
    const apply = () => {
      const style = document.createElement('style')
      style.id = 'test-safe-area'
      style.textContent = css
      document.head.append(style)
    }
    if (document.head) apply()
    else document.addEventListener('DOMContentLoaded', apply, { once: true })
  }, INSET)
}

/** Resolved `padding-bottom` of the first element matching `selector`. */
async function paddingBottom(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return -1
    return parseFloat(getComputedStyle(el).paddingBottom)
  }, selector)
}

test.describe('Safe-area insets', () => {
  test('the customer app tab bar clears the home indicator', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'customer')
    const page = await ctx.newPage()
    await withInsets(page)
    await gotoReady(page, '/customer-app/home')

    /* The bar is the last thing in the column, so nothing else pushes it clear:
     * without its own padding the five tabs sit on the home indicator. */
    expect(await paddingBottom(page, 'nav[aria-label]')).toBe(INSET)

    await ctx.close()
  })

  test('the customer app header clears the status bar', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'customer')
    const page = await ctx.newPage()
    await withInsets(page)
    await gotoReady(page, '/customer-app/home')

    // The design's 12px gutter plus the injected inset.
    const padTop = await page.evaluate(
      () => parseFloat(getComputedStyle(document.querySelector('header')!).paddingTop),
    )
    expect(padTop).toBe(12 + INSET)

    await ctx.close()
  })

  test('the operational mobile header keeps its 56px row under the inset', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await withInsets(page)
    await gotoReady(page, '/job-cards')

    /* `h-topbar-safe` grows the bar by the inset instead of letting the inset
     * eat into the row, so the content box stays the designed 56px. */
    const header = await page.evaluate(() => {
      const el = document.querySelector('header')!
      const s = getComputedStyle(el)
      return {
        height: el.getBoundingClientRect().height,
        paddingTop: parseFloat(s.paddingTop),
      }
    })
    expect(header.paddingTop).toBe(INSET)
    expect(header.height).toBe(56 + INSET)

    await ctx.close()
  })

  test('page content ends above the home indicator, not behind it', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await withInsets(page)
    await gotoReady(page, '/job-cards')

    // The design's 16px page gutter plus the injected inset.
    expect(await paddingBottom(page, 'main > div:last-of-type')).toBe(16 + INSET)

    await ctx.close()
  })

  /** The insets are logical, not physical: in Arabic the start edge is the
   *  right one, so `ps-safe-start` has to read `safe-area-inset-right`. This is
   *  the one property of the mapping a value injection cannot fake, so it reads
   *  the raw `env()` wiring instead of the overridden tokens. */
  test('start and end insets swap under RTL', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/job-cards')

    const read = () =>
      page.evaluate(() => {
        const s = getComputedStyle(document.documentElement)
        return {
          start: s.getPropertyValue('--safe-start').trim(),
          end: s.getPropertyValue('--safe-end').trim(),
        }
      })

    const ltr = await read()
    await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'))
    const rtl = await read()

    expect(ltr.start).toBe(rtl.end)
    expect(ltr.end).toBe(rtl.start)

    await ctx.close()
  })
})

test.describe('Dynamic viewport height', () => {
  test('the shells size to the viewport actually on screen', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/job-cards')

    /* In a headless browser `dvh` and `vh` agree, so what this can prove is
     * that the token resolves to a real height equal to the viewport — a
     * regression to `height: auto` or an unresolvable var would fail here. */
    const shell = await page.evaluate(() => {
      const el = document.querySelector('#root > div') as HTMLElement | null
      return el ? el.getBoundingClientRect().height : -1
    })
    expect(shell).toBe(844)

    await ctx.close()
  })

  test('the height token prefers dvh where the browser supports it', async ({ page }) => {
    await gotoReady(page, '/login')

    const resolved = await page.evaluate(() => ({
      token: getComputedStyle(document.documentElement).getPropertyValue('--vh-full').trim(),
      supportsDvh: CSS.supports('height', '100dvh'),
    }))

    expect(resolved.token).toBe(resolved.supportsDvh ? '100dvh' : '100vh')
  })
})
