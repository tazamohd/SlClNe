import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Sparkline } from '@/components/ui/Charts'
import { usePreferences } from '@/providers/PreferencesProvider'

export const TONES = {
  blue:    { bg: 'var(--tint-blue)',    fg: 'var(--salis-blue)' },
  bright:  { bg: 'var(--tint-bright)',  fg: 'var(--salis-blue-bright)' },
  orange:  { bg: 'var(--tint-orange)',  fg: 'var(--salis-orange)' },
  navy:    { bg: 'var(--tint-navy)',    fg: 'var(--text-heading)' },
  neutral: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
} as const

export interface Kpi {
  label: string
  value: string
  icon: string
  bg: string
  fg: string
  mono?: boolean
  /** Small line under the value — "vs last period", a count, a caption. */
  caption?: ReactNode
  /** Recent values, drawn as a sparkline beside the figure. */
  trend?: readonly number[]
  /** Change against the previous period, e.g. `+12%`. Blue when positive,
   *  orange when negative — the palette has no green or red. */
  delta?: { value: string; direction: 'up' | 'down' | 'flat' }
  /** Make the tile a link into the detail behind the figure. */
  to?: string
  testId?: string
}

export function KpiCard({ label, value, icon, bg, fg, mono, caption, trend, delta, to, testId }: Kpi) {
  const { t } = usePreferences()
  const body = (
    <>
      <div className="flex items-center gap-2">
        <span className="flex rounded-lg p-1.5" style={{ background: bg, color: fg }} aria-hidden>
          <Icon name={icon} size={16} />
        </span>
        <span className="text-xs font-medium text-muted">{label}</span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            dir={mono ? 'ltr' : undefined}
            className={cn(
              'font-black text-heading',
              mono ? 'font-mono text-xl tabular-nums' : 'font-display text-2xl'
            )}
          >
            {value}
          </p>
          {delta || caption ? (
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
              {delta ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 font-semibold',
                    delta.direction === 'down' ? 'text-salis-orange' : 'text-salis-blue'
                  )}
                >
                  <Icon
                    name={
                      delta.direction === 'up'
                        ? 'ArrowUpRight'
                        : delta.direction === 'down'
                          ? 'ArrowDownRight'
                          : 'Minus'
                    }
                    size={13}
                  />
                  <span dir="ltr" className="font-mono tabular-nums">
                    {delta.value}
                  </span>
                </span>
              ) : null}
              {caption}
            </p>
          ) : null}
        </div>
        {trend && trend.length > 1 ? (
          <Sparkline values={trend} kind="area" stroke={fg} label={label} className="flex-shrink-0" />
        ) : null}
      </div>
    </>
  )

  const shape = 'block rounded-xl p-4 shadow-sm transition-all duration-200'
  if (to) {
    return (
      <Link
        to={to}
        data-testid={testId}
        aria-label={`${label}: ${value}`}
        className={cn(
          shape,
          'rounded-xl border border-border bg-card no-underline hover:-translate-y-0.5 hover:border-salis-blue/[.3] hover:shadow-lg hover:no-underline motion-reduce:hover:translate-y-0',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2'
        )}
      >
        {body}
        <span className="sr-only">{t('Open')}</span>
      </Link>
    )
  }
  return (
    <Card data-testid={testId} className={shape}>
      {body}
    </Card>
  )
}
