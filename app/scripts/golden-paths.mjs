/** Classifies the 23 golden paths from what the Playwright suite actually did.
 *
 *  A golden path is an end-to-end user journey; there are 23 of them, named in
 *  `project-control/tracker/plan-structure.json`. Their status used to be
 *  `ov.gp` in the command deck — a checkbox in one person's browser
 *  localStorage. `0/23` was therefore not a measurement of anything: no change
 *  to the product could move it, and no change to it said anything about the
 *  product. This script replaces that with a run.
 *
 *  The run is `app/e2e/` — the Playwright suite. A spec declares which path it
 *  covers in its `describe` title:
 *
 *      test.describe('Kiosk (Golden Path 23)', () => { … })
 *
 *  and this reads the suite's own report to say what happened to it. There is
 *  no second set of journey modules any more: two implementations of the same
 *  measurement is one implementation too many, and the specs are the ones that
 *  run in CI.
 *
 *  ── Which tests count towards a path ──────────────────────────────────────
 *
 *  Every test in the spec file that declares it, not only the tests inside the
 *  declaring `describe`. These files pair the declaring block with a "…
 *  lifecycle" block that walks the same path end to end, and counting only the
 *  first would let the lifecycle test fail while the path read PASSING. For
 *  the same reason one file may declare only one path.
 *
 *  ── Why it runs the suite rather than reading a report someone left ────────
 *
 *  Nothing in this repo produces a Playwright report file: `playwright.config.ts`
 *  reports with `list`, straight to a terminal. So there is no artifact to
 *  consume, and inventing one would mean a second, silent source of truth —
 *  a file on disk from an unknown build, on an unknown day, recorded here as
 *  today's measurement. This runs the suite itself with `--reporter=json`
 *  (into a temp file, so the report is never confused with the run's console
 *  output) and classifies what comes back. `GOLDEN_PLAYWRIGHT_JSON=<file>`
 *  consumes a report that a run *in this same job* already produced — the CI
 *  case where the suite has run once already and running it twice buys
 *  nothing. The record says which of the two happened.
 *
 *  ── The three statuses, and no fourth ─────────────────────────────────────
 *
 *    PASSING    a spec declares this path and every one of its tests passed,
 *               in every project the suite ran it in
 *    FAILING    a spec declares this path and something failed
 *    UNWRITTEN  no spec declares this path
 *
 *  UNWRITTEN is not a failure. It is "nobody has written this yet", which is a
 *  different fact from "we checked and it does not work", and exiting non-zero
 *  on it would only teach everyone to stop running this. All 23 are declared
 *  today, so nothing reads UNWRITTEN — but a 24th path added to the plan
 *  tomorrow reads UNWRITTEN the moment it is added, and that is the point.
 *
 *  A path that FAILS exits non-zero. So does a spec whose claim about itself
 *  does not hold up (§ "the claim is checked"), because a mislabelled spec
 *  reports one path's result under another path's name, and a number that
 *  describes the tool rather than the product is the defect this measurement
 *  exists to remove.
 *
 *      npm run golden
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.resolve(APP, '..')
const CONTROL = path.join(REPO, 'project-control')
const OUT = path.join(CONTROL, 'GOLDEN_PATHS.json')

/** The 23 names, read from the plan rather than repeated here. Position in the
 *  array is the path's number: `goldenPaths[0]` is Golden Path 1. */
const PLAN = JSON.parse(fs.readFileSync(path.join(CONTROL, 'tracker/plan-structure.json'), 'utf8'))
const CANONICAL = PLAN.goldenPaths
if (!Array.isArray(CANONICAL) || !CANONICAL.length) {
  throw new Error('golden-paths: plan-structure.json has no goldenPaths array')
}

/** The suite's own base URL, read from its config so the record cannot claim a
 *  port the suite does not use. */
const PORT = Number(
  (fs.readFileSync(path.join(APP, 'playwright.config.ts'), 'utf8').match(/const PORT\s*=\s*(\d+)/) ?? [])[1] ?? 4173,
)
const BASE = `http://localhost:${PORT}`

/** Loud, not silent. A spec that claims a path the plan does not have, two
 *  specs claiming one path, a spec file that will not compile: each of these
 *  makes a path's result wrong rather than missing, so they are printed and
 *  they fail the run. */
const errors = []

// ── get a report ────────────────────────────────────────────────────────────

/** Is something already serving the port the suite previews on?
 *
 *  `reuseExistingServer` is on outside CI, so a preview left running by other
 *  work is silently adopted — and the suite then measures whatever build that
 *  process is serving, which is not necessarily this one. Refusing is the
 *  honest move; `GOLDEN_REUSE_SERVER=1` is there for the case where the
 *  server on that port is deliberately the one under test. */
async function somethingIsServing() {
  try {
    const res = await fetch(BASE, { redirect: 'manual', signal: AbortSignal.timeout(2_000) })
    return res.status < 600
  } catch {
    return false
  }
}

const supplied = process.env.GOLDEN_PLAYWRIGHT_JSON
let reportFile
let source

if (supplied) {
  reportFile = path.resolve(REPO, supplied)
  const shown = path.relative(REPO, reportFile)
  source = `a Playwright report supplied by GOLDEN_PLAYWRIGHT_JSON (${shown.startsWith('..') ? reportFile : shown})`
  if (!fs.existsSync(reportFile)) {
    console.error(`golden-paths: GOLDEN_PLAYWRIGHT_JSON points at ${reportFile}, which does not exist.`)
    process.exit(2)
  }
} else {
  if ((await somethingIsServing()) && process.env.GOLDEN_REUSE_SERVER !== '1') {
    console.error(
      `golden-paths: something is already serving ${BASE}.\n` +
      '  The suite reuses an existing server there, so this run would measure whatever\n' +
      '  build that process is serving rather than this one. Stop it and re-run, or set\n' +
      '  GOLDEN_REUSE_SERVER=1 if that server is deliberately the build under test.',
    )
    process.exit(2)
  }

  reportFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'golden-paths-')), 'report.json')
  source = 'a run of the Playwright suite (npx playwright test --reporter=json)'

  const bin = path.join(APP, 'node_modules/.bin/playwright')
  const cli = fs.existsSync(bin) ? bin : 'npx'
  const args = fs.existsSync(bin) ? ['test', '--reporter=json'] : ['playwright', 'test', '--reporter=json']

  console.log(`golden-paths: running the Playwright suite (${cli} ${args.join(' ')})\n`)
  const run = spawnSync(cli, args, {
    cwd: APP,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: reportFile },
  })

  /* A non-zero exit is what a failing suite looks like and is not an error
   * here — the failures are the finding. A missing report is different: the
   * suite never got as far as reporting, and classifying 23 paths off nothing
   * would be inventing a result. */
  if (!fs.existsSync(reportFile)) {
    console.error(
      `\ngolden-paths: the Playwright suite produced no report (exit ${run.status ?? 'signal ' + run.signal}).\n` +
      '  Nothing was measured, so nothing is recorded. The suite output above says why.',
    )
    process.exit(2)
  }
}

let report
try {
  report = JSON.parse(fs.readFileSync(reportFile, 'utf8'))
} catch (err) {
  console.error(`golden-paths: the Playwright report at ${reportFile} could not be read — ${err.message}`)
  process.exit(2)
}

/* Errors the reporter itself carries — a spec file that will not compile, a
 * global-setup failure. Those specs contribute no tests, so their paths would
 * otherwise read UNWRITTEN: "nobody wrote one" for a spec that exists. */
for (const err of report.errors ?? []) {
  const where = err.location ? `${err.location.file}:${err.location.line}` : 'the suite'
  errors.push(`${where}: Playwright could not run this — ${(err.message ?? '').split('\n')[0]}`)
}

// ── read what the suite reported ────────────────────────────────────────────

/** Flatten the report into one entry per test (a spec × a project), carrying
 *  the describe titles above it so a path's declaration can be found. */
function flatten(suites, ancestry = [], file = null) {
  const out = []
  for (const suite of suites ?? []) {
    const here = suite.file && !file ? [] : [...ancestry, suite.title]
    const inFile = suite.file && !file ? suite.file : file
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        out.push({
          file: inFile ?? spec.file,
          describes: here,
          title: spec.title,
          line: spec.line,
          project: test.projectName || '(default)',
          status: test.status,
          error: (test.results ?? [])
            .map((r) => r.error?.message ?? r.errors?.[0]?.message ?? '')
            .find(Boolean) ?? '',
        })
      }
    }
    out.push(...flatten(suite.suites, here, inFile))
  }
  return out
}

/** Playwright reports a spec's file relative to `testDir`, so the bare
 *  `kiosk.spec.ts` is put back where a reader can open it. */
const TEST_DIR = path.relative(APP, report.config?.projects?.[0]?.testDir ?? path.join(APP, 'e2e'))
const spec = (file) => (file.includes('/') ? file : path.posix.join(TEST_DIR || '.', file))

const tests = flatten(report.suites).map((t) => ({ ...t, file: spec(t.file) }))
const specFiles = new Set(tests.map((t) => t.file))
const projects = [...new Set(tests.map((t) => t.project))].sort()

// ── the claim is checked, not believed ──────────────────────────────────────

/** `Kiosk (Golden Path 23)` — the number *and* the name. The number alone
 *  would let a spec titled `Kiosk (Golden Path 22)` file its result under
 *  "Call center", which is worse than no result at all: it is a green tick
 *  against a path nobody tested. */
const CLAIM = /^(.*?)\s*\(Golden Path\s+(\d+)\)\s*$/i

/** Case and spacing differ between a title and the plan ("Organization /
 *  Branch Setup" against "Organization / branch setup"); nothing else may. */
const normalize = (name) => String(name).toLowerCase().replace(/\s+/g, ' ').trim()

/** number → { file, title, name } for every spec that claims a path. */
const claims = new Map()

for (const test of tests) {
  for (const title of test.describes) {
    const claim = CLAIM.exec(title)
    if (!claim) continue
    const [, name, digits] = claim
    const number = Number(digits)
    const where = `${test.file}: "${title}"`

    if (!Number.isInteger(number) || number < 1 || number > CANONICAL.length) {
      const key = `range:${where}`
      if (!claims.has(key)) {
        claims.set(key, null)
        errors.push(
          `${where} claims Golden Path ${digits}, but the plan has ${CANONICAL.length} paths ` +
          `(1–${CANONICAL.length}) in project-control/tracker/plan-structure.json.`,
        )
      }
      continue
    }

    const canonical = CANONICAL[number - 1]
    if (normalize(name) !== normalize(canonical)) {
      const key = `name:${where}`
      if (!claims.has(key)) {
        claims.set(key, null)
        errors.push(
          `${where} claims Golden Path ${number}, which the plan names ${JSON.stringify(canonical)}, ` +
          `not ${JSON.stringify(name.trim())}. One of the two is wrong and the result would be filed ` +
          'under the wrong path either way.',
        )
      }
      continue
    }

    const held = claims.get(number)
    if (!held) {
      claims.set(number, { file: test.file, title, name: canonical })
    } else if (held.file !== test.file) {
      const key = `dup:${number}:${test.file}`
      if (!claims.has(key)) {
        claims.set(key, null)
        errors.push(
          `Golden Path ${number} (${canonical}) is claimed by two spec files — ${held.file} and ${test.file}. ` +
          'One path, one spec: otherwise which of them the recorded result belongs to is a coin toss.',
        )
      }
    }
  }
}

/* A file that claims two different paths cannot have its tests attributed to
 * either, because attribution is by file: every test in the declaring spec
 * counts towards the path it declares, so that a failing lifecycle test beside
 * the declaring describe cannot be quietly left out of the verdict. */
const byFile = new Map()
for (const [number, claim] of claims) {
  if (typeof number !== 'number' || !claim) continue
  const also = byFile.get(claim.file)
  if (also) {
    errors.push(
      `${claim.file} claims both Golden Path ${also} (${CANONICAL[also - 1]}) and Golden Path ${number} ` +
      `(${CANONICAL[number - 1]}). Every test in a declaring spec counts towards the path it declares, ` +
      'so a file that declares two of them makes both results wrong.',
    )
  } else {
    byFile.set(claim.file, number)
  }
}

// ── classify ────────────────────────────────────────────────────────────────

/** How a failure reads in the record: which project it failed in, which test,
 *  and the product's own words for why. A path that passes on desktop and
 *  fails on mobile is a failing path, and the record has to say which half. */
function describeFailure(test) {
  const why = String(test.error)
    .replace(/\u001b\[[0-9;]*m/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(' · ')
  const where = [...test.describes, test.title].join(' › ')
  const what =
    test.status === 'flaky'
      ? 'passed only on a retry (flaky)'
      : test.status === 'timedOut'
        ? 'timed out'
        : 'failed'
  return `[${test.project}] ${test.file}:${test.line} › ${where} — ${what}${why ? `: ${why}` : ''}`
}

const results = []

CANONICAL.forEach((name, index) => {
  const number = index + 1
  const claim = claims.get(number)
  if (!claim) {
    results.push({ path: name, id: null, status: 'UNWRITTEN', error: null })
    return
  }

  const mine = tests.filter((t) => t.file === claim.file)
  const ran = mine.filter((t) => t.status !== 'skipped')
  /* `expected` is Playwright's word for "the test did what it was supposed to";
   * everything else — unexpected, timedOut, flaky — is this path not passing. */
  const bad = ran.filter((t) => t.status !== 'expected')

  if (!ran.length) {
    results.push({
      path: name,
      id: claim.file,
      status: 'FAILING',
      error:
        `${claim.file} declares this path and every one of its ${mine.length} test(s) was skipped in ` +
        `${projects.join(' and ')} — nothing was measured, so nothing here is passing.`,
    })
    return
  }

  if (!bad.length) {
    results.push({ path: name, id: claim.file, status: 'PASSING', error: null })
    return
  }

  const shown = bad.slice(0, 5).map(describeFailure)
  if (bad.length > shown.length) shown.push(`… and ${bad.length - shown.length} more in the same spec`)
  results.push({ path: name, id: claim.file, status: 'FAILING', error: shown.join('\n') })
})

// ── record it ───────────────────────────────────────────────────────────────

const totals = {
  paths: CANONICAL.length,
  passing: results.filter((r) => r.status === 'PASSING').length,
  failing: results.filter((r) => r.status === 'FAILING').length,
  unwritten: results.filter((r) => r.status === 'UNWRITTEN').length,
  /* Kept under the names the file has always used. `journeys` is now the spec
   * files that declare a golden path, and `modules` the spec files the suite
   * ran — the same two facts the journey system reported. */
  journeys: [...claims.keys()].filter((k) => typeof k === 'number').length,
  modules: specFiles.size,
  errors: errors.length,
}

fs.mkdirSync(CONTROL, { recursive: true })
fs.writeFileSync(OUT, JSON.stringify({
  generatedAt: new Date().toISOString(),
  generator: 'app/scripts/golden-paths.mjs',
  note: 'A run record, not a plan. Classified from ' + source + ' over ' + (projects.join(' and ') || 'no project') + '. '
      + 'PASSING means a spec declares this path and every one of its tests passed in every project it ran in; '
      + 'FAILING means one ran and did not; UNWRITTEN means no spec declares that path yet. '
      + 'Never hand-edit — re-run the runner.',
  base: BASE,
  /* Which viewports the run actually covered. Recorded as data because a
   * reader needs it to know what a PASSING means: a path that passed only
   * because the mobile project never ran is not a path that works on a phone.
   * The release gate for mobile workflows reads this rather than parsing
   * `note`, so it can tell "no mobile run" from "mobile ran and was clean". */
  projects,
  totals,
  errors,
  paths: results,
}, null, 2) + '\n')

console.log(
  `\ngolden paths: ${totals.passing} passing · ${totals.failing} failing · ${totals.unwritten} unwritten ` +
  `(of ${totals.paths}) — ${totals.journeys} declaring spec(s) of ${totals.modules}, ` +
  `over ${projects.length} project(s): ${projects.join(', ') || 'none'}`,
)
console.log(`  ${tests.length} test(s) read from ${source}`)
console.log(`  wrote ${path.relative(REPO, OUT)}`)

if (errors.length) {
  console.error(`\nGOLDEN-PATH CONFIGURATION ERRORS (${errors.length}):`)
  for (const e of errors) console.error(`  ${e}`)
}
if (totals.failing) {
  console.error(`\nFAILING GOLDEN PATHS (${totals.failing}):`)
  for (const r of results.filter((x) => x.status === 'FAILING')) {
    console.error(`  ${r.path}\n${r.error.split('\n').map((line) => `    ${line}`).join('\n')}`)
  }
}
if (errors.length || totals.failing) process.exit(1)
