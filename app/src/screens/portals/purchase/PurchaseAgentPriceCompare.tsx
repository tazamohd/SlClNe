import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface PriceQuote {
  partName: string
  partNumber: string
  supplier: string
  unitPrice: number
  moq: number
  leadTimeDays: number
  warranty: string
  bestPrice: boolean
}

const QUOTES: PriceQuote[] = [
  { partName: 'Oil Filter (Toyota)', partNumber: 'OF-TOY-2204', supplier: 'Al-Rajhi Auto Parts', unitPrice: 22.50, moq: 10, leadTimeDays: 2, warranty: '6 months', bestPrice: true },
  { partName: 'Oil Filter (Toyota)', partNumber: 'OF-TOY-2204', supplier: 'Gulf Motor Supply', unitPrice: 24.00, moq: 5, leadTimeDays: 3, warranty: '6 months', bestPrice: false },
  { partName: 'Oil Filter (Toyota)', partNumber: 'OF-TOY-2204', supplier: 'Eastern Parts Hub', unitPrice: 26.75, moq: 1, leadTimeDays: 5, warranty: '3 months', bestPrice: false },
  { partName: 'Brake Pad Set (Front)', partNumber: 'BP-UNI-1108', supplier: 'Gulf Motor Supply', unitPrice: 155.00, moq: 4, leadTimeDays: 3, warranty: '12 months', bestPrice: true },
  { partName: 'Brake Pad Set (Front)', partNumber: 'BP-UNI-1108', supplier: 'Al-Madinah Body Parts', unitPrice: 162.00, moq: 2, leadTimeDays: 4, warranty: '12 months', bestPrice: false },
  { partName: 'Brake Pad Set (Front)', partNumber: 'BP-UNI-1108', supplier: 'Al-Rajhi Auto Parts', unitPrice: 170.00, moq: 1, leadTimeDays: 2, warranty: '18 months', bestPrice: false },
  { partName: 'Alternator (Nissan)', partNumber: 'AL-NIS-7704', supplier: 'Nada Electrical Co.', unitPrice: 365.00, moq: 1, leadTimeDays: 4, warranty: '24 months', bestPrice: true },
  { partName: 'Alternator (Nissan)', partNumber: 'AL-NIS-7704', supplier: 'Eastern Parts Hub', unitPrice: 395.00, moq: 1, leadTimeDays: 6, warranty: '12 months', bestPrice: false },
]

export function PurchaseAgentPriceCompare() {
  const { t } = usePreferences()

  const uniqueParts = [...new Set(QUOTES.map((q) => q.partNumber))].length
  const avgSavings = 14.2

  const kpis = [
    { label: t('Parts Compared'), value: String(uniqueParts), icon: 'GitCompare', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Quotes Received'), value: String(QUOTES.length), icon: 'FileText', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Avg Savings'), value: `${avgSavings}%`, icon: 'TrendingDown', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active RFQs'), value: '5', icon: 'Send', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  ]

  const columns: Column<PriceQuote>[] = [
    { header: t('Part'), cell: (q) => q.partName },
    { header: t('Part #'), cell: (q) => q.partNumber },
    { header: t('Supplier'), cell: (q) => q.supplier },
    { header: t('Unit Price'), cell: (q) => q.unitPrice.toFixed(2) },
    { header: t('MOQ'), cell: (q) => q.moq },
    { header: t('Lead Time'), cell: (q) => `${q.leadTimeDays} ${t('days')}` },
    { header: t('Warranty'), cell: (q) => t(q.warranty) },
    { header: t('Price'), cell: (q) => q.bestPrice
      ? <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('Best')}</Badge>
      : <span className="text-xs text-muted">-</span>
    },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="GitCompare" title={t('Price Comparison')} subtitle={t('Compare quotes across suppliers')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Price comparison across suppliers"
        columns={columns}
        rows={QUOTES}
        rowKey={(q, i) => `${q.partNumber}-${q.supplier}-${i}`}
        mobileCard={(q) => (
          <>
            <MobileCardHeader title={q.partName} trailing={
              q.bestPrice
                ? <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('Best Price')}</Badge>
                : null
            } />
            <MobileCardRow label={t('Supplier')}>{q.supplier}</MobileCardRow>
            <MobileCardRow label={t('Unit Price')}>{q.unitPrice.toFixed(2)} SAR</MobileCardRow>
            <MobileCardRow label={t('Lead Time')}>{q.leadTimeDays} {t('days')}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
