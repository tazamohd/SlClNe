import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { PageHeader } from '@/components/ui/PageHeader'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { GapCard } from '@/components/ui/GapCard'

/** Smart Damage Assessment.
 *
 *  Rendered invented rows and figures from local constants until BLK-004
 *  bucket C (2026-09). No collection in `packages/contract` or
 *  `API_REGISTRY.json` serves this screen, so it now shows the honest gap
 *  state (`GapCard`) instead of fixture data presented as real. Wire it to
 *  `smartDamageAssessment` once the API serves it. */
export function SmartDamageAssessment() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const gap = <GapCard icon="ScanEye" collection="smartDamageAssessment" />

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ScanEye" title={t('Smart Damage Assessment')} subtitle={t('AI-powered damage detection and cost estimation')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ScanEye" title={t('Smart Damage Assessment')} subtitle={t('AI-powered damage detection and cost estimation')} />
      {gap}
    </div>
  )
}
