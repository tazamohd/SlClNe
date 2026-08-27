import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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

export function ProfitAnalysis() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [period, setPeriod] = useState('month')

  const totalRevenue = MOCK_SERVICES.reduce((a, s) => a + s.revenue, 0)
  const totalProfit = MOCK_SERVICES.reduce((a, s) => a + s.profit, 0)
  const avgMargin = (totalProfit / totalRevenue * 100).toFixed(1)

  const kpis = [
    { label: t('Total Revenue'), value: `SAR ${(totalRevenue / 1000).toFixed(0)}K`, icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Profit'), value: `SAR ${(totalProfit / 1000).toFixed(0)}K`, icon: 'TrendingUp', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Avg Margin'), value: `${avgMargin}%`, icon: 'Percent', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Services'), value: String(MOCK_SERVICES.length), icon: 'Wrench', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="DollarSign" title={t('Profit Analysis')} subtitle={t('Business Intelligence')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {MOCK_SERVICES.map(s => (
          <MobileCard key={s.id}>
            <MobileCardHeader title={t(s.name)} trailing={<Badge background={s.trend === 'up' ? 'rgba(10,94,215,.1)' : 'rgba(249,115,22,.1)'} color={s.trend === 'up' ? 'var(--salis-blue)' : 'var(--salis-orange)'}>{s.trend === 'up' ? t('Up') : t('Down')}</Badge>} />
            <MobileCardRow label={t('Revenue')}>{`SAR ${(s.revenue / 1000).toFixed(0)}K`}</MobileCardRow>
            <MobileCardRow label={t('Profit')}>{`SAR ${(s.profit / 1000).toFixed(0)}K`}</MobileCardRow>
            <MobileCardRow label={t('Margin')}>{s.margin}%</MobileCardRow>
            <MobileCardRow label={t('Orders')}>{s.orders}</MobileCardRow>
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="DollarSign" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Profit Analysis')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Profit breakdown by service and period')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-heading">{t('Profit by Service')}</h3>
          <Select value={period} onChange={e => setPeriod(e.target.value)} aria-label={t('Select period')}>
            <option value="month">{t('This Month')}</option>
            <option value="quarter">{t('This Quarter')}</option>
            <option value="year">{t('This Year')}</option>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Service')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Revenue')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Cost')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Profit')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Margin')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Orders')}</th>
                <th className="pb-3 text-start font-medium">{t('Trend')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SERVICES.map(s => (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 text-[13px] text-heading">{t(s.name)}</td>
                  <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{`SAR ${(s.revenue / 1000).toFixed(0)}K`}</td>
                  <td className="py-3 pe-4 text-end font-mono text-[13px] text-muted">{`SAR ${(s.cost / 1000).toFixed(0)}K`}</td>
                  <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{`SAR ${(s.profit / 1000).toFixed(0)}K`}</td>
                  <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{s.margin}%</td>
                  <td className="py-3 pe-4 text-end font-mono text-[13px] text-muted">{s.orders}</td>
                  <td className="py-3">
                    <Badge background={s.trend === 'up' ? 'rgba(10,94,215,.1)' : 'rgba(249,115,22,.1)'} color={s.trend === 'up' ? 'var(--salis-blue)' : 'var(--salis-orange)'}>{s.trend === 'up' ? t('Up') : t('Down')}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h3 className="mb-4 text-[15px] font-bold text-heading">{t('Monthly Trend')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Month')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Revenue')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Profit')}</th>
                <th className="pb-3 text-end font-medium">{t('Margin')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PERIODS.map(p => (
                <tr key={p.month} className="border-b border-border/50">
                  <td className="py-3 pe-4 text-[13px] text-heading">{p.month}</td>
                  <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{p.revenue}</td>
                  <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{p.profit}</td>
                  <td className="py-3 text-end font-mono text-[13px] text-heading">{p.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
