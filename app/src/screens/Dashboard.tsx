import { Link } from 'react-router-dom'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PriorityBadge, ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/shell/AppShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'

/** Role-adaptive KPI home. The reference implementation every other
 *  operational screen follows: PageHeader → metric row → pipeline strip →
 *  charts → table. */
export function Dashboard() {
  const { t, rtl } = usePreferences()
  const { userName } = useSession()
  const { data: jobs = [] } = useCollection('jobs')

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
          iconTint="rgba(10,94,215,.1)"
          iconColor="#0A5ED7"
          label={t('Total Revenue')}
          value="$128,450"
          orbGradient="linear-gradient(135deg,#0A5ED7,#0BB3FF)"
          orbIcon="TrendingUp"
          orbShadow="rgba(10,94,215,.2)"
          footer={
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-salis-blue">
                <Icon name="ArrowUpRight" size={14} />
                +12%
              </span>
              <Sparkline points="0,26 13,22 26,24 40,16 53,18 66,8 80,4" stroke="#0A5ED7" />
            </div>
          }
          progress={0.75}
        />

        <MetricCard
          icon="Wrench"
          iconTint="rgba(11,179,255,.1)"
          iconColor="#0BB3FF"
          label={t('Active Jobs')}
          value="14"
          orbGradient="linear-gradient(135deg,#0BB3FF,#06B6D4)"
          orbIcon="Gauge"
          orbShadow="rgba(11,179,255,.2)"
          footer={
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[rgba(249,115,22,.3)] bg-[rgba(249,115,22,.1)] px-2.5 py-0.5 text-xs font-medium text-salis-orange">
                {t('5 pending')}
              </span>
              <span className="rounded-full border border-[rgba(11,179,255,.3)] bg-[rgba(11,179,255,.1)] px-2.5 py-0.5 text-xs font-medium text-salis-bright">
                {t('9 active')}
              </span>
            </div>
          }
        />

        <MetricCard
          icon="Users"
          iconTint="rgba(11,31,59,.1)"
          iconColor="#0B1F3B"
          label={t('Customers')}
          value="248"
          orbGradient="linear-gradient(135deg,#0B1F3B,#1e3a5f)"
          orbIcon="Target"
          orbShadow="rgba(11,31,59,.2)"
          footer={
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-salis-blue">
                <Icon name="ArrowUpRight" size={14} />
                +8%
              </span>
              <Sparkline points="0,24 13,20 26,22 40,14 53,16 66,10 80,6" stroke="#0B1F3B" />
            </div>
          }
        />

        <MetricCard
          icon="Package"
          iconTint="rgba(249,115,22,.1)"
          iconColor="#F97316"
          label={t('Inventory')}
          value="86%"
          footer={<span className="text-xs text-salis-orange">{t('142/165 in stock')}</span>}
          orb={
            /* Stock level reads as a ring rather than a number-in-a-circle. */
            <div className="relative h-14 w-14 flex-shrink-0">
              <svg width="56" height="56" className="-rotate-90" aria-hidden>
                <circle cx="28" cy="28" r="24" stroke="rgba(249,115,22,.2)" strokeWidth="6" fill="none" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="#F97316"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray="129 150"
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
        {PIPELINE.map((stage) => (
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
          <CardHeader icon="TrendingUp" title={t('Revenue Trend')} className="mb-6" />
          <svg viewBox="0 0 600 260" className="block h-auto w-full" role="img" aria-label={t('Revenue Trend')}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0A5ED7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0A5ED7" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${REVENUE_PATH} L580,220 L20,220 Z`} fill="url(#revGrad)" />
            <path d={REVENUE_PATH} fill="none" stroke="#0A5ED7" strokeWidth="2.5" />
            {MONTHS.map((month, i) => (
              <text
                key={month}
                x={20 + i * 112}
                y="244"
                fontSize="11"
                fill="#64748B"
                textAnchor="middle"
                fontFamily="Inter,sans-serif"
              >
                {month}
              </text>
            ))}
          </svg>
        </Card>

        <Card className="p-6">
          <CardHeader icon="BarChart3" title={t('Job Status')} className="mb-6" />
          <div className="flex flex-wrap items-center gap-6">
            <div
              className="relative h-[180px] w-[180px] flex-shrink-0 rounded-full"
              style={{
                background:
                  'conic-gradient(#0A5ED7 0% 22.22%,#0BB3FF 22.22% 55.56%,#F97316 55.56% 74.07%,#0B1F3B 74.07% 88.89%,#64748B 88.89% 100%)',
              }}
            >
              <div className="absolute inset-9 flex flex-col items-center justify-center rounded-full bg-card">
                <span className="font-display text-[28px] font-black text-heading">27</span>
                <span className="text-[11px] text-muted">{t('jobs')}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {LEGEND.map(([label, count, color]) => (
                <div key={label} className="flex items-center gap-2 text-[13px]">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-[3px]"
                    style={{ background: color as string }}
                  />
                  <span className="min-w-[90px] text-body">{t(label as string)}</span>
                  <span className="font-mono text-xs text-muted">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Latest job cards ────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          icon="ClipboardList"
          title={t('Latest Job Cards')}
          className="px-6 pb-3 pt-5"
          action={
            <Link
              to="/job-cards"
              className="inline-flex h-8 items-center gap-1.5 rounded px-3 font-action text-[13px] font-medium text-salis-blue no-underline transition-colors duration-150 hover:bg-[rgba(10,94,215,.08)] hover:no-underline"
            >
              {t('View All')}
              <Icon name="ArrowUpRight" size={14} />
            </Link>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-ui text-sm text-heading">
            <thead>
              <tr>
                {['Job Card', 'Customer', 'Vehicle', 'Service', 'Priority', 'Status'].map((head) => (
                  <th
                    key={head}
                    scope="col"
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
                  {/* Job ids are Latin in an Arabic page — pinned LTR so the
                      bidi algorithm doesn't reorder the characters. */}
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
        <div className="flex items-center justify-between px-6 pb-5 pt-4">
          <span className="text-[13px] text-muted">{t('Showing 1–5 of 27')}</span>
          <div className="flex gap-1.5">
            <PageButton label="Previous page" icon={rtl ? 'ChevronRight' : 'ChevronLeft'} />
            <button
              type="button"
              aria-current="page"
              aria-label={t('Page 1')}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border-none bg-salis-gradient text-[13px] font-semibold text-white"
            >
              1
            </button>
            {[2, 3].map((page) => (
              <button
                key={page}
                type="button"
                aria-label={`${t('Page')} ${page}`}
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
    <Card className="p-6 transition-all duration-200 hover:border-[rgba(10,94,215,.3)] hover:shadow-lg">
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
          <div
            className="h-full rounded-full bg-salis-gradient-r"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      ) : null}
    </Card>
  )
}

function Sparkline({ points, stroke }: { points: string; stroke: string }) {
  return (
    <svg width="80" height="32" viewBox="0 0 80 32" aria-hidden>
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
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

const PIPELINE = [
  { icon: 'Clock', label: 'Check-In', count: 5, gradient: 'linear-gradient(135deg,#F97316,#FB923C)' },
  { icon: 'Wrench', label: 'In Repair', count: 9, gradient: 'linear-gradient(135deg,#0A5ED7,#0BB3FF)' },
  { icon: 'AlertCircle', label: 'QC', count: 6, gradient: 'linear-gradient(135deg,#0BB3FF,#06B6D4)' },
  { icon: 'CheckCircle', label: 'Done', count: 6, gradient: 'linear-gradient(135deg,#0A5ED7,#0BB3FF)' },
  { icon: 'Car', label: 'Delivered', count: 4, gradient: 'linear-gradient(135deg,#0B1F3B,#1e3a5f)' },
  { icon: 'Activity', label: 'Total', count: 27, gradient: 'linear-gradient(135deg,#64748B,#94A3B8)' },
] as const

const LEGEND = [
  ['Completed', 6, '#0A5ED7'],
  ['In Progress', 9, '#0BB3FF'],
  ['Pending', 5, '#F97316'],
  ['Delivered', 4, '#0B1F3B'],
  ['Cancelled', 3, '#64748B'],
] as const

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] as const

const REVENUE_PATH =
  'M20,121 C57,112 95,94 132,94 C169,94 207,106 244,106 C281,106 319,81 356,69 C393,57 431,55 468,49 C505,43 543,29 580,22'
