import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/Badge'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { WORKSHOP_STAGES } from '@/components/ui/WorkflowStepper'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { railIndexFor, railLabelFor, type JobRow } from '@/screens/workshop/stages'
import { isDone } from '../portal-data'

/** Every job of the customer's still in the workshop, each on the six-step
 *  rail the job's stage puts it on. The design's percentages and promised
 *  times were constants; the rail is the record's own stage, and a promised
 *  time shows only when the server has set one. */
type TrackedJob = JobRow & { eta?: string | null; estimatedCompletion?: string | null }

export function ClientPortalLiveTracking() {
  const { t } = usePreferences()
  const jobs = useCollection('jobs')
  const rows = ((jobs.data ?? []) as readonly TrackedJob[]).filter((job) => !isDone(job))

  return (
    <ScreenFrame
      icon="Radio"
      title="Live Tracking"
      subtitle={t('Real-time service progress')}
      query={jobs}
      skeleton="cards"
      empty={
        rows.length === 0 && {
          icon: 'Car',
          title: 'No active service',
          description: 'When your vehicle is in the workshop, its progress appears here.',
        }
      }
    >
      {rows.map((job) => {
        const reached = railIndexFor(job.stage)
        const eta = job.eta ?? job.estimatedCompletion ?? null
        return (
          <Card key={job._id ?? job.id} className="rounded-2xl p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex flex-shrink-0 rounded-lg bg-tint-blue p-2 text-salis-blue" aria-hidden>
                  <Icon name="Car" size={18} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-heading">{job.veh}</h2>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    <span className="font-mono" dir="ltr">{job.id}</span> · {t(job.svc.replace(/_/g, ' '))}
                  </p>
                </div>
              </div>
              <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />
            </div>

            <ol aria-label={t('Stage')} className="mb-4 flex list-none items-start gap-2 p-0">
              {WORKSHOP_STAGES.map((stage, index) => {
                const done = index < reached
                const current = index === reached
                return (
                  <li
                    key={stage}
                    aria-current={current ? 'step' : undefined}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                        done
                          ? 'bg-salis-gradient text-white'
                          : current
                            ? 'border-2 border-salis-blue bg-card text-salis-blue'
                            : 'border border-border bg-card text-muted'
                      )}
                    >
                      {done ? <Icon name="Check" size={14} /> : index + 1}
                    </span>
                    <span className={cn('text-center text-[11px]', current ? 'font-semibold text-heading' : 'text-muted')}>
                      {t(stage)}
                    </span>
                  </li>
                )
              })}
            </ol>

            <div
              role="progressbar"
              aria-valuenow={Math.round(((reached + 1) / WORKSHOP_STAGES.length) * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('Stage')}
              className="mb-3 h-2 w-full overflow-hidden rounded-full bg-tint-blue"
            >
              <div
                className="h-full rounded-full bg-salis-blue"
                style={{ width: `${((reached + 1) / WORKSHOP_STAGES.length) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3 text-xs text-muted">
              <span>
                {t('Stage')}: {t(railLabelFor(job.stage))}
              </span>
              {eta ? (
                <span>
                  {t('ETA')}: <span dir="ltr">{eta}</span>
                </span>
              ) : (
                <span>{t("We'll call you")}</span>
              )}
            </div>
          </Card>
        )
      })}
    </ScreenFrame>
  )
}
