import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { PageHeader } from '@/components/ui/PageHeader'

/** AI Analytics — usage dashboard for the AI assistant.
 *
 *  Previously showed fabricated KPIs ("4,821" total queries, "96.4%"
 *  satisfaction, "2.4M" tokens), a fabricated topic breakdown and a
 *  fabricated usage-over-time chart, all presented as real platform
 *  metrics. There is no AI usage/analytics collection anywhere in
 *  Repository or API_REGISTRY.json — the AI Assistant itself has no
 *  backend to generate this data from either (see AIAssistant.tsx).
 *  Rather than invent usage numbers, this is an honest GAP state,
 *  following CallCenterLogs.tsx's pattern. */
export function AIAnalytics() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-4">
      <EmptyState
        icon="Activity"
        title={t('AI Analytics has no data source yet')}
        description={t(
          'Query volume, response time, satisfaction and token usage have no collection this API serves. Nothing is shown here rather than invented metrics.',
        )}
      />
      <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">aiAnalytics</span>
      </p>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Activity" title={t('AI Analytics')} subtitle={t('AI Platform')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Activity" title={t('AI Analytics')} subtitle={t('AI Platform')} />
      {gap}
    </div>
  )
}
