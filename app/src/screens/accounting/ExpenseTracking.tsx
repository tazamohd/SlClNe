import { useMemo, useState } from 'react'
import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Money, parseSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { ErrorState, Loading } from '@/components/ui/States'
import { Input } from '@/components/ui/Input'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCardHeader,
  MobileCardRow,
} from '@/components/shell/MobileShell'
import { usePagedCollection, type RowOf } from '@/data/useCollection'
import { fromHalalas } from '@/screens/finance/money'

type ExpenseApiRow = RowOf<'expenses'> & {
  code?: string
  expenseDate?: string
  amountHalalas?: number
}

function amountSarOf(row: ExpenseApiRow): number {
  if (typeof row.amountHalalas === 'number') return fromHalalas(row.amountHalalas)
  return typeof row.amount === 'string' ? parseSar(row.amount) : 0
}

/** Expense Tracking — expense claims read live from `expenses`. This used to
 *  be eight hand-written rows with a fabricated description, payment method
 *  and submitter for each.
 *
 *  `expenses` (`server/src/db/schema.ts`) carries `code`, `expenseDate`,
 *  `category`, `vendor`, `amountHalalas` and `status` — no free-text
 *  description, no payment method, and no submitter column, so this screen
 *  shows `vendor` (a real field the old rows didn't) in place of those three
 *  invented ones. There is also no `GET /expenses/summary` endpoint, so the
 *  KPI row shows the one figure the server genuinely counts —
 *  `page.total`, the record count across the whole tenant — rather than a
 *  sum of amounts, which would only ever be a sum of whatever page happened
 *  to load. */

interface ExpenseRow {
  code: string
  date: string
  category: string
  vendor: string
  amountSar: number
  status: string
}

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  approved: ['var(--tint-blue)', 'var(--salis-blue)'],
  pending: ['var(--tint-orange)', 'var(--salis-orange)'],
  rejected: ['var(--tint-neutral)', 'var(--text-muted)'],
}

export function ExpenseTracking() {
  const { t } = usePreferences()
  const [query, setQuery] = useState('')
  const expenses = usePagedCollection('expenses')

  const rows: readonly ExpenseRow[] = useMemo(
    () =>
      ((expenses.data?.rows ?? []) as readonly ExpenseApiRow[]).map((e) => ({
        code: e.code ?? e.id,
        date: e.expenseDate ?? e.date,
        category: e.category ?? '',
        vendor: e.vendor ?? '',
        amountSar: amountSarOf(e),
        status: e.status,
      })),
    [expenses.data],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter(
      (e) =>
        e.code.toLowerCase().includes(needle) ||
        e.category.toLowerCase().includes(needle) ||
        e.vendor.toLowerCase().includes(needle),
    )
  }, [rows, query])

  const stats: Stat[] = [
    { label: 'Expense Records', value: expenses.data?.page.total ?? '—', caption: 'Across the organization', highlight: true },
  ]

  const columns: Column<ExpenseRow>[] = [
    { header: 'ID', cell: (e) => e.code, code: true },
    { header: 'Date', cell: (e) => <span dir="ltr" className="text-muted">{e.date}</span> },
    { header: 'Category', cell: (e) => t(e.category) },
    { header: 'Vendor', cell: (e) => e.vendor || '—' },
    { header: 'Amount', cell: (e) => <Money sar={e.amountSar} className="font-semibold" />, className: 'text-end' },
    { header: 'Status', cell: (e) => {
      const [bg, fg] = STATUS_PALETTE[e.status] ?? STATUS_PALETTE.pending
      return <Badge background={bg} color={fg}>{t(e.status)}</Badge>
    } },
  ]

  if (expenses.isLoading) return <Loading label={t('Loading expenses…')} />
  if (expenses.isError) return <ErrorState description={expenses.error?.message} onRetry={() => void expenses.refetch()} />

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Receipt"
        title={t('Expense Tracking')}
        subtitle={t('Track and approve expense submissions')}
      />
      <StatRow stats={stats} />

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('ID, category or vendor')}
            aria-label={t('Search expenses')}
            inputSize="sm"
          />
        </label>
      </div>

      <DataTable
        caption="Expense submissions"
        columns={columns}
        rows={filtered as ExpenseRow[]}
        rowKey={(e) => e.code}
        mobileCard={(e) => {
          const [bg, fg] = STATUS_PALETTE[e.status] ?? STATUS_PALETTE.pending
          return (
            <>
              <MobileCardHeader title={e.code} code trailing={<Badge background={bg} color={fg}>{t(e.status)}</Badge>} />
              <MobileCardRow>{t(e.category)}</MobileCardRow>
              <MobileCardRow label={t('Amount')}><Money sar={e.amountSar} className="font-semibold text-heading" /></MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="Receipt" title={t('No expenses match the filter')} />}
      />
    </div>
  )
}
