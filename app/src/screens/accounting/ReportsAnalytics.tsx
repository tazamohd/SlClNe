import { useMemo, useState } from 'react'
import { BarChart3, Download } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { cn } from '@/lib/cn'

/** Reports & Analytics — the biggest of the W3 report designs: KPI strip,
 *  revenue trend, service mix and a technician performance table.
 *
 *  Figures derive from the same collections the sibling report screens use
 *  (`Reports.tsx`), so this screen can't disagree with `FinancialReports` or
 *  `BIDashboard` about what revenue is. Two things the mock data has no source
 *  for — the weekly/monthly revenue trend and the customer retention rate —
 *  stay local constants, exactly as `Dashboard`'s `REVENUE_PATH` does, rather
 *  than being invented from unrelated fields. */

/** Brand-safe chart palette — the five `--chart-*` tokens, no green or red. */
const CHART_COLORS = ['#0A5ED7', '#0BB3FF', '#38BDF8', '#64748B', '#F97316']

const PERIODS = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'year', label: 'This Year' },
] as const

/** Monthly revenue trend. The ledger holds one balance per account, not a
 *  time series, so — like Dashboard's REVENUE_PATH — this is a design-only
 *  series rather than a fabricated per-period aggregate. Values match the
 *  design's mock (in SAR thousands). */
const REVENUE_TREND: readonly [string, number][] = [
  ['Jan', 82],
  ['Feb', 95],
  ['Mar', 78],
  ['Apr', 110],
  ['May', 92],
  ['Jun', 125],
  ['Jul', 128],
]
const MAX_TREND = Math.max(...REVENUE_TREND.map(([, value]) => value))

type Technician = RowOf<'technicians'>

export function ReportsAnalytics() {
  const { t } = usePreferences()
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['id']>('month')

  const { data: accounts = [], isLoading: accountsLoading } = useCollection('chartOfAccounts')
  const { data: jobs = [], isLoading: jobsLoading } = useCollection('jobs')
  const { data: technicians = [], isLoading: techLoading } = useCollection('technicians')

  // Same computation FinancialReports/BIDashboard use — one revenue figure
  // across every report screen.
  const revenue = useMemo(
    () =>
      accounts
        .filter((a) => a.type === 'Revenue')
        .reduce((sum, a) => sum + parseSar(a.balance), 0),
    [accounts]
  )

  const jobsCompleted = useMemo(
    () => jobs.filter((j) => j.st === 'completed' || j.st === 'delivered').length,
    [jobs]
  )

  const avgJobValue = jobs.length ? revenue / jobs.length : 0

  const byService = useMemo(() => {
    const counts = new Map<string, number>()
    for (const job of jobs) counts.set(job.svc, (counts.get(job.svc) ?? 0) + 1)
    const total = jobs.length || 1
    return [...counts.entries()]
      .map(([label, count]) => ({
        label: label.replace(/_/g, ' '),
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.pct - a.pct)
  }, [jobs])

  const techTotalJobs = useMemo(
    () => technicians.reduce((sum, tc) => sum + tc.jobs, 0) || 1,
    [technicians]
  )
  const maxTechJobs = useMemo(() => Math.max(...technicians.map((tc) => tc.jobs), 1), [technicians])

  const kpis = [
    {
      icon: 'DollarSign',
      tint: 'rgba(10,94,215,.1)',
      color: '#0A5ED7',
      label: 'Total Revenue',
      value: formatSar(revenue),
      change: '↑ 12.3%',
      loading: accountsLoading,
    },
    {
      icon: 'Wrench',
      tint: 'rgba(11,179,255,.1)',
      color: '#0BB3FF',
      label: 'Jobs Completed',
      value: String(jobsCompleted),
      change: '↑ 8.5%',
      loading: jobsLoading,
    },
    {
      icon: 'TrendingUp',
      tint: 'rgba(10,94,215,.1)',
      color: '#0A5ED7',
      label: 'Avg Job Value',
      value: formatSar(avgJobValue),
      change: '↑ 3.2%',
      loading: accountsLoading || jobsLoading,
    },
    {
      // No repeat-visit history exists in the mock data (customers, jobs and
      // invoices are five independent one-off rows each) — this stays the
      // design's own figure rather than a rate computed from an unrelated
      // field, per the same honesty rule that keeps REVENUE_TREND a constant.
      icon: 'Users',
      tint: 'rgba(11,179,255,.1)',
      color: '#0BB3FF',
      label: 'Customer Retention',
      value: '87%',
      change: '↑ 2.1%',
      loading: false,
    },
  ] as const

  const columns: Column<Technician>[] = [
    {
      header: 'Technician',
      cell: (tc) => (
        <span className="flex items-center gap-2">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[10px] font-bold text-white">
            {tc.name.charAt(0)}
          </span>
          <span className="font-semibold text-heading">{tc.name}</span>
        </span>
      ),
    },
    {
      header: 'Jobs Completed',
      cell: (tc) => (
        <span dir="ltr">{tc.jobs}</span>
      ),
      className: 'text-center',
    },
    {
      header: 'Total Revenue',
      // No per-technician revenue field exists on the technicians table — the
      // real ledger revenue is apportioned by each technician's real share of
      // the job count, so the rows sum back to the headline above them.
      cell: (tc) => (
        <Money sar={(tc.jobs / techTotalJobs) * revenue} className="font-semibold text-heading" />
      ),
      className: 'text-end',
    },
    {
      header: 'Rating',
      cell: (tc) => (
        <span className="inline-flex items-center gap-1 font-semibold text-salis-blue">
          <Icon name="Star" size={13} />
          {tc.rating}
        </span>
      ),
      className: 'text-center',
    },
    {
      header: 'Utilization',
      // No utilization field exists either — shown as load relative to the
      // busiest technician, the same normalisation OperationalReports uses
      // for its Technician Load bars.
      cell: (tc) => {
        const pct = Math.round((tc.jobs / maxTechJobs) * 100)
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="h-1 w-14 overflow-hidden rounded-full bg-inset">
              <div className="h-full rounded-full bg-salis-gradient" style={{ width: `${pct}%` }} />
            </div>
            <span className="font-mono text-xs text-muted" dir="ltr">
              {pct}%
            </span>
          </div>
        )
      },
      className: 'text-center',
    },
  ]

  return (
    <>
      {/* BarChart3 isn't in the generated icon registry, so it's imported
          directly from lucide-react per the binding conventions. */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex flex-shrink-0 rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <BarChart3 size={26} strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-black text-heading lg:text-[26px]">
              {t('Reports & Analytics')}
            </h1>
            <p className="mt-0.5 text-xs text-muted lg:text-sm">{t('Financial Overview')}</p>
          </div>
        </div>
        <div className="flex-1" />
        <div role="tablist" className="flex overflow-x-auto rounded-lg border border-border">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={period === p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                'h-[34px] flex-shrink-0 cursor-pointer whitespace-nowrap border-none px-3.5 font-action text-xs font-semibold transition-colors duration-150',
                period === p.id ? 'bg-salis-gradient text-white' : 'bg-card text-body hover:bg-inset'
              )}
            >
              {t(p.label)}
            </button>
          ))}
        </div>
        <Button variant="subtle" size="md">
          <Download size={14} strokeWidth={2} aria-hidden />
          {t('Export Report')}
        </Button>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="flex flex-col gap-2 p-3.5 lg:p-[18px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-muted lg:text-xs">{t(kpi.label)}</span>
              <span
                className="flex flex-shrink-0 rounded-lg p-1.5 lg:p-2"
                style={{ background: kpi.tint, color: kpi.color }}
              >
                <Icon name={kpi.icon} size={16} />
              </span>
            </div>
            {kpi.loading ? (
              <span className="block h-6 w-2/3 animate-pulse rounded bg-inset" />
            ) : (
              <h3 className="font-display text-xl font-black text-heading lg:text-2xl" dir="ltr">
                {kpi.value}
              </h3>
            )}
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[rgba(10,94,215,.1)] px-2 py-0.5 text-[11px] font-semibold text-salis-blue">
              {kpi.change}
            </span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
        {/* ── Revenue trend ──────────────────────────────────────────────── */}
        <Card className="flex flex-col gap-4 p-5 lg:col-span-3">
          <h3 className="font-display text-sm font-bold text-heading">{t('Revenue Analysis')}</h3>
          <div className="flex h-[130px] items-end gap-2 lg:h-[180px]">
            {REVENUE_TREND.map(([label, value]) => (
              <div key={label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="font-mono text-[10px] text-muted" dir="ltr">
                  {value}K
                </span>
                <div
                  className="w-full rounded-t bg-salis-gradient"
                  style={{ height: `${Math.round((value / MAX_TREND) * 100)}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-muted">{t(label)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Service breakdown ──────────────────────────────────────────── */}
        <Card className="flex flex-col gap-3.5 p-5 lg:col-span-2">
          <h3 className="font-display text-sm font-bold text-heading">{t('Service Breakdown')}</h3>
          {jobsLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <span key={i} className="block h-2 w-full animate-pulse rounded-full bg-inset" />
              ))}
            </div>
          ) : byService.length ? (
            byService.map((row, index) => (
              <div key={row.label} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="capitalize text-body">{t(row.label)}</span>
                  <span className="font-mono font-semibold text-heading">{row.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-inset">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${row.pct}%`, background: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-[13px] text-muted">{t('No jobs recorded')}</p>
          )}
        </Card>
      </div>

      {/* ── Technician performance ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-sm font-bold text-heading">{t('Technician Performance')}</h3>
        <DataTable
          columns={columns}
          rows={technicians}
          rowKey={(tc) => tc.name}
          loading={techLoading}
          mobileCard={(tc) => (
            <>
              <MobileCardHeader
                title={tc.name}
                trailing={
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-salis-blue">
                    <Icon name="Star" size={12} />
                    {tc.rating}
                  </span>
                }
              />
              <MobileCardRow label={t('Jobs Completed')}>
                <span dir="ltr">{tc.jobs}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Total Revenue')}>
                <Money
                  sar={(tc.jobs / techTotalJobs) * revenue}
                  className="font-semibold text-heading"
                />
              </MobileCardRow>
              <MobileCardRow label={t('Utilization')}>
                <span dir="ltr">{Math.round((tc.jobs / maxTechJobs) * 100)}%</span>
              </MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="Users" title={t('No technicians yet')} />}
        />
      </div>
    </>
  )
}
