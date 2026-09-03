import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useDateFormat } from '@/lib/formatDate'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { CalendarGrid } from './CalendarGrid'
import { AppointmentForm } from './AppointmentForm'
import type { Appointment } from './schedule'

type View = 'day' | 'week'

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
  const { date } = useDateFormat()
  const appointments = useCollection('appointments')
  const [view, setView] = useState<View>('week')
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

  const navButton =
    'flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-muted transition-colors hover:border-salis-blue hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2'

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <div role="group" aria-label={t('View')} className="flex overflow-hidden rounded-lg border border-border">
        {(['day', 'week'] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={view === option}
            onClick={() => setView(option)}
            className={cn(
              'h-10 min-w-[64px] cursor-pointer px-4 font-action text-xs font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-salis-blue',
              view === option ? 'border-none bg-salis-gradient text-white' : 'bg-card text-body hover:text-salis-blue'
            )}
          >
            {t(option === 'day' ? 'Day' : 'Week')}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button type="button" aria-label={t('Previous')} onClick={() => shift(-1)} className={navButton}>
          <Icon name={rtl ? 'ChevronRight' : 'ChevronLeft'} size={16} />
        </button>
        <span className="min-w-[150px] text-center font-display text-[15px] font-bold text-heading">
          {date(cursor)}
        </span>
        <button type="button" aria-label={t('Next')} onClick={() => shift(1)} className={navButton}>
          <Icon name={rtl ? 'ChevronLeft' : 'ChevronRight'} size={16} />
        </button>
        <Button variant="subtle" size="md" onClick={() => setCursor(new Date())}>
          {t('Today')}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <ScreenFrame
        icon="Calendar"
        title="Calendar"
        subtitle={t('Appointments')}
        actions={
          can('appointments', 'c') ? (
            <Button size="md" icon="Plus" onClick={() => setBooking(true)}>
              {t('New Appointment')}
            </Button>
          ) : undefined
        }
        toolbar={toolbar}
        query={appointments}
        skeleton="cards"
      >
        <CalendarGrid appointments={rows} date={cursor} view={view} />
      </ScreenFrame>
      <AppointmentForm open={booking} onClose={() => setBooking(false)} />
    </>
  )
}
