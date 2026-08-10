import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListPageHeader } from '@/components/shell/ListPage'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PriorityBadge, ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

type Job = RowOf<'jobs'>

/** Job card registry — the workshop's work queue.
 *
 *  "New Job Card" is gated on `jobcards:c`: a technician or QC inspector can
 *  view the list but can't open one, so the button is hidden rather than
 *  shown-and-rejected. */
export function JobCards() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const { data: jobs = [], isLoading } = useCollection('jobs')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return jobs
    return jobs.filter((job) =>
      [job.id, job.cust, job.veh].some((field) => field.toLowerCase().includes(needle))
    )
  }, [jobs, query])

  const columns: Column<Job>[] = [
    { header: 'Job Card', cell: (job) => job.id, code: true },
    { header: 'Customer', cell: (job) => job.cust },
    { header: 'Vehicle', cell: (job) => job.veh },
    {
      header: 'Service',
      cell: (job) => <ServiceBadge value={job.svc} label={t(job.svc.replace(/_/g, ' '))} />,
    },
    { header: 'Priority', cell: (job) => <PriorityBadge value={job.pr} label={t(job.pr)} /> },
    {
      header: 'Status',
      cell: (job) => <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />,
    },
  ]

  return (
    <>
      <ListPageHeader
        title={t('Job Cards')}
        search={{ value: query, onChange: setQuery }}
        actions={
          can('jobcards', 'c') ? (
            <Button size="md" onClick={() => navigate('/workshop-check-in')}>
              <Icon name="Plus" size={16} />
              {t('New Job Card')}
            </Button>
          ) : null
        }
      />

      <DataTable
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
              trailing={<StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />}
            />
            <MobileCardRow>{job.cust}</MobileCardRow>
            <MobileCardRow>{job.veh}</MobileCardRow>
            <div className="flex items-center gap-2">
              <ServiceBadge value={job.svc} label={t(job.svc.replace(/_/g, ' '))} />
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
