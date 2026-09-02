import { useState } from 'react'
import { Mic } from 'lucide-react'
import { FeatureHeader, Section, StatRow, TabBar, SearchField } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

interface VoiceInteraction {
  id: string
  transcript: string
  intent: string
  result: 'success' | 'partial' | 'failed' | 'ambiguous'
  confidence: number
  duration: string
  user: string
  timestamp: string
}

const INTERACTIONS: VoiceInteraction[] = [
  {
    id: 'vi-1',
    transcript: 'Open job card for Toyota Camry plate ABC 1234',
    intent: 'open_job_card',
    result: 'success',
    confidence: 96,
    duration: '1.2s',
    user: 'Ahmed K.',
    timestamp: 'Today, 11:45 AM',
  },
  {
    id: 'vi-2',
    transcript: 'Show me today revenue summary',
    intent: 'show_report',
    result: 'success',
    confidence: 92,
    duration: '0.9s',
    user: 'Omar H.',
    timestamp: 'Today, 11:30 AM',
  },
  {
    id: 'vi-3',
    transcript: 'Assign technician Faisal to job 4821',
    intent: 'assign_technician',
    result: 'success',
    confidence: 94,
    duration: '1.4s',
    user: 'Ahmed K.',
    timestamp: 'Today, 10:15 AM',
  },
  {
    id: 'vi-4',
    transcript: 'Check stock level brake pads',
    intent: 'check_inventory',
    result: 'partial',
    confidence: 78,
    duration: '1.8s',
    user: 'Sara M.',
    timestamp: 'Today, 9:50 AM',
  },
  {
    id: 'vi-5',
    transcript: 'Create new appointment for...',
    intent: 'unknown',
    result: 'failed',
    confidence: 34,
    duration: '2.1s',
    user: 'Omar H.',
    timestamp: 'Yesterday, 4:30 PM',
  },
  {
    id: 'vi-6',
    transcript: 'Send reminder to customer',
    intent: 'send_notification',
    result: 'ambiguous',
    confidence: 61,
    duration: '1.5s',
    user: 'Sara M.',
    timestamp: 'Yesterday, 3:00 PM',
  },
]

const RESULT_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  success: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', label: 'Success' },
  partial: { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)', label: 'Partial' },
  failed: { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)', label: 'Failed' },
  ambiguous: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)', label: 'Ambiguous' },
}

const TABS = [
  { id: 'history', label: 'History', icon: 'Clock' },
  { id: 'debug', label: 'Debug', icon: 'Terminal' },
] as const

const INTENT_DISTRIBUTION = [
  { label: 'Job Management', pct: 100, count: 124, color: 'var(--salis-blue)' },
  { label: 'Search & Navigation', pct: 78, count: 97, color: 'var(--salis-blue-bright)' },
  { label: 'Reporting', pct: 52, count: 64, color: 'var(--salis-orange)' },
  { label: 'Communication', pct: 31, count: 38, color: 'var(--salis-navy)' },
  { label: 'Inventory', pct: 22, count: 27, color: 'var(--text-muted)' },
] as const

export function VoiceCommandInterface() {
  const { t } = usePreferences()
  const [tab, setTab] = useState('history')
  const [query, setQuery] = useState('')

  const successRate = Math.round(
    (INTERACTIONS.filter((i) => i.result === 'success').length / INTERACTIONS.length) * 100
  )

  const filteredInteractions = INTERACTIONS.filter(
    (i) => !query || i.transcript.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <FeatureHeader
        icon="Radio"
        title={t('Voice Command Interface')}
        subtitle={t('Interaction history & debug view')}
      />

      <StatRow
        stats={[
          { label: 'Total Interactions', value: '350', highlight: true, icon: 'AudioLines' },
          { label: 'Success Rate', value: `${successRate}%`, tone: 'info', icon: 'CheckCircle' },
          { label: 'Avg Confidence', value: '76%', icon: 'Target' },
          { label: 'Avg Duration', value: '1.5s', icon: 'Clock' },
        ]}
      />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />

      {tab === 'history' && (
        <>
          <Section
            title={t('Recent Interactions')}
            toolbar={
              <SearchField value={query} onChange={setQuery} placeholder={t('Search transcripts...')} />
            }
          >
            <div className="flex flex-col gap-3">
              {filteredInteractions.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Icon name="Search" size={32} className="text-muted" />
                  <p className="text-sm text-muted">{t('No matching interactions')}</p>
                </div>
              ) : (
                filteredInteractions.map((interaction) => {
                  const rs = RESULT_STYLES[interaction.result]
                  return (
                    <Card key={interaction.id} className="flex flex-col gap-2.5 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <span
                          className="flex flex-shrink-0 rounded-lg p-2"
                          style={{ background: rs.bg, color: rs.fg }}
                        >
                          <Mic size={14} strokeWidth={2} aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-heading">
                            &ldquo;{interaction.transcript}&rdquo;
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                            <span className="flex items-center gap-1">
                              <Icon name="User" size={11} />
                              {interaction.user}
                            </span>
                            <span>{interaction.timestamp}</span>
                            <span>{interaction.duration}</span>
                          </div>
                        </div>
                        <Badge background={rs.bg} color={rs.fg}>
                          {t(rs.label)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 ps-10 text-xs text-muted">
                        <span>
                          {t('Intent')}: <span className="font-mono text-body">{interaction.intent}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Target" size={11} />
                          {interaction.confidence}%
                        </span>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </Section>
        </>
      )}

      {tab === 'debug' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section title={t('Intent Distribution')}>
            <div className="flex flex-col gap-3">
              {INTENT_DISTRIBUTION.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-body">{t(item.label)}</span>
                    <span className="font-mono text-muted">{item.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-inset">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${item.pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title={t('Recognition Pipeline')}>
            <div className="flex flex-col gap-3">
              {[
                { stage: 'Audio Capture', latency: '120ms', status: 'ok', icon: 'Radio' },
                { stage: 'Speech-to-Text', latency: '450ms', status: 'ok', icon: 'FileText' },
                { stage: 'Intent Classification', latency: '180ms', status: 'ok', icon: 'Cpu' },
                { stage: 'Entity Extraction', latency: '95ms', status: 'ok', icon: 'Tag' },
                { stage: 'Action Dispatch', latency: '60ms', status: 'ok', icon: 'Zap' },
              ].map((step) => (
                <div key={step.stage} className="flex items-center gap-3 rounded-lg border border-border bg-inset p-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--tint-blue)] text-salis-blue">
                    <Icon name={step.icon} size={14} />
                  </span>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-heading">{t(step.stage)}</p>
                  </div>
                  <span className="font-mono text-xs text-muted">{step.latency}</span>
                  <span className="h-2 w-2 rounded-full bg-salis-blue" />
                </div>
              ))}

              <div className="rounded-lg border border-border bg-inset p-3">
                <p className="text-xs text-muted">
                  {t(
                    'Pipeline status is simulated. Connect a speech recognition provider in System Integrations to view live debug data.'
                  )}
                </p>
              </div>
            </div>
          </Section>
        </div>
      )}
    </>
  )
}
