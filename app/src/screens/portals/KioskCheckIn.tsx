import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useDateFormat } from '@/lib/formatDate'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { isLive } from '@/data/repository'
import { useCreate, type RowOf } from '@/data/useCollection'
import { todayIso } from './portal-data'

type Step = 'identify' | 'vehicle' | 'service' | 'done'
const STEPS: Step[] = ['identify', 'vehicle', 'service', 'done']
const STEP_LABELS: Record<Exclude<Step, 'done'>, string> = {
  identify: 'Identify',
  vehicle: 'Vehicle',
  service: 'Service',
}

/** Fixture vehicles shown after identification. In live mode these come from the
 *  API; in demo mode the kiosk still demonstrates the flow. */
const FIXTURE_VEHICLES = [
  { id: 'v1', make: 'Toyota Camry 2023', plate: 'ABC 1234' },
  { id: 'v2', make: 'Hyundai Sonata 2022', plate: 'XYZ 5678' },
]

const FIXTURE_SERVICES = [
  { id: 's1', label: 'Oil Change', icon: 'Droplets' },
  { id: 's2', label: 'Tire Rotation', icon: 'CircleDot' },
  { id: 's3', label: 'Brake Inspection', icon: 'ShieldCheck' },
  { id: 's4', label: 'Full Service', icon: 'Wrench' },
  { id: 's5', label: 'AC Service', icon: 'Thermometer' },
  { id: 's6', label: 'Battery Check', icon: 'Battery' },
]

/** How long the kiosk waits on an untouched screen before it clears the last
 *  customer's details for the next one. */
const IDLE_SECONDS = 60
/** The countdown becomes visible this many seconds before the reset. */
const IDLE_WARNING_SECONDS = 15

/** The row the create seam hands back, widened with what a live server may
 *  add: a ticket for the waiting-room board and a promised wait. Neither is
 *  in the fixture shape, so both are optional and the screen says "we'll
 *  call you" when the wait is not known. */
type CreatedAppointment = RowOf<'appointments'> & {
  _id?: string
  queueNumber?: string | number | null
  waitMinutes?: number | null
}

/** Self-service customer check-in kiosk. Large touch targets, simple step flow:
 *  Identify (phone/plate) -> Select Vehicle -> Confirm Service -> Done.
 *
 *  `shell: null` in the barrel -- renders fullscreen with no sidebar or topbar.
 *  Landscape-first: the brand and the progress sit in the start column, the
 *  step card in the wider end column, exactly as a counter-mounted tablet is
 *  held. Every touch target is at least 56px, focus rings are 4px so they read
 *  under workshop lighting, and an untouched screen resets itself after a
 *  minute so the next customer never sees the last one's phone number.
 *
 *  `KioskCheckIn.dc.html` is the design source. */
export function KioskCheckIn() {
  const { t, rtl } = usePreferences()
  const { time } = useDateFormat()

  const create = useCreate('appointments')
  const [step, setStep] = useState<Step>('identify')
  const [phone, setPhone] = useState('')
  const [plate, setPlate] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [created, setCreated] = useState<CreatedAppointment | null>(null)

  const stepIndex = STEPS.indexOf(step)
  const backIcon = rtl ? 'ArrowRight' : 'ArrowLeft'
  const forwardIcon = rtl ? 'ArrowLeft' : 'ArrowRight'

  const handleRestart = useCallback(() => {
    setStep('identify')
    setPhone('')
    setPlate('')
    setSelectedVehicle(null)
    setSelectedService(null)
    setConfirmError(null)
    setCreated(null)
  }, [])

  /* The idle clock only runs once someone has started: an untouched kiosk on
   * its first screen has nothing to clear. */
  const started = step !== 'identify' || phone !== '' || plate !== ''
  const remaining = useIdleCountdown(started, handleRestart)

  function handleIdentify() {
    if (!phone.trim() && !plate.trim()) return
    setStep('vehicle')
  }

  function handleSelectVehicle(id: string) {
    setSelectedVehicle(id)
    setStep('service')
  }

  /** Registers the walk-in as an appointment through the same create seam the
   *  portal booking uses (`useCreate('appointments')`), then shows the ticket.
   *  The create schema's keys differ from the display row's — see
   *  CustomerPortalBooking. Works in demo (in-memory) and live (API) alike. */
  async function handleConfirm() {
    if (!selectedService) return
    const vehicle = FIXTURE_VEHICLES.find((v) => v.id === selectedVehicle)
    const service = FIXTURE_SERVICES.find((s) => s.id === selectedService)
    const now = new Date()
    setConfirmError(null)
    try {
      const row = await create.mutateAsync({
        input: {
          scheduledDate: todayIso(now),
          timeLabel: time(now),
          startMinute: now.getHours() * 60 + now.getMinutes(),
          durationMins: 60,
          customerName: phone.trim() || 'Walk-in',
          vehicleLabel: vehicle?.make ?? plate.trim().toUpperCase(),
          plate: vehicle?.plate ?? plate.trim().toUpperCase(),
          serviceLabel: service?.label ?? '',
          bay: 'Bay 1',
          status: 'awaiting',
        } as unknown as Partial<RowOf<'appointments'>>,
      })
      setCreated(row as CreatedAppointment)
      setStep('done')
    } catch (cause) {
      setConfirmError((cause as Error).message)
    }
  }

  return (
    <main
      id="main-content"
      className="grid min-h-screen grid-cols-1 bg-page lg:grid-cols-[1fr_1.4fr]"
    >
      {/* Start column: brand, progress, the demo notice and the idle clock. */}
      <section
        aria-label={t('Self Check-In')}
        className="flex flex-col gap-6 border-b border-border bg-card px-6 py-5 lg:border-b-0 lg:border-e lg:px-10 lg:py-10"
      >
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex rounded-xl bg-salis-gradient p-2.5 text-white shadow-[0_8px_20px_rgba(10,94,215,.25)]">
              <Icon name="MonitorSmartphone" size={24} aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-xl font-black text-heading lg:text-3xl">
                {t('Self Check-In')}
              </h1>
              <p className="text-xs text-muted lg:text-sm">{t('SALIS AUTO Workshop')}</p>
            </div>
          </div>
          <LanguageToggle />
        </header>

        {/* Progress indicator */}
        <ol aria-label={t('Check-in progress')} className="flex list-none flex-row items-center gap-3 p-0 lg:flex-col lg:items-stretch lg:gap-4">
          {STEPS.filter((s): s is Exclude<Step, 'done'> => s !== 'done').map((s, i) => {
            const done = stepIndex > i
            const current = stepIndex === i
            return (
              <li
                key={s}
                aria-current={current ? 'step' : undefined}
                className="flex flex-1 items-center gap-3 lg:flex-none"
              >
                <span
                  className={cn(
                    'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-base font-bold',
                    done
                      ? 'bg-salis-gradient text-white'
                      : current
                        ? 'border-2 border-salis-blue bg-card text-salis-blue'
                        : 'border-2 border-border bg-card text-muted'
                  )}
                >
                  {done ? <Icon name="Check" size={20} strokeWidth={3} aria-label={t('Completed')} /> : i + 1}
                </span>
                <span
                  className={cn(
                    'hidden font-action text-base font-medium sm:inline',
                    current ? 'text-heading' : 'text-muted'
                  )}
                >
                  {t(STEP_LABELS[s])}
                </span>
              </li>
            )
          })}
        </ol>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          {!isLive ? (
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-inset px-3 font-action text-[11px] font-semibold text-muted">
              <Icon name="Info" size={12} aria-hidden />
              {t('Demo mode')}
            </span>
          ) : null}
          <IdleNotice remaining={remaining} />
        </div>
      </section>

      {/* End column: the step card. */}
      <div className="flex items-start justify-center px-4 py-6 lg:items-center lg:px-10">
        <div className="w-full max-w-xl animate-fade-up motion-reduce:animate-none">
          {step === 'identify' ? (
            <IdentifyStep
              phone={phone}
              plate={plate}
              onPhoneChange={setPhone}
              onPlateChange={setPlate}
              onNext={handleIdentify}
              forwardIcon={forwardIcon}
            />
          ) : step === 'vehicle' ? (
            <VehicleStep onSelect={handleSelectVehicle} onBack={() => setStep('identify')} backIcon={backIcon} />
          ) : step === 'service' ? (
            <ServiceStep
              selected={selectedService}
              onSelect={setSelectedService}
              onConfirm={() => void handleConfirm()}
              onBack={() => setStep('vehicle')}
              pending={create.isPending}
              error={confirmError}
              backIcon={backIcon}
            />
          ) : (
            <DoneStep created={created} onRestart={handleRestart} />
          )}
        </div>
      </div>
    </main>
  )
}

/** Seconds until the flow clears itself, or `null` while nobody is idle.
 *  Any pointer, key or touch on the document restarts the clock. */
function useIdleCountdown(active: boolean, onExpire: () => void): number | null {
  const [remaining, setRemaining] = useState<number | null>(null)
  const lastActivity = useRef(Date.now())

  useEffect(() => {
    if (!active) {
      setRemaining(null)
      return
    }
    lastActivity.current = Date.now()
    setRemaining(IDLE_SECONDS)

    const touch = () => {
      lastActivity.current = Date.now()
      setRemaining(IDLE_SECONDS)
    }
    const events: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'touchstart', 'input']
    for (const name of events) document.addEventListener(name, touch, true)

    const tick = setInterval(() => {
      const left = IDLE_SECONDS - Math.floor((Date.now() - lastActivity.current) / 1000)
      if (left <= 0) {
        onExpire()
        return
      }
      setRemaining(left)
    }, 1000)

    return () => {
      clearInterval(tick)
      for (const name of events) document.removeEventListener(name, touch, true)
    }
  }, [active, onExpire])

  return remaining
}

/** The countdown, announced politely once it is within the warning window so
 *  a customer reading the screen knows why it is about to change. The bar
 *  only animates for people who have not asked for less motion. */
function IdleNotice({ remaining }: { remaining: number | null }) {
  const { t } = usePreferences()
  const reducedMotion = useReducedMotion()
  const visible = remaining !== null && remaining <= IDLE_WARNING_SECONDS

  return (
    <div aria-live="polite" aria-atomic className="flex min-w-0 flex-1 flex-col gap-1">
      {visible ? (
        <>
          <p className="font-action text-[13px] font-medium text-salis-orange">
            {t('Screen resets in')} <span className="font-mono" dir="ltr">{remaining}</span> {t('seconds')}
          </p>
          <div className="h-1 overflow-hidden rounded-full bg-tint-orange" aria-hidden>
            <div
              className={cn('h-full rounded-full bg-salis-orange', !reducedMotion && 'transition-[width] duration-1000 ease-linear')}
              style={{ width: `${(remaining / IDLE_WARNING_SECONDS) * 100}%` }}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}

function LanguageToggle() {
  const { language, toggleLanguage, t } = usePreferences()
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="inline-flex h-14 min-w-[56px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 font-action text-sm font-medium text-heading transition-colors hover:border-salis-blue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
      aria-label={t('Switch language')}
    >
      <Icon name="Languages" size={18} aria-hidden />
      {language === 'ar' ? 'English' : 'عربي'}
    </button>
  )
}

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0', 'delete'] as const

/** An on-screen keypad for the phone step: a kiosk has no keyboard and the
 *  browser's own is unreliable on a wall-mounted tablet. */
function NumericKeypad({ onKey }: { onKey: (key: (typeof KEYPAD)[number]) => void }) {
  const { t } = usePreferences()
  return (
    <div role="group" aria-label={t('Keypad')} className="grid grid-cols-3 gap-2" dir="ltr">
      {KEYPAD.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onKey(key)}
          aria-label={key === 'delete' ? t('Delete') : undefined}
          className="flex h-14 cursor-pointer items-center justify-center rounded-lg border border-border bg-card font-mono text-xl font-semibold text-heading transition-colors hover:border-salis-blue active:bg-inset focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
        >
          {key === 'delete' ? <Icon name="Delete" size={22} aria-hidden /> : key}
        </button>
      ))}
    </div>
  )
}

function IdentifyStep({
  phone,
  plate,
  onPhoneChange,
  onPlateChange,
  onNext,
  forwardIcon,
}: {
  phone: string
  plate: string
  onPhoneChange: (v: string) => void
  onPlateChange: (v: string) => void
  onNext: () => void
  forwardIcon: string
}) {
  const { t } = usePreferences()
  const canProceed = phone.trim().length > 0 || plate.trim().length > 0

  function press(key: (typeof KEYPAD)[number]) {
    if (key === 'delete') onPhoneChange(phone.slice(0, -1))
    else if (phone.length < 16) onPhoneChange(phone + key)
  }

  return (
    <Card className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="text-center">
        <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-salis-gradient text-white shadow-[0_12px_24px_rgba(10,94,215,.3)]">
          <Icon name="UserSearch" size={28} aria-hidden />
        </span>
        <h2 className="font-display text-xl font-bold text-heading">{t('Identify Yourself')}</h2>
        <p className="mt-1 text-sm text-muted">{t('Enter your phone number or license plate')}</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="kiosk-phone" className="font-action text-sm font-medium text-heading">
            {t('Phone Number')}
          </label>
          <Input
            id="kiosk-phone"
            type="tel"
            inputMode="tel"
            inputSize="lg"
            className="h-14 font-mono text-lg focus:shadow-[0_0_0_4px_rgba(10,94,215,.25)]"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+966 5XX XXX XXXX"
            icon={<Icon name="Phone" size={20} />}
            dir="ltr"
            autoComplete="off"
          />
          <NumericKeypad onKey={press} />
        </div>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">{t('or')}</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="kiosk-plate" className="font-action text-sm font-medium text-heading">
            {t('License Plate')}
          </label>
          <Input
            id="kiosk-plate"
            type="text"
            inputSize="lg"
            className="h-14 font-mono text-lg uppercase focus:shadow-[0_0_0_4px_rgba(10,94,215,.25)]"
            value={plate}
            onChange={(e) => onPlateChange(e.target.value)}
            placeholder="ABC 1234"
            icon={<Icon name="Car" size={20} />}
            dir="ltr"
            autoCapitalize="characters"
            autoComplete="off"
          />
        </div>
      </div>

      <Button
        size="lg"
        className="h-14 w-full text-base focus-visible:ring-4"
        disabled={!canProceed}
        onClick={onNext}
      >
        <Icon name={forwardIcon} size={20} />
        {t('Find My Vehicle')}
      </Button>
    </Card>
  )
}

function BackButton({ onBack, icon }: { onBack: () => void; icon: string }) {
  const { t } = usePreferences()
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex h-14 min-w-[56px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 font-action text-sm font-medium text-muted transition-colors hover:border-salis-blue hover:text-heading focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
    >
      <Icon name={icon} size={18} aria-hidden />
      {t('Back')}
    </button>
  )
}

function VehicleStep({
  onSelect,
  onBack,
  backIcon,
}: {
  onSelect: (id: string) => void
  onBack: () => void
  backIcon: string
}) {
  const { t, rtl } = usePreferences()

  return (
    <Card className="flex flex-col gap-5 p-6 lg:p-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-heading">{t('Select Your Vehicle')}</h2>
        <p className="mt-1 text-sm text-muted">{t('Choose the vehicle for this visit')}</p>
      </div>

      <div className="flex flex-col gap-3">
        {FIXTURE_VEHICLES.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v.id)}
            className="flex min-h-[64px] w-full cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-4 text-start transition-colors hover:border-salis-blue hover:shadow-md active:bg-inset focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-salis-blue/[.08] text-salis-blue">
              <Icon name="Car" size={24} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-heading">{v.make}</p>
              <p className="mt-0.5 font-mono text-sm text-muted" dir="ltr">{v.plate}</p>
            </div>
            <Icon name={rtl ? 'ChevronLeft' : 'ChevronRight'} size={20} className="text-muted" aria-hidden />
          </button>
        ))}
      </div>

      <BackButton onBack={onBack} icon={backIcon} />
    </Card>
  )
}

function ServiceStep({
  selected,
  onSelect,
  onConfirm,
  onBack,
  pending,
  error,
  backIcon,
}: {
  selected: string | null
  onSelect: (id: string) => void
  onConfirm: () => void
  onBack: () => void
  pending: boolean
  error: string | null
  backIcon: string
}) {
  const { t } = usePreferences()

  return (
    <Card className="flex flex-col gap-5 p-6 lg:p-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-heading">{t('Select Service')}</h2>
        <p className="mt-1 text-sm text-muted">{t('What brings you in today?')}</p>
      </div>

      <div role="radiogroup" aria-label={t('Select Service')} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FIXTURE_SERVICES.map((svc) => (
          <button
            key={svc.id}
            type="button"
            role="radio"
            aria-checked={selected === svc.id}
            onClick={() => onSelect(svc.id)}
            className={cn(
              'flex min-h-[80px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-salis-blue focus-visible:ring-offset-2',
              selected === svc.id
                ? 'border-salis-blue bg-salis-blue/[.08] text-salis-blue shadow-[0_0_0_3px_rgba(10,94,215,.15)]'
                : 'border-border bg-card text-heading hover:border-salis-blue hover:shadow-md'
            )}
          >
            <Icon name={svc.icon} size={24} aria-hidden />
            <span className="font-action text-sm font-medium">{t(svc.label)}</span>
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-center font-action text-sm text-salis-orange" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        size="lg"
        className="h-14 w-full text-base focus-visible:ring-4"
        disabled={!selected}
        loading={pending}
        loadingLabel="Checking in..."
        onClick={onConfirm}
      >
        <Icon name="CheckCircle" size={20} />
        {t('Confirm Check-In')}
      </Button>

      <BackButton onBack={onBack} icon={backIcon} />
    </Card>
  )
}

/** The ticket. The queue number is the server's when it issues one, else the
 *  record's own id — either way something the desk can find. The wait is
 *  printed only when the server promised one. */
function DoneStep({ created, onRestart }: { created: CreatedAppointment | null; onRestart: () => void }) {
  const { t } = usePreferences()
  const queueNumber =
    created?.queueNumber != null
      ? String(created.queueNumber)
      : created?._id
        ? created._id.slice(-4).toUpperCase()
        : null
  const wait = typeof created?.waitMinutes === 'number' ? created.waitMinutes : null

  return (
    <Card className="flex flex-col items-center gap-5 p-8 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-salis-gradient text-white shadow-[0_12px_24px_rgba(10,94,215,.3)]">
        <Icon name="CheckCircle" size={40} aria-hidden />
      </span>
      <h2 className="font-display text-2xl font-bold text-heading">{t('Check-In Complete')}</h2>
      <p className="max-w-sm text-sm text-muted">
        {t('Your service advisor will be with you shortly. Please have a seat in the waiting area.')}
      </p>
      {queueNumber ? (
        <div className="w-full rounded-xl border border-border bg-inset p-4">
          <p className="text-xs text-muted">{t('Your number')}</p>
          <p className="mt-1 font-display text-5xl font-black leading-none text-heading" dir="ltr">
            {queueNumber}
          </p>
        </div>
      ) : null}
      <div className="w-full rounded-xl border border-border bg-inset p-4">
        <p className="text-xs text-muted">{t('Estimated Wait Time')}</p>
        {wait !== null ? (
          <p className="mt-1 font-display text-3xl font-black text-heading" dir="ltr">
            {wait} <span className="text-base font-normal text-muted">{t('min')}</span>
          </p>
        ) : (
          <p className="mt-1 font-display text-xl font-bold text-heading">{t("We'll call you")}</p>
        )}
      </div>
      <Button size="lg" variant="outline" className="h-14 w-full text-base focus-visible:ring-4" onClick={onRestart}>
        <Icon name="RotateCcw" size={20} />
        {t('New Check-In')}
      </Button>
    </Card>
  )
}
