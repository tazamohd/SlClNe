import { useNavigate } from 'react-router-dom'
import {
  AppHeroCard,
  AppListRow,
  AppSection,
} from '@/components/shell/CustomerAppShell'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { Timeline, type TimelineStep } from '@/components/ui/Timeline'
import { WORKSHOP_STAGES } from '@/components/ui/WorkflowStepper'
import { EmptyState } from '@/components/ui/DataTable'
import { Loading, ErrorState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { fromHalalas } from '@/screens/finance/money'
import { railIndexFor, type JobRow } from '@/screens/workshop/stages'
import { isDone, isInProgress } from '@/screens/portals/portal-data'

/** The eleven customer-app screens. They render inside `CustomerAppShell`,
 *  which supplies the 430px frame, header and bottom tab bar. */

// ── Home ────────────────────────────────────────────────────────────────────
export function CustomerAppHome() {
  const { t } = usePreferences()
  const { userName } = useSession()
  const navigate = useNavigate()
  const { data: vehicles = [], isLoading, isError, error, refetch } = useCollection('vehicles')

  if (isLoading) return <Loading label="Loading..." />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const inService = vehicles.find((v) => v.status === 'service')

  return (
    <>
      <div className="flex items-center gap-2.5">
        <Avatar name={userName} size={40} />
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
            <span className="flex rounded-[10px] bg-salis-blue/[.08] p-2 text-salis-blue">
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
              <Badge background="var(--tint-bright)" color="var(--salis-blue-bright)">
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
  const { data: vehicles = [], isLoading, isError, error, refetch } = useCollection('vehicles')

  if (isLoading) return <Loading label="Loading..." />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  return (
    <>
      <AppSection title={t('My Garage')} />
      {vehicles.map((vehicle) => (
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
  const { data: appointments = [], isLoading, isError, error, refetch } = useCollection('appointments')

  if (isLoading) return <Loading label="Loading..." />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

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
/** The six workshop stages as a vertical rail, filled to wherever the job
 *  card's real `stage` is — same helper `JobDetail.tsx` uses server-side.
 *  No timestamps: the audit log holds when each transition happened and no
 *  endpoint exposes it to a client yet, so a stamp here would be invented. */
const STAGE_ICONS = ['ClipboardCheck', 'SearchCheck', 'Calculator', 'Wrench', 'ShieldCheck', 'Car'] as const

function timelineFor(stage: string | undefined): TimelineStep[] {
  const reached = railIndexFor(stage)
  return WORKSHOP_STAGES.map((label, index) => ({
    icon: STAGE_ICONS[index] ?? 'Circle',
    label,
    done: index <= reached,
  }))
}

export function CustomerAppServiceTracking() {
  const { t } = usePreferences()
  const { data: jobs = [], isLoading, isError, error, refetch } = useCollection('jobs')
  const rows = jobs as readonly JobRow[]
  /* Row scope is the server's, same as every other customer-app screen: the
   * jobs a customer session gets back are already theirs. */
  const active = rows.find(isInProgress) ?? rows.find((row) => !isDone(row))

  if (isLoading) return <Loading label="Loading..." />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  if (!active) {
    return (
      <>
        <AppSection title={t('Service Tracking')} />
        <EmptyState
          icon="Radio"
          title={t('No active service')}
          description={t('A job in progress on one of your vehicles appears here.')}
        />
      </>
    )
  }

  const steps = timelineFor(active.stage)
  const done = steps.filter((step) => step.done).length

  return (
    <>
      <AppHeroCard icon="Radio" label={t('Active Service')} value={active.veh}>
        <p className="mt-1 text-xs opacity-90" dir="ltr">
          {active.id}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${(done / steps.length) * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] opacity-90">
          {done} / {steps.length} {t('stages complete')}
        </p>
      </AppHeroCard>

      <AppSection title={t('Progress')} />
      <div className="rounded-[14px] border border-border bg-card p-4">
        <Timeline steps={steps} />
      </div>
    </>
  )
}

// ── Wallet ──────────────────────────────────────────────────────────────────
/** No wallet exists behind this screen — no stored balance, top-up or
 *  transaction ledger table anywhere in the schema or `API_REGISTRY.json`.
 *  The previous version rendered three invented transactions and summed them
 *  into a "balance" that was never anything but arithmetic on fixture rows.
 *  Honest state until a real customer-wallet capability is built: a balance
 *  column plus a transaction/ledger table and a top-up endpoint. */
export function CustomerAppWallet() {
  const { t } = usePreferences()
  return (
    <>
      <AppSection title={t('Wallet')} />
      <EmptyState
        icon="Wallet"
        title={t('Wallet not available yet')}
        description={t(
          'This system has no customer wallet, balance or top-up ledger yet — nothing here is real, so nothing is shown in its place.'
        )}
      />
    </>
  )
}

// ── Orders ──────────────────────────────────────────────────────────────────
/** No parts/e-commerce order exists behind this screen either — `parts` is
 *  workshop inventory, not a customer-facing product catalog, and no
 *  collection or route anywhere carries a customer purchase, a cart or a
 *  shipment status. The previous version's three orders were invented in
 *  full. Honest state until a real order capability (catalog, cart, checkout,
 *  fulfilment) exists — see `CustomerAppMarketplace`, the same gap. */
export function CustomerAppOrders() {
  const { t } = usePreferences()
  return (
    <>
      <AppSection title={t('My Orders')} />
      <EmptyState
        icon="Package"
        title={t('Order history not available yet')}
        description={t(
          'This system has no parts or product order record on the backend — no catalog, cart or purchase history exists yet.'
        )}
      />
    </>
  )
}

// ── Marketplace ─────────────────────────────────────────────────────────────
/** No parts/services storefront exists behind this screen. `parts` (workshop
 *  inventory) has no price-to-customer, catalog or cart concept, and
 *  `API_REGISTRY.json` has no marketplace/product route — the same "no
 *  backend concept yet" gap `SOURCE_RECONCILIATION.md` records for the
 *  parts-network screens. The previous version's four products and category
 *  chips were invented in full. Honest state until a real catalog, cart and
 *  checkout capability exists. */
export function CustomerAppMarketplace() {
  const { t } = usePreferences()
  return (
    <>
      <AppSection title={t('Marketplace')} />
      <EmptyState
        icon="ShoppingBag"
        title={t('Marketplace not available yet')}
        description={t(
          'This system has no parts or services product catalog, cart or checkout on the backend yet.'
        )}
      />
    </>
  )
}

// ── Notifications ───────────────────────────────────────────────────────────
/** No notification feed exists behind this screen — no `notifications`
 *  collection, no delivery/read record, in `registry.ts` or
 *  `API_REGISTRY.json`. The previous version's three notifications were
 *  invented in full. Honest state until a real notification capability
 *  (a feed table plus a delivery mechanism) exists. */
export function CustomerAppNotifications() {
  const { t } = usePreferences()
  return (
    <>
      <AppSection title={t('Notifications')} />
      <EmptyState
        icon="Bell"
        title={t('Notifications not available yet')}
        description={t('This system has no notification feed or delivery record on the backend yet.')}
      />
    </>
  )
}

// ── Insurance / loans ───────────────────────────────────────────────────────
/** Real endpoints: `GET /api/v1/insurance-policies`, `GET
 *  /api/v1/loan-contracts`. Row scope is meant to be the server's, the same
 *  way `CustomerAppVehicles` reads `vehicles` — never trimmed by identity in
 *  the browser.
 *
 *  **That scoping does not exist yet for these two.** Both collections are
 *  gated on the `accounting` RBAC module (F-034: "no real insurance or loans
 *  module in the RBAC matrix"), and `accounting` has no `customer` entry in
 *  `PERMS` at all — unlike `vehicles`/`appointments`/`invoices`/`jobs`/
 *  `estimates`, which `rbac.ts`'s `PORTAL_SURFACE` comment names as exactly
 *  what the customer portal is scoped to read. A customer-role session hits
 *  a 403 here today, which is why `ErrorState` (not a fabricated policy) is
 *  what a real customer sees until the matrix carries a module — or a
 *  `customerId`-scoped grant — for these two. No `customerId` is filtered
 *  client-side either: `SessionUser` carries no customer-record id to filter
 *  by, and row scoping belongs on the server, not invented here. */
export function CustomerAppInsurance() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const { data: policies = [], isLoading, isError, error, refetch } = useCollection('insurancePolicies')

  if (isLoading) return <Loading label="Loading..." />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  if (policies.length === 0) {
    return (
      <>
        <AppSection title={t('Insurance')} />
        <EmptyState
          icon="Shield"
          title={t('No active policy')}
          description={t('Insurance cover for your vehicles appears here once a policy is on file.')}
        />
      </>
    )
  }

  const policy = policies.find((p) => p.status === 'active') ?? policies[0]

  return (
    <>
      <AppSection title={t('Insurance')} />
      <AppHeroCard icon="Shield" label={t('Active Policy')} value={policy.insurer}>
        <p className="mt-1 text-xs opacity-90">
          {t('Expires')} · {policy.end}
        </p>
      </AppHeroCard>
      <AppListRow icon="Car" title={policy.vehicleLabel} subtitle={policy.policyNumber} />
      <AppListRow icon="FileText" title={t('Policy Documents')} subtitle={t('Download or share')} onClick={() => navigate('/customer-app/insurance')} />
      <AppListRow icon="LifeBuoy" title={t('File a Claim')} subtitle={t('Start a new claim')} onClick={() => navigate('/customer-app/insurance')} />
    </>
  )
}

export function CustomerAppLoans() {
  const { t } = usePreferences()
  const navigate = useNavigate()
  const { data: contracts = [], isLoading, isError, error, refetch } = useCollection('loanContracts')

  if (isLoading) return <Loading label="Loading..." />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  return (
    <>
      <AppSection title={t('Loans')} />
      {contracts.length === 0 ? (
        <EmptyState
          icon="Banknote"
          title={t('No active finance')}
          description={t('Vehicle finance and instalment plans appear here.')}
        />
      ) : (
        contracts.map((contract) => (
          <div
            key={contract._id ?? contract.contractNumber}
            className="flex flex-col gap-2 rounded-[14px] border border-border bg-card p-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[13px] font-semibold text-heading" dir="ltr">
                {contract.contractNumber}
              </span>
              <Badge
                background={contract.status === 'active' ? 'var(--tint-blue)' : 'var(--tint-bright)'}
                color={contract.status === 'active' ? 'var(--salis-blue)' : 'var(--salis-blue-bright)'}
              >
                {t(contract.status[0].toUpperCase() + contract.status.slice(1))}
              </Badge>
            </div>
            <p className="text-[13px] text-body">{t('Monthly instalment')}</p>
            <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted">
              <span>{contract.start}</span>
              <Money sar={fromHalalas(contract.monthlyInstalmentHalalas)} className="font-semibold text-heading" />
            </div>
          </div>
        ))
      )}
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
