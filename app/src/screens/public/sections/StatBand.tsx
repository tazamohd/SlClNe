import { useT } from '@/providers/PreferencesProvider'

/** The About page's headline-number band — big brand-blue figure over a muted
 *  label, three-up on desktop, stacked at phone widths.
 *
 *  Figures like "500+" and "50K+" are Latin runs and stay LTR under Arabic, so
 *  the value cell pins `dir="ltr"` the way every numeric column in the app
 *  does. */
export interface StatItem {
  value: string
  label: string
}

export function StatBand({ items }: { items: readonly StatItem[] }) {
  const t = useT()
  return (
    <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
      {items.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-border bg-card p-6 text-center"
        >
          <p
            dir="ltr"
            className="m-0 font-display text-4xl font-black text-salis-blue"
          >
            {t(stat.value)}
          </p>
          <p className="mb-0 mt-1.5 text-[13px] text-muted">{t(stat.label)}</p>
        </div>
      ))}
    </div>
  )
}
