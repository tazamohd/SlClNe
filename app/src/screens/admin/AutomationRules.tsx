import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

/* This screen was MOCK_ONLY (BLK-004): five fixture rules ("Low Stock
 * Alert", "Auto Invoice", "Appointment Reminder", "Overdue Follow-up",
 * "QC Notification") with hardcoded active/inactive toggle state were
 * presented as a real automation configuration.
 *
 * There is no automation-rules collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json. Rather than invent
 * rules, this is an honest GAP state, following CallCenterLogs.tsx's
 * pattern. */
export function AutomationRules() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-4">
      <EmptyState
        icon="Zap"
        title={t('Automation Rules has no data source yet')}
        description={t(
          'Trigger-based automation rules and their active/inactive state have no collection this API serves. Nothing is shown here rather than invented rules.',
        )}
      />
      <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">automationRules</span>
      </p>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Zap" title={t('Automation Rules')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
          <Icon name="Zap" size={28} />
        </span>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Automation Rules')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Administration')}</p>
        </div>
      </div>
      {gap}
    </div>
  )
}
