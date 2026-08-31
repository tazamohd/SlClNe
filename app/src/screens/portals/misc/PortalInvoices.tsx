import { KpiCard } from '@/components/ui/KpiCard'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { usePagedCollection, type RowOf } from '@/data/useCollection'
import { InvoiceStatusBadge } from '@/screens/registry/badges'
import { derived, UNKNOWN } from '@/screens/registry/writes'
import { fromHalalas, invoiceMoney } from '@/screens/finance/money'
import { AGGREGATE_GAP } from '@/screens/accounting/reporting'

/** The portal's invoice register, read through the repository seam.
 *
 *  A staff-side view — it names the customer — so it reads the collection
 *  unfiltered and lets the API decide what the signed-in principal may see:
 *  `GET /invoices` is gated on the `invoices` module and narrowed by row-level
 *  security per organization and branch. Nothing is trimmed in the browser.
 *
 *  Every amount is one the server computed for one record (§A10): `totalHalalas`
 *  and the `balanceHalalas` the API derives from the invoice's payments, shown
 *  as-is. "Outstanding" and "Collected MTD" are period sums the server owns and
 *  exposes through `GET /invoices/summary`, which this register does not call —
 *  so they show the em dash and the note names the endpoint, rather than adding
 *  up the page the browser happens to hold. "Total Invoices" is the server's own
 *  `page.total`.
 *
 *  The design's "Vehicle" and "Services" columns have no column behind them —
 *  `invoices` projects the customer, code, amount, due date and status — so they
 *  render `derived()`'s em dash instead of a value invented to fill the table.
 */
type Invoice = RowOf<'invoices'> & {
  _id?: string
  totalHalalas?: number
  paidHalalas?: number
  balanceHalalas?: number
  /** Not projected by any build today — see the note above. */
  veh?: string | null
  svc?: string | null
}

/** The balance the server derived from the invoice's payments, or an honest
 *  blank. A fixture row carries a display total and nothing else, so computing
 *  `total − paid` there would report every settled invoice as fully
 *  outstanding — the same rule `finance/Invoices` states for its own column. */
function BalanceCell({ invoice }: { invoice: Invoice }) {
  const { t } = usePreferences()
  const money = invoiceMoney(invoice)
  if (!money.fromServer) {
    return (
      <span className="text-[11px] text-muted" title={t('Needs the API')}>
        {UNKNOWN}
      </span>
    )
  }
  return (
    <Money
      sar={fromHalalas(money.balanceHalalas)}
      className={money.balanceHalalas > 0 ? 'font-semibold text-salis-orange' : 'font-semibold text-salis-blue'}
    />
  )
}

export function PortalInvoices() {
  const { t } = usePreferences()
  const { data, isLoading, isError, error, refetch } = usePagedCollection('invoices')
  const rows = (data?.rows ?? []) as readonly Invoice[]
  const total = data?.page.total

  const overdue = rows.filter((inv) => inv.status === 'overdue').length

  const kpis = [
    { label: t('Total Invoices'), value: total === undefined ? UNKNOWN : String(total), icon: 'FileText', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Outstanding'), value: UNKNOWN, icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Collected MTD'), value: UNKNOWN, icon: 'CheckCircle', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Overdue'), value: String(overdue), icon: 'AlertTriangle', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const columns: Column<Invoice>[] = [
    { header: t('Invoice #'), cell: (inv) => inv.id, code: true },
    { header: t('Customer'), cell: (inv) => derived(inv.cust) },
    { header: t('Vehicle'), cell: (inv) => derived(inv.veh) },
    { header: t('Services'), cell: (inv) => derived(inv.svc) },
    { header: t('Amount'), cell: (inv) => <Money sar={fromHalalas(invoiceMoney(inv).totalHalalas)} /> },
    { header: t('Balance'), cell: (inv) => <BalanceCell invoice={inv} /> },
    { header: t('Due Date'), cell: (inv) => derived(inv.due) },
    { header: t('Status'), cell: (inv) => <InvoiceStatusBadge value={inv.status} /> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="FileText" title={t('Invoices')} subtitle={t('Track billing and payment status')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>
      <p className="flex items-start gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
        {t('Server aggregate:')}{' '}
        <span dir="ltr" className="font-mono text-body">{AGGREGATE_GAP.sales}</span>
      </p>

      {isError ? (
        <ErrorState description={error?.message} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          caption="Portal invoices"
          columns={columns}
          rows={rows}
          rowKey={(inv, index) => inv._id ?? `${inv.id}-${index}`}
          loading={isLoading}
          empty={
            <EmptyState icon="Receipt" title={t('No invoices yet')} />
          }
          mobileCard={(inv) => (
            <>
              <MobileCardHeader title={inv.id} code trailing={<InvoiceStatusBadge value={inv.status} />} />
              <MobileCardRow label={t('Customer')}>{derived(inv.cust)}</MobileCardRow>
              <MobileCardRow label={t('Amount')}>
                <Money sar={fromHalalas(invoiceMoney(inv).totalHalalas)} />
              </MobileCardRow>
              <MobileCardRow label={t('Balance')}>
                <BalanceCell invoice={inv} />
              </MobileCardRow>
              <MobileCardRow label={t('Due Date')}>{derived(inv.due)}</MobileCardRow>
            </>
          )}
        />
      )}
    </div>
  )
}
