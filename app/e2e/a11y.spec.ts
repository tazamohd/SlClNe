import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { seedRole, gotoReady } from './helpers'

/** Runtime accessibility sweep — axe-core over rendered screens.
 *
 *  `scripts/check-a11y.mjs` is a static linter over the JSX and says so: it
 *  cannot see computed colour contrast, a label wired up in a parent, or a
 *  live accessibility tree. This is the other half the test strategy asks for
 *  ("axe + keyboard specs — zero serious/critical"): a real browser, a real
 *  DOM, the WCAG 2.x A/AA rule tags, one screen per shell family so every
 *  chrome (operational app, auth, public site, portal, customer app, kiosk)
 *  is swept in both viewports.
 *
 *  Two gates, deliberately different:
 *
 *  - Every *serious* or *critical* violation other than colour contrast fails
 *    outright. An invalid ARIA reference, an unnamed button or a scroller the
 *    keyboard cannot reach is a defect in one component and is fixed there.
 *
 *  - `color-contrast` is ratcheted against `project-control/BASELINE.json`
 *    (`axeColourContrastNodes`, per project and route) rather than gated at
 *    zero. The failing pairs are the brand palette itself — orange `#F97316`
 *    and bright blue `#0BB3FF` on white or on their own tints, straight from
 *    the design bundle's badge tables (`src/data/generated/badges.ts`) — and
 *    the fix is a palette decision, not a code one. The counts may fall and
 *    never rise: a screen that adds another failing pair fails here. Lower
 *    the baseline as the backlog in docs/A11Y_AUDIT.md is burned down.
 *
 *  Moderate and minor findings are listed in the failure message when a gate
 *  trips but do not fail it — the same threshold the strategy sets, chosen so
 *  the check stays on rather than being switched off the first week a
 *  low-impact nit lands. */
const SCREENS: ReadonlyArray<{ path: string; role: string | null }> = [
  { path: '/login', role: null },
  { path: '/public-portal/landing', role: null },
  { path: '/dashboard', role: 'owner' },
  { path: '/job-cards', role: 'owner' },
  { path: '/customer-detail', role: 'owner' },
  { path: '/invoice-create', role: 'accountant' },
  { path: '/inventory', role: 'owner' },
  { path: '/bank-reconciliation', role: 'accountant' },
  { path: '/technician-portal', role: 'technician' },
  { path: '/customer-portal', role: 'customer' },
  { path: '/customer-app/home', role: 'customer' },
  { path: '/kiosk-check-in', role: 'frontdesk' },
]

const BASELINE = fileURLToPath(new URL('../../project-control/BASELINE.json', import.meta.url))

/** The recorded contrast ceiling for one project × route. A missing entry is
 *  a ceiling of zero: a new screen in the sweep starts clean or records its
 *  backlog explicitly, never inherits an unstated allowance. */
function contrastCeiling(project: string, route: string): number {
  const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8')) as {
    axeColourContrastNodes?: Record<string, number>
  }
  return baseline.axeColourContrastNodes?.[`${project} ${route}`] ?? 0
}

type Violation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number]

function describe(violations: Violation[]): string {
  return violations
    .map(
      (v) =>
        `[${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} node${v.nodes.length === 1 ? '' : 's'})\n` +
        v.nodes
          .slice(0, 5)
          .map((n) => `    ${n.target.join(' ')}`)
          .join('\n'),
    )
    .join('\n')
}

test.describe('Accessibility — axe sweep', () => {
  for (const screen of SCREENS) {
    test(`${screen.path} has no serious or critical axe violations`, async ({ browser }, info) => {
      const ctx = await browser.newContext()
      if (screen.role) await seedRole(ctx, screen.role)
      const page = await ctx.newPage()
      await gotoReady(page, screen.path)

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      const blocking = results.violations.filter(
        (v) => (v.impact === 'serious' || v.impact === 'critical') && v.id !== 'color-contrast',
      )
      expect(blocking, `axe violations on ${screen.path}:\n${describe(results.violations)}`).toEqual([])

      const contrast = results.violations.find((v) => v.id === 'color-contrast')
      const failingNodes = contrast?.nodes.length ?? 0
      const ceiling = contrastCeiling(info.project.name, screen.path)
      expect(
        failingNodes,
        `${screen.path} has ${failingNodes} colour-contrast failures in the ${info.project.name} project; ` +
          `the ratchet in project-control/BASELINE.json allows ${ceiling}. ` +
          'Lower the baseline when the count falls; never raise it.\n' +
          (contrast ? describe([contrast]) : ''),
      ).toBeLessThanOrEqual(ceiling)
      await ctx.close()
    })
  }
})
