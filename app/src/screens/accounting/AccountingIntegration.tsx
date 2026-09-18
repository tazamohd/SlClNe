import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCard,
  MobileCardHeader,
  MobileCardRow,
  MobilePageHeader,
} from '@/components/shell/MobileShell'
import { useCollection, type RowOf } from '@/data/useCollection'

/** Accounting Integrations (`/accounting-integration`) — the accounting/ERP
 *  connectors this deployment is wired to, read from `integrations`
 *  (`GET /integrations`, `cat === 'ERP'`) through the repository seam, the
 *  same collection `SystemIntegrations.tsx` reads unfiltered.
 *
 *  This used to show a fixed `MOCK_INTEGRATIONS` array with every connector
 *  hardcoded `Connected`, including systems no adapter in this codebase has
 *  ever talked to. There is no live accounting adapter here, so the honest
 *  state for QuickBooks, Xero, SAP Business One, Oracle Financials and Sage
 *  is `available` (known, not connected) or `pending` — never a fabricated
 *  `Connected`. The dataset carries no sync clock or record count, so those
 *  two rows are gone rather than filled in: that runtime state, if a real
 *  adapter existed, would come from `GET /diagnostics/integrations`, a
 *  different read not wired to this screen. The gap line names it instead of
 *  showing a number nothing produced. */

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
        {t('Not recorded in this dataset')}: {t('Last Sync')}, {t('Records Synced')}. {t('Endpoint')}:{' '}
        <span dir="ltr" className="font-mono">
          GET /diagnostics/integrations
        </span>
      </span>
    </p>
  )
}

export function AccountingIntegration() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const { data: integrations = [], isLoading, isError, error, refetch } = useCollection('integrations')

  const label = (row: Integration) => (rtl ? row.ar : row.name)
  const detail = (row: Integration) => (rtl ? row.ar_detail : row.detail)
  const connectors = integrations.filter((row) => row.cat === 'ERP')

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
        <MobilePageHeader
          icon="Link"
          title={t('Integrations')}
          subtitle={t('Accounting')}
        />
        {connectors.length === 0 ? (
          <Card className="p-6">
            <EmptyState icon="Link" title={t('No integrations found')} />
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {connectors.map((intg) => (
              <MobileCard key={intg.name}>
                <MobileCardHeader
                  leading={
                    <div className="flex items-center gap-2">
                      <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden>
                        <Icon name={intg.icon} size={14} />
                      </span>
                      <p className="text-[13px] font-semibold text-heading">{label(intg)}</p>
                    </div>
                  }
                  trailing={<StatusBadge value={intg.status} />}
                />
                <MobileCardRow value={detail(intg)} />
              </MobileCard>
            ))}
          </div>
        )}
        <FieldGap />
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Link"
        title={t('Accounting Integrations')}
        subtitle={t('External system connections and sync status')}
      />

      {connectors.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon="Link" title={t('No integrations found')} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {connectors.map((intg) => (
            <Card key={intg.name} className="flex flex-col gap-4 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex rounded-lg p-2 bg-tint-blue text-salis-blue" aria-hidden>
                    <Icon name={intg.icon} size={18} />
                  </span>
                  <span className="text-base font-bold text-heading">{label(intg)}</span>
                </div>
                <StatusBadge value={intg.status} />
              </div>
              <p className="text-[13px] text-muted">{detail(intg)}</p>
            </Card>
          ))}
        </div>
      )}
      <FieldGap />
    </div>
  )
}
