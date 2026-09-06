import { useEffect, type RefObject } from 'react'

/** The `SALIS AUTO last` artifact's motion layer, ported to a React effect.
 *
 *  Everything it does is transform and opacity only, and every part of it is a
 *  progressive enhancement: with this hook removed the page still renders in
 *  full, because the artifact's markup is complete at rest. That is also what
 *  a visitor gets under `prefers-reduced-motion: reduce`, on a coarse pointer,
 *  or in a browser without `IntersectionObserver`.
 *
 *  Two departures from the artifact's own script:
 *  - it queries inside `root` rather than the document, so a second landing on
 *    screen (a test render, a future preview pane) cannot capture these nodes;
 *  - `is-ready` and `motion-ready` land on `root` instead of `<html>`, which is
 *    why `landing.css` scopes those flags to `.salis-landing` too.
 *
 *  Everything it adds — classes, custom properties, the counted digits — is
 *  torn down on unmount, so a language switch that remounts the page starts
 *  from the same rest state it started from the first time. */
export function useLandingMotion(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = ref.current
    if (!root) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const fine = window.matchMedia?.('(pointer: fine)').matches ?? false
    const cleanups: (() => void)[] = []
    const all = <T extends Element>(selector: string): T[] => [...root.querySelectorAll<T>(selector)]

    root.classList.add('is-ready')

    // Tilt: at most 5 degrees on cards, 6 on the hero mock, with a highlight
    // that follows the pointer. Pointer-driven, so coarse pointers skip it.
    if (!reduce && fine) {
      for (const el of all<HTMLElement>('.domains > div:not(.wide), .roles > div, .hero-mock')) {
        el.classList.add('tilt')
        const max = el.classList.contains('tilt-deep') ? 6 : 5
        const move = (event: PointerEvent): void => {
          const box = el.getBoundingClientRect()
          const px = (event.clientX - box.left) / box.width
          const py = (event.clientY - box.top) / box.height
          el.style.setProperty('--ry', `${((px - 0.5) * 2 * max).toFixed(2)}deg`)
          el.style.setProperty('--rx', `${((0.5 - py) * 2 * max).toFixed(2)}deg`)
          el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
          el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
        }
        const leave = (): void => {
          el.style.setProperty('--rx', '0deg')
          el.style.setProperty('--ry', '0deg')
        }
        el.addEventListener('pointermove', move)
        el.addEventListener('pointerleave', leave)
        cleanups.push(() => {
          el.removeEventListener('pointermove', move)
          el.removeEventListener('pointerleave', leave)
          el.classList.remove('tilt')
          for (const prop of ['--rx', '--ry', '--mx', '--my']) el.style.removeProperty(prop)
        })
      }
    }

    // Reveals, only for blocks below the first viewport: the page at rest is
    // fully visible, so nothing above the fold can be caught mid-transition.
    if (!reduce && 'IntersectionObserver' in window) {
      const vh = window.innerHeight
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        },
        { rootMargin: '0px 0px -8% 0px' }
      )
      const revealed: HTMLElement[] = []
      const blocks = all<HTMLElement>(
        'section > .wrap > *, section.wrap > *, .domains > div, .roles > div, .quotes > blockquote'
      )
      for (const el of blocks) {
        if (el.getBoundingClientRect().top < vh * 0.9) continue
        let index = 0
        for (let sib = el.previousElementSibling; sib; sib = sib.previousElementSibling) index++
        el.classList.add('reveal')
        el.style.setProperty('--d', `${Math.min(index, 6) * 60}ms`)
        observer.observe(el)
        revealed.push(el)
      }
      cleanups.push(() => {
        observer.disconnect()
        for (const el of revealed) {
          el.classList.remove('reveal', 'in')
          el.style.removeProperty('--d')
        }
      })
    }

    // Proof numbers count from their baseline to the result, once, when seen.
    // The markup already holds the final value, so a visitor who never triggers
    // this reads the same figure.
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
            const from = Number(el.dataset.from)
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

    // Paper to platform: the three sheets fold into the slab once, when the
    // AI-era stage enters view.
    const stage = root.querySelector('.ai-stage')
    if (stage && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) return
          stage.classList.add('in')
          observer.disconnect()
        },
        { threshold: 0.35 }
      )
      observer.observe(stage)
      cleanups.push(() => {
        observer.disconnect()
        stage.classList.remove('in')
      })
    }

    // Hero entrance: eyebrow, headline, lede, buttons, status line, then the
    // mock, 70 ms apart.
    if (!reduce) {
      const column = root.querySelector<HTMLElement>('.hero-grid > div:first-child')
      const sequenced: HTMLElement[] = []
      if (column) {
        const kids = [...column.children] as HTMLElement[]
        kids.forEach((kid, index) => {
          kid.classList.add('seq')
          kid.style.setProperty('--i', String(index))
          sequenced.push(kid)
        })
        const mock = root.querySelector<HTMLElement>('.hero-mock')
        if (mock) {
          mock.classList.add('seq', 'seq-mock')
          mock.style.setProperty('--i', String(kids.length))
          sequenced.push(mock)
        }
      }
      cleanups.push(() => {
        for (const el of sequenced) {
          el.classList.remove('seq', 'seq-mock')
          el.style.removeProperty('--i')
        }
      })
    }

    // Parallax on the decorative layers: transform only, one frame per scroll
    // burst rather than one per event.
    const parallax = all<HTMLElement>('.hero > .trace, .ai-stage > .map-fallback')
    if (parallax.length > 0 && !reduce) {
      let queued = false
      const place = (): void => {
        queued = false
        const vh = window.innerHeight
        for (const el of parallax) {
          const host = el.parentElement
          if (!host) continue
          const box = host.getBoundingClientRect()
          if (box.bottom < 0 || box.top > vh) continue
          const depth = el.classList.contains('late') ? 0.08 : 0.14
          el.style.setProperty('--py', `${((box.top + box.height / 2 - vh / 2) * depth).toFixed(1)}px`)
        }
      }
      const onScroll = (): void => {
        if (queued) return
        queued = true
        requestAnimationFrame(place)
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      place()
      cleanups.push(() => {
        window.removeEventListener('scroll', onScroll)
        for (const el of parallax) el.style.removeProperty('--py')
      })
    }

    root.classList.add('motion-ready')

    return () => {
      for (const cleanup of cleanups) cleanup()
      root.classList.remove('is-ready', 'motion-ready')
    }
  }, [ref])
}
