/** The six pages of the `SALIS AUTO 2030` screen. One route
 *  (`/public-portal/landing`), six in-page views selected by React state and
 *  mirrored to `location.hash` — see `Landing.tsx`. */
export type PageKey = 'index' | 'system' | 'grid' | 'access' | 'origin' | 'channel'

export const PAGE_KEYS: readonly PageKey[] = ['index', 'system', 'grid', 'access', 'origin', 'channel']

export function isPageKey(value: string): value is PageKey {
  return (PAGE_KEYS as readonly string[]).includes(value)
}

/** `t` is `useT()` from PreferencesProvider: `(source: string) => string`. */
export type T = (source: string) => string
