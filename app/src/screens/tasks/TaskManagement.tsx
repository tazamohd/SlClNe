import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface Task {
  title: string
  assignee: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  dueDate: string
  status: 'To Do' | 'In Progress' | 'Done'
  category: 'Maintenance' | 'Follow-up' | 'Administrative' | 'Inspection'
}

const TASKS: Task[] = [
  { title: 'Follow up with Ahmed on estimate', assignee: 'Sara Al-Mutairi', priority: 'Medium', dueDate: 'Aug 19, 2026', status: 'To Do', category: 'Follow-up' },
  { title: 'Monthly inventory count', assignee: 'Khalid Mohammed', priority: 'Medium', dueDate: 'Aug 20, 2026', status: 'To Do', category: 'Administrative' },
  { title: 'Order replacement headlights', assignee: 'Tariq Al-Dosari', priority: 'Low', dueDate: 'Aug 22, 2026', status: 'To Do', category: 'Administrative' },
  { title: 'Replace brake pads - Toyota Camry', assignee: 'Yusuf Ibrahim', priority: 'High', dueDate: 'Aug 18, 2026', status: 'In Progress', category: 'Maintenance' },
  { title: 'Pre-delivery inspection - Hyundai Tucson', assignee: 'Omar Hassan', priority: 'High', dueDate: 'Aug 18, 2026', status: 'In Progress', category: 'Inspection' },
  { title: 'Complete oil change - Honda Accord', assignee: 'Yusuf Ibrahim', priority: 'Medium', dueDate: 'Aug 18, 2026', status: 'Done', category: 'Maintenance' },
  { title: 'Call Nora about service satisfaction', assignee: 'Sara Al-Mutairi', priority: 'Low', dueDate: 'Aug 17, 2026', status: 'Done', category: 'Follow-up' },
  { title: 'Update service manual index', assignee: 'Khalid Mohammed', priority: 'Low', dueDate: 'Aug 16, 2026', status: 'Done', category: 'Administrative' },
]

const PRIORITY_STYLES: Record<string, { bg: string; fg: string }> = {
  Low: { bg: 'var(--tint-neutral)', fg: 'rgb(107,114,128)' },
  Medium: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  High: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Urgent: { bg: 'var(--tint-orange)', fg: 'rgb(249,115,22)' },
}

const COLUMNS: { status: Task['status']; icon: string }[] = [
  { status: 'To Do', icon: 'Circle' },
  { status: 'In Progress', icon: 'Loader' },
  { status: 'Done', icon: 'CheckCircle' },
]

const COLUMN_STYLES: Record<string, { bg: string; fg: string }> = {
  'To Do': { bg: 'var(--tint-neutral)', fg: 'rgb(107,114,128)' },
  'In Progress': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Done: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
}

export function TaskManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ListTodo" title={t('Task Board')} subtitle={t('Manage tasks')} />
        {COLUMNS.map((col) => {
          const tasks = TASKS.filter((task) => task.status === col.status)
          return (
            <div key={col.status}>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: COLUMN_STYLES[col.status].bg, color: COLUMN_STYLES[col.status].fg }} aria-hidden>
                  <Icon name={col.icon} size={14} />
                </span>
                <span className="text-sm font-bold text-heading">{t(col.status)}</span>
                <Badge background="var(--tint-neutral)" color="rgb(107,114,128)">{tasks.length}</Badge>
              </div>
              {tasks.map((task, i) => (
                <MobileCard key={i}>
                  <MobileCardHeader
                    leading={
                      <div>
                        <p className="text-[13px] font-semibold text-heading">{task.title}</p>
                        <p className="text-xs text-muted">{task.assignee}</p>
                      </div>
                    }
                    trailing={<Badge background={PRIORITY_STYLES[task.priority].bg} color={PRIORITY_STYLES[task.priority].fg}>{t(task.priority)}</Badge>}
                  />
                  <MobileCardRow label={t('Due')} value={task.dueDate} />
                  <MobileCardRow label={t('Category')} value={t(task.category)} />
                </MobileCard>
              ))}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ListTodo" title={t('Task Management')} subtitle={t('Board view of all tasks')} />

      <div className="flex gap-4">
        {COLUMNS.map((col) => {
          const tasks = TASKS.filter((task) => task.status === col.status)
          return (
            <div key={col.status} className="flex flex-1 flex-col gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-surface-secondary p-3">
                <span className="flex rounded-lg p-1.5" style={{ background: COLUMN_STYLES[col.status].bg, color: COLUMN_STYLES[col.status].fg }} aria-hidden>
                  <Icon name={col.icon} size={16} />
                </span>
                <span className="text-sm font-bold text-heading">{t(col.status)}</span>
                <Badge background="var(--tint-neutral)" color="rgb(107,114,128)">{tasks.length}</Badge>
              </div>
              {tasks.map((task, i) => (
                <Card key={i} className="rounded-xl p-4 shadow-sm">
                  <p className="text-sm font-semibold text-heading">{task.title}</p>
                  <p className="mt-1 text-xs text-muted">{task.assignee}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge background={PRIORITY_STYLES[task.priority].bg} color={PRIORITY_STYLES[task.priority].fg}>{t(task.priority)}</Badge>
                    <span className="text-xs text-muted">{task.dueDate}</span>
                  </div>
                  <div className="mt-2">
                    <Badge background="rgba(107,114,128,.08)" color="rgb(107,114,128)">{t(task.category)}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
