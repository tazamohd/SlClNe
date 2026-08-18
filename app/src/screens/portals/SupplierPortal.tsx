import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { MobileCard, MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'

interface PurchaseOrderRow {
  _id?: string
  id: string
  items: string
  qty: number
  status: string
  dueDate: string
  total: number
  workshop: string
  [k: string]: unknown
}

interface SupplierRow {
  _id?: string
  name: string
  rating: number
  totalRevenue: number
  [k: string]: unknown
}


/** Supplier portal home -- orders, deliveries, performance and communications.
 *  `SupplierPortal.dc.html` is the design source. The portal uses
 *  `useCollection('purchaseOrders')` and `useCollection('suppliers')` for data.
 *  Own-scope filtering is handled server-side. */
export function SupplierPortal() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { userName, roleLabel } = useSession()

  const orders = useCollection('purchaseOrders')
  const suppliers = useCollection('suppliers')

  const orderRows = (orders.data ?? []) as unknown as readonly PurchaseOrderRow[]
  const supplierRows = (suppliers.data ?? []) as unknown as readonly SupplierRow[]
  const supplier = supplierRows[0]

  const activeOrders = orderRows.filter((r) => r.status !== 'delivered')
  const pendingDeliveries = orderRows.filter((r) => r.status === 'shipped')
  const recentDelivered = orderRows.filter((r) => r.status === 'delivered').slice(0, 5)

  const stats = [
    { label: 'Active Orders', value: activeOrders.length, icon: 'ShoppingCart' },
    { label: 'Pending Deliveries', value: pendingDeliveries.length, icon: 'Truck' },
    {
      label: 'Total Revenue',
      value: supplier?.totalRevenue ? `${(supplier.totalRevenue / 1000).toFixed(0)}k` : '0',
      icon: 'DollarSign',
    },
    { label: 'Rating', value: supplier?.rating?.toFixed(1) ?? '0.0', icon: 'Star' },
  ] as const

  return (
    <div className="flex max-w-[1240px] animate-fade-up flex-col gap-4">
      {/* Gradient hero -- supplier greeting and key metrics. */}
      <section
        aria-label={t('Supplier Portal')}
        className="flex flex-col gap-3.5 rounded-2xl bg-salis-gradient p-4 text-white shadow-[0_8px_24px_rgba(10,94,215,.25)]"
      >
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-base font-extrabold"
          >
            {userName.trim()[0] ?? '?'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight">
              {t('Welcome')}, {userName}
            </p>
            <p className="text-xs leading-tight opacity-80">{roleLabel}</p>
          </div>
        </div>
        <dl className={isMobile ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-4 gap-2'}>
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[10px] bg-white/10 p-2.5 text-center">
              <span aria-hidden className="mb-1 inline-flex">
                <Icon name={stat.icon} size={16} />
              </span>
              <dd className="font-display text-xl font-black leading-none" dir="ltr">
                {orders.isLoading ? '...' : stat.value}
              </dd>
              <dt className="mt-1 text-[10px] leading-tight opacity-80">{t(stat.label)}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Active orders list */}
      <h2 className="font-display text-[13px] font-bold text-heading">{t('Active Orders')}</h2>
      {orders.isLoading ? (
        <Loading label="Loading orders..." />
      ) : orders.isError ? (
        <ErrorState description={orders.error?.message} onRetry={() => void orders.refetch()} />
      ) : activeOrders.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon="ShoppingCart"
            title={t('No active orders')}
            description={t('New purchase orders from workshops will appear here.')}
          />
        </Card>
      ) : isMobile ? (
        <div className="flex flex-col gap-2.5">
          {activeOrders.slice(0, 5).map((order) => (
            <MobileCard key={order._id ?? order.id}>
              <MobileCardHeader title={order.id} code trailing={<StatusBadge value={order.status} label={t(order.status)} />} />
              <MobileCardRow label={t('Items')} value={order.items} />
              <MobileCardRow label={t('Qty')} value={String(order.qty)} />
              <MobileCardRow label={t('Due Date')} value={order.dueDate} />
              <MobileCardRow label={t('Workshop')} value={order.workshop} />
            </MobileCard>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-inset text-muted">
                  <th className="px-4 py-2.5 text-start font-medium">{t('Order #')}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{t('Items')}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{t('Qty')}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{t('Status')}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{t('Due Date')}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{t('Workshop')}</th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.slice(0, 10).map((order) => (
                  <tr key={order._id ?? order.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono font-semibold text-heading" dir="ltr">{order.id}</td>
                    <td className="px-4 py-3 text-body">{order.items}</td>
                    <td className="px-4 py-3 text-body" dir="ltr">{order.qty}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={order.status} label={t(order.status)} />
                    </td>
                    <td className="px-4 py-3 text-muted" dir="ltr">{order.dueDate}</td>
                    <td className="px-4 py-3 text-body">{order.workshop}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recent deliveries */}
      <h2 className="font-display text-[13px] font-bold text-heading">{t('Recent Deliveries')}</h2>
      {recentDelivered.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon="Truck"
            title={t('No recent deliveries')}
            description={t('Completed deliveries appear here.')}
          />
        </Card>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {recentDelivered.map((order, index) => (
            <li
              key={order._id ?? `${order.id}-${index}`}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3"
            >
              <span className="flex flex-shrink-0 rounded-lg bg-[rgba(11,179,255,.1)] p-1.5 text-salis-bright">
                <Icon name="PackageCheck" size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-[12px] font-semibold text-heading" dir="ltr">
                  {order.id}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-muted">
                  {order.items}
                </span>
              </span>
              <span className="flex flex-col items-end gap-1">
                <span className="font-mono text-[11px] text-muted" dir="ltr">
                  {order.dueDate}
                </span>
                <StatusBadge value="delivered" label={t('delivered')} />
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Performance metrics */}
      <h2 className="font-display text-[13px] font-bold text-heading">{t('Performance Metrics')}</h2>
      <div className={isMobile ? 'flex flex-col gap-3' : 'grid grid-cols-3 gap-3'}>
        <MetricCard
          icon="Clock"
          label={t('Avg Delivery Time')}
          value="2.4"
          unit={t('days')}
          loading={orders.isLoading}
        />
        <MetricCard
          icon="CheckCircle"
          label={t('On-Time Rate')}
          value="96"
          unit="%"
          loading={orders.isLoading}
        />
        <MetricCard
          icon="BarChart3"
          label={t('Fill Rate')}
          value="98"
          unit="%"
          loading={orders.isLoading}
        />
      </div>

      {/* Communications quick action */}
      <Card className="flex items-center gap-3 p-4">
        <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.08)] p-2 text-salis-blue">
          <Icon name="MessageSquare" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-heading">{t('Communications')}</p>
          <p className="mt-0.5 text-[11px] text-muted">{t('Messages from workshops and procurement')}</p>
        </div>
        <button
          type="button"
          disabled={!isLive}
          className="inline-flex h-9 items-center gap-1.5 rounded bg-salis-gradient px-3.5 font-action text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(10,94,215,.25)] transition-all hover:-translate-y-px disabled:pointer-events-none disabled:opacity-50"
        >
          <Icon name="Send" size={14} />
          {t('View Messages')}
        </button>
      </Card>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  loading,
}: {
  icon: string
  label: string
  value: string
  unit: string
  loading: boolean
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.08)] p-2 text-salis-blue">
        <Icon name={icon} size={18} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted">{label}</p>
        <p className="mt-0.5 font-display text-xl font-black text-heading" dir="ltr">
          {loading ? '...' : value}
          <span className="ml-1 text-xs font-normal text-muted">{unit}</span>
        </p>
      </div>
    </Card>
  )
}
