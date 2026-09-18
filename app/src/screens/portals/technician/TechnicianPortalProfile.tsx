import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

/* This screen was MOCK_ONLY (BLK-004): the name, employee ID, role,
 * department, branch, phone, email, hire date and every certification were
 * a hardcoded fake technician ("Ahmed Al-Farsi", EMP-1042, ...).
 *
 * Full Name, Role and Email are now the signed-in technician's own real
 * identity from `useSession()` — the same source `TechnicianPortal.tsx`'s
 * greeting hero already reads. Employee ID, department, branch, phone,
 * hire date and certifications have no backing field or collection in
 * Repository (app/src/data/repository.ts) or API_REGISTRY.json, so they're
 * an honest GAP note rather than invented values. */
export function TechnicianPortalProfile() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { userName, roleLabel, user } = useSession()

  const personalFields = [
    { label: 'Full Name', value: userName, icon: 'User' },
    { label: 'Role', value: roleLabel, icon: 'Briefcase' },
    ...(user?.email ? [{ label: 'Email', value: user.email, icon: 'Mail' }] : []),
  ]

  const gapNote = (
    <Card className="rounded-2xl p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Award" size={16} /></span>
        <h2 className="text-sm font-semibold text-heading">{t('Work Details & Certifications')}</h2>
      </div>
      <EmptyState
        icon="Award"
        title={t('Work Details & Certifications has no data source yet')}
        description={t('Employee ID, department, branch, hire date and certifications are not recorded by any system this API exposes.')}
      />
    </Card>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="User" title={t('My Profile')} subtitle={t('Technician details')} />
        <Card className="rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tint-blue text-salis-blue">
              <Icon name="User" size={24} />
            </span>
            <div>
              <p className="text-[15px] font-bold text-heading">{userName}</p>
              <p className="text-xs text-muted">{roleLabel}</p>
            </div>
          </div>
        </Card>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Personal')}</p>} />
          {personalFields.map((f) => (
            <MobileCardRow key={f.label} label={t(f.label)} value={f.value} />
          ))}
        </MobileCard>
        {gapNote}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="User" title={t('My Profile')} subtitle={t('Technician profile and certifications')} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="User" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('Personal')}</h2>
          </div>
          <div className="grid gap-4">
            {personalFields.map((f) => (
              <div key={f.label} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <Icon name={f.icon} size={14} className="text-muted" />
                  <span className="text-sm text-muted">{t(f.label)}</span>
                </div>
                <span className="text-sm font-medium text-heading">{f.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {gapNote}
      </div>
    </div>
  )
}
