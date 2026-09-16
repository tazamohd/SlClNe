import { test, expect, type Page } from '@playwright/test'

/** The icon files themselves, decoded.
 *
 *  `scripts/check-icons.mjs` checks the manifest against the files without a
 *  browser — that they exist, that the declared sizes are the real ones, that a
 *  maskable icon is present. What it cannot see is what is *in* them, and the
 *  two claims that matter are both pixel claims:
 *
 *  1. **Opaque.** The source logo is transparent with a near-white wordmark, so
 *     a transparent icon is invisible on Android's light launcher and on iOS's
 *     white home-screen composite. This is the defect the icon set exists to
 *     fix, and a regenerated icon that lost its plate would look perfectly fine
 *     in a file listing.
 *  2. **Inside the safe zone.** A maskable icon is cropped by the launcher —
 *     circle, squircle or rounded square, and the app does not get to choose.
 *     Only the centred circle of 80% diameter survives all of them. An icon
 *     that fails this is not visibly wrong until it is on a phone whose
 *     launcher happens to mask to a circle.
 */

interface Measured {
  size: number
  /** Fully opaque — no pixel below alpha 250 anywhere. */
  opaque: boolean
  /** Distance from centre to the furthest non-background pixel, in px. */
  radius: number
  /** The artwork's bounding box within the icon. */
  box: { x: number; y: number; w: number; h: number }
}

/** Decodes an icon in the page and measures where its artwork actually sits.
 *
 *  "Artwork" is every pixel that differs from the plate colour sampled at the
 *  corner — the icons are a solid plate with a mark on it, so the corner is
 *  background by construction and anything unlike it is content. */
async function measure(page: Page, url: string): Promise<Measured> {
  return page.evaluate(async (src) => {
    const img = new Image()
    img.src = src
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)

    const at = (x: number, y: number) => {
      const i = (y * width + x) * 4
      return [data[i], data[i + 1], data[i + 2], data[i + 3]]
    }
    const plate = at(0, 0)
    const differs = (p: number[]) =>
      Math.abs(p[0] - plate[0]) + Math.abs(p[1] - plate[1]) + Math.abs(p[2] - plate[2]) > 24

    let opaque = true
    let minX = width
    let minY = height
    let maxX = -1
    let maxY = -1
    let radius = 0
    const cx = width / 2
    const cy = height / 2

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = at(x, y)
        if (pixel[3] < 250) opaque = false
        if (!differs(pixel)) continue
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy)
        if (d > radius) radius = d
      }
    }

    return {
      size: width,
      opaque,
      radius,
      box: { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 },
    }
  }, url)
}

const ICONS = ['/assets/icon-192.png', '/assets/icon-512.png', '/assets/icon-maskable-512.png']

test.describe('PWA icons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  for (const icon of ICONS) {
    test(`${icon} is opaque, so the wordmark survives a light launcher`, async ({ page }) => {
      const measured = await measure(page, icon)
      expect(measured.opaque).toBe(true)
    })
  }

  test('the maskable icon keeps its artwork inside the safe circle', async ({ page }) => {
    const measured = await measure(page, '/assets/icon-maskable-512.png')

    /* The spec's safe zone: the centred circle of 80% diameter, i.e. radius
     * 40% of the icon width. Everything outside it is a launcher's to crop. */
    const safe = 0.4 * measured.size
    expect(measured.radius).toBeLessThanOrEqual(safe)

    /* And it should not be so conservative that the icon is a speck on a
     * plate — this catches a regeneration that scaled by width instead of by
     * diagonal, in the cautious direction. */
    expect(measured.radius).toBeGreaterThan(0.7 * safe)
  })

  test('the maskable artwork is centred', async ({ page }) => {
    const { size, box } = await measure(page, '/assets/icon-maskable-512.png')
    /* Measured from the source's own bounding box rather than its canvas — the
     * logo file has 63px of margin on the left and 41 on the right, so an icon
     * built by scaling the file as-is lands visibly off-centre. Two px of
     * slack absorbs the antialiased edge. */
    expect(Math.abs(box.x - (size - box.w - box.x))).toBeLessThanOrEqual(2)
    expect(Math.abs(box.y - (size - box.h - box.y))).toBeLessThanOrEqual(2)
  })

  test('the manifest and the icons on disk agree', async ({ page, request }) => {
    const manifest = await (await request.get('/manifest.json')).json()
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2)

    for (const icon of manifest.icons) {
      const measured = await measure(page, `/${icon.src}`)
      expect(`${measured.size}x${measured.size}`, `${icon.src} declared size`).toBe(icon.sizes)
    }
  })
})
