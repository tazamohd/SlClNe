import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { AdvancedFilters, type ActiveFilter, type FilterGroup } from '@/components/ui/AdvancedFilters'
import { PipelineStrip, type PipelineStage, type PipelineTone } from '@/components/ui/PipelineStrip'
import { Button } from '@/components/ui/Button'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { PriorityBadge, ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { useCommand, type Command } from '@/components/shell/commands'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { JobCardForm } from './JobCardForm'
import { RAIL_STAGES, isJobStage, railIndexForJob, type JobStage } from './stages'

type Job = RowOf<'jobs'>

/** Priority order for sorting — a word is not sortable, its urgency is. */
const PRIORITY_RANK: Record<string, number> = { low: 0, medium: 1, high: 2, urgent: 3 }

const STAGE_TONES: readonly PipelineTone[] = ['orange', 'bright', 'blue', 'gradient', 'bright', 'navy']

const FILTER_FIELDS = {
  status: (job: Job) => job.st,
  priority: (job: Job) => job.pr,
  service: (job: Job) => job.svc,
} as const

type FilterId = keyof typeof FILTER_FIELDS

function label(value: string | undefined): string {
  return (value ?? '').replace(/_/g, ' ')
}

/** Job card registry — the workshop's work queue.
 *
 *  The pipeline strip under the header is the queue read as a sequence: six
 *  stages, a live count in each, and pressing one filters the list to it. The
 *  stage travels in the URL (`?stage=repair`) so the Dashboard's strip, a
 *  bookmark and the browser's back button all land on the same view.
 *
 *  "New Job Card" is gated on `jobcards:c`: a technician or QC inspector can
 *  view the list but can't open one, so the button is hidden rather than
 *  shown-and-rejected. The server re-checks the same grant on `POST /jobs`;
 *  hiding the button is what the user sees, not what stops them (§36). The
 *  same action is registered with the command palette while this screen is
 *  mounted, and `N` opens it from the keyboard. */
export function JobCards() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const jobs = useCollection('jobs')
  const rows = jobs.data ?? []
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])

  const canCreate = can('jobcards', 'c')
  const stageParam = params.get('stage')
  const stage: JobStage | null = isJobStage(stageParam) ? stageParam : null

  function selectStage(id: string) {
    const next = new URLSearchParams(params)
    if (id === stage || !isJobStage(id)) next.delete('stage')
    else next.set('stage', id)
    setParams(next, { replace: true })
  }

  const commands = useMemo<Command[]>(
    () =>
      canCreate
        ? [
            {
              id: 'jobcards:new',
              label: 'New Job Card',
              icon: 'Plus',
              keywords: ['job', 'card', 'create', 'check in'],
              group: 'create',
              shortcut: 'N',
              run: () => setCreating(true),
            },
          ]
        : [],
    [canCreate]
  )
  useCommand(commands)

  // `N` opens the form — but not while typing in the search box or any other
  // field, and not with a modifier held (that is the browser's shortcut).
  useEffect(() => {
    if (!canCreate) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'n' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return
      event.preventDefault()
      setCreating(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canCreate])

  const stages = useMemo<PipelineStage[]>(() => {
    const counts = new Array<number>(RAIL_STAGES.length).fill(0)
    for (const job of rows) counts[railIndexForJob(job)] += 1
    return RAIL_STAGES.map((meta, index) => ({
      id: meta.id,
      label: meta.label,
      count: counts[index],
      icon: meta.icon,
      tone: STAGE_TONES[index],
    }))
  }, [rows])

  const filterGroups = useMemo<FilterGroup[]>(() => {
    const unique = (fn: (job: Job) => string) => [...new Set(rows.map(fn))].filter(Boolean)
    return [
      { id: 'status', label: 'Status', icon: 'Activity', options: unique(FILTER_FIELDS.status) },
      { id: 'priority', label: 'Priority', icon: 'Flag', options: unique(FILTER_FIELDS.priority) },
      { id: 'service', label: 'Service Type', icon: 'Wrench', options: unique(FILTER_FIELDS.service) },
    ]
  }, [rows])

  const filtered = useMemo(() => {
    let result: readonly Job[] = rows
    if (stage) {
      const wanted = RAIL_STAGES.findIndex((meta) => meta.id === stage)
      result = result.filter((job) => railIndexForJob(job) === wanted)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      result = result.filter((job) =>
        [job.id, job.cust, job.veh].some((field) => field.toLowerCase().includes(needle))
      )
    }
    if (activeFilters.length > 0) {
      const groups = new Map<FilterId, string[]>()
      for (const filter of activeFilters) {
        const id = filter.groupId as FilterId
        groups.set(id, [...(groups.get(id) ?? []), filter.value])
      }
      result = result.filter((job) =>
        [...groups].every(([groupId, values]) => values.includes(FILTER_FIELDS[groupId](job)))
      )
    }
    return result
  }, [rows, stage, query, activeFilters])

  const isFiltered = Boolean(query.trim()) || Boolean(stage) || activeFilters.length > 0

  const toggleFilter = (groupId: string, value: string) =>
    setActiveFilters((prev) =>
      prev.some((f) => f.groupId === groupId && f.value === value)
        ? prev.filter((f) => f.groupId !== groupId || f.value !== value)
        : [...prev, { groupId, value }]
    )

  const columns: Column<Job>[] = [
    { header: 'Job Card', key: 'id', cell: (job) => job.id, code: true, sortValue: (job) => job.id, width: '11rem' },
    { header: 'Customer', key: 'customer', cell: (job) => job.cust, sortValue: (job) => job.cust },
    { header: 'Vehicle', key: 'vehicle', cell: (job) => job.veh, sortValue: (job) => job.veh },
    {
      header: 'Service',
      key: 'service',
      cell: (job) => <ServiceBadge value={job.svc} label={t(label(job.svc))} />,
      sortValue: (job) => job.svc,
    },
    {
      header: 'Priority',
      key: 'priority',
      cell: (job) => <PriorityBadge value={job.pr} label={t(job.pr)} />,
      sortValue: (job) => PRIORITY_RANK[job.pr] ?? -1,
    },
    {
      header: 'Stage',
      key: 'stage',
      cell: (job) => t(RAIL_STAGES[railIndexForJob(job)].label),
      sortValue: (job) => railIndexForJob(job),
    },
    {
      header: 'Status',
      key: 'status',
      cell: (job) => <StatusBadge value={job.st} label={t(label(job.st))} />,
      sortValue: (job) => job.st,
    },
  ]

  const toolbar = (
    <div className="flex flex-col gap-3">
      <PipelineStrip
        stages={stages}
        active={stage ?? undefined}
        onSelect={selectStage}
        label="Job pipeline"
      />
      {isMobile ? (
        showFilters ? (
          <AdvancedFilters
            groups={filterGroups}
            active={activeFilters}
            onSelect={(groupId, value) => setActiveFilters((prev) => [...prev, { groupId, value }])}
            onRemove={(groupId, value) => setActiveFilters((prev) => prev.filter((f) => f.groupId !== groupId || f.value !== value))}
            onClear={() => setActiveFilters([])}
          />
        ) : null
      ) : (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {filterGroups.map((group) => (
            <ChipGroup key={group.id} label={t(group.label)} multi>
              <span className="font-action text-[11px] font-medium uppercase tracking-[.06em] text-muted">
                {t(group.label)}
              </span>
              {group.options.map((option) => (
                <Chip
                  key={option}
                  multi
                  label={t(label(option))}
                  selected={activeFilters.some((f) => f.groupId === group.id && f.value === option)}
                  onToggle={() => toggleFilter(group.id, option)}
                />
              ))}
            </ChipGroup>
          ))}
          {activeFilters.length > 0 ? (
            <Button variant="ghost" size="sm" icon="X" onClick={() => setActiveFilters([])}>
              {t('Clear filters')}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )

  return (
    <>
      <ScreenFrame
        variant="quiet"
        eyebrow="Workshop"
        title="Job Cards"
        search={{ value: query, onChange: setQuery, placeholder: t('Search customers, vehicles, parts...') }}
        actions={
          <>
            {isMobile ? (
              <Button
                variant="outline"
                size="md"
                icon="SlidersHorizontal"
                aria-pressed={showFilters}
                onClick={() => setShowFilters((open) => !open)}
              >
                {t('Filters')}
                {activeFilters.length > 0 ? ` (${activeFilters.length})` : null}
              </Button>
            ) : null}
            {canCreate ? (
              <Button size="md" icon="Plus" onClick={() => setCreating(true)}>
                {t('New Job Card')}
              </Button>
            ) : null}
          </>
        }
        toolbar={toolbar}
        query={jobs}
        empty={
          !jobs.isLoading && rows.length === 0
            ? {
                icon: 'ClipboardList',
                title: 'No job cards yet',
                description: 'Check a vehicle in to open the first job card.',
                action: canCreate ? (
                  <Button size="md" icon="Plus" onClick={() => setCreating(true)}>
                    {t('New Job Card')}
                  </Button>
                ) : undefined,
              }
            : false
        }
      >
        <DataTable
          caption="Job cards"
          columns={columns}
          rows={filtered}
          rowKey={(job) => job.id}
          onRowClick={(job) => navigate(`/job-detail?id=${encodeURIComponent(job.id)}`)}
          mobileCard={(job) => (
            <>
              <MobileCardHeader
                title={job.id}
                code
                trailing={<StatusBadge value={job.st} label={t(label(job.st))} />}
              />
              <MobileCardRow>{job.cust}</MobileCardRow>
              <MobileCardRow>{job.veh}</MobileCardRow>
              <div className="flex items-center gap-2">
                <ServiceBadge value={job.svc} label={t(label(job.svc))} />
                <PriorityBadge value={job.pr} label={t(job.pr)} />
              </div>
            </>
          )}
          empty={
            <EmptyState
              icon="SearchX"
              title={t('No matching job cards')}
              description={
                isFiltered && !query
                  ? t('No job cards at this stage match the filters.')
                  : t('Try a different customer, vehicle or job number.')
              }
              action={
                isFiltered ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setQuery('')
                      setActiveFilters([])
                      selectStage('')
                    }}
                  >
                    {t('Clear filters')}
                  </Button>
                ) : undefined
              }
            />
          }
        />
      </ScreenFrame>
      <JobCardForm open={creating} onClose={() => setCreating(false)} />
    </>
  )
}
