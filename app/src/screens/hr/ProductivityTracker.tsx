import { useMemo, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Input } from '@/components/ui/Input'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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
    { label: t('Avg Efficiency'), value: `${avgEfficiency}%`, icon: 'Zap', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Avg Utilization'), value: `${avgUtilization}%`, icon: 'Activity', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Total Hours'), value: String(totalHours), icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Total Tasks'), value: String(totalTasks), icon: 'CheckSquare', bg: 'var(--tint-navy)', fg: 'var(--salis-navy)' },
  ]

  function efficiencyBadge(value: number) {
    if (value >= 90) return { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' }
    if (value >= 80) return { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright, #0BB3FF)' }
    return { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' }
  }

  const columns: Column<StaffProductivity>[] = [
    { header: 'Name', cell: (r) => r.name },
    { header: 'Role', cell: (r) => t(r.role) },
    { header: 'Hours Worked', cell: (r) => r.hoursWorked, code: true },
    { header: 'Tasks', cell: (r) => r.tasksCompleted, code: true },
    { header: 'Efficiency', cell: (r) => <Badge background={efficiencyBadge(r.efficiency).bg} color={efficiencyBadge(r.efficiency).fg}>{r.efficiency}%</Badge> },
    { header: 'Utilization', cell: (r) => <Badge background={efficiencyBadge(r.utilization).bg} color={efficiencyBadge(r.utilization).fg}>{r.utilization}%</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="Activity" title={t('Productivity')} subtitle={t('Staff Productivity Tracker')} />
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search staff...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-[260px] !ps-8" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Staff productivity"
        columns={columns}
        rows={[...filtered]}
        rowKey={(_, i) => `row-${i}`}
        mobileCard={(r) => (
          <>
            <MobileCardHeader
              title={r.name}
              trailing={
                <Badge background={efficiencyBadge(r.efficiency).bg} color={efficiencyBadge(r.efficiency).fg}>
                  {r.efficiency}%
                </Badge>
              }
            />
            <MobileCardRow label={t('Role')}>{t(r.role)}</MobileCardRow>
            <MobileCardRow label={t('Hours Worked')}>{String(r.hoursWorked)}</MobileCardRow>
            <MobileCardRow label={t('Tasks Completed')}>{String(r.tasksCompleted)}</MobileCardRow>
            <MobileCardRow label={t('Utilization')}>{r.utilization}%</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
