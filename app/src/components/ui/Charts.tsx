import { Money } from './Money'
import { usePreferences } from '@/providers/PreferencesProvider'

/** The two charts the design draws inline, shared by every report and BI screen.
 *
 *  They lived inside `screens/accounting/Reports.tsx` while reporting was the
 *  only consumer. Operational dashboards need the same two shapes, and a second
 *  copy is how two screens end up disagreeing about what blue means. */

/** Brand-safe chart palette — the five `--chart-*` tokens, no green or red. */
export const CHART_COLORS = ['#0A5ED7', '#0BB3FF', '#38BDF8', '#64748B', '#F97316']

/** Horizontal bar chart. Simple enough to draw inline; avoids pulling a chart
 *  library in for what the design draws as plain bars. */
export function BarList({
  rows,
  total,
}: {
  rows: readonly { label: string; value: number }[]
  total?: number
}) {
  const { t } = usePreferences()
  const max = total ?? Math.max(...rows.map((r) => r.value), 1)
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <div key={row.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="text-body">{t(row.label)}</span>
            <Money sar={row.value} className="font-semibold text-heading" />
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-inset">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (row.value / max) * 100)}%`,
                background: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Donut built from a conic gradient, as the design's Job Status chart is. */
export function Donut({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: readonly { label: string; value: number }[]
  centerValue: string
  centerLabel: string
}) {
  const { t } = usePreferences()
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  let cursor = 0
  const stops = segments
    .map((segment, index) => {
      const start = (cursor / total) * 100
      cursor += segment.value
      const end = (cursor / total) * 100
      return `${CHART_COLORS[index % CHART_COLORS.length]} ${start}% ${end}%`
    })
    .join(',')

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        className="relative h-[180px] w-[180px] flex-shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops})` }}
      >
        <div className="absolute inset-9 flex flex-col items-center justify-center rounded-full bg-card">
          <span className="font-display text-2xl font-black text-heading">{centerValue}</span>
          <span className="text-[11px] text-muted">{t(centerLabel)}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {segments.map((segment, index) => (
          <div key={segment.label} className="flex items-center gap-2 text-[13px]">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-[3px]"
              style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <span className="min-w-[120px] text-body">{t(segment.label)}</span>
            <Money sar={segment.value} className="text-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
