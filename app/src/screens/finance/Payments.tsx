import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { KpiCard, TONES } from '@/components/ui/KpiCard'
import { Money, formatSar } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/States'
import { InvoiceStatusBadge } from './Invoices'
import { InvoiceRowActions } from './InvoiceActions'
import { RaiseReceiptModal } from './RaiseReceiptModal'
import { RecordPaymentModal, type PayableInvoice } from './RecordPaymentModal'
import { fromHalalas, invoiceMoney, paymentHalalas } from './money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

type Invoice = RowOf<'invoices'>
type Payment = RowOf<'invoicePayments'>

const DAY_MS = 24 * 60 * 60 * 1000

/** The methods the API accepts, in the order the till thinks of them. */
const METHODS = ['all', 'cash', 'card', 'mada', 'transfer'] as const
type MethodFilter = (typeof METHODS)[number]
const METHOD_LABEL: Record<MethodFilter, string> = {
  all: 'All',
  cash: 'Cash',
  card: 'Card',
  mada: 'Mada',
  transfer: 'Transfer',
}

/** "Mada" / "Bank transfer" / "Card (Visa)" → the chip it belongs under. */
function methodKey(method: string): Exclude<MethodFilter, 'all'> | 'other' {
  const m = method.toLowerCase()
  if (m.includes('mada')) return 'mada'
  if (m.includes('cash')) return 'cash'
  if (m.includes('card') || m.includes('visa') || m.includes('master')) return 'card'
  if (m.includes('transfer') || m.includes('bank') || m.includes('sadad')) return 'transfer'
  return 'other'
}

function paymentEpoch(payment: Payment): number | null {
  const parsed = Date.parse(payment.date ?? '')
  return Number.isNaN(parsed) ? null : parsed
}

/** Collections view: what's owed, what's been received, and the button that
 *  takes the money.
 *
 *  Both headline figures are sums of the server's per-invoice columns —
 *  `balanceHalalas` for what is outstanding, `paidHalalas` for what has been
 *  collected — added as integer halalas. Nothing here divides, applies a rate
 *  or rounds; the only division is the one that turns halalas into the SAR the
 *  formatter renders. Today and This week are sums over the payments received,
 *  by the payment's own date.
 *
 *  Note this departs from the prototype's numbers, deliberately.
 *  `Payments.dc.html` shows "SAR 8,090" outstanding and "SAR 61,420" collected,
 *  but the five invoices it renders directly below total 9,065 unpaid and 1,005
 *  paid. Those headline figures were hardcoded and never reconciled against the
 *  data. A collections screen whose total contradicts the rows under it is
 *  worse than one showing an unfamiliar number. */
export function Payments() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const invoicesQuery = useCollection('invoices')
  const invoices = invoicesQuery.data ?? []
  const { data: payments = [] } = useCollection('invoicePayments')
  const [paying, setPaying] = useState<PayableInvoice | null>(null)
  const [raising, setRaising] = useState(false)
  const [method, setMethod] = useState<MethodFilter>('all')
  const [now] = useState(() => Date.now())

  const { outstandingHalalas, collectedHalalas, derived } = useMemo(() => {
    let owed = 0
    let received = 0
    let fromServer = true
    for (const invoice of invoices) {
      const money = invoiceMoney(invoice)
      if (!money.fromServer) fromServer = false
      if (invoice.status === 'cancelled') {
        /* A cancelled invoice is not receivable. Money already taken against
         * one still counts as collected until it is refunded. */
        received += money.paidHalalas
        continue
      }
      if (money.fromServer) {
        owed += money.balanceHalalas
        received += money.paidHalalas
      } else if (invoice.status === 'paid') {
        received += money.totalHalalas
      } else {
        owed += money.totalHalalas
      }
    }
    return { outstandingHalalas: owed, collectedHalalas: received, derived: !fromServer }
  }, [invoices])

  const { todayHalalas, weekHalalas, undated } = useMemo(() => {
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const dayStart = startOfToday.getTime()
    const weekStart = dayStart - 6 * DAY_MS
    let today = 0
    let week = 0
    let missing = 0
    for (const payment of payments) {
      const at = paymentEpoch(payment)
      if (at === null) {
        missing += 1
        continue
      }
      const amount = paymentHalalas(payment)
      if (at >= dayStart) today += amount
      if (at >= weekStart) week += amount
    }
    return { todayHalalas: today, weekHalalas: week, undated: missing }
  }, [payments, now])

  const receivedRows = useMemo(
    () => (method === 'all' ? payments : payments.filter((p) => methodKey(p.method) === method)),
    [payments, method]
  )

  const invoiceColumns: Column<Invoice>[] = [
    { header: 'Invoice', cell: (invoice) => invoice.id, code: true, sortValue: (invoice) => invoice.id },
    { header: 'Customer', cell: (invoice) => invoice.cust, sortValue: (invoice) => invoice.cust },
    {
      header: 'Amount',
      cell: (invoice) => (
        <Money sar={fromHalalas(invoiceMoney(invoice).totalHalalas)} className="font-semibold" />
      ),
      numeric: true,
      sortValue: (invoice) => invoiceMoney(invoice).totalHalalas,
    },
    { header: 'Due Date', cell: (invoice) => invoice.due, sortValue: (invoice) => Date.parse(invoice.due) || invoice.due },
    { header: 'Status', cell: (invoice) => <InvoiceStatusBadge status={invoice.status} />, sortValue: (invoice) => invoice.status },
    {
      header: 'Actions',
      cell: (invoice) => (
        <span className="flex flex-wrap items-center gap-1.5">
          <InvoiceRowActions
            invoice={invoice as unknown as PayableInvoice}
            onRecordPayment={setPaying}
          />
          {can('payments', 'c') ? (
            <Button
              variant="subtle"
              size="sm"
              aria-label={t('Raise receipt')}
              title={t('Raise receipt')}
              onClick={(event) => {
                event.stopPropagation()
                setRaising(true)
              }}
            >
              <Icon name="Receipt" size={14} />
            </Button>
          ) : null}
        </span>
      ),
    },
  ]

  const paymentColumns: Column<Payment>[] = [
    { header: 'Date', cell: (p) => p.date, sortValue: (p) => paymentEpoch(p) ?? p.date },
    { header: 'Payment Method', cell: (p) => t(p.method), sortValue: (p) => p.method },
    { header: 'Reference', cell: (p) => p.ref || '—', code: true, sortValue: (p) => p.ref ?? '' },
    {
      header: 'Amount',
      cell: (p) => <Money sar={fromHalalas(paymentHalalas(p))} className="font-semibold" />,
      numeric: true,
      sortValue: (p) => paymentHalalas(p),
    },
  ]

  const kpis = (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        label={t('Outstanding')}
        value={formatSar(fromHalalas(outstandingHalalas))}
        mono
        icon="Wallet"
        caption={derived ? t('Invoice totals — this build has no API to give balances.') : t('Server balances, summed here')}
        {...(outstandingHalalas > 0 ? TONES.orange : TONES.blue)}
      />
      <KpiCard
        label={t('Collected')}
        value={formatSar(fromHalalas(collectedHalalas))}
        mono
        icon="CheckCircle"
        caption={derived ? t('Paid invoices only — part payments need the API.') : t('All time')}
        {...TONES.blue}
      />
      <KpiCard
        label={t('Today')}
        value={formatSar(fromHalalas(todayHalalas), { bare: true })}
        mono
        icon="Sun"
        caption={t('SAR received today')}
        {...TONES.bright}
      />
      <KpiCard
        label={t('This week')}
        value={formatSar(fromHalalas(weekHalalas), { bare: true })}
        mono
        icon="CalendarRange"
        caption={undated > 0 ? t('Some payments carry no date and are not counted.') : t('SAR received in the last 7 days')}
        {...TONES.navy}
      />
    </div>
  )

  const methodChips = (
    <ChipGroup label={t('Payment Method')}>
      {METHODS.map((option) => {
        const count = option === 'all' ? payments.length : payments.filter((p) => methodKey(p.method) === option).length
        return (
          <Chip
            key={option}
            label={`${t(METHOD_LABEL[option])} ${count}`}
            selected={method === option}
            onToggle={() => setMethod(option)}
          />
        )
      })}
    </ChipGroup>
  )

  return (
    <>
      <ScreenFrame
        variant="quiet"
        eyebrow={t('Finance')}
        title={t('Payments')}
        actions={
          <>
            {can('payments', 'c') ? (
              <Button variant="outline" size="md" icon="Receipt" onClick={() => setRaising(true)}>
                {t('New Receipt')}
              </Button>
            ) : null}
            {can('invoices', 'c') ? (
              <Button size="md" icon="Plus" onClick={() => navigate('/invoice-create')}>
                {t('New Invoice')}
              </Button>
            ) : null}
          </>
        }
        query={invoicesQuery}
        skeleton="dashboard"
        toolbar={kpis}
      >
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 className="text-sm font-bold text-heading">{t('Payments received')}</h2>
            {methodChips}
          </div>
          <DataTable
            caption="Payments received"
            columns={paymentColumns}
            rows={receivedRows}
            rowKey={(p, index) => `${p.ref || 'payment'}-${index}`}
            defaultSort={{ key: 'Date', dir: 'desc' }}
            pageSize={10}
            className="rounded-none border-0 shadow-none"
            mobileCard={(p) => (
              <>
                <MobileCardHeader title={p.ref || '—'} code trailing={<span className="text-xs text-muted">{t(p.method)}</span>} />
                <MobileCardRow label={t('Date')}>{p.date}</MobileCardRow>
                <MobileCardRow label={t('Amount')}>
                  <Money sar={fromHalalas(paymentHalalas(p))} className="font-semibold text-heading" />
                </MobileCardRow>
              </>
            )}
            empty={
              <EmptyState
                icon="CreditCard"
                title={method === 'all' ? t('No payments yet') : t('No payments by this method')}
                description={t('Payments appear here once invoices are raised.')}
              />
            }
          />
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-bold text-heading">{t('Invoices')}</h2>
          </div>
          <DataTable
            caption="Payments"
            columns={invoiceColumns}
            rows={invoices}
            rowKey={(invoice) => invoice.id}
            className="rounded-none border-0 shadow-none"
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
                <div className="border-t border-border pt-2.5">
                  <InvoiceRowActions
                    invoice={invoice as unknown as PayableInvoice}
                    onRecordPayment={setPaying}
                    labelled
                  />
                </div>
              </>
            )}
            empty={
              <EmptyState
                icon="Wallet"
                title={t('No invoices yet')}
                description={t('Invoices are raised when a job card is delivered.')}
              />
            }
          />
        </Card>
      </ScreenFrame>

      {paying ? (
        <RecordPaymentModal invoice={paying} open onClose={() => setPaying(null)} />
      ) : null}
      {raising ? <RaiseReceiptModal open onClose={() => setRaising(false)} /> : null}
    </>
  )
}
