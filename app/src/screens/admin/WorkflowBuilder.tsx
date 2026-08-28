import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'

interface WfStep {
  icon: string
  label: string
  bg: string
  fg: string
  hasArrow: boolean
}

interface WorkflowDef {
  name: string
  desc: string
  iconBg: string
  iconFg: string
  status: string
  statusBg: string
  statusFg: string
  runs: string
  lastRun: string
  steps: WfStep[]
}

export function WorkflowBuilder() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const step = (
    icon: string,
    label: string,
    bg: string,
    fg: string,
    hasArrow: boolean,
  ): WfStep => ({ icon, label: t(label), bg, fg, hasArrow })

  const workflows: WorkflowDef[] = [
    {
      name: t('Job Card Lifecycle'),
      desc: t('Full job card workflow from check-in to delivery'),
      iconBg: 'var(--tint-blue)',
      iconFg: 'var(--salis-blue)',
      status: t('Active'),
      statusBg: 'var(--tint-blue)',
      statusFg: 'var(--salis-blue)',
      runs: '1,248',
      lastRun: '2 min ago',
      steps: [
        step('Car', 'Check-In', 'var(--tint-orange)', 'var(--salis-orange)', true),
        step('Search', 'Inspect', 'var(--tint-bright)', 'var(--salis-blue-bright)', true),
        step('Wrench', 'Repair', 'var(--tint-blue)', 'var(--salis-blue)', true),
        step('CheckCircle', 'QC', 'var(--tint-bright)', 'var(--salis-blue-bright)', true),
        step('Truck', 'Deliver', 'var(--tint-navy)', 'var(--salis-navy)', false),
      ],
    },
    {
      name: t('Invoice Approval'),
      desc: t('Invoice creation, review, and payment tracking'),
      iconBg: 'var(--tint-bright)',
      iconFg: 'var(--salis-blue-bright)',
      status: t('Active'),
      statusBg: 'var(--tint-blue)',
      statusFg: 'var(--salis-blue)',
      runs: '456',
      lastRun: '1 hour ago',
      steps: [
        step('FileText', 'Create', 'var(--tint-blue)', 'var(--salis-blue)', true),
        step('Eye', 'Review', 'var(--tint-bright)', 'var(--salis-blue-bright)', true),
        step('Check', 'Approve', 'var(--tint-blue)', 'var(--salis-blue)', true),
        step('Send', 'Send', 'var(--tint-orange)', 'var(--salis-orange)', false),
      ],
    },
    {
      name: t('Customer Onboarding'),
      desc: t('New customer registration and vehicle setup'),
      iconBg: 'var(--tint-orange)',
      iconFg: 'var(--salis-orange)',
      status: t('Active'),
      statusBg: 'var(--tint-blue)',
      statusFg: 'var(--salis-blue)',
      runs: '89',
      lastRun: '3 hours ago',
      steps: [
        step('UserPlus', 'Register', 'var(--tint-blue)', 'var(--salis-blue)', true),
        step('Car', 'Add Vehicle', 'var(--tint-bright)', 'var(--salis-blue-bright)', true),
        step('Mail', 'Welcome', 'var(--tint-orange)', 'var(--salis-orange)', false),
      ],
    },
    {
      name: t('Parts Procurement'),
      desc: t('Automated reorder and supplier management'),
      iconBg: 'var(--tint-navy)',
      iconFg: 'var(--salis-navy)',
      status: t('Draft'),
      statusBg: 'var(--tint-orange)',
      statusFg: 'var(--salis-orange)',
      runs: '0',
      lastRun: t('Never'),
      steps: [
        step('AlertTriangle', 'Alert', 'var(--tint-orange)', 'var(--salis-orange)', true),
        step('FileText', 'PO Create', 'var(--tint-blue)', 'var(--salis-blue)', true),
        step('Send', 'Send PO', 'var(--tint-bright)', 'var(--salis-blue-bright)', true),
        step('Package', 'Receive', 'var(--tint-navy)', 'var(--salis-navy)', false),
      ],
    },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="GitBranch" size={28} />
          </span>
          <div>
            <h1 className="font-display text-[30px] font-black text-heading">
              {t('Workflow Builder')}
            </h1>
            <p className="mt-0.5 text-[13px] text-muted">{t('AI Platform')}</p>
          </div>
        </div>
        <Button disabled={!isLive}>
          <Icon name="Plus" size={16} />
          {t('New Workflow')}
        </Button>
      </div>

      <div className={isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-2 gap-5'}>
        {workflows.map((wf) => (
          <Card
            key={wf.name}
            className="cursor-pointer rounded-2xl p-5 transition-all hover:border-salis-blue/[.3] hover:shadow-lg"
          >
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              <span
                className="flex rounded-[10px] p-2"
                style={{ background: wf.iconBg, color: wf.iconFg }}
              >
                <Icon name="GitBranch" size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="m-0 text-base font-bold text-heading">{wf.name}</h2>
                <p className="m-0 mt-0.5 text-xs text-muted">{wf.desc}</p>
              </div>
              <Badge background={wf.statusBg} color={wf.statusFg}>
                {wf.status}
              </Badge>
            </div>

            {/* Steps flow */}
            <div className="flex items-center gap-2 overflow-x-auto rounded-[10px] border border-border bg-inset p-3">
              {wf.steps.map((s) => (
                <div key={s.label} className="flex flex-shrink-0 items-center gap-1.5">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ background: s.bg, color: s.fg }}
                  >
                    <Icon name={s.icon} size={13} />
                  </span>
                  <span className="whitespace-nowrap text-[11px] font-medium text-body">
                    {s.label}
                  </span>
                  {s.hasArrow && (
                    <Icon name="ArrowRight" size={12} className="flex-shrink-0 text-faint" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer stats */}
            <div className="mt-3 flex items-center gap-3 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <Icon name="Zap" size={11} />
                {wf.runs} {t('runs')}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={11} />
                {wf.lastRun}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
