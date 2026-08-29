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

interface PnLItem {
  category: string
  amount: number
  percentage: number
}

const MOCK_REVENUE: readonly PnLItem[] = [
  { category: 'Service Revenue', amount: 1450000_00, percentage: 58.0 },
  { category: 'Parts Sales', amount: 680000_00, percentage: 27.2 },
  { category: 'Warranty Claims', amount: 370000_00, percentage: 14.8 },
]

const MOCK_EXPENSES: readonly PnLItem[] = [
  { category: 'Salaries & Wages', amount: 620000_00, percentage: 30.1 },
  { category: 'Parts Cost of Goods', amount: 480000_00, percentage: 23.3 },
  { category: 'Rent & Utilities', amount: 225000_00, percentage: 10.9 },
  { category: 'Depreciation', amount: 180000_00, percentage: 8.7 },
  { category: 'General & Admin', amount: 155000_00, percentage: 7.5 },
]

export function LossAccount() {
  const { t } = usePreferences()

  const summary = useMemo(() => {
    const totalRevenue = MOCK_REVENUE.reduce((s, r) => s + r.amount, 0)
    const totalExpenses = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0)
    const netProfit = totalRevenue - totalExpenses
    const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0'
    return { totalRevenue, totalExpenses, netProfit, margin }
  }, [])

  const stats: Stat[] = [
    { label: 'Total Revenue', value: formatSar(summary.totalRevenue), caption: 'All revenue streams', highlight: true },
    { label: 'Total Expenses', value: formatSar(summary.totalExpenses), caption: 'All expense categories' },
    { label: 'Net Profit', value: formatSar(summary.netProfit), caption: summary.netProfit >= 0 ? 'Profitable' : 'Loss', tone: 'info' },
    { label: 'Margin', value: `${summary.margin}%`, caption: 'Net profit margin' },
  ]

  const revenueColumns: Column<PnLItem>[] = [
    { header: 'Category', cell: (r) => <span className="font-medium text-heading">{t(r.category)}</span> },
    { header: 'Amount', cell: (r) => <Money sar={r.amount} className="font-semibold text-salis-blue" />, className: 'text-end' },
    { header: '% of Total', cell: (r) => <span className="text-muted">{r.percentage}%</span>, className: 'text-end' },
  ]

  const expenseColumns: Column<PnLItem>[] = [
    { header: 'Category', cell: (e) => <span className="font-medium text-heading">{t(e.category)}</span> },
    { header: 'Amount', cell: (e) => <Money sar={e.amount} className="font-semibold" />, className: 'text-end' },
    { header: '% of Expenses', cell: (e) => <span className="text-muted">{e.percentage}%</span>, className: 'text-end' },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="BarChart3"
        title={t('Profit & Loss')}
        subtitle={t('Revenue and expense breakdown with net profit')}
      />
      <StatRow stats={stats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-heading">{t('Revenue')}</h2>
          <DataTable
            caption="Revenue by category"
            columns={revenueColumns}
            rows={MOCK_REVENUE as PnLItem[]}
            rowKey={(r) => r.category}
            footer={
              <div className="flex items-center justify-between border-t-2 border-border px-6 py-3 text-[13px] font-bold text-heading">
                <span>{t('Total Revenue')}</span>
                <span className="flex items-center gap-6">
                  <Money sar={summary.totalRevenue} className="font-bold" />
                  <span>100%</span>
                </span>
              </div>
            }
            mobileCard={(r) => (
              <>
                <MobileCardHeader title={t(r.category)} trailing={<Badge background="var(--tint-blue)" color="var(--salis-blue)">{r.percentage}%</Badge>} />
                <MobileCardRow label={t('Amount')}><Money sar={r.amount} className="font-semibold text-heading" /></MobileCardRow>
              </>
            )}
            empty={<EmptyState icon="BarChart3" title={t('No revenue items found')} />}
          />
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-heading">{t('Expenses')}</h2>
          <DataTable
            caption="Expenses by category"
            columns={expenseColumns}
            rows={MOCK_EXPENSES as PnLItem[]}
            rowKey={(e) => e.category}
            footer={
              <div className="flex items-center justify-between border-t-2 border-border px-6 py-3 text-[13px] font-bold text-heading">
                <span>{t('Total Expenses')}</span>
                <span className="flex items-center gap-6">
                  <Money sar={summary.totalExpenses} className="font-bold" />
                  <span>100%</span>
                </span>
              </div>
            }
            mobileCard={(e) => (
              <>
                <MobileCardHeader title={t(e.category)} trailing={<Badge background="var(--tint-orange)" color="var(--salis-orange)">{e.percentage}%</Badge>} />
                <MobileCardRow label={t('Amount')}><Money sar={e.amount} className="font-semibold text-heading" /></MobileCardRow>
              </>
            )}
            empty={<EmptyState icon="BarChart3" title={t('No expense items found')} />}
          />
        </div>
      </div>
    </div>
  )
}
