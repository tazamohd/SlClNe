import { useMemo, useState } from 'react'
import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { ErrorState, Loading } from '@/components/ui/States'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCardHeader,
  MobileCardRow,
} from '@/components/shell/MobileShell'
import { useCollection, type RowOf } from '@/data/useCollection'
import { fromHalalas, invoiceMoney } from '@/screens/finance/money'
import { useInvoicesSummary } from './useFinanceReports'

/** Sales Management — invoices read live from `invoices`, with period totals
 *  from `GET /invoices/summary`. This used to be eight hand-written rows.
 *
 *  Two columns from the old mock have no honest source and are dropped:
 *  "Items" (an invoice's line count is a real number, but only reachable one
 *  invoice at a time from `invoiceLines`, not on the invoice row itself —
 *  not worth an N-request fan-out for a list column) and "Payment Method"
 *  (that lives on the separate `payments` table, and one invoice can have
 *  several payments with different methods, so a single value per row would
 *  be invented). Every KPI total is `useInvoicesSummary()`'s own figure —
 *  `invoicedHalalas` and each status's own `invoicedHalalas` from
 *  `byStatus` — never a sum of the rows this screen happens to have loaded. */

type InvoiceApiRow = RowOf<'invoices'> & {
  customerName?: string
  status?: string
  code?: string
  issuedAt?: string
}

interface SaleRow {
  invoiceNumber: string
  customer: string
  date: string
  amountHalalas: number
  status: string
}

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  paid: ['var(--tint-blue)', 'var(--salis-blue)'],
  issued: ['var(--tint-orange)', 'var(--salis-orange)'],
  draft: ['var(--tint-neutral)', 'var(--text-muted)'],
  void: ['var(--tint-neutral)', 'var(--text-muted)'],
  cancelled: ['var(--tint-neutral)', 'var(--text-muted)'],
}

export function SalesManagement() {
  const { t } = usePreferences()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const { data: invoices = [], isLoading, isError, error, refetch } = useCollection('invoices')
  const summary = useInvoicesSummary({})

  const rows: readonly SaleRow[] = useMemo(
    () =>
      (invoices as readonly InvoiceApiRow[]).map((r) => ({
        invoiceNumber: r.code ?? r.id,
        customer: r.customerName ?? r.cust ?? '',
        date: r.issuedAt ? r.issuedAt.slice(0, 10) : '',
        amountHalalas: invoiceMoney(r).totalHalalas,
        status: r.status ?? '',
      })),
    [invoices],
  )

  const statuses = useMemo(() => ['All', ...new Set(rows.map((r) => r.status).filter(Boolean))], [rows])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows
      .filter((s) => statusFilter === 'All' || s.status === statusFilter)
      .filter((s) => !needle || s.invoiceNumber.toLowerCase().includes(needle) || s.customer.toLowerCase().includes(needle))
  }, [rows, query, statusFilter])

  const s = summary.data
  const paid = s?.byStatus.find((b) => b.status === 'paid')
  const outstanding = s ? s.invoicedHalalas - (paid?.invoicedHalalas ?? 0) : undefined

  const stats: Stat[] = [
    { label: 'Total Sales', value: s ? formatSar(fromHalalas(s.invoicedHalalas)) : '—', caption: 'All invoices', highlight: true },
    { label: 'Paid', value: paid ? formatSar(fromHalalas(paid.invoicedHalalas)) : '—', caption: 'Collected', tone: 'info' },
    { label: 'Outstanding', value: outstanding !== undefined ? formatSar(fromHalalas(outstanding)) : '—', caption: 'Not yet paid', tone: 'warning' },
    { label: 'Invoices', value: s ? String(s.count) : '—', caption: 'This period' },
  ]

  const columns: Column<SaleRow>[] = [
    { header: 'Invoice', cell: (row) => row.invoiceNumber, code: true },
    { header: 'Customer', cell: (row) => row.customer },
    { header: 'Date', cell: (row) => <span dir="ltr" className="text-muted">{row.date}</span> },
    { header: 'Amount', cell: (row) => <Money sar={fromHalalas(row.amountHalalas)} className="font-semibold" />, className: 'text-end' },
    { header: 'Status', cell: (row) => {
      const [bg, fg] = STATUS_PALETTE[row.status] ?? STATUS_PALETTE.draft
      return <Badge background={bg} color={fg}>{t(row.status)}</Badge>
    } },
  ]

  if (isLoading) return <Loading label={t('Loading sales…')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="ShoppingCart"
        title={t('Sales Management')}
        subtitle={t('Sales invoices and payment tracking')}
      />
      <StatRow stats={stats} />

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Invoice or customer')}
            aria-label={t('Search sales')}
            inputSize="sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted">{t('Status')}</span>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label={t('Filter by status')}
            size="md"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st === 'All' ? t('All Statuses') : t(st)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <DataTable
        caption="Sales invoices"
        columns={columns}
        rows={filtered as SaleRow[]}
        rowKey={(row) => row.invoiceNumber}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_PALETTE[row.status] ?? STATUS_PALETTE.draft
          return (
            <>
              <MobileCardHeader title={row.invoiceNumber} code trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow label={t('Customer')}>{row.customer}</MobileCardRow>
              <MobileCardRow label={t('Amount')}><Money sar={fromHalalas(row.amountHalalas)} className="font-semibold text-heading" /></MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="ShoppingCart" title={t('No sales match the filter')} />}
      />
    </div>
  )
}
