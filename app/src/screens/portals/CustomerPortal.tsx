import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle, Home as HomeIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { Money } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Standalone customer portal — CustomerPortal.dc.html (home) and
 *  CustomerPortal.Booking.dc.html (booking). A 430px phone-frame surface with
 *  its own header and bottom nav, exactly as the design draws it: a customer
 *  reaches these without a SALIS AUTO staff session, so there is no
 *  `useSession`/RBAC here, no `AppShell` — `PortalChrome` below is the whole
 *  page frame, shared by both routes so the header/nav markup lives once. */

const CUSTOMER_NAME = 'Ahmed Al-Rashid'
const ACTIVE_TICKET = 'JC-A3F8B2C1'

const TABS: readonly { to?: string; icon: string; label: string }[] = [
  { to: '/customer-portal', icon: 'Home', label: 'Home' },
  { icon: 'Car', label: 'Vehicles' },
  { to: '/customer-portal/booking', icon: 'Calendar', label: 'Book' },
  { icon: 'User', label: 'Profile' },
]

// ── Portal chrome (header + bottom nav), shared by both routes ─────────────
function PortalChrome({
  title,
  back,
  nav = false,
  children,
}: {
  /** Booking screen's header title; home screen omits it for the greeting. */
  title?: string
  /** Route the back chevron returns to. Home has none. */
  back?: string
  /** The design only draws the bottom tab bar on the home screen. */
  nav?: boolean
  children: ReactNode
}) {
  const { t, rtl, theme, toggleTheme } = usePreferences()
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen justify-center bg-page-alt font-ui">
      <div className="flex h-screen w-full max-w-[430px] flex-col border-x border-border bg-page">
        <header className="flex flex-shrink-0 items-center gap-2.5 border-b border-border bg-sidebar px-4 py-3">
          {back ? (
            <Link
              to={back}
              aria-label={t('Back')}
              className="flex flex-shrink-0 text-muted no-underline hover:no-underline"
            >
              <Icon name={rtl ? 'ChevronRight' : 'ChevronLeft'} size={20} />
            </Link>
          ) : (
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-sm font-bold text-white">
              {CUSTOMER_NAME.trim()[0]}
            </span>
          )}
          <div className="min-w-0 flex-1">
            {title ? (
              <h1 className="truncate font-display text-[17px] font-extrabold text-heading">{title}</h1>
            ) : (
              <>
                <p className="truncate text-sm font-bold text-heading">
                  {t('Hi,')} {CUSTOMER_NAME.split(' ')[0]}
                </p>
                <p className="truncate text-[11px] text-muted">{t('Your service journey')}</p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('Toggle theme')}
            className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted"
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="flex animate-fade-up flex-col gap-4 p-4">{children}</div>
        </main>

        {nav ? (
          <nav className="flex flex-shrink-0 border-t border-border bg-sidebar py-2">
            {TABS.map((tab) => {
              const active = tab.to === pathname
              const body = (
                <>
                  {tab.icon === 'Home' ? <HomeIcon size={19} /> : <Icon name={tab.icon} size={19} />}
                  <span className="font-action text-[10px] font-semibold">{t(tab.label)}</span>
                </>
              )
              return tab.to ? (
                <Link
                  key={tab.label}
                  to={tab.to}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1 no-underline transition-colors hover:no-underline',
                    active ? 'text-salis-blue' : 'text-muted'
                  )}
                >
                  {body}
                </Link>
              ) : (
                <span key={tab.label} aria-disabled className="flex flex-1 flex-col items-center gap-1 text-muted opacity-60">
                  {body}
                </span>
              )
            })}
          </nav>
        ) : null}
      </div>
    </div>
  )
}

// ── /customer-portal — service tracking home ────────────────────────────────
type StepState = 'done' | 'current' | 'pending'
const TIMELINE: readonly { label: string; num: string; state: StepState }[] = [
  { label: 'Check-In', num: '1', state: 'done' },
  { label: 'Inspect', num: '2', state: 'done' },
  { label: 'Repair', num: '4', state: 'current' },
  { label: 'QC', num: '5', state: 'pending' },
  { label: 'Delivery', num: '6', state: 'pending' },
]

const QUICK_ACTIONS: readonly { icon: string; label: string; color: string; to?: string }[] = [
  { icon: 'Calendar', label: 'Book', color: '#0A5ED7', to: '/customer-portal/booking' },
  { icon: 'Receipt', label: 'Invoices', color: '#0BB3FF' },
  { icon: 'Car', label: 'Vehicles', color: '#0A5ED7' },
  { icon: 'Headphones', label: 'Support', color: '#F97316' },
]

const MY_VEHICLES: readonly { make: string; plate: string; lastDate: string; nextDate: string }[] = [
  { make: 'Toyota Camry 2022', plate: 'RUH 4821', lastDate: 'Jul 15', nextDate: 'Oct 15' },
  { make: 'Lexus ES 350 2020', plate: 'RUH 7743', lastDate: 'Jun 3', nextDate: 'Sep 3' },
]

const HISTORY: readonly { icon: string; service: string; date: string; vehicle: string; cost: number; color: string }[] = [
  { icon: 'Cog', service: 'Oil Change', date: 'Jul 15', vehicle: 'Camry', cost: 590, color: '#0A5ED7' },
  { icon: 'Disc', service: 'Brake Pads (Front)', date: 'May 22', vehicle: 'Camry', cost: 535, color: '#0BB3FF' },
  { icon: 'SearchCheck', service: 'Multi-Point Inspection', date: 'Apr 8', vehicle: 'Lexus', cost: 170, color: '#0A5ED7' },
]

export function CustomerPortal() {
  const { t } = usePreferences()

  return (
    <PortalChrome nav>
      {/* Active service */}
      <div className="flex flex-col gap-3.5 rounded-2xl bg-salis-gradient p-[18px] text-white shadow-[0_8px_24px_rgba(10,94,215,.3)]">
        <div className="flex items-center gap-2">
          <Icon name="Car" size={18} />
          <span className="text-sm font-bold">{t('Active Service')}</span>
          <span className="flex-1" />
          <span className="text-[11px] opacity-80" dir="ltr">
            {ACTIVE_TICKET}
          </span>
        </div>
        <div>
          <p className="text-base font-extrabold">Toyota Camry 2022</p>
          <p className="mt-0.5 text-xs opacity-80" dir="ltr">
            RUH 4821 · {t('Maintenance')} &amp; {t('Repair')}
          </p>
        </div>
        <div className="flex items-center gap-0">
          {TIMELINE.map((step, i) => (
            <div key={step.label} className="flex flex-1 items-center gap-0 last:flex-none">
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className={cn(
                    'flex items-center justify-center rounded-full font-bold',
                    step.state === 'current' ? 'h-[22px] w-[22px] bg-white text-[10px] text-salis-blue shadow-[0_2px_8px_rgba(0,0,0,.2)]' : 'h-5 w-5 text-[9px]',
                    step.state === 'done' && 'bg-white/30',
                    step.state === 'pending' && 'bg-white/15 opacity-50'
                  )}
                >
                  {step.state === 'done' ? <Icon name="Check" size={10} strokeWidth={3} /> : step.num}
                </span>
                <span className={cn('text-[8px]', step.state === 'current' ? 'font-bold' : 'opacity-70')}>{t(step.label)}</span>
              </div>
              {i < TIMELINE.length - 1 ? (
                <div className={cn('h-0.5 flex-1', step.state === 'pending' ? 'bg-white/15' : 'bg-white/30')} />
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Icon name="Clock" size={13} />
          <span>{t('Est. ready: Today 5:00 PM')}</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2">
        {QUICK_ACTIONS.map((qa) => {
          const inner = (
            <>
              <span className="flex rounded-[10px] p-2" style={{ background: `${qa.color}1a`, color: qa.color }}>
                <Icon name={qa.icon} size={16} />
              </span>
              <span className="text-center text-[10px] font-semibold text-body">{t(qa.label)}</span>
            </>
          )
          return qa.to ? (
            <Link
              key={qa.label}
              to={qa.to}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3.5 no-underline hover:border-salis-blue hover:no-underline"
            >
              {inner}
            </Link>
          ) : (
            <button
              key={qa.label}
              type="button"
              className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3.5"
            >
              {inner}
            </button>
          )
        })}
      </div>

      {/* Pending estimate */}
      <div className="flex items-center gap-3 rounded-xl border border-[rgba(249,115,22,.2)] bg-card p-3.5">
        <span className="flex flex-shrink-0 rounded-[10px] bg-[rgba(249,115,22,.1)] p-2.5 text-salis-orange">
          <Icon name="Receipt" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-heading">{t('Pending Estimate')}</p>
          <p className="truncate text-[11px] text-muted">
            {t('Maintenance')} &amp; {t('Repair')} — Toyota Camry
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <Money sar={1546} className="text-sm font-extrabold text-heading" />
          <Button size="sm" className="h-7 px-3 text-[11px]">
            {t('Approve')}
          </Button>
        </div>
      </div>

      {/* My vehicles */}
      <h3 className="text-[13px] font-bold text-heading">{t('My Vehicles')}</h3>
      <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
        {MY_VEHICLES.map((vehicle) => (
          <div
            key={vehicle.plate}
            className="flex w-[200px] flex-shrink-0 flex-col gap-2 rounded-xl border border-border bg-card p-3.5"
          >
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg bg-[rgba(10,94,215,.08)] p-1.5 text-salis-blue">
                <Icon name="Car" size={14} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-heading">{vehicle.make}</p>
                <p className="truncate text-[10px] text-muted" dir="ltr">
                  {vehicle.plate}
                </p>
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-muted">
              <span>{t('Last Service')}</span>
              <span className="text-body" dir="ltr">
                {vehicle.lastDate}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-muted">
              <span>{t('Next Due')}</span>
              <span className="font-semibold text-salis-blue" dir="ltr">
                {vehicle.nextDate}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent history */}
      <h3 className="text-[13px] font-bold text-heading">{t('Recent History')}</h3>
      {HISTORY.map((row) => (
        <div
          key={`${row.service}-${row.date}`}
          className="flex items-center gap-2.5 rounded-[10px] border border-border bg-card p-3"
        >
          <span className="flex flex-shrink-0 rounded-lg p-1.5" style={{ background: `${row.color}1a`, color: row.color }}>
            <Icon name={row.icon} size={14} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-heading">{t(row.service)}</p>
            <p className="truncate text-[10px] text-muted">
              {row.date} · {row.vehicle}
            </p>
          </div>
          <Money sar={row.cost} className="flex-shrink-0 text-xs font-semibold text-heading" />
        </div>
      ))}
    </PortalChrome>
  )
}

// ── /customer-portal/booking — appointment booking ──────────────────────────
const BOOKING_STEPS = ['Vehicle', 'Service', 'Time', 'Confirm'] as const

const BOOKING_VEHICLES: readonly { make: string; plate: string }[] = [
  { make: 'Toyota Camry 2022', plate: 'RUH 4821' },
  { make: 'Lexus ES 350 2020', plate: 'RUH 7743' },
]

const BOOKING_SERVICES: readonly { icon: string; label: string }[] = [
  { icon: 'Wrench', label: 'Maintenance' },
  { icon: 'Cog', label: 'Repair' },
  { icon: 'SearchCheck', label: 'Inspection' },
  { icon: 'CircleDot', label: 'Tire Service' },
  { icon: 'Droplets', label: 'Oil Change' },
]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'] as const
const DATE_PILLS = DAY_LABELS.map((day, i) => ({ day, num: String(20 + i) }))

const TIME_SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
const BOOKED_TIMES = new Set(['11:00 AM', '2:00 PM'])

export function CustomerPortalBooking() {
  const { t } = usePreferences()
  const [vehicle, setVehicle] = useState(BOOKING_VEHICLES[0].make)
  const [service, setService] = useState('Maintenance')
  const [dateIndex, setDateIndex] = useState(2)
  const [time, setTime] = useState('9:00 AM')
  const [notes, setNotes] = useState('')

  return (
    <PortalChrome title={t('Book Appointment')} back="/customer-portal">
      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {BOOKING_STEPS.map((label, i) => {
          const state: StepState = i < 2 ? 'done' : i === 2 ? 'current' : 'pending'
          return (
            <div key={label} className="flex flex-1 items-center gap-0 last:flex-none">
              <div className="flex flex-shrink-0 flex-col items-center gap-1">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                    state === 'current' && 'bg-salis-gradient text-white',
                    state === 'done' && 'bg-salis-blue text-white',
                    state === 'pending' && 'border-[1.5px] border-border-strong bg-inset text-muted'
                  )}
                >
                  {i + 1}
                </span>
                <span className={cn('whitespace-nowrap text-[9px] font-semibold', state === 'current' ? 'text-salis-blue' : state === 'done' ? 'text-heading' : 'text-muted')}>
                  {t(label)}
                </span>
              </div>
              {i < BOOKING_STEPS.length - 1 ? (
                <div className={cn('mb-3.5 h-0.5 flex-1', state === 'done' ? 'bg-salis-blue' : 'bg-border')} />
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Vehicle */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-1.5">
          <Icon name="Car" size={14} className="text-salis-blue" />
          <h3 className="text-[13px] font-bold text-heading">{t('Select Vehicle')}</h3>
        </div>
        {BOOKING_VEHICLES.map((v) => {
          const picked = vehicle === v.make
          return (
            <button
              key={v.make}
              type="button"
              onClick={() => setVehicle(v.make)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-[10px] border-none p-2.5 text-start font-action',
                picked ? 'bg-[rgba(10,94,215,.06)] text-salis-blue' : 'bg-inset text-body'
              )}
            >
              <span className="flex rounded-lg bg-[rgba(10,94,215,.08)] p-1.5 text-salis-blue">
                <Icon name="Car" size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold">{v.make}</span>
                <span className="block text-[10px] opacity-70" dir="ltr">
                  {v.plate}
                </span>
              </span>
              {picked ? <CheckCircle size={16} className="flex-shrink-0 text-salis-blue" /> : null}
            </button>
          )
        })}
      </div>

      {/* Service */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-1.5">
          <Icon name="Wrench" size={14} className="text-salis-blue" />
          <h3 className="text-[13px] font-bold text-heading">{t('Select Service')}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {BOOKING_SERVICES.map((svc) => {
            const picked = service === svc.label
            return (
              <button
                key={svc.label}
                type="button"
                onClick={() => setService(svc.label)}
                className={cn(
                  'flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-3.5 py-2 font-action text-xs font-semibold',
                  picked ? 'bg-salis-gradient text-white' : 'bg-inset text-body'
                )}
              >
                <Icon name={svc.icon} size={14} />
                <span>{t(svc.label)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Date & time */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-1.5">
          <Icon name="Calendar" size={14} className="text-salis-blue" />
          <h3 className="text-[13px] font-bold text-heading">{t('Date & Time')}</h3>
        </div>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1">
          {DATE_PILLS.map((pill, i) => {
            const picked = dateIndex === i
            return (
              <button
                key={pill.num}
                type="button"
                onClick={() => setDateIndex(i)}
                className={cn(
                  'flex min-w-[48px] flex-shrink-0 cursor-pointer flex-col items-center gap-0.5 rounded-[10px] border-none px-3 py-2',
                  picked ? 'bg-salis-gradient text-white' : 'bg-inset text-body'
                )}
              >
                <span className="text-[10px] opacity-70">{t(pill.day)}</span>
                <span className="text-base font-bold">{pill.num}</span>
              </button>
            )
          })}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {TIME_SLOTS.map((slot) => {
            const booked = BOOKED_TIMES.has(slot)
            const picked = time === slot
            return (
              <button
                key={slot}
                type="button"
                dir="ltr"
                disabled={booked}
                onClick={() => setTime(slot)}
                className={cn(
                  'h-[38px] rounded-lg border-none font-mono text-xs font-semibold',
                  booked && 'cursor-default bg-inset text-faint opacity-50',
                  !booked && picked && 'cursor-pointer bg-salis-gradient text-white',
                  !booked && !picked && 'cursor-pointer bg-inset text-body'
                )}
              >
                {slot}
              </button>
            )
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4">
        <label htmlFor="booking-notes" className="font-action text-[11px] font-medium text-body">
          {t('Notes')}
        </label>
        <textarea
          id="booking-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('Any additional notes...')}
          className="resize-none rounded-lg border border-border bg-inset px-3 py-2.5 font-ui text-[13px] text-body outline-none focus:border-salis-blue focus:ring-2 focus:ring-[rgba(10,94,215,.15)]"
        />
      </div>

      <Button size="lg" className="w-full">
        <Icon name="CalendarCheck" size={18} />
        {t('Confirm Booking')}
      </Button>
    </PortalChrome>
  )
}
