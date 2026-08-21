import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  const isMobile = useIsMobile()
  const [clockedIn] = useState(true)

  const kpis = [
    { label: t('Status'), value: clockedIn ? t('On Shift') : t('Off Shift'), icon: 'Clock', bg: clockedIn ? 'rgba(16,185,129,.1)' : 'rgba(107,114,128,.1)', fg: clockedIn ? 'rgb(16,185,129)' : 'rgb(107,114,128)' },
    { label: t('Clock In'), value: '07:55 AM', icon: 'LogIn', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Elapsed'), value: '6h 35m', icon: 'Timer', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Break Used'), value: '30m', icon: 'Coffee', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Clock" title={t('Clock In/Out')} subtitle={t('Quick time punch')} />
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
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Recent Punches')}</p>} />
          {RECENT_PUNCHES.map((p, i) => (
            <MobileCardRow key={i} label={t(p.action)} value={`${p.time} - ${p.date}`} />
          ))}
        </MobileCard>
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

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Recent Punches')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Action')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Time')}</th>
                <th className="pb-3 text-start font-medium">{t('Date')}</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_PUNCHES.map((p, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4">
                    <Badge background={ACTION_STYLES[p.action].bg} color={ACTION_STYLES[p.action].fg}>{t(p.action)}</Badge>
                  </td>
                  <td className="py-3 pe-4 font-mono text-heading">{p.time}</td>
                  <td className="py-3 text-body">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
