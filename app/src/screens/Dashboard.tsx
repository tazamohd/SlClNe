import { Link } from 'react-router-dom'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PriorityBadge, ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/shell/AppShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import type { RoleId } from '@/data/types'

export function Dashboard() {
  const { t, rtl } = usePreferences()
  const { role, userName } = useSession()
  const { data: jobs = [] } = useCollection('jobs')
  const cfg = (ROLE_CONFIG[role] ?? ROLE_CONFIG.owner) as RoleConfig

  return (
    <>
      <PageHeader
        icon={cfg.headerIcon}
        title={t(cfg.headerTitle)}
        subtitle={
          <>
            {t(cfg.greeting)}{' '}
            <span className="font-semibold text-heading">{userName}</span>
          </>
        }
        actions={
          <>
            {cfg.actions.map((a) => (
              <Button key={a.label} variant={a.variant ?? 'outline'} size="md">
                <Icon name={a.icon} size={16} />
                {t(a.label)}
              </Button>
            ))}
          </>
        }
      />

      {/* ── Metrics ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cfg.metrics.map((m) => (
          <MetricCard
            key={m.label}
            icon={m.icon}
            iconTint={m.iconTint}
            iconColor={m.iconColor}
            label={t(m.label)}
            value={m.value}
            orbGradient={m.orbGradient}
            orbIcon={m.orbIcon}
            orbShadow={m.orbShadow}
            footer={
              m.footer ? (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {m.footer.trend ? (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-salis-blue">
                      <Icon name="ArrowUpRight" size={14} />
                      {m.footer.trend}
                    </span>
                  ) : null}
                  {m.footer.sparkline ? (
                    <Sparkline points={m.footer.sparkline} stroke={m.iconColor} />
                  ) : null}
                  {m.footer.badges?.map((b) => (
                    <span
                      key={b.label}
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${b.className}`}
                    >
                      {t(b.label)}
                    </span>
                  ))}
                  {m.footer.text ? (
                    <span className={`text-xs ${m.footer.textClass ?? 'text-muted'}`}>
                      {t(m.footer.text)}
                    </span>
                  ) : null}
                </div>
              ) : undefined
            }
            progress={m.progress}
            orb={
              m.ringProgress !== undefined ? (
                <div className="relative h-14 w-14 flex-shrink-0">
                  <svg width="56" height="56" className="-rotate-90" aria-hidden>
                    <circle cx="28" cy="28" r="24" stroke={`${m.iconColor}33`} strokeWidth="6" fill="none" />
                    <circle
                      cx="28" cy="28" r="24"
                      stroke={m.iconColor}
                      strokeWidth="6" fill="none"
                      strokeDasharray={`${Math.round(m.ringProgress * 150)} 150`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center" style={{ color: m.iconColor }}>
                    <Icon name={m.ringIcon ?? 'Activity'} size={20} />
                  </span>
                </div>
              ) : undefined
            }
          />
        ))}
      </div>

      {/* ── Pipeline ────────────────────────────────────────────────────── */}
      <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-${cfg.pipeline.length}`}>
        {cfg.pipeline.map((stage) => (
          <Card
            key={stage.label}
            className="flex flex-col items-center gap-3 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(10,94,215,.3)] hover:shadow-lg"
          >
            <span
              className="flex rounded-lg p-3 text-white shadow-lg"
              style={{ background: stage.gradient }}
            >
              <Icon name={stage.icon} size={20} />
            </span>
            <div className="text-center">
              <h4 className="font-display text-2xl font-black text-heading">{stage.count}</h4>
              <p className="mt-1 text-xs font-medium text-muted">{t(stage.label)}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <CardHeader icon={cfg.chart1.icon} title={t(cfg.chart1.title)} className="mb-6" />
          <svg viewBox="0 0 600 260" className="block h-auto w-full" role="img" aria-label={t(cfg.chart1.title)}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cfg.chart1.color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={cfg.chart1.color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${cfg.chart1.path} L580,220 L20,220 Z`} fill="url(#chartGrad)" />
            <path d={cfg.chart1.path} fill="none" stroke={cfg.chart1.color} strokeWidth="2.5" />
            {cfg.chart1.labels.map((label, i) => (
              <text
                key={label}
                x={20 + i * (560 / (cfg.chart1.labels.length - 1))}
                y="244"
                fontSize="11"
                fill="#64748B"
                textAnchor="middle"
                fontFamily="Inter,sans-serif"
              >
                {label}
              </text>
            ))}
          </svg>
        </Card>

        <Card className="p-6">
          <CardHeader icon={cfg.chart2.icon} title={t(cfg.chart2.title)} className="mb-6" />
          <div className="flex flex-wrap items-center gap-6">
            <div
              className="relative h-[180px] w-[180px] flex-shrink-0 rounded-full"
              style={{ background: cfg.chart2.conicGradient }}
            >
              <div className="absolute inset-9 flex flex-col items-center justify-center rounded-full bg-card">
                <span className="font-display text-[28px] font-black text-heading">{cfg.chart2.total}</span>
                <span className="text-[11px] text-muted">{t(cfg.chart2.totalLabel)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {cfg.chart2.legend.map(([label, count, color]) => (
                <div key={label} className="flex items-center gap-2 text-[13px]">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-[3px]" style={{ background: color }} />
                  <span className="min-w-[90px] text-body">{t(label)}</span>
                  <span className="font-mono text-xs text-muted">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          icon={cfg.table.icon}
          title={t(cfg.table.title)}
          className="px-6 pb-3 pt-5"
          action={
            cfg.table.viewAllRoute ? (
              <Link
                to={cfg.table.viewAllRoute}
                className="inline-flex h-8 items-center gap-1.5 rounded px-3 font-action text-[13px] font-medium text-salis-blue no-underline transition-colors duration-150 hover:bg-[rgba(10,94,215,.08)] hover:no-underline"
              >
                {t('View All')}
                <Icon name="ArrowUpRight" size={14} />
              </Link>
            ) : undefined
          }
        />
        {cfg.table.useJobs ? (
          <JobTable jobs={jobs} t={t} rtl={rtl} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-ui text-sm text-heading">
              <thead>
                <tr>
                  {cfg.table.columns.map((col) => (
                    <th
                      key={col}
                      className="h-11 whitespace-nowrap border-b border-border px-6 text-start text-xs font-semibold uppercase tracking-[.05em] text-muted"
                    >
                      {t(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cfg.table.rows.map((row, idx) => (
                  <tr key={idx} className="transition-colors duration-150 hover:bg-[rgba(10,94,215,.04)]">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`border-b border-border px-6 py-3 align-middle ${ci === 0 ? 'font-medium' : ''}`}
                      >
                        {cell.badge ? (
                          <StatusBadge value={cell.badge} label={t(cell.text)} />
                        ) : cell.priority ? (
                          <PriorityBadge value={cell.priority} label={t(cell.text)} />
                        ) : cell.mono ? (
                          <span dir="ltr" className="font-mono text-[13px]">{cell.text}</span>
                        ) : (
                          cell.text
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between px-6 pb-5 pt-4">
          <span className="text-[13px] text-muted">
            {t(`Showing 1–${cfg.table.useJobs ? '5' : cfg.table.rows.length} of ${cfg.table.totalLabel}`)}
          </span>
          <div className="flex gap-1.5">
            <PageButton label="Previous page" icon={rtl ? 'ChevronRight' : 'ChevronLeft'} />
            <button
              type="button"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border-none bg-salis-gradient text-[13px] font-semibold text-white"
            >
              1
            </button>
            {[2, 3].map((page) => (
              <button
                key={page}
                type="button"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-border bg-card text-[13px] text-body hover:border-salis-blue hover:text-salis-blue"
              >
                {page}
              </button>
            ))}
            <PageButton label="Next page" icon={rtl ? 'ChevronLeft' : 'ChevronRight'} />
          </div>
        </div>
      </Card>
    </>
  )
}

/* ── Job Table (shared by owner/manager/advisor) ────────────────────── */

function JobTable({
  jobs,
  t,
  rtl: _rtl,
}: {
  jobs: readonly { id: string; cust: string; veh: string; svc: string; pr: string; st: string }[]
  t: (s: string) => string
  rtl: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-ui text-sm text-heading">
        <thead>
          <tr>
            {['Job Card', 'Customer', 'Vehicle', 'Service', 'Priority', 'Status'].map((head) => (
              <th
                key={head}
                className="h-11 whitespace-nowrap border-b border-border px-6 text-start text-xs font-semibold uppercase tracking-[.05em] text-muted"
              >
                {t(head)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="transition-colors duration-150 hover:bg-[rgba(10,94,215,.04)]">
              <td className="border-b border-border px-6 py-3 align-middle font-mono text-[13px]" dir="ltr">
                {job.id}
              </td>
              <td className="border-b border-border px-6 py-3 align-middle">{job.cust}</td>
              <td className="border-b border-border px-6 py-3 align-middle">{job.veh}</td>
              <td className="border-b border-border px-6 py-3 align-middle">
                <ServiceBadge value={job.svc} label={t(job.svc.replace(/_/g, ' '))} />
              </td>
              <td className="border-b border-border px-6 py-3 align-middle">
                <PriorityBadge value={job.pr} label={t(job.pr)} />
              </td>
              <td className="border-b border-border px-6 py-3 align-middle">
                <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Reusable pieces ────────────────────────────────────────────────── */

function MetricCard({
  icon, iconTint, iconColor, label, value, footer,
  orbGradient, orbIcon, orbShadow, orb, progress,
}: {
  icon: string; iconTint: string; iconColor: string; label: string; value: string
  footer?: React.ReactNode; orbGradient?: string; orbIcon?: string; orbShadow?: string
  orb?: React.ReactNode; progress?: number
}) {
  return (
    <Card className="p-6 transition-all duration-200 hover:border-[rgba(10,94,215,.3)] hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex rounded-lg p-2" style={{ background: iconTint, color: iconColor }}>
              <Icon name={icon} size={20} />
            </span>
            <span className="text-sm font-medium text-muted">{label}</span>
          </div>
          <div>
            <h3 className="font-display text-3xl font-black text-heading">{value}</h3>
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
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-[rgba(10,94,215,.1)]">
          <div className="h-full rounded-full bg-salis-gradient-r" style={{ width: `${progress * 100}%` }} />
        </div>
      ) : null}
    </Card>
  )
}

function Sparkline({ points, stroke }: { points: string; stroke: string }) {
  return (
    <svg width="80" height="32" viewBox="0 0 80 32" aria-hidden>
      <polyline fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

function PageButton({ label, icon }: { label: string; icon: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-border bg-card text-body hover:border-salis-blue hover:text-salis-blue"
    >
      <Icon name={icon} size={14} />
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   Role-specific dashboard configurations
   ═══════════════════════════════════════════════════════════════════════ */

interface CellDef { text: string; badge?: string; priority?: string; mono?: boolean }
interface FooterBadge { label: string; className: string }
interface MetricFooter {
  trend?: string; sparkline?: string; text?: string; textClass?: string
  badges?: FooterBadge[]
}
interface MetricDef {
  icon: string; iconTint: string; iconColor: string; label: string; value: string
  orbGradient?: string; orbIcon?: string; orbShadow?: string
  footer?: MetricFooter; progress?: number
  ringProgress?: number; ringIcon?: string
}
interface PipelineStage { icon: string; label: string; count: number; gradient: string }
interface ChartLine {
  icon: string; title: string; color: string; path: string; labels: string[]
}
interface ChartDonut {
  icon: string; title: string; total: number; totalLabel: string
  conicGradient: string; legend: [string, number, string][]
}
interface TableDef {
  icon: string; title: string; viewAllRoute?: string; totalLabel: string
  useJobs?: boolean; columns: string[]; rows: CellDef[][]
}
interface RoleConfig {
  headerIcon: string; headerTitle: string; greeting: string
  actions: { icon: string; label: string; variant?: 'outline' | undefined }[]
  metrics: MetricDef[]; pipeline: PipelineStage[]
  chart1: ChartLine; chart2: ChartDonut; table: TableDef
}

function c(text: string, opts?: Partial<CellDef>): CellDef {
  return { text, ...opts }
}

const BLUE = '#0A5ED7'
const BRIGHT = '#0BB3FF'
const DARK = '#0B1F3B'
const ORANGE = '#F97316'
const SLATE = '#64748B'

const MONTHS6 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const REVENUE_PATH = 'M20,121 C57,112 95,94 132,94 C169,94 207,106 244,106 C281,106 319,81 356,69 C393,57 431,55 468,49 C505,43 543,29 580,22'

/* ── Owner / CEO ────────────────────────────────────────────────────── */
const OWNER: RoleConfig = {
  headerIcon: 'Sparkles',
  headerTitle: 'Dashboard',
  greeting: 'Welcome back,',
  actions: [
    { icon: 'FileText', label: 'New Job Card' },
    { icon: 'Car', label: 'Add Vehicle', variant: undefined },
  ],
  metrics: [
    {
      icon: 'DollarSign', iconTint: 'rgba(10,94,215,.1)', iconColor: BLUE,
      label: 'Total Revenue', value: '$128,450',
      orbGradient: `linear-gradient(135deg,${BLUE},${BRIGHT})`, orbIcon: 'TrendingUp', orbShadow: 'rgba(10,94,215,.2)',
      footer: { trend: '+12%', sparkline: '0,26 13,22 26,24 40,16 53,18 66,8 80,4' },
      progress: 0.75,
    },
    {
      icon: 'Wrench', iconTint: 'rgba(11,179,255,.1)', iconColor: BRIGHT,
      label: 'Active Jobs', value: '14',
      orbGradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)`, orbIcon: 'Gauge', orbShadow: 'rgba(11,179,255,.2)',
      footer: {
        badges: [
          { label: '5 pending', className: 'border-[rgba(249,115,22,.3)] bg-[rgba(249,115,22,.1)] text-salis-orange' },
          { label: '9 active', className: 'border-[rgba(11,179,255,.3)] bg-[rgba(11,179,255,.1)] text-salis-bright' },
        ],
      },
    },
    {
      icon: 'Users', iconTint: 'rgba(11,31,59,.1)', iconColor: DARK,
      label: 'Customers', value: '248',
      orbGradient: `linear-gradient(135deg,${DARK},#1e3a5f)`, orbIcon: 'Target', orbShadow: 'rgba(11,31,59,.2)',
      footer: { trend: '+8%', sparkline: '0,24 13,20 26,22 40,14 53,16 66,10 80,6' },
    },
    {
      icon: 'Package', iconTint: 'rgba(249,115,22,.1)', iconColor: ORANGE,
      label: 'Inventory', value: '86%',
      footer: { text: '142/165 in stock', textClass: 'text-salis-orange' },
      ringProgress: 0.86, ringIcon: 'ShieldCheck',
    },
  ],
  pipeline: [
    { icon: 'Clock', label: 'Check-In', count: 5, gradient: `linear-gradient(135deg,${ORANGE},#FB923C)` },
    { icon: 'Wrench', label: 'In Repair', count: 9, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
    { icon: 'AlertCircle', label: 'QC', count: 6, gradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)` },
    { icon: 'CheckCircle', label: 'Done', count: 6, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
    { icon: 'Car', label: 'Delivered', count: 4, gradient: `linear-gradient(135deg,${DARK},#1e3a5f)` },
    { icon: 'Activity', label: 'Total', count: 27, gradient: `linear-gradient(135deg,${SLATE},#94A3B8)` },
  ],
  chart1: { icon: 'TrendingUp', title: 'Revenue Trend', color: BLUE, path: REVENUE_PATH, labels: MONTHS6 },
  chart2: {
    icon: 'BarChart3', title: 'Job Status', total: 27, totalLabel: 'jobs',
    conicGradient: `conic-gradient(${BLUE} 0% 22.22%,${BRIGHT} 22.22% 55.56%,${ORANGE} 55.56% 74.07%,${DARK} 74.07% 88.89%,${SLATE} 88.89% 100%)`,
    legend: [['Completed', 6, BLUE], ['In Progress', 9, BRIGHT], ['Pending', 5, ORANGE], ['Delivered', 4, DARK], ['Cancelled', 3, SLATE]],
  },
  table: {
    icon: 'ClipboardList', title: 'Latest Job Cards', viewAllRoute: '/job-cards',
    totalLabel: '27', useJobs: true, columns: [], rows: [],
  },
}

/* ── Branch Manager ─────────────────────────────────────────────────── */
const MANAGER: RoleConfig = {
  headerIcon: 'UserCog',
  headerTitle: 'Branch Overview',
  greeting: 'Good morning,',
  actions: [
    { icon: 'FileText', label: 'New Job Card' },
    { icon: 'CalendarPlus', label: 'New Appointment', variant: undefined },
  ],
  metrics: [
    {
      icon: 'DollarSign', iconTint: 'rgba(10,94,215,.1)', iconColor: BLUE,
      label: 'Branch Revenue', value: '$84,320',
      orbGradient: `linear-gradient(135deg,${BLUE},${BRIGHT})`, orbIcon: 'TrendingUp', orbShadow: 'rgba(10,94,215,.2)',
      footer: { trend: '+9%', sparkline: '0,28 13,24 26,20 40,22 53,16 66,12 80,8' },
      progress: 0.68,
    },
    {
      icon: 'Wrench', iconTint: 'rgba(11,179,255,.1)', iconColor: BRIGHT,
      label: 'Active Jobs', value: '14',
      orbGradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)`, orbIcon: 'Gauge', orbShadow: 'rgba(11,179,255,.2)',
      footer: {
        badges: [
          { label: '3 overdue', className: 'border-[rgba(249,115,22,.3)] bg-[rgba(249,115,22,.1)] text-salis-orange' },
          { label: '11 on track', className: 'border-[rgba(11,179,255,.3)] bg-[rgba(11,179,255,.1)] text-salis-bright' },
        ],
      },
    },
    {
      icon: 'Users', iconTint: 'rgba(11,31,59,.1)', iconColor: DARK,
      label: 'Staff Utilization', value: '78%',
      orbGradient: `linear-gradient(135deg,${DARK},#1e3a5f)`, orbIcon: 'Activity', orbShadow: 'rgba(11,31,59,.2)',
      footer: { text: '7/9 technicians busy' },
    },
    {
      icon: 'AlertCircle', iconTint: 'rgba(249,115,22,.1)', iconColor: ORANGE,
      label: 'Pending Approvals', value: '6',
      orbGradient: `linear-gradient(135deg,${ORANGE},#FB923C)`, orbIcon: 'ClipboardCheck', orbShadow: 'rgba(249,115,22,.2)',
      footer: { text: 'SAR 23,400 total', textClass: 'text-salis-orange' },
    },
  ],
  pipeline: [
    { icon: 'Clock', label: 'Check-In', count: 5, gradient: `linear-gradient(135deg,${ORANGE},#FB923C)` },
    { icon: 'Wrench', label: 'In Repair', count: 9, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
    { icon: 'AlertCircle', label: 'QC', count: 6, gradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)` },
    { icon: 'CheckCircle', label: 'Done', count: 6, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
    { icon: 'Car', label: 'Delivered', count: 4, gradient: `linear-gradient(135deg,${DARK},#1e3a5f)` },
    { icon: 'Activity', label: 'Total', count: 27, gradient: `linear-gradient(135deg,${SLATE},#94A3B8)` },
  ],
  chart1: {
    icon: 'TrendingUp', title: 'Staff Productivity', color: BLUE,
    path: 'M20,160 C57,140 95,120 132,110 C169,100 207,95 244,88 C281,81 319,70 356,65 C393,60 431,50 468,45 C505,40 543,35 580,30',
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  chart2: {
    icon: 'BarChart3', title: 'Job Status', total: 27, totalLabel: 'jobs',
    conicGradient: `conic-gradient(${BLUE} 0% 22.22%,${BRIGHT} 22.22% 55.56%,${ORANGE} 55.56% 74.07%,${DARK} 74.07% 88.89%,${SLATE} 88.89% 100%)`,
    legend: [['Completed', 6, BLUE], ['In Progress', 9, BRIGHT], ['Pending', 5, ORANGE], ['Delivered', 4, DARK], ['Cancelled', 3, SLATE]],
  },
  table: {
    icon: 'ClipboardList', title: 'Latest Job Cards', viewAllRoute: '/job-cards',
    totalLabel: '27', useJobs: true, columns: [], rows: [],
  },
}

/* ── Service Advisor ────────────────────────────────────────────────── */
const ADVISOR: RoleConfig = {
  headerIcon: 'Headset',
  headerTitle: 'Service Desk',
  greeting: 'Welcome,',
  actions: [
    { icon: 'CalendarPlus', label: 'New Appointment' },
    { icon: 'FileText', label: 'New Estimate', variant: undefined },
  ],
  metrics: [
    {
      icon: 'Calendar', iconTint: 'rgba(10,94,215,.1)', iconColor: BLUE,
      label: "Today's Appointments", value: '8',
      orbGradient: `linear-gradient(135deg,${BLUE},${BRIGHT})`, orbIcon: 'Calendar', orbShadow: 'rgba(10,94,215,.2)',
      footer: {
        badges: [
          { label: '3 checked in', className: 'border-[rgba(10,94,215,.3)] bg-[rgba(10,94,215,.1)] text-salis-blue' },
          { label: '5 upcoming', className: 'border-[rgba(11,179,255,.3)] bg-[rgba(11,179,255,.1)] text-salis-bright' },
        ],
      },
    },
    {
      icon: 'FileText', iconTint: 'rgba(11,179,255,.1)', iconColor: BRIGHT,
      label: 'Open Estimates', value: '12',
      orbGradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)`, orbIcon: 'FileText', orbShadow: 'rgba(11,179,255,.2)',
      footer: { text: 'SAR 67,800 pending', textClass: 'text-salis-bright' },
    },
    {
      icon: 'UserCheck', iconTint: 'rgba(11,31,59,.1)', iconColor: DARK,
      label: 'Awaiting Approval', value: '4',
      orbGradient: `linear-gradient(135deg,${DARK},#1e3a5f)`, orbIcon: 'Clock', orbShadow: 'rgba(11,31,59,.2)',
      footer: { text: 'Customer response needed' },
    },
    {
      icon: 'PhoneCall', iconTint: 'rgba(249,115,22,.1)', iconColor: ORANGE,
      label: 'Follow-ups Due', value: '6',
      orbGradient: `linear-gradient(135deg,${ORANGE},#FB923C)`, orbIcon: 'Bell', orbShadow: 'rgba(249,115,22,.2)',
      footer: { text: '2 overdue', textClass: 'text-salis-orange' },
    },
  ],
  pipeline: [
    { icon: 'PhoneIncoming', label: 'Enquiry', count: 3, gradient: `linear-gradient(135deg,${SLATE},#94A3B8)` },
    { icon: 'Calendar', label: 'Booked', count: 8, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
    { icon: 'Clock', label: 'Checked In', count: 3, gradient: `linear-gradient(135deg,${ORANGE},#FB923C)` },
    { icon: 'FileText', label: 'Estimated', count: 12, gradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)` },
    { icon: 'ThumbsUp', label: 'Approved', count: 5, gradient: `linear-gradient(135deg,${DARK},#1e3a5f)` },
    { icon: 'Car', label: 'Delivered', count: 4, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
  ],
  chart1: {
    icon: 'TrendingUp', title: 'Appointments This Week', color: BLUE,
    path: 'M20,160 C57,100 95,120 132,80 C169,100 207,60 244,90 C281,50 319,70 356,40 C393,60 431,30 468,50 C505,35 543,45 580,25',
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
  },
  chart2: {
    icon: 'BarChart3', title: 'Estimate Conversion', total: 42, totalLabel: 'estimates',
    conicGradient: `conic-gradient(${BLUE} 0% 40%,${BRIGHT} 40% 65%,${ORANGE} 65% 85%,${SLATE} 85% 100%)`,
    legend: [['Approved', 17, BLUE], ['Pending', 10, BRIGHT], ['Revised', 9, ORANGE], ['Declined', 6, SLATE]],
  },
  table: {
    icon: 'Calendar', title: "Today's Schedule", viewAllRoute: '/appointments',
    totalLabel: '8', columns: ['Time', 'Customer', 'Vehicle', 'Service', 'Status'],
    rows: [
      [c('08:00 AM'), c('Khalid Al-Amri'), c('Toyota Camry 2023'), c('Full Service'), c('Checked In', { badge: 'in_progress' })],
      [c('08:30 AM'), c('Ahmed Al-Rashid'), c('Hyundai Tucson 2024'), c('Oil Change'), c('Checked In', { badge: 'in_progress' })],
      [c('09:00 AM'), c('Sara Al-Fahad'), c('Nissan Patrol 2022'), c('Brake Inspection'), c('Checked In', { badge: 'in_progress' })],
      [c('10:00 AM'), c('Omar Al-Qahtani'), c('Honda Accord 2023'), c('AC Repair'), c('Upcoming', { badge: 'pending' })],
      [c('11:00 AM'), c('Fatima Al-Otaibi'), c('BMW X5 2024'), c('Diagnostics'), c('Upcoming', { badge: 'pending' })],
    ],
  },
}

/* ── QC Inspector ───────────────────────────────────────────────────── */
const QC: RoleConfig = {
  headerIcon: 'ClipboardCheck',
  headerTitle: 'Quality Control',
  greeting: 'Welcome,',
  actions: [
    { icon: 'ClipboardCheck', label: 'Start Inspection' },
  ],
  metrics: [
    {
      icon: 'ClipboardCheck', iconTint: 'rgba(10,94,215,.1)', iconColor: BLUE,
      label: 'Awaiting QC', value: '6',
      orbGradient: `linear-gradient(135deg,${BLUE},${BRIGHT})`, orbIcon: 'AlertCircle', orbShadow: 'rgba(10,94,215,.2)',
      footer: {
        badges: [
          { label: '2 urgent', className: 'border-[rgba(249,115,22,.3)] bg-[rgba(249,115,22,.1)] text-salis-orange' },
          { label: '4 standard', className: 'border-[rgba(10,94,215,.3)] bg-[rgba(10,94,215,.1)] text-salis-blue' },
        ],
      },
    },
    {
      icon: 'CheckCircle', iconTint: 'rgba(11,179,255,.1)', iconColor: BRIGHT,
      label: 'Passed Today', value: '9',
      orbGradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)`, orbIcon: 'CheckCircle', orbShadow: 'rgba(11,179,255,.2)',
      footer: { trend: '+3 vs yesterday' },
    },
    {
      icon: 'XCircle', iconTint: 'rgba(249,115,22,.1)', iconColor: ORANGE,
      label: 'Failed / Rework', value: '2',
      orbGradient: `linear-gradient(135deg,${ORANGE},#FB923C)`, orbIcon: 'RotateCcw', orbShadow: 'rgba(249,115,22,.2)',
      footer: { text: 'Sent back to workshop', textClass: 'text-salis-orange' },
    },
    {
      icon: 'Target', iconTint: 'rgba(11,31,59,.1)', iconColor: DARK,
      label: 'Pass Rate', value: '82%',
      footer: { text: 'This week', textClass: 'text-muted' },
      ringProgress: 0.82, ringIcon: 'Target',
    },
  ],
  pipeline: [
    { icon: 'Clock', label: 'Queue', count: 6, gradient: `linear-gradient(135deg,${ORANGE},#FB923C)` },
    { icon: 'Search', label: 'Inspecting', count: 2, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
    { icon: 'CheckCircle', label: 'Passed', count: 9, gradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)` },
    { icon: 'XCircle', label: 'Failed', count: 2, gradient: `linear-gradient(135deg,${ORANGE},#FB923C)` },
    { icon: 'RotateCcw', label: 'Re-inspect', count: 1, gradient: `linear-gradient(135deg,${DARK},#1e3a5f)` },
    { icon: 'Activity', label: 'Total', count: 20, gradient: `linear-gradient(135deg,${SLATE},#94A3B8)` },
  ],
  chart1: {
    icon: 'TrendingUp', title: 'QC Volume This Week', color: BLUE,
    path: 'M20,180 C57,150 95,120 132,100 C169,80 207,90 244,60 C281,70 319,50 356,55 C393,40 431,45 468,30 C505,35 543,25 580,20',
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
  },
  chart2: {
    icon: 'BarChart3', title: 'Inspection Results', total: 20, totalLabel: 'inspections',
    conicGradient: `conic-gradient(${BLUE} 0% 45%,${BRIGHT} 45% 70%,${ORANGE} 70% 85%,${SLATE} 85% 100%)`,
    legend: [['Passed', 9, BLUE], ['Passed w/ Notes', 5, BRIGHT], ['Failed', 3, ORANGE], ['Re-inspect', 3, SLATE]],
  },
  table: {
    icon: 'ClipboardList', title: 'Inspection Queue', viewAllRoute: '/job-cards',
    totalLabel: '6', columns: ['Job Card', 'Vehicle', 'Technician', 'Service', 'Priority', 'Status'],
    rows: [
      [c('JC-2024-0041', { mono: true }), c('Toyota Camry 2023'), c('Saeed Al-Zahrani'), c('Full Service'), c('Urgent', { priority: 'urgent' }), c('Ready for QC', { badge: 'pending' })],
      [c('JC-2024-0039', { mono: true }), c('Hyundai Tucson 2024'), c('Ali Al-Harbi'), c('Engine Repair'), c('Urgent', { priority: 'urgent' }), c('Ready for QC', { badge: 'pending' })],
      [c('JC-2024-0038', { mono: true }), c('Nissan Patrol 2022'), c('Mohammed Al-Otaibi'), c('Brake Replacement'), c('Normal', { priority: 'normal' }), c('Ready for QC', { badge: 'pending' })],
      [c('JC-2024-0036', { mono: true }), c('Honda Accord 2023'), c('Saeed Al-Zahrani'), c('AC Repair'), c('Normal', { priority: 'normal' }), c('Ready for QC', { badge: 'pending' })],
      [c('JC-2024-0035', { mono: true }), c('BMW X5 2024'), c('Ali Al-Harbi'), c('Diagnostics'), c('Normal', { priority: 'normal' }), c('Ready for QC', { badge: 'pending' })],
    ],
  },
}

/* ── Storekeeper ────────────────────────────────────────────────────── */
const PARTS_STORE: RoleConfig = {
  headerIcon: 'Package',
  headerTitle: 'Parts & Inventory',
  greeting: 'Welcome,',
  actions: [
    { icon: 'ShoppingCart', label: 'New Purchase Order' },
    { icon: 'PackagePlus', label: 'Receive Stock', variant: undefined },
  ],
  metrics: [
    {
      icon: 'Package', iconTint: 'rgba(10,94,215,.1)', iconColor: BLUE,
      label: 'Total SKUs', value: '1,247',
      orbGradient: `linear-gradient(135deg,${BLUE},${BRIGHT})`, orbIcon: 'Package', orbShadow: 'rgba(10,94,215,.2)',
      footer: { trend: '+24 this month', sparkline: '0,28 13,24 26,22 40,18 53,14 66,10 80,6' },
    },
    {
      icon: 'AlertTriangle', iconTint: 'rgba(249,115,22,.1)', iconColor: ORANGE,
      label: 'Low Stock Alerts', value: '18',
      orbGradient: `linear-gradient(135deg,${ORANGE},#FB923C)`, orbIcon: 'AlertTriangle', orbShadow: 'rgba(249,115,22,.2)',
      footer: { text: '5 critical, 13 warning', textClass: 'text-salis-orange' },
    },
    {
      icon: 'Truck', iconTint: 'rgba(11,179,255,.1)', iconColor: BRIGHT,
      label: 'Pending Orders', value: '7',
      orbGradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)`, orbIcon: 'Truck', orbShadow: 'rgba(11,179,255,.2)',
      footer: {
        badges: [
          { label: '3 in transit', className: 'border-[rgba(11,179,255,.3)] bg-[rgba(11,179,255,.1)] text-salis-bright' },
          { label: '4 ordered', className: 'border-[rgba(10,94,215,.3)] bg-[rgba(10,94,215,.1)] text-salis-blue' },
        ],
      },
    },
    {
      icon: 'ShieldCheck', iconTint: 'rgba(11,31,59,.1)', iconColor: DARK,
      label: 'Stock Level', value: '86%',
      footer: { text: '142/165 categories stocked', textClass: 'text-muted' },
      ringProgress: 0.86, ringIcon: 'ShieldCheck',
    },
  ],
  pipeline: [
    { icon: 'ClipboardList', label: 'Requested', count: 12, gradient: `linear-gradient(135deg,${ORANGE},#FB923C)` },
    { icon: 'ShoppingCart', label: 'Ordered', count: 4, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
    { icon: 'Truck', label: 'In Transit', count: 3, gradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)` },
    { icon: 'PackageCheck', label: 'Received', count: 8, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
    { icon: 'Warehouse', label: 'Shelved', count: 165, gradient: `linear-gradient(135deg,${DARK},#1e3a5f)` },
    { icon: 'AlertTriangle', label: 'Low Stock', count: 18, gradient: `linear-gradient(135deg,${ORANGE},#FB923C)` },
  ],
  chart1: {
    icon: 'TrendingUp', title: 'Parts Issued This Week', color: BLUE,
    path: 'M20,180 C57,160 95,140 132,130 C169,125 207,110 244,100 C281,90 319,85 356,70 C393,65 431,50 468,40 C505,35 543,30 580,25',
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
  },
  chart2: {
    icon: 'BarChart3', title: 'Stock by Category', total: 1247, totalLabel: 'SKUs',
    conicGradient: `conic-gradient(${BLUE} 0% 35%,${BRIGHT} 35% 55%,${ORANGE} 55% 70%,${DARK} 70% 85%,${SLATE} 85% 100%)`,
    legend: [['Engine Parts', 436, BLUE], ['Body & Trim', 250, BRIGHT], ['Electrical', 187, ORANGE], ['Fluids & Filters', 187, DARK], ['Other', 187, SLATE]],
  },
  table: {
    icon: 'AlertTriangle', title: 'Low Stock Items', viewAllRoute: '/inventory',
    totalLabel: '18', columns: ['Part Number', 'Description', 'Category', 'In Stock', 'Reorder Point', 'Status'],
    rows: [
      [c('BRK-PAD-T01', { mono: true }), c('Front Brake Pads — Toyota'), c('Brakes'), c('2'), c('10'), c('Critical', { badge: 'overdue' })],
      [c('OIL-5W30-M', { mono: true }), c('Engine Oil 5W-30 Mobil'), c('Fluids'), c('4'), c('15'), c('Critical', { badge: 'overdue' })],
      [c('FLT-AIR-H01', { mono: true }), c('Air Filter — Honda'), c('Filters'), c('3'), c('8'), c('Critical', { badge: 'overdue' })],
      [c('BLT-SRP-N01', { mono: true }), c('Serpentine Belt — Nissan'), c('Engine'), c('5'), c('10'), c('Warning', { badge: 'pending' })],
      [c('SPK-PLG-T01', { mono: true }), c('Spark Plugs — Toyota (set)'), c('Ignition'), c('6'), c('12'), c('Warning', { badge: 'pending' })],
    ],
  },
}

/* ── Accountant ─────────────────────────────────────────────────────── */
const ACCOUNTANT: RoleConfig = {
  headerIcon: 'Calculator',
  headerTitle: 'Financial Overview',
  greeting: 'Welcome,',
  actions: [
    { icon: 'FileText', label: 'New Invoice' },
    { icon: 'Receipt', label: 'Record Payment', variant: undefined },
  ],
  metrics: [
    {
      icon: 'DollarSign', iconTint: 'rgba(10,94,215,.1)', iconColor: BLUE,
      label: 'Monthly Revenue', value: 'SAR 482K',
      orbGradient: `linear-gradient(135deg,${BLUE},${BRIGHT})`, orbIcon: 'TrendingUp', orbShadow: 'rgba(10,94,215,.2)',
      footer: { trend: '+15%', sparkline: '0,28 13,22 26,18 40,20 53,14 66,10 80,6' },
      progress: 0.82,
    },
    {
      icon: 'FileText', iconTint: 'rgba(249,115,22,.1)', iconColor: ORANGE,
      label: 'Outstanding Invoices', value: 'SAR 67K',
      orbGradient: `linear-gradient(135deg,${ORANGE},#FB923C)`, orbIcon: 'AlertCircle', orbShadow: 'rgba(249,115,22,.2)',
      footer: { text: '23 invoices unpaid', textClass: 'text-salis-orange' },
    },
    {
      icon: 'CreditCard', iconTint: 'rgba(11,179,255,.1)', iconColor: BRIGHT,
      label: 'Payments Today', value: 'SAR 18.4K',
      orbGradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)`, orbIcon: 'CreditCard', orbShadow: 'rgba(11,179,255,.2)',
      footer: {
        badges: [
          { label: '8 received', className: 'border-[rgba(10,94,215,.3)] bg-[rgba(10,94,215,.1)] text-salis-blue' },
          { label: '3 pending', className: 'border-[rgba(249,115,22,.3)] bg-[rgba(249,115,22,.1)] text-salis-orange' },
        ],
      },
    },
    {
      icon: 'Scale', iconTint: 'rgba(11,31,59,.1)', iconColor: DARK,
      label: 'Collection Rate', value: '91%',
      footer: { text: 'Last 30 days' },
      ringProgress: 0.91, ringIcon: 'Scale',
    },
  ],
  pipeline: [
    { icon: 'FileText', label: 'Draft', count: 5, gradient: `linear-gradient(135deg,${SLATE},#94A3B8)` },
    { icon: 'Send', label: 'Sent', count: 23, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
    { icon: 'Clock', label: 'Overdue', count: 8, gradient: `linear-gradient(135deg,${ORANGE},#FB923C)` },
    { icon: 'CreditCard', label: 'Partial', count: 6, gradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)` },
    { icon: 'CheckCircle', label: 'Paid', count: 142, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
    { icon: 'Activity', label: 'Total', count: 184, gradient: `linear-gradient(135deg,${DARK},#1e3a5f)` },
  ],
  chart1: {
    icon: 'TrendingUp', title: 'Cash Flow Trend', color: BLUE,
    path: 'M20,160 C57,140 95,100 132,110 C169,90 207,80 244,70 C281,75 319,60 356,50 C393,55 431,40 468,35 C505,30 543,25 580,20',
    labels: MONTHS6,
  },
  chart2: {
    icon: 'BarChart3', title: 'Invoice Status', total: 184, totalLabel: 'invoices',
    conicGradient: `conic-gradient(${BLUE} 0% 77%,${BRIGHT} 77% 80.3%,${ORANGE} 80.3% 84.6%,${SLATE} 84.6% 100%)`,
    legend: [['Paid', 142, BLUE], ['Partial', 6, BRIGHT], ['Overdue', 8, ORANGE], ['Draft/Sent', 28, SLATE]],
  },
  table: {
    icon: 'FileText', title: 'Recent Invoices', viewAllRoute: '/invoices',
    totalLabel: '184', columns: ['Invoice #', 'Customer', 'Amount', 'Due Date', 'Status'],
    rows: [
      [c('INV-2024-0184', { mono: true }), c('Khalid Al-Amri'), c('SAR 4,200'), c('15 Sep 2024'), c('Sent', { badge: 'in_progress' })],
      [c('INV-2024-0183', { mono: true }), c('Fleet Corp Ltd'), c('SAR 12,800'), c('10 Sep 2024'), c('Overdue', { badge: 'overdue' })],
      [c('INV-2024-0182', { mono: true }), c('Ahmed Al-Rashid'), c('SAR 1,650'), c('12 Sep 2024'), c('Paid', { badge: 'completed' })],
      [c('INV-2024-0181', { mono: true }), c('Sara Al-Fahad'), c('SAR 3,100'), c('08 Sep 2024'), c('Paid', { badge: 'completed' })],
      [c('INV-2024-0180', { mono: true }), c('Omar Al-Qahtani'), c('SAR 7,450'), c('05 Sep 2024'), c('Partial', { badge: 'pending' })],
    ],
  },
}

/* ── HR Manager ─────────────────────────────────────────────────────── */
const HR: RoleConfig = {
  headerIcon: 'Users',
  headerTitle: 'HR Dashboard',
  greeting: 'Welcome,',
  actions: [
    { icon: 'UserPlus', label: 'Add Employee' },
    { icon: 'Calendar', label: 'Leave Calendar', variant: undefined },
  ],
  metrics: [
    {
      icon: 'Users', iconTint: 'rgba(10,94,215,.1)', iconColor: BLUE,
      label: 'Total Staff', value: '34',
      orbGradient: `linear-gradient(135deg,${BLUE},${BRIGHT})`, orbIcon: 'Users', orbShadow: 'rgba(10,94,215,.2)',
      footer: {
        badges: [
          { label: '30 active', className: 'border-[rgba(10,94,215,.3)] bg-[rgba(10,94,215,.1)] text-salis-blue' },
          { label: '4 on leave', className: 'border-[rgba(249,115,22,.3)] bg-[rgba(249,115,22,.1)] text-salis-orange' },
        ],
      },
    },
    {
      icon: 'CalendarCheck', iconTint: 'rgba(11,179,255,.1)', iconColor: BRIGHT,
      label: 'Attendance Today', value: '28',
      orbGradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)`, orbIcon: 'CalendarCheck', orbShadow: 'rgba(11,179,255,.2)',
      footer: { text: '2 late, 0 absent' },
    },
    {
      icon: 'Clock', iconTint: 'rgba(249,115,22,.1)', iconColor: ORANGE,
      label: 'Leave Requests', value: '5',
      orbGradient: `linear-gradient(135deg,${ORANGE},#FB923C)`, orbIcon: 'Clock', orbShadow: 'rgba(249,115,22,.2)',
      footer: { text: 'Pending approval', textClass: 'text-salis-orange' },
    },
    {
      icon: 'GraduationCap', iconTint: 'rgba(11,31,59,.1)', iconColor: DARK,
      label: 'Training Compliance', value: '88%',
      footer: { text: '30/34 certifications current' },
      ringProgress: 0.88, ringIcon: 'GraduationCap',
    },
  ],
  pipeline: [
    { icon: 'UserPlus', label: 'Open Roles', count: 3, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
    { icon: 'FileText', label: 'Applications', count: 14, gradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)` },
    { icon: 'Calendar', label: 'Interviews', count: 4, gradient: `linear-gradient(135deg,${ORANGE},#FB923C)` },
    { icon: 'UserCheck', label: 'Offers Sent', count: 2, gradient: `linear-gradient(135deg,${DARK},#1e3a5f)` },
    { icon: 'CheckCircle', label: 'Onboarding', count: 1, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
    { icon: 'Users', label: 'Active Staff', count: 30, gradient: `linear-gradient(135deg,${SLATE},#94A3B8)` },
  ],
  chart1: {
    icon: 'TrendingUp', title: 'Attendance This Week', color: BLUE,
    path: 'M20,60 C57,55 95,50 132,52 C169,48 207,45 244,50 C281,46 319,42 356,45 C393,40 431,38 468,42 C505,36 543,34 580,30',
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
  },
  chart2: {
    icon: 'BarChart3', title: 'Department Headcount', total: 34, totalLabel: 'staff',
    conicGradient: `conic-gradient(${BLUE} 0% 32%,${BRIGHT} 32% 56%,${ORANGE} 56% 74%,${DARK} 74% 88%,${SLATE} 88% 100%)`,
    legend: [['Workshop', 11, BLUE], ['Service Desk', 8, BRIGHT], ['Admin & Finance', 6, ORANGE], ['Parts & Procurement', 5, DARK], ['Management', 4, SLATE]],
  },
  table: {
    icon: 'Clock', title: 'Pending Leave Requests', viewAllRoute: '/leave-management',
    totalLabel: '5', columns: ['Employee', 'Department', 'Type', 'Dates', 'Status'],
    rows: [
      [c('Saeed Al-Zahrani'), c('Workshop'), c('Annual Leave'), c('15–22 Sep'), c('Pending', { badge: 'pending' })],
      [c('Noura Al-Qahtani'), c('Service Desk'), c('Sick Leave'), c('12–13 Sep'), c('Pending', { badge: 'pending' })],
      [c('Ali Al-Harbi'), c('Workshop'), c('Annual Leave'), c('20–27 Sep'), c('Pending', { badge: 'pending' })],
      [c('Hessa Al-Mutairi'), c('Finance'), c('Personal Leave'), c('18 Sep'), c('Pending', { badge: 'pending' })],
      [c('Turki Al-Anazi'), c('Call Center'), c('Annual Leave'), c('25 Sep–2 Oct'), c('Pending', { badge: 'pending' })],
    ],
  },
}

/* ── Receptionist / Front Desk ──────────────────────────────────────── */
const FRONTDESK: RoleConfig = {
  headerIcon: 'Bell',
  headerTitle: 'Reception Desk',
  greeting: 'Welcome,',
  actions: [
    { icon: 'UserPlus', label: 'Walk-in Check-in' },
    { icon: 'CalendarPlus', label: 'New Appointment', variant: undefined },
  ],
  metrics: [
    {
      icon: 'Calendar', iconTint: 'rgba(10,94,215,.1)', iconColor: BLUE,
      label: "Today's Appointments", value: '12',
      orbGradient: `linear-gradient(135deg,${BLUE},${BRIGHT})`, orbIcon: 'Calendar', orbShadow: 'rgba(10,94,215,.2)',
      footer: {
        badges: [
          { label: '5 arrived', className: 'border-[rgba(10,94,215,.3)] bg-[rgba(10,94,215,.1)] text-salis-blue' },
          { label: '7 upcoming', className: 'border-[rgba(11,179,255,.3)] bg-[rgba(11,179,255,.1)] text-salis-bright' },
        ],
      },
    },
    {
      icon: 'UserPlus', iconTint: 'rgba(11,179,255,.1)', iconColor: BRIGHT,
      label: 'Walk-ins Today', value: '4',
      orbGradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)`, orbIcon: 'UserPlus', orbShadow: 'rgba(11,179,255,.2)',
      footer: { text: '2 currently waiting' },
    },
    {
      icon: 'Clock', iconTint: 'rgba(249,115,22,.1)', iconColor: ORANGE,
      label: 'Avg Wait Time', value: '14 min',
      orbGradient: `linear-gradient(135deg,${ORANGE},#FB923C)`, orbIcon: 'Clock', orbShadow: 'rgba(249,115,22,.2)',
      footer: { text: '↓ 3 min from yesterday' },
    },
    {
      icon: 'Car', iconTint: 'rgba(11,31,59,.1)', iconColor: DARK,
      label: 'Ready for Pickup', value: '3',
      orbGradient: `linear-gradient(135deg,${DARK},#1e3a5f)`, orbIcon: 'Car', orbShadow: 'rgba(11,31,59,.2)',
      footer: { text: 'Customers notified' },
    },
  ],
  pipeline: [
    { icon: 'Calendar', label: 'Scheduled', count: 7, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
    { icon: 'UserPlus', label: 'Arrived', count: 5, gradient: `linear-gradient(135deg,${BRIGHT},#06B6D4)` },
    { icon: 'Clock', label: 'Waiting', count: 2, gradient: `linear-gradient(135deg,${ORANGE},#FB923C)` },
    { icon: 'Wrench', label: 'In Service', count: 9, gradient: `linear-gradient(135deg,${BLUE},${BRIGHT})` },
    { icon: 'Car', label: 'Ready', count: 3, gradient: `linear-gradient(135deg,${DARK},#1e3a5f)` },
    { icon: 'CheckCircle', label: 'Picked Up', count: 4, gradient: `linear-gradient(135deg,${SLATE},#94A3B8)` },
  ],
  chart1: {
    icon: 'TrendingUp', title: 'Check-ins This Week', color: BLUE,
    path: 'M20,150 C57,120 95,130 132,100 C169,110 207,80 244,90 C281,60 319,70 356,50 C393,55 431,40 468,45 C505,30 543,35 580,20',
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
  },
  chart2: {
    icon: 'BarChart3', title: 'Customer Flow', total: 30, totalLabel: 'customers',
    conicGradient: `conic-gradient(${BLUE} 0% 40%,${BRIGHT} 40% 57%,${ORANGE} 57% 70%,${DARK} 70% 83%,${SLATE} 83% 100%)`,
    legend: [['Appointment', 12, BLUE], ['Walk-in', 5, BRIGHT], ['Waiting', 4, ORANGE], ['In Service', 4, DARK], ['Completed', 5, SLATE]],
  },
  table: {
    icon: 'Users', title: "Today's Visitors", viewAllRoute: '/appointments',
    totalLabel: '16', columns: ['Time', 'Customer', 'Type', 'Vehicle', 'Status'],
    rows: [
      [c('07:45 AM'), c('Khalid Al-Amri'), c('Appointment'), c('Toyota Camry 2023'), c('In Service', { badge: 'in_progress' })],
      [c('08:10 AM'), c('Ahmed Al-Rashid'), c('Walk-in'), c('Hyundai Tucson 2024'), c('In Service', { badge: 'in_progress' })],
      [c('08:30 AM'), c('Sara Al-Fahad'), c('Appointment'), c('Nissan Patrol 2022'), c('Waiting', { badge: 'pending' })],
      [c('09:00 AM'), c('Omar Al-Qahtani'), c('Appointment'), c('Honda Accord 2023'), c('Checked In', { badge: 'in_progress' })],
      [c('09:15 AM'), c('Fatima Al-Otaibi'), c('Walk-in'), c('BMW X5 2024'), c('Waiting', { badge: 'pending' })],
    ],
  },
}

/* ── Role → Config map ──────────────────────────────────────────────── */

const ROLE_CONFIG: Partial<Record<RoleId, RoleConfig>> = {
  owner: OWNER,
  manager: MANAGER,
  advisor: ADVISOR,
  qc: QC,
  parts: PARTS_STORE,
  accountant: ACCOUNTANT,
  hr: HR,
  frontdesk: FRONTDESK,
}
