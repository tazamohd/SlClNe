import { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { cn } from '@/lib/cn'

/** NotificationCenter (`project/NotificationCenter.dc.html`,
 *  `.Mobile.dc.html`): the admin notification feed — job, appointment, alert
 *  and finance events with read/unread state and an All / Unread / Alerts
 *  filter.
 *
 *  There is no `notifications` collection in the repository yet (`gms-data.js`
 *  carries none) — the 8 rows below are the design's fixture data, typed as
 *  the future `GET /notifications` read. Read state (`readSet`) is local UI
 *  state, same as the prototype: the mock repository has no write path to
 *  persist "read" back to a server. */

type NotifCategory = 'jobs' | 'appointments' | 'alerts' | 'finance'
type NotifTone = 'blue' | 'bright' | 'orange'
type Filter = 'all' | 'unread' | 'alerts'

/** A run of a notification's body/time text. `latin` pins fixed Latin content
 *  (job/invoice/estimate ids, names, amounts, dates) `dir="ltr"` so Arabic
 *  bidi can't reorder it. `label` is an English source string translated via
 *  t() and left to flow with the paragraph's own direction. Segmenting is
 *  what lets a single line mix "Ahmed Al-Rashid — <Arabic word> · Jul 23" and
 *  still read correctly under RTL. */
type Segment = { latin: string } | { label: string }

interface NotificationItem {
  id: number
  icon: string
  /** English source, translated via t(). */
  title: string
  body: readonly Segment[]
  time: readonly Segment[]
  category: NotifCategory
  /** Row tone — independent of category (e.g. "Vehicle Ready" is a jobs
   *  notification but ships the design's bright-blue tone). Drives both the
   *  icon chip and the category pill. */
  tone: NotifTone
  /** Unread in the design's fixture; overridden by `readSet` once clicked or
   *  "Mark All Read" runs. */
  unread: boolean
}

const CATEGORY_LABEL: Record<NotifCategory, string> = {
  jobs: 'Job Cards',
  appointments: 'Appointments',
  alerts: 'Alerts',
  finance: 'Finance',
}

/** Blue = unread/info, bright-blue is the design's second row tint, orange is
 *  alerts. Never green/red/yellow/purple/pink/teal (README §7). */
const TONE: Record<NotifTone, { bg: string; fg: string }> = {
  blue: { bg: 'rgba(10,94,215,.1)', fg: '#0A5ED7' },
  bright: { bg: 'rgba(11,179,255,.1)', fg: '#0BB3FF' },
  orange: { bg: 'rgba(249,115,22,.1)', fg: '#F97316' },
}

const FILTERS: readonly [Filter, string][] = [
  ['all', 'All Notifications'],
  ['unread', 'Unread'],
  ['alerts', 'Alerts'],
]

const NOTIFICATIONS: readonly NotificationItem[] = [
  {
    id: 1,
    icon: 'Wrench',
    title: 'New Job Card Created',
    body: [{ latin: 'JC-E5D7A3B5 — Sara Al-Mutairi · Ford Explorer 2022' }],
    time: [{ label: 'just now' }],
    category: 'jobs',
    tone: 'blue',
    unread: true,
  },
  {
    id: 2,
    icon: 'Calendar',
    title: 'Appointment Confirmed',
    body: [
      { latin: 'Ahmed Al-Rashid — ' },
      { label: 'Maintenance' },
      { latin: ' · Jul 23, 9:00 AM' },
    ],
    time: [{ latin: '5 ' }, { label: 'minutes ago' }],
    category: 'appointments',
    tone: 'bright',
    unread: true,
  },
  {
    id: 3,
    icon: 'AlertTriangle',
    title: 'Invoice Overdue',
    body: [{ latin: 'INV-2026-0141 — Fatima Al-Zahrani · SAR 4,250' }],
    time: [{ latin: '2 ' }, { label: 'hours ago' }],
    category: 'alerts',
    tone: 'orange',
    unread: true,
  },
  {
    id: 4,
    icon: 'Package',
    title: 'Low Stock Alert',
    body: [{ label: 'Brake Pads (Front)' }, { latin: ' — 18/25 ' }, { label: 'In Stock' }],
    time: [{ latin: '3 ' }, { label: 'hours ago' }],
    category: 'alerts',
    tone: 'orange',
    unread: true,
  },
  {
    id: 5,
    icon: 'CreditCard',
    title: 'Payment Received',
    body: [{ latin: 'INV-2026-0140 — Omar Al-Ghamdi · SAR 620' }],
    time: [{ label: 'yesterday' }],
    category: 'finance',
    tone: 'blue',
    unread: false,
  },
  {
    id: 6,
    icon: 'FileCheck',
    title: 'Estimate Approved',
    body: [{ latin: 'EST-0230 — Mohammed Hassan · SAR 3,600' }],
    time: [{ label: 'yesterday' }],
    category: 'jobs',
    tone: 'blue',
    unread: false,
  },
  {
    id: 7,
    icon: 'ShieldCheck',
    title: 'QC Passed',
    body: [{ latin: 'JC-C2A9F4E3 — Omar Al-Ghamdi · Hyundai Sonata 2023' }],
    time: [{ latin: '2 ' }, { label: 'days ago' }],
    category: 'jobs',
    tone: 'blue',
    unread: false,
  },
  {
    id: 8,
    icon: 'Car',
    title: 'Vehicle Ready',
    body: [{ latin: 'JC-A3F8B2C1 — Ahmed Al-Rashid · Toyota Camry 2022' }],
    time: [{ latin: '2 ' }, { label: 'days ago' }],
    category: 'jobs',
    tone: 'bright',
    unread: false,
  },
]

/** Renders a segment list, translating `label` runs and bidi-isolating
 *  `latin` runs. */
function Segments({
  segments,
  t,
}: {
  segments: readonly Segment[]
  t: (source: string) => string
}) {
  return (
    <>
      {segments.map((seg, i) =>
        'latin' in seg ? (
          <span key={i} dir="ltr">
            {seg.latin}
          </span>
        ) : (
          <span key={i}>{t(seg.label)}</span>
        )
      )}
    </>
  )
}

/** AlertTriangle has no entry in the generated icon registry (the design
 *  bundle never referenced it before this screen), so it's imported directly
 *  from lucide-react rather than looked up by name. */
function NotifIcon({ name, size, color }: { name: string; size: number; color: string }) {
  if (name === 'AlertTriangle') {
    return <AlertTriangle size={size} strokeWidth={2} aria-hidden style={{ color }} />
  }
  return <Icon name={name} size={size} style={{ color }} />
}

export function NotificationCenter() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [filter, setFilter] = useState<Filter>('all')
  const [readSet, setReadSet] = useState<Record<number, boolean>>({})

  const isUnread = (item: NotificationItem) => item.unread && !readSet[item.id]

  const unreadCount = useMemo(() => NOTIFICATIONS.filter(isUnread).length, [readSet])

  const filtered = useMemo(() => {
    if (filter === 'unread') return NOTIFICATIONS.filter(isUnread)
    // Alerts is a category filter — it shows every alert regardless of read
    // state, unlike Unread.
    if (filter === 'alerts') return NOTIFICATIONS.filter((n) => n.category === 'alerts')
    return NOTIFICATIONS
  }, [filter, readSet])

  const markRead = (id: number) => setReadSet((prev) => ({ ...prev, [id]: true }))

  const markAllRead = () => {
    const next: Record<number, boolean> = {}
    for (const item of NOTIFICATIONS) next[item.id] = true
    setReadSet(next)
  }

  return (
    <div className="flex w-full max-w-[800px] flex-col gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-md" aria-hidden />
            <div
              className={cn(
                'relative flex rounded-2xl bg-salis-gradient text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]',
                isMobile ? 'p-2.5' : 'p-3'
              )}
            >
              <Icon name="Bell" size={isMobile ? 22 : 28} />
            </div>
          </div>
          <div>
            <h1
              className={cn(
                'font-display font-black text-heading',
                isMobile ? 'text-xl' : 'text-[26px]'
              )}
            >
              {t('Notification Center')}
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              {unreadCount} {t('Unread')}
            </p>
          </div>
        </div>

        <div className="flex-1" />

        <div
          role="tablist"
          aria-label={t('Filter')}
          className={cn(
            'flex flex-shrink-0 overflow-x-auto',
            isMobile ? 'gap-1.5' : 'rounded-lg border border-border'
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
                onClick={() => setFilter(id)}
                className={cn(
                  'flex-shrink-0 cursor-pointer whitespace-nowrap border-none font-action text-xs font-semibold transition-colors duration-150',
                  isMobile ? 'h-11 rounded-lg px-3.5' : 'h-[34px] px-3.5',
                  active
                    ? 'bg-salis-gradient text-white'
                    : 'bg-card text-body hover:bg-[rgba(10,94,215,.06)]'
                )}
              >
                {t(label)}
              </button>
            )
          })}
        </div>

        <Button variant="subtle" size="md" onClick={markAllRead}>
          <Icon name="CheckCheck" size={14} />
          {t('Mark All Read')}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon="CheckCheck"
            title={t('All caught up')}
            description={t('You have no unread notifications.')}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex flex-col">
            {filtered.map((item) => {
              const unread = isUnread(item)
              const tone = TONE[item.tone]
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markRead(item.id)}
                  className={cn(
                    'flex w-full gap-3.5 border-b border-border p-4 text-start last:border-b-0',
                    'cursor-pointer border-x-0 border-t-0 bg-transparent transition-colors duration-150 hover:bg-[rgba(10,94,215,.03)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-inset',
                    unread && 'bg-[rgba(10,94,215,.03)]'
                  )}
                >
                  <span
                    className="flex flex-shrink-0 rounded-xl p-2.5"
                    style={{ background: tone.bg }}
                  >
                    <NotifIcon name={item.icon} size={isMobile ? 16 : 18} color={tone.fg} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          'font-semibold text-heading',
                          isMobile ? 'truncate text-[13px]' : 'text-sm'
                        )}
                      >
                        {t(item.title)}
                      </p>
                      {unread ? (
                        <>
                          <span
                            aria-hidden
                            className="h-2 w-2 flex-shrink-0 rounded-full bg-salis-blue"
                          />
                          <span className="sr-only">{t('Unread')}</span>
                        </>
                      ) : null}
                    </div>
                    <p
                      className={cn(
                        'mt-1 text-[13px] leading-relaxed text-body',
                        isMobile && 'line-clamp-2'
                      )}
                    >
                      <Segments segments={item.body} t={t} />
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[11px] text-muted">
                        <Segments segments={item.time} t={t} />
                      </span>
                      <Badge background={tone.bg} color={tone.fg}>
                        {t(CATEGORY_LABEL[item.category])}
                      </Badge>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
