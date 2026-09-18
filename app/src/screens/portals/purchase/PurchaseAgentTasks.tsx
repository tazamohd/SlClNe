import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every KPI and every task row (an
 * approval assigned by a fictional "Fahad Al-Harbi", ...) was a hardcoded
 * fixture, and the KPIs didn't even match the fixture rows' own status
 * counts.
 *
 * There is no purchasing-task/action-item collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json. Rather than invent a
 * task queue, this is an honest GAP state, following CallCenterLogs.tsx's
 * pattern. */
export function PurchaseAgentTasks() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ListChecks" title={t('Tasks')} subtitle={t('Pending purchase actions')} />

      <Card className="p-4">
        <EmptyState
          icon="ListChecks"
          title={t('Tasks has no data source yet')}
          description={t(
            'Pending approvals, follow-ups and negotiations have no collection this API serves. Nothing is shown here rather than invented tasks.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">purchaseTasks</span>
        </p>
      </Card>
    </div>
  )
}
