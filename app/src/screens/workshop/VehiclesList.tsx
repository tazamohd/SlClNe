import { useMemo, useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Input } from '@/components/ui/Input'
import { Search } from '@/components/ui/Search'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import { usePagedCollection, type RowOf } from '@/data/useCollection'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { VehicleStatusBadge } from '@/screens/registry/badges'
import { derived, UNKNOWN } from '@/screens/registry/writes'

/** The workshop's vehicle register, read through the repository seam.
 *
 *  Rows arrive already scoped: `GET /vehicles` is gated on the `vehicles`
 *  module and narrowed by row-level security per organization and branch, so
 *  nothing here filters by identity — the search box is a display filter over
 *  what the server already decided this principal may see.
 *
 *  The status vocabulary is the contract's (`active`, `service`, `inactive`),
 *  which is what the tiles count and `VehicleStatusBadge` renders. "Total
 *  Vehicles" is the server's own `page.total` rather than a count of the page.
 *  The projection carries no model year, so that column renders the em dash
 *  `derived()` uses for "this record does not know" instead of a value invented
 *  to fill it; `vin` is served by the API and absent from the design fixtures.
 */
type Vehicle = RowOf<'vehicles'> & {
  _id?: string
  /** API-only; the design fixtures carry no VIN. */
  vin?: string | null
  /** Not projected by any build today — see the note above. */
  year?: string | number | null
}

export function VehiclesList() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { data, isLoading, isError, error, refetch } = usePagedCollection('vehicles')
  const rows = (data?.rows ?? []) as readonly Vehicle[]
  const total = data?.page.total
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((r) =>
      [r.plate, r.make, r.owner, r.vin].some(
        (field) => typeof field === 'string' && field.toLowerCase().includes(q),
      ),
    )
  }, [rows, search])

  if (isLoading) return <Loading label={t('Loading vehicles...')} />
  if (isError) return <ErrorState description={error?.message} onRetry={() => void refetch()} />

  const countOf = (status: string) => rows.filter((r) => r.status === status).length

  const kpis = [
    { label: t('Total Vehicles'), value: total === undefined ? UNKNOWN : String(total), icon: 'Car', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(countOf('active')), icon: 'CheckCircle', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
  ]

  const columns: Column<Vehicle>[] = [
    { header: 'Plate', cell: (r) => derived(r.plate), code: true },
    { header: 'Make / Model', cell: (r) => derived(r.make) },
    { header: 'Owner', cell: (r) => derived(r.owner) },
    { header: 'Year', cell: (r) => derived(r.year), code: true },
    { header: 'Mileage', cell: (r) => derived(r.mileage) },
    { header: 'Status', cell: (r) => <VehicleStatusBadge value={r.status} /> },
  ]

  const table = (
    <DataTable
      caption="Registered vehicles"
      columns={columns}
      rows={filtered}
      rowKey={(r, i) => r._id ?? `${r.plate}-${i}`}
      empty={
        <EmptyState icon="Car" title={t('No vehicles found')} />
      }
      mobileCard={(r) => (
        <>
          <MobileCardHeader title={derived(r.make)} trailing={<VehicleStatusBadge value={r.status} />} />
          <MobileCardRow label={t('Plate')}>{derived(r.plate)}</MobileCardRow>
          <MobileCardRow label={t('Owner')}>{derived(r.owner)}</MobileCardRow>
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Car" title={t('Vehicles')} subtitle={t('Registry')} />
        <Input inputSize="sm" placeholder={t('Search vehicles...')} value={search} onChange={(e) => setSearch(e.target.value)} />
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader icon="Car" title={t('Vehicles')} subtitle={t('Registry')} />
        <Search value={search} onChange={setSearch} placeholder={t('Search vehicles...')} className="w-full sm:w-[260px]" compact />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
