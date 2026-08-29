/** The no-placeholder gate.
 *
 *  Two jobs. First, the registry check: no PRODUCT capability may render
 *  `PendingScreen`. Second, the source scan: no fake completion markers in
 *  hand-written code.
 *
 *  Today 248 product routes are placeholders, so a hard zero-gate would fail on
 *  every run and be switched off within a day — which is how gates die. Instead
 *  this ratchets: the counts recorded in `project-control/BASELINE.json` may
 *  fall, never rise. Certification runs it with `--strict`, where the only
 *  acceptable number is zero.
 *
 *      node scripts/check-no-fake.mjs                  # ratchet (CI default)
 *      node scripts/check-no-fake.mjs --strict         # release gate
 *      node scripts/check-no-fake.mjs --update-baseline
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.resolve(APP, '..')
const BASELINE = path.join(REPO, 'project-control', 'BASELINE.json')
const REGISTRY = path.join(REPO, 'project-control', 'MASTER_REGISTRY.json')

const strict = process.argv.includes('--strict')
const updating = process.argv.includes('--update-baseline')

/** Markers that claim work is finished when it is not. `placeholder=` is absent
 *  deliberately — it is the legitimate HTML attribute for an input hint, and
 *  banning it would train people to ignore this gate. */
const MARKERS = [
  { id: 'todo', re: /\b(TODO|FIXME)\b/, what: 'unfinished-work marker' },
  { id: 'coming-soon', re: /coming soon/i, what: '"coming soon"' },
  { id: 'not-implemented', re: /not implemented/i, what: '"not implemented"' },
  { id: 'empty-handler', re: /on[A-Z]\w+=\{\(\s*\)\s*=>\s*\{\s*\}\}/, what: 'empty event handler (dead CTA)' },
  { id: 'console', re: /console\.log\(/, what: 'console.log' },
  { id: 'fake-success', re: /\/\/\s*(fake|pretend|simulate)\b/i, what: 'admitted fake behaviour' },
]

/** Generated data is not hand-written code: an Arabic string containing
 *  "+966 5X XXX XXXX" is a phone hint, not an unfinished marker. `PendingScreen`
 *  is legitimate in its own component and in the router that still needs it. */
const SKIP_DIRS = ['src/data/generated', 'node_modules', 'dist']
const PENDING_ALLOWED = ['src/screens/PendingScreen.tsx', 'src/routes/index.tsx']

function sourceFiles(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, f.name)
    const rel = path.relative(APP, abs).replace(/\\/g, '/')
    if (SKIP_DIRS.some((s) => rel.startsWith(s))) continue
    if (f.isDirectory()) sourceFiles(abs, out)
    else if (/\.(tsx?|mjs)$/.test(f.name)) out.push(abs)
  }
  return out
}

const findings = []
for (const abs of sourceFiles(path.join(APP, 'src'))) {
  const rel = path.relative(APP, abs).replace(/\\/g, '/')
  const lines = fs.readFileSync(abs, 'utf8').split('\n')
  lines.forEach((line, i) => {
    for (const m of MARKERS) {
      if (m.re.test(line)) findings.push({ file: rel, line: i + 1, marker: m.id, what: m.what, text: line.trim().slice(0, 100) })
    }
    if (/\bPendingScreen\b/.test(line) && !PENDING_ALLOWED.includes(rel)) {
      findings.push({ file: rel, line: i + 1, marker: 'pending-screen', what: 'PendingScreen outside the router', text: line.trim().slice(0, 100) })
    }
  })
}

let placeholderRoutes = 0
let placeholderList = []
if (fs.existsSync(REGISTRY)) {
  const reg = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'))
  placeholderList = reg.entries.filter((e) => e.category === 'PRODUCT' && e.flags.includes('PLACEHOLDER'))
  placeholderRoutes = placeholderList.length
} else {
  console.error('check-no-fake: no MASTER_REGISTRY.json — run scripts/build-registry.mjs first')
  process.exit(2)
}

const current = { placeholderRoutes, sourceMarkers: findings.length }

if (updating) {
  fs.writeFileSync(BASELINE, JSON.stringify({
    note: 'Ratchet for check-no-fake. These numbers may fall, never rise. ' +
          'Update only when lowering them, and never to accommodate a regression.',
    updatedAt: new Date().toISOString().slice(0, 10),
    ...current,
  }, null, 2) + '\n')
  console.log(`check-no-fake: baseline set — ${placeholderRoutes} placeholder routes, ${findings.length} source markers`)
  process.exit(0)
}

const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : current
const limit = strict ? { placeholderRoutes: 0, sourceMarkers: 0 } : baseline

const problems = []
if (current.placeholderRoutes > limit.placeholderRoutes) {
  problems.push(`placeholder routes rose to ${current.placeholderRoutes} (limit ${limit.placeholderRoutes})`)
}
if (current.sourceMarkers > limit.sourceMarkers) {
  problems.push(`source markers rose to ${current.sourceMarkers} (limit ${limit.sourceMarkers})`)
}

if (findings.length) {
  console.log(`\nsource markers (${findings.length}):`)
  for (const f of findings.slice(0, 25)) console.log(`  ${f.file}:${f.line}  ${f.what} — ${f.text}`)
  if (findings.length > 25) console.log(`  … ${findings.length - 25} more`)
}

if (problems.length) {
  console.error('\ncheck-no-fake FAILED')
  for (const p of problems) console.error(`  ${p}`)
  if (strict && placeholderRoutes) {
    console.error(`\n  first 10 placeholder routes:`)
    for (const e of placeholderList.slice(0, 10)) console.error(`    ${e.route}  (${e.title})`)
  }
  process.exit(1)
}

const moved = baseline.placeholderRoutes - current.placeholderRoutes
console.log(
  `check-no-fake OK — ${current.placeholderRoutes} placeholder routes` +
  (moved > 0 ? ` (${moved} fewer than baseline; run --update-baseline to lock it in)` : '') +
  `, ${current.sourceMarkers} source markers` + (strict ? ' [strict]' : '')
)
