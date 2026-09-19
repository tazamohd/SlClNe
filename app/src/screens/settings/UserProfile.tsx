import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection } from '@/data/useCollection'

/** A read-only profile view — editing lives on `Profile` (`/profile`).
 *
 *  Previously a single hardcoded `PROFILE` object ("Ahmed Al-Rashid",
 *  Operations, Riyadh Main, joined 2023-03-15, last login "2026-08-18 09:14")
 *  regardless of who was actually signed in, plus a `STATS` row ("1,247 Jobs
 *  Completed", "4.8 Avg Rating") with no collection behind either number.
 *  `useSession()` already carries the real identity: name, email, role and
 *  branch. `department`, `joinedDate` and `lastLogin` have no column on
 *  `users` (`server/src/db/schema.ts`) to read them from, and the stats have
 *  no collection at all, so all five are dropped rather than re-invented. */
export function UserProfile() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { userName, roleLabel, user } = useSession()
  const branches = useCollection('branches')

  const branchName = user?.branchId
    ? (branches.data ?? []).find((b) => b._id === user.branchId)?.name
    : undefined

  const details = [
    { label: t('Role'), value: roleLabel },
    { label: t('Email'), value: user?.email ?? '—' },
    { label: t('Branch'), value: branchName ?? '—' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="User" title={t('User Profile')} subtitle={t('Profile view')} />
        <MobileCard>
          <div className="flex items-center gap-3 pb-3">
            <Avatar name={userName} size={48} />
            <div>
              <p className="text-[15px] font-semibold text-heading">{userName}</p>
              <p className="text-xs text-muted">{roleLabel}</p>
            </div>
          </div>
          {details.map((d) => (
            <MobileCardRow key={d.label} label={d.label} value={<span dir="ltr">{d.value}</span>} />
          ))}
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="User" title={t('User Profile')} subtitle={t('Profile view')} />

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 border-b border-border/50 pb-5">
          <Avatar name={userName} size={64} />
          <div>
            <h2 className="text-lg font-semibold text-heading">{userName}</h2>
            <p className="text-sm text-muted">{roleLabel}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4">
          {details.map((d) => (
            <div key={d.label} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-muted">{d.label}</span>
              <span dir="ltr" className="text-sm font-medium text-heading">{d.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
