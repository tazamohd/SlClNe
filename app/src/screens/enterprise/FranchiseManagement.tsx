import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'

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
  Active: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  Pending: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  Suspended: { bg: 'var(--tint-orange)', fg: 'rgb(249,115,22)' },
}

export function FranchiseManagement() {
  const { t } = usePreferences()

  const columns: Column<Franchise>[] = [
    { header: 'Name', cell: (f) => <span className="font-semibold text-heading">{f.name}</span> },
    { header: 'Location', cell: (f) => f.location },
    { header: 'Owner', cell: (f) => f.owner },
    { header: 'Revenue', cell: (f) => <span className="font-medium text-heading">{f.revenue}</span> },
    { header: 'Employees', cell: (f) => f.employees },
    { header: 'Since', cell: (f) => f.since },
    {
      header: 'Status',
      cell: (f) => (
        <Badge background={STATUS_STYLES[f.status].bg} color={STATUS_STYLES[f.status].fg}>{t(f.status)}</Badge>
      ),
    },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Building2" title={t('Franchise Management')} subtitle={t('Manage franchise locations and operators')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Franchises', value: FRANCHISES.length.toString(), icon: 'Building2' },
          { label: 'Active Locations', value: FRANCHISES.filter((f) => f.status === 'Active').length.toString(), icon: 'CheckCircle' },
          { label: 'Total Employees', value: FRANCHISES.reduce((sum, f) => sum + f.employees, 0).toString(), icon: 'Users' },
        ].map((stat) => (
          <Card key={stat.label} className="rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex rounded-xl p-2.5" style={{ background: 'var(--tint-blue)', color: 'var(--salis-blue)' }} aria-hidden>
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

      <div>
        <p className="mb-3 text-sm font-bold text-heading">{t('Franchise Locations')}</p>
        <DataTable
          caption="Franchise locations"
          columns={columns}
          rows={FRANCHISES}
          rowKey={(f, i) => f.name || String(i)}
          empty={t('No franchises found')}
          mobileCard={(f) => (
            <>
              <MobileCardHeader
                title={f.name}
                trailing={<Badge background={STATUS_STYLES[f.status].bg} color={STATUS_STYLES[f.status].fg}>{t(f.status)}</Badge>}
              />
              <MobileCardRow label={t('Location')} value={f.location} />
              <MobileCardRow label={t('Owner')} value={f.owner} />
              <MobileCardRow label={t('Revenue')} value={f.revenue} />
              <MobileCardRow label={t('Employees')} value={f.employees} />
            </>
          )}
        />
      </div>
    </div>
  )
}
