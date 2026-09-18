import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive, repository } from '@/data/repository'
import { useCreate, type RowOf } from '@/data/useCollection'
import { todayIso, type CustomerRow, type VehicleRow } from './portal-data'

type Step = 'identify' | 'vehicle' | 'service' | 'done'
const STEPS: Step[] = ['identify', 'vehicle', 'service', 'done']

/** A vehicle the identify step actually found, and who it belongs to. */
interface FoundVehicle {
  id: string
  make: string
  plate: string
  customerId: string | null
}

/** What the identify step resolved the person at the terminal to.
 *
 *  `vehicles` is empty and `customerName` null when nothing matched, which is a
 *  state the screen renders rather than papers over — see `VehicleStep`. */
interface Identity {
  customerId: string | null
  customerName: string | null
  vehicles: readonly FoundVehicle[]
}

const EMPTY_IDENTITY: Identity = { customerId: null, customerName: null, vehicles: [] }

/** Plates are typed by a person on a touch keyboard, and stored with whatever
 *  spacing the workshop entered. Compare on the characters, not the spacing. */
const plateKey = (value: string) => value.replace(/[\s-]/g, '').toUpperCase()

/** Phone numbers are stored as "+966 55 210 4471" and typed as anything. Compare
 *  on the digits, and on the last nine of them, so a local 05… and an
 *  international +9665… resolve to the same subscriber. */
const phoneKey = (value: string) => value.replace(/\D/g, '').slice(-9)

/** What to send as the collection's `q`, which is a SQL `ILIKE` over the stored
 *  text and therefore sees the stored *formatting*.
 *
 *  Searching the raw input finds nothing the moment the two disagree about
 *  spacing: "abc-1234" does not occur inside "ABC 1234", and "0552104471" does
 *  not occur inside "+966 55 210 4471". So the search is deliberately the
 *  broadest term that survives any formatting — the longest run of characters
 *  the two spellings must share — and the exact re-check afterwards is what
 *  makes the answer right. Broad search, exact match: either half alone is a
 *  bug, and this screen shipped with only the search. */
function searchTerm(typed: string, digitsOnly: boolean): string {
  const parts = digitsOnly
    ? [typed.replace(/\D/g, '').slice(-4)]
    : typed.split(/[\s-]+/).filter(Boolean)
  const longest = parts.sort((a, b) => b.length - a.length)[0] ?? ''
  return longest.length >= 3 ? longest : typed.trim()
}

/** Who is at the terminal, from the plate or phone number they typed.
 *
 *  Both branches search and then re-check the result exactly: the collections'
 *  `q` is a free-text search across several columns, so "1234" matches a plate,
 *  a VIN fragment and a phone number alike. Offering the wrong car to a
 *  stranger is the failure this whole function exists to prevent, so a partial
 *  match is discarded rather than shown.
 *
 *  Returns `EMPTY_IDENTITY` when nothing matches. It never falls back to a
 *  sample vehicle: for eleven months this screen showed the same two cars —
 *  a Toyota Camry on ABC 1234 and a Hyundai Sonata on XYZ 5678 — to every
 *  walk-in regardless of what they typed, and in live mode the buttons were
 *  enabled, so anyone could check in against a vehicle that was not theirs. */
async function identify(phone: string, plate: string): Promise<Identity> {
  const typedPlate = plate.trim()
  const typedPhone = phone.trim()

  if (typedPlate) {
    const wanted = plateKey(typedPlate)
    const { rows } = await repository.vehicles.list({
      q: searchTerm(typedPlate, false),
      pageSize: 50,
    })
    const exact = (rows as readonly VehicleRow[]).filter(
      (row) => plateKey(String(row.plate ?? '')) === wanted,
    )
    const owner = exact[0]
    if (!owner) return EMPTY_IDENTITY
    return {
      customerId: owner.customerId ?? null,
      customerName: String(owner.owner ?? '') || null,
      vehicles: exact.map(toFound),
    }
  }

  if (!typedPhone) return EMPTY_IDENTITY
  const wanted = phoneKey(typedPhone)
  if (wanted.length < 6) return EMPTY_IDENTITY
  const { rows } = await repository.customers.list({
    q: searchTerm(typedPhone, true),
    pageSize: 50,
  })
  const customer = (rows as readonly CustomerRow[]).find(
    (row) => phoneKey(String(row.phone ?? '')) === wanted,
  )
  if (!customer?._id) return EMPTY_IDENTITY

  /* Their vehicles, by the foreign key rather than by the owner's name: two
   *  customers can share a name, and a name is not what the row is keyed on. */
  const owned = await repository.vehicles.list({
    filter: { customerId: customer._id },
    pageSize: 20,
  })
  return {
    customerId: customer._id,
    customerName: String(customer.name ?? '') || null,
    vehicles: (owned.rows as readonly VehicleRow[]).map(toFound),
  }
}

function toFound(row: VehicleRow): FoundVehicle {
  return {
    id: row._id ?? String(row.plate ?? ''),
    make: String(row.make ?? ''),
    plate: String(row.plate ?? ''),
    customerId: row.customerId ?? null,
  }
}

const FIXTURE_SERVICES = [
  { id: 's1', label: 'Oil Change', icon: 'Droplets' },
  { id: 's2', label: 'Tire Rotation', icon: 'CircleDot' },
  { id: 's3', label: 'Brake Inspection', icon: 'ShieldCheck' },
  { id: 's4', label: 'Full Service', icon: 'Wrench' },
  { id: 's5', label: 'AC Service', icon: 'Thermometer' },
  { id: 's6', label: 'Battery Check', icon: 'Battery' },
]

/** Self-service customer check-in kiosk. Large touch targets, simple step flow:
 *  Identify (phone/plate) -> Select Vehicle -> Confirm Service -> Done.
 *
 *  `shell: null` in the barrel -- renders fullscreen with no sidebar or topbar.
 *  All touch targets are at least 48px for kiosk accessibility.
 *
 *  `KioskCheckIn.dc.html` is the design source. */
export function KioskCheckIn() {
  const { t } = usePreferences()

  const create = useCreate('appointments')
  const [step, setStep] = useState<Step>('identify')
  const [phone, setPhone] = useState('')
  const [plate, setPlate] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [identity, setIdentity] = useState<Identity>(EMPTY_IDENTITY)
  const [looking, setLooking] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)

  const stepIndex = STEPS.indexOf(step)

  async function handleIdentify() {
    if (!phone.trim() && !plate.trim()) return
    setLooking(true)
    setLookupError(null)
    try {
      setIdentity(await identify(phone, plate))
      setStep('vehicle')
    } catch (cause) {
      /* A failed lookup stays on this step. Advancing with an empty result
       * would be indistinguishable from "we have no record of you", and the two
       * want different answers from the person at the terminal. */
      setLookupError((cause as Error).message)
    } finally {
      setLooking(false)
    }
  }

  function handleSelectVehicle(id: string) {
    setSelectedVehicle(id)
    setStep('service')
  }

  /** Continue with no vehicle on file — the walk-in whose car the workshop has
   *  never seen. The plate they typed is carried through as a label so the bay
   *  has something to go on; nothing is filed against another customer. */
  function handleContinueUnknown() {
    setSelectedVehicle(null)
    setStep('service')
  }

  function handleSelectService(id: string) {
    setSelectedService(id)
  }

  /** Registers the walk-in as an appointment through the same create seam the
   *  portal booking uses (`useCreate('appointments')`), then shows the ticket.
   *  The create schema's keys differ from the display row's — see
   *  CustomerPortalBooking. Works in demo (in-memory) and live (API) alike. */
  async function handleConfirm() {
    if (!selectedService) return
    const vehicle = identity.vehicles.find((v) => v.id === selectedVehicle)
    const service = FIXTURE_SERVICES.find((s) => s.id === selectedService)
    const now = new Date()
    const timeLabel = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    setConfirmError(null)
    try {
      await create.mutateAsync({
        input: {
          scheduledDate: todayIso(),
          timeLabel,
          startMinute: now.getHours() * 60 + now.getMinutes(),
          durationMins: 60,
          /* The customer's name when the lookup found one, and their id so the
           * appointment is a row about a person rather than a string. This used
           * to send the typed phone number as the customer's *name*. */
          ...(identity.customerId ? { customerId: identity.customerId } : {}),
          customerName: identity.customerName ?? 'Walk-in',
          ...(vehicle?.customerId && vehicle.id ? { vehicleId: vehicle.id } : {}),
          vehicleLabel: vehicle?.make || plate.trim() || 'Unidentified vehicle',
          plate: vehicle?.plate ?? plate.trim(),
          serviceLabel: service?.label ?? '',
          bay: 'Bay 1',
          status: 'awaiting',
        } as unknown as Partial<RowOf<'appointments'>>,
      })
      setStep('done')
    } catch (cause) {
      setConfirmError((cause as Error).message)
    }
  }

  /** Back to a blank terminal. Every field is cleared, the resolved identity
   *  included: the next person to walk up must not find the last one's name or
   *  their vehicles on the screen. */
  function handleRestart() {
    setStep('identify')
    setPhone('')
    setPlate('')
    setSelectedVehicle(null)
    setSelectedService(null)
    setConfirmError(null)
    setIdentity(EMPTY_IDENTITY)
    setLookupError(null)
  }

  return (
    <main id="main-content" className="flex min-h-viewport flex-col bg-page">
      {/* Header bar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex rounded-xl bg-salis-gradient p-2.5 text-white shadow-[0_8px_20px_rgba(10,94,215,.25)]">
            <Icon name="MonitorSmartphone" size={24} aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-xl font-black text-heading">
              {t('Self Check-In')}
            </h1>
            <p className="text-xs text-muted">{t('SALIS AUTO Workshop')}</p>
          </div>
        </div>
        <LanguageToggle />
      </header>

      {/* Progress indicator */}
      <div role="group" aria-label={t('Check-in progress')} className="flex items-center justify-center gap-2 px-6 py-4">
        {STEPS.filter((s) => s !== 'done').map((s, i) => {
          const done = stepIndex > i
          const current = stepIndex === i
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 ? (
                <span
                  aria-hidden
                  className={
                    'h-0.5 w-8 rounded-full ' +
                    (done ? 'bg-salis-blue' : 'bg-border')
                  }
                />
              ) : null}
              <span
                className={
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ' +
                  (done
                    ? 'bg-salis-gradient text-white'
                    : current
                      ? 'border-2 border-salis-blue bg-card text-salis-blue'
                      : 'border-2 border-border bg-card text-muted')
                }
              >
                {done ? (
                  <Icon name="Check" size={16} strokeWidth={3} aria-label={t('Completed')} />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={
                  'hidden text-sm font-medium sm:inline ' +
                  (current ? 'text-heading' : 'text-muted')
                }
              >
                {t(s === 'identify' ? 'Identify' : s === 'vehicle' ? 'Vehicle' : 'Service')}
              </span>
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="flex flex-1 items-start justify-center px-4 py-6">
        <div className="w-full max-w-lg animate-fade-up motion-reduce:animate-none">
          {step === 'identify' ? (
            <IdentifyStep
              phone={phone}
              plate={plate}
              onPhoneChange={setPhone}
              onPlateChange={setPlate}
              onNext={() => void handleIdentify()}
              pending={looking}
              error={lookupError}
            />
          ) : step === 'vehicle' ? (
            <VehicleStep
              vehicles={identity.vehicles}
              customerName={identity.customerName}
              typedPlate={plate.trim()}
              onSelect={handleSelectVehicle}
              onContinueUnknown={handleContinueUnknown}
              onBack={() => setStep('identify')}
            />
          ) : step === 'service' ? (
            <ServiceStep
              selected={selectedService}
              onSelect={handleSelectService}
              onConfirm={() => void handleConfirm()}
              onBack={() => setStep('vehicle')}
              pending={create.isPending}
              error={confirmError}
            />
          ) : (
            <DoneStep onRestart={handleRestart} />
          )}
        </div>
      </div>
    </main>
  )
}

function LanguageToggle() {
  const { language, toggleLanguage, t } = usePreferences()
  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="inline-flex h-12 min-w-[48px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 font-action text-sm font-medium text-heading transition-colors hover:border-salis-blue focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
      aria-label={t('Switch language')}
    >
      <Icon name="Languages" size={18} aria-hidden />
      {language === 'ar' ? 'English' : 'عربي'}
    </button>
  )
}

function IdentifyStep({
  phone,
  plate,
  onPhoneChange,
  onPlateChange,
  onNext,
  pending,
  error,
}: {
  phone: string
  plate: string
  onPhoneChange: (v: string) => void
  onPlateChange: (v: string) => void
  onNext: () => void
  pending: boolean
  error: string | null
}) {
  const { t } = usePreferences()
  const canProceed = phone.trim().length > 0 || plate.trim().length > 0

  return (
    <Card className="flex flex-col gap-6 p-6">
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
            inputSize="lg"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+966 5XX XXX XXXX"
            icon={<Icon name="Phone" size={20} />}
            dir="ltr"
          />
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
            value={plate}
            onChange={(e) => onPlateChange(e.target.value)}
            placeholder={t('ABC 1234')}
            icon={<Icon name="Car" size={20} />}
            dir="ltr"
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-salis-red">
          {t('We could not reach the workshop’s records. Please try again.')}
        </p>
      ) : null}

      <Button
        size="lg"
        className="h-14 w-full text-base"
        disabled={!canProceed || pending || !isLive}
        onClick={onNext}
      >
        <Icon name={pending ? 'Loader' : 'ArrowRight'} size={20} />
        {t(pending ? 'Searching...' : 'Find My Vehicle')}
      </Button>
    </Card>
  )
}

/** The vehicles the identify step found, and nothing else.
 *
 *  When it found none, this says so and offers to go on as a walk-in. It does
 *  not fall back to an example car: the whole point of the step before it is
 *  that the person at the terminal is checking in against a vehicle that is
 *  theirs, and a helpful-looking default defeats that completely. */
function VehicleStep({
  vehicles,
  customerName,
  typedPlate,
  onSelect,
  onContinueUnknown,
  onBack,
}: {
  vehicles: readonly FoundVehicle[]
  customerName: string | null
  typedPlate: string
  onSelect: (id: string) => void
  onContinueUnknown: () => void
  onBack: () => void
}) {
  const { t } = usePreferences()

  if (vehicles.length === 0) {
    return (
      <Card className="flex flex-col gap-5 p-6">
        <div className="text-center">
          <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-tint-orange text-salis-orange">
            <Icon name="SearchX" size={28} aria-hidden />
          </span>
          <h2 className="font-display text-xl font-bold text-heading">
            {t('No vehicle on file')}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {t('We could not find a vehicle for what you entered. You can still check in, and reception will take the details.')}
          </p>
        </div>

        <Button size="lg" className="h-14 w-full text-base" onClick={onContinueUnknown}>
          <Icon name="ArrowRight" size={20} />
          {typedPlate ? t('Continue with this plate') : t('Continue as a walk-in')}
        </Button>

        <button
          type="button"
          onClick={onBack}
          className="flex h-12 min-w-[48px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 font-action text-sm font-medium text-muted transition-colors hover:border-salis-blue hover:text-heading focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
        >
          <Icon name="ArrowLeft" size={16} aria-hidden />
          {t('Try again')}
        </button>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-heading">{t('Select Your Vehicle')}</h2>
        <p className="mt-1 text-sm text-muted">
          {customerName
            ? `${t('Welcome back')}, ${customerName}`
            : t('Choose the vehicle for this visit')}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {vehicles.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v.id)}
            className="flex min-h-[64px] w-full cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-4 text-start transition-all hover:border-salis-blue hover:shadow-md disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-salis-blue/[.08] text-salis-blue">
              <Icon name="Car" size={24} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-heading">{v.make}</p>
              <p className="mt-0.5 font-mono text-sm text-muted" dir="ltr">{v.plate}</p>
            </div>
            <Icon name="ChevronRight" size={20} className="text-muted" aria-hidden />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="flex h-12 min-w-[48px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 font-action text-sm font-medium text-muted transition-colors hover:border-salis-blue hover:text-heading focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
      >
        <Icon name="ArrowLeft" size={16} aria-hidden />
        {t('Back')}
      </button>
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
}: {
  selected: string | null
  onSelect: (id: string) => void
  onConfirm: () => void
  onBack: () => void
  pending: boolean
  error: string | null
}) {
  const { t } = usePreferences()

  return (
    <Card className="flex flex-col gap-5 p-6">
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-heading">{t('Select Service')}</h2>
        <p className="mt-1 text-sm text-muted">{t('What brings you in today?')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {FIXTURE_SERVICES.map((svc) => (
          <button
            key={svc.id}
            type="button"
            onClick={() => onSelect(svc.id)}
            className={
              'flex min-h-[80px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all ' +
              (selected === svc.id
                ? 'border-salis-blue bg-salis-blue/[.08] text-salis-blue shadow-[0_0_0_3px_rgba(10,94,215,.15)]'
                : 'border-border bg-card text-heading hover:border-salis-blue hover:shadow-md')
            }
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
        className="h-14 w-full text-base"
        disabled={!selected || pending || !isLive}
        onClick={onConfirm}
      >
        <Icon name="CheckCircle" size={20} />
        {pending ? t('Checking in...') : t('Confirm Check-In')}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="flex h-12 min-w-[48px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 font-action text-sm font-medium text-muted transition-colors hover:border-salis-blue hover:text-heading focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
      >
        <Icon name="ArrowLeft" size={16} aria-hidden />
        {t('Back')}
      </button>
    </Card>
  )
}

function DoneStep({ onRestart }: { onRestart: () => void }) {
  const { t } = usePreferences()

  return (
    <Card className="flex flex-col items-center gap-5 p-8 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-salis-gradient text-white shadow-[0_12px_24px_rgba(10,94,215,.3)]">
        <Icon name="CheckCircle" size={40} aria-hidden />
      </span>
      <h2 className="font-display text-2xl font-bold text-heading">{t('Check-In Complete')}</h2>
      <p className="max-w-sm text-sm text-muted">
        {t('Your service advisor will be with you shortly. Please have a seat in the waiting area.')}
      </p>
      <div className="rounded-xl border border-border bg-inset p-4">
        <p className="text-xs text-muted">{t('Estimated Wait Time')}</p>
        <p className="mt-1 font-display text-3xl font-black text-heading" dir="ltr">
          15 <span className="text-base font-normal text-muted">{t('min')}</span>
        </p>
      </div>
      <Button size="lg" variant="outline" className="h-14 w-full text-base" onClick={onRestart}>
        <Icon name="RotateCcw" size={20} />
        {t('New Check-In')}
      </Button>
    </Card>
  )
}
