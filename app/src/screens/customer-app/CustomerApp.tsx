import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import {
  AppHeroCard,
  AppListRow,
  AppSection,
} from '@/components/shell/CustomerAppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { Timeline, type TimelineStep } from '@/components/ui/Timeline'
import { useToast } from '@/components/ui/Toast'
import { EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'

/** The eleven customer-app screens. They render inside `CustomerAppShell`,
 *  which supplies the 430px frame, header and bottom tab bar. */

// ── Home ────────────────────────────────────────────────────────────────────
export function CustomerAppHome() {
  const { t } = usePreferences()
  const { userName } = useSession()
  const navigate = useNavigate()
  const { data: vehicles = [] } = useCollection('vehicles')

  const inService = vehicles.find((v) => v.status === 'service')

  return (
    <>
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-salis-gradient text-sm font-bold text-white">
          {userName.trim()[0] ?? '?'}
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted">{t('Welcome back,')}</p>
          <p className="truncate text-sm font-bold text-heading">{userName}</p>
        </div>
      </div>

      {inService ? (
        <AppHeroCard icon="Wrench" label={t('Active Service')} value={inService.make}>
          <p className="mt-1 text-xs opacity-90" dir="ltr">
            {inService.plate}
          </p>
          <button
            type="button"
            onClick={() => navigate('/customer-app/service-tracking')}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border-none bg-white/20 py-2 font-action text-xs font-semibold text-white focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
          >
            {t('Track Service')}
            <Icon name="ArrowRight" size={13} />
          </button>
        </AppHeroCard>
      ) : null}

      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: 'CalendarPlus', label: 'Book', to: '/customer-app/appointments' },
          { icon: 'ShoppingBag', label: 'Shop', to: '/customer-app/marketplace' },
          { icon: 'Wallet', label: 'Wallet', to: '/customer-app/wallet' },
          { icon: 'Shield', label: 'Insure', to: '/customer-app/insurance' },
        ].map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => navigate(action.to)}
            className="flex cursor-pointer flex-col items-center gap-1.5 rounded-[14px] border border-border bg-card p-3 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
          >
            <span className="flex rounded-[10px] bg-[rgba(10,94,215,.08)] p-2 text-salis-blue">
              <Icon name={action.icon} size={16} />
            </span>
            <span className="text-[10px] font-semibold text-body">{t(action.label)}</span>
          </button>
        ))}
      </div>

      <AppSection
        title={t('My Vehicles')}
        action={
          <button
            type="button"
            onClick={() => navigate('/customer-app/garage')}
            className="cursor-pointer border-none bg-transparent font-action text-xs font-semibold text-salis-blue focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
          >
            {t('View All')}
          </button>
        }
      />
      {vehicles.slice(0, 3).map((vehicle) => (
        <AppListRow
          key={vehicle.plate}
          icon="Car"
          title={vehicle.make}
          subtitle={vehicle.plate}
          onClick={() => navigate('/customer-app/garage')}
          trailing={
            vehicle.status === 'service' ? (
              <Badge background="rgba(11,179,255,.1)" color="#0BB3FF">
                {t('In Service')}
              </Badge>
            ) : null
          }
        />
      ))}
    </>
  )
}

// ── Garage ──────────────────────────────────────────────────────────────────
export function CustomerAppGarage() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const { data: vehicles = [] } = useCollection('vehicles')

  return (
    <>
      <AppSection title={t('My Garage')} />
      {vehicles.map((vehicle) => (
        <div
          key={vehicle.plate}
          className="flex flex-col gap-2 rounded-[14px] border border-border bg-card p-3.5"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-[rgba(10,94,215,.08)] text-salis-blue">
              <Icon name="Car" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-heading">{vehicle.make}</p>
              <p className="font-mono text-[11px] text-muted" dir="ltr">
                {vehicle.plate}
              </p>
            </div>
            {vehicle.status === 'service' ? (
              <Badge background="rgba(11,179,255,.1)" color="#0BB3FF">
                {t('In Service')}
              </Badge>
            ) : null}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted">
            <span dir="ltr">{vehicle.mileage}</span>
            <span>
              {t('Last Service')}: {vehicle.last}
            </span>
          </div>
        </div>
      ))}
      <Button size="lg" className="w-full" onClick={() => navigate('/customer-app/garage')}>
        <Icon name="Plus" size={16} />
        {t('Add Vehicle')}
      </Button>
    </>
  )
}

// ── Appointments ────────────────────────────────────────────────────────────
export function CustomerAppAppointments() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const { data: appointments = [] } = useCollection('appointments')

  return (
    <>
      <AppSection title={t('My Bookings')} />
      {appointments.slice(0, 4).map((appointment, index) => (
        <AppListRow
          key={`${appointment.plate}-${index}`}
          icon="Calendar"
          title={t(appointment.svc)}
          subtitle={`${appointment.time} · ${appointment.veh}`}
          trailing={
            <Badge
              background={
                appointment.status === 'confirmed' ? 'rgba(10,94,215,.1)' : 'rgba(11,179,255,.1)'
              }
              color={appointment.status === 'confirmed' ? '#0A5ED7' : '#0BB3FF'}
            >
              {t(appointment.status[0].toUpperCase() + appointment.status.slice(1))}
            </Badge>
          }
        />
      ))}
      <Button size="lg" className="w-full" onClick={() => navigate('/customer-app/appointments')}>
        <Icon name="CalendarPlus" size={16} />
        {t('Book Service')}
      </Button>
    </>
  )
}

// ── Service tracking ────────────────────────────────────────────────────────
const TRACKING: TimelineStep[] = [
  { icon: 'CheckCircle', label: 'Vehicle Checked In', time: 'Jul 18, 9:02 AM', done: true },
  { icon: 'SearchCheck', label: 'Diagnostics Started', time: 'Jul 18, 9:40 AM', done: true },
  { icon: 'Wrench', label: 'Repair In Progress', time: 'Jul 19, 8:30 AM', done: true },
  { icon: 'ShieldCheck', label: 'Quality Check', done: false },
  { icon: 'Car', label: 'Ready for Delivery', done: false },
]

export function CustomerAppServiceTracking() {
  const { t } = usePreferences()
  const done = TRACKING.filter((step) => step.done).length

  return (
    <>
      <AppHeroCard
        icon="Radio"
        label={t('Active Service')}
        value="Toyota Camry 2022"
      >
        <p className="mt-1 text-xs opacity-90" dir="ltr">
          JC-A3F8B2C1
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${(done / TRACKING.length) * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] opacity-90">
          {done} / {TRACKING.length} {t('stages complete')}
        </p>
      </AppHeroCard>

      <AppSection title={t('Progress')} />
      <div className="rounded-[14px] border border-border bg-card p-4">
        <Timeline steps={TRACKING} />
      </div>
    </>
  )
}

// ── Wallet ──────────────────────────────────────────────────────────────────
const TRANSACTIONS = [
  { desc: 'Service Payment', date: 'Jul 21', amount: -1840, icon: 'Wrench' },
  { desc: 'Wallet Top-up', date: 'Jul 20', amount: 3000, icon: 'Plus' },
  { desc: 'Parts Order', date: 'Jul 15', amount: -310, icon: 'Package' },
]

export function CustomerAppWallet() {
  const { t } = usePreferences()
  const balance = TRANSACTIONS.reduce((sum, txn) => sum + txn.amount, 0)

  return (
    <>
      {/* Balance derives from the transactions, so the header cannot drift from
          the list underneath it. */}
      <AppHeroCard icon="Wallet" label={t('Balance')} value={`SAR ${balance.toLocaleString('en-US')}.00`}>
        <button
          type="button"
          disabled
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border-none bg-white/20 py-2 font-action text-xs font-semibold text-white opacity-50 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
        >
          <Icon name="Plus" size={13} />
          {t('Top Up')}
        </button>
      </AppHeroCard>

      <AppSection title={t('Transactions')} />
      {TRANSACTIONS.map((txn) => (
        <AppListRow
          key={`${txn.desc}-${txn.date}`}
          icon={txn.icon}
          iconTint={txn.amount < 0 ? 'rgba(249,115,22,.08)' : 'rgba(10,94,215,.08)'}
          iconColor={txn.amount < 0 ? '#F97316' : '#0A5ED7'}
          title={t(txn.desc)}
          subtitle={txn.date}
          trailing={
            <span
              dir="ltr"
              className={cn(
                'font-mono text-[13px] font-semibold',
                txn.amount < 0 ? 'text-salis-orange' : 'text-salis-blue'
              )}
            >
              {txn.amount < 0 ? '−' : '+'} SAR {Math.abs(txn.amount).toLocaleString('en-US')}
            </span>
          }
        />
      ))}
    </>
  )
}

// ── Orders ──────────────────────────────────────────────────────────────────
const ORDERS = [
  { id: 'ORD-0042', items: 'Oil Filter + Air Filter', date: 'Jul 20, 2026', total: 140, status: 'Delivered' },
  { id: 'ORD-0041', items: 'Brake Pads (Front)', date: 'Jul 15, 2026', total: 310, status: 'Shipped' },
  { id: 'ORD-0038', items: 'Spark Plug Set', date: 'Jul 2, 2026', total: 140, status: 'Delivered' },
]

export function CustomerAppOrders() {
  const { t } = usePreferences()
  return (
    <>
      <AppSection title={t('My Orders')} />
      {ORDERS.map((order) => (
        <div
          key={order.id}
          className="flex flex-col gap-2 rounded-[14px] border border-border bg-card p-3.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[13px] font-semibold text-heading" dir="ltr">
              {order.id}
            </span>
            <Badge
              background={order.status === 'Delivered' ? 'rgba(10,94,215,.1)' : 'rgba(11,179,255,.1)'}
              color={order.status === 'Delivered' ? '#0A5ED7' : '#0BB3FF'}
            >
              {t(order.status)}
            </Badge>
          </div>
          <p className="text-[13px] text-body">{t(order.items)}</p>
          <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted">
            <span>{order.date}</span>
            <Money sar={order.total} className="font-semibold text-heading" />
          </div>
        </div>
      ))}
    </>
  )
}

// ── Marketplace ─────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Oil & Filters', 'Brakes', 'Tires', 'Battery', 'Accessories'] as const

const PRODUCTS = [
  { name: 'Oil Filter (Toyota)', price: 45, icon: 'Droplets', cat: 'Oil & Filters' },
  { name: 'Brake Pads (Front)', price: 310, icon: 'Disc', cat: 'Brakes' },
  { name: 'Air Filter (Universal)', price: 95, icon: 'Wind', cat: 'Oil & Filters' },
  { name: 'Spark Plug Set', price: 140, icon: 'Zap', cat: 'Accessories' },
]

export function CustomerAppMarketplace() {
  const { t } = usePreferences()
  const toast = useToast()
  const [category, setCategory] = useState<string>('All')

  // The design's category chips were decorative; filtering is the point of a
  // category row.
  const products =
    category === 'All' ? PRODUCTS : PRODUCTS.filter((product) => product.cat === category)

  return (
    <>
      <AppSection title={t('Marketplace')} />
      <ChipGroup label={t('Category')}>
        {CATEGORIES.map((option) => (
          <Chip
            key={option}
            label={t(option)}
            selected={category === option}
            onToggle={() => setCategory(option)}
          />
        ))}
      </ChipGroup>

      {products.length === 0 ? (
        <EmptyState icon="ShoppingBag" title={t('Nothing in this category')} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <div
              key={product.name}
              className="flex flex-col gap-2 rounded-[14px] border border-border bg-card p-3"
            >
              <span className="flex h-16 items-center justify-center rounded-lg bg-[linear-gradient(135deg,rgba(10,94,215,.06),rgba(11,179,255,.06))] text-salis-blue">
                <Icon name={product.icon} size={24} />
              </span>
              <p className="text-[12px] font-semibold leading-tight text-heading">
                {t(product.name)}
              </p>
              <div className="flex items-center justify-between gap-1">
                <Money sar={product.price} className="text-xs font-bold text-heading" />
                <button
                  type="button"
                  onClick={() => toast.show({ title: t('Added to cart'), description: product.name })}
                  aria-label={`${t('Add')}: ${t(product.name)}`}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border-none bg-salis-gradient text-white focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
                >
                  <Icon name="Plus" size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ── Notifications ───────────────────────────────────────────────────────────
const NOTIFICATIONS = [
  { title: 'Service Update', desc: 'Your Toyota Camry repair is in progress', time: '2 min ago', icon: 'Wrench' },
  { title: 'Appointment Reminder', desc: 'Oil change booked for tomorrow, 9:00 AM', time: '1 hour ago', icon: 'Calendar' },
  { title: 'Order Delivered', desc: 'ORD-0042 has been delivered', time: 'Yesterday', icon: 'Package' },
]

export function CustomerAppNotifications() {
  const { t } = usePreferences()
  return (
    <>
      <AppSection title={t('Notifications')} />
      {NOTIFICATIONS.map((notification) => (
        <AppListRow
          key={notification.title}
          icon={notification.icon}
          title={t(notification.title)}
          subtitle={t(notification.desc)}
          trailing={<span className="flex-shrink-0 text-[10px] text-faint">{t(notification.time)}</span>}
        />
      ))}
    </>
  )
}

// ── Insurance / loans ───────────────────────────────────────────────────────
export function CustomerAppInsurance() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  return (
    <>
      <AppSection title={t('Insurance')} />
      <AppHeroCard icon="Shield" label={t('Active Policy')} value="Tawuniya Comprehensive">
        <p className="mt-1 text-xs opacity-90">
          {t('Expires')} · 14 {t('March')} 2027
        </p>
      </AppHeroCard>
      <AppListRow icon="Car" title="Toyota Camry 2022" subtitle="RUH 4821" />
      <AppListRow icon="FileText" title={t('Policy Documents')} subtitle={t('Download or share')} onClick={() => navigate('/customer-app/insurance')} />
      <AppListRow icon="LifeBuoy" title={t('File a Claim')} subtitle={t('Start a new claim')} onClick={() => navigate('/customer-app/insurance')} />
    </>
  )
}

export function CustomerAppLoans() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  return (
    <>
      <AppSection title={t('Loans')} />
      <EmptyState
        icon="Banknote"
        title={t('No active finance')}
        description={t('Vehicle finance and instalment plans appear here.')}
      />
      <Button size="lg" className="w-full" onClick={() => navigate('/customer-app/loans')}>
        <Icon name="Plus" size={16} />
        {t('Apply for Finance')}
      </Button>
    </>
  )
}

// ── Profile ─────────────────────────────────────────────────────────────────
export function CustomerAppProfile() {
  const { t } = usePreferences()
  const { userName, roleLabel, signOut } = useSession()
  const navigate = useNavigate()

  return (
    <>
      <div className="flex flex-col items-center gap-2 py-3">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-salis-gradient text-xl font-bold text-white">
          {userName.trim()[0] ?? '?'}
        </span>
        <p className="text-sm font-bold text-heading">{userName}</p>
        <p className="text-xs text-muted">{roleLabel}</p>
      </div>

      <AppListRow icon="Wallet" title={t('Wallet')} onClick={() => navigate('/customer-app/wallet')} />
      <AppListRow icon="Package" title={t('My Orders')} onClick={() => navigate('/customer-app/orders')} />
      <AppListRow icon="Shield" title={t('Insurance')} onClick={() => navigate('/customer-app/insurance')} />
      <AppListRow icon="Banknote" title={t('Loans')} onClick={() => navigate('/customer-app/loans')} />
      <AppListRow
        icon="LogOut"
        iconTint="rgba(249,115,22,.08)"
        iconColor="#F97316"
        title={t('Logout')}
        onClick={() => {
          signOut()
          navigate('/login', { replace: true })
        }}
      />
    </>
  )
}
