import { useMemo, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface Task {
  title: string
  assignee: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  dueDate: string
  status: 'To Do' | 'In Progress' | 'Done' | 'Overdue'
  category: 'Maintenance' | 'Follow-up' | 'Administrative' | 'Inspection'
}

const TASKS: Task[] = [
  { title: 'Replace brake pads - Toyota Camry', assignee: 'Yusuf Ibrahim', priority: 'High', dueDate: 'Aug 18, 2026', status: 'In Progress', category: 'Maintenance' },
  { title: 'Follow up with Ahmed on estimate', assignee: 'Sara Al-Mutairi', priority: 'Medium', dueDate: 'Aug 19, 2026', status: 'To Do', category: 'Follow-up' },
  { title: 'Monthly inventory count', assignee: 'Khalid Mohammed', priority: 'Medium', dueDate: 'Aug 20, 2026', status: 'To Do', category: 'Administrative' },
  { title: 'Inspect BMW X5 suspension', assignee: 'Omar Hassan', priority: 'Urgent', dueDate: 'Aug 17, 2026', status: 'Overdue', category: 'Inspection' },
  { title: 'Order replacement headlights', assignee: 'Tariq Al-Dosari', priority: 'Low', dueDate: 'Aug 22, 2026', status: 'To Do', category: 'Administrative' },
  { title: 'Complete oil change - Honda Accord', assignee: 'Yusuf Ibrahim', priority: 'Medium', dueDate: 'Aug 18, 2026', status: 'Done', category: 'Maintenance' },
  { title: 'Call Nora about service satisfaction', assignee: 'Sara Al-Mutairi', priority: 'Low', dueDate: 'Aug 19, 2026', status: 'To Do', category: 'Follow-up' },
  { title: 'Pre-delivery inspection - Hyundai Tucson', assignee: 'Omar Hassan', priority: 'High', dueDate: 'Aug 18, 2026', status: 'In Progress', category: 'Inspection' },
]

const PRIORITY_STYLES: Record<string, { bg: string; fg: string }> = {
  Low: { bg: 'var(--tint-neutral)', fg: 'rgb(107,114,128)' },
  Medium: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  High: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Urgent: { bg: 'var(--tint-orange)', fg: 'rgb(249,115,22)' },
}

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  'To Do': { bg: 'var(--tint-neutral)', fg: 'rgb(107,114,128)' },
  'In Progress': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Done: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Overdue: { bg: 'var(--tint-orange)', fg: 'rgb(249,115,22)' },
}

export function TasksList() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return TASKS
    const q = search.toLowerCase()
    return TASKS.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        task.assignee.toLowerCase().includes(q) ||
        task.category.toLowerCase().includes(q),
    )
  }, [search])

  const kpis = [
    { label: t('Total Tasks'), value: String(TASKS.length), icon: 'CheckSquare', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('In Progress'), value: String(TASKS.filter((t) => t.status === 'In Progress').length), icon: 'Loader', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Overdue'), value: String(TASKS.filter((t) => t.status === 'Overdue').length), icon: 'AlertTriangle', bg: 'var(--tint-orange)', fg: 'rgb(249,115,22)' },
    { label: t('Completed Today'), value: String(TASKS.filter((t) => t.status === 'Done').length), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<Task>[] = [
    { header: 'Task', cell: (task) => <span className="font-medium text-heading">{task.title}</span> },
    { header: 'Assignee', cell: (task) => task.assignee },
    { header: 'Priority', cell: (task) => <Badge background={PRIORITY_STYLES[task.priority].bg} color={PRIORITY_STYLES[task.priority].fg}>{t(task.priority)}</Badge> },
    { header: 'Due Date', cell: (task) => task.dueDate },
    { header: 'Status', cell: (task) => <Badge background={STATUS_STYLES[task.status].bg} color={STATUS_STYLES[task.status].fg}>{t(task.status)}</Badge> },
    { header: 'Category', cell: (task) => t(task.category) },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="CheckSquare" title={t('Tasks')} subtitle={t('Task management and tracking')} />
        <div className="relative flex items-center">
          <Icon name="Search" size={15} className="pointer-events-none absolute start-3 text-muted" />
          <Input inputSize="sm" placeholder={t('Search tasks...')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-[260px] !ps-8" />
        </div>
      </div>

      <div className={isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-4'}>
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Tasks"
        columns={columns}
        rows={filtered}
        rowKey={(_, i) => `task-${i}`}
        empty={t('No tasks found')}
        mobileCard={(task) => (
          <>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5" style={{ background: STATUS_STYLES[task.status].bg, color: STATUS_STYLES[task.status].fg }} aria-hidden>
                    <Icon name="CheckSquare" size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{task.title}</p>
                    <p className="text-xs text-muted">{task.assignee}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={PRIORITY_STYLES[task.priority].bg} color={PRIORITY_STYLES[task.priority].fg}>{t(task.priority)}</Badge>}
            />
            <MobileCardRow label={t('Due')} value={task.dueDate} />
            <MobileCardRow label={t('Status')} value={<Badge background={STATUS_STYLES[task.status].bg} color={STATUS_STYLES[task.status].fg}>{t(task.status)}</Badge>} />
            <MobileCardRow label={t('Category')} value={t(task.category)} />
          </>
        )}
      />
    </div>
  )
}
