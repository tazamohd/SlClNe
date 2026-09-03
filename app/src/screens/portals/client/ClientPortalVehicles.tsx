import { DataTable, type Column } from '@/components/ui/DataTable'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { mineOnly } from '../portal-data'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCollection, type RowOf } from '@/data/useCollection'
import { VehicleStatusBadge } from '@/screens/registry/badges'
import { derived } from '@/screens/registry/writes'

/** The customer's own vehicles, read through the repository seam.
 *
 *  Scope is the server's, not this screen's: the customer portal reads
 *  `vehicles` exactly as `CustomerPortal` does, and the rows a portal principal
 *  is allowed to see are decided by the API's row-level security before they
 *  are sent. `mineOnly` narrows a staff reader's view to the signed-in customer
 *  when the rows carry `customerId` — a display courtesy, not a boundary.
 *
 *  ### What the collection does and does not carry
 *
 *  `plate`, `make` (the API's `make_model`, one string), `mileage`, `last` and
 *  `status` come from every build; `vin` is served by the API and absent from
 *  the design fixtures. **Colour is not a column of `vehicles` in any build** —
 *  not in the schema, not in the projection — so the column renders the em dash
 *  `derived()` uses for "this record does not know", rather than a value made up
 *  to fill it. If the API grows the field the cell fills itself.
 */
type Vehicle = RowOf<'vehicles'> & {
  _id?: string
  /** API-only; lets a staff reader narrow the list to the signed-in customer. */
  customerId?: string | null
  /** API-only; the design fixtures carry no VIN. */
  vin?: string | null
  /** Not projected by any build today — see the note above. */
  color?: string | null
}

export function ClientPortalVehicles() {
  const { t } = usePreferences()
  const { user } = useSession()
  const { data: vehicles = [], isLoading, isError, error, refetch } = useCollection('vehicles')
  const rows = mineOnly(vehicles as readonly Vehicle[], user?.id)

  const columns: Column<Vehicle>[] = [
    { header: t('Vehicle'), cell: (v) => derived(v.make) },
    { header: t('Plate'), cell: (v) => v.plate, code: true },
    { header: t('Color'), cell: (v) => derived(v.color) },
    { header: t('Mileage'), cell: (v) => derived(v.mileage) },
    { header: t('VIN'), cell: (v) => derived(v.vin), code: true },
    { header: t('Last Service'), cell: (v) => derived(v.last && t(v.last)) },
    { header: t('Status'), cell: (v) => <VehicleStatusBadge value={v.status} /> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Car" title={t('My Vehicles')} subtitle={t('Registered vehicles and status')} />

      {isError ? (
        <ErrorState description={error?.message} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          caption="Client vehicle registry"
          columns={columns}
          rows={rows}
          rowKey={(v, index) => v._id ?? `${v.plate}-${index}`}
          loading={isLoading}
          empty={
            <EmptyState
              icon="Car"
              title={t('No vehicles on file')}
              description={t('Vehicles registered to you appear here.')}
            />
          }
          mobileCard={(v) => (
            <>
              <MobileCardHeader title={derived(v.make)} trailing={<VehicleStatusBadge value={v.status} />} />
              <MobileCardRow label={t('Plate')}>{v.plate}</MobileCardRow>
              <MobileCardRow label={t('Mileage')}>{derived(v.mileage)}</MobileCardRow>
              <MobileCardRow label={t('VIN')}>{derived(v.vin)}</MobileCardRow>
              <MobileCardRow label={t('Color')}>{derived(v.color)}</MobileCardRow>
            </>
          )}
        />
      )}
    </div>
  )
}
