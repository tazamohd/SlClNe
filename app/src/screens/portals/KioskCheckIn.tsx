import { useEffect, useState } from 'react'
import { CircleCheckBig } from 'lucide-react'
import { Icon } from '@/components/ui/Icon'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollectionWrite } from '@/data/useCollectionWrite'
import { MockWriteError } from '@/data/repository'
import { cn } from '@/lib/cn'

type Translate = (source: string) => string
type Step = 'checkin' | 'confirmation'

interface ServiceOption {
  icon: string
  label: string
}

const SERVICES: ServiceOption[] = [
  { icon: 'Wrench', label: 'Maintenance' },
  { icon: 'Cog', label: 'Repair' },
  { icon: 'SearchCheck', label: 'Inspection' },
  { icon: 'CircleDot', label: 'Tire Service' },
  { icon: 'Droplets', label: 'Oil Change' },
]

/** Demo queue ticket. A real terminal would get this from the check-in API;
 *  there's no backend here, so it's the same fixed ticket every run. */
const QUEUE_NUMBER = 'A-014'

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

/** Lobby walk-in terminal — a standalone, unauthenticated tablet screen with
 *  no app shell and no session, so it lives in PUBLIC_SCREENS. It always
 *  renders on its own navy backdrop regardless of the visitor's light/dark
 *  preference, matching the physical kiosk hardware in the design.
 *
 *  Two local steps: scan-or-type plate/phone + pick a service, then a queue
 *  ticket confirmation with a reset button that leaves the tablet ready for
 *  the next car. */
export function KioskCheckIn() {
  const { t, rtl, toggleLanguage } = usePreferences()
  const toast = useToast()
  const { create } = useCollectionWrite('appointments')
  const [step, setStep] = useState<Step>('checkin')
  const [plate, setPlate] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState<string>('Maintenance')
  const [time, setTime] = useState(() => formatTime(new Date()))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(formatTime(new Date())), 1000)
    return () => clearInterval(timer)
  }, [])

  /** Registers the walk-in through the repository write seam in the full shape
   *  GET /appointments returns (the API requires every column), then shows the
   *  queue ticket. Under the mock repo the write throws `MockWriteError` — demo
   *  mode, so it still confirms; a real API failure surfaces an error toast and
   *  stays on the form. A walk-in has no account, so cust/veh/bay/tech start as
   *  placeholders; the phone has no served appointment field, so it isn't sent. */
  async function handleCheckIn() {
    const appointment = {
      time,
      cust: 'Walk-in',
      veh: '—',
      plate,
      svc: service,
      status: 'awaiting',
      bay: '—',
      tech: '—',
      mins: 30,
    }

    setSaving(true)
    try {
      await create(appointment)
      setStep('confirmation')
    } catch (error) {
      if (error instanceof MockWriteError) {
        setStep('confirmation')
        return
      }
      toast.show({
        title: t('Could not check in'),
        description: (error as Error).message,
        error: true,
      })
    } finally {
      setSaving(false)
    }
  }

  function startOver() {
    setPlate('')
    setPhone('')
    setService('Maintenance')
    setStep('checkin')
  }

  const selectedService = SERVICES.find((svc) => svc.label === service) ?? SERVICES[0]

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-salis-navy font-ui text-white"
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute -top-52 end-[-200px] h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(10,94,215,.2),transparent_65%)] blur-[80px]" />
        <div className="absolute -bottom-52 start-[-200px] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(11,179,255,.12),transparent_65%)] blur-[80px]" />
      </div>

      <div className="relative z-[1] flex items-center gap-3 px-5 py-5 sm:px-8">
        <img
          src="/assets/logo-blue-orange.png"
          alt="SALIS AUTO"
          className="h-auto w-10 flex-shrink-0"
        />
        <div className="min-w-0">
          <h1 className="bg-salis-gradient-r bg-clip-text font-display text-lg font-black text-transparent">
            SALIS AUTO
          </h1>
          <p className="truncate text-[11px] text-white/50">
            {t('Integrated Workshop Management')}
          </p>
        </div>
        <div className="flex-1" />
        <div
          className="hidden items-center gap-1.5 font-mono text-xs text-white/50 sm:flex"
          dir="ltr"
        >
          <Icon name="Clock" size={14} />
          <span>{time}</span>
        </div>
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex h-8 cursor-pointer items-center gap-1 rounded-md border border-white/15 bg-transparent px-2.5 font-action text-[11px] text-white/60"
        >
          <Icon name="Globe" size={12} />
          <span>{rtl ? 'English' : 'عربي'}</span>
        </button>
      </div>

      <div className="relative z-[1] flex flex-1 animate-fade-up flex-col items-center justify-center gap-8 px-4 py-6">
        {step === 'checkin' ? (
          <CheckinStep
            t={t}
            plate={plate}
            setPlate={setPlate}
            phone={phone}
            setPhone={setPhone}
            service={service}
            setService={setService}
            onCheckIn={handleCheckIn}
            saving={saving}
          />
        ) : (
          <ConfirmationStep
            t={t}
            plate={plate}
            serviceLabel={t(selectedService.label)}
            serviceIcon={selectedService.icon}
            onStartOver={startOver}
          />
        )}
      </div>

      <div className="relative z-[1] flex items-center justify-center gap-4 px-8 py-4 text-[11px] text-white/30">
        <span>{t('Powered by SALIS AUTO')}</span>
      </div>
    </div>
  )
}

function CheckinStep({
  t,
  plate,
  setPlate,
  phone,
  setPhone,
  service,
  setService,
  onCheckIn,
  saving,
}: {
  t: Translate
  plate: string
  setPlate: (value: string) => void
  phone: string
  setPhone: (value: string) => void
  service: string
  setService: (value: string) => void
  onCheckIn: () => void
  saving: boolean
}) {
  const canCheckIn = plate.trim().length > 0

  return (
    <>
      <div className="text-center">
        <h2 className="font-display text-[28px] font-black tracking-tight sm:text-4xl">
          {t('Vehicle Check-In')}
        </h2>
        <p className="mt-2 text-sm text-white/60 sm:text-base">
          {t('Scan your QR code or enter vehicle details')}
        </p>
      </div>

      <div className="flex w-full max-w-[700px] flex-col items-center gap-6 sm:flex-row sm:items-stretch">
        <div className="flex flex-1 flex-col items-center gap-4">
          <div className="relative flex h-[160px] w-[160px] items-center justify-center rounded-[20px] border-[3px] border-[rgba(10,94,215,.4)] bg-[rgba(10,94,215,.05)] sm:h-[200px] sm:w-[200px]">
            <Icon name="QrCode" size={56} className="animate-pulse text-[rgba(10,94,215,.5)]" />
          </div>
          <p className="text-sm text-white/50">{t('Point camera at QR code')}</p>
        </div>

        <div
          className="flex w-full items-center gap-2 sm:w-auto sm:flex-col sm:justify-center"
          aria-hidden
        >
          <div className="h-px flex-1 bg-white/10 sm:h-full sm:w-px sm:flex-1" />
          <span className="text-xs font-semibold text-white/30">{t('OR')}</span>
          <div className="h-px flex-1 bg-white/10 sm:h-full sm:w-px sm:flex-1" />
        </div>

        <div className="flex flex-1 flex-col justify-center gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kiosk-plate" className="font-action text-xs font-medium text-white/50">
              {t('License Plate')}
            </label>
            <input
              id="kiosk-plate"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              dir="ltr"
              placeholder="RUH 4821"
              className="h-14 rounded-xl border-2 border-white/10 bg-white/5 px-4 text-center font-mono text-xl font-bold uppercase tracking-widest text-white outline-none focus:border-salis-blue focus:bg-[rgba(10,94,215,.08)] focus:shadow-[0_0_0_4px_rgba(10,94,215,.2)]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kiosk-phone" className="font-action text-xs font-medium text-white/50">
              {t('Phone')}
            </label>
            <input
              id="kiosk-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              placeholder="+966 5X XXX XXXX"
              className="h-14 rounded-xl border-2 border-white/10 bg-white/5 px-4 text-center font-mono text-lg text-white outline-none focus:border-salis-blue focus:bg-[rgba(10,94,215,.08)] focus:shadow-[0_0_0_4px_rgba(10,94,215,.2)]"
            />
          </div>
          <button
            type="button"
            onClick={onCheckIn}
            disabled={!canCheckIn || saving}
            className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-salis-gradient font-action text-base font-bold tracking-wide text-white shadow-[0_8px_24px_rgba(10,94,215,.4)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="Check" size={20} />
            {saving ? t('Checking in...') : t('Check-In')}
          </button>
        </div>
      </div>

      <div className="flex max-w-[600px] flex-wrap justify-center gap-3">
        {SERVICES.map((svc) => {
          const active = service === svc.label
          return (
            <button
              key={svc.label}
              type="button"
              onClick={() => setService(svc.label)}
              aria-pressed={active}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl px-5 py-3.5 font-action text-xs font-semibold transition-all duration-150',
                active
                  ? 'border-none bg-salis-gradient text-white shadow-[0_4px_16px_rgba(10,94,215,.4)]'
                  : 'border border-white/10 bg-white/5 text-white/60'
              )}
            >
              <Icon name={svc.icon} size={18} />
              <span>{t(svc.label)}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

function ConfirmationStep({
  t,
  plate,
  serviceLabel,
  serviceIcon,
  onStartOver,
}: {
  t: Translate
  plate: string
  serviceLabel: string
  serviceIcon: string
  onStartOver: () => void
}) {
  return (
    <div className="flex w-full max-w-[440px] flex-col items-center gap-6 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(10,94,215,.1)] text-salis-blue">
        <CircleCheckBig size={44} strokeWidth={2} aria-hidden />
      </span>
      <div>
        <h2 className="font-display text-3xl font-black">{t('Checked In')}</h2>
        <p className="mt-2 text-sm text-white/60">
          {t("We'll call your number when a bay is ready")}
        </p>
      </div>

      <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-10 py-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
          {t('Your Queue Number')}
        </span>
        <span className="font-mono text-5xl font-black text-salis-bright" dir="ltr">
          {QUEUE_NUMBER}
        </span>
      </div>

      <div className="flex w-full flex-col gap-2.5 rounded-xl border border-white/10 bg-white/5 px-5 py-4">
        <SummaryRow label={t('License Plate')} value={plate || '—'} ltr />
        <div className="h-px bg-white/10" />
        <SummaryRow label={t('Service')} value={serviceLabel} icon={serviceIcon} />
      </div>

      <button
        type="button"
        onClick={onStartOver}
        className="mt-2 h-12 w-full cursor-pointer rounded-xl border border-white/15 bg-transparent font-action text-sm font-semibold text-white/70"
      >
        {t('Start New Check-In')}
      </button>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  icon,
  ltr,
}: {
  label: string
  value: string
  icon?: string
  ltr?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-white/50">{label}</span>
      <span className="flex items-center gap-1.5 font-semibold text-white" dir={ltr ? 'ltr' : undefined}>
        {icon ? <Icon name={icon} size={14} /> : null}
        {value}
      </span>
    </div>
  )
}
