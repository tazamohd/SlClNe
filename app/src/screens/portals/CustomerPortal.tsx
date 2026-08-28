import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Money, parseSar } from '@/components/ui/Money'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection } from '@/data/useCollection'
import { railIndexFor, type JobRow } from '@/screens/workshop/stages'
import {
  isDone,
  isInProgress,
  todayIso,
  type AppointmentRow,
  type EstimateRow,
  type InvoiceRow,
  type VehicleRow,
} from './portal-data'

/** The customer's home — `CustomerPortal.dc.html`: the active service with its
 *  stage rail, quick actions, the pending estimate, their vehicles, upcoming
 *  appointments and recent invoices with real balances.
 *
 *  Own-scope does the filtering: a customer principal reads their records and
 *  nothing else, because the server's RLS says so — this screen never trims a
 *  list by identity itself. Staff roles holding `portalcustomer: v` see the
 *  same screen over the rows their own scope returns.
 *
 *  The design's "Approve" button on the pending estimate is deliberately not
 *  here: `POST /estimates/:id/approve` demands `estimates: a`, which the
 *  customer role does not hold, so the button would 403 for the exact audience
 *  it is drawn for. The estimate shows with its amount and status; the approve
 *  affordance returns when the server grows a customer-approval path (recorded
 *  in the tranche report). */
export function CustomerPortal() {
  const { t } = usePreferences()
  const { userName } = useSession()

  const vehicles = useCollection('vehicles')
  const appointments = useCollection('appointments')
  const invoices = useCollection('invoices')
  const jobs = useCollection('jobs')
  const estimates = useCollection('estimates')

  const jobRows = (jobs.data ?? []) as readonly JobRow[]
  const active = jobRows.find(isInProgress) ?? jobRows.find((row) => !isDone(row))

  /* "Pending" for a customer is an estimate that has been *sent* to them and
   * not yet approved — the vocabulary the estimates collection actually uses. */
  const pending = ((estimates.data ?? []) as readonly EstimateRow[]).find(
    (row) => row.status === 'sent'
  )

  const today = todayIso()
  const upcoming = ((appointments.data ?? []) as readonly AppointmentRow[]).filter(
    (row) => !row.scheduledDate || row.scheduledDate >= today
  )

  const vehicleRows = (vehicles.data ?? []) as readonly VehicleRow[]
  const invoiceRows = ((invoices.data ?? []) as readonly InvoiceRow[]).slice(0, 5)

  return (
    <div className="flex animate-fade-up flex-col gap-4">
      <div>
        <h1 className="font-display text-[15px] font-bold text-heading">
          {t('Hi')}, {userName}
        </h1>
        <p className="mt-0.5 text-[11px] text-muted">{t('Your service journey')}</p>
      </div>

      {/* Active service — the gradient hero with the six-step rail. */}
      {jobs.isLoading ? (
        <Loading label="Loading your service..." />
      ) : jobs.isError ? (
        <ErrorState description={jobs.error?.message} onRetry={() => void jobs.refetch()} />
      ) : active ? (
        <ActiveServiceCard job={active} />
      ) : (
        <Card className="p-5">
          <EmptyState
            icon="Car"
            title={t('No active service')}
            description={t('When your vehicle is in the workshop, its progress appears here.')}
            action={
              <Link
                to="/customer-portal/booking"
                className="font-action text-[13px] font-medium"
              >
                {t('Book Appointment')}
              </Link>
            }
          />
        </Card>
      )}

      {/* Quick actions — every tile leads somewhere real. */}
      <nav aria-label={t('Quick Actions')} className="grid grid-cols-3 gap-2">
        <QuickAction to="/customer-portal/booking" icon="Calendar" label="Book" />
        <QuickAction to="#vehicles" icon="Car" label="Vehicles" />
        <QuickAction to="#invoices" icon="Receipt" label="Invoices" />
      </nav>

      {/* Pending estimate, when there is one. */}
      {pending ? (
        <Card className="flex items-center gap-3 border-salis-orange/20 p-3.5">
          <span className="flex flex-shrink-0 rounded-[10px] bg-[var(--tint-orange)] p-2.5 text-salis-orange">
            <Icon name="Receipt" size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-heading">{t('Pending Estimate')}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted">
              {pending.veh} · <span dir="ltr">{pending.id}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Money
              sar={pending.totalHalalas !== undefined ? pending.totalHalalas / 100 : parseSar(pending.amount)}
              className="text-sm font-extrabold text-heading"
            />
            <span className="text-[10px] text-muted">
              {t('Your advisor will confirm approval with you.')}
            </span>
          </div>
        </Card>
      ) : null}

      {/* My vehicles — the design's horizontal card strip. */}
      <h2 id="vehicles" className="scroll-mt-16 font-display text-[13px] font-bold text-heading">
        {t('My Vehicles')}
      </h2>
      {vehicles.isLoading ? (
        <Loading inline label="Loading vehicles..." />
      ) : vehicles.isError ? (
        <ErrorState
          description={vehicles.error?.message}
          onRetry={() => void vehicles.refetch()}
        />
      ) : vehicleRows.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon="Car"
            title={t('No vehicles on file')}
            description={t('Vehicles registered to you appear here.')}
          />
        </Card>
      ) : (
        <ul className="-mx-1 m-0 flex list-none gap-2.5 overflow-x-auto p-0 px-1 pb-1">
          {vehicleRows.map((vehicle, index) => (
            <li
              key={vehicle._id ?? `${vehicle.plate}-${index}`}
              className="flex min-w-[200px] flex-shrink-0 flex-col gap-2 rounded-xl border border-border bg-card p-3.5"
            >
              <div className="flex items-center gap-2">
                <span className="flex flex-shrink-0 rounded-lg bg-[rgba(10,94,215,.08)] p-1.5 text-salis-blue">
                  <Icon name="Car" size={14} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-heading">{vehicle.make}</p>
                  <p className="font-mono text-[10px] text-muted" dir="ltr">
                    {vehicle.plate}
                  </p>
                </div>
              </div>
              <div className="flex justify-between gap-2 text-[11px]">
                <span className="text-muted">{t('Last Service')}</span>
                <span className="text-body">{vehicle.last || '—'}</span>
              </div>
              <div className="flex justify-between gap-2 text-[11px]">
                <span className="text-muted">{t('Mileage')}</span>
                <span className="text-body" dir="ltr">
                  {vehicle.mileage}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Upcoming appointments. */}
      <h2 className="font-display text-[13px] font-bold text-heading">
        {t('Upcoming Appointments')}
      </h2>
      {appointments.isLoading ? (
        <Loading inline label="Loading appointments..." />
      ) : appointments.isError ? (
        <ErrorState
          description={appointments.error?.message}
          onRetry={() => void appointments.refetch()}
        />
      ) : upcoming.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon="Calendar"
            title={t('Nothing booked yet')}
            description={t('Your next visit appears here once you book it.')}
            action={
              <Link
                to="/customer-portal/booking"
                className="font-action text-[13px] font-medium"
              >
                {t('Book Appointment')}
              </Link>
            }
          />
        </Card>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {upcoming.map((slot, index) => (
            <li
              key={slot._id ?? `${slot.time}-${index}`}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3"
            >
              <span className="flex flex-shrink-0 rounded-lg bg-[var(--tint-blue)] p-1.5 text-salis-blue">
                <Icon name="Calendar" size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-heading">
                  {slot.svc}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-muted">{slot.veh}</span>
              </span>
              <span className="flex flex-col items-end gap-1">
                <span className="font-mono text-[11px] font-semibold text-heading" dir="ltr">
                  {slot.scheduledDate ? `${slot.scheduledDate} · ${slot.time}` : slot.time}
                </span>
                <StatusBadge value={slot.status} label={t(slot.status.replace(/_/g, ' '))} />
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Recent invoices, with the balance the server computed. */}
      <h2 id="invoices" className="scroll-mt-16 font-display text-[13px] font-bold text-heading">
        {t('Recent Invoices')}
      </h2>
      {invoices.isLoading ? (
        <Loading inline label="Loading invoices..." />
      ) : invoices.isError ? (
        <ErrorState
          description={invoices.error?.message}
          onRetry={() => void invoices.refetch()}
        />
      ) : invoiceRows.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon="Receipt"
            title={t('No invoices yet')}
            description={t('Invoices for your services appear here.')}
          />
        </Card>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {invoiceRows.map((invoice, index) => {
            const total =
              invoice.totalHalalas !== undefined
                ? invoice.totalHalalas / 100
                : parseSar(invoice.amount)
            const balance =
              invoice.balanceHalalas !== undefined ? invoice.balanceHalalas / 100 : undefined
            return (
              <li
                key={invoice._id ?? `${invoice.id}-${index}`}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3"
              >
                <span className="flex flex-shrink-0 rounded-lg bg-[var(--tint-bright)] p-1.5 text-salis-bright">
                  <Icon name="Receipt" size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[12px] font-semibold text-heading" dir="ltr">
                    {invoice.id}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted">
                    {t('Due')} <span dir="ltr">{invoice.due}</span>
                  </span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <Money sar={total} className="text-[13px] font-bold text-heading" />
                  {balance !== undefined && balance > 0 ? (
                    <span className="text-[10px] font-semibold text-salis-orange">
                      {t('Balance')} <Money sar={balance} bare className="text-[10px]" />
                    </span>
                  ) : (
                    <StatusBadge value={invoice.status} label={t(invoice.status)} />
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** The gradient hero with the six-step rail, filled to the record's stage. */
function ActiveServiceCard({ job }: { job: JobRow }) {
  const { t } = usePreferences()
  const reached = railIndexFor(job.stage)
  const steps = ['Check-In', 'Inspection', 'Estimate', 'Repair', 'QC', 'Pickup'] as const

  return (
    <section
      aria-label={t('Active Service')}
      className="flex flex-col gap-3.5 rounded-2xl bg-salis-gradient p-[18px] text-white shadow-[0_8px_24px_rgba(10,94,215,.3)]"
    >
      <div className="flex items-center gap-2">
        <Icon name="Car" size={18} />
        <span className="text-sm font-bold">{t('Active Service')}</span>
        <span className="flex-1" />
        <span className="font-mono text-[11px] opacity-80" dir="ltr">
          {job.id}
        </span>
      </div>
      <div>
        <p className="text-base font-extrabold">{job.veh}</p>
        <p className="mt-0.5 text-xs capitalize opacity-80">{t(job.svc.replace(/_/g, ' '))}</p>
      </div>
      <ol className="m-0 flex list-none items-center p-0" aria-label={t('Stage')}>
        {steps.map((label, index) => {
          const done = index < reached
          const currentStep = index === reached
          return (
            <li key={label} className="contents">
              {index > 0 ? (
                <span
                  aria-hidden
                  className={done || currentStep ? 'h-0.5 flex-1 bg-white/40' : 'h-0.5 flex-1 bg-white/15'}
                />
              ) : null}
              <span
                className="flex flex-col items-center gap-0.5"
                aria-current={currentStep ? 'step' : undefined}
              >
                <span
                  className={
                    currentStep
                      ? 'flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-salis-blue shadow'
                      : done
                        ? 'flex h-5 w-5 items-center justify-center rounded-full bg-white/30'
                        : 'flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[9px] opacity-60'
                  }
                >
                  {done ? <Icon name="Check" size={10} strokeWidth={3} aria-label={t('Completed')} /> : index + 1}
                </span>
                <span className={currentStep ? 'text-[8px] font-bold' : 'text-[8px] opacity-70'}>
                  {t(label)}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function QuickAction({ to, icon, label }: { to: string; icon: string; label: string }) {
  const { t } = usePreferences()
  const inPage = to.startsWith('#')

  const body = (
    <>
      <span className="flex rounded-[10px] bg-[var(--tint-blue)] p-2 text-salis-blue">
        <Icon name={icon} size={16} />
      </span>
      <span className="text-center font-action text-[10px] font-semibold text-body">
        {t(label)}
      </span>
    </>
  )
  const frame =
    'flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card px-1 py-3.5 no-underline transition-colors hover:border-salis-blue hover:no-underline'

  /* In-page anchors use a plain <a>: react-router treats `#…` as a route. */
  return inPage ? (
    <a href={to} className={frame}>
      {body}
    </a>
  ) : (
    <Link to={to} className={frame}>
      {body}
    </Link>
  )
}
