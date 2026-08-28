import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface QuickAction {
  label: string
  icon: string
  count: number
}

interface ActiveJob {
  workOrder: string
  vehicle: string
  service: string
  progress: number
  status: 'In Progress' | 'Paused'
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Active Jobs', icon: 'Wrench', count: 2 },
  { label: 'Parts Queue', icon: 'Package', count: 3 },
  { label: 'Notifications', icon: 'Bell', count: 5 },
  { label: 'Time Clock', icon: 'Clock', count: 0 },
]

const ACTIVE_JOBS: ActiveJob[] = [
  { workOrder: 'WO-8830', vehicle: '2021 Honda Accord', service: 'Full Brake Service', progress: 65, status: 'In Progress' },
  { workOrder: 'WO-8831', vehicle: '2022 Toyota Camry', service: 'Engine Tune-up', progress: 10, status: 'Paused' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  'In Progress': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Paused: { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
}

export function TechnicianMobile() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Smartphone" title={t('Technician Mobile')} subtitle={t('Mobile dashboard')} />
        <Card className="rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(10,94,215,.1)] text-salis-blue">
              <Icon name="User" size={20} />
            </span>
            <div>
              <p className="text-[13px] font-bold text-heading">{t('Ahmed Al-Farsi')}</p>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[var(--salis-blue)]" />
                <span className="text-xs text-muted">{t('Clocked In')} - 6h 30m</span>
              </div>
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Card key={a.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name={a.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{t(a.label)}</span>
              </div>
              <h4 className="mt-1.5 font-display text-xl font-black text-heading">{a.count > 0 ? a.count : '--'}</h4>
            </Card>
          ))}
        </div>
        {ACTIVE_JOBS.map((j) => (
          <MobileCard key={j.workOrder}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Wrench" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{j.service}</p>
                    <p className="text-xs text-muted">{j.vehicle}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[j.status].bg} color={STATUS_STYLES[j.status].fg}>{t(j.status)}</Badge>}
            />
            <MobileCardRow label={t('Work Order')} value={j.workOrder} />
            <MobileCardRow label={t('Progress')} value={`${j.progress}%`} />
            <div className="px-4 pb-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(10,94,215,.1)]">
                <div className="h-full rounded-full bg-salis-blue transition-all" style={{ width: `${j.progress}%` }} />
              </div>
            </div>
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Smartphone" title={t('Technician Mobile')} subtitle={t('Mobile-first technician view')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {QUICK_ACTIONS.map((a) => (
          <Card key={a.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name={a.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{t(a.label)}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{a.count > 0 ? a.count : '--'}</h4>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-heading">{t('Active Jobs')}</h2>
        <div className="grid gap-4">
          {ACTIVE_JOBS.map((j) => (
            <div key={j.workOrder} className="flex items-center gap-4 rounded-xl border border-border/50 p-4">
              <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-2 text-salis-blue" aria-hidden><Icon name="Wrench" size={18} /></span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-heading">{j.service}</p>
                    <p className="text-xs text-muted">{j.vehicle} - {j.workOrder}</p>
                  </div>
                  <Badge background={STATUS_STYLES[j.status].bg} color={STATUS_STYLES[j.status].fg}>{t(j.status)}</Badge>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[rgba(10,94,215,.1)]">
                  <div className="h-full rounded-full bg-salis-blue transition-all" style={{ width: `${j.progress}%` }} />
                </div>
                <p className="mt-1 text-end text-xs text-muted">{j.progress}%</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
