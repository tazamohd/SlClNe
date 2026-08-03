import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListPageHeader } from '@/components/shell/ListPage'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, parseSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

type Invoice = RowOf<'invoices'>

/** Invoice status palette. Paid is brand blue, overdue is the warning orange,
 *  unpaid is neutral slate — no green or red anywhere (README §7). */
export const INVOICE_STATUS: Record<string, readonly [string, string]> = {
  paid: ['rgba(10,94,215,.1)', '#0A5ED7'],
  unpaid: ['rgba(100,116,139,.1)', '#64748B'],
  overdue: ['rgba(249,115,22,.1)', '#F97316'],
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

/** Invoice register. */
export function Invoices() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const { data: invoices = [], isLoading } = useCollection('invoices')
  const [query, setQuery] = useState('')

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
      // The mock stores money as a display string; parse so it formats to the
      // 2-decimal convention like every other amount in the app.
      cell: (invoice) => <Money sar={parseSar(invoice.amount)} className="font-semibold" />,
    },
    { header: 'Status', cell: (invoice) => <InvoiceStatusBadge status={invoice.status} /> },
  ]

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

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(invoice) => invoice.id}
        loading={isLoading}
        onRowClick={(invoice) => navigate(`/invoice-detail?id=${encodeURIComponent(invoice.id)}`)}
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
    </>
  )
}
