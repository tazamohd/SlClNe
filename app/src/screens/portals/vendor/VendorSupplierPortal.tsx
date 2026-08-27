import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface VendorOrder {
  orderId: string
  workshop: string
  items: string
  qty: number
  total: number
  dueDate: string
  status: 'New' | 'Processing' | 'Shipped' | 'Delivered'
}

interface PerformanceMetric {
  label: string
  value: string
  icon: string
  trend: string
}

const ORDERS: VendorOrder[] = [
  { orderId: 'PO-2026-0851', workshop: 'Salis Main Branch', items: 'Oil Filters (Toyota)', qty: 100, total: 2250, dueDate: 'Aug 20, 2026', status: 'New' },
  { orderId: 'PO-2026-0849', workshop: 'Jeddah Service Center', items: 'Brake Pad Sets', qty: 30, total: 4950, dueDate: 'Aug 19, 2026', status: 'Processing' },
  { orderId: 'PO-2026-0846', workshop: 'Dammam Workshop', items: 'Air Filters (Hyundai)', qty: 80, total: 3040, dueDate: 'Aug 18, 2026', status: 'Shipped' },
  { orderId: 'PO-2026-0842', workshop: 'Salis Main Branch', items: 'Cabin Air Filters', qty: 150, total: 4200, dueDate: 'Aug 16, 2026', status: 'Delivered' },
  { orderId: 'PO-2026-0839', workshop: 'Riyadh North Branch', items: 'Spark Plug Sets', qty: 60, total: 2100, dueDate: 'Aug 15, 2026', status: 'Delivered' },
  { orderId: 'PO-2026-0836', workshop: 'Jeddah Service Center', items: 'Alternators (Nissan)', qty: 8, total: 3040, dueDate: 'Aug 14, 2026', status: 'Delivered' },
]

const METRICS: PerformanceMetric[] = [
  { label: 'On-Time Delivery', value: '97.2%', icon: 'Clock', trend: '+1.4%' },
  { label: 'Order Fill Rate', value: '98.5%', icon: 'CheckCircle', trend: '+0.8%' },
  { label: 'Return Rate', value: '0.3%', icon: 'RotateCcw', trend: '-0.1%' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  New: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Processing: { bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
  Shipped: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Delivered: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function VendorSupplierPortal() {
  const { t } = usePreferences()

  const activeOrders = ORDERS.filter((o) => o.status !== 'Delivered')
  const totalRevenue = ORDERS.reduce((sum, o) => sum + o.total, 0)

  const kpis = [
    { label: t('Active Orders'), value: String(activeOrders.length), icon: 'ShoppingCart', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Revenue'), value: `${(totalRevenue / 1000).toFixed(1)}K`, icon: 'DollarSign', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Workshops Served'), value: '14', icon: 'Building', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Rating'), value: '4.7', icon: 'Star', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  ]

  const columns: Column<VendorOrder>[] = [
    { header: t('Order #'), cell: (o) => o.orderId },
    { header: t('Workshop'), cell: (o) => o.workshop },
    { header: t('Items'), cell: (o) => o.items },
    { header: t('Qty'), cell: (o) => o.qty },
    { header: t('Total'), cell: (o) => `${o.total.toLocaleString()} SAR` },
    { header: t('Due Date'), cell: (o) => o.dueDate },
    { header: t('Status'), cell: (o) => <Badge background={STATUS_STYLES[o.status].bg} color={STATUS_STYLES[o.status].fg}>{t(o.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Store" title={t('Vendor Portal')} subtitle={t('Orders, deliveries, and performance metrics')} />

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {METRICS.map((m) => (
          <Card key={m.label} className="flex items-center gap-3 rounded-xl p-4 shadow-sm">
            <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-2 text-salis-blue" aria-hidden><Icon name={m.icon} size={18} /></span>
            <div className="flex-1">
              <p className="text-[11px] text-muted">{t(m.label)}</p>
              <p className="mt-0.5 font-display text-xl font-black text-heading" dir="ltr">{m.value}</p>
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--salis-blue)' }}>{m.trend}</span>
          </Card>
        ))}
      </div>

      <DataTable
        caption="Vendor recent orders"
        columns={columns}
        rows={ORDERS}
        rowKey={(o) => o.orderId}
        mobileCard={(o) => (
          <>
            <MobileCardHeader title={o.orderId} trailing={<Badge background={STATUS_STYLES[o.status].bg} color={STATUS_STYLES[o.status].fg}>{t(o.status)}</Badge>} />
            <MobileCardRow label={t('Workshop')}>{o.workshop}</MobileCardRow>
            <MobileCardRow label={t('Items')}>{o.items}</MobileCardRow>
            <MobileCardRow label={t('Total')}>{o.total.toLocaleString()} SAR</MobileCardRow>
            <MobileCardRow label={t('Due Date')}>{o.dueDate}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
