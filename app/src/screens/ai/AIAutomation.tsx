import { useState } from 'react'
import { FeatureHeader, Section, StatRow, SearchField, TabBar } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

interface Trigger {
  id: string
  name: string
  event: string
  conditions: string[]
  actions: string[]
  status: 'active' | 'paused' | 'draft'
  runs: number
  lastRun: string
  icon: string
  tone: readonly [string, string]
}

const TRIGGERS: Trigger[] = [
  {
    id: 'tr-1',
    name: 'Service Due Reminder',
    event: 'Vehicle mileage threshold',
    conditions: ['Mileage > last service + 10,000 km', 'Customer opt-in = true'],
    actions: ['Send SMS reminder', 'Create follow-up task'],
    status: 'active',
    runs: 342,
    lastRun: '2 hours ago',
    icon: 'Bell',
    tone: ['rgba(10,94,215,.1)', '#0A5ED7'],
  },
  {
    id: 'tr-2',
    name: 'Parts Auto-Reorder',
    event: 'Inventory level change',
    conditions: ['Stock qty < reorder point', 'Supplier active = true'],
    actions: ['Generate purchase order', 'Notify procurement manager'],
    status: 'active',
    runs: 89,
    lastRun: '4 hours ago',
    icon: 'Package',
    tone: ['rgba(249,115,22,.1)', '#F97316'],
  },
  {
    id: 'tr-3',
    name: 'Job Escalation',
    event: 'Job duration exceeded',
    conditions: ['Elapsed time > estimated + 2h', 'Status = In Progress'],
    actions: ['Alert workshop manager', 'Update job priority to High'],
    status: 'active',
    runs: 56,
    lastRun: '1 day ago',
    icon: 'AlertTriangle',
    tone: ['rgba(11,179,255,.1)', '#0BB3FF'],
  },
  {
    id: 'tr-4',
    name: 'Customer Satisfaction Survey',
    event: 'Job status = Delivered',
    conditions: ['Invoice paid = true', 'Survey not yet sent'],
    actions: ['Send survey email', 'Schedule follow-up in 48h'],
    status: 'paused',
    runs: 215,
    lastRun: '3 days ago',
    icon: 'MessageSquare',
    tone: ['rgba(100,116,139,.1)', '#64748B'],
  },
  {
    id: 'tr-5',
    name: 'Warranty Claim Processor',
    event: 'Warranty claim submitted',
    conditions: ['Vehicle in warranty period', 'Claim amount < threshold'],
    actions: ['Auto-approve claim', 'Notify accounts'],
    status: 'draft',
    runs: 0,
    lastRun: 'Never',
    icon: 'Shield',
    tone: ['rgba(11,31,59,.1)', '#0B1F3B'],
  },
]

const TABS = [
  { id: 'all', label: 'All Rules', icon: 'List' },
  { id: 'active', label: 'Active', icon: 'Zap' },
  { id: 'paused', label: 'Paused', icon: 'Pause' },
  { id: 'draft', label: 'Drafts', icon: 'FileEdit' },
] as const

const STATUS_TONES: Record<string, { bg: string; fg: string }> = {
  active: { bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
  paused: { bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
  draft: { bg: 'rgba(100,116,139,.1)', fg: '#64748B' },
}

export function AIAutomation() {
  const { t } = usePreferences()
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')

  const filtered = TRIGGERS.filter((tr) => {
    if (tab !== 'all' && tr.status !== tab) return false
    if (query && !tr.name.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  return (
    <>
      <FeatureHeader
        icon="Cpu"
        title={t('AI Automation')}
        subtitle={t('Rule engine & trigger builder')}
        actions={
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('New Automation')}
          </Button>
        }
      />

      <StatRow
        stats={[
          { label: 'Total Rules', value: TRIGGERS.length, highlight: true, icon: 'Zap' },
          { label: 'Active Rules', value: TRIGGERS.filter((r) => r.status === 'active').length, tone: 'info', icon: 'Play' },
          { label: 'Total Executions', value: '702', icon: 'Activity' },
          { label: 'Success Rate', value: '98.6%', icon: 'CheckCircle' },
        ]}
      />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />

      <Section
        title={t('Automation Rules')}
        toolbar={<SearchField value={query} onChange={setQuery} placeholder={t('Search rules...')} />}
      >
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Icon name="Search" size={32} className="text-muted" />
              <p className="text-sm text-muted">{t('No matching rules found')}</p>
            </div>
          ) : (
            filtered.map((tr) => {
              const [bg, fg] = tr.tone
              const status = STATUS_TONES[tr.status]
              return (
                <Card key={tr.id} className="flex flex-col gap-3 rounded-2xl p-5">
                  <div className="flex items-center gap-3.5">
                    <span
                      className="flex flex-shrink-0 rounded-[10px] p-2"
                      style={{ background: bg, color: fg }}
                    >
                      <Icon name={tr.icon} size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-base font-bold text-heading">
                        {t(tr.name)}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted">
                        {t('Event')}: {t(tr.event)}
                      </p>
                    </div>
                    <Badge background={status.bg} color={status.fg}>
                      {t(tr.status.charAt(0).toUpperCase() + tr.status.slice(1))}
                    </Badge>
                    <div className="hidden text-end text-xs text-muted sm:block">
                      <p>
                        {tr.runs} {t('runs')}
                      </p>
                      <p>{t(tr.lastRun)}</p>
                    </div>
                  </div>

                  <div className="rounded-[10px] border border-border bg-inset p-3">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[13px]">
                      <span className="font-semibold text-salis-blue">{t('When')}</span>
                      <span className="text-body">{t(tr.event)}</span>
                    </div>
                    {tr.conditions.length > 0 && (
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-[13px]">
                        <span className="font-semibold text-muted">{t('If')}</span>
                        {tr.conditions.map((c, i) => (
                          <span key={i} className="text-body">
                            {i > 0 && <span className="mx-1 text-muted">&</span>}
                            {t(c)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-[13px]">
                      <span className="font-semibold text-salis-orange">{t('Then')}</span>
                      {tr.actions.map((a, i) => (
                        <span key={i} className="text-body">
                          {i > 0 && (
                            <>
                              <Icon name="ArrowRight" size={12} className="mx-1 inline text-muted" />
                            </>
                          )}
                          {t(a)}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </Section>
    </>
  )
}
