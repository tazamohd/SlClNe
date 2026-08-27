import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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

export function AIChatbot() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
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

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Bot" title={t('AI Chatbot')} subtitle={t('Configuration & Stats')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {filtered.map(c => {
          const [bg, fg] = STATUS_COLORS[c.status] ?? STATUS_COLORS.Beta
          return (
            <MobileCard key={c.id}>
              <MobileCardHeader title={t(c.name)} trailing={<Badge background={bg} color={fg}>{t(c.status)}</Badge>} />
              <MobileCardRow label={t('Channel')}>{c.channel}</MobileCardRow>
              <MobileCardRow label={t('Language')}>{c.language}</MobileCardRow>
              <MobileCardRow label={t('Conversations')}>{c.conversations.toLocaleString()}</MobileCardRow>
              <MobileCardRow label={t('Satisfaction')}>{c.satisfaction}%</MobileCardRow>
            </MobileCard>
          )
        })}
      </div>
    )
  }

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
          <h1 className="font-display text-[30px] font-black text-heading">{t('AI Chatbot')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Chatbot configuration and performance stats')}</p>
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
        <h3 className="mb-4 text-[15px] font-bold text-heading">{t('Conversation Stats')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Period')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Conversations')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Resolved')}</th>
                <th className="pb-3 text-end font-medium">{t('Escalated')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_STATS.map(s => (
                <tr key={s.period} className="border-b border-border/50">
                  <td className="py-3 pe-4 text-[13px] text-heading">{t(s.period)}</td>
                  <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{s.conversations.toLocaleString()}</td>
                  <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{s.resolved.toLocaleString()}</td>
                  <td className="py-3 text-end font-mono text-[13px] text-muted">{s.escalated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-heading">{t('Chatbot Configurations')}</h3>
          <Select value={filter} onChange={e => setFilter(e.target.value)} aria-label={t('Filter by status')}>
            <option value="All">{t('All')}</option>
            <option value="Active">{t('Active')}</option>
            <option value="Beta">{t('Beta')}</option>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('ID')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Name')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Channel')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Language')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Conversations')}</th>
                <th className="pb-3 text-end font-medium">{t('Satisfaction')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const [bg, fg] = STATUS_COLORS[c.status] ?? STATUS_COLORS.Beta
                return (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 font-mono text-[13px] text-heading" dir="ltr">{c.id}</td>
                    <td className="py-3 pe-4 text-[13px] text-heading">{t(c.name)}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{c.channel}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{c.language}</td>
                    <td className="py-3 pe-4"><Badge background={bg} color={fg}>{t(c.status)}</Badge></td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{c.conversations.toLocaleString()}</td>
                    <td className="py-3 text-end font-mono text-[13px] text-heading">{c.satisfaction}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
