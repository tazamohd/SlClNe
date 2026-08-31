import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Icon } from '@/components/ui/Icon'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'
import { derived } from '@/screens/registry/writes'
import { todayIso } from '@/screens/portals/portal-data'

/** The customer's bookings, read through the repository seam.
 *
 *  Scope is the server's: this reads `appointments` the way `CustomerPortal`
 *  does and never filters by identity in the browser.
 *
 *  ### Vocabulary and gaps
 *
 *  The collection's booking statuses are `confirmed`, `awaiting` and `no-show` —
 *  the vocabulary `registry/Appointments` already renders. The design's
 *  Confirmed / Pending / Completed / Cancelled set does not exist behind the
 *  API, so the tiles count what the rows actually say rather than four states
 *  the server never returns.
 *
 *  Two of the design's columns have no column behind them: an appointment
 *  carries no business reference code in the projection, and no service-advisor
 *  field (`tech` is the assigned technician, a different person). Both render
 *  the em dash `derived()` uses for "this record does not know" instead of a
 *  fabricated value, and the technician is shown under its own honest label.
 *
 *  The tiles count the rows the server returned for this customer. A count over
 *  the whole tenant would need an aggregate endpoint that does not exist, which
 *  the note beneath them names rather than approximating from one page.
 */
type Appointment = RowOf<'appointments'> & {
  _id?: string
  /** ISO date the API stores; the design fixtures carry only the time label. */
  scheduledDate?: string | null
  /** Not projected by any build today — see the note above. */
  ref?: string | null
  advisor?: string | null
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

export function ClientPortalAppointments() {
  const { t } = usePreferences()
  const { data: appointments = [], isLoading, isError, error, refetch } = useCollection('appointments')
  const rows = appointments as readonly Appointment[]

  const today = todayIso()
  /* A fixture row carries no date, so it cannot be shown to be in the past —
   * it is counted as upcoming, exactly as CustomerPortal treats it. */
  const upcoming = rows.filter((a) => !a.scheduledDate || a.scheduledDate >= today).length
  const countOf = (status: string) => rows.filter((a) => a.status === status).length

  const kpis = [
    { label: t('Upcoming'), value: String(upcoming), icon: 'CalendarCheck', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Confirmed'), value: String(countOf('confirmed')), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Awaiting'), value: String(countOf('awaiting')), icon: 'Clock', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('No-show'), value: String(countOf('no-show')), icon: 'XCircle', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const when = (a: Appointment) => (a.scheduledDate ? `${a.scheduledDate} ${a.time}` : a.time)

  const columns: Column<Appointment>[] = [
    { header: t('Ref'), cell: (a) => derived(a.ref), code: true },
    { header: t('Vehicle'), cell: (a) => derived(a.veh) },
    { header: t('Service'), cell: (a) => t(a.svc) },
    { header: t('Date & Time'), cell: (a) => when(a) },
    { header: t('Advisor'), cell: (a) => derived(a.advisor) },
    { header: t('Technician'), cell: (a) => derived(a.tech) },
    { header: t('Status'), cell: (a) => <StatusPill value={a.status} /> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Calendar" title={t('Appointments')} subtitle={t('Upcoming and past appointments')} />

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
          caption="Client appointments"
          columns={columns}
          rows={rows}
          rowKey={(a, index) => a._id ?? `${a.plate}-${index}`}
          loading={isLoading}
          empty={
            <EmptyState
              icon="CalendarX"
              title={t('Nothing booked yet')}
              description={t('Your next visit appears here once you book it.')}
            />
          }
          mobileCard={(a) => (
            <>
              <MobileCardHeader title={t(a.svc)} trailing={<StatusPill value={a.status} />} />
              <MobileCardRow label={t('Vehicle')}>{derived(a.veh)}</MobileCardRow>
              <MobileCardRow label={t('Date')}>{when(a)}</MobileCardRow>
              <MobileCardRow label={t('Technician')}>{derived(a.tech)}</MobileCardRow>
              <MobileCardRow label={t('Advisor')}>{derived(a.advisor)}</MobileCardRow>
            </>
          )}
        />
      )}
    </div>
  )
}
