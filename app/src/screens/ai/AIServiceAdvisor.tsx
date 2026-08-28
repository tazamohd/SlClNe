import { useState } from 'react'
import { cn } from '@/lib/cn'
import { FeatureHeader, Section, StatRow, TabBar } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

interface ServiceRecommendation {
  id: string
  vehicle: string
  plate: string
  recommendation: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  estimatedCost: string
  confidence: number
  dueIn: string
  icon: string
}

const RECOMMENDATIONS: ServiceRecommendation[] = [
  {
    id: 'sr-1',
    vehicle: '2022 Toyota Camry',
    plate: 'ABC 1234',
    recommendation: 'Brake Pad Replacement',
    reason: 'Predicted wear based on 45,000 km mileage and driving pattern analysis',
    priority: 'high',
    estimatedCost: 'SAR 850',
    confidence: 94,
    dueIn: 'Within 2 weeks',
    icon: 'AlertTriangle',
  },
  {
    id: 'sr-2',
    vehicle: '2021 Honda Accord',
    plate: 'XYZ 5678',
    recommendation: 'Engine Oil Change',
    reason: 'Last service was 8,200 km ago — approaching 10,000 km interval',
    priority: 'medium',
    estimatedCost: 'SAR 320',
    confidence: 98,
    dueIn: 'Within 1 month',
    icon: 'Droplets',
  },
  {
    id: 'sr-3',
    vehicle: '2023 Hyundai Tucson',
    plate: 'DEF 9012',
    recommendation: 'Tire Rotation',
    reason: 'Uneven wear pattern detected from last inspection report',
    priority: 'medium',
    estimatedCost: 'SAR 150',
    confidence: 87,
    dueIn: 'Within 3 weeks',
    icon: 'Circle',
  },
  {
    id: 'sr-4',
    vehicle: '2020 Nissan Patrol',
    plate: 'GHI 3456',
    recommendation: 'AC System Service',
    reason: 'Seasonal maintenance due — summer performance optimization',
    priority: 'low',
    estimatedCost: 'SAR 450',
    confidence: 82,
    dueIn: 'Within 2 months',
    icon: 'Thermometer',
  },
  {
    id: 'sr-5',
    vehicle: '2019 Ford Explorer',
    plate: 'JKL 7890',
    recommendation: 'Transmission Fluid Flush',
    reason: 'Vehicle at 90,000 km — manufacturer interval reached',
    priority: 'high',
    estimatedCost: 'SAR 1,200',
    confidence: 96,
    dueIn: 'Overdue',
    icon: 'Settings',
  },
]

const PRIORITY_TONES: Record<string, { bg: string; fg: string; label: string }> = {
  high: { bg: 'rgba(249,115,22,.1)', fg: '#F97316', label: 'High' },
  medium: { bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7', label: 'Medium' },
  low: { bg: 'rgba(100,116,139,.1)', fg: '#64748B', label: 'Low' },
}

const TABS = [
  { id: 'recommendations', label: 'Recommendations', icon: 'Lightbulb' },
  { id: 'history', label: 'History', icon: 'Clock' },
] as const

export function AIServiceAdvisor() {
  const { t } = usePreferences()
  const [tab, setTab] = useState('recommendations')

  const highCount = RECOMMENDATIONS.filter((r) => r.priority === 'high').length
  const totalRevenue = 'SAR 2,970'

  return (
    <>
      <FeatureHeader
        icon="Lightbulb"
        title={t('AI Service Advisor')}
        subtitle={t('Smart service recommendations')}
        actions={
          <Button size="md">
            <Icon name="RefreshCw" size={16} />
            {t('Refresh Analysis')}
          </Button>
        }
      />

      <StatRow
        stats={[
          { label: 'Active Recommendations', value: RECOMMENDATIONS.length, highlight: true, icon: 'Lightbulb' },
          { label: 'High Priority', value: highCount, tone: 'warning', icon: 'AlertTriangle' },
          { label: 'Potential Revenue', value: totalRevenue, tone: 'info', icon: 'TrendingUp' },
          { label: 'Avg Confidence', value: '91%', icon: 'Target' },
        ]}
      />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'recommendations' && (
        <div className="flex flex-col gap-4">
          {RECOMMENDATIONS.map((rec) => {
            const pr = PRIORITY_TONES[rec.priority]
            return (
              <Card key={rec.id} className="flex flex-col gap-4 rounded-2xl p-5">
                <div className="flex items-start gap-3.5">
                  <span
                    className="flex flex-shrink-0 rounded-[10px] p-2"
                    style={{ background: pr.bg, color: pr.fg }}
                  >
                    <Icon name={rec.icon} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-heading">
                        {t(rec.recommendation)}
                      </h3>
                      <Badge background={pr.bg} color={pr.fg}>
                        {t(pr.label)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-body">
                      {rec.vehicle}{' '}
                      <span className="text-muted">({rec.plate})</span>
                    </p>
                  </div>
                  <div className="hidden text-end sm:block">
                    <p className="font-display text-lg font-bold text-heading">{rec.estimatedCost}</p>
                    <p className="text-xs text-muted">{t(rec.dueIn)}</p>
                  </div>
                </div>

                <div className="rounded-[10px] border border-border bg-inset p-3">
                  <p className="text-[13px] text-body">
                    <span className="font-semibold text-salis-blue">{t('AI Insight')}: </span>
                    {t(rec.reason)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Icon name="Target" size={12} />
                      {rec.confidence}% {t('confidence')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={12} />
                      {t(rec.dueIn)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      {t('Dismiss')}
                    </Button>
                    <Button size="sm">
                      {t('Create Job')}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-inset">
                    <div
                      className={cn('h-full rounded-full')}
                      style={{
                        width: `${rec.confidence}%`,
                        background: rec.confidence >= 90 ? '#0A5ED7' : rec.confidence >= 80 ? '#0BB3FF' : '#64748B',
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-muted">{rec.confidence}%</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {tab === 'history' && (
        <Section title={t('Past Recommendations')}>
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Icon name="Clock" size={32} className="text-muted" />
            <p className="text-sm text-muted">
              {t('Historical recommendation data will appear here once the AI engine processes service records.')}
            </p>
          </div>
        </Section>
      )}
    </>
  )
}
