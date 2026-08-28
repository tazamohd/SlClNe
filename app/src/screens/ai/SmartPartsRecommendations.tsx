import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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
  High: ['var(--tint-orange)', 'var(--salis-orange)'],
  Medium: ['var(--tint-blue)', 'var(--salis-blue)'],
  Low: ['var(--tint-neutral)', 'var(--text-muted)'],
}

type RecRow = (typeof MOCK_RECOMMENDATIONS)[number]

export function SmartPartsRecommendations() {
  const { t } = usePreferences()

  const totalValue = 'SAR 2,500'
  const inStockCount = MOCK_RECOMMENDATIONS.filter(r => r.inStock).length
  const avgConfidence = Math.round(MOCK_RECOMMENDATIONS.reduce((a, r) => a + r.confidence, 0) / MOCK_RECOMMENDATIONS.length)

  const kpis = [
    { label: t('Recommendations'), value: String(MOCK_RECOMMENDATIONS.length), icon: 'Sparkles', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('In Stock'), value: `${inStockCount}/${MOCK_RECOMMENDATIONS.length}`, icon: 'PackageCheck', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Avg Confidence'), value: `${avgConfidence}%`, icon: 'Target', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Total Value'), value: totalValue, icon: 'DollarSign', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<RecRow>[] = [
    { header: 'Part', cell: (r) => r.partName },
    { header: 'Part No', cell: (r) => r.partNo, code: true },
    { header: 'Vehicle', cell: (r) => r.vehicle },
    { header: 'Reason', cell: (r) => t(r.reason) },
    { header: 'Confidence', cell: (r) => `${r.confidence}%` },
    { header: 'Price', cell: (r) => r.price },
    { header: 'Stock', cell: (r) => <Badge background={r.inStock ? 'var(--tint-blue)' : 'var(--tint-orange)'} color={r.inStock ? 'var(--salis-blue)' : 'var(--salis-orange)'}>{r.inStock ? t('In Stock') : t('Out of Stock')}</Badge> },
    { header: 'Priority', cell: (r) => { const [bg, fg] = PRIORITY_COLORS[r.priority] ?? PRIORITY_COLORS.Low; return <Badge background={bg} color={fg}>{t(r.priority)}</Badge> } },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Sparkles" title={t('Smart Parts Recommendations')} subtitle={t('AI-powered parts recommendations for vehicles')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <h3 className="text-[15px] font-bold text-heading">{t('Recommended Parts')}</h3>
      <DataTable
        caption="Smart parts recommendations"
        columns={columns}
        rows={[...MOCK_RECOMMENDATIONS]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = PRIORITY_COLORS[row.priority] ?? PRIORITY_COLORS.Low
          return (
            <>
              <MobileCardHeader title={row.partName} trailing={<Badge background={bg} color={fg}>{t(row.priority)}</Badge>} />
              <MobileCardRow label={t('Part No')}>{row.partNo}</MobileCardRow>
              <MobileCardRow label={t('Vehicle')}>{row.vehicle}</MobileCardRow>
              <MobileCardRow label={t('Price')}>{row.price}</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
