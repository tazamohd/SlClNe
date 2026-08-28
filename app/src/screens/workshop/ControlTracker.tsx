import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge'
import {
  FeatureHeader,
  StatRow,
  TabBar,
  Section,
  type Stat,
} from '@/components/shell/FeatureScreen'
import { ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { cn } from '@/lib/cn'

const PIPELINE_STAGES = [
  { id: 'check_in', label: 'Check-In', icon: 'ClipboardList' },
  { id: 'inspection', label: 'Inspection', icon: 'SearchCheck' },
  { id: 'estimate', label: 'Estimate', icon: 'FileText' },
  { id: 'in_progress', label: 'Repair', icon: 'Wrench' },
  { id: 'qc', label: 'Quality Check', icon: 'ShieldCheck' },
  { id: 'delivery', label: 'Delivery', icon: 'Car' },
] as const

const STAGE_FOR_STATUS: Record<string, string> = {
  pending: 'check_in',
  in_progress: 'in_progress',
  completed: 'qc',
  delivered: 'delivery',
}

const TABS = [
  { id: 'pipeline', label: 'Job Pipeline', icon: 'GitBranch' },
  { id: 'bays', label: 'Bay Map', icon: 'LayoutGrid' },
  { id: 'team', label: 'Technicians', icon: 'Users' },
  { id: 'parts', label: 'Parts Status', icon: 'Package' },
] as const

const BAY_DATA = [
  { id: 'Bay 1', vehicle: 'Toyota Camry 2022', plate: 'RUH 4821', tech: 'Saeed Al-Zahrani', job: 'A3F8B2C1', status: 'active' as const, stage: 'Repair', elapsed: '2h 15m' },
  { id: 'Bay 2', vehicle: 'Ford F-150 2020', plate: 'DMM 2245', tech: 'Yousef Al-Ghamdi', job: 'E5D7A3B5', status: 'active' as const, stage: 'Inspection', elapsed: '45m' },
  { id: 'Bay 3', vehicle: 'Nissan Patrol 2021', plate: 'JED 9012', tech: 'Majed Al-Otaibi', job: 'B7E4D9A2', status: 'waiting' as const, stage: 'Awaiting Parts', elapsed: '1h 30m' },
  { id: 'Bay 4', vehicle: null, plate: null, tech: null, job: null, status: 'available' as const, stage: null, elapsed: null },
  { id: 'Bay 5', vehicle: 'Lexus ES 350 2020', plate: 'RUH 7724', tech: 'Faisal Al-Harbi', job: 'D8C1B6F4', status: 'active' as const, stage: 'QC', elapsed: '3h 40m' },
  { id: 'Bay 6', vehicle: null, plate: null, tech: null, job: null, status: 'maintenance' as const, stage: 'Lift Service', elapsed: null },
]

const APPROVAL_QUEUE = [
  { id: 'EST-0230', customer: 'Mohammed Hassan', vehicle: 'Lexus ES 350 2020', amount: 'SAR 3,600', sent: '2h ago', priority: 'high' },
  { id: 'EST-0231', customer: 'Ahmed Al-Rashid', vehicle: 'Toyota Camry 2022', amount: 'SAR 1,250', sent: '45m ago', priority: 'medium' },
]

export function ControlTracker() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const [tab, setTab] = useState('pipeline')

  const { data: jobs = [], isLoading: jL, isError: jE, error: jErr, refetch: jR } = useCollection('jobs')
  const { data: technicians = [], isLoading: tL } = useCollection('technicians')
  const { data: parts = [], isLoading: pL } = useCollection('parts')
  const { data: appointments = [], isLoading: aL } = useCollection('appointments')

  const activeJobs = jobs.filter((j) => j.st !== 'delivered' && j.st !== 'completed')
  const occupiedBays = BAY_DATA.filter((b) => b.status === 'active' || b.status === 'waiting').length
  const lowStockParts = parts.filter((p) => p.stock <= p.reorder)

  const stats: Stat[] = [
    { label: 'Active Jobs', value: activeJobs.length + 1, highlight: true, icon: 'Wrench' },
    { label: 'Bay Utilization', value: `${occupiedBays}/${BAY_DATA.length}`, icon: 'LayoutGrid', tone: occupiedBays >= 5 ? 'warning' : 'info', caption: occupiedBays >= 5 ? 'Near capacity' : 'Bays available' },
    { label: 'Technicians On-Floor', value: `${technicians.length}/${technicians.length + 1}`, icon: 'Users', tone: 'info', caption: `${technicians.reduce((s, tech) => s + tech.jobs, 0)} jobs assigned` },
    { label: 'Pending Approvals', value: APPROVAL_QUEUE.length, icon: 'Clock', tone: 'warning', caption: 'Awaiting customer sign-off' },
  ]

  const pipelineCounts = useMemo(() => {
    const counts: Record<string, { id: string; cust: string; veh: string; svc: string; st: string; pr: string }[]> = {}
    for (const stage of PIPELINE_STAGES) counts[stage.id] = []
    for (const job of jobs) {
      const stageId = STAGE_FOR_STATUS[job.st]
      if (stageId && counts[stageId]) counts[stageId].push({ ...job })
    }
    return counts
  }, [jobs])

  if (jL || tL || pL || aL) return <Loading label={t('Loading workshop...')} />
  if (jE) return <ErrorState description={jErr?.message} onRetry={() => void jR()} />

  return (
    <div className="flex flex-col gap-6">
      <FeatureHeader
        icon="Gauge"
        title={t('Control System Tracker')}
        subtitle={t('Live operations control center — jobs, bays, team & parts at a glance')}
        actions={
          <div className="flex gap-2.5">
            <Button variant="outline" size="md" onClick={() => navigate('/job-cards')}>
              <Icon name="List" size={16} />
              {t('Job Cards')}
            </Button>
            <Button size="md" onClick={() => navigate('/workshop-check-in')}>
              <Icon name="Plus" size={16} />
              {t('New Job')}
            </Button>
          </div>
        }
      />

      <StatRow stats={stats} />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'pipeline' && <PipelineView counts={pipelineCounts} navigate={navigate} />}
      {tab === 'bays' && <BayMapView />}
      {tab === 'team' && <TeamView technicians={technicians} appointments={appointments} />}
      {tab === 'parts' && <PartsView parts={parts} lowStock={lowStockParts} />}

      <Section title={t('Pending Customer Approvals')} subtitle={t('Estimates awaiting customer sign-off')}>
        <div className="flex flex-col gap-2">
          {APPROVAL_QUEUE.map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              className="flex cursor-pointer items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:border-salis-blue/30 hover:bg-[rgba(10,94,215,.03)]"
              onClick={() => navigate('/customer-approval')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/customer-approval') }}
            >
              <span className="font-mono text-[13px] font-semibold text-salis-blue">{item.id}</span>
              <span className="flex-1 text-[13px] text-body">{item.customer} — {item.vehicle}</span>
              <span className="font-mono text-[13px] font-semibold text-heading">{item.amount}</span>
              <PriorityBadge value={item.priority} label={t(item.priority)} />
              <span className="text-[11px] text-muted">{item.sent}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function PipelineView({
  counts,
  navigate,
}: {
  counts: Record<string, Array<{ id: string; cust: string; veh: string; svc: string; pr: string; st: string }>>
  navigate: ReturnType<typeof useNavigate>
}) {
  const { t } = usePreferences()

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {PIPELINE_STAGES.map((stage) => {
          const stageJobs = counts[stage.id] ?? []
          return (
            <Card key={stage.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-salis-gradient p-1.5 text-white">
                    <Icon name={stage.icon} size={14} />
                  </span>
                  <span className="font-action text-[13px] font-semibold text-heading">
                    {t(stage.label)}
                  </span>
                </div>
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-tint-blue px-1.5 font-mono text-[11px] font-bold text-salis-blue">
                  {stageJobs.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {stageJobs.length === 0 ? (
                  <p className="py-3 text-center text-[11px] text-muted">{t('No jobs')}</p>
                ) : (
                  stageJobs.map((job) => (
                    <div
                      key={job.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer rounded-lg border border-border bg-inset p-2.5 transition-colors hover:border-salis-blue/30"
                      onClick={() => navigate(`/job-detail?id=${job.id}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/job-detail?id=${job.id}`) }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-semibold text-salis-blue">{job.id.slice(0, 8)}</span>
                        <PriorityBadge value={job.pr} label={t(job.pr)} />
                      </div>
                      <p className="mt-1 text-[12px] text-body">{job.cust}</p>
                      <p className="text-[11px] text-muted">{job.veh}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="overflow-hidden p-4">
        <div className="flex items-center gap-2 pb-3">
          <Icon name="GitBranch" size={16} className="text-salis-blue" />
          <span className="font-action text-[13px] font-semibold text-heading">{t('Pipeline Flow')}</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {PIPELINE_STAGES.map((stage, i) => {
            const count = (counts[stage.id] ?? []).length
            return (
              <div key={stage.id} className="flex items-center">
                <div className={cn(
                  'flex flex-col items-center gap-1 rounded-lg px-4 py-3 text-center',
                  count > 0 ? 'bg-[rgba(10,94,215,.06)]' : 'bg-transparent'
                )}>
                  <span className={cn(
                    'flex rounded-lg p-2',
                    count > 0 ? 'bg-salis-gradient text-white shadow-[0_4px_12px_rgba(10,94,215,.25)]' : 'bg-border text-muted'
                  )}>
                    <Icon name={stage.icon} size={18} />
                  </span>
                  <span className="whitespace-nowrap text-[11px] font-semibold text-heading">{t(stage.label)}</span>
                  <span className={cn(
                    'font-mono text-[13px] font-bold',
                    count > 0 ? 'text-salis-blue' : 'text-muted'
                  )}>
                    {count}
                  </span>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <Icon name="ChevronRight" size={16} className="mx-1 flex-shrink-0 text-muted" />
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function BayMapView() {
  const { t } = usePreferences()
  const navigate = useNavigate()

  const bayColor = {
    active: { bg: 'bg-[rgba(10,94,215,.06)]', border: 'border-salis-blue/30', dot: 'bg-salis-blue' },
    waiting: { bg: 'bg-[rgba(249,115,22,.06)]', border: 'border-salis-orange/30', dot: 'bg-salis-orange' },
    available: { bg: 'bg-card', border: 'border-border', dot: 'bg-muted' },
    maintenance: { bg: 'bg-[rgba(100,116,139,.06)]', border: 'border-muted/30', dot: 'bg-muted' },
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        {(['active', 'waiting', 'available', 'maintenance'] as const).map((s) => (
          <div key={s} className="flex items-center gap-2 text-[12px] text-muted">
            <span className={cn('h-2.5 w-2.5 rounded-full', bayColor[s].dot)} />
            {t(s.charAt(0).toUpperCase() + s.slice(1))}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {BAY_DATA.map((bay) => {
          const colors = bayColor[bay.status]
          return (
            <Card
              key={bay.id}
              className={cn(
                'flex flex-col gap-3 p-4 transition-colors',
                colors.bg,
                colors.border,
                bay.job && 'cursor-pointer hover:shadow-md'
              )}
              onClick={bay.job ? () => navigate(`/job-detail?id=${bay.job}`) : undefined}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg font-display text-sm font-black', bay.status === 'active' ? 'bg-salis-gradient text-white shadow-[0_4px_12px_rgba(10,94,215,.25)]' : bay.status === 'waiting' ? 'bg-salis-orange text-white' : 'bg-border text-muted')}>
                    {bay.id.replace('Bay ', '')}
                  </span>
                  <div>
                    <p className="font-action text-[13px] font-semibold text-heading">{bay.id}</p>
                    <p className="text-[11px] text-muted">
                      {bay.status === 'available' ? t('Available') : bay.status === 'maintenance' ? t('Under Maintenance') : bay.stage}
                    </p>
                  </div>
                </div>
                <span className={cn('h-2.5 w-2.5 rounded-full', colors.dot)} />
              </div>

              {bay.vehicle && (
                <div className="flex flex-col gap-1 border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-body">{bay.vehicle}</span>
                    <span className="font-mono text-[11px] text-muted" dir="ltr">{bay.plate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted">
                      <Icon name="User" size={12} className="mr-1 inline" />
                      {bay.tech}
                    </span>
                    {bay.elapsed && (
                      <span className={cn('font-mono text-[11px] font-semibold', bay.elapsed.includes('h') && parseInt(bay.elapsed) >= 3 ? 'text-salis-orange' : 'text-muted')}>
                        {bay.elapsed}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {bay.status === 'maintenance' && bay.stage && (
                <div className="flex items-center gap-2 border-t border-border pt-3 text-[12px] text-muted">
                  <Icon name="AlertTriangle" size={14} className="text-salis-orange" />
                  {t(bay.stage)}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function TeamView({
  technicians,
  appointments,
}: {
  technicians: readonly { name: string; specialty: string; jobs: number; rating: string }[]
  appointments: readonly { tech: string; bay: string; svc: string; cust: string; status: string; mins: number }[]
}) {
  const { t } = usePreferences()

  const techAppointments = useMemo(() => {
    const map: Record<string, typeof appointments[number][]> = {}
    for (const appt of appointments) {
      if (!map[appt.tech]) map[appt.tech] = []
      map[appt.tech].push(appt)
    }
    return map
  }, [appointments])

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {technicians.map((tech) => {
        const appts = techAppointments[tech.name] ?? []
        const utilization = Math.min(100, Math.round((tech.jobs / 6) * 100))

        return (
          <Card key={tech.name} className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={tech.name} size={40} />
              <div className="flex-1">
                <p className="font-action text-[13px] font-semibold text-heading">{tech.name}</p>
                <p className="text-[11px] text-muted">{tech.specialty}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[13px] font-bold text-heading">{tech.jobs}</p>
                <p className="text-[11px] text-muted">{t('active jobs')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] text-muted">{t('Workload')}</span>
                  <span className={cn('font-mono text-[11px] font-semibold', utilization >= 80 ? 'text-salis-orange' : 'text-salis-blue')}>
                    {utilization}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className={cn('h-full rounded-full transition-all', utilization >= 80 ? 'bg-salis-orange' : 'bg-salis-gradient')}
                    style={{ width: `${utilization}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted">
                <Icon name="Star" size={12} className="text-salis-orange" />
                {tech.rating}
              </div>
            </div>

            {appts.length > 0 && (
              <div className="flex flex-col gap-1.5 border-t border-border pt-3">
                {appts.slice(0, 3).map((appt, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <StatusBadge value={appt.status} label={t(appt.status)} />
                    <span className="flex-1 text-body">{appt.cust}</span>
                    <span className="text-muted">{appt.bay}</span>
                    <span className="font-mono text-muted">{appt.mins}m</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function PartsView({
  parts,
  lowStock,
}: {
  parts: readonly { name: string; sku: string; stock: number; reorder: number; price: string }[]
  lowStock: readonly { name: string; sku: string; stock: number; reorder: number; price: string }[]
}) {
  const { t } = usePreferences()

  return (
    <div className="flex flex-col gap-4">
      {lowStock.length > 0 && (
        <Card className="flex items-start gap-3 border-salis-orange/40 p-4">
          <span className="flex flex-shrink-0 rounded bg-[rgba(249,115,22,.12)] p-2 text-salis-orange">
            <Icon name="AlertTriangle" size={18} />
          </span>
          <div>
            <p className="font-action text-sm font-semibold text-heading">
              {lowStock.length} {t('parts below reorder level')}
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              {lowStock.map((p) => p.name).join(', ')}
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {parts.map((part) => {
          const low = part.stock <= part.reorder
          const pct = Math.min(100, Math.round((part.stock / (part.reorder * 4)) * 100))

          return (
            <Card key={part.sku} className={cn('flex flex-col gap-3 p-4', low && 'border-salis-orange/30')}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-action text-[13px] font-semibold text-heading">{part.name}</p>
                  <p className="font-mono text-[11px] text-muted">{part.sku}</p>
                </div>
                {low && (
                  <span className="flex rounded bg-[rgba(249,115,22,.12)] p-1 text-salis-orange">
                    <Icon name="AlertTriangle" size={14} />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] text-muted">{t('Stock Level')}</span>
                  <span className={cn('font-mono text-[13px] font-bold', low ? 'text-salis-orange' : 'text-heading')}>
                    {part.stock}
                    <span className="text-[11px] font-normal text-muted"> / {part.reorder * 4}</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className={cn('h-full rounded-full transition-all', low ? 'bg-salis-orange' : 'bg-salis-gradient')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                  <span>{t('Reorder at')} {part.reorder}</span>
                  <span>{part.price}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
