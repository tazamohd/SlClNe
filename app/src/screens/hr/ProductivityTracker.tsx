import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Input } from '@/components/ui/Input'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface StaffProductivity {
  name: string
  role: string
  hoursWorked: number
  tasksCompleted: number
  efficiency: number
  utilization: number
}

const MOCK_STAFF: readonly StaffProductivity[] = [
  { name: 'Yousef Al-Shehri', role: 'Senior Technician', hoursWorked: 168, tasksCompleted: 42, efficiency: 96, utilization: 92 },
  { name: 'Fahad Al-Harbi', role: 'Senior Technician', hoursWorked: 162, tasksCompleted: 38, efficiency: 94, utilization: 89 },
  { name: 'Ahmed Al-Ghamdi', role: 'Technician', hoursWorked: 155, tasksCompleted: 35, efficiency: 91, utilization: 86 },
  { name: 'Nasser Al-Otaibi', role: 'Technician', hoursWorked: 160, tasksCompleted: 33, efficiency: 88, utilization: 84 },
  { name: 'Omar Al-Qahtani', role: 'Junior Technician', hoursWorked: 148, tasksCompleted: 28, efficiency: 85, utilization: 80 },
  { name: 'Tariq Al-Zahrani', role: 'Junior Technician', hoursWorked: 152, tasksCompleted: 30, efficiency: 83, utilization: 78 },
  { name: 'Sara Al-Rashidi', role: 'Service Advisor', hoursWorked: 160, tasksCompleted: 45, efficiency: 92, utilization: 88 },
  { name: 'Layla Al-Tamimi', role: 'Service Advisor', hoursWorked: 158, tasksCompleted: 41, efficiency: 90, utilization: 85 },
]

export function ProductivityTracker() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_STAFF
    const q = search.toLowerCase()
    return MOCK_STAFF.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q),
    )
  }, [search])

  const avgEfficiency = Math.round(MOCK_STAFF.reduce((sum, r) => sum + r.efficiency, 0) / MOCK_STAFF.length)
  const avgUtilization = Math.round(MOCK_STAFF.reduce((sum, r) => sum + r.utilization, 0) / MOCK_STAFF.length)
  const totalHours = MOCK_STAFF.reduce((sum, r) => sum + r.hoursWorked, 0)
  const totalTasks = MOCK_STAFF.reduce((sum, r) => sum + r.tasksCompleted, 0)

  const kpis = [
    { label: t('Avg Efficiency'), value: `${avgEfficiency}%`, icon: 'Zap', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Avg Utilization'), value: `${avgUtilization}%`, icon: 'Activity', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Total Hours'), value: String(totalHours), icon: 'Clock', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Total Tasks'), value: String(totalTasks), icon: 'CheckSquare', bg: 'rgba(11,31,59,.1)', fg: 'var(--salis-navy)' },
  ]

  function efficiencyBadge(value: number) {
    if (value >= 90) return { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' }
    if (value >= 80) return { bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' }
    return { bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' }
  }

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Activity" title={t('Productivity')} subtitle={t('Staff Productivity Tracker')} />
        <Input inputSize="sm" placeholder={t('Search staff...')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="flex rounded-lg p-1" style={{ background: k.bg, color: k.fg }} aria-hidden>
                  <Icon name={k.icon} size={14} />
                </span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1 font-display text-lg font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {filtered.map((r, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden>
                    <Icon name="User" size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{r.name}</p>
                    <p className="text-xs text-muted">{t(r.role)}</p>
                  </div>
                </div>
              }
              trailing={
                <Badge background={efficiencyBadge(r.efficiency).bg} color={efficiencyBadge(r.efficiency).fg}>
                  {r.efficiency}%
                </Badge>
              }
            />
            <MobileCardRow label={t('Hours Worked')} value={String(r.hoursWorked)} />
            <MobileCardRow label={t('Tasks Completed')} value={String(r.tasksCompleted)} />
            <MobileCardRow label={t('Utilization')} value={`${r.utilization}%`} />
          </MobileCard>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted">{t('No staff found')}</p>}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
            <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="Activity" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[30px] font-black text-heading">{t('Productivity')}</h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('Staff Productivity Tracker')}</p>
          </div>
        </div>
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search staff...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-[260px] !ps-8" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden>
                <Icon name={k.icon} size={16} />
              </span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Name')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Role')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Hours Worked')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Tasks')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Efficiency')}</th>
                <th className="pb-3 text-start font-medium">{t('Utilization')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{r.name}</td>
                  <td className="py-3 pe-4 text-body">{t(r.role)}</td>
                  <td className="py-3 pe-4 font-mono text-heading" dir="ltr">{r.hoursWorked}</td>
                  <td className="py-3 pe-4 font-mono text-heading" dir="ltr">{r.tasksCompleted}</td>
                  <td className="py-3 pe-4">
                    <Badge background={efficiencyBadge(r.efficiency).bg} color={efficiencyBadge(r.efficiency).fg}>
                      {r.efficiency}%
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge background={efficiencyBadge(r.utilization).bg} color={efficiencyBadge(r.utilization).fg}>
                      {r.utilization}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
