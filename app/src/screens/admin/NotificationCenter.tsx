import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'

/* This screen was MOCK_ONLY (BLK-004): every notification row (a fictional
 * job card "JC-E5D7A3B5" for "Sara Al-Mutairi", an invoice overdue for
 * "Fatima Al-Zahrani · SAR 4,250", ...) was a hardcoded fixture, with no
 * `isLive` check at all — always fabricated, never honest even offline.
 *
 * There is no notifications collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json. Rather than invent a
 * notification feed, this is an honest GAP state, following
 * CallCenterLogs.tsx's pattern. */
export function NotificationCenter() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-8">
      <EmptyState
        icon="BellOff"
        title={t('Notification Center has no data source yet')}
        description={t(
          'Job, appointment, invoice and stock notifications have no collection this API serves. Nothing is shown here rather than invented notifications.',
        )}
      />
      <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">notifications</span>
      </p>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Bell" title={t('Notification Center')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-[800px] animate-fade-up flex-col gap-5 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Bell" size={28} />
          </div>
        </div>
        <h1 className="font-display text-[26px] font-black text-heading">{t('Notification Center')}</h1>
      </div>
      {gap}
    </div>
  )
}
