import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListPageHeader } from '@/components/shell/ListPage'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { AdvancedFilters, type ActiveFilter, type FilterGroup } from '@/components/ui/AdvancedFilters'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { PriorityBadge, ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { ErrorState, Loading } from '@/components/ui/States'
import { useCollection, type RowOf } from '@/data/useCollection'
import { JobCardForm } from './JobCardForm'

type Job = RowOf<'jobs'>

/** Job card registry — the workshop's work queue.
 *
 *  "New Job Card" is gated on `jobcards:c`: a technician or QC inspector can
 *  view the list but can't open one, so the button is hidden rather than
 *  shown-and-rejected. The server re-checks the same grant on `POST /jobs`;
 *  hiding the button is what the user sees, not what stops them (§36). */
export function JobCards() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { data: jobs = [], isLoading, isError, error, refetch } = useCollection('jobs')
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])

  const filterGroups = useMemo<FilterGroup[]>(() => {
    const unique = (fn: (job: Job) => string) => [...new Set(jobs.map(fn))].filter(Boolean)
    return [
      { id: 'status', label: 'Status', icon: 'Activity', options: unique((j) => j.st) },
      { id: 'priority', label: 'Priority', icon: 'Flag', options: unique((j) => j.pr) },
      { id: 'service', label: 'Service Type', icon: 'Wrench', options: unique((j) => j.svc) },
    ]
  }, [jobs])

  const filtered = useMemo(() => {
    let result = jobs
    const needle = query.trim().toLowerCase()
    if (needle) {
      result = result.filter((job) =>
        [job.id, job.cust, job.veh].some((field) => field.toLowerCase().includes(needle))
      )
    }
    if (activeFilters.length > 0) {
      const groups = new Map<string, string[]>()
      for (const f of activeFilters) {
        const arr = groups.get(f.groupId) ?? []
        arr.push(f.value)
        groups.set(f.groupId, arr)
      }
      result = result.filter((job) => {
        for (const [groupId, values] of groups) {
          const field = groupId === 'status' ? job.st : groupId === 'priority' ? job.pr : job.svc
          if (!values.includes(field)) return false
        }
        return true
      })
    }
    return result
  }, [jobs, query, activeFilters])

  const columns: Column<Job>[] = [
    { header: 'Job Card', cell: (job) => job.id, code: true },
    { header: 'Customer', cell: (job) => job.cust },
    { header: 'Vehicle', cell: (job) => job.veh },
    {
      header: 'Service',
      cell: (job) => <ServiceBadge value={job.svc} label={t((job.svc ?? '').replace(/_/g, ' '))} />,
    },
    { header: 'Priority', cell: (job) => <PriorityBadge value={job.pr} label={t(job.pr)} /> },
    {
      header: 'Status',
      cell: (job) => <StatusBadge value={job.st} label={t((job.st ?? '').replace(/_/g, ' '))} />,
    },
  ]

  if (isMobile) {
    return (
      <>
        <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
          <MobilePageHeader
            icon="ClipboardList"
            title={t('Job Cards')}
            actions={
              can('jobcards', 'c') ? (
                <Button
                  size="md"
                  onClick={() => setCreating(true)}
                  aria-label={t('New Job Card')}
                >
                  <Icon name="Plus" size={16} />
                  <span className="sr-only">{t('New Job Card')}</span>
                </Button>
              ) : null
            }
          />
          <div className="flex items-center gap-2">
            <Input
              type="search"
              aria-label={t('Search job cards...')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('Search job cards...')}
              inputSize="sm"
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Icon name="SlidersHorizontal" size={14} />
              {activeFilters.length > 0 ? `(${activeFilters.length})` : null}
            </Button>
          </div>
          {showFilters ? (
            <AdvancedFilters
              groups={filterGroups}
              active={activeFilters}
              onSelect={(groupId, value) => setActiveFilters((prev) => [...prev, { groupId, value }])}
              onRemove={(groupId, value) => setActiveFilters((prev) => prev.filter((f) => f.groupId !== groupId || f.value !== value))}
              onClear={() => setActiveFilters([])}
            />
          ) : null}
          {isError ? (
            <Card className="p-4">
              <ErrorState
                title={t("Couldn't load this")}
                description={error?.message}
                onRetry={() => void refetch()}
              />
            </Card>
          ) : isLoading ? (
            <Loading label={t('Loading job cards...')} inline />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={query ? 'SearchX' : 'ClipboardList'}
              title={query ? t('No matching job cards') : t('No job cards yet')}
              description={
                query
                  ? t('Try a different customer, vehicle or job number.')
                  : t('Check a vehicle in to open the first job card.')
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((job) => (
                <MobileCard key={job.id} onClick={() => navigate(`/job-detail?id=${job.id}`)}>
                  <MobileCardHeader
                    title={job.id}
                    code
                    trailing={<StatusBadge value={job.st} label={t((job.st ?? '').replace(/_/g, ' '))} />}
                  />
                  <MobileCardRow>{job.cust}</MobileCardRow>
                  <MobileCardRow>{job.veh}</MobileCardRow>
                  <div className="flex items-center gap-2">
                    <ServiceBadge value={job.svc} label={t((job.svc ?? '').replace(/_/g, ' '))} />
                    <PriorityBadge value={job.pr} label={t(job.pr)} />
                  </div>
                </MobileCard>
              ))}
            </div>
          )}
        </div>
        <JobCardForm open={creating} onClose={() => setCreating(false)} />
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Job Cards')}
        search={{ value: query, onChange: setQuery }}
        actions={
          <>
            <Button variant="outline" size="md" onClick={() => setShowFilters(!showFilters)}>
              <Icon name="SlidersHorizontal" size={16} />
              {t('Filters')}
              {activeFilters.length > 0 ? ` (${activeFilters.length})` : null}
            </Button>
            {can('jobcards', 'c') ? (
              <Button size="md" onClick={() => setCreating(true)}>
                <Icon name="Plus" size={16} />
                {t('New Job Card')}
              </Button>
            ) : null}
          </>
        }
      />

      {showFilters ? (
        <AdvancedFilters
          groups={filterGroups}
          active={activeFilters}
          onSelect={(groupId, value) => setActiveFilters((prev) => [...prev, { groupId, value }])}
          onRemove={(groupId, value) => setActiveFilters((prev) => prev.filter((f) => f.groupId !== groupId || f.value !== value))}
          onClear={() => setActiveFilters([])}
        />
      ) : null}

      {isError ? (
        <ErrorState
          title={t("Couldn't load this")}
          description={error?.message}
          onRetry={() => void refetch()}
        />
      ) : null}

      <JobCardForm open={creating} onClose={() => setCreating(false)} />

      <DataTable
        caption="Job cards"
        columns={columns}
        rows={filtered}
        rowKey={(job) => job.id}
        loading={isLoading}
        onRowClick={(job) => navigate(`/job-detail?id=${job.id}`)}
        mobileCard={(job) => (
          <>
            <MobileCardHeader
              title={job.id}
              code
              trailing={<StatusBadge value={job.st} label={t((job.st ?? '').replace(/_/g, ' '))} />}
            />
            <MobileCardRow>{job.cust}</MobileCardRow>
            <MobileCardRow>{job.veh}</MobileCardRow>
            <div className="flex items-center gap-2">
              <ServiceBadge value={job.svc} label={t((job.svc ?? '').replace(/_/g, ' '))} />
              <PriorityBadge value={job.pr} label={t(job.pr)} />
            </div>
          </>
        )}
        empty={
          query ? (
            <EmptyState
              icon="SearchX"
              title={t('No matching job cards')}
              description={t('Try a different customer, vehicle or job number.')}
            />
          ) : (
            <EmptyState
              icon="ClipboardList"
              title={t('No job cards yet')}
              description={t('Check a vehicle in to open the first job card.')}
            />
          )
        }
      />
    </>
  )
}
