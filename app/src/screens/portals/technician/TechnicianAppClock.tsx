import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'

interface RecentPunch {
  action: 'Clock In' | 'Clock Out' | 'Break Start' | 'Break End'
  time: string
  date: string
}

const RECENT_PUNCHES: RecentPunch[] = [
  { action: 'Clock In', time: '07:55 AM', date: '2025-08-18' },
  { action: 'Break Start', time: '12:00 PM', date: '2025-08-17' },
  { action: 'Break End', time: '12:30 PM', date: '2025-08-17' },
  { action: 'Clock Out', time: '05:15 PM', date: '2025-08-17' },
  { action: 'Clock In', time: '08:00 AM', date: '2025-08-17' },
  { action: 'Clock Out', time: '05:00 PM', date: '2025-08-16' },
]

const ACTION_STYLES: Record<string, { bg: string; fg: string; icon: string }> = {
  'Clock In': { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)', icon: 'LogIn' },
  'Clock Out': { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)', icon: 'LogOut' },
  'Break Start': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)', icon: 'Coffee' },
  'Break End': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)', icon: 'Play' },
}

export function TechnicianAppClock() {
  const { t } = usePreferences()
  const [clockedIn] = useState(true)

  const kpis = [
    { label: t('Status'), value: clockedIn ? t('On Shift') : t('Off Shift'), icon: 'Clock', bg: clockedIn ? 'rgba(16,185,129,.1)' : 'rgba(107,114,128,.1)', fg: clockedIn ? 'rgb(16,185,129)' : 'rgb(107,114,128)' },
    { label: t('Clock In'), value: '07:55 AM', icon: 'LogIn', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Elapsed'), value: '6h 35m', icon: 'Timer', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Break Used'), value: '30m', icon: 'Coffee', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  ]

  const columns: Column<RecentPunch>[] = [
    { header: t('Action'), cell: (p) => <Badge background={ACTION_STYLES[p.action].bg} color={ACTION_STYLES[p.action].fg}>{t(p.action)}</Badge> },
    { header: t('Time'), cell: (p) => p.time },
    { header: t('Date'), cell: (p) => p.date },
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
          <h1 className="font-display text-[30px] font-black text-heading">{t('Clock In/Out')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Quick time punch and history')}</p>
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
        caption="Recent time punches"
        columns={columns}
        rows={RECENT_PUNCHES}
        rowKey={(_, i) => `row-${i}`}
        mobileCard={(p) => (
          <>
            <MobileCardHeader title={t(p.action)} trailing={<Badge background={ACTION_STYLES[p.action].bg} color={ACTION_STYLES[p.action].fg}>{t(p.action)}</Badge>} />
            <MobileCardRow label={t('Time')}>{p.time}</MobileCardRow>
            <MobileCardRow label={t('Date')}>{p.date}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
