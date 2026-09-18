import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'

/* This screen was MOCK_ONLY (BLK-004): the selected model, temperature,
 * max-tokens, behavior toggles and system prompt were all local `useState`
 * defaults with no persistence, and "Tokens Used 2.4M / 5M" / "Estimated
 * Cost SAR 1,840" were hardcoded fixture numbers with no `isLive` check at
 * all — "Save Changes" only fired a toast.
 *
 * There is no AI-model-configuration or AI-usage collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json. Rather than invent a
 * configuration state, this is an honest GAP state, following
 * CallCenterLogs.tsx's pattern. */
export function ModelSettings() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-4">
      <EmptyState
        icon="SlidersHorizontal"
        title={t('Model Settings has no data source yet')}
        description={t(
          'AI model choice, parameters and usage/cost have no collection this API serves. Nothing is shown here rather than invented settings.',
        )}
      />
      <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">aiModelSettings</span>
      </p>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="SlidersHorizontal" title={t('Model Settings')} subtitle={t('AI Platform')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
          <Icon name="SlidersHorizontal" size={28} />
        </span>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Model Settings')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('AI Platform')}</p>
        </div>
      </div>
      {gap}
    </div>
  )
}
