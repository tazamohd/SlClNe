import { Fragment, useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/DataTable'
import { MobilePageHeader } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useCollection, type RowOf } from '@/data/useCollection'

type Appointment = RowOf<'appointments'>
type View = 'day' | 'week' | 'month'

/** Booking tint per service, straight from the design's palette: the brand
 *  blues carry routine work, slate is neutral, orange marks repairs — the
 *  heavy jobs. Green/red/etc. are forbidden (README §7). */
const SERVICE_STYLE: Record<string, readonly [string, string]> = {
  Maintenance: ['rgba(10,94,215,.14)', 'var(--salis-blue)'],
  Diagnostics: ['rgba(10,94,215,.14)', 'var(--salis-blue)'],
  'AC Service': ['rgba(10,94,215,.14)', 'var(--salis-blue)'],
  Inspection: ['rgba(11,179,255,.14)', '#0BB3FF'],
  'Oil Change': ['rgba(11,179,255,.14)', '#0BB3FF'],
  'Tire Service': ['rgba(100,116,139,.12)', '#64748B'],
  Repair: ['rgba(249,115,22,.12)', '#F97316'],
}
const DEFAULT_STYLE = ['rgba(10,94,215,.14)', 'var(--salis-blue)'] as const

const VIEWS: readonly View[] = ['day', 'week', 'month']
const VIEW_LABEL: Record<View, string> = { day: 'Day', week: 'Week', month: 'Month' }
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
/** The grid runs the workshop day, 8 AM through the 5 PM slot, per the design. */
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8)

function atMidnight(input: Date): Date {
  const d = new Date(input)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Weeks start on Sunday — the Saudi working week the design lays out. */
function startOfWeek(input: Date): Date {
  const d = atMidnight(input)
  d.setDate(d.getDate() - d.getDay())
  return d
}

function addDays(input: Date, days: number): Date {
  const d = new Date(input)
  d.setDate(d.getDate() + days)
  return d
}

function addMonths(input: Date, months: number): Date {
  const d = new Date(input.getFullYear(), input.getMonth() + months, 1)
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(input.getDate(), lastDay))
  return d
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** "1:30 PM" → 13: the hour slot the booking starts in. */
function slotHour(time: string): number {
  const [clock, meridiem] = time.split(' ')
  const hour = Number(clock.split(':')[0]) % 12
  return meridiem === 'PM' ? hour + 12 : hour
}

function hourLabel(hour: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12
  return `${h12}:00 ${hour < 12 ? 'AM' : 'PM'}`
}

function durationLabel(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

interface Scheduled {
  appt: Appointment
  date: Date
  hour: number
}

/** Booking calendar over the appointments collection: week grid (the desktop
 *  design), a day schedule (the mobile design's layout, which is also what the
 *  screen collapses to on a phone), and a month overview so the design's third
 *  view tab actually renders something instead of blanking the screen. */
export function AppointmentCalendar() {
  const { t, rtl } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const { data: appointments = [], isLoading } = useCollection('appointments')

  const today = useMemo(() => atMidnight(new Date()), [])
  const [view, setView] = useState<View>('week')
  const [cursor, setCursor] = useState(today)

  /** The mock rows are one day's bookings — a time of day, no date (they also
   *  back the Appointments list). Until the API carries real dates, anchor
   *  them across the current working week (Sun–Fri, keeping Saturday clear)
   *  deterministically so every view has a representative spread to render. */
  const scheduled = useMemo<Scheduled[]>(() => {
    const anchor = startOfWeek(today)
    return appointments.map((appt, index) => ({
      appt,
      date: addDays(anchor, index % 6),
      hour: slotHour(appt.time),
    }))
  }, [appointments, today])

  const monthName = (d: Date, style: 'long' | 'short') =>
    new Intl.DateTimeFormat(rtl ? 'ar' : 'en-US', { month: style }).format(d)

  const bookingsOn = (date: Date) =>
    scheduled.filter((s) => sameDay(s.date, date)).sort((a, b) => a.hour - b.hour)

  const weekStart = startOfWeek(cursor)
  const prevIcon = rtl ? 'ChevronRight' : 'ChevronLeft'
  const nextIcon = rtl ? 'ChevronLeft' : 'ChevronRight'
  const canCreate = can('appointments', 'c')

  function step(direction: 1 | -1) {
    // Mobile pages by week (the date strip); desktop steps by the active view.
    if (isMobile || view === 'week') return setCursor((c) => addDays(c, 7 * direction))
    if (view === 'day') return setCursor((c) => addDays(c, direction))
    setCursor((c) => addMonths(c, direction))
  }

  const dateLabel = (() => {
    if (isMobile || view === 'day')
      return `${monthName(cursor, 'short')} ${cursor.getDate()}, ${cursor.getFullYear()}`
    if (view === 'month') return `${monthName(cursor, 'long')} ${cursor.getFullYear()}`
    const weekEnd = addDays(weekStart, 6)
    if (weekStart.getMonth() === weekEnd.getMonth())
      return `${monthName(weekStart, 'long')} ${weekStart.getDate()}–${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
    return `${monthName(weekStart, 'short')} ${weekStart.getDate()} – ${monthName(weekEnd, 'short')} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
  })()

  if (isLoading) {
    return <p className="text-sm text-muted">{t('Loading...')}</p>
  }

  const empty = appointments.length === 0

  const emptyCard = (
    <Card className="p-6">
      <EmptyState
        icon="CalendarX"
        title={t('No appointments')}
        description={t('Bookings will appear on the calendar once they are scheduled.')}
      />
    </Card>
  )

  /** One day as a slot list — the mobile design's layout, reused for the
   *  desktop Day view. */
  const daySchedule = (date: Date) => {
    const byHour = new Map<number, Scheduled[]>()
    for (const s of bookingsOn(date)) byHour.set(s.hour, [...(byHour.get(s.hour) ?? []), s])
    return (
      <div className="flex flex-col gap-3">
        {HOURS.map((hour) => {
          const slots = byHour.get(hour) ?? []
          return (
            <div key={hour} className="flex items-start gap-2.5">
              <span
                className="w-[52px] flex-shrink-0 pt-2.5 text-end font-mono text-[11px] font-semibold text-muted"
                dir="ltr"
              >
                {hourLabel(hour)}
              </span>
              {slots.length === 0 ? (
                <div className="flex h-11 flex-1 items-center justify-center rounded-lg border border-dashed border-border text-[11px] text-faint">
                  {t('Available')}
                </div>
              ) : (
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {slots.map(({ appt }) => {
                    const [bg, fg] = SERVICE_STYLE[appt.svc] ?? DEFAULT_STYLE
                    return (
                      <div
                        key={`${appt.plate}-${appt.time}`}
                        className="flex flex-col gap-1 rounded-[10px] p-3"
                        style={{ background: bg, color: fg, borderInlineStart: `3px solid ${fg}` }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13px] font-semibold">{appt.cust}</span>
                          <span className="font-mono text-[10px] font-medium opacity-80" dir="ltr">
                            {durationLabel(appt.mins)}
                          </span>
                        </div>
                        <span className="truncate text-xs opacity-80">
                          {appt.veh} · {t(appt.svc)} · {appt.bay}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const navButtons = (
    <div className="flex items-center gap-2">
      <CalendarNavButton icon={prevIcon} label={t('Previous')} onClick={() => step(-1)} />
      <span className="min-w-[150px] text-center font-display text-[15px] font-bold text-heading">
        {dateLabel}
      </span>
      <CalendarNavButton icon={nextIcon} label={t('Next')} onClick={() => step(1)} />
      <button
        type="button"
        onClick={() => setCursor(today)}
        className="h-8 cursor-pointer rounded-lg border border-border bg-card px-3 font-action text-xs font-medium text-body transition-colors hover:border-salis-blue hover:text-salis-blue"
      >
        {t('Today')}
      </button>
    </div>
  )

  // ——— Mobile: date strip + day schedule, per the .Mobile design ———
  if (isMobile) {
    return (
      <>
        <MobilePageHeader
          icon="Calendar"
          title={t('Calendar')}
          subtitle={t('Appointments')}
          actions={
            canCreate ? (
              <Button size="md" className="px-2.5" aria-label={t('New Appointment')}>
                <Icon name="Plus" size={18} />
              </Button>
            ) : undefined
          }
        />

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <CalendarNavButton icon={prevIcon} label={t('Previous')} onClick={() => step(-1)} small />
            <span className="font-display text-sm font-bold text-heading">{dateLabel}</span>
            <CalendarNavButton icon={nextIcon} label={t('Next')} onClick={() => step(1)} small />
          </div>
          <div className="mt-2.5 flex gap-1">
            {DAY_NAMES.map((name, i) => {
              const d = addDays(weekStart, i)
              const on = sameDay(d, cursor)
              const dot = !on && bookingsOn(d).length > 0
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCursor(d)}
                  className={cn(
                    'flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-[10px] border-none py-1.5',
                    on
                      ? 'bg-salis-gradient shadow-[0_2px_8px_rgba(10,94,215,.3)]'
                      : 'bg-inset'
                  )}
                >
                  <span
                    className={cn(
                      'font-action text-[10px] font-medium',
                      on ? 'text-white' : 'text-muted'
                    )}
                  >
                    {t(name)}
                  </span>
                  <span
                    className={cn('text-[15px] font-bold', on ? 'text-white' : 'text-heading')}
                    dir="ltr"
                  >
                    {d.getDate()}
                  </span>
                  <span
                    className={cn('h-1 w-1 rounded-full', dot ? 'bg-salis-blue' : 'bg-transparent')}
                  />
                </button>
              )
            })}
          </div>
        </Card>

        {empty ? emptyCard : daySchedule(cursor)}
      </>
    )
  }

  // ——— Desktop ———
  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-salis-blue opacity-30 blur-lg" aria-hidden />
            <div className="relative flex rounded-xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
              <Icon name="Calendar" size={28} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-[26px] font-black text-heading">{t('Calendar')}</h1>
            <p className="mt-0.5 text-sm text-muted">{t('Appointments')}</p>
          </div>
        </div>

        <div className="flex-1" />

        <div
          role="tablist"
          aria-label={t('Calendar')}
          className="flex overflow-hidden rounded-lg border border-border"
        >
          {VIEWS.map((option) => {
            const on = view === option
            return (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setView(option)}
                className={cn(
                  'h-9 cursor-pointer border-none px-4 font-action text-xs font-semibold transition-colors',
                  on ? 'bg-salis-gradient text-white' : 'bg-card text-body hover:text-salis-blue'
                )}
              >
                {t(VIEW_LABEL[option])}
              </button>
            )
          })}
        </div>

        {navButtons}

        {canCreate ? (
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('New Appointment')}
          </Button>
        ) : null}
      </div>

      {empty ? (
        emptyCard
      ) : view === 'week' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-border">
                <div />
                {DAY_NAMES.map((name, i) => {
                  const d = addDays(weekStart, i)
                  const isToday = sameDay(d, today)
                  return (
                    <div
                      key={name}
                      className={cn(
                        'border-s border-border px-2 py-3 text-center',
                        isToday && 'bg-[rgba(10,94,215,.06)]'
                      )}
                    >
                      <p className="font-action text-[11px] font-medium text-muted">{t(name)}</p>
                      <p
                        className={cn(
                          'mt-0.5 text-lg font-bold',
                          isToday ? 'text-salis-blue' : 'text-heading'
                        )}
                        dir="ltr"
                      >
                        {d.getDate()}
                      </p>
                    </div>
                  )
                })}
              </div>
              <div className="max-h-[520px] overflow-y-auto">
                <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]">
                  {HOURS.map((hour) => (
                    <Fragment key={hour}>
                      <div
                        className="flex h-[52px] items-start justify-end border-b border-border pe-2 pt-1.5 font-mono text-[10px] text-muted"
                        dir="ltr"
                      >
                        {hourLabel(hour)}
                      </div>
                      {DAY_NAMES.map((name, di) => {
                        const d = addDays(weekStart, di)
                        const cellAppts = scheduled.filter(
                          (s) => sameDay(s.date, d) && s.hour === hour
                        )
                        return (
                          <div
                            key={name}
                            className={cn(
                              'h-[52px] border-b border-s border-border p-0.5',
                              sameDay(d, today) && 'bg-[rgba(10,94,215,.03)]'
                            )}
                          >
                            {cellAppts.map(({ appt }) => {
                              const [bg, fg] = SERVICE_STYLE[appt.svc] ?? DEFAULT_STYLE
                              return (
                                <div
                                  key={`${appt.plate}-${appt.time}`}
                                  className="flex h-full min-h-0 flex-col gap-px overflow-hidden rounded-md px-1.5 py-1"
                                  style={{
                                    background: bg,
                                    color: fg,
                                    borderInlineStart: `3px solid ${fg}`,
                                  }}
                                >
                                  <span className="truncate text-[10px] font-semibold">
                                    {appt.cust}
                                  </span>
                                  <span className="truncate text-[9px] opacity-80">
                                    {t(appt.svc)}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : view === 'day' ? (
        <Card className="max-w-[880px] p-5">{daySchedule(cursor)}</Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            {DAY_NAMES.map((name, i) => (
              <div
                key={name}
                className={cn(
                  'border-border px-2 py-2.5 text-center font-action text-[11px] font-medium text-muted',
                  i > 0 && 'border-s'
                )}
              >
                {t(name)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthCells(cursor).map((cell, i) => {
              if (!cell) {
                return (
                  <div
                    key={`pad-${i}`}
                    className={cn(
                      'min-h-[84px] border-b border-border bg-inset',
                      i % 7 > 0 && 'border-s'
                    )}
                  />
                )
              }
              const dayAppts = bookingsOn(cell)
              const isToday = sameDay(cell, today)
              return (
                <button
                  key={cell.getDate()}
                  type="button"
                  onClick={() => {
                    setCursor(cell)
                    setView('day')
                  }}
                  className={cn(
                    'flex min-h-[84px] cursor-pointer flex-col items-start gap-1 border-0 border-b border-solid border-border bg-transparent p-1.5 text-start transition-colors hover:bg-[rgba(10,94,215,.05)]',
                    i % 7 > 0 && 'border-s'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold',
                      isToday ? 'bg-salis-gradient text-white' : 'text-heading'
                    )}
                    dir="ltr"
                  >
                    {cell.getDate()}
                  </span>
                  {dayAppts.slice(0, 2).map(({ appt }) => {
                    const [bg, fg] = SERVICE_STYLE[appt.svc] ?? DEFAULT_STYLE
                    return (
                      <span
                        key={`${appt.plate}-${appt.time}`}
                        className="w-full truncate rounded px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{ background: bg, color: fg }}
                      >
                        {appt.cust}
                      </span>
                    )
                  })}
                  {dayAppts.length > 2 ? (
                    <span className="text-[10px] font-medium text-muted" dir="ltr">
                      +{dayAppts.length - 2}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </Card>
      )}
    </>
  )
}

/** Month grid cells: `null` pads the leading/trailing days outside the month. */
function monthCells(cursor: Date): (Date | null)[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const leading = first.getDay()
  const total = Math.ceil((leading + daysInMonth) / 7) * 7
  return Array.from({ length: total }, (_, i) => {
    const dayNum = i - leading + 1
    if (dayNum < 1 || dayNum > daysInMonth) return null
    return new Date(cursor.getFullYear(), cursor.getMonth(), dayNum)
  })
}

/** 32px square chevron button from the design's calendar toolbar. */
function CalendarNavButton({
  icon,
  label,
  onClick,
  small,
}: {
  icon: string
  label: string
  onClick: () => void
  small?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'flex cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted transition-colors hover:border-salis-blue hover:text-salis-blue',
        small ? 'h-10 w-10' : 'h-10 w-10'
      )}
    >
      <Icon name={icon} size={small ? 14 : 16} />
    </button>
  )
}
