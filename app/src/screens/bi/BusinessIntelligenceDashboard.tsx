import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const MOCK_WIDGETS = [
  { id: 'W-01', name: 'Revenue Trend', type: 'Line Chart', source: 'Sales DB', refreshRate: '5 min', status: 'Live' },
  { id: 'W-02', name: 'Service Distribution', type: 'Pie Chart', source: 'Workshop DB', refreshRate: '15 min', status: 'Live' },
  { id: 'W-03', name: 'Customer Segments', type: 'Bar Chart', source: 'CRM DB', refreshRate: '30 min', status: 'Live' },
  { id: 'W-04', name: 'Inventory Levels', type: 'Gauge', source: 'Inventory DB', refreshRate: '10 min', status: 'Live' },
  { id: 'W-05', name: 'Cost Breakdown', type: 'Treemap', source: 'Finance DB', refreshRate: '1 hr', status: 'Paused' },
  { id: 'W-06', name: 'Regional Performance', type: 'Heatmap', source: 'Multi-source', refreshRate: '30 min', status: 'Live' },
] as const

const MOCK_METRICS = [
  { label: 'Monthly Revenue', value: 'SAR 2.4M', change: '+12.3%', trend: 'up' },
  { label: 'Avg Ticket Size', value: 'SAR 1,850', change: '+5.7%', trend: 'up' },
  { label: 'Customer Retention', value: '87%', change: '-2.1%', trend: 'down' },
  { label: 'Service Efficiency', value: '94%', change: '+3.4%', trend: 'up' },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Live: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Paused: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
}

export function BusinessIntelligenceDashboard() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [period, setPeriod] = useState('month')

  const kpis = [
    { label: t('Widgets'), value: String(MOCK_WIDGETS.length), icon: 'LayoutGrid', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Live'), value: String(MOCK_WIDGETS.filter(w => w.status === 'Live').length), icon: 'Activity', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Data Sources'), value: '5', icon: 'Database', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Refresh Rate'), value: t('5–60 min'), icon: 'RefreshCw', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="LayoutDashboard" title={t('BI Dashboard')} subtitle={t('Interactive Analytics')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {MOCK_METRICS.map(m => (
          <MobileCard key={m.label}>
            <MobileCardHeader title={t(m.label)} trailing={<Badge background={m.trend === 'up' ? 'rgba(10,94,215,.1)' : 'rgba(249,115,22,.1)'} color={m.trend === 'up' ? 'var(--salis-blue)' : 'var(--salis-orange)'}>{m.change}</Badge>} />
            <MobileCardRow label={t('Value')}>{m.value}</MobileCardRow>
          </MobileCard>
        ))}
        {MOCK_WIDGETS.map(w => {
          const [bg, fg] = STATUS_COLORS[w.status] ?? STATUS_COLORS.Paused
          return (
            <MobileCard key={w.id}>
              <MobileCardHeader title={t(w.name)} trailing={<Badge background={bg} color={fg}>{t(w.status)}</Badge>} />
              <MobileCardRow label={t('Type')}>{t(w.type)}</MobileCardRow>
              <MobileCardRow label={t('Source')}>{w.source}</MobileCardRow>
              <MobileCardRow label={t('Refresh')}>{w.refreshRate}</MobileCardRow>
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
            <Icon name="LayoutDashboard" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('BI Dashboard')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Interactive business intelligence dashboard')}</p>
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
          <h3 className="text-[15px] font-bold text-heading">{t('Key Metrics')}</h3>
          <Select value={period} onChange={e => setPeriod(e.target.value)} aria-label={t('Select period')}>
            <option value="week">{t('This Week')}</option>
            <option value="month">{t('This Month')}</option>
            <option value="quarter">{t('This Quarter')}</option>
          </Select>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {MOCK_METRICS.map(m => (
            <div key={m.label} className="rounded-xl border border-border p-4">
              <p className="text-xs font-medium text-muted">{t(m.label)}</p>
              <p className="mt-1 font-display text-xl font-black text-heading">{m.value}</p>
              <Badge background={m.trend === 'up' ? 'rgba(10,94,215,.1)' : 'rgba(249,115,22,.1)'} color={m.trend === 'up' ? 'var(--salis-blue)' : 'var(--salis-orange)'}>{m.change}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h3 className="mb-4 text-[15px] font-bold text-heading">{t('Dashboard Widgets')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('ID')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Widget')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Type')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Source')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Refresh')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_WIDGETS.map(w => {
                const [bg, fg] = STATUS_COLORS[w.status] ?? STATUS_COLORS.Paused
                return (
                  <tr key={w.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 font-mono text-[13px] text-heading" dir="ltr">{w.id}</td>
                    <td className="py-3 pe-4 text-[13px] text-heading">{t(w.name)}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{t(w.type)}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{w.source}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{w.refreshRate}</td>
                    <td className="py-3"><Badge background={bg} color={fg}>{t(w.status)}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
