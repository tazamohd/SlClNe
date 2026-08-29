import { useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

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
  'Clock In': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', icon: 'LogIn' },
  'Clock Out': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)', icon: 'LogOut' },
  'Break Start': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)', icon: 'Coffee' },
  'Break End': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', icon: 'Play' },
}

export function TechnicianAppClock() {
  const { t } = usePreferences()
  const [clockedIn] = useState(true)

  const kpis = [
    { label: t('Status'), value: clockedIn ? t('On Shift') : t('Off Shift'), icon: 'Clock', bg: clockedIn ? 'var(--tint-blue)' : 'var(--tint-neutral)', fg: clockedIn ? 'var(--salis-blue)' : 'var(--text-muted)' },
    { label: t('Clock In'), value: '07:55 AM', icon: 'LogIn', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Elapsed'), value: '6h 35m', icon: 'Timer', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Break Used'), value: '30m', icon: 'Coffee', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const columns: Column<RecentPunch>[] = [
    { header: t('Action'), cell: (p) => <Badge background={ACTION_STYLES[p.action].bg} color={ACTION_STYLES[p.action].fg}>{t(p.action)}</Badge> },
    { header: t('Time'), cell: (p) => p.time },
    { header: t('Date'), cell: (p) => p.date },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Clock" title={t('Clock In/Out')} subtitle={t('Quick time punch and history')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
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
