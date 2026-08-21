import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  Pending: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
  'In Progress': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Completed: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  Overdue: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

const PRIORITY_STYLES: Record<string, { bg: string; fg: string }> = {
  High: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  Medium: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Low: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
}

const CATEGORY_ICONS: Record<string, string> = {
  Approval: 'CheckSquare',
  'Follow-up': 'RefreshCw',
  Negotiation: 'MessageSquare',
  Inspection: 'Eye',
}

export function PurchaseAgentTasks() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Total Tasks'), value: String(TASKS.length), icon: 'ListChecks', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Pending'), value: '3', icon: 'Clock', bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
    { label: t('In Progress'), value: '2', icon: 'Loader', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Overdue'), value: '1', icon: 'AlertTriangle', bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ListChecks" title={t('Tasks')} subtitle={t('Pending actions')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {TASKS.map((task) => (
          <MobileCard key={task.id}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name={CATEGORY_ICONS[task.category]} size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{task.title}</p>
                    <p className="text-xs text-muted">{t(task.category)}</p>
                  </div>
                </div>
              }
              trailing={<Badge background={STATUS_STYLES[task.status].bg} color={STATUS_STYLES[task.status].fg}>{t(task.status)}</Badge>}
            />
            <MobileCardRow label={t('Assigned By')} value={task.assignedBy} />
            <MobileCardRow label={t('Due')} value={task.dueDate} />
            <MobileCardRow label={t('Priority')}>
              <Badge background={PRIORITY_STYLES[task.priority].bg} color={PRIORITY_STYLES[task.priority].fg}>{t(task.priority)}</Badge>
            </MobileCardRow>
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="ListChecks" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Tasks')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Pending purchase actions')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Task')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Assigned By')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Due')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Priority')}</th>
                <th className="pb-3 text-start font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {TASKS.map((task) => (
                <tr key={task.id} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{task.title}</td>
                  <td className="py-3 pe-4">
                    <div className="flex items-center gap-1.5">
                      <Icon name={CATEGORY_ICONS[task.category]} size={14} className="text-muted" />
                      <span className="text-body">{t(task.category)}</span>
                    </div>
                  </td>
                  <td className="py-3 pe-4 text-body">{task.assignedBy}</td>
                  <td className="py-3 pe-4 text-body">{task.dueDate}</td>
                  <td className="py-3 pe-4">
                    <Badge background={PRIORITY_STYLES[task.priority].bg} color={PRIORITY_STYLES[task.priority].fg}>{t(task.priority)}</Badge>
                  </td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[task.status].bg} color={STATUS_STYLES[task.status].fg}>{t(task.status)}</Badge>
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
