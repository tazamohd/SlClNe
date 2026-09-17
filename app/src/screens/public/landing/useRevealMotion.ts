import { useEffect, type RefObject } from 'react'

/** Scroll-reveal, pointer-tilt and count-up motion for any subtree — a
 *  generalisation of the "SALIS AUTO 2030" tour's own motion layer
 *  (`useLandingMotion.ts`, kept in place for that tour's own six pages) so
 *  the new single-scroll homepage can reuse the same, already
 *  reduced-motion-safe primitives without depending on tour-specific markup.
 *
 *  Reveals any `.rise`/`.era` element the moment it scrolls into view,
 *  staggering each batch of six by 70ms; lets a pointer tilt a `.tilt`
 *  element by a few degrees (fine pointers only); and counts up any
 *  `[data-count]` element once it is visible. All three are transform/
 *  opacity/text-content only, and every one degrades to its resting,
 *  fully-readable state under `prefers-reduced-motion: reduce` or without
 *  `IntersectionObserver`.
 *
 *  `deps` re-arms the whole effect whenever it changes — pass a value that
 *  changes when the mounted subtree's `.rise` elements themselves change
 *  (e.g. a tab key), so a fresh set is observed instead of sitting at rest
 *  forever. */
export function useRevealMotion(
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
    // seen, staggered in batches of six 70ms apart.
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

    // Tilt: a `.tilt` element leans a few degrees toward the pointer. Coarse
    // pointers and reduced motion skip it — CSS hover fallbacks cover both.
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
