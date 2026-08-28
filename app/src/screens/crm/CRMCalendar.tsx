import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/DataTable'
import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

/** CRM Calendar: month grid + upcoming-tasks agenda, built from `crmTasks`.
 *
 *  The design's grid used static placeholder events (Call, Demo, Proposal
 *  due, …) with no real backing data. `crmTasks` carries the same shape of
 *  content — titled items with a due date, an assignee and a type — so this
 *  places each task on its due date instead of re-hardcoding the design's
 *  strings, and month navigation actually walks the data. */

type CrmTask = RowOf<'crmTasks'>

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

/** Event-chip tone by task type, mapped onto the design's calendar legend
 *  (Calls / Meetings / Deadlines / Reviews). Blue scale + orange only —
 *  no green/red/yellow/purple/pink/teal (README §7). */
const TYPE_TONE: Record<string, readonly [string, string]> = {
  call: ['rgba(10,94,215,.12)', '#0A5ED7'],
  meeting: ['rgba(11,179,255,.12)', '#0BB3FF'],
  document: ['rgba(249,115,22,.12)', '#F97316'],
  task: ['rgba(11,31,59,.12)', '#0B1F3B'],
}
const FALLBACK_TONE: readonly [string, string] = ['rgba(100,116,139,.12)', '#64748B']

const TYPE_LABEL: Record<string, string> = {
  call: 'Calls',
  meeting: 'Meetings',
  document: 'Deadlines',
  task: 'Reviews',
}

// Mirrors the design's highlighted "today" cell. The demo dataset lives in a
// fixed month, so the real system date would never land inside the grid.
const HIGHLIGHT_DAY = 24

function parseDue(due: string): Date | null {
  const parsed = new Date(due)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function CRMCalendar() {
  const { t } = usePreferences()
  const { can } = useSession()
  const { data: tasks = [], isLoading } = useCollection('crmTasks')
  const [monthOffset, setMonthOffset] = useState(0)

  const base = useMemo(() => {
    for (const task of tasks) {
      const due = parseDue(task.due)
      if (due) return due
    }
    return new Date()
  }, [tasks])

  const view = useMemo(
    () => new Date(base.getFullYear(), base.getMonth() + monthOffset, 1),
    [base, monthOffset]
  )
  const year = view.getFullYear()
  const month = view.getMonth()
  const monthLabel = view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const byDay = useMemo(() => {
    const map = new Map<number, CrmTask[]>()
    for (const task of tasks) {
      const due = parseDue(task.due)
      if (!due || due.getFullYear() !== year || due.getMonth() !== month) continue
      const list = map.get(due.getDate()) ?? []
      list.push(task)
      map.set(due.getDate(), list)
    }
    return map
  }, [tasks, year, month])

  const calDays = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: 35 }, (_, i) => {
      const dayNum = i - firstWeekday + 1
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth
      return { dayNum: inMonth ? dayNum : null, events: inMonth ? (byDay.get(dayNum) ?? []) : [] }
    })
  }, [year, month, byDay])

  const upcoming = useMemo(
    () =>
      [...tasks].sort(
        (a, b) => (parseDue(a.due)?.getTime() ?? 0) - (parseDue(b.due)?.getTime() ?? 0)
      ),
    [tasks]
  )

  const types = useMemo(() => [...new Set(tasks.map((task) => task.type))], [tasks])

  if (isLoading) return <p className="text-sm text-muted">{t('Loading...')}</p>

  return (
    <>
      <FeatureHeader
        icon="CalendarDays"
        title={t('CRM Calendar')}
        subtitle={t('CRM & Marketing')}
        actions={
          can('crm', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('New Task')}
            </Button>
          ) : null
        }
      />

      {tasks.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon="CalendarX"
            title={t('No events scheduled')}
            description={t('CRM tasks with a due date will appear on the calendar.')}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_300px]">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
              <h3 className="font-display text-base font-bold text-heading">{monthLabel}</h3>
              <span className="flex-1" />
              <button
                type="button"
                aria-label={t('Previous month')}
                onClick={() => setMonthOffset((o) => o - 1)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-body hover:border-border-strong"
              >
                <Icon name="ChevronLeft" size={14} />
              </button>
              <button
                type="button"
                aria-label={t('Next month')}
                onClick={() => setMonthOffset((o) => o + 1)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-body hover:border-border-strong"
              >
                <Icon name="ChevronRight" size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-7">
                  {DAY_HEADERS.map((day) => (
                    <div
                      key={day}
                      className="border-b border-border p-2.5 text-center text-xs font-semibold text-muted"
                    >
                      {t(day)}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {calDays.map((cell, i) => {
                    const isToday = monthOffset === 0 && cell.dayNum === HIGHLIGHT_DAY
                    return (
                      <div
                        key={i}
                        className={cn(
                          'min-h-[92px] border-b border-e border-border p-1.5',
                          isToday && 'bg-[rgba(10,94,215,.04)]'
                        )}
                      >
                        {cell.dayNum ? (
                          <span
                            className={cn(
                              'font-mono text-xs',
                              isToday ? 'font-bold text-salis-blue' : 'text-body'
                            )}
                            dir="ltr"
                          >
                            {cell.dayNum}
                          </span>
                        ) : null}
                        <div className="mt-1 flex flex-col gap-1">
                          {cell.events.map((task) => {
                            const [bg, fg] = TYPE_TONE[task.type] ?? FALLBACK_TONE
                            return (
                              <div
                                key={task.title}
                                className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium"
                                style={{ background: bg, color: fg }}
                                title={t(task.title)}
                              >
                                {t(task.title)}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-5">
            <Card className="p-5">
              <h3 className="mb-3 text-[15px] font-bold text-heading">{t('Upcoming Tasks')}</h3>
              <div className="flex flex-col gap-2.5">
                {upcoming.map((task) => {
                  const [, fg] = TYPE_TONE[task.type] ?? FALLBACK_TONE
                  return (
                    <div
                      key={task.title}
                      className="flex gap-2.5 rounded-[10px] border border-border bg-inset p-2.5"
                    >
                      <span className="w-[3px] flex-shrink-0 rounded-full" style={{ background: fg }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-heading">{t(task.title)}</p>
                        <p className="mt-0.5 text-[11px] text-muted">
                          <span dir="ltr">{task.due}</span> · {task.assigned}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="mb-3 text-[15px] font-bold text-heading">{t('Legend')}</h3>
              <div className="flex flex-col gap-2">
                {types.map((type) => {
                  const [, fg] = TYPE_TONE[type] ?? FALLBACK_TONE
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: fg }} />
                      <span className="text-xs text-body">{t(TYPE_LABEL[type] ?? type)}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
