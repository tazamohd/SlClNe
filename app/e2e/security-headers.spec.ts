import { test, expect, type Page } from '@playwright/test'
import { seedRole, gotoReady } from './helpers'
import { SECURITY_HEADERS } from '../security-headers.mjs'

/** The delivered application's security headers, exercised rather than asserted.
 *
 *  The API had a Content-Security-Policy for months that was never sent — the
 *  certification recorded it as configured, the test that would have caught it
 *  could not run, and the claim outlived the thing that justified it. The
 *  browser-facing half was worse: nginx, Vercel and Netlify each served the SPA
 *  with no security headers at all, which nobody had claimed either way.
 *
 *  `vite.config.ts` applies the production set to `preview`, and this suite runs
 *  against `preview` — so these specs check the real policy on the real build.
 *  The second half matters more than the first: a CSP strict enough to be worth
 *  having is strict enough to break an application, and the failure mode is a
 *  blank screen in production and nowhere else. Loading real routes and failing
 *  on any violation is what makes tightening a directive safe.
 */

/** Collects CSP violations and console errors for the life of a page. */
function watchForViolations(page: Page): string[] {
  const found: string[] = []
  page.on('console', (msg) => {
    const text = msg.text()
    if (/Content Security Policy|Refused to (load|execute|apply|connect)/i.test(text)) {
      found.push(text)
    }
  })
  page.on('pageerror', (err) => found.push(`pageerror: ${err.message}`))
  return found
}

test.describe('security headers on the delivered app', () => {
  test('every declared header reaches the browser, verbatim', async ({ page }) => {
    const response = await page.goto('/')
    expect(response, 'the preview server should answer /').not.toBeNull()

    const served = response!.headers()
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      expect(served[name.toLowerCase()], `${name} is missing or altered`).toBe(value)
    }
  })

  test('the policy denies the three things it exists to deny', async ({ page }) => {
    const response = await page.goto('/')
    const csp = response!.headers()['content-security-policy'] ?? ''

    // Inline script is the one that stops an injected <script>. If a future
    // change adds 'unsafe-inline' here, the policy is decorative.
    expect(csp, "script-src must not permit inline script").toContain("script-src 'self'")
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/)
    expect(csp).not.toMatch(/script-src[^;]*unsafe-eval/)
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
  })

  test('static assets keep the headers rather than losing them to a cache rule', async ({ page }) => {
    // nginx resets inherited add_header directives inside a nested location, so
    // the asset block repeats the set. Vite preview has no such trap, but this
    // asserts the property the nginx config exists to preserve, on the same
    // files: a script served without a CSP is a script served without a CSP.
    const response = await page.goto('/')
    const scriptSrc = await page.locator('script[src]').first().getAttribute('src')
    expect(scriptSrc, 'the built page should load an external module script').toBeTruthy()

    const asset = await page.request.get(scriptSrc!)
    expect(asset.status()).toBe(200)
    expect(asset.headers()['content-security-policy']).toBe(
      SECURITY_HEADERS['Content-Security-Policy'],
    )
    expect(asset.headers()['x-content-type-options']).toBe('nosniff')
  })

  test('the app boots under the policy with no violation', async ({ page }) => {
    const violations = watchForViolations(page)
    await gotoReady(page, '/')
    await expect(page.locator('#root')).not.toBeEmpty()
    expect(violations, violations.join('\n')).toEqual([])
  })

  test('real screens render under the policy with no violation', async ({ browser }) => {
    // One per layout family, so a directive that breaks charts, tables, icons or
    // the marketing site fails here rather than in production.
    const routes = [
      '/dashboard',
      '/job-cards',
      '/invoice-create',
      '/inventory',
      '/public-portal/landing',
      '/login',
    ]

    const context = await browser.newContext()
    await seedRole(context, 'owner')
    const page = await context.newPage()
    const violations = watchForViolations(page)

    for (const route of routes) {
      await gotoReady(page, route)
      await expect(page.locator('#root')).not.toBeEmpty()
    }

    expect(violations, violations.join('\n')).toEqual([])
    await context.close()
  })

  test('Arabic renders under the policy — the font and dictionary both load', async ({ browser }) => {
    // The Arabic dictionary is a lazy chunk and the fonts are self-hosted, so
    // this exercises font-src and the dynamic import together. A CSP that
    // blocked either would leave the app in English and look like an i18n bug.
    const context = await browser.newContext()
    await seedRole(context, 'owner')
    const page = await context.newPage()
    const violations = watchForViolations(page)

    await gotoReady(page, '/language-selection')
    await page.getByRole('button', { name: /Arabic|العربية/ }).click()
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('body')).toContainText('اختر لغتك')

    expect(violations, violations.join('\n')).toEqual([])
    await context.close()
  })
})
