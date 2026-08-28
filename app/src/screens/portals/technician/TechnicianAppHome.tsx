import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface Notification {
  id: string
  message: string
  time: string
  type: 'job' | 'parts' | 'schedule' | 'alert'
  read: boolean
}

const NOTIFICATIONS: Notification[] = [
  { id: 'N-1', message: 'New job assigned: WO-8835 - Kia Sportage', time: '5 min ago', type: 'job', read: false },
  { id: 'N-2', message: 'Parts delivered for WO-8830', time: '15 min ago', type: 'parts', read: false },
  { id: 'N-3', message: 'Schedule change: Break moved to 1:30 PM', time: '1h ago', type: 'schedule', read: true },
  { id: 'N-4', message: 'Safety reminder: Bay 5 floor cleaning required', time: '2h ago', type: 'alert', read: true },
  { id: 'N-5', message: 'WO-8828 quality check approved', time: '3h ago', type: 'job', read: true },
]

const TYPE_ICONS: Record<string, string> = {
  job: 'Wrench',
  parts: 'Package',
  schedule: 'Calendar',
  alert: 'AlertTriangle',
}

const TYPE_STYLES: Record<string, { bg: string; fg: string }> = {
  job: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  parts: { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  schedule: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  alert: { bg: 'var(--tint-orange)', fg: 'rgb(249,115,22)' },
}

export function TechnicianAppHome() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Jobs Today'), value: '5', icon: 'Clipboard', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Completed'), value: '3', icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Hours Logged'), value: '6.5h', icon: 'Clock', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Unread'), value: '2', icon: 'Bell', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Home" title={t('Home')} subtitle={t('Welcome, Ahmed')} />
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
        {NOTIFICATIONS.map((n) => (
          <MobileCard key={n.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5" style={{ background: TYPE_STYLES[n.type].bg, color: TYPE_STYLES[n.type].fg }} aria-hidden><Icon name={TYPE_ICONS[n.type]} size={14} /></span>
                  <div>
                    <p className={`text-[13px] ${n.read ? 'text-body' : 'font-semibold text-heading'}`}>{n.message}</p>
                    <p className="text-xs text-muted">{n.time}</p>
                  </div>
                </div>
              }
              trailing={!n.read ? <span className="h-2 w-2 rounded-full bg-salis-blue" /> : undefined}
            />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Home" title={t('Home')} subtitle={t('Welcome back, Ahmed')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Notifications')}</h2>
        <div className="grid gap-3">
          {NOTIFICATIONS.map((n) => (
            <div key={n.id} className="flex items-center gap-3 rounded-xl border border-border/50 p-3">
              <span className="flex rounded-lg p-1.5" style={{ background: TYPE_STYLES[n.type].bg, color: TYPE_STYLES[n.type].fg }} aria-hidden><Icon name={TYPE_ICONS[n.type]} size={16} /></span>
              <div className="flex-1">
                <p className={`text-sm ${n.read ? 'text-body' : 'font-semibold text-heading'}`}>{n.message}</p>
                <p className="text-xs text-muted">{n.time}</p>
              </div>
              {!n.read && <span className="h-2 w-2 rounded-full bg-salis-blue" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
