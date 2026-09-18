import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { KpiCard } from '@/components/ui/KpiCard'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PriorityBadge, ServiceBadge, StatusBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection } from '@/data/useCollection'
import type { JobRow } from '@/screens/workshop/stages'

type Job = JobRow

const FINISHED_STAGES = new Set(['delivery', 'invoiced', 'closed'])

/** Technician dashboard — `TechnicianPortal.Dashboard.dc.html`, over the
 *  technician's own row-level-security-scoped job cards.
 *
 *  The design's KPI strip invented two figures no collection backs — hours
 *  logged today, parts pending — so they are absent here rather than shown as
 *  round numbers nobody computed. "Assigned" and "Completed" are both real
 *  counts over the same rows the table below renders, which is what keeps
 *  the two from ever disagreeing with each other. */
export function TechnicianPortalDashboard() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useCollection('jobs')
  const jobs = (data ?? []) as readonly JobRow[]

  const open = (job: Job) => navigate(`/technician-portal/job-detail?id=${encodeURIComponent(job.id)}`)

  const { assignedCount, completedCount } = useMemo(() => {
    const completed = jobs.filter((j) => FINISHED_STAGES.has(j.stage ?? '')).length
    return { assignedCount: jobs.length, completedCount: completed }
  }, [jobs])

  const kpis = [
    { label: t('Assigned Jobs'), value: String(assignedCount), icon: 'Clipboard', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Completed'), value: String(completedCount), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

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
      <PageHeader icon="LayoutDashboard" title={t('Technician Dashboard')} subtitle={t("Today's work overview")} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

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
          caption="Technician assigned jobs"
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
