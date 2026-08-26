// Extracts route -> title pairs from the registry and prints JS object
// entries to merge into smoke.mjs' EXPECTED_TEXT map.
//
//   node scripts/expand-smoke-assertions.mjs > _assertions.txt
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const registryFile = path.join(APP, 'src/data/generated/master-registry.ts')
const smokeFile = path.join(APP, 'scripts/smoke.mjs')

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

const slugOf = (name) =>
  name.replace(/-/g, ' ').replace(/([A-Z])/g, ' $1').trim().replace(/\s+/g, ' ')

const lines = []
let added = 0
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

  // The shell-contract or pending-screen assertion already covers placeholder
  // routes. Skip if this is a no-content route.
  if (entry.flags && entry.flags.includes('PLACEHOLDER')) {
    skipped++
    skippedReasons['placeholder'] = ( skippedReasons['placeholder'] || 0 ) + 1
    continue
  }

  // The screen usually renders its title. Use the title as the expected
  // marker, normalised so casing and dashes don't trip the match.
  const title = String(entry.title).trim()
  if (!title || title.length < 3) {
    skipped++
    skippedReasons['empty-title'] = ( skippedReasons['empty-title'] || 0 ) + 1
    continue
  }

  lines.push(`  '${entry.route}': ${JSON.stringify(title)},`)
  added++
}

console.log(`// ${added} new content assertions derived from the registry.`)
console.log(`// ${skipped} routes skipped (reasons: ${Object.entries(skippedReasons).map(([k, v]) => `${k}=${v}`).join(' ')})`)
console.log(`// Existing: ${existing.size} routes already have assertions.`)
console.log('')
for (const l of lines) console.log(l)