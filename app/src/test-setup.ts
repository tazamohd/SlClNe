/** Vitest environment setup — loaded before every test file.
 *
 *  Two jobs: install the jest-dom matchers, and give jsdom the browser APIs the
 *  app genuinely depends on. jsdom ships no `matchMedia`, and `useMediaQuery`
 *  is what decides whether a list renders as a table or as the designed mobile
 *  card layout — stubbing it to a constant `false` would make the mobile half
 *  of the design untestable, so the stub here evaluates real width queries
 *  against `window.innerWidth` and notifies its listeners when that changes.
 */
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup, configure } from '@testing-library/react'
import { preloadArabic } from '@/providers/PreferencesProvider'

/** Testing Library polls `findBy*` for 1 s by default. A screen that fetches
 *  before it can render its first row needs a query round trip inside that
 *  window, which holds when the file runs alone and does not when 77 files of
 *  jsdom share the machine — the flake lands on a different file every run.
 *  Five seconds is still far short of the Vitest timeout, so a genuinely
 *  missing element fails the assertion rather than the whole test file. */
configure({ asyncUtilTimeout: 5000 })

/** The Arabic dictionary is a lazy chunk in the browser, which means `t()`
 *  returns the English source for the frame or two before it resolves. A test
 *  that renders in Arabic and asserts synchronously would read that gap as a
 *  missing translation. Warming the module cache here — once per worker,
 *  before any test file runs — makes the provider pick the dictionary up in its
 *  `useState` initialiser, so Arabic renders on the first pass exactly as it
 *  does for a real user whose language was known before the first paint. */
await preloadArabic()

type Listener = (event: MediaQueryListEvent) => void

const lists = new Set<{ query: string; refresh: () => void }>()

/** `(max-width: 860px)`, `(min-width: 768px)`, `(prefers-color-scheme: light)`.
 *  Anything else evaluates false rather than throwing — an unknown query in a
 *  component under test should not take the test down with it. */
function evaluate(query: string): boolean {
  const max = /\(\s*max-width:\s*(\d+)px\s*\)/.exec(query)
  if (max) return window.innerWidth <= Number(max[1])
  const min = /\(\s*min-width:\s*(\d+)px\s*\)/.exec(query)
  if (min) return window.innerWidth >= Number(min[1])
  const scheme = /\(\s*prefers-color-scheme:\s*(light|dark)\s*\)/.exec(query)
  if (scheme) return scheme[1] === document.documentElement.dataset.colorScheme
  return false
}

function installMatchMedia(): void {
  window.matchMedia = (query: string): MediaQueryList => {
    const listeners = new Set<Listener>()
    let matches = evaluate(query)

    const list = {
      get matches() {
        return matches
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: Listener) => void listeners.add(listener),
      removeEventListener: (_type: string, listener: Listener) => void listeners.delete(listener),
      addListener: (listener: Listener) => void listeners.add(listener),
      removeListener: (listener: Listener) => void listeners.delete(listener),
      dispatchEvent: () => true,
    }

    const entry = {
      query,
      refresh: () => {
        const next = evaluate(query)
        if (next === matches) return
        matches = next
        for (const listener of listeners) {
          listener({ matches: next, media: query } as MediaQueryListEvent)
        }
      },
    }
    lists.add(entry)
    return list as unknown as MediaQueryList
  }
}

/** Resize the test viewport and let every live media query react, the way a
 *  real browser does. Component tests use this to prove that the mobile card
 *  layout replaces the table rather than merely narrowing it. */
export function setViewportWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true })
  for (const list of lists) list.refresh()
  window.dispatchEvent(new Event('resize'))
}

/** jsdom usually provides `window.localStorage`, but not on every host: a
 *  Windows run on the same Node version reported it undefined and failed all
 *  177 tests at once, on a line that has nothing to do with what any of them
 *  assert. Node 22 also carries an experimental `localStorage` of its own that
 *  is inert without `--localstorage-file`, so which implementation a test run
 *  gets depends on the machine.
 *
 *  The app already wraps storage access (`src/lib/storage.ts`) because bare
 *  access throws in Safari private mode. The suite should be at least as
 *  robust: supply a minimal in-memory store when the environment has none, so a
 *  test fails for what it tests rather than for where it ran. */
function ensureLocalStorage() {
  if (typeof window.localStorage?.clear === 'function') return
  const store = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      get length() {
        return store.size
      },
      key: (i: number) => [...store.keys()][i] ?? null,
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    },
  })
}

beforeEach(() => {
  lists.clear()
  installMatchMedia()
  ensureLocalStorage()
  // Desktop is the default; a test that wants the mobile design asks for it.
  Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true, writable: true })
  window.localStorage.clear()
  document.documentElement.lang = 'en'
  document.documentElement.dir = 'ltr'
})

afterEach(() => {
  cleanup()
  lists.clear()
})
