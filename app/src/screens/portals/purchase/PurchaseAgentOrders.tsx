import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money, formatSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface AgentOrder {
  id: string
  supplier: string
  category: string
  items: number
  total: number
  ordered: string
  status: 'Draft' | 'Submitted' | 'Confirmed' | 'Shipped' | 'Received' | 'Cancelled'
}

const ORDERS: AgentOrder[] = [
  { id: 'AGO-1201', supplier: 'Al-Futtaim Parts', category: 'Brake Systems', items: 15, total: 12500, ordered: '2025-08-17', status: 'Confirmed' },
  { id: 'AGO-1198', supplier: 'Brembo KSA', category: 'Brake Pads', items: 8, total: 8400, ordered: '2025-08-15', status: 'Shipped' },
  { id: 'AGO-1195', supplier: 'NGK Middle East', category: 'Spark Plugs', items: 24, total: 3600, ordered: '2025-08-14', status: 'Received' },
  { id: 'AGO-1192', supplier: 'Gates Automotive', category: 'Belts & Hoses', items: 5, total: 6200, ordered: '2025-08-12', status: 'Draft' },
  { id: 'AGO-1189', supplier: 'Denso Gulf', category: 'Electrical', items: 12, total: 4800, ordered: '2025-08-10', status: 'Received' },
  { id: 'AGO-1186', supplier: 'Mann Filter ME', category: 'Filters', items: 30, total: 2100, ordered: '2025-08-08', status: 'Submitted' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Draft: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Submitted: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Confirmed: { bg: 'rgba(10,94,215,.15)', fg: 'var(--salis-blue)' },
  Shipped: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Received: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  Cancelled: { bg: 'rgba(249,115,22,.1)', fg: 'rgb(249,115,22)' },
}

export function PurchaseAgentOrders() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Total Orders'), value: String(ORDERS.length), icon: 'ShoppingCart', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Value'), value: formatSar(37600), icon: 'Wallet', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('In Transit'), value: '1', icon: 'Truck', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
    { label: t('Received'), value: '2', icon: 'PackageCheck', bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  ]

  const columns: Column<AgentOrder>[] = [
    { header: t('Order'), cell: (o) => o.id },
    { header: t('Supplier'), cell: (o) => o.supplier },
    { header: t('Category'), cell: (o) => t(o.category) },
    { header: t('Items'), cell: (o) => o.items },
    { header: t('Total'), cell: (o) => <Money sar={o.total} /> },
    { header: t('Ordered'), cell: (o) => o.ordered },
    { header: t('Status'), cell: (o) => <Badge background={STATUS_STYLES[o.status].bg} color={STATUS_STYLES[o.status].fg}>{t(o.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ShoppingCart" title={t('Orders')} subtitle={t('Purchase agent order management')} />

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Purchase agent orders"
        columns={columns}
        rows={ORDERS}
        rowKey={(o) => o.id}
        mobileCard={(o) => (
          <>
            <MobileCardHeader title={o.id} trailing={<Badge background={STATUS_STYLES[o.status].bg} color={STATUS_STYLES[o.status].fg}>{t(o.status)}</Badge>} />
            <MobileCardRow label={t('Supplier')}>{o.supplier}</MobileCardRow>
            <MobileCardRow label={t('Total')}><Money sar={o.total} /></MobileCardRow>
            <MobileCardRow label={t('Ordered')}>{o.ordered}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
