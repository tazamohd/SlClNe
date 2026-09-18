import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every KPI and every quotation row
 * (a fictional "Al-Futtaim Parts" bulk brake order, ...) was a hardcoded
 * fixture, reusing the same fake-supplier roster as the other Purchase
 * Agent screens.
 *
 * This is the same concept `Procurement.tsx`'s `PartsNetworkQuotations`
 * already handles honestly — supplier quotations with no live collection
 * (`partsNetworkQuotes`) behind them. Rather than invent a second,
 * disagreeing set of fake quotes, this is the same honest GAP state. */
export function PurchaseAgentQuotations() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="FileText" title={t('Quotations')} subtitle={t('Supplier quotation management')} />

      <Card className="p-4">
        <EmptyState
          icon="FileText"
          title={t('Quotations has no data source yet')}
          description={t(
            'Supplier quotations would live in a collection this API does not serve yet, so none are shown rather than fabricated ones.',
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
