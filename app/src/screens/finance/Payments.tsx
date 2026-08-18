import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListPageHeader } from '@/components/shell/ListPage'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { InvoiceStatusBadge } from './Invoices'
import { InvoiceRowActions } from './InvoiceActions'
import { RecordPaymentModal, type PayableInvoice } from './RecordPaymentModal'
import { fromHalalas, invoiceMoney } from './money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

type Invoice = RowOf<'invoices'>

/** Collections view: what's owed, what's been received, and the button that
 *  takes the money.
 *
 *  Both headline figures are sums of the server's per-invoice columns —
 *  `balanceHalalas` for what is outstanding, `paidHalalas` for what has been
 *  collected — added as integer halalas. Nothing here divides, applies a rate
 *  or rounds; the only division is the one that turns halalas into the SAR the
 *  formatter renders.
 *
 *  Note this departs from the prototype's numbers, deliberately.
 *  `Payments.dc.html` shows "SAR 8,090" outstanding and "SAR 61,420" collected,
 *  but the five invoices it renders directly below total 9,065 unpaid and 1,005
 *  paid. Those headline figures were hardcoded and never reconciled against the
 *  data. A collections screen whose total contradicts the rows under it is
 *  worse than one showing an unfamiliar number.
 *
 *  The earlier rebuild summed the *whole invoice amount* into one bucket or the
 *  other by status, which counts a part-paid invoice entirely as outstanding
 *  and loses the money already received against it. With the API's paid and
 *  balance columns available, both figures are now exact. */
export function Payments() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const { data: invoices = [], isLoading, error, refetch } = useCollection('invoices')
  const [paying, setPaying] = useState<PayableInvoice | null>(null)

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

  const columns: Column<Invoice>[] = [
    { header: 'Invoice', cell: (invoice) => invoice.id, code: true },
    { header: 'Customer', cell: (invoice) => invoice.cust },
    {
      header: 'Amount',
      cell: (invoice) => (
        <Money sar={fromHalalas(invoiceMoney(invoice).totalHalalas)} className="font-semibold" />
      ),
    },
    { header: 'Due Date', cell: (invoice) => invoice.due },
    { header: 'Status', cell: (invoice) => <InvoiceStatusBadge status={invoice.status} /> },
    {
      header: 'Actions',
      cell: (invoice) => (
        <InvoiceRowActions
          invoice={invoice as unknown as PayableInvoice}
          onRecordPayment={setPaying}
        />
      ),
    },
  ]

  return (
    <>
      <ListPageHeader
        title={t('Payments')}
        actions={
          can('invoices', 'c') ? (
            <Button size="md" onClick={() => navigate('/invoice-create')}>
              <Icon name="Plus" size={16} />
              {t('New Invoice')}
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <StatCard
          label={t('Outstanding')}
          value={formatSar(fromHalalas(outstandingHalalas))}
          tone="warning"
          note={derived ? t('Invoice totals — this build has no API to give balances.') : undefined}
        />
        <StatCard
          label={t('Collected')}
          value={formatSar(fromHalalas(collectedHalalas))}
          note={derived ? t('Paid invoices only — part payments need the API.') : undefined}
        />
      </div>

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
          caption="Payments"
          columns={columns}
          rows={invoices}
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
              title={t('No payments yet')}
              description={t('Payments appear here once invoices are raised.')}
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

function StatCard({
  label,
  value,
  tone,
  note,
}: {
  label: string
  value: string
  /** Outstanding money is orange — it's the number that needs chasing. */
  tone?: 'warning'
  /** Said out loud when the figure is less exact than it looks. */
  note?: string
}) {
  return (
    <Card className="p-5">
      <p className="text-[13px] text-muted">{label}</p>
      <h3
        dir="ltr"
        className={
          'mt-1.5 font-display text-[28px] font-black ' +
          (tone === 'warning' ? 'text-salis-orange' : 'text-heading')
        }
      >
        {value}
      </h3>
      {note ? <p className="mt-1 text-[11px] text-muted">{note}</p> : null}
    </Card>
  )
}
