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

/* This screen was MOCK_ONLY (BLK-004): every KPI and every "recent order"
 * row (a fictional Al-Futtaim Parts order, ...) was a hardcoded fixture.
 *
 * Reads the same `purchaseOrders`, `suppliers` and `requisitions`
 * collections `ProcurementPortal` (Procurement.tsx) already reads, using
 * the server's own status vocabulary (draft/approved/sent/receiving/
 * received/closed) the same way PurchaseOrdersList.tsx does — not the
 * design's unrelated one. "Monthly Spend" (a figure this API doesn't
 * compute) becomes "Open Order Value": the real total of orders still
 * with a supplier. */
export function PurchaseAgentDashboard() {
  const { t } = usePreferences()
  const orders = useCollection('purchaseOrders')
  const suppliers = useCollection('suppliers')
  const requisitions = useCollection('requisitions', { filter: { status: 'submitted' } })

  const rows = (orders.data ?? []) as readonly PurchaseOrder[]
  const open = rows.filter((po) => po.status === 'sent' || po.status === 'receiving')
  const openValue = open.reduce((sum, po) => sum + po.totalHalalas, 0) / 100
  const recent = rows.slice(0, 5)

  const loading = orders.isLoading || suppliers.isLoading || requisitions.isLoading

  const kpis = [
    { label: t('Open Orders'), value: loading ? '…' : String(open.length), icon: 'ShoppingCart', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Open Order Value'), value: loading ? '…' : `SAR ${openValue.toLocaleString('en-US')}`, icon: 'Wallet', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Pending Approvals'), value: loading ? '…' : String(requisitions.data?.length ?? 0), icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Active Suppliers'), value: loading ? '…' : String(suppliers.data?.length ?? 0), icon: 'Users', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<PurchaseOrder>[] = [
    { header: t('Order'), cell: (o) => o.code, code: true },
    { header: t('Supplier'), cell: (o) => o.supplierName },
    { header: t('Total'), cell: (o) => <Money sar={o.totalHalalas / 100} /> },
    { header: t('Ordered'), cell: (o) => o.orderedAt ?? '—' },
    { header: t('Status'), cell: (o) => <Badge background={STATUS_STYLES[o.status].bg} color={STATUS_STYLES[o.status].fg}>{t(STATUS_LABEL[o.status])}</Badge> },
  ]

  if (orders.isLoading) return <Loading label={t('Loading purchase orders...')} />
  if (orders.isError) return <ErrorState description={orders.error?.message} onRetry={() => void orders.refetch()} />

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
        rows={recent}
        rowKey={(o) => o.id}
        empty={<p className="py-8 text-center text-sm text-muted">{t('No purchase orders found')}</p>}
        mobileCard={(o) => (
          <>
            <MobileCardHeader title={o.code} code trailing={<Badge background={STATUS_STYLES[o.status].bg} color={STATUS_STYLES[o.status].fg}>{t(STATUS_LABEL[o.status])}</Badge>} />
            <MobileCardRow label={t('Supplier')}>{o.supplierName}</MobileCardRow>
            <MobileCardRow label={t('Total')}><Money sar={o.totalHalalas / 100} /></MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
