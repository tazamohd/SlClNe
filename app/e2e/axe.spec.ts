/** Runtime accessibility sweep — what the static gate cannot see.
 *
 *  `scripts/check-a11y.mjs` reads the JSX; axe reads the rendered tree with
 *  computed styles, so it catches contrast, landmark and name-computation
 *  problems in both themes and both languages. Counts ratchet against
 *  `e2e/axe-baseline.json` per route/theme/lang the way the token gate does:
 *  a route may only ever get cleaner. Run with `AXE_UPDATE=1` to lock a new
 *  low in. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { seedRole, seedPrefs, gotoReady, HERO_ROUTES } from './helpers'

const BASELINE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'axe-baseline.json')
const baseline: Record<string, number> = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {}
const observed: Record<string, number> = {}
const updating = Boolean(process.env.AXE_UPDATE)

test.describe('axe — hero routes in both themes and languages', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 860, 'desktop project only')

  for (const route of HERO_ROUTES) {
    for (const theme of ['light', 'dark'] as const) {
      for (const lang of ['en', 'ar'] as const) {
        const key = `${route} ${theme} ${lang}`
        test(key, async ({ browser }) => {
          const ctx = await browser.newContext()
          await seedRole(ctx, 'owner')
          await seedPrefs(ctx, { theme, lang })
          const page = await ctx.newPage()
          await gotoReady(page, route)
          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
            .exclude('[data-testid="toast-queue"]')
            .analyze()
          const count = results.violations.reduce((sum, v) => sum + v.nodes.length, 0)
          observed[key] = count
          const limit = baseline[key]
          const detail = results.violations
            .map((v) => `${v.id} ×${v.nodes.length}: ${v.help}`)
            .join('\n')
          if (limit === undefined) {
            test.info().annotations.push({ type: 'axe', description: `${count} violations (no baseline yet)\n${detail}` })
          } else {
            expect(count, `${key}\n${detail}`).toBeLessThanOrEqual(limit)
          }
          await ctx.close()
        })
      }
    }
  }

  test.afterAll(() => {
    if (!updating) return
    const next = { ...baseline }
    for (const [key, count] of Object.entries(observed)) {
      if (next[key] === undefined || count < next[key]) next[key] = count
    }
    writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n')
  })
})
