import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const TECH_PROFILE = {
  name: 'Ahmed Al-Farsi',
  employeeId: 'EMP-1042',
  role: 'Senior Technician',
  department: 'Mechanical',
  branch: 'Riyadh - Olaya',
  phone: '+966 55 987 6543',
  email: 'ahmed.f@salisauto.com',
  hireDate: '2020-06-15',
  yearsExperience: 8,
}

const PERSONAL_FIELDS = [
  { label: 'Full Name', value: TECH_PROFILE.name, icon: 'User' },
  { label: 'Employee ID', value: TECH_PROFILE.employeeId, icon: 'CreditCard' },
  { label: 'Email', value: TECH_PROFILE.email, icon: 'Mail' },
  { label: 'Phone', value: TECH_PROFILE.phone, icon: 'Phone' },
]

const WORK_FIELDS = [
  { label: 'Role', value: TECH_PROFILE.role },
  { label: 'Department', value: TECH_PROFILE.department },
  { label: 'Branch', value: TECH_PROFILE.branch },
  { label: 'Hire Date', value: TECH_PROFILE.hireDate },
  { label: 'Experience', value: `${TECH_PROFILE.yearsExperience} years` },
]

const CERTIFICATIONS = [
  { name: 'ASE Master Technician', expiry: '2026-12-31', status: 'Active' },
  { name: 'Toyota Certified Technician', expiry: '2026-06-30', status: 'Active' },
  { name: 'Honda Professional', expiry: '2025-09-15', status: 'Expiring Soon' },
  { name: 'AC Refrigerant Handling', expiry: '2027-03-01', status: 'Active' },
]

const CERT_STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'rgba(16,185,129,.1)', fg: 'rgb(16,185,129)' },
  'Expiring Soon': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
}

export function TechnicianPortalProfile() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="User" title={t('My Profile')} subtitle={t('Technician details')} />
        <Card className="rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(10,94,215,.1)] text-salis-blue">
              <Icon name="User" size={24} />
            </span>
            <div>
              <p className="text-[15px] font-bold text-heading">{TECH_PROFILE.name}</p>
              <p className="text-xs text-muted">{TECH_PROFILE.role}</p>
            </div>
          </div>
        </Card>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Personal')}</p>} />
          {PERSONAL_FIELDS.map((f, i) => (
            <MobileCardRow key={i} label={t(f.label)} value={f.value} />
          ))}
        </MobileCard>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Work Details')}</p>} />
          {WORK_FIELDS.map((f, i) => (
            <MobileCardRow key={i} label={t(f.label)} value={f.value} />
          ))}
        </MobileCard>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Certifications')}</p>} />
          {CERTIFICATIONS.map((c, i) => (
            <MobileCardRow key={i} label={c.name}>
              <Badge background={CERT_STATUS_STYLES[c.status].bg} color={CERT_STATUS_STYLES[c.status].fg}>{t(c.status)}</Badge>
            </MobileCardRow>
          ))}
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="User" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('My Profile')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Technician profile and certifications')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="User" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('Personal')}</h2>
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
            <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Briefcase" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('Work Details')}</h2>
          </div>
          <div className="grid gap-4">
            {WORK_FIELDS.map((f, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-muted">{t(f.label)}</span>
                <span className="text-sm font-medium text-heading">{f.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name="Award" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('Certifications')}</h2>
          </div>
          <div className="grid gap-4">
            {CERTIFICATIONS.map((c, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-heading">{c.name}</p>
                  <p className="text-xs text-muted">{t('Expires')}: {c.expiry}</p>
                </div>
                <Badge background={CERT_STATUS_STYLES[c.status].bg} color={CERT_STATUS_STYLES[c.status].fg}>{t(c.status)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
