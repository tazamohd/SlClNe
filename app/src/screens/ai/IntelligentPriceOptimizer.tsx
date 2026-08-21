import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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

export function IntelligentPriceOptimizer() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [strategy, setStrategy] = useState('balanced')

  const highImpact = MOCK_OPTIMIZATIONS.filter(o => o.impact === 'High').length
  const avgConfidence = Math.round(MOCK_OPTIMIZATIONS.reduce((a, o) => a + o.confidence, 0) / MOCK_OPTIMIZATIONS.length)

  const kpis = [
    { label: t('Optimizations'), value: String(MOCK_OPTIMIZATIONS.length), icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('High Impact'), value: String(highImpact), icon: 'TrendingUp', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Avg Confidence'), value: `${avgConfidence}%`, icon: 'Target', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Revenue Impact'), value: '+4.2%', icon: 'Zap', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="DollarSign" title={t('Price Optimizer')} subtitle={t('AI-Powered Pricing')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {MOCK_OPTIMIZATIONS.map(o => {
          const [bg, fg] = IMPACT_COLORS[o.impact] ?? IMPACT_COLORS.Low
          return (
            <MobileCard key={o.id}>
              <MobileCardHeader title={t(o.service)} trailing={<Badge background={bg} color={fg}>{t(o.impact)}</Badge>} />
              <MobileCardRow label={t('Current')}>{o.currentPrice}</MobileCardRow>
              <MobileCardRow label={t('Suggested')}>{o.suggestedPrice}</MobileCardRow>
              <MobileCardRow label={t('Change')}>{o.change}</MobileCardRow>
              <MobileCardRow label={t('Reason')}>{t(o.reason)}</MobileCardRow>
              <MobileCardRow label={t('Confidence')}>{o.confidence}%</MobileCardRow>
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
            <Icon name="DollarSign" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Intelligent Price Optimizer')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('AI-powered pricing optimization for services')}</p>
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
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-heading">{t('Price Suggestions')}</h3>
          <select value={strategy} onChange={e => setStrategy(e.target.value)} aria-label={t('Select strategy')} className="h-9 cursor-pointer rounded border border-border bg-card px-3 text-[13px] text-heading outline-none focus:border-salis-blue">
            <option value="aggressive">{t('Aggressive')}</option>
            <option value="balanced">{t('Balanced')}</option>
            <option value="conservative">{t('Conservative')}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Service')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Current')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Suggested')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Change')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Reason')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Confidence')}</th>
                <th className="pb-3 text-start font-medium">{t('Impact')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_OPTIMIZATIONS.map(o => {
                const [bg, fg] = IMPACT_COLORS[o.impact] ?? IMPACT_COLORS.Low
                return (
                  <tr key={o.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 text-[13px] text-heading">{t(o.service)}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-muted">{o.currentPrice}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{o.suggestedPrice}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{o.change}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{t(o.reason)}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{o.confidence}%</td>
                    <td className="py-3"><Badge background={bg} color={fg}>{t(o.impact)}</Badge></td>
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
