import { KpiCard } from '@/components/ui/KpiCard'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Icon } from '@/components/ui/Icon'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'
import { usePagedCollection, type RowOf } from '@/data/useCollection'
import { VehicleStatusBadge } from '@/screens/registry/badges'
import { derived, UNKNOWN } from '@/screens/registry/writes'

/** The portal's vehicle register, read through the repository seam.
 *
 *  Unlike the client portal this is a staff-side view — it shows the owner of
 *  each vehicle — so it reads the collection unfiltered and lets the API decide
 *  what the signed-in principal may see: `GET /vehicles` is gated on the
 *  `vehicles` module and narrowed by row-level security per organization,
 *  branch and scope. Nothing is trimmed in the browser, because a browser-side
 *  filter would be decoration rather than an access control.
 *
 *  The status vocabulary is the contract's — `active`, `service`, `inactive` —
 *  so the tiles count those rather than the design's "Awaiting Pickup", which no
 *  build ever returns. "Total Vehicles" is the server's own `page.total`, not a
 *  count of the page. "New This Month" is a cross-record aggregate no endpoint
 *  computes, so it shows the em dash and the note names what would supply it.
 */
type Vehicle = RowOf<'vehicles'> & {
  _id?: string
  /** API-only; the design fixtures carry no VIN. */
  vin?: string | null
}

export function PortalVehicles() {
  const { t } = usePreferences()
  const { data, isLoading, isError, error, refetch } = usePagedCollection('vehicles')
  const rows = (data?.rows ?? []) as readonly Vehicle[]
  const total = data?.page.total

  const countOf = (status: string) => rows.filter((v) => v.status === status).length

  const kpis = [
    { label: t('Total Vehicles'), value: total === undefined ? UNKNOWN : String(total), icon: 'Car', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('In Service'), value: String(countOf('service')), icon: 'Wrench', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Active'), value: String(countOf('active')), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('New This Month'), value: UNKNOWN, icon: 'Plus', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<Vehicle>[] = [
    { header: t('Plate'), cell: (v) => v.plate, code: true },
    { header: t('Vehicle'), cell: (v) => derived(v.make) },
    { header: t('Owner'), cell: (v) => derived(v.owner) },
    { header: t('VIN'), cell: (v) => derived(v.vin), code: true },
    { header: t('Mileage'), cell: (v) => derived(v.mileage) },
    { header: t('Last Service'), cell: (v) => derived(v.last && t(v.last)) },
    { header: t('Status'), cell: (v) => <VehicleStatusBadge value={v.status} /> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Car" title={t('Vehicles')} subtitle={t('Registered vehicles and service status')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>
      <p className="flex items-start gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
        {t('Server aggregate:')}{' '}
        <span dir="ltr" className="font-mono text-body">GET /vehicles/summary</span>
      </p>

      {isError ? (
        <ErrorState description={error?.message} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          caption="Portal vehicle registry"
          columns={columns}
          rows={rows}
          rowKey={(v, index) => v._id ?? `${v.plate}-${index}`}
          loading={isLoading}
          empty={
            <EmptyState icon="Car" title={t('No vehicles yet')} />
          }
          mobileCard={(v) => (
            <>
              <MobileCardHeader title={derived(v.make)} trailing={<VehicleStatusBadge value={v.status} />} />
              <MobileCardRow label={t('Plate')}>{v.plate}</MobileCardRow>
              <MobileCardRow label={t('Owner')}>{derived(v.owner)}</MobileCardRow>
              <MobileCardRow label={t('Mileage')}>{derived(v.mileage)}</MobileCardRow>
            </>
          )}
        />
      )}
    </div>
  )
}
