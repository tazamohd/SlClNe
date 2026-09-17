import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Money, formatSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'
import { fromHalalas } from '@/screens/finance/money'

/** What is owed to suppliers, from the purchase orders that actually exist —
 *  not seven hand-written rows with a fabricated "Total Payable" total.
 *
 *  This is as far as this screen can honestly go. `purchase_orders` carries a
 *  supplier, a status and a total; nothing in this system tracks whether or
 *  when a purchase order was *paid* — no supplier-payment table, no
 *  paid/outstanding column, no payment-capture endpoint. Accounts payable to
 *  a supplier is a real, separate capability this deployment does not have
 *  yet, and inventing a due date, a payment method or a Paid/Overdue/
 *  Scheduled status for it — as the previous version of this screen did —
 *  is exactly the fabricated financial document this pass exists to remove.
 *  The gap is named below rather than papered over. */
type PurchaseOrder = RowOf<'purchaseOrders'> & { _id?: string; totalHalalas?: number }

export function PurchaseAgentPayments() {
  const { t } = usePreferences()
  const { data: orders = [], isLoading, isError, error, refetch } = useCollection('purchaseOrders')
  const allRows = orders as readonly PurchaseOrder[]
  /* "Open" as this screen means it: not a draft (not a real commitment yet)
   * and not closed (settled and off the books). The table, the count and the
   * total all use exactly this filter, so the caption and the KPIs describe
   * the same rows rather than three different slices of the same word. */
  const rows = allRows.filter((o) => o.status !== 'draft' && o.status !== 'closed')

  const totalOwedHalalas = rows.reduce((sum, o) => sum + (o.totalHalalas ?? 0), 0)

  const kpis = [
    { label: t('Total on Open Orders'), value: formatSar(fromHalalas(totalOwedHalalas)), icon: 'Wallet', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Open Orders'), value: String(rows.length), icon: 'FileText', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  ]

  const columns: Column<PurchaseOrder>[] = [
    { header: t('PO'), cell: (o) => o.code, code: true },
    { header: t('Supplier'), cell: (o) => o.supplierName },
    { header: t('Amount'), cell: (o) => <Money sar={fromHalalas(o.totalHalalas ?? 0)} /> },
    { header: t('Status'), cell: (o) => <StatusBadge value={o.status} label={t(o.status)} /> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Wallet" title={t('Payments')} subtitle={t('Amounts owed to suppliers, by purchase order')} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="flex items-start gap-3 p-4">
        <span className="flex flex-shrink-0 rounded-lg bg-inset p-2 text-muted" aria-hidden>
          <Icon name="AlertCircle" size={16} />
        </span>
        <div className="min-w-0 text-[13px]">
          <p className="font-semibold text-heading">{t('Supplier payment tracking is not connected')}</p>
          <p className="mt-1 leading-relaxed text-muted">
            {t(
              'This system has no accounts-payable record for a purchase order — no paid/outstanding status, due date or payment method. The amounts above are real purchase-order totals; whether and when each has been paid is not tracked yet.'
            )}
          </p>
        </div>
      </Card>

      {isError ? (
        <Card className="p-6">
          <ErrorState description={error?.message} onRetry={() => void refetch()} />
        </Card>
      ) : (
        <DataTable
          caption="Open purchase orders"
          columns={columns}
          rows={rows}
          rowKey={(o, index) => o._id ?? `${o.code}-${index}`}
          loading={isLoading}
          mobileCard={(o) => (
            <>
              <MobileCardHeader title={o.code} code trailing={<StatusBadge value={o.status} label={t(o.status)} />} />
              <MobileCardRow>{o.supplierName}</MobileCardRow>
              <MobileCardRow label={t('Amount')}>
                <Money sar={fromHalalas(o.totalHalalas ?? 0)} className="font-semibold text-heading" />
              </MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="FileText" title={t('No purchase orders yet')} />}
        />
      )}
    </div>
  )
}
