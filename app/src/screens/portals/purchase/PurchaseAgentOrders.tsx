import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Loading, ErrorState } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

type PurchaseOrder = RowOf<'purchaseOrders'>

const STATUS_LABEL: Record<PurchaseOrder['status'], string> = {
  draft: 'Draft',
  approved: 'Approved',
  sent: 'Sent',
  receiving: 'Receiving',
  received: 'Received',
  closed: 'Closed',
}

const STATUS_STYLES: Record<PurchaseOrder['status'], { bg: string; fg: string }> = {
  draft: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
  approved: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  sent: { bg: 'rgba(10,94,215,.15)', fg: 'var(--salis-blue)' },
  receiving: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  received: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
  closed: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
}

/* This screen was MOCK_ONLY (BLK-004): every KPI and every order row (a
 * fictional "AGO-1201" against Al-Futtaim Parts, with an invented category
 * column and a status vocabulary — Draft/Submitted/Confirmed/Shipped/
 * Received/Cancelled — that doesn't match the server's real one) was a
 * hardcoded fixture.
 *
 * Reads the same real `purchaseOrders` collection PurchaseOrdersList.tsx
 * (app/src/screens/parts/) already reads, using the server's own status
 * vocabulary (draft/approved/sent/receiving/received/closed) rather than
 * the design's unrelated one. There is no category field on this
 * collection, so that column is dropped rather than invented. */
export function PurchaseAgentOrders() {
  const { t } = usePreferences()
  const { data: orders = [], isLoading, isError, error, refetch } = useCollection('purchaseOrders')

  const kpis = [
    { label: t('Total Orders'), value: orders.length.toString(), icon: 'ShoppingCart', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Sent'), value: orders.filter((o) => o.status === 'sent').length.toString(), icon: 'Send', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Receiving'), value: orders.filter((o) => o.status === 'receiving').length.toString(), icon: 'Truck', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Received'), value: orders.filter((o) => o.status === 'received').length.toString(), icon: 'PackageCheck', bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
  ]

  const columns: Column<PurchaseOrder>[] = [
    { header: t('Order'), cell: (o) => o.code, code: true },
    { header: t('Supplier'), cell: (o) => o.supplierName },
    { header: t('Total'), cell: (o) => <Money sar={o.totalHalalas / 100} /> },
    { header: t('Ordered'), cell: (o) => o.orderedAt ?? '—' },
    { header: t('Status'), cell: (o) => <Badge background={STATUS_STYLES[o.status].bg} color={STATUS_STYLES[o.status].fg}>{t(STATUS_LABEL[o.status])}</Badge> },
  ]

  if (isLoading) return <Loading label={t('Loading purchase orders...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ShoppingCart" title={t('Orders')} subtitle={t('Purchase agent order management')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Purchase agent orders"
        columns={columns}
        rows={orders}
        rowKey={(o) => o.id}
        empty={<p className="py-8 text-center text-sm text-muted">{t('No purchase orders found')}</p>}
        mobileCard={(o) => (
          <>
            <MobileCardHeader title={o.code} code trailing={<Badge background={STATUS_STYLES[o.status].bg} color={STATUS_STYLES[o.status].fg}>{t(STATUS_LABEL[o.status])}</Badge>} />
            <MobileCardRow label={t('Supplier')}>{o.supplierName}</MobileCardRow>
            <MobileCardRow label={t('Total')}><Money sar={o.totalHalalas / 100} /></MobileCardRow>
            <MobileCardRow label={t('Ordered')}>{o.orderedAt ?? '—'}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
