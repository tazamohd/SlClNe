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

// ─── Marketing Hub ─────────────────────────────────────────────────────────────

interface MarketingHubRow {
  campaign: string
  channel: string
  reach: number
  conversions: number
  status: 'active' | 'draft' | 'completed'
}

const MARKETING_HUB_TABS = [
  { id: 'all', label: 'All', icon: 'Megaphone' },
  { id: 'active', label: 'Active', icon: 'Megaphone' },
  { id: 'draft', label: 'Draft', icon: 'FileEdit' },
  { id: 'completed', label: 'Completed', icon: 'CheckCircle' },
] as const

const DEMO_MARKETING_HUB: readonly MarketingHubRow[] = []

function MarketingHubStatusBadge({ status }: { status: MarketingHubRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'draft':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Draft')}
        </Badge>
      )
    case 'completed':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Completed')}
        </Badge>
      )
  }
}

export function MarketingHub() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(MARKETING_HUB_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly MarketingHubRow[] = DEMO_MARKETING_HUB
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.campaign, r.channel].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Active Campaigns', value: 0, caption: 'Running', highlight: true },
    { label: 'Reach', value: 0, caption: 'This month', tone: 'info' },
    { label: 'Conversions', value: 0, caption: 'This month' },
    { label: 'Needs Attention', value: 0, caption: 'Underperforming', tone: 'warning' },
  ]

  const columns: Column<MarketingHubRow>[] = [
    { header: 'Campaign', cell: (r) => <span className="font-medium text-heading">{r.campaign}</span> },
    { header: 'Channel', cell: (r) => r.channel },
    { header: 'Reach', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.reach}</span> },
    { header: 'Conversions', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.conversions}</span> },
    { header: 'Status', cell: (r) => <MarketingHubStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Megaphone"
        title={t('Marketing Hub')}
        subtitle={t('Campaigns, audiences and marketing performance')}
      />

      <TabBar tabs={MARKETING_HUB_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Campaigns')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search campaigns...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.campaign}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.campaign} trailing={<MarketingHubStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Channel')}>{r.channel}</MobileCardRow>
              <MobileCardRow label={t('Reach')}>
                <span className="font-mono" dir="ltr">{r.reach}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Conversions')}>
                <span className="font-mono" dir="ltr">{r.conversions}</span>
              </MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Megaphone"
              title={t('No campaigns yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Marketing Automation ──────────────────────────────────────────────────────

interface MarketingAutomationRow {
  workflow: string
  trigger: string
  enrolled: number
  sent: number
  status: 'active' | 'paused' | 'draft'
}

const AUTOMATION_TABS = [
  { id: 'all', label: 'All', icon: 'Workflow' },
  { id: 'active', label: 'Active', icon: 'Workflow' },
  { id: 'paused', label: 'Paused', icon: 'Pause' },
  { id: 'draft', label: 'Draft', icon: 'FileEdit' },
] as const

const DEMO_AUTOMATION: readonly MarketingAutomationRow[] = []

function AutomationStatusBadge({ status }: { status: MarketingAutomationRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'paused':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Paused')}
        </Badge>
      )
    case 'draft':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Draft')}
        </Badge>
      )
  }
}

export function MarketingAutomation() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(AUTOMATION_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly MarketingAutomationRow[] = DEMO_AUTOMATION
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.workflow, r.trigger].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Active Workflows', value: 0, caption: 'Enabled', highlight: true },
    { label: 'Contacts In Flow', value: 0, caption: 'Enrolled', tone: 'info' },
    { label: 'Messages Sent', value: 0, caption: 'This month' },
    { label: 'Failing Steps', value: 0, caption: 'Need attention', tone: 'warning' },
  ]

  const columns: Column<MarketingAutomationRow>[] = [
    { header: 'Workflow', cell: (r) => <span className="font-medium text-heading">{r.workflow}</span> },
    { header: 'Trigger', cell: (r) => r.trigger },
    { header: 'Enrolled', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.enrolled}</span> },
    { header: 'Sent', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.sent}</span> },
    { header: 'Status', cell: (r) => <AutomationStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Workflow"
        title={t('Marketing Automation')}
        subtitle={t('Automated journeys and triggered messaging')}
      />

      <TabBar tabs={AUTOMATION_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Workflows')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search workflows...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.workflow}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.workflow} trailing={<AutomationStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Trigger')}>{r.trigger}</MobileCardRow>
              <MobileCardRow label={t('Enrolled')}>
                <span className="font-mono" dir="ltr">{r.enrolled}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Sent')}>
                <span className="font-mono" dir="ltr">{r.sent}</span>
              </MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Workflow"
              title={t('No workflows configured')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Email Marketing ───────────────────────────────────────────────────────────

interface EmailMarketingRow {
  campaign: string
  sent: number
  opened: number
  clicked: number
  status: 'sent' | 'draft' | 'scheduled'
}

const EMAIL_TABS = [
  { id: 'all', label: 'All', icon: 'Mail' },
  { id: 'sent', label: 'Sent', icon: 'CheckCircle' },
  { id: 'draft', label: 'Draft', icon: 'FileEdit' },
  { id: 'scheduled', label: 'Scheduled', icon: 'Clock' },
] as const

const DEMO_EMAIL_CAMPAIGNS: readonly EmailMarketingRow[] = []

function EmailStatusBadge({ status }: { status: EmailMarketingRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'sent':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Sent')}
        </Badge>
      )
    case 'draft':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Draft')}
        </Badge>
      )
    case 'scheduled':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Scheduled')}
        </Badge>
      )
  }
}

export function EmailMarketing() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(EMAIL_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly EmailMarketingRow[] = DEMO_EMAIL_CAMPAIGNS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.campaign].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Campaigns Sent', value: 0, caption: 'This month', highlight: true },
    { label: 'Open Rate', value: '0%', caption: 'Average', tone: 'info' },
    { label: 'Click Rate', value: '0%', caption: 'Average' },
    { label: 'Unsubscribes', value: 0, caption: 'This month', tone: 'warning' },
  ]

  const columns: Column<EmailMarketingRow>[] = [
    { header: 'Campaign', cell: (r) => <span className="font-medium text-heading">{r.campaign}</span> },
    { header: 'Sent', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.sent}</span> },
    { header: 'Opened', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.opened}</span> },
    { header: 'Clicked', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.clicked}</span> },
    { header: 'Status', cell: (r) => <EmailStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Mail"
        title={t('Email Marketing')}
        subtitle={t('Design, send and measure email campaigns')}
      />

      <TabBar tabs={EMAIL_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Campaigns')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search campaigns...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.campaign}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.campaign} trailing={<EmailStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Sent')}>
                <span className="font-mono" dir="ltr">{r.sent}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Opened')}>
                <span className="font-mono" dir="ltr">{r.opened}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Clicked')}>
                <span className="font-mono" dir="ltr">{r.clicked}</span>
              </MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Mail"
              title={t('No email campaigns yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Social Media Integration ──────────────────────────────────────────────────

interface SocialMediaIntegrationRow {
  channel: string
  account: string
  followers: number
  status: 'connected' | 'disconnected' | 'pending'
}

const SOCIAL_INTEGRATION_TABS = [
  { id: 'all', label: 'All Channels', icon: 'Share2' },
  { id: 'connected', label: 'Connected', icon: 'CheckCircle' },
  { id: 'disconnected', label: 'Disconnected', icon: 'XCircle' },
  { id: 'pending', label: 'Pending', icon: 'Clock' },
] as const

const DEMO_SOCIAL_CHANNELS: readonly SocialMediaIntegrationRow[] = []

function SocialIntegrationStatusBadge({ status }: { status: SocialMediaIntegrationRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'connected':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Connected')}
        </Badge>
      )
    case 'disconnected':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Disconnected')}
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

export function SocialMediaIntegration() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(SOCIAL_INTEGRATION_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly SocialMediaIntegrationRow[] = DEMO_SOCIAL_CHANNELS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.channel, r.account].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Connected Channels', value: 0, caption: 'Linked', highlight: true },
    { label: 'Scheduled Posts', value: 0, caption: 'Queued', tone: 'info' },
    { label: 'Published This Week', value: 0, caption: 'Live' },
    { label: 'Failed', value: 0, caption: 'Not published', tone: 'warning' },
  ]

  const columns: Column<SocialMediaIntegrationRow>[] = [
    { header: 'Channel', cell: (r) => <span className="font-medium text-heading">{r.channel}</span> },
    { header: 'Account', cell: (r) => r.account },
    { header: 'Followers', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.followers}</span> },
    { header: 'Status', cell: (r) => <SocialIntegrationStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Share2"
        title={t('Social Media Integration')}
        subtitle={t('Connect and publish to social channels')}
      />

      <TabBar tabs={SOCIAL_INTEGRATION_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Channels')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search channels...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.channel}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.channel} trailing={<SocialIntegrationStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Account')}>{r.account}</MobileCardRow>
              <MobileCardRow label={t('Followers')}>
                <span className="font-mono" dir="ltr">{r.followers}</span>
              </MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Share2"
              title={t('No social channels connected')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Social Media Monitoring ───────────────────────────────────────────────────

interface SocialMediaMonitoringRow {
  channel: string
  author: string
  mention: string
  sentiment: 'positive' | 'negative' | 'neutral'
  when: string
}

const MONITORING_TABS = [
  { id: 'all', label: 'All', icon: 'Eye' },
  { id: 'positive', label: 'Positive', icon: 'ThumbsUp' },
  { id: 'negative', label: 'Negative', icon: 'ThumbsDown' },
  { id: 'needs_response', label: 'Needs Response', icon: 'AlertCircle' },
] as const

const DEMO_MENTIONS: readonly SocialMediaMonitoringRow[] = []

function SentimentBadge({ sentiment }: { sentiment: SocialMediaMonitoringRow['sentiment'] }) {
  const { t } = usePreferences()
  switch (sentiment) {
    case 'positive':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Positive')}
        </Badge>
      )
    case 'negative':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Negative')}
        </Badge>
      )
    case 'neutral':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Neutral')}
        </Badge>
      )
  }
}

export function SocialMediaMonitoring() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(MONITORING_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly SocialMediaMonitoringRow[] = DEMO_MENTIONS
    if (tab === 'positive') {
      rows = rows.filter((r) => r.sentiment === 'positive')
    } else if (tab === 'negative') {
      rows = rows.filter((r) => r.sentiment === 'negative')
    } else if (tab === 'needs_response') {
      rows = rows.filter((r) => r.sentiment === 'negative' || r.sentiment === 'neutral')
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.channel, r.author, r.mention].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Mentions', value: 0, caption: 'This week', highlight: true },
    { label: 'Positive', value: 0, caption: 'Sentiment', tone: 'info' },
    { label: 'Needs Response', value: 0, caption: 'Unanswered', tone: 'warning' },
    { label: 'Engagement', value: '0%', caption: 'Rate' },
  ]

  const columns: Column<SocialMediaMonitoringRow>[] = [
    { header: 'Channel', cell: (r) => <span className="font-medium text-heading">{r.channel}</span> },
    { header: 'Author', cell: (r) => r.author },
    { header: 'Mention', cell: (r) => r.mention },
    { header: 'Sentiment', cell: (r) => <SentimentBadge sentiment={r.sentiment} /> },
    { header: 'When', cell: (r) => r.when },
  ]

  return (
    <>
      <FeatureHeader
        icon="Eye"
        title={t('Social Media Monitoring')}
        subtitle={t('Track mentions, sentiment and engagement')}
      />

      <TabBar tabs={MONITORING_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Mentions')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search mentions...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.mention}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.author} trailing={<SentimentBadge sentiment={r.sentiment} />} />
              <MobileCardRow label={t('Channel')}>{r.channel}</MobileCardRow>
              <MobileCardRow label={t('Mention')}>{r.mention}</MobileCardRow>
              <MobileCardRow label={t('When')}>{r.when}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Eye"
              title={t('No mentions tracked yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Google Business Profile ───────────────────────────────────────────────────

interface GoogleBusinessProfileRow {
  reviewer: string
  rating: number
  comment: string
  replied: string
  when: string
}

const GOOGLE_BUSINESS_TABS = [
  { id: 'all', label: 'All Reviews', icon: 'Store' },
  { id: 'unanswered', label: 'Unanswered', icon: 'AlertCircle' },
  { id: 'positive', label: 'Positive', icon: 'ThumbsUp' },
  { id: 'critical', label: 'Critical', icon: 'AlertTriangle' },
] as const

const DEMO_REVIEWS: readonly GoogleBusinessProfileRow[] = []

export function GoogleBusinessProfile() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(GOOGLE_BUSINESS_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly GoogleBusinessProfileRow[] = DEMO_REVIEWS
    if (tab === 'unanswered') {
      rows = rows.filter((r) => !r.replied)
    } else if (tab === 'positive') {
      rows = rows.filter((r) => r.rating >= 4)
    } else if (tab === 'critical') {
      rows = rows.filter((r) => r.rating <= 2)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.reviewer, r.comment].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Profile Views', value: 0, caption: 'This month', highlight: true },
    { label: 'Average Rating', value: '0.0', caption: 'Out of 5', tone: 'info' },
    { label: 'Unanswered Reviews', value: 0, caption: 'Need reply', tone: 'warning' },
    { label: 'Direction Requests', value: 0, caption: 'This month' },
  ]

  const columns: Column<GoogleBusinessProfileRow>[] = [
    { header: 'Reviewer', cell: (r) => <span className="font-medium text-heading">{r.reviewer}</span> },
    { header: 'Rating', cell: (r) => <span className="font-mono text-[13px]" dir="ltr">{r.rating}</span> },
    { header: 'Comment', cell: (r) => r.comment },
    { header: 'Replied', cell: (r) => r.replied || '—' },
    { header: 'When', cell: (r) => r.when },
  ]

  return (
    <>
      <FeatureHeader
        icon="Store"
        title={t('Google Business Profile')}
        subtitle={t('Manage your listing, reviews and posts')}
      />

      <TabBar tabs={GOOGLE_BUSINESS_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Recent Reviews')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search reviews...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.reviewer}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.reviewer} trailing={<span className="font-mono text-[13px]" dir="ltr">{r.rating}</span>} />
              <MobileCardRow label={t('Comment')}>{r.comment}</MobileCardRow>
              <MobileCardRow label={t('Replied')}>{r.replied || '—'}</MobileCardRow>
              <MobileCardRow label={t('When')}>{r.when}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Store"
              title={t('No reviews to show yet')}
            />
          }
        />
      </Section>
    </>
  )
}
