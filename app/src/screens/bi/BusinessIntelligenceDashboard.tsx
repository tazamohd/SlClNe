import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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

type WidgetRow = (typeof MOCK_WIDGETS)[number]

export function BusinessIntelligenceDashboard() {
  const { t } = usePreferences()
  const [period, setPeriod] = useState('month')

  const kpis = [
    { label: t('Widgets'), value: String(MOCK_WIDGETS.length), icon: 'LayoutGrid', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Live'), value: String(MOCK_WIDGETS.filter(w => w.status === 'Live').length), icon: 'Activity', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Data Sources'), value: '5', icon: 'Database', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Refresh Rate'), value: t('5–60 min'), icon: 'RefreshCw', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<WidgetRow>[] = [
    { header: 'ID', cell: (w) => w.id, code: true },
    { header: 'Widget', cell: (w) => t(w.name) },
    { header: 'Type', cell: (w) => t(w.type) },
    { header: 'Source', cell: (w) => w.source },
    { header: 'Refresh', cell: (w) => w.refreshRate },
    { header: 'Status', cell: (w) => { const [bg, fg] = STATUS_COLORS[w.status] ?? STATUS_COLORS.Paused; return <Badge background={bg} color={fg}>{t(w.status)}</Badge> } },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="LayoutDashboard" title={t('BI Dashboard')} subtitle={t('Interactive business intelligence dashboard')} />

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} />
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

      <h3 className="text-[15px] font-bold text-heading">{t('Dashboard Widgets')}</h3>
      <DataTable
        caption="Dashboard widgets"
        columns={columns}
        rows={[...MOCK_WIDGETS]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_COLORS[row.status] ?? STATUS_COLORS.Paused
          return (
            <>
              <MobileCardHeader title={t(row.name)} trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow label={t('Type')}>{t(row.type)}</MobileCardRow>
              <MobileCardRow label={t('Source')}>{row.source}</MobileCardRow>
              <MobileCardRow label={t('Refresh')}>{row.refreshRate}</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
