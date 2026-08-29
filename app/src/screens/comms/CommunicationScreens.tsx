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

// ─── Chat ───────────────────────────────────────────────────────────────────────

interface Chat {
  with: string
  lastMessage: string
  updated: string
  status: 'active' | 'unread' | 'resolved'
}

const CHAT_TABS = [
  { id: 'all', label: 'All Chats', icon: 'MessageCircle' },
  { id: 'unread', label: 'Unread', icon: 'Mail' },
  { id: 'active', label: 'Active', icon: 'MessageSquare' },
  { id: 'resolved', label: 'Resolved', icon: 'CheckCircle' },
] as const

const DEMO_CHATS: readonly Chat[] = []

function ChatStatusBadge({ status }: { status: Chat['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'unread':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Unread')}
        </Badge>
      )
    case 'resolved':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Resolved')}
        </Badge>
      )
  }
}

export function Chat() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(CHAT_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly Chat[] = DEMO_CHATS
    if (tab !== 'all') {
      rows = rows.filter((c) => c.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((c) =>
        [c.with, c.lastMessage].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Open Chats', value: 0, caption: 'Active threads', highlight: true },
    { label: 'Unread', value: 0, caption: 'New messages', tone: 'warning' },
    { label: 'Resolved Today', value: 0, caption: 'Closed', tone: 'info' },
    { label: 'Avg Response', value: '0m', caption: 'First reply' },
  ]

  const columns: Column<Chat>[] = [
    { header: 'With', cell: (c) => <span className="font-medium text-heading">{c.with}</span> },
    { header: 'Last Message', cell: (c) => c.lastMessage },
    { header: 'Updated', cell: (c) => c.updated },
    { header: 'Status', cell: (c) => <ChatStatusBadge status={c.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="MessageCircle"
        title={t('Chat')}
        subtitle={t('Internal and customer messaging')}
      />

      <TabBar tabs={CHAT_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Conversations')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search conversations...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(c) => c.with}
          mobileCard={(c) => (
            <>
              <MobileCardHeader title={c.with} trailing={<ChatStatusBadge status={c.status} />} />
              <MobileCardRow label={t('Last Message')}>{c.lastMessage}</MobileCardRow>
              <MobileCardRow label={t('Updated')}>{c.updated}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="MessageCircle"
              title={t('No conversations yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Support Chat Dashboard ─────────────────────────────────────────────────────

interface SupportChat {
  customer: string
  topic: string
  waiting: string
  agent: string
  status: 'waiting' | 'active' | 'resolved'
}

const SUPPORT_TABS = [
  { id: 'all', label: 'All', icon: 'Headset' },
  { id: 'waiting', label: 'Waiting', icon: 'Clock' },
  { id: 'active', label: 'Active', icon: 'MessageSquare' },
  { id: 'resolved', label: 'Resolved', icon: 'CheckCircle' },
] as const

const DEMO_SUPPORT_CHATS: readonly SupportChat[] = []

function SupportStatusBadge({ status }: { status: SupportChat['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'waiting':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Waiting')}
        </Badge>
      )
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'resolved':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Resolved')}
        </Badge>
      )
  }
}

export function SupportChatDashboard() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(SUPPORT_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly SupportChat[] = DEMO_SUPPORT_CHATS
    if (tab !== 'all') {
      rows = rows.filter((s) => s.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((s) =>
        [s.customer, s.topic, s.agent].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Waiting', value: 0, caption: 'In queue', highlight: true, tone: 'warning' },
    { label: 'Active Chats', value: 0, caption: 'Being handled', tone: 'info' },
    { label: 'Agents Online', value: 0, caption: 'Available' },
    { label: 'Avg Wait', value: '0m', caption: 'To first reply' },
  ]

  const columns: Column<SupportChat>[] = [
    { header: 'Customer', cell: (s) => <span className="font-medium text-heading">{s.customer}</span> },
    { header: 'Topic', cell: (s) => s.topic },
    { header: 'Waiting', cell: (s) => s.waiting },
    { header: 'Agent', cell: (s) => s.agent || '—' },
    { header: 'Status', cell: (s) => <SupportStatusBadge status={s.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Headset"
        title={t('Support Chat Dashboard')}
        subtitle={t('Live support queue and agent activity')}
      />

      <TabBar tabs={SUPPORT_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Live Queue')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search queue...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(s) => s.customer}
          mobileCard={(s) => (
            <>
              <MobileCardHeader title={s.customer} trailing={<SupportStatusBadge status={s.status} />} />
              <MobileCardRow label={t('Topic')}>{s.topic}</MobileCardRow>
              <MobileCardRow label={t('Waiting')}>{s.waiting}</MobileCardRow>
              <MobileCardRow label={t('Agent')}>{s.agent || '—'}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Headset"
              title={t('The support queue is empty')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Notifications ──────────────────────────────────────────────────────────────

interface Notification {
  type: string
  message: string
  when: string
  status: 'unread' | 'read' | 'action-required' | 'archived'
}

const NOTIFICATION_TABS = [
  { id: 'all', label: 'All', icon: 'Bell' },
  { id: 'unread', label: 'Unread', icon: 'Mail' },
  { id: 'action-required', label: 'Action Required', icon: 'AlertCircle' },
  { id: 'archived', label: 'Archived', icon: 'Archive' },
] as const

const DEMO_NOTIFICATIONS: readonly Notification[] = []

function NotificationStatusBadge({ status }: { status: Notification['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'unread':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Unread')}
        </Badge>
      )
    case 'read':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Read')}
        </Badge>
      )
    case 'action-required':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Action Required')}
        </Badge>
      )
    case 'archived':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Archived')}
        </Badge>
      )
  }
}

export function Notifications() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(NOTIFICATION_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly Notification[] = DEMO_NOTIFICATIONS
    if (tab !== 'all') {
      rows = rows.filter((n) => n.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((n) =>
        [n.type, n.message].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Unread', value: 0, caption: 'New', highlight: true },
    { label: 'Today', value: 0, caption: 'Received', tone: 'info' },
    { label: 'Action Required', value: 0, caption: 'Need response', tone: 'warning' },
    { label: 'Archived', value: 0, caption: 'Cleared' },
  ]

  const columns: Column<Notification>[] = [
    { header: 'Type', cell: (n) => <span className="font-medium text-heading">{n.type}</span> },
    { header: 'Message', cell: (n) => n.message },
    { header: 'When', cell: (n) => n.when },
    { header: 'Status', cell: (n) => <NotificationStatusBadge status={n.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Bell"
        title={t('Notifications')}
        subtitle={t('System alerts and activity notifications')}
      />

      <TabBar tabs={NOTIFICATION_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Recent Notifications')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search notifications...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(n) => n.message}
          mobileCard={(n) => (
            <>
              <MobileCardHeader title={n.type} trailing={<NotificationStatusBadge status={n.status} />} />
              <MobileCardRow label={t('Message')}>{n.message}</MobileCardRow>
              <MobileCardRow label={t('When')}>{n.when}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Bell"
              title={t('You are all caught up')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── SMS Integration ────────────────────────────────────────────────────────────

interface SMSMessage {
  recipient: string
  message: string
  sent: string
  status: 'sent' | 'failed' | 'pending'
}

const SMS_TABS = [
  { id: 'all', label: 'All Messages', icon: 'MessageSquare' },
  { id: 'sent', label: 'Sent', icon: 'CheckCircle' },
  { id: 'failed', label: 'Failed', icon: 'XCircle' },
  { id: 'pending', label: 'Pending', icon: 'Clock' },
] as const

const DEMO_SMS_MESSAGES: readonly SMSMessage[] = []

function SMSStatusBadge({ status }: { status: SMSMessage['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'sent':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Sent')}
        </Badge>
      )
    case 'failed':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Failed')}
        </Badge>
      )
    case 'pending':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Pending')}
        </Badge>
      )
  }
}

export function SMSIntegration() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(SMS_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly SMSMessage[] = DEMO_SMS_MESSAGES
    if (tab !== 'all') {
      rows = rows.filter((m) => m.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((m) =>
        [m.recipient, m.message].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Gateway', value: 'Not Connected', caption: 'Provider', highlight: true },
    { label: 'Sent This Month', value: 0, caption: 'Messages', tone: 'info' },
    { label: 'Failed', value: 0, caption: 'Delivery errors', tone: 'warning' },
    { label: 'Credit Balance', value: 'SAR 0.00', caption: 'Remaining' },
  ]

  const columns: Column<SMSMessage>[] = [
    { header: 'Recipient', cell: (m) => <span className="font-medium text-heading">{m.recipient}</span> },
    { header: 'Message', cell: (m) => m.message },
    { header: 'Sent', cell: (m) => m.sent },
    { header: 'Status', cell: (m) => <SMSStatusBadge status={m.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="MessageSquare"
        title={t('SMS Integration')}
        subtitle={t('Connect an SMS gateway for customer messaging')}
      />

      <TabBar tabs={SMS_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Recent Messages')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search messages...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(m) => m.recipient}
          mobileCard={(m) => (
            <>
              <MobileCardHeader title={m.recipient} trailing={<SMSStatusBadge status={m.status} />} />
              <MobileCardRow label={t('Message')}>{m.message}</MobileCardRow>
              <MobileCardRow label={t('Sent')}>{m.sent}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="MessageSquare"
              title={t('No messages sent yet')}
            />
          }
        />
      </Section>
    </>
  )
}
