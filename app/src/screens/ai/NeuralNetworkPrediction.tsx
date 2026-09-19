import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { PageHeader } from '@/components/ui/PageHeader'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { GapCard } from '@/components/ui/GapCard'

/** Neural Network Prediction.
 *
 *  Rendered invented rows and figures from local constants until BLK-004
 *  bucket C (2026-09). No collection in `packages/contract` or
 *  `API_REGISTRY.json` serves this screen, so it now shows the honest gap
 *  state (`GapCard`) instead of fixture data presented as real. Wire it to
 *  `neuralNetworkPrediction` once the API serves it. */
export function NeuralNetworkPrediction() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const gap = <GapCard icon="Cpu" collection="neuralNetworkPrediction" />

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Cpu" title={t('Neural Network Prediction')} subtitle={t('Predictive maintenance using machine learning')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Cpu" title={t('Neural Network Prediction')} subtitle={t('Predictive maintenance using machine learning')} />
      {gap}
    </div>
  )
}
