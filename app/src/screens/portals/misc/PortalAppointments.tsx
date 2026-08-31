import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Icon } from '@/components/ui/Icon'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { usePagedCollection, type RowOf } from '@/data/useCollection'
import { derived, UNKNOWN } from '@/screens/registry/writes'

/** The portal's booking list, read through the repository seam.
 *
 *  A staff-side view — it names the customer and the assigned technician — so it
 *  reads the collection unfiltered and lets the API decide what the signed-in
 *  principal may see: `GET /appointments` is gated on the `appointments` module,
 *  narrowed by row-level security per organization and branch, and narrowed
 *  again to the caller's own rows for an own-scoped role. Nothing is trimmed in
 *  the browser.
 *
 *  Statuses are the collection's — `confirmed`, `awaiting`, `no-show` — so the
 *  tiles count those rather than the design's five-state set, which no build
 *  returns. An appointment carries no business reference code in the
 *  projection, so that column renders the em dash `derived()` uses for "this
 *  record does not know". "This Week" and "Avg Duration" are cross-record
 *  aggregates no endpoint computes; averaging the page the browser happens to
 *  hold would be reporting one page as the week, so they show the em dash and
 *  the note names what would supply them.
 */
type Appointment = RowOf<'appointments'> & {
  _id?: string
  /** ISO date the API stores; the design fixtures carry only the time label. */
  scheduledDate?: string | null
  /** Not projected by any build today — see the note above. */
  ref?: string | null
}

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  confirmed: { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  awaiting: { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  'no-show': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
}

const FALLBACK_STYLE = { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)' }

function StatusPill({ value }: { value: string }) {
  const { t } = usePreferences()
  const style = STATUS_STYLES[value] ?? FALLBACK_STYLE
  return (
    <Badge background={style.bg} color={style.fg}>
      {t(value === 'no-show' ? 'No-show' : value[0].toUpperCase() + value.slice(1))}
    </Badge>
  )
}

export function PortalAppointments() {
  const { t } = usePreferences()
  const { data, isLoading, isError, error, refetch } = usePagedCollection('appointments')
  const rows = (data?.rows ?? []) as readonly Appointment[]
  const total = data?.page.total

  const countOf = (status: string) => rows.filter((a) => a.status === status).length

  const kpis = [
    { label: t('Total'), value: total === undefined ? UNKNOWN : String(total), icon: 'Calendar', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Awaiting'), value: String(countOf('awaiting')), icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('This Week'), value: UNKNOWN, icon: 'CalendarDays', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Avg Duration'), value: UNKNOWN, icon: 'Timer', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const when = (a: Appointment) => (a.scheduledDate ? `${a.scheduledDate} ${a.time}` : a.time)

  const columns: Column<Appointment>[] = [
    { header: t('Ref'), cell: (a) => derived(a.ref), code: true },
    { header: t('Customer'), cell: (a) => derived(a.cust) },
    { header: t('Vehicle'), cell: (a) => derived(a.veh) },
    { header: t('Plate'), cell: (a) => a.plate, code: true },
    { header: t('Service'), cell: (a) => t(a.svc) },
    { header: t('Date & Time'), cell: (a) => when(a) },
    { header: t('Bay'), cell: (a) => derived(a.bay) },
    { header: t('Technician'), cell: (a) => derived(a.tech) },
    { header: t('Status'), cell: (a) => <StatusPill value={a.status} /> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Calendar" title={t('Appointments')} subtitle={t('View and manage service bookings')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>
      <p className="flex items-start gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
        {t('Server aggregate:')}{' '}
        <span dir="ltr" className="font-mono text-body">GET /appointments/summary</span>
      </p>

      {isError ? (
        <ErrorState description={error?.message} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          caption="Portal appointments"
          columns={columns}
          rows={rows}
          rowKey={(a, index) => a._id ?? `${a.plate}-${index}`}
          loading={isLoading}
          empty={
            <EmptyState
              icon="CalendarX"
              title={t('No appointments in this view')}
              description={t('Try another status filter, or add a booking.')}
            />
          }
          mobileCard={(a) => (
            <>
              <MobileCardHeader title={derived(a.cust)} trailing={<StatusPill value={a.status} />} />
              <MobileCardRow label={t('Service')}>{t(a.svc)}</MobileCardRow>
              <MobileCardRow label={t('Vehicle')}>{derived(a.veh)}</MobileCardRow>
              <MobileCardRow label={t('Date')}>{when(a)}</MobileCardRow>
              <MobileCardRow label={t('Technician')}>{derived(a.tech)}</MobileCardRow>
            </>
          )}
        />
      )}
    </div>
  )
}
