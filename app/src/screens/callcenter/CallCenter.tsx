import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { FeatureHeader, StatRow } from '@/components/shell/FeatureScreen'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, parseSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

/** CallCenter: contact-centre agent console (`/call-center`) + call logs
 *  (`/call-center/logs`).
 *
 *  No `calls` collection exists in the repository yet, so queue entries and
 *  log rows carry call-specific content (wait time, disposition, duration)
 *  that the design invented — but every caller is a real `customers` row, so
 *  the name, phone and account history on screen are genuine, not fabricated
 *  alongside the call metadata. */

type Customer = RowOf<'customers'>

function personFor(customers: readonly Customer[], index: number): Customer {
  if (customers.length === 0) return { name: '—', phone: '', vehicles: 0, spent: 'SAR 0.00', last: '—' }
  return customers[index % customers.length]
}

function fmtDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function Pill({
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

const PRIORITY_TONE: Record<string, readonly [string, string]> = {
  vip: ['rgba(11,31,59,.12)', '#0B1F3B'],
  urgent: ['rgba(249,115,22,.12)', '#F97316'],
  normal: ['rgba(100,116,139,.1)', '#64748B'],
}

const CALL_STATUS_TONE: Record<string, readonly [string, string]> = {
  completed: ['rgba(10,94,215,.1)', '#0A5ED7'],
  missed: ['rgba(249,115,22,.1)', '#F97316'],
  voicemail: ['rgba(100,116,139,.1)', '#64748B'],
}

const DIR_ICON: Record<string, { icon: string; tone: readonly [string, string] }> = {
  in: { icon: 'PhoneIncoming', tone: ['rgba(10,94,215,.09)', '#0A5ED7'] },
  out: { icon: 'PhoneOutgoing', tone: ['rgba(11,179,255,.09)', '#0BB3FF'] },
  miss: { icon: 'PhoneMissed', tone: ['rgba(249,115,22,.09)', '#F97316'] },
}

// ── Shared demo call data ────────────────────────────────────────────────
// Design-only content (no `calls` table backs it), zipped at render time
// with real `customers` rows via personFor() for name/phone/history.

const QUEUE_META = [
  { reason: 'Asking about repair status', waitSeconds: 42, priority: 'vip' },
  { reason: 'Wants to reschedule appointment', waitSeconds: 118, priority: 'normal' },
  { reason: 'Fleet — vehicles overdue service', waitSeconds: 204, priority: 'urgent' },
  { reason: 'Invoice query', waitSeconds: 251, priority: 'normal' },
] as const

const CALL_LOG_META = [
  { direction: 'in', disposition: 'Status Enquiry', agent: 'Fatima Al-Zahrani', when: 'Today 09:14', duration: 192, status: 'completed' },
  { direction: 'out', disposition: 'Estimate approval call', agent: 'Omar Al-Ghamdi', when: 'Today 08:52', duration: 348, status: 'completed' },
  { direction: 'in', disposition: 'Fleet service overdue', agent: 'Fatima Al-Zahrani', when: 'Today 08:31', duration: 424, status: 'completed' },
  { direction: 'miss', disposition: 'No answer — callback queued', agent: '—', when: 'Today 08:12', duration: 0, status: 'missed' },
  { direction: 'in', disposition: 'Invoice Query', agent: 'Omar Al-Ghamdi', when: 'Yesterday 16:40', duration: 146, status: 'completed' },
  { direction: 'out', disposition: 'Complaint follow-up', agent: 'Fatima Al-Zahrani', when: 'Yesterday 15:02', duration: 558, status: 'completed' },
  { direction: 'in', disposition: 'Quote Requested', agent: '—', when: 'Yesterday 11:20', duration: 0, status: 'voicemail' },
  { direction: 'out', disposition: 'Appointment Booked', agent: 'Omar Al-Ghamdi', when: 'Yesterday 10:05', duration: 273, status: 'completed' },
] as const

const DISPOSITIONS = ['Status Enquiry', 'Appointment Booked', 'Quote Requested', 'Complaint', 'Invoice Query', 'Other'] as const

// ── Agent console ───────────────────────────────────────────────────────────

export function CallCenter() {
  const { t } = usePreferences()
  const { data: customers = [], isLoading } = useCollection('customers')
  const [activeIndex, setActiveIndex] = useState(0)
  const [disposition, setDisposition] = useState<string>(DISPOSITIONS[0])
  const [notes, setNotes] = useState('')

  const queue = useMemo(
    () => QUEUE_META.map((meta, index) => ({ ...meta, person: personFor(customers, index) })),
    [customers]
  )
  const active = personFor(customers, activeIndex)
  const recent = useMemo(() => CALL_LOG_META.slice(0, 3), [])

  const avgWait = queue.length ? Math.round(queue.reduce((sum, q) => sum + q.waitSeconds, 0) / queue.length) : 0
  const urgentCount = queue.filter((q) => q.priority === 'urgent').length
  const vipCount = queue.filter((q) => q.priority === 'vip').length

  if (isLoading) return <p className="text-sm text-muted">{t('Loading...')}</p>

  return (
    <>
      <FeatureHeader
        icon="Headphones"
        title={t('Agent Console')}
        subtitle={t('Live queue, active call and customer context')}
        actions={
          <Link to="/call-center/logs">
            <Button variant="outline" size="md">
              <Icon name="List" size={16} />
              {t('Call Logs')}
            </Button>
          </Link>
        }
      />

      <StatRow
        stats={[
          { label: 'In Queue', value: queue.length, caption: 'Waiting now', highlight: true },
          { label: 'Average Wait', value: fmtDuration(avgWait), caption: 'Across the queue', tone: 'info' },
          { label: 'Urgent', value: urgentCount, caption: 'Needs priority pickup', tone: 'warning' },
          { label: 'VIP Callers', value: vipCount, caption: 'Loyal accounts waiting' },
        ]}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[290px_1fr_300px]">
        <Card className="flex flex-col overflow-hidden rounded-lg">
          <div className="flex items-center gap-2 border-b border-border p-4">
            <h3 className="font-display text-sm font-bold text-heading">{t('Live Queue')}</h3>
            <Badge background="rgba(249,115,22,.1)" color="#F97316">
              {queue.length}
            </Badge>
          </div>
          <div className="flex flex-col">
            {queue.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted">{t('Nothing here yet')}</p>
            ) : (
              queue.map((entry, index) => (
                <div key={`${entry.person.phone}-${index}`} className="flex flex-col gap-2 border-b border-border p-3.5">
                  <div className="flex items-center gap-2">
                    <Icon name="Phone" size={12} className="flex-shrink-0 text-salis-blue" />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-heading">
                      {entry.person.name}
                    </span>
                    <span className="flex-shrink-0 font-mono text-[11px] text-salis-blue" dir="ltr">
                      {fmtDuration(entry.waitSeconds)}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-muted">{t(entry.reason)}</p>
                  <div className="flex items-center gap-2">
                    <Pill value={entry.priority} palette={PRIORITY_TONE} />
                    <span className="flex-1" />
                    <Button size="sm" onClick={() => setActiveIndex(index)}>
                      {t('Answer')}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <div className="rounded-lg bg-salis-gradient p-5 text-white shadow-[0_12px_28px_rgba(10,94,215,.28)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-[17px] font-bold">
                {active.name.trim()[0] || '?'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-bold">{active.name}</p>
                <p className="font-mono text-xs opacity-85" dir="ltr">
                  {active.phone}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {(
                [
                  ['MicOff', 'Mute'],
                  ['Pause', 'Hold'],
                  ['ArrowRightLeft', 'Transfer'],
                  ['Users', 'Conference'],
                  ['PhoneOff', 'End'],
                ] as const
              ).map(([icon, label]) => (
                <button
                  key={icon}
                  type="button"
                  aria-label={t(label)}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1 rounded-[10px] border border-white/25 py-2.5 text-white',
                    icon === 'PhoneOff' ? 'bg-salis-orange' : 'bg-white/15'
                  )}
                >
                  <Icon name={icon} size={15} />
                </button>
              ))}
            </div>
          </div>

          <Card className="rounded-lg p-5">
            <h3 className="mb-3.5 font-display text-sm font-bold text-heading">{t('Call Disposition')}</h3>
            <div className="mb-3.5 flex flex-wrap gap-2">
              {DISPOSITIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDisposition(option)}
                  className={cn(
                    'cursor-pointer rounded border px-3 py-1.5 font-action text-xs font-medium transition-colors',
                    disposition === option
                      ? 'border-salis-blue bg-[rgba(10,94,215,.1)] text-salis-blue'
                      : 'border-border bg-inset text-body'
                  )}
                >
                  {t(option)}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t('What did the customer need, and what did you do?')}
              className="w-full resize-y rounded-lg border border-border bg-inset p-3 text-[13px] text-heading outline-none focus:border-salis-blue"
            />
            <div className="mt-3.5 flex justify-end gap-2">
              <Button variant="primary" size="md">
                <Icon name="ClipboardPlus" size={15} />
                {t('Save & Wrap Up')}
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card className="rounded-lg p-4">
            <h3 className="mb-3 font-display text-sm font-bold text-heading">{t('Customer Context')}</h3>
            <div className="flex flex-col gap-2.5">
              <MobileCardRow label={t('Vehicles')}>{active.vehicles}</MobileCardRow>
              <MobileCardRow label={t('Lifetime Value')}>
                <Money sar={parseSar(active.spent)} className="font-semibold text-heading" />
              </MobileCardRow>
              <MobileCardRow label={t('Last Visit')}>{t(active.last)}</MobileCardRow>
            </div>
          </Card>
          <Card className="rounded-lg p-4">
            <h3 className="mb-3 font-display text-sm font-bold text-heading">{t('Recent Calls')}</h3>
            <div className="flex flex-col gap-3">
              {recent.map((call, index) => {
                const dir = DIR_ICON[call.direction]
                return (
                  <div key={index} className="flex items-center gap-2.5">
                    <span
                      className="flex flex-shrink-0 rounded-lg p-1.5"
                      style={{ background: dir.tone[0], color: dir.tone[1] }}
                    >
                      <Icon name={dir.icon} size={12} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-heading">{t(call.disposition)}</p>
                      <p className="text-[10px] text-muted">
                        <span dir="ltr">{call.when}</span> · {t(call.agent)}
                      </p>
                    </div>
                    <span className="flex-shrink-0 font-mono text-[11px] text-muted" dir="ltr">
                      {fmtDuration(call.duration)}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

// ── Call logs ────────────────────────────────────────────────────────────────

type CallLogRow = (typeof CALL_LOG_META)[number] & { person: Customer }
type LogFilter = 'all' | 'in' | 'out' | 'miss' | 'voicemail'

export function CallCenterLogs() {
  const { t } = usePreferences()
  const { can } = useSession()
  const { data: customers = [], isLoading } = useCollection('customers')
  const [filter, setFilter] = useState<LogFilter>('all')

  const rows: CallLogRow[] = useMemo(
    () => CALL_LOG_META.map((meta, index) => ({ ...meta, person: personFor(customers, index) })),
    [customers]
  )

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? rows
        : rows.filter((r) => (filter === 'voicemail' ? r.status === 'voicemail' : r.direction === filter)),
    [rows, filter]
  )

  const completedCalls = rows.filter((r) => r.status === 'completed')
  const missedCount = rows.filter((r) => r.status === 'missed').length
  const avgDuration = completedCalls.length
    ? Math.round(completedCalls.reduce((sum, r) => sum + r.duration, 0) / completedCalls.length)
    : 0

  const tabs: { id: LogFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: rows.length },
    { id: 'in', label: 'Inbound', count: rows.filter((r) => r.direction === 'in').length },
    { id: 'out', label: 'Outbound', count: rows.filter((r) => r.direction === 'out').length },
    { id: 'miss', label: 'Missed', count: rows.filter((r) => r.direction === 'miss').length },
    { id: 'voicemail', label: 'Voicemail', count: rows.filter((r) => r.status === 'voicemail').length },
  ]

  const columns: Column<CallLogRow>[] = [
    {
      header: '',
      cell: (r) => {
        const dir = DIR_ICON[r.direction]
        return (
          <span className="inline-flex rounded-lg p-1.5" style={{ background: dir.tone[0], color: dir.tone[1] }}>
            <Icon name={dir.icon} size={13} />
          </span>
        )
      },
    },
    {
      header: 'Customer',
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-heading">{r.person.name}</p>
          <p className="font-mono text-[11px] text-muted" dir="ltr">
            {r.person.phone}
          </p>
        </div>
      ),
    },
    { header: 'Disposition', cell: (r) => t(r.disposition) },
    { header: 'Agent', cell: (r) => (r.agent === '—' ? '—' : t(r.agent)) },
    {
      header: 'When',
      cell: (r) => (
        <span dir="ltr" className="text-muted">
          {r.when}
        </span>
      ),
    },
    {
      header: 'Duration',
      cell: (r) => (
        <span className="font-mono" dir="ltr">
          {fmtDuration(r.duration)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Pill value={r.status} palette={CALL_STATUS_TONE} />
          {r.status === 'completed' ? (
            <button
              type="button"
              aria-label={t('Play recording')}
              className="flex h-[26px] w-[26px] flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-[rgba(10,94,215,.07)] text-salis-blue"
            >
              <Icon name="Play" size={12} />
            </button>
          ) : null}
        </div>
      ),
    },
  ]

  if (isLoading) return <p className="text-sm text-muted">{t('Loading...')}</p>

  return (
    <>
      <FeatureHeader
        icon="List"
        title={t('Call Logs')}
        subtitle={t('Every inbound and outbound call with disposition and recording')}
        actions={
          <>
            <Link to="/call-center">
              <Button variant="outline" size="md">
                <Icon name="Headphones" size={16} />
                {t('Agent Console')}
              </Button>
            </Link>
            {can('callcenter', 'x') ? (
              <Button variant="outline" size="md">
                <Icon name="Download" size={15} />
                {t('Export')}
              </Button>
            ) : null}
          </>
        }
      />

      <StatRow
        stats={[
          { label: 'Total Calls', value: rows.length, caption: 'All directions', highlight: true },
          { label: 'Completed', value: completedCalls.length, caption: 'Reached a person', tone: 'info' },
          { label: 'Missed', value: missedCount, caption: 'No answer', tone: 'warning' },
          { label: 'Avg Duration', value: fmtDuration(avgDuration), caption: 'Completed calls' },
        ]}
      />

      <div role="tablist" aria-label={t('Direction')} className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={filter === tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5',
              'font-action text-[13px] font-medium transition-all duration-150',
              filter === tab.id
                ? 'border-salis-blue bg-[rgba(10,94,215,.08)] text-salis-blue'
                : 'border-border bg-card text-muted hover:border-border-strong'
            )}
          >
            {t(tab.label)}
            <span className="font-mono text-[11px] opacity-70" dir="ltr">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r, index) => `${r.person.phone}-${index}`}
        mobileCard={(r) => {
          const dir = DIR_ICON[r.direction]
          return (
            <>
              <MobileCardHeader
                title={r.person.name}
                trailing={
                  <span className="flex rounded-lg p-1.5" style={{ background: dir.tone[0], color: dir.tone[1] }}>
                    <Icon name={dir.icon} size={13} />
                  </span>
                }
              />
              <MobileCardRow label={t('Phone')}>
                <span dir="ltr">{r.person.phone}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Disposition')}>{t(r.disposition)}</MobileCardRow>
              <MobileCardRow label={t('Agent')}>{r.agent === '—' ? '—' : t(r.agent)}</MobileCardRow>
              <MobileCardRow label={t('Duration')}>
                <span className="font-mono" dir="ltr">
                  {fmtDuration(r.duration)}
                </span>
              </MobileCardRow>
              <Pill value={r.status} palette={CALL_STATUS_TONE} />
            </>
          )
        }}
        empty={<EmptyState icon="PhoneCall" title={t('No calls in this view')} />}
      />
    </>
  )
}
