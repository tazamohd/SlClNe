import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Home as HomeIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/Badge'
import { Checklist, countChecked, type ChecklistItem } from '@/components/ui/Checklist'
import { EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'

/** Standalone technician mobile app — TechnicianPortal.dc.html /
 *  .JobDetail.dc.html. A technician on the shop floor uses this as a
 *  phone-width app, so it renders its own gradient header and bottom tab bar
 *  rather than `AppShell`/`RequireAccess` — there is no desktop layout to
 *  fall back to. `Frame` below is the 430px shell shared by both routes. */

const TECH_NAME = 'Yousef Al-Otaibi'
const TECH_ROLE = 'Technician — Engine & Diagnostics'

const CURRENT_CHECKLIST: readonly ChecklistItem[] = [
  { label: 'Diagnostics — Complete' },
  { label: 'Oil Change' },
  { label: 'Brake Pads (Front) — Replace' },
  { label: 'Multi-Point Inspection' },
]
const CURRENT_CHECKLIST_INITIAL: Readonly<Record<string, boolean>> = {
  'Diagnostics — Complete': true,
  'Oil Change': true,
}

const TASK_CHECKLIST: readonly ChecklistItem[] = [
  { label: 'Diagnostics scan' },
  { label: 'Drain old oil' },
  { label: 'Replace oil filter' },
  { label: 'Refill engine oil' },
  { label: 'Replace brake pads' },
]
const TASK_CHECKLIST_INITIAL: Readonly<Record<string, boolean>> = {
  'Diagnostics scan': true,
  'Drain old oil': true,
}

const PARTS_USED: readonly { name: string; sku: string; qty: number }[] = [
  { name: 'Oil Filter (Toyota)', sku: 'OF-TY-118', qty: 1 },
  { name: 'Brake Pads (Front)', sku: 'BP-FR-220', qty: 1 },
  { name: '5W-30 Engine Oil 4L', sku: 'OL-5W30-4', qty: 1 },
]

const SVC_ICON: Record<string, string> = {
  maintenance: 'Wrench',
  repair: 'Cog',
  diagnostic: 'SearchCheck',
  inspection: 'ClipboardCheck',
  tire_service: 'CircleDot',
}

/** 430px phone frame both routes render inside. */
function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-page font-ui">
      {children}
    </div>
  )
}

/** Bottom tab bar. Only "Jobs" links anywhere — the other three tabs have no
 *  screen yet, so they render inert rather than dead-ending the nav. */
function BottomNav({ active }: { active: 'home' | 'jobs' }) {
  const { t } = usePreferences()
  const rest: readonly { icon: string; label: string }[] = [
    { icon: 'Clock', label: 'Time' },
    { icon: 'Package', label: 'Parts' },
    { icon: 'User', label: 'Profile' },
  ]

  return (
    <div className="flex flex-shrink-0 border-t border-border bg-sidebar py-2">
      <Link
        to="/technician-portal"
        aria-current={active === 'home' ? 'page' : undefined}
        className={cn(
          'flex flex-1 flex-col items-center gap-0.5 no-underline hover:no-underline',
          active === 'home' ? 'text-salis-blue' : 'text-muted'
        )}
      >
        <HomeIcon size={18} />
        <span className="text-[11px] font-semibold">{t('Home')}</span>
      </Link>
      <Link
        to="/technician-portal/job-detail"
        aria-current={active === 'jobs' ? 'page' : undefined}
        className={cn(
          'flex flex-1 flex-col items-center gap-0.5 no-underline hover:no-underline',
          active === 'jobs' ? 'text-salis-blue' : 'text-muted'
        )}
      >
        <Icon name="Wrench" size={18} />
        <span className="text-[11px] font-semibold">{t('Jobs')}</span>
      </Link>
      {rest.map((item) => (
        <span key={item.label} aria-disabled className="flex flex-1 flex-col items-center gap-0.5 text-muted opacity-70">
          <Icon name={item.icon} size={18} />
          <span className="text-[11px] font-semibold">{t(item.label)}</span>
        </span>
      ))}
    </div>
  )
}

// ── /technician-portal — today's queue ──────────────────────────────────────
export function TechnicianPortal() {
  const { t, theme, toggleTheme } = usePreferences()
  const navigate = useNavigate()
  const { data: jobs = [] } = useCollection('jobs')
  const [checked, setChecked] = useState<Record<string, boolean>>(CURRENT_CHECKLIST_INITIAL)

  const currentJob = useMemo(() => jobs.find((job) => job.st === 'in_progress') ?? jobs[0], [jobs])
  const queue = useMemo(
    () => jobs.filter((job) => job.id !== currentJob?.id).slice(0, 2),
    [jobs, currentJob]
  )

  const assigned = jobs.length
  const inProgress = jobs.filter((job) => job.st === 'in_progress').length
  const completed = jobs.filter((job) => job.st === 'completed' || job.st === 'delivered').length
  const doneCount = countChecked(CURRENT_CHECKLIST, checked)
  const progressPct = Math.round((doneCount / CURRENT_CHECKLIST.length) * 100)

  const stats: readonly { value: string; label: string }[] = [
    { value: String(assigned), label: 'Assigned' },
    { value: String(inProgress), label: 'In Progress' },
    { value: String(completed), label: 'Completed' },
    { value: '6.5h', label: 'Logged' },
  ]

  return (
    <Frame>
      <div className="flex flex-shrink-0 flex-col gap-3 rounded-b-[20px] bg-salis-gradient p-3.5 text-white">
        <div className="flex items-center gap-2.5">
          <span className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-base font-extrabold backdrop-blur">
            {TECH_NAME[0]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-[15px] font-bold">
              {t('Welcome,')} {TECH_NAME.split(' ')[0]}
            </p>
            <p className="mt-0.5 truncate text-xs opacity-80">{t(TECH_ROLE)}</p>
          </div>
          <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {t('On Shift')}
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('Toggle theme')}
            className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-white/15 text-white"
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
          </button>
        </div>
        <div className="flex gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="flex-1 rounded-[10px] bg-white/10 p-2.5 text-center backdrop-blur">
              <p className="m-0 text-xl font-black" dir="ltr">
                {stat.value}
              </p>
              <p className="m-0 text-[10px] opacity-80">{t(stat.label)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4">
        {currentJob ? (
          <Card className="flex flex-col gap-3 border-[1.5px] border-salis-blue p-4 shadow-[0_4px_16px_rgba(10,94,215,.1)]">
            <div className="flex items-center gap-2">
              <span className="flex flex-shrink-0 rounded-lg bg-salis-gradient p-1.5 text-white">
                <Icon name="Wrench" size={14} />
              </span>
              <Link
                to={`/technician-portal/job-detail?id=${currentJob.id}`}
                className="min-w-0 flex-1 no-underline hover:no-underline"
              >
                <p className="m-0 text-sm font-bold text-heading">{t('Current Job')}</p>
                <p className="mt-0.5 text-[11px] text-muted" dir="ltr">
                  {currentJob.id} · 10:00 AM
                </p>
              </Link>
              <StatusBadge value={currentJob.st} label={t(currentJob.st.replace(/_/g, ' '))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-muted">{t('Customer')}</span>
                <p className="mt-0.5 truncate text-[13px] font-semibold text-heading">{currentJob.cust}</p>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted">{t('Vehicle')}</span>
                <p className="mt-0.5 truncate text-[13px] text-body">{currentJob.veh}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted">{t('Progress')}</span>
                <span className="font-mono font-bold text-salis-blue" dir="ltr">
                  {progressPct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-inset">
                <div
                  className="h-full rounded-full bg-salis-gradient transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <Checklist
              items={CURRENT_CHECKLIST}
              checked={checked}
              onToggle={(label) => setChecked((prev) => ({ ...prev, [label]: !prev[label] }))}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="md" className="flex-1">
                <Icon name="Camera" size={15} />
                {t('Photo')}
              </Button>
              <Button
                size="md"
                className="flex-1"
                onClick={() => navigate(`/technician-portal/job-detail?id=${currentJob.id}`)}
              >
                <CheckCircle size={15} />
                {t('Mark Complete')}
              </Button>
            </div>
          </Card>
        ) : (
          <EmptyState
            icon="ClipboardList"
            title={t('No jobs assigned')}
            description={t('New job cards will appear here once assigned.')}
          />
        )}

        {queue.length ? (
          <>
            <h3 className="m-0 text-[13px] font-bold text-heading">{t('Up Next')}</h3>
            {queue.map((job) => (
              <div key={job.id} className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3.5">
                <span className="flex flex-shrink-0 rounded-lg bg-[rgba(11,179,255,.1)] p-1.5 text-[#0BB3FF]">
                  <Icon name={SVC_ICON[job.svc] ?? 'Wrench'} size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-[13px] font-semibold text-heading">{job.cust}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted">
                    {job.veh} · {t(job.svc.replace(/_/g, ' '))}
                  </p>
                </div>
                <span className="flex-shrink-0 font-mono text-[11px] font-semibold text-heading" dir="ltr">
                  {job.id}
                </span>
              </div>
            ))}
          </>
        ) : null}

        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3.5">
          <span className="flex flex-shrink-0 rounded-[10px] bg-[rgba(249,115,22,.1)] p-2 text-salis-orange">
            <Icon name="Package" size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[13px] font-semibold text-heading">{t('Parts Request')}</p>
            <p className="mt-0.5 text-[11px] text-muted">{t('Pending parts requests')}</p>
          </div>
          <span className="flex-shrink-0 rounded-full bg-[rgba(249,115,22,.1)] px-2.5 py-0.5 text-[10px] font-semibold text-salis-orange">
            2
          </span>
        </div>
      </div>

      <BottomNav active="home" />
    </Frame>
  )
}

// ── /technician-portal/job-detail — single job workspace ────────────────────
export function TechnicianPortalJobDetail() {
  const { t, rtl } = usePreferences()
  const [params] = useSearchParams()
  const { data: jobs = [], isLoading } = useCollection('jobs')
  const [checked, setChecked] = useState<Record<string, boolean>>(TASK_CHECKLIST_INITIAL)
  const [secs, setSecs] = useState(4680)

  useEffect(() => {
    const iv = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  const jobId = params.get('id')
  const fallback = useMemo(() => jobs.find((row) => row.st === 'in_progress') ?? jobs[0], [jobs])
  const job = jobId ? jobs.find((row) => row.id === jobId) : fallback

  if (isLoading) {
    return (
      <Frame>
        <p className="p-4 text-sm text-muted">{t('Loading...')}</p>
      </Frame>
    )
  }

  if (!job) {
    return (
      <Frame>
        <Card className="m-4 p-6">
          <EmptyState
            icon="FileQuestion"
            title={t('Job card not found')}
            description={t('It may have been deleted, or the link is out of date.')}
            action={
              <Link to="/technician-portal" className="font-action text-[13px] font-medium">
                {t('Back to Technician Portal')}
              </Link>
            }
          />
        </Card>
      </Frame>
    )
  }

  const doneCount = countChecked(TASK_CHECKLIST, checked)
  const pct = Math.round((doneCount / TASK_CHECKLIST.length) * 100)
  const hh = Math.floor(secs / 3600)
  const mm = Math.floor((secs % 3600) / 60)
  const ss = secs % 60
  const elapsed = `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`

  return (
    <Frame>
      <div className="flex flex-shrink-0 items-center gap-2.5 border-b border-border bg-sidebar p-3.5">
        <Link
          to="/technician-portal"
          aria-label={t('Back to Technician Portal')}
          className="flex flex-shrink-0 text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ChevronRight' : 'ChevronLeft'} size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 truncate font-display text-[17px] font-extrabold text-heading">
            {t('Job Detail')}
          </h1>
          <p className="m-0 text-[11px] text-muted" dir="ltr">
            {job.id}
          </p>
        </div>
        <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />
      </div>

      <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto p-4">
        <Card className="flex items-center gap-3 p-3.5">
          <span className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[15px] font-bold text-white">
            {job.cust[0]}
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate text-sm font-bold text-heading">{job.cust}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{job.veh}</p>
          </div>
        </Card>

        <Card className="flex flex-col gap-2.5 border-[1.5px] border-salis-blue p-4">
          <div className="flex items-center gap-1.5">
            <Icon name="Clock" size={14} className="text-salis-blue" />
            <h3 className="m-0 text-[13px] font-bold text-heading">{t('Time Tracking')}</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center">
              <span
                className="bg-salis-gradient-r bg-clip-text font-mono text-[28px] font-black text-transparent"
                dir="ltr"
              >
                {elapsed}
              </span>
              <p className="mt-0.5 text-[10px] text-muted">{t('Elapsed')}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between gap-4 text-[11px]">
                <span className="text-muted">{t('Started')}</span>
                <span className="font-mono text-body" dir="ltr">
                  10:00 AM
                </span>
              </div>
              <div className="flex justify-between gap-4 text-[11px]">
                <span className="text-muted">{t('Est.')}</span>
                <span className="font-mono text-body" dir="ltr">
                  2.5h
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1 border-salis-orange text-salis-orange hover:bg-[rgba(249,115,22,.08)]"
            >
              <Icon name="Pause" size={14} />
              {t('Pause')}
            </Button>
            <Button size="md" className="flex-1">
              <CheckCircle size={14} />
              {t('Complete')}
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col gap-2.5 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Icon name="ClipboardCheck" size={14} className="text-salis-blue" />
              <h3 className="m-0 text-[13px] font-bold text-heading">{t('Tasks')}</h3>
            </div>
            <span className="font-mono text-[11px] text-muted">
              {doneCount}/{TASK_CHECKLIST.length}
            </span>
          </div>
          <div className="h-1 rounded-full bg-inset">
            <div
              className="h-full rounded-full bg-salis-gradient transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <Checklist
            items={TASK_CHECKLIST}
            checked={checked}
            onToggle={(label) => setChecked((prev) => ({ ...prev, [label]: !prev[label] }))}
          />
        </Card>

        <Card className="flex flex-col gap-2.5 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Icon name="Package" size={14} className="text-salis-blue" />
              <h3 className="m-0 text-[13px] font-bold text-heading">{t('Parts Used')}</h3>
            </div>
            <Button variant="outline" size="sm" className="h-[26px] px-2.5 text-[10px]">
              <Icon name="Plus" size={10} />
              {t('Add')}
            </Button>
          </div>
          {PARTS_USED.map((part) => (
            <div
              key={part.sku}
              className="flex items-center gap-2 border-b border-border py-1.5 text-[12px] last:border-b-0"
            >
              <span className="min-w-0 flex-1 truncate text-body">{t(part.name)}</span>
              <span className="flex-shrink-0 text-[10px] text-muted" dir="ltr">
                {part.sku}
              </span>
              <span className="flex-shrink-0 font-mono text-[11px] font-semibold text-heading" dir="ltr">
                ×{part.qty}
              </span>
            </div>
          ))}
        </Card>

        <Card className="flex flex-col gap-2.5 p-3.5">
          <div className="flex items-center gap-1.5">
            <Icon name="Camera" size={14} className="text-salis-blue" />
            <h3 className="m-0 text-[13px] font-bold text-heading">{t('Photos')}</h3>
          </div>
          <div className="flex gap-2">
            <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-[10px] border border-border bg-inset">
              <Icon name="Image" size={20} className="text-muted" />
            </div>
            <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-[10px] border border-border bg-inset">
              <Icon name="Image" size={20} className="text-muted" />
            </div>
            <button
              type="button"
              className="flex h-[72px] w-[72px] flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[10px] border-[1.5px] border-dashed border-border-strong bg-transparent text-muted"
            >
              <Icon name="Plus" size={16} />
              <span className="text-[9px]">{t('Add')}</span>
            </button>
          </div>
        </Card>
      </div>
    </Frame>
  )
}
