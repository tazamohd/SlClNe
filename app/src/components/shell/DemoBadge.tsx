import { useSession } from '@/providers/SessionProvider'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from '@/components/ui/Icon'

/** Shown wherever the session is running on fixture data rather than a live
 *  API (`VITE_API_URL` unset — the same `live` flag Login.tsx uses to decide
 *  whether to show the demo role picker). Every shell mounts this once so a
 *  demo session carries an unmistakable, permanent marker rather than one
 *  confined to the login screen — nothing on screen should ever be readable
 *  as real customer data or a live transaction. */
export function DemoBadge({ compact = false }: { compact?: boolean }) {
  const { live } = useSession()
  const { t } = usePreferences()
  if (live) return null
  return (
    <span
      data-testid="demo-environment-badge"
      title={t('Demo environment — no real data')}
      className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-salis-orange bg-tint-orange px-2.5 py-1 font-action text-[11px] font-bold uppercase tracking-wide text-salis-orange"
    >
      <Icon name="FlaskConical" size={12} />
      {compact ? t('Demo') : t('Demo environment — no real data')}
    </span>
  )
}
