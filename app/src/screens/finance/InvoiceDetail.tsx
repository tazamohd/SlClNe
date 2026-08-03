import { Link, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/DataTable'
import { InvoiceStatusBadge } from './Invoices'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'

const VAT_RATE = 0.15

/** Full invoice: line items, payments received, and the ZATCA totals block.
 *
 *  Every figure derives from the line items — subtotal, VAT, total, and the
 *  balance after payments. A tax document whose arithmetic is hardcoded is one
 *  edit away from being wrong in a way the tax authority cares about. */
export function InvoiceDetail() {
  const { t, rtl } = usePreferences()
  const { can } = useSession()
  const [params] = useSearchParams()
  const { data: invoices = [], isLoading } = useCollection('invoices')
  const { data: lines = [] } = useCollection('invoiceLines')
  const { data: payments = [] } = useCollection('invoicePayments')

  const invoiceId = params.get('id')
  const invoice = invoiceId ? invoices.find((row) => row.id === invoiceId) : invoices[0]

  if (isLoading) return <p className="text-sm text-muted">{t('Loading...')}</p>

  if (!invoice) {
    return (
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
    )
  }

  const subtotal = lines.reduce((sum, line) => sum + line.qty * line.unit, 0)
  const vat = subtotal * VAT_RATE
  const total = subtotal + vat
  const paid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const balance = total - paid

  return (
    <div className="flex max-w-[1100px] flex-col gap-6">
      <div>
        <Link
          to="/invoices"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Invoices')}
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-black text-heading" dir="ltr">
            {invoice.id}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {invoice.cust} · {t('Issued')} 14 {t('July')} 2026
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <InvoiceStatusBadge status={invoice.status} />
          {/* Chasing payment is a create-ish action on the invoice; roles with
              view-only access shouldn't be sending customer reminders. */}
          {can('invoices', 'e') ? (
            <Button variant="subtle" size="md">
              <Icon name="Bell" size={15} />
              {t('Send reminder')}
            </Button>
          ) : null}
          <Button size="md">
            <Icon name="Printer" size={15} />
            {t('Print')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetaCard label={t('Customer')} value="Ahmed Al-Rashid" sub="+966 55 214 8890" subCode />
        <MetaCard label={t('Vehicle')} value="Toyota Camry 2022" sub="RUH 4821 · 58,420 km" subCode />
        <MetaCard label={t('Job card')} value="JC-2026-0884" valueCode sub={t('Completed')} />
        <MetaCard
          label={t('Due date')}
          value={`28 ${t('July')} 2026`}
          sub={t('Net 14 days')}
        />
      </div>

      <Card>
        <div className="border-b border-border px-[18px] py-[13px]">
          <p className="font-display text-[14.5px] font-bold text-heading">{t('Line items')}</p>
        </div>
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
                <tr key={`${line.part ?? line.desc}-${index}`}>
                  <td className="border-t border-border px-[18px] py-3 text-body">
                    {rtl ? line.ar : line.desc}
                  </td>
                  <td className="border-t border-border px-2.5 py-3">
                    <span className="font-mono text-xs text-muted" dir="ltr">
                      {line.part ?? '—'}
                    </span>
                  </td>
                  <td className="border-t border-border px-2.5 py-3 text-end text-body">
                    {line.qty}
                  </td>
                  <td className="border-t border-border px-2.5 py-3 text-end">
                    <Money sar={line.unit} className="text-body" />
                  </td>
                  <td className="border-t border-border px-[18px] py-3 text-end">
                    <Money sar={line.qty * line.unit} className="font-semibold text-heading" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="border-b border-border px-[18px] py-[13px]">
            <p className="font-display text-sm font-bold text-heading">{t('Payments received')}</p>
          </div>
          <div className="flex flex-col">
            {payments.map((payment) => (
              <div
                key={payment.ref}
                className="flex items-center gap-3 border-b border-border px-[18px] py-3 last:border-b-0"
              >
                <span className="flex rounded bg-[rgba(10,94,215,.1)] p-2 text-salis-blue">
                  <Icon name="CreditCard" size={15} />
                </span>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-heading">
                    {rtl ? payment.ar_method : payment.method}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted" dir="ltr">
                    {payment.ref} · {payment.date}
                  </p>
                </div>
                <Money sar={payment.amount} className="font-semibold text-heading" />
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-2.5 p-5">
            <TotalRow label={t('Subtotal')} sar={subtotal} />
            <TotalRow label={`${t('VAT')} 15%`} sar={vat} />
            <div className="flex justify-between border-t border-border pt-2.5 text-base font-bold text-heading">
              <span>{t('Total')}</span>
              <Money sar={total} className="font-bold" />
            </div>
            <div className="flex justify-between text-[13px] text-muted">
              <span>{t('Paid')}</span>
              <span dir="ltr" className="font-mono">
                − {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(paid)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2.5 text-base font-bold">
              <span className="text-heading">{t('Balance due')}</span>
              {/* Outstanding money is orange; settled is brand blue. */}
              <Money
                sar={balance}
                className={balance > 0 ? 'font-bold text-salis-orange' : 'font-bold text-salis-blue'}
              />
            </div>
          </Card>

          <Card className="flex items-start gap-3 p-4">
            {/* QR generation belongs to the ZATCA e-invoicing integration,
                which isn't built yet (handoff README §10). */}
            <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded border border-dashed border-border-strong bg-inset text-muted">
              <Icon name="QrCode" size={28} />
            </span>
            <p className="text-[11px] leading-[1.5] text-body">
              {t('ZATCA-compliant e-invoice. Scan the QR to verify with the tax authority.')}
            </p>
          </Card>
        </div>
      </div>
    </div>
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
        'px-2.5 py-2.5 text-[10.5px] font-bold uppercase tracking-[.05em] text-muted',
        align === 'end' ? 'text-end' : 'text-start',
        className
      )}
    >
      {children}
    </th>
  )
}

function TotalRow({ label, sar }: { label: string; sar: number }) {
  return (
    <div className="flex justify-between text-[13px] text-body">
      <span>{label}</span>
      <Money sar={sar} className="font-semibold" />
    </div>
  )
}

function MetaCard({
  label,
  value,
  sub,
  valueCode,
  subCode,
}: {
  label: string
  value: string
  sub: string
  valueCode?: boolean
  subCode?: boolean
}) {
  return (
    <Card className="p-4">
      <p className="font-action text-[11px] font-medium text-muted">{label}</p>
      <p
        dir={valueCode ? 'ltr' : undefined}
        className={'mt-1 text-sm font-semibold text-heading' + (valueCode ? ' font-mono' : '')}
      >
        {value}
      </p>
      <p
        dir={subCode ? 'ltr' : undefined}
        className={'mt-0.5 text-[11px] text-muted' + (subCode ? ' font-mono' : '')}
      >
        {sub}
      </p>
    </Card>
  )
}
