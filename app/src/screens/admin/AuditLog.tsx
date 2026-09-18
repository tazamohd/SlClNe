import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'

/* This screen was MOCK_ONLY (BLK-004): it already had an honest offline
 * gap branch ("Audit log requires a live API"), but the "live" branch
 * still rendered hardcoded `FIXTURE_ENTRIES` — invented users ("Khalid
 * Al-Amri", "Yousef Al-Otaibi", "Layla Al-Sulaiman"), IPs, job-card codes
 * and estimate amounts. That branch was never actually reachable
 * honestly: there is no general audit-log collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json — `history` exists
 * only as a per-record (estimate/job) trail, not a system-wide feed.
 *
 * Now an honest GAP state unconditionally, following
 * CallCenterLogs.tsx's pattern, rather than a live/offline branch where
 * "live" meant "fabricated". */
export function AuditLog() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-4">
      <EmptyState
        icon="ScrollText"
        title={t('Audit Log has no data source yet')}
        description={t('System actions, login events and data changes have no collection this API serves. Nothing is shown here rather than invented entries.')}
      />
      <p className="mt-1 flex items-start justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">auditLog</span>
      </p>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ScrollText" title={t('Audit Log')} subtitle={t('Track all system actions')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-salis-gradient text-white shadow-[0_8px_20px_rgba(10,94,215,.25)]">
          <Icon name="ScrollText" size={24} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-black text-heading">{t('Audit Log')}</h1>
          <p className="mt-0.5 text-sm text-muted">{t('Track all system actions')}</p>
        </div>
      </div>
      {gap}
    </div>
  )
}
