import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Absent: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  Late: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  'Half Day': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Holiday: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function TechnicianPortalAttendance() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Present Days'), value: '18', icon: 'CheckCircle', bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
    { label: t('Late Days'), value: '2', icon: 'Clock', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Absent'), value: '1', icon: 'XCircle', bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
    { label: t('Attendance Rate'), value: '94%', icon: 'TrendingUp', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="CalendarCheck" title={t('Attendance')} subtitle={t('Monthly records')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {ATTENDANCE.map((a, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Calendar" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{a.date}</p>
                    <p className="text-xs text-muted">{t(a.day)}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[a.status].bg} color={STATUS_STYLES[a.status].fg}>{t(a.status)}</Badge>}
            />
            <MobileCardRow label={t('Check In')} value={a.checkIn} />
            <MobileCardRow label={t('Check Out')} value={a.checkOut} />
            <MobileCardRow label={t('Hours')} value={a.totalHours > 0 ? `${a.totalHours.toFixed(1)}h` : '--'} />
          </MobileCard>
        ))}
      </div>
    )
  }

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

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Date')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Day')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Check In')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Check Out')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Hours')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {ATTENDANCE.map((a, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{a.date}</td>
                  <td className="py-3 pe-4 text-body">{t(a.day)}</td>
                  <td className="py-3 pe-4 font-mono text-body">{a.checkIn}</td>
                  <td className="py-3 pe-4 font-mono text-body">{a.checkOut}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{a.totalHours > 0 ? `${a.totalHours.toFixed(1)}h` : '--'}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[a.status].bg} color={STATUS_STYLES[a.status].fg}>{t(a.status)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
