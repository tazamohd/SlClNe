import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const PROFILE_INFO = [
  { label: 'Name', value: 'Ahmed Al-Farsi', icon: 'User' },
  { label: 'Employee ID', value: 'EMP-1042', icon: 'CreditCard' },
  { label: 'Role', value: 'Senior Technician', icon: 'Briefcase' },
  { label: 'Branch', value: 'Riyadh - Olaya', icon: 'MapPin' },
  { label: 'Phone', value: '+966 55 987 6543', icon: 'Phone' },
  { label: 'Email', value: 'ahmed.f@salisauto.com', icon: 'Mail' },
]

const STATS = [
  { label: 'Jobs This Month', value: '42', icon: 'Wrench', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  { label: 'Avg Rating', value: '4.8', icon: 'Star', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  { label: 'On-Time Rate', value: '96%', icon: 'Clock', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  { label: 'Efficiency', value: '92%', icon: 'TrendingUp', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
]

const SKILLS = [
  { name: 'Engine Repair', level: 'Expert' },
  { name: 'Brake Systems', level: 'Expert' },
  { name: 'AC & Climate', level: 'Advanced' },
  { name: 'Electrical', level: 'Intermediate' },
  { name: 'Transmission', level: 'Advanced' },
]

const LEVEL_STYLES: Record<string, { bg: string; fg: string }> = {
  Expert: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Advanced: { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  Intermediate: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
}

export function TechnicianAppProfile() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="User" title={t('Profile')} subtitle={t('Your details')} />
        <Card className="rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tint-blue text-salis-blue">
              <Icon name="User" size={24} />
            </span>
            <div>
              <p className="text-[15px] font-bold text-heading">{t('Ahmed Al-Farsi')}</p>
              <p className="text-xs text-muted">{t('Senior Technician')} - EMP-1042</p>
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          {STATS.map((s) => (
            <Card key={s.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: s.bg, color: s.fg }} aria-hidden><Icon name={s.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{s.label}</span>
              </div>
              <p className="mt-1.5 font-display text-xl font-black text-heading">{s.value}</p>
            </Card>
          ))}
        </div>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Contact')}</p>} />
          {PROFILE_INFO.filter((f) => ['Phone', 'Email', 'Branch'].includes(f.label)).map((f, i) => (
            <MobileCardRow key={i} label={t(f.label)} value={f.value} />
          ))}
        </MobileCard>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Skills')}</p>} />
          {SKILLS.map((s, i) => (
            <MobileCardRow key={i} label={s.name}>
              <Badge background={LEVEL_STYLES[s.level].bg} color={LEVEL_STYLES[s.level].fg}>{t(s.level)}</Badge>
            </MobileCardRow>
          ))}
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="User" title={t('Profile')} subtitle={t('Technician profile and performance')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {STATS.map((s) => (
          <Card key={s.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: s.bg, color: s.fg }} aria-hidden><Icon name={s.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{s.label}</span>
            </div>
            <p className="mt-2 font-display text-2xl font-black text-heading">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="User" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('Details')}</h2>
          </div>
          <div className="grid gap-4">
            {PROFILE_INFO.map((f, i) => (
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
            <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Award" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('Skills')}</h2>
          </div>
          <div className="grid gap-4">
            {SKILLS.map((s, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-heading">{s.name}</span>
                <Badge background={LEVEL_STYLES[s.level].bg} color={LEVEL_STYLES[s.level].fg}>{t(s.level)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
