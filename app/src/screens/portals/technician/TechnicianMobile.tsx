import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { WORKSHOP_STAGES } from '@/components/ui/WorkflowStepper'
import { useCollection } from '@/data/useCollection'
import { railIndexFor, type JobRow } from '@/screens/workshop/stages'

type Job = JobRow

const ACTIVE_STAGES = new Set(['inspection', 'estimate', 'repair', 'qc'])

/** Technician mobile dashboard — `Technician-Mobile`, over the technician's
 *  own row-level-security-scoped job cards.
 *
 *  "Progress" is real, not invented: the job's own stage rail position over
 *  the six workshop stages, the same rail `TechnicianPortalJobDetail` shows
 *  as a checklist. The design's time-clock card and parts-queue count have no
 *  backing collection a technician can read yet (`server/src/db/schema.ts`'s
 *  `timesheets` is HR-module-gated, not technician-scoped) — shown as
 *  "Not connected" rather than a fabricated clock-in time. */
export function TechnicianMobile() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useCollection('jobs')
  const jobs = (data ?? []) as readonly JobRow[]

  const open = (job: Job) => navigate(`/technician-portal/job-detail?id=${encodeURIComponent(job.id)}`)
  const active = jobs.filter((j) => ACTIVE_STAGES.has(j.stage ?? ''))
  const progressOf = (job: Job) => {
    const reached = railIndexFor(job.stage)
    return Math.round(((reached + 1) / WORKSHOP_STAGES.length) * 100)
  }

  const quickStats = [
    { label: t('Active Jobs'), icon: 'Wrench', value: String(active.length) },
    { label: t('Assigned Jobs'), icon: 'Clipboard', value: String(jobs.length) },
    { label: t('Time Clock'), icon: 'Clock', value: t('Not connected') },
  ]

  const body = isError ? (
    <ErrorState title={t("Couldn't load this")} description={error?.message} onRetry={() => void refetch()} />
  ) : isLoading ? (
    <Loading label={t('Loading job cards...')} inline />
  ) : active.length === 0 ? (
    <EmptyState
      icon="Wrench"
      title={t('No active jobs')}
      description={t('Work in inspection, estimate, repair or QC shows up here.')}
    />
  ) : (
    active.map((j) => (
      <MobileCard key={j.id} onClick={() => open(j)}>
        <MobileCardHeader
          leading={
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Wrench" size={14} /></span>
              <div>
                <p className="text-[13px] font-semibold text-heading">{t((j.svc ?? '').replace(/_/g, ' '))}</p>
                <p className="text-xs text-muted">{j.veh}</p>
              </div>
            </div>
          }
          trailing={<StatusBadge value={j.st} label={t((j.st ?? '').replace(/_/g, ' '))} />}
        />
        <MobileCardRow label={t('Job Card')} value={j.id} />
        <MobileCardRow label={t('Progress')} value={`${progressOf(j)}%`} />
        <div className="px-4 pb-3">
          <div
            role="progressbar"
            aria-valuenow={progressOf(j)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('Progress')}
            className="h-2 w-full overflow-hidden rounded-full bg-tint-blue"
          >
            <div className="h-full rounded-full bg-salis-blue transition-all" style={{ width: `${progressOf(j)}%` }} />
          </div>
        </div>
      </MobileCard>
    ))
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Smartphone" title={t('Technician Mobile')} subtitle={t('Mobile dashboard')} />
        <div className="grid grid-cols-3 gap-3">
          {quickStats.map((a) => (
            <Card key={a.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name={a.icon} size={14} /></span>
              </div>
              <p className="mt-1.5 font-display text-lg font-black text-heading">{a.value}</p>
              <p className="text-[10px] font-medium text-muted">{a.label}</p>
            </Card>
          ))}
        </div>
        {body}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Smartphone" title={t('Technician Mobile')} subtitle={t('Mobile-first technician view')} />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {quickStats.map((a) => (
          <Card key={a.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name={a.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{a.label}</span>
            </div>
            <p className="mt-2 font-display text-2xl font-black text-heading">{a.value}</p>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Active Jobs')}</h2>
        <div className="grid gap-4">{body}</div>
      </Card>
    </div>
  )
}
