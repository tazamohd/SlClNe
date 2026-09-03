import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Money } from '@/components/ui/Money'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { AppRowSkeleton } from '@/components/shell/CustomerAppShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, useCreate, type RowOf } from '@/data/useCollection'
import { minuteOf, todayIso, type VehicleRow } from '@/screens/portals/portal-data'

/** The customer app's booking flow — three steps, one decision each.
 *
 *  The design drew a four-step strip as a static illustration with every
 *  service card and time slot on one page. Three real steps replace it:
 *  what, which vehicle, when — and the last one submits through the same
 *  `useCreate('appointments')` seam the portal booking and the kiosk use, so
 *  the row lands in the same list the Bookings tab reads.
 *
 *  Vehicles come from the collection. The service menu and the slot grid are
 *  still the design's fixtures: no service catalogue or availability endpoint
 *  exists yet, and the card says so rather than pretending a slot was checked. */

interface ServiceOption {
  name: string
  duration: string
  price: number
  icon: string
  popular: boolean
}

interface TimeSlot {
  time: string
  available: boolean
}

const SERVICES: ServiceOption[] = [
  { name: 'Oil Change', duration: '30 min', price: 149, icon: 'Droplets', popular: true },
  { name: 'Brake Inspection', duration: '45 min', price: 89, icon: 'Disc', popular: false },
  { name: 'Full Service', duration: '3 hours', price: 899, icon: 'Wrench', popular: true },
  { name: 'AC Service', duration: '1 hour', price: 299, icon: 'Thermometer', popular: false },
  { name: 'Tire Rotation', duration: '30 min', price: 120, icon: 'CircleDot', popular: false },
  { name: 'Battery Check', duration: '20 min', price: 49, icon: 'Battery', popular: false },
  { name: 'Engine Diagnostic', duration: '1 hour', price: 199, icon: 'Activity', popular: true },
  { name: 'Wheel Alignment', duration: '45 min', price: 180, icon: 'Crosshair', popular: false },
]

const TIME_SLOTS: TimeSlot[] = [
  { time: '08:00 AM', available: true },
  { time: '09:00 AM', available: true },
  { time: '10:00 AM', available: false },
  { time: '11:00 AM', available: true },
  { time: '01:00 PM', available: true },
  { time: '02:00 PM', available: false },
  { time: '03:00 PM', available: true },
  { time: '04:00 PM', available: true },
]

const STEPS = [
  { label: 'Select Service', icon: 'Wrench' },
  { label: 'Choose Vehicle', icon: 'Car' },
  { label: 'Pick Time', icon: 'Clock' },
] as const

type StepIndex = 0 | 1 | 2

/** Tomorrow, as the API's `scheduledDate` stores it — a walk-in books today at
 *  the kiosk; a booking from the app is for the next working day. */
function tomorrowIso(): string {
  const next = new Date()
  next.setDate(next.getDate() + 1)
  return todayIso(next)
}

export function CustomerAppBooking() {
  const { t, rtl } = usePreferences()
  const { userName } = useSession()
  const [step, setStep] = useState<StepIndex>(0)
  const [service, setService] = useState<string | null>(null)
  const [vehiclePlate, setVehiclePlate] = useState<string | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [booked, setBooked] = useState(false)

  const vehicles = useCollection('vehicles')
  const vehicleRows = (vehicles.data ?? []) as readonly VehicleRow[]
  const create = useCreate('appointments')

  const chosenService = SERVICES.find((item) => item.name === service)
  const chosenVehicle = vehicleRows.find((row) => row.plate === vehiclePlate)

  const canContinue = step === 0 ? !!service : step === 1 ? !!vehiclePlate : !!slot

  async function confirm() {
    if (!chosenService || !chosenVehicle || !slot) return
    setError(null)
    try {
      await create.mutateAsync({
        input: {
          scheduledDate: tomorrowIso(),
          timeLabel: slot,
          startMinute: minuteOf(slot.replace(/^0/, '')),
          durationMins: 60,
          customerName: userName,
          vehicleLabel: chosenVehicle.make,
          plate: chosenVehicle.plate,
          serviceLabel: chosenService.name,
          bay: 'Bay 1',
          status: 'awaiting',
        } as unknown as Partial<RowOf<'appointments'>>,
      })
      setBooked(true)
    } catch (cause) {
      setError((cause as Error).message)
    }
  }

  function next() {
    if (step === 2) {
      void confirm()
      return
    }
    setStep((step + 1) as StepIndex)
  }

  function back() {
    setStep((step - 1) as StepIndex)
  }

  if (booked) {
    return (
      <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
        <PageHeader
          icon="CalendarPlus"
          title={t('Book Service')}
          back={{ to: '/customer-app/appointments', label: 'Bookings' }}
        />
        <Card className="flex flex-col items-center gap-4 rounded-2xl p-8 text-center shadow-sm">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-salis-gradient text-white shadow-[0_12px_24px_rgba(10,94,215,.3)]">
            <Icon name="CheckCircle" size={32} />
          </span>
          <h2 className="font-display text-xl font-bold text-heading">{t('Booking confirmed')}</h2>
          <p className="max-w-sm text-sm text-muted">
            {t(chosenService?.name ?? '')} · {chosenVehicle?.make} ·{' '}
            <span dir="ltr">{slot}</span>
          </p>
          <Link
            to="/customer-app/appointments"
            className="inline-flex h-12 items-center gap-2 rounded bg-salis-gradient px-5 font-action text-[15px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:no-underline"
          >
            {t('View bookings')}
            <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={16} />
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader
        icon="CalendarPlus"
        title={t('Book Service')}
        subtitle={t('Schedule a service appointment')}
        back={{ to: '/customer-app/appointments', label: 'Bookings' }}
      >
        {/* Step indicator: the current step is announced, the done ones are ticked. */}
        <ol aria-label={t('Booking steps')} className="flex list-none items-center gap-2 p-0">
          {STEPS.map((item, index) => {
            const done = index < step
            const current = index === step
            return (
              <li
                key={item.label}
                aria-current={current ? 'step' : undefined}
                className="flex flex-1 items-center gap-2"
              >
                <span
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    done
                      ? 'bg-salis-gradient text-white'
                      : current
                        ? 'border-2 border-salis-blue bg-card text-salis-blue'
                        : 'border border-border bg-card text-muted'
                  )}
                >
                  {done ? <Icon name="Check" size={14} /> : index + 1}
                </span>
                <span
                  className={cn(
                    'hidden truncate text-[13px] font-semibold sm:inline',
                    current ? 'text-heading' : 'text-muted'
                  )}
                >
                  {t(item.label)}
                </span>
                {index < STEPS.length - 1 ? (
                  <span aria-hidden className={cn('h-0.5 flex-1 rounded', done ? 'bg-salis-blue' : 'bg-border')} />
                ) : null}
              </li>
            )
          })}
        </ol>
        <p className="text-[13px] font-semibold text-heading sm:hidden">
          {t('Step')} <span dir="ltr">{step + 1}/{STEPS.length}</span> · {t(STEPS[step].label)}
        </p>
      </PageHeader>

      {step === 0 ? (
        <div role="radiogroup" aria-label={t('Select Service')} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {SERVICES.map((svc) => {
            const selected = service === svc.name
            return (
              <button
                key={svc.name}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setService(svc.name)}
                className={cn(
                  'flex min-h-[112px] cursor-pointer flex-col gap-3 rounded-2xl border bg-card p-4 text-start shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2',
                  selected ? 'border-salis-blue bg-salis-blue/[.05]' : 'border-border hover:border-salis-blue'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex rounded-lg bg-tint-blue p-2 text-salis-blue" aria-hidden>
                    <Icon name={svc.icon} size={18} />
                  </span>
                  {svc.popular ? (
                    <Badge background="var(--tint-blue)" color="var(--salis-blue)">
                      {t('Popular')}
                    </Badge>
                  ) : null}
                </div>
                <span className="block">
                  <span className="block text-sm font-semibold text-heading">{t(svc.name)}</span>
                  <span className="mt-0.5 block text-xs text-muted">{t(svc.duration)}</span>
                </span>
                <Money sar={svc.price} className="mt-auto text-sm font-bold text-heading" />
              </button>
            )
          })}
        </div>
      ) : null}

      {step === 1 ? (
        vehicles.isLoading ? (
          <div role="status" aria-label={t('Loading')} className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, i) => (
              <AppRowSkeleton key={i} />
            ))}
            <span className="sr-only">{t('Loading...')}</span>
          </div>
        ) : vehicles.isError ? (
          <Card className="p-6">
            <ErrorState description={vehicles.error?.message} onRetry={() => void vehicles.refetch()} />
          </Card>
        ) : vehicleRows.length === 0 ? (
          <Card className="p-6">
            <EmptyState
              icon="Car"
              title={t('Add your first vehicle')}
              description={t('Your vehicles and their service history appear here.')}
              action={
                <Link to="/customer-app/garage" className="font-action text-[13px] font-medium">
                  {t('Add Vehicle')}
                </Link>
              }
            />
          </Card>
        ) : (
          <div role="radiogroup" aria-label={t('Choose Vehicle')} className="flex flex-col gap-3">
            {vehicleRows.map((row) => {
              const selected = vehiclePlate === row.plate
              return (
                <button
                  key={row._id ?? row.plate}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setVehiclePlate(row.plate)}
                  className={cn(
                    'flex min-h-[64px] w-full cursor-pointer items-center gap-4 rounded-xl border bg-card p-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2',
                    selected ? 'border-salis-blue bg-salis-blue/[.05]' : 'border-border hover:border-salis-blue'
                  )}
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-salis-blue/[.08] text-salis-blue">
                    <Icon name="Car" size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-heading">{row.make}</span>
                    <span className="mt-0.5 block font-mono text-xs text-muted" dir="ltr">
                      {row.plate}
                    </span>
                  </span>
                  {selected ? <Icon name="CheckCircle" size={20} className="text-salis-blue" /> : null}
                </button>
              )
            })}
          </div>
        )
      ) : null}

      {step === 2 ? (
        <>
          <Card className="rounded-2xl p-5 shadow-sm">
            <h2 className="mb-1 font-display text-sm font-bold text-heading">{t('Available Time Slots')}</h2>
            <p className="mb-4 text-xs text-muted">{t('Tomorrow. Your advisor confirms the slot with you.')}</p>
            <div role="radiogroup" aria-label={t('Pick Time')} className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {TIME_SLOTS.map((item) => {
                const selected = slot === item.time
                return (
                  <button
                    key={item.time}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={!item.available}
                    onClick={() => setSlot(item.time)}
                    dir="ltr"
                    className={cn(
                      'min-h-[48px] cursor-pointer rounded-lg border p-2 text-center font-mono text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40',
                      selected
                        ? 'border-salis-blue bg-salis-gradient text-white'
                        : 'border-border bg-card text-salis-blue hover:border-salis-blue'
                    )}
                  >
                    {item.time}
                  </button>
                )
              })}
            </div>
          </Card>

          <Card className="rounded-2xl p-5 shadow-sm">
            <h2 className="mb-3 font-display text-sm font-bold text-heading">{t('Summary')}</h2>
            <dl className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t('Service')}</dt>
                <dd className="font-semibold text-heading">{chosenService ? t(chosenService.name) : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t('Vehicle')}</dt>
                <dd className="font-semibold text-heading">{chosenVehicle?.make ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t('Time')}</dt>
                <dd className="font-mono font-semibold text-heading" dir="ltr">
                  {slot ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-border pt-2">
                <dt className="text-muted">{t('Estimated price')}</dt>
                <dd>{chosenService ? <Money sar={chosenService.price} className="font-bold text-heading" /> : '—'}</dd>
              </div>
            </dl>
          </Card>
        </>
      ) : null}

      {error ? (
        <p role="alert" className="text-center font-action text-sm text-salis-orange">
          {error}
        </p>
      ) : null}

      {/* The one primary action, always in reach: 48px, pinned to the bottom edge. */}
      <div className="sticky bottom-0 z-10 -mx-4 flex items-center gap-3 border-t border-border bg-page/90 p-4 backdrop-blur md:-mx-6 md:px-6">
        {step > 0 ? (
          <Button variant="outline" size="lg" onClick={back} icon={rtl ? 'ArrowRight' : 'ArrowLeft'}>
            {t('Back')}
          </Button>
        ) : null}
        <Button
          size="lg"
          className="flex-1"
          disabled={!canContinue}
          loading={create.isPending}
          loadingLabel="Booking..."
          onClick={next}
        >
          {step === 2 ? t('Confirm booking') : t('Continue')}
          {step < 2 ? <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={16} /> : null}
        </Button>
      </div>
    </div>
  )
}
