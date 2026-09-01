/** Runs the golden-path journeys and records what actually happened.
 *
 *  A golden path is an end-to-end user journey; there are 23 of them, named in
 *  `project-control/tracker/plan-structure.json`. Their status used to be
 *  `ov.gp` in the command deck — a checkbox in one person's browser
 *  localStorage. `0/23` was therefore not a measurement of anything: no change
 *  to the product could move it, and no change to it said anything about the
 *  product. This script replaces that with a run.
 *
 *  Every module in `scripts/journeys/` default-exports an array of journeys
 *  (see the README there — that contract is fixed). Each journey names one of
 *  the 23 paths, gets a fresh signed-in page, and either returns or throws.
 *  The result is written to `project-control/GOLDEN_PATHS.json`, which the
 *  registry and the deck read; neither of them is allowed to guess.
 *
 *  Three statuses and no fourth:
 *    PASSING    a journey exists for the path and it passed on this run
 *    FAILING    a journey exists and it failed — the product cannot do this
 *    UNWRITTEN  nobody has written a journey for this path yet
 *
 *  UNWRITTEN is not a failure. Twenty-three unwritten journeys is the honest
 *  starting state of the measurement, not a broken build, and exiting non-zero
 *  on it would only teach everyone to stop running this. A journey that FAILS
 *  does exit non-zero, and so does a journey that names a path the plan does
 *  not have — a typo that silently dropped a journey would put us straight
 *  back to a number that describes the tool rather than the product.
 *
 *      npm run build && npx vite preview --port 4173 &
 *      node scripts/golden-paths.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { BASE, isExternal, launchBrowser, signedInContext } from './lib/browser.mjs'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.resolve(APP, '..')
const CONTROL = path.join(REPO, 'project-control')
/** The journey modules. `GOLDEN_JOURNEYS` points the runner at a different
 *  directory — used to exercise the runner itself against fixture journeys,
 *  since a runner that has only ever seen an empty directory has not been
 *  shown to report PASSING or FAILING at all. */
const JOURNEYS = process.env.GOLDEN_JOURNEYS
  ? path.resolve(REPO, process.env.GOLDEN_JOURNEYS)
  : path.join(APP, 'scripts/journeys')
const OUT = path.join(CONTROL, 'GOLDEN_PATHS.json')

/** How long one journey may take before the run gives up on it. A hung page is
 *  a failure with a message, never a job that never returns. */
const JOURNEY_TIMEOUT_MS = Number(process.env.GOLDEN_TIMEOUT_MS ?? 90_000)

/** The 23 names, read from the plan rather than repeated here. */
const PLAN = JSON.parse(fs.readFileSync(path.join(CONTROL, 'tracker/plan-structure.json'), 'utf8'))
const CANONICAL = PLAN.goldenPaths
if (!Array.isArray(CANONICAL) || !CANONICAL.length) {
  throw new Error('golden-paths: plan-structure.json has no goldenPaths array')
}

// ── load the journey modules ────────────────────────────────────────────────

/** Loud, not silent. Anything that makes a journey unrunnable — a module that
 *  will not import, a journey missing its `run`, a path the plan does not
 *  name — lands here, is printed, and fails the run. The alternative is a
 *  journey that quietly does not exist, which reads as UNWRITTEN and is
 *  indistinguishable from nobody having written it. */
const errors = []

const journeys = []
const moduleFiles = fs.existsSync(JOURNEYS)
  ? fs.readdirSync(JOURNEYS).filter((n) => n.endsWith('.mjs')).sort()
  : []

for (const file of moduleFiles) {
  const rel = `${path.relative(REPO, JOURNEYS)}/${file}`
  let mod
  try {
    mod = await import(pathToFileURL(path.join(JOURNEYS, file)).href)
  } catch (err) {
    errors.push(`${rel}: will not import — ${err.message}`)
    continue
  }
  const exported = mod.default
  if (!Array.isArray(exported)) {
    errors.push(`${rel}: default export is ${exported === undefined ? 'missing' : typeof exported}, expected an array of journeys`)
    continue
  }
  exported.forEach((j, i) => {
    const where = `${rel}[${i}]`
    if (!j || typeof j !== 'object') { errors.push(`${where}: not an object`); return }
    if (typeof j.run !== 'function') { errors.push(`${where}: has no run() function`); return }
    if (typeof j.id !== 'string' || !j.id) { errors.push(`${where}: has no id`); return }
    if (typeof j.path !== 'string' || !j.path) { errors.push(`${where} (${j.id}): has no path`); return }
    if (!CANONICAL.includes(j.path)) {
      errors.push(`${where} (${j.id}): path ${JSON.stringify(j.path)} is not one of the ${CANONICAL.length} in plan-structure.json`)
      return
    }
    journeys.push({ ...j, role: j.role ?? 'owner', source: rel })
  })
}

/** Two journeys on one path is not an error — a path can be walked more than
 *  one way — but the path only reads PASSING when every one of them passed. */
const byPath = new Map(CANONICAL.map((p) => [p, []]))
for (const j of journeys) byPath.get(j.path).push(j)

// ── run them ────────────────────────────────────────────────────────────────

/** `ctx.expect` from the contract: throws with the message when the condition
 *  is falsy, and does nothing at all when it holds. */
const makeCtx = (role) => ({
  base: BASE,
  role,
  expect(condition, message) {
    if (!condition) throw new Error(message ?? 'expectation failed')
  },
})

const withTimeout = (promise, ms, label) => {
  let timer
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} did not finish within ${ms}ms`)), ms)
    }),
  ])
}

/** The preview server has to be up before a journey can walk anything. With no
 *  journeys written there is nothing to walk, so the run records 23 UNWRITTEN
 *  and never launches a browser — which is what makes this runnable today. */
async function serverIsUp() {
  try {
    const res = await fetch(BASE, { redirect: 'manual' })
    return res.status < 500
  } catch {
    return false
  }
}

const results = []
let browser = null

if (journeys.length) {
  if (!(await serverIsUp())) {
    console.error(
      `golden-paths: nothing is serving ${BASE}.\n` +
      '  Start one first:  npm run build && npx vite preview --port 4173 &\n' +
      '  (or point SMOKE_BASE at a running server)',
    )
    process.exit(2)
  }
  browser = await launchBrowser()
}

for (const name of CANONICAL) {
  const forPath = byPath.get(name)
  if (!forPath.length) {
    results.push({ path: name, id: null, status: 'UNWRITTEN', error: null })
    continue
  }

  const failures = []
  for (const journey of forPath) {
    /* A fresh context per journey, so one journey's navigation, storage or
     * signed-in role can never be the reason the next one passes. */
    const context = await signedInContext(browser, journey.role)
    const page = await context.newPage()
    const noise = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !isExternal(msg.text())) noise.push(`console: ${msg.text()}`)
    })
    page.on('pageerror', (err) => noise.push(`pageerror: ${err.message}`))

    const started = Date.now()
    try {
      await withTimeout(
        Promise.resolve(journey.run(page, makeCtx(journey.role))),
        JOURNEY_TIMEOUT_MS,
        journey.id,
      )
      console.log(`  ok    ${journey.id}  (${name}, ${Date.now() - started}ms)`)
    } catch (err) {
      /* Console and page errors are diagnostics, not verdicts: the contract
       * says a journey passes by returning, so they are reported beside a
       * failure rather than being allowed to invent one. */
      const detail = [err.message, ...[...new Set(noise)].slice(0, 5)].join(' · ')
      failures.push(`${journey.id}: ${detail}`)
      console.log(`  FAIL  ${journey.id}  (${name})\n        ${detail}`)
    } finally {
      await context.close()
    }
  }

  results.push({
    path: name,
    id: forPath.map((j) => j.id).join(', '),
    status: failures.length ? 'FAILING' : 'PASSING',
    error: failures.length ? failures.join('\n') : null,
  })
}

if (browser) await browser.close()

// ── record it ───────────────────────────────────────────────────────────────

const totals = {
  paths: CANONICAL.length,
  passing: results.filter((r) => r.status === 'PASSING').length,
  failing: results.filter((r) => r.status === 'FAILING').length,
  unwritten: results.filter((r) => r.status === 'UNWRITTEN').length,
  journeys: journeys.length,
  modules: moduleFiles.length,
  errors: errors.length,
}

fs.mkdirSync(CONTROL, { recursive: true })
fs.writeFileSync(OUT, JSON.stringify({
  generatedAt: new Date().toISOString(),
  generator: 'app/scripts/golden-paths.mjs',
  note: 'A run record, not a plan. PASSING means a journey walked the product and its assertions held on this run; '
      + 'FAILING means one ran and did not; UNWRITTEN means no journey exists for that path yet. '
      + 'Never hand-edit — re-run the runner.',
  base: BASE,
  totals,
  errors,
  paths: results,
}, null, 2) + '\n')

console.log(
  `\ngolden paths: ${totals.passing} passing · ${totals.failing} failing · ${totals.unwritten} unwritten ` +
  `(of ${totals.paths}) — ${totals.journeys} journey(s) in ${totals.modules} module(s)`,
)
console.log(`  wrote ${path.relative(REPO, OUT)}`)

if (errors.length) {
  console.error(`\nJOURNEY CONFIGURATION ERRORS (${errors.length}):`)
  for (const e of errors) console.error(`  ${e}`)
}
if (totals.failing) {
  console.error(`\nFAILING GOLDEN PATHS (${totals.failing}):`)
  for (const r of results.filter((x) => x.status === 'FAILING')) console.error(`  ${r.path}\n    ${r.error}`)
}
if (errors.length || totals.failing) process.exit(1)
