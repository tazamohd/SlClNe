import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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

export function DigitalTwinViewer() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [view, setView] = useState('overview')

  const totalSensors = MOCK_TWINS.reduce((a, tw) => a + tw.sensors, 0)
  const totalAlerts = MOCK_TWINS.reduce((a, tw) => a + tw.alerts, 0)

  const kpis = [
    { label: t('Digital Twins'), value: String(MOCK_TWINS.length), icon: 'Layers', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Sensors'), value: String(totalSensors), icon: 'Radio', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Alerts'), value: String(totalAlerts), icon: 'Bell', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Sync Rate'), value: '99.2%', icon: 'RefreshCw', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Layers" title={t('Digital Twin')} subtitle={t('Virtual Models')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {MOCK_TWINS.map(tw => {
          const [bg, fg] = STATUS_COLORS[tw.status] ?? STATUS_COLORS.Offline
          return (
            <MobileCard key={tw.id}>
              <MobileCardHeader title={tw.name} trailing={<Badge background={bg} color={fg}>{t(tw.status)}</Badge>} />
              <MobileCardRow label={t('Type')}>{t(tw.type)}</MobileCardRow>
              <MobileCardRow label={t('Sync')}>{t(tw.syncStatus)}</MobileCardRow>
              <MobileCardRow label={t('Sensors')}>{tw.sensors}</MobileCardRow>
              <MobileCardRow label={t('Alerts')}>{tw.alerts}</MobileCardRow>
              <MobileCardRow label={t('Last Sync')}>{tw.lastSync}</MobileCardRow>
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
            <Icon name="Layers" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Digital Twin Viewer')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Digital twin visualization and simulation')}</p>
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
        <h3 className="mb-4 text-[15px] font-bold text-heading">{t('Real vs Simulated')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Metric')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Real')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Simulated')}</th>
                <th className="pb-3 text-end font-medium">{t('Variance')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_METRICS.map(m => (
                <tr key={m.metric} className="border-b border-border/50">
                  <td className="py-3 pe-4 text-[13px] text-heading">{t(m.metric)}</td>
                  <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{m.real}</td>
                  <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{m.simulated}</td>
                  <td className="py-3 text-end font-mono text-[13px] text-heading">{m.variance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-heading">{t('Twin Models')}</h3>
          <select value={view} onChange={e => setView(e.target.value)} aria-label={t('Select view')} className="h-9 cursor-pointer rounded border border-border bg-card px-3 text-[13px] text-heading outline-none focus:border-salis-blue">
            <option value="overview">{t('Overview')}</option>
            <option value="facility">{t('Facility')}</option>
            <option value="equipment">{t('Equipment')}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Name')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Type')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Sync')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Sensors')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Alerts')}</th>
                <th className="pb-3 text-start font-medium">{t('Last Sync')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TWINS.map(tw => {
                const [bg, fg] = STATUS_COLORS[tw.status] ?? STATUS_COLORS.Offline
                return (
                  <tr key={tw.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 text-[13px] text-heading">{tw.name}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{t(tw.type)}</td>
                    <td className="py-3 pe-4"><Badge background={bg} color={fg}>{t(tw.status)}</Badge></td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{t(tw.syncStatus)}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{tw.sensors}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{tw.alerts}</td>
                    <td className="py-3 text-[13px] text-muted">{tw.lastSync}</td>
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
