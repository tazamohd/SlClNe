import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface Appointment {
  id: string
  vehicle: string
  service: string
  date: string
  time: string
  advisor: string
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'
}

const APPOINTMENTS: Appointment[] = [
  { id: 'APT-1001', vehicle: '2022 Toyota Camry', service: 'Brake Inspection', date: '2025-08-22', time: '09:00 AM', advisor: 'Khalid Al-Rashid', status: 'Confirmed' },
  { id: 'APT-1002', vehicle: '2023 Hyundai Tucson', service: 'Oil Change', date: '2025-08-25', time: '10:30 AM', advisor: 'Faisal Al-Dosari', status: 'Pending' },
  { id: 'APT-0998', vehicle: '2021 Honda Accord', service: 'Tire Rotation', date: '2025-08-12', time: '02:00 PM', advisor: 'Khalid Al-Rashid', status: 'Completed' },
  { id: 'APT-0995', vehicle: '2022 Toyota Camry', service: 'AC Service', date: '2025-08-08', time: '11:00 AM', advisor: 'Omar Al-Hamdan', status: 'Completed' },
  { id: 'APT-0990', vehicle: '2020 Nissan Altima', service: 'Engine Diagnostic', date: '2025-08-05', time: '09:30 AM', advisor: 'Faisal Al-Dosari', status: 'Cancelled' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Confirmed: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Completed: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  Cancelled: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
}

export function ClientPortalAppointments() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Upcoming'), value: '2', icon: 'CalendarCheck', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Completed'), value: '8', icon: 'CheckCircle', bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
    { label: t('Cancelled'), value: '1', icon: 'XCircle', bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
    { label: t('This Month'), value: '3', icon: 'Calendar', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  ]

  const columns: Column<Appointment>[] = [
    { header: t('Ref'), cell: (a) => a.id },
    { header: t('Vehicle'), cell: (a) => a.vehicle },
    { header: t('Service'), cell: (a) => a.service },
    { header: t('Date & Time'), cell: (a) => `${a.date} ${a.time}` },
    { header: t('Advisor'), cell: (a) => a.advisor },
    { header: t('Status'), cell: (a) => <Badge background={STATUS_STYLES[a.status].bg} color={STATUS_STYLES[a.status].fg}>{t(a.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Calendar" title={t('Appointments')} subtitle={t('Upcoming and past appointments')} />

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Client appointments"
        columns={columns}
        rows={APPOINTMENTS}
        rowKey={(a) => a.id}
        mobileCard={(a) => (
          <>
            <MobileCardHeader title={a.service} trailing={<Badge background={STATUS_STYLES[a.status].bg} color={STATUS_STYLES[a.status].fg}>{t(a.status)}</Badge>} />
            <MobileCardRow label={t('Vehicle')}>{a.vehicle}</MobileCardRow>
            <MobileCardRow label={t('Date')}>{a.date} {a.time}</MobileCardRow>
            <MobileCardRow label={t('Advisor')}>{a.advisor}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
