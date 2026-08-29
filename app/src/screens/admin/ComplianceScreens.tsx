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
  compliant: ['rgba(10,94,215,.1)', '#0A5ED7'],
  resolved: ['rgba(10,94,215,.1)', '#0A5ED7'],
  passed: ['rgba(10,94,215,.1)', '#0A5ED7'],
  calibrated: ['rgba(10,94,215,.1)', '#0A5ED7'],
  certified: ['rgba(10,94,215,.1)', '#0A5ED7'],
  verified: ['rgba(10,94,215,.1)', '#0A5ED7'],
  pending: ['rgba(249,115,22,.1)', '#F97316'],
  under_review: ['rgba(249,115,22,.1)', '#F97316'],
  due_soon: ['rgba(249,115,22,.1)', '#F97316'],
  open: ['rgba(249,115,22,.1)', '#F97316'],
  in_progress: ['rgba(11,179,255,.1)', '#0BB3FF'],
  investigating: ['rgba(11,179,255,.1)', '#0BB3FF'],
  scheduled: ['rgba(11,179,255,.1)', '#0BB3FF'],
  non_compliant: ['rgba(11,31,59,.1)', '#0B1F3B'],
  critical: ['rgba(11,31,59,.1)', '#0B1F3B'],
  overdue: ['rgba(11,31,59,.1)', '#0B1F3B'],
  closed: ['rgba(100,116,139,.1)', '#64748B'],
  expired: ['rgba(100,116,139,.1)', '#64748B'],
  inactive: ['rgba(100,116,139,.1)', '#64748B'],
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

// ── 1. User Profile ────────────────────────────────────────────────────────

interface ProfileField {
  id: string
  field: string
  value: string
  category: string
  editable: boolean
  lastUpdated: string
}

const PROFILE_FIELDS: readonly ProfileField[] = [
  { id: 'PF001', field: 'Full Name', value: 'Khalid Al-Amri', category: 'personal', editable: true, lastUpdated: '2026-08-29' },
  { id: 'PF002', field: 'Email', value: 'khalid@salis.sa', category: 'personal', editable: true, lastUpdated: '2026-08-29' },
  { id: 'PF003', field: 'Phone', value: '+966 55 123 4567', category: 'personal', editable: true, lastUpdated: '2026-08-20' },
  { id: 'PF004', field: 'Department', value: 'Administration', category: 'work', editable: false, lastUpdated: '2026-06-01' },
  { id: 'PF005', field: 'Position', value: 'Operations Manager', category: 'work', editable: false, lastUpdated: '2026-06-01' },
  { id: 'PF006', field: 'Employee ID', value: 'E005', category: 'work', editable: false, lastUpdated: '2021-09-01' },
  { id: 'PF007', field: 'Start Date', value: '2021-09-01', category: 'work', editable: false, lastUpdated: '2021-09-01' },
  { id: 'PF008', field: 'Language Preference', value: 'Arabic', category: 'preferences', editable: true, lastUpdated: '2026-08-29' },
]

export function UserProfile() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = filter === 'all' ? PROFILE_FIELDS : PROFILE_FIELDS.filter((f) => f.category === filter)
    const needle = query.trim().toLowerCase()
    if (needle) list = list.filter((f) => f.field.toLowerCase().includes(needle) || f.value.toLowerCase().includes(needle))
    return list
  }, [filter, query])

  const completedCount = PROFILE_FIELDS.filter((f) => f.value.trim() !== '').length
  const editableCount = PROFILE_FIELDS.filter((f) => f.editable).length

  const columns: Column<ProfileField>[] = [
    { header: 'Field', cell: (f) => <span className="text-[13px] font-semibold text-heading">{t(f.field)}</span> },
    { header: 'Value', cell: (f) => <span className="font-mono text-[13px]">{f.value}</span> },
    { header: 'Category', cell: (f) => t(f.category[0].toUpperCase() + f.category.slice(1)) },
    {
      header: 'Editable',
      cell: (f) =>
        f.editable ? (
          <Icon name="Check" size={15} className="text-salis-blue" />
        ) : (
          <span className="text-muted">&mdash;</span>
        ),
    },
    { header: 'Last Updated', cell: (f) => f.lastUpdated },
  ]

  return (
    <>
      <FeatureHeader
        icon="User"
        title={t('User Profile')}
        subtitle={t('Personal information and account details')}
      />
      <StatRow
        stats={[
          { label: 'Profile Fields', value: PROFILE_FIELDS.length, caption: 'Total fields', highlight: true },
          { label: 'Completed', value: completedCount, caption: 'Fields filled', tone: 'info' },
          { label: 'Editable', value: editableCount, caption: 'Can modify' },
          { label: 'Last Updated', value: t('Today'), caption: 'Most recent' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'personal', 'work', 'preferences'] as const).map((option) => {
          const count = option === 'all' ? PROFILE_FIELDS.length : PROFILE_FIELDS.filter((f) => f.category === option).length
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
              {t(option === 'all' ? 'All' : option)}
              <span className="font-mono text-[11px] opacity-70" dir="ltr">{count}</span>
            </button>
          )
        })}
      </div>

      <Section
        title={t('Profile Details')}
        toolbar={<SearchField value={query} onChange={setQuery} placeholder="Search fields..." />}
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={[...filtered]}
          rowKey={(f) => f.id}
          mobileCard={(f) => (
            <>
              <MobileCardHeader title={t(f.field)} trailing={f.editable ? <Icon name="Check" size={15} className="text-salis-blue" /> : null} />
              <MobileCardRow label={t('Value')}><span className="font-mono">{f.value}</span></MobileCardRow>
              <MobileCardRow label={t('Category')}>{t(f.category[0].toUpperCase() + f.category.slice(1))}</MobileCardRow>
              <MobileCardRow label={t('Last Updated')}>{f.lastUpdated}</MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="User" title={t('No profile fields found')} />}
        />
      </Section>
    </>
  )
}

// ── 2. Role Management ─────────────────────────────────────────────────────

interface Role {
  id: string
  name: string
  description: string
  users: number
  permissions: number
  scope: string
  status: 'active' | 'inactive'
}

const ROLES: readonly Role[] = [
  { id: 'RL001', name: 'Super Admin', description: 'Full system access', users: 1, permissions: 48, scope: 'Global', status: 'active' },
  { id: 'RL002', name: 'Branch Manager', description: 'Branch-level operations', users: 2, permissions: 32, scope: 'Branch', status: 'active' },
  { id: 'RL003', name: 'Service Advisor', description: 'Customer & work order management', users: 3, permissions: 18, scope: 'Branch', status: 'active' },
  { id: 'RL004', name: 'Technician', description: 'Workshop operations', users: 4, permissions: 12, scope: 'Workshop', status: 'active' },
  { id: 'RL005', name: 'Accountant', description: 'Financial operations', users: 2, permissions: 15, scope: 'Finance', status: 'active' },
  { id: 'RL006', name: 'Receptionist', description: 'Front desk operations', users: 1, permissions: 8, scope: 'Branch', status: 'active' },
  { id: 'RL007', name: 'Viewer', description: 'Read-only access', users: 2, permissions: 5, scope: 'Global', status: 'inactive' },
]

export function RoleManagement() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = filter === 'all' ? ROLES : ROLES.filter((r) => r.status === filter)
    const needle = query.trim().toLowerCase()
    if (needle) list = list.filter((r) => r.name.toLowerCase().includes(needle) || r.description.toLowerCase().includes(needle))
    return list
  }, [filter, query])

  const activeCount = ROLES.filter((r) => r.status === 'active').length
  const totalUsers = ROLES.reduce((sum, r) => sum + r.users, 0)
  const maxPermissions = Math.max(...ROLES.map((r) => r.permissions))

  const columns: Column<Role>[] = [
    { header: 'Role', cell: (r) => <span className="text-[13px] font-semibold text-heading">{t(r.name)}</span> },
    { header: 'Description', cell: (r) => t(r.description) },
    { header: 'Users', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.users}</span> },
    { header: 'Permissions', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.permissions}</span> },
    { header: 'Scope', cell: (r) => t(r.scope) },
    { header: 'Status', cell: (r) => <Tone value={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Shield"
        title={t('Role Management')}
        subtitle={t('Roles, permissions and access control')}
        actions={
          can('settings', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add Role')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Total Roles', value: ROLES.length, caption: 'Defined', highlight: true },
          { label: 'Active', value: activeCount, caption: 'In use', tone: 'info' },
          { label: 'Total Users', value: totalUsers, caption: 'Assigned' },
          { label: 'Permissions', value: maxPermissions, caption: 'Max per role' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'active', 'inactive'] as const).map((option) => {
          const count = option === 'all' ? ROLES.length : ROLES.filter((r) => r.status === option).length
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
              {t(option === 'all' ? 'All' : option)}
              <span className="font-mono text-[11px] opacity-70" dir="ltr">{count}</span>
            </button>
          )
        })}
      </div>

      <Section
        title={t('Roles')}
        toolbar={<SearchField value={query} onChange={setQuery} placeholder="Search roles..." />}
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={[...filtered]}
          rowKey={(r) => r.id}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={t(r.name)} trailing={<Tone value={r.status} />} />
              <MobileCardRow label={t('Description')}>{t(r.description)}</MobileCardRow>
              <MobileCardRow label={t('Users')}><span className="font-mono">{r.users}</span></MobileCardRow>
              <MobileCardRow label={t('Permissions')}><span className="font-mono">{r.permissions}</span></MobileCardRow>
              <MobileCardRow label={t('Scope')}>{t(r.scope)}</MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="Shield" title={t('No roles found')} />}
        />
      </Section>
    </>
  )
}

// ── 3. Compliance Management ───────────────────────────────────────────────

interface ComplianceRecord {
  id: string
  regulation: string
  area: string
  dueDate: string
  lastAudit: string
  auditor: string
  status: 'compliant' | 'non_compliant' | 'pending' | 'under_review'
}

const COMPLIANCE_DATA: readonly ComplianceRecord[] = [
  { id: 'CM001', regulation: 'SASO Standards', area: 'Workshop Operations', dueDate: '2026-10-15', lastAudit: '2026-04-15', auditor: 'Ahmed Al-Fahad', status: 'compliant' },
  { id: 'CM002', regulation: 'Fire Safety Code', area: 'Facility', dueDate: '2026-09-01', lastAudit: '2026-03-01', auditor: 'Nora Al-Shehri', status: 'compliant' },
  { id: 'CM003', regulation: 'Environmental Regs', area: 'Waste Management', dueDate: '2026-11-30', lastAudit: '2026-05-30', auditor: 'Salem Al-Otaibi', status: 'pending' },
  { id: 'CM004', regulation: 'Labor Law Compliance', area: 'HR', dueDate: '2026-09-15', lastAudit: '2026-03-15', auditor: 'Maha Al-Dosari', status: 'compliant' },
  { id: 'CM005', regulation: 'Data Protection', area: 'IT Systems', dueDate: '2026-12-01', lastAudit: '2026-06-01', auditor: 'Tariq Al-Harbi', status: 'under_review' },
  { id: 'CM006', regulation: 'CITC Telecom', area: 'Communications', dueDate: '2027-01-15', lastAudit: '2026-07-15', auditor: 'Reem Al-Qahtani', status: 'compliant' },
  { id: 'CM007', regulation: 'Municipal License', area: 'Operations', dueDate: '2026-10-01', lastAudit: '2026-04-01', auditor: 'Fahad Al-Mutairi', status: 'pending' },
  { id: 'CM008', regulation: 'Insurance Requirements', area: 'Finance', dueDate: '2026-09-30', lastAudit: '2026-03-30', auditor: 'Huda Al-Rashid', status: 'compliant' },
]

export function ComplianceManagement() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = filter === 'all' ? COMPLIANCE_DATA : COMPLIANCE_DATA.filter((r) => r.status === filter)
    const needle = query.trim().toLowerCase()
    if (needle) list = list.filter((r) => r.regulation.toLowerCase().includes(needle) || r.area.toLowerCase().includes(needle))
    return list
  }, [filter, query])

  const compliantCount = COMPLIANCE_DATA.filter((r) => r.status === 'compliant').length
  const pendingReview = COMPLIANCE_DATA.filter((r) => r.status === 'pending' || r.status === 'under_review').length
  const nonCompliantCount = COMPLIANCE_DATA.filter((r) => r.status === 'non_compliant').length

  const columns: Column<ComplianceRecord>[] = [
    { header: 'Regulation', cell: (r) => <span className="text-[13px] font-semibold text-heading">{t(r.regulation)}</span> },
    { header: 'Area', cell: (r) => t(r.area) },
    { header: 'Due Date', cell: (r) => r.dueDate },
    { header: 'Last Audit', cell: (r) => r.lastAudit },
    { header: 'Auditor', cell: (r) => r.auditor },
    { header: 'Status', cell: (r) => <Tone value={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ClipboardCheck"
        title={t('Compliance Management')}
        subtitle={t('Regulatory compliance tracking and audits')}
        actions={
          can('compliance', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('New Audit')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Compliant', value: compliantCount, caption: 'Regulations met', highlight: true },
          { label: 'Pending Review', value: pendingReview, caption: 'Awaiting action', tone: 'warning' },
          { label: 'Non-Compliant', value: nonCompliantCount, caption: 'Requires attention' },
          { label: 'Next Audit', value: t('Sep 01'), caption: 'Upcoming' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'compliant', 'pending', 'under_review', 'non_compliant'] as const).map((option) => {
          const count = option === 'all' ? COMPLIANCE_DATA.length : COMPLIANCE_DATA.filter((r) => r.status === option).length
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
        title={t('Compliance Records')}
        toolbar={<SearchField value={query} onChange={setQuery} placeholder="Search regulations..." />}
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={[...filtered]}
          rowKey={(r) => r.id}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={t(r.regulation)} trailing={<Tone value={r.status} />} />
              <MobileCardRow label={t('Area')}>{t(r.area)}</MobileCardRow>
              <MobileCardRow label={t('Due Date')}>{r.dueDate}</MobileCardRow>
              <MobileCardRow label={t('Auditor')}>{r.auditor}</MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="ClipboardCheck" title={t('No compliance records found')} />}
        />
      </Section>
    </>
  )
}

// ── 4. Safety Incidents ────────────────────────────────────────────────────

interface SafetyIncident {
  id: string
  title: string
  location: string
  date: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  reporter: string
  status: 'open' | 'investigating' | 'resolved' | 'closed'
}

const INCIDENTS: readonly SafetyIncident[] = [
  { id: 'SI001', title: 'Chemical Spill – Bay 3', location: 'Workshop', date: '2026-08-25', severity: 'high', reporter: 'Yousef Al-Otaibi', status: 'investigating' },
  { id: 'SI002', title: 'Slip Hazard – Parking', location: 'Lot A', date: '2026-08-20', severity: 'medium', reporter: 'Bandar Al-Qahtani', status: 'resolved' },
  { id: 'SI003', title: 'Electrical Short – Panel B', location: 'Utility Room', date: '2026-08-15', severity: 'critical', reporter: 'Nasser Al-Dosari', status: 'closed' },
  { id: 'SI004', title: 'Minor Burn – Welding', location: 'Workshop', date: '2026-08-10', severity: 'low', reporter: 'Faisal Al-Harbi', status: 'closed' },
  { id: 'SI005', title: 'Tool Injury – Bay 1', location: 'Workshop', date: '2026-08-05', severity: 'medium', reporter: 'Omar Al-Rashid', status: 'closed' },
  { id: 'SI006', title: 'Near Miss – Lift Failure', location: 'Workshop', date: '2026-07-28', severity: 'high', reporter: 'Khalid Al-Amri', status: 'resolved' },
  { id: 'SI007', title: 'Eye Irritation – Paint Booth', location: 'Paint Shop', date: '2026-08-27', severity: 'medium', reporter: 'Sara Al-Mutairi', status: 'open' },
]

export function SafetyIncidents() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = filter === 'all' ? INCIDENTS : INCIDENTS.filter((i) => i.status === filter)
    const needle = query.trim().toLowerCase()
    if (needle) list = list.filter((i) => i.title.toLowerCase().includes(needle) || i.location.toLowerCase().includes(needle))
    return list
  }, [filter, query])

  const openCount = INCIDENTS.filter((i) => i.status === 'open' || i.status === 'investigating').length
  const resolvedCount = INCIDENTS.filter((i) => i.status === 'resolved' || i.status === 'closed').length
  const criticalCount = INCIDENTS.filter((i) => i.severity === 'critical').length
  const thisMonth = INCIDENTS.filter((i) => i.date.startsWith('2026-08')).length

  const columns: Column<SafetyIncident>[] = [
    { header: 'Incident', cell: (i) => <span className="text-[13px] font-semibold text-heading">{t(i.title)}</span> },
    { header: 'Location', cell: (i) => t(i.location) },
    { header: 'Date', cell: (i) => i.date },
    { header: 'Severity', cell: (i) => <Tone value={i.severity} /> },
    { header: 'Reporter', cell: (i) => i.reporter },
    { header: 'Status', cell: (i) => <Tone value={i.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="AlertTriangle"
        title={t('Safety Incidents')}
        subtitle={t('Workplace safety incident reporting and tracking')}
        actions={
          can('safety', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Report Incident')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Open Incidents', value: openCount, caption: 'Needs attention', highlight: true, tone: 'warning' },
          { label: 'Resolved', value: resolvedCount, caption: 'Closed out', tone: 'info' },
          { label: 'Critical', value: criticalCount, caption: 'Severity' },
          { label: 'This Month', value: thisMonth, caption: 'Aug 2026' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'open', 'investigating', 'resolved', 'closed'] as const).map((option) => {
          const count = option === 'all' ? INCIDENTS.length : INCIDENTS.filter((i) => i.status === option).length
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
        title={t('Incident Log')}
        toolbar={<SearchField value={query} onChange={setQuery} placeholder="Search incidents..." />}
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={[...filtered]}
          rowKey={(i) => i.id}
          mobileCard={(i) => (
            <>
              <MobileCardHeader title={t(i.title)} trailing={<Tone value={i.status} />} />
              <MobileCardRow label={t('Location')}>{t(i.location)}</MobileCardRow>
              <MobileCardRow label={t('Date')}>{i.date}</MobileCardRow>
              <MobileCardRow label={t('Severity')}><Tone value={i.severity} /></MobileCardRow>
              <MobileCardRow label={t('Reporter')}>{i.reporter}</MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="AlertTriangle" title={t('No incidents reported')} />}
        />
      </Section>
    </>
  )
}

// ── 5. Environmental Compliance ────────────────────────────────────────────

interface EnvironmentalMetric {
  id: string
  metric: string
  category: string
  currentValue: string
  target: string
  unit: string
  lastMeasured: string
  status: 'compliant' | 'non_compliant' | 'pending'
}

const ENV_METRICS: readonly EnvironmentalMetric[] = [
  { id: 'EN001', metric: 'Waste Oil Disposal', category: 'Hazardous Waste', currentValue: '98%', target: '≥95%', unit: '%', lastMeasured: '2026-08-25', status: 'compliant' },
  { id: 'EN002', metric: 'Air Quality Index', category: 'Emissions', currentValue: '42 ppm', target: '<50 ppm', unit: 'ppm', lastMeasured: '2026-08-20', status: 'compliant' },
  { id: 'EN003', metric: 'Water Usage', category: 'Conservation', currentValue: '12,500 L', target: '<15,000 L', unit: 'L/month', lastMeasured: '2026-08-28', status: 'compliant' },
  { id: 'EN004', metric: 'Chemical Storage', category: 'Hazardous Materials', currentValue: '85%', target: '≥90%', unit: '%', lastMeasured: '2026-08-22', status: 'non_compliant' },
  { id: 'EN005', metric: 'Noise Level', category: 'Workplace', currentValue: '78 dB', target: '<85 dB', unit: 'dB', lastMeasured: '2026-08-18', status: 'compliant' },
  { id: 'EN006', metric: 'Energy Consumption', category: 'Utilities', currentValue: '45,000 kWh', target: '<50,000 kWh', unit: 'kWh', lastMeasured: '2026-08-28', status: 'compliant' },
  { id: 'EN007', metric: 'Recycling Rate', category: 'Waste Management', currentValue: '62%', target: '≥70%', unit: '%', lastMeasured: '2026-08-15', status: 'pending' },
]

export function EnvironmentalCompliance() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = filter === 'all' ? ENV_METRICS : ENV_METRICS.filter((m) => m.status === filter)
    const needle = query.trim().toLowerCase()
    if (needle) list = list.filter((m) => m.metric.toLowerCase().includes(needle) || m.category.toLowerCase().includes(needle))
    return list
  }, [filter, query])

  const compliantCount = ENV_METRICS.filter((m) => m.status === 'compliant').length
  const nonCompliantCount = ENV_METRICS.filter((m) => m.status === 'non_compliant').length
  const pendingCount = ENV_METRICS.filter((m) => m.status === 'pending').length

  const columns: Column<EnvironmentalMetric>[] = [
    { header: 'Metric', cell: (m) => <span className="text-[13px] font-semibold text-heading">{t(m.metric)}</span> },
    { header: 'Category', cell: (m) => t(m.category) },
    { header: 'Current', cell: (m) => <span className="font-mono text-[13px] text-salis-blue">{m.currentValue}</span> },
    { header: 'Target', cell: (m) => <span className="font-mono text-[13px] text-muted">{m.target}</span> },
    { header: 'Unit', cell: (m) => t(m.unit) },
    { header: 'Last Measured', cell: (m) => m.lastMeasured },
    { header: 'Status', cell: (m) => <Tone value={m.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Leaf"
        title={t('Environmental Compliance')}
        subtitle={t('Environmental standards and sustainability tracking')}
        actions={
          can('compliance', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('New Assessment')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Compliant', value: compliantCount, caption: 'Meeting targets', highlight: true },
          { label: 'Non-Compliant', value: nonCompliantCount, caption: 'Below target', tone: 'warning' },
          { label: 'Pending', value: pendingCount, caption: 'Under review' },
          { label: 'Metrics Tracked', value: ENV_METRICS.length, caption: 'Total' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'compliant', 'non_compliant', 'pending'] as const).map((option) => {
          const count = option === 'all' ? ENV_METRICS.length : ENV_METRICS.filter((m) => m.status === option).length
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
        title={t('Environmental Metrics')}
        toolbar={<SearchField value={query} onChange={setQuery} placeholder="Search metrics..." />}
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={[...filtered]}
          rowKey={(m) => m.id}
          mobileCard={(m) => (
            <>
              <MobileCardHeader title={t(m.metric)} trailing={<Tone value={m.status} />} />
              <MobileCardRow label={t('Category')}>{t(m.category)}</MobileCardRow>
              <MobileCardRow label={t('Current')}><span className="font-mono text-salis-blue">{m.currentValue}</span></MobileCardRow>
              <MobileCardRow label={t('Target')}><span className="font-mono text-muted">{m.target}</span></MobileCardRow>
              <MobileCardRow label={t('Last Measured')}>{m.lastMeasured}</MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="Leaf" title={t('No environmental metrics found')} />}
        />
      </Section>
    </>
  )
}

// ── 6. ISO Quality Management ──────────────────────────────────────────────

interface ISOStandard {
  id: string
  standard: string
  scope: string
  certBody: string
  certDate: string
  expiryDate: string
  findings: number
  status: 'certified' | 'expired' | 'pending' | 'in_progress'
}

const ISO_STANDARDS: readonly ISOStandard[] = [
  { id: 'ISO001', standard: 'ISO 9001:2015', scope: 'Quality Management', certBody: 'SGS', certDate: '2024-06-15', expiryDate: '2027-06-14', findings: 2, status: 'certified' },
  { id: 'ISO002', standard: 'ISO 14001:2015', scope: 'Environmental', certBody: 'Bureau Veritas', certDate: '2024-09-01', expiryDate: '2027-08-31', findings: 1, status: 'certified' },
  { id: 'ISO003', standard: 'ISO 45001:2018', scope: 'Occupational H&S', certBody: 'TÜV', certDate: '', expiryDate: '', findings: 5, status: 'in_progress' },
  { id: 'ISO004', standard: 'ISO 27001:2022', scope: 'Information Security', certBody: 'BSI', certDate: '', expiryDate: '', findings: 8, status: 'pending' },
  { id: 'ISO005', standard: 'IATF 16949', scope: 'Automotive Quality', certBody: 'DNV', certDate: '2023-12-01', expiryDate: '2026-11-30', findings: 0, status: 'certified' },
  { id: 'ISO006', standard: 'ISO 22301', scope: 'Business Continuity', certBody: 'SGS', certDate: '2022-03-01', expiryDate: '2025-02-28', findings: 3, status: 'expired' },
]

export function ISOQualityManagement() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = filter === 'all' ? ISO_STANDARDS : ISO_STANDARDS.filter((s) => s.status === filter)
    const needle = query.trim().toLowerCase()
    if (needle) list = list.filter((s) => s.standard.toLowerCase().includes(needle) || s.scope.toLowerCase().includes(needle))
    return list
  }, [filter, query])

  const certifiedCount = ISO_STANDARDS.filter((s) => s.status === 'certified').length
  const inProgressCount = ISO_STANDARDS.filter((s) => s.status === 'in_progress').length
  const pendingCount = ISO_STANDARDS.filter((s) => s.status === 'pending').length
  const totalFindings = ISO_STANDARDS.reduce((sum, s) => sum + s.findings, 0)

  const columns: Column<ISOStandard>[] = [
    { header: 'Standard', cell: (s) => <span className="text-[13px] font-semibold text-heading">{s.standard}</span> },
    { header: 'Scope', cell: (s) => t(s.scope) },
    { header: 'Cert Body', cell: (s) => s.certBody },
    { header: 'Cert Date', cell: (s) => s.certDate || <span className="text-muted">&mdash;</span> },
    { header: 'Expiry Date', cell: (s) => s.expiryDate || <span className="text-muted">&mdash;</span> },
    { header: 'Findings', cell: (s) => <span className="font-mono text-[13px]" dir="ltr">{s.findings}</span> },
    { header: 'Status', cell: (s) => <Tone value={s.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Award"
        title={t('ISO Quality Management')}
        subtitle={t('ISO certification standards and quality audits')}
        actions={
          can('compliance', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Schedule Audit')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Certified', value: certifiedCount, caption: 'Active certs', highlight: true },
          { label: 'In Progress', value: inProgressCount, caption: 'Working towards', tone: 'info' },
          { label: 'Pending', value: pendingCount, caption: 'Not started', tone: 'warning' },
          { label: 'Open Findings', value: totalFindings, caption: 'Across all standards' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'certified', 'in_progress', 'pending', 'expired'] as const).map((option) => {
          const count = option === 'all' ? ISO_STANDARDS.length : ISO_STANDARDS.filter((s) => s.status === option).length
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
        title={t('ISO Standards')}
        toolbar={<SearchField value={query} onChange={setQuery} placeholder="Search standards..." />}
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={[...filtered]}
          rowKey={(s) => s.id}
          mobileCard={(s) => (
            <>
              <MobileCardHeader title={s.standard} trailing={<Tone value={s.status} />} />
              <MobileCardRow label={t('Scope')}>{t(s.scope)}</MobileCardRow>
              <MobileCardRow label={t('Cert Body')}>{s.certBody}</MobileCardRow>
              <MobileCardRow label={t('Cert Date')}>{s.certDate || '—'}</MobileCardRow>
              <MobileCardRow label={t('Expiry Date')}>{s.expiryDate || '—'}</MobileCardRow>
              <MobileCardRow label={t('Findings')}><span className="font-mono">{s.findings}</span></MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="Award" title={t('No ISO standards found')} />}
        />
      </Section>
    </>
  )
}

// ── 7. Equipment Calibration ───────────────────────────────────────────────

interface CalibrationRecord {
  id: string
  equipment: string
  type: string
  lastCalibration: string
  nextDue: string
  technician: string
  certificate: string
  status: 'calibrated' | 'due_soon' | 'overdue' | 'scheduled'
}

const CALIBRATION_DATA: readonly CalibrationRecord[] = [
  { id: 'CAL001', equipment: 'Torque Wrench Set A', type: 'Mechanical', lastCalibration: '2026-07-15', nextDue: '2026-10-15', technician: 'Yousef Al-Otaibi', certificate: 'CAL-2026-0715A', status: 'calibrated' },
  { id: 'CAL002', equipment: 'Digital Multimeter', type: 'Electrical', lastCalibration: '2026-06-01', nextDue: '2026-09-01', technician: 'Bandar Al-Qahtani', certificate: 'CAL-2026-0601B', status: 'due_soon' },
  { id: 'CAL003', equipment: 'Wheel Alignment System', type: 'Diagnostic', lastCalibration: '2026-08-01', nextDue: '2026-11-01', technician: 'Nasser Al-Dosari', certificate: 'CAL-2026-0801C', status: 'calibrated' },
  { id: 'CAL004', equipment: 'Brake Tester', type: 'Mechanical', lastCalibration: '2026-05-15', nextDue: '2026-08-15', technician: 'Faisal Al-Harbi', certificate: 'CAL-2026-0515D', status: 'overdue' },
  { id: 'CAL005', equipment: 'OBD-II Scanner', type: 'Diagnostic', lastCalibration: '2026-08-10', nextDue: '2026-11-10', technician: 'Omar Al-Rashid', certificate: 'CAL-2026-0810E', status: 'calibrated' },
  { id: 'CAL006', equipment: 'Pressure Gauge Set', type: 'Mechanical', lastCalibration: '2026-07-01', nextDue: '2026-10-01', technician: 'Yousef Al-Otaibi', certificate: 'CAL-2026-0701F', status: 'calibrated' },
  { id: 'CAL007', equipment: 'Paint Thickness Meter', type: 'Inspection', lastCalibration: '2026-04-01', nextDue: '2026-07-01', technician: 'Khalid Al-Amri', certificate: 'CAL-2026-0401G', status: 'overdue' },
  { id: 'CAL008', equipment: 'AC Recovery Unit', type: 'HVAC', lastCalibration: '2026-08-20', nextDue: '2026-11-20', technician: 'Bandar Al-Qahtani', certificate: 'CAL-2026-0820H', status: 'scheduled' },
]

export function EquipmentCalibration() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = filter === 'all' ? CALIBRATION_DATA : CALIBRATION_DATA.filter((c) => c.status === filter)
    const needle = query.trim().toLowerCase()
    if (needle) list = list.filter((c) => c.equipment.toLowerCase().includes(needle) || c.type.toLowerCase().includes(needle))
    return list
  }, [filter, query])

  const calibratedCount = CALIBRATION_DATA.filter((c) => c.status === 'calibrated').length
  const dueSoonCount = CALIBRATION_DATA.filter((c) => c.status === 'due_soon').length
  const overdueCount = CALIBRATION_DATA.filter((c) => c.status === 'overdue').length

  const columns: Column<CalibrationRecord>[] = [
    { header: 'Equipment', cell: (c) => <span className="text-[13px] font-semibold text-heading">{t(c.equipment)}</span> },
    { header: 'Type', cell: (c) => t(c.type) },
    { header: 'Last Calibration', cell: (c) => c.lastCalibration },
    { header: 'Next Due', cell: (c) => c.nextDue },
    { header: 'Technician', cell: (c) => c.technician },
    { header: 'Certificate', cell: (c) => <span className="font-mono text-[13px] text-muted">{c.certificate}</span> },
    { header: 'Status', cell: (c) => <Tone value={c.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Gauge"
        title={t('Equipment Calibration')}
        subtitle={t('Calibration schedules and equipment compliance')}
        actions={
          can('workshop', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Schedule Calibration')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Total Equipment', value: CALIBRATION_DATA.length, caption: 'Tracked', highlight: true },
          { label: 'Calibrated', value: calibratedCount, caption: 'Up to date', tone: 'info' },
          { label: 'Due Soon', value: dueSoonCount, caption: 'Approaching', tone: 'warning' },
          { label: 'Overdue', value: overdueCount, caption: 'Past due', tone: 'warning' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'calibrated', 'due_soon', 'overdue', 'scheduled'] as const).map((option) => {
          const count = option === 'all' ? CALIBRATION_DATA.length : CALIBRATION_DATA.filter((c) => c.status === option).length
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
        title={t('Calibration Records')}
        toolbar={<SearchField value={query} onChange={setQuery} placeholder="Search equipment..." />}
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={[...filtered]}
          rowKey={(c) => c.id}
          mobileCard={(c) => (
            <>
              <MobileCardHeader title={t(c.equipment)} trailing={<Tone value={c.status} />} />
              <MobileCardRow label={t('Type')}>{t(c.type)}</MobileCardRow>
              <MobileCardRow label={t('Last Calibration')}>{c.lastCalibration}</MobileCardRow>
              <MobileCardRow label={t('Next Due')}>{c.nextDue}</MobileCardRow>
              <MobileCardRow label={t('Technician')}>{c.technician}</MobileCardRow>
              <MobileCardRow label={t('Certificate')}><span className="font-mono text-muted">{c.certificate}</span></MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="Gauge" title={t('No calibration records found')} />}
        />
      </Section>
    </>
  )
}
