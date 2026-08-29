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

// ── Extract the keys defined by a `Record<string,string>` module ─────────────
// Both ar.ts (JSON-stringified) and ar-overrides.ts keep one entry per line with
// the key as a leading string literal, so a single line-anchored regex covers
// both without evaluating the TS.
const KEY_RE = /^\s*"((?:\\.|[^"\\])*)"\s*:/gm
function recordKeys(file) {
  const text = readFileSync(file, 'utf8')
  const keys = new Set()
  for (const m of text.matchAll(KEY_RE)) keys.add(JSON.parse(`"${m[1]}"`))
  return keys
}

// ── Scan one source file for `t(...)` call sites ─────────────────────────────
// Returns { literals: string[], dynamic: number }. A call counts as a literal
// only when its sole argument is a plain string closed immediately by `)`; a
// template with `${…}` interpolation or anything else is dynamic.
const UNESCAPE = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', 0: '\0' }
function scanFile(text) {
  const literals = []
  let dynamic = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== 't' || text[i + 1] !== '(') continue
    const prev = text[i - 1]
    if (prev && /[\w.$]/.test(prev)) continue // part of an identifier / member access
    let j = i + 2
    while (j < text.length && /\s/.test(text[j])) j++
    const quote = text[j]
    if (quote !== '"' && quote !== "'" && quote !== '`') {
      dynamic++ // t(identifier), t(a ?? 'b'), t(expr) …
      continue
    }
    // Read the string literal, unescaping as we go.
    let value = ''
    let interpolated = false
    let closed = false
    let k = j + 1
    for (; k < text.length; k++) {
      const c = text[k]
      if (c === '\\') {
        const n = text[++k]
        value += UNESCAPE[n] ?? n
      } else if (c === quote) {
        closed = true
        break
      } else if (quote === '`' && c === '$' && text[k + 1] === '{') {
        interpolated = true
        value += c
      } else {
        value += c
      }
    }
    if (!closed) {
      dynamic++
      continue
    }
    // The literal must be the whole argument: next non-space char is `)`.
    let m = k + 1
    while (m < text.length && /\s/.test(text[m])) m++
    if (interpolated || text[m] !== ')') dynamic++
    else literals.push(value)
    i = k
  }
  return { literals, dynamic }
}

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
