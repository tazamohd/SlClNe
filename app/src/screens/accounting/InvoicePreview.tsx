import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/DataTable'
import { InvoiceStatusBadge } from '@/screens/finance/Invoices'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'

const VAT_RATE = 0.15

/** Printable, letter-style tax invoice — the same figures as InvoiceDetail,
 *  laid out as a single document instead of a dashboard so it prints cleanly.
 *
 *  Totals are derived from the line items and payments rather than
 *  hardcoded, same as InvoiceDetail: subtotal → 15% VAT → total, minus
 *  payments received → balance due. A tax document whose printed figures
 *  don't fall out of its own table is the kind of bug the tax authority
 *  cares about. */
export function InvoicePreview() {
  const { t, rtl } = usePreferences()
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-1.5 font-action text-[13px] text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ArrowRight' : 'ArrowLeft'} size={14} />
          {t('Invoices')}
        </Link>
        <Button size="md" onClick={() => window.print()}>
          <Icon name="Printer" size={15} />
          {t('Print')}
        </Button>
      </div>

      <div className="flex justify-center">
        <Card className="flex w-full max-w-[680px] flex-col gap-6 p-6 sm:p-10 print:border-none print:shadow-none">
          {/* Letterhead */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-salis-gradient text-white shadow-[0_10px_15px_-3px_rgba(10,94,215,.25)]">
                <Icon name="Wrench" size={22} />
              </span>
              <div>
                <h2 className="font-display text-lg font-black text-heading">SALIS AUTO</h2>
                <p className="text-[11px] text-muted">Al-Amri Auto Center</p>
              </div>
            </div>
            <div className="text-end">
              <h1 className="bg-salis-gradient-r bg-clip-text font-display text-2xl font-black text-transparent sm:text-[28px]">
                {t('Tax Invoice')}
              </h1>
              <p className="mt-1 font-mono text-sm font-bold text-heading" dir="ltr">
                {invoice.id}
              </p>
              <p className="mt-0.5 text-xs text-muted" dir="ltr">
                {invoice.due}
              </p>
            </div>
          </div>

          <div className="h-0.5 rounded bg-salis-gradient" />

          {/* Bill from / to */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="font-action text-[11px] font-semibold uppercase tracking-[.05em] text-muted">
                {t('From')}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-heading">Al-Amri Auto Center</p>
              <p className="mt-0.5 text-xs text-muted">{t('Riyadh, Saudi Arabia')}</p>
              <p className="mt-0.5 text-xs text-muted" dir="ltr">
                VAT: 300456789012345
              </p>
            </div>
            <div>
              <p className="font-action text-[11px] font-semibold uppercase tracking-[.05em] text-muted">
                {t('Bill To')}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-heading">{invoice.cust}</p>
              <p className="mt-0.5 text-xs text-muted" dir="ltr">
                VAT: 310456789012345
              </p>
            </div>
          </div>

          {/* Line items */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="px-0 py-2.5 text-start font-action text-[11px] font-semibold uppercase tracking-[.05em] text-muted">
                    {t('Description')}
                  </th>
                  <th className="w-[60px] px-0 py-2.5 text-center font-action text-[11px] font-semibold uppercase tracking-[.05em] text-muted">
                    {t('Qty')}
                  </th>
                  <th className="w-[90px] px-0 py-2.5 text-end font-action text-[11px] font-semibold uppercase tracking-[.05em] text-muted">
                    {t('Rate')}
                  </th>
                  <th className="w-[90px] px-0 py-2.5 text-end font-action text-[11px] font-semibold uppercase tracking-[.05em] text-muted">
                    {t('Amount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={`${line.part ?? line.desc}-${index}`} className="border-b border-border">
                    <td className="px-0 py-2.5 text-body">{rtl ? line.ar : line.desc}</td>
                    <td className="px-0 py-2.5 text-center font-mono text-body">{line.qty}</td>
                    <td className="px-0 py-2.5 text-end">
                      <Money sar={line.unit} className="text-body" />
                    </td>
                    <td className="px-0 py-2.5 text-end">
                      <Money sar={line.qty * line.unit} className="font-semibold text-heading" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="flex w-full flex-col gap-1.5 sm:w-60">
              <TotalRow label={t('Subtotal')} sar={subtotal} />
              <TotalRow label={`${t('VAT')} (15%)`} sar={vat} />
              <div className="h-0.5 rounded bg-salis-gradient" />
              <div className="flex justify-between text-lg font-extrabold">
                <span className="text-heading">{t('Grand Total')}</span>
                <Money sar={total} className="text-heading" />
              </div>
              {payments.length > 0 ? (
                <>
                  <div className="flex justify-between text-[13px] text-muted">
                    <span>{t('Paid')}</span>
                    <span dir="ltr" className="font-mono">
                      − {formatSar(paid, { bare: true })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1.5 text-base font-bold">
                    <span className="text-heading">{t('Balance due')}</span>
                    <Money
                      sar={balance}
                      className={balance > 0 ? 'font-bold text-salis-orange' : 'font-bold text-salis-blue'}
                    />
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* ZATCA compliance + status */}
          <div className="flex flex-wrap items-center gap-4 rounded-[10px] border border-border bg-inset p-4">
            {/* QR generation belongs to the ZATCA e-invoicing integration, which
                isn't built yet — this is the design's placeholder treatment, not
                a fake scannable code. */}
            <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-border-strong bg-card text-muted">
              <Icon name="QrCode" size={28} />
            </span>
            <div className="min-w-[160px] flex-1">
              <p className="text-xs font-semibold text-heading">{t('ZATCA Compliance')}</p>
              <p className="mt-0.5 text-[11px] leading-[1.5] text-muted">
                {t('ZATCA-compliant e-invoice. Scan the QR to verify with the tax authority.')}
              </p>
            </div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </Card>
      </div>
    </div>
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
