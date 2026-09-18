import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

/* This screen was MOCK_ONLY (BLK-004): four fixture workflows ("Job Card
 * Lifecycle", "Invoice Approval", "Customer Onboarding", "Parts
 * Procurement") with invented run counts ("1,248 runs", "2 min ago") and
 * step sequences were presented as real configured automations.
 *
 * There is no workflows collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json. Rather than invent
 * workflows, this is an honest GAP state, following CallCenterLogs.tsx's
 * pattern. */
export function WorkflowBuilder() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-4">
      <EmptyState
        icon="GitBranch"
        title={t('Workflow Builder has no data source yet')}
        description={t(
          'Configured multi-step workflows, their status and run history have no collection this API serves. Nothing is shown here rather than invented workflows.',
        )}
      />
      <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">workflows</span>
      </p>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="GitBranch" title={t('Workflow Builder')} subtitle={t('AI Platform')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
          <Icon name="GitBranch" size={28} />
        </span>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Workflow Builder')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('AI Platform')}</p>
        </div>
      </div>
      {gap}
    </div>
  )
}
