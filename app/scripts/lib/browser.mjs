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

/** Third-party hosts (the Google Fonts CDN the design system imports) are
 *  unreachable in sandboxed CI. Those failures say nothing about the app. */
export const isExternal = (text) =>
  /fonts\.googleapis|fonts\.gstatic|ERR_CERT_AUTHORITY_INVALID/.test(text)
