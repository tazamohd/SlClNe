import { useMemo } from 'react'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Money, parseSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { CountBars } from '@/components/ui/Charts'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { ErrorState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { usePagedCollection, type RowOf } from '@/data/useCollection'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'

/** Expenses Management (`/expenses-management`) — the expense ledger, read from
 *  `expenses` (`GET /accounting/expenses`) through the repository seam.
 *
 *  ── Why this screen no longer shows a budget ──────────────────────────────
 *
 *  It used to render eight categories with a budget, a spend, a remaining
 *  balance and a utilisation bar, all from a local array. None of that exists on
 *  the server: there is no budget collection, and no endpoint sums expense spend
 *  by category. Keeping those columns against live rows would have meant either
 *  inventing a budget or adding up a page of rows and calling it the month —
 *  and a fabricated figure on a finance screen reads as real. So the money
 *  columns the server owns are gone, the gap names the read that would supply
 *  them, and every amount shown is one record's own server figure, displayed and
 *  never re-derived (§A10: the server computes, the client displays).
 *
 *  What is left is honest and still useful: the record count the server reports
 *  for the collection, the categories present with a count of claims in each
 *  (counting records is not a financial calculation), and the expense rows
 *  themselves.
 */

type Expense = RowOf<'expenses'>

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  approved: ['var(--tint-blue)', 'var(--salis-blue)'],
  pending: ['var(--tint-orange)', 'var(--salis-orange)'],
  rejected: ['var(--tint-neutral)', 'var(--text-muted)'],
}

function ExpenseStatus({ value }: { value: string }) {
  const { t } = usePreferences()
  const [bg, fg] = STATUS_PALETTE[value] ?? STATUS_PALETTE.pending
  return (
    <Badge background={bg} color={fg}>
      {t(value.charAt(0).toUpperCase() + value.slice(1))}
    </Badge>
  )
}

/** The budget side of "budget tracking", named as absent rather than invented.
 *  `GET /accounting/expenses` returns claims, not budgets, and no endpoint rolls
 *  spend up against one. */
function BudgetGap() {
  const { t } = usePreferences()
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-muted">
      <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
      <span>
        {t('Not recorded in this dataset')}: {t('Budget')}, {t('Remaining')}, {t('Progress')}.{' '}
        {t('Server aggregate:')}{' '}
        <span dir="ltr" className="font-mono text-body">
          GET /accounting/expenses/summary
        </span>
      </span>
    </p>
  )
}

function countByCategory(rows: readonly Expense[]): { label: string; value: number }[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const key = row.category || '—'
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

export function ExpensesManagement() {
  const { t } = usePreferences()
  const { data, isLoading, isError, error, refetch } = usePagedCollection('expenses')

  const rows = useMemo(() => (data?.rows ?? []) as readonly Expense[], [data])
  const byCategory = useMemo(() => countByCategory(rows), [rows])

  /** Counts, not sums. The server's own record total for the collection where
   *  it reports one; otherwise the rows in hand, which is what is on screen. */
  const serverTotal = data?.page.total
  const approved = rows.filter((row) => row.status === 'approved').length
  const pending = rows.filter((row) => row.status === 'pending').length

  const stats: Stat[] = [
    {
      label: 'Expenses',
      value: serverTotal ?? rows.length,
      caption: 'records on the server',
      highlight: true,
    },
    { label: 'Expense Categories', value: byCategory.length, caption: 'Expenses by category' },
    { label: 'Approved', value: approved, caption: 'Processed' },
    { label: 'Pending', value: pending, caption: 'Count of expense claims', tone: 'warning' },
  ]

  const columns: Column<Expense>[] = [
    { header: 'Expense #', cell: (e) => e.id, code: true },
    {
      header: 'Date',
      cell: (e) => (
        <span dir="ltr" className="text-muted">
          {e.date}
        </span>
      ),
    },
    { header: 'Category', cell: (e) => t(e.category) },
    { header: 'Vendor', cell: (e) => e.vendor },
    {
      header: 'Amount',
      cell: (e) => <Money sar={parseSar(e.amount)} className="font-semibold" />,
      className: 'text-end',
    },
    { header: 'Status', cell: (e) => <ExpenseStatus value={e.status} /> },
  ]

  if (isError) {
    return (
      <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
        <FeatureHeader
          icon="CreditCard"
          title={t('Expenses Management')}
          subtitle={t('All expense submissions with approval status')}
        />
        <Card className="p-6">
          <ErrorState description={error?.message} onRetry={() => void refetch()} />
        </Card>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="CreditCard"
        title={t('Expenses Management')}
        subtitle={t('All expense submissions with approval status')}
      />
      <StatRow stats={stats} />
      <BudgetGap />

      <Section title={t('Expenses by category')} subtitle={t('Count of expense claims')}>
        {byCategory.length ? (
          <CountBars rows={byCategory} />
        ) : (
          <EmptyState icon="Receipt" title={t('No expenses')} />
        )}
      </Section>

      <DataTable
        caption="Expenses"
        columns={columns}
        rows={rows}
        rowKey={(e, index) => String(e.id ?? index)}
        loading={isLoading}
        mobileCard={(e) => (
          <>
            <MobileCardHeader title={e.id} code trailing={<ExpenseStatus value={e.status} />} />
            <MobileCardRow>{e.vendor}</MobileCardRow>
            <MobileCardRow label={t('Category')}>{t(e.category)}</MobileCardRow>
            <MobileCardRow label={t('Amount')}>
              <Money sar={parseSar(e.amount)} className="font-semibold text-heading" />
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="CreditCard" title={t('No expenses recorded')} />}
      />
    </div>
  )
}
