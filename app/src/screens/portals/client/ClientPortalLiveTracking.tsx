import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface TrackingItem {
  vehicle: string
  workOrder: string
  service: string
  technician: string
  stage: 'Checked In' | 'Diagnosis' | 'In Progress' | 'Quality Check' | 'Ready'
  estimatedCompletion: string
  progress: number
}

const TRACKING: TrackingItem[] = [
  { vehicle: '2021 Honda Accord', workOrder: 'WO-8830', service: 'Full Brake Service', technician: 'Saad Al-Otaibi', stage: 'In Progress', estimatedCompletion: '3:30 PM', progress: 60 },
  { vehicle: '2022 Toyota Camry', workOrder: 'WO-8831', service: 'Engine Tune-up', technician: 'Ahmed Al-Farsi', stage: 'Diagnosis', estimatedCompletion: '5:00 PM', progress: 25 },
]

const STAGE_STYLES: Record<string, { bg: string; fg: string }> = {
  'Checked In': { bg: 'var(--tint-neutral)', fg: 'rgb(107,114,128)' },
  Diagnosis: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  'In Progress': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  'Quality Check': { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  Ready: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
}

const STAGES = ['Checked In', 'Diagnosis', 'In Progress', 'Quality Check', 'Ready']

export function ClientPortalLiveTracking() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Radio" title={t('Live Tracking')} subtitle={t('Real-time service status')} />
        {TRACKING.map((item) => (
          <MobileCard key={item.workOrder}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[var(--tint-blue)] p-1.5 text-salis-blue" aria-hidden><Icon name="Radio" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{item.service}</p>
                    <p className="text-xs text-muted">{item.vehicle}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STAGE_STYLES[item.stage].bg} color={STAGE_STYLES[item.stage].fg}>{t(item.stage)}</Badge>}
            />
            <MobileCardRow label={t('Technician')} value={item.technician} />
            <MobileCardRow label={t('ETA')} value={item.estimatedCompletion} />
            <MobileCardRow label={t('Progress')} value={`${item.progress}%`} />
            <div className="px-4 pb-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--tint-blue)]">
                <div className="h-full rounded-full bg-salis-blue transition-all" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Radio" title={t('Live Tracking')} subtitle={t('Real-time service progress')} />

      {TRACKING.map((item) => (
        <Card key={item.workOrder} className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex rounded-lg bg-[var(--tint-blue)] p-2 text-salis-blue" aria-hidden><Icon name="Car" size={18} /></span>
              <div>
                <h3 className="text-sm font-semibold text-heading">{item.vehicle}</h3>
                <p className="text-xs text-muted">{item.workOrder} - {item.service}</p>
              </div>
            </div>
            <Badge background={STAGE_STYLES[item.stage].bg} color={STAGE_STYLES[item.stage].fg}>{t(item.stage)}</Badge>
          </div>

          <div className="mb-4 flex items-center gap-2">
            {STAGES.map((stage, idx) => {
              const currentIdx = STAGES.indexOf(item.stage)
              const isActive = idx <= currentIdx
              return (
                <div key={stage} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: isActive ? 'var(--salis-blue)' : 'var(--tint-blue)',
                      color: isActive ? '#FFFFFF' : 'var(--salis-blue)',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-[10px] text-muted">{t(stage)}</span>
                </div>
              )
            })}
          </div>

          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-[var(--tint-blue)]">
            <div className="h-full rounded-full bg-salis-blue transition-all" style={{ width: `${item.progress}%` }} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <span>{t('Technician')}: {item.technician}</span>
            <span>{t('ETA')}: {item.estimatedCompletion}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}
