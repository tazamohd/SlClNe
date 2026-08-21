import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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

export function EdgeComputing() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const online = MOCK_NODES.filter(n => n.status === 'Online').length
  const avgCpu = Math.round(MOCK_NODES.reduce((a, n) => a + n.cpuUsage, 0) / MOCK_NODES.length)
  const totalTasks = MOCK_NODES.reduce((a, n) => a + n.tasks, 0)

  const kpis = [
    { label: t('Edge Nodes'), value: String(MOCK_NODES.length), icon: 'Cpu', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Online'), value: String(online), icon: 'Activity', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Avg CPU'), value: `${avgCpu}%`, icon: 'Gauge', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Active Tasks'), value: String(totalTasks), icon: 'Zap', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Cpu" title={t('Edge Computing')} subtitle={t('Node Status')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {MOCK_NODES.map(n => {
          const [bg, fg] = STATUS_COLORS[n.status] ?? STATUS_COLORS.Offline
          return (
            <MobileCard key={n.id}>
              <MobileCardHeader title={n.name} trailing={<Badge background={bg} color={fg}>{t(n.status)}</Badge>} />
              <MobileCardRow label={t('Location')}>{n.location}</MobileCardRow>
              <MobileCardRow label={t('CPU')}>{n.cpuUsage}%</MobileCardRow>
              <MobileCardRow label={t('Memory')}>{n.memoryUsage}%</MobileCardRow>
              <MobileCardRow label={t('Latency')}>{n.latency}</MobileCardRow>
              <MobileCardRow label={t('Uptime')}>{n.uptime}</MobileCardRow>
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

      <Card className="rounded-2xl p-6 shadow-sm">
        <h3 className="mb-4 text-[15px] font-bold text-heading">{t('Edge Nodes')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Node')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Location')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('CPU')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Memory')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Latency')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Tasks')}</th>
                <th className="pb-3 text-start font-medium">{t('Uptime')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_NODES.map(n => {
                const [bg, fg] = STATUS_COLORS[n.status] ?? STATUS_COLORS.Offline
                return (
                  <tr key={n.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 text-[13px] text-heading">{n.name}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{n.location}</td>
                    <td className="py-3 pe-4"><Badge background={bg} color={fg}>{t(n.status)}</Badge></td>
                    <td className="py-3 pe-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-border">
                          <div className="h-full rounded-full" style={{ width: `${n.cpuUsage}%`, background: n.cpuUsage > 70 ? 'var(--salis-orange)' : 'var(--salis-blue)' }} />
                        </div>
                        <span className="text-[12px] text-muted">{n.cpuUsage}%</span>
                      </div>
                    </td>
                    <td className="py-3 pe-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-border">
                          <div className="h-full rounded-full" style={{ width: `${n.memoryUsage}%`, background: n.memoryUsage > 75 ? 'var(--salis-orange)' : 'var(--salis-blue)' }} />
                        </div>
                        <span className="text-[12px] text-muted">{n.memoryUsage}%</span>
                      </div>
                    </td>
                    <td className="py-3 pe-4 font-mono text-[13px] text-muted">{n.latency}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{n.tasks}</td>
                    <td className="py-3 text-[13px] text-muted">{n.uptime}</td>
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
