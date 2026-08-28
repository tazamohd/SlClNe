import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface AttendanceRecord {
  date: string
  day: string
  checkIn: string
  checkOut: string
  totalHours: number
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Holiday'
}

const ATTENDANCE: AttendanceRecord[] = [
  { date: '2025-08-18', day: 'Monday', checkIn: '07:55 AM', checkOut: '--:--', totalHours: 0, status: 'Present' },
  { date: '2025-08-17', day: 'Sunday', checkIn: '08:00 AM', checkOut: '05:15 PM', totalHours: 8.25, status: 'Present' },
  { date: '2025-08-16', day: 'Saturday', checkIn: '08:20 AM', checkOut: '05:00 PM', totalHours: 7.67, status: 'Late' },
  { date: '2025-08-15', day: 'Friday', checkIn: '--:--', checkOut: '--:--', totalHours: 0, status: 'Holiday' },
  { date: '2025-08-14', day: 'Thursday', checkIn: '--:--', checkOut: '--:--', totalHours: 0, status: 'Absent' },
  { date: '2025-08-13', day: 'Wednesday', checkIn: '07:50 AM', checkOut: '01:00 PM', totalHours: 4.17, status: 'Half Day' },
  { date: '2025-08-12', day: 'Tuesday', checkIn: '07:45 AM', checkOut: '05:00 PM', totalHours: 8.25, status: 'Present' },
  { date: '2025-08-11', day: 'Monday', checkIn: '08:00 AM', checkOut: '05:10 PM', totalHours: 8.17, status: 'Present' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Present: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Absent: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Late: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  'Half Day': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Holiday: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
}

export function TechnicianPortalAttendance() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Present Days'), value: '18', icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Late Days'), value: '2', icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Absent'), value: '1', icon: 'XCircle', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Attendance Rate'), value: '94%', icon: 'TrendingUp', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<AttendanceRecord>[] = [
    { header: t('Date'), cell: (a) => a.date },
    { header: t('Day'), cell: (a) => t(a.day) },
    { header: t('Check In'), cell: (a) => a.checkIn },
    { header: t('Check Out'), cell: (a) => a.checkOut },
    { header: t('Hours'), cell: (a) => a.totalHours > 0 ? `${a.totalHours.toFixed(1)}h` : '--' },
    { header: t('Status'), cell: (a) => <Badge background={STATUS_STYLES[a.status].bg} color={STATUS_STYLES[a.status].fg}>{t(a.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="CalendarCheck" title={t('Attendance')} subtitle={t('Monthly attendance records')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Attendance records"
        columns={columns}
        rows={ATTENDANCE}
        rowKey={(_, i) => `row-${i}`}
        mobileCard={(a) => (
          <>
            <MobileCardHeader title={a.date} trailing={<Badge background={STATUS_STYLES[a.status].bg} color={STATUS_STYLES[a.status].fg}>{t(a.status)}</Badge>} />
            <MobileCardRow label={t('Day')}>{t(a.day)}</MobileCardRow>
            <MobileCardRow label={t('Check In')}>{a.checkIn}</MobileCardRow>
            <MobileCardRow label={t('Hours')}>{a.totalHours > 0 ? `${a.totalHours.toFixed(1)}h` : '--'}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
