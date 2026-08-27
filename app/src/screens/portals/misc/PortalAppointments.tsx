import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'

interface Appointment {
  id: string
  customer: string
  vehicle: string
  plate: string
  service: string
  date: string
  time: string
  technician: string
  status: 'Confirmed' | 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
}

const APPOINTMENTS: Appointment[] = [
  { id: 'APT-4201', customer: 'Ahmed Al-Rashid', vehicle: 'Toyota Camry 2022', plate: 'RUH 4821', service: 'Oil Change', date: 'Aug 18, 2026', time: '09:00 AM', technician: 'Mohammed Ali', status: 'In Progress' },
  { id: 'APT-4202', customer: 'Khalid Mohammed', vehicle: 'Hyundai Sonata 2024', plate: 'JED 7732', service: 'Brake Inspection', date: 'Aug 18, 2026', time: '10:30 AM', technician: 'Faisal Ahmed', status: 'Confirmed' },
  { id: 'APT-4203', customer: 'Fatima Al-Saud', vehicle: 'Nissan Patrol 2023', plate: 'RUH 1155', service: 'Full Service', date: 'Aug 18, 2026', time: '11:00 AM', technician: 'Ali Hassan', status: 'Pending' },
  { id: 'APT-4204', customer: 'Omar Hassan', vehicle: 'Toyota Hilux 2021', plate: 'DMM 3349', service: 'Tire Rotation', date: 'Aug 18, 2026', time: '01:00 PM', technician: 'Saad Khalil', status: 'Confirmed' },
  { id: 'APT-4205', customer: 'Nora Al-Fahd', vehicle: 'Kia Sportage 2023', plate: 'RUH 9081', service: 'AC Repair', date: 'Aug 18, 2026', time: '02:30 PM', technician: 'Mohammed Ali', status: 'Pending' },
  { id: 'APT-4206', customer: 'Yusuf Ibrahim', vehicle: 'GMC Sierra 2020', plate: 'JED 5567', service: 'Engine Diagnostic', date: 'Aug 17, 2026', time: '09:00 AM', technician: 'Faisal Ahmed', status: 'Completed' },
  { id: 'APT-4207', customer: 'Sara Al-Mutairi', vehicle: 'Chevrolet Tahoe 2022', plate: 'RUH 2240', service: 'Battery Replacement', date: 'Aug 17, 2026', time: '03:00 PM', technician: 'Ali Hassan', status: 'Cancelled' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Confirmed: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  'In Progress': { bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  Completed: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Cancelled: { bg: 'rgba(239,68,68,.1)', fg: '#EF4444' },
}

export function PortalAppointments() {
  const { t } = usePreferences()

  const todayCount = APPOINTMENTS.filter((a) => a.date === 'Aug 18, 2026').length
  const pendingCount = APPOINTMENTS.filter((a) => a.status === 'Pending').length

  const kpis = [
    { label: t('Today'), value: String(todayCount), icon: 'Calendar', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Pending'), value: String(pendingCount), icon: 'Clock', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('This Week'), value: '31', icon: 'CalendarDays', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Avg Duration'), value: '48m', icon: 'Timer', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<Appointment>[] = [
    { header: t('ID'), cell: (a) => a.id },
    { header: t('Customer'), cell: (a) => a.customer },
    { header: t('Vehicle'), cell: (a) => a.vehicle },
    { header: t('Service'), cell: (a) => t(a.service) },
    { header: t('Date & Time'), cell: (a) => `${a.date} ${a.time}` },
    { header: t('Technician'), cell: (a) => a.technician },
    { header: t('Status'), cell: (a) => <Badge background={STATUS_STYLES[a.status].bg} color={STATUS_STYLES[a.status].fg}>{t(a.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Calendar" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Appointments')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('View and manage service bookings')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <DataTable
        caption="Portal appointments"
        columns={columns}
        rows={APPOINTMENTS}
        rowKey={(a) => a.id}
        mobileCard={(a) => (
          <>
            <MobileCardHeader title={a.customer} trailing={<Badge background={STATUS_STYLES[a.status].bg} color={STATUS_STYLES[a.status].fg}>{t(a.status)}</Badge>} />
            <MobileCardRow label={t('Service')}>{t(a.service)}</MobileCardRow>
            <MobileCardRow label={t('Vehicle')}>{a.vehicle}</MobileCardRow>
            <MobileCardRow label={t('Date')}>{a.date} {a.time}</MobileCardRow>
            <MobileCardRow label={t('Technician')}>{a.technician}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
