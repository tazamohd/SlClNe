import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/DataTable'
import {
  MobileCard,
  MobileCardHeader,
  MobileList,
  MobilePageHeader,
} from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { useIsMobile } from '@/lib/useMediaQuery'
import { cn } from '@/lib/cn'

/** Workshop analytics: KPI row, weekly trend, jobs-by-category breakdown and a
 *  technician performance table.
 *
 *  The figures derive from the collections wherever the data exists, so the
 *  headlines cannot disagree with the rows underneath them — the same rule
 *  Payments and the accounting reports follow. That departs from the mockup's
 *  numbers on purpose: the design hardcoded "342 job cards" over a table whose
 *  own arithmetic it never reconciled (its 4.6h Avg Bay Time contradicts the
 *  2,184h / 342 jobs shown beside it). What has no repository source yet —
 *  per-technician logged hours and QC history, the trend series, the
 *  vs-last-period deltas — is kept as design scaffolding and documented below,
 *  exactly as TechnicianSchedule does for its slots. */

type PeriodId = 'week' | 'month' | 'quarter' | 'year'

const PERIODS: readonly { id: PeriodId; label: string }[] = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'year', label: 'This Year' },
]

/** Icon tints for the KPI cards, straight from the design's palette sequence:
 *  blue, sky, orange, navy. No green/red/yellow (README §7). */
const KPI_TINTS: readonly (readonly [string, string])[] = [
  ['rgba(10,94,215,.1)', '#0A5ED7'],
  ['rgba(11,179,255,.1)', '#0BB3FF'],
  ['rgba(249,115,22,.1)', '#F97316'],
  ['rgba(11,31,59,.1)', '#0B1F3B'],
]

/** Bar colours for the breakdown card — the design's five-colour sequence. */
const BREAKDOWN_COLORS = ['#0A5ED7', '#0BB3FF', '#F97316', '#0B1F3B', '#64748B'] as const

/** Avg hours per job and QC pass rate per technician, from the design's
 *  Details table (its Avg / Job and QC Pass columns). The technicians
 *  collection carries only name/specialty/jobs/rating — no logged hours and no
 *  QC history — so these rates have no repository source yet; when the
 *  job-history endpoint lands they come from there and this constant
 *  disappears. A technician missing here renders "—" rather than an invented
 *  figure. (The design's fifth row, Majed Al-Shehri, is not in the technicians
 *  collection, so he does not appear.) */
const PERFORMANCE: Record<string, { avgHours: number; qcPass: number }> = {
  'Yousef Al-Otaibi': { avgHours: 6.2, qcPass: 99 },
  'Faisal Al-Harbi': { avgHours: 6.1, qcPass: 98 },
  'Bandar Al-Qahtani': { avgHours: 6.7, qcPass: 97 },
  'Nasser Al-Dosari': { avgHours: 6.2, qcPass: 98 },
}

/** vs-last-period deltas, as the design shows them. The mock data has no prior
 *  period to diff against; Dashboard keeps its "+12%" the same way. All four
 *  read in blue — direction arrows carry the up/down, not colour. */
const KPI_TRENDS: readonly { trend: string; up: boolean }[] = [
  { trend: '+8.2%', up: true },
  { trend: '+5.4%', up: true },
  { trend: '+1.2%', up: true },
  { trend: '-0.4h', up: false },
]

/** The design's weekly throughput curve. Job cards carry no dates in the mock
 *  tables, so there is nothing to plot yet — same standing as Dashboard's
 *  REVENUE_PATH. */
const TREND_LINE =
  'M20,138 C90,124 160,130 230,104 C300,86 370,90 440,66 C500,50 560,44 580,38'
const TREND_AREA = `${TREND_LINE} L580,168 L20,168 Z`
const TREND_AXIS = [
  { x: 20, label: 'Mon' },
  { x: 230, label: 'Wed' },
  { x: 440, label: 'Fri' },
  { x: 560, label: 'Sun' },
] as const

interface TechRow {
  name: string
  jobs: number
  hours: number | null
  avgHours: number | null
  qcPass: number | null
}

/** "612h" / "24.4h" — one decimal at most, trailing .0 dropped. */
function formatHours(hours: number): string {
  return `${(Math.round(hours * 10) / 10).toLocaleString('en-US', { maximumFractionDigits: 1 })}h`
}

export function WorkshopReports() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [period, setPeriod] = useState<PeriodId>('month')

  const { data: jobs = [], isLoading: jobsLoading } = useCollection('jobs')
  const { data: technicians = [], isLoading: techsLoading } = useCollection('technicians')

  /** Technician performance rows: roster and job counts from the collection,
   *  rates joined from the design constant above. Sorted busiest-first, as the
   *  design lists them. */
  const techRows = useMemo<readonly TechRow[]>(
    () =>
      technicians
        .map((tech) => {
          const perf = PERFORMANCE[tech.name]
          return {
            name: tech.name,
            jobs: tech.jobs,
            hours: perf ? Math.round(tech.jobs * perf.avgHours * 10) / 10 : null,
            avgHours: perf?.avgHours ?? null,
            qcPass: perf?.qcPass ?? null,
          }
        })
        .sort((a, b) => b.jobs - a.jobs),
    [technicians]
  )

  /** Jobs per service category, computed from the job-card list — the honest
   *  stand-in for the design's hardcoded category counts. */
  const breakdown = useMemo(() => {
    const counts = new Map<string, number>()
    for (const job of jobs) {
      const label = job.svc.replace(/_/g, ' ')
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
  }, [jobs])

  const kpis = useMemo(() => {
    let hoursSum = 0
    let hoursJobs = 0
    let qcWeighted = 0
    let qcJobs = 0
    for (const row of techRows) {
      if (row.hours !== null) {
        hoursSum += row.hours
        hoursJobs += row.jobs
      }
      if (row.qcPass !== null) {
        qcWeighted += row.qcPass * row.jobs
        qcJobs += row.jobs
      }
    }

    const qcRate = qcJobs
      ? `${(Math.round((qcWeighted / qcJobs) * 10) / 10).toLocaleString('en-US', { maximumFractionDigits: 1 })}%`
      : '—'
    const avgBay = hoursJobs ? formatHours(hoursSum / hoursJobs) : '—'

    const values: readonly { icon: string; label: string; value: string }[] = [
      { icon: 'ClipboardList', label: 'Job Cards', value: jobs.length.toLocaleString('en-US') },
      { icon: 'Users', label: 'Technician Hours', value: hoursJobs ? formatHours(hoursSum) : '—' },
      { icon: 'CheckCircle', label: 'QC Pass Rate', value: qcRate },
      { icon: 'Timer', label: 'Avg Bay Time', value: avgBay },
    ]
    return values.map((kpi, index) => ({
      ...kpi,
      ...KPI_TRENDS[index],
      tint: KPI_TINTS[index][0],
      color: KPI_TINTS[index][1],
    }))
  }, [jobs, techRows])

  if (jobsLoading || techsLoading) {
    return <p className="text-sm text-muted">{t('Loading...')}</p>
  }

  const breakdownCard = (
    <Card className={isMobile ? 'p-4' : 'p-6'}>
      <h3 className={cn('font-bold text-heading', isMobile ? 'mb-3 text-[15px]' : 'mb-5 text-lg')}>
        {t('Breakdown')}
      </h3>
      {breakdown.length === 0 ? (
        <EmptyState
          icon="ClipboardList"
          title={t('No job cards yet')}
          description={t('Categories appear once job cards are opened.')}
        />
      ) : (
        <div className={cn('flex flex-col', isMobile ? 'gap-2.5' : 'gap-3.5')}>
          {breakdown.map((row, index) => {
            const max = breakdown[0]?.count ?? 1
            return (
              <div key={row.label}>
                <div className="mb-1 flex items-center justify-between gap-3 text-[13px]">
                  <span className="capitalize text-body">{t(row.label)}</span>
                  <span className="font-mono font-semibold text-muted">
                    {row.count} {t('jobs')}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(row.count / max) * 100}%`,
                      background: BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length],
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )

  return (
    <>
      {/* ── Header: title, period tabs, export ─────────────────────────── */}
      {isMobile ? (
        <MobilePageHeader icon="Wrench" title={t('Workshop Reports')} subtitle={t('Reports & Analytics')} />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" aria-hidden />
              <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
                <Icon name="Wrench" size={28} />
              </div>
            </div>
            <div>
              <h1 className="font-display text-[30px] font-black leading-tight text-heading">
                {t('Workshop Reports')}
              </h1>
              <p className="mt-0.5 text-[13px] text-muted">{t('Reports & Analytics')}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Period filter. The mock data is a single snapshot with no dates,
                so — as in the prototype — the choice is visual state only. */}
            <div role="group" aria-label={t('Period')} className="flex gap-1.5">
              {PERIODS.map((option) => {
                const active = option.id === period
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPeriod(option.id)}
                    className={cn(
                      'h-8 cursor-pointer rounded-lg px-3.5 font-action text-xs font-medium',
                      'transition-all duration-150',
                      active
                        ? 'border-none bg-salis-gradient text-white shadow-[0_4px_12px_rgba(10,94,215,.25)]'
                        : 'border border-border bg-card text-body hover:border-salis-blue hover:text-salis-blue'
                    )}
                  >
                    {t(option.label)}
                  </button>
                )
              })}
            </div>
            <Button size="md">
              <Icon name="Download" size={15} />
              {t('Export Report')}
            </Button>
          </div>
        </div>
      )}

      {/* ── KPIs: 4-up grid; snap-scroll strip on mobile per the design ── */}
      {isMobile ? (
        <div className="-mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} compact />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} />
          ))}
        </div>
      )}

      {/* ── Trend + breakdown. The mobile design drops the trend chart. ── */}
      {isMobile ? (
        breakdownCard
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="p-6">
            <h3 className="mb-5 text-lg font-bold text-heading">{t('Trend')}</h3>
            <svg viewBox="0 0 600 190" className="block h-auto w-full" role="img" aria-label={t('Trend')}>
              <defs>
                <linearGradient id="wr-trend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0A5ED7" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#0A5ED7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={TREND_AREA} fill="url(#wr-trend)" />
              <path
                d={TREND_LINE}
                fill="none"
                stroke="#0A5ED7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {TREND_AXIS.map((tick) => (
                <text
                  key={tick.label}
                  x={tick.x}
                  y="182"
                  fontSize="11"
                  fill="#64748B"
                  fontFamily="Inter,sans-serif"
                >
                  {t(tick.label)}
                </text>
              ))}
            </svg>
          </Card>
          {breakdownCard}
        </div>
      )}

      {/* ── Technician performance ───────────────────────────────────────── */}
      {isMobile ? (
        techRows.length === 0 ? (
          <Card className="p-6">
            <TechEmpty />
          </Card>
        ) : (
          <MobileList>
            {techRows.map((row) => (
              <MobileCard key={row.name}>
                <MobileCardHeader
                  title={row.name}
                  trailing={
                    <span dir="ltr" className="font-mono text-[13px] font-bold text-salis-blue">
                      {row.qcPass !== null ? `${row.qcPass}%` : '—'}
                    </span>
                  }
                />
                <p className="text-xs text-muted">
                  {t('Jobs')}: {row.jobs} · {t('Hours')}: {row.hours !== null ? formatHours(row.hours) : '—'}
                </p>
              </MobileCard>
            ))}
          </MobileList>
        )
      ) : (
        <Card className="overflow-hidden">
          <div className="flex items-center border-b border-border px-6 py-4">
            <h3 className="text-base font-bold text-heading">{t('Details')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-ui text-sm text-heading">
              <thead>
                <tr>
                  {['Technician', 'Jobs', 'Hours', 'Avg / Job', 'QC Pass'].map((header, index, all) => (
                    <th
                      key={header}
                      scope="col"
                      className={cn(
                        'h-11 whitespace-nowrap border-b border-border px-6 text-xs font-semibold uppercase tracking-[.05em] text-muted',
                        index === all.length - 1 ? 'text-end' : 'text-start'
                      )}
                    >
                      {t(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {techRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12">
                      <TechEmpty />
                    </td>
                  </tr>
                ) : (
                  techRows.map((row) => (
                    <tr key={row.name} className="transition-colors duration-150 hover:bg-[rgba(10,94,215,.04)]">
                      <td className="border-b border-border px-6 py-3 font-medium">{row.name}</td>
                      <NumberCell>{row.jobs}</NumberCell>
                      <NumberCell>{row.hours !== null ? formatHours(row.hours) : '—'}</NumberCell>
                      <NumberCell>{row.avgHours !== null ? formatHours(row.avgHours) : '—'}</NumberCell>
                      <td className="border-b border-border px-6 py-3 text-end font-mono text-[13px] font-semibold">
                        {row.qcPass !== null ? `${row.qcPass}%` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  )
}

/** KPI card: tinted icon chip, label, value, trend chip. `compact` is the
 *  mobile design's snap-scroll variant — no icon chip, no "vs Last Period". */
function KpiCard({
  kpi,
  compact,
}: {
  kpi: {
    icon: string
    label: string
    value: string
    trend: string
    up: boolean
    tint: string
    color: string
  }
  compact?: boolean
}) {
  const { t } = usePreferences()
  return (
    <Card className={compact ? 'w-[62%] flex-none snap-start rounded-[14px] p-3.5' : 'p-5'}>
      {compact ? (
        <span className="text-xs text-muted">{t(kpi.label)}</span>
      ) : (
        <div className="mb-2.5 flex items-center gap-2">
          <span className="flex rounded-[10px] p-2" style={{ background: kpi.tint, color: kpi.color }}>
            <Icon name={kpi.icon} size={18} />
          </span>
          <span className="text-[13px] font-medium text-muted">{t(kpi.label)}</span>
        </div>
      )}
      <h3
        dir="ltr"
        className={cn(
          'font-display font-black leading-tight text-heading',
          compact ? 'mt-1.5 text-[22px]' : 'text-[26px]'
        )}
      >
        {kpi.value}
      </h3>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span dir="ltr" className="inline-flex items-center gap-0.5 text-xs font-semibold text-salis-blue">
          <Icon name={kpi.up ? 'ArrowUpRight' : 'ArrowDownRight'} size={13} />
          {kpi.trend}
        </span>
        {compact ? null : <span className="text-[11px] text-muted">{t('vs Last Period')}</span>}
      </div>
    </Card>
  )
}

/** Numeric table cell: mono per the design's figure columns. */
function NumberCell({ children }: { children: React.ReactNode }) {
  return <td className="border-b border-border px-6 py-3 font-mono text-[13px] text-body">{children}</td>
}

function TechEmpty() {
  const { t } = usePreferences()
  return (
    <EmptyState
      icon="Users"
      title={t('No technicians on strength')}
      description={t('Performance appears once technicians are registered.')}
    />
  )
}
