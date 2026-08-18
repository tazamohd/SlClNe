import { useMemo } from 'react'
import { FeatureHeader, Section, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Money, formatSar } from '@/components/ui/Money'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCard,
  MobileCardRow,
  MobilePageHeader,
} from '@/components/shell/MobileShell'

interface FiscalYear {
  year: string
  openingBalance: number
  netIncome: number
  dividends: number
  closingBalance: number
}

const MOCK_YEARS: readonly FiscalYear[] = [
  { year: '2023', openingBalance: 180000_00, netIncome: 320000_00, dividends: 100000_00, closingBalance: 400000_00 },
  { year: '2024', openingBalance: 400000_00, netIncome: 285000_00, dividends: 120000_00, closingBalance: 565000_00 },
  { year: '2025', openingBalance: 565000_00, netIncome: 410000_00, dividends: 150000_00, closingBalance: 825000_00 },
  { year: '2026', openingBalance: 825000_00, netIncome: 195000_00, dividends: 0, closingBalance: 1020000_00 },
]

export function RetainedEarnings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const current = MOCK_YEARS[MOCK_YEARS.length - 1]

  const stats: Stat[] = useMemo(() => [
    { label: 'Current Retained Earnings', value: formatSar(current.closingBalance), caption: `FY ${current.year}`, highlight: true },
    { label: 'YTD Net Income', value: formatSar(current.netIncome), caption: 'Year-to-date', tone: 'info' as const },
    { label: 'Total Dividends Paid', value: formatSar(MOCK_YEARS.reduce((s, y) => s + y.dividends, 0)), caption: 'All periods' },
    { label: 'Growth', value: `${Math.round(((current.closingBalance - MOCK_YEARS[0].openingBalance) / MOCK_YEARS[0].openingBalance) * 100)}%`, caption: 'Since FY 2023' },
  ], [current])

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="TrendingUp"
          title={t('Retained Earnings')}
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
          {MOCK_YEARS.map((fy) => (
            <MobileCard key={fy.year}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-heading">{t('FY')} {fy.year}</span>
                <span className="flex items-center gap-1 text-xs text-salis-blue">
                  <Icon name="TrendingUp" size={12} />
                  <Money sar={fy.closingBalance} bare className="font-semibold" />
                </span>
              </div>
              <MobileCardRow label={t('Opening')}>
                <Money sar={fy.openingBalance} className="text-heading" />
              </MobileCardRow>
              <MobileCardRow label={t('Net Income')}>
                <Money sar={fy.netIncome} className="text-heading" />
              </MobileCardRow>
              <MobileCardRow label={t('Dividends')}>
                <Money sar={fy.dividends} className="text-heading" />
              </MobileCardRow>
              <MobileCardRow label={t('Closing')}>
                <Money sar={fy.closingBalance} className="font-semibold text-heading" />
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
        icon="TrendingUp"
        title={t('Retained Earnings')}
        subtitle={t('Historical retained earnings by fiscal year')}
      />
      <StatRow stats={stats} />

      <Section
        title={t('Fiscal Year Breakdown')}
        subtitle={t('Opening balance, income, dividends and closing balance per year')}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2.5 text-start font-medium">{t('Fiscal Year')}</th>
                <th className="py-2.5 text-end font-medium">{t('Opening Balance')}</th>
                <th className="py-2.5 text-end font-medium">{t('Net Income')}</th>
                <th className="py-2.5 text-end font-medium">{t('Dividends')}</th>
                <th className="py-2.5 text-end font-medium">{t('Closing Balance')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_YEARS.map((fy) => (
                <tr key={fy.year} className="border-b border-border/50">
                  <td className="py-2.5 font-medium text-heading">{t('FY')} {fy.year}</td>
                  <td className="py-2.5 text-end">
                    <Money sar={fy.openingBalance} />
                  </td>
                  <td className="py-2.5 text-end">
                    <Money sar={fy.netIncome} className="text-salis-blue" />
                  </td>
                  <td className="py-2.5 text-end">
                    <Money sar={fy.dividends} />
                  </td>
                  <td className="py-2.5 text-end">
                    <Money sar={fy.closingBalance} className="font-semibold" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  )
}
