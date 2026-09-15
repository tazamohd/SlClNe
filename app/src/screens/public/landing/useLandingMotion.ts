import { useEffect, type RefObject } from 'react'

/** The `SALIS AUTO 2030` artifact's own motion layer, ported to a React
 *  effect. The artifact reveals any `.rise` (or `.era`) element the moment it
 *  scrolls into view, staggering each batch of six by 70ms, and lets a
 *  pointer tilt a `.tilt` element by a few degrees — both transform/opacity
 *  only, both progressive enhancement over a page that is already complete
 *  at rest (`.rise` without this hook, or under reduced motion, is just
 *  `.rise.in` — see `landing.css`).
 *
 *  This replaces the previous, much larger hook that also drove the old
 *  design's rail progress, AI-era paper-fold and hero/rail/map WebGL scenes.
 *  None of those elements exist in the 2030 markup, and the three WebGL
 *  scenes are not ported at all (see the doc comment at the top of
 *  `landing.css`), so this hook only does what today's markup can use:
 *  reveal, tilt, and the counted-figure convention already used elsewhere in
 *  the codebase for a couple of hero KPIs.
 *
 *  `deps` re-arms the whole effect — a fresh reveal scan, a fresh tilt
 *  listener set, a fresh counter scan — whenever it changes. The six-page
 *  tour needs this: switching pages swaps in a whole new set of `.rise`
 *  elements via React state, not a remount, so without a deps bump tied to
 *  the active page, `querySelectorAll` above never sees them and they sit at
 *  the resting `.rise` opacity forever. Pass `[page]` from the caller. */
export function useLandingMotion(
  ref: RefObject<HTMLElement | null>,
  deps: readonly unknown[] = []
): void {
  useEffect(() => {
    const root = ref.current
    if (!root) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const fine = window.matchMedia?.('(pointer: fine)').matches ?? false
    const cleanups: (() => void)[] = []
    const all = <T extends Element>(selector: string): T[] => [...root.querySelectorAll<T>(selector)]

    root.classList.add('is-ready')

    // Reveal: every `.rise`/`.era` node fades up once, the first time it is
    // seen, staggered in batches of six 70ms apart — same numbers as the
    // artifact's own `reveals()`.
    const revealables = all<HTMLElement>('.rise:not(.in), .era:not(.in)')
    if (revealables.length > 0) {
      if (reduce || !('IntersectionObserver' in window)) {
        for (const el of revealables) el.classList.add('in')
      } else {
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue
              entry.target.classList.add('in')
              observer.unobserve(entry.target)
            }
          },
          { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
        )
        revealables.forEach((el, i) => {
          el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`
          observer.observe(el)
        })
        cleanups.push(() => {
          observer.disconnect()
          for (const el of revealables) {
            el.classList.remove('in')
            el.style.removeProperty('transition-delay')
          }
        })
      }
    }

    // Tilt: the ledger hologram and any other `.tilt` element lean a few
    // degrees toward the pointer. Coarse pointers and reduced motion skip it
    // — the CSS hover fallback in `landing.css` covers the holo card either
    // way.
    if (!reduce && fine) {
      for (const el of all<HTMLElement>('.tilt')) {
        const move = (event: PointerEvent): void => {
          const box = el.getBoundingClientRect()
          const px = (event.clientX - box.left) / box.width
          const py = (event.clientY - box.top) / box.height
          el.style.setProperty('--ry', `${((px - 0.5) * 12).toFixed(2)}deg`)
          el.style.setProperty('--rx', `${((0.5 - py) * 9).toFixed(2)}deg`)
        }
        const leave = (): void => {
          el.style.removeProperty('--rx')
          el.style.removeProperty('--ry')
        }
        el.addEventListener('pointermove', move)
        el.addEventListener('pointerleave', leave)
        cleanups.push(() => {
          el.removeEventListener('pointermove', move)
          el.removeEventListener('pointerleave', leave)
          el.style.removeProperty('--rx')
          el.style.removeProperty('--ry')
        })
      }
    }

    // Counted figures: the markup already holds the resting value, so a
    // visitor who never triggers this (reduced motion, no IO) reads the same
    // number either way.
    const counters = all<HTMLElement>('[data-count]')
    if (counters.length > 0 && !reduce && 'IntersectionObserver' in window) {
      const frames = new Set<number>()
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            observer.unobserve(entry.target)
            const el = entry.target as HTMLElement
            const to = Number(el.dataset.count)
            const from = Number(el.dataset.from ?? 0)
            const unit = el.dataset.unit ?? ''
            const prefix = el.dataset.prefix ?? ''
            let start: number | null = null
            const step = (now: number): void => {
              start ??= now
              const linear = Math.min(1, (now - start) / 1100)
              const eased = 1 - (1 - linear) ** 3
              el.textContent = prefix + Math.round(from + (to - from) * eased) + unit
              if (linear < 1) frames.add(requestAnimationFrame(step))
            }
            frames.add(requestAnimationFrame(step))
          }
        },
        { threshold: 0.6 }
      )
      for (const el of counters) observer.observe(el)
      cleanups.push(() => {
        observer.disconnect()
        for (const frame of frames) cancelAnimationFrame(frame)
      })
    }

    root.classList.add('motion-ready')

    return () => {
      for (const cleanup of cleanups) cleanup()
      root.classList.remove('is-ready', 'motion-ready')
    }
  }, [ref, ...deps])
}
