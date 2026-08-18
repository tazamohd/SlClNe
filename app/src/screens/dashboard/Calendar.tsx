import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function Calendar() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const appointments = useCollection('appointments')
  const rows = (appointments.data ?? []) as unknown as readonly Record<string, string>[]

  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(7)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const appointmentsByDay = useMemo(() => {
    const map = new Map<number, typeof rows>()
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    for (const row of rows) {
      const d = row.scheduledDate ?? row.date ?? ''
      if (d.startsWith(prefix)) {
        const day = parseInt(d.slice(8, 10), 10)
        const existing = map.get(day) ?? []
        map.set(day, [...existing, row])
      }
    }
    return map
  }, [rows, year, month])

  const selectedAppointments = selectedDay ? (appointmentsByDay.get(selectedDay) ?? []) : []

  function prevMonth() {
    if (month === 0) { setYear(year - 1); setMonth(11) }
    else setMonth(month - 1)
    setSelectedDay(null)
  }
  function nextMonth() {
    if (month === 11) { setYear(year + 1); setMonth(0) }
    else setMonth(month + 1)
    setSelectedDay(null)
  }

  const calendarGrid = (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={prevMonth} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-transparent text-muted hover:bg-inset" aria-label={t('Previous month')}>
          <Icon name="ChevronLeft" size={16} />
        </button>
        <h3 className="font-display text-base font-bold text-heading">{t(MONTHS[month])} {year}</h3>
        <button type="button" onClick={nextMonth} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-transparent text-muted hover:bg-inset" aria-label={t('Next month')}>
          <Icon name="ChevronRight" size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAYS.map((d) => (
          <div key={d} className="pb-2 text-[11px] font-medium text-muted">{t(d)}</div>
        ))}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const hasAppts = appointmentsByDay.has(day)
          const isSelected = selectedDay === day
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={
                'relative flex h-9 w-full cursor-pointer items-center justify-center rounded-lg border-none text-sm transition-colors ' +
                (isSelected
                  ? 'bg-salis-gradient font-bold text-white'
                  : hasAppts
                    ? 'bg-[rgba(10,94,215,.06)] font-medium text-heading hover:bg-[rgba(10,94,215,.12)]'
                    : 'bg-transparent text-body hover:bg-inset')
              }
            >
              {day}
              {hasAppts && !isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-salis-blue" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="CalendarDays" title={t('Calendar')} subtitle={t('Schedule')} />
        <MobileCard>{calendarGrid}</MobileCard>
        {selectedDay && (
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold text-heading">
              {t(MONTHS[month])} {selectedDay}, {year}
            </h4>
            {selectedAppointments.length === 0 ? (
              <p className="text-xs text-muted">{t('No appointments')}</p>
            ) : (
              selectedAppointments.map((a, i) => (
                <MobileCard key={i}>
                  <MobileCardHeader
                    leading={
                      <div className="flex items-center gap-2">
                        <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Clock" size={14} /></span>
                        <div>
                          <p className="text-[13px] font-semibold text-heading">{a.customerName ?? t('Appointment')}</p>
                          <p className="text-xs text-muted">{a.scheduledTime ?? a.time ?? '—'}</p>
                        </div>
                      </div>
                    }
                  />
                </MobileCard>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="CalendarDays" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Calendar')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Schedule')}</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_340px] items-start gap-6">
        <Card className="rounded-2xl p-6 shadow-sm">{calendarGrid}</Card>
        <Card className="rounded-2xl p-5 shadow-sm">
          <h3 className="mb-3 text-[15px] font-bold text-heading">
            {selectedDay ? `${t(MONTHS[month])} ${selectedDay}, ${year}` : t('Select a day')}
          </h3>
          {!selectedDay ? (
            <p className="text-sm text-muted">{t('Click a day to see appointments')}</p>
          ) : selectedAppointments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Icon name="CalendarX" size={32} className="text-muted" />
              <p className="text-sm text-muted">{t('No appointments')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {selectedAppointments.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border p-3">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Clock" size={14} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-heading">{a.customerName ?? t('Appointment')}</p>
                    <p className="text-xs text-muted">{a.scheduledTime ?? a.time ?? '—'} · {a.serviceType ?? a.type ?? ''}</p>
                  </div>
                  <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{a.status ?? t('Scheduled')}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
