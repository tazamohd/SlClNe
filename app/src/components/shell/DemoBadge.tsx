import { useSession } from '@/providers/SessionProvider'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from '@/components/ui/Icon'

/** Shown wherever the session is running on fixture data rather than a live
 *  API (`VITE_API_URL` unset — the same `live` flag Login.tsx uses to decide
 *  whether to show the demo role picker). Every shell mounts this once so a
 *  demo session carries an unmistakable, permanent marker rather than one
 *  confined to the login screen — nothing on screen should ever be readable
 *  as real customer data or a live transaction.
 *
 *  The border and icon carry the orange — `text-heading` carries the actual
 *  label. `text-salis-orange` on `bg-tint-orange` is exactly the brand-palette
 *  contrast pairing `e2e/a11y.spec.ts` documents as failing WCAG (the orange
 *  brand hue on its own tint); this badge is new on every shell it mounts in,
 *  so using that pairing here would raise the colour-contrast ratchet on
 *  every route that renders it — the one thing `BASELINE.json` never allows. */
export function DemoBadge({ compact = false }: { compact?: boolean }) {
  const { live } = useSession()
  const { t } = usePreferences()
  if (live) return null
  return (
    <span
      data-testid="demo-environment-badge"
      title={t('Demo environment — no real data')}
      className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-salis-orange bg-tint-orange px-2.5 py-1 font-action text-[11px] font-bold uppercase tracking-wide text-heading"
    >
      <Icon name="FlaskConical" size={12} className="text-salis-orange" />
      {compact ? t('Demo') : t('Demo environment — no real data')}
    </span>
  )
}
