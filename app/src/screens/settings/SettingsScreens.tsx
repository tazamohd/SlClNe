import { useMemo, useState } from 'react'
import {
  FeatureHeader,
  SearchField,
  Section,
  StatRow,
  TabBar,
  type Stat,
} from '@/components/shell/FeatureScreen'
import { Badge } from '@/components/ui/Badge'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'

// ─── User Profile ──────────────────────────────────────────────────────────────

interface ProfileRow {
  field: string
  value: string
}

const PROFILE_TABS = [
  { id: 'details', label: 'Details', icon: 'UserCircle' },
  { id: 'activity', label: 'Activity', icon: 'Activity' },
  { id: 'sessions', label: 'Sessions', icon: 'Monitor' },
  { id: 'security', label: 'Security', icon: 'Shield' },
] as const

const DEMO_PROFILE: readonly ProfileRow[] = []

export function UserProfile() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(PROFILE_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly ProfileRow[] = DEMO_PROFILE
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.field, r.value].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [query])

  const stats: Stat[] = [
    { label: 'Role', value: '—', caption: 'Assigned', highlight: true },
    { label: 'Last Login', value: '—', caption: 'Most recent', tone: 'info' },
    { label: 'Active Sessions', value: 0, caption: 'Signed in' },
    { label: 'Security Alerts', value: 0, caption: 'Need attention', tone: 'warning' },
  ]

  const columns: Column<ProfileRow>[] = [
    { header: 'Field', cell: (r) => <span className="font-medium text-heading">{r.field}</span> },
    { header: 'Value', cell: (r) => r.value },
  ]

  return (
    <>
      <FeatureHeader
        icon="UserCircle"
        title={t('User Profile')}
        subtitle={t('Your account details and activity')}
      />

      <TabBar tabs={PROFILE_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Account Details')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.field}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.field} />
              <MobileCardRow label={t('Value')}>{r.value}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="UserCircle"
              title={t('Your details appear here')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── System Settings ───────────────────────────────────────────────────────────

interface SystemSettingRow {
  setting: string
  scope: string
  value: string
}

const SYSTEM_TABS = [
  { id: 'general', label: 'General', icon: 'Settings' },
  { id: 'modules', label: 'Modules', icon: 'LayoutGrid' },
  { id: 'integrations', label: 'Integrations', icon: 'Plug' },
  { id: 'updates', label: 'Updates', icon: 'RefreshCw' },
] as const

const DEMO_SYSTEM_SETTINGS: readonly SystemSettingRow[] = []

export function SystemSettings() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(SYSTEM_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly SystemSettingRow[] = DEMO_SYSTEM_SETTINGS
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.setting, r.scope, r.value].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [query])

  const stats: Stat[] = [
    { label: 'Modules Enabled', value: 0, caption: 'Active', highlight: true },
    { label: 'Integrations', value: 0, caption: 'Connected', tone: 'info' },
    { label: 'Pending Updates', value: 0, caption: 'Available', tone: 'warning' },
    { label: 'Environment', value: 'Production', caption: 'Current' },
  ]

  const columns: Column<SystemSettingRow>[] = [
    { header: 'Setting', cell: (r) => <span className="font-medium text-heading">{r.setting}</span> },
    { header: 'Scope', cell: (r) => r.scope },
    { header: 'Value', cell: (r) => r.value },
  ]

  return (
    <>
      <FeatureHeader
        icon="Settings"
        title={t('System Settings')}
        subtitle={t('Global configuration for the platform')}
      />

      <TabBar tabs={SYSTEM_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Configuration')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search settings...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.setting}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.setting} />
              <MobileCardRow label={t('Scope')}>{r.scope}</MobileCardRow>
              <MobileCardRow label={t('Value')}>{r.value}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Settings"
              title={t('System settings appear here')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── User Settings ─────────────────────────────────────────────────────────────

interface UserSettingRow {
  setting: string
  value: string
}

const USER_SETTING_TABS = [
  { id: 'preferences', label: 'Preferences', icon: 'Settings2' },
  { id: 'notifications', label: 'Notifications', icon: 'Bell' },
  { id: 'privacy', label: 'Privacy', icon: 'Eye' },
  { id: 'display', label: 'Display', icon: 'Monitor' },
] as const

const DEMO_USER_SETTINGS: readonly UserSettingRow[] = []

export function UserSettings() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(USER_SETTING_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly UserSettingRow[] = DEMO_USER_SETTINGS
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.setting, r.value].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [query])

  const stats: Stat[] = [
    { label: 'Language', value: '—', caption: 'Interface', highlight: true },
    { label: 'Theme', value: '—', caption: 'Appearance', tone: 'info' },
    { label: 'Notifications', value: 'On', caption: 'Alerts' },
    { label: 'Two-Factor', value: 'Off', caption: 'Sign-in security', tone: 'warning' },
  ]

  const columns: Column<UserSettingRow>[] = [
    { header: 'Setting', cell: (r) => <span className="font-medium text-heading">{r.setting}</span> },
    { header: 'Value', cell: (r) => r.value },
  ]

  return (
    <>
      <FeatureHeader
        icon="Settings2"
        title={t('User Settings')}
        subtitle={t('Personal preferences and notifications')}
      />

      <TabBar tabs={USER_SETTING_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Preferences')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.setting}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.setting} />
              <MobileCardRow label={t('Value')}>{r.value}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Settings2"
              title={t('Your preferences appear here')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Security Settings ─────────────────────────────────────────────────────────

interface SecurityRow {
  policy: string
  scope: string
  status: 'active' | 'inactive' | 'enforced'
}

const SECURITY_TABS = [
  { id: 'policies', label: 'Policies', icon: 'Lock' },
  { id: 'sessions', label: 'Sessions', icon: 'Monitor' },
  { id: 'audit', label: 'Audit', icon: 'FileSearch' },
  { id: 'alerts', label: 'Alerts', icon: 'AlertCircle' },
] as const

const DEMO_SECURITY: readonly SecurityRow[] = []

function SecurityStatusBadge({ status }: { status: SecurityRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'inactive':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Inactive')}
        </Badge>
      )
    case 'enforced':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Enforced')}
        </Badge>
      )
  }
}

export function SecuritySettings() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(SECURITY_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly SecurityRow[] = DEMO_SECURITY
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.policy, r.scope].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [query])

  const stats: Stat[] = [
    { label: 'Two-Factor Users', value: '0%', caption: 'Enrolled', highlight: true },
    { label: 'Active Sessions', value: 0, caption: 'Across users', tone: 'info' },
    { label: 'Failed Logins', value: 0, caption: 'Last 24h', tone: 'warning' },
    { label: 'Policies', value: 0, caption: 'Enforced' },
  ]

  const columns: Column<SecurityRow>[] = [
    { header: 'Policy', cell: (r) => <span className="font-medium text-heading">{r.policy}</span> },
    { header: 'Scope', cell: (r) => r.scope },
    { header: 'Status', cell: (r) => <SecurityStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Lock"
        title={t('Security Settings')}
        subtitle={t('Authentication, sessions and access policies')}
      />

      <TabBar tabs={SECURITY_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Security Policies')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.policy}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.policy} trailing={<SecurityStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Scope')}>{r.scope}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Lock"
              title={t('No security policies configured')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Role Management ───────────────────────────────────────────────────────────

interface RoleRow {
  role: string
  members: number
  permissions: number
  type: 'system' | 'custom'
}

const ROLE_TABS = [
  { id: 'all', label: 'All', icon: 'Key' },
  { id: 'system', label: 'System', icon: 'Shield' },
  { id: 'custom', label: 'Custom', icon: 'Pencil' },
  { id: 'unused', label: 'Unused', icon: 'Archive' },
] as const

const DEMO_ROLES: readonly RoleRow[] = []

function RoleTypeBadge({ type }: { type: RoleRow['type'] }) {
  const { t } = usePreferences()
  switch (type) {
    case 'system':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('System')}
        </Badge>
      )
    case 'custom':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Custom')}
        </Badge>
      )
  }
}

export function RoleManagement() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(ROLE_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly RoleRow[] = DEMO_ROLES
    if (tab === 'system') {
      rows = rows.filter((r) => r.type === 'system')
    } else if (tab === 'custom') {
      rows = rows.filter((r) => r.type === 'custom')
    } else if (tab === 'unused') {
      rows = rows.filter((r) => r.members === 0)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) => r.role.toLowerCase().includes(needle))
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Roles', value: 0, caption: 'Defined', highlight: true },
    { label: 'Users Assigned', value: 0, caption: 'Across roles', tone: 'info' },
    { label: 'Custom Roles', value: 0, caption: 'Non-default' },
    { label: 'Unused Roles', value: 0, caption: 'No members', tone: 'warning' },
  ]

  const columns: Column<RoleRow>[] = [
    { header: 'Role', cell: (r) => <span className="font-medium text-heading">{r.role}</span> },
    { header: 'Members', cell: (r) => r.members },
    { header: 'Permissions', cell: (r) => r.permissions },
    { header: 'Type', cell: (r) => <RoleTypeBadge type={r.type} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Key"
        title={t('Role Management')}
        subtitle={t('Define roles and their permissions')}
      />

      <TabBar tabs={ROLE_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Roles')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search roles...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.role}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.role} trailing={<RoleTypeBadge type={r.type} />} />
              <MobileCardRow label={t('Members')}>{r.members}</MobileCardRow>
              <MobileCardRow label={t('Permissions')}>{r.permissions}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Key"
              title={t('No roles defined yet')}
            />
          }
        />
      </Section>
    </>
  )
}
