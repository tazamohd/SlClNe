import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

/** SMS Integration (`/sms-integration`) — the SMS/WhatsApp connectors this
 *  deployment is wired to, read from `integrations` (`GET /integrations`,
 *  `cat === 'Messaging'`) through the repository seam — the same collection
 *  `AccountingIntegration.tsx` and `SystemIntegrations.tsx` already read
 *  through, filtered.
 *
 *  This used to render a fixed `PROVIDERS` array claiming Unifonic and
 *  Twilio were `Connected`, with a masked API key and invented sent/delivery
 *  figures, plus a `SMS_LOGS` array of six fabricated messages — including
 *  one labelled `OTP` and `Delivered`, which asserted OTP delivery worked
 *  when this codebase's real OTP transport (`auth/otp.ts`) is
 *  `unconfigured` by default and refuses. There is no adapter for Unifonic,
 *  Twilio or WhatsApp Business anywhere in this codebase, and the campaign
 *  dispatch transport (`server/src/integrations/messaging.ts`) that
 *  `POST /crm/campaigns/:id/send` calls is unconfigured the same way — so
 *  the honest status is never `Connected`.
 *
 *  There is also no message-log table or endpoint, so the log below is an
 *  honest gap state rather than invented rows, the same pattern
 *  `PortalCommunications.tsx` uses. */

type Integration = RowOf<'integrations'>

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  connected: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  pending: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  available: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' },
}

function StatusBadge({ value }: { value: string }) {
  const { t } = usePreferences()
  const style = STATUS_STYLES[value] ?? STATUS_STYLES.available
  return (
    <Badge background={style.bg} color={style.fg}>
      {t(value.charAt(0).toUpperCase() + value.slice(1))}
    </Badge>
  )
}

/** What `GET /integrations` does not return, named rather than invented. */
function FieldGap() {
  const { t } = usePreferences()
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-muted">
      <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
      <span>
        {t('Not recorded in this dataset')}: {t('Sent Today')}, {t('Delivery Rate')}. {t('Endpoint')}:{' '}
        <span dir="ltr" className="font-mono">
          GET /diagnostics/integrations
        </span>
      </span>
    </p>
  )
}

export function SMSIntegration() {
  const { t, rtl } = usePreferences()
  const { data: integrations = [], isLoading, isError, error, refetch } = useCollection('integrations')

  const label = (row: Integration) => (rtl ? row.ar : row.name)
  const detail = (row: Integration) => (rtl ? row.ar_detail : row.detail)
  const providers = integrations.filter((row) => row.cat === 'Messaging')

  if (isLoading) return <Loading label="Loading integrations..." />
  if (isError) {
    return (
      <Card className="p-6">
        <ErrorState description={error?.message} onRetry={() => void refetch()} />
      </Card>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="MessageSquareText" title={t('SMS Integration')} subtitle={t('SMS provider setup and message logs')} />

      {providers.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon="MessageSquareText" title={t('No integrations found')} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider.name} className="rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex rounded-xl p-2.5 bg-tint-blue text-salis-blue" aria-hidden>
                    <Icon name={provider.icon} size={20} />
                  </span>
                  <p className="text-sm font-bold text-heading">{label(provider)}</p>
                </div>
                <StatusBadge value={provider.status} />
              </div>
              <p className="mt-3 text-xs text-muted">{detail(provider)}</p>
            </Card>
          ))}
        </div>
      )}
      <FieldGap />

      <div>
        <p className="mb-3 text-sm font-bold text-heading">{t('Message Log')}</p>
        <Card className="p-4">
          <EmptyState
            icon="MessageSquareOff"
            title={t('Message Log has no data source yet')}
            description={t(
              'Sent messages are not recorded by any table or endpoint this API exposes. Nothing is shown here rather than invented messages.',
            )}
          />
          <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
            <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
            {t('Connect the API — no data source yet:')}{' '}
            <span dir="ltr" className="font-mono text-body">messages</span>
          </p>
        </Card>
      </div>
    </div>
  )
}
