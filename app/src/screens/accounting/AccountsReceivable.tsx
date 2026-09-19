import { useMemo, useState } from 'react'
import { formatSar } from '@/components/ui/Money'
import { KpiCard } from '@/components/ui/KpiCard'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'
import { fromHalalas, invoiceMoney } from '@/screens/finance/money'
import { useInvoicesSummary } from './useFinanceReports'

/** Accounts Receivable — outstanding customer invoices, read live from
 *  `invoices`. This used to be six hand-written rows.
 *
 *  The API names its fields differently from the design-bundle fixture
 *  (`customerName`/`dueDate`/`code` vs. `cust`/`due`/`id`), so each row reads
 *  whichever shape is actually present rather than assuming one. The per-row
 *  amount is `invoiceMoney(row).balanceHalalas` — the server's own
 *  total-minus-paid for that invoice, not a figure this screen computes.
 *
 *  "Days overdue" is arithmetic on a single row's own `dueDate` against
 *  today, which is not a cross-row aggregate and is fine to compute here. A
 *  *total* over "current" vs. "overdue" invoices would be one, and there is
 *  no such split in `GET /invoices/summary` — the server's own `status`
 *  values are draft/issued/paid, never "overdue"; that word only ever
 *  existed in the old fixture. So the KPI row shows the real
 *  `outstandingHalalas` total plus the real per-status counts, and does not
 *  invent a current/overdue split. */

type InvoiceRow = RowOf<'invoices'> & {
  customerName?: string
  dueDate?: string
  code?: string
  status?: string
}

function customerNameOf(row: InvoiceRow): string {
  return row.customerName ?? row.cust ?? ''
}

function dueDateOf(row: InvoiceRow): string {
  return row.dueDate ?? row.due ?? ''
}

function invoiceCodeOf(row: InvoiceRow): string {
  return row.code ?? row.id ?? ''
}

function daysOverdue(dueDate: string): number {
  if (!dueDate) return 0
  const due = Date.parse(dueDate)
  if (Number.isNaN(due)) return 0
  return Math.max(0, Math.floor((Date.now() - due) / 86_400_000))
}

export function AccountsReceivable() {
  const { t } = usePreferences()
  const { data: invoices = [], isLoading, isError, error, refetch } = useCollection('invoices')
  const summary = useInvoicesSummary({})
  const [filter, setFilter] = useState<'all' | 'current' | 'overdue'>('all')

  const rows = useMemo(
    () =>
      (invoices as readonly InvoiceRow[])
        .filter((r) => r.status !== 'paid')
        .map((r) => {
          const overdue = daysOverdue(dueDateOf(r))
          return {
            customer: customerNameOf(r),
            invoice: invoiceCodeOf(r),
            amountHalalas: invoiceMoney(r).balanceHalalas,
            dueDate: dueDateOf(r),
            daysOverdue: overdue,
            status: overdue > 0 ? t('Overdue') : t('Current'),
          }
        }),
    [invoices, t],
  )

  const filtered = filter === 'overdue' ? rows.filter((r) => r.daysOverdue > 0) : filter === 'current' ? rows.filter((r) => r.daysOverdue === 0) : rows

  const s = summary.data
  const kpis = [
    { label: t('Total Outstanding'), value: s ? formatSar(fromHalalas(s.outstandingHalalas)) : '—', icon: 'DollarSign', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Total Invoiced'), value: s ? formatSar(fromHalalas(s.invoicedHalalas)) : '—', icon: 'FileText', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Collected'), value: s ? formatSar(fromHalalas(s.paidHalalas)) : '—', icon: 'CheckCircle', bg: 'var(--tint-navy)', fg: 'var(--text-heading)' },
    { label: t('Open Invoices'), value: String(rows.length), icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const columns: Column<(typeof rows)[number]>[] = [
    { header: 'Customer', cell: (r) => <span className="font-medium text-heading">{r.customer}</span> },
    { header: 'Invoice', cell: (r) => r.invoice, code: true },
    { header: 'Amount', cell: (r) => <span dir="ltr" className="font-mono font-medium text-heading">{formatSar(fromHalalas(r.amountHalalas))}</span>, className: 'text-end' },
    { header: 'Due Date', cell: (r) => <span dir="ltr" className="text-muted">{r.dueDate}</span> },
    { header: 'Days Overdue', cell: (r) => <span className="font-mono text-heading">{r.daysOverdue || '—'}</span>, className: 'text-end' },
    { header: 'Status', cell: (r) => (
      <Badge background={r.daysOverdue > 0 ? 'var(--tint-orange)' : 'var(--tint-blue)'}
        color={r.daysOverdue > 0 ? 'var(--salis-orange)' : 'var(--salis-blue)'}>{r.status}</Badge>
    ) },
  ]

  if (isLoading) return <Loading label={t('Loading receivables…')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ArrowDownRight" title={t('Accounts Receivable')} subtitle={t('Accounting')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} mono />
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-heading">{t('Outstanding Invoices')}</h2>
        <ChipGroup label={t('Status')}>
          {(['all', 'current', 'overdue'] as const).map((f) => (
            <Chip
              key={f}
              label={t(f === 'all' ? 'All' : f === 'current' ? 'Current' : 'Overdue')}
              selected={filter === f}
              onToggle={() => setFilter(f)}
            />
          ))}
        </ChipGroup>
      </div>

      <DataTable
        caption="Outstanding receivable invoices"
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.invoice}
        mobileCard={(r) => (
          <>
            <MobileCardHeader
              title={r.customer}
              trailing={
                <Badge background={r.daysOverdue > 0 ? 'var(--tint-orange)' : 'var(--tint-blue)'}
                  color={r.daysOverdue > 0 ? 'var(--salis-orange)' : 'var(--salis-blue)'}>{r.status}</Badge>
              }
            />
            <MobileCardRow label={t('Invoice')}><span dir="ltr">{r.invoice}</span></MobileCardRow>
            <MobileCardRow label={t('Amount')}><span dir="ltr" className="font-semibold">{formatSar(fromHalalas(r.amountHalalas))}</span></MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="FileText" title={t('No outstanding invoices')} />}
      />
    </div>
  )
}
