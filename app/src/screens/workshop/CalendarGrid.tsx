import { useMemo } from 'react'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { minuteOf, durationOf, labelOfMinute, serviceTint, type Appointment } from './schedule'

/** A day / week time grid over appointments — the reusable calendar the design
 *  shows, kept in the workshop boundary. `AppointmentCalendar` renders it; the
 *  per-technician `TechnicianSchedule` reuses only the `schedule.ts` helpers, so
 *  the shared surface is the maths, not this layout.
 *
 *  The grid is honest about time: an appointment with no readable start is not
 *  placed at midnight, it is dropped from the grid (and the caller can count the
 *  difference). Blocks are positioned by `startMinute` and sized by duration
 *  within an 07:00–19:00 window.
 */

const DAY_START = 7 * 60
const DAY_END = 19 * 60
const PX_PER_MIN = 0.8 // 720 minute window → ~576px tall

export interface CalendarGridProps {
  appointments: readonly Appointment[]
  /** The day the grid is centred on. Week view shows the surrounding Sun–Sat. */
  date: Date
  view: 'day' | 'week'
  onSelect?: (appt: Appointment) => void
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** The appointment's calendar day. The live API carries `scheduledDate`; the
 *  fixtures do not, so those fall back to the grid's own day and stay visible
 *  in the demo rather than vanishing. */
function apptDate(appt: Appointment, fallback: Date): Date {
  const raw = (appt as { scheduledDate?: string | null }).scheduledDate
  if (!raw) return fallback
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

function Block({
  appt,
  onSelect,
  rtl,
}: {
  appt: Appointment
  onSelect?: (appt: Appointment) => void
  rtl: boolean
}) {
  const start = minuteOf(appt) as number
  const tint = serviceTint(appt.svc)
  const top = (Math.max(start, DAY_START) - DAY_START) * PX_PER_MIN
  const height = Math.max(24, Math.min(durationOf(appt), DAY_END - start) * PX_PER_MIN)
  const body = (
    <>
      <span className="block truncate text-[11px] font-semibold">{appt.cust}</span>
      <span className="block truncate text-[10px] opacity-80">{appt.svc}</span>
    </>
  )
  const style = {
    top,
    height,
    background: tint.bg,
    color: tint.fg,
    borderInlineStart: `3px solid ${tint.fg}`,
  }
  const className =
    'absolute inset-x-1 overflow-hidden rounded-md px-1.5 py-1 text-start ' +
    (onSelect ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue' : '')
  if (onSelect) {
    return (
      <button type="button" dir={rtl ? 'rtl' : 'ltr'} onClick={() => onSelect(appt)} className={cn(className, 'border-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2')} style={style}>
        {body}
      </button>
    )
  }
  return (
    <div className={className} style={style}>
      {body}
    </div>
  )
}

export function CalendarGrid({ appointments, date, view, onSelect }: CalendarGridProps) {
  const { t, rtl } = usePreferences()

  const hours = useMemo(() => {
    const out: number[] = []
    for (let m = DAY_START; m <= DAY_END; m += 60) out.push(m)
    return out
  }, [])

  const placeable = useMemo(
    () => appointments.filter((a) => minuteOf(a) !== null),
    [appointments]
  )

  const gridHeight = (DAY_END - DAY_START) * PX_PER_MIN

  if (view === 'day') {
    const forDay = placeable.filter((a) => sameDay(apptDate(a, date), date))
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid grid-cols-[56px_1fr]">
          <div className="relative" style={{ height: gridHeight }}>
            {hours.map((m) => (
              <div
                key={m}
                className="absolute inset-x-0 -translate-y-1/2 pe-2 text-end font-mono text-[10px] text-muted"
                style={{ top: (m - DAY_START) * PX_PER_MIN }}
                dir="ltr"
              >
                {labelOfMinute(m)}
              </div>
            ))}
          </div>
          <div className="relative border-0 border-s border-solid border-border" style={{ height: gridHeight }}>
            {hours.map((m) => (
              <div
                key={m}
                className="absolute inset-x-0 border-0 border-t border-solid border-border"
                style={{ top: (m - DAY_START) * PX_PER_MIN }}
              />
            ))}
            {forDay.length === 0 ? (
              <p className="absolute inset-x-0 top-6 text-center text-[13px] text-muted">
                {t('No appointments on this day')}
              </p>
            ) : (
              forDay.map((appt) => (
                <Block key={appt._id ?? `${appt.cust}-${minuteOf(appt)}`} appt={appt} onSelect={onSelect} rtl={rtl} />
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // Week view — Sun–Sat around `date`.
  const weekStart = new Date(date)
  weekStart.setDate(date.getDate() - date.getDay())
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
  const dayNames = rtl
    ? ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-[56px_repeat(7,1fr)] border-0 border-b border-solid border-border">
          <div />
          {days.map((d, i) => {
            const today = sameDay(d, new Date())
            return (
              <div
                key={i}
                className={cn(
                  'border-0 border-s border-solid border-border py-2 text-center',
                  today && 'bg-salis-blue/[.06]'
                )}
              >
                <p className="font-action text-[11px] text-muted">{dayNames[i]}</p>
                <p className={cn('mt-0.5 text-lg font-bold', today ? 'text-salis-blue' : 'text-heading')}>
                  {d.getDate()}
                </p>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-[56px_repeat(7,1fr)]">
          <div className="relative" style={{ height: gridHeight }}>
            {hours.map((m) => (
              <div
                key={m}
                className="absolute inset-x-0 -translate-y-1/2 pe-2 text-end font-mono text-[10px] text-muted"
                style={{ top: (m - DAY_START) * PX_PER_MIN }}
                dir="ltr"
              >
                {labelOfMinute(m)}
              </div>
            ))}
          </div>
          {days.map((d, i) => {
            const forDay = placeable.filter((a) => sameDay(apptDate(a, date), d))
            return (
              <div
                key={i}
                className="relative border-0 border-s border-solid border-border"
                style={{ height: gridHeight }}
              >
                {hours.map((m) => (
                  <div
                    key={m}
                    className="absolute inset-x-0 border-0 border-t border-solid border-border"
                    style={{ top: (m - DAY_START) * PX_PER_MIN }}
                  />
                ))}
                {forDay.map((appt) => (
                  <Block key={appt._id ?? `${appt.cust}-${minuteOf(appt)}`} appt={appt} onSelect={onSelect} rtl={rtl} />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
