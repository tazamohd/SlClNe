import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every quote row (a fictional
 * "Al-Rajhi Auto Parts" oil-filter price, ...) was a hardcoded fixture,
 * and "Avg Savings: 14.2%" was a literal magic number with no derivation
 * from anything, fake or otherwise.
 *
 * There is no multi-supplier price-comparison/RFQ collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json. Rather than invent
 * competing supplier quotes, this is an honest GAP state, following
 * CallCenterLogs.tsx's pattern. */
export function PurchaseAgentPriceCompare() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="GitCompare" title={t('Price Comparison')} subtitle={t('Compare quotes across suppliers')} />

      <Card className="p-4">
        <EmptyState
          icon="GitCompare"
          title={t('Price Comparison has no data source yet')}
          description={t(
            'Comparing unit price, MOQ and lead time across suppliers for the same part has no collection this API serves. Nothing is shown here rather than invented quotes.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">partsNetworkQuotes</span>
        </p>
      </Card>
    </div>
  )
}
