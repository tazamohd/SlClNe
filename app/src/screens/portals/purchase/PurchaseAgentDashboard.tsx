import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money } from '@/components/ui/Money'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import type { PurchaseOrderRow } from '@/data/repository'
import { derived, UNKNOWN } from '@/screens/registry/writes'
import { fromHalalas } from '@/screens/finance/money'

/** The purchase agent's home, read from the purchase-orders collection.
 *
 *  The one task on this screen is the approvals waiting on someone: a draft
 *  order is one nobody has approved, and the card at the top counts them and
 *  leads to the approval queue. The design's five invented `PO-` rows and its
 *  "Monthly Spend" tile are gone — spend over a period is a server aggregate
 *  this page cannot sum from the rows it happens to hold. */
const STATUS_STYLES: Record<PurchaseOrderRow['status'], { bg: string; fg: string; label: string }> = {
  draft: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)', label: 'Awaiting approval' },
  approved: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', label: 'Approved' },
  sent: { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)', label: 'Sent' },
  receiving: { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)', label: 'Receiving' },
  received: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', label: 'Received' },
  closed: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)', label: 'Closed' },
}

function OrderStatus({ value }: { value: PurchaseOrderRow['status'] }) {
  const { t } = usePreferences()
  const style = STATUS_STYLES[value] ?? STATUS_STYLES.draft
  return (
    <Badge background={style.bg} color={style.fg}>
      {t(style.label)}
    </Badge>
  )
}

export function PurchaseAgentDashboard() {
  const { t, rtl } = usePreferences()
  const orders = useCollection('purchaseOrders')
  const rows = (orders.data ?? []) as readonly PurchaseOrderRow[]

  const awaiting = rows.filter((row) => row.status === 'draft')
  const open = rows.filter((row) => row.status !== 'received' && row.status !== 'closed')
  const suppliers = new Set(rows.map((row) => row.supplierName)).size
  const recent = rows.slice(0, 8)

  const kpis = [
    { label: t('Open Orders'), value: orders.isLoading ? UNKNOWN : String(open.length), icon: 'ShoppingCart', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Pending Approvals'), value: orders.isLoading ? UNKNOWN : String(awaiting.length), icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Received'), value: orders.isLoading ? UNKNOWN : String(rows.filter((row) => row.status === 'received').length), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Suppliers on order'), value: orders.isLoading ? UNKNOWN : String(suppliers), icon: 'Users', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  ]

  const columns: Column<PurchaseOrderRow>[] = [
    { header: 'Order', cell: (row) => row.code, code: true },
    { header: 'Supplier', cell: (row) => <span className="font-medium text-heading">{row.supplierName}</span> },
    { header: 'Total', cell: (row) => <Money sar={fromHalalas(row.totalHalalas)} />, numeric: true },
    { header: 'Ordered', cell: (row) => derived(row.orderedAt) },
    { header: 'Expected', cell: (row) => derived(row.expectedAt) },
    { header: 'Status', cell: (row) => <OrderStatus value={row.status} /> },
  ]

  return (
    <ScreenFrame
      icon="ShoppingCart"
      title="Purchase Dashboard"
      subtitle={t('Purchase agent overview and KPIs')}
      query={orders}
      skeleton="dashboard"
      empty={
        rows.length === 0 && {
          icon: 'ShoppingCart',
          title: 'No purchase orders yet',
          description: 'Orders raised from approved requisitions appear here.',
        }
      }
      toolbar={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>
      }
    >
      {/* The primary task: approvals waiting on someone. */}
      <Card
        className={
          awaiting.length > 0
            ? 'flex flex-col gap-3 border-salis-orange/30 p-5 sm:flex-row sm:items-center'
            : 'flex flex-col gap-3 p-5 sm:flex-row sm:items-center'
        }
      >
        <span
          className={
            awaiting.length > 0
              ? 'flex flex-shrink-0 rounded-xl bg-tint-orange p-3 text-salis-orange'
              : 'flex flex-shrink-0 rounded-xl bg-tint-blue p-3 text-salis-blue'
          }
        >
          <Icon name={awaiting.length > 0 ? 'AlertCircle' : 'CheckCircle'} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-heading">
            {awaiting.length > 0 ? t('Orders awaiting approval') : t('Nothing waiting for approval')}
          </p>
          <p className="mt-0.5 text-[13px] text-muted">
            {awaiting.length > 0
              ? `${awaiting.length} ${t('orders need a decision before they can be sent.')}`
              : t('New draft orders appear here the moment they are raised.')}
          </p>
        </div>
        <Link
          to="/procurement-portal"
          className={
            awaiting.length > 0
              ? 'inline-flex h-12 items-center justify-center gap-2 rounded bg-salis-orange px-4 font-action text-[15px] font-semibold text-white no-underline transition-colors hover:bg-salis-orange-hover hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2'
              : 'inline-flex h-12 items-center justify-center gap-2 rounded border-[1.5px] border-salis-blue px-4 font-action text-[15px] font-medium text-salis-blue no-underline transition-colors hover:bg-salis-blue/[.08] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2'
          }
        >
          {t('Review approvals')}
          <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={16} />
        </Link>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-sm font-bold text-heading">{t('Recent Orders')}</h2>
        <DataTable
          caption="Recent purchase orders"
          columns={columns}
          rows={recent}
          rowKey={(row) => row._id ?? row.id}
          mobileCard={(row) => (
            <>
              <MobileCardHeader title={row.code} code trailing={<OrderStatus value={row.status} />} />
              <MobileCardRow label={t('Supplier')}>{row.supplierName}</MobileCardRow>
              <MobileCardRow label={t('Total')}>
                <Money sar={fromHalalas(row.totalHalalas)} />
              </MobileCardRow>
              <MobileCardRow label={t('Expected')}>{derived(row.expectedAt)}</MobileCardRow>
            </>
          )}
        />
      </div>
    </ScreenFrame>
  )
}
