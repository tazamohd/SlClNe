import { useSearchParams } from 'react-router-dom'
import { PrintLayout, InfoRow, SignatureLine } from '@/components/ui/PrintLayout'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { Loading, EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, useEntity, type RowOf, MAX_PAGE_SIZE } from '@/data/useCollection'
import {
  invoiceMoney,
  fromHalalas,
  lineUnitHalalas,
  roundHalfUp,
  paymentHalalas,
} from '@/screens/finance/money'

type InvoiceRow = RowOf<'invoices'> & {
  _id?: string
  issuedAt?: string | null
  custPhone?: string | null
  custVat?: string | null
  plate?: string | null
  vin?: string | null
  vehicle?: string | null
  qrCode?: string | null
  jobCardId?: string | null
}

/** Print-optimized tax invoice view.
 *
 *  Accessed from InvoiceDetail via a Print button; renders a clean A4 layout
 *  suitable for `window.print()`. All monetary figures are the server's —
 *  nothing is summed in the browser. */
export function InvoicePrint() {
  const { t, rtl } = usePreferences()
  const [params] = useSearchParams()

  const invoiceId = params.get('id')
  const single = useEntity('invoices', invoiceId ?? undefined)
  const list = useCollection('invoices')
  const invoice = (invoiceId ? single.data : list.data?.[0]) as InvoiceRow | undefined
  const isLoading = invoiceId ? single.isLoading : list.isLoading

  const serverId = invoice?._id
  const { data: lines = [] } = useCollection(
    'invoiceLines',
    serverId ? { filter: { invoiceId: serverId }, pageSize: MAX_PAGE_SIZE } : undefined
  )
  const { data: payments = [] } = useCollection(
    'invoicePayments',
    serverId ? { filter: { invoiceId: serverId }, pageSize: MAX_PAGE_SIZE } : undefined
  )

  if (isLoading) return <Loading label={t('Loading invoice...')} />
  if (!invoice) {
    return (
      <EmptyState
        icon="FileQuestion"
        title={t('Invoice not found')}
        description={t('It may have been deleted, or the link is out of date.')}
      />
    )
  }

  const money = invoiceMoney(invoice)

  return (
    <PrintLayout
      documentTitle={t('Tax Invoice')}
      documentNumber={invoice.id}
      date={invoice.issuedAt ? String(invoice.issuedAt).slice(0, 10) : invoice.due}
      customerInfo={
        <>
          <InfoRow label={t('Name')} value={invoice.cust} />
          <InfoRow label={t('Phone')} value={invoice.custPhone} />
          <InfoRow label={t('VAT No.')} value={invoice.custVat} />
        </>
      }
      vehicleInfo={
        <>
          <InfoRow label={t('Plate')} value={invoice.plate} />
          <InfoRow label={t('VIN')} value={invoice.vin} />
          <InfoRow label={t('Vehicle')} value={invoice.vehicle || invoice.cust} />
          {invoice.jobCardId && (
            <InfoRow label={t('Job Card')} value={invoice.jobCardId} />
          )}
        </>
      }
      qrCode={
        <div className="flex items-start gap-3">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded border border-dashed border-border-strong bg-inset">
            <Icon name="QrCode" size={28} className="text-faint" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-heading">
              {t('ZATCA E-Invoice QR Code')}
            </p>
            <p className="mt-0.5 text-[10px] text-muted">
              {t('Scan the QR to verify this invoice with the tax authority.')}
            </p>
            {invoice.qrCode && (
              <p className="mt-1 truncate font-mono text-[9px] text-faint" dir="ltr">
                {invoice.qrCode}
              </p>
            )}
          </div>
        </div>
      }
      footer={
        <div className="space-y-6">
          {/* Terms */}
          <div>
            <h4 className="mb-1.5 text-xs font-bold uppercase text-heading">
              {t('Terms & Conditions')}
            </h4>
            <ul className="list-inside list-disc space-y-0.5 text-xs text-body">
              <li>{t('Payment is due upon receipt unless otherwise agreed.')}</li>
              <li>{t('All parts carry manufacturer warranty.')}</li>
              <li>{t('Labour warranty: 30 days or 1,000 km, whichever comes first.')}</li>
            </ul>
          </div>

          {/* Signature */}
          <div className="flex items-end justify-between gap-8 pt-4">
            <SignatureLine label={t('Authorized Signature')} />
            <SignatureLine label={t('Customer Signature')} />
          </div>
        </div>
      }
    >
      {/* Line items table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-inset">
              <Th align="start" className="w-8">#</Th>
              <Th align="start">{t('Description')}</Th>
              <Th align="start">{t('Code')}</Th>
              <Th align="end">{t('Qty')}</Th>
              <Th align="end">{t('Unit Price')}</Th>
              <Th align="end">{t('Amount')}</Th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-xs text-faint">
                  {t('No line items to show')}
                </td>
              </tr>
            ) : (
              lines.map((line, index) => {
                const unitH = lineUnitHalalas(line)
                const lineTotal = roundHalfUp(line.qty * unitH)
                return (
                  <tr key={`${line.part || line.desc}-${index}`} className="border-b border-border">
                    <td className="px-3 py-2.5 text-xs text-faint">{index + 1}</td>
                    <td className="px-3 py-2.5 text-heading">
                      {rtl && line.ar ? line.ar : line.desc}
                      {line.kind === 'labour' && (
                        <span className="ms-1.5 text-[10px] text-faint">({t('Labour')})</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-xs text-faint" dir="ltr">
                        {line.part || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-end">
                      <span dir="ltr" className="font-mono">{line.qty}</span>
                    </td>
                    <td className="px-3 py-2.5 text-end">
                      <Money sar={fromHalalas(unitH)} className="text-body" />
                    </td>
                    <td className="px-3 py-2.5 text-end">
                      <Money sar={fromHalalas(lineTotal)} className="font-semibold text-heading" />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-72 space-y-1.5">
          {money.fromServer && (
            <>
              <TotalRow label={t('Subtotal')} amount={fromHalalas(money.subtotalHalalas)} />
              {money.discountHalalas > 0 && (
                <TotalRow label={t('Discount')} amount={-fromHalalas(money.discountHalalas)} />
              )}
              <TotalRow label={`${t('VAT')} (15%)`} amount={fromHalalas(money.taxHalalas)} />
            </>
          )}
          <div className="flex justify-between border-t-2 border-salis-navy pt-2 text-base font-bold text-salis-navy">
            <span>{t('Grand Total')}</span>
            <Money sar={fromHalalas(money.totalHalalas)} className="font-bold" />
          </div>
        </div>
      </div>

      {/* Payment status */}
      {payments.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-salis-blue">
            {t('Payments Received')}
          </h4>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-inset">
                <Th align="start">{t('Date')}</Th>
                <Th align="start">{t('Method')}</Th>
                <Th align="start">{t('Reference')}</Th>
                <Th align="end">{t('Amount')}</Th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={`${payment.ref || 'pay'}-${index}`} className="border-b border-border">
                  <td className="px-3 py-2 text-body">{payment.date}</td>
                  <td className="px-3 py-2 text-heading">
                    {rtl && payment.ar_method ? payment.ar_method : payment.method}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-xs text-faint" dir="ltr">
                      {payment.ref || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-end">
                    <Money
                      sar={fromHalalas(paymentHalalas(payment))}
                      className="font-semibold text-heading"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {money.fromServer && (
            <div className="mt-2 flex justify-end">
              <div className="w-72">
                <div
                  className={`flex justify-between border-t border-border-strong pt-1.5 text-sm font-bold ${
                    money.balanceHalalas > 0 ? 'text-salis-orange' : 'text-salis-blue'
                  }`}
                >
                  <span>{t('Balance Due')}</span>
                  <Money sar={fromHalalas(money.balanceHalalas)} className="font-bold" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </PrintLayout>
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
      className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted ${
        align === 'end' ? 'text-end' : 'text-start'
      } ${className}`}
    >
      {children}
    </th>
  )
}

function TotalRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between text-sm text-body">
      <span>{label}</span>
      <Money sar={amount} className="text-body" />
    </div>
  )
}
