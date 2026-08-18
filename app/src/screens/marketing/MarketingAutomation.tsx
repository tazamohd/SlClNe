import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Zap" title={t('Automation')} subtitle={t('Marketing workflows')} />
        {WORKFLOWS.map((w) => (
          <MobileCard key={w.name}>
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
            <MobileCardRow label={t('Success Rate')} value={w.successRate > 0 ? `${w.successRate}%` : '—'} />
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
            <Icon name="Zap" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Marketing Automation')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Automated workflows and triggers')}</p>
        </div>
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Workflow')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Trigger')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Actions')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Runs')}</th>
                <th className="pb-3 text-end font-medium">{t('Success Rate')}</th>
              </tr>
            </thead>
            <tbody>
              {WORKFLOWS.map((w) => (
                <tr key={w.name} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{w.name}</td>
                  <td className="py-3 pe-4 text-body">{t(w.trigger)}</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{w.actions}</td>
                  <td className="py-3 pe-4">
                    <Badge background={STATUS_STYLES[w.status].bg} color={STATUS_STYLES[w.status].fg}>{t(w.status)}</Badge>
                  </td>
                  <td className="py-3 pe-4 text-end font-mono text-heading">{w.runs.toLocaleString()}</td>
                  <td className="py-3 text-end font-mono text-heading">{w.successRate > 0 ? `${w.successRate}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
