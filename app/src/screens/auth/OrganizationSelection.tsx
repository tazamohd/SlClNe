import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/States'
import { AuthLayout, BrandMark } from '@/components/shell/AuthLayout'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

/** Select or create an organization.
 *
 *  Previously showed a hardcoded list of three organizations ("SALIS AUTO
 *  Holding", "Al-Amri Auto Group", "Najd Motors Est.") with invented member
 *  counts, plus a search box that only filtered that fake list. There is no
 *  multi-tenant organizations collection anywhere in Repository or
 *  API_REGISTRY.json — same gap already established for the admin
 *  Organizations.tsx directory screen. "Continue" now stays honestly
 *  disabled unconditionally (it previously enabled itself when `isLive`,
 *  which would have looked like a real action with no real org to select). */
export function OrganizationSelection() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  return (
    <AuthLayout className={isMobile ? 'mx-auto max-w-full' : 'mx-auto max-w-[440px]'}>
      <div className={`flex flex-col ${isMobile ? 'gap-3.5' : 'gap-5'}`}>
        {/* Header */}
        <div className="text-center">
          <BrandMark width={isMobile ? 80 : 100} />
          <h1 className={`mt-3 font-display font-extrabold text-heading ${isMobile ? 'text-lg' : 'text-xl'}`}>
            {t('Organization Selection')}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted">
            {t('Select your organization')}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <EmptyState
            icon="Building2"
            title={t('Organization selection has no data source yet')}
            description={t(
              'This deployment has no organization directory to select from. Nothing is shown here rather than invented organizations.',
            )}
          />
          <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
            <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
            {t('Connect the API — no data source yet:')}{' '}
            <span dir="ltr" className="font-mono text-body">organizations</span>
          </p>
        </div>

        {/* Continue */}
        <Button size="lg" className="w-full" disabled>
          {t('Continue')}
        </Button>
      </div>
    </AuthLayout>
  )
}
