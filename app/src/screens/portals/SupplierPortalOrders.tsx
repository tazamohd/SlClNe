import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import {
  MobileCard,
  MobileCardHeader,
  MobileCardRow,
  MobileList,
  MobilePageHeader,
} from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'

interface OrderRow {
  _id?: string
  id: string
  workshop: string
  items: string
  total: number
  status: string
  date: string
  [k: string]: unknown
}

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'shipped', 'delivered'] as const

/** Supplier order management -- search, filter, and track orders.
 *  `SupplierPortalOrders.dc.html` is the design source. */
export function SupplierPortalOrders() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const orders = useCollection('purchaseOrders')
  const orderRows = (orders.data ?? []) as unknown as readonly OrderRow[]

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    let rows = [...orderRows]
    if (statusFilter !== 'all') {
      rows = rows.filter((r) => r.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.workshop.toLowerCase().includes(q) ||
          r.items.toLowerCase().includes(q)
      )
    }
    return rows
  }, [orderRows, search, statusFilter])

  if (isMobile) {
    return (
      <MobileList>
        <MobilePageHeader
          icon="ClipboardList"
          title={t('Orders')}
          subtitle={t('Manage your purchase orders')}
        />

        <Input
          icon="Search"
          inputSize="sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('Search orders...')}
          aria-label={t('Search orders')}
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={
                'inline-flex h-8 flex-shrink-0 cursor-pointer items-center rounded-full border px-3 font-action text-[12px] font-medium capitalize transition-colors ' +
                (statusFilter === st
                  ? 'border-salis-blue bg-[rgba(10,94,215,.1)] text-salis-blue'
                  : 'border-border bg-card text-muted')
              }
            >
              {t(st === 'all' ? 'All' : st)}
            </button>
          ))}
        </div>

        {orders.isLoading ? (
          <Loading label="Loading orders..." />
        ) : orders.isError ? (
          <ErrorState description={orders.error?.message} onRetry={() => void orders.refetch()} />
        ) : filtered.length === 0 ? (
          <Card className="p-5">
            <EmptyState
              icon="ClipboardList"
              title={t('No orders found')}
              description={t('No orders match the current filters.')}
            />
          </Card>
        ) : (
          filtered.map((order) => (
            <MobileCard key={order._id ?? order.id}>
              <MobileCardHeader
                title={order.id}
                code
                trailing={<StatusBadge value={order.status} label={t(order.status)} />}
              />
              <MobileCardRow label={t('Workshop')} value={order.workshop} />
              <MobileCardRow label={t('Items')} value={order.items} />
              <MobileCardRow label={t('Total')}>
                <span dir="ltr">{order.total.toLocaleString()} SAR</span>
              </MobileCardRow>
              <MobileCardRow label={t('Date')} value={order.date} />
            </MobileCard>
          ))
        )}
      </MobileList>
    )
  }

  return (
    <div className="flex max-w-[1240px] animate-fade-up flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="ClipboardList" size={24} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading">{t('Orders')}</h1>
            <p className="mt-1 text-sm text-muted">{t('Manage your purchase orders')}</p>
          </div>
        </div>
        <Button disabled={!isLive}>
          <Icon name="Download" size={16} />
          {t('Export')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          icon="Search"
          inputSize="sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('Search orders...')}
          className="w-full sm:w-72"
          aria-label={t('Search orders')}
        />
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={
                'inline-flex h-8 cursor-pointer items-center rounded-full border px-3 font-action text-[12px] font-medium capitalize transition-colors ' +
                (statusFilter === st
                  ? 'border-salis-blue bg-[rgba(10,94,215,.1)] text-salis-blue'
                  : 'border-border bg-card text-muted')
              }
            >
              {t(st === 'all' ? 'All' : st)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      {orders.isLoading ? (
        <Loading label="Loading orders..." />
      ) : orders.isError ? (
        <ErrorState description={orders.error?.message} onRetry={() => void orders.refetch()} />
      ) : filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon="ClipboardList"
            title={t('No orders found')}
            description={t('No orders match the current filters.')}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-inset text-muted">
                  <th className="px-4 py-2.5 text-start font-medium">{t('Order #')}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{t('Workshop')}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{t('Items')}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{t('Total (SAR)')}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{t('Status')}</th>
                  <th className="px-4 py-2.5 text-start font-medium">{t('Date')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order._id ?? order.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-inset"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-heading" dir="ltr">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 text-body">{order.workshop}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-body">{order.items}</td>
                    <td className="px-4 py-3 font-mono text-heading" dir="ltr">
                      {order.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={order.status} label={t(order.status)} />
                    </td>
                    <td className="px-4 py-3 text-muted" dir="ltr">
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
