import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money, formatSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface RecentOrder {
  id: string
  supplier: string
  items: number
  total: number
  date: string
  status: 'Delivered' | 'In Transit' | 'Pending' | 'Cancelled'
}

const RECENT_ORDERS: RecentOrder[] = [
  { id: 'PO-2401', supplier: 'Al-Futtaim Parts', items: 15, total: 12500, date: '2025-08-17', status: 'In Transit' },
  { id: 'PO-2398', supplier: 'Brembo KSA', items: 8, total: 8400, date: '2025-08-15', status: 'Delivered' },
  { id: 'PO-2395', supplier: 'NGK Middle East', items: 24, total: 3600, date: '2025-08-14', status: 'Delivered' },
  { id: 'PO-2390', supplier: 'Gates Automotive', items: 5, total: 6200, date: '2025-08-12', status: 'Pending' },
  { id: 'PO-2385', supplier: 'Denso Gulf', items: 12, total: 4800, date: '2025-08-10', status: 'Delivered' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Delivered: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  'In Transit': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  Cancelled: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
}

export function PurchaseAgentDashboard() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Open Orders'), value: '8', icon: 'ShoppingCart', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Monthly Spend'), value: formatSar(45200), icon: 'Wallet', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Pending Approvals'), value: '3', icon: 'Clock', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Active Suppliers'), value: '12', icon: 'Users', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<RecentOrder>[] = [
    { header: t('Order'), cell: (o) => o.id },
    { header: t('Supplier'), cell: (o) => o.supplier },
    { header: t('Items'), cell: (o) => o.items },
    { header: t('Total'), cell: (o) => <Money sar={o.total} /> },
    { header: t('Date'), cell: (o) => o.date },
    { header: t('Status'), cell: (o) => <Badge background={STATUS_STYLES[o.status].bg} color={STATUS_STYLES[o.status].fg}>{t(o.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ShoppingCart" title={t('Purchase Dashboard')} subtitle={t('Purchase agent overview and KPIs')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Recent purchase orders"
        columns={columns}
        rows={RECENT_ORDERS}
        rowKey={(o) => o.id}
        mobileCard={(o) => (
          <>
            <MobileCardHeader title={o.id} trailing={<Badge background={STATUS_STYLES[o.status].bg} color={STATUS_STYLES[o.status].fg}>{t(o.status)}</Badge>} />
            <MobileCardRow label={t('Supplier')}>{o.supplier}</MobileCardRow>
            <MobileCardRow label={t('Total')}><Money sar={o.total} /></MobileCardRow>
            <MobileCardRow label={t('Date')}>{o.date}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
