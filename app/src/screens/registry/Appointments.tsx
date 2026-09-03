import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { useCommand, type Command } from '@/components/shell/commands'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { Icon } from '@/components/ui/Icon'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { AppointmentForm } from '@/screens/workshop/AppointmentForm'
import { rowId } from './writes'

type Appointment = RowOf<'appointments'>

/** Booking status palette. No-show is the one that needs chasing, so it takes
 *  the warning orange; confirmed and awaiting sit on the blue scale. */
const STATUS: Record<string, readonly [string, string]> = {
  confirmed: ['var(--tint-blue)', 'var(--salis-blue)'],
  awaiting: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  'no-show': ['var(--tint-orange)', 'var(--salis-orange)'],
}

const FILTERS = ['all', 'confirmed', 'awaiting', 'no-show'] as const

/** The three ways to look at the book. List is this screen; Day and Week are
 *  the calendar, which keeps the same `?view=` so the choice survives the hop. */
const VIEWS = [
  { id: 'list', label: 'List', icon: 'List' },
  { id: 'day', label: 'Day', icon: 'CalendarDays' },
  { id: 'week', label: 'Week', icon: 'CalendarRange' },
] as const
type View = (typeof VIEWS)[number]['id']

function statusLabel(value: string): string {
  return value === 'all' ? 'All' : value === 'no-show' ? 'No Show' : value[0].toUpperCase() + value.slice(1)
}

/** The appointment book.
 *
 *  The design shipped "New Appointment" as a dead button and the status chips
 *  as decoration. Here the button opens the same booking form the calendar
 *  uses (so the bay double-booking rule runs on both), the chips filter, a row
 *  opens a side panel with the booking and a "Check in" that hands the vehicle
 *  to the workshop, and the `List | Day | Week` control is remembered in the
 *  URL. */
export function Appointments() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const appointmentsQuery = useCollection('appointments')
  const appointments = appointmentsQuery.data ?? []
  const [filter, setFilter] = useState<string>('all')
  const [booking, setBooking] = useState(false)
  const [editing, setEditing] = useState<Appointment | undefined>(undefined)
  const [open, setOpen] = useState<Appointment | undefined>(undefined)

  const view: View = (VIEWS.find((v) => v.id === params.get('view'))?.id ?? 'list') as View
  const mayBook = can('appointments', 'c')
  const mayEdit = can('appointments', 'e')
  const mayCheckIn = can('jobcards', 'c')

  const filtered = useMemo(
    () => (filter === 'all' ? appointments : appointments.filter((a) => a.status === filter)),
    [appointments, filter]
  )

  const commands = useMemo<Command[]>(
    () =>
      mayBook
        ? [
            {
              id: 'appointments:new',
              label: 'New Appointment',
              icon: 'CalendarPlus',
              group: 'create',
              keywords: ['booking', 'appointment', 'schedule', 'new'],
              shortcut: 'N',
              run: () => setBooking(true),
            },
          ]
        : [],
    [mayBook]
  )
  useCommand(commands)

  const selectView = (next: View) => {
    if (next === 'list') {
      const search = new URLSearchParams(params)
      search.set('view', 'list')
      setParams(search, { replace: true })
      return
    }
    navigate(`/appointment-calendar?view=${next}`)
  }

  const statusBadge = (value: string) => {
    const [bg, fg] = STATUS[value] ?? STATUS.awaiting
    return (
      <Badge background={bg} color={fg}>
        {t(statusLabel(value))}
      </Badge>
    )
  }

  const columns: Column<Appointment>[] = [
    {
      header: 'Time',
      cell: (a) => <span className="font-mono text-[13px]" dir="ltr">{a.time}</span>,
      sortValue: (a) => a.time,
    },
    { header: 'Customer', cell: (a) => a.cust, sortValue: (a) => a.cust },
    { header: 'Vehicle', cell: (a) => a.veh, sortValue: (a) => a.veh },
    { header: 'Plate', cell: (a) => a.plate, code: true, sortValue: (a) => a.plate },
    { header: 'Service', cell: (a) => t(a.svc), sortValue: (a) => a.svc },
    { header: 'Bay', cell: (a) => a.bay, sortValue: (a) => a.bay },
    { header: 'Technician', cell: (a) => a.tech, sortValue: (a) => a.tech },
    {
      header: 'Duration',
      cell: (a) => `${a.mins}m`,
      numeric: true,
      sortValue: (a) => Number(a.mins),
    },
    { header: 'Status', cell: (a) => statusBadge(a.status), sortValue: (a) => a.status },
  ]

  const checkInRoute = (a: Appointment) =>
    `/workshop-check-in?id=${encodeURIComponent(rowId(a) ?? a.plate)}`

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <ChipGroup label={t('Status')}>
        {FILTERS.map((option) => {
          const count =
            option === 'all' ? appointments.length : appointments.filter((a) => a.status === option).length
          return (
            <Chip
              key={option}
              label={`${t(statusLabel(option))} ${count}`}
              selected={filter === option}
              onToggle={() => setFilter(option)}
            />
          )
        })}
      </ChipGroup>
      <div role="radiogroup" aria-label={t('View')} className="inline-flex rounded-lg border border-border bg-inset p-0.5">
        {VIEWS.map((option) => {
          const selected = view === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => selectView(option.id)}
              className={cn(
                'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border-none px-3 font-action text-xs font-semibold transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue',
                selected ? 'bg-card text-salis-blue shadow-sm' : 'bg-transparent text-muted hover:text-heading'
              )}
            >
              <Icon name={option.icon} size={14} />
              {t(option.label)}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      <ScreenFrame
        variant="quiet"
        eyebrow={t('Front Desk')}
        title={t('Appointments')}
        actions={
          mayBook ? (
            <Button size="md" icon="Plus" onClick={() => setBooking(true)}>
              {t('New Appointment')}
            </Button>
          ) : null
        }
        query={appointmentsQuery}
        skeleton="table"
        toolbar={toolbar}
      >
        <DataTable
          caption="Appointments"
          columns={columns}
          rows={filtered}
          rowKey={(a, index) => rowId(a) ?? `${a.plate}-${index}`}
          onRowClick={(a) => setOpen(a)}
          mobileCard={(a) => (
            <>
              <MobileCardHeader title={a.time} code trailing={statusBadge(a.status)} />
              <MobileCardRow>{a.cust}</MobileCardRow>
              <MobileCardRow>
                {a.veh} · <span className="font-mono" dir="ltr">{a.plate}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Service')}>{t(a.svc)}</MobileCardRow>
              <MobileCardRow label={t('Bay')}>
                {a.bay} · {a.tech}
              </MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="CalendarX"
              title={t('No appointments in this view')}
              description={t('Try another status filter, or add a booking.')}
              action={
                mayBook && filter === 'all' ? (
                  <Button size="md" icon="Plus" onClick={() => setBooking(true)}>
                    {t('New Appointment')}
                  </Button>
                ) : null
              }
            />
          }
        />
      </ScreenFrame>

      <Drawer open={Boolean(open)} onClose={() => setOpen(undefined)} title={t('Appointment')} width="w-full sm:w-96">
        {open ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-xl font-black text-heading">{open.cust}</p>
                <p className="mt-0.5 text-[13px] text-muted">
                  {open.veh} · <span className="font-mono" dir="ltr">{open.plate}</span>
                </p>
              </div>
              {statusBadge(open.status)}
            </div>

            <dl className="m-0 grid grid-cols-2 gap-3">
              <Detail label={t('Time')} value={<span className="font-mono" dir="ltr">{open.time}</span>} />
              <Detail label={t('Duration')} value={<span className="font-mono" dir="ltr">{open.mins}m</span>} />
              <Detail label={t('Service')} value={t(open.svc)} />
              <Detail label={t('Bay')} value={open.bay} />
              <Detail label={t('Technician')} value={open.tech} />
            </dl>

            <div className="flex flex-col gap-2">
              {mayCheckIn ? (
                <Button size="lg" icon="LogIn" className="w-full" onClick={() => navigate(checkInRoute(open))}>
                  {t('Check in')}
                </Button>
              ) : null}
              {mayEdit ? (
                <Button
                  variant="outline"
                  size="md"
                  icon="Pencil"
                  className="w-full"
                  onClick={() => {
                    setEditing(open)
                    setOpen(undefined)
                  }}
                >
                  {t('Edit booking')}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </Drawer>

      {booking ? <AppointmentForm open onClose={() => setBooking(false)} /> : null}
      {editing ? (
        <AppointmentForm open onClose={() => setEditing(undefined)} existingRecord={editing} />
      ) : null}
    </>
  )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-inset p-3">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="m-0 mt-0.5 text-[13px] font-semibold text-heading">{value}</dd>
    </div>
  )
}
