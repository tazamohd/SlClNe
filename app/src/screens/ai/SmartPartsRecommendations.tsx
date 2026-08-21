import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const MOCK_RECOMMENDATIONS = [
  { id: 'SPR-001', partName: 'Brake Pad Set (Front)', partNo: 'BP-TY-4421', vehicle: '2024 Toyota Camry', reason: 'Wear sensor triggered', confidence: 97, price: 'SAR 285', inStock: true, priority: 'High' },
  { id: 'SPR-002', partName: 'Oil Filter', partNo: 'OF-HN-2201', vehicle: '2023 Honda Accord', reason: 'Scheduled maintenance due', confidence: 95, price: 'SAR 45', inStock: true, priority: 'Medium' },
  { id: 'SPR-003', partName: 'Serpentine Belt', partNo: 'SB-NS-3310', vehicle: '2022 Nissan Patrol', reason: 'Age-based replacement', confidence: 88, price: 'SAR 120', inStock: true, priority: 'Medium' },
  { id: 'SPR-004', partName: 'Alternator Assembly', partNo: 'AL-HY-5502', vehicle: '2023 Hyundai Tucson', reason: 'Voltage irregularity detected', confidence: 82, price: 'SAR 1,450', inStock: false, priority: 'High' },
  { id: 'SPR-005', partName: 'Cabin Air Filter', partNo: 'CF-LX-1108', vehicle: '2024 Lexus ES', reason: 'Dusty conditions detected', confidence: 91, price: 'SAR 85', inStock: true, priority: 'Low' },
  { id: 'SPR-006', partName: 'Spark Plug Set', partNo: 'SP-GM-7704', vehicle: '2021 GMC Sierra', reason: 'Mileage interval reached', confidence: 93, price: 'SAR 320', inStock: true, priority: 'Medium' },
  { id: 'SPR-007', partName: 'Coolant Thermostat', partNo: 'CT-KI-4409', vehicle: '2024 Kia Sportage', reason: 'Temperature fluctuation pattern', confidence: 79, price: 'SAR 195', inStock: true, priority: 'Low' },
] as const

const PRIORITY_COLORS: Record<string, readonly [string, string]> = {
  High: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Medium: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Low: ['rgba(100,116,139,.1)', '#64748B'],
}

export function SmartPartsRecommendations() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const totalValue = 'SAR 2,500'
  const inStockCount = MOCK_RECOMMENDATIONS.filter(r => r.inStock).length
  const avgConfidence = Math.round(MOCK_RECOMMENDATIONS.reduce((a, r) => a + r.confidence, 0) / MOCK_RECOMMENDATIONS.length)

  const kpis = [
    { label: t('Recommendations'), value: String(MOCK_RECOMMENDATIONS.length), icon: 'Sparkles', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('In Stock'), value: `${inStockCount}/${MOCK_RECOMMENDATIONS.length}`, icon: 'PackageCheck', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Avg Confidence'), value: `${avgConfidence}%`, icon: 'Target', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Total Value'), value: totalValue, icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Sparkles" title={t('Parts Recommendations')} subtitle={t('AI-Powered')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {MOCK_RECOMMENDATIONS.map(r => {
          const [bg, fg] = PRIORITY_COLORS[r.priority] ?? PRIORITY_COLORS.Low
          return (
            <MobileCard key={r.id}>
              <MobileCardHeader title={r.partName} trailing={<Badge background={bg} color={fg}>{t(r.priority)}</Badge>} />
              <MobileCardRow label={t('Part No')}>{r.partNo}</MobileCardRow>
              <MobileCardRow label={t('Vehicle')}>{r.vehicle}</MobileCardRow>
              <MobileCardRow label={t('Reason')}>{t(r.reason)}</MobileCardRow>
              <MobileCardRow label={t('Confidence')}>{r.confidence}%</MobileCardRow>
              <MobileCardRow label={t('Price')}>{r.price}</MobileCardRow>
              <MobileCardRow label={t('Stock')}>{r.inStock ? t('In Stock') : t('Out of Stock')}</MobileCardRow>
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
            <Icon name="Sparkles" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Smart Parts Recommendations')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('AI-powered parts recommendations for vehicles')}</p>
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
        <h3 className="mb-4 text-[15px] font-bold text-heading">{t('Recommended Parts')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Part')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Part No')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Vehicle')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Reason')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Confidence')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Price')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Stock')}</th>
                <th className="pb-3 text-start font-medium">{t('Priority')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_RECOMMENDATIONS.map(r => {
                const [bg, fg] = PRIORITY_COLORS[r.priority] ?? PRIORITY_COLORS.Low
                return (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 text-[13px] text-heading">{r.partName}</td>
                    <td className="py-3 pe-4 font-mono text-[13px] text-muted" dir="ltr">{r.partNo}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{r.vehicle}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{t(r.reason)}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{r.confidence}%</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{r.price}</td>
                    <td className="py-3 pe-4">
                      <Badge background={r.inStock ? 'rgba(10,94,215,.1)' : 'rgba(249,115,22,.1)'} color={r.inStock ? 'var(--salis-blue)' : 'var(--salis-orange)'}>{r.inStock ? t('In Stock') : t('Out of Stock')}</Badge>
                    </td>
                    <td className="py-3"><Badge background={bg} color={fg}>{t(r.priority)}</Badge></td>
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
