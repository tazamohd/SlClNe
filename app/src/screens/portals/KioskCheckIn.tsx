import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { usePreferences } from '@/providers/PreferencesProvider'
import { isLive } from '@/data/repository'

type Step = 'identify' | 'vehicle' | 'service' | 'done'
const STEPS: Step[] = ['identify', 'vehicle', 'service', 'done']

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

/** Self-service customer check-in kiosk. Large touch targets, simple step flow:
 *  Identify (phone/plate) -> Select Vehicle -> Confirm Service -> Done.
 *
 *  `shell: null` in the barrel -- renders fullscreen with no sidebar or topbar.
 *  All touch targets are at least 48px for kiosk accessibility.
 *
 *  `KioskCheckIn.dc.html` is the design source. */
export function KioskCheckIn() {
  const { t } = usePreferences()

  const [step, setStep] = useState<Step>('identify')
  const [phone, setPhone] = useState('')
  const [plate, setPlate] = useState('')
  const [, setSelectedVehicle] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const stepIndex = STEPS.indexOf(step)

  function handleIdentify() {
    if (!phone.trim() && !plate.trim()) return
    setStep('vehicle')
  }

  function handleSelectVehicle(id: string) {
    setSelectedVehicle(id)
    setStep('service')
  }

  function handleSelectService(id: string) {
    setSelectedService(id)
  }

  function handleConfirm() {
    if (!selectedService) return
    setStep('done')
  }

  function handleRestart() {
    setStep('identify')
    setPhone('')
    setPlate('')
    setSelectedVehicle(null)
    setSelectedService(null)
  }

  return (
    <main id="main-content" className="flex min-h-screen flex-col bg-page">
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
      <div className="flex items-center justify-center gap-2 px-6 py-4">
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
              onNext={handleIdentify}
            />
          ) : step === 'vehicle' ? (
            <VehicleStep onSelect={handleSelectVehicle} onBack={() => setStep('identify')} />
          ) : step === 'service' ? (
            <ServiceStep
              selected={selectedService}
              onSelect={handleSelectService}
              onConfirm={handleConfirm}
              onBack={() => setStep('vehicle')}
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
}: {
  phone: string
  plate: string
  onPhoneChange: (v: string) => void
  onPlateChange: (v: string) => void
  onNext: () => void
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

      <Button
        size="lg"
        className="h-14 w-full text-base"
        disabled={!canProceed || !isLive}
        onClick={onNext}
      >
        <Icon name="ArrowRight" size={20} />
        {t('Find My Vehicle')}
      </Button>
    </Card>
  )
}

function VehicleStep({
  onSelect,
  onBack,
}: {
  onSelect: (id: string) => void
  onBack: () => void
}) {
  const { t } = usePreferences()

  return (
    <Card className="flex flex-col gap-5 p-6">
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
            disabled={!isLive}
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
}: {
  selected: string | null
  onSelect: (id: string) => void
  onConfirm: () => void
  onBack: () => void
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

      <Button
        size="lg"
        className="h-14 w-full text-base"
        disabled={!selected || !isLive}
        onClick={onConfirm}
      >
        <Icon name="CheckCircle" size={20} />
        {t('Confirm Check-In')}
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
