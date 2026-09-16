#!/usr/bin/env node
/** The service-worker gate. Run after `npm run build`.
 *
 *  Everything it checks is a way the worker fails *silently* — the build is
 *  green, the app loads, and the only symptom is that the thing you added the
 *  worker for does not happen, or happens to data it should never touch. None
 *  of it is visible in a diff:
 *
 *    - a surviving `__SW_*__` placeholder — a worker that precaches nothing;
 *    - a precache entry that is not in `dist/` — `addAll` rejects atomically,
 *      so one 404 means the whole install fails and nothing is ever cached;
 *    - a missing API bypass — the one that decides whether tenant-scoped
 *      responses end up in a per-origin cache that outlives the session.
 *
 *  Run: node scripts/check-sw.mjs   (npm run check-sw)
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(APP, 'dist')
const WORKER = join(DIST, 'sw.js')

const failures = []
const note = (message) => failures.push(message)

if (!existsSync(WORKER)) {
  console.error('check-sw: dist/sw.js not found — run `npm run build` first.')
  process.exit(1)
}

const source = readFileSync(WORKER, 'utf8')

// 1. Substitution actually happened.
if (/__SW_[A-Z]+__/.test(source)) note('a __SW_*__ placeholder survived the build')

// 2. Every precached URL exists on disk.
const listed = source.match(/const PRECACHE = (\[[\s\S]*?\])\n/)
if (!listed) {
  note('could not read the PRECACHE list out of dist/sw.js')
} else {
  let precache
  try {
    precache = JSON.parse(listed[1])
  } catch {
    precache = null
    note('PRECACHE is not valid JSON')
  }
  if (precache) {
    if (precache.length < 3) note(`PRECACHE has only ${precache.length} entries`)
    const base = source.match(/const SCOPE_PATH = "([^"]*)"/)?.[1] ?? '/'
    for (const url of precache) {
      if (!url.startsWith(base)) {
        note(`precache entry ${url} is outside the worker's scope ${base}`)
        continue
      }
      if (!existsSync(join(DIST, url.slice(base.length)))) {
        note(`precache entry ${url} is not in dist/ — addAll would reject and cache nothing`)
      }
    }
  }
}

// 3. The bypasses that keep business data out of a per-origin cache.
const required = [
  [/request\.method !== 'GET'/, 'the non-GET bypass'],
  [/url\.origin !== self\.location\.origin/, 'the cross-origin bypass'],
  [/isApiPath\(url\.pathname\)/, 'the same-origin API bypass'],
  [/response\.type !== 'basic'/, 'the opaque-response guard'],
]
for (const [pattern, what] of required) {
  if (!pattern.test(source)) note(`${what} is missing from the fetch handler`)
}

// 4. A worker that claims a version it did not get.
if (!/const CACHE_NAME = `salis-auto-\$\{SW_VERSION\}`/.test(source)) {
  note('the cache name no longer derives from SW_VERSION — old caches will not be evicted')
}

if (failures.length) {
  console.error('check-sw: FAIL\n' + failures.map((f) => `  - ${f}`).join('\n'))
  process.exit(1)
}

const version = source.match(/const SW_VERSION = "([^"]*)"/)?.[1] ?? '?'
const count = (source.match(/"[^"]+"/g) || []).length
console.log(`check-sw: OK — version ${version}, precache verified against dist/ (${count} strings)`)
