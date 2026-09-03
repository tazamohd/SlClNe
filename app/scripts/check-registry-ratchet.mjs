/** The registry ratchet.
 *
 *  `build-registry.mjs` measures the inventory — how many screens still read
 *  fixtures, how many have no loading, empty, error or success state, how many
 *  are not certified in Arabic. Those numbers only mean something if they can
 *  only fall. This gate reads the counts the generator just wrote and compares
 *  them with `project-control/REGISTRY_BASELINE.json`: a count above its
 *  baseline fails the build; a count below it is written back with
 *  `--update-baseline`, the way `check-tokens` and `check-no-fake` ratchet.
 *
 *  `tabletMissing` is held rather than driven: the tablet tier is out of scope
 *  for now, and the gate exists to stop a refactor from quietly raising it —
 *  e.g. by moving a `md:` class into a `cn()` call the detector cannot read.
 *
 *      node scripts/check-registry-ratchet.mjs [--update-baseline]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CONTROL = path.resolve(APP, '..', 'project-control')
const BASELINE = path.join(CONTROL, 'REGISTRY_BASELINE.json')
const updating = process.argv.includes('--update-baseline')

const registry = JSON.parse(fs.readFileSync(path.join(CONTROL, 'MASTER_REGISTRY.json'), 'utf8'))
const entries = Array.isArray(registry) ? registry : registry.entries ?? registry.capabilities ?? []
const flag = (name) => entries.filter((e) => Array.isArray(e.flags) && e.flags.includes(name)).length

/** Counts that may fall, never rise. */
const current = {
  mockOnly: flag('MOCK_ONLY'),
  loadingMissing: flag('LOADING_MISSING'),
  emptyMissing: flag('EMPTY_MISSING'),
  errorMissing: flag('ERROR_MISSING'),
  successMissing: flag('SUCCESS_MISSING'),
  arabicMissing: flag('ARABIC_MISSING'),
  tabletMissing: flag('TABLET_MISSING'),
  rtlBroken: flag('RTL_BROKEN'),
  placeholder: flag('PLACEHOLDER'),
  noContentAssertion: flag('NO_CONTENT_ASSERTION'),
}

let baseline = null
if (fs.existsSync(BASELINE)) baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'))

const rows = Object.entries(current).map(([key, value]) => {
  const limit = baseline?.[key]
  const status = limit === undefined ? 'new' : value > limit ? 'RISE' : value < limit ? 'fell' : 'held'
  return { key, value, limit, status }
})

console.log('registry ratchet — counts that may fall, never rise\n')
for (const row of rows) {
  const mark = row.status === 'RISE' ? '✗' : row.status === 'fell' ? '↓' : '·'
  console.log(`  ${mark} ${row.key.padEnd(20)} ${String(row.value).padStart(4)}   baseline ${row.limit ?? '—'}`)
}

const regressions = rows.filter((r) => r.status === 'RISE')
const improvements = rows.filter((r) => r.status === 'fell' || r.status === 'new')

if (updating) {
  const next = { ...(baseline ?? {}), ...current, updatedAt: new Date().toISOString().slice(0, 10) }
  fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n')
  console.log(`\nregistry ratchet: baseline written to ${path.relative(APP, BASELINE)}`)
  process.exit(0)
}

if (!baseline) {
  console.log('\nNo baseline yet — run with --update-baseline to record the current counts.')
  process.exit(0)
}

if (regressions.length) {
  console.error(`\nregistry ratchet failed: ${regressions.map((r) => `${r.key} ${r.limit} → ${r.value}`).join(', ')}`)
  console.error('A count rose. Fix the screens, or if the rise is a deliberate re-measurement, say so in the PR and rerun with --update-baseline.')
  process.exit(1)
}
if (improvements.length) {
  console.log(`\n${improvements.length} count(s) fell below baseline — run with --update-baseline to lock the gain in.`)
}
console.log('\nregistry ratchet OK')
