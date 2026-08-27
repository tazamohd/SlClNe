import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'

const MOCK_NODES = [
  { id: 'EDG-001', name: 'Workshop A Gateway', location: 'Main Workshop', cpuUsage: 45, memoryUsage: 62, status: 'Online', uptime: '45d 12h', latency: '2.3ms', tasks: 128 },
  { id: 'EDG-002', name: 'Workshop B Gateway', location: 'North Workshop', cpuUsage: 38, memoryUsage: 55, status: 'Online', uptime: '30d 8h', latency: '3.1ms', tasks: 94 },
  { id: 'EDG-003', name: 'Paint Shop Node', location: 'Paint Department', cpuUsage: 72, memoryUsage: 81, status: 'Warning', uptime: '15d 3h', latency: '4.8ms', tasks: 67 },
  { id: 'EDG-004', name: 'Warehouse Node', location: 'Parts Warehouse', cpuUsage: 28, memoryUsage: 41, status: 'Online', uptime: '60d 1h', latency: '1.9ms', tasks: 45 },
  { id: 'EDG-005', name: 'Customer Kiosk', location: 'Reception', cpuUsage: 15, memoryUsage: 32, status: 'Online', uptime: '22d 6h', latency: '5.2ms', tasks: 23 },
  { id: 'EDG-006', name: 'Fleet Tracker Hub', location: 'Server Room', cpuUsage: 56, memoryUsage: 68, status: 'Online', uptime: '90d 14h', latency: '1.2ms', tasks: 312 },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Online: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Warning: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Offline: ['rgba(100,116,139,.1)', '#64748B'],
}

type NodeRow = (typeof MOCK_NODES)[number]

export function EdgeComputing() {
  const { t } = usePreferences()

  const online = MOCK_NODES.filter(n => n.status === 'Online').length
  const avgCpu = Math.round(MOCK_NODES.reduce((a, n) => a + n.cpuUsage, 0) / MOCK_NODES.length)
  const totalTasks = MOCK_NODES.reduce((a, n) => a + n.tasks, 0)

  const kpis = [
    { label: t('Edge Nodes'), value: String(MOCK_NODES.length), icon: 'Cpu', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Online'), value: String(online), icon: 'Activity', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Avg CPU'), value: `${avgCpu}%`, icon: 'Gauge', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Active Tasks'), value: String(totalTasks), icon: 'Zap', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
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
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Cpu" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Edge Computing')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Edge computing node status and performance')}</p>
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

      <h3 className="text-[15px] font-bold text-heading">{t('Edge Nodes')}</h3>
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
