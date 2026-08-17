import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { FeatureHeader } from '@/components/shell/FeatureScreen'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { PriorityBadge } from '@/components/ui/Badge'
import { ST_BADGE } from '@/data/generated/badges'
import { Timeline, type TimelineStep } from '@/components/ui/Timeline'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

/** UI pattern library: board, calendar and rail layouts.
 *
 *  These three back /ui/kanban-view, /ui/calendar-view and /ui/timeline-view —
 *  internal reference pages for the pattern each layout demonstrates, not
 *  standalone product screens. Kanban and Timeline lean on real collections
 *  and components (`jobs`, `Timeline`) since both fit the job lifecycle the
 *  rest of the app already models; Calendar has no dated collection to bind
 *  to, so its month grid and events are local, design-mirroring data. */

// ── Kanban ──────────────────────────────────────────────────────────────────
type Job = RowOf<'jobs'>

const KANBAN_STAGES = ['pending', 'assigned', 'in_progress', 'completed', 'delivered'] as const

const FALLBACK_TONE: readonly string[] = ['rgba(100,116,139,.1)', '#64748B']

export function UIKanbanView() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const { data: jobs = [], isLoading } = useCollection('jobs')

  const byStatus = useMemo(() => {
    const map = new Map<string, Job[]>()
    for (const status of KANBAN_STAGES) map.set(status, [])
    for (const job of jobs) map.get(job.st)?.push(job)
    return map
  }, [jobs])

  if (isLoading) return <p className="text-sm text-muted">{t('Loading...')}</p>

  return (
    <>
      <FeatureHeader
        icon="Columns3"
        title={t('Kanban View')}
        subtitle={t('UI pattern reference — job cards grouped by status')}
      />
      <div className="flex gap-4 overflow-x-auto pb-2">
        {KANBAN_STAGES.map((status) => {
          const column = byStatus.get(status) ?? []
          const [, dotColor] = ST_BADGE[status] ?? FALLBACK_TONE
          return (
            <div key={status} className="flex w-[280px] flex-shrink-0 flex-col gap-2.5">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: dotColor }} />
                <span className="text-[13px] font-semibold text-heading">
                  {t(status.replace(/_/g, ' '))}
                </span>
                <span
                  className="ms-auto rounded-full bg-[rgba(10,94,215,.08)] px-2 py-0.5 text-[11px] font-semibold text-salis-blue"
                  dir="ltr"
                >
                  {column.length}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {column.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted">{t('Nothing here yet')}</p>
                ) : (
                  column.map((job) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => navigate(`/job-detail?id=${job.id}`)}
                      className="flex cursor-grab flex-col gap-2 rounded-xl border border-border bg-card p-3.5 text-start transition-colors hover:border-salis-blue"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-muted" dir="ltr">
                          {job.id}
                        </span>
                        <PriorityBadge value={job.pr} label={t(job.pr)} />
                      </div>
                      <p className="text-[13px] font-medium text-heading">
                        {t(job.svc.replace(/_/g, ' '))}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[9px] font-bold text-white">
                          {job.cust.charAt(0)}
                        </span>
                        <span className="truncate text-[11px] text-muted">{job.veh}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ── Calendar ────────────────────────────────────────────────────────────────
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

/** Day-of-month → event, so the demo lands on real cells in whichever month
 *  the viewer navigates to (the design fixed these to a single hardcoded
 *  month; a live grid can't). */
const CALENDAR_EVENTS: Record<number, { title: string; tone: readonly [string, string] }> = {
  6: { title: 'Oil Change - Camry', tone: ['rgba(10,94,215,.1)', '#0A5ED7'] },
  9: { title: 'Brake Insp - Patrol', tone: ['rgba(249,115,22,.1)', '#F97316'] },
  14: { title: 'AC Service - Sonata', tone: ['rgba(11,179,255,.1)', '#0BB3FF'] },
  21: { title: 'Tire Rotation', tone: ['rgba(11,31,59,.1)', '#0B1F3B'] },
}

interface CalendarCell {
  day: number
  isToday: boolean
  event?: { title: string; tone: readonly [string, string] }
}

export function UICalendarView() {
  const { t } = usePreferences()
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const today = new Date()

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const cells = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7
    return Array.from({ length: totalCells }, (_, index): CalendarCell | null => {
      const day = index - firstWeekday + 1
      if (day < 1 || day > daysInMonth) return null
      const isToday =
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
      return { day, isToday, event: CALENDAR_EVENTS[day] }
    })
  }, [cursor, today])

  return (
    <>
      <FeatureHeader
        icon="Calendar"
        title={t('Calendar View')}
        subtitle={t('UI pattern reference — month grid with scheduled events')}
      />
      <Card className="flex flex-col gap-4 rounded-lg p-5">
        <div className="flex items-center gap-3">
          <Button
            variant="subtle"
            size="sm"
            aria-label={t('Previous month')}
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
          >
            <Icon name="ChevronLeft" size={14} />
          </Button>
          <span className="flex-1 text-center text-sm font-semibold text-heading" dir="ltr">
            {monthLabel}
          </span>
          <Button
            variant="subtle"
            size="sm"
            aria-label={t('Next month')}
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
          >
            <Icon name="ChevronRight" size={14} />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[560px] overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-7">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="border-b border-e border-border p-2.5 text-center text-xs font-semibold text-muted"
                >
                  {t(day)}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((cell, index) => (
                <div
                  key={index}
                  className={cn(
                    'min-h-[80px] border-b border-e border-border p-1.5',
                    cell?.isToday && 'bg-[rgba(10,94,215,.04)]'
                  )}
                >
                  {cell ? (
                    <>
                      <span
                        className={cn(
                          'text-xs',
                          cell.isToday ? 'font-bold text-salis-blue' : 'text-body'
                        )}
                        dir="ltr"
                      >
                        {cell.day}
                      </span>
                      {cell.event ? (
                        <div
                          className="mt-1 truncate rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ background: cell.event.tone[0], color: cell.event.tone[1] }}
                        >
                          {t(cell.event.title)}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}

// ── Timeline ────────────────────────────────────────────────────────────────
const JOB_TIMELINE_STEPS: readonly TimelineStep[] = [
  { icon: 'CarFront', label: 'Check-In', time: 'Jul 21, 9:15 AM', done: true },
  { icon: 'ClipboardCheck', label: 'Inspection', time: 'Jul 21, 10:30 AM', done: true },
  { icon: 'Calculator', label: 'Estimate', time: 'Jul 21, 2:00 PM', done: true },
  { icon: 'Hammer', label: 'Repair', time: 'Jul 22, 8:00 AM', done: true },
  { icon: 'ShieldCheck', label: 'QC', done: false },
  { icon: 'Truck', label: 'Delivery', time: 'Jul 23, 4:00 PM', done: false },
]

export function UITimelineView() {
  const { t } = usePreferences()

  return (
    <>
      <FeatureHeader
        icon="History"
        title={t('Timeline View')}
        subtitle={t('UI pattern reference — horizontal progress rail')}
      />
      <Card className="max-w-[560px] rounded-lg p-5">
        <Timeline steps={JOB_TIMELINE_STEPS} />
      </Card>
    </>
  )
}
