import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { PageHeader } from '@/components/ui/PageHeader'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { GapCard } from '@/components/ui/GapCard'

/** Accounts Payable.
 *
 *  Rendered invented rows and figures from local constants until BLK-004
 *  bucket C (2026-09). No collection in `packages/contract` or
 *  `API_REGISTRY.json` serves this screen, so it now shows the honest gap
 *  state (`GapCard`) instead of fixture data presented as real. Wire it to
 *  `accountsPayable` once the API serves it. */
export function AccountsPayable() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const gap = <GapCard icon="ArrowUpRight" collection="accountsPayable" />

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ArrowUpRight" title={t('Accounts Payable')} subtitle={t('Accounting')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ArrowUpRight" title={t('Accounts Payable')} subtitle={t('Accounting')} />
      {gap}
    </div>
  )
}
