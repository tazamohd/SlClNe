import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every KPI and every reminder row
 * (an oil change due for a fictional Camry, ...) was a hardcoded fixture,
 * with an invented mileage-due figure no schema field backs.
 *
 * There is no maintenance-reminders collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json — computing a due-date
 * or due-mileage schedule would need a maintenance-interval rules engine
 * this API doesn't have. Rather than invent a reminder schedule, this is an
 * honest GAP state, following CallCenterLogs.tsx's pattern. */
export function ClientPortalReminders() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Bell" title={t('Service Reminders')} subtitle={t('Upcoming maintenance schedule')} />

      <Card className="p-4">
        <EmptyState
          icon="Bell"
          title={t('Service Reminders has no data source yet')}
          description={t(
            'Upcoming maintenance due by date or mileage has no collection this API serves. Nothing is shown here rather than invented reminders.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">serviceReminders</span>
        </p>
      </Card>
    </div>
  )
}
