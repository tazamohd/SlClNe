import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'

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
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Workflow" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('AI Automation')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Automation rules and triggers')}</p>
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
