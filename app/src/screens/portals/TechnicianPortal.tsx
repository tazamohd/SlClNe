import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge, ServiceBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { railIndexFor, railLabelFor, type JobRow } from '@/screens/workshop/stages'
import { WORKSHOP_STAGES } from '@/components/ui/WorkflowStepper'
import { detailRoute, isDone, isInProgress, todayIso, type AppointmentRow } from './portal-data'

/** The technician's home — their jobs, today's schedule, and where each job
 *  stands. `TechnicianPortal.dc.html` is the source; the stat that design fills
 *  with an invented "6.5h logged" is replaced by today's appointment count,
 *  because no time-clock collection exists yet and a number nothing recorded is
 *  a number this product does not print.
 *
 *  The job list arrives already scoped: the technician role reads `own`, so the
 *  server returns the jobs assigned to *their* technician row and nothing else
 *  (F-015's corrected semantics). This screen never re-filters by identity —
 *  the API's answer is the answer, and staff roles holding `portaltech: v` see
 *  the branch's board through the same screen. */
export function TechnicianPortal() {
  const { t } = usePreferences()
  const { userName, roleLabel } = useSession()

  const jobs = useCollection('jobs')
  const appointments = useCollection('appointments')

  const rows = (jobs.data ?? []) as readonly JobRow[]
  const active = rows.filter((row) => !isDone(row))
  const current = rows.find(isInProgress) ?? active[0]
  const queue = active.filter((row) => row !== current)

  const today = todayIso()
  const schedule = ((appointments.data ?? []) as readonly AppointmentRow[]).filter(
    (row) => !row.scheduledDate || row.scheduledDate === today
  )

  const stats = [
    { label: 'Assigned', value: active.length },
    { label: 'In Progress', value: rows.filter(isInProgress).length },
    { label: 'Completed', value: rows.filter(isDone).length },
    { label: 'Today', value: schedule.length },
  ] as const

  return (
    <div className="flex animate-fade-up flex-col gap-4">
      {/* Gradient hero — greeting, role, today's numbers. */}
      <section
        aria-label={t('Technician Portal')}
        className="flex flex-col gap-3.5 rounded-2xl bg-salis-gradient p-4 text-white shadow-[0_8px_24px_rgba(10,94,215,.25)]"
      >
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-base font-extrabold"
          >
            {userName.trim()[0] ?? '?'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight">
              {t('Welcome')}, {userName}
            </p>
            <p className="text-xs leading-tight opacity-80">{roleLabel}</p>
          </div>
        </div>
        <dl className="grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[10px] bg-white/10 p-2.5 text-center">
              <dd className="font-display text-xl font-black leading-none" dir="ltr">
                {jobs.isLoading || appointments.isLoading ? '…' : stat.value}
              </dd>
              <dt className="mt-1 text-[10px] leading-tight opacity-80">{t(stat.label)}</dt>
            </div>
          ))}
        </dl>
      </section>

      {jobs.isLoading ? (
        <Loading label="Loading your jobs..." />
      ) : jobs.isError ? (
        <ErrorState description={jobs.error?.message} onRetry={() => void jobs.refetch()} />
      ) : rows.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon="Wrench"
            title={t('No jobs assigned to you')}
            description={t('Jobs appear here as soon as the workshop assigns one to you.')}
          />
        </Card>
      ) : (
        <>
          {current ? <CurrentJobCard job={current} /> : null}

          {queue.length > 0 ? (
            <>
              <h2 className="font-display text-[13px] font-bold text-heading">{t('Up Next')}</h2>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {queue.map((job) => (
                  <li key={job.id}>
                    <Link
                      to={detailRoute(job.id)}
                      className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3.5 no-underline transition-colors hover:border-salis-blue hover:no-underline"
                    >
                      <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.08)] p-1.5 text-salis-blue">
                        <Icon name="Wrench" size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-heading">
                          {job.cust}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-muted">
                          {job.veh}
                        </span>
                      </span>
                      <span className="flex flex-col items-end gap-1">
                        <span className="font-mono text-[11px] font-semibold text-heading" dir="ltr">
                          {job.id}
                        </span>
                        <ServiceBadge value={job.svc} label={t(serviceLabel(job.svc))} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}

      <h2 className="font-display text-[13px] font-bold text-heading">{t("Today's Schedule")}</h2>
      {appointments.isLoading ? (
        <Loading inline label="Loading schedule..." />
      ) : appointments.isError ? (
        <ErrorState
          description={appointments.error?.message}
          onRetry={() => void appointments.refetch()}
        />
      ) : schedule.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon="Calendar"
            title={t('Nothing scheduled today')}
            description={t('Appointments for your bay appear here.')}
          />
        </Card>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {schedule.map((slot, index) => (
            <li
              key={slot._id ?? `${slot.time}-${index}`}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3"
            >
              <span className="flex flex-shrink-0 rounded-lg bg-[rgba(11,179,255,.1)] p-1.5 text-salis-bright">
                <Icon name="Clock" size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-heading">
                  {slot.svc}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-muted">
                  {slot.veh} · {slot.bay}
                </span>
              </span>
              <span className="text-end">
                <span className="font-mono text-[11px] font-semibold text-heading" dir="ltr">
                  {slot.time}
                </span>
                <span className="block text-[10px] text-muted" dir="ltr">
                  {slot.mins} {t('min')}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** The job in the technician's hands right now — bordered blue as the design
 *  draws it, with the stage rail position as its progress. */
function CurrentJobCard({ job }: { job: JobRow }) {
  const { t } = usePreferences()
  const reached = railIndexFor(job.stage)
  const total = WORKSHOP_STAGES.length
  const pct = Math.round(((reached + 1) / total) * 100)

  return (
    <Card className="flex flex-col gap-3 border-[1.5px] border-salis-blue p-4 shadow-[0_4px_16px_rgba(10,94,215,.1)]">
      <div className="flex items-center gap-2">
        <span className="flex rounded-lg bg-salis-gradient p-1.5 text-white">
          <Icon name="Wrench" size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-heading">{t('Current Job')}</p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-muted" dir="ltr">
            {job.id}
          </p>
        </div>
        <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />
      </div>

      <dl className="grid grid-cols-2 gap-2">
        <div>
          <dt className="text-[10px] text-muted">{t('Customer')}</dt>
          <dd className="mt-0.5 text-[13px] font-semibold text-heading">{job.cust}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-muted">{t('Vehicle')}</dt>
          <dd className="mt-0.5 text-[13px] text-body">{job.veh}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted">
            {t('Stage')}: {t(railLabelFor(job.stage))}
          </span>
          <span className="font-mono font-bold text-salis-blue" dir="ltr">
            {reached + 1}/{total}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('Stage')}
          className="h-1.5 rounded-full bg-inset"
        >
          <div className="h-full rounded-full bg-salis-gradient" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Link
        to={detailRoute(job.id)}
        className="flex h-11 items-center justify-center gap-2 rounded-lg bg-salis-gradient font-action text-[13px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] transition-transform hover:-translate-y-px hover:no-underline"
      >
        <Icon name="ClipboardCheck" size={15} />
        {t('Open Job')}
      </Link>
    </Card>
  )
}

function serviceLabel(value: string): string {
  return value.replace(/_/g, ' ')
}

export type { JobRow }
