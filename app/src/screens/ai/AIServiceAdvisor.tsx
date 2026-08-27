import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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

type RecRow = (typeof MOCK_RECOMMENDATIONS)[number]

export function AIServiceAdvisor() {
  const { t } = usePreferences()

  const highUrgency = MOCK_RECOMMENDATIONS.filter(r => r.urgency === 'High').length
  const avgConfidence = Math.round(MOCK_RECOMMENDATIONS.reduce((a, r) => a + r.confidence, 0) / MOCK_RECOMMENDATIONS.length)

  const kpis = [
    { label: t('Recommendations'), value: String(MOCK_RECOMMENDATIONS.length), icon: 'Lightbulb', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('High Priority'), value: String(highUrgency), icon: 'Zap', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Avg Confidence'), value: `${avgConfidence}%`, icon: 'Target', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Vehicles Scanned'), value: '148', icon: 'Car', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<RecRow>[] = [
    { header: 'Vehicle', cell: (r) => r.vehicle },
    { header: 'Service', cell: (r) => t(r.service) },
    { header: 'Urgency', cell: (r) => { const [bg, fg] = URGENCY_COLORS[r.urgency] ?? URGENCY_COLORS.Low; return <Badge background={bg} color={fg}>{t(r.urgency)}</Badge> } },
    { header: 'Confidence', cell: (r) => `${r.confidence}%` },
    { header: 'Reason', cell: (r) => t(r.reason) },
    { header: 'Est. Cost', cell: (r) => r.estimatedCost },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Lightbulb" title={t('AI Service Advisor')} subtitle={t('AI-powered service recommendations for vehicles')} />

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

      <h3 className="text-[15px] font-bold text-heading">{t('Service Recommendations')}</h3>
      <DataTable
        caption="AI service recommendations"
        columns={columns}
        rows={[...MOCK_RECOMMENDATIONS]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = URGENCY_COLORS[row.urgency] ?? URGENCY_COLORS.Low
          return (
            <>
              <MobileCardHeader title={row.vehicle} trailing={<Badge background={bg} color={fg}>{t(row.urgency)}</Badge>} />
              <MobileCardRow label={t('Service')}>{t(row.service)}</MobileCardRow>
              <MobileCardRow label={t('Confidence')}>{row.confidence}%</MobileCardRow>
              <MobileCardRow label={t('Est. Cost')}>{row.estimatedCost}</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
