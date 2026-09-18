import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'

/* This screen was MOCK_ONLY (BLK-004): every organization card (a literal
 * "Al-Amri Auto Center" main org, "Al-Amri Express Service" subsidiary,
 * "AutoCare Training Academy" training center, with invented branch/
 * employee/user counts) was hardcoded fixture data.
 *
 * There is no multi-tenant organizations collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json — `branches` models
 * sub-branches of one organization, not multiple organizations, and is
 * itself seeded empty. Rather than invent an organization directory, this
 * is an honest GAP state, following CallCenterLogs.tsx's pattern. */
export function Organizations() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-4">
      <EmptyState
        icon="Building2"
        title={t('Organizations has no data source yet')}
        description={t(
          'Multi-tenant organizations, their branches, employees and users have no collection this API serves. Nothing is shown here rather than invented organizations.',
        )}
      />
      <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">organizations</span>
      </p>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Building2" title={t('Organizations')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex max-w-[1240px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
          <Icon name="Building2" size={24} />
        </span>
        <h1 className="font-display text-2xl font-black text-heading">{t('Organizations')}</h1>
      </div>
      {gap}
    </div>
  )
}
