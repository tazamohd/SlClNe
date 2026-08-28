import { useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const MOCK_RULES = [
  { id: 'AUT-001', name: 'Auto-Schedule Follow-Up', trigger: 'Job Completed', action: 'Send SMS after 3 days', status: 'Active', executions: 1245, lastRun: '2026-08-17 14:32' },
  { id: 'AUT-002', name: 'Low Inventory Alert', trigger: 'Stock < Min Level', action: 'Notify procurement team', status: 'Active', executions: 342, lastRun: '2026-08-17 09:15' },
  { id: 'AUT-003', name: 'VIP Customer Priority', trigger: 'VIP Booking', action: 'Assign senior technician', status: 'Active', executions: 89, lastRun: '2026-08-16 16:45' },
  { id: 'AUT-004', name: 'Invoice Overdue Reminder', trigger: 'Invoice > 30 days', action: 'Send reminder email', status: 'Active', executions: 567, lastRun: '2026-08-17 08:00' },
  { id: 'AUT-005', name: 'Warranty Expiry Notice', trigger: '30 days before expiry', action: 'Notify customer', status: 'Paused', executions: 213, lastRun: '2026-08-10 10:00' },
  { id: 'AUT-006', name: 'Performance Report', trigger: 'End of week', action: 'Generate & email report', status: 'Active', executions: 34, lastRun: '2026-08-15 23:59' },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Paused: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
}

type RuleRow = (typeof MOCK_RULES)[number]

export function AIAutomation() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? MOCK_RULES : MOCK_RULES.filter(r => r.status === filter)
  const totalExecutions = MOCK_RULES.reduce((a, r) => a + r.executions, 0)

  const kpis = [
    { label: t('Total Rules'), value: String(MOCK_RULES.length), icon: 'Workflow', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(MOCK_RULES.filter(r => r.status === 'Active').length), icon: 'Zap', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Executions'), value: totalExecutions.toLocaleString(), icon: 'Activity', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Success Rate'), value: '98.7%', icon: 'CheckCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<RuleRow>[] = [
    { header: 'ID', cell: (r) => r.id, code: true },
    { header: 'Rule', cell: (r) => t(r.name) },
    { header: 'Trigger', cell: (r) => t(r.trigger) },
    { header: 'Action', cell: (r) => t(r.action) },
    { header: 'Status', cell: (r) => { const [bg, fg] = STATUS_COLORS[r.status] ?? STATUS_COLORS.Paused; return <Badge background={bg} color={fg}>{t(r.status)}</Badge> } },
    { header: 'Executions', cell: (r) => r.executions.toLocaleString() },
    { header: 'Last Run', cell: (r) => r.lastRun },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Workflow" title={t('AI Automation')} subtitle={t('Automation rules and triggers')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-heading">{t('Automation Rules')}</h3>
        <Select value={filter} onChange={e => setFilter(e.target.value)} aria-label={t('Filter by status')}>
          <option value="All">{t('All')}</option>
          <option value="Active">{t('Active')}</option>
          <option value="Paused">{t('Paused')}</option>
        </Select>
      </div>
      <DataTable
        caption="AI automation rules"
        columns={columns}
        rows={[...filtered]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_COLORS[row.status] ?? STATUS_COLORS.Paused
          return (
            <>
              <MobileCardHeader title={t(row.name)} trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow label={t('Trigger')}>{t(row.trigger)}</MobileCardRow>
              <MobileCardRow label={t('Executions')}>{row.executions.toLocaleString()}</MobileCardRow>
              <MobileCardRow label={t('Last Run')}>{row.lastRun}</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
