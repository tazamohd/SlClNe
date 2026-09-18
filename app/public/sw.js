/* SALIS AUTO — service worker.
 *
 * GENERATED VALUES: `scripts/build-sw.mjs` rewrites the three `__SW_*__`
 * placeholders below after `vite build`, reading the real hashed filenames out
 * of `dist/index.html`. The copy in `public/` is the template and is never
 * served as-is — a browser that somehow fetched it would install a worker that
 * precaches nothing, which is why `PRECACHE` being empty is treated as "skip
 * precaching" rather than as an error.
 *
 * Deliberately hand-written and dependency-free, and deliberately a *classic*
 * worker rather than a module one: module service workers are still uneven in
 * Safari, and the whole point of this file is to be the thing that still works
 * when the network does not.
 *
 * ── What is cached, and what is emphatically not ────────────────────────────
 *
 * Cached: the app shell (`index.html`, the entry bundle, the vendor chunks and
 * the stylesheet), the self-hosted fonts, the icon and the web manifest. Then,
 * at runtime, the lazy route chunks as they are first visited — there are 100+
 * of them and precaching the lot would download the whole product to open one
 * screen.
 *
 * **Not cached: anything from the API.** Every response this app gets from a
 * server is tenant-scoped and role-scoped business data — invoices, payroll,
 * customer records. The Cache Storage API is per-origin, not per-user, so a
 * cached API response outlives the session that fetched it and is readable by
 * the next person to sign in on that device. Non-GET requests and cross-origin
 * requests are passed straight through, and same-origin API paths are excluded
 * by name in `isApiPath` in case `VITE_API_URL` is ever pointed at this origin.
 */

const SW_VERSION = '__SW_VERSION__'
const SCOPE_PATH = '__SW_SCOPE__'
/** @type {string[]} */
const PRECACHE = __SW_PRECACHE__

const CACHE_NAME = `salis-auto-${SW_VERSION}`

/** The app shell, served for any navigation the network cannot answer. */
const SHELL_URL = `${SCOPE_PATH}index.html`

/** Same-origin prefixes that must never be cached, however they are requested.
 *
 *  `VITE_API_URL` is normally a different origin, which the cross-origin bypass
 *  already covers. This is the case where it is not: an app served behind the
 *  same host as its API, where `/api/...` would otherwise look like any other
 *  same-origin GET. */
const API_PREFIXES = ['/api/', '/auth/', '/v1/']

function isApiPath(pathname) {
  return API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

/** Vite's hashed build output: `/assets/index-DKWP5965.js`. The hash is part of
 *  the name, so the bytes behind one of these URLs can never change — which is
 *  what makes cache-first correct rather than merely fast. */
function isImmutableAsset(pathname) {
  return /\/assets\/[^/]+-[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/.test(pathname)
}

/** Worth keeping offline, but able to change without changing its URL. */
function isRevalidatable(pathname) {
  return (
    pathname.endsWith('.woff2') ||
    pathname.endsWith('/manifest.json') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.svg')
  )
}

/** Whether a response may be written to the cache.
 *
 *  `type === 'basic'` excludes opaque cross-origin responses, which have status
 *  0 and would be stored as permanent failures. `no-store` is honoured because
 *  a server that says not to store a response means it. */
function isCacheable(response) {
  if (!response || !response.ok || response.type !== 'basic') return false
  const control = response.headers.get('Cache-Control') || ''
  return !control.includes('no-store')
}

// ── Install ─────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      if (PRECACHE.length) {
        const cache = await caches.open(CACHE_NAME)
        /* `reload` so installing a new worker cannot pick the old build's
         * bytes out of the HTTP cache — the URLs are hashed, but `index.html`
         * is not, and it is the one that names all the others. */
        await cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })))
      }
      /* Deliberately no `skipWaiting()`. A new worker taking over a running
       * page would start serving the new build's assets to the old page, and
       * that page asks for lazy chunks by their old hashes — which the new
       * deploy no longer has. Waiting for every tab to go means an update
       * lands on a fresh load, which is the only moment it is coherent. */
    })()
  )
})

// ── Activate ────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(
        names
          .filter((name) => name.startsWith('salis-auto-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
      await self.clients.claim()
    })()
  )
})

// ── Fetch ───────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event

  /* Anything that is not a plain same-origin GET is none of this worker's
   * business. Returning without calling `respondWith` hands the request back
   * to the browser untouched, which is what the API, every mutation and every
   * cross-origin asset should get. */
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (isApiPath(url.pathname)) return
  /* A request that declines the cache (a deliberate refresh) is honoured. */
  if (request.cache === 'no-store') return

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }
  if (isImmutableAsset(url.pathname)) {
    event.respondWith(cacheFirst(request))
    return
  }
  if (isRevalidatable(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request))
  }
})

/** Put a response in the cache, and never let that failure become the
 *  request's failure.
 *
 *  The response is already in hand and correct; the cache is an optimisation
 *  on top of it. `cache.put` rejects for reasons that have nothing to do with
 *  this response — the origin's storage quota is full, the user cleared site
 *  data mid-flight, the browser is evicting under pressure — and on a
 *  cache-first asset an unguarded put turns a successful fetch into
 *  `Failed to fetch dynamically imported module`, which the page renders as a
 *  blank route with no retry.
 *
 *  On a navigation the same throw was worse than a blank: it fell into the
 *  offline branch and served the *cached* shell, pinning the visitor to an
 *  older build at the one moment the fresh one had arrived.
 *
 *  Not caching this time costs the next visit one network request. */
async function store(key, response) {
  if (!isCacheable(response)) return
  try {
    const cache = await caches.open(CACHE_NAME)
    await cache.put(key, response.clone())
  } catch {
    /* Uncached, and the caller still gets its response. */
  }
}

/** Navigations are network-first.
 *
 *  `index.html` is not hashed, so it is how a new deploy is discovered at all;
 *  serving it from cache first would pin a returning user to the build they
 *  first visited until something else evicted it. Offline, the cached shell
 *  takes over and the SPA router renders the route from the URL — which is why
 *  an offline deep link still lands on the right screen. */
async function handleNavigation(request) {
  try {
    const response = await fetch(request)
    await store(SHELL_URL, response)
    return response
  } catch {
    const cached = (await caches.match(SHELL_URL)) || (await caches.match(request))
    if (cached) return cached
    throw new Error('offline and no cached shell')
  }
}

/** Hashed assets: the cache is authoritative, because the URL names the bytes. */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  await store(request, response)
  return response
}

/** Fonts, icons and the manifest: answer from cache at once, refresh behind. */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)
  const network = fetch(request)
    .then(async (response) => {
      await store(request, response)
      return response
    })
    .catch(() => null)

  if (cached) return cached
  const response = await network
  if (response) return response
  throw new Error('offline and not cached')
}

// ── Messages ────────────────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  const type = event.data && event.data.type
  /* The page's explicit "take over now" — sent only when there is no existing
   * controller, so there is no running page whose chunks could be pulled out
   * from under it. See `lib/service-worker.ts`. */
  if (type === 'SKIP_WAITING') self.skipWaiting()
  /* Sign-out empties everything this worker holds. None of it is user data —
   * that is the point of the API exclusion above — but a shared device should
   * not keep one tenant's build around for the next person either. */
  if (type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches
        .keys()
        .then((names) =>
          Promise.all(
            names.filter((n) => n.startsWith('salis-auto-')).map((n) => caches.delete(n))
          )
        )
    )
  }
})
