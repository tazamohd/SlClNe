import { useMemo, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/DataTable'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useIsMobile } from '@/lib/useMediaQuery'

/** Audit Log (AuditLog.dc.html): a running timeline of who did what, when and
 *  from where, filterable by Auth/Data/System and paged with Load More.
 *
 *  There is no `auditEvents` collection in the repository yet — when the REST
 *  layer lands, `EVENTS` below becomes a `useCollection('auditEvents')` read
 *  and only this const moves; the filter/paging/export logic is unaffected.
 *
 *  `AuditLog.Mobile.dc.html` ships a different filter taxonomy
 *  (create/update/delete/auth) and a different demo dataset than the desktop
 *  original. Per the brief the desktop file is authoritative for content, so
 *  only the mobile file's *layout* is borrowed here — stacked cards and a
 *  pill-tab row that scrolls on its own axis — while the events and the
 *  Auth/Data/System categories stay the desktop ones.
 *
 *  Export is an execute-class action, gated on `can('audit', 'x')` — owner,
 *  manager, accountant and superadmin per the RBAC matrix; anyone else sees
 *  the timeline with no Export button. It writes the *filtered* rows to a
 *  real CSV (the design's button was decorative). */

type Category = 'auth' | 'data' | 'system'
type Tone = 'blue' | 'bright' | 'slate' | 'orange'

interface AuditEvent {
  id: string
  icon: string
  /** Actor name. Proper names render as-is; `userTranslate` marks the rare
   *  case ("System") that is itself a translatable source string. */
  user: string
  userTranslate?: boolean
  /** Translatable action phrase ("logged in", "created job card"). */
  action: string
  /** Translatable detail prose. Omit when the whole line is Latin (below). */
  detail?: string
  /** Latin record fragment (job/estimate ids, transfers, emails) — always
   *  rendered dir="ltr" per the record-id/email convention. */
  detailCode?: string
  time: string
  ip: string
  category: Category
  tone: Tone
}

/** Only the four brand colours; orange is reserved for security/destructive
 *  events (README §7 / binding conventions). */
const TONE: Record<Tone, { fg: string; bg: string }> = {
  blue: { fg: '#0A5ED7', bg: 'rgba(10,94,215,.08)' },
  bright: { fg: '#0BB3FF', bg: 'rgba(11,179,255,.08)' },
  slate: { fg: '#64748B', bg: 'rgba(100,116,139,.06)' },
  orange: { fg: '#F97316', bg: 'rgba(249,115,22,.08)' },
}

/** The design's eight demo events, in order. */
const EVENTS: readonly AuditEvent[] = [
  {
    id: 'evt-1',
    icon: 'LogIn',
    user: 'Khalid Al-Amri',
    action: 'logged in',
    detail: 'New session — Chrome browser',
    time: '10:02 AM',
    ip: '192.168.1.45',
    category: 'auth',
    tone: 'blue',
  },
  {
    id: 'evt-2',
    icon: 'Plus',
    user: 'Khalid Al-Amri',
    action: 'created job card',
    detailCode: 'JC-A3F8B2C1 — Ahmed Al-Rashid · Toyota Camry',
    time: '10:15 AM',
    ip: '192.168.1.45',
    category: 'data',
    tone: 'blue',
  },
  {
    id: 'evt-3',
    icon: 'UserPlus',
    user: 'Khalid Al-Amri',
    action: 'assigned technician',
    detailCode: 'Yousef Al-Otaibi → JC-A3F8B2C1',
    time: '10:18 AM',
    ip: '192.168.1.45',
    category: 'data',
    tone: 'bright',
  },
  {
    id: 'evt-4',
    icon: 'CheckCircle',
    user: 'Yousef Al-Otaibi',
    action: 'completed inspection',
    detail: 'Multi-point inspection — 18/22 pass',
    time: '11:45 AM',
    ip: '192.168.1.102',
    category: 'data',
    tone: 'blue',
  },
  {
    id: 'evt-5',
    icon: 'Receipt',
    user: 'Khalid Al-Amri',
    action: 'created estimate',
    detailCode: 'EST-0232 — SAR 1,546.75',
    time: '12:10 PM',
    ip: '192.168.1.45',
    category: 'data',
    tone: 'blue',
  },
  {
    id: 'evt-6',
    icon: 'Send',
    user: 'System',
    userTranslate: true,
    action: 'sent estimate to customer',
    detail: 'Email to',
    detailCode: 'ahmed@email.com',
    time: '12:12 PM',
    ip: '—',
    category: 'system',
    tone: 'slate',
  },
  {
    id: 'evt-7',
    icon: 'Shield',
    user: 'Khalid Al-Amri',
    action: 'changed security settings',
    detail: 'Enabled 2FA',
    time: '1:30 PM',
    ip: '192.168.1.45',
    category: 'system',
    tone: 'orange',
  },
  {
    id: 'evt-8',
    icon: 'LogOut',
    user: 'Layla Al-Sulaiman',
    action: 'logged out',
    detail: 'Session expired',
    time: '2:00 PM',
    ip: '192.168.1.78',
    category: 'auth',
    tone: 'slate',
  },
]

const FILTERS: readonly [Category | 'all', string][] = [
  ['all', 'All'],
  ['auth', 'Auth'],
  ['data', 'Data'],
  ['system', 'System'],
]

const CATEGORY_LABEL: Record<Category, string> = { auth: 'Auth', data: 'Data', system: 'System' }

const PAGE_SIZE = 6

/** `CheckCircle` isn't in the generated icon registry (it ships ~230 of
 *  lucide's ~1500 glyphs) — pulled straight from lucide-react instead. */
function EventIcon({ name, size }: { name: string; size: number }) {
  if (name === 'CheckCircle') return <CheckCircle size={size} strokeWidth={2} aria-hidden />
  return <Icon name={name} size={size} />
}

function csvField(value: string): string {
  const escaped = value.replace(/"/g, '""')
  return /[",\r\n]/.test(value) ? `"${escaped}"` : escaped
}

export function AuditLog() {
  const { t } = usePreferences()
  const { can } = useSession()
  const toast = useToast()
  const isMobile = useIsMobile()

  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const canExport = can('audit', 'x')

  const filtered = useMemo(
    () => (filter === 'all' ? EVENTS : EVENTS.filter((event) => event.category === filter)),
    [filter]
  )
  const shown = filtered.slice(0, visible)
  const canLoadMore = visible < filtered.length

  const selectFilter = (next: Category | 'all') => {
    setFilter(next)
    setVisible(PAGE_SIZE)
  }

  const exportCsv = () => {
    const header = ['User', 'Action', 'Detail', 'Time', 'IP', 'Category'].map(t)
    const rows = filtered.map((event) => [
      event.userTranslate ? t(event.user) : event.user,
      t(event.action),
      [event.detail ? t(event.detail) : '', event.detailCode ?? ''].filter(Boolean).join(' '),
      event.time,
      event.ip,
      t(CATEGORY_LABEL[event.category]),
    ])
    const csv = [header, ...rows].map((row) => row.map(csvField).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'audit-log.csv'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    toast.show({
      title: t('Export started'),
      description: `${filtered.length} ${t('rows')} — audit-log.csv`,
    })
  }

  return (
    <div className="flex w-full max-w-[1100px] flex-col gap-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-[12px]" />
            <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="ScrollText" size={28} />
            </div>
          </div>
          <div className="min-w-0">
            <h1
              className={cn(
                'font-display font-black text-heading',
                isMobile ? 'text-xl' : 'text-[26px]'
              )}
            >
              {t('Audit Log')}
            </h1>
            <p className="mt-0.5 text-sm text-muted">{t('Track all system actions')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="tablist"
            aria-label={t('Filter')}
            className={cn(
              'flex overflow-x-auto',
              isMobile ? 'flex-1 gap-2' : 'flex-1 rounded-lg border border-border'
            )}
          >
            {FILTERS.map(([id, label]) => {
              const active = filter === id
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectFilter(id)}
                  className={cn(
                    'h-[34px] flex-shrink-0 cursor-pointer whitespace-nowrap border-none font-action text-xs font-semibold transition-colors duration-150',
                    isMobile ? 'rounded-lg px-3.5' : 'flex-1 px-3.5',
                    active
                      ? 'bg-salis-gradient text-white'
                      : cn(
                          'bg-card text-body',
                          isMobile && 'border border-border hover:border-salis-blue hover:text-salis-blue'
                        )
                  )}
                >
                  {t(label)}
                </button>
              )
            })}
          </div>

          {canExport ? (
            <Button variant="subtle" size="md" onClick={exportCsv} className="flex-shrink-0">
              <Icon name="Download" size={14} />
              {t('Export')}
            </Button>
          ) : null}
        </div>
      </div>

      {shown.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon="ScrollText"
            title={t('No matching events')}
            description={t('Nothing matches the current filter.')}
          />
        </Card>
      ) : isMobile ? (
        <div className="flex flex-col gap-3">
          {shown.map((event) => (
            <EventCard key={event.id} event={event} t={t} />
          ))}
        </div>
      ) : (
        <div className="relative flex flex-col ps-7">
          <div className="absolute bottom-0 top-0 w-0.5 bg-border" style={{ insetInlineStart: 13 }} />
          {shown.map((event) => (
            <TimelineRow key={event.id} event={event} t={t} />
          ))}
        </div>
      )}

      {canLoadMore ? (
        <div className="flex justify-center">
          <Button variant="subtle" size="md" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            {t('Load More')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

/** One detail line: translatable prose, an optional Latin record fragment
 *  (job/estimate ids, emails), or both. */
function EventDetail({ event, t }: { event: AuditEvent; t: (source: string) => string }) {
  if (!event.detail && !event.detailCode) return null
  return (
    <>
      {event.detail ? t(event.detail) : null}
      {event.detail && event.detailCode ? ' ' : null}
      {event.detailCode ? <span dir="ltr">{event.detailCode}</span> : null}
    </>
  )
}

/** Desktop row: dot on the vertical rail, icon chip, user + action, detail,
 *  and a trailing LTR-pinned time/IP column. */
function TimelineRow({ event, t }: { event: AuditEvent; t: (source: string) => string }) {
  const tone = TONE[event.tone]
  return (
    <div className="relative flex gap-4 border-b border-border py-3.5 last:border-b-0">
      <span
        className="absolute top-[19px] h-2.5 w-2.5 flex-shrink-0 rounded-full border-2 border-page"
        style={{ insetInlineStart: -15, background: tone.fg }}
      />
      <div className="flex flex-1 items-start gap-3">
        <span
          className="flex flex-shrink-0 rounded-lg p-1.5"
          style={{ background: tone.bg, color: tone.fg }}
        >
          <EventIcon name={event.icon} size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-body">
            <span className="font-semibold text-heading">
              {event.userTranslate ? t(event.user) : event.user}
            </span>{' '}
            {t(event.action)}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            <EventDetail event={event} t={t} />
          </p>
        </div>
        <div className="flex-shrink-0 text-end">
          <span className="text-[11px] text-muted" dir="ltr">
            {event.time}
          </span>
          <p className="mt-0.5 text-[10px] text-faint" dir="ltr">
            {event.ip}
          </p>
        </div>
      </div>
    </div>
  )
}

/** Mobile stacked card, per `AuditLog.Mobile.dc.html`'s layout. */
function EventCard({ event, t }: { event: AuditEvent; t: (source: string) => string }) {
  const tone = TONE[event.tone]
  return (
    <Card className="flex gap-2.5 p-3.5">
      <span
        className="flex h-fit flex-shrink-0 rounded-lg p-1.5"
        style={{ background: tone.bg, color: tone.fg }}
      >
        <EventIcon name={event.icon} size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] font-semibold text-heading">
            {event.userTranslate ? t(event.user) : event.user}
          </span>
          <span className="text-[13px] text-body">{t(event.action)}</span>
        </div>
        <p className="mt-0.5 text-xs text-body">
          <EventDetail event={event} t={t} />
        </p>
        <p className="mt-1.5 text-[11px] text-faint">
          <span dir="ltr">{event.time}</span>
          {' · '}
          <span dir="ltr">{event.ip}</span>
        </p>
      </div>
    </Card>
  )
}
