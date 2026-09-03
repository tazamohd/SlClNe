import { useNavigate } from 'react-router-dom'
import { StatusBadge, ServiceBadge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { railLabelFor, type JobRow } from '@/screens/workshop/stages'
import { detailRoute, isDone } from '../portal-data'

/** The technician's work orders, read through the repository seam.
 *
 *  The design listed six invented `WO-` rows with bays and hour estimates the
 *  job collection does not carry. What it does carry — the card, the customer,
 *  the vehicle, the service, the status and the stage — is what this shows,
 *  scoped by the server to the signed-in technician (F-015). A row opens the
 *  portal job detail. */
export function TechnicianPortalMyJobs() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const jobs = useCollection('jobs')
  const rows = (jobs.data ?? []) as readonly JobRow[]

  const columns: Column<JobRow>[] = [
    { header: 'Job Card', cell: (job) => job.id, code: true, sortValue: (job) => job.id },
    { header: 'Customer', cell: (job) => <span className="font-medium text-heading">{job.cust}</span>, sortValue: (job) => job.cust },
    { header: 'Vehicle', cell: (job) => job.veh, sortValue: (job) => job.veh },
    { header: 'Service', cell: (job) => <ServiceBadge value={job.svc} label={t(job.svc.replace(/_/g, ' '))} /> },
    { header: 'Stage', cell: (job) => t(railLabelFor(job.stage)) },
    { header: 'Status', cell: (job) => <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />, sortValue: (job) => job.st },
  ]

  return (
    <ScreenFrame
      icon="ClipboardList"
      title="My Jobs"
      subtitle={t('Assigned work orders and status')}
      query={jobs}
      skeleton="table"
      empty={
        rows.length === 0 && {
          icon: 'Wrench',
          title: 'No jobs assigned to you',
          description: 'Jobs appear here as soon as the workshop assigns one to you.',
        }
      }
    >
      <DataTable
        caption="Technician assigned work orders"
        columns={columns}
        rows={rows}
        rowKey={(job) => job._id ?? job.id}
        onRowClick={(job) => navigate(detailRoute(job.id))}
        pageSize={20}
        mobileCard={(job) => (
          <>
            <MobileCardHeader
              title={job.cust}
              trailing={<StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />}
            />
            <MobileCardRow label={t('Job Card')}>
              <span className="font-mono" dir="ltr">{job.id}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Vehicle')}>{job.veh}</MobileCardRow>
            <MobileCardRow label={t('Stage')}>{isDone(job) ? t('Done') : t(railLabelFor(job.stage))}</MobileCardRow>
          </>
        )}
      />
    </ScreenFrame>
  )
}
