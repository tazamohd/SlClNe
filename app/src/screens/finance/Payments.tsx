import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListPageHeader } from '@/components/shell/ListPage'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { InvoiceStatusBadge } from './Invoices'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

type Invoice = RowOf<'invoices'>

/** Collections view: what's owed, what's been received.
 *
 *  Both figures are derived from the invoice rows rather than hardcoded, so the
 *  headline cannot drift from the table underneath it.
 *
 *  Note this departs from the prototype's numbers, deliberately. `Payments.dc.html`
 *  shows "SAR 8,090" outstanding and "SAR 61,420" collected, but the five
 *  invoices it renders directly below total 9,065 unpaid and 1,005 paid. Those
 *  headline figures were hardcoded and never reconciled against the data. A
 *  collections screen whose total contradicts the rows under it is worse than
 *  one showing an unfamiliar number, so this computes them. */
export function Payments() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const { data: invoices = [], isLoading } = useCollection('invoices')

  const { outstanding, collected } = useMemo(() => {
    let owed = 0
    let received = 0
    for (const invoice of invoices) {
      const amount = parseSar(invoice.amount)
      if (invoice.status === 'paid') received += amount
      else owed += amount
    }
    return { outstanding: owed, collected: received }
  }, [invoices])

  const columns: Column<Invoice>[] = [
    { header: 'Invoice', cell: (invoice) => invoice.id, code: true },
    { header: 'Customer', cell: (invoice) => invoice.cust },
    {
      header: 'Amount',
      cell: (invoice) => <Money sar={parseSar(invoice.amount)} className="font-semibold" />,
    },
    { header: 'Due Date', cell: (invoice) => invoice.due },
    { header: 'Status', cell: (invoice) => <InvoiceStatusBadge status={invoice.status} /> },
  ]

  return (
    <>
      <ListPageHeader
        title={t('Payments')}
        actions={
          can('payments', 'c') ? (
            <Button size="md" onClick={() => navigate('/invoice-create')}>
              <Icon name="Plus" size={16} />
              {t('New Invoice')}
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <StatCard label={t('Outstanding')} value={formatSar(outstanding)} tone="warning" />
        <StatCard label={t('Collected')} value={formatSar(collected)} />
      </div>

      <DataTable
        columns={columns}
        rows={invoices}
        rowKey={(invoice) => invoice.id}
        loading={isLoading}
        onRowClick={(invoice) => navigate(`/invoice-detail?id=${encodeURIComponent(invoice.id)}`)}
        empty={
          <EmptyState
            icon="Wallet"
            title={t('No payments yet')}
            description={t('Payments appear here once invoices are raised.')}
          />
        }
      />
    </>
  )
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  /** Outstanding money is orange — it's the number that needs chasing. */
  tone?: 'warning'
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
    </Card>
  )
}
