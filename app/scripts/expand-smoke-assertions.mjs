// Extracts route -> title pairs from the registry and merges them into
// smoke.mjs' EXPECTED_TEXT map. Idempotent — existing entries are preserved.
//
//   node scripts/expand-smoke-assertions.mjs          # merge into smoke.mjs
//   node scripts/expand-smoke-assertions.mjs --dry    # print what would be added
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const registryFile = path.join(APP, 'src/data/generated/master-registry.ts')
const smokeFile = path.join(APP, 'scripts/smoke.mjs')
const DRY = process.argv.includes('--dry')

const source = fs.readFileSync(registryFile, 'utf8')
const marker = source.indexOf('export const REGISTRY')
const open = source.indexOf('= [', marker)
const jsonText = source.slice(open + 2, source.lastIndexOf(']') + 1)
const entries = JSON.parse(jsonText)

const smokeSource = fs.readFileSync(smokeFile, 'utf8')
const expectedBlock = smokeSource.match(/const EXPECTED_TEXT = \{([\s\S]*?)\n\}/)
const existing = new Set()
if (expectedBlock) {
  const m = expectedBlock[1].matchAll(/'([^']+)':/g)
  for (const g of m) existing.add(g[1])
}

const redirectBlock = smokeSource.match(/const EXPECTED_REDIRECTS = \{([\s\S]*?)\n\}/)
const redirects = new Set()
if (redirectBlock) {
  for (const g of redirectBlock[1].matchAll(/'([^']+)':/g)) redirects.add(g[1])
}

const newLines = []
let skipped = 0
const skippedReasons = {}

for (const entry of entries) {
  if (entry.category !== 'PRODUCT') continue
  if (!entry.route || !entry.title) continue
  if (entry.status !== 'IMPLEMENTED') continue
  if (entry.route === '/splash') continue
  if (entry.shell === 'none') continue
  if (redirects.has(entry.route)) continue
  if (existing.has(entry.route)) continue

  if (entry.flags && entry.flags.includes('PLACEHOLDER')) {
    skipped++
    skippedReasons['placeholder'] = (skippedReasons['placeholder'] || 0) + 1
    continue
  }

  const title = String(entry.title).trim()
  if (!title || title.length < 3) {
    skipped++
    skippedReasons['empty-title'] = (skippedReasons['empty-title'] || 0) + 1
    continue
  }

  newLines.push(`  '${entry.route}': ${JSON.stringify(title)},`)
}

console.log(`// ${newLines.length} new content assertions derived from the registry.`)
console.log(`// ${skipped} routes skipped (reasons: ${Object.entries(skippedReasons).map(([k, v]) => `${k}=${v}`).join(' ')})`)
console.log(`// Existing: ${existing.size} routes already have assertions.`)

if (newLines.length === 0) {
  console.log('\n// Nothing to add — all product routes are already asserted.')
  process.exit(0)
}

if (DRY) {
  console.log('')
  for (const l of newLines) console.log(l)
  process.exit(0)
}

// Merge into the smoke file by inserting before the closing brace of EXPECTED_TEXT.
const closingIdx = smokeSource.indexOf('\n}', expectedBlock.index + expectedBlock[0].length - 2)
if (closingIdx < 0) {
  console.error('ERROR: could not find the closing brace of EXPECTED_TEXT in smoke.mjs')
  process.exit(1)
}

const before = smokeSource.slice(0, closingIdx)
const after = smokeSource.slice(closingIdx)
const merged = before + '\n' + newLines.join('\n') + after

fs.writeFileSync(smokeFile, merged)
console.log(`\nMerged ${newLines.length} assertions into scripts/smoke.mjs`)
