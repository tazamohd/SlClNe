import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test, expect, type Page, type Browser } from '@playwright/test'
import { seedRole, gotoReady } from './helpers'
import { REGISTRY } from '../src/data/generated/master-registry'

/** Tablet verification — BLK-008.
 *
 *  Every screen in this product had been checked at 390 px and at 1280 px and
 *  nowhere in between, which is precisely where a layout built from a phone
 *  design and a desktop design tends to come apart: wide enough that the phone
 *  layout looks starved, narrow enough that the desktop grid overflows.
 *
 *  `MOBILE_QUERY` is `(max-width: 860px)`, so a tablet straddles the switch —
 *  768, 820 and 834 render the mobile design, 1024 renders the desktop one, and
 *  rotating an iPad crosses that line mid-session. These tests pin both sides
 *  and the crossing.
 *
 *  What is asserted is deliberately narrow: no horizontal overflow, the shell
 *  that the width implies, and controls big enough to hit. Those are the
 *  failures a screenshot diff cannot argue with and a human reviewer keeps
 *  missing. Visual fidelity at these widths is a separate, later pass.
 *
 *  The sweep used to sample one screen per layout family (six of them) rather
 *  than the inventory — `project-control/BLOCKERS.json` named that gap as
 *  BLK-008 explicitly: "a screen outside those families can still break at
 *  tablet width." `SCREENS` below is every entry in the same generated
 *  `master-registry.ts` that `scripts/smoke.mjs`'s route coverage already
 *  walks, seeded with the same 'owner' role smoke.mjs uses (view on every
 *  module, so a redirect means the route is broken rather than forbidden) —
 *  a capability cannot exist without appearing here.
 *
 *  A first full run surfaces genuine, previously-undetected overflow at these
 *  widths on screens nobody had checked before. Failing the whole suite on
 *  every one of them would either block on fixing an unbounded backlog in
 *  this change or get the check disabled within a week; ratcheting the exact
 *  known set against `project-control/BASELINE.json` (`tabletOverflowRoutes`,
 *  same convention as the axe colour-contrast ratchet in e2e/a11y.spec.ts)
 *  keeps the check on and honest: it fails on any *new* overflow, and the
 *  known ones are visible work items rather than silently swallowed. */

const PORTRAIT = [
  { name: 'iPad mini', width: 768, height: 1024 },
  { name: 'iPad Air', width: 820, height: 1180 },
  { name: 'iPad Pro 11', width: 834, height: 1194 },
  { name: 'iPad Pro 12.9', width: 1024, height: 1366 },
] as const

const LANDSCAPE = PORTRAIT.map((v) => ({
  name: `${v.name} landscape`,
  width: v.height,
  height: v.width,
}))

/** Every registered capability, not a hand-picked sample — see BLK-008 above. */
const SCREENS = REGISTRY.map((entry) => ({ path: entry.route, role: 'owner' as const }))

const BASELINE = fileURLToPath(new URL('../../project-control/BASELINE.json', import.meta.url))

/** The recorded overflow allowance for one viewport × route. A missing entry
 *  is zero: a screen newly covered by the full sweep starts clean or records
 *  its backlog explicitly, never inherits an unstated allowance. */
function overflowCeiling(viewport: string, route: string): number {
  const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8')) as {
    tabletOverflowRoutes?: Record<string, number>
  }
  return baseline.tabletOverflowRoutes?.[`${viewport} ${route}`] ?? 0
}

/** True when the document is wider than its viewport. One pixel of slack
 *  absorbs sub-pixel rounding; anything more is a real sideways scrollbar. */
async function overflowsHorizontally(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  )
}

/** The widest element sticking out past the viewport, for a failure message
 *  that names the culprit instead of just asserting false. */
async function widestOverflowingElement(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const limit = document.documentElement.clientWidth
    let worst: { tag: string; cls: string; right: number } | null = null
    for (const el of Array.from(document.body.querySelectorAll('*'))) {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.right <= limit + 1) continue
      if (!worst || rect.right > worst.right) {
        worst = {
          tag: el.tagName.toLowerCase(),
          cls: (el.getAttribute('class') ?? '').slice(0, 120),
          right: Math.round(rect.right),
        }
      }
    }
    return worst ? `${worst.tag}.${worst.cls} extends to ${worst.right}px of ${limit}px` : null
  })
}

async function openAt(
  browser: Browser,
  viewport: { width: number; height: number },
  role: string,
  path: string,
) {
  const context = await browser.newContext({ viewport })
  await seedRole(context, role)
  const page = await context.newPage()
  await gotoReady(page, path)
  return { context, page }
}

for (const viewport of [...PORTRAIT, ...LANDSCAPE]) {
  test.describe(`${viewport.name} — ${viewport.width}x${viewport.height}`, () => {
    for (const screen of SCREENS) {
      test(`${screen.path} fits the viewport`, async ({ browser }) => {
        const { context, page } = await openAt(browser, viewport, screen.role, screen.path)
        const overflows = await overflowsHorizontally(page)
        const culprit = overflows ? await widestOverflowingElement(page) : null
        const ceiling = overflowCeiling(viewport.name, screen.path)
        expect(
          overflows ? 1 : 0,
          `${screen.path} overflows ${viewport.name} (${culprit ?? 'no overflowing element found'}); ` +
            `the ratchet in project-control/BASELINE.json allows ${ceiling}. ` +
            'Lower the baseline when it is fixed; never raise it.',
        ).toBeLessThanOrEqual(ceiling)
        await context.close()
      })
    }

    test('renders the shell its width implies', async ({ browser }) => {
      const { context, page } = await openAt(browser, viewport, 'owner', '/job-cards')
      // MOBILE_QUERY is (max-width: 860px): at or below it the mobile design
      // owns the screen, above it the desktop sidebar does. A tablet must land
      // firmly on one side, never half-way between the two.
      const isMobileWidth = viewport.width <= 860
      const menuButtons = await page.getByRole('button', { name: 'Open menu' }).count()
      const sidebars = await page.locator('aside').count()

      if (isMobileWidth) {
        expect(menuButtons, 'mobile width needs a menu button to reach navigation').toBeGreaterThan(
          0,
        )
      } else {
        expect(sidebars, 'desktop width should show the persistent sidebar').toBeGreaterThan(0)
      }
      await context.close()
    })

    test('keeps primary controls thumb-sized', async ({ browser }) => {
      const { context, page } = await openAt(browser, viewport, 'owner', '/job-cards')
      // A tablet is a touch device at every one of these widths, so the 44 px
      // target applies even where the desktop layout is in use — the place this
      // is easiest to lose is exactly where the design switches to the compact
      // desktop chrome.
      const undersized = await page.evaluate(() => {
        const bad: string[] = []
        for (const el of Array.from(document.querySelectorAll('button, a[href]'))) {
          const rect = el.getBoundingClientRect()
          if (rect.width === 0 || rect.height === 0) continue
          const style = getComputedStyle(el)
          if (style.visibility === 'hidden' || style.display === 'none') continue
          if (rect.height < 44 && rect.width < 44) {
            bad.push(
              `${el.tagName.toLowerCase()}"${(el.textContent ?? '').trim().slice(0, 24)}" ` +
                `${Math.round(rect.width)}x${Math.round(rect.height)}`,
            )
          }
        }
        return bad
      })
      // Reported, not enforced: the design's own chrome uses 36 px controls in
      // places, so failing here would be failing the design rather than a
      // regression. The count is the number to drive down.
      test.info().annotations.push({
        type: 'touch-targets-under-44px',
        description: String(undersized.length),
      })
      await context.close()
    })
  })
}

test.describe('rotation', () => {
  /** Crossing 860 px mid-session is the case a static viewport sweep misses:
   *  the layout has to re-evaluate rather than keep whichever design it booted
   *  into. */
  test('an iPad Pro rotating past the breakpoint swaps the layout', async ({ browser }) => {
    const { context, page } = await openAt(
      browser,
      { width: 834, height: 1194 },
      'owner',
      '/job-cards',
    )
    await expect(page.getByRole('button', { name: 'Open menu' })).toHaveCount(1)

    await page.setViewportSize({ width: 1194, height: 834 })
    await expect(page.locator('aside')).not.toHaveCount(0)
    expect(await overflowsHorizontally(page)).toBe(false)

    await page.setViewportSize({ width: 834, height: 1194 })
    await expect(page.getByRole('button', { name: 'Open menu' })).toHaveCount(1)
    expect(await overflowsHorizontally(page)).toBe(false)

    await context.close()
  })
})
