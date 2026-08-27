import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface PurchaseOrder {
  id: string
  supplier: string
  items: number
  total: string
  date: string
  expectedDelivery: string
  status: 'Pending' | 'Approved' | 'Shipped' | 'Delivered' | 'Cancelled'
}

const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: 'PO-2041', supplier: 'Al-Rajhi Auto Parts', items: 12, total: 'SAR 8,450', date: 'Aug 18, 2026', expectedDelivery: 'Aug 22, 2026', status: 'Pending' },
  { id: 'PO-2040', supplier: 'Gulf Parts Trading', items: 8, total: 'SAR 5,200', date: 'Aug 17, 2026', expectedDelivery: 'Aug 21, 2026', status: 'Approved' },
  { id: 'PO-2039', supplier: 'Toyota Genuine Parts', items: 5, total: 'SAR 12,800', date: 'Aug 16, 2026', expectedDelivery: 'Aug 25, 2026', status: 'Shipped' },
  { id: 'PO-2038', supplier: 'Hyundai Parts Center', items: 15, total: 'SAR 6,340', date: 'Aug 15, 2026', expectedDelivery: 'Aug 18, 2026', status: 'Delivered' },
  { id: 'PO-2037', supplier: 'National Auto Supplies', items: 3, total: 'SAR 1,890', date: 'Aug 14, 2026', expectedDelivery: 'Aug 17, 2026', status: 'Delivered' },
  { id: 'PO-2036', supplier: 'Al-Rajhi Auto Parts', items: 6, total: 'SAR 3,120', date: 'Aug 13, 2026', expectedDelivery: 'Aug 16, 2026', status: 'Cancelled' },
  { id: 'PO-2035', supplier: 'Honda Parts Warehouse', items: 9, total: 'SAR 7,650', date: 'Aug 12, 2026', expectedDelivery: 'Aug 15, 2026', status: 'Delivered' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Approved: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Shipped: { bg: 'rgba(10,94,215,.15)', fg: 'var(--salis-blue)' },
  Delivered: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  Cancelled: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

export function PurchaseOrdersList() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const columns: Column<PurchaseOrder>[] = [
    { header: 'PO Number', cell: (po) => po.id, code: true },
    { header: 'Supplier', cell: (po) => po.supplier },
    { header: 'Items', cell: (po) => po.items },
    { header: 'Total', cell: (po) => <span className="font-medium text-heading">{po.total}</span> },
    { header: 'Order Date', cell: (po) => <span className="text-muted">{po.date}</span> },
    { header: 'Expected Delivery', cell: (po) => <span className="text-muted">{po.expectedDelivery}</span> },
    { header: 'Status', cell: (po) => <Badge background={STATUS_STYLES[po.status].bg} color={STATUS_STYLES[po.status].fg}>{t(po.status)}</Badge> },
  ]

  const table = (
    <DataTable
      caption="All Purchase Orders"
      columns={columns}
      rows={PURCHASE_ORDERS}
      rowKey={(po) => po.id}
      mobileCard={(po) => (
        <>
          <MobileCardHeader
            title={po.id}
            code
            trailing={<Badge background={STATUS_STYLES[po.status].bg} color={STATUS_STYLES[po.status].fg}>{t(po.status)}</Badge>}
          />
          <MobileCardRow label={t('Supplier')} value={po.supplier} />
          <MobileCardRow label={t('Items')} value={po.items} />
          <MobileCardRow label={t('Total')} value={po.total} />
          <MobileCardRow label={t('Delivery')} value={po.expectedDelivery} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ShoppingCart" title={t('Purchase Orders')} subtitle={t('Parts procurement')} />
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="ShoppingCart" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Purchase Orders')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Parts procurement and supplier orders')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: PURCHASE_ORDERS.length.toString(), icon: 'ShoppingCart' },
          { label: 'Pending', value: PURCHASE_ORDERS.filter((p) => p.status === 'Pending').length.toString(), icon: 'Clock' },
          { label: 'In Transit', value: PURCHASE_ORDERS.filter((p) => p.status === 'Shipped').length.toString(), icon: 'Truck' },
          { label: 'Delivered', value: PURCHASE_ORDERS.filter((p) => p.status === 'Delivered').length.toString(), icon: 'PackageCheck' },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex rounded-xl p-2.5" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
                <Icon name={stat.icon} size={20} />
              </span>
              <div>
                <p className="text-xs text-muted">{t(stat.label)}</p>
                <p className="text-xl font-bold text-heading">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {table}
    </div>
  )
}
