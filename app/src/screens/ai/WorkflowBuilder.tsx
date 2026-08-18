import { AlertTriangle, CheckCircle } from 'lucide-react'
import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Workflow Builder: visual workflow designer.
 *
 *  Design-only screen (no backing collection in repository.ts), so the
 *  workflow list is local static demo data — same shape as the prototype's
 *  `workflows` array. Each card renders its steps as a horizontally
 *  scrollable strip of node chips joined by arrow connectors: a static
 *  canvas render (this is a prototype port, not a drag-drop engine).
 *
 *  Two step icons (`CheckCircle`, `AlertTriangle`) aren't in the shared
 *  icon registry (see Icon.tsx), so they're imported directly from
 *  lucide-react and rendered through StepIcon below. */

interface WorkflowStep {
  icon: string
  label: string
  bg: string
  fg: string
}

interface Workflow {
  name: string
  desc: string
  status: 'Active' | 'Draft'
  tone: readonly [string, string]
  runs: string
  lastRun: string
  steps: WorkflowStep[]
}

const WORKFLOWS: Workflow[] = [
  {
    name: 'Job Card Lifecycle',
    desc: 'Full job card workflow from check-in to delivery',
    status: 'Active',
    tone: ['rgba(10,94,215,.1)', '#0A5ED7'],
    runs: '1,248',
    lastRun: '2 min ago',
    steps: [
      { icon: 'Car', label: 'Check-In', bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
      { icon: 'Search', label: 'Inspect', bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF' },
      { icon: 'Wrench', label: 'Repair', bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
      { icon: 'CheckCircle', label: 'QC', bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF' },
      { icon: 'Truck', label: 'Deliver', bg: 'rgba(11,31,59,.1)', fg: '#0B1F3B' },
    ],
  },
  {
    name: 'Invoice Approval',
    desc: 'Invoice creation, review, and payment tracking',
    status: 'Active',
    tone: ['rgba(11,179,255,.1)', '#0BB3FF'],
    runs: '456',
    lastRun: '1 hour ago',
    steps: [
      { icon: 'FileText', label: 'Create', bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
      { icon: 'Eye', label: 'Review', bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF' },
      { icon: 'Check', label: 'Approve', bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
      { icon: 'Send', label: 'Send', bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
    ],
  },
  {
    name: 'Customer Onboarding',
    desc: 'New customer registration and vehicle setup',
    status: 'Active',
    tone: ['rgba(249,115,22,.1)', '#F97316'],
    runs: '89',
    lastRun: '3 hours ago',
    steps: [
      { icon: 'UserPlus', label: 'Register', bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
      { icon: 'Car', label: 'Add Vehicle', bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF' },
      { icon: 'Mail', label: 'Welcome', bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
    ],
  },
  {
    name: 'Parts Procurement',
    desc: 'Automated reorder and supplier management',
    status: 'Draft',
    tone: ['rgba(11,31,59,.1)', '#0B1F3B'],
    runs: '0',
    lastRun: 'Never',
    steps: [
      { icon: 'AlertTriangle', label: 'Alert', bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
      { icon: 'FileText', label: 'PO Create', bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
      { icon: 'Send', label: 'Send PO', bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF' },
      { icon: 'Package', label: 'Receive', bg: 'rgba(11,31,59,.1)', fg: '#0B1F3B' },
    ],
  },
]

// Icons the prototype references that aren't in the shared registry —
// imported straight from lucide-react rather than added to ~230-glyph set.
const EXTRA_ICONS: Record<string, typeof CheckCircle> = { CheckCircle, AlertTriangle }

function StepIcon({ name, size }: { name: string; size: number }) {
  const Extra = EXTRA_ICONS[name]
  if (Extra) return <Extra size={size} strokeWidth={2} aria-hidden />
  return <Icon name={name} size={size} />
}

export function WorkflowBuilder() {
  const { t } = usePreferences()

  return (
    <>
      <FeatureHeader
        icon="GitBranch"
        title={t('Workflow Builder')}
        subtitle={t('Visual workflow designer')}
        actions={
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('New Workflow')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {WORKFLOWS.map((wf) => {
          const [iconBg, iconFg] = wf.tone
          const active = wf.status === 'Active'
          return (
            <Card key={wf.name} className="flex flex-col gap-4 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <span
                  className="flex flex-shrink-0 rounded-[10px] p-2"
                  style={{ background: iconBg, color: iconFg }}
                >
                  <Icon name="GitBranch" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-base font-bold text-heading">
                    {t(wf.name)}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-muted">{t(wf.desc)}</p>
                </div>
                <Badge
                  background={active ? 'rgba(10,94,215,.1)' : 'rgba(249,115,22,.1)'}
                  color={active ? '#0A5ED7' : '#F97316'}
                >
                  {active ? t('Active') : t('Draft')}
                </Badge>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto rounded-[10px] border border-border bg-inset p-3">
                {wf.steps.map((step, index) => (
                  <div key={step.label} className="flex flex-shrink-0 items-center gap-1.5">
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ background: step.bg, color: step.fg }}
                    >
                      <StepIcon name={step.icon} size={13} />
                    </span>
                    <span className="whitespace-nowrap text-[11px] font-medium text-body">
                      {t(step.label)}
                    </span>
                    {index < wf.steps.length - 1 ? (
                      <Icon name="ArrowRight" size={12} className="flex-shrink-0 text-faint" />
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-[11px] text-muted">
                <span className="flex items-center gap-1">
                  <Icon name="Zap" size={11} />
                  <span dir="ltr">{wf.runs}</span> {t('runs')}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Clock" size={11} />
                  {t(wf.lastRun)}
                </span>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
