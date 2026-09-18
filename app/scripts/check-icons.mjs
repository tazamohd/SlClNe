#!/usr/bin/env node
/** The icon gate: the web manifest against the files it names.
 *
 *  This exists because the manifest already carried exactly the kind of lie it
 *  checks for — a `1024x1024` icon entry pointing at a 500x500 file. Nothing
 *  surfaces that: the build is green, the page loads, the icon renders, and the
 *  only consequence is a browser picking the wrong candidate for a size it was
 *  told existed. The same is true of a manifest entry whose file was never
 *  committed, and of losing the maskable icon in a refactor.
 *
 *  Pure Node on purpose — no browser, so it can run in the build job. PNG
 *  dimensions come out of the IHDR chunk, which is the first thing in the file
 *  and needs no decoding. The pixel-level claims (opaque, artwork inside the
 *  maskable safe zone) need a rasteriser and live in `e2e/icons.spec.ts`.
 *
 *  Run: node scripts/check-icons.mjs   (npm run check-icons)
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(APP, 'public')

const failures = []
const note = (message) => failures.push(message)

/** Width and height from a PNG's IHDR: an 8-byte signature, then the chunk
 *  length and type, then width and height as big-endian uint32. */
function pngSize(file) {
  const bytes = readFileSync(file)
  const signature = '89504e470d0a1a0a'
  if (bytes.subarray(0, 8).toString('hex') !== signature) return null
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}

const manifest = JSON.parse(readFileSync(join(PUBLIC, 'manifest.json'), 'utf8'))
const icons = manifest.icons ?? []

if (!icons.length) note('the manifest declares no icons')

for (const icon of icons) {
  const src = String(icon.src ?? '')
  /* `start_url` and `scope` are relative so the manifest works at the root and
   * under the GitHub Pages sub-path; icon `src` is relative for the same
   * reason, and resolves against the manifest's own location. */
  if (src.startsWith('/') || /^https?:/.test(src)) {
    note(`icon ${src} is absolute — it will not resolve under a base path`)
    continue
  }
  const file = join(PUBLIC, src)
  if (!existsSync(file)) {
    note(`icon ${src} is in the manifest but not in public/`)
    continue
  }
  const actual = pngSize(file)
  if (!actual) {
    note(`icon ${src} is not a PNG, but is declared as ${icon.type ?? 'image/png'}`)
    continue
  }
  const declared = String(icon.sizes ?? '')
  const expected = `${actual.width}x${actual.height}`
  if (declared !== expected) {
    note(`icon ${src} declares ${declared || '(nothing)'} but the file is ${expected}`)
  }
  if (actual.width !== actual.height) {
    note(`icon ${src} is ${expected} — an icon must be square`)
  }
}

/** Chrome will not offer a PWA install without an icon of at least 192px, and
 *  Android falls back to a shrunken-and-plated version of a non-maskable icon,
 *  which is the look this icon set exists to avoid. */
const purposes = icons.flatMap((icon) => String(icon.purpose ?? 'any').split(/\s+/))
if (!purposes.includes('maskable')) note('no icon declares purpose "maskable"')
if (!purposes.includes('any')) note('no icon declares purpose "any"')

const largest = Math.max(
  0,
  ...icons.map((icon) => Number(String(icon.sizes ?? '0x0').split('x')[0]) || 0)
)
if (largest < 512) note(`the largest declared icon is ${largest}px; 512 is the floor`)

/* A maskable icon is *not* interchangeable with an `any` one — it carries the
 * safe-zone padding, so a launcher that uses it unmasked shows a small mark in
 * a large plate. Sharing one file between both purposes is how that happens. */
const bySrc = new Map()
for (const icon of icons) {
  const list = bySrc.get(icon.src) ?? []
  list.push(...String(icon.purpose ?? 'any').split(/\s+/))
  bySrc.set(icon.src, list)
}
for (const [src, list] of bySrc) {
  if (list.includes('maskable') && list.includes('any')) {
    note(`icon ${src} is declared both "any" and "maskable" — they need different padding`)
  }
}

/** Icons the HTML references directly, which bypass the manifest entirely. */
const html = readFileSync(join(APP, 'index.html'), 'utf8')
for (const [, rel, href] of html.matchAll(
  /<link[^>]*rel="((?:apple-touch-)?icon)"[^>]*href="([^"]+)"/g
)) {
  const file = join(PUBLIC, href.replace(/^\//, ''))
  if (!existsSync(file)) note(`index.html rel="${rel}" points at ${href}, which is not in public/`)
}

if (failures.length) {
  console.error('check-icons: FAIL\n' + failures.map((f) => `  - ${f}`).join('\n'))
  process.exit(1)
}

console.log(
  `check-icons: OK — ${icons.length} manifest icon(s), sizes match their files, ` +
    'maskable present'
)
