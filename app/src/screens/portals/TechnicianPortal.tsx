import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { useDateFormat } from '@/lib/formatDate'
import { railIndexFor, railLabelFor, type JobRow } from '@/screens/workshop/stages'
import { WORKSHOP_STAGES } from '@/components/ui/WorkflowStepper'
import { AppRowSkeleton } from '@/components/shell/CustomerAppShell'
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
 *  the branch's board through the same screen.
 *
 *  Built for a thumb in a glove: every control is 48px or taller, the queue is
 *  tap-only rows, and the one primary action — opening the current job — stays
 *  pinned above the tab bar while the rest scrolls. */
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

  const statsLoading = jobs.isLoading || appointments.isLoading
  const stats = [
    { label: 'Assigned', value: active.length },
    { label: 'In Progress', value: rows.filter(isInProgress).length },
    { label: 'Completed', value: rows.filter(isDone).length },
    { label: 'Today', value: schedule.length },
  ] as const

  return (
    <div className="flex animate-fade-up motion-reduce:animate-none flex-col gap-4">
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
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold leading-tight">
              {t('Welcome')}, {userName}
            </p>
            <p className="text-xs leading-tight opacity-80">{roleLabel}</p>
          </div>
          <ShiftChip />
        </div>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[10px] bg-white/10 p-2.5 text-center">
              <dd className="flex h-5 items-center justify-center font-display text-xl font-black leading-none" dir="ltr">
                {statsLoading ? <Skeleton className="h-4 w-8 bg-white/30" /> : stat.value}
              </dd>
              <dt className="mt-1 text-[11px] leading-tight opacity-80">{t(stat.label)}</dt>
            </div>
          ))}
        </dl>
      </section>

      {jobs.isLoading ? (
        <div role="status" aria-label={t('Loading')} className="flex flex-col gap-2.5">
          <Skeleton className="h-[220px] rounded-xl" />
          {Array.from({ length: 3 }, (_, i) => (
            <AppRowSkeleton key={i} />
          ))}
          <span className="sr-only">{t('Loading your jobs...')}</span>
        </div>
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
                    <QueueRow job={job} />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </>
      )}

      <h2 className="font-display text-[13px] font-bold text-heading">{t("Today's Schedule")}</h2>
      {appointments.isLoading ? (
        <div role="status" aria-label={t('Loading')} className="flex flex-col gap-2">
          {Array.from({ length: 2 }, (_, i) => (
            <AppRowSkeleton key={i} />
          ))}
          <span className="sr-only">{t('Loading schedule...')}</span>
        </div>
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
              className="flex min-h-[56px] items-center gap-2.5 rounded-xl border border-border bg-card p-3"
            >
              <span className="flex flex-shrink-0 rounded-lg bg-tint-bright p-1.5 text-salis-bright">
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
                <span className="block text-[11px] text-muted" dir="ltr">
                  {slot.mins} {t('min')}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* The primary action, pinned above the tab bar on a phone so a
          technician never scrolls to find it; inline on a desk. */}
      {current ? (
        <div className="sticky bottom-[76px] z-10 -mx-4 bg-page-alt/90 px-4 py-2 backdrop-blur md:static md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <Link
            to={detailRoute(current.id)}
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-salis-gradient font-action text-[15px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] transition-transform hover:-translate-y-px hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
          >
            <Icon name="ClipboardCheck" size={16} />
            {t('Open Job')}
          </Link>
        </div>
      ) : null}
    </div>
  )
}

/** "On shift · 14:32" — the clock, monospaced and pinned LTR, as a link to the
 *  Time Clock. No time-clock collection exists yet, so the chip shows the time
 *  of day rather than an elapsed shift nothing has recorded; it ticks once a
 *  minute and the link is where clocking in and out lives. */
function ShiftChip() {
  const { t } = usePreferences()
  const { time } = useDateFormat()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <Link
      to="/technician-portal-time-clock"
      className="flex h-11 flex-shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 font-action text-[11px] font-semibold text-white no-underline transition-colors hover:bg-white/25 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <Icon name="Clock" size={13} />
      <span>{t('On shift')}</span>
      <span aria-hidden>·</span>
      <span className="font-mono" dir="ltr">
        {time(now)}
      </span>
    </Link>
  )
}

/** Six dots for the six rail steps — filled up to where the job stands. */
function StageDots({ reached, className }: { reached: number; className?: string }) {
  const { t } = usePreferences()
  return (
    <span
      role="img"
      aria-label={`${t('Stage')}: ${t(WORKSHOP_STAGES[reached] ?? WORKSHOP_STAGES[0])}`}
      className={cn('flex items-center gap-1', className)}
    >
      {WORKSHOP_STAGES.map((stage, index) => (
        <span
          key={stage}
          aria-hidden
          className={cn(
            'block h-1.5 w-1.5 rounded-full',
            index < reached ? 'bg-salis-blue' : index === reached ? 'bg-salis-bright' : 'bg-border'
          )}
        />
      ))}
    </span>
  )
}

/** A queued job: one 56px tap target, nothing inside it to press by mistake. */
function QueueRow({ job }: { job: JobRow }) {
  return (
    <Link
      to={detailRoute(job.id)}
      className="flex min-h-[56px] items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2 no-underline transition-colors hover:border-salis-blue hover:no-underline active:bg-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
    >
      <span className="flex flex-shrink-0 rounded-lg bg-salis-blue/[.08] p-2 text-salis-blue">
        <Icon name="Wrench" size={14} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-heading">{job.cust}</span>
        <span className="mt-0.5 block truncate text-[11px] text-muted">{job.veh}</span>
      </span>
      <span className="flex flex-col items-end gap-1.5">
        <span className="font-mono text-[11px] font-semibold text-heading" dir="ltr">
          {job.id}
        </span>
        <StageDots reached={railIndexFor(job.stage)} />
      </span>
    </Link>
  )
}

/** The job in the technician's hands right now — bordered blue as the design
 *  draws it, with the stage rail position as its progress and the two things
 *  a technician does mid-job besides working: ask for a part, add a photo. */
function CurrentJobCard({ job }: { job: JobRow }) {
  const { t } = usePreferences()
  const reached = railIndexFor(job.stage)
  const total = WORKSHOP_STAGES.length
  const pct = Math.round(((reached + 1) / total) * 100)

  return (
    <Card className="flex flex-col gap-3 border-[1.5px] border-salis-blue p-4 shadow-[0_4px_16px_var(--tint-blue)]">
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
          <dt className="text-[11px] text-muted">{t('Customer')}</dt>
          <dd className="mt-0.5 text-[13px] font-semibold text-heading">{job.cust}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted">{t('Vehicle')}</dt>
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

      <div className="grid grid-cols-2 gap-2">
        <Link
          to="/technician-portal-parts"
          className="flex h-12 items-center justify-center gap-2 rounded-lg border-[1.5px] border-salis-blue bg-transparent font-action text-[13px] font-medium text-salis-blue no-underline transition-colors hover:bg-salis-blue/[.08] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
        >
          <Icon name="PackagePlus" size={16} />
          {t('Request parts')}
        </Link>
        <Link
          to={`${detailRoute(job.id)}#photos`}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border-[1.5px] border-salis-blue bg-transparent font-action text-[13px] font-medium text-salis-blue no-underline transition-colors hover:bg-salis-blue/[.08] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
        >
          <Icon name="Camera" size={16} />
          {t('Add photo')}
        </Link>
      </div>
    </Card>
  )
}

export type { JobRow }
