import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { CalendarGrid } from './CalendarGrid'
import { AppointmentForm } from './AppointmentForm'
import type { Appointment } from './schedule'

/** The appointment calendar — a day / week time grid over `appointments`.
 *
 *  The grid is `CalendarGrid`, kept in this boundary and reusable. "New
 *  Appointment" opens a real create that the server double-book rule guards;
 *  it is gated on `appointments:c` so a role that may only view the board does
 *  not see a button that would 403.
 *
 *  Month view is deliberately absent: the design implements only day and week,
 *  and a Month tab with nothing behind it would be a placeholder. */
export function AppointmentCalendar() {
  const { t, rtl } = usePreferences()
  const { can } = useSession()
  const appointments = useCollection('appointments')
  const [view, setView] = useState<'day' | 'week'>('week')
  const [cursor, setCursor] = useState(() => new Date())
  const [booking, setBooking] = useState(false)

  const rows = (appointments.data ?? []) as readonly Appointment[]

  function shift(direction: -1 | 1) {
    setCursor((current) => {
      const next = new Date(current)
      next.setDate(current.getDate() + direction * (view === 'week' ? 7 : 1))
      return next
    })
  }

  const dateLabel = new Intl.DateTimeFormat(rtl ? 'ar' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(cursor)

  return (
    <div className="flex animate-fade-up flex-col gap-5 motion-reduce:animate-none">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-salis-gradient text-white shadow-[0_8px_20px_rgba(10,94,215,.25)]">
            <Icon name="Calendar" size={24} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-black text-heading">{t('Calendar')}</h1>
            <p className="mt-0.5 text-sm text-muted">{t('Appointments')}</p>
          </div>
        </div>

        <span className="flex-1" />

        <div className="flex overflow-hidden rounded-lg border border-border" role="tablist" aria-label={t('View')}>
          {(['day', 'week'] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={view === option}
              onClick={() => setView(option)}
              className={
                'h-9 cursor-pointer px-4 font-action text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-salis-blue ' +
                (view === option ? 'border-none bg-salis-gradient text-white' : 'bg-card text-body')
              }
            >
              {t(option === 'day' ? 'Day' : 'Week')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t('Previous')}
            onClick={() => shift(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted hover:border-salis-blue hover:text-salis-blue"
          >
            <Icon name={rtl ? 'ChevronRight' : 'ChevronLeft'} size={16} />
          </button>
          <span className="min-w-[150px] text-center font-display text-[15px] font-bold text-heading">
            {dateLabel}
          </span>
          <button
            type="button"
            aria-label={t('Next')}
            onClick={() => shift(1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted hover:border-salis-blue hover:text-salis-blue"
          >
            <Icon name={rtl ? 'ChevronLeft' : 'ChevronRight'} size={16} />
          </button>
          <Button variant="subtle" size="sm" onClick={() => setCursor(new Date())}>
            {t('Today')}
          </Button>
        </div>

        {can('appointments', 'c') ? (
          <Button size="md" onClick={() => setBooking(true)}>
            <Icon name="Plus" size={16} />
            {t('New Appointment')}
          </Button>
        ) : null}
      </div>

      {appointments.isError ? (
        <ErrorState
          title={t("Couldn't load this")}
          description={appointments.error?.message}
          onRetry={() => void appointments.refetch()}
        />
      ) : appointments.isLoading ? (
        <Card className="p-6">
          <Loading label="Loading appointments..." />
        </Card>
      ) : (
        <CalendarGrid appointments={rows} date={cursor} view={view} />
      )}

      <AppointmentForm open={booking} onClose={() => setBooking(false)} />
    </div>
  )
}
