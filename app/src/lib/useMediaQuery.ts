import { useEffect, useState } from 'react'

/** Subscribes to a media query.
 *
 *  The design ships separate desktop and mobile screens; this is what decides
 *  which one renders, and what flips the shell between sidebar and drawer. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => evaluate(query))

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [query])

  return matches
}

/** `false` wherever `matchMedia` is missing — SSR, an old jsdom, a test harness
 *  that stubs only part of the window — rather than a crash on first render. */
function evaluate(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return Boolean(window.matchMedia(query)?.matches)
}

/** The breakpoint the design's mobile variants take over at. */
export const MOBILE_QUERY = '(max-width: 860px)'

export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY)
}
