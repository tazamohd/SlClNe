import { cn } from '@/lib/cn'
import { Money } from './Money'
import { usePreferences } from '@/providers/PreferencesProvider'

/** The two charts the design draws inline, shared by every report and BI screen.
 *
 *  They lived inside `screens/accounting/Reports.tsx` while reporting was the
 *  only consumer. Operational dashboards need the same two shapes, and a second
 *  copy is how two screens end up disagreeing about what blue means. */

/** Brand-safe chart palette — the five `--chart-*` tokens, no green or red. */
export const CHART_COLORS = ['var(--salis-blue)', 'var(--salis-blue-bright)', 'var(--chart-3)', 'var(--text-muted)', 'var(--salis-orange)']

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

/** Bars for a count distribution. Distinct from `BarList`, which renders its
 *  value as a SAR amount — a count is a tally of records, so it is shown as a
 *  plain LTR integer, never money.
 *
 *  `total`, when given, is the denominator every bar is scaled against (e.g.
 *  the sum of all rows). When omitted, the largest individual value is used. */
export function CountBars({
  rows,
  total,
}: {
  rows: readonly { label: string; value: number }[]
  total?: number
}) {
  const { t } = usePreferences()
  const max = total ?? Math.max(...rows.map((row) => row.value), 1)
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <div key={row.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="capitalize text-body">{t(row.label)}</span>
            <span className="font-mono font-semibold text-heading" dir="ltr">
              {row.value}
            </span>
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

/** SVG path for a series scaled into `width × height`, with `pad` px kept
 *  clear at top and bottom so the stroke never clips. Shared by the sparkline
 *  and the area chart; exported so a test can pin the geometry. */
export function pathFor(
  values: readonly number[],
  width: number,
  height: number,
  pad = 2
): { line: string; area: string; points: { x: number; y: number }[] } {
  if (values.length === 0) return { line: '', area: '', points: [] }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const step = values.length > 1 ? width / (values.length - 1) : 0
  const points = values.map((value, index) => ({
    x: values.length > 1 ? index * step : width / 2,
    y: pad + (height - pad * 2) * (1 - (value - min) / span),
  }))
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const last = points[points.length - 1]
  const area = `${line} L${last.x.toFixed(1)},${height} L${points[0].x.toFixed(1)},${height} Z`
  return { line, area, points }
}

/** Tiny trend line for a KPI tile. Reads as an image to assistive tech, with
 *  `label` saying what the trend is of; the figure it sits beside carries the
 *  value. `kind: 'area'` fills under the line. */
export function Sparkline({
  values,
  kind = 'line',
  width = 96,
  height = 32,
  stroke = 'var(--salis-blue)',
  label,
  showLast,
  className,
}: {
  values: readonly number[]
  kind?: 'line' | 'area'
  width?: number
  height?: number
  stroke?: string
  /** English source string. */
  label: string
  /** Mark the latest point with a dot. */
  showLast?: boolean
  className?: string
}) {
  const { t } = usePreferences()
  const { line, area, points } = pathFor(values, width, height, 3)
  const last = points[points.length - 1]
  return (
    <svg
      role="img"
      aria-label={t(label)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      {kind === 'area' && area ? <path d={area} fill={stroke} fillOpacity={0.12} /> : null}
      {line ? (
        <path d={line} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
      {showLast && last ? <circle cx={last.x} cy={last.y} r={3} fill={stroke} /> : null}
    </svg>
  )
}

/** Area chart for a time series, drawn inline like every other chart here.
 *  Axes are labels only — the design draws no grid — and the series is also
 *  described in text for screen readers: first, last and peak values. */
export function AreaChart({
  series,
  labels,
  height = 260,
  label,
  format = (value) => String(value),
  className,
}: {
  series: readonly number[]
  /** One label per point, e.g. months. */
  labels: readonly string[]
  height?: number
  /** English source string naming the chart. */
  label: string
  /** Formats a value for the accessible summary. */
  format?: (value: number) => string
  className?: string
}) {
  const { t } = usePreferences()
  const width = 600
  const plotHeight = height - 40
  const inset = 20
  const { line, area, points } = pathFor(series, width - inset * 2, plotHeight, 8)
  const shift = (d: string) => d.replace(/([ML])(-?[\d.]+),/g, (_, cmd: string, x: string) => `${cmd}${(Number(x) + inset).toFixed(1)},`)
  const gradientId = `area-${label.replace(/\W+/g, '-').toLowerCase()}`
  const peak = series.length ? Math.max(...series) : 0
  const summary = series.length
    ? `${t('From')} ${format(series[0])} ${t('to')} ${format(series[series.length - 1])}; ${t('peak')} ${format(peak)}`
    : t('No data')

  return (
    <figure className={cn('m-0', className)}>
      <svg
        role="img"
        aria-label={`${t(label)} — ${summary}`}
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--salis-blue)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--salis-blue)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {area ? <path d={shift(area)} fill={`url(#${gradientId})`} /> : null}
        {line ? <path d={shift(line)} fill="none" stroke="var(--salis-blue)" strokeWidth="2.5" strokeLinecap="round" /> : null}
        {points.map((p, index) => (
          <circle key={index} cx={p.x + inset} cy={p.y} r={3} fill="var(--surface-card)" stroke="var(--salis-blue)" strokeWidth={2} />
        ))}
        {labels.map((text, index) => {
          const x = points[index] ? points[index].x + inset : inset
          return (
            <text
              key={`${text}-${index}`}
              x={x}
              y={height - 12}
              fontSize="11"
              fill="var(--text-muted)"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
            >
              {t(text)}
            </text>
          )
        })}
      </svg>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
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
