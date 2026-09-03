import { useNavigate } from 'react-router-dom'
import { KpiCard } from '@/components/ui/KpiCard'
import { StatusBadge, ServiceBadge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { UNKNOWN } from '@/screens/registry/writes'
import { railLabelFor, type JobRow } from '@/screens/workshop/stages'
import { detailRoute, isDone, isInProgress, todayIso, type AppointmentRow } from '../portal-data'

/** The technician's day at a glance, from the same two collections the portal
 *  home reads. The design's "Hours Today" tile is a number no collection
 *  records, so it shows the em dash rather than an invented 6.5. */
export function TechnicianPortalDashboard() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const jobs = useCollection('jobs')
  const appointments = useCollection('appointments')

  const rows = (jobs.data ?? []) as readonly JobRow[]
  const active = rows.filter((job) => !isDone(job))
  const today = todayIso()
  const schedule = ((appointments.data ?? []) as readonly AppointmentRow[]).filter(
    (row) => !row.scheduledDate || row.scheduledDate === today
  )

  const kpis = [
    { label: t('Assigned Jobs'), value: jobs.isLoading ? UNKNOWN : String(active.length), icon: 'Clipboard', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('In Progress'), value: jobs.isLoading ? UNKNOWN : String(rows.filter(isInProgress).length), icon: 'Wrench', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Today'), value: appointments.isLoading ? UNKNOWN : String(schedule.length), icon: 'Calendar', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Hours Today'), value: UNKNOWN, icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const columns: Column<JobRow>[] = [
    { header: 'Job Card', cell: (job) => job.id, code: true },
    { header: 'Customer', cell: (job) => <span className="font-medium text-heading">{job.cust}</span> },
    { header: 'Vehicle', cell: (job) => job.veh },
    { header: 'Service', cell: (job) => <ServiceBadge value={job.svc} label={t(job.svc.replace(/_/g, ' '))} /> },
    { header: 'Stage', cell: (job) => t(railLabelFor(job.stage)) },
    { header: 'Status', cell: (job) => <StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} /> },
  ]

  return (
    <ScreenFrame
      icon="LayoutDashboard"
      title="Technician Dashboard"
      subtitle={t("Today's work overview")}
      query={jobs}
      skeleton="dashboard"
      empty={
        active.length === 0 && {
          icon: 'Wrench',
          title: 'No jobs assigned to you',
          description: 'Jobs appear here as soon as the workshop assigns one to you.',
        }
      }
      toolbar={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>
      }
    >
      <DataTable
        caption="Technician assigned jobs"
        columns={columns}
        rows={active}
        rowKey={(job) => job._id ?? job.id}
        onRowClick={(job) => navigate(detailRoute(job.id))}
        mobileCard={(job) => (
          <>
            <MobileCardHeader title={job.cust} trailing={<StatusBadge value={job.st} label={t(job.st.replace(/_/g, ' '))} />} />
            <MobileCardRow label={t('Vehicle')}>{job.veh}</MobileCardRow>
            <MobileCardRow label={t('Job Card')}>
              <span className="font-mono" dir="ltr">{job.id}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Stage')}>{t(railLabelFor(job.stage))}</MobileCardRow>
          </>
        )}
      />
    </ScreenFrame>
  )
}
