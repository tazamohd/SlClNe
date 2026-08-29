import { useMemo } from 'react'
import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Money, formatSar } from '@/components/ui/Money'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCardHeader,
  MobileCardRow,
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

  const current = MOCK_YEARS[MOCK_YEARS.length - 1]

  const stats: Stat[] = useMemo(() => [
    { label: 'Current Retained Earnings', value: formatSar(current.closingBalance), caption: `FY ${current.year}`, highlight: true },
    { label: 'YTD Net Income', value: formatSar(current.netIncome), caption: 'Year-to-date', tone: 'info' as const },
    { label: 'Total Dividends Paid', value: formatSar(MOCK_YEARS.reduce((s, y) => s + y.dividends, 0)), caption: 'All periods' },
    { label: 'Growth', value: `${Math.round(((current.closingBalance - MOCK_YEARS[0].openingBalance) / MOCK_YEARS[0].openingBalance) * 100)}%`, caption: 'Since FY 2023' },
  ], [current])

  const columns: Column<FiscalYear>[] = [
    { header: 'Fiscal Year', cell: (fy) => <span className="font-medium text-heading">{t('FY')} {fy.year}</span> },
    { header: 'Opening Balance', cell: (fy) => <Money sar={fy.openingBalance} />, className: 'text-end' },
    { header: 'Net Income', cell: (fy) => <Money sar={fy.netIncome} className="text-salis-blue" />, className: 'text-end' },
    { header: 'Dividends', cell: (fy) => <Money sar={fy.dividends} />, className: 'text-end' },
    { header: 'Closing Balance', cell: (fy) => <Money sar={fy.closingBalance} className="font-semibold" />, className: 'text-end' },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="TrendingUp"
        title={t('Retained Earnings')}
        subtitle={t('Historical retained earnings by fiscal year')}
      />
      <StatRow stats={stats} />

      <DataTable
        caption="Fiscal year breakdown"
        columns={columns}
        rows={MOCK_YEARS as FiscalYear[]}
        rowKey={(fy) => fy.year}
        mobileCard={(fy) => (
          <>
            <MobileCardHeader title={`${t('FY')} ${fy.year}`} />
            <MobileCardRow label={t('Net Income')}><Money sar={fy.netIncome} className="font-semibold text-salis-blue" /></MobileCardRow>
            <MobileCardRow label={t('Closing')}><Money sar={fy.closingBalance} className="font-semibold text-heading" /></MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="TrendingUp" title={t('No fiscal year data found')} />}
      />
    </div>
  )
}
