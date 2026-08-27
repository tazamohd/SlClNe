import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'

interface TimeEntry {
  date: string
  clockIn: string
  clockOut: string
  breakTime: string
  totalHours: number
  status: 'Complete' | 'Active' | 'Absent'
}

const TIME_ENTRIES: TimeEntry[] = [
  { date: '2025-08-18', clockIn: '07:55 AM', clockOut: '--:--', breakTime: '0h 30m', totalHours: 0, status: 'Active' },
  { date: '2025-08-17', clockIn: '08:00 AM', clockOut: '05:15 PM', breakTime: '1h 00m', totalHours: 8.25, status: 'Complete' },
  { date: '2025-08-16', clockIn: '07:45 AM', clockOut: '05:00 PM', breakTime: '0h 45m', totalHours: 8.5, status: 'Complete' },
  { date: '2025-08-15', clockIn: '08:10 AM', clockOut: '05:30 PM', breakTime: '1h 00m', totalHours: 8.33, status: 'Complete' },
  { date: '2025-08-14', clockIn: '--:--', clockOut: '--:--', breakTime: '--', totalHours: 0, status: 'Absent' },
  { date: '2025-08-13', clockIn: '07:50 AM', clockOut: '05:00 PM', breakTime: '0h 45m', totalHours: 8.42, status: 'Complete' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Complete: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  Active: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Absent: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
}

export function TechnicianPortalTimeClock() {
  const { t } = usePreferences()
  const [clockedIn] = useState(true)

  const kpis = [
    { label: t('Status'), value: clockedIn ? t('Clocked In') : t('Clocked Out'), icon: 'Clock', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Today'), value: '6h 30m', icon: 'Timer', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('This Week'), value: '33.5h', icon: 'Calendar', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Overtime'), value: '1.5h', icon: 'AlertCircle', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  ]

  const columns: Column<TimeEntry>[] = [
    { header: t('Date'), cell: (e) => e.date },
    { header: t('Clock In'), cell: (e) => e.clockIn },
    { header: t('Clock Out'), cell: (e) => e.clockOut },
    { header: t('Break'), cell: (e) => e.breakTime },
    { header: t('Total Hours'), cell: (e) => e.totalHours > 0 ? `${e.totalHours}h` : '--' },
    { header: t('Status'), cell: (e) => <Badge background={STATUS_STYLES[e.status].bg} color={STATUS_STYLES[e.status].fg}>{t(e.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Clock" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Time Clock')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Clock in/out and time tracking')}</p>
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
        caption="Time clock log"
        columns={columns}
        rows={TIME_ENTRIES}
        rowKey={(_, i) => `row-${i}`}
        mobileCard={(e) => (
          <>
            <MobileCardHeader title={e.date} trailing={<Badge background={STATUS_STYLES[e.status].bg} color={STATUS_STYLES[e.status].fg}>{t(e.status)}</Badge>} />
            <MobileCardRow label={t('Clock In')}>{e.clockIn}</MobileCardRow>
            <MobileCardRow label={t('Clock Out')}>{e.clockOut}</MobileCardRow>
            <MobileCardRow label={t('Total Hours')}>{e.totalHours > 0 ? `${e.totalHours}h` : '--'}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
