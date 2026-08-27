import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const MOCK_CHATBOTS = [
  { id: 'CB-01', name: 'Service Booking Bot', channel: 'Website', language: 'AR/EN', status: 'Active', conversations: 3420, satisfaction: 92 },
  { id: 'CB-02', name: 'WhatsApp Assistant', channel: 'WhatsApp', language: 'AR/EN', status: 'Active', conversations: 5680, satisfaction: 89 },
  { id: 'CB-03', name: 'Parts Inquiry Bot', channel: 'Website', language: 'AR', status: 'Active', conversations: 1240, satisfaction: 86 },
  { id: 'CB-04', name: 'Internal Help Desk', channel: 'Slack', language: 'EN', status: 'Active', conversations: 890, satisfaction: 94 },
  { id: 'CB-05', name: 'Insurance Claims Bot', channel: 'Mobile App', language: 'AR/EN', status: 'Beta', conversations: 320, satisfaction: 78 },
] as const

const MOCK_STATS = [
  { period: 'Today', conversations: 142, resolved: 128, escalated: 14 },
  { period: 'This Week', conversations: 876, resolved: 798, escalated: 78 },
  { period: 'This Month', conversations: 3420, resolved: 3112, escalated: 308 },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Beta: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
}

type StatRow = (typeof MOCK_STATS)[number]
type ChatbotRow = (typeof MOCK_CHATBOTS)[number]

const statsColumns: Column<StatRow>[] = [
  { header: 'Period', cell: (row) => row.period },
  { header: 'Conversations', cell: (row) => row.conversations.toLocaleString() },
  { header: 'Resolved', cell: (row) => row.resolved.toLocaleString() },
  { header: 'Escalated', cell: (row) => String(row.escalated) },
]

export function AIChatbot() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? MOCK_CHATBOTS : MOCK_CHATBOTS.filter(c => c.status === filter)
  const totalConversations = MOCK_CHATBOTS.reduce((a, c) => a + c.conversations, 0)
  const avgSatisfaction = Math.round(MOCK_CHATBOTS.reduce((a, c) => a + c.satisfaction, 0) / MOCK_CHATBOTS.length)

  const kpis = [
    { label: t('Chatbots'), value: String(MOCK_CHATBOTS.length), icon: 'Bot', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Conversations'), value: totalConversations.toLocaleString(), icon: 'MessageSquare', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Satisfaction'), value: `${avgSatisfaction}%`, icon: 'ThumbsUp', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Resolution'), value: '91%', icon: 'CheckCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const chatbotColumns: Column<ChatbotRow>[] = [
    { header: 'ID', cell: (c) => c.id, code: true },
    { header: 'Name', cell: (c) => t(c.name) },
    { header: 'Channel', cell: (c) => c.channel },
    { header: 'Language', cell: (c) => c.language },
    { header: 'Status', cell: (c) => { const [bg, fg] = STATUS_COLORS[c.status] ?? STATUS_COLORS.Beta; return <Badge background={bg} color={fg}>{t(c.status)}</Badge> } },
    { header: 'Conversations', cell: (c) => c.conversations.toLocaleString() },
    { header: 'Satisfaction', cell: (c) => `${c.satisfaction}%` },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Bot" title={t('AI Chatbot')} subtitle={t('Chatbot configuration and performance stats')} />

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <h3 className="text-[15px] font-bold text-heading">{t('Conversation Stats')}</h3>
      <DataTable
        caption="Conversation statistics"
        columns={statsColumns}
        rows={[...MOCK_STATS]}
        rowKey={(row) => row.period}
        mobileCard={(row) => (
          <>
            <MobileCardHeader title={t(row.period)} />
            <MobileCardRow label={t('Conversations')}>{row.conversations.toLocaleString()}</MobileCardRow>
            <MobileCardRow label={t('Resolved')}>{row.resolved.toLocaleString()}</MobileCardRow>
            <MobileCardRow label={t('Escalated')}>{row.escalated}</MobileCardRow>
          </>
        )}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-heading">{t('Chatbot Configurations')}</h3>
        <Select value={filter} onChange={e => setFilter(e.target.value)} aria-label={t('Filter by status')}>
          <option value="All">{t('All')}</option>
          <option value="Active">{t('Active')}</option>
          <option value="Beta">{t('Beta')}</option>
        </Select>
      </div>
      <DataTable
        caption="Chatbot configurations"
        columns={chatbotColumns}
        rows={[...filtered]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_COLORS[row.status] ?? STATUS_COLORS.Beta
          return (
            <>
              <MobileCardHeader title={t(row.name)} trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow label={t('Channel')}>{row.channel}</MobileCardRow>
              <MobileCardRow label={t('Conversations')}>{row.conversations.toLocaleString()}</MobileCardRow>
              <MobileCardRow label={t('Satisfaction')}>{row.satisfaction}%</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
