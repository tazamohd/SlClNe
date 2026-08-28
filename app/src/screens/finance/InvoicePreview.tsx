import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { Money, SummaryRow } from '@/components/ui/Money'
import { DetailPage, type DetailStat } from '@/components/shell/DetailPage'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, useEntity } from '@/data/useCollection'
import { InvoiceStatusBadge } from './Invoices'
import { fromHalalas, invoiceMoney, lineUnitHalalas, roundHalfUp } from './money'

/** The print/PDF-oriented view of one invoice — the document a customer keeps.
 *
 *  It renders on the shared `DetailPage` frame (agent 09's), which is why every
 *  terminal state — loading, load failure, a record that is not there, a role
 *  refused the record — is handled the same way it is on every other detail
 *  screen, instead of this document inventing its own blank page.
 *
 *  **Every figure is the server's.** `subtotalHalalas`, `taxHalalas`,
 *  `discountHalalas`, `totalHalalas`, `paidHalalas` and `balanceHalalas` are
 *  computed by the API under the ZATCA rate and printed here untouched — a tax
 *  document that recomputed its own VAT in the browser is exactly the document
 *  that disagrees with the ledger behind it. The line table is summed only to
 *  *check* against the server's subtotal; when the two disagree the page says
 *  so and prints the server's figure, never a reconciliation of its own.
 *
 *  A build with no API configured has only the fixtures, which carry the total
 *  as a display string and no subtotal/VAT split. That case is stated, not
 *  faked: the split shows an em dash and a line explains it needs the API.
 */
export function InvoicePreview() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const { can } = useSession()
  const [params] = useSearchParams()

  const invoiceId = params.get('id')
  const single = useEntity('invoices', invoiceId ?? undefined)
  const list = useCollection('invoices')
  const invoice = invoiceId ? single.data : list.data?.[0]
  const isLoading = invoiceId ? single.isLoading : list.isLoading
  const loadError = invoiceId ? single.error : list.error

  const serverId = (invoice as { _id?: string } | undefined)?._id
  const { data: lines = [] } = useCollection(
    'invoiceLines',
    serverId ? { filter: { invoiceId: serverId }, pageSize: 500 } : undefined,
  )

  const back = { to: '/invoices', label: 'Invoices' }

  if (!can('invoices', 'v')) {
    return <DetailPage back={back} title={t('Invoice')} denied />
  }

  if (isLoading) {
    return <DetailPage back={back} title={t('Invoice')} loading />
  }

  if (loadError) {
    return (
      <DetailPage
        back={back}
        title={t('Invoice')}
        error={{
          message: loadError.message,
          onRetry: () => void (invoiceId ? single.refetch() : list.refetch()),
        }}
      />
    )
  }

  if (!invoice) {
    return (
      <DetailPage
        back={back}
        title={t('Invoice')}
        notFound={{
          title: 'Invoice not found',
          description: 'It may have been deleted, or the link is out of date.',
          action: (
            <Link to="/invoices" className="font-action text-[13px] font-medium">
              {t('Invoices')}
            </Link>
          ),
        }}
      />
    )
  }

  const money = invoiceMoney(invoice)
  const issuedAt = (invoice as { issuedAt?: string | null }).issuedAt ?? null
  const qrCode = (invoice as { qrCode?: string | null }).qrCode ?? null
  const buyerVat = (invoice as { buyerVatNumber?: string | null }).buyerVatNumber ?? null

  /* A check, not a total: rounded the way the server rounds a subtotal so the
   * comparison never trips on a half-halala the server never carried. */
  const lineSumHalalas = roundHalfUp(
    lines.reduce((sum, line) => sum + line.qty * lineUnitHalalas(line), 0),
  )
  const subtotalDisagrees =
    money.fromServer && lines.length > 0 && lineSumHalalas !== money.subtotalHalalas

  const summary: DetailStat[] = money.fromServer
    ? [
        { label: 'Subtotal', value: <Money sar={fromHalalas(money.subtotalHalalas)} />, icon: 'Receipt' },
        { label: 'VAT', value: <Money sar={fromHalalas(money.taxHalalas)} />, icon: 'Percent' },
        { label: 'Total', value: <Money sar={fromHalalas(money.totalHalalas)} />, icon: 'Wallet' },
        {
          label: 'Balance due',
          value: (
            <Money
              sar={fromHalalas(money.balanceHalalas)}
              className={money.balanceHalalas > 0 ? 'text-salis-orange' : 'text-salis-blue'}
            />
          ),
          icon: 'Scale',
        },
      ]
    : [
        { label: 'Total', value: <Money sar={fromHalalas(money.totalHalalas)} />, icon: 'Wallet' },
        { label: 'Subtotal', value: '—', icon: 'Receipt' },
        { label: 'VAT', value: '—', icon: 'Percent' },
        { label: 'Balance due', value: '—', icon: 'Scale' },
      ]

  return (
    <DetailPage
      back={back}
      title={String(invoice.id)}
      titleCode
      subtitle={t('Tax invoice')}
      status={<InvoiceStatusBadge status={invoice.status} />}
      actions={
        <Button size={isMobile ? 'sm' : 'md'} onClick={() => window.print()}>
          <Icon name="Printer" size={15} />
          {t('Print')}
        </Button>
      }
      meta={[
        { icon: 'User', label: 'Customer', value: invoice.cust },
        { icon: 'Calendar', label: 'Due date', value: invoice.due, code: true },
        ...(issuedAt
          ? [{ icon: 'CheckCircle2', label: 'Issued', value: String(issuedAt).slice(0, 10), code: true }]
          : [{ icon: 'Clock', label: 'Status', value: t('Not yet issued') }]),
      ]}
      summary={summary}
      sections={[
        {
          id: 'parties',
          title: 'Bill to',
          icon: 'User',
          span: 'half',
          children: (
            <div className="flex flex-col gap-1 text-[13px]">
              <p className="font-semibold text-heading">{invoice.cust}</p>
              {buyerVat ? (
                <p className="text-muted">
                  {t('VAT number')}{' '}
                  <span dir="ltr" className="font-mono">
                    {buyerVat}
                  </span>
                </p>
              ) : (
                <p className="text-muted">{t('No buyer VAT number on file.')}</p>
              )}
            </div>
          ),
        },
        {
          id: 'zatca',
          title: 'ZATCA e-invoice',
          icon: 'QrCode',
          span: 'half',
          children: (
            <div className="flex items-start gap-3">
              <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded border border-dashed border-border-strong bg-inset text-muted">
                <Icon name="QrCode" size={28} />
              </span>
              <div className="min-w-0 text-[13px]">
                <p className="leading-[1.5] text-body">
                  {t('Scan the QR to verify this invoice with the tax authority.')}
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
            </div>
          ),
        },
        {
          id: 'lines',
          title: 'Line items',
          icon: 'List',
          span: 'full',
          children:
            lines.length === 0 ? (
              <p className="py-2 text-[13px] text-muted">{t('This invoice carries no priced lines.')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <Th align="start">{t('Item')}</Th>
                      <Th align="start">{t('Code')}</Th>
                      <Th align="end">{t('Qty')}</Th>
                      <Th align="end">{t('Unit price')}</Th>
                      <Th align="end">{t('Amount')}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, index) => (
                      <tr key={`${line.part || line.desc}-${index}`}>
                        <td className="border-t border-border py-3 pe-3 text-body">
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
                        <td className="border-t border-border py-3 ps-2.5 text-end">
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
            ),
        },
        {
          id: 'totals',
          title: 'Totals',
          icon: 'Calculator',
          span: 'full',
          children: (
            <div className="ms-auto flex w-full max-w-[360px] flex-col gap-2.5">
              {money.fromServer ? (
                <>
                  <SummaryRow label={t('Subtotal')} halalas={money.subtotalHalalas} />
                  {money.discountHalalas > 0 ? (
                    <SummaryRow label={t('Discount')} halalas={-money.discountHalalas} />
                  ) : null}
                  <SummaryRow label={t('VAT')} halalas={money.taxHalalas} />
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
              {money.fromServer ? <SummaryRow label={t('Paid')} halalas={-money.paidHalalas} muted /> : null}
              <div className="flex justify-between border-t border-border pt-2.5 text-base font-bold">
                <span className="text-heading">{t('Balance due')}</span>
                <Money
                  sar={fromHalalas(money.balanceHalalas)}
                  className={
                    money.balanceHalalas > 0 ? 'font-bold text-salis-orange' : 'font-bold text-salis-blue'
                  }
                />
              </div>
              {subtotalDisagrees ? (
                <p
                  role="status"
                  className="mt-1 flex items-start gap-1.5 rounded border border-salis-orange/30 bg-[rgba(249,115,22,.06)] px-2.5 py-2 text-[11px] text-body"
                >
                  <Icon name="AlertTriangle" size={13} className="mt-0.5 flex-shrink-0 text-salis-orange" />
                  {t('These lines total')}{' '}
                  <Money sar={fromHalalas(lineSumHalalas)} className="font-semibold" />{' '}
                  {t('but the server holds a different subtotal; the server’s figure prints.')}
                </p>
              ) : null}
            </div>
          ),
        },
      ]}
    />
  )
}

function Th({ children, align }: { children: React.ReactNode; align: 'start' | 'end' }) {
  return (
    <th
      scope="col"
      className={
        'py-2.5 text-[10.5px] font-bold uppercase tracking-[.05em] text-muted ' +
        (align === 'end' ? 'px-2.5 text-end' : 'pe-3 text-start')
      }
    >
      {children}
    </th>
  )
}

