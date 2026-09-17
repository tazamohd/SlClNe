import type { T } from '../types'

export interface Testimonial {
  readonly quote: string
  readonly name: string
  readonly role: string
}

/** A reserved social-proof slot — a logo-wall/quote-card section that isn't
 *  rendered with content yet. There are no real customer testimonials or
 *  logos anywhere in this codebase (confirmed by a repo-wide search during
 *  planning), and the site's truth-and-conversion discipline rules out
 *  fabricating any to fill the gap. Per the product owner's explicit
 *  decision, Phase 1 omits this section from the live homepage rather than
 *  filling it with substitute content — this component exists so real
 *  testimonials/logos can be dropped in later (`items`) with no layout
 *  change, not so it renders empty chrome today. Not composed into
 *  `Landing.tsx` yet for that reason. */
export function SocialProofBand({ t, items }: { t: T; items: readonly Testimonial[] }) {
  if (items.length === 0) return null

  return (
    <section className="mx-auto max-w-[1180px] px-5 py-14 md:px-10 md:py-20" aria-labelledby="home-proof-voices-h">
      <h2 id="home-proof-voices-h" className="mb-8 text-center font-display text-2xl font-bold text-heading">
        {t('What workshops running it say')}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((item) => (
          <figure key={item.name} className="m-0 rounded-2xl border border-border bg-card p-6">
            <blockquote className="m-0 text-sm leading-relaxed text-body">{item.quote}</blockquote>
            <figcaption className="mt-4 text-xs text-muted">
              <span className="font-semibold text-heading">{item.name}</span> — {item.role}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
