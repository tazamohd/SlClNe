// Bundle-budget gate. Fails the build if any single JS chunk grows past the
// budget, which is how a stray static import that re-collapses the app back into
// one monolithic chunk gets caught in CI rather than in a user's first paint.
//
// Run after `vite build`. No dependencies — reads dist/ and gzips with the
// built-in zlib so the number matches what the browser actually downloads.
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// The largest chunk today is the shared entry (~332 kB raw); a route split put
// every domain behind its own lazy chunk, so nothing else comes close. The
// budget sits just above that: enough headroom for a screen or two, low enough
// that regressing toward the pre-split 1.4 MB monolith trips it immediately.
const BUDGET_KB = 375

const assetsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'assets')

if (!existsSync(assetsDir)) {
  console.error(`check-bundle: ${assetsDir} not found — run \`npm run build\` first.`)
  process.exit(1)
}

const chunks = readdirSync(assetsDir)
  .filter((f) => f.endsWith('.js'))
  .map((f) => {
    const raw = readFileSync(join(assetsDir, f))
    return { file: f, raw: raw.length, gzip: gzipSync(raw).length }
  })
  .sort((a, b) => b.raw - a.raw)

if (chunks.length === 0) {
  console.error('check-bundle: no .js chunks in dist/assets — did the build succeed?')
  process.exit(1)
}

const kb = (n) => (n / 1024).toFixed(1)
console.log(`Bundle chunks (${chunks.length}), largest first — budget ${BUDGET_KB} kB raw:\n`)
for (const c of chunks) {
  const flag = c.raw > BUDGET_KB * 1024 ? '  <-- OVER BUDGET' : ''
  console.log(`  ${kb(c.raw).padStart(8)} kB raw   ${kb(c.gzip).padStart(7)} kB gzip   ${c.file}${flag}`)
}

const largest = chunks[0]
if (largest.raw > BUDGET_KB * 1024) {
  console.error(
    `\ncheck-bundle: FAIL — ${largest.file} is ${kb(largest.raw)} kB, over the ${BUDGET_KB} kB budget.` +
      `\nSomething is pulling a large module into a single chunk. Check for a static import` +
      `\nof a screen or domain that should be lazy in src/routes/index.tsx.`
  )
  process.exit(1)
}

console.log(`\ncheck-bundle: OK — largest chunk ${largest.file} is ${kb(largest.raw)} kB (budget ${BUDGET_KB} kB).`)
