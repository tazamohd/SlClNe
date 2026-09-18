import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every KPI (6h 30m today, 33.5h this
 * week, 1.5h overtime) and every punch row were hardcoded fixture data, and
 * `clockedIn` was a hardcoded `useState(true)` rather than a real status.
 *
 * There is no time-clock collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json — `TechnicianMobile.tsx`
 * already shows this honestly as a "Not connected" tile rather than
 * inventing hours. This is the same honest GAP state, following
 * CallCenterLogs.tsx's pattern. */
export function TechnicianPortalTimeClock() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Clock" title={t('Time Clock')} subtitle={t('Clock in/out and time tracking')} />

      <Card className="p-4">
        <EmptyState
          icon="Clock"
          title={t('Time Clock has no data source yet')}
          description={t(
            'Clock-in/out punches, break time and overtime are not recorded by any system this API exposes. Nothing is shown here rather than invented hours.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">timeClock</span>
        </p>
      </Card>
    </div>
  )
}
