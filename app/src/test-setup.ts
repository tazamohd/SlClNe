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
import { cleanup } from '@testing-library/react'

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

beforeEach(() => {
  lists.clear()
  installMatchMedia()
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
