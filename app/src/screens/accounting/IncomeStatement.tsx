import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCard,
  MobileCardHeader,
  MobileCardRow,
  MobilePageHeader,
} from '@/components/shell/MobileShell'

/** Income Statement screen — spec-only build.
 *
 *  Revenue section with line items and subtotal, expenses section with
 *  line items and subtotal, and a net income calculation. */

interface LineItem {
  name: string
  amount: number
}

const REVENUE: readonly LineItem[] = [
  { name: 'Service Revenue', amount: 1450000 },
  { name: 'Parts Sales', amount: 680000 },
  { name: 'Warranty Revenue', amount: 95000 },
  { name: 'Consultation Fees', amount: 45000 },
  { name: 'Insurance Claims', amount: 120000 },
]

const EXPENSES: readonly LineItem[] = [
  { name: 'Salaries & Wages', amount: 620000 },
  { name: 'Parts Cost of Goods', amount: 480000 },
  { name: 'Rent Expense', amount: 180000 },
  { name: 'Utilities', amount: 45000 },
  { name: 'Insurance', amount: 36000 },
  { name: 'Marketing & Advertising', amount: 28000 },
  { name: 'Depreciation', amount: 65000 },
  { name: 'Office Supplies', amount: 12000 },
  { name: 'Professional Fees', amount: 18000 },
  { name: 'Miscellaneous', amount: 8500 },
]

function sumItems(items: readonly LineItem[]): number {
  return items.reduce((s, i) => s + i.amount, 0)
}

function StatementBlock({
  title,
  icon,
  items,
  subtotalLabel,
  accentColor,
}: {
  title: string
  icon: string
  items: readonly LineItem[]
  subtotalLabel: string
  accentColor: string
}) {
  const { t } = usePreferences()
  const total = sumItems(items)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span
          className="flex rounded-lg p-2"
          style={{ background: `${accentColor}18` }}
        >
          <Icon name={icon} size={18} style={{ color: accentColor }} />
        </span>
        <h2 className="font-display text-base font-bold text-heading">{t(title)}</h2>
      </div>
      <div className="flex flex-col">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between border-b border-border/50 py-2.5 text-[13px] text-body"
          >
            <span>{t(item.name)}</span>
            <Money sar={item.amount} />
          </div>
        ))}
        <div className="flex items-center justify-between py-3 text-sm font-bold text-heading">
          <span>{t(subtotalLabel)}</span>
          <Money sar={total} className="font-bold" />
        </div>
      </div>
    </div>
  )
}

export function IncomeStatement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const totalRevenue = sumItems(REVENUE)
  const totalExpenses = sumItems(EXPENSES)
  const netIncome = totalRevenue - totalExpenses
  const margin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : '0.0'

  const stats: Stat[] = [
    { label: 'Total Revenue', value: formatSar(totalRevenue), caption: 'Current period', highlight: true },
    { label: 'Total Expenses', value: formatSar(totalExpenses), caption: 'Current period', tone: 'warning' },
    { label: 'Net Income', value: formatSar(netIncome), caption: 'Revenue less expenses', tone: 'info' },
    { label: 'Profit Margin', value: `${margin}%`, caption: 'Net income / revenue' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="TrendingUp"
          title={t('Income Statement')}
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
        {[
          { title: 'Revenue', items: REVENUE },
          { title: 'Expenses', items: EXPENSES },
        ].map(({ title, items }) => (
          <div key={title} className="flex flex-col gap-2">
            <h2 className="font-display text-sm font-bold text-heading">{t(title)}</h2>
            {items.map((item) => (
              <MobileCard key={item.name}>
                <MobileCardHeader leading={<span className="text-sm font-semibold text-heading">{t(item.name)}</span>} />
                <MobileCardRow label={t('Amount')}>
                  <Money sar={item.amount} className="font-semibold text-heading" />
                </MobileCardRow>
              </MobileCard>
            ))}
          </div>
        ))}
        <Card className="rounded-lg p-4">
          <p className="text-[11px] font-medium text-muted">{t('Net Income')}</p>
          <p className="mt-1 font-display text-2xl font-black text-salis-blue" dir="ltr">
            {formatSar(netIncome)}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="TrendingUp"
        title={t('Income Statement')}
        subtitle={t('Revenue, expenses and net income')}
      />
      <StatRow stats={stats} />

      <Section title={t('Income Statement')} subtitle={t('For the current reporting period')}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <StatementBlock
            title={t('Revenue')}
            icon="ArrowUpRight"
            items={REVENUE}
            subtotalLabel={t('Total Revenue')}
            accentColor="var(--salis-blue)"
          />
          <StatementBlock
            title={t('Expenses')}
            icon="ArrowDownRight"
            items={EXPENSES}
            subtotalLabel={t('Total Expenses')}
            accentColor="var(--salis-orange)"
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border-2 border-salis-blue/30 bg-[rgba(10,94,215,.04)] px-5 py-4">
          <div>
            <p className="font-display text-sm font-bold text-heading">{t('Net Income')}</p>
            <p className="mt-0.5 text-xs text-muted">
              {t('Total Revenue')} - {t('Total Expenses')}
            </p>
          </div>
          <div className="text-end">
            <Money sar={netIncome} className="font-display text-2xl font-black text-salis-blue" />
            <p className="mt-0.5 text-xs text-muted">
              {margin}% {t('margin')}
            </p>
          </div>
        </div>
      </Section>
    </div>
  )
}
