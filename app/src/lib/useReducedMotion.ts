import { useMediaQuery } from './useMediaQuery'

/** The OS-level "reduce motion" preference.
 *
 *  CSS handles most of it (`motion-reduce:` utilities and the global layer in
 *  `styles/index.css`), but anything that *schedules* motion in JavaScript — a
 *  splash timer, a staggered reveal, a scroll-into-view with `behavior:
 *  'smooth'` — has to ask. Falls back to `false` where `matchMedia` is absent,
 *  which is what jsdom and the route-smoke harness supply. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY)
}
