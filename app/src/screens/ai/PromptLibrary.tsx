import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { PageHeader } from '@/components/ui/PageHeader'

/** Prompt Library — saved prompts for the AI assistant.
 *
 *  Previously showed nine fabricated prompts ("Monthly Revenue Summary",
 *  "Inventory Reorder Check", ...) with invented usage counts and
 *  favorited state, filterable by a search box that only searched that
 *  fake list. There is no prompt-library collection anywhere in
 *  Repository or API_REGISTRY.json, and the AI Assistant itself has no
 *  backend to run a saved prompt against (see AIAssistant.tsx). Rather
 *  than invent a library, this is an honest GAP state, following
 *  CallCenterLogs.tsx's pattern. */
export function PromptLibrary() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-4">
      <EmptyState
        icon="BookMarked"
        title={t('Prompt Library has no data source yet')}
        description={t(
          'Saved prompts, their categories and usage counts have no collection this API serves. Nothing is shown here rather than invented prompts.',
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
      <PageHeader icon="BookMarked" title={t('Prompt Library')} subtitle={t('AI Platform')} />
      {gap}
    </div>
  )
}
