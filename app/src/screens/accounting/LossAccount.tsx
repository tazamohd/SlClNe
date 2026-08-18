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
  const isMobile = useIsMobile()

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

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="BarChart3"
          title={t('Profit & Loss')}
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

        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t('Revenue')}</p>
        <div className="flex flex-col gap-3">
          {MOCK_REVENUE.map((r) => (
            <MobileCard key={r.category}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-heading">{t(r.category)}</span>
                <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">{r.percentage}%</Badge>
              </div>
              <MobileCardRow label={t('Amount')}>
                <Money sar={r.amount} className="font-semibold text-heading" />
              </MobileCardRow>
            </MobileCard>
          ))}
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t('Expenses')}</p>
        <div className="flex flex-col gap-3">
          {MOCK_EXPENSES.map((e) => (
            <MobileCard key={e.category}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-heading">{t(e.category)}</span>
                <Badge background="rgba(249,115,22,.1)" color="#F97316">{e.percentage}%</Badge>
              </div>
              <MobileCardRow label={t('Amount')}>
                <Money sar={e.amount} className="font-semibold text-heading" />
              </MobileCardRow>
            </MobileCard>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="BarChart3"
        title={t('Profit & Loss')}
        subtitle={t('Revenue and expense breakdown with net profit')}
      />
      <StatRow stats={stats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section
          title={t('Revenue')}
          subtitle={t('Income by category')}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                  <th className="py-2.5 text-start font-medium">{t('Category')}</th>
                  <th className="py-2.5 text-end font-medium">{t('Amount')}</th>
                  <th className="py-2.5 text-end font-medium">{t('% of Total')}</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_REVENUE.map((r) => (
                  <tr key={r.category} className="border-b border-border/50">
                    <td className="py-2.5 text-[13px] font-medium text-heading">{t(r.category)}</td>
                    <td className="py-2.5 text-end">
                      <Money sar={r.amount} className="font-semibold text-salis-blue" />
                    </td>
                    <td className="py-2.5 text-end text-[13px] text-muted">{r.percentage}%</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 text-[13px] font-bold text-heading">{t('Total Revenue')}</td>
                  <td className="py-2.5 text-end">
                    <Money sar={summary.totalRevenue} className="font-bold text-heading" />
                  </td>
                  <td className="py-2.5 text-end text-[13px] font-bold text-heading">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          title={t('Expenses')}
          subtitle={t('Cost by category')}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                  <th className="py-2.5 text-start font-medium">{t('Category')}</th>
                  <th className="py-2.5 text-end font-medium">{t('Amount')}</th>
                  <th className="py-2.5 text-end font-medium">{t('% of Expenses')}</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_EXPENSES.map((e) => (
                  <tr key={e.category} className="border-b border-border/50">
                    <td className="py-2.5 text-[13px] font-medium text-heading">{t(e.category)}</td>
                    <td className="py-2.5 text-end">
                      <Money sar={e.amount} className="font-semibold" />
                    </td>
                    <td className="py-2.5 text-end text-[13px] text-muted">{e.percentage}%</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 text-[13px] font-bold text-heading">{t('Total Expenses')}</td>
                  <td className="py-2.5 text-end">
                    <Money sar={summary.totalExpenses} className="font-bold text-heading" />
                  </td>
                  <td className="py-2.5 text-end text-[13px] font-bold text-heading">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  )
}
