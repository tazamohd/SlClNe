import { useT } from '@/providers/PreferencesProvider'

/** A centered value-proposition section — three items, each with an icon glyph
 *  in a tinted circle, a bold title, and a muted description.
 *
 *  Three-column grid on desktop, single-column stacked on mobile. The icon
 *  circle uses a blue-wash background matching the tint system, keeping the
 *  brand palette consistent across all public sections. */
export interface ValuePropItem {
  icon: string
  title: string
  description: string
}

export function ValueProposition({ items }: { items: readonly ValuePropItem[] }) {
  const t = useT()
  return (
    <section className="px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1080px]">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center">
              <span
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tint-blue)] text-2xl"
                aria-hidden
              >
                {item.icon}
              </span>
              <h2 className="mb-2 mt-0 text-[17px] font-bold text-heading">
                {t(item.title)}
              </h2>
              <p className="m-0 text-[14px] leading-[1.6] text-muted">
                {t(item.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
