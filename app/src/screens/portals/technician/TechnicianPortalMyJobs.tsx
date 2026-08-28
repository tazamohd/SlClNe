import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface Job {
  workOrder: string
  vehicle: string
  plate: string
  service: string
  priority: 'High' | 'Normal' | 'Low'
  status: 'In Progress' | 'Queued' | 'Waiting Parts' | 'Completed'
  estimatedHours: number
  bay: string
}

const JOBS: Job[] = [
  { workOrder: 'WO-8830', vehicle: '2021 Honda Accord', plate: 'KSA 7193', service: 'Full Brake Service', priority: 'High', status: 'In Progress', estimatedHours: 3, bay: 'Bay 3' },
  { workOrder: 'WO-8831', vehicle: '2022 Toyota Camry', plate: 'RJD 4821', service: 'Engine Tune-up', priority: 'Normal', status: 'Queued', estimatedHours: 2.5, bay: 'Bay 3' },
  { workOrder: 'WO-8832', vehicle: '2023 Hyundai Tucson', plate: 'DMM 2856', service: 'AC Recharge', priority: 'Normal', status: 'Queued', estimatedHours: 1, bay: 'Bay 5' },
  { workOrder: 'WO-8833', vehicle: '2020 Nissan Altima', plate: 'JED 5034', service: 'Transmission Flush', priority: 'Low', status: 'Waiting Parts', estimatedHours: 2, bay: 'Bay 3' },
  { workOrder: 'WO-8834', vehicle: '2019 Toyota Hilux', plate: 'RYD 9012', service: 'Suspension Repair', priority: 'High', status: 'Queued', estimatedHours: 4, bay: 'Bay 7' },
  { workOrder: 'WO-8825', vehicle: '2022 Kia Sportage', plate: 'MKH 3344', service: 'Oil Change', priority: 'Normal', status: 'Completed', estimatedHours: 1, bay: 'Bay 3' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  'In Progress': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Queued: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  'Waiting Parts': { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  Completed: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
}

const PRIORITY_STYLES: Record<string, { bg: string; fg: string }> = {
  High: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
  Normal: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Low: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function TechnicianPortalMyJobs() {
  const { t } = usePreferences()

  const columns: Column<Job>[] = [
    { header: t('Work Order'), cell: (j) => j.workOrder },
    { header: t('Vehicle'), cell: (j) => j.vehicle },
    { header: t('Plate'), cell: (j) => j.plate },
    { header: t('Service'), cell: (j) => j.service },
    { header: t('Bay'), cell: (j) => j.bay },
    { header: t('Priority'), cell: (j) => <Badge background={PRIORITY_STYLES[j.priority].bg} color={PRIORITY_STYLES[j.priority].fg}>{t(j.priority)}</Badge> },
    { header: t('Est. Hours'), cell: (j) => j.estimatedHours },
    { header: t('Status'), cell: (j) => <Badge background={STATUS_STYLES[j.status].bg} color={STATUS_STYLES[j.status].fg}>{t(j.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Clipboard" title={t('My Jobs')} subtitle={t('Assigned work orders and status')} />

      <DataTable
        caption="Technician assigned work orders"
        columns={columns}
        rows={JOBS}
        rowKey={(j) => j.workOrder}
        mobileCard={(j) => (
          <>
            <MobileCardHeader title={j.service} trailing={<Badge background={STATUS_STYLES[j.status].bg} color={STATUS_STYLES[j.status].fg}>{t(j.status)}</Badge>} />
            <MobileCardRow label={t('Vehicle')}>{j.vehicle} - {j.plate}</MobileCardRow>
            <MobileCardRow label={t('Work Order')}>{j.workOrder}</MobileCardRow>
            <MobileCardRow label={t('Bay')}>{j.bay}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
