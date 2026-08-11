/** The design-token gate.
 *
 *  The brand rules are not style preferences: green, red, yellow, purple, pink
 *  and teal carry meaning in this product's palette and must not appear. Blue is
 *  success/active/progress; orange is warning and critical CTAs.
 *
 *  Three findings, in descending severity:
 *    forbidden  a colour in a banned hue band — a brand violation
 *    drift      a hex literal that is not in the token set at all
 *    inline     a hex literal that *is* a token value, hardcoded instead of
 *               referenced. Harmless today, but it is how a theme change starts
 *               missing places.
 *
 *  Ratchets against `project-control/BASELINE.json` like check-no-fake, so it is
 *  useful before the codebase is clean rather than only after.
 *
 *      node scripts/check-tokens.mjs [--strict] [--update-baseline]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.resolve(APP, '..')
const BASELINE = path.join(REPO, 'project-control', 'BASELINE.json')
const strict = process.argv.includes('--strict')
const updating = process.argv.includes('--update-baseline')

/** The canonical palette, read from the design system's own token files rather
 *  than restated here — restating it is how the guard and the product drift. */
const TOKENS = new Set()
const tokensDir = path.join(APP, 'src/styles/tokens')
for (const f of fs.readdirSync(tokensDir)) {
  const css = fs.readFileSync(path.join(tokensDir, f), 'utf8')
  for (const m of css.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) TOKENS.add(m[0].toUpperCase())
}

function hexToHsl(hex) {
  let h = hex.slice(1)
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  const l = (max + min) / 2
  if (!d) return { h: 0, s: 0, l }
  const s = d / (1 - Math.abs(2 * l - 1))
  let hue
  if (max === r) hue = ((g - b) / d) % 6
  else if (max === g) hue = (b - r) / d + 2
  else hue = (r - g) / d + 4
  hue = Math.round(hue * 60)
  return { h: hue < 0 ? hue + 360 : hue, s, l }
}

/** Hue bands the brand forbids. Greys and near-blacks are exempt — a desaturated
 *  colour has no hue to speak of, and every neutral would otherwise be flagged. */
const BANDS = [
  { name: 'red',    test: (h) => h < 15 || h >= 345 },
  { name: 'orange', test: (h) => h >= 15 && h < 45, allowed: true }, // warnings — permitted
  { name: 'yellow', test: (h) => h >= 45 && h < 70 },
  { name: 'green',  test: (h) => h >= 70 && h < 160 },
  { name: 'teal',   test: (h) => h >= 160 && h < 190 },
  { name: 'blue',   test: (h) => h >= 190 && h < 260, allowed: true }, // the brand hue
  { name: 'purple', test: (h) => h >= 260 && h < 300 },
  { name: 'pink',   test: (h) => h >= 300 && h < 345 },
]
const NEUTRAL = ({ s, l }) => s < 0.18 || l < 0.08 || l > 0.94

const SKIP = ['src/data/generated', 'src/styles/tokens', 'node_modules', 'dist']
function files(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, f.name)
    const rel = path.relative(APP, abs).replace(/\\/g, '/')
    if (SKIP.some((s) => rel.startsWith(s))) continue
    if (f.isDirectory()) files(abs, out)
    else if (/\.(tsx?|css)$/.test(f.name)) out.push(abs)
  }
  return out
}

const forbidden = [], drift = [], inline = []
for (const abs of files(path.join(APP, 'src'))) {
  const rel = path.relative(APP, abs).replace(/\\/g, '/')
  fs.readFileSync(abs, 'utf8').split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) {
      const hex = m[0].toUpperCase()
      const where = { file: rel, line: i + 1, hex, text: line.trim().slice(0, 90) }
      const hsl = hexToHsl(hex)
      const band = BANDS.find((b) => b.test(hsl.h))
      if (!NEUTRAL(hsl) && band && !band.allowed) forbidden.push({ ...where, band: band.name })
      else if (!TOKENS.has(hex)) drift.push(where)
      else inline.push(where)
    }
  })
}

const current = { forbiddenColours: forbidden.length, colourDrift: drift.length, inlineTokens: inline.length }

if (updating) {
  const prev = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : {}
  fs.writeFileSync(BASELINE, JSON.stringify({
    ...prev,
    note: prev.note ?? 'Ratchet for the release gates. These numbers may fall, never rise.',
    updatedAt: new Date().toISOString().slice(0, 10),
    ...current,
  }, null, 2) + '\n')
  console.log(`check-tokens: baseline set — ${forbidden.length} forbidden, ${drift.length} drift, ${inline.length} inline`)
  process.exit(0)
}

const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : current
const limit = strict
  ? { forbiddenColours: 0, colourDrift: 0, inlineTokens: 0 }
  : { forbiddenColours: baseline.forbiddenColours ?? current.forbiddenColours,
      colourDrift: baseline.colourDrift ?? current.colourDrift,
      inlineTokens: baseline.inlineTokens ?? current.inlineTokens }

if (forbidden.length) {
  console.log(`\nforbidden hues (${forbidden.length}) — the brand permits blue and orange only:`)
  for (const f of forbidden.slice(0, 20)) console.log(`  ${f.file}:${f.line}  ${f.hex} (${f.band})  ${f.text}`)
}
if (drift.length) {
  console.log(`\ncolours outside the token set (${drift.length}):`)
  const byHex = drift.reduce((a, d) => ((a[d.hex] ??= []).push(`${d.file}:${d.line}`), a), {})
  for (const [hex, at] of Object.entries(byHex).slice(0, 20)) console.log(`  ${hex}  ${at.slice(0, 3).join(', ')}${at.length > 3 ? ` +${at.length - 3}` : ''}`)
}

const problems = Object.entries(current).filter(([k, v]) => v > limit[k])
if (problems.length) {
  console.error('\ncheck-tokens FAILED')
  for (const [k, v] of problems) console.error(`  ${k} rose to ${v} (limit ${limit[k]})`)
  process.exit(1)
}
console.log(
  `check-tokens OK — ${current.forbiddenColours} forbidden, ${current.colourDrift} drift, ` +
  `${current.inlineTokens} inline token literals${strict ? ' [strict]' : ''}`
)
