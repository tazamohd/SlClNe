import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const MOCK_NODES = [
  { id: 'EDG-001', name: 'Workshop A Gateway', location: 'Main Workshop', cpuUsage: 45, memoryUsage: 62, status: 'Online', uptime: '45d 12h', latency: '2.3ms', tasks: 128 },
  { id: 'EDG-002', name: 'Workshop B Gateway', location: 'North Workshop', cpuUsage: 38, memoryUsage: 55, status: 'Online', uptime: '30d 8h', latency: '3.1ms', tasks: 94 },
  { id: 'EDG-003', name: 'Paint Shop Node', location: 'Paint Department', cpuUsage: 72, memoryUsage: 81, status: 'Warning', uptime: '15d 3h', latency: '4.8ms', tasks: 67 },
  { id: 'EDG-004', name: 'Warehouse Node', location: 'Parts Warehouse', cpuUsage: 28, memoryUsage: 41, status: 'Online', uptime: '60d 1h', latency: '1.9ms', tasks: 45 },
  { id: 'EDG-005', name: 'Customer Kiosk', location: 'Reception', cpuUsage: 15, memoryUsage: 32, status: 'Online', uptime: '22d 6h', latency: '5.2ms', tasks: 23 },
  { id: 'EDG-006', name: 'Fleet Tracker Hub', location: 'Server Room', cpuUsage: 56, memoryUsage: 68, status: 'Online', uptime: '90d 14h', latency: '1.2ms', tasks: 312 },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Online: ['var(--tint-blue)', 'var(--salis-blue)'],
  Warning: ['var(--tint-orange)', 'var(--salis-orange)'],
  Offline: ['var(--tint-neutral)', 'var(--text-muted)'],
}

type NodeRow = (typeof MOCK_NODES)[number]

export function EdgeComputing() {
  const { t } = usePreferences()

  const online = MOCK_NODES.filter(n => n.status === 'Online').length
  const avgCpu = Math.round(MOCK_NODES.reduce((a, n) => a + n.cpuUsage, 0) / MOCK_NODES.length)
  const totalTasks = MOCK_NODES.reduce((a, n) => a + n.tasks, 0)

  const kpis = [
    { label: t('Edge Nodes'), value: String(MOCK_NODES.length), icon: 'Cpu', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Online'), value: String(online), icon: 'Activity', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Avg CPU'), value: `${avgCpu}%`, icon: 'Gauge', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Active Tasks'), value: String(totalTasks), icon: 'Zap', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<NodeRow>[] = [
    { header: 'Node', cell: (n) => n.name },
    { header: 'Location', cell: (n) => n.location },
    { header: 'Status', cell: (n) => { const [bg, fg] = STATUS_COLORS[n.status] ?? STATUS_COLORS.Offline; return <Badge background={bg} color={fg}>{t(n.status)}</Badge> } },
    { header: 'CPU', cell: (n) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 rounded-full bg-border">
          <div className="h-full rounded-full" style={{ width: `${n.cpuUsage}%`, background: n.cpuUsage > 70 ? 'var(--salis-orange)' : 'var(--salis-blue)' }} />
        </div>
        <span className="text-[12px] text-muted">{n.cpuUsage}%</span>
      </div>
    ) },
    { header: 'Memory', cell: (n) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 rounded-full bg-border">
          <div className="h-full rounded-full" style={{ width: `${n.memoryUsage}%`, background: n.memoryUsage > 75 ? 'var(--salis-orange)' : 'var(--salis-blue)' }} />
        </div>
        <span className="text-[12px] text-muted">{n.memoryUsage}%</span>
      </div>
    ) },
    { header: 'Latency', cell: (n) => n.latency },
    { header: 'Tasks', cell: (n) => `${n.tasks}` },
    { header: 'Uptime', cell: (n) => n.uptime },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Cpu" title={t('Edge Computing')} subtitle={t('Edge computing node status and performance')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <h2 className="text-[15px] font-bold text-heading">{t('Edge Nodes')}</h2>
      <DataTable
        caption="Edge computing nodes"
        columns={columns}
        rows={[...MOCK_NODES]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_COLORS[row.status] ?? STATUS_COLORS.Offline
          return (
            <>
              <MobileCardHeader title={row.name} trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow label={t('Location')}>{row.location}</MobileCardRow>
              <MobileCardRow label={t('CPU')}>{row.cpuUsage}%</MobileCardRow>
              <MobileCardRow label={t('Memory')}>{row.memoryUsage}%</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
