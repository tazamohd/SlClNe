import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  const isMobile = useIsMobile()

  const uniqueParts = [...new Set(QUOTES.map((q) => q.partNumber))].length
  const avgSavings = 14.2

  const kpis = [
    { label: t('Parts Compared'), value: String(uniqueParts), icon: 'GitCompare', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Quotes Received'), value: String(QUOTES.length), icon: 'FileText', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Avg Savings'), value: `${avgSavings}%`, icon: 'TrendingDown', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active RFQs'), value: '5', icon: 'Send', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="GitCompare" title={t('Price Compare')} subtitle={t('Compare supplier quotes')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {QUOTES.map((q, i) => (
          <MobileCard key={`${q.partNumber}-${q.supplier}-${i}`}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Box" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{q.partName}</p>
                    <p className="text-xs text-muted">{q.supplier}</p>
                  </div>
                </div>
              }
              trailing={
                q.bestPrice
                  ? <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('Best Price')}</Badge>
                  : null
              }
            />
            <MobileCardRow label={t('Unit Price')} value={`${q.unitPrice.toFixed(2)} SAR`} />
            <MobileCardRow label={t('MOQ')} value={String(q.moq)} />
            <MobileCardRow label={t('Lead Time')} value={`${q.leadTimeDays} ${t('days')}`} />
            <MobileCardRow label={t('Warranty')} value={t(q.warranty)} />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="GitCompare" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Price Comparison')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Compare quotes across suppliers')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Part')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Part #')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Supplier')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Unit Price')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('MOQ')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Lead Time')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Warranty')}</th>
                <th className="pb-3 text-start font-medium">{t('Price')}</th>
              </tr>
            </thead>
            <tbody>
              {QUOTES.map((q, i) => (
                <tr key={`${q.partNumber}-${q.supplier}-${i}`} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{q.partName}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{q.partNumber}</td>
                  <td className="py-3 pe-4 text-body">{q.supplier}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{q.unitPrice.toFixed(2)}</td>
                  <td className="py-3 pe-4 text-end font-mono text-body">{q.moq}</td>
                  <td className="py-3 pe-4 text-end text-body">{q.leadTimeDays} {t('days')}</td>
                  <td className="py-3 pe-4 text-body">{t(q.warranty)}</td>
                  <td className="py-3">
                    {q.bestPrice
                      ? <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('Best')}</Badge>
                      : <span className="text-xs text-muted">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
