import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface Workflow {
  name: string
  trigger: string
  actions: number
  status: 'Active' | 'Paused' | 'Draft'
  runs: number
  successRate: number
}

const WORKFLOWS: Workflow[] = [
  { name: 'Welcome New Lead', trigger: 'New Lead', actions: 4, status: 'Active', runs: 1240, successRate: 94.2 },
  { name: 'Appointment Reminder', trigger: 'Appointment Booked', actions: 3, status: 'Active', runs: 3450, successRate: 98.1 },
  { name: 'Payment Thank You', trigger: 'Invoice Paid', actions: 2, status: 'Active', runs: 2100, successRate: 99.5 },
  { name: 'Cart Recovery', trigger: 'Abandoned Cart', actions: 5, status: 'Paused', runs: 560, successRate: 67.3 },
  { name: 'Birthday Greeting', trigger: 'Birthday', actions: 2, status: 'Active', runs: 890, successRate: 100 },
  { name: '7-Day Follow-up', trigger: 'Follow-up', actions: 3, status: 'Draft', runs: 0, successRate: 0 },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Paused: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Draft: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)' },
}

export function MarketingAutomation() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const columns: Column<Workflow>[] = [
    { header: 'Workflow', cell: (w) => <span className="font-medium text-heading">{w.name}</span> },
    { header: 'Trigger', cell: (w) => t(w.trigger) },
    { header: 'Actions', cell: (w) => <span className="font-mono text-heading">{w.actions}</span> },
    { header: 'Status', cell: (w) => <Badge background={STATUS_STYLES[w.status].bg} color={STATUS_STYLES[w.status].fg}>{t(w.status)}</Badge> },
    { header: 'Runs', cell: (w) => <span className="font-mono text-heading">{w.runs.toLocaleString()}</span> },
    { header: 'Success Rate', cell: (w) => <span className="font-mono text-heading">{w.successRate > 0 ? `${w.successRate}%` : '--'}</span> },
  ]

  const table = (
    <DataTable
      caption="Marketing workflows"
      columns={columns}
      rows={WORKFLOWS}
      rowKey={(w) => w.name}
      mobileCard={(w) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Zap" size={14} /></span>
                <div>
                  <p className="text-[13px] font-semibold text-heading">{w.name}</p>
                  <p className="text-xs text-muted">{t(w.trigger)}</p>
                </div>
              </div>
            }
            trailing={<Badge background={STATUS_STYLES[w.status].bg} color={STATUS_STYLES[w.status].fg}>{t(w.status)}</Badge>}
          />
          <MobileCardRow label={t('Actions')} value={String(w.actions)} />
          <MobileCardRow label={t('Runs')} value={w.runs.toLocaleString()} />
          <MobileCardRow label={t('Success Rate')} value={w.successRate > 0 ? `${w.successRate}%` : '--'} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Zap" title={t('Automation')} subtitle={t('Marketing workflows')} />
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Zap" title={t('Marketing Automation')} subtitle={t('Automated workflows and triggers')} />

      {table}
    </div>
  )
}
