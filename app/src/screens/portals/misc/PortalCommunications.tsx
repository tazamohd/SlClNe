import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every KPI (248 total messages, 94%
 * response rate, ...) and every message row (Ahmed Al-Rashid's WhatsApp,
 * Gulf Motor Supply's shipping email, ...) were hardcoded fixture data for
 * seven fictional messages.
 *
 * There is no messages/notifications collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json — email, SMS and
 * WhatsApp messages are handled by external channels this API does not
 * model or store. Rather than invent a message inbox, this is an honest GAP
 * state, following the same pattern as CallCenterLogs.tsx. */
export function PortalCommunications() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="MessageSquare" title={t('Communications')} subtitle={t('Messages, notifications, and alerts')} />

      <Card className="p-4">
        <EmptyState
          icon="MessageSquareOff"
          title={t('Communications has no data source yet')}
          description={t(
            'Email, SMS and WhatsApp messages are handled by external channels this API does not expose or store. Nothing is shown here rather than invented messages.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">messages</span>
        </p>
      </Card>
    </div>
  )
}
