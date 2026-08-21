import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsMobile } from '@/lib/useMediaQuery'
import { cn } from '@/lib/cn'
import { ListPageHeader } from '@/components/shell/ListPage'
import { FeatureHeader, Section, StatRow } from '@/components/shell/FeatureScreen'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { LeadFormModal } from './LeadFormModal'
import { OpportunityFormModal } from './OpportunityFormModal'
import { CampaignFormModal } from './CampaignFormModal'
import { SegmentFormModal } from './SegmentFormModal'
import { CrmTaskFormModal } from './CrmTaskFormModal'

/** CRM: pipeline, opportunities, campaigns, segments and tasks.
 *
 *  Pipeline stages run cold → won on the blue scale; `lost` is neutral slate
 *  rather than red, and `urgent` priority is the only orange (README §7). */

const STAGE_TONE: Record<string, readonly [string, string]> = {
  new: ['rgba(100,116,139,.12)', '#64748B'],
  qualified: ['rgba(11,179,255,.12)', '#0BB3FF'],
  proposal: ['rgba(10,94,215,.1)', '#0A5ED7'],
  negotiation: ['rgba(10,94,215,.16)', '#0A5ED7'],
  won: ['rgba(11,31,59,.12)', '#0B1F3B'],
  lost: ['rgba(100,116,139,.1)', '#64748B'],
}

const PRIORITY_TONE: Record<string, readonly [string, string]> = {
  urgent: ['rgba(249,115,22,.12)', '#F97316'],
  high: ['rgba(249,115,22,.08)', '#F97316'],
  medium: ['rgba(11,179,255,.1)', '#0BB3FF'],
  low: ['rgba(10,94,215,.1)', '#0A5ED7'],
}

const STATUS_TONE: Record<string, readonly [string, string]> = {
  running: ['rgba(10,94,215,.1)', '#0A5ED7'],
  scheduled: ['rgba(11,179,255,.1)', '#0BB3FF'],
  completed: ['rgba(11,31,59,.1)', '#0B1F3B'],
  todo: ['rgba(100,116,139,.1)', '#64748B'],
  in_progress: ['rgba(11,179,255,.1)', '#0BB3FF'],
  done: ['rgba(10,94,215,.1)', '#0A5ED7'],
  active: ['rgba(10,94,215,.1)', '#0A5ED7'],
  paused: ['rgba(249,115,22,.1)', '#F97316'],
  draft: ['rgba(100,116,139,.1)', '#64748B'],
}

function Tone({
  value,
  palette,
  label,
}: {
  value: string
  palette: Record<string, readonly [string, string]>
  label?: string
}) {
  const { t } = usePreferences()
  const [bg, fg] = palette[value] ?? ['rgba(100,116,139,.1)', '#64748B']
  const text = label ?? value.replace(/_/g, ' ')
  return (
    <Badge background={bg} color={fg}>
      {t(text[0].toUpperCase() + text.slice(1))}
    </Badge>
  )
}

// ── Lead pipeline ───────────────────────────────────────────────────────────
type Lead = RowOf<'leads'>

const PIPELINE_STAGES = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const

/** Kanban pipeline.
 *
 *  The design rendered a flat list; a pipeline's whole value is seeing where
 *  value is stuck, so this columns by stage and totals each column. */
export function LeadPipeline() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { data: leads = [], isLoading } = useCollection('leads')
  const [creating, setCreating] = useState(false)

  const byStage = useMemo(() => {
    const map = new Map<string, Lead[]>()
    for (const stage of PIPELINE_STAGES) map.set(stage, [])
    for (const lead of leads) map.get(lead.stage)?.push(lead)
    return map
  }, [leads])

  const openValue = useMemo(
    () =>
      leads
        .filter((l) => l.stage !== 'won' && l.stage !== 'lost')
        .reduce((sum, l) => sum + parseSar(l.value), 0),
    [leads]
  )
  const wonValue = useMemo(
    () => leads.filter((l) => l.stage === 'won').reduce((sum, l) => sum + parseSar(l.value), 0),
    [leads]
  )

  if (isLoading) return <p className="text-sm text-muted">{t('Loading...')}</p>

  const pipelineStats = (
    <StatRow
      stats={[
        { label: 'Open Pipeline', value: formatSar(openValue), caption: 'Not yet closed', highlight: true },
        { label: 'Won', value: formatSar(wonValue), caption: 'Closed won', tone: 'info' },
        { label: 'Leads', value: leads.length, caption: 'All stages' },
        {
          label: 'Win Rate',
          value: leads.length
            ? `${Math.round((byStage.get('won')!.length / leads.length) * 100)}%`
            : '0%',
          caption: 'Won / total',
        },
      ]}
    />
  )

  if (isMobile) {
    return (
      <>
        <MobilePageHeader
          icon="GitBranch"
          title={t('Lead Pipeline')}
          actions={
            can('crm', 'c') ? (
              <Button size="md" onClick={() => setCreating(true)}>
                <Icon name="Plus" size={16} />
                {t('New Lead')}
              </Button>
            ) : null
          }
        />
        {pipelineStats}
        <LeadFormModal open={creating} onClose={() => setCreating(false)} />
        <div className="flex flex-col gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const column = byStage.get(stage) ?? []
            const total = column.reduce((sum, l) => sum + parseSar(l.value), 0)
            return (
              <Card key={stage} className="flex flex-col gap-3 rounded-lg p-4">
                <div className="flex items-center justify-between gap-2">
                  <Tone value={stage} palette={STAGE_TONE} />
                  <span className="font-mono text-[11px] text-muted" dir="ltr">
                    {column.length} · {formatSar(total)}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {column.length === 0 ? (
                    <p className="py-3 text-center text-xs text-muted">{t('Nothing here yet')}</p>
                  ) : (
                    column.map((lead) => (
                      <button
                        key={lead.name}
                        type="button"
                        onClick={() => navigate(`/lead-detail?name=${encodeURIComponent(lead.name)}`)}
                        className="flex cursor-pointer flex-col gap-1 rounded-lg border border-border bg-inset p-3 text-start transition-colors hover:border-salis-blue"
                      >
                        <span className="text-[13px] font-semibold text-heading">{lead.name}</span>
                        <span className="text-[11px] text-muted">{lead.company}</span>
                        <span className="mt-1 flex items-center justify-between gap-2">
                          <Money sar={parseSar(lead.value)} className="text-xs font-semibold text-heading" />
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                            <Icon name="Gauge" size={11} />
                            <span className="font-mono" dir="ltr">
                              {lead.score}
                            </span>
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Lead Pipeline')}
        subtitle={t('CRM')}
        actions={
          can('crm', 'c') ? (
            <Button size="md" onClick={() => setCreating(true)}>
              <Icon name="Plus" size={16} />
              {t('New Lead')}
            </Button>
          ) : null
        }
      />

      {pipelineStats}
      <LeadFormModal open={creating} onClose={() => setCreating(false)} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PIPELINE_STAGES.map((stage) => {
          const column = byStage.get(stage) ?? []
          const total = column.reduce((sum, l) => sum + parseSar(l.value), 0)
          return (
            <Card key={stage} className="flex flex-col gap-3 rounded-lg p-4">
              <div className="flex items-center justify-between gap-2">
                <Tone value={stage} palette={STAGE_TONE} />
                <span className="font-mono text-[11px] text-muted" dir="ltr">
                  {column.length} · {formatSar(total)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {column.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted">{t('Nothing here yet')}</p>
                ) : (
                  column.map((lead) => (
                    <button
                      key={lead.name}
                      type="button"
                      onClick={() => navigate(`/lead-detail?name=${encodeURIComponent(lead.name)}`)}
                      className="flex cursor-pointer flex-col gap-1 rounded-lg border border-border bg-inset p-3 text-start transition-colors hover:border-salis-blue"
                    >
                      <span className="text-[13px] font-semibold text-heading">{lead.name}</span>
                      <span className="text-[11px] text-muted">{lead.company}</span>
                      <span className="mt-1 flex items-center justify-between gap-2">
                        <Money sar={parseSar(lead.value)} className="text-xs font-semibold text-heading" />
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                          <Icon name="Gauge" size={11} />
                          <span className="font-mono" dir="ltr">
                            {lead.score}
                          </span>
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}

// ── Opportunities ───────────────────────────────────────────────────────────
type Opportunity = RowOf<'opportunities'>

export function Opportunities() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const { data: opportunities = [] } = useCollection('opportunities')
  const [creating, setCreating] = useState(false)

  // Weighted pipeline: value × probability. The unweighted total flatters the
  // forecast, which is what a sales review actually argues about.
  const weighted = useMemo(
    () =>
      opportunities.reduce(
        (sum, o) => sum + parseSar(o.value) * (parseInt(o.prob, 10) / 100),
        0
      ),
    [opportunities]
  )
  const gross = useMemo(
    () => opportunities.reduce((sum, o) => sum + parseSar(o.value), 0),
    [opportunities]
  )

  const columns: Column<Opportunity>[] = [
    { header: 'Name', cell: (o) => t(o.name) },
    { header: 'Company', cell: (o) => o.company },
    { header: 'Value', cell: (o) => <Money sar={parseSar(o.value)} className="font-semibold" /> },
    { header: 'Stage', cell: (o) => <Tone value={o.stage.toLowerCase()} palette={STAGE_TONE} label={o.stage} /> },
    { header: 'Probability', cell: (o) => <span className="font-mono text-[13px]" dir="ltr">{o.prob}</span> },
    {
      header: 'Weighted',
      cell: (o) => (
        <Money sar={parseSar(o.value) * (parseInt(o.prob, 10) / 100)} className="text-muted" />
      ),
    },
    { header: 'Close Date', cell: (o) => o.close },
    { header: 'Owner', cell: (o) => o.owner },
  ]

  const oppStats = (
    <StatRow
      stats={[
        { label: 'Gross Pipeline', value: formatSar(gross), caption: 'Unweighted', highlight: true },
        { label: 'Weighted Forecast', value: formatSar(weighted), caption: 'Value × probability', tone: 'info' },
        { label: 'Opportunities', value: opportunities.length, caption: 'Open' },
        {
          label: 'Average Deal',
          value: opportunities.length ? formatSar(gross / opportunities.length) : formatSar(0),
          caption: 'Gross / count',
        },
      ]}
    />
  )

  if (isMobile) {
    return (
      <>
        <MobilePageHeader
          icon="Target"
          title={t('Opportunities')}
          actions={
            can('crm', 'c') ? (
              <Button size="md" onClick={() => setCreating(true)}>
                <Icon name="Plus" size={16} />
                {t('New Opportunity')}
              </Button>
            ) : null
          }
        />
        {oppStats}
        <OpportunityFormModal open={creating} onClose={() => setCreating(false)} />
        <DataTable
          columns={columns}
          rows={opportunities}
          rowKey={(o) => o.name}
          mobileCard={(o) => (
            <>
              <MobileCardHeader
                title={t(o.name)}
                trailing={<Tone value={o.stage.toLowerCase()} palette={STAGE_TONE} label={o.stage} />}
              />
              <MobileCardRow>{o.company}</MobileCardRow>
              <MobileCardRow label={t('Value')}>
                <Money sar={parseSar(o.value)} className="font-semibold text-heading" />
              </MobileCardRow>
              <MobileCardRow label={t('Probability')}>{o.prob}</MobileCardRow>
              <MobileCardRow label={t('Close Date')}>{o.close}</MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="Target" title={t('No opportunities yet')} />}
        />
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Opportunities')}
        subtitle={t('CRM')}
        actions={
          can('crm', 'c') ? (
            <Button size="md" onClick={() => setCreating(true)}>
              <Icon name="Plus" size={16} />
              {t('New Opportunity')}
            </Button>
          ) : null
        }
      />
      {oppStats}
      <OpportunityFormModal open={creating} onClose={() => setCreating(false)} />
      <DataTable
        columns={columns}
        rows={opportunities}
        rowKey={(o) => o.name}
        mobileCard={(o) => (
          <>
            <MobileCardHeader
              title={t(o.name)}
              trailing={<Tone value={o.stage.toLowerCase()} palette={STAGE_TONE} label={o.stage} />}
            />
            <MobileCardRow>{o.company}</MobileCardRow>
            <MobileCardRow label={t('Value')}>
              <Money sar={parseSar(o.value)} className="font-semibold text-heading" />
            </MobileCardRow>
            <MobileCardRow label={t('Probability')}>{o.prob}</MobileCardRow>
            <MobileCardRow label={t('Close Date')}>{o.close}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Target" title={t('No opportunities yet')} />}
      />
    </>
  )
}

// ── Campaigns ───────────────────────────────────────────────────────────────
type Campaign = RowOf<'campaigns'>

const CHANNEL_ICON: Record<string, string> = {
  email: 'Mail',
  sms: 'MessageSquare',
  whatsapp: 'MessageCircle',
}

/** Campaign list, filtered by channel. Also backs EmailMarketing,
 *  SMSCampaigns and WhatsAppCampaigns — same data, one channel each. */
export function Campaigns({ channel }: { channel?: 'email' | 'sms' | 'whatsapp' }) {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const { data: all = [], isLoading } = useCollection('campaigns')
  const [creating, setCreating] = useState(false)

  const campaigns = useMemo(
    () => (channel ? all.filter((c) => c.type === channel) : all),
    [all, channel]
  )

  const totals = useMemo(() => {
    const reach = campaigns.reduce((sum, c) => sum + c.reach, 0)
    const opens = campaigns.reduce((sum, c) => sum + c.opens, 0)
    const clicks = campaigns.reduce((sum, c) => sum + c.clicks, 0)
    const conversions = campaigns.reduce((sum, c) => sum + c.conversions, 0)
    return { reach, opens, clicks, conversions }
  }, [campaigns])

  const title =
    channel === 'email'
      ? 'Email Marketing'
      : channel === 'sms'
        ? 'SMS Campaigns'
        : channel === 'whatsapp'
          ? 'WhatsApp Campaigns'
          : 'Campaigns'

  const columns: Column<Campaign>[] = [
    {
      header: 'Name',
      cell: (c) => (
        <span className="flex items-center gap-2">
          <Icon name={CHANNEL_ICON[c.type] ?? 'Megaphone'} size={15} className="text-salis-blue" />
          {t(c.name)}
        </span>
      ),
    },
    { header: 'Status', cell: (c) => <Tone value={c.status} palette={STATUS_TONE} /> },
    { header: 'Reach', cell: (c) => <span className="font-mono text-[13px]" dir="ltr">{c.reach.toLocaleString('en-US')}</span> },
    {
      header: 'Open Rate',
      cell: (c) => (
        <span className="font-mono text-[13px]" dir="ltr">
          {c.reach ? `${Math.round((c.opens / c.reach) * 100)}%` : '—'}
        </span>
      ),
    },
    {
      header: 'Click Rate',
      cell: (c) => (
        <span className="font-mono text-[13px]" dir="ltr">
          {c.opens ? `${Math.round((c.clicks / c.opens) * 100)}%` : '—'}
        </span>
      ),
    },
    { header: 'Conversions', cell: (c) => c.conversions },
    { header: 'Spent', cell: (c) => <Money sar={parseSar(c.spent)} /> },
    { header: 'Budget', cell: (c) => <Money sar={parseSar(c.budget)} className="text-muted" /> },
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="Megaphone" title={t(title)} subtitle={t('Marketing')} />
        <StatRow stats={[
          { label: 'Reach', value: totals.reach.toLocaleString('en-US'), caption: 'Recipients', highlight: true },
          { label: 'Conversions', value: totals.conversions, caption: 'Booked' },
        ]} />
        <DataTable
          columns={columns}
          rows={campaigns}
          rowKey={(c) => c.name}
          loading={isLoading}
          mobileCard={(c) => (
            <>
              <MobileCardHeader title={t(c.name)} trailing={<Tone value={c.status} palette={STATUS_TONE} />} />
              <MobileCardRow label={t('Reach')}>{c.reach.toLocaleString('en-US')}</MobileCardRow>
              <MobileCardRow label={t('Conversions')}>{c.conversions}</MobileCardRow>
              <MobileCardRow label={t('Spent')}>
                <Money sar={parseSar(c.spent)} className="font-semibold text-heading" />
              </MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="Megaphone" title={t('No campaigns yet')} />}
        />
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t(title)}
        subtitle={t('Marketing')}
        actions={
          can('crm', 'c') ? (
            <Button size="md" onClick={() => setCreating(true)}>
              <Icon name="Plus" size={16} />
              {t('New Campaign')}
            </Button>
          ) : null
        }
      />
      <CampaignFormModal open={creating} onClose={() => setCreating(false)} />
      <StatRow
        stats={[
          { label: 'Reach', value: totals.reach.toLocaleString('en-US'), caption: 'Recipients', highlight: true },
          {
            label: 'Open Rate',
            value: totals.reach ? `${Math.round((totals.opens / totals.reach) * 100)}%` : '0%',
            caption: 'Opened / reached',
            tone: 'info',
          },
          {
            label: 'Click Rate',
            value: totals.opens ? `${Math.round((totals.clicks / totals.opens) * 100)}%` : '0%',
            caption: 'Clicked / opened',
            tone: 'info',
          },
          { label: 'Conversions', value: totals.conversions, caption: 'Booked' },
        ]}
      />
      <DataTable
        columns={columns}
        rows={campaigns}
        rowKey={(c) => c.name}
        loading={isLoading}
        mobileCard={(c) => (
          <>
            <MobileCardHeader title={t(c.name)} trailing={<Tone value={c.status} palette={STATUS_TONE} />} />
            <MobileCardRow label={t('Reach')}>{c.reach.toLocaleString('en-US')}</MobileCardRow>
            <MobileCardRow label={t('Conversions')}>{c.conversions}</MobileCardRow>
            <MobileCardRow label={t('Spent')}>
              <Money sar={parseSar(c.spent)} className="font-semibold text-heading" />
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Megaphone" title={t('No campaigns yet')} />}
      />
    </>
  )
}

export function EmailMarketing() {
  const isMobile = useIsMobile()
  return <div className={isMobile ? 'flex flex-col gap-3' : undefined}><Campaigns channel="email" /></div>
}
export function SMSCampaigns() {
  const isMobile = useIsMobile()
  return <div className={isMobile ? 'flex flex-col gap-3' : undefined}><Campaigns channel="sms" /></div>
}
export function WhatsAppCampaigns() {
  const isMobile = useIsMobile()
  return <div className={isMobile ? 'flex flex-col gap-3' : undefined}><Campaigns channel="whatsapp" /></div>
}

// ── Segments ────────────────────────────────────────────────────────────────
type Segment = RowOf<'segments'>

export function CustomerSegments() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const { data: segments = [], isLoading } = useCollection('segments')
  const [creating, setCreating] = useState(false)

  const columns: Column<Segment>[] = [
    { header: 'Name', cell: (s) => t(s.name) },
    { header: 'Customers', cell: (s) => s.count },
    { header: 'Rules', cell: (s) => <span className="font-mono text-xs text-muted">{s.rules}</span> },
    { header: 'Last Updated', cell: (s) => s.lastUpdated },
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="Users" title={t('Customer Segments')} subtitle={t('CRM')} />
        <DataTable
          columns={columns}
          rows={segments}
          rowKey={(s) => s.name}
          loading={isLoading}
          mobileCard={(s) => (
            <>
              <MobileCardHeader title={t(s.name)} />
              <MobileCardRow label={t('Customers')}>{s.count}</MobileCardRow>
              <MobileCardRow label={t('Rules')}>
                <span className="font-mono text-xs">{s.rules}</span>
              </MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="Users" title={t('No segments defined')} />}
        />
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Customer Segments')}
        subtitle={t('CRM')}
        actions={
          can('crm', 'c') ? (
            <Button size="md" onClick={() => setCreating(true)}>
              <Icon name="Plus" size={16} />
              {t('New Segment')}
            </Button>
          ) : null
        }
      />
      <SegmentFormModal open={creating} onClose={() => setCreating(false)} />
      <DataTable
        columns={columns}
        rows={segments}
        rowKey={(s) => s.name}
        loading={isLoading}
        mobileCard={(s) => (
          <>
            <MobileCardHeader title={t(s.name)} />
            <MobileCardRow label={t('Customers')}>{s.count}</MobileCardRow>
            <MobileCardRow label={t('Rules')}>
              <span className="font-mono text-xs">{s.rules}</span>
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Users" title={t('No segments defined')} />}
      />
    </>
  )
}

// ── CRM tasks ───────────────────────────────────────────────────────────────
type CrmTask = RowOf<'crmTasks'>

const TASK_ICON: Record<string, string> = {
  call: 'Phone',
  meeting: 'Users',
  document: 'FileText',
  task: 'CheckSquare',
}

export function CRMTasks() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const { data: tasks = [], isLoading } = useCollection('crmTasks')
  const [status, setStatus] = useState<string>('all')
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(
    () => (status === 'all' ? tasks : tasks.filter((task) => task.status === status)),
    [tasks, status]
  )

  const columns: Column<CrmTask>[] = [
    {
      header: 'Task',
      cell: (task) => (
        <span className="flex items-center gap-2">
          <Icon name={TASK_ICON[task.type] ?? 'CheckSquare'} size={15} className="text-salis-blue" />
          {t(task.title)}
        </span>
      ),
    },
    { header: 'Assigned To', cell: (task) => task.assigned },
    { header: 'Due', cell: (task) => task.due },
    { header: 'Priority', cell: (task) => <Tone value={task.priority} palette={PRIORITY_TONE} /> },
    { header: 'Status', cell: (task) => <Tone value={task.status} palette={STATUS_TONE} /> },
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="CheckSquare" title={t('CRM Tasks')} subtitle={t('CRM')} />
        <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
          {(['all', 'todo', 'in_progress', 'done'] as const).map((option) => {
            const count = option === 'all' ? tasks.length : tasks.filter((x) => x.status === option).length
            return (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={status === option}
                onClick={() => setStatus(option)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5',
                  'font-action text-[13px] font-medium capitalize transition-all duration-150',
                  status === option
                    ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                    : 'border-border bg-card text-muted hover:border-border-strong'
                )}
              >
                {t(option.replace(/_/g, ' '))}
                <span className="font-mono text-[11px] opacity-70" dir="ltr">{count}</span>
              </button>
            )
          })}
        </div>
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(task) => task.title}
          loading={isLoading}
          mobileCard={(task) => (
            <>
              <MobileCardHeader title={t(task.title)} trailing={<Tone value={task.status} palette={STATUS_TONE} />} />
              <MobileCardRow label={t('Assigned To')}>{task.assigned}</MobileCardRow>
              <MobileCardRow label={t('Due')}>{task.due}</MobileCardRow>
              <Tone value={task.priority} palette={PRIORITY_TONE} />
            </>
          )}
          empty={<EmptyState icon="CheckSquare" title={t('Nothing in this view')} />}
        />
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('CRM Tasks')}
        subtitle={t('CRM')}
        actions={
          can('crm', 'c') ? (
            <Button size="md" onClick={() => setCreating(true)}>
              <Icon name="Plus" size={16} />
              {t('New Task')}
            </Button>
          ) : null
        }
      />
      <CrmTaskFormModal open={creating} onClose={() => setCreating(false)} />

      <div role="tablist" aria-label={t('Status')} className="flex flex-wrap gap-2">
        {(['all', 'todo', 'in_progress', 'done'] as const).map((option) => {
          const count = option === 'all' ? tasks.length : tasks.filter((x) => x.status === option).length
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={status === option}
              onClick={() => setStatus(option)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5',
                'font-action text-[13px] font-medium capitalize transition-all duration-150',
                status === option
                  ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                  : 'border-border bg-card text-muted hover:border-border-strong'
              )}
            >
              {t(option.replace(/_/g, ' '))}
              <span className="font-mono text-[11px] opacity-70" dir="ltr">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(task) => task.title}
        loading={isLoading}
        mobileCard={(task) => (
          <>
            <MobileCardHeader title={t(task.title)} trailing={<Tone value={task.status} palette={STATUS_TONE} />} />
            <MobileCardRow label={t('Assigned To')}>{task.assigned}</MobileCardRow>
            <MobileCardRow label={t('Due')}>{task.due}</MobileCardRow>
            <Tone value={task.priority} palette={PRIORITY_TONE} />
          </>
        )}
        empty={<EmptyState icon="CheckSquare" title={t('Nothing in this view')} />}
      />
    </>
  )
}

// ── AI agents ───────────────────────────────────────────────────────────────
type Agent = RowOf<'aiAgents'>

export function AgentRegistry() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data: agents = [], isLoading } = useCollection('aiAgents')

  const columns: Column<Agent>[] = [
    {
      header: 'Agent',
      cell: (a) => (
        <span className="flex items-center gap-2">
          <Icon name={a.icon} size={15} className="text-salis-blue" />
          {t(a.name)}
        </span>
      ),
    },
    { header: 'Role', cell: (a) => t(a.role) },
    { header: 'Model', cell: (a) => <span className="font-mono text-xs">{a.model}</span> },
    { header: 'Tasks', cell: (a) => <span className="font-mono text-[13px]" dir="ltr">{a.tasks.toLocaleString('en-US')}</span> },
    { header: 'Success Rate', cell: (a) => <span className="font-mono text-[13px]" dir="ltr">{a.success}</span> },
    { header: 'Status', cell: (a) => <Tone value={a.status} palette={STATUS_TONE} /> },
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="Bot" title={t('Agent Registry')} />
        <DataTable
          columns={columns}
          rows={agents}
          rowKey={(a) => a.name}
          loading={isLoading}
          mobileCard={(a) => (
            <>
              <MobileCardHeader title={t(a.name)} trailing={<Tone value={a.status} palette={STATUS_TONE} />} />
              <MobileCardRow label={t('Role')}>{t(a.role)}</MobileCardRow>
              <MobileCardRow label={t('Model')}>
                <span className="font-mono text-xs">{a.model}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Tasks')}>{a.tasks.toLocaleString('en-US')}</MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="Bot" title={t('No agents deployed')} />}
        />
      </>
    )
  }

  return (
    <>
      <FeatureHeader
        icon="Bot"
        title={t('Agent Registry')}
        subtitle={t('Deployed AI agents and their runtime status')}
      />
      <DataTable
        columns={columns}
        rows={agents}
        rowKey={(a) => a.name}
        loading={isLoading}
        mobileCard={(a) => (
          <>
            <MobileCardHeader title={t(a.name)} trailing={<Tone value={a.status} palette={STATUS_TONE} />} />
            <MobileCardRow label={t('Role')}>{t(a.role)}</MobileCardRow>
            <MobileCardRow label={t('Model')}>
              <span className="font-mono text-xs">{a.model}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Tasks')}>{a.tasks.toLocaleString('en-US')}</MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Bot" title={t('No agents deployed')} />}
      />
    </>
  )
}

export function AgentDashboard() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data: agents = [] } = useCollection('aiAgents')

  const active = agents.filter((a) => a.status === 'active')
  const totalTasks = agents.reduce((sum, a) => sum + a.tasks, 0)
  const avgSuccess = agents.length
    ? Math.round(agents.reduce((sum, a) => sum + parseInt(a.success, 10), 0) / agents.length)
    : 0

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="LayoutDashboard" title={t('Agent Dashboard')} />
        <StatRow stats={[
          { label: 'Active Agents', value: active.length, caption: `${t('of')} ${agents.length}`, highlight: true },
          { label: 'Tasks Handled', value: totalTasks.toLocaleString('en-US'), caption: 'All time', tone: 'info' },
        ]} />
        <div className="flex flex-col gap-3">
          {agents.map((agent) => (
            <Card key={agent.name} className="flex flex-col gap-1.5 p-3">
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="flex items-center gap-2 text-body">
                  <Icon name={agent.icon} size={14} className="text-salis-blue" />
                  {t(agent.name)}
                </span>
                <span className="font-mono text-heading" dir="ltr">{agent.tasks.toLocaleString('en-US')}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-inset">
                <div
                  className="h-full rounded-full bg-salis-gradient-r"
                  style={{ width: `${(agent.tasks / Math.max(...agents.map((a) => a.tasks), 1)) * 100}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <FeatureHeader
        icon="LayoutDashboard"
        title={t('Agent Dashboard')}
        subtitle={t('AI agent runtime and throughput')}
      />
      <StatRow
        stats={[
          { label: 'Active Agents', value: active.length, caption: `${t('of')} ${agents.length}`, highlight: true },
          { label: 'Tasks Handled', value: totalTasks.toLocaleString('en-US'), caption: 'All time', tone: 'info' },
          { label: 'Avg Success Rate', value: `${avgSuccess}%`, caption: 'Across agents' },
          {
            label: 'Paused',
            value: agents.filter((a) => a.status === 'paused').length,
            caption: 'Needs attention',
            tone: 'warning',
          },
        ]}
      />
      <Section title={t('Agents')} subtitle={t('Throughput by agent')}>
        <div className="flex flex-col gap-3">
          {agents.map((agent) => (
            <div key={agent.name} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="flex items-center gap-2 text-body">
                  <Icon name={agent.icon} size={14} className="text-salis-blue" />
                  {t(agent.name)}
                </span>
                <span className="font-mono text-heading" dir="ltr">
                  {agent.tasks.toLocaleString('en-US')}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-inset">
                <div
                  className="h-full rounded-full bg-salis-gradient-r"
                  style={{
                    width: `${(agent.tasks / Math.max(...agents.map((a) => a.tasks), 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

// ── Conversations ───────────────────────────────────────────────────────────
type Conversation = RowOf<'conversations'>

export function ConversationHistory() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data: conversations = [], isLoading } = useCollection('conversations')

  const columns: Column<Conversation>[] = [
    { header: 'Title', cell: (c) => t(c.title) },
    { header: 'User', cell: (c) => c.user },
    { header: 'Messages', cell: (c) => c.msgs },
    { header: 'Tokens', cell: (c) => <span className="font-mono text-[13px]" dir="ltr">{c.tokens}</span> },
    { header: 'Date', cell: (c) => c.date },
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="MessagesSquare" title={t('Conversation History')} />
        <DataTable
          columns={columns}
          rows={conversations}
          rowKey={(c) => c.title}
          loading={isLoading}
          mobileCard={(c) => (
            <>
              <MobileCardHeader title={t(c.title)} />
              <MobileCardRow label={t('User')}>{c.user}</MobileCardRow>
              <MobileCardRow label={t('Messages')}>{c.msgs}</MobileCardRow>
              <MobileCardRow label={t('Tokens')}>
                <span className="font-mono" dir="ltr">{c.tokens}</span>
              </MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="MessagesSquare" title={t('No conversations yet')} />}
        />
      </>
    )
  }

  return (
    <>
      <FeatureHeader
        icon="MessagesSquare"
        title={t('Conversation History')}
        subtitle={t('AI conversation logs')}
      />
      <DataTable
        columns={columns}
        rows={conversations}
        rowKey={(c) => c.title}
        loading={isLoading}
        mobileCard={(c) => (
          <>
            <MobileCardHeader title={t(c.title)} />
            <MobileCardRow label={t('User')}>{c.user}</MobileCardRow>
            <MobileCardRow label={t('Messages')}>{c.msgs}</MobileCardRow>
            <MobileCardRow label={t('Tokens')}>
              <span className="font-mono" dir="ltr">
                {c.tokens}
              </span>
            </MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="MessagesSquare" title={t('No conversations yet')} />}
      />
    </>
  )
}

// ── Integrations ────────────────────────────────────────────────────────────
type Integration = RowOf<'integrations'>

const INTEGRATION_STATUS: Record<string, readonly [string, string]> = {
  connected: ['rgba(10,94,215,.1)', '#0A5ED7'],
  pending: ['rgba(249,115,22,.1)', '#F97316'],
  available: ['rgba(100,116,139,.1)', '#64748B'],
}

export function Integrations() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const { data: integrations = [], isLoading } = useCollection('integrations')
  const [category, setCategory] = useState<string>('all')

  const categories = useMemo(
    () => ['all', ...new Set(integrations.map((i) => i.cat))],
    [integrations]
  )
  const filtered = useMemo(
    () => (category === 'all' ? integrations : integrations.filter((i) => i.cat === category)),
    [integrations, category]
  )

  if (isLoading) return <p className="text-sm text-muted">{t('Loading...')}</p>

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="Plug" title={t('Integrations')} />
        <StatRow stats={[
          { label: 'Connected', value: integrations.filter((i) => i.status === 'connected').length, caption: 'Live', highlight: true },
          { label: 'Pending', value: integrations.filter((i) => i.status === 'pending').length, caption: 'Setup incomplete', tone: 'warning' },
        ]} />
        <div className="flex flex-col gap-3">
          {filtered.map((integration: Integration) => {
            const [bg, fg] = INTEGRATION_STATUS[integration.status] ?? INTEGRATION_STATUS.available
            return (
              <Card key={integration.name} className="flex flex-col gap-3 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="flex flex-shrink-0 rounded-[10px] bg-[rgba(10,94,215,.09)] p-2.5 text-salis-blue">
                    <Icon name={integration.icon} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-[15px] font-bold text-heading">
                      {rtl ? integration.ar : integration.name}
                    </h3>
                    <p className="text-xs text-muted">{t(integration.cat)}</p>
                  </div>
                  <Badge background={bg} color={fg}>
                    {t(integration.status[0].toUpperCase() + integration.status.slice(1))}
                  </Badge>
                </div>
              </Card>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <>
      <FeatureHeader
        icon="Plug"
        title={t('Integrations')}
        subtitle={t('Connected systems and available connectors')}
      />
      <StatRow
        stats={[
          {
            label: 'Connected',
            value: integrations.filter((i) => i.status === 'connected').length,
            caption: 'Live',
            highlight: true,
          },
          {
            label: 'Pending',
            value: integrations.filter((i) => i.status === 'pending').length,
            caption: 'Setup incomplete',
            tone: 'warning',
          },
          {
            label: 'Available',
            value: integrations.filter((i) => i.status === 'available').length,
            caption: 'Not connected',
            tone: 'info',
          },
          { label: 'Categories', value: categories.length - 1, caption: 'Types' },
        ]}
      />

      <div role="tablist" aria-label={t('Category')} className="flex flex-wrap gap-2">
        {categories.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={category === option}
            onClick={() => setCategory(option)}
            className={cn(
              'cursor-pointer rounded-full border px-3.5 py-1.5 font-action text-[13px] font-medium transition-all duration-150',
              category === option
                ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                : 'border-border bg-card text-muted hover:border-border-strong'
            )}
          >
            {t(option === 'all' ? 'All' : option)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((integration: Integration) => {
          const [bg, fg] = INTEGRATION_STATUS[integration.status] ?? INTEGRATION_STATUS.available
          return (
            <Card key={integration.name} className="flex flex-col gap-3 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <span className="flex flex-shrink-0 rounded-[10px] bg-[rgba(10,94,215,.09)] p-2.5 text-salis-blue">
                  <Icon name={integration.icon} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-[15px] font-bold text-heading">
                    {rtl ? integration.ar : integration.name}
                  </h3>
                  <p className="text-xs text-muted">{t(integration.cat)}</p>
                </div>
                <Badge background={bg} color={fg}>
                  {t(integration.status[0].toUpperCase() + integration.status.slice(1))}
                </Badge>
              </div>
              <p className="text-[13px] text-body">
                {rtl ? integration.ar_detail : integration.detail}
              </p>
            </Card>
          )
        })}
      </div>
    </>
  )
}
