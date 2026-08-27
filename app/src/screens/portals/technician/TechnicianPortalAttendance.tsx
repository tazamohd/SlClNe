import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'

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
  Present: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  Absent: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
  Late: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  'Half Day': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Holiday: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function TechnicianPortalAttendance() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Present Days'), value: '18', icon: 'CheckCircle', bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
    { label: t('Late Days'), value: '2', icon: 'Clock', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Absent'), value: '1', icon: 'XCircle', bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
    { label: t('Attendance Rate'), value: '94%', icon: 'TrendingUp', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
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
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="CalendarCheck" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Attendance')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Monthly attendance records')}</p>
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
