import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'

/* This screen was MOCK_ONLY (BLK-004): every backup-history row (a literal
 * "Jul 19, 2026, 3:00 AM — 482 MB", ...) was hardcoded fixture data, and
 * "Run Backup Now" / "Export Customers/Job Cards/Invoices" only fired a
 * toast rather than exporting the real `customers`/`jobs`/`invoices`
 * collections.
 *
 * There is no backups collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json. Rather than invent a
 * backup history, this is an honest GAP state, following
 * CallCenterLogs.tsx's pattern. */
export function Backup() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-4">
      <EmptyState
        icon="Database"
        title={t('Backup & Export has no data source yet')}
        description={t(
          'Scheduled backups and data exports have no collection this API serves. Nothing is shown here rather than invented backup history.',
        )}
      />
      <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">backups</span>
      </p>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Database" title={t('Backup & Export')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex max-w-[800px] animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <h1 className="font-display text-[30px] font-black text-heading">{t('Backup & Export')}</h1>
      {gap}
    </div>
  )
}
