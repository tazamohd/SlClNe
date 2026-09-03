/** localStorage that survives private-mode and disabled-storage browsers.
 *
 *  The prototypes call `localStorage` bare inside render, which throws in
 *  Safari private mode and takes the whole screen down with it. */
export function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStored(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* storage unavailable — the session still works, it just won't persist */
  }
}

export function clearStored(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEYS = {
  theme: 'salis-theme',
  lang: 'salis-lang',
  role: 'salis-role',
  notifications: 'salis-notif',
  region: 'salis-region',
  /** JWT access token — read by the API client as `Authorization: Bearer`. */
  token: 'salis-token',
  /** Refresh token, exchanged for a new access token on 401. */
  refresh: 'salis-refresh',
  /** The signed-in user object (JSON), so a reload restores the session
   *  without a round-trip to `/auth/me`. */
  user: 'salis-user',
  /** Table density — comfortable (44px rows) or compact (36px). */
  density: 'salis-density',
  /** Sidebar groups the user has folded, as a JSON array of labels. */
  navCollapsed: 'salis-nav-collapsed',
  /** Command palette history. */
  recentSearches: 'salis-recent-searches',
} as const
