import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection } from '@/data/useCollection'
import { railIndexFor, type JobRow } from '@/screens/workshop/stages'
import { WORKSHOP_STAGES } from '@/components/ui/WorkflowStepper'
import { isDone } from '../portal-data'

const STEPS = ['Check-In', 'Inspection', 'Estimate', 'Repair', 'QC', 'Pickup'] as const

/* This screen was MOCK_ONLY (BLK-004): both "in progress" jobs (a fictional
 * Honda Accord brake service at 60%, a fictional Camry tune-up at 25%) were
 * hardcoded fixtures.
 *
 * Reads the real `jobs` collection CustomerPortal.tsx's own `ActiveServiceCard`
 * already reads for the same concept — a job's real position on the six-step
 * stage rail via `railIndexFor`, the same way `TechnicianMobile.tsx` derives
 * its own progress percentage. There is no per-job technician-name or ETA
 * field on this collection, so those are dropped rather than invented. */
export function ClientPortalLiveTracking() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data, isLoading, isError, error, refetch } = useCollection('jobs')
  const rows = (data ?? []) as readonly JobRow[]
  const active = rows.filter((j) => !isDone(j))

  const progressOf = (job: JobRow) => {
    const reached = railIndexFor(job.stage)
    return Math.round(((reached + 1) / WORKSHOP_STAGES.length) * 100)
  }

  if (isLoading) return <Loading label={t('Loading your service...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  if (active.length === 0) {
    return (
      <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
        <PageHeader icon="Radio" title={t('Live Tracking')} subtitle={t('Real-time service progress')} />
        <Card className="p-5">
          <EmptyState icon="Car" title={t('No active service')} description={t('When your vehicle is in the workshop, its progress appears here.')} />
        </Card>
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Radio" title={t('Live Tracking')} subtitle={t('Real-time service status')} />
        {active.map((job) => {
          const reached = railIndexFor(job.stage)
          return (
            <MobileCard key={job.id}>
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2">
                    <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Radio" size={14} /></span>
                    <div>
                      <p className="text-[13px] font-semibold text-heading">{t((job.svc ?? '').replace(/_/g, ' '))}</p>
                      <p className="text-xs text-muted">{job.veh}</p>
                    </div>
                  </div>
                }
                trailing={<StatusBadge value={job.st} label={t(STEPS[reached] ?? '')} />}
              />
              <MobileCardRow label={t('Job Card')} value={job.id} />
              <MobileCardRow label={t('Progress')} value={`${progressOf(job)}%`} />
              <div className="px-4 pb-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-tint-blue">
                  <div className="h-full rounded-full bg-salis-blue transition-all" style={{ width: `${progressOf(job)}%` }} />
                </div>
              </div>
            </MobileCard>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Radio" title={t('Live Tracking')} subtitle={t('Real-time service progress')} />

      {active.map((job) => {
        const reached = railIndexFor(job.stage)
        return (
          <Card key={job.id} className="rounded-2xl p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex rounded-lg bg-tint-blue p-2 text-salis-blue" aria-hidden><Icon name="Car" size={18} /></span>
                <div>
                  <h2 className="text-sm font-semibold text-heading">{job.veh}</h2>
                  <p className="text-xs text-muted">{job.id} - {t((job.svc ?? '').replace(/_/g, ' '))}</p>
                </div>
              </div>
              <StatusBadge value={job.st} label={t(STEPS[reached] ?? '')} />
            </div>

            <div className="mb-4 flex items-center gap-2">
              {STEPS.map((stage, idx) => {
                const isActive = idx <= reached
                return (
                  <div key={stage} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        background: isActive ? 'var(--salis-blue)' : 'var(--tint-blue)',
                        color: isActive ? 'white' : 'var(--salis-blue)',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-[10px] text-muted">{t(stage)}</span>
                  </div>
                )
              })}
            </div>

            <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-tint-blue">
              <div className="h-full rounded-full bg-salis-blue transition-all" style={{ width: `${progressOf(job)}%` }} />
            </div>

            <div className="flex items-center justify-end text-xs text-muted">
              <span>{t('Progress')}: {progressOf(job)}%</span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
