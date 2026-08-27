import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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

type SourceRow = (typeof MOCK_SOURCES)[number]
type MonthlyRow = (typeof MOCK_MONTHLY)[number]

export function SustainableEnergyMonitoring() {
  const { t } = usePreferences()
  const [period, setPeriod] = useState('month')

  const kpis = [
    { label: t('Solar Output'), value: '157 kW', icon: 'Zap', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Grid Saved'), value: '62%', icon: 'TrendingUp', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('CO2 Reduced'), value: '85 tons', icon: 'Wind', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Cost Savings'), value: 'SAR 70K', icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const sourceColumns: Column<SourceRow>[] = [
    { header: 'Source', cell: (s) => s.name },
    { header: 'Type', cell: (s) => t(s.type) },
    { header: 'Capacity', cell: (s) => s.capacity },
    { header: 'Output', cell: (s) => s.currentOutput },
    { header: 'Utilization', cell: (s) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 rounded-full bg-border">
          <div className="h-full rounded-full" style={{ width: `${s.utilization}%`, background: 'var(--salis-blue)' }} />
        </div>
        <span className="text-[12px] text-muted">{s.utilization}%</span>
      </div>
    ) },
    { header: 'Status', cell: (s) => { const [bg, fg] = STATUS_COLORS[s.status] ?? STATUS_COLORS.Offline; return <Badge background={bg} color={fg}>{t(s.status)}</Badge> } },
    { header: 'CO2 Saved', cell: (s) => s.co2Saved },
  ]

  const monthlyColumns: Column<MonthlyRow>[] = [
    { header: 'Month', cell: (m) => m.month },
    { header: 'Solar Gen', cell: (m) => m.solarGen },
    { header: 'Grid Usage', cell: (m) => m.gridUsage },
    { header: 'Savings', cell: (m) => m.savings },
    { header: 'CO2 Reduced', cell: (m) => m.co2Reduced },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Zap" title={t('Sustainable Energy Monitoring')} subtitle={t('Energy generation, consumption, and sustainability metrics')} />

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

      <h3 className="text-[15px] font-bold text-heading">{t('Energy Sources')}</h3>
      <DataTable
        caption="Energy sources and utilization"
        columns={sourceColumns}
        rows={[...MOCK_SOURCES]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_COLORS[row.status] ?? STATUS_COLORS.Offline
          return (
            <>
              <MobileCardHeader title={row.name} trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow label={t('Type')}>{t(row.type)}</MobileCardRow>
              <MobileCardRow label={t('Output')}>{row.currentOutput}</MobileCardRow>
              <MobileCardRow label={t('Utilization')}>{row.utilization}%</MobileCardRow>
            </>
          )
        }}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-heading">{t('Monthly Performance')}</h3>
        <Select value={period} onChange={e => setPeriod(e.target.value)} aria-label={t('Select period')}>
          <option value="month">{t('Last 6 Months')}</option>
          <option value="quarter">{t('This Quarter')}</option>
          <option value="year">{t('This Year')}</option>
        </Select>
      </div>
      <DataTable
        caption="Monthly energy performance"
        columns={monthlyColumns}
        rows={[...MOCK_MONTHLY]}
        rowKey={(row) => row.month}
        mobileCard={(row) => (
          <>
            <MobileCardHeader title={row.month} />
            <MobileCardRow label={t('Solar Gen')}>{row.solarGen}</MobileCardRow>
            <MobileCardRow label={t('Savings')}>{row.savings}</MobileCardRow>
            <MobileCardRow label={t('CO2 Reduced')}>{row.co2Reduced}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
