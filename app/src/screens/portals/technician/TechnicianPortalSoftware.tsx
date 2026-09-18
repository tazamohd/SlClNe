import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every "software tool" row (Toyota
 * Techstream, Honda HDS, ...) was a hardcoded fixture with an invented
 * version number and license-expiry date.
 *
 * There is no software/license collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json — diagnostic tool
 * licenses are managed outside this app. Rather than invent a license
 * tracker, this is an honest GAP state, following CallCenterLogs.tsx's
 * pattern. */
export function TechnicianPortalSoftware() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Cpu" title={t('Diagnostic Software')} subtitle={t('Software tools and license management')} />

      <Card className="p-4">
        <EmptyState
          icon="Cpu"
          title={t('Diagnostic Software has no data source yet')}
          description={t(
            'Diagnostic tool versions and license status are not recorded by any system this API exposes. Nothing is shown here rather than invented licenses.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">diagnosticSoftware</span>
        </p>
      </Card>
    </div>
  )
}
