import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useCollection, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { TASK_TINT } from './crm-badges'
import { CrmTaskFormModal } from './CrmTaskFormModal'

/** CRM Calendar — `CRMCalendar.dc.html` and `.Mobile.dc.html`.
 *
 *  A month grid over `crmTasks`, plus the design's two right-rail panels: the
 *  agenda for the focused day and the type legend. The prototype hardcoded a
 *  July 2026 board; this places every real task on its own `due` date, colours
 *  it by `type`, and lets the month be paged.
 *
 *  This is the CRM-task view, distinct from any `appointments` calendar agent 08
 *  builds — a different collection, a different surface, in its own file.
 *
 *  **New Task (F-027).** `crmTasks` is now writable, so the design's "New Task"
 *  control is real: it opens `CrmTaskFormModal`, which creates the task through
 *  `useCreate('crmTasks')` with the selected day pre-filled as the due date, so
 *  the task lands on the cell the user was looking at. Gated on `crm:c`. Against
 *  the fixtures it refuses honestly with the "set VITE_API_URL" state. The header
 *  still links to the full task list too. */
type Task = RowOf<'crmTasks'> & { _id?: string }

const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

const EVENT_TONE: Record<string, string> = {
  blue: 'bg-[rgba(10,94,215,.1)] text-salis-blue',
  bright: 'bg-[rgba(11,179,255,.12)] text-salis-bright',
  orange: 'bg-[rgba(249,115,22,.12)] text-salis-orange',
  slate: 'bg-inset text-muted',
}
const DOT_TONE: Record<string, string> = {
  blue: 'bg-salis-blue',
  bright: 'bg-salis-bright',
  orange: 'bg-salis-orange',
  slate: 'bg-border-strong',
}

const LEGEND: readonly { type: string; label: string }[] = [
  { type: 'call', label: 'Calls' },
  { type: 'meeting', label: 'Meetings' },
  { type: 'document', label: 'Documents' },
  { type: 'email', label: 'Emails' },
]

const MONTH_INDEX: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

/** `"Jul 23, 2026"` or `"2026-07-23"` → a `{y, m, d}`, or null if unparseable.
 *  Both the fixture rows and the server's `dateUS` output land here. Parsed by
 *  hand rather than `new Date` — V8 rejects `"Jul 23, 2026 UTC"` and treats a
 *  bare `"Jul 23, 2026"` as local time, either of which drifts the day. */
function parseDue(value: string | undefined | null): { y: number; m: number; d: number } | null {
  if (!value) return null
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (iso) return { y: Number(iso[1]), m: Number(iso[2]) - 1, d: Number(iso[3]) }
  const us = /^([A-Za-z]{3})[a-z]*\s+(\d{1,2}),\s*(\d{4})$/.exec(value.trim())
  if (us) {
    const m = MONTH_INDEX[us[1].toLowerCase()]
    if (m === undefined) return null
    return { y: Number(us[3]), m, d: Number(us[2]) }
  }
  return null
}

const toneOf = (task: Task) => TASK_TINT[(task.type ?? '').toLowerCase()] ?? 'slate'

export function CRMCalendar() {
  const { t, rtl } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const tasks = useCollection('crmTasks')

  const rows = (tasks.data ?? []) as readonly Task[]

  // Each task pinned to its due day, keyed `y-m-d`.
  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const task of rows) {
      const due = parseDue(task.due)
      if (!due) continue
      const key = `${due.y}-${due.m}-${due.d}`
      const bucket = map.get(key)
      if (bucket) bucket.push(task)
      else map.set(key, [task])
    }
    return map
  }, [rows])

  // Open on the month that actually holds tasks, so the first paint is not an
  // empty grid the user has to page away from.
  const busiestMonth = useMemo(() => {
    const counts = new Map<string, { y: number; m: number; n: number }>()
    for (const task of rows) {
      const due = parseDue(task.due)
      if (!due) continue
      const key = `${due.y}-${due.m}`
      const entry = counts.get(key) ?? { y: due.y, m: due.m, n: 0 }
      entry.n += 1
      counts.set(key, entry)
    }
    let best: { y: number; m: number; n: number } | null = null
    for (const entry of counts.values()) {
      if (!best || entry.n > best.n || (entry.n === best.n && (entry.y < best.y || (entry.y === best.y && entry.m < best.m)))) {
        best = entry
      }
    }
    const now = new Date()
    return best ?? { y: now.getUTCFullYear(), m: now.getUTCMonth() }
  }, [rows])

  // Null until the user pages, so the view follows `busiestMonth` as the data
  // lands — a `useState(busiestMonth)` would freeze on the empty-first-render
  // month (today's) and never move to the month the tasks are actually in.
  const [paged, setPaged] = useState<{ y: number; m: number } | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const view = paged ?? busiestMonth

  if (tasks.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <FeatureHeader icon="CalendarDays" title={t('CRM Calendar')} subtitle={t('CRM & Marketing')} />
        <Loading label="Loading calendar..." />
      </div>
    )
  }

  if (tasks.isError) {
    return (
      <div className="flex flex-col gap-6">
        <FeatureHeader icon="CalendarDays" title={t('CRM Calendar')} subtitle={t('CRM & Marketing')} />
        <Card className="p-6">
          <ErrorState description={tasks.error?.message} onRetry={() => void tasks.refetch()} />
        </Card>
      </div>
    )
  }

  const first = new Date(Date.UTC(view.y, view.m, 1))
  const leading = first.getUTCDay()
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate()

  const cells: ({ day: number; key: string } | null)[] = []
  for (let i = 0; i < leading; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, key: `${view.y}-${view.m}-${d}` })
  while (cells.length % 7 !== 0) cells.push(null)

  const step = (delta: number) => {
    setSelected(null)
    const next = new Date(Date.UTC(view.y, view.m + delta, 1))
    setPaged({ y: next.getUTCFullYear(), m: next.getUTCMonth() })
  }

  // The agenda follows the selected day, or the first day this month with tasks.
  const firstBusy = cells.find((c) => c && byDay.has(c.key)) as { day: number; key: string } | undefined
  const agendaKey = selected ?? firstBusy?.key ?? null
  const agendaTasks = agendaKey ? (byDay.get(agendaKey) ?? []) : []
  const agendaDay = agendaKey ? Number(agendaKey.split('-')[2]) : null

  const monthLabel = `${t(MONTHS[view.m])} ${view.y}`
  const hasAnyTasks = byDay.size > 0
  const canCreate = can('crm', 'c')

  // The day a new task defaults to: the one in view (selected, or the first
  // with tasks). `y-m-d` with a zero-based month → an ISO `YYYY-MM-DD`.
  const defaultDue = agendaKey
    ? (() => {
        const [y, m, d] = agendaKey.split('-').map(Number)
        return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      })()
    : ''

  return (
    <div className="flex flex-col gap-6">
      <FeatureHeader
        icon="CalendarDays"
        title={t('CRM Calendar')}
        subtitle={t('CRM & Marketing')}
        actions={
          <>
            {canCreate ? (
              <Button onClick={() => setCreating(true)}>
                <Icon name="Plus" size={16} />
                {t('New Task')}
              </Button>
            ) : null}
            <Button variant="subtle" onClick={() => navigate('/crmtasks')}>
              <Icon name="ListChecks" size={16} />
              {t('All Tasks')}
            </Button>
          </>
        }
      />

      {!hasAnyTasks ? (
        <Card className="p-6">
          <EmptyState
            icon="CalendarDays"
            title={t('No scheduled tasks')}
            description={t('CRM tasks with a due date will appear on the calendar.')}
          />
        </Card>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-2.5 border-0 border-b border-solid border-border px-5 py-3.5">
              <h3 className="text-base font-bold text-heading">{monthLabel}</h3>
              <span className="flex-1" />
              <MonthButton
                icon={rtl ? 'ChevronRight' : 'ChevronLeft'}
                label={t('Previous month')}
                onClick={() => step(-1)}
              />
              <MonthButton
                icon={rtl ? 'ChevronLeft' : 'ChevronRight'}
                label={t('Next month')}
                onClick={() => step(1)}
              />
            </div>

            <div className="grid grid-cols-7">
              {DAY_KEYS.map((key) => (
                <div
                  key={key}
                  className="border-0 border-b border-solid border-border py-2.5 text-center text-[11px] font-semibold text-muted"
                >
                  {t(key)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {cells.map((cell, index) => {
                if (!cell) {
                  return (
                    <div
                      key={`pad-${index}`}
                      className="min-h-[76px] border-0 border-b border-e border-solid border-border sm:min-h-[92px]"
                    />
                  )
                }
                const dayTasks = byDay.get(cell.key) ?? []
                const isSelected = cell.key === agendaKey
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelected(cell.key)}
                    aria-pressed={isSelected}
                    aria-label={`${cell.day} ${monthLabel}, ${dayTasks.length} ${t('tasks')}`}
                    className={cn(
                      'flex min-h-[76px] cursor-pointer flex-col items-stretch gap-1 border-0 border-b border-e border-solid border-border bg-transparent p-1.5 text-start sm:min-h-[92px]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-salis-blue',
                      isSelected ? 'bg-[rgba(10,94,215,.06)]' : 'hover:bg-inset'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs',
                        isSelected ? 'font-bold text-salis-blue' : 'font-normal text-body'
                      )}
                    >
                      {cell.day}
                    </span>
                    <span className="flex flex-col gap-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <span
                          key={task._id ?? task.title}
                          title={task.title}
                          className={cn(
                            'truncate rounded px-1.5 py-0.5 text-[10px] font-medium',
                            EVENT_TONE[toneOf(task)]
                          )}
                        >
                          {task.title}
                        </span>
                      ))}
                      {dayTasks.length > 2 ? (
                        <span className="px-1.5 text-[10px] text-muted">
                          +{dayTasks.length - 2} {t('more')}
                        </span>
                      ) : null}
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>

          <div className="flex flex-col gap-5">
            <Card className="flex flex-col gap-3 p-5">
              <h3 className="text-[15px] font-bold text-heading">
                {agendaDay ? `${agendaDay} ${monthLabel.split(' ')[0]}` : t("Day's Tasks")}
              </h3>
              {agendaTasks.length === 0 ? (
                <p className="text-[13px] text-muted">{t('No tasks on this day.')}</p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {agendaTasks.map((task) => (
                    <li
                      key={task._id ?? task.title}
                      className="flex gap-2.5 rounded-lg border border-border bg-inset p-2.5"
                    >
                      <span
                        aria-hidden
                        className={cn('w-[3px] flex-shrink-0 rounded-full', DOT_TONE[toneOf(task)])}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="m-0 truncate text-xs font-semibold text-heading">{task.title}</p>
                        <p className="m-0 mt-0.5 truncate text-[11px] text-muted">
                          {[task.assigned, task.type ? t(task.type) : null].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="flex flex-col gap-3 p-5">
              <h3 className="text-[15px] font-bold text-heading">{t('Legend')}</h3>
              <div className="flex flex-col gap-2">
                {LEGEND.map((item) => (
                  <div key={item.type} className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className={cn('h-2.5 w-2.5 rounded-[3px]', DOT_TONE[TASK_TINT[item.type] ?? 'slate'])}
                    />
                    <span className="text-xs text-body">{t(item.label)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {creating ? (
        <CrmTaskFormModal open onClose={() => setCreating(false)} defaultDueDate={defaultDue} />
      ) : null}
    </div>
  )
}

function MonthButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-solid border-border bg-transparent text-body hover:bg-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
    >
      <Icon name={icon} size={14} />
    </button>
  )
}
