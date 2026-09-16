import { test, expect, type Page } from '@playwright/test'
import { seedRole, gotoReady } from './helpers'

/** The service worker, in a real browser, really offline.
 *
 *  Everything else about the worker is checked by evaluating its source
 *  (`tests/service-worker.test.ts`) or by reading the built file
 *  (`scripts/check-sw.mjs`). Neither can tell you whether a browser actually
 *  installs it, claims the page, and answers from cache when the network is
 *  gone — which is the entire claim being made. So this suite installs the
 *  real worker against the preview build and then pulls the network out.
 *
 *  It runs against `npm run preview`, i.e. `dist/` with the generated worker,
 *  which is what `playwright.config.ts` serves. The worker is inert in `vite
 *  dev`, so there is nothing here that could pass on a dev server by accident.
 */

/** Waits until a worker controls the page.
 *
 *  Registration happens after mount and installation is asynchronous, so every
 *  assertion below has to wait for it rather than assume it. A fresh install
 *  calls `skipWaiting`, which is why the page ends up controlled without a
 *  second reload. */
async function waitForController(page: Page): Promise<void> {
  await page.waitForFunction(() => !!navigator.serviceWorker?.controller, null, { timeout: 20_000 })
}

test.describe('Service worker', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'the suite runs on chromium; service worker support elsewhere is not what this is testing'
  )

  test('installs, claims the page, and precaches the shell', async ({ page }) => {
    await gotoReady(page, '/login')
    await waitForController(page)

    const state = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration()
      const names = await caches.keys()
      const ours = names.filter((n) => n.startsWith('salis-auto-'))
      const cache = ours.length ? await caches.open(ours[0]) : null
      const keys = cache ? (await cache.keys()).map((r) => new URL(r.url).pathname) : []
      return { scope: registration?.scope ?? null, caches: ours, keys }
    })

    expect(state.scope).toContain('localhost')
    expect(state.caches).toHaveLength(1)
    // The shell is what a navigation falls back to, so its presence is the
    // difference between "offline works" and "offline shows the dino".
    expect(state.keys).toContain('/index.html')
    expect(state.keys.some((k) => /^\/assets\/index-.*\.js$/.test(k))).toBe(true)
  })

  test('renders the app with the network cut off', async ({ page, context }) => {
    await seedRole(context, 'owner')
    await gotoReady(page, '/dashboard')
    await waitForController(page)
    /* Reload once while online so the controlled load populates the runtime
     * cache with the route's own lazy chunks — a worker that claims a page
     * mid-life did not serve the chunks that page already loaded. */
    await page.reload({ waitUntil: 'networkidle' })

    await context.setOffline(true)
    try {
      await page.reload({ waitUntil: 'domcontentloaded' })
      await expect(page.locator('#root')).not.toBeEmpty()
      await expect(page.locator('body')).toContainText(/Dashboard/i, { timeout: 15_000 })
    } finally {
      await context.setOffline(false)
    }
  })

  test('an offline deep link still lands on its own route, not the home screen', async ({
    page,
    context,
  }) => {
    await seedRole(context, 'owner')
    await gotoReady(page, '/job-cards')
    await waitForController(page)
    await page.reload({ waitUntil: 'networkidle' })

    await context.setOffline(true)
    try {
      /* The shell is served for any navigation, and the SPA router reads the
       * real URL off `location` — so the route is preserved rather than
       * collapsing to `/`. */
      await page.goto('/job-cards', { waitUntil: 'domcontentloaded' })
      await expect(page).toHaveURL(/\/job-cards$/)
      await expect(page.locator('body')).toContainText(/Job Cards/i, { timeout: 15_000 })
    } finally {
      await context.setOffline(false)
    }
  })

  test('never caches an API response', async ({ page }) => {
    await gotoReady(page, '/login')
    await waitForController(page)

    /* Issue same-origin requests that look like the API and like a mutation,
     * then read back everything the worker stored. The worker declining to
     * handle them is invisible from the page — what is observable, and what
     * matters, is that nothing of theirs is in the cache afterwards. */
    const cached = await page.evaluate(async () => {
      await Promise.allSettled([
        fetch('/api/invoices'),
        fetch('/auth/refresh'),
        fetch('/v1/jobs'),
        /* The ones that matter: API responses shaped like static assets. A
         * JSON endpoint matches none of the caching rules anyway, so it would
         * stay out of the cache even with the bypass removed; an inspection
         * photo would not. */
        fetch('/api/vehicles/V-1/inspection-photo.png'),
        fetch('/v1/attachments/scan.svg'),
        fetch('/login', { method: 'POST' }),
      ])
      const names = (await caches.keys()).filter((n) => n.startsWith('salis-auto-'))
      const urls: string[] = []
      for (const name of names) {
        const cache = await caches.open(name)
        for (const request of await cache.keys()) urls.push(new URL(request.url).pathname)
      }
      return urls
    })

    expect(cached.filter((u) => /^\/(api|auth|v1)\//.test(u))).toEqual([])
  })
})
