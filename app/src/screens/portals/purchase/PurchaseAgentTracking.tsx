import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every KPI and every shipment row
 * was a hardcoded fixture — and internally inconsistent with the rest of
 * the Purchase Agent screens' fake data (its own separate fake-supplier
 * roster and a `PO-2026-08xx` numbering scheme that matches neither
 * PurchaseAgentDelivery.tsx's `PO-24xx` fakes nor the real server codes).
 *
 * Same gap as its sibling PurchaseAgentDelivery.tsx: there is no
 * shipment/carrier-tracking collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json. This is the same
 * honest GAP state, following CallCenterLogs.tsx's pattern. */
export function PurchaseAgentTracking() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Truck" title={t('Shipment Tracking')} subtitle={t('Monitor purchase order deliveries')} />

      <Card className="p-4">
        <EmptyState
          icon="Truck"
          title={t('Shipment Tracking has no data source yet')}
          description={t(
            'Carrier, origin/destination and ETA for purchase-order shipments have no collection this API serves. Nothing is shown here rather than invented shipments.',
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
