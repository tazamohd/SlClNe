import { useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const MOCK_SERVICES = [
  { id: 'SRV-01', name: 'Engine Repair', revenue: 485000, cost: 312000, profit: 173000, margin: 35.7, orders: 245, trend: 'up' },
  { id: 'SRV-02', name: 'Oil Change', revenue: 128000, cost: 52000, profit: 76000, margin: 59.4, orders: 890, trend: 'up' },
  { id: 'SRV-03', name: 'Brake Service', revenue: 215000, cost: 142000, profit: 73000, margin: 34.0, orders: 312, trend: 'down' },
  { id: 'SRV-04', name: 'AC Repair', revenue: 198000, cost: 118000, profit: 80000, margin: 40.4, orders: 178, trend: 'up' },
  { id: 'SRV-05', name: 'Body Work', revenue: 342000, cost: 245000, profit: 97000, margin: 28.4, orders: 95, trend: 'down' },
  { id: 'SRV-06', name: 'Transmission', revenue: 267000, cost: 189000, profit: 78000, margin: 29.2, orders: 67, trend: 'up' },
] as const

const MOCK_PERIODS = [
  { month: 'Mar 2026', revenue: 'SAR 1.82M', profit: 'SAR 612K', margin: '33.6%' },
  { month: 'Apr 2026', revenue: 'SAR 1.95M', profit: 'SAR 658K', margin: '33.7%' },
  { month: 'May 2026', revenue: 'SAR 2.08M', profit: 'SAR 724K', margin: '34.8%' },
  { month: 'Jun 2026', revenue: 'SAR 2.21M', profit: 'SAR 789K', margin: '35.7%' },
  { month: 'Jul 2026', revenue: 'SAR 2.35M', profit: 'SAR 856K', margin: '36.4%' },
  { month: 'Aug 2026', revenue: 'SAR 2.41M', profit: 'SAR 877K', margin: '36.4%' },
] as const

type ServiceRow = (typeof MOCK_SERVICES)[number]
type PeriodRow = (typeof MOCK_PERIODS)[number]

export function ProfitAnalysis() {
  const { t } = usePreferences()
  const [period, setPeriod] = useState('month')

  const totalRevenue = MOCK_SERVICES.reduce((a, s) => a + s.revenue, 0)
  const totalProfit = MOCK_SERVICES.reduce((a, s) => a + s.profit, 0)
  const avgMargin = (totalProfit / totalRevenue * 100).toFixed(1)

  const kpis = [
    { label: t('Total Revenue'), value: `SAR ${(totalRevenue / 1000).toFixed(0)}K`, icon: 'DollarSign', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Total Profit'), value: `SAR ${(totalProfit / 1000).toFixed(0)}K`, icon: 'TrendingUp', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Avg Margin'), value: `${avgMargin}%`, icon: 'Percent', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Services'), value: String(MOCK_SERVICES.length), icon: 'Wrench', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const serviceColumns: Column<ServiceRow>[] = [
    { header: 'Service', cell: (s) => t(s.name) },
    { header: 'Revenue', cell: (s) => `SAR ${(s.revenue / 1000).toFixed(0)}K` },
    { header: 'Cost', cell: (s) => `SAR ${(s.cost / 1000).toFixed(0)}K` },
    { header: 'Profit', cell: (s) => `SAR ${(s.profit / 1000).toFixed(0)}K` },
    { header: 'Margin', cell: (s) => `${s.margin}%` },
    { header: 'Orders', cell: (s) => `${s.orders}` },
    { header: 'Trend', cell: (s) => <Badge background={s.trend === 'up' ? 'var(--tint-blue)' : 'var(--tint-orange)'} color={s.trend === 'up' ? 'var(--salis-blue)' : 'var(--salis-orange)'}>{s.trend === 'up' ? t('Up') : t('Down')}</Badge> },
  ]

  const periodColumns: Column<PeriodRow>[] = [
    { header: 'Month', cell: (p) => p.month },
    { header: 'Revenue', cell: (p) => p.revenue },
    { header: 'Profit', cell: (p) => p.profit },
    { header: 'Margin', cell: (p) => p.margin },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="DollarSign" title={t('Profit Analysis')} subtitle={t('Profit breakdown by service and period')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-heading">{t('Profit by Service')}</h2>
        <Select value={period} onChange={e => setPeriod(e.target.value)} aria-label={t('Select period')}>
          <option value="month">{t('This Month')}</option>
          <option value="quarter">{t('This Quarter')}</option>
          <option value="year">{t('This Year')}</option>
        </Select>
      </div>
      <DataTable
        caption="Profit by service"
        columns={serviceColumns}
        rows={[...MOCK_SERVICES]}
        rowKey={(row) => row.id}
        mobileCard={(row) => (
          <>
            <MobileCardHeader title={t(row.name)} trailing={<Badge background={row.trend === 'up' ? 'var(--tint-blue)' : 'var(--tint-orange)'} color={row.trend === 'up' ? 'var(--salis-blue)' : 'var(--salis-orange)'}>{row.trend === 'up' ? t('Up') : t('Down')}</Badge>} />
            <MobileCardRow label={t('Revenue')}>{`SAR ${(row.revenue / 1000).toFixed(0)}K`}</MobileCardRow>
            <MobileCardRow label={t('Profit')}>{`SAR ${(row.profit / 1000).toFixed(0)}K`}</MobileCardRow>
            <MobileCardRow label={t('Margin')}>{row.margin}%</MobileCardRow>
          </>
        )}
      />

      <h2 className="text-[15px] font-bold text-heading">{t('Monthly Trend')}</h2>
      <DataTable
        caption="Monthly profit trend"
        columns={periodColumns}
        rows={[...MOCK_PERIODS]}
        rowKey={(row) => row.month}
        mobileCard={(row) => (
          <>
            <MobileCardHeader title={row.month} />
            <MobileCardRow label={t('Revenue')}>{row.revenue}</MobileCardRow>
            <MobileCardRow label={t('Profit')}>{row.profit}</MobileCardRow>
            <MobileCardRow label={t('Margin')}>{row.margin}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
