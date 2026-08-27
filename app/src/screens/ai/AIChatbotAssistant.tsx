import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'

const MOCK_CONVERSATIONS = [
  { id: 'CONV-001', customer: 'Ahmed Al-Rashid', topic: 'Brake noise complaint', status: 'Active', duration: '4 min', sentiment: 'Neutral', agent: 'AI' },
  { id: 'CONV-002', customer: 'Fatima Hassan', topic: 'Service appointment booking', status: 'Resolved', duration: '2 min', sentiment: 'Positive', agent: 'AI' },
  { id: 'CONV-003', customer: 'Omar Khalid', topic: 'Invoice dispute', status: 'Escalated', duration: '8 min', sentiment: 'Negative', agent: 'Human' },
  { id: 'CONV-004', customer: 'Layla Mohammed', topic: 'Parts availability check', status: 'Active', duration: '1 min', sentiment: 'Neutral', agent: 'AI' },
  { id: 'CONV-005', customer: 'Saeed Bin Nasser', topic: 'Warranty claim status', status: 'Resolved', duration: '3 min', sentiment: 'Positive', agent: 'AI' },
  { id: 'CONV-006', customer: 'Huda Al-Qahtani', topic: 'Vehicle recall info', status: 'Resolved', duration: '5 min', sentiment: 'Neutral', agent: 'AI' },
] as const

const MOCK_SUGGESTIONS = [
  { id: 1, query: 'Engine overheating', suggestion: 'Check coolant level, thermostat, and radiator fan', confidence: 94 },
  { id: 2, query: 'AC not cooling', suggestion: 'Inspect refrigerant level and compressor clutch', confidence: 91 },
  { id: 3, query: 'Battery drain', suggestion: 'Test alternator output and parasitic draw', confidence: 88 },
  { id: 4, query: 'Transmission slip', suggestion: 'Check fluid level and condition, scan for codes', confidence: 85 },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Resolved: ['rgba(10,94,215,.15)', 'var(--salis-blue)'],
  Escalated: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
}

type ConversationRow = (typeof MOCK_CONVERSATIONS)[number]

export function AIChatbotAssistant() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? MOCK_CONVERSATIONS : MOCK_CONVERSATIONS.filter(c => c.status === filter)

  const kpis = [
    { label: t('Active Chats'), value: String(MOCK_CONVERSATIONS.filter(c => c.status === 'Active').length), icon: 'MessageSquare', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Resolved Today'), value: String(MOCK_CONVERSATIONS.filter(c => c.status === 'Resolved').length), icon: 'CheckCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Avg Response'), value: '1.2s', icon: 'Zap', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('AI Handled'), value: '83%', icon: 'Bot', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<ConversationRow>[] = [
    { header: 'Customer', cell: (c) => c.customer },
    { header: 'Topic', cell: (c) => t(c.topic) },
    { header: 'Status', cell: (c) => { const [bg, fg] = STATUS_COLORS[c.status] ?? STATUS_COLORS.Escalated; return <Badge background={bg} color={fg}>{t(c.status)}</Badge> } },
    { header: 'Duration', cell: (c) => c.duration },
    { header: 'Sentiment', cell: (c) => t(c.sentiment) },
    { header: 'Agent', cell: (c) => c.agent },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="Bot" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('AI Chatbot Assistant')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('AI-powered assistant interface and conversations')}</p>
        </div>
      </div>

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

      <Card className="rounded-2xl p-6 shadow-sm">
        <h3 className="mb-4 text-[15px] font-bold text-heading">{t('AI Suggestions')}</h3>
        <div className="grid grid-cols-2 gap-4">
          {MOCK_SUGGESTIONS.map(s => (
            <div key={s.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-heading">{t(s.query)}</span>
                <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{s.confidence}%</Badge>
              </div>
              <p className="mt-2 text-[13px] text-muted">{t(s.suggestion)}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-heading">{t('Recent Conversations')}</h3>
        <Select value={filter} onChange={e => setFilter(e.target.value)} aria-label={t('Filter by status')}>
          <option value="All">{t('All')}</option>
          <option value="Active">{t('Active')}</option>
          <option value="Resolved">{t('Resolved')}</option>
          <option value="Escalated">{t('Escalated')}</option>
        </Select>
      </div>
      <DataTable
        caption="Recent conversations"
        columns={columns}
        rows={[...filtered]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_COLORS[row.status] ?? STATUS_COLORS.Escalated
          return (
            <>
              <MobileCardHeader title={row.customer} trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow label={t('Topic')}>{t(row.topic)}</MobileCardRow>
              <MobileCardRow label={t('Duration')}>{row.duration}</MobileCardRow>
              <MobileCardRow label={t('Sentiment')}>{t(row.sentiment)}</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
