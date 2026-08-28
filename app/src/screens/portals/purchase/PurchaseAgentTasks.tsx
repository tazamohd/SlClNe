import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface Task {
  id: string
  title: string
  category: 'Approval' | 'Follow-up' | 'Negotiation' | 'Inspection'
  assignedBy: string
  dueDate: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue'
}

const TASKS: Task[] = [
  { id: 'TSK-401', title: 'Approve PO-2401 from Al-Futtaim Parts', category: 'Approval', assignedBy: 'Fahad Al-Harbi', dueDate: '2025-08-18', priority: 'High', status: 'Pending' },
  { id: 'TSK-402', title: 'Follow up on delayed shipment PO-2385', category: 'Follow-up', assignedBy: 'System', dueDate: '2025-08-18', priority: 'Medium', status: 'In Progress' },
  { id: 'TSK-403', title: 'Negotiate Q4 pricing with Brembo KSA', category: 'Negotiation', assignedBy: 'Fahad Al-Harbi', dueDate: '2025-08-22', priority: 'Medium', status: 'Pending' },
  { id: 'TSK-404', title: 'Inspect received order PO-2398', category: 'Inspection', assignedBy: 'Warehouse', dueDate: '2025-08-17', priority: 'High', status: 'Overdue' },
  { id: 'TSK-405', title: 'Review Gates Automotive contract renewal', category: 'Negotiation', assignedBy: 'Fahad Al-Harbi', dueDate: '2025-08-25', priority: 'Low', status: 'Pending' },
  { id: 'TSK-406', title: 'Process return for defective parts batch', category: 'Follow-up', assignedBy: 'Quality', dueDate: '2025-08-19', priority: 'High', status: 'In Progress' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Pending: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
  'In Progress': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Completed: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Overdue: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
}

const PRIORITY_STYLES: Record<string, { bg: string; fg: string }> = {
  High: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Medium: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Low: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
}

const CATEGORY_ICONS: Record<string, string> = {
  Approval: 'CheckSquare',
  'Follow-up': 'RefreshCw',
  Negotiation: 'MessageSquare',
  Inspection: 'Eye',
}

export function PurchaseAgentTasks() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Total Tasks'), value: String(TASKS.length), icon: 'ListChecks', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Pending'), value: '3', icon: 'Clock', bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
    { label: t('In Progress'), value: '2', icon: 'Loader', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Overdue'), value: '1', icon: 'AlertTriangle', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const columns: Column<Task>[] = [
    { header: t('Task'), cell: (task) => task.title },
    { header: t('Category'), cell: (task) => (
      <div className="flex items-center gap-1.5">
        <Icon name={CATEGORY_ICONS[task.category]} size={14} className="text-muted" />
        <span>{t(task.category)}</span>
      </div>
    ) },
    { header: t('Assigned By'), cell: (task) => task.assignedBy },
    { header: t('Due'), cell: (task) => task.dueDate },
    { header: t('Priority'), cell: (task) => <Badge background={PRIORITY_STYLES[task.priority].bg} color={PRIORITY_STYLES[task.priority].fg}>{t(task.priority)}</Badge> },
    { header: t('Status'), cell: (task) => <Badge background={STATUS_STYLES[task.status].bg} color={STATUS_STYLES[task.status].fg}>{t(task.status)}</Badge> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ListChecks" title={t('Tasks')} subtitle={t('Pending purchase actions')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Purchase agent tasks"
        columns={columns}
        rows={TASKS}
        rowKey={(task) => task.id}
        mobileCard={(task) => (
          <>
            <MobileCardHeader title={task.title} trailing={<Badge background={STATUS_STYLES[task.status].bg} color={STATUS_STYLES[task.status].fg}>{t(task.status)}</Badge>} />
            <MobileCardRow label={t('Category')}>{t(task.category)}</MobileCardRow>
            <MobileCardRow label={t('Due')}>{task.dueDate}</MobileCardRow>
            <MobileCardRow label={t('Priority')}><Badge background={PRIORITY_STYLES[task.priority].bg} color={PRIORITY_STYLES[task.priority].fg}>{t(task.priority)}</Badge></MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
