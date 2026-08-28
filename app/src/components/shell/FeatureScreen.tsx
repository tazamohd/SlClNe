import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
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

export function FeatureHeader({
  icon,
  title,
  subtitle,
  actions,
}: {
  icon: string
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            'flex flex-shrink-0 rounded-xl bg-salis-gradient text-white',
            'shadow-[0_12px_20px_-6px_rgba(10,94,215,.35)]',
            isMobile ? 'p-2.5' : 'p-3.5'
          )}
        >
          <Icon name={icon} size={isMobile ? 20 : 26} />
        </div>
        <div className="min-w-0">
          <h1
            className={cn(
              'font-display font-black tracking-[-0.02em] text-heading',
              isMobile ? 'text-xl' : 'text-[34px] leading-[1.15]'
            )}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className={cn('text-muted', isMobile ? 'text-xs' : 'mt-0.5 text-sm')}>{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-shrink-0 flex-wrap gap-2.5">{actions}</div> : null}
    </div>
  )
}

/** Pill tab bar. Controlled when `value`/`onChange` are passed, otherwise it
 *  keeps its own state — most screens only need the latter. */
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
  const [internal, setInternal] = useState(tabs[0]?.id ?? '')
  const active = value ?? internal
  const select = onChange ?? setInternal

  return (
    <Card className="flex gap-1 overflow-x-auto rounded-lg p-1.5" role="tablist">
      {tabs.map((tab) => {
        const on = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => select(tab.id)}
            className={cn(
              'flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded px-4 py-2.5',
              'font-action text-[13px] font-semibold transition-all duration-150',
              on
                ? 'bg-salis-gradient text-white shadow-[0_4px_12px_rgba(10,94,215,.25)]'
                : 'bg-transparent text-muted hover:bg-[rgba(10,94,215,.06)] hover:text-salis-blue'
            )}
          >
            {tab.icon ? <Icon name={tab.icon} size={15} /> : null}
            <span>{t(tab.label)}</span>
          </button>
        )
      })}
    </Card>
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

/** Inline search field used inside a Section toolbar or above a table. */
export function SearchField({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  className?: string
}) {
  const { t } = usePreferences()
  return (
    <span className={cn('relative flex items-center', className)}>
      <Icon name="Search" size={15} className="pointer-events-none absolute text-muted start-3" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? t('Search...')}
        aria-label={placeholder ?? t('Search')}
        className="h-10 w-full rounded border border-border bg-inset px-3 ps-9 text-[13px] text-heading outline-none transition-all duration-200 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
      />
    </span>
  )
}

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
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full cursor-pointer rounded border border-border bg-card px-3 font-action text-[13px] text-heading outline-none focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)] sm:min-w-[220px] sm:w-auto"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
