import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const PROFILE = {
  name: 'Abdullah Al-Qahtani',
  email: 'abdullah.q@email.com',
  phone: '+966 55 123 4567',
  nationalId: '109XXXXXXX',
  memberSince: '2023-03-15',
  loyaltyTier: 'Gold',
  totalVisits: 14,
  preferredBranch: 'Riyadh - Olaya',
}

const PERSONAL_FIELDS = [
  { label: 'Full Name', value: PROFILE.name, icon: 'User' },
  { label: 'Email', value: PROFILE.email, icon: 'Mail' },
  { label: 'Phone', value: PROFILE.phone, icon: 'Phone' },
  { label: 'National ID', value: PROFILE.nationalId, icon: 'CreditCard' },
]

const MEMBERSHIP_FIELDS = [
  { label: 'Member Since', value: PROFILE.memberSince },
  { label: 'Loyalty Tier', value: PROFILE.loyaltyTier },
  { label: 'Total Visits', value: String(PROFILE.totalVisits) },
  { label: 'Preferred Branch', value: PROFILE.preferredBranch },
]

export function ClientPortalProfile() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="User" title={t('My Profile')} subtitle={t('Account details')} />
        <Card className="rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(10,94,215,.1)] text-salis-blue">
              <Icon name="User" size={24} />
            </span>
            <div>
              <p className="text-[15px] font-bold text-heading">{PROFILE.name}</p>
              <Badge background="rgba(245,158,11,.1)" color="rgb(245,158,11)">{t(PROFILE.loyaltyTier)}</Badge>
            </div>
          </div>
        </Card>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Personal Information')}</p>} />
          {PERSONAL_FIELDS.map((f, i) => (
            <MobileCardRow key={i} label={t(f.label)} value={f.value} />
          ))}
        </MobileCard>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Membership')}</p>} />
          {MEMBERSHIP_FIELDS.map((f, i) => (
            <MobileCardRow key={i} label={t(f.label)} value={f.value} />
          ))}
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="User" title={t('My Profile')} subtitle={t('Account details and preferences')} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="User" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('Personal Information')}</h2>
          </div>
          <div className="grid gap-4">
            {PERSONAL_FIELDS.map((f, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <Icon name={f.icon} size={14} className="text-muted" />
                  <span className="text-sm text-muted">{t(f.label)}</span>
                </div>
                <span className="text-sm font-medium text-heading">{f.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Award" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('Membership')}</h2>
          </div>
          <div className="grid gap-4">
            {MEMBERSHIP_FIELDS.map((f, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-muted">{t(f.label)}</span>
                {f.label === 'Loyalty Tier' ? (
                  <Badge background="rgba(245,158,11,.1)" color="rgb(245,158,11)">{t(f.value)}</Badge>
                ) : (
                  <span className="text-sm font-medium text-heading">{f.value}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
