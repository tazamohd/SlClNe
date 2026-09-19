import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { PageHeader } from '@/components/ui/PageHeader'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { GapCard } from '@/components/ui/GapCard'

/** Loaner Vehicles.
 *
 *  Rendered invented rows and figures from local constants until BLK-004
 *  bucket C (2026-09). No collection in `packages/contract` or
 *  `API_REGISTRY.json` serves this screen, so it now shows the honest gap
 *  state (`GapCard`) instead of fixture data presented as real. Wire it to
 *  `loanerVehicles` once the API serves it. */
export function LoanerVehicles() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const gap = <GapCard icon="Car" collection="loanerVehicles" />

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Car" title={t('Loaner Vehicles')} subtitle={t('Courtesy cars issued while a customer vehicle is in the workshop')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Car" title={t('Loaner Vehicles')} subtitle={t('Courtesy cars issued while a customer vehicle is in the workshop')} />
      {gap}
    </div>
  )
}
