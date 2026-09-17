import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { Money } from '@/components/ui/Money'
import { usePagedCollection, type RowOf } from '@/data/useCollection'
import { InvoiceStatusBadge } from '@/screens/registry/badges'
import { derived, UNKNOWN } from '@/screens/registry/writes'
import { fromHalalas, invoiceMoney } from '@/screens/finance/money'
import { AGGREGATE_GAP } from '@/screens/accounting/reporting'

/** The customer's payment history, read through the repository seam.
 *
 *  Scope is the server's — this reads `invoices`, self-scoped by RLS (F-015's
 *  pattern, extended to customers: `drizzle/0014_customer_id_link.sql`), the
 *  way `ClientPortalInvoices` does. It used to be seven hand-written rows
 *  with fabricated payment-method last-4 digits and a spending total nobody
 *  computed; a customer's *own* payment history was not the concept it
 *  showed.
 *
 *  This is invoice-level, not payment-transaction-level. `payments` (the
 *  individual charges an invoice can carry more than one of) is not scoped
 *  to a customer anywhere in this system yet — no `customer_id` column, no
 *  RLS entry — so a per-transaction ledger cannot be shown safely here
 *  without either a schema change or a query a self-scoped principal has no
 *  business running. `invoices.paidHalalas` / `balanceHalalas` are exactly
 *  what a customer needs to answer "what have I paid, what do I still owe" —
 *  server-computed, per record — so that is what this shows instead of a
 *  fabricated one.
 *
 *  Saved payment methods (cards) are a card-vaulting integration this system
 *  does not have — `/stripe-payment-processing` is its own, separately
 *  tracked, unconnected placeholder — so this screen names that gap rather
 *  than listing invented card numbers next to real invoice data.
 */
type Invoice = RowOf<'invoices'> & {
  _id?: string
  totalHalalas?: number
  paidHalalas?: number
  balanceHalalas?: number
  svc?: string | null
}

function AggregateNote() {
  const { t } = usePreferences()
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-muted">
      <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
      {t('Server aggregate:')}{' '}
      <span dir="ltr" className="font-mono text-body">{AGGREGATE_GAP.sales}</span>
    </p>
  )
}

function PaymentMethodsGap() {
  const { t } = usePreferences()
  return (
    <Card className="rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex flex-shrink-0 rounded-lg bg-inset p-2 text-muted" aria-hidden>
          <Icon name="CreditCard" size={16} />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-sm font-bold text-heading">{t('Payment Methods')}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {t(
              'Saving a card needs a card-vaulting integration this deployment does not have connected. Nothing is stored here today.'
            )}
          </p>
        </div>
      </div>
    </Card>
  )
}

export function CustomerAppPayments() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data, isLoading, isError, error, refetch } = usePagedCollection('invoices')
  const rows = (data?.rows ?? []) as readonly Invoice[]
  const total = data?.page.total

  const settled = rows.filter((inv) => invoiceMoney(inv).fromServer && invoiceMoney(inv).balanceHalalas <= 0)
  const outstanding = rows.filter((inv) => invoiceMoney(inv).fromServer && invoiceMoney(inv).balanceHalalas > 0)
  const anyServerMoney = rows.some((inv) => invoiceMoney(inv).fromServer)

  const kpis = [
    {
      label: t('Total Paid'),
      value: anyServerMoney
        ? `${(rows.reduce((sum, inv) => sum + (invoiceMoney(inv).fromServer ? invoiceMoney(inv).paidHalalas : 0), 0) / 100_000).toFixed(1)}K`
        : UNKNOWN,
      icon: 'DollarSign',
      bg: 'var(--tint-blue)',
      fg: 'var(--salis-blue)',
    },
    { label: t('Invoices'), value: total === undefined ? UNKNOWN : String(total), icon: 'Receipt', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Outstanding'), value: String(outstanding.length), icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Settled'), value: String(settled.length), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const empty = (
    <Card className="p-5">
      <EmptyState
        icon="Receipt"
        title={t('No invoices yet')}
        description={t('Invoices and payments for your services appear here.')}
      />
    </Card>
  )

  const failed = <ErrorState description={error?.message} onRetry={() => void refetch()} />

  function BalanceLine({ invoice }: { invoice: Invoice }) {
    const money = invoiceMoney(invoice)
    if (!money.fromServer) return <span className="text-muted">{UNKNOWN}</span>
    return (
      <span className={money.balanceHalalas > 0 ? 'font-semibold text-salis-orange' : 'font-semibold text-salis-blue'}>
        <Money sar={fromHalalas(money.balanceHalalas)} />
      </span>
    )
  }

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="CreditCard" title={t('Payments')} subtitle={t('Payment history and balances')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <p className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        <AggregateNote />
        <PaymentMethodsGap />

        <p className="mt-1 text-sm font-bold text-heading">{t('Payment History')}</p>
        {isLoading ? (
          <Loading label="Loading invoices..." />
        ) : isError ? (
          failed
        ) : rows.length === 0 ? (
          empty
        ) : (
          rows.map((inv, index) => (
            <MobileCard key={inv._id ?? `${inv.id}-${index}`}>
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2">
                    <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Receipt" size={14} /></span>
                    <div>
                      <p className="text-[13px] font-semibold text-heading">{derived(inv.svc)}</p>
                      <p className="text-xs text-muted" dir="ltr">{inv.id}</p>
                    </div>
                  </div>
                }
                trailing={<InvoiceStatusBadge value={inv.status} />}
              />
              <MobileCardRow label={t('Amount')}>
                <Money sar={fromHalalas(invoiceMoney(inv).totalHalalas)} />
              </MobileCardRow>
              <MobileCardRow label={t('Balance')}>
                <BalanceLine invoice={inv} />
              </MobileCardRow>
              <MobileCardRow label={t('Due')} value={derived(inv.due)} />
            </MobileCard>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="CreditCard" title={t('Payments')} subtitle={t('Payment history and balances')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>
      <AggregateNote />

      <PaymentMethodsGap />

      <div>
        <p className="mb-3 text-sm font-bold text-heading">{t('Payment History')}</p>
        {isLoading ? (
          <Loading label="Loading invoices..." />
        ) : isError ? (
          failed
        ) : rows.length === 0 ? (
          empty
        ) : (
          <Card className="overflow-hidden p-0">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <Th align="start" className="ps-5">{t('Invoice')}</Th>
                  <Th align="start">{t('Service')}</Th>
                  <Th align="start">{t('Due')}</Th>
                  <Th align="end">{t('Amount')}</Th>
                  <Th align="end">{t('Balance')}</Th>
                  <Th align="end" className="pe-5">{t('Status')}</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((inv, index) => (
                  <tr key={inv._id ?? `${inv.id}-${index}`}>
                    <td className="border-t border-border py-3 ps-5 font-mono text-xs text-body" dir="ltr">
                      {inv.id}
                    </td>
                    <td className="border-t border-border py-3 text-body">{derived(inv.svc)}</td>
                    <td className="border-t border-border py-3 text-body">{derived(inv.due)}</td>
                    <td className="border-t border-border py-3 text-end">
                      <Money sar={fromHalalas(invoiceMoney(inv).totalHalalas)} className="font-semibold text-heading" />
                    </td>
                    <td className="border-t border-border py-3 text-end">
                      <BalanceLine invoice={inv} />
                    </td>
                    <td className="border-t border-border py-3 pe-5 text-end">
                      <InvoiceStatusBadge value={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  )
}

function Th({ children, align, className = '' }: { children: React.ReactNode; align: 'start' | 'end'; className?: string }) {
  return (
    <th
      scope="col"
      className={`py-2.5 text-[10.5px] font-bold uppercase tracking-[.05em] text-muted ${align === 'end' ? 'text-end' : 'text-start'} ${className}`}
    >
      {children}
    </th>
  )
}
