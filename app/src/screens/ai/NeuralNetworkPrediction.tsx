import { useState } from 'react'
import { FeatureHeader, Section, StatRow, TabBar } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

interface Prediction {
  id: string
  model: string
  metric: string
  currentValue: string
  predictedValue: string
  change: string
  confidence: number
  horizon: string
  icon: string
  tone: readonly [string, string]
}

const PREDICTIONS: Prediction[] = [
  {
    id: 'pred-1',
    model: 'Revenue Forecast',
    metric: 'Monthly Revenue',
    currentValue: 'SAR 485K',
    predictedValue: 'SAR 520K',
    change: '+7.2%',
    confidence: 91,
    horizon: 'Next 30 days',
    icon: 'TrendingUp',
    tone: ['rgba(10,94,215,.1)', '#0A5ED7'],
  },
  {
    id: 'pred-2',
    model: 'Demand Forecast',
    metric: 'Service Appointments',
    currentValue: '342',
    predictedValue: '389',
    change: '+13.7%',
    confidence: 87,
    horizon: 'Next 14 days',
    icon: 'Calendar',
    tone: ['rgba(11,179,255,.1)', '#0BB3FF'],
  },
  {
    id: 'pred-3',
    model: 'Parts Demand',
    metric: 'Oil Filters (stock units)',
    currentValue: '145',
    predictedValue: '62',
    change: '-57%',
    confidence: 93,
    horizon: 'Next 30 days',
    icon: 'Package',
    tone: ['rgba(249,115,22,.1)', '#F97316'],
  },
  {
    id: 'pred-4',
    model: 'Customer Churn',
    metric: 'At-risk Customers',
    currentValue: '18',
    predictedValue: '24',
    change: '+33%',
    confidence: 79,
    horizon: 'Next 60 days',
    icon: 'UserMinus',
    tone: ['rgba(11,31,59,.1)', '#0B1F3B'],
  },
  {
    id: 'pred-5',
    model: 'Staffing Needs',
    metric: 'Technicians Required',
    currentValue: '12',
    predictedValue: '15',
    change: '+25%',
    confidence: 84,
    horizon: 'Next 30 days',
    icon: 'Users',
    tone: ['rgba(100,116,139,.1)', '#64748B'],
  },
]

const TABS = [
  { id: 'predictions', label: 'Predictions', icon: 'Cpu' },
  { id: 'models', label: 'Models', icon: 'Cpu' },
  { id: 'accuracy', label: 'Accuracy', icon: 'Target' },
] as const

interface ModelInfo {
  name: string
  type: string
  lastTrained: string
  accuracy: number
  dataPoints: string
  status: 'active' | 'training' | 'idle'
}

const MODELS: ModelInfo[] = [
  { name: 'Revenue LSTM', type: 'Long Short-Term Memory', lastTrained: '2 hours ago', accuracy: 91, dataPoints: '24K', status: 'active' },
  { name: 'Demand Prophet', type: 'Time Series Decomposition', lastTrained: '6 hours ago', accuracy: 87, dataPoints: '18K', status: 'active' },
  { name: 'Parts Consumption', type: 'Gradient Boosting', lastTrained: '1 day ago', accuracy: 93, dataPoints: '45K', status: 'active' },
  { name: 'Churn Classifier', type: 'Random Forest', lastTrained: '3 days ago', accuracy: 79, dataPoints: '8K', status: 'training' },
  { name: 'Staff Optimizer', type: 'Linear Regression', lastTrained: '1 week ago', accuracy: 84, dataPoints: '12K', status: 'idle' },
]

const MODEL_STATUS: Record<string, { bg: string; fg: string }> = {
  active: { bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
  training: { bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
  idle: { bg: 'rgba(100,116,139,.1)', fg: '#64748B' },
}

const REVENUE_LINE =
  'M30,110 C70,105 110,95 150,85 C190,80 230,70 270,65 C310,60 350,55 390,45 C430,50 470,40 510,30'
const DEMAND_LINE =
  'M30,100 C70,90 110,95 150,80 C190,85 230,70 270,75 C310,60 350,65 390,50 C430,55 470,45 510,35'

export function NeuralNetworkPrediction() {
  const { t } = usePreferences()
  const [tab, setTab] = useState('predictions')

  return (
    <>
      <FeatureHeader
        icon="Sparkles"
        title={t('Neural Network Prediction')}
        subtitle={t('Predictive analytics dashboard')}
      />

      <StatRow
        stats={[
          { label: 'Active Models', value: MODELS.filter((m) => m.status === 'active').length, highlight: true, icon: 'Cpu' },
          { label: 'Predictions Today', value: '1,247', tone: 'info', icon: 'Activity' },
          { label: 'Avg Accuracy', value: '87%', icon: 'Target' },
          { label: 'Data Points', value: '107K', icon: 'Database' },
        ]}
      />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'predictions' && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Section title={t('Revenue Forecast')}>
              <svg
                viewBox="0 0 560 140"
                className="block h-auto w-full"
                role="img"
                aria-label={t('Revenue Forecast')}
              >
                <defs>
                  <linearGradient id="nnRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0A5ED7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0A5ED7" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${REVENUE_LINE} L510,130 L30,130 Z`} fill="url(#nnRevGrad)" />
                <path d={REVENUE_LINE} fill="none" stroke="#0A5ED7" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="390" y1="0" x2="390" y2="130" stroke="#64748B" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                <text x="395" y="12" fontSize="9" fill="#64748B" fontFamily="Inter,sans-serif">{t('Forecast')}</text>
              </svg>
            </Section>

            <Section title={t('Demand Forecast')}>
              <svg
                viewBox="0 0 560 140"
                className="block h-auto w-full"
                role="img"
                aria-label={t('Demand Forecast')}
              >
                <defs>
                  <linearGradient id="nnDemGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0BB3FF" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0BB3FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${DEMAND_LINE} L510,130 L30,130 Z`} fill="url(#nnDemGrad)" />
                <path d={DEMAND_LINE} fill="none" stroke="#0BB3FF" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="390" y1="0" x2="390" y2="130" stroke="#64748B" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                <text x="395" y="12" fontSize="9" fill="#64748B" fontFamily="Inter,sans-serif">{t('Forecast')}</text>
              </svg>
            </Section>
          </div>

          <div className="flex flex-col gap-4">
            {PREDICTIONS.map((pred) => {
              const [bg, fg] = pred.tone
              return (
                <Card key={pred.id} className="flex items-center gap-4 rounded-2xl p-5">
                  <span
                    className="flex flex-shrink-0 rounded-[10px] p-2"
                    style={{ background: bg, color: fg }}
                  >
                    <Icon name={pred.icon} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-sm font-bold text-heading">
                      {t(pred.model)}
                    </h3>
                    <p className="text-xs text-muted">{t(pred.metric)}</p>
                  </div>
                  <div className="hidden text-center sm:block">
                    <p className="text-xs text-muted">{t('Current')}</p>
                    <p className="font-display text-base font-bold text-heading">{pred.currentValue}</p>
                  </div>
                  <Icon name="ArrowRight" size={14} className="hidden text-muted sm:block" />
                  <div className="text-center">
                    <p className="text-xs text-muted">{t('Predicted')}</p>
                    <p className="font-display text-base font-bold text-salis-blue">{pred.predictedValue}</p>
                  </div>
                  <Badge background={bg} color={fg}>
                    {pred.change}
                  </Badge>
                  <span className="hidden text-xs text-muted lg:block">{t(pred.horizon)}</span>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {tab === 'models' && (
        <Section title={t('Deployed Models')}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-muted">
                  <th className="px-3 py-2.5 text-start">{t('Model')}</th>
                  <th className="px-3 py-2.5 text-start">{t('Type')}</th>
                  <th className="px-3 py-2.5 text-end">{t('Accuracy')}</th>
                  <th className="px-3 py-2.5 text-end">{t('Data Points')}</th>
                  <th className="px-3 py-2.5 text-start">{t('Status')}</th>
                  <th className="px-3 py-2.5 text-start">{t('Last Trained')}</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map((m) => {
                  const ms = MODEL_STATUS[m.status]
                  return (
                    <tr key={m.name} className="border-b border-border last:border-0">
                      <td className="px-3 py-3 font-medium text-heading">{t(m.name)}</td>
                      <td className="px-3 py-3 text-muted">{t(m.type)}</td>
                      <td className="px-3 py-3 text-end font-mono text-body">{m.accuracy}%</td>
                      <td className="px-3 py-3 text-end font-mono text-body">{m.dataPoints}</td>
                      <td className="px-3 py-3">
                        <Badge background={ms.bg} color={ms.fg}>
                          {t(m.status.charAt(0).toUpperCase() + m.status.slice(1))}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-muted">{t(m.lastTrained)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {tab === 'accuracy' && (
        <Section title={t('Model Performance')}>
          <div className="flex flex-col gap-4">
            {MODELS.map((m) => (
              <div key={m.name} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-heading">{t(m.name)}</span>
                  <span className="font-mono text-muted">{m.accuracy}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-inset">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${m.accuracy}%`,
                      background: m.accuracy >= 90 ? '#0A5ED7' : m.accuracy >= 80 ? '#0BB3FF' : '#F97316',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
