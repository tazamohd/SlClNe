import { Link } from 'react-router-dom'
import { Card, CardHeader } from '@/components/ui/Card'
import { CHART_COLORS } from '@/components/ui/Charts'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PriorityBadge, ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/shell/AppShell'
import { ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, usePagedCollection } from '@/data/useCollection'
import { formatSar } from '@/components/ui/Money'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'
import { useInvoicesSummary } from '@/screens/accounting/useFinanceReports'
import { fromHalalas } from '@/screens/finance/money'
import { AGGREGATE_GAP } from '@/screens/accounting/reporting'
import { isoDate, percentChange } from '@/screens/dashboard-metrics'
import type { RoleId } from '@/data/types'

/** Total Revenue KPI: the server-computed period total (§A10 — the server
 *  sums, the client never adds up a page of invoices), for the current month
 *  to date versus the prior full month. On a build with no API (`isLive`
 *  false) there is no aggregate to show, so this says that plainly rather
 *  than repeating a fixture figure as if it were live. */
function useRevenueMetric(): { value: string; footer: React.ReactNode } {
  const { t } = usePreferences()
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const thisMonth = useInvoicesSummary({ from: isoDate(startOfThisMonth), to: isoDate(now) })
  const lastMonth = useInvoicesSummary({ from: isoDate(startOfLastMonth), to: isoDate(endOfLastMonth) })

  if (!isLive) {
    return {
      value: '—',
      footer: (
        <span className="text-xs text-muted">
          {t('Not connected')} · <span dir="ltr">{AGGREGATE_GAP.sales}</span>
        </span>
      ),
    }
  }

  if (thisMonth.isLoading) return { value: '…', footer: null }
  if (thisMonth.error || !thisMonth.data) {
    return { value: '—', footer: <span className="text-xs text-danger">{t('Could not load revenue')}</span> }
  }

  const value = formatSar(fromHalalas(thisMonth.data.invoicedHalalas))
  const change =
    lastMonth.data ? percentChange(thisMonth.data.invoicedHalalas, lastMonth.data.invoicedHalalas) : null

  return {
    value,
    footer: (
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {change !== null ? (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${change >= 0 ? 'text-salis-blue' : 'text-danger'}`}
          >
            <Icon name={change >= 0 ? 'ArrowUpRight' : 'ArrowDownRight'} size={14} />
            {Math.abs(change).toFixed(1)}%
          </span>
        ) : null}
        <span className="text-xs text-muted">{t('Month to date')}</span>
      </div>
    ),
  }
}

/** The five job-card statuses the `jobs` collection actually carries (§F-036
 *  audit: the design bundle's six-stage Check-In→…→Delivered pipeline is a
 *  different, server-side workflow vocabulary — `workshop/stages.ts`'s
 *  `JOB_STAGES` — that the `jobs` list row does not expose. Deriving "5
 *  pending / 9 active" style figures from a stage `jobs` cannot report would
 *  be inventing them; these five are the ones it can. */
const STATUS_META = [
  { st: 'pending', label: 'Pending', icon: 'Clock', gradient: 'linear-gradient(135deg,var(--salis-orange),var(--orange-light))' },
  { st: 'in_progress', label: 'In Progress', icon: 'Wrench', gradient: 'linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))' },
  { st: 'completed', label: 'Completed', icon: 'CheckCircle', gradient: 'linear-gradient(135deg,var(--salis-blue-bright),var(--chart-3))' },
  { st: 'delivered', label: 'Delivered', icon: 'Car', gradient: 'linear-gradient(135deg,var(--salis-navy),var(--navy-dark))' },
  { st: 'cancelled', label: 'Cancelled', icon: 'XCircle', gradient: 'linear-gradient(135deg,var(--text-muted),var(--neutral-400))' },
] as const

function useJobStatusCounts(jobs: readonly { st: string }[]) {
  return STATUS_META.map((meta) => ({
    ...meta,
    count: jobs.filter((job) => job.st === meta.st).length,
  }))
}

/** Every internal staff role reaches this route (`PERMS.dashboard`); customer
 *  and supplier land on their own portal instead and never do. What each of
 *  them needs here is not the same screen with different words on it — a
 *  technician has no reason to see Total Revenue, and an accountant has no
 *  reason to see the repair bay queue. This dispatches on the signed-in
 *  role, and every branch below reads only real collections (`useCollection`
 *  / `usePagedCollection`), the same seam every other screen reads through —
 *  never a fixture number restated as if it were live. */
export function Dashboard() {
  const { role } = useSession()
  switch (role as RoleId) {
    case 'manager':
      return <ManagerDashboard />
    case 'advisor':
      return <AdvisorDashboard />
    case 'technician':
      return <TechnicianDashboard />
    case 'qc':
      return <QCDashboard />
    case 'parts':
      return <PartsDashboard />
    case 'accountant':
      return <AccountantDashboard />
    case 'hr':
      return <HRDashboard />
    case 'frontdesk':
      return <FrontdeskDashboard />
    case 'callcenter':
      return <CallCenterDashboard />
    case 'procurement':
      return <ProcurementDashboard />
    default:
      // owner, superadmin, test: the only roles with unrestricted visibility
      // (PERMS grants every other module at most a slice of this). They get
      // the full operational-and-financial overview.
      return <OperationalDashboard />
  }
}

/** Owner / Super Admin / Test — the reference implementation every other
 *  operational screen follows: PageHeader → metric row → pipeline strip →
 *  charts → table. */
function OperationalDashboard() {
  const { t, rtl } = usePreferences()
  const { userName } = useSession()
  const isMobile = useIsMobile()
  const { data: jobs = [], isLoading, isError, error, refetch } = useCollection('jobs')
  const { data: parts = [] } = useCollection('parts')
  const customers = usePagedCollection('customers', { pageSize: 1 })
  const revenue = useRevenueMetric()

  if (isLoading) return <Loading label="Loading dashboard..." />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const statusCounts = useJobStatusCounts(jobs)
  const totalJobs = jobs.length
  const activeJobs = jobs.filter((j) => j.st !== 'delivered' && j.st !== 'cancelled').length
  const pendingCount = statusCounts.find((s) => s.st === 'pending')?.count ?? 0
  const inProgressCount = statusCounts.find((s) => s.st === 'in_progress')?.count ?? 0
  const customerCount = customers.data?.page.total
  const inStockParts = parts.filter((p) => p.stock > p.reorder).length
  const stockPct = parts.length > 0 ? Math.round((inStockParts / parts.length) * 100) : null

  const donutTotal = statusCounts.reduce((sum, s) => sum + s.count, 0)
  let cursor = 0
  const donutGradient = donutTotal > 0
    ? statusCounts.map((s, index) => {
        const start = (cursor / donutTotal) * 100
        cursor += s.count
        const end = (cursor / donutTotal) * 100
        return `${CHART_COLORS[index % CHART_COLORS.length]} ${start.toFixed(2)}% ${end.toFixed(2)}%`
      }).join(',')
    : 'var(--border) 0% 100%'

  const jobColumns: Column<(typeof jobs)[number]>[] = [
    { header: 'Job Card', cell: (job) => job.id, code: true },
    { header: 'Customer', cell: (job) => job.cust },
    { header: 'Vehicle', cell: (job) => job.veh },
    { header: 'Service', cell: (job) => <ServiceBadge value={job.svc} label={t(job.svc.replace(/_/g, ' '))} /> },
    { header: 'Priority', cell: (job) => <PriorityBadge value={job.pr} label={t(job.pr)} /> },
    { header: 'Status', cell: (job) => <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} /> },
  ]

  const donutChart = (size: number, ringInset: number, totalTextSize: string) => (
    <div
      className="relative flex-shrink-0 rounded-full"
      style={{ height: size, width: size, background: `conic-gradient(${donutGradient})` }}
    >
      <div
        className="absolute flex flex-col items-center justify-center rounded-full bg-card"
        style={{ inset: ringInset }}
      >
        <span className={`font-display ${totalTextSize} font-black text-heading`}>{donutTotal}</span>
        <span className="text-[11px] text-muted">{t('jobs')}</span>
      </div>
    </div>
  )

  const legend = (gap: string) => (
    <div className={`flex flex-col ${gap}`}>
      {statusCounts.map((s, index) => (
        <div key={s.st} className="flex items-center gap-2 text-[13px]">
          <span
            className="h-2.5 w-2.5 flex-shrink-0 rounded-[3px]"
            style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
          />
          <span className="min-w-[90px] text-body">{t(s.label)}</span>
          <span className="font-mono text-xs text-muted">{s.count}</span>
        </div>
      ))}
    </div>
  )

  if (isMobile) {
    /* `Dashboard.Mobile.dc.html`: a compact header, two full-width actions,
     * the metrics and the pipeline as horizontal strips (one card ~78% of the
     * viewport so the next one peeks in), the two charts stacked, and the
     * latest job cards as a card list. The strips bleed to the screen edge
     * (`-mx-4 px-4`) exactly as the design's 16px gutter does. */
    return (
      <>
        <MobilePageHeader
          icon="Sparkles"
          title={t('Dashboard')}
          subtitle={
            <>
              {t('Welcome back,')}{' '}
              <span className="font-semibold text-heading">{userName}</span>
            </>
          }
        />

        <div className="flex gap-2">
          <Button variant="outline" size="md" className="h-10 flex-1">
            <Icon name="FileText" size={16} />
            {t('New Job Card')}
          </Button>
          <Button size="md" className="h-10 flex-1">
            <Icon name="Car" size={16} />
            {t('Add Vehicle')}
          </Button>
        </div>

        {/* ── Metrics strip ────────────────────────────────────────────── */}
        <div
          role="region"
          aria-label={t('Metrics')}
          tabIndex={0}
          className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
        >
          <MobileMetric
            icon="DollarSign"
            iconTint="var(--tint-blue)"
            iconColor="var(--salis-blue)"
            label={t('Total Revenue')}
            value={revenue.value}
            orbGradient="linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))"
            orbIcon="TrendingUp"
            footer={revenue.footer}
          />
          <MobileMetric
            icon="Wrench"
            iconTint="var(--tint-bright)"
            iconColor="var(--salis-blue-bright)"
            label={t('Active Jobs')}
            value={String(activeJobs)}
            orbGradient="linear-gradient(135deg,var(--salis-blue-bright),var(--chart-3))"
            orbIcon="Gauge"
            footer={
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full border border-salis-orange/[.3] bg-tint-orange px-2 py-0.5 text-[11px] font-medium text-salis-orange">
                  {pendingCount} {t('pending')}
                </span>
                <span className="rounded-full border border-salis-bright/[.3] bg-tint-bright px-2 py-0.5 text-[11px] font-medium text-salis-bright">
                  {inProgressCount} {t('active')}
                </span>
              </div>
            }
          />
          <MobileMetric
            icon="Users"
            iconTint="var(--tint-navy)"
            iconColor="var(--salis-navy)"
            label={t('Customers')}
            value={customerCount !== undefined ? String(customerCount) : '—'}
            orbGradient="linear-gradient(135deg,var(--salis-navy),var(--navy-dark))"
            orbIcon="Target"
          />
          <MobileMetric
            icon="Package"
            iconTint="var(--tint-orange)"
            iconColor="var(--salis-orange)"
            label={t('Inventory')}
            value={stockPct !== null ? `${stockPct}%` : '—'}
            orbGradient="linear-gradient(135deg,var(--salis-orange),var(--orange-light))"
            orbIcon="ShieldCheck"
            footer={
              parts.length > 0 ? (
                <span className="text-xs text-salis-orange">
                  {inStockParts}/{parts.length} {t('in stock')}
                </span>
              ) : null
            }
          />
        </div>

        {/* ── Pipeline strip ───────────────────────────────────────────── */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-heading">{t('Pipeline')}</h3>
          <div
            role="region"
            aria-label={t('Pipeline')}
            tabIndex={0}
            className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
          >
            {statusCounts.map((stage) => (
              <Card key={stage.label} className="flex flex-[0_0_100px] flex-col gap-2 p-3">
                <span
                  className="flex w-fit rounded-lg p-2 text-white shadow-md"
                  style={{ background: stage.gradient }}
                >
                  <Icon name={stage.icon} size={16} />
                </span>
                <div>
                  <h4 className="font-display text-xl font-black text-heading">{stage.count}</h4>
                  <p className="text-[11px] font-medium text-muted">{t(stage.label)}</p>
                </div>
              </Card>
            ))}
            <Card className="flex flex-[0_0_100px] flex-col gap-2 p-3">
              <span
                className="flex w-fit rounded-lg p-2 text-white shadow-md"
                style={{ background: 'linear-gradient(135deg,var(--text-muted),var(--neutral-400))' }}
              >
                <Icon name="Activity" size={16} />
              </span>
              <div>
                <h4 className="font-display text-xl font-black text-heading">{totalJobs}</h4>
                <p className="text-[11px] font-medium text-muted">{t('Total')}</p>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Charts, stacked ──────────────────────────────────────────── */}
        <Card className="p-4">
          <CardHeader icon="TrendingUp" title={t('Revenue Trend')} className="mb-4" />
          <RevenueTrendChart label={t('Revenue Trend')} />
        </Card>

        <Card className="p-4">
          <CardHeader icon="BarChart3" title={t('Job Status')} className="mb-4" />
          <div className="flex flex-wrap items-center gap-5">
            {donutChart(140, 28, 'text-2xl')}
            {legend('gap-1.5')}
          </div>
        </Card>

        {/* ── Latest job cards ─────────────────────────────────────────── */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-heading">{t('Latest Job Cards')}</h3>
            <Link
              to="/job-cards"
              className="inline-flex h-9 items-center gap-1 rounded px-2 font-action text-[13px] font-medium text-salis-blue no-underline hover:bg-salis-blue/[.08] hover:no-underline"
            >
              {t('View All')}
              <Icon name="ArrowUpRight" size={14} />
            </Link>
          </div>
          <DataTable
            caption="Latest job cards"
            columns={jobColumns}
            rows={jobs}
            rowKey={(job) => job.id}
            mobileCard={(job) => (
              <>
                <MobileCardHeader
                  title={job.id}
                  code
                  trailing={<StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />}
                />
                <MobileCardRow>
                  {job.cust} · {job.veh}
                </MobileCardRow>
                <div className="flex flex-wrap gap-2">
                  <ServiceBadge value={job.svc} label={t(job.svc.replace(/_/g, ' '))} />
                  <PriorityBadge value={job.pr} label={t(job.pr)} />
                </div>
              </>
            )}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        icon="Sparkles"
        title={t('Dashboard')}
        subtitle={
          <>
            {t('Welcome back,')}{' '}
            <span className="font-semibold text-heading">{userName}</span>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="md">
              <Icon name="FileText" size={16} />
              {t('New Job Card')}
            </Button>
            <Button size="md">
              <Icon name="Car" size={16} />
              {t('Add Vehicle')}
            </Button>
          </>
        }
      />

      {/* ── Metrics ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon="DollarSign"
          iconTint="var(--tint-blue)"
          iconColor="var(--salis-blue)"
          label={t('Total Revenue')}
          value={revenue.value}
          orbGradient="linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))"
          orbIcon="TrendingUp"
          orbShadow="rgba(10,94,215,.2)"
          footer={revenue.footer}
        />

        <MetricCard
          icon="Wrench"
          iconTint="var(--tint-bright)"
          iconColor="var(--salis-blue-bright)"
          label={t('Active Jobs')}
          value={String(activeJobs)}
          orbGradient="linear-gradient(135deg,var(--salis-blue-bright),var(--chart-3))"
          orbIcon="Gauge"
          orbShadow="rgba(11,179,255,.2)"
          footer={
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-salis-orange/[.3] bg-tint-orange px-2.5 py-0.5 text-xs font-medium text-salis-orange">
                {pendingCount} {t('pending')}
              </span>
              <span className="rounded-full border border-salis-bright/[.3] bg-tint-bright px-2.5 py-0.5 text-xs font-medium text-salis-bright">
                {inProgressCount} {t('active')}
              </span>
            </div>
          }
        />

        <MetricCard
          icon="Users"
          iconTint="var(--tint-navy)"
          iconColor="var(--salis-navy)"
          label={t('Customers')}
          value={customerCount !== undefined ? String(customerCount) : '—'}
          orbGradient="linear-gradient(135deg,var(--salis-navy),var(--navy-dark))"
          orbIcon="Target"
          orbShadow="rgba(11,31,59,.2)"
        />

        <MetricCard
          icon="Package"
          iconTint="var(--tint-orange)"
          iconColor="var(--salis-orange)"
          label={t('Inventory')}
          value={stockPct !== null ? `${stockPct}%` : '—'}
          footer={
            parts.length > 0 ? (
              <span className="text-xs text-salis-orange">
                {inStockParts}/{parts.length} {t('in stock')}
              </span>
            ) : null
          }
          orb={
            /* Stock level reads as a ring rather than a number-in-a-circle. */
            <div className="relative h-14 w-14 flex-shrink-0">
              <svg width="56" height="56" className="-rotate-90" aria-hidden>
                <circle cx="28" cy="28" r="24" stroke="rgba(249,115,22,.2)" strokeWidth="6" fill="none" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="var(--salis-orange)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${((stockPct ?? 0) / 100) * 150} 150`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-salis-orange">
                <Icon name="ShieldCheck" size={20} />
              </span>
            </div>
          }
        />
      </div>

      {/* ── Pipeline ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {statusCounts.map((stage) => (
          <Card
            key={stage.label}
            className="flex flex-col items-center gap-3 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-salis-blue/[.3] hover:shadow-lg"
          >
            <span
              className="flex rounded-lg p-3 text-white shadow-lg"
              style={{ background: stage.gradient }}
            >
              <Icon name={stage.icon} size={20} />
            </span>
            <div className="text-center">
              <p className="font-display text-2xl font-black text-heading">{stage.count}</p>
              <p className="mt-1 text-xs font-medium text-muted">{t(stage.label)}</p>
            </div>
          </Card>
        ))}
        <Card className="flex flex-col items-center gap-3 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-salis-blue/[.3] hover:shadow-lg">
          <span
            className="flex rounded-lg p-3 text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg,var(--text-muted),var(--neutral-400))' }}
          >
            <Icon name="Activity" size={20} />
          </span>
          <div className="text-center">
            <p className="font-display text-2xl font-black text-heading">{totalJobs}</p>
            <p className="mt-1 text-xs font-medium text-muted">{t('Total')}</p>
          </div>
        </Card>
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <CardHeader icon="TrendingUp" title={t('Revenue Trend')} className="mb-6" />
          <RevenueTrendChart label={t('Revenue Trend')} />
        </Card>

        <Card className="p-6">
          <CardHeader icon="BarChart3" title={t('Job Status')} className="mb-6" />
          <div className="flex flex-wrap items-center gap-6">
            {donutChart(180, 36, 'text-[28px]')}
            {legend('gap-2')}
          </div>
        </Card>
      </div>

      {/* ── Latest job cards ────────────────────────────────────────────── */}
      <div>
        <CardHeader
          icon="ClipboardList"
          title={t('Latest Job Cards')}
          className="mb-4"
          action={
            <Link
              to="/job-cards"
              className="inline-flex h-9 items-center gap-1.5 rounded px-3 font-action text-[13px] font-medium text-salis-blue no-underline transition-colors duration-150 hover:bg-salis-blue/[.08] hover:no-underline"
            >
              {t('View All')}
              <Icon name="ArrowUpRight" size={14} />
            </Link>
          }
        />
        <DataTable
          caption="Latest job cards"
          columns={jobColumns}
          rows={jobs}
          rowKey={(job) => job.id}
          mobileCard={(job) => (
            <>
              <MobileCardHeader
                title={job.id}
                code
                trailing={<StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />}
              />
              <MobileCardRow>{job.cust}</MobileCardRow>
              <MobileCardRow>{job.veh}</MobileCardRow>
              <MobileCardRow label={t('Service')}>
                <ServiceBadge value={job.svc} label={t(job.svc.replace(/_/g, ' '))} />
              </MobileCardRow>
              <MobileCardRow label={t('Priority')}>
                <PriorityBadge value={job.pr} label={t(job.pr)} />
              </MobileCardRow>
            </>
          )}
          footer={
            <div className="flex items-center justify-between px-6 pb-5 pt-4">
              <span className="text-[13px] text-muted">
                {t('Showing')} {jobs.length} {t('of')} {totalJobs}
              </span>
              <PageButton label="Previous page" icon={rtl ? 'ChevronRight' : 'ChevronLeft'} />
            </div>
          }
        />
      </div>
    </>
  )
}

/** Branch Manager — floor operations rather than the financial view: what's
 *  running, who's assigned, what's waiting on a decision. */
function ManagerDashboard() {
  const { t } = usePreferences()
  const { userName, roleMeta } = useSession()
  const jobs = useCollection('jobs')
  const appointments = useCollection('appointments')
  const technicians = useCollection('technicians')
  const estimates = useCollection('estimates')

  if (jobs.isLoading) return <Loading label="Loading dashboard..." />
  if (jobs.isError) return <ErrorState description={jobs.error?.message} onRetry={() => void jobs.refetch()} />

  const jobRows = jobs.data ?? []
  const activeJobs = jobRows.filter((j) => j.st !== 'delivered' && j.st !== 'cancelled').length
  const appointmentCount = appointments.data?.length ?? 0
  const technicianCount = technicians.data?.length ?? 0
  const pendingEstimates = (estimates.data ?? []).filter((e) => e.status !== 'approved').length

  return (
    <>
      <PageHeader
        icon={roleMeta.icon}
        title={t('Dashboard')}
        subtitle={
          <>
            {t('Welcome back,')} <span className="font-semibold text-heading">{userName}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon="Wrench"
          iconTint="var(--tint-bright)"
          iconColor="var(--salis-blue-bright)"
          label={t('Active Jobs')}
          value={String(activeJobs)}
          orbGradient="linear-gradient(135deg,var(--salis-blue-bright),var(--chart-3))"
          orbIcon="Gauge"
          orbShadow="rgba(11,179,255,.2)"
        />
        <MetricCard
          icon="Calendar"
          iconTint="var(--tint-blue)"
          iconColor="var(--salis-blue)"
          label={t('Scheduled Appointments')}
          value={String(appointmentCount)}
          orbGradient="linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))"
          orbIcon="CalendarClock"
          orbShadow="rgba(10,94,215,.2)"
        />
        <MetricCard
          icon="HardHat"
          iconTint="var(--tint-navy)"
          iconColor="var(--salis-navy)"
          label={t('Technicians')}
          value={String(technicianCount)}
          orbGradient="linear-gradient(135deg,var(--salis-navy),var(--navy-dark))"
          orbIcon="Users"
          orbShadow="rgba(11,31,59,.2)"
        />
        <MetricCard
          icon="FileText"
          iconTint="var(--tint-orange)"
          iconColor="var(--salis-orange)"
          label={t('Estimates Awaiting Approval')}
          value={String(pendingEstimates)}
          orbGradient="linear-gradient(135deg,var(--salis-orange),var(--orange-light))"
          orbIcon="AlertTriangle"
          orbShadow="rgba(249,115,22,.2)"
        />
      </div>

      <MiniList
        title={t('Active Job Cards')}
        viewAllHref="/job-cards"
        rows={jobRows.slice(0, 6)}
        emptyLabel={t('No job cards yet')}
        renderRow={(job) => (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-heading">
                {job.cust} · {job.veh}
              </p>
              <p className="font-mono text-xs text-muted">{job.id}</p>
            </div>
            <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />
          </div>
        )}
      />
    </>
  )
}

/** Service Advisor — the customer-facing queue: today's schedule, estimates
 *  waiting on a decision, and the declined lines that need a follow-up call. */
function AdvisorDashboard() {
  const { t } = usePreferences()
  const { userName, roleMeta } = useSession()
  const jobs = useCollection('jobs')
  const estimates = useCollection('estimates')
  const appointments = useCollection('appointments')
  const declinedJobs = useCollection('declinedJobs')

  if (jobs.isLoading) return <Loading label="Loading dashboard..." />
  if (jobs.isError) return <ErrorState description={jobs.error?.message} onRetry={() => void jobs.refetch()} />

  const jobRows = jobs.data ?? []
  const estimateRows = estimates.data ?? []
  const pendingEstimates = estimateRows.filter((e) => e.status !== 'approved')
  const activeJobs = jobRows.filter((j) => j.st !== 'delivered' && j.st !== 'cancelled').length
  const appointmentCount = appointments.data?.length ?? 0
  const followUps = (declinedJobs.data ?? []).filter((d) => d.status === 'declined').length

  return (
    <>
      <PageHeader
        icon={roleMeta.icon}
        title={t('Dashboard')}
        subtitle={
          <>
            {t('Welcome back,')} <span className="font-semibold text-heading">{userName}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon="Wrench"
          iconTint="var(--tint-bright)"
          iconColor="var(--salis-blue-bright)"
          label={t('Active Job Cards')}
          value={String(activeJobs)}
          orbGradient="linear-gradient(135deg,var(--salis-blue-bright),var(--chart-3))"
          orbIcon="Gauge"
          orbShadow="rgba(11,179,255,.2)"
        />
        <MetricCard
          icon="FileText"
          iconTint="var(--tint-orange)"
          iconColor="var(--salis-orange)"
          label={t('Pending Estimates')}
          value={String(pendingEstimates.length)}
          orbGradient="linear-gradient(135deg,var(--salis-orange),var(--orange-light))"
          orbIcon="Clock"
          orbShadow="rgba(249,115,22,.2)"
        />
        <MetricCard
          icon="Calendar"
          iconTint="var(--tint-blue)"
          iconColor="var(--salis-blue)"
          label={t('Scheduled Appointments')}
          value={String(appointmentCount)}
          orbGradient="linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))"
          orbIcon="CalendarClock"
          orbShadow="rgba(10,94,215,.2)"
        />
        <MetricCard
          icon="AlertTriangle"
          iconTint="var(--tint-navy)"
          iconColor="var(--salis-navy)"
          label={t('Declined — Needs Follow-up')}
          value={String(followUps)}
          orbGradient="linear-gradient(135deg,var(--salis-navy),var(--navy-dark))"
          orbIcon="PhoneCall"
          orbShadow="rgba(11,31,59,.2)"
        />
      </div>

      <MiniList
        title={t('Pending Estimates')}
        viewAllHref="/estimates"
        rows={pendingEstimates}
        emptyLabel={t('No estimates awaiting a decision')}
        renderRow={(est) => (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-heading">
                {est.cust} · {est.veh}
              </p>
              <p className="font-mono text-xs text-muted">
                {est.id} · {est.amount}
              </p>
            </div>
            <StatusBadge value={est.status} label={t(est.status)} />
          </div>
        )}
      />
    </>
  )
}

/** Technician — the row-scoped feed of the jobs assigned to them (the server
 *  narrows `jobs` to `scope: 'own'` for this role; there is no client-side
 *  "my jobs" filter to write, per `TechnicianPortalMyJobs.tsx`). No revenue,
 *  no customer roster — this role holds neither. */
function TechnicianDashboard() {
  const { t } = usePreferences()
  const { userName, roleMeta } = useSession()
  const { data: jobs = [], isLoading, isError, error, refetch } = useCollection('jobs')

  if (isLoading) return <Loading label="Loading dashboard..." />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const inProgress = jobs.filter((j) => j.st === 'in_progress').length
  const completed = jobs.filter((j) => j.st === 'completed' || j.st === 'delivered').length

  return (
    <>
      <PageHeader
        icon={roleMeta.icon}
        title={t('Dashboard')}
        subtitle={
          <>
            {t('Welcome back,')} <span className="font-semibold text-heading">{userName}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <MetricCard
          icon="ClipboardList"
          iconTint="var(--tint-blue)"
          iconColor="var(--salis-blue)"
          label={t('My Jobs')}
          value={String(jobs.length)}
          orbGradient="linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))"
          orbIcon="Wrench"
          orbShadow="rgba(10,94,215,.2)"
        />
        <MetricCard
          icon="Wrench"
          iconTint="var(--tint-bright)"
          iconColor="var(--salis-blue-bright)"
          label={t('In Progress')}
          value={String(inProgress)}
          orbGradient="linear-gradient(135deg,var(--salis-blue-bright),var(--chart-3))"
          orbIcon="Gauge"
          orbShadow="rgba(11,179,255,.2)"
        />
        <MetricCard
          icon="CheckCircle"
          iconTint="var(--tint-navy)"
          iconColor="var(--salis-navy)"
          label={t('Completed')}
          value={String(completed)}
          orbGradient="linear-gradient(135deg,var(--salis-navy),var(--navy-dark))"
          orbIcon="CheckCircle"
          orbShadow="rgba(11,31,59,.2)"
        />
      </div>

      <MiniList
        title={t('My Jobs')}
        viewAllHref="/technician-portal"
        rows={jobs}
        emptyLabel={t('No jobs assigned')}
        renderRow={(job) => (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-heading">
                {job.cust} · {job.veh}
              </p>
              <p className="font-mono text-xs text-muted">{job.id}</p>
            </div>
            <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />
          </div>
        )}
      />
    </>
  )
}

/** QC Inspector — a read+approve view of the same job list (`jobcards: "va"`).
 *  The design's `stage: 'qc'` workflow value lives on the job-detail API, not
 *  on the `jobs` list row (`workshop/stages.ts`), so "awaiting QC" cannot be
 *  counted from this collection without inventing a mapping. In Progress is
 *  the honest proxy for "not yet signed off." */
function QCDashboard() {
  const { t } = usePreferences()
  const { userName, roleMeta } = useSession()
  const { data: jobs = [], isLoading, isError, error, refetch } = useCollection('jobs')

  if (isLoading) return <Loading label="Loading dashboard..." />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const inProgress = jobs.filter((j) => j.st === 'in_progress')
  const completed = jobs.filter((j) => j.st === 'completed').length
  const active = jobs.filter((j) => j.st !== 'delivered' && j.st !== 'cancelled').length

  return (
    <>
      <PageHeader
        icon={roleMeta.icon}
        title={t('Dashboard')}
        subtitle={
          <>
            {t('Welcome back,')} <span className="font-semibold text-heading">{userName}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <MetricCard
          icon="Wrench"
          iconTint="var(--tint-orange)"
          iconColor="var(--salis-orange)"
          label={t('In Progress')}
          value={String(inProgress.length)}
          orbGradient="linear-gradient(135deg,var(--salis-orange),var(--orange-light))"
          orbIcon="ClipboardCheck"
          orbShadow="rgba(249,115,22,.2)"
        />
        <MetricCard
          icon="CheckCircle"
          iconTint="var(--tint-blue)"
          iconColor="var(--salis-blue)"
          label={t('Completed')}
          value={String(completed)}
          orbGradient="linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))"
          orbIcon="CheckCircle"
          orbShadow="rgba(10,94,215,.2)"
        />
        <MetricCard
          icon="ClipboardList"
          iconTint="var(--tint-navy)"
          iconColor="var(--salis-navy)"
          label={t('Total Active')}
          value={String(active)}
          orbGradient="linear-gradient(135deg,var(--salis-navy),var(--navy-dark))"
          orbIcon="Activity"
          orbShadow="rgba(11,31,59,.2)"
        />
      </div>

      <MiniList
        title={t('Jobs In Progress')}
        viewAllHref="/job-cards"
        rows={inProgress}
        emptyLabel={t('Nothing in progress')}
        renderRow={(job) => (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-heading">
                {job.cust} · {job.veh}
              </p>
              <p className="font-mono text-xs text-muted">{job.id}</p>
            </div>
            <PriorityBadge value={job.pr} label={t(job.pr)} />
          </div>
        )}
      />
    </>
  )
}

/** Storekeeper — stock health and the procurement documents already raised
 *  against it. */
function PartsDashboard() {
  const { t } = usePreferences()
  const { userName, roleMeta } = useSession()
  const { data: parts = [], isLoading, isError, error, refetch } = useCollection('parts')
  const purchaseOrders = useCollection('purchaseOrders')

  if (isLoading) return <Loading label="Loading dashboard..." />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const lowStock = parts.filter((p) => p.stock <= p.reorder)
  const openOrders = (purchaseOrders.data ?? []).filter(
    (po) => po.status === 'sent' || po.status === 'receiving'
  ).length

  return (
    <>
      <PageHeader
        icon={roleMeta.icon}
        title={t('Dashboard')}
        subtitle={
          <>
            {t('Welcome back,')} <span className="font-semibold text-heading">{userName}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <MetricCard
          icon="AlertTriangle"
          iconTint="var(--tint-orange)"
          iconColor="var(--salis-orange)"
          label={t('Low Stock Items')}
          value={String(lowStock.length)}
          orbGradient="linear-gradient(135deg,var(--salis-orange),var(--orange-light))"
          orbIcon="Package"
          orbShadow="rgba(249,115,22,.2)"
        />
        <MetricCard
          icon="Package"
          iconTint="var(--tint-blue)"
          iconColor="var(--salis-blue)"
          label={t('Total Parts')}
          value={String(parts.length)}
          orbGradient="linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))"
          orbIcon="ShieldCheck"
          orbShadow="rgba(10,94,215,.2)"
        />
        <MetricCard
          icon="Truck"
          iconTint="var(--tint-navy)"
          iconColor="var(--salis-navy)"
          label={t('Purchase Orders In Transit')}
          value={String(openOrders)}
          orbGradient="linear-gradient(135deg,var(--salis-navy),var(--navy-dark))"
          orbIcon="Truck"
          orbShadow="rgba(11,31,59,.2)"
        />
      </div>

      <MiniList
        title={t('Low Stock')}
        viewAllHref="/inventory"
        rows={lowStock}
        emptyLabel={t('Nothing below its reorder level')}
        renderRow={(part) => (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-heading">{part.name}</p>
              <p className="font-mono text-xs text-muted">{part.sku}</p>
            </div>
            <span className="text-sm text-salis-orange">
              {part.stock} / {part.reorder}
            </span>
          </div>
        )}
      />
    </>
  )
}

/** Accountant — receivables and revenue, the two things this role actually
 *  carries (`accounting: "vcedax"`, `invoices: "vcedax"`). */
function AccountantDashboard() {
  const { t } = usePreferences()
  const { userName, roleMeta } = useSession()
  const invoices = useCollection('invoices')
  const revenue = useRevenueMetric()

  if (invoices.isLoading) return <Loading label="Loading dashboard..." />
  if (invoices.isError) {
    return <ErrorState description={invoices.error?.message} onRetry={() => void invoices.refetch()} />
  }

  const invoiceRows = invoices.data ?? []
  const outstanding = invoiceRows.filter((inv) => inv.status === 'unpaid' || inv.status === 'overdue')
  const overdue = invoiceRows.filter((inv) => inv.status === 'overdue').length

  return (
    <>
      <PageHeader
        icon={roleMeta.icon}
        title={t('Dashboard')}
        subtitle={
          <>
            {t('Welcome back,')} <span className="font-semibold text-heading">{userName}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <MetricCard
          icon="DollarSign"
          iconTint="var(--tint-blue)"
          iconColor="var(--salis-blue)"
          label={t('Total Revenue')}
          value={revenue.value}
          orbGradient="linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))"
          orbIcon="TrendingUp"
          orbShadow="rgba(10,94,215,.2)"
          footer={revenue.footer}
        />
        <MetricCard
          icon="FileText"
          iconTint="var(--tint-orange)"
          iconColor="var(--salis-orange)"
          label={t('Outstanding Invoices')}
          value={String(outstanding.length)}
          orbGradient="linear-gradient(135deg,var(--salis-orange),var(--orange-light))"
          orbIcon="Clock"
          orbShadow="rgba(249,115,22,.2)"
        />
        <MetricCard
          icon="AlertTriangle"
          iconTint="var(--tint-navy)"
          iconColor="var(--salis-navy)"
          label={t('Overdue')}
          value={String(overdue)}
          orbGradient="linear-gradient(135deg,var(--salis-navy),var(--navy-dark))"
          orbIcon="AlertTriangle"
          orbShadow="rgba(11,31,59,.2)"
        />
      </div>

      <MiniList
        title={t('Outstanding Invoices')}
        viewAllHref="/invoices"
        rows={outstanding}
        emptyLabel={t('Nothing outstanding')}
        renderRow={(inv) => (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-heading">{inv.cust}</p>
              <p className="font-mono text-xs text-muted">
                {inv.id} · {inv.amount}
              </p>
            </div>
            <StatusBadge value={inv.status} label={t(inv.status)} />
          </div>
        )}
      />
    </>
  )
}

/** HR Manager — headcount and the requests waiting on a decision. Pay figures
 *  are deliberately absent: this role's grant is on `hr`, not payroll money. */
function HRDashboard() {
  const { t } = usePreferences()
  const { userName, roleMeta } = useSession()
  const employees = usePagedCollection('employees', { pageSize: 1 })
  const pendingLeave = usePagedCollection('leaveRequests', { pageSize: 1, filter: { status: 'submitted' } })
  const leaveRows = useCollection('leaveRequests')
  const departments = useCollection('departments')

  if (employees.isLoading) return <Loading label="Loading dashboard..." />
  if (employees.isError) {
    return <ErrorState description={employees.error?.message} onRetry={() => void employees.refetch()} />
  }

  const headcount = employees.data?.page.total
  const pendingCount = pendingLeave.data?.page.total
  const departmentCount = departments.data?.length ?? 0
  const pendingRequests = (leaveRows.data ?? []).filter((r) => r.status === 'submitted')

  return (
    <>
      <PageHeader
        icon={roleMeta.icon}
        title={t('Dashboard')}
        subtitle={
          <>
            {t('Welcome back,')} <span className="font-semibold text-heading">{userName}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <MetricCard
          icon="Users"
          iconTint="var(--tint-blue)"
          iconColor="var(--salis-blue)"
          label={t('Headcount')}
          value={headcount !== undefined ? String(headcount) : '—'}
          orbGradient="linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))"
          orbIcon="Users"
          orbShadow="rgba(10,94,215,.2)"
        />
        <MetricCard
          icon="Clock"
          iconTint="var(--tint-orange)"
          iconColor="var(--salis-orange)"
          label={t('Pending Leave Requests')}
          value={pendingCount !== undefined ? String(pendingCount) : '—'}
          orbGradient="linear-gradient(135deg,var(--salis-orange),var(--orange-light))"
          orbIcon="AlertTriangle"
          orbShadow="rgba(249,115,22,.2)"
        />
        <MetricCard
          icon="Building2"
          iconTint="var(--tint-navy)"
          iconColor="var(--salis-navy)"
          label={t('Departments')}
          value={String(departmentCount)}
          orbGradient="linear-gradient(135deg,var(--salis-navy),var(--navy-dark))"
          orbIcon="Building2"
          orbShadow="rgba(11,31,59,.2)"
        />
      </div>

      <MiniList
        title={t('Pending Leave Requests')}
        viewAllHref="/hr-payroll"
        rows={pendingRequests}
        emptyLabel={t('No leave requests awaiting a decision')}
        renderRow={(req) => (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-heading">{req.employeeName}</p>
              <p className="text-xs text-muted">
                {t(req.type)} · {req.days} {t('days')}
              </p>
            </div>
            <StatusBadge value={req.status} label={t(req.status)} />
          </div>
        )}
      />
    </>
  )
}

/** Receptionist — the front-of-house queue: who's booked, who's arriving. */
function FrontdeskDashboard() {
  const { t } = usePreferences()
  const { userName, roleMeta } = useSession()
  const appointments = useCollection('appointments')
  const jobs = useCollection('jobs')
  const customers = usePagedCollection('customers', { pageSize: 1 })

  if (appointments.isLoading) return <Loading label="Loading dashboard..." />
  if (appointments.isError) {
    return <ErrorState description={appointments.error?.message} onRetry={() => void appointments.refetch()} />
  }

  const appointmentRows = appointments.data ?? []
  const pendingCheckIns = (jobs.data ?? []).filter((j) => j.st === 'pending').length
  const customerCount = customers.data?.page.total

  return (
    <>
      <PageHeader
        icon={roleMeta.icon}
        title={t('Dashboard')}
        subtitle={
          <>
            {t('Welcome back,')} <span className="font-semibold text-heading">{userName}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <MetricCard
          icon="Calendar"
          iconTint="var(--tint-blue)"
          iconColor="var(--salis-blue)"
          label={t('Scheduled Appointments')}
          value={String(appointmentRows.length)}
          orbGradient="linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))"
          orbIcon="CalendarClock"
          orbShadow="rgba(10,94,215,.2)"
        />
        <MetricCard
          icon="Clock"
          iconTint="var(--tint-orange)"
          iconColor="var(--salis-orange)"
          label={t('Awaiting Check-In')}
          value={String(pendingCheckIns)}
          orbGradient="linear-gradient(135deg,var(--salis-orange),var(--orange-light))"
          orbIcon="Clock"
          orbShadow="rgba(249,115,22,.2)"
        />
        <MetricCard
          icon="Users"
          iconTint="var(--tint-navy)"
          iconColor="var(--salis-navy)"
          label={t('Customers')}
          value={customerCount !== undefined ? String(customerCount) : '—'}
          orbGradient="linear-gradient(135deg,var(--salis-navy),var(--navy-dark))"
          orbIcon="Target"
          orbShadow="rgba(11,31,59,.2)"
        />
      </div>

      <MiniList
        title={t('Appointments')}
        viewAllHref="/appointments"
        rows={appointmentRows}
        emptyLabel={t('No appointments scheduled')}
        renderRow={(appt) => (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-heading">
                {appt.cust} · {appt.veh}
              </p>
              <p className="text-xs text-muted">
                {appt.time} · {t(appt.svc)}
              </p>
            </div>
            <StatusBadge value={appt.status} label={t(appt.status)} />
          </div>
        )}
      />
    </>
  )
}

/** Call Center Agent — this role's real grant is on CRM (`crm: "vced"`), not
 *  a call-log aggregate no collection backs yet: leads and opportunities are
 *  what it can honestly report. */
function CallCenterDashboard() {
  const { t } = usePreferences()
  const { userName, roleMeta } = useSession()
  const leads = useCollection('leads')
  const opportunities = useCollection('opportunities')

  if (leads.isLoading) return <Loading label="Loading dashboard..." />
  if (leads.isError) return <ErrorState description={leads.error?.message} onRetry={() => void leads.refetch()} />

  const leadRows = leads.data ?? []
  const newLeads = leadRows.filter((l) => l.stage === 'new')
  const opportunityCount = opportunities.data?.length ?? 0

  return (
    <>
      <PageHeader
        icon={roleMeta.icon}
        title={t('Dashboard')}
        subtitle={
          <>
            {t('Welcome back,')} <span className="font-semibold text-heading">{userName}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <MetricCard
          icon="Target"
          iconTint="var(--tint-blue)"
          iconColor="var(--salis-blue)"
          label={t('New Leads')}
          value={String(newLeads.length)}
          orbGradient="linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))"
          orbIcon="PhoneCall"
          orbShadow="rgba(10,94,215,.2)"
        />
        <MetricCard
          icon="Users"
          iconTint="var(--tint-orange)"
          iconColor="var(--salis-orange)"
          label={t('Total Leads')}
          value={String(leadRows.length)}
          orbGradient="linear-gradient(135deg,var(--salis-orange),var(--orange-light))"
          orbIcon="Target"
          orbShadow="rgba(249,115,22,.2)"
        />
        <MetricCard
          icon="TrendingUp"
          iconTint="var(--tint-navy)"
          iconColor="var(--salis-navy)"
          label={t('Open Opportunities')}
          value={String(opportunityCount)}
          orbGradient="linear-gradient(135deg,var(--salis-navy),var(--navy-dark))"
          orbIcon="TrendingUp"
          orbShadow="rgba(11,31,59,.2)"
        />
      </div>

      <MiniList
        title={t('New Leads')}
        viewAllHref="/lead-pipeline"
        rows={newLeads}
        emptyLabel={t('No new leads')}
        renderRow={(lead) => (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-heading">{lead.name}</p>
              <p className="text-xs text-muted">
                {lead.company} · {lead.source}
              </p>
            </div>
            <span className="font-mono text-xs text-muted">{lead.value}</span>
          </div>
        )}
      />
    </>
  )
}

/** Procurement Agent — the documents this role raises and tracks
 *  (`procurement: "vcedax"`). */
function ProcurementDashboard() {
  const { t } = usePreferences()
  const { userName, roleMeta } = useSession()
  const requisitions = useCollection('requisitions')
  const purchaseOrders = useCollection('purchaseOrders')
  const suppliers = useCollection('suppliers')

  if (requisitions.isLoading) return <Loading label="Loading dashboard..." />
  if (requisitions.isError) {
    return <ErrorState description={requisitions.error?.message} onRetry={() => void requisitions.refetch()} />
  }

  const openRequisitions = (requisitions.data ?? []).filter((r) => r.status === 'submitted')
  const pendingOrders = (purchaseOrders.data ?? []).filter(
    (po) => po.status === 'sent' || po.status === 'receiving'
  ).length
  const supplierCount = suppliers.data?.length ?? 0

  return (
    <>
      <PageHeader
        icon={roleMeta.icon}
        title={t('Dashboard')}
        subtitle={
          <>
            {t('Welcome back,')} <span className="font-semibold text-heading">{userName}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <MetricCard
          icon="FileText"
          iconTint="var(--tint-blue)"
          iconColor="var(--salis-blue)"
          label={t('Open Requisitions')}
          value={String(openRequisitions.length)}
          orbGradient="linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))"
          orbIcon="Clock"
          orbShadow="rgba(10,94,215,.2)"
        />
        <MetricCard
          icon="Truck"
          iconTint="var(--tint-orange)"
          iconColor="var(--salis-orange)"
          label={t('Purchase Orders In Transit')}
          value={String(pendingOrders)}
          orbGradient="linear-gradient(135deg,var(--salis-orange),var(--orange-light))"
          orbIcon="Truck"
          orbShadow="rgba(249,115,22,.2)"
        />
        <MetricCard
          icon="ShoppingCart"
          iconTint="var(--tint-navy)"
          iconColor="var(--salis-navy)"
          label={t('Suppliers')}
          value={String(supplierCount)}
          orbGradient="linear-gradient(135deg,var(--salis-navy),var(--navy-dark))"
          orbIcon="ShoppingCart"
          orbShadow="rgba(11,31,59,.2)"
        />
      </div>

      <MiniList
        title={t('Open Requisitions')}
        viewAllHref="/parts-network"
        rows={openRequisitions}
        emptyLabel={t('No requisitions awaiting action')}
        renderRow={(req) => (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-heading">{req.requester}</p>
              <p className="font-mono text-xs text-muted">
                {req.code} · {req.amount}
              </p>
            </div>
            <PriorityBadge value={req.priority} label={t(req.priority)} />
          </div>
        )}
      />
    </>
  )
}

/** A titled card of up to a handful of rows, with a "View All" link to the
 *  full screen. Every role dashboard below the KPI row uses this instead of
 *  the heavier `DataTable` — these are a glance at what needs attention, not
 *  a worklist with its own pagination. */
function MiniList<T>({
  title,
  viewAllHref,
  rows,
  renderRow,
  emptyLabel,
}: {
  title: string
  viewAllHref: string
  rows: readonly T[]
  renderRow: (row: T) => React.ReactNode
  emptyLabel: string
}) {
  const { t } = usePreferences()
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-bold text-heading">{title}</h3>
        <Link
          to={viewAllHref}
          className="inline-flex items-center gap-1 font-action text-[13px] font-medium text-salis-blue no-underline hover:no-underline"
        >
          {t('View All')}
          <Icon name="ArrowUpRight" size={14} />
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((row, index) => (
            <li key={index} className="px-5 py-3">
              {renderRow(row)}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function MetricCard({
  icon,
  iconTint,
  iconColor,
  label,
  value,
  footer,
  orbGradient,
  orbIcon,
  orbShadow,
  orb,
  progress,
}: {
  icon: string
  iconTint: string
  iconColor: string
  label: string
  value: string
  footer?: React.ReactNode
  orbGradient?: string
  orbIcon?: string
  orbShadow?: string
  /** Custom right-hand visual, when the standard gradient orb doesn't fit. */
  orb?: React.ReactNode
  /** 0–1; renders the thin progress rail under the card. */
  progress?: number
}) {
  return (
    <Card className="p-6 transition-all duration-200 hover:border-salis-blue/[.3] hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-2">
            <span
              className="flex rounded-lg p-2"
              style={{ background: iconTint, color: iconColor }}
            >
              <Icon name={icon} size={20} />
            </span>
            <span className="text-sm font-medium text-muted">{label}</span>
          </div>
          <div>
            <h2 className="font-display text-3xl font-black text-heading">{value}</h2>
            {footer}
          </div>
        </div>
        {orb ??
          (orbGradient ? (
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: orbGradient, boxShadow: `0 10px 15px -3px ${orbShadow}` }}
            >
              <Icon name={orbIcon ?? 'Activity'} size={28} />
            </div>
          ) : null)}
      </div>
      {progress !== undefined ? (
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-tint-blue">
          <div
            className="h-full rounded-full bg-salis-gradient-r"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      ) : null}
    </Card>
  )
}

function RevenueTrendChart({ label }: { label: string }) {
  return (
      <svg viewBox="0 0 600 260" className="block h-auto w-full" role="img" aria-label={label}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--salis-blue)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--salis-blue)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${REVENUE_PATH} L580,220 L20,220 Z`} fill="url(#revGrad)" />
        <path d={REVENUE_PATH} fill="none" stroke="var(--salis-blue)" strokeWidth="2.5" />
        {MONTHS.map((month, i) => (
          <text
            key={month}
            x={20 + i * 112}
            y="244"
            fontSize="11"
            fill="var(--text-muted)"
            textAnchor="middle"
            fontFamily="Inter,sans-serif"
          >
            {month}
          </text>
        ))}
      </svg>
  )
}

/** One card of the mobile metrics strip: ~78% of the viewport so the next
 *  card peeks in and says the row scrolls. */
function MobileMetric({
  icon,
  iconTint,
  iconColor,
  label,
  value,
  footer,
  orbGradient,
  orbIcon,
}: {
  icon: string
  iconTint: string
  iconColor: string
  label: string
  value: string
  footer?: React.ReactNode
  orbGradient: string
  orbIcon: string
}) {
  return (
    <Card className="flex-[0_0_78%] snap-start rounded-[14px] p-4">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="flex rounded-lg p-1.5" style={{ background: iconTint, color: iconColor }}>
              <Icon name={icon} size={16} />
            </span>
            <span className="text-xs font-medium text-muted">{label}</span>
          </div>
          <h3 className="font-display text-2xl font-black text-heading">{value}</h3>
          {footer}
        </div>
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: orbGradient }}
        >
          <Icon name={orbIcon} size={22} />
        </div>
      </div>
    </Card>
  )
}

function PageButton({ label, icon }: { label: string; icon: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded border border-border bg-card text-body hover:border-salis-blue hover:text-salis-blue focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
    >
      <Icon name={icon} size={14} />
    </button>
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] as const

const REVENUE_PATH =
  'M20,121 C57,112 95,94 132,94 C169,94 207,106 244,106 C281,106 319,81 356,69 C393,57 431,55 468,49 C505,43 543,29 580,22'
