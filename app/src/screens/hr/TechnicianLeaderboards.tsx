import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Search } from '@/components/ui/Search'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, MAX_PAGE_SIZE, type RowOf } from '@/data/useCollection'
import { fromHalalas } from '@/screens/finance/money'
import type { JobRow } from '@/screens/workshop/stages'
import {
  hrReports,
  type FeedbackRow,
  type RepositoryError,
  type TechnicianLeaderboard,
} from '@/data/repository'

/** Technician Leaderboards — a ranking of the workshop's own technicians by
 *  work they are recorded as having finished (BLK-004).
 *
 *  What this screen used to be: `MOCK_LEADERBOARD`, ten invented technicians
 *  with invented job counts, ratings, "efficiency" percentages and revenue, and
 *  a `rank` stored beside them. Every one of those six columns is an aggregate
 *  and nobody had computed any of them. That is the defect in its sharpest form:
 *  a ranking of named staff by numbers that came from nowhere.
 *
 *  What survived derivation, and from what:
 *   - **Jobs completed / assigned** — the `jobs` collection grouped by
 *     `assignedTechId`, "completed" being `completed` or `delivered`, the two
 *     terminal working statuses. This is what the board ranks on.
 *   - **Customer rating** — the `feedback` collection joined to those jobs by
 *     `jobCardId`, shown with the number of rated jobs beside it so the reader
 *     can see what the average is over. It is the customer's rating of the
 *     *visit*, attributed to the technician the job was assigned to; it is not a
 *     performance appraisal, and it is not `technicians.rating`, which is a
 *     stored number nothing computes.
 *   - **Invoiced value** — the invoices raised against those completed jobs.
 *     Money is a cross-record total, so it is `GET /reports/technician-
 *     leaderboard`'s to compute (§5b) and reads "—" in a build with no API
 *     rather than being summed from the page of invoices the browser holds.
 *
 *  What was removed, because nothing in the system records it:
 *   - **Efficiency.** It needs estimated-versus-actual labour hours per job.
 *     `job_cards` records neither. A column that looks like data and isn't is
 *     worse than a missing column, so it is gone rather than approximated from
 *     the completion count.
 *   - **A technician rating as such.** There is no source that rates a
 *     technician; the rating here is the job feedback above, labelled as that.
 *   - **`rank` as a stored field.** Rank is derived from the ordering, here and
 *     nowhere else, and tied technicians share one.
 *
 *  A shop whose records name no completed job for anyone gets the empty state,
 *  not a ranking.
 */

type TechnicianRow = RowOf<'technicians'> & { _id?: string; name: string; specialty?: string | null }

/** One row of the ranking, however it was derived. The live aggregate and the
 *  local tally both normalise to this, so the ordering, the tie rule and the
 *  table below exist once rather than twice. */
interface Entry {
  technicianId: string
  name: string
  specialty: string | null
  jobsAssigned: number
  jobsCompleted: number
  ratedJobs: number
  avgRatingTenths: number | null
  /** Null when no server aggregate is connected — never a locally summed total. */
  invoicedHalalas: number | null
}

/** How much was counted to produce the rows, so no figure is read as covering
 *  more than it does. */
interface Counted {
  technicians: number
  jobCards: number
  completedJobCards: number
  ratedJobCards: number
  /** True when the tally is over one page of a collection rather than the
   *  whole tenant scope. */
  partial: boolean
}

const COMPLETED_STATUSES: readonly string[] = ['completed', 'delivered']

const RANK_BADGES: Record<number, { bg: string; fg: string; label: string }> = {
  1: { bg: 'rgba(249,115,22,.15)', fg: 'var(--salis-orange)', label: 'Gold' },
  2: { bg: 'var(--tint-navy)', fg: 'var(--salis-navy)', label: 'Silver' },
  3: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', label: 'Bronze' },
}

function RankBadge({ rank }: { rank: number }) {
  const { t } = usePreferences()
  const badge = RANK_BADGES[rank]
  if (badge) {
    return (
      <Badge background={badge.bg} color={badge.fg} strong>
        {t(badge.label)}
      </Badge>
    )
  }
  return <span className="font-mono text-xs text-muted">#{rank}</span>
}

/** The ordering, and the rank that ordering implies.
 *
 *  Standard competition ranking: two technicians with the same number of
 *  completed jobs hold the same rank, and the next one down is placed after
 *  both. Anything else would claim a difference the figures do not show. */
function ranked(entries: readonly Entry[]): { entry: Entry; rank: number }[] {
  const sorted = [...entries].sort(
    (a, b) => b.jobsCompleted - a.jobsCompleted || a.name.localeCompare(b.name),
  )
  let rank = 0
  let previous: number | null = null
  return sorted.map((entry, index) => {
    if (previous === null || entry.jobsCompleted !== previous) {
      rank = index + 1
      previous = entry.jobsCompleted
    }
    return { entry, rank }
  })
}

function ratingLabel(entry: Entry): string {
  return entry.avgRatingTenths === null ? '—' : (entry.avgRatingTenths / 10).toFixed(1)
}

export function TechnicianLeaderboards() {
  const { t } = usePreferences()
  const [search, setSearch] = useState('')

  /* The server aggregate: every figure summed in SQL over the whole tenant
   * scope. Live only — the accessor is null on the fixtures, the query never
   * runs, and the local tally below stands in for the columns it can honestly
   * produce. */
  const live = Boolean(hrReports)
  const report = useQuery<TechnicianLeaderboard, RepositoryError>({
    queryKey: ['reports', 'technician-leaderboard'],
    queryFn: () => hrReports!.technicianLeaderboard(),
    enabled: live,
    retry: false,
  })

  const jobs = useCollection('jobs')
  const technicians = useCollection('technicians')
  const feedback = useCollection('feedback')

  /* The local derivation, for a build with no aggregate behind it. Job counts
   * and ratings are tallies over real rows, which a client may compute; the
   * invoiced value is money and stays the server's. */
  const local = useMemo<{ entries: Entry[]; counted: Counted }>(() => {
    const jobRows = (jobs.data ?? []) as readonly JobRow[]
    const techRows = (technicians.data ?? []) as readonly TechnicianRow[]
    const feedbackRows = (feedback.data ?? []) as readonly (FeedbackRow & { _id?: string })[]

    const byTech = new Map<string, Entry>()
    for (const tech of techRows) {
      /* A technician the fixtures carry no id for cannot be the subject of an
       * assignment, so nothing can be counted against them. They are counted in
       * the roster total below and left out of the ranking rather than shown
       * with a zero they did not earn. */
      if (!tech._id) continue
      byTech.set(tech._id, {
        technicianId: tech._id,
        name: tech.name,
        specialty: tech.specialty ?? null,
        jobsAssigned: 0,
        jobsCompleted: 0,
        ratedJobs: 0,
        avgRatingTenths: null,
        invoicedHalalas: null,
      })
    }

    const techOfJob = new Map<string, string>()
    let completedJobCards = 0
    for (const job of jobRows) {
      if (COMPLETED_STATUSES.includes(job.st)) completedJobCards += 1
      const techId = job.assignedTechId
      if (!techId) continue
      const entry = byTech.get(techId)
      if (!entry) continue
      for (const key of [job._id, job.id]) {
        if (key) techOfJob.set(key, techId)
      }
      entry.jobsAssigned += 1
      if (COMPLETED_STATUSES.includes(job.st)) entry.jobsCompleted += 1
    }

    /* Ratings summed as integers, then divided into tenths once — the same
     * arithmetic the server does, for the same reason. */
    const ratingSum = new Map<string, number>()
    let ratedJobCards = 0
    for (const row of feedbackRows) {
      const techId = row.jobCardId ? techOfJob.get(row.jobCardId) : undefined
      if (!techId) continue
      const entry = byTech.get(techId)
      if (!entry) continue
      ratedJobCards += 1
      entry.ratedJobs += 1
      ratingSum.set(techId, (ratingSum.get(techId) ?? 0) + row.rating)
    }
    for (const [techId, sum] of ratingSum) {
      const entry = byTech.get(techId)
      if (entry && entry.ratedJobs > 0) entry.avgRatingTenths = Math.round((sum * 10) / entry.ratedJobs)
    }

    return {
      entries: [...byTech.values()],
      counted: {
        technicians: techRows.length,
        jobCards: jobRows.length,
        completedJobCards,
        ratedJobCards,
        partial: jobRows.length >= MAX_PAGE_SIZE,
      },
    }
  }, [jobs.data, technicians.data, feedback.data])

  const serverRows = report.data
  const entries: readonly Entry[] = serverRows
    ? serverRows.rows.map((row) => ({
        technicianId: row.technicianId,
        name: row.name,
        specialty: row.specialty,
        jobsAssigned: row.jobsAssigned,
        jobsCompleted: row.jobsCompleted,
        ratedJobs: row.ratedJobs,
        avgRatingTenths: row.avgRatingTenths,
        invoicedHalalas: row.invoicedHalalas,
      }))
    : local.entries

  const counted: Counted = serverRows
    ? {
        technicians: serverRows.counted.technicians,
        jobCards: serverRows.counted.jobCards,
        completedJobCards: serverRows.counted.completedJobCards,
        ratedJobCards: serverRows.counted.ratedJobCards,
        partial: false,
      }
    : local.counted

  /* Only technicians with completed work are ranked. A roster of zeros is not a
   * leaderboard, and the line under the table says how many were left out
   * rather than letting them disappear silently. */
  const placed = useMemo(() => ranked(entries.filter((e) => e.jobsCompleted > 0)), [entries])
  const unplaced = counted.technicians - placed.length

  const rows = useMemo(() => {
    if (!search.trim()) return placed
    const q = search.toLowerCase()
    return placed.filter((row) => row.entry.name.toLowerCase().includes(q))
  }, [placed, search])

  const loading = live ? report.isLoading : jobs.isLoading || technicians.isLoading || feedback.isLoading
  const error = live ? report.error : jobs.error ?? technicians.error ?? feedback.error

  const columns: Column<(typeof placed)[number]>[] = [
    { header: 'Rank', cell: (r) => <RankBadge rank={r.rank} /> },
    { header: 'Technician', cell: (r) => r.entry.name },
    { header: 'Jobs Completed', cell: (r) => r.entry.jobsCompleted, code: true },
    { header: 'Jobs Assigned', cell: (r) => r.entry.jobsAssigned, code: true },
    {
      header: 'Job Feedback',
      cell: (r) => (
        <span className="font-mono text-xs">
          {ratingLabel(r.entry)}
          <span className="ms-1 text-muted">
            {r.entry.ratedJobs === 0 ? t('no rated jobs') : `(${r.entry.ratedJobs})`}
          </span>
        </span>
      ),
    },
    {
      header: 'Invoiced',
      cell: (r) =>
        r.entry.invoicedHalalas === null ? (
          <span className="text-muted">—</span>
        ) : (
          <Money sar={fromHalalas(r.entry.invoicedHalalas)} />
        ),
      code: true,
    },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="Trophy" title={t('Leaderboards')} subtitle={t('Technician Rankings')} />
        <Search value={search} onChange={setSearch} placeholder={t('Search technicians...')} className="w-full sm:w-[260px]" compact />
      </div>

      {loading ? (
        <Card>
          <Loading label={t('Loading leaderboard...')} />
        </Card>
      ) : error ? (
        <Card>
          <ErrorState
            title={t('Could not load the leaderboard')}
            description={error.message}
            onRetry={() => (live ? report.refetch() : jobs.refetch())}
          />
        </Card>
      ) : placed.length === 0 ? (
        <Card>
          <EmptyState
            icon="Trophy"
            title={t('No completed jobs to rank yet')}
            description={t(
              'A technician appears here once a job card assigned to them reaches completed or delivered. Nothing is ranked until then.',
            )}
          />
        </Card>
      ) : (
        <>
          <DataTable
            caption="Technician leaderboard"
            columns={columns}
            rows={rows}
            rowKey={(r) => r.entry.technicianId}
            mobileCard={(r) => (
              <>
                <MobileCardHeader title={r.entry.name} trailing={<RankBadge rank={r.rank} />} />
                <MobileCardRow label={t('Jobs Completed')}>{String(r.entry.jobsCompleted)}</MobileCardRow>
                <MobileCardRow label={t('Jobs Assigned')}>{String(r.entry.jobsAssigned)}</MobileCardRow>
                <MobileCardRow label={t('Job Feedback')}>
                  {`${ratingLabel(r.entry)} (${r.entry.ratedJobs})`}
                </MobileCardRow>
                <MobileCardRow label={t('Invoiced')}>
                  {r.entry.invoicedHalalas === null ? (
                    '—'
                  ) : (
                    <Money sar={fromHalalas(r.entry.invoicedHalalas)} />
                  )}
                </MobileCardRow>
              </>
            )}
          />

          <div className="flex items-start gap-3 rounded-lg border border-border bg-salis-blue/[.05] px-4 py-3">
            <span className="flex flex-shrink-0 rounded-lg bg-tint-blue p-2 text-salis-blue">
              <Icon name="Info" size={16} />
            </span>
            <div className="min-w-0 space-y-1 text-[13px] text-muted">
              <p className="font-semibold text-heading">{t('How this ranking is derived')}</p>
              <p>
                {t('Ranked by completed jobs — a job card assigned to the technician whose status is completed or delivered. Counted over')}{' '}
                <span dir="ltr" className="font-mono text-[11px] text-body">
                  {counted.jobCards}
                </span>{' '}
                {t('job cards')}
                {counted.partial
                  ? ` — ${t('one page of the collection, so this is a partial count')}`
                  : ''}
                {'. '}
                {unplaced > 0
                  ? `${unplaced} ${t('of the technicians on the roster have no completed job in what was counted and are not ranked.')}`
                  : ''}
              </p>
              <p>
                {t('Job feedback is the customer’s rating of the visit, averaged over the rated jobs shown in brackets — not an appraisal of the technician, and not a stored rating.')}
              </p>
              {counted.ratedJobCards === 0 ? (
                <p>{t('No job on this board has been rated by a customer yet, so every feedback figure reads “—”.')}</p>
              ) : null}
              <p>
                {live
                  ? t('Invoiced is the value of the invoices raised against those completed jobs, summed by the server — not commission, and not the technician’s earnings:')
                  : t('Invoiced is a cross-record money total, so it is computed by the server and reads “—” until this build has an API behind it:')}{' '}
                <span dir="ltr" className="font-mono text-[11px] text-body">
                  reports/technician-leaderboard
                </span>
              </p>
              <p>
                {t('Efficiency is not shown: it needs estimated against actual labour hours per job, which no record carries.')}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
