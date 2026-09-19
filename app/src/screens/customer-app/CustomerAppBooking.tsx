import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'

/** F-118 `/customer-app-booking` (BLK-004) — the workshop's service list.
 *
 *  ### What this screen used to be
 *
 *  A picture of a booking wizard. Three literal arrays and not one event
 *  handler in the file: eight invented services with invented prices and
 *  durations (`Full Service`, 3 hours, 899 SAR; `Wheel Alignment`, 45 min,
 *  180 SAR) and a hand-picked `popular` flag; eight invented time slots with
 *  `available: true`/`false` decided by the literal rather than by any
 *  appointment; and a four-step progress bar whose first two steps were
 *  hardcoded `completed: true`, so it claimed the reader had already chosen a
 *  service and a vehicle they had never been offered. Nothing was selectable,
 *  nothing submitted, and the "Confirm" step was a label on a `div`.
 *
 *  ### Why it is a catalogue now rather than a working booking form
 *
 *  A customer genuinely can book: `appointments` grants `customer` `vc`, and
 *  `drizzle/0014`'s `r_self` policy narrows the table by
 *  `customer_id = app_customer()` on both `USING` and `WITH CHECK`, so the
 *  write is constrained at the database boundary and not merely in the UI. No
 *  grant needed widening to reach that conclusion, and none was widened.
 *
 *  That booking form already exists, once, and works:
 *  `portals/CustomerPortalBooking.tsx` at `/customer-portal/booking`. It reads
 *  the real `vehicles` and `services`, derives the taken slots from real
 *  `appointments` on the chosen day, does a real `POST /appointments`, and
 *  renders the row **as the server persisted it**. Re-implementing that here
 *  would mean a second appointment-writing screen with a second, separately
 *  maintained idea of which slots are free — two screens that can disagree
 *  about the shop's own calendar, over a table whose entire point is that a
 *  bay cannot be double-booked. That is a worse system, not a more capable
 *  one, so this screen sends the customer to the flow that already books
 *  instead of growing a rival copy of it.
 *
 *  ### What it claims now
 *
 *  Only this: these are the services the workshop offers, read from the
 *  `services` collection. Nothing else on the screen is presented as bookable.
 *
 *  ### What it no longer claims
 *
 *  - **Prices and durations.** `services` is `(icon, label)` and nothing more —
 *    no price column, no duration column, in the schema or the projection. The
 *    numbers here were invented in full, so they are gone rather than rendered
 *    as em dashes: a price list with eight blanks is not a price list.
 *  - **"Popular".** No column, no counter, no query behind it.
 *  - **Availability.** Deriving it needs the walk-in-bay convention and the
 *    default duration that `CustomerPortalBooking` owns; computing it a second
 *    time here is the divergence described above, and showing it *without*
 *    computing it is the worst option on the table — a customer told "09:00
 *    available" who cannot have 09:00 has been actively misled. No slot is
 *    rendered at all.
 *  - **Wizard progress.** There is no wizard, so there are no completed steps.
 */

type Service = RowOf<'services'>

export function CustomerAppBooking() {
  const { t, rtl } = usePreferences()
  const isMobile = useIsMobile()
  const { data, isLoading, isError, error, refetch } = useCollection('services')
  const rows = (data ?? []) as readonly Service[]

  /** The one honest statement about booking on this screen, and the route to
   *  the form that actually writes an appointment. */
  const bookingNotice = (
    <Card className="flex flex-col gap-2.5 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <Icon name="Info" size={14} className="mt-0.5 flex-shrink-0 text-salis-blue" />
        <p className="text-[13px] text-body">
          {t('This screen lists what the workshop offers. Appointments are not booked here — the booking form checks which times are still free and confirms with the workshop.')}
        </p>
      </div>
      <Link
        to="/customer-portal/booking"
        className="inline-flex h-9 w-fit items-center gap-2 rounded bg-salis-gradient px-3.5 font-action text-[13px] font-semibold text-white no-underline shadow-[0_4px_12px_rgba(10,94,215,.25)] hover:no-underline"
      >
        <Icon name="CalendarCheck" size={16} />
        {t('Go to booking')}
        <Icon name={rtl ? 'ChevronLeft' : 'ChevronRight'} size={14} />
      </Link>
    </Card>
  )

  if (isLoading) return <Loading label="Loading services..." />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader
          icon="CalendarPlus"
          title={t('Book Service')}
          subtitle={t('Services offered')}
        />

        {bookingNotice}

        <p className="text-[13px] font-bold text-heading">{t('Services')}</p>
        {rows.length === 0 ? (
          <EmptyState
            icon="Wrench"
            title={t('No services listed')}
            description={t('The workshop has not published a service list yet.')}
          />
        ) : (
          rows.map(([icon, label]) => (
            <MobileCard key={label}>
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2">
                    <span className="flex rounded-lg bg-tint-blue p-1.5 text-salis-blue" aria-hidden>
                      <Icon name={icon} size={14} />
                    </span>
                    <p className="text-[13px] font-semibold text-heading">{t(label)}</p>
                  </div>
                }
              />
            </MobileCard>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader
        icon="CalendarPlus"
        title={t('Book Service')}
        subtitle={t('Services offered by the workshop')}
      />

      {bookingNotice}

      {rows.length === 0 ? (
        <EmptyState
          icon="Wrench"
          title={t('No services listed')}
          description={t('The workshop has not published a service list yet.')}
        />
      ) : (
        <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 lg:grid-cols-4">
          {rows.map(([icon, label]) => (
            <li key={label}>
              <Card className="flex h-full flex-col gap-3 rounded-2xl p-4 shadow-sm">
                <span className="flex w-fit rounded-lg bg-tint-blue p-2 text-salis-blue" aria-hidden>
                  <Icon name={icon} size={18} />
                </span>
                <h2 className="text-sm font-semibold text-heading">{t(label)}</h2>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
