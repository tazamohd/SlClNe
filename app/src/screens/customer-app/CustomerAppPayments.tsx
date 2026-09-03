import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Money, formatSar } from '@/components/ui/Money'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { usePagedCollection, type RowOf } from '@/data/useCollection'
import { InvoiceStatusBadge } from '@/screens/registry/badges'
import { derived, UNKNOWN } from '@/screens/registry/writes'
import { fromHalalas, invoiceMoney } from '@/screens/finance/money'

/** The customer's payments, read through the repository seam.
 *
 *  The design listed seven invented payments and three saved cards. Neither
 *  exists behind the API: what a customer can be shown is their invoices, each
 *  with the amount the server computed and the balance it derives from the
 *  payments recorded against it. So the screen is the invoice list, and the
 *  one action on it — "Pay now" — is primary only while something is owed.
 *
 *  ### Balance on a fixture row
 *
 *  A fixture invoice carries a display total and a status, no payments. A
 *  *paid* one owes nothing; an open one owes its total, because nothing has
 *  been recorded against it. That reading is exact for the fixtures and is
 *  replaced by the server's `balanceHalalas` the moment the API serves it. */
type Invoice = RowOf<'invoices'> & {
  _id?: string
  totalHalalas?: number
  paidHalalas?: number
  balanceHalalas?: number
}

function balanceOf(invoice: Invoice): number {
  const money = invoiceMoney(invoice)
  if (money.fromServer) return money.balanceHalalas
  return invoice.status === 'paid' ? 0 : money.totalHalalas
}

export function CustomerAppPayments() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = usePagedCollection('invoices')
  const rows = (data?.rows ?? []) as readonly Invoice[]
  const total = data?.page.total

  const open = rows.filter((inv) => balanceOf(inv) > 0)
  const dueHalalas = open.reduce((sum, inv) => sum + balanceOf(inv), 0)
  const hasBalance = dueHalalas > 0

  const kpis = [
    { label: t('Amount Due'), value: isLoading ? UNKNOWN : formatSar(fromHalalas(dueHalalas)), icon: 'AlertCircle', bg: hasBalance ? 'var(--tint-orange)' : 'var(--tint-blue)', fg: hasBalance ? 'var(--salis-orange)' : 'var(--salis-blue)' },
    { label: t('Open Invoices'), value: isLoading ? UNKNOWN : String(open.length), icon: 'Receipt', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Total Invoices'), value: total === undefined ? UNKNOWN : String(total), icon: 'FileText', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Paid'), value: isLoading ? UNKNOWN : String(rows.filter((inv) => inv.status === 'paid').length), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<Invoice>[] = [
    { header: 'Invoice', cell: (inv) => inv.id, code: true },
    { header: 'Customer', cell: (inv) => <span className="font-medium text-heading">{derived(inv.cust)}</span> },
    { header: 'Amount', cell: (inv) => <Money sar={fromHalalas(invoiceMoney(inv).totalHalalas)} />, className: 'text-end' },
    {
      header: 'Balance',
      cell: (inv) => {
        const balance = balanceOf(inv)
        return (
          <Money
            sar={fromHalalas(balance)}
            className={balance > 0 ? 'font-semibold text-salis-orange' : 'font-semibold text-salis-blue'}
          />
        )
      },
      className: 'text-end',
    },
    { header: 'Due', cell: (inv) => derived(inv.due) },
    { header: 'Status', cell: (inv) => <InvoiceStatusBadge value={inv.status} /> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader
        icon="CreditCard"
        title={t('Payments')}
        subtitle={t('Invoices and what is still owed')}
        back={{ to: '/customer-app/profile', label: 'Profile' }}
        actions={
          hasBalance ? (
            <Button size="lg" icon="Wallet" onClick={() => navigate('/customer-app/wallet')}>
              {t('Pay now')}
            </Button>
          ) : (
            <Button size="lg" variant="outline" icon="Wallet" onClick={() => navigate('/customer-app/wallet')}>
              {t('Open wallet')}
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* The one decision on this screen: is anything owed, and if so, pay it. */}
      {!isLoading && !isError ? (
        <Card className="flex flex-col gap-3 rounded-2xl p-5 shadow-sm sm:flex-row sm:items-center">
          <span
            className={
              hasBalance
                ? 'flex flex-shrink-0 rounded-xl bg-tint-orange p-3 text-salis-orange'
                : 'flex flex-shrink-0 rounded-xl bg-tint-blue p-3 text-salis-blue'
            }
          >
            <Icon name={hasBalance ? 'AlertCircle' : 'CheckCircle'} size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-heading">
              {hasBalance ? t('You have a balance to pay') : t('Nothing owed right now')}
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              {hasBalance ? (
                <>
                  <Money sar={fromHalalas(dueHalalas)} className="font-semibold text-heading" /> ·{' '}
                  {open.length} {t('open invoices')}
                </>
              ) : (
                t('New invoices appear here as soon as the workshop issues them.')
              )}
            </p>
          </div>
          {hasBalance ? (
            <Button size="lg" icon="Wallet" className="w-full sm:w-auto" onClick={() => navigate('/customer-app/wallet')}>
              {t('Pay now')}
            </Button>
          ) : null}
        </Card>
      ) : null}

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-2 font-display text-sm font-bold text-heading">{t('Payment Methods')}</h2>
        <EmptyState
          icon="CreditCard"
          title={t('No saved payment methods')}
          description={t('Cards you save at checkout appear here.')}
        />
      </Card>

      <div>
        <p className="mb-3 text-sm font-bold text-heading">{t('Payment History')}</p>
        {isError ? (
          <Card className="p-6">
            <ErrorState
              description={error?.message}
              onRetry={() => void refetch()}
              retryLabel="Refresh"
            />
          </Card>
        ) : (
          <DataTable
            caption="Payment history"
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
                <MobileCardRow label={t('Amount')}>
                  <Money sar={fromHalalas(invoiceMoney(inv).totalHalalas)} />
                </MobileCardRow>
                <MobileCardRow label={t('Balance')}>
                  <Money
                    sar={fromHalalas(balanceOf(inv))}
                    className={balanceOf(inv) > 0 ? 'font-semibold text-salis-orange' : 'font-semibold text-salis-blue'}
                  />
                </MobileCardRow>
                <MobileCardRow label={t('Due')}>{derived(inv.due)}</MobileCardRow>
              </>
            )}
          />
        )}
      </div>
    </div>
  )
}
