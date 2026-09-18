/** The browser conventions `smoke.mjs` runs on.
 *
 *  They were inline in that script, and moved here when a second runner needed
 *  the same base URL and the same executable resolution. That second runner —
 *  the golden-path journeys — is gone: golden paths are measured from the
 *  Playwright suite in `e2e/` now, which resolves its own browser through
 *  `playwright.config.ts`. What is left here is what smoke uses, and the
 *  sign-in helper that only the journeys needed went with them.
 */
import fs from 'node:fs'
import { chromium } from 'playwright'

/** Where a preview server is expected. `npm run build && npx vite preview
 *  --port 4173` is what smoke is pointed at; `SMOKE_BASE` overrides. */
export const BASE = process.env.SMOKE_BASE ?? 'http://localhost:4173'

/** The sandbox ships Chromium at a known path and no download cache, so a bare
 *  `chromium.launch()` finds nothing there. `CHROMIUM_PATH` wins; the sandbox
 *  path is used only when it actually exists, so on a developer machine with a
 *  normal Playwright install this stays out of the way and the bundled browser
 *  is used exactly as before. */
const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium'
export const chromiumPath = () => {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH
  return fs.existsSync(SANDBOX_CHROMIUM) ? SANDBOX_CHROMIUM : undefined
}

export const launchBrowser = () => {
  const executablePath = chromiumPath()
  return chromium.launch({ ...(executablePath ? { executablePath } : {}) })
}

/** A browser context for the route audits, with the service worker blocked.
 *
 *  `smoke.mjs`, `mobile-audit.mjs` and `fidelity-audit.mjs` each drive several
 *  hundred routes through a *single* page, navigating one after another. Under
 *  `vite preview` the app registers its worker on the first load and — by
 *  design, so a first visit is offline-capable — claims that very page. From
 *  then on every navigation and every lazy route chunk in the run is mediated
 *  by a worker that is installing, activating and filling its cache while the
 *  audit walks the app.
 *
 *  That made these runs nondeterministic: one route out of the four hundred
 *  would fail on one CI run and pass on its duplicate, on the same commit,
 *  with the failing route different each time — a lazy chunk that did not
 *  import on `/sales-reports` once, a blank `/document-ocr` the next. A
 *  check that is red on a coin flip is one people learn to re-run rather than
 *  read, which is the failure this repository's tooling argues against
 *  everywhere else.
 *
 *  Blocking it loses no coverage. What the worker does is tested directly and
 *  in more detail than an audit could: `tests/service-worker.test.ts` runs the
 *  real `public/sw.js` through its routing rules, `tests/service-worker-
 *  registration.test.ts` covers where it registers and where it refuses to,
 *  `e2e/offline.spec.ts` exercises it in a real browser really offline, and
 *  `scripts/check-sw.mjs` verifies the generated precache against `dist/`.
 *  These three scripts are asking a different question — does every route
 *  render — and the worker only adds noise to the answer.
 *
 *  A caller that genuinely wants a worker should use `browser.newContext`
 *  directly; the block here is deliberate and wins over any option passed in. */
export const newContext = (browser, options = {}) =>
  browser.newContext({ ...options, serviceWorkers: 'block' })

/** Third-party hosts (the Google Fonts CDN the design system imports) are
 *  unreachable in sandboxed CI. Those failures say nothing about the app. */
export const isExternal = (text) =>
  /fonts\.googleapis|fonts\.gstatic|ERR_CERT_AUTHORITY_INVALID/.test(text)
