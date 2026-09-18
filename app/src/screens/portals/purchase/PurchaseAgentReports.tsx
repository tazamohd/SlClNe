import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every KPI and every report row
 * ("Monthly Spend Summary: 284,500 SAR", ...) was a hardcoded fixture —
 * the most fabricated file in this group, since even its KPIs weren't
 * derived from its own fake report list.
 *
 * There is no procurement-analytics/reporting collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json — spend analysis,
 * supplier scorecards and compliance audits would need aggregation this
 * API doesn't compute. Rather than invent report figures, this is an
 * honest GAP state, following CallCenterLogs.tsx's pattern. */
export function PurchaseAgentReports() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="BarChart3" title={t('Procurement Reports')} subtitle={t('Spend analysis, supplier performance, and savings')} />

      <Card className="p-4">
        <EmptyState
          icon="BarChart3"
          title={t('Procurement Reports has no data source yet')}
          description={t(
            'Spend analysis, supplier scorecards and compliance figures have no collection this API serves. Nothing is shown here rather than invented reports.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">procurementReports</span>
        </p>
      </Card>
    </div>
  )
}
