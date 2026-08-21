import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const MOCK_PREDICTIONS = [
  { id: 'PRD-001', vehicle: '2022 Toyota Hilux', component: 'Timing Belt', failureProbability: 89, predictedDate: '2026-09-12', mileage: '142,000 km', confidence: 94, priority: 'Critical' },
  { id: 'PRD-002', vehicle: '2023 Nissan Patrol', component: 'Alternator', failureProbability: 72, predictedDate: '2026-10-05', mileage: '98,000 km', confidence: 88, priority: 'High' },
  { id: 'PRD-003', vehicle: '2021 Honda Accord', component: 'Water Pump', failureProbability: 65, predictedDate: '2026-11-20', mileage: '115,000 km', confidence: 85, priority: 'Medium' },
  { id: 'PRD-004', vehicle: '2024 Hyundai Tucson', component: 'Battery', failureProbability: 58, predictedDate: '2026-12-01', mileage: '45,000 km', confidence: 91, priority: 'Medium' },
  { id: 'PRD-005', vehicle: '2020 Lexus LX 570', component: 'Suspension Bushing', failureProbability: 81, predictedDate: '2026-09-28', mileage: '168,000 km', confidence: 92, priority: 'High' },
  { id: 'PRD-006', vehicle: '2023 GMC Yukon', component: 'Spark Plugs', failureProbability: 45, predictedDate: '2027-01-15', mileage: '72,000 km', confidence: 87, priority: 'Low' },
] as const

const MOCK_MODELS = [
  { name: 'Engine Failure Predictor', version: 'v3.2', accuracy: '96.1%', lastTrained: '2026-08-10', status: 'Active' },
  { name: 'Transmission Analyzer', version: 'v2.8', accuracy: '94.3%', lastTrained: '2026-08-05', status: 'Active' },
  { name: 'Brake Wear Estimator', version: 'v4.0', accuracy: '97.2%', lastTrained: '2026-08-12', status: 'Active' },
  { name: 'Battery Life Predictor', version: 'v1.5', accuracy: '91.8%', lastTrained: '2026-07-28', status: 'Training' },
] as const

const PRIORITY_COLORS: Record<string, readonly [string, string]> = {
  Critical: ['rgba(249,115,22,.15)', 'var(--salis-orange)'],
  High: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Medium: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Low: ['rgba(100,116,139,.1)', '#64748B'],
}

const MODEL_STATUS_COLORS: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Training: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
}

export function NeuralNetworkPrediction() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const critical = MOCK_PREDICTIONS.filter(p => p.priority === 'Critical' || p.priority === 'High').length
  const avgConfidence = Math.round(MOCK_PREDICTIONS.reduce((a, p) => a + p.confidence, 0) / MOCK_PREDICTIONS.length)

  const kpis = [
    { label: t('Predictions'), value: String(MOCK_PREDICTIONS.length), icon: 'Cpu', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Critical/High'), value: String(critical), icon: 'Zap', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Avg Confidence'), value: `${avgConfidence}%`, icon: 'Target', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active Models'), value: String(MOCK_MODELS.filter(m => m.status === 'Active').length), icon: 'Activity', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Cpu" title={t('Neural Prediction')} subtitle={t('Predictive Maintenance')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {MOCK_PREDICTIONS.map(p => {
          const [bg, fg] = PRIORITY_COLORS[p.priority] ?? PRIORITY_COLORS.Low
          return (
            <MobileCard key={p.id}>
              <MobileCardHeader title={p.vehicle} trailing={<Badge background={bg} color={fg}>{t(p.priority)}</Badge>} />
              <MobileCardRow label={t('Component')}>{t(p.component)}</MobileCardRow>
              <MobileCardRow label={t('Failure Prob.')}>{p.failureProbability}%</MobileCardRow>
              <MobileCardRow label={t('Predicted Date')}>{p.predictedDate}</MobileCardRow>
              <MobileCardRow label={t('Mileage')}>{p.mileage}</MobileCardRow>
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
            <Icon name="Cpu" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Neural Network Prediction')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Predictive maintenance using machine learning')}</p>
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
        <h3 className="mb-4 text-[15px] font-bold text-heading">{t('ML Models')}</h3>
        <div className="grid grid-cols-2 gap-4">
          {MOCK_MODELS.map(m => {
            const [bg, fg] = MODEL_STATUS_COLORS[m.status] ?? MODEL_STATUS_COLORS.Active
            return (
              <div key={m.name} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-heading">{t(m.name)}</span>
                  <Badge background={bg} color={fg}>{t(m.status)}</Badge>
                </div>
                <div className="mt-2 flex gap-4 text-[12px] text-muted">
                  <span>{m.version}</span>
                  <span>{t('Accuracy')}: {m.accuracy}</span>
                  <span>{t('Trained')}: {m.lastTrained}</span>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h3 className="mb-4 text-[15px] font-bold text-heading">{t('Failure Predictions')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Vehicle')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Component')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Failure %')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Predicted Date')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Mileage')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Confidence')}</th>
                <th className="pb-3 text-start font-medium">{t('Priority')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PREDICTIONS.map(p => {
                const [bg, fg] = PRIORITY_COLORS[p.priority] ?? PRIORITY_COLORS.Low
                return (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 text-[13px] text-heading">{p.vehicle}</td>
                    <td className="py-3 pe-4 text-[13px] text-heading">{t(p.component)}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{p.failureProbability}%</td>
                    <td className="py-3 pe-4 text-[13px] text-muted" dir="ltr">{p.predictedDate}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{p.mileage}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{p.confidence}%</td>
                    <td className="py-3"><Badge background={bg} color={fg}>{t(p.priority)}</Badge></td>
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
