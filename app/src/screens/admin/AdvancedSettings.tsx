import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'

/* This screen was MOCK_ONLY (BLK-004): every setting item was a hardcoded
 * literal — the workshop's own name ("Al-Amri Auto Center"), VAT rate,
 * business hours, security toggle states, and integration connection
 * statuses ("ZATCA E-Invoice: Connected", "Accounting Software:
 * Disconnected") — none of it read from anywhere, all of it fake and
 * un-savable (`Save Changes` only fires a toast).
 *
 * There is no settings/workshop-profile collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json. Rather than invent a
 * configuration state, this is an honest GAP state, following
 * CallCenterLogs.tsx's pattern. */
export function AdvancedSettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-4">
      <EmptyState
        icon="Settings"
        title={t('Advanced Settings has no data source yet')}
        description={t(
          'Workshop profile, VAT rate, security preferences and integration status have no collection this API serves. Nothing is shown here rather than invented settings.',
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
        <MobilePageHeader icon="Settings" title={t('Advanced Settings')} subtitle={t('Configure your system')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex max-w-[900px] animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
          <Icon name="Settings" size={28} />
        </span>
        <div>
          <h1 className="font-display text-[26px] font-black text-heading">{t('Advanced Settings')}</h1>
          <p className="mt-0.5 text-sm text-muted">{t('Configure your system')}</p>
        </div>
      </div>

      {gap}
    </div>
  )
}
