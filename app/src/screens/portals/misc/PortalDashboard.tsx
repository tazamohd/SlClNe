import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every KPI (128 active users, 24
 * appointments today, ...), the four quick-action tiles and every "recent
 * portal activity" row (Ahmed Al-Rashid's oil change, INV-2026-1284, ...)
 * were hardcoded fixture data.
 *
 * "Portal Dashboard" has no defined owner — it isn't the customer, technician
 * or supplier portal's own dashboard (those exist separately and are real),
 * and there is no cross-portal activity-feed collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json for the row-level
 * content this screen exists to show. Rather than invent a portal activity
 * log, this is an honest GAP state, following the same pattern as
 * CallCenterLogs.tsx. */
export function PortalDashboard() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="LayoutDashboard" title={t('Portal Dashboard')} subtitle={t('Overview of portal activity and quick actions')} />

      <Card className="p-4">
        <EmptyState
          icon="LayoutDashboard"
          title={t('Portal Dashboard has no data source yet')}
          description={t(
            'A cross-portal activity feed (appointments booked, invoices paid, vehicles added, messages received across every portal) has no collection this API serves. Nothing is shown here rather than invented activity.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">portalActivity</span>
        </p>
      </Card>
    </div>
  )
}
