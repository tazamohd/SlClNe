import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'

/** The honest state for a screen whose backend does not exist yet.
 *
 *  Waves 6 to 9 hand-wrote this card into each screen they triaged: an
 *  `EmptyState` naming the missing collection, so the page says "nothing is
 *  served here" instead of rendering invented rows and KPIs as if they were
 *  real. This is that card as one component, so the remaining fixture-only
 *  screens can adopt it in a line and `build-registry.mjs` can recognise the
 *  state (`NO_BACKEND`) rather than counting it as MOCK_ONLY.
 *
 *  `collection` is the repository key the screen would read once the API
 *  serves it. It is shown verbatim so the gap is actionable, not decorative. */
export function GapCard({ icon, collection }: { icon: string; collection: string }) {
  const { t } = usePreferences()
  return (
    <Card className="p-4">
      <EmptyState
        icon={icon}
        title={t('No data source connected yet')}
        description={t(
          'This screen has no collection the API serves yet. Nothing is shown here rather than invented rows.',
        )}
      />
      <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">{collection}</span>
      </p>
    </Card>
  )
}
