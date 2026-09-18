import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'

/* This screen was MOCK_ONLY (BLK-004): the plan name, billing amount,
 * billing dates and usage stats ("8 / 15 Users", "4.2 / 20 GB Storage")
 * were hardcoded fixture data. It already disclosed this when offline
 * ("...the plan, usage and history above are simulated demo data"), but
 * still rendered the fabricated numbers either way.
 *
 * There is no subscription/billing collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json. Rather than invent a
 * billing plan, this is an honest GAP state, following
 * CallCenterLogs.tsx's pattern. */
export function Subscription() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-5">
      <EmptyState
        icon="CreditCard"
        title={t('Subscription has no data source yet')}
        description={t(
          'Plan, billing schedule and usage limits have no collection this API serves. Nothing is shown here rather than invented billing data.',
        )}
      />
      <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">subscription</span>
      </p>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="CreditCard" title={t('Subscription')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex max-w-[800px] animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <h1 className="font-display text-[30px] font-black text-heading">{t('Subscription')}</h1>
      {gap}
    </div>
  )
}
