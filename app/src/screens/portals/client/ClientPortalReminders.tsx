import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface Reminder {
  id: string
  vehicle: string
  service: string
  dueDate: string
  mileageDue: number
  priority: 'High' | 'Medium' | 'Low'
  status: 'Due Soon' | 'Overdue' | 'Scheduled'
}

const REMINDERS: Reminder[] = [
  { id: 'REM-301', vehicle: '2022 Toyota Camry', service: 'Oil Change', dueDate: '2025-08-25', mileageDue: 40000, priority: 'High', status: 'Due Soon' },
  { id: 'REM-302', vehicle: '2021 Honda Accord', service: 'Tire Replacement', dueDate: '2025-09-01', mileageDue: 55000, priority: 'Medium', status: 'Due Soon' },
  { id: 'REM-303', vehicle: '2023 Hyundai Tucson', service: 'Second Scheduled Service', dueDate: '2025-09-15', mileageDue: 20000, priority: 'Low', status: 'Scheduled' },
  { id: 'REM-304', vehicle: '2020 Nissan Altima', service: 'Brake Inspection', dueDate: '2025-08-10', mileageDue: 70000, priority: 'High', status: 'Overdue' },
  { id: 'REM-305', vehicle: '2022 Toyota Camry', service: 'AC Filter Replacement', dueDate: '2025-10-01', mileageDue: 42000, priority: 'Low', status: 'Scheduled' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  'Due Soon': { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  Overdue: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
  Scheduled: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
}

const PRIORITY_STYLES: Record<string, { bg: string; fg: string }> = {
  High: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
  Medium: { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  Low: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
}

export function ClientPortalReminders() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Due Soon'), value: '2', icon: 'Clock', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Overdue'), value: '1', icon: 'AlertTriangle', bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
    { label: t('Scheduled'), value: '2', icon: 'CalendarCheck', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Active'), value: '5', icon: 'Bell', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  ]

  const columns: Column<Reminder>[] = [
    { header: t('Service'), cell: (r) => r.service },
    { header: t('Vehicle'), cell: (r) => r.vehicle },
    { header: t('Due Date'), cell: (r) => r.dueDate },
    { header: t('Mileage Due'), cell: (r) => `${r.mileageDue.toLocaleString()} km` },
    { header: t('Priority'), cell: (r) => <Badge background={PRIORITY_STYLES[r.priority].bg} color={PRIORITY_STYLES[r.priority].fg}>{t(r.priority)}</Badge> },
    { header: t('Status'), cell: (r) => <Badge background={STATUS_STYLES[r.status].bg} color={STATUS_STYLES[r.status].fg}>{t(r.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Bell" title={t('Service Reminders')} subtitle={t('Upcoming maintenance schedule')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Service reminders"
        columns={columns}
        rows={REMINDERS}
        rowKey={(r) => r.id}
        mobileCard={(r) => (
          <>
            <MobileCardHeader title={r.service} trailing={<Badge background={STATUS_STYLES[r.status].bg} color={STATUS_STYLES[r.status].fg}>{t(r.status)}</Badge>} />
            <MobileCardRow label={t('Vehicle')}>{r.vehicle}</MobileCardRow>
            <MobileCardRow label={t('Due Date')}>{r.dueDate}</MobileCardRow>
            <MobileCardRow label={t('Priority')}><Badge background={PRIORITY_STYLES[r.priority].bg} color={PRIORITY_STYLES[r.priority].fg}>{t(r.priority)}</Badge></MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
