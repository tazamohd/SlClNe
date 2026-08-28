import { useMemo, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
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

  const columns: Column<OrderRow>[] = [
    { header: t('Order #'), cell: (order) => order.id },
    { header: t('Workshop'), cell: (order) => order.workshop },
    { header: t('Items'), cell: (order) => order.items },
    { header: t('Total (SAR)'), cell: (order) => order.total.toLocaleString() },
    { header: t('Status'), cell: (order) => <StatusBadge value={order.status} label={t(order.status)} /> },
    { header: t('Date'), cell: (order) => order.date },
  ]

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
                  ? 'border-salis-blue bg-[var(--tint-blue)] text-salis-blue'
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
      ) : (
        <DataTable
          caption="Supplier purchase orders"
          columns={columns}
          rows={filtered as OrderRow[]}
          rowKey={(order) => order._id ?? order.id}
          empty={
            <EmptyState
              icon="ClipboardList"
              title={t('No orders found')}
              description={t('No orders match the current filters.')}
            />
          }
          mobileCard={(order) => (
            <>
              <MobileCardHeader title={order.id} trailing={<StatusBadge value={order.status} label={t(order.status)} />} />
              <MobileCardRow label={t('Workshop')}>{order.workshop}</MobileCardRow>
              <MobileCardRow label={t('Items')}>{order.items}</MobileCardRow>
              <MobileCardRow label={t('Total')}><span dir="ltr">{order.total.toLocaleString()} SAR</span></MobileCardRow>
              <MobileCardRow label={t('Date')}>{order.date}</MobileCardRow>
            </>
          )}
        />
      )}
    </div>
  )
}
