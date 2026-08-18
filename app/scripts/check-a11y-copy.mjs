#!/usr/bin/env node
/**
 * Fails if a source file has a literal `aria-label="..."` with human copy.
 *
 * Under Arabic, an Arabic-speaking screen-reader user hears whatever string is
 * stored — a literal `"Toggle language"` reaches them as English. The fix is
 * to wrap the value in `t()` so the same translation layer that handles
 * visible copy also handles the copy screen readers hear.
 *
 * Run: node scripts/check-a11y-copy.mjs   (npm run lint:a11y)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = resolve(fileURLToPath(new URL('.', import.meta.url)), '../src')

/** Values that don't need translating — brand names, punctuation, empty. */
const EXEMPT = /^(SALIS AUTO|)$/

function* sourceFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) yield* sourceFiles(path)
    else if (/\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path)) yield path
  }
}

const findings = []
for (const file of sourceFiles(SRC)) {
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    for (const match of line.matchAll(/aria-label="([^"]+)"/g)) {
      const [, value] = match
      if (EXEMPT.test(value)) continue
      findings.push({ file: relative(SRC, file), line: i + 1, value })
    }
  })
}

if (findings.length === 0) {
  console.log('a11y-copy: clean — every aria-label goes through t()')
  process.exit(0)
}

for (const f of findings) console.error(`${f.file}:${f.line}  aria-label="${f.value}"  →  aria-label={t("${f.value}")}`)
console.error(`\na11y-copy: ${findings.length} literal aria-label${findings.length === 1 ? '' : 's'} found.`)
process.exit(1)
