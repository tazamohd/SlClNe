import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

/** System Integrations (`/system-integrations`) — the third-party connectors
 *  this deployment is wired to, read from `integrations` (`GET /integrations`)
 *  through the repository seam.
 *
 *  The collection carries the connector's name (English and Arabic), its
 *  category, its icon, its connection status and a one-line detail. It carries
 *  no adapter version and no last-activity clock, so those two rows are gone
 *  rather than filled in: runtime adapter state is `GET /diagnostics/integrations`
 *  — a different read, reporting `configured` honestly — and it is not wired to
 *  this screen. The gap line names it rather than showing a timestamp nothing
 *  produced.
 *
 *  Categories are the ones the data actually returns, not a fixed list, so a
 *  connector in a new category appears instead of silently vanishing.
 */

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
        {t('Not recorded in this dataset')}: {t('Last Activity')}, {t('Version')}. {t('Endpoint')}:{' '}
        <span dir="ltr" className="font-mono">
          GET /diagnostics/integrations
        </span>
      </span>
    </p>
  )
}

export function SystemIntegrations() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const { data: integrations = [], isLoading, isError, error, refetch } = useCollection('integrations')

  const label = (row: Integration) => (rtl ? row.ar : row.name)
  const detail = (row: Integration) => (rtl ? row.ar_detail : row.detail)

  /** Category order follows first appearance in the read, so the grouping is
   *  the server's own and a new category needs no code change here. */
  const categories = useMemo(
    () => [...new Set(integrations.map((row) => row.cat))],
    [integrations],
  )

  if (isLoading) return <Loading label="Loading integrations..." />
  if (isError) {
    return (
      <Card className="p-6">
        <ErrorState description={error?.message} onRetry={() => void refetch()} />
      </Card>
    )
  }

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="PlugZap" title={t('Integrations')} subtitle={t('System connections')} />
        {integrations.length === 0 ? (
          <Card className="p-6">
            <EmptyState icon="PlugZap" title={t('No integrations found')} />
          </Card>
        ) : (
          integrations.map((integration) => (
            <MobileCard key={integration.name}>
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2">
                    <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden>
                      <Icon name={integration.icon} size={14} />
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-heading">{label(integration)}</p>
                      <p className="text-xs text-muted">{t(integration.cat)}</p>
                    </div>
                  </div>
                }
                trailing={<StatusBadge value={integration.status} />}
              />
              <MobileCardRow value={detail(integration)} />
            </MobileCard>
          ))
        )}
        <FieldGap />
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="PlugZap" title={t('System Integrations')} subtitle={t('Third-party connections and API integrations')} />

      {integrations.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon="PlugZap" title={t('No integrations found')} />
        </Card>
      ) : (
        categories.map((category) => {
          const items = integrations.filter((row) => row.cat === category)
          if (items.length === 0) return null
          return (
            <div key={category}>
              <p className="mb-3 text-sm font-bold text-heading">{t(category)}</p>
              <div className="grid grid-cols-2 gap-4">
                {items.map((integration) => (
                  <Card key={integration.name} className="rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="flex flex-shrink-0 rounded-xl p-2.5 bg-tint-blue text-salis-blue" aria-hidden>
                        <Icon name={integration.icon} size={20} />
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-heading">{label(integration)}</p>
                          <StatusBadge value={integration.status} />
                        </div>
                        <p className="mt-1 text-xs text-muted">{detail(integration)}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })
      )}
      <FieldGap />
    </div>
  )
}
