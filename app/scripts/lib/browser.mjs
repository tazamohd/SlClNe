/** The browser conventions the Playwright scripts share.
 *
 *  `smoke.mjs` owned all of this inline. `golden-paths.mjs` needs the same
 *  base URL, the same executable resolution and the same sign-in, and a second
 *  copy of them would be a second thing to keep in step — the two runs would
 *  drift the first time one of them was pointed at a different port. So the
 *  conventions moved here and both scripts read them; nothing about the
 *  behaviour changed in the move.
 */
import fs from 'node:fs'
import { chromium } from 'playwright'

/** Where a preview server is expected. `npm run build && npx vite preview
 *  --port 4173` is what both runners are pointed at; `SMOKE_BASE` overrides. */
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

/** A context signed in as `role`.
 *
 *  Authentication in the app is the `salis-role` key in localStorage, read as
 *  the page boots, so the seed has to be an init script rather than a click
 *  through a login form — a `page.goto` before it would race the router's
 *  guard and land on `/login`. Every guarded route needs one. */
export const signedInContext = async (browser, role = 'owner', options = {}) => {
  const context = await browser.newContext(options)
  await context.addInitScript((r) => window.localStorage.setItem('salis-role', r), role)
  return context
}

/** Third-party hosts (the Google Fonts CDN the design system imports) are
 *  unreachable in sandboxed CI. Those failures say nothing about the app. */
export const isExternal = (text) =>
  /fonts\.googleapis|fonts\.gstatic|ERR_CERT_AUTHORITY_INVALID/.test(text)
