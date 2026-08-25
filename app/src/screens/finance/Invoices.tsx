import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListPageHeader } from '@/components/shell/ListPage'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { InvoiceRowActions } from './InvoiceActions'
import { RecordPaymentModal, type PayableInvoice } from './RecordPaymentModal'
import { fromHalalas, invoiceMoney } from './money'

type Invoice = RowOf<'invoices'>

/** Invoice status palette. Paid is brand blue, overdue is the warning orange,
 *  unpaid is neutral slate — no green or red anywhere (README §7).
 *
 *  `draft` and `partial` arrive from the API, which carries the full lifecycle
 *  the design's three statuses only sampled. */
export const INVOICE_STATUS: Record<string, readonly [string, string]> = {
  draft: ['rgba(100,116,139,.1)', '#64748B'],
  paid: ['rgba(10,94,215,.1)', '#0A5ED7'],
  partial: ['rgba(11,179,255,.1)', '#0BB3FF'],
  unpaid: ['rgba(100,116,139,.1)', '#64748B'],
  overdue: ['rgba(249,115,22,.1)', '#F97316'],
  cancelled: ['rgba(100,116,139,.1)', '#64748B'],
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const { t } = usePreferences()
  const [background, color] = INVOICE_STATUS[status] ?? INVOICE_STATUS.unpaid
  return (
    <Badge background={background} color={color}>
      {t(status[0].toUpperCase() + status.slice(1))}
    </Badge>
  )
}

/** The invoice as this screen hands it to the shared actions. */
function payable(invoice: Invoice): PayableInvoice {
  return invoice as unknown as PayableInvoice
}

/** Invoice register.
 *
 *  Every amount on this screen is the server's: `totalHalalas`, `paidHalalas`
 *  and `balanceHalalas` are computed by the API from the invoice's own lines
 *  and its payments, and rendered here without arithmetic. A build with no API
 *  configured falls back to the fixture's display string, which carries a total
 *  and nothing else — so the balance column is honestly blank rather than
 *  guessed. */
export function Invoices() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { data: invoices = [], isLoading, error, refetch } = useCollection('invoices')
  const [query, setQuery] = useState('')
  const [paying, setPaying] = useState<PayableInvoice | null>(null)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return invoices
    return invoices.filter((invoice) =>
      [invoice.id, invoice.cust].some((field) => field.toLowerCase().includes(needle))
    )
  }, [invoices, query])

  const columns: Column<Invoice>[] = [
    { header: 'Invoice #', cell: (invoice) => invoice.id, code: true },
    { header: 'Customer', cell: (invoice) => invoice.cust },
    { header: 'Due Date', cell: (invoice) => invoice.due },
    {
      header: 'Amount',
      cell: (invoice) => (
        <Money sar={fromHalalas(invoiceMoney(invoice).totalHalalas)} className="font-semibold" />
      ),
    },
    {
      header: 'Balance',
      cell: (invoice) => <BalanceCell invoice={invoice} />,
    },
    { header: 'Status', cell: (invoice) => <InvoiceStatusBadge status={invoice.status} /> },
    {
      header: 'Actions',
      cell: (invoice) => (
        <InvoiceRowActions invoice={payable(invoice)} onRecordPayment={setPaying} />
      ),
    },
  ]

  if (isMobile) {
    return (
      <>
        <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
          <MobilePageHeader
            icon="Receipt"
            title={t('Invoices')}
            actions={
              can('invoices', 'c') ? (
                <Button
                  size="md"
                  onClick={() => navigate('/invoice-create')}
                  aria-label={t('New Invoice')}
                >
                  <Icon name="Plus" size={16} />
                  <span className="sr-only">{t('New Invoice')}</span>
                </Button>
              ) : null
            }
          />
          <input
            type="search"
            aria-label={t('Search invoices...')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Search invoices...')}
            className="h-10 w-full rounded-lg border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue"
          />
          {error ? (
            <Card className="p-4">
              <ErrorState
                title={t("Couldn't load the invoices")}
                description={error.message}
                onRetry={() => void refetch()}
              />
            </Card>
          ) : isLoading ? (
            <p className="py-6 text-center text-sm text-muted">{t('Loading...')}</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={query ? 'SearchX' : 'Receipt'}
              title={query ? t('No matching invoices') : t('No invoices yet')}
              description={
                query
                  ? t('Try a different customer or invoice number.')
                  : t('Invoices are raised when a job card is delivered.')
              }
            />
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((invoice) => (
                <MobileCard key={invoice.id} onClick={() => navigate(`/invoice-detail?id=${encodeURIComponent(invoice.id)}`)}>
                  <MobileCardHeader
                    title={invoice.id}
                    code
                    trailing={<InvoiceStatusBadge status={invoice.status} />}
                  />
                  <MobileCardRow>{invoice.cust}</MobileCardRow>
                  <MobileCardRow label={t('Due Date')}>{invoice.due}</MobileCardRow>
                  <MobileCardRow label={t('Amount')}>
                    <Money
                      sar={fromHalalas(invoiceMoney(invoice).totalHalalas)}
                      className="font-semibold text-heading"
                    />
                  </MobileCardRow>
                  <MobileCardRow label={t('Balance')}>
                    <BalanceCell invoice={invoice} />
                  </MobileCardRow>
                  <div className="border-t border-border pt-2.5">
                    <InvoiceRowActions invoice={payable(invoice)} onRecordPayment={setPaying} labelled />
                  </div>
                </MobileCard>
              ))}
            </div>
          )}
        </div>
        {paying ? (
          <RecordPaymentModal invoice={paying} open onClose={() => setPaying(null)} />
        ) : null}
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Invoices')}
        search={{ value: query, onChange: setQuery, placeholder: t('Search invoices...') }}
        actions={
          can('invoices', 'c') ? (
            <Button size="md" onClick={() => navigate('/invoice-create')}>
              <Icon name="Plus" size={16} />
              {t('New Invoice')}
            </Button>
          ) : null
        }
      />

      {error ? (
        <Card className="p-6">
          <ErrorState
            title={t("Couldn't load the invoices")}
            description={error.message}
            onRetry={() => void refetch()}
          />
        </Card>
      ) : (
        <DataTable
          caption="Invoices"
          columns={columns}
          rows={filtered}
          rowKey={(invoice) => invoice.id}
          loading={isLoading}
          onRowClick={(invoice) => navigate(`/invoice-detail?id=${encodeURIComponent(invoice.id)}`)}
          mobileCard={(invoice) => (
            <>
              <MobileCardHeader
                title={invoice.id}
                code
                trailing={<InvoiceStatusBadge status={invoice.status} />}
              />
              <MobileCardRow>{invoice.cust}</MobileCardRow>
              <MobileCardRow label={t('Due Date')}>{invoice.due}</MobileCardRow>
              <MobileCardRow label={t('Amount')}>
                <Money
                  sar={fromHalalas(invoiceMoney(invoice).totalHalalas)}
                  className="font-semibold text-heading"
                />
              </MobileCardRow>
              <MobileCardRow label={t('Balance')}>
                <BalanceCell invoice={invoice} />
              </MobileCardRow>
              {/* Outside `MobileCardRow`: that row truncates its content, which
                  is right for a value and wrong for a row of buttons. */}
              <div className="border-t border-border pt-2.5">
                <InvoiceRowActions invoice={payable(invoice)} onRecordPayment={setPaying} labelled />
              </div>
            </>
          )}
          empty={
            <EmptyState
              icon={query ? 'SearchX' : 'Receipt'}
              title={query ? t('No matching invoices') : t('No invoices yet')}
              description={
                query
                  ? t('Try a different customer or invoice number.')
                  : t('Invoices are raised when a job card is delivered.')
              }
            />
          }
        />
      )}

      {paying ? (
        <RecordPaymentModal invoice={paying} open onClose={() => setPaying(null)} />
      ) : null}
    </>
  )
}

/** Outstanding money is orange — it is the number that needs chasing. A
 *  settled invoice shows a blue zero rather than an empty cell, because a blank
 *  reads as "unknown" and a settled invoice is a known nothing. */
function BalanceCell({ invoice }: { invoice: Invoice }) {
  const { t } = usePreferences()
  const money = invoiceMoney(invoice)
  if (!money.fromServer) {
    return (
      <span className="text-[11px] text-muted" title={t('Needs the API')}>
        —
      </span>
    )
  }
  return (
    <Money
      sar={fromHalalas(money.balanceHalalas)}
      className={
        money.balanceHalalas > 0 ? 'font-semibold text-salis-orange' : 'font-semibold text-salis-blue'
      }
    />
  )
}
