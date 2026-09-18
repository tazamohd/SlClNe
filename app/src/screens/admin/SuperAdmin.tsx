import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): every KPI and every tenant row
 * ("SALIS Auto Workshop", "Gulf Motors", "Al-Jazeera Auto", ...) was a
 * hardcoded fixture, with no `isLive` check at all.
 *
 * Same gap as its sibling Organizations.tsx: there is no multi-tenant
 * organizations collection in Repository (app/src/data/repository.ts) or
 * API_REGISTRY.json. Rather than invent a platform-wide tenant list, this
 * is an honest GAP state, following CallCenterLogs.tsx's pattern. */
export function SuperAdmin() {
  const { t } = usePreferences()

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Shield" title={t('Super Admin')} subtitle={t('Platform Control')} />

      <Card className="p-4">
        <EmptyState
          icon="Shield"
          title={t('Super Admin has no data source yet')}
          description={t(
            'Platform-wide tenants, their plans and usage have no collection this API serves. Nothing is shown here rather than invented tenants.',
          )}
        />
        <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
          <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
          {t('Connect the API — no data source yet:')}{' '}
          <span dir="ltr" className="font-mono text-body">organizations</span>
        </p>
      </Card>
    </div>
  )
}
