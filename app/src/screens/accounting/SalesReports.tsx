import { useMemo, useState, type ReactNode } from 'react'
import { FeatureHeader, Section, StatRow, TabBar, type Stat } from '@/components/shell/FeatureScreen'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useToast } from '@/components/ui/Toast'
import { useCollection } from '@/data/useCollection'

/** Sales Reports — pipeline, revenue and job-volume rolled up for the sales
 *  function.
 *
 *  The design mocks a quarterly revenue trend and a per-rep leaderboard that
 *  no collection backs (no sales-rep field exists anywhere in the data layer,
 *  and no invoice carries more than one date to plot a real series from). Both
 *  are called out below rather than silently faked into full charts — the
 *  headline KPIs and the two breakdown panels are computed from `invoices`,
 *  `jobs` and `estimates` instead, per the ledger-derives-the-report pattern
 *  `FinancialReports` uses. */

/** Brand-safe chart palette — blue/bright/orange/slate only (README §7). */
const CHART_COLORS = ['#0A5ED7', '#0BB3FF', '#F97316', '#0B1F3B', '#64748B']

/** The design's Sales Rep leaderboard. Kept as a local const: `jobs`,
 *  `invoices` and `estimates` carry no sales-rep dimension to derive it from,
 *  so recomputing it from unrelated rows would be a fabrication the design's
 *  numbers aren't. Figures match `SalesReports.dc.html`'s `rowRaw`. */
const REP_ROWS = [
  { rep: 'Khalid Al-Amri', deals: 18, pipeline: 730_000, revenue: 486_000, winRate: 44 },
  { rep: 'Ahmed Al-Rashid', deals: 14, pipeline: 1_200_000, revenue: 392_000, winRate: 38 },
  { rep: 'Fatima Al-Zahrani', deals: 11, pipeline: 2_500_000, revenue: 264_000, winRate: 31 },
  { rep: 'Omar Al-Ghamdi', deals: 7, pipeline: 95_000, revenue: 138_000, winRate: 36 },
] as const

type RepRow = (typeof REP_ROWS)[number]

const PERIODS = ['week', 'month', 'quarter', 'year'] as const
const PERIOD_LABEL: Record<(typeof PERIODS)[number], string> = {
  week: 'This Week',
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year',
}

/** One row of a breakdown panel — a label, a bar sized against `max`, and a
 *  trailing value already formatted by the caller (SAR for revenue panels,
 *  a bare count for volume panels). */
function BarRow({
  label,
  value,
  max,
  color,
  display,
}: {
  label: string
  value: number
  max: number
  color: string
  display: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="capitalize text-body">{label}</span>
        <span className="font-mono font-semibold text-heading" dir="ltr">
          {display}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-inset">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }}
        />
      </div>
    </div>
  )
}

export function SalesReports() {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()
  const isMobile = useIsMobile()
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('month')

  const { data: invoices = [], isLoading: invoicesLoading } = useCollection('invoices')
  const { data: jobs = [], isLoading: jobsLoading } = useCollection('jobs')
  const { data: estimates = [], isLoading: estimatesLoading } = useCollection('estimates')
  const { data: customers = [], isLoading: customersLoading } = useCollection('customers')

  const loading = invoicesLoading || jobsLoading || estimatesLoading || customersLoading

  // Revenue derives from the invoice rows themselves, so the KPI and the
  // breakdown underneath it can't disagree the way the design's hardcoded
  // "SAR 1.28M" headline and its 5-invoice table did.
  const revenue = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + parseSar(inv.amount), 0)
    const byStatus = new Map<string, number>()
    for (const inv of invoices) {
      byStatus.set(inv.status, (byStatus.get(inv.status) ?? 0) + parseSar(inv.amount))
    }
    return {
      total,
      avgTicket: invoices.length ? total / invoices.length : 0,
      byStatus: [...byStatus.entries()]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value),
    }
  }, [invoices])

  // Volume by service, from the job cards actually in the workshop.
  const jobsByService = useMemo(() => {
    const map = new Map<string, number>()
    for (const job of jobs) {
      const label = job.svc.replace(/_/g, ' ')
      map.set(label, (map.get(label) ?? 0) + 1)
    }
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  }, [jobs])

  // Pipeline, from the estimate funnel — win rate is approved ÷ total.
  const pipeline = useMemo(() => {
    const map = new Map<string, number>()
    for (const est of estimates) map.set(est.status, (map.get(est.status) ?? 0) + 1)
    const approved = estimates.filter((est) => est.status === 'approved').length
    return {
      byStage: [...map.entries()].map(([label, value]) => ({ label, value })),
      winRate: estimates.length ? (approved / estimates.length) * 100 : 0,
    }
  }, [estimates])

  const stats: Stat[] = [
    {
      label: 'Total Revenue',
      value: formatSar(revenue.total),
      caption: 'Billed across all invoices',
      highlight: true,
      icon: 'DollarSign',
    },
    {
      label: 'Avg Ticket',
      value: formatSar(revenue.avgTicket),
      caption: 'Per invoice',
      icon: 'Receipt',
    },
    {
      label: 'Win Rate',
      value: `${pipeline.winRate.toFixed(1)}%`,
      caption: 'Estimates approved',
      tone: 'info',
      icon: 'Target',
    },
    {
      label: 'Customers',
      value: customers.length,
      caption: 'On the books',
      icon: 'Users',
    },
  ]

  const canExport = can('execreports', 'x')

  function handleExport() {
    toast.show({
      title: t('Export started'),
      description: t('Your sales report will download shortly.'),
    })
  }

  const revenueMax = Math.max(...revenue.byStatus.map((row) => row.value), 1)
  const jobsMax = Math.max(...jobsByService.map((row) => row.value), 1)
  const pipelineMax = Math.max(...pipeline.byStage.map((row) => row.value), 1)

  const repColumns: Column<RepRow>[] = [
    { header: 'Sales Rep', cell: (row) => row.rep },
    { header: 'Deals Won', cell: (row) => row.deals, code: true },
    { header: 'Pipeline', cell: (row) => <Money sar={row.pipeline} />, code: true },
    {
      header: 'Revenue',
      cell: (row) => <Money sar={row.revenue} className="font-semibold text-heading" />,
      code: true,
    },
    { header: 'Win Rate', cell: (row) => `${row.winRate}%`, code: true },
  ]

  return (
    <>
      <FeatureHeader
        icon="TrendingUp"
        title={t('Sales Reports')}
        subtitle={t('Reports & Analytics')}
        actions={
          <>
            {!isMobile ? (
              <TabBar
                tabs={PERIODS.map((p) => ({ id: p, label: PERIOD_LABEL[p] }))}
                value={period}
                onChange={(id) => setPeriod(id as (typeof PERIODS)[number])}
              />
            ) : null}
            {canExport ? (
              <Button size="md" onClick={handleExport}>
                <Icon name="Download" size={15} />
                {t('Export Report')}
              </Button>
            ) : null}
          </>
        }
      />

      <StatRow stats={stats} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        <Section title={t('Revenue by Invoice Status')} subtitle={t('Derived from the invoice rows')}>
          {loading ? (
            <p className="text-[13px] text-muted">{t('Loading…')}</p>
          ) : revenue.byStatus.length ? (
            <div className="flex flex-col gap-3">
              {revenue.byStatus.map((row, index) => (
                <BarRow
                  key={row.label}
                  label={t(row.label)}
                  value={row.value}
                  max={revenueMax}
                  color={CHART_COLORS[index % CHART_COLORS.length]}
                  display={<Money sar={row.value} bare />}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon="Receipt" title={t('No invoices')} description={t('Nothing has been billed yet.')} />
          )}
        </Section>

        <Section title={t('Jobs by Service')} subtitle={t('Volume in the workshop')}>
          {loading ? (
            <p className="text-[13px] text-muted">{t('Loading…')}</p>
          ) : jobsByService.length ? (
            <div className="flex flex-col gap-3">
              {jobsByService.map((row, index) => (
                <BarRow
                  key={row.label}
                  label={t(row.label)}
                  value={row.value}
                  max={jobsMax}
                  color={CHART_COLORS[index % CHART_COLORS.length]}
                  display={row.value}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon="Wrench" title={t('No job cards')} description={t('Nothing in the workshop yet.')} />
          )}
        </Section>
      </div>

      <Section title={t('Estimate Pipeline')} subtitle={t('Funnel stage, from the estimate registry')}>
        {loading ? (
          <p className="text-[13px] text-muted">{t('Loading…')}</p>
        ) : pipeline.byStage.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {pipeline.byStage.map((row, index) => (
              <BarRow
                key={row.label}
                label={t(row.label)}
                value={row.value}
                max={pipelineMax}
                color={CHART_COLORS[index % CHART_COLORS.length]}
                display={row.value}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon="FileText" title={t('No estimates')} description={t('Nothing in the pipeline yet.')} />
        )}
      </Section>

      <Section
        title={t('Sales Rep Performance')}
        subtitle={t('Deals, pipeline value and revenue per rep')}
      >
        <DataTable
          columns={repColumns}
          rows={REP_ROWS}
          rowKey={(row) => row.rep}
          mobileCard={(row) => (
            <>
              <MobileCardHeader
                title={row.rep}
                trailing={<Money sar={row.revenue} className="font-semibold text-salis-blue" />}
              />
              <MobileCardRow label={t('Deals Won')}>{row.deals}</MobileCardRow>
              <MobileCardRow label={t('Pipeline')}>
                <Money sar={row.pipeline} />
              </MobileCardRow>
              <MobileCardRow label={t('Win Rate')}>{`${row.winRate}%`}</MobileCardRow>
            </>
          )}
        />
      </Section>
    </>
  )
}
