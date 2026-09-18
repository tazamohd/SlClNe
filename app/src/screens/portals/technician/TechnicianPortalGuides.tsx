import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every "repair guide" row (brake pad
 * replacement, timing belt, ...) was a hardcoded fixture with an invented
 * step count and estimated time.
 *
 * There is no repair-guide collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json — the same gap as
 * Documentation (TechnicianPortalDocumentation.tsx). Rather than invent a
 * guide library, this is an honest GAP state, following CallCenterLogs.tsx's
 * pattern. */
export function TechnicianPortalGuides() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="BookMarked" title={t('Repair Guides')} subtitle={t('Step-by-step repair procedures')} />

      <Card className="p-4">
        <EmptyState
          icon="BookMarked"
          title={t('Repair Guides has no data source yet')}
          description={t(
            'Step-by-step repair procedures are a content library this API does not expose. Nothing is shown here rather than invented guides.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">repairGuides</span>
        </p>
      </Card>
    </div>
  )
}
