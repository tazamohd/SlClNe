import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const MOCK_SOURCES = [
  { id: 'EN-001', name: 'Solar Array A', type: 'Solar', capacity: '120 kW', currentOutput: '95 kW', utilization: 79, status: 'Active', co2Saved: '42 tons' },
  { id: 'EN-002', name: 'Solar Array B', type: 'Solar', capacity: '80 kW', currentOutput: '62 kW', utilization: 78, status: 'Active', co2Saved: '28 tons' },
  { id: 'EN-003', name: 'Battery Storage', type: 'Storage', capacity: '500 kWh', currentOutput: '340 kWh', utilization: 68, status: 'Charging', co2Saved: '—' },
  { id: 'EN-004', name: 'EV Charging Station', type: 'Consumption', capacity: '50 kW', currentOutput: '35 kW', utilization: 70, status: 'Active', co2Saved: '15 tons' },
  { id: 'EN-005', name: 'Grid Connection', type: 'Grid', capacity: '200 kW', currentOutput: '85 kW', utilization: 43, status: 'Active', co2Saved: '—' },
] as const

const MOCK_MONTHLY = [
  { month: 'Mar 2026', solarGen: '18,200 kWh', gridUsage: '12,400 kWh', savings: 'SAR 8,500', co2Reduced: '8.2 tons' },
  { month: 'Apr 2026', solarGen: '21,600 kWh', gridUsage: '10,800 kWh', savings: 'SAR 10,200', co2Reduced: '9.8 tons' },
  { month: 'May 2026', solarGen: '24,100 kWh', gridUsage: '9,200 kWh', savings: 'SAR 11,800', co2Reduced: '10.5 tons' },
  { month: 'Jun 2026', solarGen: '26,800 kWh', gridUsage: '8,500 kWh', savings: 'SAR 13,400', co2Reduced: '12.1 tons' },
  { month: 'Jul 2026', solarGen: '27,500 kWh', gridUsage: '8,100 kWh', savings: 'SAR 14,200', co2Reduced: '12.8 tons' },
  { month: 'Aug 2026', solarGen: '25,300 kWh', gridUsage: '9,800 kWh', savings: 'SAR 12,600', co2Reduced: '11.4 tons' },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Charging: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Offline: ['rgba(100,116,139,.1)', '#64748B'],
}

export function SustainableEnergyMonitoring() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [period, setPeriod] = useState('month')

  const kpis = [
    { label: t('Solar Output'), value: '157 kW', icon: 'Zap', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Grid Saved'), value: '62%', icon: 'TrendingUp', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('CO2 Reduced'), value: '85 tons', icon: 'Wind', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Cost Savings'), value: 'SAR 70K', icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Zap" title={t('Energy Monitor')} subtitle={t('Sustainability')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {MOCK_SOURCES.map(s => {
          const [bg, fg] = STATUS_COLORS[s.status] ?? STATUS_COLORS.Offline
          return (
            <MobileCard key={s.id}>
              <MobileCardHeader title={s.name} trailing={<Badge background={bg} color={fg}>{t(s.status)}</Badge>} />
              <MobileCardRow label={t('Type')}>{t(s.type)}</MobileCardRow>
              <MobileCardRow label={t('Capacity')}>{s.capacity}</MobileCardRow>
              <MobileCardRow label={t('Output')}>{s.currentOutput}</MobileCardRow>
              <MobileCardRow label={t('Utilization')}>{s.utilization}%</MobileCardRow>
              <MobileCardRow label={t('CO2 Saved')}>{s.co2Saved}</MobileCardRow>
            </MobileCard>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Zap" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Sustainable Energy Monitoring')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Energy generation, consumption, and sustainability metrics')}</p>
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
        <h3 className="mb-4 text-[15px] font-bold text-heading">{t('Energy Sources')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Source')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Type')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Capacity')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Output')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Utilization')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 text-end font-medium">{t('CO2 Saved')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SOURCES.map(s => {
                const [bg, fg] = STATUS_COLORS[s.status] ?? STATUS_COLORS.Offline
                return (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 text-[13px] text-heading">{s.name}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{t(s.type)}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-muted">{s.capacity}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{s.currentOutput}</td>
                    <td className="py-3 pe-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-border">
                          <div className="h-full rounded-full" style={{ width: `${s.utilization}%`, background: 'var(--salis-blue)' }} />
                        </div>
                        <span className="text-[12px] text-muted">{s.utilization}%</span>
                      </div>
                    </td>
                    <td className="py-3 pe-4"><Badge background={bg} color={fg}>{t(s.status)}</Badge></td>
                    <td className="py-3 text-end font-mono text-[13px] text-heading">{s.co2Saved}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-heading">{t('Monthly Performance')}</h3>
          <select value={period} onChange={e => setPeriod(e.target.value)} aria-label={t('Select period')} className="h-9 cursor-pointer rounded border border-border bg-card px-3 text-[13px] text-heading outline-none focus:border-salis-blue">
            <option value="month">{t('Last 6 Months')}</option>
            <option value="quarter">{t('This Quarter')}</option>
            <option value="year">{t('This Year')}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Month')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Solar Gen')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Grid Usage')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Savings')}</th>
                <th className="pb-3 text-end font-medium">{t('CO2 Reduced')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_MONTHLY.map(m => (
                <tr key={m.month} className="border-b border-border/50">
                  <td className="py-3 pe-4 text-[13px] text-heading">{m.month}</td>
                  <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{m.solarGen}</td>
                  <td className="py-3 pe-4 text-end font-mono text-[13px] text-muted">{m.gridUsage}</td>
                  <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{m.savings}</td>
                  <td className="py-3 text-end font-mono text-[13px] text-heading">{m.co2Reduced}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
