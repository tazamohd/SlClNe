import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'

/* This screen was MOCK_ONLY (BLK-004): every user row (a fictional
 * "Khalid Al-Amri" owner, "Ahmed Al-Rashid" manager, ...) and every team
 * card was hardcoded fixture data — invented emails, roles, "last login"
 * times and online/offline status.
 *
 * This screen's own concept — system user *accounts* (login, role,
 * session status) — has no backing collection in Repository
 * (app/src/data/repository.ts) or API_REGISTRY.json; there is no `users`
 * table at all. The adjacent concept of employment records (name,
 * department, hire date) is real and already honestly covered by
 * StaffDirectory.tsx (app/src/screens/hr/StaffDirectory.tsx), which reads
 * the real `employees`/`departments` collections — wiring this screen to
 * the same collections would just be a second, drifting copy of that
 * screen rather than the account/login data this screen is actually for.
 * Rather than invent user accounts, this is an honest GAP state,
 * following CallCenterLogs.tsx's pattern. */
export function UsersTeams() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const gap = (
    <Card className="p-4">
      <EmptyState
        icon="Users"
        title={t('Users & Teams has no data source yet')}
        description={t(
          'System user accounts, roles and login sessions have no collection this API serves. Nothing is shown here rather than invented accounts.',
        )}
      />
      <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">users</span>
      </p>
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Users" title={t('Users & Teams')} />
        {gap}
      </div>
    )
  }

  return (
    <div className="flex max-w-[1240px] animate-fade-up flex-col gap-4 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
          <Icon name="Users" size={24} />
        </span>
        <h1 className="font-display text-2xl font-black text-heading">{t('Users & Teams')}</h1>
      </div>
      {gap}
    </div>
  )
}
