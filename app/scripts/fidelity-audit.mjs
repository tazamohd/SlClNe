/**
 * Design-fidelity report: compares the literal copy in each original
 * `.dc.html` against what the rebuilt route actually renders, and lists the
 * phrases that went missing.
 *
 * SCOPE, stated up front. The design files are templates — most of their text
 * is `{{ }}` bindings resolved by the bundle's own runtime, which needs a CDN
 * this environment can't reach. So this compares only the copy the design
 * hard-codes in HTML: 946 phrases across 191 screens, and 91 screens have none
 * at all. It will not tell you a screen is faithful. It will tell you when a
 * heading or label the design spelled out literally never made it across.
 *
 * A REPORT, not a gate. The rebuild diverges from the design on purpose in
 * places — fixture data instead of hardcoded numbers, derived totals, sections
 * behind interaction. Read the misses before believing them.
 *
 *   npx vite preview --port 4173 &
 *   node scripts/fidelity-audit.mjs [--min 0.7] [--screen Dashboard]
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const HERE = resolve(fileURLToPath(new URL('.', import.meta.url)))
const DESIGN = resolve(HERE, '../../project')
const BASE = process.env.SMOKE_BASE ?? 'http://localhost:4173'

const argv = process.argv.slice(2)
const argOf = (flag) => { const i = argv.indexOf(flag); return i === -1 ? null : argv[i + 1] }
const MIN = Number(argOf('--min') ?? 0.7)
const ONLY = argOf('--screen')

const screensSource = readFileSync(resolve(HERE, '../src/data/generated/screens.ts'), 'utf8')
const SCREENS = [...screensSource.matchAll(/"name":\s*"([^"]+)",\s*\n\s*"route":\s*"([^"]+)"/g)]
  .map(([, name, route]) => ({ name, route }))
  .filter((s) => !s.route.includes(':') && (!ONLY || s.name === ONLY))

/** Visible phrases from a design file, with the parts that are *meant* to
 *  differ filtered out. */
function designPhrases(html) {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
  const text = stripped
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  const phrases = new Set()
  for (const raw of text.split('\n')) {
    const phrase = raw.replace(/\s+/g, ' ').trim()
    if (phrase.length < 4) continue
    // Latin letters only: Arabic copy is translated, not copied, so a miss
    // there says nothing. Numbers are fixture data and differ by design.
    if (!/[A-Za-z]/.test(phrase)) continue
    // `{{ x }}` is a design-runtime binding, not copy. Resolving it needs the
    // bundle's own runtime (and a CDN this environment can't reach), so bound
    // text is out of scope — only literal copy is compared.
    if (phrase.includes('{{')) continue
    if (/^[\d\s.,:/%+-]+$/.test(phrase)) continue
    if (/^(SAR|VAT)?\s*[\d.,]+$/.test(phrase)) continue
    phrases.add(phrase)
  }
  return [...phrases]
}

const norm = (s) => s.replace(/\s+/g, ' ').toLowerCase()

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
})
const context = await browser.newContext()
await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))

const reports = []
let noDesign = 0
let noLiteralCopy = 0

for (const screen of SCREENS) {
  const file = resolve(DESIGN, `${screen.name}.dc.html`)
  if (!existsSync(file)) { noDesign += 1; continue }
  const phrases = designPhrases(readFileSync(file, 'utf8'))
  // Nothing literal to compare — the screen's copy is entirely bound.
  if (phrases.length === 0) { noLiteralCopy += 1; continue }

  const page = await context.newPage()
  let rendered = ''
  try {
    await page.goto(BASE + screen.route, { waitUntil: 'networkidle', timeout: 20_000 })
    rendered = norm(await page.locator('body').innerText())
  } catch (error) {
    reports.push({ ...screen, error: String(error).split('\n')[0] })
    await page.close()
    continue
  }
  await page.close()

  const missing = phrases.filter((p) => !rendered.includes(norm(p)))
  reports.push({ ...screen, total: phrases.length, missing })
}

await context.close()
await browser.close()

const scored = reports.filter((r) => !r.error)
const low = scored
  .map((r) => ({ ...r, coverage: (r.total - r.missing.length) / r.total }))
  .filter((r) => r.coverage < MIN)
  .sort((a, b) => a.coverage - b.coverage)

const overall = scored.reduce((sum, r) => sum + (r.total - r.missing.length), 0)
const totalPhrases = scored.reduce((sum, r) => sum + r.total, 0)

console.log(`fidelity: ${scored.length} screens compared, ${noLiteralCopy} with only bound copy, ${noDesign} without a design file`)
if (totalPhrases > 0) {
  console.log(`fidelity: ${overall}/${totalPhrases} literal design phrases render (${Math.round((overall / totalPhrases) * 100)}%)`)
}
console.log(`fidelity: ${low.length} screens below ${Math.round(MIN * 100)}%\n`)

for (const r of reports.filter((x) => x.error)) console.log(`  !! ${r.name} ${r.route} — ${r.error}`)

for (const r of low) {
  console.log(`${Math.round(r.coverage * 100).toString().padStart(3)}%  ${r.name}  ${r.route}  (${r.missing.length}/${r.total} missing)`)
  for (const phrase of r.missing.slice(0, 12)) console.log(`         · ${phrase.slice(0, 96)}`)
  if (r.missing.length > 12) console.log(`         · … ${r.missing.length - 12} more`)
}
