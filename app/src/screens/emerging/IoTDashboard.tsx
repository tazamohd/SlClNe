import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const MOCK_DEVICES = [
  { id: 'IOT-001', name: 'Bay 1 Lift Sensor', type: 'Pressure', location: 'Workshop A', status: 'Online', battery: 92, lastPing: '2 min ago', value: '4,200 PSI' },
  { id: 'IOT-002', name: 'HVAC Monitor', type: 'Temperature', location: 'Workshop A', status: 'Online', battery: 87, lastPing: '1 min ago', value: '23.5°C' },
  { id: 'IOT-003', name: 'Parts Room Humidity', type: 'Humidity', location: 'Warehouse', status: 'Online', battery: 64, lastPing: '3 min ago', value: '45% RH' },
  { id: 'IOT-004', name: 'Bay 3 Air Compressor', type: 'Pressure', location: 'Workshop B', status: 'Warning', battery: 31, lastPing: '5 min ago', value: '3,800 PSI' },
  { id: 'IOT-005', name: 'Paint Booth Temp', type: 'Temperature', location: 'Paint Shop', status: 'Online', battery: 78, lastPing: '1 min ago', value: '28.2°C' },
  { id: 'IOT-006', name: 'Generator Monitor', type: 'Power', location: 'Utility Room', status: 'Online', battery: 95, lastPing: '30 sec ago', value: '415V' },
  { id: 'IOT-007', name: 'Parking Gate Sensor', type: 'Motion', location: 'Entrance', status: 'Offline', battery: 0, lastPing: '2 hrs ago', value: '—' },
  { id: 'IOT-008', name: 'Coolant Tank Level', type: 'Level', location: 'Workshop A', status: 'Online', battery: 55, lastPing: '4 min ago', value: '72%' },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Online: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Warning: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Offline: ['rgba(100,116,139,.1)', '#64748B'],
}

type DeviceRow = (typeof MOCK_DEVICES)[number]

export function IoTDashboard() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? MOCK_DEVICES : MOCK_DEVICES.filter(d => d.status === filter)
  const online = MOCK_DEVICES.filter(d => d.status === 'Online').length
  const warnings = MOCK_DEVICES.filter(d => d.status === 'Warning').length

  const kpis = [
    { label: t('Total Devices'), value: String(MOCK_DEVICES.length), icon: 'Radio', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Online'), value: String(online), icon: 'Activity', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Warnings'), value: String(warnings), icon: 'CircleDot', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Avg Battery'), value: `${Math.round(MOCK_DEVICES.filter(d => d.battery > 0).reduce((a, d) => a + d.battery, 0) / MOCK_DEVICES.filter(d => d.battery > 0).length)}%`, icon: 'Battery', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<DeviceRow>[] = [
    { header: 'Device', cell: (d) => d.name },
    { header: 'Type', cell: (d) => t(d.type) },
    { header: 'Location', cell: (d) => d.location },
    { header: 'Status', cell: (d) => { const [bg, fg] = STATUS_COLORS[d.status] ?? STATUS_COLORS.Offline; return <Badge background={bg} color={fg}>{t(d.status)}</Badge> } },
    { header: 'Value', cell: (d) => d.value },
    { header: 'Battery', cell: (d) => d.battery > 0 ? `${d.battery}%` : '—' },
    { header: 'Last Ping', cell: (d) => d.lastPing },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Radio" title={t('IoT Dashboard')} subtitle={t('IoT device monitoring and telemetry')} />

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

      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-heading">{t('Connected Devices')}</h3>
        <Select value={filter} onChange={e => setFilter(e.target.value)} aria-label={t('Filter by status')}>
          <option value="All">{t('All')}</option>
          <option value="Online">{t('Online')}</option>
          <option value="Warning">{t('Warning')}</option>
          <option value="Offline">{t('Offline')}</option>
        </Select>
      </div>
      <DataTable
        caption="IoT connected devices"
        columns={columns}
        rows={[...filtered]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_COLORS[row.status] ?? STATUS_COLORS.Offline
          return (
            <>
              <MobileCardHeader title={row.name} trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow label={t('Type')}>{t(row.type)}</MobileCardRow>
              <MobileCardRow label={t('Location')}>{row.location}</MobileCardRow>
              <MobileCardRow label={t('Value')}>{row.value}</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
