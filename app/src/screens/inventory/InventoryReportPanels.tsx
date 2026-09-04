import type { ReactNode } from 'react'
import { Section } from '@/components/shell/FeatureScreen'
import { Money } from '@/components/ui/Money'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useDateFormat } from '@/lib/formatDate'
import { usePreferences } from '@/providers/PreferencesProvider'
import type { LedgerTotals, MovementRow } from './ledger'
import { priceHalalasOf, type Part } from './partFields'

/* ─────────────────────────────────────────────────────────────── periods */

export type PeriodId = 'week' | 'month' | 'quarter' | 'year'

export const PERIODS: Record<PeriodId, { label: string; days: number }> = {
  week: { label: 'This Week', days: 7 },
  month: { label: 'This Month', days: 30 },
  quarter: { label: 'This Quarter', days: 90 },
  year: { label: 'This Year', days: 365 },
}

export const PERIOD_ORDER: PeriodId[] = ['week', 'month', 'quarter', 'year']

/* ─────────────────────────────────────────────────────────────── trend chart */

/** Total units moved per bucket across the selected window — a real ledger
 *  trend when the movement API is reachable, and an honest "needs the API"
 *  panel when it is not, exactly as the Inventory ledger degrades. */
export function MovementTrend({
  rows,
  period,
  loading,
  error,
  unavailable,
  hasApi,
  onRetry,
}: {
  rows: readonly MovementRow[]
  period: PeriodId
  loading: boolean
  error: Error | null
  unavailable: string | null
  hasApi: boolean
  onRetry: () => void
}) {
  const { t } = usePreferences()

  const body = (() => {
    if (!hasApi) {
      return (
        <EmptyState
          icon="CloudOff"
          title={t('The movement trend needs the API')}
          description={t(unavailable ?? 'This build is reading design fixtures, which hold no movement ledger.')}
        />
      )
    }
    if (loading) return <Loading label={t('Loading movements...')} />
    if (error) {
      return (
        <ErrorState
          title={t("Couldn't load the movement history")}
          description={error.message}
          onRetry={onRetry}
        />
      )
    }
    if (rows.length === 0) {
      return (
        <EmptyState
          icon="History"
          title={t('No movements in this period')}
          description={t('Nothing moved any part in the selected window. Choose a longer period, or record a movement from the Inventory screen.')}
        />
      )
    }
    return <TrendChart rows={rows} period={period} />
  })()

  return (
    <Section title={t('Stock Movement Trend')} subtitle={t('Total units moved, across every part.')}>
      {body}
    </Section>
  )
}

/** Buckets the window into twelve equal spans and plots the units moved in each
 *  as an area under a line. Pure SVG so it carries no chart dependency; colours
 *  reference the brand tokens, never a hex literal. */
function TrendChart({ rows, period }: { rows: readonly MovementRow[]; period: PeriodId }) {
  const { t } = usePreferences()
  const { locale } = useDateFormat()
  const buckets = 12
  const now = Date.now()
  const span = PERIODS[period].days * 24 * 60 * 60 * 1000
  const start = now - span
  const step = span / buckets

  const totals = new Array(buckets).fill(0)
  for (const row of rows) {
    const at = new Date(row.createdAt).getTime()
    const index = Math.min(buckets - 1, Math.max(0, Math.floor((at - start) / step)))
    totals[index] += Math.abs(row.delta)
  }
  const max = Math.max(1, ...totals)

  const width = 600
  const height = 190
  const top = 12
  const floor = 168
  const point = (index: number) => {
    const x = 20 + (index / (buckets - 1)) * (width - 40)
    const y = floor - (totals[index] / max) * (floor - top)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }
  const points = totals.map((_, index) => point(index))
  const linePath = `M${points.join(' L')}`
  const areaPath = `${linePath} L${(width - 20).toFixed(1)},${floor} L20,${floor} Z`

  // The session locale, Latin digits, Gregorian — the same formatter every
  // date in the app goes through, not the browser default.
  const axisFormat = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' })
  const axis = [0, Math.floor(buckets / 3), Math.floor((buckets * 2) / 3), buckets - 1].map((index) => {
    const date = new Date(start + index * step)
    return {
      x: 20 + (index / (buckets - 1)) * (width - 40),
      label: axisFormat.format(date),
    }
  })

  const gradId = 'inventory-report-trend'
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="block h-auto w-full"
      role="img"
      aria-label={t('Stock movement trend')}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--salis-blue)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--salis-blue)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke="var(--salis-blue)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {axis.map((entry) => (
        <text
          key={`${entry.x}-${entry.label}`}
          x={entry.x}
          y={floor + 14}
          fontSize="11"
          fill="var(--text-muted)"
          textAnchor="middle"
          fontFamily="Inter,sans-serif"
        >
          {entry.label}
        </text>
      ))}
    </svg>
  )
}

/* ────────────────────────────────────────────────────────── value breakdown */

/** Stock value by part, worth-most first — the design draws this by category,
 *  but parts carry no category, so it is by part, which the data supports. */
export function ValueByPart({
  parts,
  loading,
  hidePrice,
}: {
  parts: readonly Part[]
  loading: boolean
  hidePrice: boolean
}) {
  const { t } = usePreferences()

  if (hidePrice) {
    return (
      <Section title={t('Stock by Part')} subtitle={t('Units on hand, most first.')}>
        <RankedBars
          loading={loading}
          entries={parts
            .map((part) => ({ key: part.sku, name: part.name, value: part.stock }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)}
          render={(value) => value}
        />
      </Section>
    )
  }

  return (
    <Section title={t('Stock Value by Part')} subtitle={t('Sell-price value on hand, most first.')}>
      <RankedBars
        loading={loading}
        entries={parts
          .map((part) => ({ key: part.sku, name: part.name, value: priceHalalasOf(part) * part.stock }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6)}
        render={(value) => <Money sar={value / 100} />}
      />
    </Section>
  )
}

function RankedBars({
  entries,
  loading,
  render,
}: {
  entries: readonly { key: string; name: string; value: number }[]
  loading: boolean
  render: (value: number) => ReactNode
}) {
  const { t } = usePreferences()
  const max = Math.max(1, ...entries.map((entry) => entry.value))
  if (loading) return <Loading label={t('Loading parts...')} />
  if (entries.length === 0) return <EmptyState icon="Package" title={t('No parts tracked yet')} />
  return (
    <div className="flex flex-col gap-3.5">
      {entries.map((entry) => (
        <div key={entry.key}>
          <div className="mb-1 flex justify-between text-[13px]">
            <span className="truncate text-body">{entry.name}</span>
            <span className="ms-2 flex-shrink-0 font-mono font-semibold text-muted" dir="ltr">
              {render(entry.value)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-salis-blue/[.08]">
            <div
              className="h-full rounded-full bg-salis-blue"
              style={{ inlineSize: `${Math.round((entry.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────── movement breakdown by type */

/** What the ledger did in the period, by term of the §A11 equation. Every value
 *  is a sum over the real movement rows in the window. */
export function MovementBreakdown({
  totals,
  loading,
  period,
}: {
  totals: LedgerTotals
  loading: boolean
  period: PeriodId
}) {
  const { t } = usePreferences()
  const entries: { label: string; value: number }[] = [
    { label: 'Received', value: totals.received },
    { label: 'Returned', value: totals.returned },
    { label: 'Consumed', value: totals.consumed },
    { label: 'Transferred', value: totals.transferOut },
    { label: 'Damaged', value: totals.damaged },
  ]
  const anyMovement = entries.some((entry) => entry.value > 0)

  return (
    <Section
      title={t('Movement Breakdown')}
      subtitle={`${t('Units by movement, over')} ${t(PERIODS[period].label).toLowerCase()}.`}
    >
      {loading ? (
        <Loading label={t('Loading movements...')} />
      ) : !anyMovement ? (
        <EmptyState
          icon="History"
          title={t('No movements in this period')}
          description={t('Nothing moved any part in the selected window.')}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {entries.map((entry) => (
            <div key={entry.label} className="rounded-lg border border-border bg-inset p-4">
              <p className="text-[11px] uppercase tracking-wide text-muted">{t(entry.label)}</p>
              <p className="mt-1 font-mono text-2xl font-black text-heading" dir="ltr">
                {entry.value}
              </p>
              <p className="text-[11px] text-muted">{t('units')}</p>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}
