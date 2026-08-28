import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const METRICS = [
  { metric: 'CO2 Emissions', category: 'Emissions', currentValue: 42, targetValue: 50, unit: 'tons/yr', status: 'Within Limits' },
  { metric: 'Hazardous Waste', category: 'Waste', currentValue: 8.5, targetValue: 10, unit: 'tons/yr', status: 'Warning' },
  { metric: 'Water Consumption', category: 'Water', currentValue: 1200, targetValue: 1500, unit: 'm³/mo', status: 'Within Limits' },
  { metric: 'Energy Usage', category: 'Energy', currentValue: 95, targetValue: 80, unit: 'MWh/mo', status: 'Exceeding' },
  { metric: 'VOC Emissions', category: 'Emissions', currentValue: 15, targetValue: 25, unit: 'kg/mo', status: 'Within Limits' },
  { metric: 'Solid Waste Recycled', category: 'Waste', currentValue: 72, targetValue: 75, unit: '%', status: 'Warning' },
] as const

const STATUS_PALETTE: Record<string, { bg: string; fg: string }> = {
  'Within Limits': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Warning: { bg: 'rgba(249,115,22,.12)', fg: 'var(--salis-orange)' },
  Exceeding: { bg: 'rgba(234,88,12,.1)', fg: '#EA580C' },
}

function progressPercent(current: number, target: number): number {
  return Math.min(Math.round((current / target) * 100), 100)
}

function progressColor(status: string): string {
  if (status === 'Within Limits') return 'var(--salis-blue)'
  if (status === 'Warning') return 'var(--salis-orange)'
  return '#EA580C'
}

export function EnvironmentalCompliance() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Leaf" title={t('Environmental Compliance')} subtitle={t('Environmental tracking')} />
        {METRICS.map((m, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Leaf" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{t(m.metric)}</p>
                    <p className="text-xs text-muted">{t(m.category)}</p>
                  </div>
                </div>
              }
            />
            <MobileCardRow label={t('Current')} value={`${m.currentValue} ${m.unit}`} />
            <MobileCardRow label={t('Target')} value={`${m.targetValue} ${m.unit}`} />
            <MobileCardRow label={t('Status')}>
              <Badge background={STATUS_PALETTE[m.status].bg} color={STATUS_PALETTE[m.status].fg}>{t(m.status)}</Badge>
            </MobileCardRow>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/50">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressPercent(m.currentValue, m.targetValue)}%`,
                  backgroundColor: progressColor(m.status),
                }}
              />
            </div>
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Leaf" title={t('Environmental Compliance')} subtitle={t('Environmental tracking')} />

      <div className="grid grid-cols-2 gap-4">
        {METRICS.map((m, i) => (
          <Card key={i} className="rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: STATUS_PALETTE[m.status].bg, color: STATUS_PALETTE[m.status].fg }} aria-hidden>
                  <Icon name="Leaf" size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-heading">{t(m.metric)}</p>
                  <p className="text-xs text-muted">{t(m.category)}</p>
                </div>
              </div>
              <Badge background={STATUS_PALETTE[m.status].bg} color={STATUS_PALETTE[m.status].fg}>{t(m.status)}</Badge>
            </div>

            <div className="mt-4 flex items-end justify-between text-sm">
              <div>
                <p className="text-xs text-muted">{t('Current')}</p>
                <p className="font-display text-xl font-black text-heading">{m.currentValue} <span className="text-xs font-normal text-muted">{m.unit}</span></p>
              </div>
              <div className="text-end">
                <p className="text-xs text-muted">{t('Target')}</p>
                <p className="font-mono text-sm text-muted">{m.targetValue} {m.unit}</p>
              </div>
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border/50">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressPercent(m.currentValue, m.targetValue)}%`,
                  backgroundColor: progressColor(m.status),
                }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
