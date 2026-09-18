import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Money, formatSar } from '@/components/ui/Money'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { PageHeader } from '@/components/ui/PageHeader'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, useUpdate, type RowOf } from '@/data/useCollection'
import { isLive, RepositoryError } from '@/data/repository'
import { fetchDeclinedJobsReport } from './api'

type DeclinedJob = RowOf<'declinedJobs'>

const STATUS_OPTIONS = [
  'declined',
  'follow_up_scheduled',
  'contacted',
  'reconsidering',
  'approved_later',
  'permanently_declined',
  'expired',
] as const

/** Every status label as a *whole* translatable string, never assembled from
 *  the raw enum value — `status.replace(/_/g, ' ')` would read fine in
 *  English and mean nothing to `check-i18n`, which only follows literal keys. */
const STATUS_LABEL: Record<(typeof STATUS_OPTIONS)[number], string> = {
  declined: 'Declined',
  follow_up_scheduled: 'Follow-up scheduled',
  contacted: 'Contacted',
  reconsidering: 'Reconsidering',
  approved_later: 'Approved later',
  permanently_declined: 'Permanently declined',
  expired: 'Expired',
}

const OPEN_STATUSES = new Set(['declined', 'follow_up_scheduled', 'contacted', 'reconsidering'])

/* Brand permits blue and orange only (`check-tokens.mjs`) — no red. Severity
 * escalates through weight instead: calm blue, then orange, then a stronger
 * orange for the two levels that mean "act on this now". */
const SEVERITY_TONE: Record<string, { bg: string; fg: string }> = {
  monitor: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  attention: { bg: 'rgba(249,115,22,.13)', fg: 'var(--salis-orange)' },
  urgent: { bg: 'rgba(249,115,22,.22)', fg: 'var(--salis-orange-hover)' },
  unsafe: { bg: 'var(--warning)', fg: 'var(--warning-fg)' },
}

const REASON_LABEL: Record<string, string> = {
  cost: 'Cost',
  timing: 'Timing',
  second_opinion: 'Second opinion',
  not_urgent: 'Not urgent',
  trust: 'Trust',
  other: 'Other',
}

/** Declined Job Tracking & Follow-Up (Sprint 1, P0).
 *
 *  Every row is born from an advisor declining an estimate line or an owner
 *  or manager rejecting a whole estimate (`server/src/routes/estimates.ts`).
 *  Nothing here is created from this screen — declining is an action on the
 *  estimate it came from, not a record you type up separately, so the only
 *  thing this dashboard writes back is the follow-up lifecycle: `status`,
 *  `followUpDate`, `followUpNotes`. Everything else — the customer, the
 *  vehicle, the reason, the value — is a snapshot the decline action took at
 *  the moment it happened.
 *
 *  The revenue summary is server-computed (`GET /reports/declined-jobs`,
 *  §A10): "lost" sums every row still in an active decline state, "recovered"
 *  sums `approved_later` — a customer who said no and then said yes. */
export function DeclinedJobs() {
  const { t } = usePreferences()
  const toast = useToast()
  const [filter, setFilter] = useState<'open' | 'all' | (typeof STATUS_OPTIONS)[number]>('open')

  const jobs = useCollection('declinedJobs', { pageSize: 100, sort: 'declinedAt:desc' })
  const update = useUpdate('declinedJobs')

  const report = useQuery({
    queryKey: ['reports', 'declined-jobs'],
    queryFn: () => fetchDeclinedJobsReport(),
    enabled: isLive,
    retry: false,
  })

  const rows = (jobs.data ?? []) as readonly DeclinedJob[]
  const shown = useMemo(
    () =>
      filter === 'all'
        ? rows
        : filter === 'open'
          ? rows.filter((row) => OPEN_STATUSES.has(row.status))
          : rows.filter((row) => row.status === filter),
    [rows, filter]
  )

  async function setFollowUp(job: DeclinedJob, patch: Partial<Pick<DeclinedJob, 'status' | 'followUpDate'>>) {
    try {
      await update.mutateAsync({ id: job._id!, patch })
      toast.show({ title: t('Follow-up updated'), description: job.customer })
    } catch (cause) {
      toast.show({
        title: t('Could not update'),
        description:
          cause instanceof RepositoryError
            ? cause.message
            : t('Something went wrong. Nothing was saved.'),
        error: true,
      })
    }
  }

  if (jobs.isLoading) return <Loading label={t('Loading declined jobs...')} />
  if (jobs.isError) {
    return <ErrorState title={t("Couldn't load this")} description={jobs.error?.message} onRetry={() => void jobs.refetch()} />
  }

  const openCount = rows.filter((row) => OPEN_STATUSES.has(row.status)).length
  const lostSar = report.data ? report.data.lostRevenueHalalas / 100 : null
  const recoveredSar = report.data ? report.data.recoveredRevenueHalalas / 100 : null

  const stats: { n: string; label: string; icon: string }[] = [
    { n: String(openCount), label: t('Open follow-ups'), icon: 'Clock' },
    { n: lostSar === null ? '—' : formatSar(lostSar, { bare: true }), label: t('Lost revenue'), icon: 'TrendingDown' },
    {
      n: recoveredSar === null ? '—' : formatSar(recoveredSar, { bare: true }),
      label: t('Recovered revenue'),
      icon: 'TrendingUp',
    },
  ]

  return (
    <div className="flex max-w-[1240px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <PageHeader
        icon="CircleX"
        title={t('Declined Jobs')}
        subtitle={t('Work customers said no to — tracked for follow-up, not forgotten')}
      />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-3 rounded-xl p-3.5">
            <span className="flex flex-shrink-0 rounded-lg bg-tint-blue p-2.5 text-salis-blue">
              <Icon name={s.icon} size={16} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-black leading-tight text-heading">{s.n}</p>
              <p className="truncate text-[11px] text-muted">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {!isLive ? (
        <div role="note" className="flex items-start gap-3 rounded-xl border border-border bg-inset p-3.5">
          <Icon name="Info" size={15} className="mt-0.5 flex-shrink-0 text-muted" />
          <p className="text-xs leading-relaxed text-body">
            {t('This build has no API configured, so the revenue summary is unavailable. Set VITE_API_URL to see it.')}
          </p>
        </div>
      ) : null}

      <ChipGroup label={t('Filter')}>
        <Chip label={t('Open')} selected={filter === 'open'} onToggle={() => setFilter('open')} />
        <Chip label={t('All')} selected={filter === 'all'} onToggle={() => setFilter('all')} />
        {STATUS_OPTIONS.map((s) => (
          <Chip key={s} label={t(STATUS_LABEL[s])} selected={filter === s} onToggle={() => setFilter(s)} />
        ))}
      </ChipGroup>

      {shown.length === 0 ? (
        <Card className="p-4">
          <EmptyState
            icon="ThumbsUp"
            title={t('Nothing here')}
            description={t('Declined estimate lines show up here automatically, with nothing to add by hand.')}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="m-0 flex list-none flex-col p-0">
            {shown.map((job, index) => {
              const tone = SEVERITY_TONE[job.safetySeverity] ?? SEVERITY_TONE.monitor!
              const busy = update.isPending && update.variables?.id === (job._id!)
              return (
                <li
                  key={job._id!}
                  className={
                    'flex flex-wrap items-start gap-3 p-3.5 sm:flex-nowrap ' +
                    (index ? 'border-0 border-t border-solid border-border' : '')
                  }
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-bold text-heading">{job.customer}</span>
                      <Badge background={tone.bg} color={tone.fg}>
                        {t(job.safetySeverity)}
                      </Badge>
                      <Badge background="var(--tint-blue)" color="var(--salis-blue)">
                        {t(REASON_LABEL[job.reasonCategory] ?? job.reasonCategory)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[13px] text-body">{job.description}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{job.vehicle}</p>
                    {job.reasonNotes ? <p className="mt-1 text-[11px] italic text-muted">{job.reasonNotes}</p> : null}
                  </div>

                  <div className="min-w-[88px] flex-shrink-0 text-end">
                    <Money sar={job.valueHalalas / 100} className="text-sm font-extrabold text-heading" />
                    <p className="mt-1">
                      <StatusBadge value={job.status} label={t(STATUS_LABEL[job.status as (typeof STATUS_OPTIONS)[number]] ?? job.status)} />
                    </p>
                  </div>

                  <div className="flex flex-shrink-0 flex-col gap-1.5">
                    <Select
                      aria-label={t('Follow-up status')}
                      value={job.status}
                      disabled={busy}
                      onChange={(event) => void setFollowUp(job, { status: event.target.value as DeclinedJob['status'] })}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {t(STATUS_LABEL[s])}
                        </option>
                      ))}
                    </Select>
                    <input
                      type="date"
                      aria-label={t('Follow-up date')}
                      value={job.followUpDate ?? ''}
                      disabled={busy}
                      onChange={(event) => void setFollowUp(job, { followUpDate: event.target.value || null })}
                      className="h-9 rounded border border-border bg-card px-2.5 text-[12px] text-heading outline-none focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}
