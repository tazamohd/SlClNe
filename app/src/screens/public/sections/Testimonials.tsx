import { useT } from '@/providers/PreferencesProvider'

/** A testimonial/quote section — 2-3 customer quotes displayed as cards.
 *
 *  Each card carries a large decorative quote mark, the quote text, and the
 *  author's name, role, and company below. Uses `border-border bg-card` to stay
 *  consistent with the card vocabulary established by StatBand, FaqList, and
 *  IconCardGrid. */
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

export function Testimonials({ title, items }: TestimonialsProps) {
  const t = useT()
  return (
    <section className="px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1080px]">
        <h2 className="mb-10 mt-0 text-center font-display text-3xl font-black text-heading md:mb-14 md:text-[36px]">
          {t(title)}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <blockquote
              key={item.author}
              className="m-0 flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              {/* Decorative quote mark */}
              <span
                aria-hidden
                className="mb-2 font-display text-[40px] leading-none text-salis-blue"
              >
                {'“'}
              </span>
              <p className="m-0 flex-1 text-[14px] leading-[1.7] text-body">
                {t(item.quote)}
              </p>
              <footer className="mt-5 border-t border-border pt-4">
                <p className="m-0 text-[14px] font-semibold text-heading">
                  {t(item.author)}
                </p>
                <p className="m-0 mt-0.5 text-[12px] text-muted">
                  {t(item.role)}, {t(item.company)}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
