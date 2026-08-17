import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { ListPageHeader } from '@/components/shell/ListPage'
import { Section } from '@/components/shell/FeatureScreen'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'

/** UI pattern-library screens (design project/UI.Charts.dc.html and
 *  project/UI.AdvancedFilters.dc.html), wired into `APP_SCREENS` under
 *  /ui/charts and /ui/advanced-filters. Neither design shipped a
 *  `.Mobile.dc.html` variant.
 *
 *  Charts are drawn inline (SVG path / conic-gradient / CSS bars) rather than
 *  through a charting library, the way `Reports.tsx` does it. Series stay in
 *  the blue/navy/orange family only — no green, red, yellow, purple, pink or
 *  teal (README §7). */

const CHART_COLORS = ['#0A5ED7', '#0BB3FF', '#F97316', '#0B1F3B', '#64748B'] as const

// ── Charts ──────────────────────────────────────────────────────────────────

/** Revenue trend, drawn exactly as the design does — a gradient-filled SVG
 *  path. No monthly revenue series exists in the mock data, so the curve
 *  mirrors the design's own demo figures. */
function RevenueArea() {
  const { t } = usePreferences()
  const months = [
    { x: 20, label: 'Jan' },
    { x: 200, label: 'Mar' },
    { x: 380, label: 'May' },
    { x: 486, label: 'Jul' },
  ] as const

  return (
    <svg
      viewBox="0 0 520 200"
      className="block w-full"
      style={{ height: 'auto' }}
      role="img"
      aria-label={t('Revenue trend chart')}
    >
      <defs>
        <linearGradient id="ui-charts-revenue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A5ED7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0A5ED7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M20,158 C80,146 140,122 200,112 C260,102 320,90 380,68 C430,50 480,36 500,30 L500,172 L20,172 Z"
        fill="url(#ui-charts-revenue)"
      />
      <path
        d="M20,158 C80,146 140,122 200,112 C260,102 320,90 380,68 C430,50 480,36 500,30"
        fill="none"
        stroke="#0A5ED7"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {months.map((month) => (
        <text key={month.label} x={month.x} y="190" fontSize="10" fill="#64748B" fontFamily="Inter, sans-serif">
          {t(month.label)}
        </text>
      ))}
    </svg>
  )
}

/** Vertical bar chart — the design's "Jobs by Day" pattern. No date field
 *  exists on the mock jobs, so the bars mirror the design's own demo
 *  heights rather than a derived count. */
function VerticalBars({
  bars,
}: {
  bars: readonly { label: string; value: number; height: number; color: string }[]
}) {
  const { t } = usePreferences()
  return (
    <div className="flex h-40 items-end gap-3">
      {bars.map((bar) => (
        <div key={bar.label} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="font-mono text-[10px] text-muted" dir="ltr">
            {bar.value}
          </span>
          <div className="w-full rounded-t-md" style={{ height: `${bar.height}px`, background: bar.color }} />
          <span className="text-[10px] text-muted">{t(bar.label)}</span>
        </div>
      ))}
    </div>
  )
}

const JOB_DAY_BARS = [
  { label: 'Mon', value: 16, height: 48, color: CHART_COLORS[0] },
  { label: 'Tue', value: 24, height: 72, color: CHART_COLORS[0] },
  { label: 'Wed', value: 32, height: 96, color: CHART_COLORS[0] },
  { label: 'Thu', value: 28, height: 84, color: CHART_COLORS[0] },
  { label: 'Fri', value: 40, height: 120, color: CHART_COLORS[0] },
  { label: 'Sat', value: 21, height: 62, color: CHART_COLORS[1] },
  { label: 'Sun', value: 10, height: 30, color: CHART_COLORS[1] },
] as const

/** Donut built from a conic-gradient, the way `Reports.tsx`'s chart helper
 *  does — no SVG stroke tricks needed for a filled ring. */
function Donut({
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
        className="relative h-[150px] w-[150px] flex-shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops})` }}
      >
        <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-card">
          <span className="font-display text-xl font-black text-heading" dir="ltr">
            {centerValue}
          </span>
          <span className="text-[10px] text-muted">{t(centerLabel)}</span>
        </div>
      </div>
      <div className="flex min-w-[140px] flex-1 flex-col gap-2">
        {segments.map((segment, index) => (
          <div key={segment.label} className="flex items-center gap-2 text-[12px]">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-[3px]"
              style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <span className="flex-1 truncate capitalize text-body">{t(segment.label)}</span>
            <span className="font-mono font-semibold text-muted" dir="ltr">
              {Math.round((segment.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Horizontal target-progress bars — the design's "Targets" panel. No target
 *  figures exist in the mock data, so they mirror the design's own demo
 *  figures rather than a derived value. */
type Target =
  | { label: string; pct: number; color: string; kind: 'money'; current: number; target: number }
  | { label: string; pct: number; color: string; kind: 'text'; display: string }

const TARGETS: readonly Target[] = [
  { label: 'Revenue Target', pct: 85, color: CHART_COLORS[0], kind: 'money', current: 1280000, target: 1500000 },
  { label: 'Jobs Target', pct: 85, color: CHART_COLORS[1], kind: 'text', display: '342 / 400' },
  { label: 'Bay Utilization', pct: 86, color: CHART_COLORS[2], kind: 'text', display: '86%' },
  { label: 'NPS Score', pct: 90, color: CHART_COLORS[3], kind: 'text', display: '72 / 80' },
]

function TargetBars() {
  const { t } = usePreferences()
  return (
    <div className="flex flex-col gap-4">
      {TARGETS.map((target) => (
        <div key={target.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="text-body">{t(target.label)}</span>
            {target.kind === 'money' ? (
              <span className="flex items-center gap-1" dir="ltr">
                <Money sar={target.current} className="font-semibold text-muted" />
                <span className="font-mono text-muted">/</span>
                <Money sar={target.target} bare className="font-semibold text-muted" />
              </span>
            ) : (
              <span className="font-mono font-semibold text-muted" dir="ltr">
                {target.display}
              </span>
            )}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-inset">
            <div className="h-full rounded-full" style={{ width: `${target.pct}%`, background: target.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Charts pattern gallery — area, bar, donut and progress, each drawn inline
 *  the way the design does it. Service Mix derives from the real jobs
 *  collection since it fits (by service type, via reduce); the rest mirror
 *  the design's demo figures since no matching series exists in the mock
 *  data (no monthly revenue, no per-day job dates, no target fields). */
export function UICharts() {
  const { t } = usePreferences()
  const { data: jobs = [] } = useCollection('jobs')

  const serviceMix = useMemo(() => {
    const map = new Map<string, number>()
    for (const job of jobs) {
      const label = job.svc.replace(/_/g, ' ')
      map.set(label, (map.get(label) ?? 0) + 1)
    }
    return [...map.entries()].map(([label, value]) => ({ label, value }))
  }, [jobs])

  return (
    <>
      <ListPageHeader title={t('Charts')} subtitle={t('UI Patterns')} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section title={t('Revenue Trend')}>
          <RevenueArea />
        </Section>
        <Section title={t('Jobs by Day')}>
          <VerticalBars bars={JOB_DAY_BARS} />
        </Section>
        <Section title={t('Service Mix')}>
          <Donut segments={serviceMix} centerValue={String(jobs.length)} centerLabel="jobs" />
        </Section>
        <Section title={t('Targets')}>
          <TargetBars />
        </Section>
      </div>
    </>
  )
}

// ── Advanced Filters ────────────────────────────────────────────────────────

type FilterOperator = 'equals' | 'is not' | 'contains' | 'greater than' | 'less than'

const FILTER_FIELDS = ['Status', 'Priority', 'Assigned To', 'Service Type', 'Branch'] as const
const FILTER_OPERATORS: readonly FilterOperator[] = ['equals', 'is not', 'contains', 'greater than', 'less than']

interface FilterRow {
  id: number
  field: string
  op: FilterOperator
  value: string
}

const INITIAL_FILTER_ROWS: readonly FilterRow[] = [
  { id: 1, field: 'Status', op: 'equals', value: 'In Progress' },
  { id: 2, field: 'Priority', op: 'is not', value: 'Low' },
  { id: 3, field: 'Assigned To', op: 'contains', value: 'Yousef' },
]

/** Visual-only filter builder, matching the design's static demo — rows live
 *  in local state and nothing here filters real data; the pattern is the
 *  point of the page. */
export function UIAdvancedFilters() {
  const { t } = usePreferences()
  const [rows, setRows] = useState<readonly FilterRow[]>(INITIAL_FILTER_ROWS)
  const [nextId, setNextId] = useState(INITIAL_FILTER_ROWS.length + 1)

  const updateRow = (id: number, patch: Partial<FilterRow>) =>
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))

  const removeRow = (id: number) => setRows((prev) => prev.filter((row) => row.id !== id))

  const addRow = () => {
    setRows((prev) => [...prev, { id: nextId, field: FILTER_FIELDS[0], op: FILTER_OPERATORS[0], value: '' }])
    setNextId((id) => id + 1)
  }

  const resetAll = () => {
    setRows(INITIAL_FILTER_ROWS)
    setNextId(INITIAL_FILTER_ROWS.length + 1)
  }

  return (
    <>
      <ListPageHeader title={t('Advanced Filters')} subtitle={t('UI Patterns')} />
      <Section
        title={t('Filter Builder')}
        className="max-w-[720px]"
        toolbar={
          <Button variant="ghost" size="sm" onClick={resetAll}>
            {t('Reset All')}
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          {rows.length === 0 ? (
            <p className="text-[13px] text-muted">{t('No filters yet')}</p>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center gap-2.5 rounded-[10px] border border-border bg-inset p-3"
              >
                <select
                  value={row.field}
                  onChange={(event) => updateRow(row.id, { field: event.target.value })}
                  aria-label={t('Field')}
                  className="h-8 rounded border border-border bg-card px-2 text-xs text-heading outline-none focus:border-salis-blue"
                >
                  {FILTER_FIELDS.map((field) => (
                    <option key={field} value={field}>
                      {t(field)}
                    </option>
                  ))}
                </select>
                <select
                  value={row.op}
                  onChange={(event) => updateRow(row.id, { op: event.target.value as FilterOperator })}
                  aria-label={t('Operator')}
                  className="h-8 rounded border border-border bg-card px-2 text-xs text-heading outline-none focus:border-salis-blue"
                >
                  {FILTER_OPERATORS.map((op) => (
                    <option key={op} value={op}>
                      {t(op)}
                    </option>
                  ))}
                </select>
                <input
                  value={row.value}
                  onChange={(event) => updateRow(row.id, { value: event.target.value })}
                  placeholder={t('Value')}
                  aria-label={t('Value')}
                  className="h-8 min-w-[120px] flex-1 rounded border border-border bg-card px-2 text-xs text-heading outline-none focus:border-salis-blue"
                />
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  aria-label={t('Remove filter')}
                  className="flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-[rgba(249,115,22,.08)] text-salis-orange"
                >
                  <X size={13} strokeWidth={2} aria-hidden />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="ghost" size="sm" onClick={addRow} className="border border-dashed border-border-strong">
            <Icon name="Plus" size={13} />
            {t('Add Filter')}
          </Button>
          <span className="flex-1" />
          <Button size="md">{t('Apply Filters')}</Button>
        </div>
      </Section>
    </>
  )
}
