import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'

/* This screen was MOCK_ONLY (BLK-004): every template card ("Tax
 * Invoice", "Service Estimate", "Job Card Print", ...) was a hardcoded
 * fixture with an invented last-edit date, and "Copy" fired a toast
 * without copying anything real.
 *
 * There is no document-template collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json. Rather than invent a
 * template gallery, this is an honest GAP state, following
 * CallCenterLogs.tsx's pattern. */
export function Templates() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-4">
      <EmptyState
        icon="FileCode"
        title={t('Templates has no data source yet')}
        description={t(
          'Document templates (invoices, estimates, job cards, emails) have no collection this API serves. Nothing is shown here rather than invented templates.',
        )}
      />
      <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">documentTemplates</span>
      </p>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="FileCode" title={t('Templates')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
          <Icon name="FileCode" size={28} />
        </span>
        <h1 className="font-display text-[30px] font-black text-heading">{t('Templates')}</h1>
      </div>
      {gap}
    </div>
  )
}
