import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Loading, ErrorState } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

/** All purchase orders raised against the workshop's own suppliers (BLK-004):
 *  read through the repository seam from `purchaseOrders` — the same
 *  `GET /procurement/purchase-orders` collection `Procurement.tsx` raises and
 *  receives orders against — rather than the seven fictional orders (with an
 *  invented item count and delivery date) this screen carried before.
 *
 *  The server's own status vocabulary (draft/approved/sent/receiving/
 *  received/closed) is used as-is rather than the design's unrelated one
 *  (Pending/Shipped/Cancelled, none of which the lifecycle in Procurement.tsx
 *  actually has). There is no per-line item count on this collection without
 *  a second request per order, so "Items" is dropped rather than shown as 1
 *  or guessed at; the order total is the server's own subtotal + VAT. */

type PurchaseOrder = RowOf<'purchaseOrders'>

const STATUS_STYLES: Record<PurchaseOrder['status'], { bg: string; fg: string }> = {
  draft: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
  approved: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  sent: { bg: 'rgba(10,94,215,.15)', fg: 'var(--salis-blue)' },
  receiving: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  received: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
  closed: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
}

const STATUS_LABEL: Record<PurchaseOrder['status'], string> = {
  draft: 'Draft',
  approved: 'Approved',
  sent: 'Sent',
  receiving: 'Receiving',
  received: 'Received',
  closed: 'Closed',
}

export function PurchaseOrdersList() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data: orders = [], isLoading, isError, error, refetch } = useCollection('purchaseOrders')

  const columns: Column<PurchaseOrder>[] = [
    { header: 'PO Number', cell: (po) => po.code, code: true },
    { header: 'Supplier', cell: (po) => po.supplierName },
    { header: 'Total', cell: (po) => <Money sar={po.totalHalalas / 100} className="font-medium text-heading" /> },
    { header: 'Ordered', cell: (po) => <span className="text-muted">{po.orderedAt ?? '—'}</span> },
    { header: 'Expected', cell: (po) => <span className="text-muted">{po.expectedAt ?? '—'}</span> },
    { header: 'Status', cell: (po) => <Badge background={STATUS_STYLES[po.status].bg} color={STATUS_STYLES[po.status].fg}>{t(STATUS_LABEL[po.status])}</Badge> },
  ]

  if (isLoading) return <Loading label={t('Loading purchase orders...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const table = (
    <DataTable
      caption="All Purchase Orders"
      columns={columns}
      rows={orders}
      rowKey={(po) => po.id}
      empty={<p className="py-8 text-center text-sm text-muted">{t('No purchase orders found')}</p>}
      mobileCard={(po) => (
        <>
          <MobileCardHeader
            title={po.code}
            code
            trailing={<Badge background={STATUS_STYLES[po.status].bg} color={STATUS_STYLES[po.status].fg}>{t(STATUS_LABEL[po.status])}</Badge>}
          />
          <MobileCardRow label={t('Supplier')} value={po.supplierName} />
          <MobileCardRow label={t('Total')}>
            <Money sar={po.totalHalalas / 100} />
          </MobileCardRow>
          <MobileCardRow label={t('Expected')} value={po.expectedAt ?? '—'} />
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
      <PageHeader icon="ShoppingCart" title={t('Purchase Orders')} subtitle={t('Parts procurement and supplier orders')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[
          { label: 'Total Orders', value: orders.length.toString(), icon: 'ShoppingCart' },
          { label: 'Approved', value: orders.filter((p) => p.status === 'approved').length.toString(), icon: 'Clock' },
          { label: 'Receiving', value: orders.filter((p) => p.status === 'receiving').length.toString(), icon: 'Truck' },
          { label: 'Received', value: orders.filter((p) => p.status === 'received').length.toString(), icon: 'PackageCheck' },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex rounded-xl p-2.5 bg-tint-blue text-salis-blue" aria-hidden>
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
