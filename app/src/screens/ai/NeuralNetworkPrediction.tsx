import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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
  High: ['var(--tint-orange)', 'var(--salis-orange)'],
  Medium: ['var(--tint-blue)', 'var(--salis-blue)'],
  Low: ['var(--tint-neutral)', 'var(--text-muted)'],
}

const MODEL_STATUS_COLORS: Record<string, readonly [string, string]> = {
  Active: ['var(--tint-blue)', 'var(--salis-blue)'],
  Training: ['var(--tint-orange)', 'var(--salis-orange)'],
}

type PredictionRow = (typeof MOCK_PREDICTIONS)[number]

export function NeuralNetworkPrediction() {
  const { t } = usePreferences()

  const critical = MOCK_PREDICTIONS.filter(p => p.priority === 'Critical' || p.priority === 'High').length
  const avgConfidence = Math.round(MOCK_PREDICTIONS.reduce((a, p) => a + p.confidence, 0) / MOCK_PREDICTIONS.length)

  const kpis = [
    { label: t('Predictions'), value: String(MOCK_PREDICTIONS.length), icon: 'Cpu', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Critical/High'), value: String(critical), icon: 'Zap', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Avg Confidence'), value: `${avgConfidence}%`, icon: 'Target', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Active Models'), value: String(MOCK_MODELS.filter(m => m.status === 'Active').length), icon: 'Activity', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<PredictionRow>[] = [
    { header: 'Vehicle', cell: (p) => p.vehicle },
    { header: 'Component', cell: (p) => t(p.component) },
    { header: 'Failure %', cell: (p) => `${p.failureProbability}%` },
    { header: 'Predicted Date', cell: (p) => p.predictedDate },
    { header: 'Mileage', cell: (p) => p.mileage },
    { header: 'Confidence', cell: (p) => `${p.confidence}%` },
    { header: 'Priority', cell: (p) => { const [bg, fg] = PRIORITY_COLORS[p.priority] ?? PRIORITY_COLORS.Low; return <Badge background={bg} color={fg}>{t(p.priority)}</Badge> } },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Cpu" title={t('Neural Network Prediction')} subtitle={t('Predictive maintenance using machine learning')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} />
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

      <h3 className="text-[15px] font-bold text-heading">{t('Failure Predictions')}</h3>
      <DataTable
        caption="Neural network failure predictions"
        columns={columns}
        rows={[...MOCK_PREDICTIONS]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = PRIORITY_COLORS[row.priority] ?? PRIORITY_COLORS.Low
          return (
            <>
              <MobileCardHeader title={row.vehicle} trailing={<Badge background={bg} color={fg}>{t(row.priority)}</Badge>} />
              <MobileCardRow label={t('Component')}>{t(row.component)}</MobileCardRow>
              <MobileCardRow label={t('Failure Prob.')}>{row.failureProbability}%</MobileCardRow>
              <MobileCardRow label={t('Predicted Date')}>{row.predictedDate}</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
