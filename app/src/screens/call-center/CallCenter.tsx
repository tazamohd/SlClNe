import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { isLive } from '@/data/repository'

/* ---------- types ---------- */

interface Kpi {
  icon: string
  label: string
  value: string
  sub: string
  subColor: string
  iconBg: string
  iconColor: string
}

interface QueueItem {
  name: string
  reason: string
  wait: string
  priority: string
  channel: 'phone' | 'chat'
  priorityTone: 'blue' | 'orange' | 'slate'
  slaWarn: boolean
}

interface CustomerCtx {
  icon: string
  label: string
  value: string
  iconBg: string
  iconColor: string
}

interface OpenItem {
  id: string
  what: string
  status: string
  statusTone: 'blue' | 'orange'
}

interface RecentCall {
  reason: string
  when: string
  agent: string
  dur: string
  direction: 'in' | 'out'
}

type DispositionKey = 'status' | 'book' | 'quote' | 'complaint' | 'invoice' | 'other'

/* ---------- fixture data ---------- */

const FIXTURE_KPIS: Kpi[] = [
  { icon: 'PhoneCall', label: 'Calls Today', value: '34', iconBg: 'rgba(10,94,215,.09)', iconColor: 'var(--salis-blue)', sub: '28 inbound / 6 outbound', subColor: 'var(--text-muted)' },
  { icon: 'Timer', label: 'Avg Handle Time', value: '4:12', iconBg: 'rgba(11,179,255,.09)', iconColor: 'var(--salis-blue-bright)', sub: '-0:18 vs Last Period', subColor: 'var(--salis-blue)' },
  { icon: 'Gauge', label: 'Service Level', value: '92%', iconBg: 'rgba(11,31,59,.09)', iconColor: 'var(--salis-navy)', sub: 'answered within 30s', subColor: 'var(--text-muted)' },
  { icon: 'PhoneMissed', label: 'Abandoned', value: '3.1%', iconBg: 'rgba(249,115,22,.09)', iconColor: 'var(--salis-orange)', sub: 'target under 5%', subColor: 'var(--text-muted)' },
]

const FIXTURE_QUEUE: QueueItem[] = [
  { name: 'Layla Al-Sulaiman', reason: 'Asking about repair status', wait: '0:42', priority: 'VIP', channel: 'phone', priorityTone: 'blue', slaWarn: false },
  { name: 'Mohammed Hassan', reason: 'Wants to reschedule appointment', wait: '1:58', priority: 'Normal', channel: 'phone', priorityTone: 'slate', slaWarn: false },
  { name: 'Gulf Transport Co.', reason: 'Fleet — 3 vehicles overdue service', wait: '3:24', priority: 'Urgent', channel: 'phone', priorityTone: 'orange', slaWarn: true },
  { name: 'Sara Al-Mutairi', reason: 'Invoice query', wait: '4:11', priority: 'Normal', channel: 'chat', priorityTone: 'slate', slaWarn: true },
]

const FIXTURE_CTX: CustomerCtx[] = [
  { label: 'Customer Since', value: 'Mar 2023 · Loyal', icon: 'UserCheck', iconBg: 'rgba(10,94,215,.09)', iconColor: 'var(--salis-blue)' },
  { label: 'Vehicles', value: 'Toyota Camry, Nissan Patrol', icon: 'Car', iconBg: 'rgba(11,179,255,.09)', iconColor: 'var(--salis-blue-bright)' },
  { label: 'Lifetime Value', value: 'SAR 48,200', icon: 'Banknote', iconBg: 'rgba(11,31,59,.09)', iconColor: 'var(--salis-navy)' },
  { label: 'Satisfaction', value: '4.8 / 5 · 6 reviews', icon: 'Star', iconBg: 'rgba(249,115,22,.09)', iconColor: 'var(--salis-orange)' },
]

const FIXTURE_OPEN: OpenItem[] = [
  { id: 'JC-A3F8B2C1', what: 'Toyota Camry — maintenance, in QC', status: 'In Progress', statusTone: 'blue' },
  { id: 'INV-2026-0142', what: 'SAR 1,840 — awaiting payment', status: 'Pending', statusTone: 'orange' },
  { id: 'APT-0318', what: 'Oil change — Jul 25, 10:00', status: 'Confirmed', statusTone: 'blue' },
]

const FIXTURE_RECENT: RecentCall[] = [
  { reason: 'Repair status update', when: 'Jul 22', agent: 'Fatima', dur: '3:12', direction: 'in' },
  { reason: 'Estimate approval call', when: 'Jul 21', agent: 'Omar', dur: '5:48', direction: 'out' },
  { reason: 'Appointment confirmation', when: 'Jul 18', agent: 'Fatima', dur: '1:34', direction: 'out' },
]

const DISPOSITIONS: { key: DispositionKey; label: string }[] = [
  { key: 'status', label: 'Status Enquiry' },
  { key: 'book', label: 'Appointment Booked' },
  { key: 'quote', label: 'Quote Requested' },
  { key: 'complaint', label: 'Complaint' },
  { key: 'invoice', label: 'Invoice Query' },
  { key: 'other', label: 'Other' },
]

/* ---------- palette helpers ---------- */

const PRIORITY_TONES: Record<string, [string, string]> = {
  blue: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  orange: ['rgba(249,115,22,.14)', 'var(--salis-orange)'],
  slate: ['rgba(100,116,139,.1)', 'var(--text-muted)'],
}

const STATUS_TONES: Record<string, [string, string]> = {
  blue: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  orange: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
}

/* ---------- component ---------- */

export function CallCenter() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [disposition, setDisposition] = useState<DispositionKey>('status')

  return (
    <div className="flex animate-fade-up flex-col gap-5 motion-reduce:animate-none">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_16px_22px_-6px_rgba(10,94,215,.25)]">
            <Icon name="Headphones" size={24} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading">{t('Agent Console')}</h1>
            <p className="mt-0.5 text-sm text-muted">{t('Live queue, active call and customer context')}</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className={isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-4'}>
        {FIXTURE_KPIS.map((k) => (
          <Card key={k.icon} className="p-4">
            <div className="flex items-center gap-2">
              <span
                className="flex flex-shrink-0 rounded-[10px] p-2"
                style={{ background: k.iconBg, color: k.iconColor }}
              >
                <Icon name={k.icon} size={16} />
              </span>
              <span className="text-xs font-medium text-muted">{t(k.label)}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading" dir="ltr">{k.value}</h4>
            <p className="mt-1 text-[11px]" style={{ color: k.subColor }}>{t(k.sub)}</p>
          </Card>
        ))}
      </div>

      {/* Main 3-column layout */}
      <div className={isMobile ? 'flex flex-col gap-5' : 'grid grid-cols-[290px_1fr_320px] items-start gap-5'}>
        {/* Left — Live Queue */}
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <h3 className="text-sm font-bold text-heading">{t('Live Queue')}</h3>
            <Badge background="rgba(249,115,22,.1)" color="var(--salis-orange)">
              {FIXTURE_QUEUE.length}
            </Badge>
          </div>
          {FIXTURE_QUEUE.length === 0 ? (
            <div className="p-4">
              <EmptyState icon="PhoneOff" title={t('Queue is empty')} description={t('No callers are waiting.')} />
            </div>
          ) : (
            FIXTURE_QUEUE.map((q) => {
              const [prBg, prFg] = PRIORITY_TONES[q.priorityTone]
              return (
                <div
                  key={q.name}
                  className="flex flex-col gap-1.5 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-[rgba(10,94,215,.03)]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex flex-shrink-0 rounded-[10px] p-2"
                      style={{
                        background: q.channel === 'phone' ? 'rgba(10,94,215,.09)' : 'rgba(11,179,255,.09)',
                        color: q.channel === 'phone' ? 'var(--salis-blue)' : 'var(--salis-blue-bright)',
                      }}
                    >
                      <Icon name={q.channel === 'phone' ? 'Phone' : 'MessageCircle'} size={12} />
                    </span>
                    <span className="flex-1 truncate text-[13px] font-semibold text-heading">{q.name}</span>
                    <Badge
                      background={q.slaWarn ? 'rgba(249,115,22,.12)' : 'rgba(10,94,215,.1)'}
                      color={q.slaWarn ? 'var(--salis-orange)' : 'var(--salis-blue)'}
                    >
                      {q.wait}
                    </Badge>
                  </div>
                  <p className="m-0 truncate text-[11px] text-muted">{t(q.reason)}</p>
                  <div className="flex items-center gap-1.5">
                    <Badge background={prBg} color={prFg}>{t(q.priority)}</Badge>
                    <span className="flex-1" />
                    <Button size="sm" disabled={!isLive} aria-label={t('Answer call from') + ' ' + q.name}>
                      {t('Answer')}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </Card>

        {/* Centre — Active Call + Disposition */}
        <div className="flex flex-col gap-5">
          {/* Active call card */}
          <div className="overflow-hidden rounded-2xl bg-salis-gradient p-5 text-white shadow-[0_12px_28px_rgba(10,94,215,.28)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-[17px] font-extrabold">
                A
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-[17px] font-extrabold">Ahmed Al-Rashid</p>
                <p className="m-0 mt-0.5 font-mono text-xs opacity-85" dir="ltr">+966 55 210 4471</p>
              </div>
              <div className="text-end">
                <p className="m-0 text-[11px] opacity-80">{t('Duration')}</p>
                <p className="m-0 mt-0.5 font-mono text-xl font-extrabold" dir="ltr">04:32</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[
                { icon: 'MicOff', label: t('Mute') },
                { icon: 'Pause', label: t('Hold') },
                { icon: 'ArrowRightLeft', label: t('Transfer') },
                { icon: 'Users', label: t('Conference') },
              ].map((c) => (
                <button
                  key={c.icon}
                  type="button"
                  disabled={!isLive}
                  className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-[10px] border border-white/25 bg-white/15 px-0 py-2.5 text-white disabled:cursor-default disabled:opacity-60"
                  aria-label={c.label}
                >
                  <Icon name={c.icon} size={15} />
                  <span className="text-[11px] font-semibold">{c.label}</span>
                </button>
              ))}
              <button
                type="button"
                disabled={!isLive}
                className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-[10px] border-none bg-salis-orange px-0 py-2.5 text-white disabled:cursor-default disabled:opacity-60"
                aria-label={t('End Call')}
              >
                <Icon name="PhoneOff" size={15} />
                <span className="text-[11px] font-semibold">{t('End')}</span>
              </button>
            </div>
          </div>

          {/* Disposition */}
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-bold text-heading">{t('Call Disposition')}</h3>
            <div className="mb-3 flex flex-wrap gap-2">
              {DISPOSITIONS.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDisposition(d.key)}
                  className={
                    'h-[30px] cursor-pointer rounded-lg px-3 font-action text-xs font-medium ' +
                    (disposition === d.key
                      ? 'border-[1.5px] border-salis-blue bg-[rgba(10,94,215,.1)] text-salis-blue'
                      : 'border border-border bg-inset text-body')
                  }
                >
                  {t(d.label)}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              placeholder={t('What did the customer need, and what did you do?')}
              aria-label={t('Call notes')}
              className="w-full resize-vertical rounded-[9px] border border-border bg-inset px-3 py-2.5 font-ui text-[13px] text-primary outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" disabled={!isLive}>
                <Icon name="CalendarPlus" size={15} />
                {t('Book Appointment')}
              </Button>
              <Button variant="outline" disabled={!isLive}>
                <Icon name="ClipboardPlus" size={15} />
                {t('New Job Card')}
              </Button>
              <span className="flex-1" />
              <Button disabled={!isLive}>{t('Save & Wrap Up')}</Button>
            </div>
          </Card>
        </div>

        {/* Right — Customer Context, Open Items, Recent */}
        <div className="flex flex-col gap-5">
          {/* Customer Context */}
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-bold text-heading">{t('Customer Context')}</h3>
            <div className="flex flex-col gap-2.5">
              {FIXTURE_CTX.map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <span
                    className="flex flex-shrink-0 rounded-[10px] p-2"
                    style={{ background: c.iconBg, color: c.iconColor }}
                  >
                    <Icon name={c.icon} size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[10px] text-muted">{t(c.label)}</p>
                    <p className="m-0 truncate text-xs font-semibold text-heading">{t(c.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Open Items */}
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-bold text-heading">{t('Open Items')}</h3>
            <div className="flex flex-col gap-2">
              {FIXTURE_OPEN.map((o) => {
                const [stBg, stFg] = STATUS_TONES[o.statusTone]
                return (
                  <div key={o.id} className="rounded-[10px] border border-border bg-inset p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-salis-blue" dir="ltr">{o.id}</span>
                      <span className="flex-1" />
                      <Badge background={stBg} color={stFg}>{t(o.status)}</Badge>
                    </div>
                    <p className="m-0 text-xs text-body">{t(o.what)}</p>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Recent Calls */}
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-bold text-heading">{t('Recent Calls')}</h3>
            <div className="flex flex-col gap-2.5">
              {FIXTURE_RECENT.map((r) => (
                <div key={r.reason + r.when} className="flex items-center gap-2">
                  <span
                    className="flex flex-shrink-0 rounded-[10px] p-2"
                    style={{
                      background: r.direction === 'in' ? 'rgba(10,94,215,.09)' : 'rgba(11,179,255,.09)',
                      color: r.direction === 'in' ? 'var(--salis-blue)' : 'var(--salis-blue-bright)',
                    }}
                  >
                    <Icon name={r.direction === 'in' ? 'PhoneIncoming' : 'PhoneOutgoing'} size={12} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-xs text-heading">{t(r.reason)}</p>
                    <p className="m-0 mt-0.5 text-[10px] text-muted">{r.when} &middot; {r.agent}</p>
                  </div>
                  <span className="font-mono text-[11px] text-muted" dir="ltr">{r.dur}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
