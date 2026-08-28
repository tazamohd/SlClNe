import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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
  Active: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  'Expiring Soon': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
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
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tint-blue text-salis-blue">
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
          {PERSONAL_FIELDS.map((f) => (
            <MobileCardRow key={f.label} label={t(f.label)} value={f.value} />
          ))}
        </MobileCard>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Work Details')}</p>} />
          {WORK_FIELDS.map((f) => (
            <MobileCardRow key={f.label} label={t(f.label)} value={f.value} />
          ))}
        </MobileCard>
        <MobileCard>
          <MobileCardHeader leading={<p className="text-[13px] font-semibold text-heading">{t('Certifications')}</p>} />
          {CERTIFICATIONS.map((c) => (
            <MobileCardRow key={c.name} label={c.name}>
              <Badge background={CERT_STATUS_STYLES[c.status].bg} color={CERT_STATUS_STYLES[c.status].fg}>{t(c.status)}</Badge>
            </MobileCardRow>
          ))}
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="User" title={t('My Profile')} subtitle={t('Technician profile and certifications')} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="User" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('Personal')}</h2>
          </div>
          <div className="grid gap-4">
            {PERSONAL_FIELDS.map((f) => (
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

        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Briefcase" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('Work Details')}</h2>
          </div>
          <div className="grid gap-4">
            {WORK_FIELDS.map((f) => (
              <div key={f.label} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-muted">{t(f.label)}</span>
                <span className="text-sm font-medium text-heading">{f.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Award" size={16} /></span>
            <h2 className="text-sm font-semibold text-heading">{t('Certifications')}</h2>
          </div>
          <div className="grid gap-4">
            {CERTIFICATIONS.map((c) => (
              <div key={c.name} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
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
