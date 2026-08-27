import { useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const MOCK_TWINS = [
  { id: 'DT-001', name: 'Workshop A Layout', type: 'Facility', syncStatus: 'Synced', lastSync: '2 min ago', sensors: 24, alerts: 0, status: 'Active' },
  { id: 'DT-002', name: 'Hydraulic Lift Bay 1', type: 'Equipment', syncStatus: 'Synced', lastSync: '1 min ago', sensors: 8, alerts: 0, status: 'Active' },
  { id: 'DT-003', name: 'Paint Booth System', type: 'Equipment', syncStatus: 'Delayed', lastSync: '15 min ago', sensors: 12, alerts: 2, status: 'Warning' },
  { id: 'DT-004', name: 'Parts Warehouse', type: 'Facility', syncStatus: 'Synced', lastSync: '5 min ago', sensors: 18, alerts: 0, status: 'Active' },
  { id: 'DT-005', name: 'HVAC System', type: 'Infrastructure', syncStatus: 'Synced', lastSync: '30 sec ago', sensors: 6, alerts: 1, status: 'Warning' },
  { id: 'DT-006', name: 'Customer Flow Model', type: 'Process', syncStatus: 'Synced', lastSync: '3 min ago', sensors: 4, alerts: 0, status: 'Active' },
] as const

const MOCK_METRICS = [
  { metric: 'Workshop Utilization', real: '78%', simulated: '82%', variance: '+4%' },
  { metric: 'Energy Consumption', real: '245 kWh', simulated: '238 kWh', variance: '-2.9%' },
  { metric: 'Throughput', real: '42 jobs/day', simulated: '45 jobs/day', variance: '+7.1%' },
  { metric: 'Queue Time', real: '28 min', simulated: '22 min', variance: '-21.4%' },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Warning: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Offline: ['rgba(100,116,139,.1)', '#64748B'],
}

type TwinRow = (typeof MOCK_TWINS)[number]
type MetricRow = (typeof MOCK_METRICS)[number]

export function DigitalTwinViewer() {
  const { t } = usePreferences()
  const [view, setView] = useState('overview')

  const totalSensors = MOCK_TWINS.reduce((a, tw) => a + tw.sensors, 0)
  const totalAlerts = MOCK_TWINS.reduce((a, tw) => a + tw.alerts, 0)

  const kpis = [
    { label: t('Digital Twins'), value: String(MOCK_TWINS.length), icon: 'Layers', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Sensors'), value: String(totalSensors), icon: 'Radio', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Alerts'), value: String(totalAlerts), icon: 'Bell', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Sync Rate'), value: '99.2%', icon: 'RefreshCw', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const metricColumns: Column<MetricRow>[] = [
    { header: 'Metric', cell: (m) => t(m.metric) },
    { header: 'Real', cell: (m) => m.real },
    { header: 'Simulated', cell: (m) => m.simulated },
    { header: 'Variance', cell: (m) => m.variance },
  ]

  const twinColumns: Column<TwinRow>[] = [
    { header: 'Name', cell: (tw) => tw.name },
    { header: 'Type', cell: (tw) => t(tw.type) },
    { header: 'Status', cell: (tw) => { const [bg, fg] = STATUS_COLORS[tw.status] ?? STATUS_COLORS.Offline; return <Badge background={bg} color={fg}>{t(tw.status)}</Badge> } },
    { header: 'Sync', cell: (tw) => t(tw.syncStatus) },
    { header: 'Sensors', cell: (tw) => `${tw.sensors}` },
    { header: 'Alerts', cell: (tw) => `${tw.alerts}` },
    { header: 'Last Sync', cell: (tw) => tw.lastSync },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Layers" title={t('Digital Twin Viewer')} subtitle={t('Digital twin visualization and simulation')} />

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <h3 className="text-[15px] font-bold text-heading">{t('Real vs Simulated')}</h3>
      <DataTable
        caption="Real vs simulated metrics"
        columns={metricColumns}
        rows={[...MOCK_METRICS]}
        rowKey={(row) => row.metric}
        mobileCard={(row) => (
          <>
            <MobileCardHeader title={t(row.metric)} />
            <MobileCardRow label={t('Real')}>{row.real}</MobileCardRow>
            <MobileCardRow label={t('Simulated')}>{row.simulated}</MobileCardRow>
            <MobileCardRow label={t('Variance')}>{row.variance}</MobileCardRow>
          </>
        )}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-heading">{t('Twin Models')}</h3>
        <Select value={view} onChange={e => setView(e.target.value)} aria-label={t('Select view')}>
          <option value="overview">{t('Overview')}</option>
          <option value="facility">{t('Facility')}</option>
          <option value="equipment">{t('Equipment')}</option>
        </Select>
      </div>
      <DataTable
        caption="Digital twin models"
        columns={twinColumns}
        rows={[...MOCK_TWINS]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_COLORS[row.status] ?? STATUS_COLORS.Offline
          return (
            <>
              <MobileCardHeader title={row.name} trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow label={t('Type')}>{t(row.type)}</MobileCardRow>
              <MobileCardRow label={t('Sensors')}>{row.sensors}</MobileCardRow>
              <MobileCardRow label={t('Last Sync')}>{row.lastSync}</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
