import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every review row and every chat
 * message was a hardcoded fixture — invented advisor names, ratings,
 * comments and a fabricated two-sided chat transcript.
 *
 * There is no reviews or messages collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json — advisor messaging and
 * customer reviews are not modelled by this API. Rather than invent a chat
 * history and review feed, this is an honest GAP state, following
 * CallCenterLogs.tsx's pattern. */
export function ClientPortalReviewChat() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="MessageSquare" title={t('Reviews & Chat')} subtitle={t('Feedback and advisor messages')} />

      <Card className="p-4">
        <EmptyState
          icon="MessageSquareOff"
          title={t('Reviews & Chat has no data source yet')}
          description={t(
            'Advisor messages and customer reviews are not recorded by any system this API exposes. Nothing is shown here rather than invented conversations.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">reviews / messages</span>
        </p>
      </Card>
    </div>
  )
}
