import { useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const MOCK_OPTIMIZATIONS = [
  { id: 'PO-001', service: 'Engine Oil Change', currentPrice: 'SAR 180', suggestedPrice: 'SAR 195', change: '+8.3%', reason: 'Market rate increase', confidence: 94, impact: 'High' },
  { id: 'PO-002', service: 'Brake Pad Replacement', currentPrice: 'SAR 450', suggestedPrice: 'SAR 420', change: '-6.7%', reason: 'Competitor pricing pressure', confidence: 89, impact: 'Medium' },
  { id: 'PO-003', service: 'AC Service', currentPrice: 'SAR 350', suggestedPrice: 'SAR 380', change: '+8.6%', reason: 'Seasonal demand peak', confidence: 92, impact: 'High' },
  { id: 'PO-004', service: 'Tire Rotation', currentPrice: 'SAR 120', suggestedPrice: 'SAR 120', change: '0%', reason: 'Price is optimal', confidence: 96, impact: 'Low' },
  { id: 'PO-005', service: 'Transmission Fluid', currentPrice: 'SAR 320', suggestedPrice: 'SAR 295', change: '-7.8%', reason: 'Volume discount opportunity', confidence: 85, impact: 'Medium' },
  { id: 'PO-006', service: 'Full Detailing', currentPrice: 'SAR 550', suggestedPrice: 'SAR 600', change: '+9.1%', reason: 'Premium service positioning', confidence: 87, impact: 'High' },
] as const

const IMPACT_COLORS: Record<string, readonly [string, string]> = {
  High: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Medium: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Low: ['rgba(100,116,139,.1)', '#64748B'],
}

type OptRow = (typeof MOCK_OPTIMIZATIONS)[number]

export function IntelligentPriceOptimizer() {
  const { t } = usePreferences()
  const [strategy, setStrategy] = useState('balanced')

  const highImpact = MOCK_OPTIMIZATIONS.filter(o => o.impact === 'High').length
  const avgConfidence = Math.round(MOCK_OPTIMIZATIONS.reduce((a, o) => a + o.confidence, 0) / MOCK_OPTIMIZATIONS.length)

  const kpis = [
    { label: t('Optimizations'), value: String(MOCK_OPTIMIZATIONS.length), icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('High Impact'), value: String(highImpact), icon: 'TrendingUp', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Avg Confidence'), value: `${avgConfidence}%`, icon: 'Target', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Revenue Impact'), value: '+4.2%', icon: 'Zap', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<OptRow>[] = [
    { header: 'Service', cell: (o) => t(o.service) },
    { header: 'Current', cell: (o) => o.currentPrice },
    { header: 'Suggested', cell: (o) => o.suggestedPrice },
    { header: 'Change', cell: (o) => o.change },
    { header: 'Reason', cell: (o) => t(o.reason) },
    { header: 'Confidence', cell: (o) => `${o.confidence}%` },
    { header: 'Impact', cell: (o) => { const [bg, fg] = IMPACT_COLORS[o.impact] ?? IMPACT_COLORS.Low; return <Badge background={bg} color={fg}>{t(o.impact)}</Badge> } },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="DollarSign" title={t('Intelligent Price Optimizer')} subtitle={t('AI-powered pricing optimization for services')} />

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-heading">{t('Price Suggestions')}</h3>
        <Select value={strategy} onChange={e => setStrategy(e.target.value)} aria-label={t('Select strategy')}>
          <option value="aggressive">{t('Aggressive')}</option>
          <option value="balanced">{t('Balanced')}</option>
          <option value="conservative">{t('Conservative')}</option>
        </Select>
      </div>
      <DataTable
        caption="Price optimization suggestions"
        columns={columns}
        rows={[...MOCK_OPTIMIZATIONS]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = IMPACT_COLORS[row.impact] ?? IMPACT_COLORS.Low
          return (
            <>
              <MobileCardHeader title={t(row.service)} trailing={<Badge background={bg} color={fg}>{t(row.impact)}</Badge>} />
              <MobileCardRow label={t('Current')}>{row.currentPrice}</MobileCardRow>
              <MobileCardRow label={t('Suggested')}>{row.suggestedPrice}</MobileCardRow>
              <MobileCardRow label={t('Change')}>{row.change}</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
