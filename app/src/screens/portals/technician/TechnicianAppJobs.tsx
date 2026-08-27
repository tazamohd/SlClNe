import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface AppJob {
  workOrder: string
  vehicle: string
  plate: string
  service: string
  bay: string
  priority: 'Urgent' | 'Normal' | 'Low'
  status: 'In Progress' | 'Queued' | 'On Hold' | 'Done'
  startTime: string
}

const JOBS: AppJob[] = [
  { workOrder: 'WO-8830', vehicle: '2021 Honda Accord', plate: 'KSA 7193', service: 'Full Brake Service', bay: 'Bay 3', priority: 'Urgent', status: 'In Progress', startTime: '08:15 AM' },
  { workOrder: 'WO-8831', vehicle: '2022 Toyota Camry', plate: 'RJD 4821', service: 'Engine Tune-up', bay: 'Bay 3', priority: 'Normal', status: 'Queued', startTime: '11:00 AM' },
  { workOrder: 'WO-8832', vehicle: '2023 Hyundai Tucson', plate: 'DMM 2856', service: 'AC Recharge', bay: 'Bay 5', priority: 'Normal', status: 'Queued', startTime: '01:30 PM' },
  { workOrder: 'WO-8833', vehicle: '2020 Nissan Altima', plate: 'JED 5034', service: 'Transmission Flush', bay: 'Bay 3', priority: 'Low', status: 'On Hold', startTime: '03:00 PM' },
  { workOrder: 'WO-8825', vehicle: '2022 Kia Sportage', plate: 'MKH 3344', service: 'Oil Change', bay: 'Bay 3', priority: 'Normal', status: 'Done', startTime: '07:30 AM' },
  { workOrder: 'WO-8826', vehicle: '2021 Toyota Hilux', plate: 'RYD 9012', service: 'Air Filter Replacement', bay: 'Bay 3', priority: 'Low', status: 'Done', startTime: '08:00 AM' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  'In Progress': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Queued: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  'On Hold': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Done: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
}

const PRIORITY_STYLES: Record<string, { bg: string; fg: string }> = {
  Urgent: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
  Normal: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Low: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function TechnicianAppJobs() {
  const { t } = usePreferences()

  const columns: Column<AppJob>[] = [
    { header: t('Work Order'), cell: (j) => j.workOrder },
    { header: t('Vehicle'), cell: (j) => j.vehicle },
    { header: t('Plate'), cell: (j) => j.plate },
    { header: t('Service'), cell: (j) => j.service },
    { header: t('Bay'), cell: (j) => j.bay },
    { header: t('Start'), cell: (j) => j.startTime },
    { header: t('Priority'), cell: (j) => <Badge background={PRIORITY_STYLES[j.priority].bg} color={PRIORITY_STYLES[j.priority].fg}>{t(j.priority)}</Badge> },
    { header: t('Status'), cell: (j) => <Badge background={STATUS_STYLES[j.status].bg} color={STATUS_STYLES[j.status].fg}>{t(j.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Clipboard" title={t('Jobs')} subtitle={t('Today\'s assigned work orders')} />

      <DataTable
        caption="Technician app jobs"
        columns={columns}
        rows={JOBS}
        rowKey={(j) => j.workOrder}
        mobileCard={(j) => (
          <>
            <MobileCardHeader title={j.service} trailing={<Badge background={STATUS_STYLES[j.status].bg} color={STATUS_STYLES[j.status].fg}>{t(j.status)}</Badge>} />
            <MobileCardRow label={t('Vehicle')}>{j.vehicle}</MobileCardRow>
            <MobileCardRow label={t('Work Order')}>{j.workOrder}</MobileCardRow>
            <MobileCardRow label={t('Priority')}><Badge background={PRIORITY_STYLES[j.priority].bg} color={PRIORITY_STYLES[j.priority].fg}>{t(j.priority)}</Badge></MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
