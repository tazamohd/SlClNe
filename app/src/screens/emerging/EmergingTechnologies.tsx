import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const MOCK_TECHNOLOGIES = [
  { id: 'ET-001', name: 'IoT Vehicle Diagnostics', category: 'IoT', status: 'Production', adoption: 78, impact: 'High', description: 'Real-time OBD-II telemetry from connected vehicles' },
  { id: 'ET-002', name: 'Digital Twin Engine', category: 'Digital Twin', status: 'Beta', adoption: 35, impact: 'High', description: 'Virtual replica of workshop operations' },
  { id: 'ET-003', name: 'Edge Computing Nodes', category: 'Edge', status: 'Production', adoption: 62, impact: 'Medium', description: 'Local processing for latency-sensitive operations' },
  { id: 'ET-004', name: 'Computer Vision QC', category: 'AI/CV', status: 'Pilot', adoption: 15, impact: 'High', description: 'Automated quality inspection using cameras' },
  { id: 'ET-005', name: 'Blockchain Parts Tracking', category: 'Blockchain', status: 'Research', adoption: 5, impact: 'Medium', description: 'Immutable supply chain provenance records' },
  { id: 'ET-006', name: 'AR Repair Guides', category: 'AR/VR', status: 'Pilot', adoption: 12, impact: 'Medium', description: 'Augmented reality overlays for technicians' },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Production: ['var(--tint-blue)', 'var(--salis-blue)'],
  Beta: ['rgba(10,94,215,.15)', 'var(--salis-blue)'],
  Pilot: ['var(--tint-orange)', 'var(--salis-orange)'],
  Research: ['var(--tint-neutral)', 'var(--text-muted)'],
}

export function EmergingTechnologies() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const inProduction = MOCK_TECHNOLOGIES.filter(t => t.status === 'Production').length
  const avgAdoption = Math.round(MOCK_TECHNOLOGIES.reduce((a, t) => a + t.adoption, 0) / MOCK_TECHNOLOGIES.length)

  const kpis = [
    { label: t('Technologies'), value: String(MOCK_TECHNOLOGIES.length), icon: 'Cpu', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('In Production'), value: String(inProduction), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Avg Adoption'), value: `${avgAdoption}%`, icon: 'TrendingUp', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('High Impact'), value: String(MOCK_TECHNOLOGIES.filter(t => t.impact === 'High').length), icon: 'Zap', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Cpu" title={t('Emerging Tech')} subtitle={t('Technology Overview')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {MOCK_TECHNOLOGIES.map(tech => {
          const [bg, fg] = STATUS_COLORS[tech.status] ?? STATUS_COLORS.Research
          return (
            <MobileCard key={tech.id}>
              <MobileCardHeader title={t(tech.name)} trailing={<Badge background={bg} color={fg}>{t(tech.status)}</Badge>} />
              <MobileCardRow label={t('Category')}>{tech.category}</MobileCardRow>
              <MobileCardRow label={t('Adoption')}>{tech.adoption}%</MobileCardRow>
              <MobileCardRow label={t('Impact')}>{t(tech.impact)}</MobileCardRow>
              <MobileCardRow>{t(tech.description)}</MobileCardRow>
            </MobileCard>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Cpu" title={t('Emerging Technologies')} subtitle={t('Overview of emerging technology features')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {MOCK_TECHNOLOGIES.map(tech => {
          const [bg, fg] = STATUS_COLORS[tech.status] ?? STATUS_COLORS.Research
          return (
            <Card key={tech.id} className="rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden><Icon name="Cpu" size={16} /></span>
                  <h2 className="text-[14px] font-bold text-heading">{t(tech.name)}</h2>
                </div>
                <Badge background={bg} color={fg}>{t(tech.status)}</Badge>
              </div>
              <p className="mt-2 text-[13px] text-muted">{t(tech.description)}</p>
              <div className="mt-3 flex items-center gap-4 text-[12px] text-muted">
                <span>{tech.category}</span>
                <span>{t('Adoption')}: {tech.adoption}%</span>
                <span>{t('Impact')}: {t(tech.impact)}</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-border">
                <div className="h-full rounded-full bg-salis-blue" style={{ width: `${tech.adoption}%` }} />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
