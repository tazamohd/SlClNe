#!/usr/bin/env node
/** Generates the PWA icon set from the brand logo.
 *
 *  Run by hand when `public/assets/logo-blue-orange.png` changes, not on every
 *  build: the output is committed, and requiring a browser to produce `dist/`
 *  would be a poor trade for three files that change about once a year. The
 *  gate that keeps the committed output honest is `scripts/check-icons.mjs`.
 *
 *      node scripts/build-icons.mjs
 *
 *  ### Why the source logo cannot be the icon
 *
 *  Three separate reasons, all invisible until the icon is on a device:
 *
 *  1. **It is transparent, and its wordmark is near-white.** On Android's light
 *     launcher, on a white iOS home screen composite, and on the light desktop
 *     install prompt, "SALIS AUTO" disappears into the background. Every icon
 *     here gets an opaque brand plate.
 *  2. **The artwork is not centred.** Its content occupies a 396x278 box inside
 *     the 500x500 canvas, with 63px of margin on the left and 41px on the
 *     right — so scaling the file as-is produces an icon that sits visibly
 *     off-centre. The bounding box is measured here and re-centred.
 *  3. **Maskable icons get cropped.** Android masks to a circle, a squircle or
 *     a rounded square depending on the launcher, and only the centred circle
 *     of 80% diameter is guaranteed to survive. A landscape mark scaled to fill
 *     the square loses its ends.
 *
 *  ### Why a browser
 *
 *  Chromium is already a dev dependency for Playwright, and it is a better
 *  rasteriser than anything that could be added for this — no new dependency,
 *  and the scaling is the same resampling the browser does everywhere else.
 */
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(APP, 'public/assets/logo-blue-orange.png')
const OUT_DIR = join(APP, 'public/assets')

/** The plate colour, read from the design tokens rather than restated — the
 *  same value the splash screen, the native shells and the status bar use, so
 *  the icon cannot drift away from them. */
function brandNavy() {
  const css = readFileSync(join(APP, 'src/styles/tokens/colors.css'), 'utf8')
  const value = css.match(/--salis-navy:\s*(#[0-9A-Fa-f]{6})/)?.[1]
  if (!value) throw new Error('--salis-navy not found in src/styles/tokens/colors.css')
  return value
}

/** The fraction of the canvas the artwork spans.
 *
 *  `maskable` is the one that is specified rather than chosen: the safe zone is
 *  the centred circle of 80% diameter, so the artwork's *diagonal* — not its
 *  width — has to fit inside it, or the corners of a landscape mark are cropped
 *  by a circular mask. `any` is a plain aesthetic margin; nothing crops it. */
const TARGETS = [
  { file: 'icon-192.png', size: 192, purpose: 'any', fill: 0.84 },
  { file: 'icon-512.png', size: 512, purpose: 'any', fill: 0.84 },
  { file: 'icon-maskable-512.png', size: 512, purpose: 'maskable', fill: 0.8 },
]

const background = brandNavy()
const dataUrl = `data:image/png;base64,${readFileSync(SOURCE).toString('base64')}`

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? undefined,
})
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } })

/** The artwork's real extent inside its canvas, by alpha. */
const box = await page.evaluate(async (src) => {
  const img = new Image()
  img.src = src
  await img.decode()
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // 8/255 rather than 0: the mark has a faint antialiased halo whose outer
      // pixels are visually nothing but would inflate the box by several px.
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  return { canvas: width, x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
}, dataUrl)

console.log(
  `build-icons: source ${box.canvas}x${box.canvas}, artwork ${box.w}x${box.h} at ` +
    `(${box.x},${box.y}); plate ${background}`
)

for (const target of TARGETS) {
  const { size, fill, purpose, file } = target

  /* `maskable` fits the diagonal into the safe circle; `any` fits the longer
   * side into the margin. Both then scale the *whole* source by that factor —
   * the trim is done by offsetting, not by cropping, so no resampling of an
   * already-resampled image. */
  const scale =
    purpose === 'maskable'
      ? (fill * size) / Math.hypot(box.w, box.h)
      : (fill * size) / Math.max(box.w, box.h)

  // Offset so the *artwork's* box lands centred, not the source canvas.
  const left = (size - box.w * scale) / 2 - box.x * scale
  const top = (size - box.h * scale) / 2 - box.y * scale

  await page.setContent(
    `<style>
       html,body{margin:0;background:${background}}
       #plate{position:relative;width:${size}px;height:${size}px;background:${background};overflow:hidden}
       #plate img{position:absolute;left:${left}px;top:${top}px;width:${box.canvas * scale}px;height:auto;image-rendering:auto}
     </style>
     <div id="plate"><img src="${dataUrl}" alt=""></div>`
  )
  await page.locator('#plate img').first().waitFor()

  const png = await page.locator('#plate').screenshot({ type: 'png' })
  writeFileSync(join(OUT_DIR, file), png)

  const drawn = { w: Math.round(box.w * scale), h: Math.round(box.h * scale) }
  if (purpose === 'maskable') {
    const radius = Math.hypot(drawn.w, drawn.h) / 2
    const safe = 0.4 * size
    if (radius > safe + 0.5) {
      throw new Error(
        `${file}: artwork radius ${radius.toFixed(1)}px exceeds the ${safe}px safe zone`
      )
    }
    console.log(
      `  ${file}  ${size}x${size}  ${purpose}  artwork ${drawn.w}x${drawn.h}, ` +
        `radius ${radius.toFixed(1)}/${safe} of the safe circle`
    )
  } else {
    console.log(`  ${file}  ${size}x${size}  ${purpose}  artwork ${drawn.w}x${drawn.h}`)
  }
}

await browser.close()
console.log('build-icons: OK — remember to commit public/assets/icon-*.png')
