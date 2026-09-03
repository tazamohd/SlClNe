import { useMemo } from 'react'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Avatar } from '@/components/ui/Avatar'
import { durationOf, labelOfMinute, minuteOf, serviceTint, type Appointment } from './schedule'

/** A row × hour timeline: one lane per technician (or bay), the working day
 *  across, each booking drawn where its minutes fall.
 *
 *  `CalendarGrid` draws time top-to-bottom for a day or a week and has no
 *  notion of lanes, so this is its sibling for the question "who is doing
 *  what, when": the same minute maths, the same service tints, turned on its
 *  side. Blocks are buttons when `onSelect` is given, so a tap opens the
 *  booking; the lane label column stays put while the day scrolls sideways on
 *  a phone. */
const DAY_START = 7 * 60
const DAY_END = 19 * 60
const HOUR_WIDTH = 96
const LANE_HEIGHT = 56

export interface TimelineLane {
  id: string
  label: string
  caption?: string
  items: readonly Appointment[]
}

export function ScheduleTimeline({
  lanes,
  onSelect,
  label,
  className,
}: {
  lanes: readonly TimelineLane[]
  onSelect?: (appt: Appointment) => void
  /** English source string naming the grid for assistive tech. */
  label: string
  className?: string
}) {
  const { t } = usePreferences()
  const hours = useMemo(() => {
    const out: number[] = []
    for (let minute = DAY_START; minute < DAY_END; minute += 60) out.push(minute)
    return out
  }, [])
  const trackWidth = hours.length * HOUR_WIDTH

  return (
    <div
      role="table"
      aria-label={t(label)}
      className={cn('overflow-x-auto rounded-xl border border-border bg-card', className)}
    >
      <div className="min-w-max">
        <div role="row" className="flex border-0 border-b border-solid border-border">
          <div role="columnheader" className="sticky start-0 z-[1] w-[160px] flex-shrink-0 bg-card px-3 py-2 font-action text-[11px] text-muted">
            {t('Technician')}
          </div>
          <div role="columnheader" className="relative" style={{ width: trackWidth }} dir="ltr">
            {hours.map((minute, index) => (
              <span
                key={minute}
                className="absolute top-2 font-mono text-[11px] text-muted"
                style={{ left: index * HOUR_WIDTH + 4 }}
              >
                {labelOfMinute(minute)}
              </span>
            ))}
            <span className="block h-7" aria-hidden />
          </div>
        </div>

        {lanes.map((lane) => (
          <div key={lane.id} role="row" className="flex border-0 border-b border-solid border-border last:border-b-0">
            <div role="rowheader" className="sticky start-0 z-[1] flex w-[160px] flex-shrink-0 items-center gap-2 bg-card px-3" style={{ height: LANE_HEIGHT }}>
              <Avatar name={lane.label} size={28} />
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold text-heading">{lane.label}</span>
                {lane.caption ? <span className="block truncate text-[11px] text-muted">{lane.caption}</span> : null}
              </span>
            </div>
            <div role="cell" className="relative" style={{ width: trackWidth, height: LANE_HEIGHT }} dir="ltr">
              {hours.map((minute, index) => (
                <span
                  key={minute}
                  aria-hidden
                  className="absolute inset-y-0 border-0 border-s border-solid border-border"
                  style={{ left: index * HOUR_WIDTH }}
                />
              ))}
              {lane.items.map((appt) => {
                const start = minuteOf(appt)
                if (start === null) return null
                const from = Math.max(start, DAY_START)
                const to = Math.min(start + durationOf(appt), DAY_END)
                if (to <= from) return null
                const left = ((from - DAY_START) / 60) * HOUR_WIDTH
                const width = Math.max(40, ((to - from) / 60) * HOUR_WIDTH - 4)
                const tint = serviceTint(appt.svc)
                const body = (
                  <>
                    <span className="block truncate text-[11px] font-semibold">{appt.cust}</span>
                    <span className="block truncate text-[11px] opacity-80">
                      {appt.svc}
                      {appt.bay ? ` · ${appt.bay}` : ''}
                    </span>
                  </>
                )
                const style = { left, width, background: tint.bg, color: tint.fg, borderInlineStart: `3px solid ${tint.fg}` }
                const shape = 'absolute top-1.5 bottom-1.5 overflow-hidden rounded-md px-2 py-1 text-start'
                return onSelect ? (
                  <button
                    key={appt._id ?? `${appt.cust}-${start}`}
                    type="button"
                    onClick={() => onSelect(appt)}
                    className={cn(shape, 'cursor-pointer border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2')}
                    style={style}
                  >
                    {body}
                  </button>
                ) : (
                  <div key={appt._id ?? `${appt.cust}-${start}`} className={shape} style={style}>
                    {body}
                  </div>
                )
              })}
              {lane.items.length === 0 ? (
                <span className="absolute inset-y-0 start-3 flex items-center text-[12px] text-muted">
                  {t('No jobs scheduled today')}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
