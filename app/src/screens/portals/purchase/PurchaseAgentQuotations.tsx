import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money, formatSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface Quotation {
  id: string
  supplier: string
  description: string
  items: number
  total: number
  validUntil: string
  status: 'Received' | 'Under Review' | 'Accepted' | 'Rejected' | 'Expired'
}

const QUOTATIONS: Quotation[] = [
  { id: 'QT-701', supplier: 'Al-Futtaim Parts', description: 'Brake components bulk order', items: 45, total: 28500, validUntil: '2025-08-30', status: 'Under Review' },
  { id: 'QT-698', supplier: 'Brembo KSA', description: 'Premium brake pads Q4 supply', items: 200, total: 56000, validUntil: '2025-09-15', status: 'Received' },
  { id: 'QT-695', supplier: 'NGK Middle East', description: 'Spark plugs annual contract', items: 500, total: 15000, validUntil: '2025-08-25', status: 'Accepted' },
  { id: 'QT-690', supplier: 'Gates Automotive', description: 'Timing belt kits batch', items: 30, total: 19500, validUntil: '2025-08-20', status: 'Under Review' },
  { id: 'QT-685', supplier: 'Denso Gulf', description: 'Filters and sensors package', items: 120, total: 9600, validUntil: '2025-08-10', status: 'Expired' },
  { id: 'QT-680', supplier: 'Bosch Arabia', description: 'Wiper blades seasonal stock', items: 80, total: 4800, validUntil: '2025-08-05', status: 'Rejected' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Received: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  'Under Review': { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  Accepted: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Rejected: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
  Expired: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function PurchaseAgentQuotations() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Active Quotes'), value: '4', icon: 'FileText', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Value'), value: formatSar(133400), icon: 'Wallet', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Pending Review'), value: '2', icon: 'Clock', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Accepted'), value: '1', icon: 'CheckCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<Quotation>[] = [
    { header: t('Quote'), cell: (q) => q.id },
    { header: t('Supplier'), cell: (q) => q.supplier },
    { header: t('Description'), cell: (q) => q.description },
    { header: t('Items'), cell: (q) => q.items },
    { header: t('Total'), cell: (q) => <Money sar={q.total} /> },
    { header: t('Valid Until'), cell: (q) => q.validUntil },
    { header: t('Status'), cell: (q) => <Badge background={STATUS_STYLES[q.status].bg} color={STATUS_STYLES[q.status].fg}>{t(q.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="FileText" title={t('Quotations')} subtitle={t('Supplier quotation management')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Supplier quotations"
        columns={columns}
        rows={QUOTATIONS}
        rowKey={(q) => q.id}
        mobileCard={(q) => (
          <>
            <MobileCardHeader title={q.id} trailing={<Badge background={STATUS_STYLES[q.status].bg} color={STATUS_STYLES[q.status].fg}>{t(q.status)}</Badge>} />
            <MobileCardRow label={t('Supplier')}>{q.supplier}</MobileCardRow>
            <MobileCardRow label={t('Total')}><Money sar={q.total} /></MobileCardRow>
            <MobileCardRow label={t('Valid Until')}>{q.validUntil}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
