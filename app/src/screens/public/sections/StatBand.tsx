import { useT } from '@/providers/PreferencesProvider'

/** The headline-number band — big brand-blue figure over a muted label,
 *  three-up on desktop, stacked at phone widths.
 *
 *  Figures like "500+" and "50K+" are Latin runs and stay LTR under Arabic, so
 *  the value cell pins `dir="ltr"` the way every numeric column in the app
 *  does, and `tabular-nums` keeps the three figures the same width so the band
 *  reads as one row rather than three ragged cards. */
export interface StatItem {
  value: string
  label: string
}

export function StatBand({ items }: { items: readonly StatItem[] }) {
  const t = useT()
  return (
    <dl className="m-0 mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
      {items.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col rounded-2xl border border-border bg-card p-6 text-center"
        >
          {/* Source order keeps dt before dd (valid HTML); the visual order
              puts the figure first, as the design draws it. */}
          <dt className="order-2 mb-0 mt-1.5 text-[13px] text-muted">{t(stat.label)}</dt>
          <dd
            dir="ltr"
            className="order-1 m-0 font-display text-4xl font-black tabular-nums text-salis-blue"
          >
            {t(stat.value)}
          </dd>
        </div>
      ))}
    </dl>
  )
}
