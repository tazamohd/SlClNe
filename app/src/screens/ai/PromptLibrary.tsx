import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'

/* This screen was MOCK_ONLY (BLK-004): all 9 prompt cards ("Monthly Revenue
 * Summary", "Inventory Reorder Check", ...) — their category, preview text,
 * use count and favorited state — were hardcoded fixture data; only the
 * search box over that fixture list actually worked.
 *
 * There is no prompt-library collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json. Rather than invent a
 * prompt gallery, this is an honest GAP state, following
 * CallCenterLogs.tsx's pattern. */
export function PromptLibrary() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-4">
      <EmptyState
        icon="BookMarked"
        title={t('Prompt Library has no data source yet')}
        description={t(
          'Saved AI prompts, their categories and use counts have no collection this API serves. Nothing is shown here rather than invented prompts.',
        )}
      />
      <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">promptLibrary</span>
      </p>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="BookMarked" title={t('Prompt Library')} subtitle={t('AI Platform')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
          <Icon name="BookMarked" size={28} />
        </span>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Prompt Library')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('AI Platform')}</p>
        </div>
      </div>
      {gap}
    </div>
  )
}
