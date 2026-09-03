import { type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { PageHeader, type PageHeaderProps } from '@/components/ui/PageHeader'
import { Select } from '@/components/ui/Select'
import { Tabs, TabList, Tab } from '@/components/ui/Tabs'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Composition kit for the product's feature screens.
 *
 *  The 211 screens that exist in the feature map but have no `.dc.html` design
 *  share one shape, visible across their reference screenshots:
 *
 *    header (icon tile · title · subtitle · action)
 *    [scope selector]
 *    [tab bar]
 *    stat row — first card gradient-filled, rest plain
 *    panels — table, list, or empty state
 *
 *  Building that shape once keeps 211 screens consistent with each other and
 *  with the designed screens, instead of 211 separate interpretations. */

/** @deprecated Import `PageHeader` from `@/components/ui/PageHeader`. The kit's
 *  header is now the standard variant of the one page header. */
export function FeatureHeader(props: Omit<PageHeaderProps, 'variant'>) {
  return <PageHeader variant="standard" {...props} />
}

/** Pill tab bar built on the Tabs primitive. Controlled when `value`/`onChange`
 *  are passed, otherwise it keeps its own state. */
export function TabBar({
  tabs,
  value,
  onChange,
}: {
  tabs: readonly { id: string; label: string; icon?: string }[]
  value?: string
  onChange?: (id: string) => void
}) {
  const { t } = usePreferences()
  return (
    <Tabs defaultTab={tabs[0]?.id} value={value} onChange={onChange} variant="pill">
      <TabList label="Section tabs">
        {tabs.map((tab) => (
          <Tab key={tab.id} id={tab.id}>
            {tab.icon ? <Icon name={tab.icon} size={15} /> : null}
            <span>{t(tab.label)}</span>
          </Tab>
        ))}
      </TabList>
    </Tabs>
  )
}

export interface Stat {
  label: string
  value: string | number
  /** Small line under the value, e.g. "Requires attention". */
  caption?: string
  /** Draws attention without colour: the lead card is gradient-filled. */
  highlight?: boolean
  /** Orange for anything needing action. Blue is the neutral/positive tone —
   *  the palette has no green or red (README §7). */
  tone?: 'warning' | 'info'
  icon?: string
}

/** Row of metric cards. The first is usually the headline figure. */
export function StatRow({ stats }: { stats: readonly Stat[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}

export function StatCard({ label, value, caption, highlight, tone, icon }: Stat) {
  const { t } = usePreferences()

  const valueColor = highlight
    ? 'text-white'
    : tone === 'warning'
      ? 'text-salis-orange'
      : tone === 'info'
        ? 'text-salis-blue'
        : 'text-heading'

  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-lg p-5',
        highlight && 'border-transparent bg-salis-gradient shadow-[0_12px_20px_-6px_rgba(10,94,215,.35)]'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn('text-[13px] font-medium', highlight ? 'text-white/80' : 'text-muted')}>
            {t(label)}
          </p>
          <p className={cn('mt-1.5 font-display text-[28px] font-black leading-none', valueColor)}>
            {value}
          </p>
          {caption ? (
            <p className={cn('mt-1.5 text-xs', highlight ? 'text-white/70' : 'text-muted')}>
              {t(caption)}
            </p>
          ) : null}
        </div>
        {icon ? (
          <span className={cn('flex flex-shrink-0', highlight ? 'text-white/90' : 'text-salis-blue')}>
            <Icon name={icon} size={22} />
          </span>
        ) : null}
      </div>
    </Card>
  )
}

/** Titled content panel with an optional subtitle and toolbar. */
export function Section({
  title,
  subtitle,
  toolbar,
  children,
  className,
}: {
  title: string
  subtitle?: string
  toolbar?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn('flex flex-col gap-4 rounded-lg p-5', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-heading">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p> : null}
        </div>
        {toolbar}
      </div>
      {children}
    </Card>
  )
}

/** Inline search field — delegates to the Search primitive. */
export { Search as SearchField } from '@/components/ui/Search'

/** Scope selector (branch/garage picker) shown above the tabs. */
export function ScopeSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (next: string) => void
  options: readonly string[]
}) {
  const { t } = usePreferences()
  return (
    <label className="inline-flex">
      <span className="sr-only">{t('Branch')}</span>
      <Select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        size="md"
        className="min-w-[220px] font-action"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </label>
  )
}
