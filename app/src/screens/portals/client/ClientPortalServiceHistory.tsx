import { StatusBadge, ServiceBadge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { derived } from '@/screens/registry/writes'
import type { JobRow } from '@/screens/workshop/stages'
import { isDone } from '../portal-data'

/** Every job the workshop has finished on the customer's vehicles, from the
 *  jobs collection. The design's `WO-` rows carried a technician and a cost
 *  the projection does not — the technician is the workshop's to show, the
 *  cost lives on the invoice — so both are gone rather than invented. */
export function ClientPortalServiceHistory() {
  const { t } = usePreferences()
  const jobs = useCollection('jobs')
  const rows = ((jobs.data ?? []) as readonly JobRow[]).filter(isDone)

  const columns: Column<JobRow>[] = [
    { header: 'Job Card', cell: (job) => job.id, code: true, sortValue: (job) => job.id },
    { header: 'Vehicle', cell: (job) => <span className="font-medium text-heading">{job.veh}</span>, sortValue: (job) => job.veh },
    { header: 'Service', cell: (job) => <ServiceBadge value={job.svc} label={t(job.svc.replace(/_/g, ' '))} /> },
    { header: 'Completed', cell: (job) => derived(job._updatedAt) },
    { header: 'Status', cell: (job) => <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} /> },
  ]

  return (
    <ScreenFrame
      icon="History"
      title="Service History"
      subtitle={t('Complete service timeline')}
      query={jobs}
      skeleton="table"
      empty={
        rows.length === 0 && {
          icon: 'History',
          title: 'No completed services yet',
          description: 'Finished jobs on your vehicles appear here.',
        }
      }
    >
      <DataTable
        caption="Client service history"
        columns={columns}
        rows={rows}
        rowKey={(job) => job._id ?? job.id}
        mobileCard={(job) => (
          <>
            <MobileCardHeader title={job.veh} trailing={<StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />} />
            <MobileCardRow label={t('Job Card')}>
              <span className="font-mono" dir="ltr">{job.id}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Service')}>{t(job.svc.replace(/_/g, ' '))}</MobileCardRow>
            <MobileCardRow label={t('Completed')}>{derived(job._updatedAt)}</MobileCardRow>
          </>
        )}
      />
    </ScreenFrame>
  )
}
