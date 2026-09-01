// Arabic-completeness gate: finds English `t('...')` keys with no Arabic.
//
// `t` (PreferencesProvider) resolves `rtl ? (LOOKUP[source] ?? source) : source`,
// so any literal passed to `t(...)` that is NOT a key in the lookup renders as
// English while the app runs in Arabic. This script statically scans src for
// literal-argument call sites, subtracts the union of the generated dictionary
// (`src/data/generated/ar.ts`) and the hand-maintained supplement
// (`src/data/ar-overrides.ts`), and fails if any key is left uncovered.
//
// Dynamic calls — `t(variable)`, `t(a ?? 'b')`, `t(`x${y}`)`, `t('a' + b)` — are
// data-driven and can't be checked statically, so they're skipped and COUNTED
// (never silently dropped) so the residual gap stays visible.
//
//   node scripts/check-i18n.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const appDir = resolve(here, '..')
const srcDir = resolve(appDir, 'src')

// ── Collect the source files to scan ─────────────────────────────────────────
function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (/\.tsx?$/.test(name) && !/\.d\.ts$/.test(name)) out.push(p)
  }
  return out
}

import { recordKeys, scanFile } from './lib/i18n-scan.mjs'

// ── Run ──────────────────────────────────────────────────────────────────────
const covered = new Set([
  ...recordKeys(resolve(srcDir, 'data/generated/ar.ts')),
  ...recordKeys(resolve(srcDir, 'data/ar-overrides.ts')),
])

const files = walk(srcDir).sort()
const allLiterals = new Set()
const missingByFile = new Map()
let literalSites = 0
let dynamicSites = 0

for (const file of files) {
  const { literals, dynamic } = scanFile(readFileSync(file, 'utf8'))
  literalSites += literals.length
  dynamicSites += dynamic
  const missing = new Set()
  for (const key of literals) {
    allLiterals.add(key)
    if (!covered.has(key)) missing.add(key)
  }
  if (missing.size) missingByFile.set(relative(appDir, file), [...missing].sort())
}

const uncoveredKeys = new Set()
for (const keys of missingByFile.values()) for (const k of keys) uncoveredKeys.add(k)

console.log('i18n coverage check — Arabic completeness\n')
console.log(`  source files scanned : ${files.length}`)
console.log(`  literal t() sites    : ${literalSites} (${allLiterals.size} unique keys)`)
console.log(`  dynamic t() sites    : ${dynamicSites} (skipped — not statically checkable)`)
console.log(
  `  coverage             : ${allLiterals.size - uncoveredKeys.size} of ${allLiterals.size} unique literals covered`
)

if (uncoveredKeys.size === 0) {
  console.log('\n  OK — every literal t() key has an Arabic translation.')
  process.exit(0)
}

console.log(`\n  MISSING — ${uncoveredKeys.size} key(s) would fall back to English in Arabic mode:\n`)
for (const [file, keys] of [...missingByFile].sort()) {
  console.log(`  ${file}`)
  for (const k of keys) console.log(`      ${JSON.stringify(k)}`)
}
console.log(`\n  Add Arabic for these in src/data/ar-overrides.ts, then re-run.`)
process.exit(1)
