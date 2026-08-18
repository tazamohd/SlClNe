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

/** Balance Sheet screen — spec-only build.
 *
 *  Displays the three sections of a balance sheet: Assets, Liabilities
 *  and Equity, each with subtotals. The identity Assets = Liabilities + Equity
 *  is verified visually. */

interface LineItem {
  name: string
  amount: number
}

const ASSETS: readonly LineItem[] = [
  { name: 'Cash in Hand', amount: 225000 },
  { name: 'Bank – Al Rajhi', amount: 1620000 },
  { name: 'Accounts Receivable', amount: 320000 },
  { name: 'Inventory – Parts', amount: 385000 },
  { name: 'Fixed Assets', amount: 950000 },
  { name: 'Prepaid Expenses', amount: 48000 },
]

const LIABILITIES: readonly LineItem[] = [
  { name: 'Accounts Payable', amount: 440000 },
  { name: 'VAT Payable', amount: 143000 },
  { name: 'Accrued Expenses', amount: 75000 },
  { name: 'Short-Term Loans', amount: 200000 },
  { name: 'Long-Term Debt', amount: 450000 },
]

const EQUITY: readonly LineItem[] = [
  { name: 'Owner Equity', amount: 1500000 },
  { name: 'Retained Earnings', amount: 520000 },
  { name: 'Current Year Earnings', amount: 220000 },
]

function sumItems(items: readonly LineItem[]): number {
  return items.reduce((s, i) => s + i.amount, 0)
}

function StatementSection({
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
        <h3 className="font-display text-base font-bold text-heading">{t(title)}</h3>
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

export function BalanceSheet() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const totalAssets = sumItems(ASSETS)
  const totalLiabilities = sumItems(LIABILITIES)
  const totalEquity = sumItems(EQUITY)
  const liabPlusEquity = totalLiabilities + totalEquity
  const balanced = Math.abs(totalAssets - liabPlusEquity) < 0.005

  const stats: Stat[] = [
    { label: 'Total Assets', value: formatSar(totalAssets), caption: 'Current period', highlight: true },
    { label: 'Total Liabilities', value: formatSar(totalLiabilities), caption: 'Current period', tone: 'warning' },
    { label: 'Total Equity', value: formatSar(totalEquity), caption: 'Current period', tone: 'info' },
    { label: 'Liab. + Equity', value: formatSar(liabPlusEquity), caption: balanced ? 'Balanced' : 'Unbalanced' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="FileText"
          title={t('Balance Sheet')}
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
          { title: 'Assets', items: ASSETS },
          { title: 'Liabilities', items: LIABILITIES },
          { title: 'Equity', items: EQUITY },
        ].map(({ title, items }) => (
          <div key={title} className="flex flex-col gap-2">
            <h3 className="font-display text-sm font-bold text-heading">{t(title)}</h3>
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
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="FileText"
        title={t('Balance Sheet')}
        subtitle={t('Assets, liabilities and equity with totals')}
      />
      <StatRow stats={stats} />

      {!balanced && (
        <div className="flex items-center gap-2 rounded-lg border border-salis-orange/30 bg-[rgba(249,115,22,.06)] px-4 py-3 text-[13px] text-body">
          <Icon name="AlertTriangle" size={16} className="flex-shrink-0 text-salis-orange" />
          {t('Assets do not equal liabilities plus equity.')}
        </div>
      )}

      <Section title={t('Balance Sheet')} subtitle={t('As at end of current period')}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <StatementSection
            title="Assets"
            icon="Wallet"
            items={ASSETS}
            subtotalLabel="Total Assets"
            accentColor="#0A5ED7"
          />
          <div className="flex flex-col gap-8">
            <StatementSection
              title="Liabilities"
              icon="CreditCard"
              items={LIABILITIES}
              subtotalLabel="Total Liabilities"
              accentColor="#F97316"
            />
            <StatementSection
              title="Equity"
              icon="Landmark"
              items={EQUITY}
              subtotalLabel="Total Equity"
              accentColor="#0B1F3B"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border-2 border-border bg-inset px-5 py-4">
          <div>
            <p className="font-display text-sm font-bold text-heading">{t('Balance Sheet Identity')}</p>
            <p className="mt-0.5 text-xs text-muted">
              {t('Assets')} = {t('Liabilities')} + {t('Equity')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Icon
              name={balanced ? 'CheckCircle2' : 'AlertTriangle'}
              size={18}
              className={balanced ? 'text-salis-blue' : 'text-salis-orange'}
            />
            <span className={`font-action text-sm font-semibold ${balanced ? 'text-salis-blue' : 'text-salis-orange'}`}>
              {balanced ? t('Balanced') : t('Unbalanced')}
            </span>
          </div>
        </div>
      </Section>
    </div>
  )
}
