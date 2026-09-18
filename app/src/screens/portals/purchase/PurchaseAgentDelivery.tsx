import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every KPI and every delivery row
 * (a fictional Aramex tracking number against a fictional PO, ...) was a
 * hardcoded fixture.
 *
 * There is no shipment/carrier-tracking collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json — `Procurement.tsx`'s
 * `PartsSupplyNetwork` already shows this honestly as an all-zero
 * "Shipments" tab rather than inventing tracking numbers. This is the same
 * honest GAP state, following CallCenterLogs.tsx's pattern. */
export function PurchaseAgentDelivery() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Truck" title={t('Deliveries')} subtitle={t('Track incoming shipments and deliveries')} />

      <Card className="p-4">
        <EmptyState
          icon="Truck"
          title={t('Deliveries has no data source yet')}
          description={t(
            'Carrier, tracking number and ETA for incoming shipments have no collection this API serves. Nothing is shown here rather than invented deliveries.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">shipments</span>
        </p>
      </Card>
    </div>
  )
}
