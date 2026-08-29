import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { FeatureHeader, StatRow } from '@/components/shell/FeatureScreen'
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
  configured: ['rgba(10,94,215,.1)', '#0A5ED7'],
  connected: ['rgba(10,94,215,.1)', '#0A5ED7'],
  compliant: ['rgba(10,94,215,.1)', '#0A5ED7'],
  pending: ['rgba(249,115,22,.1)', '#F97316'],
  warning: ['rgba(249,115,22,.1)', '#F97316'],
  disabled: ['rgba(100,116,139,.1)', '#64748B'],
  inactive: ['rgba(100,116,139,.1)', '#64748B'],
  default: ['rgba(100,116,139,.1)', '#64748B'],
  error: ['rgba(11,31,59,.1)', '#0B1F3B'],
  critical: ['rgba(11,31,59,.1)', '#0B1F3B'],
  info: ['rgba(11,179,255,.1)', '#0BB3FF'],
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

// ── 1. System Settings ─────────────────────────────────────────────────────

interface SystemSetting {
  id: string
  name: string
  category: string
  value: string
  type: 'text' | 'toggle' | 'select'
  lastModified: string
  modifiedBy: string
  status: 'active' | 'default' | 'pending'
}

const SYSTEM_SETTINGS: readonly SystemSetting[] = [
  { id: 'SS001', name: 'general.timezone', category: 'general', value: 'Asia/Riyadh', type: 'select', lastModified: '2026-08-15', modifiedBy: 'Khalid Al-Amri', status: 'active' },
  { id: 'SS002', name: 'general.language', category: 'general', value: 'Arabic', type: 'select', lastModified: '2026-08-15', modifiedBy: 'Khalid Al-Amri', status: 'active' },
  { id: 'SS003', name: 'general.currency', category: 'general', value: 'SAR', type: 'select', lastModified: '2026-07-01', modifiedBy: 'Khalid Al-Amri', status: 'default' },
  { id: 'SS004', name: 'system.backup_frequency', category: 'system', value: 'Daily', type: 'select', lastModified: '2026-08-20', modifiedBy: 'Admin', status: 'active' },
  { id: 'SS005', name: 'system.session_timeout', category: 'system', value: '30 minutes', type: 'text', lastModified: '2026-08-10', modifiedBy: 'Admin', status: 'active' },
  { id: 'SS006', name: 'system.max_upload_size', category: 'system', value: '50 MB', type: 'text', lastModified: '2026-06-01', modifiedBy: 'Admin', status: 'default' },
  { id: 'SS007', name: 'notification.email_enabled', category: 'notification', value: 'Enabled', type: 'toggle', lastModified: '2026-08-25', modifiedBy: 'Sara Al-Mutairi', status: 'active' },
  { id: 'SS008', name: 'notification.sms_enabled', category: 'notification', value: 'Disabled', type: 'toggle', lastModified: '2026-08-25', modifiedBy: 'Sara Al-Mutairi', status: 'pending' },
]

export function SystemSettings() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? SYSTEM_SETTINGS : SYSTEM_SETTINGS.filter((s) => s.category === filter)),
    [filter]
  )

  const modified = SYSTEM_SETTINGS.filter((s) => s.status !== 'default').length

  const columns: Column<SystemSetting>[] = [
    { header: 'Setting Name', cell: (s) => <span className="text-[13px] font-semibold text-heading">{s.name}</span> },
    { header: 'Category', cell: (s) => t(s.category[0].toUpperCase() + s.category.slice(1)) },
    { header: 'Value', cell: (s) => <span className="font-mono text-[13px]" dir="ltr">{s.value}</span> },
    { header: 'Last Modified', cell: (s) => s.lastModified },
    { header: 'Modified By', cell: (s) => s.modifiedBy },
    { header: 'Status', cell: (s) => <Tone value={s.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Settings"
        title={t('System Settings')}
        subtitle={t('Global system configuration and preferences')}
        actions={
          can('settings', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add Setting')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Total Settings', value: SYSTEM_SETTINGS.length, caption: 'Configured', highlight: true },
          { label: 'Modified', value: modified, caption: 'Non-default', tone: 'info' },
          { label: 'System Modules', value: 4, caption: 'Active' },
          { label: 'Active Integrations', value: 3, caption: 'Connected' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'general', 'system', 'notification'] as const).map((option) => {
          const count = option === 'all' ? SYSTEM_SETTINGS.length : SYSTEM_SETTINGS.filter((s) => s.category === option).length
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

      <DataTable
        columns={columns}
        rows={[...filtered]}
        rowKey={(s) => s.id}
        mobileCard={(s) => (
          <>
            <MobileCardHeader title={s.name} trailing={<Tone value={s.status} />} />
            <MobileCardRow label={t('Category')}>{t(s.category[0].toUpperCase() + s.category.slice(1))}</MobileCardRow>
            <MobileCardRow label={t('Value')}>
              <span className="font-mono" dir="ltr">{s.value}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Modified By')}>{s.modifiedBy}</MobileCardRow>
            <MobileCardRow label={t('Last Modified')}>{s.lastModified}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Settings" title={t('No settings found')} />}
      />
    </>
  )
}

// ── 2. User Settings ───────────────────────────────────────────────────────

interface UserSetting {
  id: string
  label: string
  category: string
  value: string
  defaultValue: string
  type: 'text' | 'toggle' | 'select'
}

const USER_SETTINGS: readonly UserSetting[] = [
  { id: 'US001', label: 'Display Theme', category: 'display', value: 'Light', defaultValue: 'System', type: 'select' },
  { id: 'US002', label: 'Language', category: 'display', value: 'Arabic', defaultValue: 'English', type: 'select' },
  { id: 'US003', label: 'Time Zone', category: 'regional', value: 'Asia/Riyadh', defaultValue: 'UTC', type: 'select' },
  { id: 'US004', label: 'Date Format', category: 'regional', value: 'DD/MM/YYYY', defaultValue: 'MM/DD/YYYY', type: 'select' },
  { id: 'US005', label: 'Notifications', category: 'notifications', value: 'Enabled', defaultValue: 'Enabled', type: 'toggle' },
  { id: 'US006', label: 'Email Digest', category: 'notifications', value: 'Weekly', defaultValue: 'Daily', type: 'select' },
  { id: 'US007', label: 'Dashboard Layout', category: 'display', value: 'Default', defaultValue: 'Default', type: 'select' },
  { id: 'US008', label: 'Currency Display', category: 'regional', value: 'SAR', defaultValue: 'SAR', type: 'select' },
]

export function UserSettings() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? USER_SETTINGS : USER_SETTINGS.filter((s) => s.category === filter)),
    [filter]
  )

  const customCount = USER_SETTINGS.filter((s) => s.value !== s.defaultValue).length

  const columns: Column<UserSetting>[] = [
    { header: 'Preference', cell: (s) => <span className="text-[13px] font-semibold text-heading">{t(s.label)}</span> },
    { header: 'Category', cell: (s) => t(s.category[0].toUpperCase() + s.category.slice(1)) },
    { header: 'Current Value', cell: (s) => <span className="font-mono text-[13px]" dir="ltr">{s.value}</span> },
    { header: 'Default Value', cell: (s) => <span className="text-[13px] text-muted">{s.defaultValue}</span> },
    { header: 'Type', cell: (s) => t(s.type[0].toUpperCase() + s.type.slice(1)) },
  ]

  return (
    <>
      <FeatureHeader
        icon="UserCog"
        title={t('User Settings')}
        subtitle={t('Personal preferences and account configuration')}
      />
      <StatRow
        stats={[
          { label: 'Preferences', value: USER_SETTINGS.length, caption: 'Available', highlight: true },
          { label: 'Custom', value: customCount, caption: 'Non-default', tone: 'info' },
          { label: 'Categories', value: 3, caption: 'Grouped' },
          { label: 'Synced', value: '2 devices', caption: 'Connected' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'display', 'notifications', 'regional'] as const).map((option) => {
          const count = option === 'all' ? USER_SETTINGS.length : USER_SETTINGS.filter((s) => s.category === option).length
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

      <DataTable
        columns={columns}
        rows={[...filtered]}
        rowKey={(s) => s.id}
        mobileCard={(s) => (
          <>
            <MobileCardHeader title={t(s.label)} />
            <MobileCardRow label={t('Category')}>{t(s.category[0].toUpperCase() + s.category.slice(1))}</MobileCardRow>
            <MobileCardRow label={t('Current Value')}>
              <span className="font-mono" dir="ltr">{s.value}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Default Value')}>
              <span className="text-muted">{s.defaultValue}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Type')}>{t(s.type[0].toUpperCase() + s.type.slice(1))}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="UserCog" title={t('No preferences found')} />}
      />
    </>
  )
}

// ── 3. Security Settings ───────────────────────────────────────────────────

interface SecuritySetting {
  id: string
  policy: string
  description: string
  enforcement: 'enforced' | 'optional' | 'disabled'
  scope: string
  lastUpdated: string
  status: 'active' | 'warning' | 'disabled'
}

const SECURITY_SETTINGS: readonly SecuritySetting[] = [
  { id: 'SEC001', policy: 'Password Complexity', description: 'Min 12 chars, uppercase, number, symbol', enforcement: 'enforced', scope: 'All Users', lastUpdated: '2026-08-01', status: 'active' },
  { id: 'SEC002', policy: 'Two-Factor Auth', description: 'TOTP/SMS required for all accounts', enforcement: 'enforced', scope: 'All Users', lastUpdated: '2026-08-10', status: 'active' },
  { id: 'SEC003', policy: 'Session Timeout', description: '30 min inactivity auto-logout', enforcement: 'enforced', scope: 'All Users', lastUpdated: '2026-07-15', status: 'active' },
  { id: 'SEC004', policy: 'IP Whitelisting', description: 'Restrict by IP range', enforcement: 'optional', scope: 'Admin Users', lastUpdated: '2026-06-20', status: 'warning' },
  { id: 'SEC005', policy: 'Login Attempts', description: 'Lock after 5 failed attempts', enforcement: 'enforced', scope: 'All Users', lastUpdated: '2026-08-05', status: 'active' },
  { id: 'SEC006', policy: 'Password Expiry', description: '90-day rotation policy', enforcement: 'optional', scope: 'All Users', lastUpdated: '2026-07-01', status: 'warning' },
  { id: 'SEC007', policy: 'API Key Rotation', description: 'Monthly rotation required', enforcement: 'optional', scope: 'API Users', lastUpdated: '2026-08-15', status: 'active' },
  { id: 'SEC008', policy: 'Audit Logging', description: 'All admin actions logged', enforcement: 'enforced', scope: 'Admin Users', lastUpdated: '2026-08-20', status: 'active' },
]

export function SecuritySettings() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? SECURITY_SETTINGS : SECURITY_SETTINGS.filter((s) => s.enforcement === filter)),
    [filter]
  )

  const enforcedCount = SECURITY_SETTINGS.filter((s) => s.enforcement === 'enforced').length
  const optionalCount = SECURITY_SETTINGS.filter((s) => s.enforcement === 'optional').length
  const disabledCount = SECURITY_SETTINGS.filter((s) => s.enforcement === 'disabled').length

  const columns: Column<SecuritySetting>[] = [
    { header: 'Policy', cell: (s) => <span className="text-[13px] font-semibold text-heading">{t(s.policy)}</span> },
    { header: 'Description', cell: (s) => t(s.description) },
    { header: 'Enforcement', cell: (s) => <Tone value={s.enforcement === 'enforced' ? 'active' : s.enforcement === 'optional' ? 'pending' : 'disabled'} label={s.enforcement} /> },
    { header: 'Scope', cell: (s) => t(s.scope) },
    { header: 'Last Updated', cell: (s) => s.lastUpdated },
    { header: 'Status', cell: (s) => <Tone value={s.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ShieldCheck"
        title={t('Security Settings')}
        subtitle={t('Authentication policies and access controls')}
        actions={
          can('settings', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add Policy')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Active Policies', value: enforcedCount, caption: 'Enforced', highlight: true },
          { label: 'Optional', value: optionalCount, caption: 'Configurable', tone: 'info' },
          { label: 'Disabled', value: disabledCount, caption: 'Turned off', tone: 'warning' },
          { label: 'Last Audit', value: '3 days ago', caption: 'Security review' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'enforced', 'optional', 'disabled'] as const).map((option) => {
          const count = option === 'all' ? SECURITY_SETTINGS.length : SECURITY_SETTINGS.filter((s) => s.enforcement === option).length
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

      <DataTable
        columns={columns}
        rows={[...filtered]}
        rowKey={(s) => s.id}
        mobileCard={(s) => (
          <>
            <MobileCardHeader title={t(s.policy)} trailing={<Tone value={s.status} />} />
            <MobileCardRow label={t('Description')}>{t(s.description)}</MobileCardRow>
            <MobileCardRow label={t('Enforcement')}>
              <Tone value={s.enforcement === 'enforced' ? 'active' : s.enforcement === 'optional' ? 'pending' : 'disabled'} label={s.enforcement} />
            </MobileCardRow>
            <MobileCardRow label={t('Scope')}>{t(s.scope)}</MobileCardRow>
            <MobileCardRow label={t('Last Updated')}>{s.lastUpdated}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="ShieldCheck" title={t('No security policies found')} />}
      />
    </>
  )
}

// ── 4. Financial Settings ──────────────────────────────────────────────────

interface FinancialSetting {
  id: string
  name: string
  category: string
  value: string
  currency: string
  effectiveDate: string
  status: 'active' | 'pending' | 'inactive'
}

const FINANCIAL_SETTINGS: readonly FinancialSetting[] = [
  { id: 'FIN001', name: 'Base Currency', category: 'currency', value: 'SAR', currency: 'SAR', effectiveDate: '2026-01-01', status: 'active' },
  { id: 'FIN002', name: 'VAT Rate', category: 'taxation', value: '15%', currency: 'SAR', effectiveDate: '2026-01-01', status: 'active' },
  { id: 'FIN003', name: 'Fiscal Year Start', category: 'invoicing', value: 'January', currency: '—', effectiveDate: '2026-01-01', status: 'active' },
  { id: 'FIN004', name: 'Payment Terms', category: 'invoicing', value: 'Net 30', currency: '—', effectiveDate: '2026-03-01', status: 'active' },
  { id: 'FIN005', name: 'Invoice Prefix', category: 'invoicing', value: 'INV-2026-', currency: '—', effectiveDate: '2026-01-01', status: 'active' },
  { id: 'FIN006', name: 'Rounding Method', category: 'currency', value: 'Nearest Halala', currency: 'SAR', effectiveDate: '2026-01-01', status: 'active' },
  { id: 'FIN007', name: 'Bank Reconciliation', category: 'banking', value: 'Auto-match enabled', currency: '—', effectiveDate: '2026-06-15', status: 'pending' },
  { id: 'FIN008', name: 'Credit Limit Default', category: 'banking', value: 'SAR 50,000', currency: 'SAR', effectiveDate: '2026-04-01', status: 'active' },
]

export function FinancialSettings() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? FINANCIAL_SETTINGS : FINANCIAL_SETTINGS.filter((s) => s.category === filter)),
    [filter]
  )

  const activeCount = FINANCIAL_SETTINGS.filter((s) => s.status === 'active').length
  const pendingCount = FINANCIAL_SETTINGS.filter((s) => s.status === 'pending').length

  const columns: Column<FinancialSetting>[] = [
    { header: 'Setting', cell: (s) => <span className="text-[13px] font-semibold text-heading">{t(s.name)}</span> },
    { header: 'Category', cell: (s) => t(s.category[0].toUpperCase() + s.category.slice(1)) },
    { header: 'Value', cell: (s) => <span className="font-mono text-[13px]" dir="ltr">{s.value}</span> },
    { header: 'Currency', cell: (s) => <span dir="ltr">{s.currency}</span> },
    { header: 'Effective Date', cell: (s) => s.effectiveDate },
    { header: 'Status', cell: (s) => <Tone value={s.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Landmark"
        title={t('Financial Settings')}
        subtitle={t('Currency, tax rules and fiscal configuration')}
        actions={
          can('finance', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add Rule')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Active Rules', value: activeCount, caption: 'In effect', highlight: true },
          { label: 'Pending Changes', value: pendingCount, caption: 'Awaiting', tone: 'warning' },
          { label: 'Tax Rates', value: 3, caption: 'Configured' },
          { label: 'Payment Methods', value: 4, caption: 'Enabled', tone: 'info' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'currency', 'taxation', 'invoicing', 'banking'] as const).map((option) => {
          const count = option === 'all' ? FINANCIAL_SETTINGS.length : FINANCIAL_SETTINGS.filter((s) => s.category === option).length
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

      <DataTable
        columns={columns}
        rows={[...filtered]}
        rowKey={(s) => s.id}
        mobileCard={(s) => (
          <>
            <MobileCardHeader title={t(s.name)} trailing={<Tone value={s.status} />} />
            <MobileCardRow label={t('Category')}>{t(s.category[0].toUpperCase() + s.category.slice(1))}</MobileCardRow>
            <MobileCardRow label={t('Value')}>
              <span className="font-mono" dir="ltr">{s.value}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Currency')}>
              <span dir="ltr">{s.currency}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Effective Date')}>{s.effectiveDate}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Landmark" title={t('No financial settings found')} />}
      />
    </>
  )
}

// ── 5. ZATCA Settings ──────────────────────────────────────────────────────

interface ZATCASetting {
  id: string
  parameter: string
  value: string
  phase: string
  lastSync: string
  validationStatus: 'compliant' | 'pending' | 'error'
}

const ZATCA_SETTINGS: readonly ZATCASetting[] = [
  { id: 'ZAT001', parameter: 'Organization TIN', value: '300456789012345', phase: 'Phase 2', lastSync: '2026-08-29 08:00', validationStatus: 'compliant' },
  { id: 'ZAT002', parameter: 'CSID Certificate', value: 'Active', phase: 'Phase 2', lastSync: '2026-08-29 08:00', validationStatus: 'compliant' },
  { id: 'ZAT003', parameter: 'Invoice Type Mapping', value: 'Standard/Simplified', phase: 'Phase 2', lastSync: '2026-08-29 07:30', validationStatus: 'compliant' },
  { id: 'ZAT004', parameter: 'QR Code Generation', value: 'Enabled', phase: 'Phase 2', lastSync: '2026-08-29 08:00', validationStatus: 'compliant' },
  { id: 'ZAT005', parameter: 'XML Schema Version', value: 'UBL 2.1', phase: 'Phase 1', lastSync: '2026-08-28 22:00', validationStatus: 'compliant' },
  { id: 'ZAT006', parameter: 'Reporting Endpoint', value: 'Production', phase: 'Phase 2', lastSync: '2026-08-29 07:45', validationStatus: 'pending' },
  { id: 'ZAT007', parameter: 'Cryptographic Stamp', value: 'SHA-256', phase: 'Phase 2', lastSync: '2026-08-29 08:00', validationStatus: 'compliant' },
]

export function ZATCASettings() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? ZATCA_SETTINGS : ZATCA_SETTINGS.filter((s) => s.phase === filter)),
    [filter]
  )

  const compliantCount = ZATCA_SETTINGS.filter((s) => s.validationStatus === 'compliant').length
  const pendingCount = ZATCA_SETTINGS.filter((s) => s.validationStatus === 'pending').length

  const columns: Column<ZATCASetting>[] = [
    { header: 'Parameter', cell: (s) => <span className="text-[13px] font-semibold text-heading">{t(s.parameter)}</span> },
    { header: 'Value', cell: (s) => <span className="font-mono text-[13px]" dir="ltr">{s.value}</span> },
    { header: 'Phase', cell: (s) => t(s.phase) },
    { header: 'Last Sync', cell: (s) => s.lastSync },
    { header: 'Validation', cell: (s) => <Tone value={s.validationStatus} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="FileCheck"
        title={t('ZATCA Settings')}
        subtitle={t('ZATCA e-invoicing compliance and integration')}
        actions={
          can('finance', 'c') ? (
            <Button size="md">
              <Icon name="RefreshCw" size={16} />
              {t('Sync ZATCA')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Compliant Items', value: compliantCount, caption: 'Validated', highlight: true },
          { label: 'Pending Validation', value: pendingCount, caption: 'In review', tone: 'warning' },
          { label: 'Phase 2 Ready', value: 'Yes', caption: 'Integration', tone: 'info' },
          { label: 'Last Sync', value: '2h ago', caption: 'ZATCA portal' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'Phase 1', 'Phase 2'] as const).map((option) => {
          const count = option === 'all' ? ZATCA_SETTINGS.length : ZATCA_SETTINGS.filter((s) => s.phase === option).length
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

      <DataTable
        columns={columns}
        rows={[...filtered]}
        rowKey={(s) => s.id}
        mobileCard={(s) => (
          <>
            <MobileCardHeader title={t(s.parameter)} trailing={<Tone value={s.validationStatus} />} />
            <MobileCardRow label={t('Value')}>
              <span className="font-mono" dir="ltr">{s.value}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Phase')}>{t(s.phase)}</MobileCardRow>
            <MobileCardRow label={t('Last Sync')}>{s.lastSync}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="FileCheck" title={t('No ZATCA settings found')} />}
      />
    </>
  )
}

// ── 6. VAT Settings ────────────────────────────────────────────────────────

interface VATSetting {
  id: string
  category: string
  rate: string
  description: string
  effectiveDate: string
  status: 'active' | 'pending' | 'inactive'
}

const VAT_SETTINGS: readonly VATSetting[] = [
  { id: 'VAT001', category: 'Standard Rate', rate: '15%', description: 'Default VAT on goods and services', effectiveDate: '2026-01-01', status: 'active' },
  { id: 'VAT002', category: 'Zero-Rated', rate: '0%', description: 'Exports and international supplies', effectiveDate: '2026-01-01', status: 'active' },
  { id: 'VAT003', category: 'Exempt Supplies', rate: '0%', description: 'Financial and insurance services', effectiveDate: '2026-01-01', status: 'active' },
  { id: 'VAT004', category: 'Real Estate', rate: '15%', description: 'Commercial real estate transactions', effectiveDate: '2026-01-01', status: 'active' },
  { id: 'VAT005', category: 'Financial Services', rate: 'Exempt', description: 'Banking and financial products', effectiveDate: '2026-01-01', status: 'active' },
  { id: 'VAT006', category: 'International Transport', rate: '0%', description: 'Cross-border transport services', effectiveDate: '2026-01-01', status: 'active' },
  { id: 'VAT007', category: 'First Sale of Residential', rate: 'Exempt', description: 'VAT exempt after threshold', effectiveDate: '2026-07-01', status: 'pending' },
]

export function VATSettings() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? VAT_SETTINGS : VAT_SETTINGS.filter((s) => s.status === filter)),
    [filter]
  )

  const activeCount = VAT_SETTINGS.filter((s) => s.status === 'active').length
  const pendingCount = VAT_SETTINGS.filter((s) => s.status === 'pending').length

  const columns: Column<VATSetting>[] = [
    { header: 'Category', cell: (s) => <span className="text-[13px] font-semibold text-heading">{t(s.category)}</span> },
    { header: 'Rate', cell: (s) => <span className="font-mono text-[13px] text-salis-blue" dir="ltr">{s.rate}</span> },
    { header: 'Description', cell: (s) => t(s.description) },
    { header: 'Effective Date', cell: (s) => s.effectiveDate },
    { header: 'Status', cell: (s) => <Tone value={s.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Receipt"
        title={t('VAT Settings')}
        subtitle={t('Value Added Tax rates and category mappings')}
        actions={
          can('finance', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add Rate')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'VAT Rates', value: VAT_SETTINGS.length, caption: 'Configured', highlight: true },
          { label: 'Active', value: activeCount, caption: 'In effect', tone: 'info' },
          { label: 'Pending Updates', value: pendingCount, caption: 'Under review', tone: 'warning' },
          { label: 'Standard Rate', value: '15%', caption: 'Current' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'active', 'pending', 'inactive'] as const).map((option) => {
          const count = option === 'all' ? VAT_SETTINGS.length : VAT_SETTINGS.filter((s) => s.status === option).length
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

      <DataTable
        columns={columns}
        rows={[...filtered]}
        rowKey={(s) => s.id}
        mobileCard={(s) => (
          <>
            <MobileCardHeader title={t(s.category)} trailing={<Tone value={s.status} />} />
            <MobileCardRow label={t('Rate')}>
              <span className="font-mono text-salis-blue" dir="ltr">{s.rate}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Description')}>{t(s.description)}</MobileCardRow>
            <MobileCardRow label={t('Effective Date')}>{s.effectiveDate}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Receipt" title={t('No VAT rates found')} />}
      />
    </>
  )
}

// ── 7. Zakat Settings ──────────────────────────────────────────────────────

interface ZakatSetting {
  id: string
  parameter: string
  value: string
  basis: string
  lastCalculated: string
  status: 'configured' | 'pending' | 'default'
}

const ZAKAT_SETTINGS: readonly ZakatSetting[] = [
  { id: 'ZK001', parameter: 'Zakat Rate', value: '2.5%', basis: 'Net Assets', lastCalculated: '2026-08-01', status: 'configured' },
  { id: 'ZK002', parameter: 'Assessment Period', value: 'Hijri Year', basis: 'Calendar', lastCalculated: '2026-08-01', status: 'configured' },
  { id: 'ZK003', parameter: 'Calculation Basis', value: 'Net Assets', basis: 'Balance Sheet', lastCalculated: '2026-08-01', status: 'configured' },
  { id: 'ZK004', parameter: 'Minimum Threshold', value: '85g Gold equivalent', basis: 'Nisab', lastCalculated: '2026-08-15', status: 'configured' },
  { id: 'ZK005', parameter: 'Payment Schedule', value: 'Annual', basis: 'Fiscal Year', lastCalculated: '2026-07-01', status: 'pending' },
  { id: 'ZK006', parameter: 'Reporting Authority', value: 'GAZT', basis: 'Regulatory', lastCalculated: '2026-06-15', status: 'default' },
]

export function ZakatSettings() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? ZAKAT_SETTINGS : ZAKAT_SETTINGS.filter((s) => s.status === filter)),
    [filter]
  )

  const configuredCount = ZAKAT_SETTINGS.filter((s) => s.status === 'configured').length
  const pendingCount = ZAKAT_SETTINGS.filter((s) => s.status === 'pending').length

  const columns: Column<ZakatSetting>[] = [
    { header: 'Parameter', cell: (s) => <span className="text-[13px] font-semibold text-heading">{t(s.parameter)}</span> },
    { header: 'Value', cell: (s) => <span className="font-mono text-[13px]" dir="ltr">{s.value}</span> },
    { header: 'Basis', cell: (s) => t(s.basis) },
    { header: 'Last Calculated', cell: (s) => s.lastCalculated },
    { header: 'Status', cell: (s) => <Tone value={s.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Heart"
        title={t('Zakat Settings')}
        subtitle={t('Zakat calculation rules and reporting')}
        actions={
          can('finance', 'c') ? (
            <Button size="md">
              <Icon name="Calculator" size={16} />
              {t('Calculate Zakat')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Parameters', value: ZAKAT_SETTINGS.length, caption: 'Total', highlight: true },
          { label: 'Configured', value: configuredCount, caption: 'Ready', tone: 'info' },
          { label: 'Pending Review', value: pendingCount, caption: 'Needs attention', tone: 'warning' },
          { label: 'Current Rate', value: '2.5%', caption: 'Standard' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'configured', 'pending', 'default'] as const).map((option) => {
          const count = option === 'all' ? ZAKAT_SETTINGS.length : ZAKAT_SETTINGS.filter((s) => s.status === option).length
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

      <DataTable
        columns={columns}
        rows={[...filtered]}
        rowKey={(s) => s.id}
        mobileCard={(s) => (
          <>
            <MobileCardHeader title={t(s.parameter)} trailing={<Tone value={s.status} />} />
            <MobileCardRow label={t('Value')}>
              <span className="font-mono" dir="ltr">{s.value}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Basis')}>{t(s.basis)}</MobileCardRow>
            <MobileCardRow label={t('Last Calculated')}>{s.lastCalculated}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Heart" title={t('No zakat settings found')} />}
      />
    </>
  )
}
