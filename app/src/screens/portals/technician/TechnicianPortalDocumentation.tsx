import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every "document" row (a Toyota
 * diagnostics guide, a Honda TSB, ...) was a hardcoded fixture with an
 * invented page count and last-updated date.
 *
 * There is no documents/manuals collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json — service manuals and
 * TSBs are a document library this API does not model or store. Rather
 * than invent a manual catalog, this is an honest GAP state, following
 * CallCenterLogs.tsx's pattern. */
export function TechnicianPortalDocumentation() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="BookOpen" title={t('Documentation')} subtitle={t('Service manuals and technical guides')} />

      <Card className="p-4">
        <EmptyState
          icon="BookOpen"
          title={t('Documentation has no data source yet')}
          description={t(
            'Service manuals, TSBs and technical guides are a document library this API does not expose. Nothing is shown here rather than invented documents.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">documents</span>
        </p>
      </Card>
    </div>
  )
}
