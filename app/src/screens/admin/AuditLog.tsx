import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { cn } from '@/lib/cn'
import { useDateFormat } from '@/lib/formatDate'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

/** The audit trail, as a timeline grouped by day.
 *
 *  The trail is recorded server-side; the fixture build shows a seeded sample
 *  behind a "Demo data" banner rather than an empty page, so the search, the
 *  category chips and the export can all be exercised. Export is real in both
 *  modes — it writes the entries currently shown to a CSV file on the client.
 *
 *  IPs and record ids are Latin runs and stay LTR under Arabic; times and day
 *  headings come from `useDateFormat`, never a hard-coded locale. */
type FilterKey = 'all' | 'auth' | 'data' | 'system'
type Tone = 'blue' | 'bright' | 'orange' | 'muted'

interface AuditEntry {
  id: string
  icon: string
  user: string
  /** English source string, translated at render. */
  action: string
  /** Free text: ids, names and amounts — shown verbatim. */
  detail: string
  /** ISO timestamp. */
  at: string
  ip: string
  cat: FilterKey
  tone: Tone
}

const FILTERS: readonly { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'auth', label: 'Auth' },
  { key: 'data', label: 'Data' },
  { key: 'system', label: 'System' },
]

const TONE_CHIP: Record<Tone, string> = {
  blue: 'bg-tint-blue text-salis-blue',
  bright: 'bg-tint-bright text-salis-bright',
  orange: 'bg-tint-orange text-salis-orange',
  muted: 'bg-inset text-muted',
}

const TONE_DOT: Record<Tone, string> = {
  blue: 'bg-salis-blue',
  bright: 'bg-salis-bright',
  orange: 'bg-salis-orange',
  muted: 'bg-muted',
}

const FIXTURE_ENTRIES: readonly AuditEntry[] = [
  { id: 'a-1', icon: 'LogIn', user: 'Khalid Al-Amri', action: 'logged in', detail: 'New session — Chrome browser', at: '2026-09-02T10:02:00', ip: '192.168.1.45', cat: 'auth', tone: 'blue' },
  { id: 'a-2', icon: 'Plus', user: 'Khalid Al-Amri', action: 'created job card', detail: 'JC-A3F8B2C1 — Ahmed Al-Rashid · Toyota Camry', at: '2026-09-02T10:15:00', ip: '192.168.1.45', cat: 'data', tone: 'blue' },
  { id: 'a-3', icon: 'UserPlus', user: 'Khalid Al-Amri', action: 'assigned technician', detail: 'Yousef Al-Otaibi → JC-A3F8B2C1', at: '2026-09-02T10:18:00', ip: '192.168.1.45', cat: 'data', tone: 'bright' },
  { id: 'a-4', icon: 'CheckCircle', user: 'Yousef Al-Otaibi', action: 'completed inspection', detail: 'Multi-point inspection — 18/22 pass', at: '2026-09-02T11:45:00', ip: '192.168.1.102', cat: 'data', tone: 'blue' },
  { id: 'a-5', icon: 'Receipt', user: 'Khalid Al-Amri', action: 'created estimate', detail: 'EST-0232 — SAR 1,546.75', at: '2026-09-02T12:10:00', ip: '192.168.1.45', cat: 'data', tone: 'blue' },
  { id: 'a-6', icon: 'Send', user: 'System', action: 'sent estimate to customer', detail: 'Email to ahmed@email.com', at: '2026-09-02T12:12:00', ip: '—', cat: 'system', tone: 'muted' },
  { id: 'a-7', icon: 'Shield', user: 'Khalid Al-Amri', action: 'changed security settings', detail: 'Enabled 2FA', at: '2026-09-01T13:30:00', ip: '192.168.1.45', cat: 'system', tone: 'orange' },
  { id: 'a-8', icon: 'LogOut', user: 'Layla Al-Sulaiman', action: 'logged out', detail: 'Session expired', at: '2026-09-01T14:00:00', ip: '192.168.1.78', cat: 'auth', tone: 'muted' },
  { id: 'a-9', icon: 'Trash2', user: 'Khalid Al-Amri', action: 'deleted draft invoice', detail: 'INV-2026-0042 — never issued', at: '2026-08-31T09:20:00', ip: '192.168.1.45', cat: 'data', tone: 'orange' },
]

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

/** Writes the rows to a CSV download. Client-side, so it works in both modes
 *  and exports exactly what the filters left on screen. */
function exportCsv(entries: readonly AuditEntry[], filename: string) {
  const header = ['time', 'user', 'action', 'detail', 'ip', 'category']
  const lines = entries.map((entry) =>
    [entry.at, entry.user, entry.action, entry.detail, entry.ip, entry.cat].map(csvCell).join(',')
  )
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function AuditLog() {
  const { t } = usePreferences()
  const { live } = useSession()
  const { date, time } = useDateFormat()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return FIXTURE_ENTRIES.filter((entry) => {
      if (filter !== 'all' && entry.cat !== filter) return false
      if (!q) return true
      return (
        entry.user.toLowerCase().includes(q) ||
        entry.action.toLowerCase().includes(q) ||
        entry.detail.toLowerCase().includes(q) ||
        entry.ip.toLowerCase().includes(q)
      )
    })
  }, [filter, search])

  // Newest day first, newest entry first within a day.
  const days = useMemo(() => {
    const byDay = new Map<string, AuditEntry[]>()
    for (const entry of [...filtered].sort((a, b) => b.at.localeCompare(a.at))) {
      const key = entry.at.slice(0, 10)
      byDay.set(key, [...(byDay.get(key) ?? []), entry])
    }
    return [...byDay.entries()]
  }, [filtered])

  const filtering = Boolean(search.trim()) || filter !== 'all'

  return (
    <ScreenFrame
      title="Audit Log"
      icon="ScrollText"
      subtitle={t('Track all system actions')}
      readOnly={live ? undefined : 'Demo data — the audit trail is recorded server-side; these entries are a seeded sample.'}
      search={{ value: search, onChange: setSearch, placeholder: t('Search audit log...') }}
      overflow={
        <Button
          variant="ghost"
          size="md"
          icon="Download"
          className="w-full justify-start"
          disabled={filtered.length === 0}
          onClick={() => exportCsv(filtered, 'audit-log.csv')}
        >
          {t('Export CSV')}
        </Button>
      }
      toolbar={
        <ChipGroup label={t('Filter by action type')}>
          {FILTERS.map((item) => (
            <Chip
              key={item.key}
              label={t(item.label)}
              selected={filter === item.key}
              onToggle={() => setFilter(item.key)}
            />
          ))}
        </ChipGroup>
      }
      empty={
        filtered.length === 0
          ? {
              icon: 'ScrollText',
              title: 'No audit entries',
              description: filtering
                ? 'No entries match the current search and filter.'
                : 'No trail entries recorded yet.',
            }
          : false
      }
      bodyClassName="max-w-[1100px]"
    >
      {days.map(([day, entries]) => (
        <section key={day} aria-labelledby={`audit-day-${day}`} className="flex flex-col gap-3">
          <h2 id={`audit-day-${day}`} className="font-action text-xs font-semibold uppercase tracking-[.06em] text-muted">
            {date(day, 'long')}
          </h2>
          <Card className="rounded-2xl p-4 md:p-6">
            <ol className="relative m-0 flex list-none flex-col p-0 ps-7">
              <span aria-hidden className="absolute bottom-2 start-[13px] top-2 w-0.5 bg-border" />
              {entries.map((entry, index) => (
                <li
                  key={entry.id}
                  className={cn(
                    'relative flex gap-3 py-3.5',
                    index < entries.length - 1 && 'border-0 border-b border-solid border-border'
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'absolute -start-[22px] top-[18px] h-2.5 w-2.5 rounded-full border-2 border-page',
                      TONE_DOT[entry.tone]
                    )}
                  />
                  <span className={cn('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', TONE_CHIP[entry.tone])}>
                    <Icon name={entry.icon} size={14} />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-start md:gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-[13px] text-body">
                        <span className="font-semibold text-heading">{entry.user}</span> {t(entry.action)}
                      </p>
                      <p className="m-0 mt-0.5 text-[12px] text-muted">{entry.detail}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2 md:flex-col md:items-end md:gap-0.5">
                      <time dateTime={entry.at} className="text-[12px] text-muted">
                        {time(entry.at)}
                      </time>
                      <span dir="ltr" className="font-mono text-[11px] text-faint">
                        {entry.ip}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </section>
      ))}
    </ScreenFrame>
  )
}
