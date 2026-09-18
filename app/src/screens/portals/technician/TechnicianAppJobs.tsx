import { useNavigate } from 'react-router-dom'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PriorityBadge, ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

type Job = RowOf<'jobs'>

/** The technician mobile app's own jobs list — `Technician-App-Jobs`, a
 *  feature-map screen over the same `jobs` collection `TechnicianPortalMyJobs`
 *  reads. Kept as its own screen (the two surfaces are routed and navigated
 *  separately), but backed by the same real, row-level-security-scoped data
 *  rather than a second, disagreeing set of fixture rows — a bay, a start
 *  time and a plate column had no backing field on the presented row and are
 *  dropped rather than invented. Opens the same real job detail screen the
 *  portal uses; there is only one. */
export function TechnicianAppJobs() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const { data: jobs = [], isLoading, isError, error, refetch } = useCollection('jobs')

  const open = (job: Job) => navigate(`/technician-portal/job-detail?id=${encodeURIComponent(job.id)}`)

  const columns: Column<Job>[] = [
    { header: t('Job Card'), cell: (j) => j.id, code: true },
    { header: t('Vehicle'), cell: (j) => j.veh },
    {
      header: t('Service'),
      cell: (j) => <ServiceBadge value={j.svc} label={t((j.svc ?? '').replace(/_/g, ' '))} />,
    },
    { header: t('Priority'), cell: (j) => <PriorityBadge value={j.pr} label={t(j.pr)} /> },
    {
      header: t('Status'),
      cell: (j) => <StatusBadge value={j.st} label={t((j.st ?? '').replace(/_/g, ' '))} />,
    },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Clipboard" title={t('Jobs')} subtitle={t("Today's assigned work orders")} />

      {isError ? (
        <ErrorState title={t("Couldn't load this")} description={error?.message} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Loading label={t('Loading job cards...')} inline />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="Clipboard"
          title={t('No jobs assigned')}
          description={t('Work assigned to you shows up here as soon as an advisor hands it to your bay.')}
        />
      ) : (
        <DataTable
          caption="Technician app jobs"
          columns={columns}
          rows={jobs}
          rowKey={(j) => j.id}
          onRowClick={open}
          mobileCard={(j) => (
            <>
              <MobileCardHeader
                title={j.svc ? t((j.svc).replace(/_/g, ' ')) : j.id}
                trailing={<StatusBadge value={j.st} label={t((j.st ?? '').replace(/_/g, ' '))} />}
              />
              <MobileCardRow label={t('Vehicle')}>{j.veh}</MobileCardRow>
              <MobileCardRow label={t('Job Card')}>{j.id}</MobileCardRow>
              <MobileCardRow label={t('Priority')}><PriorityBadge value={j.pr} label={t(j.pr)} /></MobileCardRow>
            </>
          )}
        />
      )}
    </div>
  )
}
