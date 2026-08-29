import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { FeatureHeader, Section, StatRow, SearchField } from '@/components/shell/FeatureScreen'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

const STATUS_TONE: Record<string, readonly [string, string]> = {
  active: ['rgba(10,94,215,.1)', '#0A5ED7'],
  enabled: ['rgba(10,94,215,.1)', '#0A5ED7'],
  compliant: ['rgba(10,94,215,.1)', '#0A5ED7'],
  operational: ['rgba(10,94,215,.1)', '#0A5ED7'],
  pending: ['rgba(249,115,22,.1)', '#F97316'],
  review: ['rgba(249,115,22,.1)', '#F97316'],
  warning: ['rgba(249,115,22,.1)', '#F97316'],
  in_progress: ['rgba(11,179,255,.1)', '#0BB3FF'],
  expanding: ['rgba(11,179,255,.1)', '#0BB3FF'],
  beta: ['rgba(11,179,255,.1)', '#0BB3FF'],
  suspended: ['rgba(11,31,59,.1)', '#0B1F3B'],
  critical: ['rgba(11,31,59,.1)', '#0B1F3B'],
  inactive: ['rgba(100,116,139,.1)', '#64748B'],
  disabled: ['rgba(100,116,139,.1)', '#64748B'],
  planned: ['rgba(100,116,139,.1)', '#64748B'],
}

function Tone({ value, label }: { value: string; label?: string }) {
  const { t } = usePreferences()
  const [bg, fg] = STATUS_TONE[value] ?? ['rgba(100,116,139,.1)', '#64748B']
  const text = label ?? value.replace(/_/g, ' ')
  return (
    <Badge background={bg} color={fg}>
      {t(text[0].toUpperCase() + text.slice(1))}
    </Badge>
  )
}

// -- 1. Franchise Management ------------------------------------------------

interface Franchise {
  id: string
  name: string
  location: string
  owner: string
  openDate: string
  revenue: string
  employees: number
  agreement: string
  status: 'active' | 'pending' | 'suspended' | 'inactive'
}

const FRANCHISES: readonly Franchise[] = [
  { id: 'FR001', name: 'SALIS Riyadh Central', location: 'Riyadh – Olaya', owner: 'Mohammed Al-Fahad', openDate: '2022-03-01', revenue: 'SAR 185,000/mo', employees: 12, agreement: 'Expires 2027-03-01', status: 'active' },
  { id: 'FR002', name: 'SALIS Jeddah', location: 'Jeddah – Tahlia', owner: 'Ahmed Al-Zahrani', openDate: '2023-06-15', revenue: 'SAR 142,000/mo', employees: 9, agreement: 'Expires 2028-06-15', status: 'active' },
  { id: 'FR003', name: 'SALIS Dammam', location: 'Dammam – King Fahd Rd', owner: 'Sultan Al-Dosari', openDate: '2024-01-10', revenue: 'SAR 98,000/mo', employees: 7, agreement: 'Expires 2029-01-10', status: 'active' },
  { id: 'FR004', name: 'SALIS Makkah', location: 'Makkah – Al Aziziyah', owner: '—', openDate: '—', revenue: 'SAR 0', employees: 0, agreement: 'Under Review', status: 'pending' },
  { id: 'FR005', name: 'SALIS Madinah', location: 'Madinah – King Abdullah Rd', owner: 'Ali Al-Otaibi', openDate: '2024-09-01', revenue: 'SAR 67,000/mo', employees: 5, agreement: 'Expires 2029-09-01', status: 'active' },
  { id: 'FR006', name: 'SALIS Tabuk', location: 'Tabuk – City Center', owner: 'Hassan Al-Mutairi', openDate: '2023-11-01', revenue: 'SAR 45,000/mo', employees: 4, agreement: 'Suspended – Audit', status: 'suspended' },
  { id: 'FR007', name: 'SALIS Abha', location: 'Abha – Al Sadd', owner: '—', openDate: '—', revenue: 'SAR 0', employees: 0, agreement: 'Planned Q1 2027', status: 'inactive' },
]

export function FranchiseManagement() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = filter === 'all' ? [...FRANCHISES] : FRANCHISES.filter((f) => f.status === filter)
    const needle = query.trim().toLowerCase()
    if (needle) list = list.filter((f) => f.name.toLowerCase().includes(needle) || f.location.toLowerCase().includes(needle) || f.owner.toLowerCase().includes(needle))
    return list
  }, [filter, query])

  const activeCount = FRANCHISES.filter((f) => f.status === 'active').length
  const pendingCount = FRANCHISES.filter((f) => f.status === 'pending').length
  const totalEmployees = FRANCHISES.reduce((sum, f) => sum + f.employees, 0)

  const columns: Column<Franchise>[] = [
    { header: 'Franchise', cell: (f) => <span className="text-[13px] font-semibold text-heading">{t(f.name)}</span> },
    { header: 'Location', cell: (f) => t(f.location) },
    { header: 'Owner', cell: (f) => f.owner },
    { header: 'Open Date', cell: (f) => f.openDate },
    { header: 'Revenue', cell: (f) => <span className="font-mono text-[13px] text-salis-blue" dir="ltr">{f.revenue}</span> },
    { header: 'Employees', cell: (f) => <span className="font-mono text-[13px]" dir="ltr">{f.employees}</span> },
    { header: 'Agreement', cell: (f) => f.agreement },
    { header: 'Status', cell: (f) => <Tone value={f.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Store"
        title={t('Franchise Management')}
        subtitle={t('Franchise operations, agreements and performance')}
        actions={
          can('admin', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add Franchise')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Franchises', value: activeCount, caption: 'Active locations', highlight: true },
          { label: 'Total Revenue', value: 'SAR 537K/mo', caption: 'Combined monthly', tone: 'info' },
          { label: 'Employees', value: totalEmployees, caption: 'Across all locations', tone: 'info' },
          { label: 'Pending', value: pendingCount, caption: 'Awaiting approval', tone: 'warning' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'active', 'pending', 'suspended', 'inactive'] as const).map((option) => {
          const count = option === 'all' ? FRANCHISES.length : FRANCHISES.filter((f) => f.status === option).length
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={filter === option}
              onClick={() => setFilter(option)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5',
                'font-action text-[13px] font-medium capitalize transition-all duration-150',
                filter === option
                  ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                  : 'border-border bg-card text-muted hover:border-border-strong'
              )}
            >
              {t(option === 'all' ? 'All' : option.replace(/_/g, ' '))}
              <span className="font-mono text-[11px] opacity-70" dir="ltr">{count}</span>
            </button>
          )
        })}
      </div>

      <Section
        title={t('Franchise Locations')}
        toolbar={
          <SearchField value={query} onChange={setQuery} placeholder="Search franchises..." />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={[...filtered]}
          rowKey={(f) => f.id}
          mobileCard={(f) => (
            <>
              <MobileCardHeader title={t(f.name)} trailing={<Tone value={f.status} />} />
              <MobileCardRow label={t('Location')}>{t(f.location)}</MobileCardRow>
              <MobileCardRow label={t('Owner')}>{f.owner}</MobileCardRow>
              <MobileCardRow label={t('Revenue')}>
                <span className="font-mono text-salis-blue" dir="ltr">{f.revenue}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Employees')}>
                <span className="font-mono" dir="ltr">{f.employees}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Agreement')}>{f.agreement}</MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="Store" title={t('No franchises found')} />}
        />
      </Section>
    </>
  )
}

// -- 2. Globalization Layer -------------------------------------------------

interface Language {
  id: string
  language: string
  locale: string
  direction: 'LTR' | 'RTL'
  coverage: string
  translatedKeys: number
  totalKeys: number
  lastUpdated: string
  status: 'active' | 'beta' | 'in_progress' | 'planned' | 'inactive'
}

const LANGUAGES: readonly Language[] = [
  { id: 'LN001', language: 'Arabic', locale: 'ar-SA', direction: 'RTL', coverage: '100%', translatedKeys: 2450, totalKeys: 2450, lastUpdated: 'Today', status: 'active' },
  { id: 'LN002', language: 'English', locale: 'en-US', direction: 'LTR', coverage: '100%', translatedKeys: 2450, totalKeys: 2450, lastUpdated: 'Today', status: 'active' },
  { id: 'LN003', language: 'French', locale: 'fr-FR', direction: 'LTR', coverage: '72%', translatedKeys: 1764, totalKeys: 2450, lastUpdated: '2026-08-15', status: 'beta' },
  { id: 'LN004', language: 'Urdu', locale: 'ur-PK', direction: 'RTL', coverage: '45%', translatedKeys: 1103, totalKeys: 2450, lastUpdated: '2026-07-20', status: 'beta' },
  { id: 'LN005', language: 'Hindi', locale: 'hi-IN', direction: 'LTR', coverage: '28%', translatedKeys: 686, totalKeys: 2450, lastUpdated: '2026-06-01', status: 'in_progress' },
  { id: 'LN006', language: 'Turkish', locale: 'tr-TR', direction: 'LTR', coverage: '15%', translatedKeys: 368, totalKeys: 2450, lastUpdated: '2026-05-10', status: 'planned' },
  { id: 'LN007', language: 'Bahasa', locale: 'id-ID', direction: 'LTR', coverage: '0%', translatedKeys: 0, totalKeys: 2450, lastUpdated: '—', status: 'planned' },
]

export function GlobalizationLayer() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = filter === 'all' ? [...LANGUAGES] : LANGUAGES.filter((l) => l.status === filter)
    const needle = query.trim().toLowerCase()
    if (needle) list = list.filter((l) => l.language.toLowerCase().includes(needle) || l.locale.toLowerCase().includes(needle))
    return list
  }, [filter, query])

  const activeCount = LANGUAGES.filter((l) => l.status === 'active').length
  const inProgressCount = LANGUAGES.filter((l) => l.status === 'beta' || l.status === 'in_progress').length

  const columns: Column<Language>[] = [
    { header: 'Language', cell: (l) => <span className="text-[13px] font-semibold text-heading">{t(l.language)}</span> },
    { header: 'Locale', cell: (l) => <span className="font-mono text-[13px]" dir="ltr">{l.locale}</span> },
    { header: 'Direction', cell: (l) => <span className="font-mono text-[13px]" dir="ltr">{l.direction}</span> },
    {
      header: 'Coverage',
      cell: (l) => (
        <span className="flex items-center gap-2">
          <div className="h-2 w-16 overflow-hidden rounded-full bg-inset">
            <div
              className="h-full rounded-full bg-salis-gradient-r"
              style={{ width: l.coverage }}
            />
          </div>
          <span className="font-mono text-[11px] text-muted" dir="ltr">{l.coverage}</span>
        </span>
      ),
    },
    {
      header: 'Translated',
      cell: (l) => (
        <span className="font-mono text-[13px]" dir="ltr">
          {l.translatedKeys.toLocaleString()} / {l.totalKeys.toLocaleString()}
        </span>
      ),
    },
    { header: 'Last Updated', cell: (l) => l.lastUpdated },
    { header: 'Status', cell: (l) => <Tone value={l.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Globe"
        title={t('Globalization Layer')}
        subtitle={t('Localization, languages and regional configurations')}
        actions={
          can('settings', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add Language')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Languages', value: LANGUAGES.length, caption: 'Configured', highlight: true },
          { label: 'Active', value: activeCount, caption: 'Fully translated', tone: 'info' },
          { label: 'In Progress', value: inProgressCount, caption: 'Beta & translating' },
          { label: 'Translation Keys', value: '2,450', caption: 'Total strings' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'active', 'beta', 'in_progress', 'planned'] as const).map((option) => {
          const count = option === 'all' ? LANGUAGES.length : LANGUAGES.filter((l) => l.status === option).length
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={filter === option}
              onClick={() => setFilter(option)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5',
                'font-action text-[13px] font-medium capitalize transition-all duration-150',
                filter === option
                  ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                  : 'border-border bg-card text-muted hover:border-border-strong'
              )}
            >
              {t(option === 'all' ? 'All' : option.replace(/_/g, ' '))}
              <span className="font-mono text-[11px] opacity-70" dir="ltr">{count}</span>
            </button>
          )
        })}
      </div>

      <Section
        title={t('Language Registry')}
        toolbar={
          <SearchField value={query} onChange={setQuery} placeholder="Search languages..." />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={[...filtered]}
          rowKey={(l) => l.id}
          mobileCard={(l) => (
            <>
              <MobileCardHeader title={t(l.language)} trailing={<Tone value={l.status} />} />
              <MobileCardRow label={t('Locale')}>
                <span className="font-mono" dir="ltr">{l.locale}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Direction')}>
                <span className="font-mono" dir="ltr">{l.direction}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Coverage')}>
                <span className="font-mono" dir="ltr">{l.coverage}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Translated')}>
                <span className="font-mono" dir="ltr">{l.translatedKeys.toLocaleString()} / {l.totalKeys.toLocaleString()}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Last Updated')}>{l.lastUpdated}</MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="Globe" title={t('No languages configured')} />}
        />
      </Section>
    </>
  )
}

// -- 3. Multi-Location Dashboard -------------------------------------------

interface LocationEntry {
  id: string
  location: string
  manager: string
  workOrders: number
  revenue: string
  customers: number
  satisfaction: string
  techUtil: string
  status: 'operational' | 'warning' | 'critical'
}

const LOCATIONS: readonly LocationEntry[] = [
  { id: 'LOC001', location: 'Riyadh Central', manager: 'Khalid Al-Amri', workOrders: 45, revenue: 'SAR 185,000', customers: 320, satisfaction: '4.7/5', techUtil: '87%', status: 'operational' },
  { id: 'LOC002', location: 'Jeddah', manager: 'Ahmed Al-Zahrani', workOrders: 32, revenue: 'SAR 142,000', customers: 245, satisfaction: '4.5/5', techUtil: '82%', status: 'operational' },
  { id: 'LOC003', location: 'Dammam', manager: 'Sultan Al-Dosari', workOrders: 28, revenue: 'SAR 98,000', customers: 180, satisfaction: '4.3/5', techUtil: '75%', status: 'operational' },
  { id: 'LOC004', location: 'Madinah', manager: 'Ali Al-Otaibi', workOrders: 15, revenue: 'SAR 67,000', customers: 95, satisfaction: '4.6/5', techUtil: '71%', status: 'operational' },
  { id: 'LOC005', location: 'Tabuk', manager: 'Hassan Al-Mutairi', workOrders: 8, revenue: 'SAR 45,000', customers: 52, satisfaction: '3.8/5', techUtil: '65%', status: 'warning' },
  { id: 'LOC006', location: 'Makkah', manager: '—', workOrders: 0, revenue: 'SAR 0', customers: 0, satisfaction: '—', techUtil: '—', status: 'critical' },
]

export function MultiLocationDashboard() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = filter === 'all' ? [...LOCATIONS] : LOCATIONS.filter((loc) => loc.status === filter)
    const needle = query.trim().toLowerCase()
    if (needle) list = list.filter((loc) => loc.location.toLowerCase().includes(needle) || loc.manager.toLowerCase().includes(needle))
    return list
  }, [filter, query])

  const totalWO = LOCATIONS.reduce((sum, loc) => sum + loc.workOrders, 0)

  const columns: Column<LocationEntry>[] = [
    { header: 'Location', cell: (loc) => <span className="text-[13px] font-semibold text-heading">{t(loc.location)}</span> },
    { header: 'Manager', cell: (loc) => loc.manager },
    { header: 'Work Orders', cell: (loc) => <span className="font-mono text-[13px]" dir="ltr">{loc.workOrders}</span> },
    { header: 'Revenue', cell: (loc) => <span className="font-mono text-[13px] text-salis-blue" dir="ltr">{loc.revenue}</span> },
    { header: 'Customers', cell: (loc) => <span className="font-mono text-[13px]" dir="ltr">{loc.customers}</span> },
    {
      header: 'Satisfaction',
      cell: (loc) =>
        loc.satisfaction !== '—' ? (
          <span className="flex items-center gap-1 font-mono text-[13px] font-semibold text-heading" dir="ltr">
            <Icon name="Star" size={13} className="text-salis-blue" />
            {loc.satisfaction}
          </span>
        ) : (
          <span className="text-xs text-muted">{'—'}</span>
        ),
    },
    { header: 'Tech Utilization', cell: (loc) => <span className="font-mono text-[13px]" dir="ltr">{loc.techUtil}</span> },
    { header: 'Status', cell: (loc) => <Tone value={loc.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="MapPin"
        title={t('Multi-Location Dashboard')}
        subtitle={t('Cross-location performance overview')}
      />
      <StatRow
        stats={[
          { label: 'Locations', value: LOCATIONS.length, caption: 'All branches', highlight: true },
          { label: 'Total Work Orders', value: totalWO, caption: 'This period', tone: 'info' },
          { label: 'Combined Revenue', value: 'SAR 537K', caption: 'This month', tone: 'info' },
          { label: 'Avg Satisfaction', value: '4.4/5', caption: 'Across locations' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'operational', 'warning', 'critical'] as const).map((option) => {
          const count = option === 'all' ? LOCATIONS.length : LOCATIONS.filter((loc) => loc.status === option).length
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={filter === option}
              onClick={() => setFilter(option)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5',
                'font-action text-[13px] font-medium capitalize transition-all duration-150',
                filter === option
                  ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                  : 'border-border bg-card text-muted hover:border-border-strong'
              )}
            >
              {t(option === 'all' ? 'All' : option.replace(/_/g, ' '))}
              <span className="font-mono text-[11px] opacity-70" dir="ltr">{count}</span>
            </button>
          )
        })}
      </div>

      <Section
        title={t('Location Performance')}
        toolbar={
          <SearchField value={query} onChange={setQuery} placeholder="Search locations..." />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={[...filtered]}
          rowKey={(loc) => loc.id}
          mobileCard={(loc) => (
            <>
              <MobileCardHeader title={t(loc.location)} trailing={<Tone value={loc.status} />} />
              <MobileCardRow label={t('Manager')}>{loc.manager}</MobileCardRow>
              <MobileCardRow label={t('Work Orders')}>
                <span className="font-mono" dir="ltr">{loc.workOrders}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Revenue')}>
                <span className="font-mono text-salis-blue" dir="ltr">{loc.revenue}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Customers')}>
                <span className="font-mono" dir="ltr">{loc.customers}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Satisfaction')}>
                {loc.satisfaction !== '—' ? (
                  <span className="flex items-center gap-1 font-mono font-semibold">
                    <Icon name="Star" size={13} className="text-salis-blue" />
                    {loc.satisfaction}
                  </span>
                ) : '—'}
              </MobileCardRow>
              <MobileCardRow label={t('Tech Utilization')}>
                <span className="font-mono" dir="ltr">{loc.techUtil}</span>
              </MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="MapPin" title={t('No locations found')} />}
        />
      </Section>
    </>
  )
}
