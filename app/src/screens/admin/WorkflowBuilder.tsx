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
      iconBg: 'rgba(10,94,215,.1)',
      iconFg: 'var(--salis-blue)',
      status: t('Active'),
      statusBg: 'rgba(10,94,215,.1)',
      statusFg: 'var(--salis-blue)',
      runs: '1,248',
      lastRun: '2 min ago',
      steps: [
        step('Car', 'Check-In', 'rgba(249,115,22,.1)', 'var(--salis-orange)', true),
        step('Search', 'Inspect', 'rgba(11,179,255,.1)', 'var(--salis-blue-bright)', true),
        step('Wrench', 'Repair', 'rgba(10,94,215,.1)', 'var(--salis-blue)', true),
        step('CheckCircle', 'QC', 'rgba(11,179,255,.1)', 'var(--salis-blue-bright)', true),
        step('Truck', 'Deliver', 'rgba(11,31,59,.1)', 'var(--salis-navy)', false),
      ],
    },
    {
      name: t('Invoice Approval'),
      desc: t('Invoice creation, review, and payment tracking'),
      iconBg: 'rgba(11,179,255,.1)',
      iconFg: 'var(--salis-blue-bright)',
      status: t('Active'),
      statusBg: 'rgba(10,94,215,.1)',
      statusFg: 'var(--salis-blue)',
      runs: '456',
      lastRun: '1 hour ago',
      steps: [
        step('FileText', 'Create', 'rgba(10,94,215,.1)', 'var(--salis-blue)', true),
        step('Eye', 'Review', 'rgba(11,179,255,.1)', 'var(--salis-blue-bright)', true),
        step('Check', 'Approve', 'rgba(10,94,215,.1)', 'var(--salis-blue)', true),
        step('Send', 'Send', 'rgba(249,115,22,.1)', 'var(--salis-orange)', false),
      ],
    },
    {
      name: t('Customer Onboarding'),
      desc: t('New customer registration and vehicle setup'),
      iconBg: 'rgba(249,115,22,.1)',
      iconFg: 'var(--salis-orange)',
      status: t('Active'),
      statusBg: 'rgba(10,94,215,.1)',
      statusFg: 'var(--salis-blue)',
      runs: '89',
      lastRun: '3 hours ago',
      steps: [
        step('UserPlus', 'Register', 'rgba(10,94,215,.1)', 'var(--salis-blue)', true),
        step('Car', 'Add Vehicle', 'rgba(11,179,255,.1)', 'var(--salis-blue-bright)', true),
        step('Mail', 'Welcome', 'rgba(249,115,22,.1)', 'var(--salis-orange)', false),
      ],
    },
    {
      name: t('Parts Procurement'),
      desc: t('Automated reorder and supplier management'),
      iconBg: 'rgba(11,31,59,.1)',
      iconFg: 'var(--salis-navy)',
      status: t('Draft'),
      statusBg: 'rgba(249,115,22,.1)',
      statusFg: 'var(--salis-orange)',
      runs: '0',
      lastRun: t('Never'),
      steps: [
        step('AlertTriangle', 'Alert', 'rgba(249,115,22,.1)', 'var(--salis-orange)', true),
        step('FileText', 'PO Create', 'rgba(10,94,215,.1)', 'var(--salis-blue)', true),
        step('Send', 'Send PO', 'rgba(11,179,255,.1)', 'var(--salis-blue-bright)', true),
        step('Package', 'Receive', 'rgba(11,31,59,.1)', 'var(--salis-navy)', false),
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
            className="cursor-pointer rounded-2xl p-5 transition-all hover:border-[rgba(10,94,215,.3)] hover:shadow-lg"
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
                <h3 className="m-0 text-base font-bold text-heading">{wf.name}</h3>
                <p className="m-0 mt-0.5 text-xs text-muted">{wf.desc}</p>
              </div>
              <Badge background={wf.statusBg} color={wf.statusFg}>
                {wf.status}
              </Badge>
            </div>

            {/* Steps flow */}
            <div className="flex items-center gap-2 overflow-x-auto rounded-[10px] border border-border bg-inset p-3">
              {wf.steps.map((s, i) => (
                <div key={i} className="flex flex-shrink-0 items-center gap-1.5">
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
