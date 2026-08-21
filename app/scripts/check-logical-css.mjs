#!/usr/bin/env node
/**
 * Fails if a source file uses a physical-direction Tailwind utility that has a
 * logical equivalent. The app renders Arabic RTL from the same markup as
 * English, so `mr-2` or `rounded-tl` silently mirrors wrong instead of
 * breaking loudly — which is why this is a check and not a review habit.
 *
 * Run: node scripts/check-logical-css.mjs   (npm run lint:css)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = resolve(fileURLToPath(new URL('.', import.meta.url)), '../src')

/**
 * A Tailwind value: `auto`, `full`, `px`, a number/fraction, or an arbitrary
 * `[...]` value. Requiring one keeps prose out of the results — "right-aligned"
 * in a comment and `ml-fraud-detection` in a data file are not class names.
 */
const VALUE = String.raw`(?:auto|full|px|screen|\d[\w./%-]*|\[[^\]]+\])(?![\w-])`

/** Physical utility → the logical utility to use instead. */
const BANNED = [
  [new RegExp(String.raw`\bm[lr]-${VALUE}`, 'g'), 'ms-* / me-*'],
  [new RegExp(String.raw`\bp[lr]-${VALUE}`, 'g'), 'ps-* / pe-*'],
  [/\btext-(left|right)(?![\w-])/g, 'text-start / text-end'],
  [new RegExp(String.raw`\bborder-[lr](?:-${VALUE})?(?![\w-])`, 'g'), 'border-s-* / border-e-*'],
  [new RegExp(String.raw`\brounded-(?:tl|tr|bl|br)(?:-${VALUE})?(?![\w-])`, 'g'), 'rounded-ss / se / es / ee'],
  [new RegExp(String.raw`(?<![\w-])(?:left|right)-${VALUE}`, 'g'), 'start-* / end-*'],
  [new RegExp(String.raw`\binset-[lr]-${VALUE}`, 'g'), 'inset-s-* / inset-e-*'],
]

/**
 * `left-1/2` paired with `-translate-x-1/2` centres a symmetric element; it is
 * identical under mirroring and has no logical spelling, so it is allowed.
 * The regex above already exempts the `1/2` value — this is the paired check
 * that keeps the exemption honest.
 */
function centringException(line) {
  return /\bleft-1\/2\b/.test(line) && /-translate-x-1\/2/.test(line)
}

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
    if (centringException(line)) return
    for (const [pattern, fix] of BANNED) {
      for (const [match] of line.matchAll(pattern)) {
        findings.push({ file: relative(SRC, file), line: i + 1, match, fix })
      }
    }
  })
}

if (findings.length === 0) {
  console.log('logical-css: clean — no physical-direction utilities in src/')
  process.exit(0)
}

for (const f of findings) console.error(`${f.file}:${f.line}  ${f.match}  →  use ${f.fix}`)
console.error(`\nlogical-css: ${findings.length} physical-direction utilit${findings.length === 1 ? 'y' : 'ies'} found.`)
process.exit(1)
