import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useDateFormat } from '@/lib/formatDate'
import { Icon } from './Icon'
import { Button } from './Button'

export interface CalendarEvent {
  id: string
  date: string
  label: string
  color?: string
  data?: unknown
}

export interface CalendarViewProps {
  events?: readonly CalendarEvent[]
  initialDate?: Date
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  renderDay?: (date: Date, dayEvents: readonly CalendarEvent[]) => ReactNode
  className?: string
}

const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function startWeekday(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function CalendarView({
  events = [],
  initialDate,
  onDateClick,
  onEventClick,
  renderDay,
  className,
}: CalendarViewProps) {
  const { t, rtl } = usePreferences()
  const { locale } = useDateFormat()
  const isMobile = useIsMobile()
  const [viewing, setViewing] = useState(() => initialDate ?? new Date())

  const year = viewing.getFullYear()
  const month = viewing.getMonth()
  const total = daysInMonth(year, month)
  const offset = startWeekday(year, month)

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>()
    for (const ev of events) {
      const d = new Date(ev.date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        const list = map.get(day)
        if (list) list.push(ev)
        else map.set(day, [ev])
      }
    }
    return map
  }, [events, year, month])

  const prev = () => setViewing(new Date(year, month - 1, 1))
  const next = () => setViewing(new Date(year, month + 1, 1))

  // Locale-aware, Gregorian with Latin digits in both languages (handoff §7).
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(viewing)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={rtl ? next : prev}
          aria-label={t('Previous month')}
        >
          <Icon name={rtl ? 'ChevronRight' : 'ChevronLeft'} size={16} />
        </Button>
        <h2 className="text-sm font-bold text-heading">{monthLabel}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={rtl ? prev : next}
          aria-label={t('Next month')}
        >
          <Icon name={rtl ? 'ChevronLeft' : 'ChevronRight'} size={16} />
        </Button>
      </div>

      <div className={cn('grid grid-cols-7', isMobile ? 'gap-1' : 'gap-2')}>
        {DAY_KEYS.map((d) => (
          <div key={d} className="py-1 text-center text-xs font-semibold text-muted">
            {t(d)}
          </div>
        ))}

        {Array.from({ length: offset }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {Array.from({ length: total }, (_, i) => {
          const day = i + 1
          const dayEvents = eventsByDay.get(day) ?? []
          const date = new Date(year, month, day)

          if (renderDay) {
            const Wrap = onDateClick ? 'button' : 'div'
            return (
              <Wrap
                key={day}
                type={onDateClick ? 'button' : undefined}
                onClick={onDateClick ? () => onDateClick(date) : undefined}
                className={onDateClick ? 'cursor-pointer border-none bg-transparent p-0 text-start' : undefined}
              >
                {renderDay(date, dayEvents)}
              </Wrap>
            )
          }

          const DayWrap = onDateClick ? 'button' : 'div'
          return (
            <DayWrap
              key={day}
              type={onDateClick ? 'button' : undefined}
              className={cn(
                'flex min-h-[48px] flex-col rounded-lg border border-border p-1',
                onDateClick && 'cursor-pointer bg-transparent hover:border-salis-blue'
              )}
              onClick={onDateClick ? () => onDateClick(date) : undefined}
            >
              <span className="text-xs text-body">{day}</span>
              {dayEvents.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  className={cn(
                    'mt-0.5 truncate rounded border-none px-1 text-start text-[10px] font-medium text-white',
                    onEventClick ? 'cursor-pointer' : 'pointer-events-none'
                  )}
                  style={{ background: ev.color ?? 'var(--salis-blue)' }}
                  onClick={
                    onEventClick
                      ? (e) => {
                          e.stopPropagation()
                          onEventClick(ev)
                        }
                      : undefined
                  }
                >
                  {isMobile ? '' : t(ev.label)}
                </button>
              ))}
            </DayWrap>
          )
        })}
      </div>
    </div>
  )
}
