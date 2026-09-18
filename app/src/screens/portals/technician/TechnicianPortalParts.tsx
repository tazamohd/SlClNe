import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every KPI and every "parts request"
 * row (a brake-pad request against a work order, ...) was a hardcoded
 * fixture, and the KPIs didn't even match the fixture rows' own status
 * counts.
 *
 * This is a request/approval workflow — a technician asking for parts
 * against a job — not the parts catalog itself (that's the real `parts`
 * collection SparePartsList.tsx and Inventory.tsx already read). There is
 * no partRequests collection in Repository (app/src/data/repository.ts) or
 * API_REGISTRY.json for that workflow. Rather than invent a request queue,
 * this is an honest GAP state, following CallCenterLogs.tsx's pattern. */
export function TechnicianPortalParts() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Package" title={t('Parts Requests')} subtitle={t('Request and track parts')} />

      <Card className="p-4">
        <EmptyState
          icon="Package"
          title={t('Parts Requests has no data source yet')}
          description={t(
            'Requesting parts against a job and tracking their approval has no collection this API serves. Nothing is shown here rather than invented requests.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">partRequests</span>
        </p>
      </Card>
    </div>
  )
}
