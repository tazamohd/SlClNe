import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface BranchSummary {
  name: string
  city: string
  activeJobs: number
  revenue: string
  technicians: number
  utilization: number
  status: 'Online' | 'Offline' | 'Maintenance'
}

const BRANCHES: BranchSummary[] = [
  { name: 'Riyadh Central', city: 'Riyadh', activeJobs: 14, revenue: 'SAR 48,200', technicians: 8, utilization: 87, status: 'Online' },
  { name: 'Jeddah West', city: 'Jeddah', activeJobs: 9, revenue: 'SAR 32,600', technicians: 6, utilization: 72, status: 'Online' },
  { name: 'Dammam East', city: 'Dammam', activeJobs: 7, revenue: 'SAR 21,400', technicians: 5, utilization: 65, status: 'Online' },
  { name: 'Al Khobar', city: 'Al Khobar', activeJobs: 5, revenue: 'SAR 18,900', technicians: 4, utilization: 58, status: 'Maintenance' },
  { name: 'Madinah', city: 'Madinah', activeJobs: 0, revenue: 'SAR 0', technicians: 3, utilization: 0, status: 'Offline' },
]

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  Online: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Offline: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Maintenance: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
}

const SUMMARY_STATS = [
  { label: 'Total Branches', value: '5', icon: 'Building2' },
  { label: 'Active Jobs', value: '35', icon: 'Wrench' },
  { label: 'Today Revenue', value: 'SAR 121K', icon: 'Wallet' },
  { label: 'Avg Utilization', value: '56%', icon: 'Gauge' },
]

export function MultiLocationDashboard() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Building2" title={t('Multi-Location')} subtitle={t('Branch overview')} />
        <div className="grid grid-cols-2 gap-3">
          {SUMMARY_STATS.map((stat) => (
            <MobileCard key={stat.label}>
              <MobileCardHeader
                leading={
                  <span className="flex rounded-lg p-1.5 bg-tint-blue text-salis-blue" aria-hidden>
                    <Icon name={stat.icon} size={14} />
                  </span>
                }
              />
              <p className="text-xs text-muted">{t(stat.label)}</p>
              <p className="text-lg font-bold text-heading">{stat.value}</p>
            </MobileCard>
          ))}
        </div>
        {BRANCHES.map((branch, i) => (
          <MobileCard key={i}>
            <MobileCardHeader
              title={branch.name}
              trailing={<Badge background={STATUS_STYLES[branch.status].bg} color={STATUS_STYLES[branch.status].fg}>{t(branch.status)}</Badge>}
            />
            <MobileCardRow label={t('City')} value={branch.city} />
            <MobileCardRow label={t('Active Jobs')} value={branch.activeJobs} />
            <MobileCardRow label={t('Revenue')} value={branch.revenue} />
            <MobileCardRow label={t('Utilization')} value={`${branch.utilization}%`} />
          </MobileCard>
        ))}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Building2" title={t('Multi-Location Dashboard')} subtitle={t('Consolidated view of all branches')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {SUMMARY_STATS.map((stat) => (
          <Card key={stat.label} className="rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex rounded-xl p-2.5 bg-tint-blue text-salis-blue" aria-hidden>
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

      <div className="grid grid-cols-2 gap-4">
        {BRANCHES.map((branch, i) => (
          <Card key={i} className="rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex rounded-xl p-2.5 bg-tint-blue text-salis-blue" aria-hidden>
                  <Icon name="MapPin" size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold text-heading">{branch.name}</p>
                  <p className="text-xs text-muted">{branch.city}</p>
                </div>
              </div>
              <Badge background={STATUS_STYLES[branch.status].bg} color={STATUS_STYLES[branch.status].fg}>{t(branch.status)}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted">{t('Active Jobs')}</p>
                <p className="text-lg font-bold text-heading">{branch.activeJobs}</p>
              </div>
              <div>
                <p className="text-xs text-muted">{t('Revenue')}</p>
                <p className="text-lg font-bold text-heading">{branch.revenue}</p>
              </div>
              <div>
                <p className="text-xs text-muted">{t('Utilization')}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-secondary">
                    <div className="h-full rounded-full bg-salis-blue" style={{ width: `${branch.utilization}%` }} />
                  </div>
                  <span className="text-xs font-medium text-heading">{branch.utilization}%</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
