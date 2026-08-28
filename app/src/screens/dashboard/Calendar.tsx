import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { CalendarView, type CalendarEvent } from '@/components/ui/CalendarView'
import { useIsMobile } from '@/lib/useMediaQuery'
import { ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const

export function Calendar() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data: rawAppts = [], isLoading, isError, error, refetch } = useCollection('appointments')
  const rows = rawAppts as unknown as readonly Record<string, string>[]
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const events: CalendarEvent[] = useMemo(() => {
    return rows
      .map((a, i) => {
        const d = a.scheduledDate ?? a.date ?? ''
        if (!d) return null
        return {
          id: `appt-${i}`,
          date: d,
          label: a.customerName ?? t('Appointment'),
          data: a,
        }
      })
      .filter(Boolean) as CalendarEvent[]
  }, [rows, t])

  const selectedAppointments = useMemo(() => {
    if (!selectedDay) return []
    const y = selectedDay.getFullYear()
    const m = selectedDay.getMonth()
    const d = selectedDay.getDate()
    return events.filter((ev) => {
      const date = new Date(ev.date)
      return date.getFullYear() === y && date.getMonth() === m && date.getDate() === d
    })
  }, [selectedDay, events])

  const handleDateClick = (date: Date) => {
    setSelectedDay(date)
  }

  const renderDay = (date: Date, dayEvents: readonly CalendarEvent[]) => {
    const day = date.getDate()
    const isSelected = selectedDay && selectedDay.getDate() === day &&
      selectedDay.getMonth() === date.getMonth() && selectedDay.getFullYear() === date.getFullYear()
    const hasAppts = dayEvents.length > 0
    return (
      <div
        className={
          'relative flex h-9 w-full items-center justify-center rounded-lg text-sm transition-colors ' +
          (isSelected
            ? 'bg-salis-gradient font-bold text-white'
            : hasAppts
              ? 'bg-salis-blue/[.06] font-medium text-heading hover:bg-salis-blue/[.12]'
              : 'bg-transparent text-body hover:bg-inset')
        }
      >
        {day}
        {hasAppts && !isSelected && (
          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-salis-blue" />
        )}
      </div>
    )
  }

  const monthLabel = selectedDay
    ? `${t(MONTHS[selectedDay.getMonth()])} ${selectedDay.getDate()}, ${selectedDay.getFullYear()}`
    : null

  if (isLoading) return <Loading label={t('Loading calendar...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="CalendarDays" title={t('Calendar')} subtitle={t('Schedule')} />
        <MobileCard>
          <CalendarView
            events={events}
            initialDate={new Date(2026, 7, 1)}
            onDateClick={handleDateClick}
            renderDay={renderDay}
          />
        </MobileCard>
        {selectedDay && (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-heading">{monthLabel}</h2>
            {selectedAppointments.length === 0 ? (
              <p className="text-xs text-muted">{t('No appointments')}</p>
            ) : (
              selectedAppointments.map((ev) => {
                const a = ev.data as Record<string, string>
                return (
                  <MobileCard key={ev.id}>
                    <MobileCardHeader
                      leading={
                        <div className="flex items-center gap-2">
                          <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Clock" size={14} /></span>
                          <div>
                            <p className="text-[13px] font-semibold text-heading">{a.customerName ?? t('Appointment')}</p>
                            <p className="text-xs text-muted">{a.scheduledTime ?? a.time ?? '—'}</p>
                          </div>
                        </div>
                      }
                    />
                  </MobileCard>
                )
              })
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="CalendarDays" title={t('Calendar')} subtitle={t('Schedule')} />

      <div className="grid grid-cols-[1fr_340px] items-start gap-6">
        <Card className="rounded-2xl p-6 shadow-sm">
          <CalendarView
            events={events}
            initialDate={new Date(2026, 7, 1)}
            onDateClick={handleDateClick}
            renderDay={renderDay}
          />
        </Card>
        <Card className="rounded-2xl p-5 shadow-sm">
          <h2 className="mb-3 text-[15px] font-bold text-heading">
            {monthLabel ?? t('Select a day')}
          </h2>
          {!selectedDay ? (
            <p className="text-sm text-muted">{t('Click a day to see appointments')}</p>
          ) : selectedAppointments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Icon name="CalendarX" size={32} className="text-muted" />
              <p className="text-sm text-muted">{t('No appointments')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {selectedAppointments.map((ev) => {
                const a = ev.data as Record<string, string>
                return (
                  <div key={ev.id} className="flex items-center gap-2.5 rounded-lg border border-border p-3">
                    <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden><Icon name="Clock" size={14} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-heading">{a.customerName ?? t('Appointment')}</p>
                      <p className="text-xs text-muted">{a.scheduledTime ?? a.time ?? '—'} · {a.serviceType ?? a.type ?? ''}</p>
                    </div>
                    <Badge background="var(--tint-blue)" color="var(--salis-blue)">{a.status ?? t('Scheduled')}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
