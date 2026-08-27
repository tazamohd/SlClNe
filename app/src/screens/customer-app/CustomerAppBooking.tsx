import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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

interface BookingStep {
  step: number
  label: string
  icon: string
  completed: boolean
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

const STEPS: BookingStep[] = [
  { step: 1, label: 'Select Service', icon: 'Wrench', completed: true },
  { step: 2, label: 'Choose Vehicle', icon: 'Car', completed: true },
  { step: 3, label: 'Pick Time', icon: 'Clock', completed: false },
  { step: 4, label: 'Confirm', icon: 'CheckCircle', completed: false },
]

export function CustomerAppBooking() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="CalendarPlus" title={t('Book Service')} subtitle={t('Schedule appointment')} />

        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.step} className="flex flex-1 items-center gap-1">
              <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.completed ? 'bg-salis-gradient text-white' : 'border border-border bg-card text-muted'}`}>
                {s.completed ? <Icon name="Check" size={12} /> : s.step}
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 rounded ${s.completed ? 'bg-salis-blue' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <p className="text-[13px] font-bold text-heading">{t('Select Service')}</p>
        {SERVICES.map((svc) => (
          <MobileCard key={svc.name}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-1.5 text-salis-blue" aria-hidden><Icon name={svc.icon} size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{t(svc.name)}</p>
                    <p className="text-xs text-muted">{t(svc.duration)}</p>
                  </div>
                </div>
              }
              trailing={
                <div className="flex items-center gap-2">
                  {svc.popular && <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('Popular')}</Badge>}
                  <span className="font-mono text-sm font-bold text-heading" dir="ltr">{svc.price} SAR</span>
                </div>
              }
            />
          </MobileCard>
        ))}

        <p className="text-[13px] font-bold text-heading">{t('Available Times')}</p>
        <div className="grid grid-cols-4 gap-2">
          {TIME_SLOTS.map((slot) => (
            <Card
              key={slot.time}
              className={`rounded-lg p-2 text-center text-xs font-semibold shadow-sm ${slot.available ? 'text-salis-blue' : 'text-muted opacity-50'}`}
            >
              {slot.time}
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="CalendarPlus" title={t('Book Service')} subtitle={t('Schedule a service appointment')} />

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {STEPS.map((s, i) => (
            <div key={s.step} className="flex flex-1 items-center gap-3">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${s.completed ? 'bg-salis-gradient text-white' : 'border-2 border-border text-muted'}`}>
                {s.completed ? <Icon name="Check" size={16} /> : <Icon name={s.icon} size={16} />}
              </div>
              <span className={`text-sm font-semibold ${s.completed ? 'text-heading' : 'text-muted'}`}>{t(s.label)}</span>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 rounded ${s.completed ? 'bg-salis-blue' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SERVICES.map((svc) => (
          <Card key={svc.name} className="flex flex-col gap-3 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="flex rounded-lg bg-[rgba(10,94,215,.1)] p-2 text-salis-blue" aria-hidden><Icon name={svc.icon} size={18} /></span>
              {svc.popular && <Badge background="rgba(10,94,215,.1)" color="var(--salis-blue)">{t('Popular')}</Badge>}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-heading">{t(svc.name)}</h3>
              <p className="mt-0.5 text-xs text-muted">{t(svc.duration)}</p>
            </div>
            <p className="mt-auto font-mono text-lg font-bold text-heading" dir="ltr">{svc.price} <span className="text-xs font-normal text-muted">SAR</span></p>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h2 className="mb-4 font-display text-sm font-bold text-heading">{t('Available Time Slots')}</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.time}
              className={`rounded-lg border p-3 text-center text-sm font-semibold ${slot.available ? 'border-salis-blue/30 bg-[rgba(10,94,215,.05)] text-salis-blue' : 'border-border text-muted opacity-50'}`}
            >
              {slot.time}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
