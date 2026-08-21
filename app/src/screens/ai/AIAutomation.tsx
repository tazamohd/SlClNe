import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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

export function AIAutomation() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? MOCK_RULES : MOCK_RULES.filter(r => r.status === filter)
  const totalExecutions = MOCK_RULES.reduce((a, r) => a + r.executions, 0)

  const kpis = [
    { label: t('Total Rules'), value: String(MOCK_RULES.length), icon: 'Workflow', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(MOCK_RULES.filter(r => r.status === 'Active').length), icon: 'Zap', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Executions'), value: totalExecutions.toLocaleString(), icon: 'Activity', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Success Rate'), value: '98.7%', icon: 'CheckCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Workflow" title={t('AI Automation')} subtitle={t('Rules & Triggers')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {filtered.map(r => {
          const [bg, fg] = STATUS_COLORS[r.status] ?? STATUS_COLORS.Paused
          return (
            <MobileCard key={r.id}>
              <MobileCardHeader title={t(r.name)} trailing={<Badge background={bg} color={fg}>{t(r.status)}</Badge>} />
              <MobileCardRow label={t('Trigger')}>{t(r.trigger)}</MobileCardRow>
              <MobileCardRow label={t('Action')}>{t(r.action)}</MobileCardRow>
              <MobileCardRow label={t('Executions')}>{r.executions.toLocaleString()}</MobileCardRow>
              <MobileCardRow label={t('Last Run')}>{r.lastRun}</MobileCardRow>
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

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-heading">{t('Automation Rules')}</h3>
          <select value={filter} onChange={e => setFilter(e.target.value)} aria-label={t('Filter by status')} className="h-9 cursor-pointer rounded border border-border bg-card px-3 text-[13px] text-heading outline-none focus:border-salis-blue">
            <option value="All">{t('All')}</option>
            <option value="Active">{t('Active')}</option>
            <option value="Paused">{t('Paused')}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('ID')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Rule')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Trigger')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Action')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Executions')}</th>
                <th className="pb-3 text-start font-medium">{t('Last Run')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const [bg, fg] = STATUS_COLORS[r.status] ?? STATUS_COLORS.Paused
                return (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 font-mono text-[13px] text-heading" dir="ltr">{r.id}</td>
                    <td className="py-3 pe-4 text-[13px] text-heading">{t(r.name)}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{t(r.trigger)}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{t(r.action)}</td>
                    <td className="py-3 pe-4"><Badge background={bg} color={fg}>{t(r.status)}</Badge></td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{r.executions.toLocaleString()}</td>
                    <td className="py-3 text-[13px] text-muted" dir="ltr">{r.lastRun}</td>
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
