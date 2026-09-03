import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import {
  AppHeroCard,
  AppListRow,
  AppRowSkeleton,
  AppSection,
} from '@/components/shell/CustomerAppShell'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { Timeline, type TimelineStep } from '@/components/ui/Timeline'
import { useToast } from '@/components/ui/Toast'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States'
import { WORKSHOP_STAGES } from '@/components/ui/WorkflowStepper'
import { UNKNOWN } from '@/screens/registry/writes'
import { railIndexFor, type JobRow } from '@/screens/workshop/stages'
import { isDone, isInProgress, type EstimateRow, type VehicleRow } from '@/screens/portals/portal-data'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, useCreate } from '@/data/useCollection'

/** The eleven customer-app screens. They render inside `CustomerAppShell`,
 *  which supplies the 430px frame, header and bottom tab bar. */

// ── Home ────────────────────────────────────────────────────────────────────
/** The job row widened with the columns only the API serves. */
type HomeJob = JobRow & {
  /** Promised completion, when the workshop has set one. */
  eta?: string | null
  estimatedCompletion?: string | null
}

/** Where the active job sits on the six-step rail. An API row says so through
 *  `stage`; a fixture row only carries the older `st`, and `in_progress` is a
 *  card under repair rather than one still at check-in. */
function railPosition(job: HomeJob): number {
  if (job.stage) return railIndexFor(job.stage)
  return job.st === 'in_progress' ? 3 : 0
}

const QUICK_ACTIONS = [
  { icon: 'CalendarPlus', label: 'Book', to: '/customer-app/appointments' },
  { icon: 'ShoppingBag', label: 'Shop', to: '/customer-app/marketplace' },
  { icon: 'Wallet', label: 'Wallet', to: '/customer-app/wallet' },
  { icon: 'Shield', label: 'Insure', to: '/customer-app/insurance' },
] as const

export function CustomerAppHome() {
  const { t } = usePreferences()
  const { userName } = useSession()
  const navigate = useNavigate()
  const vehicles = useCollection('vehicles')
  const jobs = useCollection('jobs')
  const estimates = useCollection('estimates')

  const vehicleRows = (vehicles.data ?? []) as readonly VehicleRow[]
  const jobRows = (jobs.data ?? []) as readonly HomeJob[]
  const active = jobRows.find(isInProgress) ?? jobRows.find((row) => !isDone(row))
  const activeVehicle = active ? vehicleRows.find((row) => row.make === active.veh) : undefined
  /* "Pending approval" is an estimate the workshop has *sent* for this vehicle
   * and nobody has answered — the vocabulary the estimates collection uses. */
  const awaitingApproval =
    !!active &&
    (active.stage === 'estimate' ||
      ((estimates.data ?? []) as readonly EstimateRow[]).some(
        (row) => row.status === 'sent' && row.veh === active.veh
      ))

  const loading = vehicles.isLoading || jobs.isLoading
  const failed = vehicles.isError || jobs.isError

  return (
    <>
      {/* The greeting is the one thing that never waits on a fetch. */}
      <div className="flex items-center gap-2.5">
        <Avatar name={userName} size={40} />
        <div className="min-w-0">
          <p className="text-xs text-muted">{t('Welcome back,')}</p>
          <p className="truncate text-sm font-bold text-heading">{userName}</p>
        </div>
      </div>

      {loading ? (
        <HomeSkeleton />
      ) : failed ? (
        <ErrorState
          description={(vehicles.error ?? jobs.error)?.message}
          onRetry={() => {
            void vehicles.refetch()
            void jobs.refetch()
          }}
        />
      ) : (
        <>
          {active ? (
            <ActiveServiceHero
              job={active}
              plate={activeVehicle?.plate}
              awaitingApproval={awaitingApproval}
              onTrack={() => navigate('/customer-app/service-tracking')}
              onApprove={() => navigate('/customer-approval')}
            />
          ) : null}

          <div className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.to)}
                className="flex min-h-[64px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border border-border bg-card p-3 transition-transform active:scale-[.98] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
              >
                <span className="flex rounded-[10px] bg-salis-blue/[.08] p-2 text-salis-blue">
                  <Icon name={action.icon} size={16} />
                </span>
                <span className="text-[11px] font-semibold text-body">{t(action.label)}</span>
              </button>
            ))}
          </div>

          <AppSection
            title={t('My Vehicles')}
            action={
              <button
                type="button"
                onClick={() => navigate('/customer-app/garage')}
                className="min-h-[44px] cursor-pointer border-none bg-transparent px-2 font-action text-xs font-semibold text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
              >
                {t('View All')}
              </button>
            }
          />
          {vehicleRows.length === 0 ? (
            <EmptyState
              icon="Car"
              title={t('Add your first vehicle')}
              description={t('Your vehicles and their service history appear here.')}
            />
          ) : (
            vehicleRows.slice(0, 3).map((vehicle) => (
              <AppListRow
                key={vehicle.plate}
                icon="Car"
                title={vehicle.make}
                subtitle={
                  <span className="font-mono" dir="ltr">
                    {vehicle.plate}
                  </span>
                }
                onClick={() => navigate('/customer-app/garage')}
                trailing={
                  vehicle.status === 'service' ? (
                    <Badge background="var(--tint-bright)" color="var(--salis-blue-bright)">
                      {t('In Service')}
                    </Badge>
                  ) : null
                }
              />
            ))
          )}
        </>
      )}
    </>
  )
}

/** Hero skeleton, four tiles and three rows — the shape the home takes once
 *  the collections land, so nothing jumps under the greeting. */
function HomeSkeleton() {
  const { t } = usePreferences()
  return (
    <div role="status" aria-label={t('Loading')} className="flex flex-col gap-3.5">
      <span aria-hidden className="flex h-[132px] flex-col gap-3 rounded-xl bg-salis-gradient p-[18px] opacity-70">
        <Skeleton className="h-3 w-1/3 bg-white/30" />
        <Skeleton className="h-6 w-2/3 bg-white/30" />
        <Skeleton className="mt-auto h-9 w-full rounded-lg bg-white/25" />
      </span>
      <span aria-hidden className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[64px] rounded-[14px]" />
        ))}
      </span>
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: 3 }, (_, i) => (
        <AppRowSkeleton key={i} />
      ))}
      <span className="sr-only">{t('Loading...')}</span>
    </div>
  )
}

/** The live status of the vehicle in the workshop: stage dots, the promised
 *  time when there is one, and the one action that matters right now. */
function ActiveServiceHero({
  job,
  plate,
  awaitingApproval,
  onTrack,
  onApprove,
}: {
  job: HomeJob
  plate?: string
  awaitingApproval: boolean
  onTrack: () => void
  onApprove: () => void
}) {
  const { t, rtl } = usePreferences()
  const reached = railPosition(job)
  const eta = job.eta ?? job.estimatedCompletion ?? null

  return (
    <AppHeroCard icon="Wrench" label={t('Active Service')} value={job.veh}>
      {plate ? (
        <p className="mt-1 font-mono text-xs opacity-90" dir="ltr">
          {plate}
        </p>
      ) : null}

      <ol aria-label={t('Stage')} className="mt-3 flex list-none items-center gap-1.5 p-0">
        {WORKSHOP_STAGES.map((stage, index) => (
          <li
            key={stage}
            aria-current={index === reached ? 'step' : undefined}
            className="flex flex-1 flex-col gap-1"
          >
            <span
              aria-hidden
              className={cn(
                'block h-1.5 rounded-full',
                index < reached ? 'bg-white' : index === reached ? 'bg-white/90' : 'bg-white/25'
              )}
            />
            <span className="sr-only">{t(stage)}</span>
          </li>
        ))}
      </ol>
      <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] opacity-90">
        <span>{t(WORKSHOP_STAGES[reached])}</span>
        {eta ? (
          <span>
            {t('ETA')} <span dir="ltr">{eta}</span>
          </span>
        ) : null}
      </div>

      {awaitingApproval ? (
        <Button variant="destructive" size="lg" className="mt-3 w-full" onClick={onApprove} icon="FileCheck">
          {t('Approve estimate')}
        </Button>
      ) : (
        <button
          type="button"
          onClick={onTrack}
          className="mt-3 flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border-none bg-white/20 py-2 font-action text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-salis-blue"
        >
          {t('Track')}
          <Icon name={rtl ? 'ArrowLeft' : 'ArrowRight'} size={13} />
        </button>
      )}
    </AppHeroCard>
  )
}

// ── Garage ──────────────────────────────────────────────────────────────────
export function CustomerAppGarage() {
  const { t } = usePreferences()
  const { data: vehicles = [], isLoading, isError, error, refetch } = useCollection('vehicles')
  const [adding, setAdding] = useState(false)

  return (
    <>
      <AppSection title={t('My Garage')} />
      {isLoading ? (
        <div role="status" aria-label={t('Loading')} className="flex flex-col gap-3.5">
          {Array.from({ length: 3 }, (_, i) => (
            <AppRowSkeleton key={i} />
          ))}
          <span className="sr-only">{t('Loading...')}</span>
        </div>
      ) : isError ? (
        <ErrorState description={error?.message} onRetry={() => void refetch()} />
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon="Car"
          title={t('Add your first vehicle')}
          description={t('Your vehicles and their service history appear here.')}
        />
      ) : (
        vehicles.map((vehicle) => (
          <div
            key={vehicle.plate}
            className="flex flex-col gap-2 rounded-[14px] border border-border bg-card p-3.5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-salis-blue/[.08] text-salis-blue">
                <Icon name="Car" size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-heading">{vehicle.make}</p>
                <p className="font-mono text-[11px] text-muted" dir="ltr">
                  {vehicle.plate}
                </p>
              </div>
              {vehicle.status === 'service' ? (
                <Badge background="var(--tint-bright)" color="var(--salis-blue-bright)">
                  {t('In Service')}
                </Badge>
              ) : null}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted">
              <span dir="ltr">{vehicle.mileage}</span>
              <span>
                {t('Last Service')}: {vehicle.last ? t(vehicle.last) : UNKNOWN}
              </span>
            </div>
          </div>
        ))
      )}
      <Button size="lg" className="w-full" icon="Plus" onClick={() => setAdding(true)}>
        {t('Add Vehicle')}
      </Button>
      <VehicleFormModal open={adding} onClose={() => setAdding(false)} />
    </>
  )
}

/** The plate as the design writes it: Latin letters, a space, digits.
 *  Lower-case is corrected rather than rejected — a phone keyboard decides
 *  its own case. */
const PLATE_PATTERN = /^[A-Z]{2,3} ?\d{1,4}$/

/** Bottom-sheet form that adds a vehicle through the repository seam. */
function VehicleFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = usePreferences()
  const { userName } = useSession()
  const toast = useToast()
  const create = useCreate('vehicles')
  const makeId = useId()
  const plateId = useId()
  const [make, setMake] = useState('')
  const [plate, setPlate] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const makeError = make.trim().length < 2 ? t('Enter the make and model.') : null
  const normalisedPlate = plate.trim().toUpperCase()
  const plateError = !PLATE_PATTERN.test(normalisedPlate) ? t('Enter a plate like ABC 1234.') : null

  function reset() {
    setMake('')
    setPlate('')
    setSubmitted(false)
  }

  function close() {
    reset()
    onClose()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (makeError || plateError) return
    try {
      await create.mutateAsync({
        input: {
          make: make.trim(),
          plate: normalisedPlate,
          owner: userName,
          mileage: UNKNOWN,
          last: 'Never',
          status: 'active',
        },
      })
      toast.show({ title: t('Vehicle added'), description: `${make.trim()} · ${normalisedPlate}` })
      close()
    } catch (cause) {
      toast.show({
        title: t("Couldn't add the vehicle"),
        description: (cause as Error).message,
        tone: 'error',
      })
    }
  }

  const formId = `${makeId}-form`

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add Vehicle"
      icon="Car"
      sheet="bottom"
      footer={
        <>
          <Button variant="subtle" size="lg" onClick={close}>
            {t('Cancel')}
          </Button>
          <Button type="submit" form={formId} size="lg" loading={create.isPending}>
            {t('Save Vehicle')}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={(event) => void handleSubmit(event)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={makeId} className="font-action text-[13px] font-medium text-heading">
            {t('Make & Model')}
          </label>
          <Input
            id={makeId}
            value={make}
            onChange={(event) => setMake(event.target.value)}
            placeholder={t('Toyota Camry 2022')}
            invalid={submitted && !!makeError}
            aria-describedby={submitted && makeError ? `${makeId}-error` : undefined}
            autoComplete="off"
          />
          {submitted && makeError ? (
            <p id={`${makeId}-error`} className="text-xs text-salis-orange">
              {makeError}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={plateId} className="font-action text-[13px] font-medium text-heading">
            {t('License Plate')}
          </label>
          <Input
            id={plateId}
            value={plate}
            onChange={(event) => setPlate(event.target.value)}
            placeholder="ABC 1234"
            dir="ltr"
            autoCapitalize="characters"
            autoComplete="off"
            className="font-mono uppercase"
            invalid={submitted && !!plateError}
            aria-describedby={submitted && plateError ? `${plateId}-error` : undefined}
          />
          {submitted && plateError ? (
            <p id={`${plateId}-error`} className="text-xs text-salis-orange">
              {plateError}
            </p>
          ) : null}
        </div>
      </form>
    </Modal>
  )
}

// ── Appointments ────────────────────────────────────────────────────────────
export function CustomerAppAppointments() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const { data: appointments = [], isLoading, isError, error, refetch } = useCollection('appointments')

  return (
    <>
      <AppSection title={t('My Bookings')} />
      {isLoading ? (
        <div role="status" aria-label={t('Loading')} className="flex flex-col gap-3.5">
          {Array.from({ length: 3 }, (_, i) => (
            <AppRowSkeleton key={i} />
          ))}
          <span className="sr-only">{t('Loading...')}</span>
        </div>
      ) : isError ? (
        <ErrorState description={error?.message} onRetry={() => void refetch()} />
      ) : appointments.length === 0 ? (
        <EmptyState icon="CalendarX" title={t('Nothing booked yet')} description={t('Your next visit appears here once you book it.')} />
      ) : null}
      {appointments.slice(0, 4).map((appointment, index) => (
        <AppListRow
          key={`${appointment.plate}-${index}`}
          icon="Calendar"
          title={t(appointment.svc)}
          subtitle={`${appointment.time} · ${appointment.veh}`}
          trailing={
            <Badge
              background={
                appointment.status === 'confirmed' ? 'var(--tint-blue)' : 'var(--tint-bright)'
              }
              color={appointment.status === 'confirmed' ? 'var(--salis-blue)' : 'var(--salis-blue-bright)'}
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
      <AppHeroCard icon="Radio" label={t('Active Service')} value="Toyota Camry 2022">
        <p className="mt-1 font-mono text-xs opacity-90" dir="ltr">
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
      <AppHeroCard icon="Wallet" label={t('Balance')} value={<Money sar={balance} className="font-display" />}>
        <button
          type="button"
          disabled
          className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border-none bg-white/20 py-2 font-action text-xs font-semibold text-white opacity-50 focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2"
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
          iconColor={txn.amount < 0 ? 'var(--salis-orange)' : 'var(--salis-blue)'}
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
              background={order.status === 'Delivered' ? 'var(--tint-blue)' : 'var(--tint-bright)'}
              color={order.status === 'Delivered' ? 'var(--salis-blue)' : 'var(--salis-blue-bright)'}
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
          trailing={<span className="flex-shrink-0 text-[11px] text-faint">{t(notification.time)}</span>}
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
      <AppListRow icon="Car" title="Toyota Camry 2022" subtitle={<span className="font-mono" dir="ltr">RUH 4821</span>} />
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
        <Avatar name={userName} size={64} />
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
        iconColor="var(--salis-orange)"
        title={t('Logout')}
        onClick={() => {
          signOut()
          navigate('/login', { replace: true })
        }}
      />
    </>
  )
}
