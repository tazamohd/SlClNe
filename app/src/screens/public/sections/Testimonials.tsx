import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Customer quotes, as a carousel that becomes a grid when motion is reduced.
 *
 *  The track moves on `transform` only — no width or margin animates — and
 *  advances every few seconds until the visitor pauses it, hovers it, or
 *  focuses inside it. Previous/Next/Pause are real buttons (≥44px) with
 *  translated names, and the slide count is announced politely. Under
 *  `prefers-reduced-motion` (or with a single quote) every card is laid out
 *  in a static grid: nothing moves, nothing needs a control. */
export interface Testimonial {
  quote: string
  author: string
  role: string
  company: string
}

export interface TestimonialsProps {
  title: string
  items: readonly Testimonial[]
}

const INTERVAL_MS = 6000

function QuoteCard({ item, className }: { item: Testimonial; className?: string }) {
  const { t } = usePreferences()
  return (
    <blockquote
      className={cn(
        'm-0 flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm',
        className
      )}
    >
      <span aria-hidden className="mb-2 flex text-salis-blue">
        <Icon name="Quote" size={28} />
      </span>
      <p className="m-0 flex-1 text-[15px] leading-[1.7] text-body">{t(item.quote)}</p>
      <footer className="mt-5 border-t border-border pt-4">
        <p className="m-0 text-[14px] font-semibold text-heading">{t(item.author)}</p>
        <p className="m-0 mt-0.5 text-[12px] text-muted">
          {t(item.role)}, {t(item.company)}
        </p>
      </footer>
    </blockquote>
  )
}

export function Testimonials({ title, items }: TestimonialsProps) {
  const { t, rtl } = usePreferences()
  const reducedMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [held, setHeld] = useState(false)
  const count = items.length
  const carousel = !reducedMotion && count > 1

  useEffect(() => {
    if (!carousel || paused || held) return
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [carousel, paused, held, count])

  const go = (delta: number) => setIndex((current) => (current + delta + count) % count)

  return (
    <section className="px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1080px]">
        <h2 className="mb-10 mt-0 text-center font-display text-3xl font-black text-heading md:mb-14 md:text-[36px]">
          {t(title)}
        </h2>

        {!carousel ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <QuoteCard key={item.author} item={item} />
            ))}
          </div>
        ) : (
          <div
            aria-roledescription="carousel"
            aria-label={t('Customer stories')}
            className="mx-auto flex max-w-[760px] flex-col gap-5"
            onMouseEnter={() => setHeld(true)}
            onMouseLeave={() => setHeld(false)}
            onFocus={() => setHeld(true)}
            onBlur={() => setHeld(false)}
          >
            <div className="overflow-hidden">
              <ul
                className="m-0 flex list-none p-0 transition-transform duration-500 ease-salis motion-reduce:transition-none"
                style={{ transform: `translateX(${rtl ? '' : '-'}${index * 100}%)` }}
              >
                {items.map((item, itemIndex) => (
                  <li
                    key={item.author}
                    aria-hidden={itemIndex !== index}
                    className="w-full flex-shrink-0 px-1"
                  >
                    <QuoteCard item={item} className={itemIndex === index ? undefined : 'invisible'} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={t('Previous story')}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-heading transition-colors hover:border-salis-blue hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
              >
                <Icon name="ChevronLeft" size={18} className="rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => setPaused((current) => !current)}
                aria-label={paused ? t('Play stories') : t('Pause stories')}
                aria-pressed={paused}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-heading transition-colors hover:border-salis-blue hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
              >
                <Icon name={paused ? 'Play' : 'Pause'} size={16} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label={t('Next story')}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-heading transition-colors hover:border-salis-blue hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
              >
                <Icon name="ChevronRight" size={18} className="rtl:rotate-180" />
              </button>
              <p aria-live="polite" className="m-0 ms-2 font-mono text-[12px] tabular-nums text-muted" dir="ltr">
                {index + 1} / {count}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
