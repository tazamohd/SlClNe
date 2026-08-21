import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const MOCK_RECOMMENDATIONS = [
  { id: 'REC-001', vehicle: '2024 Toyota Camry', vin: 'JTDKN3DU5R0...', service: 'Brake Pad Replacement', urgency: 'High', confidence: 96, reason: 'Wear pattern detected at 82% threshold', estimatedCost: 'SAR 450' },
  { id: 'REC-002', vehicle: '2023 Honda Accord', vin: '1HGCV1F34P0...', service: 'Oil Change', urgency: 'Medium', confidence: 92, reason: 'Mileage-based interval reached', estimatedCost: 'SAR 180' },
  { id: 'REC-003', vehicle: '2022 Nissan Patrol', vin: 'JN1TBNT32Z0...', service: 'Transmission Fluid', urgency: 'Medium', confidence: 89, reason: 'Fluid analysis indicates degradation', estimatedCost: 'SAR 320' },
  { id: 'REC-004', vehicle: '2024 Hyundai Tucson', vin: 'KM8J3CAL6R0...', service: 'Air Filter Replacement', urgency: 'Low', confidence: 85, reason: 'Dusty driving conditions detected', estimatedCost: 'SAR 95' },
  { id: 'REC-005', vehicle: '2023 Lexus ES 350', vin: 'JTHBK1GG5N0...', service: 'Tire Rotation', urgency: 'Medium', confidence: 91, reason: 'Uneven wear pattern on front tires', estimatedCost: 'SAR 120' },
  { id: 'REC-006', vehicle: '2021 GMC Sierra', vin: '3GTU9DED5M0...', service: 'Battery Test', urgency: 'High', confidence: 94, reason: 'Voltage drop detected during startup', estimatedCost: 'SAR 60' },
] as const

const URGENCY_COLORS: Record<string, readonly [string, string]> = {
  High: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Medium: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Low: ['rgba(100,116,139,.1)', '#64748B'],
}

export function AIServiceAdvisor() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const highUrgency = MOCK_RECOMMENDATIONS.filter(r => r.urgency === 'High').length
  const avgConfidence = Math.round(MOCK_RECOMMENDATIONS.reduce((a, r) => a + r.confidence, 0) / MOCK_RECOMMENDATIONS.length)

  const kpis = [
    { label: t('Recommendations'), value: String(MOCK_RECOMMENDATIONS.length), icon: 'Lightbulb', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('High Priority'), value: String(highUrgency), icon: 'Zap', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Avg Confidence'), value: `${avgConfidence}%`, icon: 'Target', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Vehicles Scanned'), value: '148', icon: 'Car', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Lightbulb" title={t('Service Advisor')} subtitle={t('AI Recommendations')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {MOCK_RECOMMENDATIONS.map(r => {
          const [bg, fg] = URGENCY_COLORS[r.urgency] ?? URGENCY_COLORS.Low
          return (
            <MobileCard key={r.id}>
              <MobileCardHeader title={r.vehicle} trailing={<Badge background={bg} color={fg}>{t(r.urgency)}</Badge>} />
              <MobileCardRow label={t('Service')}>{t(r.service)}</MobileCardRow>
              <MobileCardRow label={t('Confidence')}>{r.confidence}%</MobileCardRow>
              <MobileCardRow label={t('Reason')}>{t(r.reason)}</MobileCardRow>
              <MobileCardRow label={t('Est. Cost')}>{r.estimatedCost}</MobileCardRow>
            </MobileCard>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Lightbulb" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('AI Service Advisor')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('AI-powered service recommendations for vehicles')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
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
        <h3 className="mb-4 text-[15px] font-bold text-heading">{t('Service Recommendations')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Vehicle')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Service')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Urgency')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Confidence')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Reason')}</th>
                <th className="pb-3 text-end font-medium">{t('Est. Cost')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RECOMMENDATIONS.map(r => {
                const [bg, fg] = URGENCY_COLORS[r.urgency] ?? URGENCY_COLORS.Low
                return (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 text-[13px] text-heading">{r.vehicle}</td>
                    <td className="py-3 pe-4 text-[13px] text-heading">{t(r.service)}</td>
                    <td className="py-3 pe-4"><Badge background={bg} color={fg}>{t(r.urgency)}</Badge></td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{r.confidence}%</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{t(r.reason)}</td>
                    <td className="py-3 text-end font-mono text-[13px] text-heading">{r.estimatedCost}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
