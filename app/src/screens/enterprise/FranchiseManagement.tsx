import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

interface Franchise {
  name: string
  location: string
  owner: string
  status: 'Active' | 'Pending' | 'Suspended'
  revenue: string
  employees: number
  since: string
}

const FRANCHISES: Franchise[] = [
  { name: 'Salis Auto - Riyadh Central', location: 'Riyadh', owner: 'Mohammed Al-Qahtani', status: 'Active', revenue: 'SAR 1.2M', employees: 24, since: '2021' },
  { name: 'Salis Auto - Jeddah West', location: 'Jeddah', owner: 'Fahad Al-Harbi', status: 'Active', revenue: 'SAR 980K', employees: 18, since: '2022' },
  { name: 'Salis Auto - Dammam', location: 'Dammam', owner: 'Sultan Al-Dosari', status: 'Active', revenue: 'SAR 750K', employees: 15, since: '2022' },
  { name: 'Salis Auto - Madinah', location: 'Madinah', owner: 'Abdulrahman Nasser', status: 'Pending', revenue: 'SAR 0', employees: 8, since: '2026' },
  { name: 'Salis Auto - Khobar', location: 'Al Khobar', owner: 'Nawaf Al-Shammari', status: 'Active', revenue: 'SAR 620K', employees: 12, since: '2023' },
  { name: 'Salis Auto - Tabuk', location: 'Tabuk', owner: 'Bader Al-Mutairi', status: 'Suspended', revenue: 'SAR 210K', employees: 6, since: '2024' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  Suspended: { bg: 'rgba(239,68,68,.1)', fg: 'rgb(239,68,68)' },
}

export function FranchiseManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Building2" title={t('Franchises')} subtitle={t('Multi-location management')} />
        {FRANCHISES.map((f, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              title={f.name}
              trailing={<Badge background={STATUS_STYLES[f.status].bg} color={STATUS_STYLES[f.status].fg}>{t(f.status)}</Badge>}
            />
            <MobileCardRow label={t('Location')} value={f.location} />
            <MobileCardRow label={t('Owner')} value={f.owner} />
            <MobileCardRow label={t('Revenue')} value={f.revenue} />
            <MobileCardRow label={t('Employees')} value={f.employees} />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Building2" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Franchise Management')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Manage franchise locations and operators')}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Franchises', value: FRANCHISES.length.toString(), icon: 'Building2' },
          { label: 'Active Locations', value: FRANCHISES.filter((f) => f.status === 'Active').length.toString(), icon: 'CheckCircle' },
          { label: 'Total Employees', value: FRANCHISES.reduce((sum, f) => sum + f.employees, 0).toString(), icon: 'Users' },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex rounded-xl p-2.5" style={{ background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }} aria-hidden>
                <Icon name={stat.icon} size={20} />
              </span>
              <div>
                <p className="text-xs text-muted">{t(stat.label)}</p>
                <p className="text-xl font-bold text-heading">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <p className="mb-4 text-sm font-bold text-heading">{t('Franchise Locations')}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-3 font-medium">{t('Name')}</th>
                <th className="pb-3 font-medium">{t('Location')}</th>
                <th className="pb-3 font-medium">{t('Owner')}</th>
                <th className="pb-3 font-medium">{t('Revenue')}</th>
                <th className="pb-3 font-medium">{t('Employees')}</th>
                <th className="pb-3 font-medium">{t('Since')}</th>
                <th className="pb-3 font-medium">{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {FRANCHISES.map((f, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-3 font-semibold text-heading">{f.name}</td>
                  <td className="py-3 text-body">{f.location}</td>
                  <td className="py-3 text-body">{f.owner}</td>
                  <td className="py-3 font-medium text-heading">{f.revenue}</td>
                  <td className="py-3 text-body">{f.employees}</td>
                  <td className="py-3 text-muted">{f.since}</td>
                  <td className="py-3">
                    <Badge background={STATUS_STYLES[f.status].bg} color={STATUS_STYLES[f.status].fg}>{t(f.status)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
