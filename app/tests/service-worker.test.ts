import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

/** The service worker's routing decisions, run against the real `public/sw.js`.
 *
 *  The template is evaluated rather than reimplemented: a test that restated
 *  the rules would pass while the shipped file said something else, and the
 *  rules that matter here are the *refusals* — which requests the worker
 *  declines to touch. Getting one of those wrong puts tenant-scoped API
 *  responses in a per-origin cache that outlives the session that fetched them,
 *  and nothing about the app would look wrong afterwards.
 *
 *  The three generated constants are substituted here the way
 *  `scripts/build-sw.mjs` substitutes them at build time; that the *build* does
 *  it correctly is `scripts/check-sw.mjs`'s job, and it checks the output
 *  against `dist/`, which does not exist when this suite runs.
 */

const ORIGIN = 'https://salis.example'
const SCOPE = '/'
/* Resolved from the vitest root (`app/`) rather than from `import.meta.url`:
 * under the jsdom environment that is an http URL, not a file one. */
const SOURCE = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8')
  .replace("'__SW_VERSION__'", JSON.stringify('testver'))
  .replace("'__SW_SCOPE__'", JSON.stringify(SCOPE))
  .replace('__SW_PRECACHE__', JSON.stringify(['/index.html', '/assets/app-abcdefgh.js']))

interface FakeCache {
  match: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  addAll: ReturnType<typeof vi.fn>
}

interface Harness {
  /** Dispatch a fetch event and report what the worker did with it. */
  fetchEvent: (init: {
    url: string
    method?: string
    mode?: string
    cache?: string
  }) => { claimed: boolean; responded: Promise<unknown> | null }
  activate: () => Promise<void>
  cache: FakeCache
  cacheNames: string[]
  fetchMock: ReturnType<typeof vi.fn>
  /** What `caches.match` will answer with, keyed by URL. */
  stored: Map<string, unknown>
}

/** Evaluates the worker with stand-ins for the globals it reaches for.
 *
 *  `new Function` rather than a module import because the file is a classic
 *  worker script — it has no exports, and it names `caches`, `fetch` and
 *  `Request` as free variables, which become parameters here. */
function load(): Harness {
  const listeners = new Map<string, (event: unknown) => void>()
  const stored = new Map<string, unknown>()
  let cacheNames = ['salis-auto-testver', 'salis-auto-old', 'someone-elses-cache']

  const cache: FakeCache = {
    match: vi.fn(async (request: { url?: string } | string) => {
      const key = typeof request === 'string' ? request : (request.url ?? '')
      return stored.get(key) ?? undefined
    }),
    put: vi.fn(async (key: { url?: string } | string, value: unknown) => {
      stored.set(typeof key === 'string' ? key : (key.url ?? ''), value)
    }),
    addAll: vi.fn(async () => undefined),
  }

  const caches = {
    open: vi.fn(async () => cache),
    match: cache.match,
    keys: vi.fn(async () => cacheNames),
    delete: vi.fn(async (name: string) => {
      cacheNames = cacheNames.filter((n) => n !== name)
      return true
    }),
  }

  const fetchMock = vi.fn(async () => response(200))

  const self = {
    addEventListener: (type: string, handler: (event: unknown) => void) => {
      listeners.set(type, handler)
    },
    location: { origin: ORIGIN },
    clients: { claim: vi.fn(async () => undefined) },
    skipWaiting: vi.fn(),
  }

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const run = new Function('self', 'caches', 'fetch', 'Request', 'URL', SOURCE)
  run(self, caches, fetchMock, class {}, URL)

  return {
    fetchEvent({ url, method = 'GET', mode = 'no-cors', cache: mode2 = 'default' }) {
      let responded: Promise<unknown> | null = null
      const event = {
        request: { url, method, mode, cache: mode2 },
        respondWith: (value: Promise<unknown>) => {
          responded = value
        },
        waitUntil: () => {},
      }
      listeners.get('fetch')?.(event)
      return { claimed: responded !== null, responded }
    },
    async activate() {
      const waits: Promise<unknown>[] = []
      listeners.get('activate')?.({ waitUntil: (p: Promise<unknown>) => waits.push(p) })
      await Promise.all(waits)
    },
    cache,
    get cacheNames() {
      return cacheNames
    },
    fetchMock,
    stored,
  }
}

function response(status: number, headers: Record<string, string> = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    type: 'basic',
    headers: { get: (name: string) => headers[name] ?? null },
    clone() {
      return this
    },
  }
}

describe('service worker — requests it refuses to touch', () => {
  let sw: Harness
  beforeEach(() => {
    sw = load()
  })

  it('passes non-GET straight through', () => {
    /* A POST is a mutation. Claiming it would put this worker in the path of
     * every write the app makes, for no possible caching benefit. */
    expect(sw.fetchEvent({ url: `${ORIGIN}/invoices`, method: 'POST' }).claimed).toBe(false)
  })

  it('passes cross-origin requests through — this is where the API lives', () => {
    expect(sw.fetchEvent({ url: 'https://api.salis.example/invoices' }).claimed).toBe(false)
  })

  it('passes same-origin API paths through, for an API behind the same host', () => {
    for (const path of ['/api/invoices', '/auth/refresh', '/v1/jobs']) {
      expect(sw.fetchEvent({ url: `${ORIGIN}${path}` }).claimed).toBe(false)
    }
  })

  /* The case the API bypass actually exists for. A JSON endpoint falls through
   * anyway — no rule below matches it — so a test using only those paths passes
   * whether or not the bypass is there. What the bypass genuinely protects is
   * an API response that *looks* like a static asset: inspection photos and
   * attachment thumbnails are served from the API as `.png`, and
   * `isRevalidatable` would otherwise put them in a per-origin cache that
   * outlives the session and the tenant. */
  it('passes API media through, which the asset rules would otherwise cache', () => {
    for (const path of [
      '/api/vehicles/V-1/inspection-photo.png',
      '/v1/attachments/scan.svg',
      '/auth/avatar.png',
    ]) {
      expect(sw.fetchEvent({ url: `${ORIGIN}${path}` }).claimed).toBe(false)
    }
  })

  it('honours a request that explicitly declines the cache', () => {
    const asset = `${ORIGIN}/assets/index-DKWP5965.js`
    expect(sw.fetchEvent({ url: asset }).claimed).toBe(true)
    expect(sw.fetchEvent({ url: asset, cache: 'no-store' }).claimed).toBe(false)
  })

  it('leaves same-origin files it has no policy for alone', () => {
    /* Not a navigation, not a hashed asset, not a font or icon — the worker
     * has nothing useful to say about it, so the browser handles it. */
    expect(sw.fetchEvent({ url: `${ORIGIN}/robots.txt` }).claimed).toBe(false)
    expect(sw.fetchEvent({ url: `${ORIGIN}/sitemap.xml` }).claimed).toBe(false)
  })
})

describe('service worker — strategies', () => {
  let sw: Harness
  beforeEach(() => {
    sw = load()
  })

  it('serves a hashed asset from cache without touching the network', async () => {
    const url = `${ORIGIN}/assets/index-DKWP5965.js`
    sw.stored.set(url, response(200))

    const { claimed, responded } = sw.fetchEvent({ url })
    expect(claimed).toBe(true)
    await responded
    expect(sw.fetchMock).not.toHaveBeenCalled()
  })

  it('fetches and stores a hashed asset it has not seen', async () => {
    const url = `${ORIGIN}/assets/Invoices-A1b2C3d4.js`
    const { responded } = sw.fetchEvent({ url })
    await responded
    expect(sw.fetchMock).toHaveBeenCalledTimes(1)
    expect(sw.cache.put).toHaveBeenCalledTimes(1)
  })

  it('goes to the network first for a navigation, so a new deploy is seen', async () => {
    const { claimed, responded } = sw.fetchEvent({ url: `${ORIGIN}/job-cards`, mode: 'navigate' })
    expect(claimed).toBe(true)
    await responded
    expect(sw.fetchMock).toHaveBeenCalledTimes(1)
    // The shell is refreshed under its own URL, not under the visited route.
    expect(sw.stored.has('/index.html')).toBe(true)
  })

  it('falls back to the cached shell when a navigation is offline', async () => {
    const shell = response(200)
    sw.stored.set('/index.html', shell)
    sw.fetchMock.mockRejectedValueOnce(new Error('offline'))

    const { responded } = sw.fetchEvent({ url: `${ORIGIN}/invoices/INV-1`, mode: 'navigate' })
    /* The deep link still resolves: the SPA router reads the URL, so an
     * offline visit to a route lands on that route rather than on the home
     * screen. */
    await expect(responded).resolves.toBe(shell)
  })

  it('reports failure rather than a blank page when offline with nothing cached', async () => {
    sw.fetchMock.mockRejectedValueOnce(new Error('offline'))
    const { responded } = sw.fetchEvent({ url: `${ORIGIN}/dashboard`, mode: 'navigate' })
    await expect(responded).rejects.toThrow(/offline/)
  })

  it('answers a font from cache immediately and refreshes it behind', async () => {
    const url = `${ORIGIN}/fonts/inter-latin.woff2`
    const cached = response(200)
    sw.stored.set(url, cached)

    const { claimed, responded } = sw.fetchEvent({ url })
    expect(claimed).toBe(true)
    await expect(responded).resolves.toBe(cached)
    expect(sw.fetchMock).toHaveBeenCalledTimes(1) // the revalidation
  })

  it('never stores a response the server marked no-store', async () => {
    sw.fetchMock.mockResolvedValueOnce(response(200, { 'Cache-Control': 'no-store' }))
    const { responded } = sw.fetchEvent({ url: `${ORIGIN}/assets/Thing-Z9y8X7w6.js` })
    await responded
    expect(sw.cache.put).not.toHaveBeenCalled()
  })

  it('never stores an error response', async () => {
    sw.fetchMock.mockResolvedValueOnce(response(503))
    const { responded } = sw.fetchEvent({ url: `${ORIGIN}/assets/Thing-Z9y8X7w6.js` })
    await responded
    expect(sw.cache.put).not.toHaveBeenCalled()
  })
})

describe('service worker — activation', () => {
  it('drops its own stale caches and leaves other apps on the origin alone', async () => {
    const sw = load()
    await sw.activate()
    expect(sw.cacheNames).toContain('salis-auto-testver')
    expect(sw.cacheNames).not.toContain('salis-auto-old')
    /* A docs site or a second app on the same Pages domain has its own
     * storage, and this worker has no business deleting it. */
    expect(sw.cacheNames).toContain('someone-elses-cache')
  })
})
