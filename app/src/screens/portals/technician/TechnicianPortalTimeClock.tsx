import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Absent: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

export function TechnicianPortalTimeClock() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [clockedIn] = useState(true)

  const kpis = [
    { label: t('Status'), value: clockedIn ? t('Clocked In') : t('Clocked Out'), icon: 'Clock', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Today'), value: '6h 30m', icon: 'Timer', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('This Week'), value: '33.5h', icon: 'Calendar', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Overtime'), value: '1.5h', icon: 'AlertCircle', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Clock" title={t('Time Clock')} subtitle={t('Clock in/out tracking')} />
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
        {TIME_ENTRIES.map((e, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Clock" size={14} /></span>
                  <p className="text-[13px] font-semibold text-heading">{e.date}</p>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[e.status].bg} color={STATUS_STYLES[e.status].fg}>{t(e.status)}</Badge>}
            />
            <MobileCardRow label={t('Clock In')} value={e.clockIn} />
            <MobileCardRow label={t('Clock Out')} value={e.clockOut} />
            <MobileCardRow label={t('Break')} value={e.breakTime} />
            <MobileCardRow label={t('Total Hours')} value={e.totalHours > 0 ? `${e.totalHours}h` : '--'} />
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

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Time Log')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Date')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Clock In')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Clock Out')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Break')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Total Hours')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {TIME_ENTRIES.map((e, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{e.date}</td>
                  <td className="py-3 pe-4 font-mono text-body">{e.clockIn}</td>
                  <td className="py-3 pe-4 font-mono text-body">{e.clockOut}</td>
                  <td className="py-3 pe-4 text-body">{e.breakTime}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{e.totalHours > 0 ? `${e.totalHours}h` : '--'}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[e.status].bg} color={STATUS_STYLES[e.status].fg}>{t(e.status)}</Badge>
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
