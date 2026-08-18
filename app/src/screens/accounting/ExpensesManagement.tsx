import { useMemo } from 'react'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCard,
  MobileCardRow,
  MobilePageHeader,
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
  'Under Budget': ['rgba(10,94,215,.1)', '#0A5ED7'],
  'Over Budget': ['rgba(249,115,22,.1)', '#F97316'],
  'At Limit': ['rgba(11,31,59,.1)', '#0B1F3B'],
}

export function ExpensesManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

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

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="CreditCard"
          title={t('Expenses Management')}
          subtitle={t('Accounting')}
        />
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{t(stat.label)}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{stat.value}</p>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {MOCK_CATEGORIES.map((c) => {
            const pct = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0
            const [bg, fg] = STATUS_PALETTE[c.status] ?? STATUS_PALETTE['Under Budget']
            return (
              <MobileCard key={c.name}>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-heading">{t(c.name)}</span>
                  <Badge background={bg} color={fg}>{t(c.status)}</Badge>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(pct, 100)}%`, background: pct > 100 ? 'var(--salis-orange)' : 'var(--salis-blue)' }}
                  />
                </div>
                <MobileCardRow label={t('Spent / Budget')}>
                  <span dir="ltr" className="text-[12px]">
                    <Money sar={c.spent} bare /> / <Money sar={c.budget} bare />
                  </span>
                </MobileCardRow>
                <MobileCardRow label={t('Transactions')}>{c.transactions}</MobileCardRow>
              </MobileCard>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="CreditCard"
        title={t('Expenses Management')}
        subtitle={t('Expense categories with budget tracking')}
      />
      <StatRow stats={stats} />

      <Section
        title={t('Expense Categories')}
        subtitle={t('Budget vs actual spending by category')}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2.5 text-start font-medium">{t('Category')}</th>
                <th className="py-2.5 text-end font-medium">{t('Budget')}</th>
                <th className="py-2.5 text-end font-medium">{t('Spent')}</th>
                <th className="py-2.5 text-end font-medium">{t('Remaining')}</th>
                <th className="py-2.5 text-end font-medium">{t('Transactions')}</th>
                <th className="py-2.5 font-medium" style={{ width: 140 }}>{t('Progress')}</th>
                <th className="py-2.5 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CATEGORIES.map((c) => {
                const pct = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0
                const [bg, fg] = STATUS_PALETTE[c.status] ?? STATUS_PALETTE['Under Budget']
                return (
                  <tr key={c.name} className="border-b border-border/50">
                    <td className="py-2.5 text-[13px] font-medium text-heading">{t(c.name)}</td>
                    <td className="py-2.5 text-end">
                      <Money sar={c.budget} />
                    </td>
                    <td className="py-2.5 text-end">
                      <Money sar={c.spent} className="font-semibold" />
                    </td>
                    <td className="py-2.5 text-end">
                      <Money sar={c.remaining} className={c.remaining < 0 ? 'text-salis-orange' : ''} />
                    </td>
                    <td className="py-2.5 text-end text-[13px] text-heading">{c.transactions}</td>
                    <td className="py-2.5">
                      <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%`, background: pct > 100 ? 'var(--salis-orange)' : 'var(--salis-blue)' }}
                        />
                      </div>
                    </td>
                    <td className="py-2.5">
                      <Badge background={bg} color={fg}>{t(c.status)}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}
