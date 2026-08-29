import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const PROFILE = {
  name: 'Ahmed Al-Rashid',
  initials: 'AA',
  role: 'Service Manager',
  email: 'ahmed@salisauto.com',
  phone: '+966 50 123 4567',
  department: 'Operations',
  branch: 'Riyadh Main',
  joinedDate: '2023-03-15',
  lastLogin: '2026-08-18 09:14',
}

const STATS = [
  { label: 'Jobs Completed', value: '1,247', icon: 'CheckCircle' },
  { label: 'Avg Rating', value: '4.8', icon: 'Star' },
  { label: 'This Month', value: '38', icon: 'Calendar' },
]

export function UserProfile() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const details = [
    { label: t('Role'), value: PROFILE.role },
    { label: t('Email'), value: PROFILE.email },
    { label: t('Phone'), value: PROFILE.phone },
    { label: t('Department'), value: PROFILE.department },
    { label: t('Branch'), value: PROFILE.branch },
    { label: t('Joined'), value: PROFILE.joinedDate },
    { label: t('Last Login'), value: PROFILE.lastLogin },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="User" title={t('User Profile')} subtitle={t('Profile view')} />
        <MobileCard>
          <div className="flex items-center gap-3 pb-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-lg font-bold text-white">
              {PROFILE.initials}
            </div>
            <div>
              <p className="text-[15px] font-semibold text-heading">{PROFILE.name}</p>
              <p className="text-xs text-muted">{PROFILE.role}</p>
            </div>
          </div>
          {details.map((d) => (
            <MobileCardRow key={d.label} label={d.label} value={d.value} />
          ))}
        </MobileCard>
        <div className="grid grid-cols-3 gap-3">
          {STATS.map((s) => (
            <MobileCard key={s.label}>
              <div className="flex flex-col items-center gap-1 py-1">
                <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden><Icon name={s.icon} size={14} /></span>
                <p className="font-display text-lg font-black text-heading">{s.value}</p>
                <p className="text-[10px] text-muted">{t(s.label)}</p>
              </div>
            </MobileCard>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="User" title={t('User Profile')} subtitle={t('Profile view')} />

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 border-b border-border/50 pb-5">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-xl font-bold text-white">
            {PROFILE.initials}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-heading">{PROFILE.name}</h2>
            <p className="text-sm text-muted">{PROFILE.role}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4">
          {details.map((d) => (
            <div key={d.label} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-muted">{d.label}</span>
              <span className="text-sm font-medium text-heading">{d.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {STATS.map((s) => (
          <Card key={s.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden><Icon name={s.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{t(s.label)}</span>
            </div>
            <p className="mt-2 font-display text-2xl font-black text-heading">{s.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
