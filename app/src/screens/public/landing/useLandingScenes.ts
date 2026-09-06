import { useEffect, type RefObject } from 'react'

/** Starts the landing page's WebGL scenes and tears them down on unmount.
 *
 *  The module behind this is loaded lazily and never on the critical path: the
 *  import only resolves once the effect runs, and `initLandingScenes` then
 *  decides for itself whether to do anything at all (it declines on reduced
 *  motion, narrow viewports and browsers without WebGL). A failure at any step
 *  leaves the page exactly as it renders without this hook — the static
 *  fallbacks in the markup are complete on their own. */
export function useLandingScenes(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = ref.current
    if (!root) return

    let teardown: (() => void) | null = null
    let cancelled = false

    void import('./scenes')
      .then(({ initLandingScenes }) => {
        if (cancelled) return
        teardown = initLandingScenes(root)
      })
      .catch(() => {
        /* No scenes; the fallbacks in the markup already carry the page. */
      })

    return () => {
      cancelled = true
      teardown?.()
    }
  }, [ref])
}
