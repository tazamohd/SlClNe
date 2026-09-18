import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every KPI (18 present days, 94%
 * attendance rate, ...) and every daily record were hardcoded fixture
 * data — and internally inconsistent with each other (18 present days
 * claimed against only 8 visible rows).
 *
 * There is no attendance collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json, the same gap as
 * Time Clock (TechnicianPortalTimeClock.tsx). Rather than invent monthly
 * attendance, this is an honest GAP state, following CallCenterLogs.tsx's
 * pattern. */
export function TechnicianPortalAttendance() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="CalendarCheck" title={t('Attendance')} subtitle={t('Monthly attendance records')} />

      <Card className="p-4">
        <EmptyState
          icon="CalendarCheck"
          title={t('Attendance has no data source yet')}
          description={t(
            'Daily check-in/out records are not recorded by any system this API exposes. Nothing is shown here rather than invented attendance.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">attendance</span>
        </p>
      </Card>
    </div>
  )
}
