import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Form, FormErrorSummary, ServerValidationError, useZodForm } from '@/components/ui/Form'
import { ErrorState, Loading, ReadOnlyNotice } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, useCreate, type RowOf } from '@/data/useCollection'
import { isLive, RepositoryError } from '@/data/repository'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/cn'
import { minuteOf, todayIso, type AppointmentRow, type VehicleRow } from './portal-data'

/** Book an appointment — `CustomerPortal.Booking.dc.html`: pick a vehicle, a
 *  service, a day and a slot, and confirm. The confirmation is a real
 *  `POST /appointments`; the success panel shows the row **as the server
 *  created it**, and nothing on this screen claims a booking the server did
 *  not persist. A build with no API says so up front and disables the confirm,
 *  the same stance every workshop stage screen takes.
 *
 *  The server re-validates everything (schema, bay overlap, tenancy). A slot
 *  that was free while the form was open and taken by the time it is submitted
 *  comes back as a rule violation, and lands on the time field as "pick
 *  another slot" — the double-booking rule doing its job, not an error case to
 *  hide. */

const WALK_IN_BAY = 'Bay 1'
const DEFAULT_DURATION_MINS = 60
const DAYS_OFFERED = 7

const SLOT_TIMES = [
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
] as const

const bookingSchema = z.object({
  vehicle: z.string().min(1, 'Choose a vehicle'),
  service: z.string().min(1, 'Choose a service'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a day'),
  time: z.string().min(1, 'Choose a time'),
  notes: z.string().max(500, 'Notes are limited to 500 characters'),
})

type BookingValues = z.infer<typeof bookingSchema>

export function CustomerPortalBooking() {
  const { t, rtl, language } = usePreferences()
  const { user, userName } = useSession()

  const vehicles = useCollection('vehicles')
  const services = useCollection('services')
  const appointments = useCollection('appointments')
  const create = useCreate('appointments')

  const [confirmed, setConfirmed] = useState<AppointmentRow | null>(null)

  const days = useMemo(() => upcomingDays(DAYS_OFFERED, language), [language])

  const form = useZodForm<BookingValues, BookingValues>({
    schema: bookingSchema,
    initial: { vehicle: '', service: '', date: days[0]?.iso ?? todayIso(), time: '', notes: '' },
    async onSubmit(values) {
      const vehicle = vehicleRows.find((row) => row.plate === values.vehicle)
      try {
        const created = await create.mutateAsync({
          /* The **create schema's** keys, not the row's display keys — the
           * server presents the row back in display shape. */
          input: {
            scheduledDate: values.date,
            timeLabel: values.time,
            startMinute: minuteOf(values.time),
            durationMins: DEFAULT_DURATION_MINS,
            customerName: user?.name ?? userName,
            vehicleLabel: vehicle?.make ?? values.vehicle,
            plate: vehicle?.plate ?? values.vehicle,
            serviceLabel: values.service,
            /* Walk-in bookings land in the reception bay; dispatch reassigns
             * the bay when the day is planned. The server's overlap check runs
             * against this value, so a taken slot is refused, not overwritten. */
            bay: WALK_IN_BAY,
            status: 'awaiting',
          } as unknown as Partial<RowOf<'appointments'>>,
        })
        setConfirmed(created as AppointmentRow)
      } catch (cause) {
        throw asFormError(cause, t)
      }
    },
  })

  const vehicleRows = (vehicles.data ?? []) as readonly VehicleRow[]
  const serviceRows = (services.data ?? []) as readonly RowOf<'services'>[]

  /* Slots already taken in the reception bay on the chosen day — a hint; the
   * server's transaction is the authority. Fixture rows carry no date and are
   * treated as today's board, which is exactly what the fixtures are. */
  const taken = useMemo(() => {
    const rows = (appointments.data ?? []) as readonly AppointmentRow[]
    return new Set(
      rows
        .filter(
          (row) =>
            row.bay === WALK_IN_BAY &&
            row.status !== 'cancelled' &&
            (!row.scheduledDate || row.scheduledDate === form.values.date)
        )
        .map((row) => row.time)
    )
  }, [appointments.data, form.values.date])

  if (confirmed) {
    return (
      <BookingConfirmed
        row={confirmed}
        onAgain={() => {
          setConfirmed(null)
          form.reset({ vehicle: '', service: '', date: days[0]?.iso ?? todayIso(), time: '', notes: '' })
        }}
      />
    )
  }

  const steps = [
    { label: 'Vehicle', done: form.values.vehicle !== '' },
    { label: 'Service', done: form.values.service !== '' },
    { label: 'Time', done: form.values.time !== '' },
    { label: 'Confirm', done: false },
  ] as const
  const currentStep = steps.findIndex((step) => !step.done)

  return (
    <div className="flex max-w-[720px] animate-fade-up flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <Link
          to="/customer-portal"
          aria-label={t('Back to Home')}
          className="flex text-muted no-underline hover:no-underline"
        >
          <Icon name={rtl ? 'ChevronRight' : 'ChevronLeft'} size={20} />
        </Link>
        <h1 className="flex-1 font-display text-[17px] font-extrabold text-heading">
          {t('Book Appointment')}
        </h1>
      </div>

      {/* Step indicator. */}
      <ol className="m-0 flex list-none items-start p-0" aria-label={t('Book Appointment')}>
        {steps.map((step, index) => (
          <li key={step.label} className="flex flex-1 items-center">
            <span
              className="flex flex-shrink-0 flex-col items-center gap-1"
              aria-current={index === currentStep ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                  index === currentStep
                    ? 'bg-salis-gradient text-white'
                    : step.done
                      ? 'bg-salis-blue text-white'
                      : 'border-[1.5px] border-border bg-inset text-muted'
                )}
              >
                {step.done ? <Icon name="Check" size={11} strokeWidth={3} aria-label={t('Completed')} /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-[9px] font-semibold',
                  index === currentStep
                    ? 'text-salis-blue'
                    : step.done
                      ? 'text-heading'
                      : 'text-muted'
                )}
              >
                {t(step.label)}
              </span>
            </span>
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn('mx-1.5 mb-3.5 h-0.5 flex-1', step.done ? 'bg-salis-blue' : 'bg-border')}
              />
            ) : null}
          </li>
        ))}
      </ol>

      {!isLive ? (
        <ReadOnlyNotice
          message={t(
            'This build has no API configured, so a booking cannot be saved. Set VITE_API_URL to book for real.'
          )}
        />
      ) : null}

      <Form form={form}>
        <FormErrorSummary />

        {/* Vehicle. */}
        <Card className="flex flex-col gap-2.5 p-4">
          <PanelTitle icon="Car" title={t('Select Vehicle')} />
          {vehicles.isLoading ? (
            <Loading inline label="Loading vehicles..." />
          ) : vehicles.isError ? (
            <ErrorState
              description={vehicles.error?.message}
              onRetry={() => void vehicles.refetch()}
            />
          ) : vehicleRows.length === 0 ? (
            <p className="text-xs text-muted">
              {t('No vehicles on file — the front desk can register one for you.')}
            </p>
          ) : (
            <div role="radiogroup" aria-label={t('Select Vehicle')} className="flex flex-col gap-2">
              {vehicleRows.map((vehicle, index) => {
                const picked = form.values.vehicle === vehicle.plate
                return (
                  <button
                    key={vehicle._id ?? `${vehicle.plate}-${index}`}
                    type="button"
                    role="radio"
                    aria-checked={picked}
                    onClick={() => {
                      form.setValue('vehicle', vehicle.plate)
                      form.markTouched('vehicle')
                    }}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-none p-2.5 text-start font-action transition-colors',
                      picked
                        ? 'bg-salis-blue/[.08] text-salis-blue'
                        : 'bg-inset text-body hover:bg-salis-blue/[.04]'
                    )}
                  >
                    <span className="flex flex-shrink-0 rounded-lg bg-salis-blue/[.08] p-1.5 text-salis-blue">
                      <Icon name="Car" size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">
                        {vehicle.make}
                      </span>
                      <span className="block font-mono text-[10px] opacity-70" dir="ltr">
                        {vehicle.plate}
                      </span>
                    </span>
                    {picked ? <Icon name="CheckCircle" size={16} aria-label={t('Selected')} /> : null}
                  </button>
                )
              })}
            </div>
          )}
          <FieldMessage form={form} name="vehicle" />
        </Card>

        {/* Service. */}
        <Card className="flex flex-col gap-2.5 p-4">
          <PanelTitle icon="Wrench" title={t('Select Service')} />
          {services.isLoading ? (
            <Loading inline label="Loading services..." />
          ) : services.isError ? (
            <ErrorState
              description={services.error?.message}
              onRetry={() => void services.refetch()}
            />
          ) : (
            <div role="radiogroup" aria-label={t('Select Service')} className="flex flex-wrap gap-2">
              {serviceRows.map(([icon, label]) => {
                const picked = form.values.service === label
                return (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={picked}
                    onClick={() => {
                      form.setValue('service', label)
                      form.markTouched('service')
                    }}
                    className={cn(
                      'flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-3.5 py-2 font-action text-xs font-semibold transition-colors',
                      picked
                        ? 'bg-salis-gradient text-white'
                        : 'bg-inset text-body hover:bg-salis-blue/[.06]'
                    )}
                  >
                    <Icon name={icon} size={14} />
                    {t(label)}
                  </button>
                )
              })}
            </div>
          )}
          <FieldMessage form={form} name="service" />
        </Card>

        {/* Day and time. */}
        <Card className="flex flex-col gap-3 p-4">
          <PanelTitle icon="Calendar" title={t('Date & Time')} />
          <div
            role="radiogroup"
            aria-label={t('Date & Time')}
            className="flex gap-1.5 overflow-x-auto pb-1"
          >
            {days.map((day) => {
              const picked = form.values.date === day.iso
              return (
                <button
                  key={day.iso}
                  type="button"
                  role="radio"
                  aria-checked={picked}
                  onClick={() => {
                    form.setValue('date', day.iso)
                    /* A new day means the taken-slot hints change under the
                     * chosen time, so the choice is asked again. */
                    form.setValue('time', '')
                  }}
                  className={cn(
                    'flex min-w-[48px] flex-shrink-0 cursor-pointer flex-col items-center gap-0.5 rounded-[10px] border-none px-3 py-2 font-action transition-colors',
                    picked
                      ? 'bg-salis-gradient text-white'
                      : 'bg-inset text-body hover:bg-salis-blue/[.06]'
                  )}
                >
                  <span className="text-[10px] opacity-70">{day.weekday}</span>
                  <span className="text-base font-bold" dir="ltr">
                    {day.dayOfMonth}
                  </span>
                </button>
              )
            })}
          </div>
          <div role="radiogroup" aria-label={t('Select Time')} className="grid grid-cols-3 gap-1.5">
            {SLOT_TIMES.map((slot) => {
              const busy = taken.has(slot)
              const picked = form.values.time === slot
              return (
                <button
                  key={slot}
                  type="button"
                  role="radio"
                  aria-checked={picked}
                  disabled={busy}
                  onClick={() => {
                    form.setValue('time', slot)
                    form.markTouched('time')
                  }}
                  dir="ltr"
                  className={cn(
                    'h-[38px] rounded-lg border-none font-mono text-xs font-semibold transition-colors',
                    busy
                      ? 'cursor-default bg-inset text-faint opacity-50'
                      : picked
                        ? 'cursor-pointer bg-salis-gradient text-white'
                        : 'cursor-pointer bg-inset text-body hover:bg-salis-blue/[.06]'
                  )}
                >
                  {slot}
                </button>
              )
            })}
          </div>
          <FieldMessage form={form} name="time" />
        </Card>

        {/* Notes. */}
        <Card className="flex flex-col gap-1.5 p-4">
          <label
            htmlFor={`${form.id}-notes`}
            className="font-action text-[11px] font-medium text-heading"
          >
            {t('Notes')}
          </label>
          <Textarea
            id={`${form.id}-notes`}
            rows={2}
            value={form.values.notes}
            placeholder={t('Any additional notes...')}
            onChange={(event) => form.setValue('notes', event.target.value)}
            onBlur={() => form.markTouched('notes')}
            className="resize-none text-[13px]"
          />
          <FieldMessage form={form} name="notes" />
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={!isLive || form.pending}>
          <Icon name="CalendarCheck" size={18} />
          {t(form.pending ? 'Saving...' : 'Confirm Booking')}
        </Button>
      </Form>
    </div>
  )
}

/** The genuine success state: the appointment as the server persisted it. */
function BookingConfirmed({ row, onAgain }: { row: AppointmentRow; onAgain: () => void }) {
  const { t } = usePreferences()
  return (
    <div className="flex max-w-[720px] animate-fade-up flex-col gap-4">
      <Card role="status" className="flex flex-col items-center gap-3 p-8 text-center">
        <span className="flex rounded-full bg-salis-blue/[.09] p-4 text-salis-blue">
          <Icon name="CalendarCheck" size={28} />
        </span>
        <div>
          <h1 className="font-display text-[17px] font-extrabold text-heading">
            {t('Booking confirmed')}
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {t('Your appointment is on the workshop calendar.')}
          </p>
        </div>
        <dl className="mt-1 flex w-full max-w-[360px] flex-col gap-2 rounded-xl bg-inset p-4 text-start">
          <ConfirmRow label={t('Vehicle')} value={row.veh} />
          <ConfirmRow label={t('Service')} value={row.svc} />
          <ConfirmRow
            label={t('Date & Time')}
            value={
              <span dir="ltr">{row.scheduledDate ? `${row.scheduledDate} · ${row.time}` : row.time}</span>
            }
          />
          <ConfirmRow label={t('Status')} value={t(row.status.replace(/_/g, ' '))} />
        </dl>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2.5">
          <Button variant="outline" size="md" onClick={onAgain}>
            {t('Book another')}
          </Button>
          <Link
            to="/customer-portal"
            className="inline-flex h-9 items-center gap-2 rounded bg-salis-gradient px-3.5 font-action text-[13px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:no-underline"
          >
            {t('Back to Home')}
          </Link>
        </div>
      </Card>
    </div>
  )
}

function ConfirmRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[13px]">
      <dt className="text-muted">{label}</dt>
      <dd className="m-0 font-semibold text-heading">{value}</dd>
    </div>
  )
}

function PanelTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon name={icon} size={14} className="text-salis-blue" />
      <h2 className="text-[13px] font-bold text-heading">{title}</h2>
    </div>
  )
}

/** Inline validation message for the picker groups, which have no `Field`. */
function FieldMessage({
  form,
  name,
}: {
  form: { errors: Record<string, string>; touched: Record<string, boolean>; submitted: boolean }
  name: string
}) {
  const { t } = usePreferences()
  const error = form.errors[name]
  if (!error || (!form.touched[name] && !form.submitted)) return null
  return (
    <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-salis-orange">
      <Icon name="AlertTriangle" size={12} />
      {t(error)}
    </p>
  )
}

/** Maps a server refusal onto the field that can fix it. A bay conflict is the
 *  time slot's problem; everything else is the form's. */
function asFormError(cause: unknown, t: (source: string) => string): Error {
  if (cause instanceof RepositoryError) {
    if (cause.code === 'rule_violated') {
      return new ServerValidationError(
        { time: cause.message || t('That slot was just taken — pick another time.') },
        cause.message
      )
    }
    if ((cause.code === 'bad_request' || cause.code === 'validation_failed') && cause.field) {
      return new ServerValidationError({ [mapField(cause.field)]: cause.message })
    }
    return new Error(cause.message)
  }
  return cause instanceof Error ? cause : new Error(String(cause))
}

/** Server schema field → this form's field. */
function mapField(field: string): string {
  if (field === 'timeLabel' || field === 'startMinute') return 'time'
  if (field === 'scheduledDate') return 'date'
  if (field === 'serviceLabel') return 'service'
  if (field === 'vehicleLabel' || field === 'plate') return 'vehicle'
  return 'notes'
}

interface DayOption {
  iso: string
  weekday: string
  dayOfMonth: string
}

/** The next `count` calendar days, named in the interface language. */
function upcomingDays(count: number, language: string): DayOption[] {
  const formatter = new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'short',
  })
  return Array.from({ length: count }, (_, offset) => {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    return {
      iso: todayIso(date),
      weekday: formatter.format(date),
      dayOfMonth: String(date.getDate()),
    }
  })
}
