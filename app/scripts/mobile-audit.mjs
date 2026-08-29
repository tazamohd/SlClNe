#!/usr/bin/env node
/**
 * Loads every route at 390×844 — the narrowest phone the design targets — and
 * reports two things the smoke suite can't see from one sample route:
 *
 *   1. the page scrolling sideways (document wider than the viewport), and
 *   2. which element is responsible, so the finding is actionable.
 *
 * A sideways-scrolling phone layout is the failure mode the design bundle warns
 * about most, and it's invisible at desktop width — nothing else in the harness
 * would catch it.
 *
 *   npx vite preview --port 4173 &
 *   node scripts/mobile-audit.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const HERE = resolve(fileURLToPath(new URL('.', import.meta.url)))
const BASE = process.env.SMOKE_BASE ?? 'http://localhost:4173'
const WIDTH = Number(process.env.MOBILE_WIDTH ?? 390)
const HEIGHT = Number(process.env.MOBILE_HEIGHT ?? 844)

/** Routes come from the generated screen data, so this can't drift from what
 *  the router actually mounts. */
function routesFrom(file) {
  const text = readFileSync(resolve(HERE, '../src/data/generated', file), 'utf8')
  return [...text.matchAll(/"route":\s*"([^"]+)"/g)].map(([, route]) => route)
}

const ROUTES = [...new Set([...routesFrom('screens.ts'), ...routesFrom('spec-screens.ts')])]
  .filter((route) => !route.includes(':'))
  .sort()

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
})

const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } })
await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))

const findings = []
let checked = 0

let done = 0
const total = ROUTES.length
for (const route of ROUTES) {
  const page = await context.newPage()
  try {
    await page.goto(BASE + route, { waitUntil: 'load', timeout: 20_000 })
    const result = await page.evaluate((viewport) => {
      const doc = document.documentElement
      // 1px of slack: sub-pixel layout rounding is not a horizontal scrollbar.
      const overflow = doc.scrollWidth - doc.clientWidth
      if (overflow <= 1) return null
      // Name the widest offender rather than just reporting "something is wide".
      let worst = null
      for (const el of document.querySelectorAll('body *')) {
        const box = el.getBoundingClientRect()
        const past = Math.round(box.right - viewport)
        if (past > 1 && (!worst || past > worst.past)) {
          worst = {
            past,
            tag: el.tagName.toLowerCase(),
            cls: (typeof el.className === 'string' ? el.className : '').slice(0, 90),
          }
        }
      }
      return { overflow, worst }
    }, WIDTH)
    if (result) findings.push({ route, ...result })
    checked += 1
  } catch (error) {
    findings.push({ route, error: String(error).split('\n')[0] })
  } finally {
    await page.close()
    done += 1
    if (done % 25 === 0 || done === total) process.stdout.write(`  ${done}/${total}\n`)
  }
}

await context.close()
await browser.close()

console.log(`mobile-audit: ${checked}/${ROUTES.length} routes loaded at ${WIDTH}×${HEIGHT}`)

if (findings.length === 0) {
  console.log('mobile-audit: no horizontal overflow on any route')
  process.exit(0)
}

for (const f of findings) {
  if (f.error) {
    console.error(`${f.route}  did not load: ${f.error}`)
    continue
  }
  const who = f.worst ? `${f.worst.tag}.${f.worst.cls} extends ${f.worst.past}px past the viewport` : 'offender not isolated'
  console.error(`${f.route}  scrolls ${f.overflow}px sideways — ${who}`)
}
console.error(`\nmobile-audit: ${findings.length} route(s) with problems.`)
process.exit(1)
