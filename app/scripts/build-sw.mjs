#!/usr/bin/env node
/** Fills in the service worker's generated values, after `vite build`.
 *
 *  The worker itself is hand-written (`public/sw.js`) and Vite copies it to
 *  `dist/` verbatim, placeholders and all. What it cannot know at authoring
 *  time is the hashed filenames of the build it is meant to cache, so this
 *  reads them out of the built `index.html` — the one file that already names
 *  every entry asset, and the one place they cannot drift from what the browser
 *  actually loads. A hand-maintained list here would be wrong the first time
 *  someone added a vendor chunk.
 *
 *  Three substitutions:
 *    __SW_VERSION__   a hash of the precache list, so a deploy that changed
 *                     nothing keeps its cache and one that changed anything
 *                     gets a fresh one and drops the old.
 *    __SW_SCOPE__     the base path, because GitHub Pages serves this under
 *                     /<repo>/ while Netlify, Vercel and the container serve it
 *                     at the root.
 *    __SW_PRECACHE__  the shell: index.html, the entry bundle, the vendor
 *                     chunks, the stylesheet, the fonts, the icon, the manifest.
 *
 *  Run: node scripts/build-sw.mjs   (wired into `npm run build`)
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(APP, 'dist')
const INDEX = join(DIST, 'index.html')
const WORKER = join(DIST, 'sw.js')

function fail(message) {
  console.error(`build-sw: ${message}`)
  process.exit(1)
}

if (!existsSync(INDEX)) fail(`${INDEX} not found — run \`vite build\` first.`)
if (!existsSync(WORKER)) fail(`${WORKER} not found — is public/sw.js still there?`)

const html = readFileSync(INDEX, 'utf8')

/** The base path Vite built with, recovered from the entry script's own URL
 *  rather than from the environment — the environment can be set differently
 *  from the build being patched, the built file cannot. */
const entry = html.match(/<script[^>]+src="([^"]+)"/)?.[1]
if (!entry) fail('no entry <script src> in index.html — cannot determine the base path.')
const base = entry.slice(0, entry.indexOf('assets/'))
if (!base.endsWith('/')) fail(`entry script ${entry} is not under an assets/ directory.`)

/** Every URL `index.html` itself pulls in: the entry module, the modulepreload
 *  chunks, the stylesheet, the preloaded fonts, the icon and the manifest. */
const referenced = new Set([entry])
for (const [, href] of html.matchAll(/<link[^>]+href="([^"]+)"/g)) referenced.add(href)

/** Keep only same-origin build output. A CDN URL or a `data:` icon is not this
 *  worker's to cache, and `addAll` rejects the whole install if one entry 404s
 *  — so anything not on disk is dropped here rather than breaking the install. */
const precache = [`${base}index.html`]
for (const href of [...referenced].sort()) {
  if (!href.startsWith(base)) continue
  const onDisk = join(DIST, href.slice(base.length))
  if (!existsSync(onDisk)) {
    console.warn(`build-sw: skipping ${href} — referenced by index.html but not in dist/.`)
    continue
  }
  precache.push(href)
}

if (precache.length < 3) {
  fail(`only ${precache.length} precache entries — index.html looks unparsed, refusing to ship.`)
}

/** Version from the *content* of what is cached, not from a timestamp: a
 *  rebuild that produced identical output should not invalidate every client's
 *  cache, and a rebuild that changed one chunk must. */
const version = createHash('sha256')
  .update(precache.join('\n'))
  .digest('hex')
  .slice(0, 12)

let worker = readFileSync(WORKER, 'utf8')
const substitutions = [
  ["'__SW_VERSION__'", JSON.stringify(version)],
  ["'__SW_SCOPE__'", JSON.stringify(base)],
  ['__SW_PRECACHE__', JSON.stringify(precache, null, 2)],
]
for (const [placeholder, value] of substitutions) {
  if (!worker.includes(placeholder)) fail(`placeholder ${placeholder} not found in dist/sw.js.`)
  worker = worker.replace(placeholder, value)
}

/* A placeholder left behind means a silently broken worker — one that caches
 * nothing, or caches under the literal string. Cheaper to catch here. */
if (/__SW_[A-Z]+__/.test(worker)) fail('a __SW_*__ placeholder survived substitution.')

writeFileSync(WORKER, worker)

console.log(
  `build-sw: OK — version ${version}, scope ${base}, ${precache.length} precached:\n` +
    precache.map((url) => `  ${url}`).join('\n')
)
