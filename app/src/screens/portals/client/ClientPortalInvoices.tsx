import { KpiCard } from '@/components/ui/KpiCard'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Icon } from '@/components/ui/Icon'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { mineOnly } from '@/screens/portals/portal-data'
import { Money } from '@/components/ui/Money'
import { PageHeader } from '@/components/ui/PageHeader'
import { usePagedCollection, type RowOf } from '@/data/useCollection'
import { InvoiceStatusBadge } from '@/screens/registry/badges'
import { derived, UNKNOWN } from '@/screens/registry/writes'
import { fromHalalas, invoiceMoney } from '@/screens/finance/money'
import { AGGREGATE_GAP } from '@/screens/accounting/reporting'

/** The customer's invoices, read through the repository seam.
 *
 *  Scope is the server's: this reads `invoices` the way `CustomerPortal` does
 *  and never filters by identity in the browser.
 *
 *  ### Money, and what is not summed here
 *
 *  Every amount is one the server computed for one record — `totalHalalas` and
 *  the `balanceHalalas` the API derives from the invoice's payments — rendered
 *  as-is (§A10). "Amount due" and "total paid" are cross-record sums the server
 *  owns and this screen deliberately does not compute: a browser adding up the
 *  page it happens to hold is adding up one page and calling it a lifetime. The
 *  two tiles therefore show the em dash and name the endpoint that would supply
 *  them. The invoice count is the server's own `page.total`, not a row count.
 *
 *  The design's "Vehicle" and "Service" columns have no column behind them —
 *  `invoices` projects the customer, code, amount, due date and status, and no
 *  vehicle or service line — so they render `derived()`'s em dash rather than a
 *  value invented to fill the table.
 */
type Invoice = RowOf<'invoices'> & {
  _id?: string
  customerId?: string | null
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

export function ClientPortalInvoices() {
  const { t } = usePreferences()
  const { user } = useSession()
  const { data, isLoading, isError, error, refetch } = usePagedCollection('invoices')
  const rows = mineOnly((data?.rows ?? []) as readonly Invoice[], user?.id)
  const total = data?.page.total

  const overdue = rows.filter((inv) => inv.status === 'overdue').length

  const kpis = [
    { label: t('Total Invoices'), value: total === undefined ? UNKNOWN : String(total), icon: 'FileText', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Amount Due'), value: UNKNOWN, icon: 'AlertCircle', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Total Paid'), value: UNKNOWN, icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Overdue'), value: String(overdue), icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const columns: Column<Invoice>[] = [
    { header: t('Invoice'), cell: (inv) => inv.id, code: true },
    { header: t('Vehicle'), cell: (inv) => derived(inv.veh) },
    { header: t('Service'), cell: (inv) => derived(inv.svc) },
    { header: t('Due'), cell: (inv) => derived(inv.due) },
    { header: t('Amount'), cell: (inv) => <Money sar={fromHalalas(invoiceMoney(inv).totalHalalas)} /> },
    { header: t('Balance'), cell: (inv) => <BalanceCell invoice={inv} /> },
    { header: t('Status'), cell: (inv) => <InvoiceStatusBadge value={inv.status} /> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="FileText" title={t('Invoices')} subtitle={t('Invoice and payment history')} />

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
          caption="Client invoices"
          columns={columns}
          rows={rows}
          rowKey={(inv, index) => inv._id ?? `${inv.id}-${index}`}
          loading={isLoading}
          empty={
            <EmptyState
              icon="Receipt"
              title={t('No invoices yet')}
              description={t('Invoices for your services appear here.')}
            />
          }
          mobileCard={(inv) => (
            <>
              <MobileCardHeader title={inv.id} code trailing={<InvoiceStatusBadge value={inv.status} />} />
              <MobileCardRow label={t('Service')}>{derived(inv.svc)}</MobileCardRow>
              <MobileCardRow label={t('Due')}>{derived(inv.due)}</MobileCardRow>
              <MobileCardRow label={t('Amount')}>
                <Money sar={fromHalalas(invoiceMoney(inv).totalHalalas)} />
              </MobileCardRow>
              <MobileCardRow label={t('Balance')}>
                <BalanceCell invoice={inv} />
              </MobileCardRow>
            </>
          )}
        />
      )}
    </div>
  )
}
