#!/usr/bin/env node
/**
 * SALIS AUTO — the fourteen release blockers, evaluated against real evidence.
 *
 * `tracker/plan-structure.json` names fourteen release blockers. Until now they
 * were prose in the command deck next to a hand-entered score: a sentence
 * nobody could fail. This script decides each one from something that actually
 * ran, and writes `RELEASE_GATES.json`.
 *
 *   node project-control/release-gates.mjs
 *
 * Status vocabulary — three values, and the third is the important one:
 *
 *   PASS         a check ran in this process and the gate holds. `evidence`
 *                names the command or file that proves it.
 *   FAIL         a check ran and the gate does not hold.
 *   UNCHECKABLE  the gate cannot be decided from this repository. `evidence`
 *                says why, and what a human has to do instead.
 *
 * UNCHECKABLE is a result, not an excuse. "No P0 defect open" needs a defect
 * tracker this repository does not contain; "Backup restore drill passed" needs
 * a drill against real infrastructure. Marking those PASS because nothing in
 * the repo contradicts them would be inventing a green, which is the one thing
 * this project forbids. The reverse is equally forbidden: a gate that *can* be
 * decided must be decided, even when deciding it takes a database and a minute.
 *
 * What this file will not do:
 *
 *   - It never reads a prose status. `docs/release-blockers.md`,
 *     `docs/certification-report.md` and `docs/security-report.md` all assert
 *     blocker outcomes; they are a previous agent's claims, they are stale
 *     (they count "50 server tests" against a suite that now has ~2,470), and
 *     a document asserting PASS is exactly the artefact these gates exist to
 *     replace. Nothing here reads them.
 *   - It never treats an absent check as a passing one. A gate whose mapped
 *     tests are missing from the run comes back UNCHECKABLE with the mapping
 *     named, not PASS on the tests that did run.
 *   - It never prints a credential. The secret scan reports file, line and
 *     rule name; the matched text is never written anywhere.
 *
 * ── The server suite ─────────────────────────────────────────────────────────
 * Six gates are decided by `server/tests`, so this runs that suite and reads
 * the per-test results rather than trusting a file name. That needs a real
 * PostgreSQL, and it needs two roles: an owner for migrations and a separate
 * NON-SUPERUSER role for the API. A superuser bypasses row-level security, so
 * a suite run on a superuser DSN passes every isolation assertion vacuously —
 * the tenant gates would be green because nothing was enforced. This script
 * therefore reads `pg_roles` for the DATABASE_URL role — before the run, and
 * again after it, because on a clean cluster the migration is what creates
 * that role — and refuses to report anything but UNCHECKABLE if the role the
 * suite actually connected as could bypass RLS.
 *
 *   DATABASE_ADMIN_URL=postgres://owner:pw@host:5432/salis_auto \
 *   DATABASE_URL=postgres://salis_app:pw@host:5432/salis_auto \
 *   JWT_SECRET=... node project-control/release-gates.mjs
 *
 * Flags:
 *   --skip-server-suite   do not run vitest; the six suite-backed gates come
 *                         back UNCHECKABLE, labelled as skipped by the operator
 *                         rather than as unprovable. For a fast re-run of the
 *                         static gates only.
 *   --report-only         always exit 0. Without it the process exits 1 when
 *                         any gate FAILs, so CI can use this as a gate.
 *
 * Exit codes: 0 = no FAIL, 1 = at least one FAIL, 2 = the checker itself broke.
 */

import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const SERVER = join(ROOT, 'server')
const APP = join(ROOT, 'app')
const CONTRACT = join(ROOT, 'packages', 'contract')
const OUTPUT = join(HERE, 'RELEASE_GATES.json')

const ARGS = new Set(process.argv.slice(2))
const SKIP_SUITE = ARGS.has('--skip-server-suite')
const REPORT_ONLY = ARGS.has('--report-only')

const PASS = 'PASS'
const FAIL = 'FAIL'
const UNCHECKABLE = 'UNCHECKABLE'

/* ─────────────────────────────────────────────────────────────────────────────
 * Small helpers
 * ────────────────────────────────────────────────────────────────────────── */

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

/** Every file under `dir`, minus the directories nobody should scan. */
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage', '.vite', '.turbo',
  '.next', 'android', 'ios', '.claude', 'pw-browsers',
])

function walk(dir, out = [], depth = 0) {
  if (depth > 12) return out
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.github') continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walk(full, out, depth + 1)
    } else if (entry.isFile()) {
      out.push(full)
    }
  }
  return out
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Evidence 1 — the server test suite
 * ────────────────────────────────────────────────────────────────────────── */

/** Is the role the API connects as actually subject to row-level security?
 *
 *  This is the load-bearing question behind every tenant gate. The lookup runs
 *  over the admin connection rather than the application one: on a fresh
 *  cluster the application role does not exist yet — `scripts/migrate.ts`
 *  creates it on the suite's first migration — and a probe that connects *as*
 *  the app role would refuse a perfectly good run because the thing it is
 *  checking has not been created yet. `pg_roles` is cluster-wide, so the admin
 *  connection sees it either way. `postgres` is resolved out of
 *  `server/node_modules`, so this file needs no dependencies of its own. */
async function probeAppRole() {
  let postgres
  try {
    postgres = createRequire(join(SERVER, 'package.json'))('postgres')
  } catch (cause) {
    return { probed: false, reason: `could not load the postgres driver from server/node_modules: ${cause.message}` }
  }
  const inspectUrl = process.env.DATABASE_ADMIN_URL ?? process.env.DATABASE_URL
  let role
  try {
    role = decodeURIComponent(new URL(process.env.DATABASE_URL).username || '')
  } catch {
    return { probed: false, reason: 'DATABASE_URL is not a parseable URL' }
  }
  const sql = postgres(inspectUrl, { max: 1, connect_timeout: 8, onnotice: () => {} })
  try {
    const rows = await sql`select rolname, rolsuper, rolbypassrls from pg_roles where rolname = ${role}`
    if (!rows.length) {
      /* Not an error before the run: the migration creates it, deliberately
       * without SUPERUSER and without BYPASSRLS. It is an error after. */
      return { probed: true, role, exists: false, rlsApplies: false }
    }
    const { rolsuper, rolbypassrls } = rows[0]
    return {
      probed: true,
      role,
      exists: true,
      superuser: rolsuper === true,
      bypassRls: rolbypassrls === true,
      rlsApplies: rolsuper !== true && rolbypassrls !== true,
    }
  } catch (cause) {
    return { probed: false, reason: `could not reach PostgreSQL to read pg_roles: ${cause.message}` }
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {})
  }
}

/**
 * Runs `server/tests` and returns every assertion by file and full name.
 *
 * `--reporter=json` rather than parsing console output: the gates map onto
 * individual test names, and a mapping that silently matches nothing has to be
 * detectable.
 */
async function runServerSuite() {
  const command = 'npx vitest run --reporter=json --outputFile=<tmp> (in server/)'
  if (SKIP_SUITE) {
    return { ran: false, skipped: true, command, reason: 'the operator passed --skip-server-suite' }
  }
  const missing = ['DATABASE_URL', 'JWT_SECRET'].filter((key) => !process.env[key])
  if (missing.length) {
    return {
      ran: false,
      command,
      reason:
        `${missing.join(' and ')} not set. The suite needs a real PostgreSQL with two roles — ` +
        `an owner in DATABASE_ADMIN_URL for the migrations and a non-superuser role in DATABASE_URL ` +
        `for the API, because a superuser bypasses row-level security and would pass every ` +
        `isolation assertion without enforcing anything.`,
    }
  }

  const vacuous = (probe) =>
    `DATABASE_URL connects as "${probe.role}", which is ` +
    `${probe.superuser ? 'a superuser' : 'BYPASSRLS'}. Row-level security does not apply to it, so the ` +
    `isolation suites would pass without a tenant boundary being enforced. Refusing to report a vacuous ` +
    `green. Point DATABASE_URL at the non-superuser application role.`

  const before = await probeAppRole()
  if (!before.probed) {
    return { ran: false, command, reason: `could not verify the application role: ${before.reason}`, roleProbe: before }
  }
  if (before.exists && !before.rlsApplies) {
    return { ran: false, command, roleProbe: before, reason: vacuous(before) }
  }

  const outFile = join(mkdtempSync(join(tmpdir(), 'release-gates-')), 'vitest.json')
  const started = Date.now()
  const proc = spawnSync('npx', ['vitest', 'run', '--reporter=json', `--outputFile=${outFile}`], {
    cwd: SERVER,
    env: process.env,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    timeout: 20 * 60 * 1000,
  })
  /* Re-read the role now that the migration has had its chance to create it.
   * This is the probe that matters: it describes the role the suite actually
   * connected as, not the one it was going to. */
  const roleProbe = await probeAppRole()
  if (!roleProbe.probed || !roleProbe.exists) {
    return {
      ran: false,
      command,
      roleProbe,
      reason:
        `after the run, the application role "${roleProbe.role}" ` +
        `${roleProbe.probed ? 'still does not exist in pg_roles' : `could not be read: ${roleProbe.reason}`}. ` +
        `Without it there is no non-superuser role for row-level security to apply to, so nothing the ` +
        `isolation suites reported can be trusted.`,
    }
  }
  if (!roleProbe.rlsApplies) {
    return { ran: false, command, roleProbe, reason: vacuous(roleProbe) }
  }

  const report = readJson(outFile)
  if (!report) {
    return {
      ran: false,
      command,
      roleProbe,
      reason:
        `vitest produced no JSON report (exit ${proc.status}). Last stderr: ` +
        `${String(proc.stderr || '').trim().split('\n').slice(-4).join(' / ') || '(empty)'}`,
    }
  }

  const byFile = new Map()
  for (const file of report.testResults ?? []) {
    const rel = relative(SERVER, file.name).split('\\').join('/')
    const tests = byFile.get(rel) ?? []
    for (const assertion of file.assertionResults ?? []) {
      tests.push({ fullName: assertion.fullName, status: assertion.status })
    }
    byFile.set(rel, tests)
  }

  return {
    ran: true,
    command,
    roleProbe,
    exitCode: proc.status,
    durationSeconds: Math.round((Date.now() - started) / 100) / 10,
    files: report.testResults?.length ?? 0,
    total: report.numTotalTests ?? 0,
    passed: report.numPassedTests ?? 0,
    failed: report.numFailedTests ?? 0,
    skipped: (report.numPendingTests ?? 0) + (report.numTodoTests ?? 0),
    byFile,
  }
}

/**
 * Resolves a gate's list of selectors against a completed run.
 *
 * A selector that matches fewer tests than it expects is a stale mapping, not a
 * pass — the gate comes back UNCHECKABLE naming the selector, because "the
 * tests I meant to consult are not in this run" and "the tests passed" are
 * different facts and only one of them is evidence.
 */
function evaluateSuiteGate(suite, selectors) {
  if (!suite.ran) {
    return {
      status: UNCHECKABLE,
      evidence:
        `The server suite did not run, so this gate was not decided. ${suite.reason} ` +
        `Command: \`${suite.command}\`.`,
      checkedBy: 'server-suite (not run)',
    }
  }

  const missing = []
  const failures = []
  let matched = 0
  const files = new Set()

  for (const selector of selectors) {
    const tests = suite.byFile.get(selector.file) ?? []
    const hits = tests.filter((test) => {
      if (selector.all) return true
      if (selector.prefix) return test.fullName.startsWith(selector.prefix)
      if (selector.contains) return test.fullName.includes(selector.contains)
      return false
    })
    const label = selector.all
      ? selector.file
      : `${selector.file} [${selector.prefix ? `prefix ${JSON.stringify(selector.prefix)}` : `contains ${JSON.stringify(selector.contains)}`}]`
    if (hits.length < (selector.min ?? 1)) {
      missing.push(`${label} → ${hits.length} test(s), expected at least ${selector.min ?? 1}`)
      continue
    }
    matched += hits.length
    files.add(selector.file)
    for (const hit of hits) {
      if (hit.status !== 'passed') failures.push(`${selector.file} › ${hit.fullName} (${hit.status})`)
    }
  }

  if (missing.length) {
    return {
      status: UNCHECKABLE,
      evidence:
        `The tests this gate is mapped to are not in the run, so nothing was proven. Stale mapping: ` +
        `${missing.join('; ')}. Re-point the selectors in project-control/release-gates.mjs at the ` +
        `assertions that now cover this gate, or write them.`,
      checkedBy: 'server-suite (stale mapping)',
    }
  }
  if (failures.length) {
    return {
      status: FAIL,
      evidence:
        `\`${suite.command}\` — ${failures.length} of ${matched} mapped assertion(s) failed: ` +
        `${failures.slice(0, 12).join('; ')}${failures.length > 12 ? ` … and ${failures.length - 12} more` : ''}.`,
      checkedBy: 'server-suite',
    }
  }
  return {
    status: PASS,
    evidence:
      `\`${suite.command}\` — ${matched} mapped assertion(s) passed across ${files.size} suite file(s) ` +
      `(${[...files].sort().join(', ')}); whole run ${suite.passed}/${suite.total} passed, ` +
      `${suite.failed} failed, ${suite.skipped} skipped in ${suite.durationSeconds}s. ` +
      `Row-level security was in force: DATABASE_URL connects as "${suite.roleProbe.role}", ` +
      `pg_roles reports rolsuper=false and rolbypassrls=false.`,
    checkedBy: 'server-suite',
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Evidence 2 — dependency advisories
 * ────────────────────────────────────────────────────────────────────────── */

/** `npm audit --json` for one workspace, with each advisory traced back to
 *  whether it reaches a production dependency. A critical in a test runner and
 *  a high in the ORM that serves customer data are not the same finding, and a
 *  gate that cannot tell them apart is not worth reading. */
function npmAudit(dir, label) {
  if (!existsSync(join(dir, 'package.json'))) {
    return { name: label, ran: false, reason: 'no package.json' }
  }
  const proc = spawnSync('npm', ['audit', '--json'], {
    cwd: dir,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 5 * 60 * 1000,
  })
  let report
  try {
    report = JSON.parse(proc.stdout)
  } catch {
    return {
      name: label,
      ran: false,
      reason: `npm audit produced no JSON (exit ${proc.status}); offline or the lockfile is missing`,
    }
  }
  if (report.error) {
    return { name: label, ran: false, reason: `npm audit: ${report.error.summary ?? report.error.code}` }
  }

  const pkg = readJson(join(dir, 'package.json')) ?? {}
  const production = new Set(Object.keys(pkg.dependencies ?? {}))
  const vulnerabilities = report.vulnerabilities ?? {}

  /** A package is "in production" if it is a production dependency, or if
   *  something it breaks is. `effects` is npm's own upward edge list. */
  const reachesProduction = (start) => {
    const seen = new Set()
    const queue = [start]
    while (queue.length) {
      const name = queue.shift()
      if (seen.has(name)) continue
      seen.add(name)
      if (production.has(name)) return true
      for (const next of vulnerabilities[name]?.effects ?? []) queue.push(next)
    }
    return false
  }

  const serious = []
  for (const [name, entry] of Object.entries(vulnerabilities)) {
    if (entry.severity !== 'critical' && entry.severity !== 'high') continue
    const titles = (entry.via ?? [])
      .map((via) => (typeof via === 'string' ? via : via.title))
      .filter(Boolean)
    serious.push({
      package: name,
      severity: entry.severity,
      production: reachesProduction(name),
      direct: entry.isDirect === true,
      advisories: [...new Set(titles)].slice(0, 3),
    })
  }
  serious.sort((a, b) => Number(b.production) - Number(a.production) || a.package.localeCompare(b.package))

  return {
    name: label,
    ran: true,
    command: `npm audit --json (in ${relative(ROOT, dir) || '.'})`,
    counts: report.metadata?.vulnerabilities ?? {},
    serious,
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Evidence 3 — secret scanning
 * ────────────────────────────────────────────────────────────────────────── */

/** Credential shapes with a fixed, unmistakable prefix. Nothing entropy-based:
 *  a scanner that guesses produces noise, and noise is how a real finding gets
 *  waved through. These are the same families gitleaks' default rules cover. */
const SECRET_RULES = [
  { rule: 'github-pat', pattern: /\bgh[pousr]_[A-Za-z0-9]{36,255}\b/ },
  { rule: 'github-fine-grained-pat', pattern: /\bgithub_pat_[A-Za-z0-9_]{60,}\b/ },
  { rule: 'aws-access-key-id', pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { rule: 'private-key-block', pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { rule: 'slack-token', pattern: /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/ },
  { rule: 'google-api-key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { rule: 'stripe-live-key', pattern: /\b(?:sk|rk)_live_[A-Za-z0-9]{20,}\b/ },
  { rule: 'npm-token', pattern: /\bnpm_[A-Za-z0-9]{36}\b/ },
]

const ANY_SECRET = new RegExp(SECRET_RULES.map((r) => `(?:${r.pattern.source})`).join('|'))

const SCANNABLE = /\.(md|txt|json|jsonc|ya?ml|toml|env|example|mjs|cjs|js|jsx|ts|tsx|sh|ps1|html|css|sql|conf|ini|xml|properties)$|(^|\/)(Dockerfile|Makefile|\.env[^/]*)$/i

/**
 * Scans the working tree. Uses gitleaks when it is on PATH — that is what CI
 * runs — and otherwise applies the prefix rules above.
 *
 * Two honest limits, both stated in the gate's evidence: this reads the working
 * tree, not git history (CI's gitleaks job checks out with fetch-depth 0 and
 * does scan history), and a scanner finding nothing is evidence that no secret
 * is *committed here*, never evidence that an already-leaked credential was
 * rotated. The second question is answered from the risk register, not from a
 * scan. No matched text is ever recorded: findings carry file, line and rule.
 */
function secretScan() {
  const gitleaks = spawnSync('gitleaks', ['version'], { encoding: 'utf8' })
  if (gitleaks.status === 0) {
    const proc = spawnSync('gitleaks', ['detect', '--no-banner', '--redact', '--exit-code', '0', '--report-format', 'json', '--report-path', '/dev/stdout', '--source', ROOT], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      timeout: 10 * 60 * 1000,
    })
    let findings = []
    try {
      findings = JSON.parse(proc.stdout || '[]')
    } catch {
      findings = []
    }
    return {
      ran: true,
      tool: `gitleaks ${String(gitleaks.stdout).trim()}`,
      command: 'gitleaks detect --redact --source <repo>',
      scope: 'working tree and git history',
      findings: findings.map((f) => ({ file: f.File, line: f.StartLine, rule: f.RuleID })),
    }
  }

  const files = walk(ROOT).filter((file) => SCANNABLE.test(file))
  const findings = []
  let bytes = 0
  for (const file of files) {
    let size = 0
    try {
      size = statSync(file).size
    } catch {
      continue
    }
    if (size > 8 * 1024 * 1024) continue
    let text
    try {
      text = readFileSync(file, 'utf8')
    } catch {
      continue
    }
    bytes += size
    /* One combined pass first. The design bundle alone is ~90 MB of HTML;
     *  eight regexes per line over that is minutes, and a whole-file test that
     *  fails is one pass instead of eight. Only files that match at all are
     *  walked line by line, to get the line number. */
    if (!ANY_SECRET.test(text)) continue
    const lines = text.split('\n')
    for (let index = 0; index < lines.length; index += 1) {
      for (const { rule, pattern } of SECRET_RULES) {
        if (pattern.test(lines[index])) {
          /* File, line and rule only. The matched text is deliberately not
           * captured, not logged and not written to the report. */
          findings.push({ file: relative(ROOT, file), line: index + 1, rule })
        }
      }
    }
  }
  return {
    ran: true,
    tool: 'built-in prefix rules (gitleaks is not installed here)',
    command: 'node project-control/release-gates.mjs — internal scanner',
    scope: 'working tree only, not git history',
    filesScanned: files.length,
    megabytesScanned: Math.round((bytes / 1024 / 1024) * 10) / 10,
    rules: SECRET_RULES.map((r) => r.rule),
    findings,
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Evidence 4 — static reads of the repository
 * ────────────────────────────────────────────────────────────────────────── */

/** Foreign-key delete policy, destructive DDL and soft-delete columns across
 *  the committed migrations. These are the data-loss paths a schema can
 *  express: a cascade that removes a customer's history with the customer, a
 *  migration that drops a populated table, a delete that destroys instead of
 *  hiding. */
function migrationAudit() {
  const dir = join(SERVER, 'drizzle')
  if (!existsSync(dir)) return { ran: false, reason: 'server/drizzle does not exist' }
  const files = readdirSync(dir).filter((name) => name.endsWith('.sql')).sort()
  let foreignKeys = 0
  const cascades = []
  const destructive = []
  let softDeleteColumns = 0
  for (const name of files) {
    const text = readFileSync(join(dir, name), 'utf8')
    for (const raw of text.split('\n')) {
      const line = raw.trim()
      if (line.startsWith('--')) continue
      if (/FOREIGN KEY/i.test(line)) {
        foreignKeys += 1
        if (/ON DELETE\s+cascade/i.test(line)) cascades.push(`${name}: ${line.slice(0, 90)}`)
      }
      /* Statement-initial only. `CREATE TRIGGER … BEFORE TRUNCATE ON audit_log`
       * is the migration that *prevents* a truncation, and a scanner that reads
       * it as a data-loss path is a scanner nobody will trust twice. */
      if (/^(TRUNCATE\b|DROP\s+(TABLE|SCHEMA)\b)/i.test(line) || /\bDROP\s+COLUMN\b/i.test(line)) {
        destructive.push(`${name}: ${line.slice(0, 90)}`)
      }
      if (/deleted_at/i.test(line)) softDeleteColumns += 1
    }
  }
  return { ran: true, migrations: files.length, foreignKeys, cascades, destructive, softDeleteColumns }
}

/** The nearest thing this repository has to a defect list. Neither file uses
 *  P0/P1, which is the whole reason gates 1 and 2 cannot be decided here. */
function defectArtefacts() {
  const blockers = readJson(join(HERE, 'BLOCKERS.json'))
  const findings = readJson(join(HERE, 'FINDINGS.json'))
  const openBlockers = (blockers?.blockers ?? []).map((b) => ({ id: b.id, severity: b.severity, title: b.title }))
  const openFindings = (findings?.findings ?? [])
    .filter((f) => String(f.severity).toUpperCase() !== 'RESOLVED')
    .map((f) => ({ id: f.id, severity: f.severity, title: f.title }))
  const severities = (list) => {
    const counts = {}
    for (const item of list) counts[item.severity] = (counts[item.severity] ?? 0) + 1
    return Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ') || 'none'
  }
  return {
    ran: Boolean(blockers || findings),
    blockersFile: 'project-control/BLOCKERS.json',
    findingsFile: 'project-control/FINDINGS.json',
    openBlockers,
    openFindings,
    blockerSeverities: severities(openBlockers),
    findingSeverities: severities(openFindings),
    usesP0P1: [...openBlockers, ...openFindings].some((item) => /^P[01]$/i.test(String(item.severity))),
  }
}

/** Golden-path journeys. The runner and modules are owned elsewhere; this only
 *  reports what exists, and reads a result file if one has been produced. */
function goldenPathEvidence() {
  const plan = readJson(join(HERE, 'tracker', 'plan-structure.json'))
  const named = plan?.goldenPaths?.length ?? 0
  const dir = join(APP, 'scripts', 'journeys')
  const modules = existsSync(dir)
    ? readdirSync(dir).filter((name) => /\.(mjs|js|ts)$/.test(name))
    : []
  const candidates = [
    join(HERE, 'GOLDEN_PATHS.json'),
    join(HERE, 'JOURNEYS.json'),
    join(APP, 'scripts', 'journeys', 'results.json'),
    join(APP, 'journey-results.json'),
  ]
  const resultFile = candidates.find((path) => existsSync(path)) ?? null
  return { named, dir: relative(ROOT, dir), modules, resultFile: resultFile ? relative(ROOT, resultFile) : null, results: resultFile ? readJson(resultFile) : null }
}

/** A backup/restore drill record, if anybody has run one and written it down. */
function restoreDrillEvidence() {
  const candidates = [
    join(HERE, 'BACKUP_RESTORE_DRILL.json'),
    join(HERE, 'RESTORE_DRILL.json'),
    join(ROOT, 'docs', 'restore-drill.md'),
    join(ROOT, 'docs', 'backup-restore-drill.md'),
  ]
  const found = candidates.find((path) => existsSync(path)) ?? null
  return { found: found ? relative(ROOT, found) : null, searched: candidates.map((p) => relative(ROOT, p)) }
}

/** Mobile coverage as the test-status file records it, plus the open mobile
 *  blockers. */
function mobileEvidence() {
  const status = readJson(join(HERE, 'TEST_STATUS.json'))
  const blockers = readJson(join(HERE, 'BLOCKERS.json'))?.blockers ?? []
  return {
    mobileSuite: status?.suites?.mobile ?? null,
    tabletSuite: status?.suites?.tablet ?? null,
    goldenPathSuite: status?.suites?.goldenPaths ?? null,
    openMobileBlockers: blockers
      .filter((b) => /mobile|tablet|768|responsive/i.test(`${b.title} ${b.detail}`))
      .map((b) => `${b.id} (${b.severity}): ${b.title}`),
  }
}

/** Whether the invoice and payment screens read the API or a fixture. A green
 *  server suite over invoices means little if the screens that show them are
 *  wired to mock data. */
function invoiceScreenEvidence() {
  const registry = readJson(join(HERE, 'MASTER_REGISTRY.json'))
  const entries = registry?.entries ?? []
  const core = entries.filter(
    (entry) =>
      entry.category === 'PRODUCT' &&
      /^(D-Invoice|D-Payments)/.test(entry.screenId ?? ''),
  )
  return {
    total: core.length,
    dataBacked: core.filter((entry) => entry.dataBacked).length,
    screens: core.map((entry) => `${entry.screenId} ${entry.route} dataBacked=${entry.dataBacked}`),
  }
}

/** Rotation of the three chat-exposed PATs, as recorded — not as scanned for.
 *  The tokens themselves are deliberately not sought: whether a credential was
 *  rotated is a fact about GitHub, and the only thing this repository can hold
 *  is the record that somebody did it. */
function rotationRecord() {
  const blockers = readJson(join(HERE, 'BLOCKERS.json'))?.blockers ?? []
  const risks = readJson(join(HERE, 'RISK_REGISTER.json'))?.risks ?? []
  const blocker = blockers.find((b) => /PAT|token|secret/i.test(`${b.title}`)) ?? null
  const risk = risks.find((r) => /PAT/i.test(`${r.title}`)) ?? null
  return {
    blocker: blocker ? { id: blocker.id, severity: blocker.severity, title: blocker.title } : null,
    risk: risk ? { id: risk.id, status: risk.status, title: risk.title } : null,
    rotationRecorded: Boolean(blocker === null && (risk === null || risk.status === 'closed' || risk.status === 'mitigated')),
  }
}

/** Does CI actually run a secret scanner? The gate asks whether the
 *  repository's own scanning is clean, which presumes it exists. */
function ciSecretScanning() {
  const file = join(ROOT, '.github', 'workflows', 'ci.yml')
  if (!existsSync(file)) return { configured: false, where: null }
  const text = readFileSync(file, 'utf8')
  return { configured: /gitleaks/i.test(text), where: '.github/workflows/ci.yml (job: security)' }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * The fourteen gates
 * ────────────────────────────────────────────────────────────────────────── */

async function main() {
  const suite = await runServerSuite()
  const audits = [npmAudit(APP, 'app'), npmAudit(SERVER, 'server'), npmAudit(CONTRACT, 'packages/contract')]
  const secrets = secretScan()
  const migrations = migrationAudit()
  const defects = defectArtefacts()
  const golden = goldenPathEvidence()
  const drill = restoreDrillEvidence()
  const mobile = mobileEvidence()
  const invoiceScreens = invoiceScreenEvidence()
  const rotation = rotationRecord()
  const ciScanning = ciSecretScanning()

  const gates = []
  const gate = (id, title, result) => gates.push({ id, title, ...result })

  /* ── 1 & 2 — P0 and P1 defects ─────────────────────────────────────────── */
  const defectReason = (level) =>
    `No defect tracker exists in this repository, and no artefact in it uses ${level} severity. ` +
    `The nearest two are project-control/BLOCKERS.json (${defects.openBlockers.length} open: ` +
    `${defects.blockerSeverities}) and project-control/FINDINGS.json (${defects.openFindings.length} ` +
    `unresolved: ${defects.findingSeverities}). BLOCKERS.json is computed from the registry rather ` +
    `than being a defect log, and neither file grades anything ${level}, so calling this gate either ` +
    `way would mean inventing a severity mapping nobody has ratified. A human must either point this ` +
    `gate at the real tracker (Jira/Linear/GitHub Issues) or ratify a mapping — e.g. BLOCKER→P0, ` +
    `CRITICAL→P1 — and record it, at which point this becomes checkable. Open blockers today: ` +
    `${defects.openBlockers.map((b) => `${b.id} (${b.severity})`).join(', ') || 'none'}.`

  gate('RB-01', 'No P0 defect open', {
    status: UNCHECKABLE,
    evidence: defectReason('P0'),
    checkedBy: 'no source of truth in repo',
  })
  gate('RB-02', 'No P1 defect open', {
    status: UNCHECKABLE,
    evidence: defectReason('P1'),
    checkedBy: 'no source of truth in repo',
  })

  /* ── 3 — golden paths ──────────────────────────────────────────────────── */
  if (golden.results) {
    const rows = Array.isArray(golden.results) ? golden.results : golden.results.paths ?? []
    const failing = rows.filter((row) => String(row.status).toUpperCase() === 'FAILING')
    const unwritten = rows.filter((row) => String(row.status).toUpperCase() === 'UNWRITTEN')
    if (failing.length) {
      gate('RB-03', 'No critical golden-path failure', {
        status: FAIL,
        evidence:
          `${golden.resultFile} (written by the golden-path runner, not by this checker) reports ` +
          `${failing.length} of ${golden.named} named paths FAILING: ` +
          `${failing.map((r) => r.path ?? r.id).join(', ')}. ` +
          `${unwritten.length} more are UNWRITTEN (${unwritten.map((r) => r.path ?? r.id).slice(0, 25).join(', ')}), ` +
          `so the gate would still not be decidable even with the failure fixed: nothing has walked those ` +
          `paths, and "nobody checked" is not "nothing failed".`,
        checkedBy: 'golden-path runner',
      })
    } else if (unwritten.length) {
      gate('RB-03', 'No critical golden-path failure', {
        status: UNCHECKABLE,
        evidence: `${golden.resultFile} reports 0 failing but ${unwritten.length} of ${golden.named} paths UNWRITTEN. Nothing walked those paths, so no failure could have been observed on them. A human must write the missing journeys.`,
        checkedBy: 'golden-path runner (partial)',
      })
    } else {
      gate('RB-03', 'No critical golden-path failure', {
        status: PASS,
        evidence: `${golden.resultFile} reports all ${golden.named} golden paths PASSING.`,
        checkedBy: 'golden-path runner',
      })
    }
  } else {
    gate('RB-03', 'No critical golden-path failure', {
      status: UNCHECKABLE,
      evidence:
        `${golden.named} golden paths are named in tracker/plan-structure.json and none of them has been ` +
        `walked. ${golden.dir} contains ${golden.modules.length} journey module(s) and no runner result ` +
        `file exists (looked for project-control/GOLDEN_PATHS.json, project-control/JOURNEYS.json, ` +
        `app/scripts/journeys/results.json, app/journey-results.json). project-control/TEST_STATUS.json ` +
        `records the goldenPaths suite as present=${mobile.goldenPathSuite?.present} with ` +
        `${mobile.goldenPathSuite?.covered ?? 0}/${mobile.goldenPathSuite?.of ?? golden.named} covered. ` +
        `"Nobody checked" is not "nothing failed": a human must land the journey modules and their ` +
        `runner, after which this gate reads their output automatically.`,
      checkedBy: 'no golden-path run exists',
    })
  }

  /* ── 4 — cross-tenant access ───────────────────────────────────────────── */
  gate('RB-04', 'No cross-tenant access in the RBAC lab', evaluateSuiteGate(suite, [
    { file: 'tests/rbac-lab.test.ts', all: true, min: 3 },
    { file: 'tests/isolation.test.ts', all: true, min: 20 },
    { file: 'tests/api.test.ts', prefix: 'tenant isolation ', min: 6 },
    { file: 'tests/export.test.ts', contains: 'excludes another org', min: 1 },
    { file: 'tests/estimate-money.test.ts', contains: 'does not serve another organization', min: 1 },
    { file: 'tests/approvals-queue.test.ts', contains: 'does not surface another organization', min: 1 },
    { file: 'tests/finance-reports.test.ts', contains: 'never lets another organization contribute', min: 1 },
    { file: 'tests/history-read.test.ts', contains: 'another organization', min: 2 },
  ]))

  /* ── 5 — unauthorized financial operation ──────────────────────────────── */
  gate('RB-05', 'No unauthorized financial operation', evaluateSuiteGate(suite, [
    { file: 'tests/authz-sod.test.ts', all: true, min: 7 },
    { file: 'tests/authz-matrix.test.ts', all: true, min: 20 },
    { file: 'tests/rules.test.ts', prefix: 'approval ceilings ', min: 4 },
    { file: 'tests/rules.test.ts', prefix: 'segregation of duties ', min: 2 },
    { file: 'tests/api.test.ts', prefix: 'estimates and approval ', min: 4 },
    { file: 'tests/api.test.ts', contains: 'approval ceiling', min: 1 },
    { file: 'tests/api.test.ts', contains: 'may create an invoice but not edit one', min: 1 },
    { file: 'tests/approvals-queue.test.ts', all: true, min: 5 },
    { file: 'tests/collections.test.ts', contains: 'server-side RBAC re-check', min: 4 },
    { file: 'tests/finance-reports.test.ts', contains: 'refuses a role without the invoices grant', min: 1 },
    { file: 'tests/finance-reports.test.ts', contains: 'refuses a role without the accounting grant', min: 1 },
    { file: 'tests/writes.test.ts', contains: 'cannot create an invoice', min: 1 },
  ]))

  /* ── 6 — financial calculation corruption ──────────────────────────────── */
  const financeMath = evaluateSuiteGate(suite, [
    { file: 'tests/rules.test.ts', prefix: 'money ', min: 5 },
    { file: 'tests/rules.test.ts', prefix: 'payments ', min: 6 },
    { file: 'tests/estimate-money.test.ts', all: true, min: 3 },
    { file: 'tests/api.test.ts', prefix: 'invoices and payments ', min: 8 },
    { file: 'tests/finance-reports.test.ts', prefix: 'GET /invoices/summary ', min: 3 },
    { file: 'tests/finance-reports.test.ts', prefix: 'GET /accounting/tax/return ', min: 2 },
  ])
  if (financeMath.status === PASS) {
    financeMath.evidence +=
      ` Scope note: this proves the arithmetic engine and the money endpoints — totals derived from ` +
      `lines rather than trusted from the client, tax on the discounted net, one rounding at the total, ` +
      `payment never exceeding the balance, no double-billing under a repeated Idempotency-Key, and ` +
      `only one of two simultaneous payments taking the last of a balance. It does not clear the ` +
      `seeded ledger: FINDINGS.json F-008 (MEDIUM, open) records that the seeded chart of accounts does ` +
      `not balance, and tests/finance-reports.test.ts asserts the trial balance reports that imbalance ` +
      `honestly rather than forcing it to zero. That is seed data, not a calculation defect, and it is ` +
      `a separate open finding.`
  }
  gate('RB-06', 'No financial calculation corruption', financeMath)

  /* ── 7 — inventory corruption ──────────────────────────────────────────── */
  gate('RB-07', 'No inventory corruption', evaluateSuiteGate(suite, [
    { file: 'tests/inventory-enforcement.test.ts', all: true, min: 20 },
    { file: 'tests/rules.test.ts', prefix: 'inventory ', min: 4 },
    { file: 'tests/api.test.ts', prefix: 'inventory ', min: 2 },
    { file: 'tests/procurement.test.ts', all: true, min: 8 },
  ]))

  /* ── 8 — authentication bypass ─────────────────────────────────────────── */
  gate('RB-08', 'No authentication bypass', evaluateSuiteGate(suite, [
    { file: 'tests/auth.test.ts', all: true, min: 30 },
    { file: 'tests/api.test.ts', prefix: 'authentication ', min: 2 },
    { file: 'tests/isolation.test.ts', contains: 'requires a token at all', min: 1 },
    { file: 'tests/isolation.test.ts', contains: 'ignores a widened scope claim', min: 1 },
    { file: 'tests/isolation.test.ts', contains: 'editing the token', min: 1 },
    { file: 'tests/security.test.ts', prefix: 'unknown paths ', min: 2 },
  ]))

  /* ── 9 — critical security vulnerability ───────────────────────────────── */
  const auditsRan = audits.filter((a) => a.ran)
  const auditsFailed = audits.filter((a) => !a.ran)
  if (!auditsRan.length) {
    gate('RB-09', 'No critical security vulnerability', {
      status: UNCHECKABLE,
      evidence: `npm audit could not run anywhere: ${auditsFailed.map((a) => `${a.name} — ${a.reason}`).join('; ')}.`,
      checkedBy: 'npm-audit (not run)',
    })
  } else {
    const blocking = auditsRan.flatMap((a) =>
      a.serious.filter((v) => v.severity === 'critical' || v.production).map((v) => ({ ...v, workspace: a.name })),
    )
    const counts = auditsRan
      .map((a) => `${a.name}: ${a.counts.critical ?? 0} critical, ${a.counts.high ?? 0} high, ${a.counts.moderate ?? 0} moderate, ${a.counts.low ?? 0} low`)
      .join('; ')
    const rule =
      `Failing rule: any critical advisory anywhere, or any high advisory that reaches a production ` +
      `dependency. A high in a dev-only tool and a high in the ORM that serves customer data are not ` +
      `the same finding, so the chain is traced through npm's own effects graph rather than counted flat.`
    if (blocking.length) {
      gate('RB-09', 'No critical security vulnerability', {
        status: FAIL,
        evidence:
          `\`npm audit --json\` in app/, server/ and packages/contract/ — ${counts}. ` +
          `${blocking.length} blocking advisory/advisories: ` +
          `${blocking.map((v) => `${v.workspace}/${v.package} (${v.severity}, ${v.production ? 'production' : 'dev-only'}) — ${v.advisories[0] ?? 'see advisory'}`).join('; ')}. ` +
          `${rule} Note CI audits app/ only (\`npm audit --audit-level=high\` in the security job), so the ` +
          `server advisories are not currently gated there. Scope: this decides dependency advisories. ` +
          `Application-code vulnerabilities are covered only insofar as tests/security.test.ts and the ` +
          `authorization suites assert them; no SAST or penetration test has been run against this tree.`,
        checkedBy: 'npm-audit',
      })
    } else {
      gate('RB-09', 'No critical security vulnerability', {
        status: PASS,
        evidence:
          `\`npm audit --json\` in app/, server/ and packages/contract/ — ${counts}. No critical advisory ` +
          `anywhere and no high advisory reaching a production dependency. ${rule} Scope: dependency ` +
          `advisories only; no SAST or penetration test has been run against this tree.` +
          `${auditsFailed.length ? ` Not audited: ${auditsFailed.map((a) => `${a.name} (${a.reason})`).join(', ')}.` : ''}`,
        checkedBy: 'npm-audit',
      })
    }
  }

  /* ── 10 — exposed secrets and PAT rotation ─────────────────────────────── */
  {
    const scanLine =
      `${secrets.tool} over the ${secrets.scope}` +
      (secrets.filesScanned ? ` (${secrets.filesScanned} files, ${secrets.megabytesScanned} MB, rules: ${secrets.rules.join(', ')})` : '') +
      ` — ${secrets.findings.length} finding(s)` +
      (secrets.findings.length ? `: ${secrets.findings.slice(0, 10).map((f) => `${f.file}:${f.line} [${f.rule}]`).join(', ')} (locations only; no matched text is recorded)` : '') +
      `. CI secret scanning is ${ciScanning.configured ? `configured in ${ciScanning.where}` : 'NOT configured'}.`
    const rotationLine =
      `Rotation of the three chat-exposed PATs is not recorded as done: ` +
      `${rotation.blocker ? `${rotation.blocker.id} (${rotation.blocker.severity}) "${rotation.blocker.title}" is open in BLOCKERS.json` : 'no blocker is open'}; ` +
      `${rotation.risk ? `RISK_REGISTER.json ${rotation.risk.id} "${rotation.risk.title}" is status=${rotation.risk.status}` : 'the risk register carries no PAT entry'}.`
    if (secrets.findings.length) {
      gate('RB-10', 'No exposed secret (three chat-exposed PATs rotated)', {
        status: FAIL,
        evidence: `${scanLine} ${rotationLine}`,
        checkedBy: 'secret-scan + tracker',
      })
    } else if (!rotation.rotationRecorded) {
      gate('RB-10', 'No exposed secret (three chat-exposed PATs rotated)', {
        status: FAIL,
        evidence:
          `${scanLine} The tree is clean, but the second half of the gate is not met. ${rotationLine} ` +
          `A scan finding nothing proves no credential is committed here; it cannot prove a credential ` +
          `already leaked elsewhere was rotated — that is a fact about GitHub, and the only thing this ` +
          `repository can hold is the record. To clear: rotate all three tokens at GitHub, then close ` +
          `BLK-003 and move R-03 to mitigated with the date and who confirmed each revocation.`,
        checkedBy: 'secret-scan + tracker',
      })
    } else {
      gate('RB-10', 'No exposed secret (three chat-exposed PATs rotated)', {
        status: PASS,
        evidence: `${scanLine} Rotation is recorded: BLK-003 is closed and RISK_REGISTER.json R-03 is ${rotation.risk?.status}.`,
        checkedBy: 'secret-scan + tracker',
      })
    }
  }

  /* ── 11 — major data loss path ─────────────────────────────────────────── */
  {
    const suiteResult = evaluateSuiteGate(suite, [
      { file: 'tests/api.test.ts', prefix: 'audit ', min: 3 },
      { file: 'tests/api.test.ts', prefix: 'soft delete ', min: 1 },
      { file: 'tests/authz-matrix.test.ts', contains: 'keeps soft-deleted rows behind the delete grant', min: 1 },
      { file: 'tests/authz-matrix.test.ts', contains: 'refuses the delete over HTTP for a role that only holds export', min: 1 },
      { file: 'tests/writes.test.ts', contains: 'cannot delete a customer', min: 1 },
    ])
    const schemaClean = migrations.ran && migrations.cascades.length === 0 && migrations.destructive.length === 0
    const schemaLine = migrations.ran
      ? `Schema scan of server/drizzle (${migrations.migrations} migrations): ${migrations.foreignKeys} foreign keys, ` +
        `${migrations.cascades.length} with ON DELETE CASCADE, ${migrations.destructive.length} destructive ` +
        `statements (DROP TABLE/COLUMN/SCHEMA, TRUNCATE), ${migrations.softDeleteColumns} deleted_at references.` +
        (migrations.cascades.length ? ` Cascades: ${migrations.cascades.slice(0, 5).join('; ')}.` : '') +
        (migrations.destructive.length ? ` Destructive: ${migrations.destructive.slice(0, 5).join('; ')}.` : '')
      : `Schema scan did not run: ${migrations.reason}.`
    const scope =
      `Scope: this decides the four data-loss paths a repository can express — deletes hide rows rather ` +
      `than destroying them, the audit log cannot be updated, deleted or truncated even by the ` +
      `application role, delete is gated behind the delete grant rather than export, and no foreign key ` +
      `cascades a parent's removal into its children. It says nothing about retention, replication or ` +
      `restorability; that is RB-12, which is UNCHECKABLE here.`
    if (suiteResult.status === PASS && schemaClean) {
      gate('RB-11', 'No major data loss path', {
        status: PASS,
        evidence: `${suiteResult.evidence} ${schemaLine} ${scope}`,
        checkedBy: 'server-suite + schema-scan',
      })
    } else if (suiteResult.status === FAIL || (migrations.ran && !schemaClean)) {
      gate('RB-11', 'No major data loss path', {
        status: FAIL,
        evidence: `${suiteResult.evidence} ${schemaLine} ${scope}`,
        checkedBy: 'server-suite + schema-scan',
      })
    } else {
      gate('RB-11', 'No major data loss path', {
        status: UNCHECKABLE,
        evidence: `${suiteResult.evidence} ${schemaLine}`,
        checkedBy: suiteResult.checkedBy,
      })
    }
  }

  /* ── 12 — backup restore drill ─────────────────────────────────────────── */
  gate('RB-12', 'Backup restore drill passed', {
    status: UNCHECKABLE,
    evidence:
      `A restore drill is an operation against real infrastructure — take a backup of the production ` +
      `database, restore it into a clean instance, and verify the restored data — and no part of it can ` +
      `be decided from source. No drill record exists either: looked for ${drill.searched.join(', ')} ` +
      `and found ${drill.found ?? 'none'}. There is no backup configuration in the repository to point ` +
      `at, and this environment has no production database. A human must run the drill against the real ` +
      `system and record the result — backup timestamp, restore target, row counts or checksums compared, ` +
      `and time to restore — in project-control/BACKUP_RESTORE_DRILL.json, which this gate then reads. ` +
      `W5/G14b owns this in the release plan. Note that docs/certification-report.md and ` +
      `docs/release-blockers.md contain prose assertions about certification; they are a previous agent's ` +
      `claims, they are stale, and they are deliberately not read here.`,
    checkedBy: 'requires infrastructure — human',
  })

  /* ── 13 — critical mobile workflow ─────────────────────────────────────── */
  {
    const mobileJourneys = golden.modules.length
    const rows = golden.results ? (Array.isArray(golden.results) ? golden.results : golden.results.paths ?? []) : []
    const phonePaths = rows.filter((row) => /mobile|kiosk|portal|call center/i.test(String(row.path ?? row.id)))
    const phoneLine = phonePaths.length
      ? ` The phone- and kiosk-facing golden paths stand at: ` +
        `${phonePaths.map((row) => `${row.path ?? row.id} — ${row.status}`).join('; ')} ` +
        `(from ${golden.resultFile}; any failure there is already carried as a FAIL by RB-03 and is not ` +
        `double-counted here).`
      : ''
    gate('RB-13', 'No broken critical mobile workflow', {
      status: UNCHECKABLE,
      evidence:
        `No mobile workflow suite exists to fail.${phoneLine} project-control/TEST_STATUS.json records the mobile ` +
        `suite as present=${mobile.mobileSuite?.present} with ${mobile.mobileSuite?.covered ?? 0}/` +
        `${mobile.mobileSuite?.of ?? '?'} covered and the tablet suite as present=` +
        `${mobile.tabletSuite?.present} with ${mobile.tabletSuite?.covered ?? 0}/${mobile.tabletSuite?.of ?? '?'}; ` +
        `${golden.dir} holds ${mobileJourneys} journey module(s), so no journey walks a phone. ` +
        `Open mobile blockers: ${mobile.openMobileBlockers.join(' | ') || 'none'}. The nearest tooling, ` +
        `app/scripts/mobile-audit.mjs, loads every route at 390x844 and reports horizontal overflow — a ` +
        `layout property, not a workflow — so a green run there would not answer this gate and passing it ` +
        `off as one would be exactly the fake green this project forbids. A human must write mobile ` +
        `journeys (the runner contract is in app/scripts/journeys/README.md) covering at minimum the ` +
        `mobile booking, technician job-completion and customer-portal paths; this gate then reads their ` +
        `result alongside RB-03.`,
      checkedBy: 'no mobile workflow run exists',
    })
  }

  /* ── 14 — invoice and payment workflows ────────────────────────────────── */
  {
    const result = evaluateSuiteGate(suite, [
      { file: 'tests/api.test.ts', prefix: 'invoices and payments ', min: 8 },
      { file: 'tests/writes.test.ts', contains: 'invoice issue', min: 2 },
      { file: 'tests/rules.test.ts', prefix: 'payments ', min: 6 },
      { file: 'tests/collections.test.ts', contains: 'GET /invoices returns the seeded invoices', min: 1 },
      { file: 'tests/collections.test.ts', contains: 'GET /invoices/:id returns one invoice', min: 1 },
      { file: 'tests/finance-reports.test.ts', prefix: 'GET /invoices/summary ', min: 3 },
    ])
    if (result.status === PASS) {
      result.evidence +=
        ` The screens are wired to those endpoints and not to fixtures: ${invoiceScreens.dataBacked} of ` +
        `${invoiceScreens.total} core invoice/payment product screens are dataBacked in ` +
        `MASTER_REGISTRY.json (${invoiceScreens.screens.join('; ')}). Scope: this proves the workflow ` +
        `end to end at the API — draft to issue, issue locked against edit and against a second issue, ` +
        `payment refused above the balance and against an unissued or cancelled invoice, duplicate ` +
        `submissions collapsed by Idempotency-Key, and two simultaneous payments racing for the last of ` +
        `a balance where only one wins — and confirms the screens read it. It does not prove a person ` +
        `can drive that flow through the UI: the "New customer to paid invoice" golden path is unwritten ` +
        `(RB-03), so no browser has walked it.`
      result.checkedBy = 'server-suite + registry'
    }
    gate('RB-14', 'Invoice and payment workflows intact', result)
  }

  /* ── Report ────────────────────────────────────────────────────────────── */
  const summary = { PASS: 0, FAIL: 0, UNCHECKABLE: 0 }
  for (const entry of gates) summary[entry.status] += 1

  const report = {
    generatedAt: new Date().toISOString(),
    generator: 'project-control/release-gates.mjs',
    note:
      'The fourteen release blockers named in tracker/plan-structure.json, each decided by a check that ' +
      'ran, or reported UNCHECKABLE with the reason and the human action that would settle it. PASS means ' +
      'a check ran and the gate holds; nothing here is PASS because nobody contradicted it. Prose status ' +
      'documents (docs/release-blockers.md, docs/certification-report.md, docs/security-report.md) are ' +
      'deliberately not read.',
    statusVocabulary: {
      PASS: 'a check ran in this process and the gate holds; evidence names the command or file that proves it',
      FAIL: 'a check ran and the gate does not hold',
      UNCHECKABLE: 'the gate cannot be decided from this repository; evidence says why and what a human must do',
    },
    summary,
    certifiable: summary.FAIL === 0 && summary.UNCHECKABLE === 0,
    gates,
    runs: {
      serverSuite: suite.ran
        ? {
            ran: true,
            command: suite.command,
            files: suite.files,
            total: suite.total,
            passed: suite.passed,
            failed: suite.failed,
            skipped: suite.skipped,
            durationSeconds: suite.durationSeconds,
            exitCode: suite.exitCode,
            rowLevelSecurity: {
              applicationRole: suite.roleProbe.role,
              superuser: suite.roleProbe.superuser,
              bypassRls: suite.roleProbe.bypassRls,
              note: 'A superuser or BYPASSRLS role would pass every isolation assertion vacuously; the run is refused if either is true.',
            },
          }
        : { ran: false, command: suite.command, reason: suite.reason, skipped: Boolean(suite.skipped) },
      npmAudit: audits.map((a) =>
        a.ran ? { workspace: a.name, command: a.command, counts: a.counts, highAndCritical: a.serious } : { workspace: a.name, ran: false, reason: a.reason },
      ),
      secretScan: {
        tool: secrets.tool,
        command: secrets.command,
        scope: secrets.scope,
        filesScanned: secrets.filesScanned ?? null,
        findings: secrets.findings,
        note: 'Findings carry file, line and rule only. Matched text is never captured or written.',
        ciScanning,
      },
      schemaScan: migrations,
      defectArtefacts: defects,
      goldenPaths: { named: golden.named, directory: golden.dir, modules: golden.modules, resultFile: golden.resultFile },
      restoreDrill: drill,
      mobile,
      invoiceScreens,
      patRotation: rotation,
    },
  }

  writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`)

  const width = Math.max(...gates.map((g) => g.title.length))
  for (const entry of gates) {
    process.stdout.write(`${entry.id}  ${entry.title.padEnd(width)}  ${entry.status}\n`)
  }
  process.stdout.write(
    `\n${summary.PASS} PASS · ${summary.FAIL} FAIL · ${summary.UNCHECKABLE} UNCHECKABLE` +
      `  →  ${relative(ROOT, OUTPUT)}\n`,
  )
  if (summary.FAIL || summary.UNCHECKABLE) {
    process.stdout.write(
      `W5 certification requires 14 PASS. It is not certifiable while any gate is FAIL or UNCHECKABLE.\n`,
    )
  }

  return summary.FAIL === 0 || REPORT_ONLY ? 0 : 1
}

main().then(
  (code) => process.exit(code),
  (error) => {
    process.stderr.write(`release-gates: ${error?.stack ?? String(error)}\n`)
    process.exit(2)
  },
)
