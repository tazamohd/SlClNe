import { useState } from 'react'
import { FeatureHeader, Section, StatRow, TabBar, SearchField } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

interface TrainingTopic {
  id: string
  topic: string
  category: string
  samples: number
  accuracy: number
  status: 'trained' | 'pending' | 'needs-review'
  lastUpdated: string
}

const TRAINING_DATA: TrainingTopic[] = [
  { id: 'tt-1', topic: 'Service Scheduling', category: 'Appointments', samples: 245, accuracy: 94, status: 'trained', lastUpdated: '2 days ago' },
  { id: 'tt-2', topic: 'Vehicle Status Queries', category: 'Workshop', samples: 189, accuracy: 91, status: 'trained', lastUpdated: '1 day ago' },
  { id: 'tt-3', topic: 'Invoice & Payment Help', category: 'Finance', samples: 156, accuracy: 88, status: 'trained', lastUpdated: '3 days ago' },
  { id: 'tt-4', topic: 'Parts Availability', category: 'Inventory', samples: 92, accuracy: 72, status: 'needs-review', lastUpdated: '5 days ago' },
  { id: 'tt-5', topic: 'Warranty Claims', category: 'Claims', samples: 45, accuracy: 0, status: 'pending', lastUpdated: '1 week ago' },
  { id: 'tt-6', topic: 'Insurance Queries', category: 'Insurance', samples: 38, accuracy: 0, status: 'pending', lastUpdated: '1 week ago' },
]

interface ConversationLog {
  id: string
  customer: string
  topic: string
  messages: number
  resolved: boolean
  satisfaction: number | null
  date: string
}

const RECENT_CONVERSATIONS: ConversationLog[] = [
  { id: 'cv-1', customer: 'Ahmed K.', topic: 'Service booking inquiry', messages: 8, resolved: true, satisfaction: 5, date: 'Today, 10:30 AM' },
  { id: 'cv-2', customer: 'Sara M.', topic: 'Vehicle status check', messages: 4, resolved: true, satisfaction: 4, date: 'Today, 9:15 AM' },
  { id: 'cv-3', customer: 'Omar H.', topic: 'Invoice question', messages: 12, resolved: false, satisfaction: null, date: 'Yesterday, 4:45 PM' },
  { id: 'cv-4', customer: 'Fatima R.', topic: 'Parts availability', messages: 6, resolved: true, satisfaction: 3, date: 'Yesterday, 2:20 PM' },
]

const TABS = [
  { id: 'training', label: 'Training', icon: 'BookOpen' },
  { id: 'conversations', label: 'Conversations', icon: 'MessageSquare' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
] as const

const STATUS_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  trained: { bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7', label: 'Trained' },
  pending: { bg: 'rgba(100,116,139,.1)', fg: '#64748B', label: 'Pending' },
  'needs-review': { bg: 'rgba(249,115,22,.1)', fg: '#F97316', label: 'Needs Review' },
}

const TOPIC_BREAKDOWN = [
  { label: 'Service Scheduling', pct: 100, color: '#0A5ED7' },
  { label: 'Vehicle Status', pct: 78, color: '#0BB3FF' },
  { label: 'Invoice & Payments', pct: 62, color: '#F97316' },
  { label: 'Parts Queries', pct: 41, color: '#0B1F3B' },
  { label: 'General Info', pct: 28, color: '#64748B' },
] as const

export function AIChatbotAssistant() {
  const { t } = usePreferences()
  const [tab, setTab] = useState('training')
  const [query, setQuery] = useState('')

  return (
    <>
      <FeatureHeader
        icon="BookOpen"
        title={t('Chatbot Assistant')}
        subtitle={t('Training & analytics admin')}
        actions={
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('Add Training Data')}
          </Button>
        }
      />

      <StatRow
        stats={[
          { label: 'Total Conversations', value: '1,847', highlight: true, icon: 'MessageSquare' },
          { label: 'Resolution Rate', value: '78%', tone: 'info', icon: 'CheckCircle' },
          { label: 'Avg. Satisfaction', value: '4.2/5', icon: 'ThumbsUp' },
          { label: 'Training Topics', value: TRAINING_DATA.length, icon: 'BookOpen' },
        ]}
      />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'training' && (
        <Section
          title={t('Training Topics')}
          toolbar={<SearchField value={query} onChange={setQuery} placeholder={t('Search topics...')} />}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-start text-xs font-semibold text-muted">
                  <th className="px-3 py-2.5 text-start">{t('Topic')}</th>
                  <th className="px-3 py-2.5 text-start">{t('Category')}</th>
                  <th className="px-3 py-2.5 text-end">{t('Samples')}</th>
                  <th className="px-3 py-2.5 text-end">{t('Accuracy')}</th>
                  <th className="px-3 py-2.5 text-start">{t('Status')}</th>
                  <th className="px-3 py-2.5 text-start">{t('Updated')}</th>
                </tr>
              </thead>
              <tbody>
                {TRAINING_DATA.filter(
                  (d) => !query || d.topic.toLowerCase().includes(query.toLowerCase())
                ).map((d) => {
                  const st = STATUS_STYLES[d.status]
                  return (
                    <tr key={d.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-3 font-medium text-heading">{t(d.topic)}</td>
                      <td className="px-3 py-3 text-muted">{t(d.category)}</td>
                      <td className="px-3 py-3 text-end font-mono text-body">{d.samples}</td>
                      <td className="px-3 py-3 text-end font-mono text-body">
                        {d.accuracy > 0 ? `${d.accuracy}%` : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <Badge background={st.bg} color={st.fg}>
                          {t(st.label)}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-muted">{t(d.lastUpdated)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {tab === 'conversations' && (
        <Section title={t('Recent Conversations')}>
          <div className="flex flex-col gap-3">
            {RECENT_CONVERSATIONS.map((c) => (
              <Card key={c.id} className="flex items-center gap-4 rounded-xl p-4">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-inset text-sm font-bold text-salis-blue">
                  {c.customer[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-heading">{c.customer}</p>
                  <p className="truncate text-xs text-muted">{t(c.topic)}</p>
                </div>
                <div className="hidden text-xs text-muted sm:block">
                  {c.messages} {t('messages')}
                </div>
                <Badge
                  background={c.resolved ? 'rgba(10,94,215,.1)' : 'rgba(249,115,22,.1)'}
                  color={c.resolved ? '#0A5ED7' : '#F97316'}
                >
                  {c.resolved ? t('Resolved') : t('Open')}
                </Badge>
                {c.satisfaction !== null && (
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Icon name="Star" size={12} />
                    {c.satisfaction}/5
                  </span>
                )}
                <span className="hidden text-xs text-muted lg:block">{c.date}</span>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {tab === 'analytics' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section title={t('Topic Breakdown')}>
            <div className="flex flex-col gap-3">
              {TOPIC_BREAKDOWN.map((topic) => (
                <div key={topic.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-body">{t(topic.label)}</span>
                    <span className="font-mono text-muted">{topic.pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-inset">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${topic.pct}%`, background: topic.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title={t('Response Quality')}>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Avg. Response Time', value: '1.8s', icon: 'Clock' },
                { label: 'Handoff to Human', value: '22%', icon: 'Users' },
                { label: 'Repeat Queries', value: '8%', icon: 'RefreshCw' },
                { label: 'Knowledge Gaps', value: '12', icon: 'AlertCircle' },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[rgba(10,94,215,.1)] text-salis-blue">
                    <Icon name={m.icon} size={16} />
                  </span>
                  <div className="flex-1">
                    <p className="text-[13px] text-muted">{t(m.label)}</p>
                  </div>
                  <p className="font-display text-lg font-bold text-heading">{m.value}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </>
  )
}
