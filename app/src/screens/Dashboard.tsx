import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardHeader } from '@/components/ui/Card'
import { AreaChart, CHART_COLORS, CountBars } from '@/components/ui/Charts'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { PriorityBadge, ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { PipelineStrip, type PipelineStage } from '@/components/ui/PipelineStrip'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { EmptyState } from '@/components/ui/States'
import { WORKSHOP_STAGES } from '@/components/ui/WorkflowStepper'
import { useCommand, type Command } from '@/components/shell/commands'
import { useDateFormat } from '@/lib/formatDate'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { railIndexFor, type JobRow } from './workshop/stages'
import { JobCardForm } from './workshop/JobCardForm'
import { VehicleFormModal } from './registry/VehicleForm'

/** Role-adaptive KPI home. The reference implementation every other
 *  operational screen follows: hero header → metric row → pipeline strip →
 *  charts → table.
 *
 *  Everything on it is now derived from the collections it reads. The
 *  previous version printed `$128,450`, `+12%`, `248` customers, a six-month
 *  revenue curve and "Showing 1–5 of 27" from constants, beside a table of
 *  five real rows — a dashboard that could not be wrong because it never
 *  looked. Where the data cannot support a figure (a revenue trend needs
 *  dated invoices, which the fixtures do not carry), the panel says so rather
 *  than drawing one. */
type Job = RowOf<'jobs'>
type Period = 'today' | '7d' | '30d'

const PERIOD_DAYS: Record<Period, number> = { today: 1, '7d': 7, '30d': 30 }

/** The six rail steps, with the fixture's `st` vocabulary folded onto them
 *  for rows the API has not stamped with a `stage`. */
function railFor(job: JobRow): number {
  if (job.stage) return railIndexFor(job.stage)
  switch (job.st) {
    case 'pending':
      return 0
    case 'in_progress':
      return 3
    case 'completed':
      return 4
    case 'delivered':
      return 5
    default:
      return 0
  }
}

const STAGE_META: readonly { id: string; icon: string; tone: PipelineStage['tone'] }[] = [
  { id: 'checkin', icon: 'Clock', tone: 'orange' },
  { id: 'inspection', icon: 'Search', tone: 'bright' },
  { id: 'estimate', icon: 'FileText', tone: 'blue' },
  { id: 'repair', icon: 'Wrench', tone: 'gradient' },
  { id: 'qc', icon: 'ShieldCheck', tone: 'bright' },
  { id: 'delivery', icon: 'Car', tone: 'navy' },
]

function isOpen(job: Job): boolean {
  return job.st === 'pending' || job.st === 'in_progress'
}

function inPeriod(row: { _createdAt?: string }, period: Period, now: number): boolean {
  if (!row._createdAt) return true
  const created = Date.parse(row._createdAt)
  if (Number.isNaN(created)) return true
  return now - created <= PERIOD_DAYS[period] * 24 * 3600 * 1000
}

export function Dashboard() {
  const { t } = usePreferences()
  const { userName, can } = useSession()
  const { date, locale } = useDateFormat()
  const navigate = useNavigate()

  const jobsQuery = useCollection('jobs')
  const { data: customers = [] } = useCollection('customers')
  const { data: parts = [] } = useCollection('parts')
  const { data: invoices = [] } = useCollection('invoices')
  const { data: technicians = [] } = useCollection('technicians')

  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data])
  const [period, setPeriod] = useState<Period>('30d')
  const [creatingJob, setCreatingJob] = useState(false)
  const [creatingVehicle, setCreatingVehicle] = useState(false)

  const canCreateJob = can('jobcards', 'c')
  const canCreateVehicle = can('vehicles', 'c')

  // ── Derived figures ──────────────────────────────────────────────────
  const now = Date.now()
  const hasDates = useMemo(
    () => jobs.some((job) => (job as JobRow)._createdAt) || invoices.some((row) => (row as { _createdAt?: string })._createdAt),
    [jobs, invoices]
  )
  const periodJobs = useMemo(
    () => (hasDates ? jobs.filter((job) => inPeriod(job as JobRow, period, now)) : jobs),
    [jobs, hasDates, period, now]
  )
  const periodInvoices = useMemo(
    () => (hasDates ? invoices.filter((row) => inPeriod(row as { _createdAt?: string }, period, now)) : invoices),
    [invoices, hasDates, period, now]
  )

  const revenue = useMemo(() => periodInvoices.reduce((sum, inv) => sum + parseSar(inv.amount), 0), [periodInvoices])
  const paid = useMemo(() => periodInvoices.filter((inv) => inv.status === 'paid').length, [periodInvoices])
  const activeJobs = periodJobs.filter(isOpen)
  const pendingJobs = periodJobs.filter((job) => job.st === 'pending').length
  const inProgressJobs = periodJobs.filter((job) => job.st === 'in_progress').length
  const healthyParts = parts.filter((part) => part.stock >= part.reorder).length
  const stockHealth = parts.length ? healthyParts / parts.length : 0

  const stages = useMemo<PipelineStage[]>(() => {
    const counts = new Array<number>(WORKSHOP_STAGES.length).fill(0)
    for (const job of jobs) counts[railFor(job as JobRow)] += 1
    return STAGE_META.map((meta, index) => ({
      id: meta.id,
      label: WORKSHOP_STAGES[index],
      count: counts[index],
      icon: meta.icon,
      tone: meta.tone,
      to: `/job-cards?stage=${meta.id}`,
    }))
  }, [jobs])

  const statusSegments = useMemo(() => {
    const tally = new Map<string, number>()
    for (const job of jobs) tally.set(job.st, (tally.get(job.st) ?? 0) + 1)
    return [...tally.entries()].map(([label, value]) => ({ label: label.replace(/_/g, ' '), value }))
  }, [jobs])

  const serviceRows = useMemo(() => {
    const tally = new Map<string, number>()
    for (const job of jobs) tally.set(job.svc, (tally.get(job.svc) ?? 0) + 1)
    return [...tally.entries()]
      .map(([label, value]) => ({ label: label.replace(/_/g, ' '), value }))
      .sort((a, b) => b.value - a.value)
  }, [jobs])

  const revenueSeries = useMemo(() => {
    if (!hasDates) return null
    const buckets = new Map<string, number>()
    for (const inv of invoices) {
      const created = (inv as { _createdAt?: string })._createdAt
      if (!created) continue
      const month = created.slice(0, 7)
      buckets.set(month, (buckets.get(month) ?? 0) + parseSar(inv.amount))
    }
    const months = [...buckets.keys()].sort().slice(-6)
    if (months.length < 2) return null
    return {
      labels: months.map((m) => new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(`${m}-01`))),
      values: months.map((m) => buckets.get(m) ?? 0),
    }
  }, [invoices, hasDates, locale])

  const topTechnicians = useMemo(
    () => [...technicians].sort((a, b) => b.jobs - a.jobs).slice(0, 4),
    [technicians]
  )

  // ── Palette actions for this screen ──────────────────────────────────
  const commands = useMemo<Command[]>(() => {
    const list: Command[] = []
    if (canCreateJob)
      list.push({
        id: 'dashboard:new-job',
        label: 'New Job Card',
        icon: 'ClipboardPlus',
        group: 'create',
        keywords: ['job', 'card', 'create', 'new'],
        shortcut: 'N',
        run: () => setCreatingJob(true),
      })
    if (canCreateVehicle)
      list.push({
        id: 'dashboard:add-vehicle',
        label: 'Add Vehicle',
        icon: 'Car',
        group: 'create',
        keywords: ['vehicle', 'car', 'create', 'new'],
        run: () => setCreatingVehicle(true),
      })
    return list
  }, [canCreateJob, canCreateVehicle])
  useCommand(commands)

  const jobColumns: Column<Job>[] = [
    { header: 'Job Card', cell: (job) => job.id, code: true, sortValue: (job) => job.id },
    { header: 'Customer', cell: (job) => job.cust, sortValue: (job) => job.cust },
    { header: 'Vehicle', cell: (job) => job.veh, sortValue: (job) => job.veh },
    {
      header: 'Service',
      cell: (job) => <ServiceBadge value={job.svc} label={t(job.svc.replace(/_/g, ' '))} />,
      sortValue: (job) => job.svc,
    },
    {
      header: 'Priority',
      cell: (job) => <PriorityBadge value={job.pr} label={t(job.pr)} />,
      sortValue: (job) => ({ high: 0, medium: 1, low: 2 }[job.pr] ?? 3),
    },
    {
      header: 'Status',
      cell: (job) => <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />,
      sortValue: (job) => railFor(job as JobRow),
    },
  ]

  return (
    <ScreenFrame
      variant="hero"
      icon="Sparkles"
      title="Dashboard"
      breadcrumbs={false}
      subtitle={
        <>
          {t('Welcome back,')}{' '}
          <span className="font-semibold text-heading">{userName}</span>
          <span aria-hidden> · </span>
          <span dir="ltr">{date(new Date(), 'long')}</span>
        </>
      }
      query={jobsQuery}
      skeleton="dashboard"
      empty={
        !jobsQuery.isLoading && jobs.length === 0
          ? {
              icon: 'ClipboardList',
              title: 'No job cards yet',
              description: 'Check a vehicle in to open the first job card and the dashboard fills itself.',
              action: (
                <Button icon="LogIn" onClick={() => navigate('/workshop-check-in')}>
                  {t('Check in a vehicle')}
                </Button>
              ),
            }
          : false
      }
      actions={
        <>
          <PeriodControl value={period} onChange={setPeriod} disabled={!hasDates} />
          {canCreateVehicle ? (
            <Button variant="outline" size="md" icon="Car" onClick={() => setCreatingVehicle(true)}>
              {t('Add Vehicle')}
            </Button>
          ) : null}
          {canCreateJob ? (
            <Button size="md" icon="ClipboardPlus" onClick={() => setCreatingJob(true)}>
              {t('New Job Card')}
            </Button>
          ) : null}
        </>
      }
    >
      {/* ── Metrics ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon="DollarSign"
          tone="blue"
          label={t('Invoiced Revenue')}
          value={<Money sar={revenue} />}
          orbIcon="TrendingUp"
          footer={
            <span className="text-xs text-muted">
              <span dir="ltr" className="font-mono tabular-nums text-heading">{paid}</span>{' '}
              {t('of')}{' '}
              <span dir="ltr" className="font-mono tabular-nums text-heading">{periodInvoices.length}</span>{' '}
              {t('invoices paid')}
            </span>
          }
          progress={periodInvoices.length ? paid / periodInvoices.length : 0}
          to="/invoices"
        />
        <MetricCard
          icon="Wrench"
          tone="bright"
          label={t('Active Jobs')}
          value={<span dir="ltr" className="tabular-nums">{activeJobs.length}</span>}
          orbIcon="Gauge"
          footer={
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-salis-orange/[.3] bg-tint-orange px-2.5 py-0.5 text-xs font-medium text-salis-orange">
                <span dir="ltr" className="font-mono tabular-nums">{pendingJobs}</span> {t('pending')}
              </span>
              <span className="rounded-full border border-salis-bright/[.3] bg-tint-bright px-2.5 py-0.5 text-xs font-medium text-salis-bright">
                <span dir="ltr" className="font-mono tabular-nums">{inProgressJobs}</span> {t('in progress')}
              </span>
            </div>
          }
          to="/job-cards"
        />
        <MetricCard
          icon="Users"
          tone="navy"
          label={t('Customers')}
          value={<span dir="ltr" className="tabular-nums">{customers.length}</span>}
          orbIcon="Target"
          footer={
            <span className="text-xs text-muted">
              <span dir="ltr" className="font-mono tabular-nums text-heading">
                {customers.reduce((sum, c) => sum + (c.vehicles ?? 0), 0)}
              </span>{' '}
              {t('vehicles on file')}
            </span>
          }
          to="/customers"
        />
        <MetricCard
          icon="Package"
          tone="orange"
          label={t('Stock Health')}
          value={<span dir="ltr" className="tabular-nums">{Math.round(stockHealth * 100)}%</span>}
          footer={
            <span className={cn('text-xs', healthyParts < parts.length ? 'text-salis-orange' : 'text-muted')}>
              <span dir="ltr" className="font-mono tabular-nums">{healthyParts}/{parts.length}</span>{' '}
              {t('parts above reorder point')}
            </span>
          }
          orb={<StockRing ratio={stockHealth} />}
          to="/inventory"
        />
      </div>

      {/* ── Pipeline ────────────────────────────────────────────────────── */}
      <section aria-labelledby="pipeline-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="pipeline-heading" className="font-display text-base font-bold text-heading">
            {t('Job pipeline')}
          </h2>
          <Link
            to="/job-cards"
            className="inline-flex h-9 items-center gap-1.5 rounded px-3 font-action text-[13px] font-medium text-salis-blue no-underline transition-colors duration-150 hover:bg-salis-blue/[.08] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
          >
            {t('View All')}
            <Icon name="ArrowUpRight" size={14} />
          </Link>
        </div>
        <PipelineStrip stages={stages} label="Job pipeline" />
      </section>

      {/* ── Charts ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <CardHeader icon="TrendingUp" title={t('Revenue Trend')} className="mb-6" />
          {revenueSeries ? (
            <AreaChart
              series={revenueSeries.values}
              labels={revenueSeries.labels}
              label="Revenue Trend"
              format={(value) => formatSar(value)}
            />
          ) : (
            <EmptyState
              icon="LineChart"
              title={t('Revenue trend needs dated invoices')}
              description={t('The trend draws itself from invoice dates once the live API is connected; the demo fixtures carry none.')}
              action={
                <Button variant="outline" size="sm" icon="Receipt" onClick={() => navigate('/invoices')}>
                  {t('Open Invoices')}
                </Button>
              }
            />
          )}
        </Card>

        <Card className="p-6">
          <CardHeader icon="BarChart3" title={t('Job Status')} className="mb-6" />
          <div className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
            <StatusDonut segments={statusSegments} total={jobs.length} />
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                {statusSegments.map((segment, index) => (
                  <div key={segment.label} className="flex items-center gap-2 text-[13px]">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-[3px]"
                      style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                      aria-hidden
                    />
                    <span className="min-w-[90px] capitalize text-body">{t(segment.label)}</span>
                    <span dir="ltr" className="font-mono text-xs tabular-nums text-muted">{segment.value}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="mb-2 font-action text-[11px] font-semibold uppercase tracking-[.05em] text-muted">
                  {t('By service type')}
                </p>
                <CountBars rows={serviceRows} total={jobs.length} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Latest job cards + team ─────────────────────────────────────── */}
      <div className={cn('grid grid-cols-1 gap-6', topTechnicians.length ? 'xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' : '')}>
        <div className="min-w-0">
          <CardHeader
            icon="ClipboardList"
            title={t('Latest Job Cards')}
            className="mb-4"
            action={
              <Link
                to="/job-cards"
                className="inline-flex h-9 items-center gap-1.5 rounded px-3 font-action text-[13px] font-medium text-salis-blue no-underline transition-colors duration-150 hover:bg-salis-blue/[.08] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
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
            pageSize={5}
            onRowClick={(job) => navigate(`/job-detail?id=${job.id}`)}
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
          />
        </div>

        {topTechnicians.length ? (
          <Card className="flex min-w-0 flex-col gap-4 p-5">
            <CardHeader icon="HardHat" title={t('Team today')} />
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {topTechnicians.map((tech, index) => (
                <li
                  key={tech.name}
                  className="flex items-center gap-3 rounded-lg border border-border bg-inset px-3 py-2.5"
                >
                  <span
                    dir="ltr"
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient font-mono text-xs font-bold text-white"
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-heading">{tech.name}</span>
                    <span className="block truncate text-[11px] text-muted">{t(tech.specialty)}</span>
                  </span>
                  <span className="flex flex-col items-end">
                    <span dir="ltr" className="font-mono text-sm font-bold tabular-nums text-heading">
                      {tech.jobs}
                    </span>
                    <span className="text-[11px] text-muted">{t('jobs')}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/technicians"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded border border-border font-action text-[13px] font-medium text-salis-blue no-underline transition-colors hover:bg-salis-blue/[.08] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
            >
              {t('All technicians')}
              <Icon name="ArrowUpRight" size={14} />
            </Link>
          </Card>
        ) : null}
      </div>

      <JobCardForm open={creatingJob} onClose={() => setCreatingJob(false)} />
      <VehicleFormModal open={creatingVehicle} onClose={() => setCreatingVehicle(false)} />
    </ScreenFrame>
  )
}

/** Today / 7 days / 30 days. Disabled — with the reason as a tooltip — while
 *  the rows carry no dates, rather than pretending to filter. */
function PeriodControl({
  value,
  onChange,
  disabled,
}: {
  value: Period
  onChange: (next: Period) => void
  disabled?: boolean
}) {
  const { t } = usePreferences()
  const options: { id: Period; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7 days' },
    { id: '30d', label: '30 days' },
  ]
  return (
    <div
      role="group"
      aria-label={t('Period')}
      title={disabled ? t('Period filters need dated records — available on the live API.') : undefined}
      className={cn('inline-flex h-9 rounded border border-border bg-inset p-0.5', disabled && 'opacity-60')}
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          disabled={disabled}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            'inline-flex h-8 cursor-pointer items-center rounded px-3 font-action text-xs font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue disabled:cursor-not-allowed',
            value === option.id ? 'bg-card text-salis-blue shadow-sm' : 'bg-transparent text-muted hover:text-heading'
          )}
        >
          {t(option.label)}
        </button>
      ))}
    </div>
  )
}

const TONE_STYLE = {
  blue: { tint: 'var(--tint-blue)', fg: 'var(--salis-blue)', orb: 'linear-gradient(135deg,var(--salis-blue),var(--salis-blue-bright))', shadow: 'rgba(10,94,215,.2)' },
  bright: { tint: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)', orb: 'linear-gradient(135deg,var(--salis-blue-bright),var(--chart-3))', shadow: 'rgba(11,179,255,.2)' },
  navy: { tint: 'var(--tint-navy)', fg: 'var(--salis-navy)', orb: 'linear-gradient(135deg,var(--salis-navy),var(--navy-dark))', shadow: 'rgba(11,31,59,.2)' },
  orange: { tint: 'var(--tint-orange)', fg: 'var(--salis-orange)', orb: 'linear-gradient(135deg,var(--salis-orange),var(--orange-light))', shadow: 'rgba(249,115,22,.2)' },
} as const

function MetricCard({
  icon,
  tone,
  label,
  value,
  footer,
  orbIcon,
  orb,
  progress,
  to,
}: {
  icon: string
  tone: keyof typeof TONE_STYLE
  label: string
  value: React.ReactNode
  footer?: React.ReactNode
  orbIcon?: string
  /** Custom end-side visual, when the standard gradient orb doesn't fit. */
  orb?: React.ReactNode
  /** 0–1; renders the thin progress rail under the card. */
  progress?: number
  /** Where the figure drills into. */
  to: string
}) {
  const style = TONE_STYLE[tone]
  return (
    <Link
      to={to}
      className={cn(
        'block rounded-xl border border-border bg-card p-6 no-underline shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-salis-blue/[.3] hover:shadow-lg hover:no-underline motion-reduce:hover:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex rounded-lg p-2" style={{ background: style.tint, color: style.fg }} aria-hidden>
              <Icon name={icon} size={20} />
            </span>
            <span className="text-sm font-medium text-muted">{label}</span>
          </div>
          <div>
            <p className="font-display text-3xl font-black text-heading">{value}</p>
            {footer}
          </div>
        </div>
        {orb ??
          (orbIcon ? (
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-white"
              style={{ background: style.orb, boxShadow: `0 10px 15px -3px ${style.shadow}` }}
              aria-hidden
            >
              <Icon name={orbIcon} size={28} />
            </div>
          ) : null)}
      </div>
      {progress !== undefined ? (
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-tint-blue" aria-hidden>
          <div className="h-full rounded-full bg-salis-gradient-r" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      ) : null}
    </Link>
  )
}

/** Stock level reads as a ring rather than a number-in-a-circle. */
function StockRing({ ratio }: { ratio: number }) {
  const circumference = 2 * Math.PI * 24
  return (
    <div className="relative h-14 w-14 flex-shrink-0" aria-hidden>
      <svg width="56" height="56" className="-rotate-90" aria-hidden>
        <circle cx="28" cy="28" r="24" stroke="var(--tint-orange)" strokeWidth="6" fill="none" />
        <circle
          cx="28"
          cy="28"
          r="24"
          stroke="var(--salis-orange)"
          strokeWidth="6"
          fill="none"
          strokeDasharray={`${(circumference * ratio).toFixed(1)} ${circumference.toFixed(1)}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-salis-orange">
        <Icon name="ShieldCheck" size={20} />
      </span>
    </div>
  )
}

function StatusDonut({ segments, total }: { segments: readonly { label: string; value: number }[]; total: number }) {
  const { t } = usePreferences()
  const sum = segments.reduce((acc, s) => acc + s.value, 0) || 1
  let cursor = 0
  const gradient = segments
    .map((segment, index) => {
      const start = (cursor / sum) * 100
      cursor += segment.value
      const end = (cursor / sum) * 100
      return `${CHART_COLORS[index % CHART_COLORS.length]} ${start.toFixed(2)}% ${end.toFixed(2)}%`
    })
    .join(',')
  return (
    <div
      role="img"
      aria-label={`${t('Job Status')}: ${segments.map((s) => `${t(s.label)} ${s.value}`).join(', ')}`}
      className="relative mx-auto h-[180px] w-[180px] flex-shrink-0 rounded-full"
      style={{ background: segments.length ? `conic-gradient(${gradient})` : 'var(--surface-inset)' }}
    >
      <div className="absolute inset-9 flex flex-col items-center justify-center rounded-full bg-card">
        <span dir="ltr" className="font-display text-[28px] font-black tabular-nums text-heading">{total}</span>
        <span className="text-[11px] text-muted">{t('jobs')}</span>
      </div>
    </div>
  )
}
