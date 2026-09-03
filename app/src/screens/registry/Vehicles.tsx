import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { useCommand, type Command } from '@/components/shell/commands'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Chip, ChipGroup } from '@/components/ui/Chip'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { usePagedCollection, useUndoableDelete, type RowOf } from '@/data/useCollection'
import { VehicleStatusBadge } from './badges'
import { VehicleFormModal } from './VehicleForm'
import { Consequence, DeleteRecordModal } from './DeleteRecordModal'
import { NoMatches, RowActions, useSearch } from './registryShared'
import { derived, rowId } from './writes'

/** The one vehicle register.
 *
 *  `/vehicles-list` used to be a second copy of this screen with a server
 *  total and a VIN column; that route now lands here, and this screen carries
 *  what it did better. The count in the subtitle is the server's own
 *  `page.total`, not the length of the page in hand; the VIN column appears
 *  only when at least one row carries one — the design fixtures do not, the
 *  API does. Plates and VINs are pinned LTR so Arabic does not reorder them. */
type Vehicle = RowOf<'vehicles'> & {
  _id?: string
  vin?: string | null
  mileageKm?: number
}

/** "42,180 km" → 42180, for sorting. A server row carries `mileageKm`. */
function mileageOf(vehicle: Vehicle): number {
  if (typeof vehicle.mileageKm === 'number') return vehicle.mileageKm
  const digits = String(vehicle.mileage ?? '').replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

export function Vehicles() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const vehiclesQuery = usePagedCollection('vehicles')
  const vehicles = (vehiclesQuery.data?.rows ?? []) as readonly Vehicle[]
  const total = vehiclesQuery.data?.page.total
  const { query, setQuery, filtered: searched, searching } = useSearch(vehicles, (v) => [v.plate, v.make, v.owner, v.vin])
  const { remove: removeVehicle, pending: removing } = useUndoableDelete('vehicles', 'Vehicle')

  const [form, setForm] = useState<Vehicle | null | undefined>(undefined)
  const [doomed, setDoomed] = useState<Vehicle | undefined>(undefined)
  const [status, setStatus] = useState('all')
  const [make, setMake] = useState('all')

  const statuses = useMemo(() => [...new Set(vehicles.map((v) => v.status))].filter(Boolean), [vehicles])
  const makes = useMemo(
    () => [...new Set(vehicles.map((v) => (v.make ?? '').split(' ')[0]))].filter(Boolean).sort(),
    [vehicles]
  )
  const hasVin = useMemo(() => vehicles.some((v) => Boolean(v.vin)), [vehicles])

  const filtered = useMemo(
    () =>
      searched.filter((v) => {
        if (status !== 'all' && v.status !== status) return false
        if (make !== 'all' && (v.make ?? '').split(' ')[0] !== make) return false
        return true
      }),
    [searched, status, make]
  )
  const filtering = searching || status !== 'all' || make !== 'all'

  const mayCreate = can('vehicles', 'c')
  const mayEdit = can('vehicles', 'e')
  const mayDelete = can('vehicles', 'd')

  const commands = useMemo<Command[]>(
    () =>
      mayCreate
        ? [
            {
              id: 'vehicles:add',
              label: 'Add New Vehicle',
              icon: 'Car',
              group: 'create',
              keywords: ['vehicle', 'car', 'plate', 'create', 'new'],
              shortcut: 'N',
              run: () => setForm(null),
            },
          ]
        : [],
    [mayCreate]
  )
  useCommand(commands)

  const ownerLink = (v: Vehicle) =>
    v.owner ? (
      <Link
        to={`/customer-detail?name=${encodeURIComponent(v.owner)}`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        className="text-salis-blue no-underline hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
      >
        {v.owner}
      </Link>
    ) : (
      derived(v.owner)
    )

  const columns: Column<Vehicle>[] = [
    { header: 'Plate', cell: (v) => v.plate, code: true, sortValue: (v) => v.plate },
    { header: 'Make & Model', cell: (v) => v.make, sortValue: (v) => v.make },
    { header: 'Owner', cell: ownerLink, sortValue: (v) => v.owner ?? '' },
    ...(hasVin
      ? [{ header: 'VIN', cell: (v: Vehicle) => derived(v.vin), code: true, sortValue: (v: Vehicle) => v.vin ?? '' }]
      : []),
    { header: 'Mileage', cell: (v) => derived(v.mileage), numeric: true, sortValue: mileageOf },
    { header: 'Last Service', cell: (v) => derived(v.last && t(v.last)), sortValue: (v) => v.last ?? '' },
    { header: 'Status', cell: (v) => <VehicleStatusBadge value={v.status} />, sortValue: (v) => v.status },
    ...(mayEdit || mayDelete
      ? [
          {
            header: 'Actions',
            className: 'text-end',
            cell: (v: Vehicle) => (
              <RowActions
                label={v.plate}
                onEdit={mayEdit ? () => setForm(v) : undefined}
                onDelete={mayDelete ? () => setDoomed(v) : undefined}
              />
            ),
          },
        ]
      : []),
  ]

  const addButton = mayCreate ? (
    <Button size="md" icon="Plus" onClick={() => setForm(null)}>
      {t('Add New Vehicle')}
    </Button>
  ) : null

  const filters = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <ChipGroup label={t('Status')}>
        <Chip label={t('All')} selected={status === 'all'} onToggle={() => setStatus('all')} />
        {statuses.map((option) => (
          <Chip
            key={option}
            label={`${t(option[0].toUpperCase() + option.slice(1))} ${vehicles.filter((v) => v.status === option).length}`}
            selected={status === option}
            onToggle={() => setStatus(option)}
          />
        ))}
      </ChipGroup>
      {makes.length > 1 ? (
        <ChipGroup label={t('Make')}>
          <Chip label={t('All makes')} selected={make === 'all'} onToggle={() => setMake('all')} />
          {makes.map((option) => (
            <Chip key={option} label={option} selected={make === option} onToggle={() => setMake(option)} />
          ))}
        </ChipGroup>
      ) : null}
    </div>
  )

  return (
    <>
      <ScreenFrame
        variant="quiet"
        eyebrow={t('Front Desk')}
        title={t('All Vehicles')}
        subtitle={
          total != null ? (
            <>
              <span dir="ltr" className="font-mono tabular-nums">{total}</span> {t('vehicles on record')}
            </>
          ) : undefined
        }
        search={{ value: query, onChange: setQuery, placeholder: t('Search vehicles...') }}
        actions={addButton}
        query={vehiclesQuery}
        skeleton="table"
        toolbar={filters}
      >
        <DataTable
          caption="Vehicle records"
          columns={columns}
          rows={filtered}
          rowKey={(v) => rowId(v) ?? v.plate}
          defaultSort={{ key: 'Plate', dir: 'asc' }}
          onRowClick={(v) => navigate(`/vehicle-detail?id=${encodeURIComponent(rowId(v) ?? v.plate)}`)}
          mobileCard={(v) => (
            <>
              <MobileCardHeader
                title={v.plate}
                code
                trailing={
                  <span className="flex items-center gap-1">
                    <VehicleStatusBadge value={v.status} />
                    <RowActions
                      label={v.plate}
                      onEdit={mayEdit ? () => setForm(v) : undefined}
                      onDelete={mayDelete ? () => setDoomed(v) : undefined}
                    />
                  </span>
                }
              />
              <MobileCardRow>{v.make}</MobileCardRow>
              <MobileCardRow label={t('Owner')}>{ownerLink(v)}</MobileCardRow>
              <MobileCardRow label={t('Mileage')}>
                <span className="font-mono" dir="ltr">{derived(v.mileage)}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Last Service')}>{derived(v.last && t(v.last))}</MobileCardRow>
            </>
          )}
          empty={
            <NoMatches
              query={filtering}
              icon="Car"
              title="No vehicles yet"
              description="Vehicles are added at check-in."
              action={addButton}
            />
          }
        />
      </ScreenFrame>

      {form !== undefined ? (
        <VehicleFormModal open onClose={() => setForm(undefined)} vehicle={form ?? undefined} />
      ) : null}

      {doomed ? (
        <DeleteRecordModal
          open
          onClose={() => setDoomed(undefined)}
          kind="Vehicle"
          name={doomed.plate}
          code
          consequences={
            <>
              <Consequence label="Job cards keep this vehicle's history" />
              <Consequence label="The owner's customer record is not affected" />
            </>
          }
          onConfirm={async () => {
            const id = rowId(doomed)
            if (!id) throw new Error(t('This record has no id, so it cannot be deleted.'))
            if (removing) return
            await removeVehicle(id)
          }}
        />
      ) : null}
    </>
  )
}
