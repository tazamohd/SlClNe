import { useMemo } from 'react'
import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCardHeader,
  MobileCardRow,
} from '@/components/shell/MobileShell'

interface ExpenseCategory {
  name: string
  budget: number
  spent: number
  remaining: number
  transactions: number
  status: string
}

const MOCK_CATEGORIES: readonly ExpenseCategory[] = [
  { name: 'Salaries & Wages', budget: 90000_00, spent: 85000_00, remaining: 5000_00, transactions: 12, status: 'At Limit' },
  { name: 'Parts & Materials', budget: 60000_00, spent: 48000_00, remaining: 12000_00, transactions: 34, status: 'Under Budget' },
  { name: 'Rent & Lease', budget: 35000_00, spent: 35000_00, remaining: 0, transactions: 1, status: 'At Limit' },
  { name: 'Utilities', budget: 8000_00, spent: 6200_00, remaining: 1800_00, transactions: 4, status: 'Under Budget' },
  { name: 'Vehicle Expenses', budget: 15000_00, spent: 17500_00, remaining: -2500_00, transactions: 8, status: 'Over Budget' },
  { name: 'Insurance', budget: 12000_00, spent: 12000_00, remaining: 0, transactions: 2, status: 'At Limit' },
  { name: 'Marketing', budget: 10000_00, spent: 6500_00, remaining: 3500_00, transactions: 5, status: 'Under Budget' },
  { name: 'Miscellaneous', budget: 5000_00, spent: 3200_00, remaining: 1800_00, transactions: 7, status: 'Under Budget' },
]

const STATUS_PALETTE: Record<string, readonly [string, string]> = {
  'Under Budget': ['var(--tint-blue)', '#0A5ED7'],
  'Over Budget': ['var(--tint-orange)', '#F97316'],
  'At Limit': ['var(--tint-navy)', '#0B1F3B'],
}

export function ExpensesManagement() {
  const { t } = usePreferences()

  const totals = useMemo(() => {
    let budget = 0
    let spent = 0
    let overBudget = 0
    let underBudget = 0
    for (const c of MOCK_CATEGORIES) {
      budget += c.budget
      spent += c.spent
      if (c.status === 'Over Budget') overBudget++
      if (c.status === 'Under Budget') underBudget++
    }
    return { budget, spent, remaining: budget - spent, overBudget, underBudget, count: MOCK_CATEGORIES.length }
  }, [])

  const stats: Stat[] = [
    { label: 'Total Budget', value: formatSar(totals.budget), caption: 'Monthly budget', highlight: true },
    { label: 'Total Spent', value: formatSar(totals.spent), caption: `${Math.round((totals.spent / totals.budget) * 100)}% utilized` },
    { label: 'Remaining', value: formatSar(totals.remaining), caption: 'Available balance', tone: 'info' },
    { label: 'Over Budget', value: totals.overBudget, caption: 'Categories exceeded', tone: 'warning' },
  ]

  const columns: Column<ExpenseCategory>[] = [
    { header: 'Category', cell: (c) => <span className="font-medium text-heading">{t(c.name)}</span> },
    { header: 'Budget', cell: (c) => <Money sar={c.budget} />, className: 'text-end' },
    { header: 'Spent', cell: (c) => <Money sar={c.spent} className="font-semibold" />, className: 'text-end' },
    { header: 'Remaining', cell: (c) => <Money sar={c.remaining} className={c.remaining < 0 ? 'text-salis-orange' : ''} />, className: 'text-end' },
    { header: 'Transactions', cell: (c) => c.transactions, className: 'text-end' },
    { header: 'Progress', cell: (c) => {
      const pct = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0
      return (
        <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]" style={{ minWidth: 100 }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: pct > 100 ? 'var(--salis-orange)' : 'var(--salis-blue)' }} />
        </div>
      )
    } },
    { header: 'Status', cell: (c) => {
      const [bg, fg] = STATUS_PALETTE[c.status] ?? STATUS_PALETTE['Under Budget']
      return <Badge background={bg} color={fg}>{t(c.status)}</Badge>
    } },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="CreditCard"
        title={t('Expenses Management')}
        subtitle={t('Expense categories with budget tracking')}
      />
      <StatRow stats={stats} />

      <DataTable
        caption="Expense categories"
        columns={columns}
        rows={MOCK_CATEGORIES as ExpenseCategory[]}
        rowKey={(c) => c.name}
        mobileCard={(c) => {
          const pct = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0
          const [bg, fg] = STATUS_PALETTE[c.status] ?? STATUS_PALETTE['Under Budget']
          return (
            <>
              <MobileCardHeader title={t(c.name)} trailing={<Badge background={bg} color={fg}>{t(c.status)}</Badge>} />
              <MobileCardRow label={t('Spent / Budget')}>
                <span dir="ltr" className="text-[12px]">
                  <Money sar={c.spent} bare /> / <Money sar={c.budget} bare />
                </span>
              </MobileCardRow>
              <MobileCardRow label={t('Progress')}>{pct}%</MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="CreditCard" title={t('No expense categories found')} />}
      />
    </div>
  )
}
