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
  connected: ['rgba(10,94,215,.1)', '#0A5ED7'],
  enabled: ['rgba(10,94,215,.1)', '#0A5ED7'],
  online: ['rgba(10,94,215,.1)', '#0A5ED7'],
  completed: ['rgba(10,94,215,.1)', '#0A5ED7'],
  sent: ['rgba(10,94,215,.1)', '#0A5ED7'],
  processed: ['rgba(10,94,215,.1)', '#0A5ED7'],
  enrolled: ['rgba(10,94,215,.1)', '#0A5ED7'],
  verified: ['rgba(10,94,215,.1)', '#0A5ED7'],
  synced: ['rgba(10,94,215,.1)', '#0A5ED7'],
  pending: ['rgba(249,115,22,.1)', '#F97316'],
  warning: ['rgba(249,115,22,.1)', '#F97316'],
  queued: ['rgba(249,115,22,.1)', '#F97316'],
  in_progress: ['rgba(11,179,255,.1)', '#0BB3FF'],
  processing: ['rgba(11,179,255,.1)', '#0BB3FF'],
  recording: ['rgba(11,179,255,.1)', '#0BB3FF'],
  running: ['rgba(11,179,255,.1)', '#0BB3FF'],
  scheduled: ['rgba(11,179,255,.1)', '#0BB3FF'],
  failed: ['rgba(11,31,59,.1)', '#0B1F3B'],
  error: ['rgba(11,31,59,.1)', '#0B1F3B'],
  offline: ['rgba(100,116,139,.1)', '#64748B'],
  disabled: ['rgba(100,116,139,.1)', '#64748B'],
  inactive: ['rgba(100,116,139,.1)', '#64748B'],
  read: ['rgba(100,116,139,.1)', '#64748B'],
  draft: ['rgba(100,116,139,.1)', '#64748B'],
  archived: ['rgba(100,116,139,.1)', '#64748B'],
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

const PRIORITY_TONE: Record<string, readonly [string, string]> = {
  high: ['rgba(11,31,59,.1)', '#0B1F3B'],
  medium: ['rgba(249,115,22,.1)', '#F97316'],
  low: ['rgba(100,116,139,.1)', '#64748B'],
}

// ── 1. Notifications Screen ───────────────────────────────────────────────

interface Notification {
  id: string
  title: string
  message: string
  channel: string
  time: string
  priority: 'high' | 'medium' | 'low'
  status: 'unread' | 'read' | 'archived'
}

const NOTIFICATIONS: readonly Notification[] = [
  { id: 'NTF001', title: 'Work Order #WO-1247 Completed', message: 'Work order has been completed and is ready for review', channel: 'Workshop', time: '10 min ago', priority: 'medium', status: 'unread' },
  { id: 'NTF002', title: 'Low Stock Alert – Brake Pads', message: 'Brake pad inventory has fallen below minimum threshold', channel: 'Inventory', time: '25 min ago', priority: 'high', status: 'unread' },
  { id: 'NTF003', title: 'Invoice INV-2026-0892 Paid', message: 'Payment received and recorded successfully', channel: 'Finance', time: '1h ago', priority: 'medium', status: 'read' },
  { id: 'NTF004', title: 'New Customer Registration', message: 'A new customer account has been created', channel: 'CRM', time: '2h ago', priority: 'low', status: 'read' },
  { id: 'NTF005', title: 'Scheduled Maintenance Due – Bay 2', message: 'Equipment maintenance is overdue for Workshop Bay 2', channel: 'Workshop', time: '3h ago', priority: 'high', status: 'unread' },
  { id: 'NTF006', title: 'Employee Leave Approved – Faisal', message: 'Leave request has been approved by manager', channel: 'HR', time: '4h ago', priority: 'low', status: 'read' },
  { id: 'NTF007', title: 'Backup Completed Successfully', message: 'Daily system backup completed without errors', channel: 'System', time: '5h ago', priority: 'low', status: 'archived' },
  { id: 'NTF008', title: 'ZATCA Sync Warning', message: 'ZATCA synchronization encountered a warning', channel: 'Finance', time: '6h ago', priority: 'high', status: 'read' },
]

export function NotificationsScreen() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? NOTIFICATIONS : NOTIFICATIONS.filter((n) => n.status === filter)),
    [filter]
  )

  const unreadCount = NOTIFICATIONS.filter((n) => n.status === 'unread').length
  const highCount = NOTIFICATIONS.filter((n) => n.priority === 'high').length

  const columns: Column<Notification>[] = [
    { header: 'Title', cell: (n) => <span className="text-[13px] font-semibold text-heading">{t(n.title)}</span> },
    { header: 'Channel', cell: (n) => t(n.channel) },
    { header: 'Time', cell: (n) => n.time },
    {
      header: 'Priority',
      cell: (n) => {
        const [bg, fg] = PRIORITY_TONE[n.priority] ?? ['rgba(100,116,139,.1)', '#64748B']
        return (
          <Badge background={bg} color={fg}>
            {t(n.priority[0].toUpperCase() + n.priority.slice(1))}
          </Badge>
        )
      },
    },
    { header: 'Status', cell: (n) => <Tone value={n.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Bell"
        title={t('Notifications')}
        subtitle={t('Alerts, messages and notification preferences')}
      />
      <StatRow
        stats={[
          { label: 'Unread', value: unreadCount, caption: 'Notifications', highlight: true, tone: 'warning' },
          { label: 'Today', value: 8, caption: 'Total', tone: 'info' },
          { label: 'High Priority', value: highCount, caption: 'Alerts' },
          { label: 'Channels', value: 4, caption: 'Sources' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'unread', 'read', 'archived'] as const).map((option) => {
          const count = option === 'all' ? NOTIFICATIONS.length : NOTIFICATIONS.filter((n) => n.status === option).length
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
        rowKey={(n) => n.id}
        mobileCard={(n) => (
          <>
            <MobileCardHeader title={t(n.title)} trailing={<Tone value={n.status} />} />
            <MobileCardRow label={t('Channel')}>{t(n.channel)}</MobileCardRow>
            <MobileCardRow label={t('Time')}>{n.time}</MobileCardRow>
            <MobileCardRow label={t('Priority')}>
              {t(n.priority[0].toUpperCase() + n.priority.slice(1))}
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Bell" title={t('No notifications found')} />}
      />
    </>
  )
}

// ── 2. Accounting Integration ─────────────────────────────────────────────

interface AccountingIntegrationRow {
  id: string
  system: string
  provider: string
  syncFrequency: string
  lastSync: string
  records: number
  status: 'connected' | 'pending' | 'error' | 'disabled'
}

const ACCOUNTING_INTEGRATIONS: readonly AccountingIntegrationRow[] = [
  { id: 'AI001', system: 'General Ledger', provider: 'SAP', syncFrequency: 'Hourly', lastSync: '10 min ago', records: 12450, status: 'connected' },
  { id: 'AI002', system: 'Accounts Payable', provider: 'Xero', syncFrequency: 'Real-time', lastSync: '1 min ago', records: 3280, status: 'connected' },
  { id: 'AI003', system: 'Accounts Receivable', provider: 'Internal', syncFrequency: 'Daily', lastSync: '6h ago', records: 5670, status: 'connected' },
  { id: 'AI004', system: 'Bank Reconciliation', provider: 'Al Rajhi API', syncFrequency: 'Hourly', lastSync: '30 min ago', records: 8920, status: 'connected' },
  { id: 'AI005', system: 'Tax Reporting', provider: 'ZATCA Portal', syncFrequency: 'Daily', lastSync: 'Yesterday', records: 1240, status: 'pending' },
  { id: 'AI006', system: 'Payroll Export', provider: 'HR Module', syncFrequency: 'Weekly', lastSync: '3 days ago', records: 456, status: 'connected' },
  { id: 'AI007', system: 'Asset Management', provider: 'Internal', syncFrequency: 'Monthly', lastSync: '2 weeks ago', records: 890, status: 'disabled' },
]

export function AccountingIntegration() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? ACCOUNTING_INTEGRATIONS : ACCOUNTING_INTEGRATIONS.filter((r) => r.status === filter)),
    [filter]
  )

  const connectedCount = ACCOUNTING_INTEGRATIONS.filter((r) => r.status === 'connected').length
  const pendingCount = ACCOUNTING_INTEGRATIONS.filter((r) => r.status === 'pending').length
  const totalRecords = ACCOUNTING_INTEGRATIONS.reduce((sum, r) => sum + r.records, 0)

  const columns: Column<AccountingIntegrationRow>[] = [
    { header: 'System', cell: (r) => <span className="text-[13px] font-semibold text-heading">{t(r.system)}</span> },
    { header: 'Provider', cell: (r) => t(r.provider) },
    { header: 'Sync Frequency', cell: (r) => t(r.syncFrequency) },
    { header: 'Last Sync', cell: (r) => r.lastSync },
    { header: 'Records', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.records.toLocaleString()}</span> },
    { header: 'Status', cell: (r) => <Tone value={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Link"
        title={t('Accounting Integration')}
        subtitle={t('Accounting system connections and sync status')}
        actions={
          can('finance', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add Integration')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Connected', value: connectedCount, caption: 'Systems', highlight: true },
          { label: 'Synced Today', value: 5, caption: 'Operations', tone: 'info' },
          { label: 'Pending', value: pendingCount, caption: 'Awaiting', tone: 'warning' },
          { label: 'Total Records', value: totalRecords.toLocaleString(), caption: 'Synced' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'connected', 'pending', 'error', 'disabled'] as const).map((option) => {
          const count = option === 'all' ? ACCOUNTING_INTEGRATIONS.length : ACCOUNTING_INTEGRATIONS.filter((r) => r.status === option).length
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
        rowKey={(r) => r.id}
        mobileCard={(r) => (
          <>
            <MobileCardHeader title={t(r.system)} trailing={<Tone value={r.status} />} />
            <MobileCardRow label={t('Provider')}>{t(r.provider)}</MobileCardRow>
            <MobileCardRow label={t('Sync Frequency')}>{t(r.syncFrequency)}</MobileCardRow>
            <MobileCardRow label={t('Last Sync')}>{r.lastSync}</MobileCardRow>
            <MobileCardRow label={t('Records')}>
              <span className="font-mono" dir="ltr">{r.records.toLocaleString()}</span>
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Link" title={t('No integrations found')} />}
      />
    </>
  )
}

// ── 3. SMS Integration ────────────────────────────────────────────────────

interface SMSMessage {
  id: string
  recipient: string
  template: string
  sentAt: string
  provider: string
  cost: string
  status: 'sent' | 'queued' | 'failed' | 'pending'
}

const SMS_MESSAGES: readonly SMSMessage[] = [
  { id: 'SMS001', recipient: '+966 55 440 1122', template: 'Appointment Reminder', sentAt: '10 min ago', provider: 'Unifonic', cost: 'SAR 0.12', status: 'sent' },
  { id: 'SMS002', recipient: '+966 50 331 2244', template: 'Service Ready', sentAt: '30 min ago', provider: 'Unifonic', cost: 'SAR 0.12', status: 'sent' },
  { id: 'SMS003', recipient: '+966 54 220 5533', template: 'Invoice Due', sentAt: '1h ago', provider: 'Unifonic', cost: 'SAR 0.12', status: 'sent' },
  { id: 'SMS004', recipient: '+966 56 110 7788', template: 'Work Order Update', sentAt: '2h ago', provider: 'Unifonic', cost: 'SAR 0.12', status: 'queued' },
  { id: 'SMS005', recipient: '+966 55 123 4567', template: 'Welcome Message', sentAt: '3h ago', provider: 'Unifonic', cost: 'SAR 0.12', status: 'sent' },
  { id: 'SMS006', recipient: '+966 50 998 3344', template: 'Leave Approved', sentAt: '4h ago', provider: 'Unifonic', cost: 'SAR 0.12', status: 'failed' },
  { id: 'SMS007', recipient: '+966 55 776 8899', template: 'Payment Confirmation', sentAt: '5h ago', provider: 'Unifonic', cost: 'SAR 0.12', status: 'sent' },
  { id: 'SMS008', recipient: '+966 50 445 6677', template: 'Shift Reminder', sentAt: '6h ago', provider: 'Unifonic', cost: 'SAR 0.12', status: 'sent' },
]

export function SMSIntegration() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? SMS_MESSAGES : SMS_MESSAGES.filter((m) => m.status === filter)),
    [filter]
  )

  const sentCount = SMS_MESSAGES.filter((m) => m.status === 'sent').length
  const queuedCount = SMS_MESSAGES.filter((m) => m.status === 'queued').length
  const failedCount = SMS_MESSAGES.filter((m) => m.status === 'failed').length

  const columns: Column<SMSMessage>[] = [
    { header: 'Recipient', cell: (m) => <span className="font-mono text-[13px]" dir="ltr">{m.recipient}</span> },
    { header: 'Template', cell: (m) => t(m.template) },
    { header: 'Sent At', cell: (m) => m.sentAt },
    { header: 'Provider', cell: (m) => m.provider },
    { header: 'Cost', cell: (m) => <span className="font-mono text-[13px]" dir="ltr">{m.cost}</span> },
    { header: 'Status', cell: (m) => <Tone value={m.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="MessageSquare"
        title={t('SMS Integration')}
        subtitle={t('SMS gateway configuration and message logs')}
        actions={
          can('settings', 'c') ? (
            <Button size="md">
              <Icon name="Send" size={16} />
              {t('Send Test SMS')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Sent Today', value: sentCount, caption: 'Messages', highlight: true },
          { label: 'Queued', value: queuedCount, caption: 'Pending', tone: 'info' },
          { label: 'Failed', value: failedCount, caption: 'Errors', tone: 'warning' },
          { label: 'Cost Today', value: 'SAR 0.84', caption: 'Total' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'sent', 'queued', 'failed'] as const).map((option) => {
          const count = option === 'all' ? SMS_MESSAGES.length : SMS_MESSAGES.filter((m) => m.status === option).length
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
        rowKey={(m) => m.id}
        mobileCard={(m) => (
          <>
            <MobileCardHeader title={t(m.template)} trailing={<Tone value={m.status} />} />
            <MobileCardRow label={t('Recipient')}>
              <span className="font-mono" dir="ltr">{m.recipient}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Sent At')}>{m.sentAt}</MobileCardRow>
            <MobileCardRow label={t('Provider')}>{m.provider}</MobileCardRow>
            <MobileCardRow label={t('Cost')}>
              <span className="font-mono" dir="ltr">{m.cost}</span>
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="MessageSquare" title={t('No messages found')} />}
      />
    </>
  )
}

// ── 4. Security Cameras ──────────────────────────────────────────────────

interface Camera {
  id: string
  name: string
  location: string
  resolution: string
  storage: string
  lastMotion: string
  status: 'online' | 'offline' | 'recording'
}

const CAMERAS: readonly Camera[] = [
  { id: 'CAM001', name: 'CAM-01 Main Entrance', location: 'Reception', resolution: '1080p', storage: '14 days', lastMotion: '2 min ago', status: 'recording' },
  { id: 'CAM002', name: 'CAM-02 Workshop Bay 1', location: 'Workshop', resolution: '1080p', storage: '14 days', lastMotion: '1 min ago', status: 'recording' },
  { id: 'CAM003', name: 'CAM-03 Workshop Bay 2', location: 'Workshop', resolution: '720p', storage: '7 days', lastMotion: '5 min ago', status: 'recording' },
  { id: 'CAM004', name: 'CAM-04 Parts Storage', location: 'Warehouse', resolution: '1080p', storage: '14 days', lastMotion: '15 min ago', status: 'online' },
  { id: 'CAM005', name: 'CAM-05 Parking Lot', location: 'Exterior', resolution: '4K', storage: '30 days', lastMotion: '3 min ago', status: 'recording' },
  { id: 'CAM006', name: 'CAM-06 Back Office', location: 'Admin', resolution: '720p', storage: '7 days', lastMotion: '1h ago', status: 'online' },
  { id: 'CAM007', name: 'CAM-07 Server Room', location: 'IT', resolution: '1080p', storage: '30 days', lastMotion: 'N/A', status: 'offline' },
]

export function SecurityCameras() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? CAMERAS : CAMERAS.filter((c) => c.status === filter)),
    [filter]
  )

  const onlineCount = CAMERAS.filter((c) => c.status === 'online' || c.status === 'recording').length
  const recordingCount = CAMERAS.filter((c) => c.status === 'recording').length
  const offlineCount = CAMERAS.filter((c) => c.status === 'offline').length

  const columns: Column<Camera>[] = [
    { header: 'Camera', cell: (c) => <span className="text-[13px] font-semibold text-heading">{t(c.name)}</span> },
    { header: 'Location', cell: (c) => t(c.location) },
    { header: 'Resolution', cell: (c) => <span className="font-mono text-[13px]" dir="ltr">{c.resolution}</span> },
    { header: 'Storage', cell: (c) => t(c.storage) },
    { header: 'Last Motion', cell: (c) => c.lastMotion },
    { header: 'Status', cell: (c) => <Tone value={c.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Camera"
        title={t('Security Cameras')}
        subtitle={t('CCTV monitoring and camera management')}
        actions={
          can('security', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add Camera')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Total Cameras', value: CAMERAS.length, caption: 'Installed', highlight: true },
          { label: 'Online', value: onlineCount, caption: 'Available', tone: 'info' },
          { label: 'Recording', value: recordingCount, caption: 'Active' },
          { label: 'Offline', value: offlineCount, caption: 'Unavailable', tone: 'warning' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'online', 'recording', 'offline'] as const).map((option) => {
          const count = option === 'all' ? CAMERAS.length : CAMERAS.filter((c) => c.status === option).length
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
        rowKey={(c) => c.id}
        mobileCard={(c) => (
          <>
            <MobileCardHeader title={t(c.name)} trailing={<Tone value={c.status} />} />
            <MobileCardRow label={t('Location')}>{t(c.location)}</MobileCardRow>
            <MobileCardRow label={t('Resolution')}>
              <span className="font-mono" dir="ltr">{c.resolution}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Storage')}>{t(c.storage)}</MobileCardRow>
            <MobileCardRow label={t('Last Motion')}>{c.lastMotion}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Camera" title={t('No cameras found')} />}
      />
    </>
  )
}

// ── 5. Mobile Device Management ──────────────────────────────────────────

interface MobileDevice {
  id: string
  device: string
  assignedTo: string
  os: string
  lastSeen: string
  compliance: string
  status: 'enrolled' | 'pending' | 'inactive'
}

const MOBILE_DEVICES: readonly MobileDevice[] = [
  { id: 'MDM001', device: 'iPhone 15 Pro', assignedTo: 'Khalid Al-Amri', os: 'iOS 17.5', lastSeen: '5 min ago', compliance: 'Compliant', status: 'enrolled' },
  { id: 'MDM002', device: 'Samsung S24', assignedTo: 'Yousef Al-Otaibi', os: 'Android 14', lastSeen: '10 min ago', compliance: 'Compliant', status: 'enrolled' },
  { id: 'MDM003', device: 'iPad Pro 12.9', assignedTo: 'Reception', os: 'iPadOS 17.5', lastSeen: '1h ago', compliance: 'Compliant', status: 'enrolled' },
  { id: 'MDM004', device: 'Samsung Tab S9', assignedTo: 'Workshop', os: 'Android 14', lastSeen: '2h ago', compliance: 'Update Required', status: 'pending' },
  { id: 'MDM005', device: 'iPhone 14', assignedTo: 'Omar Al-Rashid', os: 'iOS 17.4', lastSeen: '30 min ago', compliance: 'Compliant', status: 'enrolled' },
  { id: 'MDM006', device: 'Zebra TC52', assignedTo: 'Warehouse Scanner', os: 'Android 11', lastSeen: '3h ago', compliance: 'Compliant', status: 'enrolled' },
  { id: 'MDM007', device: 'iPad Mini', assignedTo: 'Spare', os: 'iPadOS 17.5', lastSeen: '7 days ago', compliance: 'N/A', status: 'inactive' },
]

export function MobileDeviceManagement() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? MOBILE_DEVICES : MOBILE_DEVICES.filter((d) => d.status === filter)),
    [filter]
  )

  const enrolledCount = MOBILE_DEVICES.filter((d) => d.status === 'enrolled').length
  const compliantCount = MOBILE_DEVICES.filter((d) => d.compliance === 'Compliant').length
  const pendingCount = MOBILE_DEVICES.filter((d) => d.status === 'pending').length
  const inactiveCount = MOBILE_DEVICES.filter((d) => d.status === 'inactive').length

  const columns: Column<MobileDevice>[] = [
    { header: 'Device', cell: (d) => <span className="text-[13px] font-semibold text-heading">{t(d.device)}</span> },
    { header: 'Assigned To', cell: (d) => d.assignedTo },
    { header: 'OS', cell: (d) => <span className="font-mono text-[13px]" dir="ltr">{d.os}</span> },
    { header: 'Last Seen', cell: (d) => d.lastSeen },
    { header: 'Compliance', cell: (d) => t(d.compliance) },
    { header: 'Status', cell: (d) => <Tone value={d.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Smartphone"
        title={t('Mobile Device Management')}
        subtitle={t('Company device enrollment and policy management')}
        actions={
          can('settings', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Enroll Device')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Enrolled', value: enrolledCount, caption: 'Devices', highlight: true },
          { label: 'Compliant', value: compliantCount, caption: 'Passing', tone: 'info' },
          { label: 'Pending Update', value: pendingCount, caption: 'Needs action', tone: 'warning' },
          { label: 'Inactive', value: inactiveCount, caption: 'Offline' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'enrolled', 'pending', 'inactive'] as const).map((option) => {
          const count = option === 'all' ? MOBILE_DEVICES.length : MOBILE_DEVICES.filter((d) => d.status === option).length
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
        rowKey={(d) => d.id}
        mobileCard={(d) => (
          <>
            <MobileCardHeader title={t(d.device)} trailing={<Tone value={d.status} />} />
            <MobileCardRow label={t('Assigned To')}>{d.assignedTo}</MobileCardRow>
            <MobileCardRow label={t('OS')}>
              <span className="font-mono" dir="ltr">{d.os}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Last Seen')}>{d.lastSeen}</MobileCardRow>
            <MobileCardRow label={t('Compliance')}>{t(d.compliance)}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Smartphone" title={t('No devices found')} />}
      />
    </>
  )
}

// ── 6. Document Management ───────────────────────────────────────────────

interface Document {
  id: string
  name: string
  category: string
  size: string
  uploadedBy: string
  uploadDate: string
  version: string
  status: 'active' | 'draft' | 'archived'
}

const DOCUMENTS: readonly Document[] = [
  { id: 'DOC001', name: 'Employee Handbook v3.2', category: 'HR', size: '2.4 MB', uploadedBy: 'Sara Al-Mutairi', uploadDate: '2026-08-15', version: 'v3.2', status: 'active' },
  { id: 'DOC002', name: 'Workshop Safety Manual', category: 'Safety', size: '5.1 MB', uploadedBy: 'Khalid Al-Amri', uploadDate: '2026-07-01', version: 'v2.0', status: 'active' },
  { id: 'DOC003', name: 'Service Price List 2026', category: 'Sales', size: '890 KB', uploadedBy: 'Omar Al-Rashid', uploadDate: '2026-01-05', version: 'v1.3', status: 'active' },
  { id: 'DOC004', name: 'Insurance Policy Bundle', category: 'Legal', size: '12.3 MB', uploadedBy: 'Layla Al-Sulaiman', uploadDate: '2026-06-15', version: 'v1.0', status: 'active' },
  { id: 'DOC005', name: 'ZATCA Compliance Guide', category: 'Finance', size: '1.8 MB', uploadedBy: 'Layla Al-Sulaiman', uploadDate: '2026-08-20', version: 'v2.1', status: 'active' },
  { id: 'DOC006', name: 'Vehicle Inspection Checklist', category: 'Workshop', size: '340 KB', uploadedBy: 'Yousef Al-Otaibi', uploadDate: '2026-08-10', version: 'v4.0', status: 'active' },
  { id: 'DOC007', name: 'Brand Guidelines', category: 'Marketing', size: '8.7 MB', uploadedBy: 'Khalid Al-Amri', uploadDate: '2025-11-01', version: 'v1.0', status: 'archived' },
  { id: 'DOC008', name: 'IT Security Policy Draft', category: 'IT', size: '1.2 MB', uploadedBy: 'Khalid Al-Amri', uploadDate: '2026-08-25', version: 'v0.9', status: 'draft' },
]

export function DocumentManagement() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? DOCUMENTS : DOCUMENTS.filter((d) => d.status === filter)),
    [filter]
  )

  const activeCount = DOCUMENTS.filter((d) => d.status === 'active').length

  const columns: Column<Document>[] = [
    { header: 'Document', cell: (d) => <span className="text-[13px] font-semibold text-heading">{t(d.name)}</span> },
    { header: 'Category', cell: (d) => t(d.category) },
    { header: 'Size', cell: (d) => <span className="font-mono text-[13px]" dir="ltr">{d.size}</span> },
    { header: 'Uploaded By', cell: (d) => d.uploadedBy },
    { header: 'Date', cell: (d) => d.uploadDate },
    { header: 'Version', cell: (d) => <span className="font-mono text-[13px] text-muted" dir="ltr">{d.version}</span> },
    { header: 'Status', cell: (d) => <Tone value={d.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="FolderOpen"
        title={t('Document Management')}
        subtitle={t('Document storage, versioning and access control')}
        actions={
          can('documents', 'c') ? (
            <Button size="md">
              <Icon name="Upload" size={16} />
              {t('Upload Document')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Documents', value: DOCUMENTS.length, caption: 'Total', highlight: true },
          { label: 'Active', value: activeCount, caption: 'Published', tone: 'info' },
          { label: 'Storage Used', value: '32.8 MB', caption: 'All files' },
          { label: 'Categories', value: 6, caption: 'Organized' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'active', 'draft', 'archived'] as const).map((option) => {
          const count = option === 'all' ? DOCUMENTS.length : DOCUMENTS.filter((d) => d.status === option).length
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
        rowKey={(d) => d.id}
        mobileCard={(d) => (
          <>
            <MobileCardHeader title={t(d.name)} trailing={<Tone value={d.status} />} />
            <MobileCardRow label={t('Category')}>{t(d.category)}</MobileCardRow>
            <MobileCardRow label={t('Size')}>
              <span className="font-mono" dir="ltr">{d.size}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Uploaded By')}>{d.uploadedBy}</MobileCardRow>
            <MobileCardRow label={t('Version')}>
              <span className="font-mono text-muted" dir="ltr">{d.version}</span>
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="FolderOpen" title={t('No documents found')} />}
      />
    </>
  )
}

// ── 7. Document OCR ──────────────────────────────────────────────────────

interface OCRDocument {
  id: string
  document: string
  type: string
  pages: number
  accuracy: string
  processedAt: string
  extractedFields: number
  status: 'completed' | 'processing' | 'failed' | 'queued'
}

const OCR_DOCUMENTS: readonly OCRDocument[] = [
  { id: 'OCR001', document: 'Invoice #INV-8834', type: 'Invoice', pages: 2, accuracy: '98.5%', processedAt: '5 min ago', extractedFields: 12, status: 'completed' },
  { id: 'OCR002', document: 'Vehicle Registration – ABC 1234', type: 'Registration', pages: 1, accuracy: '99.1%', processedAt: '15 min ago', extractedFields: 8, status: 'completed' },
  { id: 'OCR003', document: 'Insurance Certificate', type: 'Insurance', pages: 3, accuracy: '97.2%', processedAt: '1h ago', extractedFields: 15, status: 'completed' },
  { id: 'OCR004', document: 'Supplier Contract #SC-445', type: 'Contract', pages: 8, accuracy: '96.8%', processedAt: '2h ago', extractedFields: 22, status: 'completed' },
  { id: 'OCR005', document: 'Customer ID – Scan', type: 'ID Document', pages: 1, accuracy: '—', processedAt: '—', extractedFields: 0, status: 'processing' },
  { id: 'OCR006', document: 'Warranty Card Batch', type: 'Warranty', pages: 5, accuracy: '—', processedAt: '—', extractedFields: 0, status: 'queued' },
  { id: 'OCR007', document: 'Damaged Receipt #R-9912', type: 'Receipt', pages: 1, accuracy: '72.3%', processedAt: '3h ago', extractedFields: 4, status: 'failed' },
]

export function DocumentOCR() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? OCR_DOCUMENTS : OCR_DOCUMENTS.filter((d) => d.status === filter)),
    [filter]
  )

  const completedCount = OCR_DOCUMENTS.filter((d) => d.status === 'completed').length
  const queuedCount = OCR_DOCUMENTS.filter((d) => d.status === 'queued').length
  const failedCount = OCR_DOCUMENTS.filter((d) => d.status === 'failed').length

  const columns: Column<OCRDocument>[] = [
    { header: 'Document', cell: (d) => <span className="text-[13px] font-semibold text-heading">{t(d.document)}</span> },
    { header: 'Type', cell: (d) => t(d.type) },
    { header: 'Pages', cell: (d) => <span className="font-mono text-[13px]" dir="ltr">{d.pages}</span> },
    { header: 'Accuracy', cell: (d) => <span className="font-mono text-[13px] text-salis-blue" dir="ltr">{d.accuracy}</span> },
    { header: 'Processed At', cell: (d) => d.processedAt },
    { header: 'Fields', cell: (d) => <span className="font-mono text-[13px]" dir="ltr">{d.extractedFields}</span> },
    { header: 'Status', cell: (d) => <Tone value={d.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ScanLine"
        title={t('Document OCR')}
        subtitle={t('Optical character recognition and document digitization')}
        actions={
          can('documents', 'c') ? (
            <Button size="md">
              <Icon name="ScanLine" size={16} />
              {t('Scan Document')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Processed Today', value: completedCount, caption: 'Documents', highlight: true },
          { label: 'In Queue', value: queuedCount, caption: 'Waiting', tone: 'warning' },
          { label: 'Avg Accuracy', value: '97.2%', caption: 'Recognition', tone: 'info' },
          { label: 'Failed', value: failedCount, caption: 'Errors' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'completed', 'processing', 'queued', 'failed'] as const).map((option) => {
          const count = option === 'all' ? OCR_DOCUMENTS.length : OCR_DOCUMENTS.filter((d) => d.status === option).length
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
        rowKey={(d) => d.id}
        mobileCard={(d) => (
          <>
            <MobileCardHeader title={t(d.document)} trailing={<Tone value={d.status} />} />
            <MobileCardRow label={t('Type')}>{t(d.type)}</MobileCardRow>
            <MobileCardRow label={t('Pages')}>
              <span className="font-mono" dir="ltr">{d.pages}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Accuracy')}>
              <span className="font-mono text-salis-blue" dir="ltr">{d.accuracy}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Fields')}>
              <span className="font-mono" dir="ltr">{d.extractedFields}</span>
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="ScanLine" title={t('No OCR documents found')} />}
      />
    </>
  )
}

// ── 8. Data Import/Export ────────────────────────────────────────────────

interface DataOperation {
  id: string
  operation: string
  type: 'import' | 'export'
  format: string
  records: number
  startedAt: string
  duration: string
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled'
}

const TYPE_TONE: Record<string, readonly [string, string]> = {
  import: ['rgba(10,94,215,.1)', '#0A5ED7'],
  export: ['rgba(11,179,255,.1)', '#0BB3FF'],
}

const DATA_OPERATIONS: readonly DataOperation[] = [
  { id: 'DIO001', operation: 'Customer Database', type: 'export', format: 'CSV', records: 1247, startedAt: '10 min ago', duration: '45s', status: 'completed' },
  { id: 'DIO002', operation: 'Parts Catalog Update', type: 'import', format: 'XLSX', records: 3892, startedAt: '1h ago', duration: '2m 15s', status: 'completed' },
  { id: 'DIO003', operation: 'Invoice Archive Q2', type: 'export', format: 'PDF', records: 456, startedAt: '2h ago', duration: '1m 30s', status: 'completed' },
  { id: 'DIO004', operation: 'Supplier Price List', type: 'import', format: 'CSV', records: 892, startedAt: 'In progress', duration: '—', status: 'in_progress' },
  { id: 'DIO005', operation: 'Vehicle History Import', type: 'import', format: 'JSON', records: 2100, startedAt: 'Scheduled for 10 PM', duration: '—', status: 'scheduled' },
  { id: 'DIO006', operation: 'Employee Records Backup', type: 'export', format: 'XLSX', records: 45, startedAt: 'Yesterday', duration: '12s', status: 'completed' },
  { id: 'DIO007', operation: 'Work Order Migration', type: 'import', format: 'CSV', records: 0, startedAt: 'Yesterday', duration: '—', status: 'failed' },
  { id: 'DIO008', operation: 'Inventory Snapshot', type: 'export', format: 'CSV', records: 5430, startedAt: '3h ago', duration: '3m 45s', status: 'completed' },
]

export function DataImportExport() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? DATA_OPERATIONS : DATA_OPERATIONS.filter((r) => r.type === filter)),
    [filter]
  )

  const completedCount = DATA_OPERATIONS.filter((r) => r.status === 'completed').length
  const inProgressCount = DATA_OPERATIONS.filter((r) => r.status === 'in_progress').length
  const failedCount = DATA_OPERATIONS.filter((r) => r.status === 'failed').length

  const columns: Column<DataOperation>[] = [
    { header: 'Operation', cell: (r) => <span className="text-[13px] font-semibold text-heading">{t(r.operation)}</span> },
    {
      header: 'Type',
      cell: (r) => {
        const [bg, fg] = TYPE_TONE[r.type] ?? ['rgba(100,116,139,.1)', '#64748B']
        return (
          <Badge background={bg} color={fg}>
            {t(r.type[0].toUpperCase() + r.type.slice(1))}
          </Badge>
        )
      },
    },
    { header: 'Format', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.format}</span> },
    { header: 'Records', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.records.toLocaleString()}</span> },
    { header: 'Started', cell: (r) => r.startedAt },
    { header: 'Duration', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.duration}</span> },
    { header: 'Status', cell: (r) => <Tone value={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ArrowLeftRight"
        title={t('Data Import/Export')}
        subtitle={t('Bulk data import and export operations')}
        actions={
          can('settings', 'c') ? (
            <Button size="md">
              <Icon name="Upload" size={16} />
              {t('New Import')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: "Today's Operations", value: 5, caption: 'Total', highlight: true },
          { label: 'Completed', value: completedCount, caption: 'Finished', tone: 'info' },
          { label: 'In Progress', value: inProgressCount, caption: 'Running' },
          { label: 'Failed', value: failedCount, caption: 'Errors', tone: 'warning' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'import', 'export'] as const).map((option) => {
          const count = option === 'all' ? DATA_OPERATIONS.length : DATA_OPERATIONS.filter((r) => r.type === option).length
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
        rowKey={(r) => r.id}
        mobileCard={(r) => (
          <>
            <MobileCardHeader title={t(r.operation)} trailing={<Tone value={r.status} />} />
            <MobileCardRow label={t('Type')}>
              {t(r.type[0].toUpperCase() + r.type.slice(1))}
            </MobileCardRow>
            <MobileCardRow label={t('Format')}>
              <span className="font-mono" dir="ltr">{r.format}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Records')}>
              <span className="font-mono" dir="ltr">{r.records.toLocaleString()}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Duration')}>
              <span className="font-mono" dir="ltr">{r.duration}</span>
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="ArrowLeftRight" title={t('No operations found')} />}
      />
    </>
  )
}

// ── 9. Data Backup ──────────────────────────────────────────────────────

interface BackupEntry {
  id: string
  name: string
  type: 'full' | 'incremental' | 'differential'
  size: string
  createdAt: string
  retention: string
  location: string
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled'
}

const BACKUPS: readonly BackupEntry[] = [
  { id: 'BK001', name: 'Daily Full Backup', type: 'full', size: '12.4 GB', createdAt: 'Today 02:00', retention: '30 days', location: 'Cloud – AWS S3', status: 'completed' },
  { id: 'BK002', name: 'Hourly Incremental', type: 'incremental', size: '245 MB', createdAt: 'Today 14:00', retention: '7 days', location: 'Cloud – AWS S3', status: 'completed' },
  { id: 'BK003', name: 'Weekly Differential', type: 'differential', size: '3.8 GB', createdAt: 'Aug 25 02:00', retention: '90 days', location: 'Cloud + Local', status: 'completed' },
  { id: 'BK004', name: 'Database Snapshot', type: 'full', size: '8.2 GB', createdAt: 'Today 06:00', retention: '14 days', location: 'Local NAS', status: 'completed' },
  { id: 'BK005', name: 'File Server Backup', type: 'incremental', size: '1.1 GB', createdAt: 'In progress', retention: '7 days', location: 'Cloud', status: 'in_progress' },
  { id: 'BK006', name: 'Monthly Archive', type: 'full', size: '45.6 GB', createdAt: 'Aug 01', retention: '365 days', location: 'Cold Storage', status: 'completed' },
  { id: 'BK007', name: 'Config Backup', type: 'incremental', size: '12 MB', createdAt: 'Scheduled', retention: '30 days', location: 'Cloud', status: 'scheduled' },
]

export function DataBackup() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? BACKUPS : BACKUPS.filter((b) => b.type === filter)),
    [filter]
  )

  const failedCount = BACKUPS.filter((b) => b.status === 'failed').length

  const columns: Column<BackupEntry>[] = [
    { header: 'Backup', cell: (b) => <span className="text-[13px] font-semibold text-heading">{t(b.name)}</span> },
    { header: 'Type', cell: (b) => <Tone value={b.type} /> },
    { header: 'Size', cell: (b) => <span className="font-mono text-[13px]" dir="ltr">{b.size}</span> },
    { header: 'Created', cell: (b) => b.createdAt },
    { header: 'Retention', cell: (b) => t(b.retention) },
    { header: 'Location', cell: (b) => t(b.location) },
    { header: 'Status', cell: (b) => <Tone value={b.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="HardDrive"
        title={t('Data Backup')}
        subtitle={t('System backup schedules and recovery points')}
        actions={
          can('settings', 'c') ? (
            <Button size="md">
              <Icon name="Play" size={16} />
              {t('Run Backup')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Total Backups', value: BACKUPS.length, caption: 'Recovery points', highlight: true },
          { label: 'Storage Used', value: '71.4 GB', caption: 'All locations' },
          { label: 'Last Backup', value: '2h ago', caption: 'Completed', tone: 'info' },
          { label: 'Failed', value: failedCount, caption: 'Errors' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'full', 'incremental', 'differential'] as const).map((option) => {
          const count = option === 'all' ? BACKUPS.length : BACKUPS.filter((b) => b.type === option).length
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
        rowKey={(b) => b.id}
        mobileCard={(b) => (
          <>
            <MobileCardHeader title={t(b.name)} trailing={<Tone value={b.status} />} />
            <MobileCardRow label={t('Type')}>
              <Tone value={b.type} />
            </MobileCardRow>
            <MobileCardRow label={t('Size')}>
              <span className="font-mono" dir="ltr">{b.size}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Retention')}>{t(b.retention)}</MobileCardRow>
            <MobileCardRow label={t('Location')}>{t(b.location)}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="HardDrive" title={t('No backups found')} />}
      />
    </>
  )
}

// ── 10. Digital Signage ─────────────────────────────────────────────────

interface Display {
  id: string
  display: string
  location: string
  content: string
  resolution: string
  schedule: string
  lastUpdate: string
  status: 'active' | 'scheduled' | 'offline' | 'inactive'
}

const DISPLAYS: readonly Display[] = [
  { id: 'DS001', display: 'Lobby Welcome Screen', location: 'Reception', content: 'Service Menu & Prices', resolution: '1920x1080', schedule: '24/7', lastUpdate: '1h ago', status: 'active' },
  { id: 'DS002', display: 'Workshop Status Board', location: 'Workshop', content: 'Live Work Orders', resolution: '3840x2160', schedule: '6AM–10PM', lastUpdate: '5 min ago', status: 'active' },
  { id: 'DS003', display: 'Waiting Area TV 1', location: 'Customer Lounge', content: 'Promo Videos', resolution: '1920x1080', schedule: '8AM–8PM', lastUpdate: '2h ago', status: 'active' },
  { id: 'DS004', display: 'Waiting Area TV 2', location: 'Customer Lounge', content: 'Queue Display', resolution: '1920x1080', schedule: '8AM–8PM', lastUpdate: 'Scheduled', status: 'scheduled' },
  { id: 'DS005', display: 'Parts Counter Display', location: 'Parts Dept', content: 'Specials & Offers', resolution: '1280x720', schedule: '8AM–6PM', lastUpdate: 'Yesterday', status: 'offline' },
  { id: 'DS006', display: 'Exterior LED Sign', location: 'Building Front', content: 'Operating Hours', resolution: '2560x960', schedule: 'Sunset–Sunrise', lastUpdate: '3h ago', status: 'active' },
]

export function DigitalSignage() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? DISPLAYS : DISPLAYS.filter((d) => d.status === filter)),
    [filter]
  )

  const activeCount = DISPLAYS.filter((d) => d.status === 'active').length
  const scheduledCount = DISPLAYS.filter((d) => d.status === 'scheduled').length
  const offlineCount = DISPLAYS.filter((d) => d.status === 'offline').length

  const columns: Column<Display>[] = [
    { header: 'Display', cell: (d) => <span className="text-[13px] font-semibold text-heading">{t(d.display)}</span> },
    { header: 'Location', cell: (d) => t(d.location) },
    { header: 'Content', cell: (d) => t(d.content) },
    { header: 'Resolution', cell: (d) => <span className="font-mono text-[13px]" dir="ltr">{d.resolution}</span> },
    { header: 'Schedule', cell: (d) => t(d.schedule) },
    { header: 'Last Update', cell: (d) => d.lastUpdate },
    { header: 'Status', cell: (d) => <Tone value={d.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Monitor"
        title={t('Digital Signage')}
        subtitle={t('Digital display content and scheduling')}
        actions={
          can('settings', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add Display')}
            </Button>
          ) : null
        }
      />
      <StatRow
        stats={[
          { label: 'Active Displays', value: activeCount, caption: 'Running', highlight: true },
          { label: 'Scheduled', value: scheduledCount, caption: 'Pending', tone: 'info' },
          { label: 'Offline', value: offlineCount, caption: 'Unavailable', tone: 'warning' },
          { label: 'Content Items', value: 6, caption: 'Loaded' },
        ]}
      />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'active', 'scheduled', 'offline', 'inactive'] as const).map((option) => {
          const count = option === 'all' ? DISPLAYS.length : DISPLAYS.filter((d) => d.status === option).length
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
        rowKey={(d) => d.id}
        mobileCard={(d) => (
          <>
            <MobileCardHeader title={t(d.display)} trailing={<Tone value={d.status} />} />
            <MobileCardRow label={t('Location')}>{t(d.location)}</MobileCardRow>
            <MobileCardRow label={t('Content')}>{t(d.content)}</MobileCardRow>
            <MobileCardRow label={t('Resolution')}>
              <span className="font-mono" dir="ltr">{d.resolution}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Schedule')}>{t(d.schedule)}</MobileCardRow>
            <MobileCardRow label={t('Last Update')}>{d.lastUpdate}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Monitor" title={t('No displays found')} />}
      />
    </>
  )
}
