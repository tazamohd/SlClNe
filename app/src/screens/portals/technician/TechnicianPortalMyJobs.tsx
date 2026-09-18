import { useNavigate } from 'react-router-dom'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PriorityBadge, ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

type Job = RowOf<'jobs'>

/** My Jobs — a technician's own work queue, `TechnicianPortal.MyJobs.dc.html`.
 *
 *  `useCollection('jobs')` needs no client-side filter to "my" jobs: the
 *  server's row-level security narrows a `technician`-scoped principal
 *  (`ROLE_META.technician.scope === 'own'`) to the job cards whose
 *  `assigned_tech_id` is theirs before the row ever reaches this screen
 *  (`0002_own_scope_tech.sql`). What the design invented — bay, estimated
 *  hours, a plate column — has no backing column on the presented row
 *  (`registry.ts`'s `present()` for `jobs` carries id/customer/vehicle/
 *  service/priority/status/stage only), so this shows exactly those fields,
 *  the same set `workshop/JobCards.tsx` shows the front desk. Opening a row
 *  goes to `TechnicianPortal.JobDetail`, which is where the real stage
 *  actions — start repair, mark complete, hand to QC — already live. */
export function TechnicianPortalMyJobs() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const { data: jobs = [], isLoading, isError, error, refetch } = useCollection('jobs')

  const open = (job: Job) => navigate(`/technician-portal/job-detail?id=${encodeURIComponent(job.id)}`)

  const columns: Column<Job>[] = [
    { header: t('Job Card'), cell: (j) => j.id, code: true },
    { header: t('Vehicle'), cell: (j) => j.veh },
    { header: t('Customer'), cell: (j) => j.cust },
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
      <PageHeader icon="Clipboard" title={t('My Jobs')} subtitle={t('Assigned work orders and status')} />

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
          caption="Technician assigned work orders"
          columns={columns}
          rows={jobs}
          rowKey={(j) => j.id}
          onRowClick={open}
          mobileCard={(j) => (
            <>
              <MobileCardHeader
                title={j.id}
                code
                trailing={<StatusBadge value={j.st} label={t((j.st ?? '').replace(/_/g, ' '))} />}
              />
              <MobileCardRow label={t('Vehicle')}>{j.veh}</MobileCardRow>
              <MobileCardRow label={t('Customer')}>{j.cust}</MobileCardRow>
              <MobileCardRow label={t('Priority')}><PriorityBadge value={j.pr} label={t(j.pr)} /></MobileCardRow>
            </>
          )}
        />
      )}
    </div>
  )
}
