import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'

/* This screen was MOCK_ONLY (BLK-004): the workshop name and phone number
 * were literal `useState` defaults ("Al-Amri Auto Center", a fake phone
 * number), the notification toggles had no backing state, and "Current
 * Plan: PRO" duplicated Subscription.tsx's own fabrication — none of it
 * read from anywhere, none of it saved anywhere (`Save Changes` only
 * fires a toast).
 *
 * There is no settings/workshop-profile collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json, the same gap as
 * AdvancedSettings.tsx. Rather than invent a configuration state, this is
 * an honest GAP state, following CallCenterLogs.tsx's pattern. */
export function Settings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-6">
      <EmptyState
        icon="Settings"
        title={t('Settings has no data source yet')}
        description={t(
          'Workshop profile, notification preferences and billing plan have no collection this API serves. Nothing is shown here rather than invented settings.',
        )}
      />
      <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">workshopSettings</span>
      </p>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Settings" title={t('Settings')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex max-w-[760px] animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <h1 className="font-display text-[30px] font-black text-heading">{t('Settings')}</h1>
      {gap}
    </div>
  )
}
