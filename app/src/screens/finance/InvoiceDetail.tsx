import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, SummaryRow } from '@/components/ui/Money'
import { DetailSkeleton, EmptyState, ErrorState } from '@/components/ui/States'
import { OverflowItem } from '@/screens/registry/registryShared'
import { InvoiceStatusBadge } from './Invoices'
import { invoiceActionsFor, useInvoiceLifecycle } from './InvoiceActions'
import { RecordPaymentModal, type PayableInvoice } from './RecordPaymentModal'
import { fromHalalas, invoiceMoney, lineUnitHalalas, paymentHalalas, roundHalfUp } from './money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, useEntity } from '@/data/useCollection'

/** Full invoice: line items, payments received, and the ZATCA totals block.
 *
 *  **Every figure in the totals card is the server's.** `subtotalHalalas`,
 *  `taxHalalas`, `discountHalalas`, `totalHalalas`, `paidHalalas` and
 *  `balanceHalalas` are computed by the API from the invoice's own lines and
 *  its payments, under the ZATCA rate, and rendered here untouched. The earlier
 *  rebuild summed the line table in the browser and applied 15% itself, which
 *  is how a tax document ends up disagreeing with the ledger behind it.
 *
 *  The line sum is still computed — but only to *compare*. When it disagrees
 *  with the subtotal the server holds, the screen says so instead of choosing
 *  one of them. That is the honest answer to two sources of truth, and the
 *  seeded data has exactly that disagreement today.
 *
 *  One primary action: "Record Payment", shown only while there is a balance
 *  to take and the role may take it. Issue and Cancel sit beside it as the
 *  lifecycle allows; Print and Send live in the overflow. The design's sample
 *  note thread and two sample PDFs are gone — there is no note or document
 *  store, so each rail is an honest empty state. */
export function InvoiceDetail() {
  const { t, rtl } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const [params] = useSearchParams()
  const [paying, setPaying] = useState<PayableInvoice | null>(null)
  const { issue, cancel, busy } = useInvoiceLifecycle()

  const invoiceId = params.get('id')
  /* A direct link names one invoice and is fetched by name — the register may
   * be paginated and not hold it. With no id, the register's first row is the
   * invoice shown, which is what the design's screenshot depicts. */
  const single = useEntity('invoices', invoiceId ?? undefined)
  const list = useCollection('invoices')
  const invoice = invoiceId ? single.data : list.data?.[0]
  const isLoading = invoiceId ? single.isLoading : list.isLoading
  const error = invoiceId ? single.error : list.error

  /* The API attributes lines and payments to their invoice; the design bundle's
   * fixtures carry one unattributed set of each. Filtering on a column the
   * fixtures do not have would empty both tables, so the filter is applied only
   * where it means something and the fallback says what it is showing. */
  const serverId = (invoice as { _id?: string } | undefined)?._id
  const { data: lines = [] } = useCollection(
    'invoiceLines',
    serverId ? { filter: { invoiceId: serverId }, pageSize: 500 } : undefined
  )
  const { data: payments = [] } = useCollection(
    'invoicePayments',
    serverId ? { filter: { invoiceId: serverId }, pageSize: 500 } : undefined
  )

  const crumbs = [{ label: 'Invoices', to: '/invoices' }]

  if (isLoading) {
    return (
      <div className="flex max-w-[1100px] flex-col gap-6">
        <PageHeader title={t('Invoice')} breadcrumbs={crumbs} back={{ to: '/invoices', label: 'Invoices' }} variant="quiet" />
        <DetailSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex max-w-[1100px] flex-col gap-6">
        <PageHeader title={t('Invoice')} breadcrumbs={crumbs} back={{ to: '/invoices', label: 'Invoices' }} variant="quiet" />
        <Card className="p-6">
          <ErrorState
            title={t("Couldn't load this invoice")}
            description={error.message}
            onRetry={() => void (invoiceId ? single.refetch() : list.refetch())}
          />
        </Card>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex max-w-[1100px] flex-col gap-6">
        <PageHeader title={t('Invoice')} breadcrumbs={crumbs} back={{ to: '/invoices', label: 'Invoices' }} variant="quiet" />
        <Card className="p-6">
          <EmptyState
            icon="FileQuestion"
            title={t('Invoice not found')}
            description={t('It may have been deleted, or the link is out of date.')}
            action={
              <Link to="/invoices" className="font-action text-[13px] font-medium">
                {t('Invoices')}
              </Link>
            }
          />
        </Card>
      </div>
    )
  }

  const payable = invoice as unknown as PayableInvoice
  const money = invoiceMoney(invoice)
  const qrCode = (invoice as { qrCode?: string | null }).qrCode ?? null
  const issuedAt = (invoice as { issuedAt?: string | null }).issuedAt ?? null
  const allowed = invoiceActionsFor(payable, can)
  const pending = busy === invoice.id
  const printRoute = `/invoice-print?id=${encodeURIComponent(invoice.id)}`

  /* Not a total — a check. Rounded the way the server rounds a subtotal so the
   * comparison cannot fail on a half-halala the server never had. */
  const lineSumHalalas = roundHalfUp(
    lines.reduce((sum, line) => sum + line.qty * lineUnitHalalas(line), 0)
  )
  const paidFromPayments = payments.reduce((sum, payment) => sum + paymentHalalas(payment), 0)
  const subtotalDisagrees =
    money.fromServer && lines.length > 0 && lineSumHalalas !== money.subtotalHalalas
  const paidDisagrees = money.fromServer && paidFromPayments !== money.paidHalalas

  const actions = (
    <>
      {allowed.issue ? (
        <Button variant="outline" size="md" icon="Send" loading={pending} onClick={() => void issue(payable)}>
          {t('Issue')}
        </Button>
      ) : null}
      {allowed.pay && money.balanceHalalas > 0 ? (
        <Button size="md" icon="CreditCard" disabled={pending} onClick={() => setPaying(payable)}>
          {t('Record Payment')}
        </Button>
      ) : null}
    </>
  )

  const overflow = (
    <>
      <OverflowItem icon="Printer" label="Print" onClick={() => window.open(printRoute, '_blank')} />
      {/* Chasing payment needs the notification service (Part 4), which is
          not built and has no endpoint in API_ENDPOINTS.md. Shown and
          disabled, rather than wired to nothing. */}
      <OverflowItem icon="Bell" label="Send reminder" disabled onClick={() => undefined} />
      {allowed.cancel ? (
        <OverflowItem icon="CircleX" label="Cancel invoice" destructive disabled={pending} onClick={() => void cancel(payable)} />
      ) : null}
    </>
  )

  return (
    <div className="flex max-w-[1100px] flex-col gap-6">
      <PageHeader
        variant="quiet"
        eyebrow={t('Finance')}
        title={invoice.id}
        titleCode
        breadcrumbs={crumbs}
        back={{ to: '/invoices', label: 'Invoices' }}
        status={<InvoiceStatusBadge status={invoice.status} />}
        meta={[
          { icon: 'User', label: 'Customer', value: invoice.cust },
          { icon: 'Calendar', label: 'Due Date', value: invoice.due },
          ...(issuedAt
            ? [{ icon: 'Send', label: 'Issued', value: String(issuedAt).slice(0, 10), code: true }]
            : []),
        ]}
        actions={actions}
        overflow={overflow}
      />

      <div className={isMobile ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-4 lg:grid-cols-4'}>
        <MetaCard label={t('Customer')} value={invoice.cust} sub={t('Bill to')} />
        <MetaCard
          label={t('Due date')}
          value={invoice.due}
          sub={money.balanceHalalas > 0 ? t('Outstanding') : t('Settled')}
        />
        <MetaCard
          label={t('Status')}
          value={t(invoice.status[0].toUpperCase() + invoice.status.slice(1))}
          sub={issuedAt ? t('Issued') : t('Not yet issued')}
        />
        <MetaCard
          label={t('Balance due')}
          value={money.fromServer ? undefined : '—'}
          money={money.fromServer ? fromHalalas(money.balanceHalalas) : undefined}
          sub={money.fromServer ? t('As the server reports it') : t('Needs the API')}
          warn={money.fromServer && money.balanceHalalas > 0}
        />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-[18px] py-[13px]">
          <p className="font-display text-[14.5px] font-bold text-heading">{t('Line items')}</p>
          <span className="font-mono text-xs text-muted" dir="ltr">
            {lines.length}
          </span>
        </div>
        {lines.length === 0 ? (
          <div className="px-[18px] py-6">
            <EmptyState
              icon="List"
              title={t('No line items')}
              description={t('This invoice carries no priced lines.')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <Th align="start" className="px-[18px]">
                    {t('Item')}
                  </Th>
                  <Th align="start">{t('Code')}</Th>
                  <Th align="end">{t('Qty')}</Th>
                  <Th align="end">{t('Unit price')}</Th>
                  <Th align="end" className="px-[18px]">
                    {t('Amount')}
                  </Th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={`${line.part || line.desc}-${index}`}>
                    <td className="border-t border-border px-[18px] py-3 text-body">
                      {rtl && line.ar ? line.ar : line.desc}
                    </td>
                    <td className="border-t border-border px-2.5 py-3">
                      <span className="font-mono text-xs text-muted" dir="ltr">
                        {line.part || '—'}
                      </span>
                    </td>
                    <td className="border-t border-border px-2.5 py-3 text-end text-body">
                      <span dir="ltr" className="font-mono">
                        {line.qty}
                      </span>
                    </td>
                    <td className="border-t border-border px-2.5 py-3 text-end">
                      <Money sar={fromHalalas(lineUnitHalalas(line))} className="text-body" />
                    </td>
                    <td className="border-t border-border px-[18px] py-3 text-end">
                      <Money
                        sar={fromHalalas(roundHalfUp(line.qty * lineUnitHalalas(line)))}
                        className="font-semibold text-heading"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!serverId && lines.length > 0 ? (
          <p className="border-t border-border px-[18px] py-2.5 text-[11px] text-muted">
            {t(
              'The design fixtures carry one unattributed set of line items. Set VITE_API_URL to see this invoice’s own lines.'
            )}
          </p>
        ) : null}
      </Card>

      {subtotalDisagrees ? (
        <Notice>
          {t('These lines total')}{' '}
          <Money sar={fromHalalas(lineSumHalalas)} className="font-semibold" />{' '}
          {t('but the server holds a subtotal of')}{' '}
          <Money sar={fromHalalas(money.subtotalHalalas)} className="font-semibold" />
          {'. '}
          {t('The server’s figure is the invoice; the difference is reported, not reconciled here.')}
        </Notice>
      ) : null}

      <div className={isMobile ? 'flex flex-col gap-5' : 'grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]'}>
        <div className="flex flex-col gap-6">
          <Card>
            <div className="border-b border-border px-[18px] py-[13px]">
              <p className="font-display text-sm font-bold text-heading">{t('Payments received')}</p>
            </div>
            {payments.length === 0 ? (
              <div className="px-[18px] py-6">
                <EmptyState
                  icon="CreditCard"
                  title={t('No payments yet')}
                  description={
                    money.balanceHalalas > 0 && allowed.pay
                      ? t('Record one from the actions above.')
                      : t('Nothing has been received against this invoice.')
                  }
                />
              </div>
            ) : (
              <div className="flex flex-col">
                {payments.map((payment, index) => (
                  <div
                    key={`${payment.ref || 'payment'}-${index}`}
                    className="flex items-center gap-3 border-b border-border px-[18px] py-3 last:border-b-0"
                  >
                    <span className="flex rounded bg-tint-blue p-2 text-salis-blue">
                      <Icon name="CreditCard" size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-heading">
                        {rtl && payment.ar_method ? payment.ar_method : payment.method}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted" dir="ltr">
                        {payment.ref || '—'} · {payment.date}
                      </p>
                    </div>
                    <Money
                      sar={fromHalalas(paymentHalalas(payment))}
                      className="font-semibold text-heading"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2">
                <Icon name="MessageSquare" size={16} className="text-salis-blue" />
                <h2 className="text-sm font-bold text-heading">{t('Invoice Notes')}</h2>
              </div>
              <EmptyState
                icon="MessageSquare"
                title={t('No notes yet')}
                description={t('Notes need a server home before they can be kept here.')}
              />
            </Card>
            <Card className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2">
                <Icon name="Paperclip" size={16} className="text-salis-blue" />
                <h2 className="text-sm font-bold text-heading">{t('Attachments')}</h2>
              </div>
              <EmptyState
                icon="FileUp"
                title={t('No attachments')}
                description={t('Document storage is not connected yet.')}
              />
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <Card className="flex flex-col gap-2.5 p-5">
            {money.fromServer ? (
              <>
                <SummaryRow label={t('Subtotal')} halalas={money.subtotalHalalas} />
                {money.discountHalalas > 0 ? (
                  <SummaryRow label={t('Discount')} halalas={-money.discountHalalas} />
                ) : null}
                <SummaryRow label={`${t('VAT')} 15%`} halalas={money.taxHalalas} />
              </>
            ) : (
              <p className="text-[11px] text-muted">
                {t('The subtotal and VAT split is computed by the API. Set VITE_API_URL to see it.')}
              </p>
            )}
            <div className="flex justify-between border-t border-border pt-2.5 text-base font-bold text-heading">
              <span>{t('Total')}</span>
              <Money sar={fromHalalas(money.totalHalalas)} className="font-bold" />
            </div>
            <SummaryRow label={t('Paid')} halalas={-money.paidHalalas} muted />
            <div className="flex justify-between border-t border-border pt-2.5 text-base font-bold">
              <span className="text-heading">{t('Balance due')}</span>
              {/* Outstanding money is orange; settled is brand blue. */}
              <Money
                sar={fromHalalas(money.balanceHalalas)}
                className={
                  money.balanceHalalas > 0
                    ? 'font-bold text-salis-orange'
                    : 'font-bold text-salis-blue'
                }
              />
            </div>
            {paidDisagrees ? (
              <p className="text-[11px] text-salis-orange">
                {t('The payments listed do not add up to the paid figure on the invoice.')}
              </p>
            ) : null}
          </Card>

          <Card className="flex items-start gap-3 p-4">
            <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded border border-dashed border-border-strong bg-inset text-muted">
              <Icon name="QrCode" size={28} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] leading-[1.5] text-body">
                {t('ZATCA-compliant e-invoice. Scan the QR to verify with the tax authority.')}
              </p>
              {qrCode ? (
                <p className="mt-1.5 truncate font-mono text-[10px] text-muted" dir="ltr" title={qrCode}>
                  {qrCode}
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-muted">
                  {t('The QR payload is assigned when the invoice is issued.')}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {paying ? (
        <RecordPaymentModal invoice={paying} open onClose={() => setPaying(null)} />
      ) : null}
    </div>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="flex flex-wrap items-center gap-1.5 rounded border border-salis-orange/30 bg-salis-orange/[.06] px-3 py-2 text-[13px] text-body"
    >
      <Icon name="AlertTriangle" size={15} className="flex-shrink-0 text-salis-orange" />
      {children}
    </p>
  )
}

function Th({
  children,
  align,
  className = '',
}: {
  children: React.ReactNode
  align: 'start' | 'end'
  className?: string
}) {
  return (
    <th
      scope="col"
      className={cn(
        'px-2.5 py-2.5 text-[11px] font-bold uppercase tracking-[.05em] text-muted',
        align === 'end' ? 'text-end' : 'text-start',
        className
      )}
    >
      {children}
    </th>
  )
}

function MetaCard({
  label,
  value,
  money,
  sub,
  warn,
}: {
  label: string
  value?: string
  /** A money value renders through the formatter rather than as text. */
  money?: number
  sub: string
  warn?: boolean
}) {
  return (
    <Card className="p-4">
      <p className="font-action text-[11px] font-medium text-muted">{label}</p>
      <p className={cn('mt-1 text-sm font-semibold', warn ? 'text-salis-orange' : 'text-heading')}>
        {money === undefined ? value : <Money sar={money} className="font-semibold" />}
      </p>
      <p className="mt-0.5 text-[11px] text-muted">{sub}</p>
    </Card>
  )
}
