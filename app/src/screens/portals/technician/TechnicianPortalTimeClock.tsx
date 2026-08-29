import { useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

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
  Complete: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Active: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Absent: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
}

export function TechnicianPortalTimeClock() {
  const { t } = usePreferences()
  const [clockedIn] = useState(true)

  const kpis = [
    { label: t('Status'), value: clockedIn ? t('Clocked In') : t('Clocked Out'), icon: 'Clock', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Today'), value: '6h 30m', icon: 'Timer', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('This Week'), value: '33.5h', icon: 'Calendar', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Overtime'), value: '1.5h', icon: 'AlertCircle', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
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
      <PageHeader icon="Clock" title={t('Time Clock')} subtitle={t('Clock in/out and time tracking')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
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
