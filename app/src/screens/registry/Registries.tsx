import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListPageHeader } from '@/components/shell/ListPage'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Money, parseSar } from '@/components/ui/Money'
import { ErrorState } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, useDelete, type RowOf } from '@/data/useCollection'
import {
  EstimateStatusBadge,
  FleetContractBadge,
  VehicleStatusBadge,
} from './badges'
import { CustomerFormModal } from './CustomerForm'
import { FleetAccountFormModal } from './FleetAccountFormModal'
import { TechnicianFormModal } from './TechnicianFormModal'
import { VehicleFormModal } from './VehicleForm'
import { Consequence, DeleteRecordModal } from './DeleteRecordModal'
import { derived, rowId } from './writes'

/** The designed registry screens: customers, vehicles, estimates, technicians
 *  and fleets. Each is a filtered table on desktop and the designed card list
 *  on mobile, sharing one search-and-filter path.
 *
 *  Column headers are the design's own (`Vehicles Count`, `Estimate #`,
 *  `Make & Model`), so the Arabic dictionary already carries translations. */

/** The row-level actions column every writable registry carries.
 *
 *  Edit and delete are separate grants in the matrix (`e` and `d`), and only
 *  the owner and the manager hold `d` on customers and vehicles — an advisor or
 *  a front-desk user can add and correct records but not remove them. The
 *  buttons follow that rather than showing a control the server would refuse. */
function RowActions({
  onEdit,
  onDelete,
  label,
}: {
  onEdit?: () => void
  onDelete?: () => void
  /** The record's own name, so the two icon buttons are distinguishable to a
   *  screen reader in a table of twenty identical pairs. */
  label: string
}) {
  const { t } = usePreferences()
  if (!onEdit && !onDelete) return null
  return (
    <div className="flex items-center justify-end gap-1">
      {onEdit ? (
        <button
          type="button"
          aria-label={`${t('Edit')} ${label}`}
          onClick={(event) => {
            event.stopPropagation()
            onEdit()
          }}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted transition-colors duration-150 hover:bg-inset hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
        >
          <Icon name="Pencil" size={15} />
        </button>
      ) : null}
      {onDelete ? (
        <button
          type="button"
          aria-label={`${t('Delete')} ${label}`}
          onClick={(event) => {
            event.stopPropagation()
            onDelete()
          }}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted transition-colors duration-150 hover:bg-inset hover:text-salis-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
        >
          <Icon name="Trash2" size={15} />
        </button>
      ) : null}
    </div>
  )
}

/** Small helper for the search-filter every registry uses. */
function useSearch<TRow>(rows: readonly TRow[], fields: (row: TRow) => (string | number)[]) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((row) =>
      fields(row).some((value) => String(value).toLowerCase().includes(needle))
    )
  }, [rows, query, fields])
  return { query, setQuery, filtered }
}

function NoMatches({ query, icon, title, description, action }: {
  query: string
  icon: string
  title: string
  description: string
  /** Offered only when the list is genuinely empty — a search that matched
   *  nothing is fixed by changing the search, not by creating a record. */
  action?: ReactNode
}) {
  const { t } = usePreferences()
  return query ? (
    <EmptyState
      icon="SearchX"
      title={t('No results')}
      description={t('Nothing matches the current filters.')}
    />
  ) : (
    <EmptyState icon={icon} title={t(title)} description={t(description)} action={action} />
  )
}

// ── Customers ───────────────────────────────────────────────────────────────
type Customer = RowOf<'customers'> & { email?: string | null }

export function Customers() {
  const { t } = usePreferences()
  const { can, fieldHidden } = useSession()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: customers = [], isLoading, isError, error, refetch } = useCollection('customers')
  const { query, setQuery, filtered } = useSearch(customers, (c) => [c.name, c.phone])
  const remove = useDelete('customers')

  /** `undefined` is closed, `null` is "create", a row is "edit that row". The
   *  three-way state is what lets one modal serve both, mounted only while it
   *  is open so a second open starts from the record's values rather than from
   *  whatever the last edit left behind. */
  const [form, setForm] = useState<Customer | null | undefined>(undefined)
  const [doomed, setDoomed] = useState<Customer | undefined>(undefined)

  // Technicians, QC and suppliers may not see customer contact details.
  const hideContact = fieldHidden('Customer contact details')
  const mayEdit = can('customers', 'e')
  const mayDelete = can('customers', 'd')

  const columns: Column<Customer>[] = [
    { header: 'Name', cell: (c) => c.name },
    ...(hideContact
      ? []
      : [{ header: 'Phone', cell: (c: Customer) => c.phone, code: true }]),
    { header: 'Vehicles Count', cell: (c) => derived(c.vehicles) },
    { header: 'Total Spent', cell: (c) => <Money sar={parseSar(c.spent ?? '')} className="font-semibold" /> },
    { header: 'Last Visit', cell: (c) => derived(c.last && t(c.last)) },
    ...(mayEdit || mayDelete
      ? [
          {
            header: 'Actions',
            className: 'text-end',
            cell: (c: Customer) => (
              <RowActions
                label={c.name}
                onEdit={mayEdit ? () => setForm(c) : undefined}
                onDelete={mayDelete ? () => setDoomed(c) : undefined}
              />
            ),
          },
        ]
      : []),
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="Users" title={t('Customers')} />
        {isError ? (
          <Card className="p-6">
            <ErrorState description={error?.message} onRetry={() => void refetch()} />
          </Card>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(c) => rowId(c) ?? c.name}
            loading={isLoading}
            onRowClick={(c) => navigate(`/customer-detail?id=${encodeURIComponent(rowId(c) ?? c.name)}`)}
            mobileCard={(c) => (
              <>
                <MobileCardHeader title={c.name} />
                {hideContact ? null : (
                  <MobileCardRow label={t('Phone')}>
                    <span className="font-mono" dir="ltr">{c.phone}</span>
                  </MobileCardRow>
                )}
                <MobileCardRow label={t('Total Spent')}>
                  <Money sar={parseSar(c.spent ?? '')} className="font-semibold text-heading" />
                </MobileCardRow>
              </>
            )}
            empty={<EmptyState icon="Users" title={t('No customers yet')} />}
          />
        )}
        {form !== undefined ? (
          <CustomerFormModal open onClose={() => setForm(undefined)} customer={form ?? undefined} />
        ) : null}
        {doomed ? (
          <DeleteRecordModal open onClose={() => setDoomed(undefined)} kind="Customer" name={doomed.name}
            consequences={<Consequence label="Job cards and invoices keep their history" />}
            onConfirm={() => remove.mutateAsync({ id: rowId(doomed)! }).then(() => { setDoomed(undefined); toast.show({ title: t('Customer deleted') }) })} />
        ) : null}
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Customers')}
        search={{ value: query, onChange: setQuery }}
        actions={
          can('customers', 'c') ? (
            <Button size="md" onClick={() => setForm(null)}>
              <Icon name="Plus" size={16} />
              {t('Add Customer')}
            </Button>
          ) : null
        }
      />
      {isError ? (
        <Card className="p-6">
          <ErrorState description={error?.message} onRetry={() => void refetch()} />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(c) => rowId(c) ?? c.name}
          loading={isLoading}
          onRowClick={(c) =>
            navigate(`/customer-detail?id=${encodeURIComponent(rowId(c) ?? c.name)}`)
          }
          mobileCard={(c) => (
            <>
              <MobileCardHeader
                title={c.name}
                trailing={
                  <RowActions
                    label={c.name}
                    onEdit={mayEdit ? () => setForm(c) : undefined}
                    onDelete={mayDelete ? () => setDoomed(c) : undefined}
                  />
                }
              />
              {hideContact ? null : (
                <MobileCardRow label={t('Phone')}>
                  <span className="font-mono" dir="ltr">{c.phone}</span>
                </MobileCardRow>
              )}
              <MobileCardRow label={t('Vehicles Count')}>{derived(c.vehicles)}</MobileCardRow>
              <MobileCardRow label={t('Total Spent')}>
                <Money sar={parseSar(c.spent ?? '')} className="font-semibold text-heading" />
              </MobileCardRow>
              <MobileCardRow label={t('Last Visit')}>{derived(c.last && t(c.last))}</MobileCardRow>
            </>
          )}
          empty={
            <NoMatches
              query={query}
              icon="Users"
              title="No customers yet"
              description="Customers are created at check-in or from the portal."
              action={
                can('customers', 'c') ? (
                  <Button size="md" onClick={() => setForm(null)}>
                    <Icon name="Plus" size={16} />
                    {t('Add Customer')}
                  </Button>
                ) : null
              }
            />
          }
        />
      )}

      {form !== undefined ? (
        <CustomerFormModal
          open
          onClose={() => setForm(undefined)}
          customer={form ?? undefined}
        />
      ) : null}

      {doomed ? (
        <DeleteRecordModal
          open
          onClose={() => setDoomed(undefined)}
          kind="Customer"
          name={doomed.name}
          consequences={
            <>
              <Consequence count={doomed.vehicles} label="vehicles stay in the registry" />
              <Consequence label="Job cards and invoices keep their history" />
            </>
          }
          onConfirm={async () => {
            const id = rowId(doomed)
            if (!id) throw new Error(t('This record has no id, so it cannot be deleted.'))
            await remove.mutateAsync({ id })
            toast.show({ title: t('Customer deleted'), description: doomed.name })
          }}
        />
      ) : null}
    </>
  )
}

// ── Vehicles ────────────────────────────────────────────────────────────────
type Vehicle = RowOf<'vehicles'> & { vin?: string | null; mileageKm?: number }

export function Vehicles() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: vehicles = [], isLoading, isError, error, refetch } = useCollection('vehicles')
  const { query, setQuery, filtered } = useSearch(vehicles, (v) => [v.plate, v.make, v.owner])
  const remove = useDelete('vehicles')

  const [form, setForm] = useState<Vehicle | null | undefined>(undefined)
  const [doomed, setDoomed] = useState<Vehicle | undefined>(undefined)

  const mayEdit = can('vehicles', 'e')
  const mayDelete = can('vehicles', 'd')

  const columns: Column<Vehicle>[] = [
    { header: 'Plate', cell: (v) => v.plate, code: true },
    { header: 'Make & Model', cell: (v) => v.make },
    { header: 'Owner', cell: (v) => derived(v.owner) },
    { header: 'Mileage', cell: (v) => <span className="font-mono text-[13px]" dir="ltr">{derived(v.mileage)}</span> },
    { header: 'Last Service', cell: (v) => derived(v.last && t(v.last)) },
    { header: 'Status', cell: (v) => <VehicleStatusBadge value={v.status} /> },
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

  if (isMobile) {
    return (
      <>
        <MobilePageHeader
          icon="Car"
          title={t('All Vehicles')}
          actions={
            can('vehicles', 'c') ? (
              <Button size="md" onClick={() => setForm(null)}>
                <Icon name="Plus" size={16} />
                {t('Add New Vehicle')}
              </Button>
            ) : null
          }
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('Search vehicles...')}
          aria-label={t('Search vehicles')}
          className="h-10 w-full rounded-lg border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue"
        />
        {isError ? (
          <Card className="p-6">
            <ErrorState description={error?.message} onRetry={() => void refetch()} />
          </Card>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(v) => rowId(v) ?? v.plate}
            loading={isLoading}
            onRowClick={(v) => navigate(`/vehicle-detail?id=${encodeURIComponent(rowId(v) ?? v.plate)}`)}
            mobileCard={(v) => (
              <>
                <MobileCardHeader
                  title={v.plate}
                  code
                  trailing={
                    <span className="flex items-center gap-1">
                      <VehicleStatusBadge value={v.status} />
                    </span>
                  }
                />
                <MobileCardRow>{v.make}</MobileCardRow>
                <MobileCardRow label={t('Owner')}>{v.owner}</MobileCardRow>
                <MobileCardRow label={t('Mileage')}>
                  <span className="font-mono" dir="ltr">{derived(v.mileage)}</span>
                </MobileCardRow>
              </>
            )}
            empty={
              <NoMatches
                query={query}
                icon="Car"
                title="No vehicles yet"
                description="Vehicles are added at check-in."
              />
            }
          />
        )}
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
              await remove.mutateAsync({ id })
              toast.show({ title: t('Vehicle deleted'), description: doomed.plate })
            }}
          />
        ) : null}
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('All Vehicles')}
        search={{ value: query, onChange: setQuery }}
        actions={
          can('vehicles', 'c') ? (
            <Button size="md" onClick={() => setForm(null)}>
              <Icon name="Plus" size={16} />
              {t('Add New Vehicle')}
            </Button>
          ) : null
        }
      />
      {isError ? (
        <Card className="p-6">
          <ErrorState description={error?.message} onRetry={() => void refetch()} />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(v) => rowId(v) ?? v.plate}
          loading={isLoading}
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
              <MobileCardRow label={t('Owner')}>{v.owner}</MobileCardRow>
              <MobileCardRow label={t('Mileage')}>
                <span className="font-mono" dir="ltr">{derived(v.mileage)}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Last Service')}>{derived(v.last && t(v.last))}</MobileCardRow>
            </>
          )}
          empty={
            <NoMatches
              query={query}
              icon="Car"
              title="No vehicles yet"
              description="Vehicles are added at check-in."
              action={
                can('vehicles', 'c') ? (
                  <Button size="md" onClick={() => setForm(null)}>
                    <Icon name="Plus" size={16} />
                    {t('Add New Vehicle')}
                  </Button>
                ) : null
              }
            />
          }
        />
      )}

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
            await remove.mutateAsync({ id })
            toast.show({ title: t('Vehicle deleted'), description: doomed.plate })
          }}
        />
      ) : null}
    </>
  )
}

// ── Estimates ───────────────────────────────────────────────────────────────
type Estimate = RowOf<'estimates'>

export function Estimates() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { data: estimates = [], isLoading } = useCollection('estimates')
  const { query, setQuery, filtered } = useSearch(estimates, (e) => [e.id, e.cust, e.veh])

  const statusBadge = (value: string) => <EstimateStatusBadge value={value} />

  const columns: Column<Estimate>[] = [
    { header: 'Estimate #', cell: (e) => e.id, code: true },
    { header: 'Customer', cell: (e) => e.cust },
    { header: 'Vehicle', cell: (e) => e.veh },
    { header: 'Amount', cell: (e) => <Money sar={parseSar(e.amount)} className="font-semibold" /> },
    { header: 'Status', cell: (e) => statusBadge(e.status) },
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="FileText" title={t('Estimates')} />
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(e) => e.id}
          loading={isLoading}
          onRowClick={(e) => navigate(`/estimate-detail?id=${encodeURIComponent(e.id)}`)}
          mobileCard={(e) => (
            <>
              <MobileCardHeader title={e.id} code trailing={statusBadge(e.status)} />
              <MobileCardRow>{e.cust}</MobileCardRow>
              <MobileCardRow>{e.veh}</MobileCardRow>
              <MobileCardRow label={t('Amount')}>
                <Money sar={parseSar(e.amount)} className="font-semibold text-heading" />
              </MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="FileText" title={t('No estimates yet')} />}
        />
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Estimates')}
        search={{ value: query, onChange: setQuery }}
        actions={
          can('estimates', 'c') ? (
            <Button size="md" onClick={() => navigate('/workshop-estimate')}>
              <Icon name="Plus" size={16} />
              {t('New Estimate')}
            </Button>
          ) : null
        }
      />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(e) => e.id}
        loading={isLoading}
        onRowClick={(e) => navigate(`/estimate-detail?id=${encodeURIComponent(e.id)}`)}
        mobileCard={(e) => (
          <>
            <MobileCardHeader title={e.id} code trailing={statusBadge(e.status)} />
            <MobileCardRow>{e.cust}</MobileCardRow>
            <MobileCardRow>{e.veh}</MobileCardRow>
            <MobileCardRow label={t('Amount')}>
              <Money sar={parseSar(e.amount)} className="font-semibold text-heading" />
            </MobileCardRow>
          </>
        )}
        empty={
          <NoMatches
            query={query}
            icon="FileText"
            title="No estimates yet"
            description="Estimates are raised after inspection."
          />
        }
      />
    </>
  )
}

// ── Technicians ─────────────────────────────────────────────────────────────
type Tech = RowOf<'technicians'>

export function Technicians() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const { data: techs = [], isLoading } = useCollection('technicians')
  const { query, setQuery, filtered } = useSearch(techs, (x) => [x.name, x.specialty])
  const [techForm, setTechForm] = useState(false)

  const rating = (value: string): ReactNode => (
    <span className="inline-flex items-center gap-1">
      <Icon name="Star" size={13} className="text-salis-orange" />
      <span className="font-mono text-[13px]" dir="ltr">{value}</span>
    </span>
  )

  const columns: Column<Tech>[] = [
    { header: 'Name', cell: (x) => x.name },
    { header: 'Specialty', cell: (x) => t(x.specialty) },
    { header: 'Active Jobs', cell: (x) => x.jobs },
    { header: 'Rating', cell: (x) => rating(x.rating) },
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader
          icon="Wrench"
          title={t('Technicians')}
          actions={
            can('technicians', 'c') ? (
              <Button size="md" onClick={() => setTechForm(true)}>
                <Icon name="Plus" size={16} />
                {t('Add Technician')}
              </Button>
            ) : null
          }
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('Search technicians...')}
          aria-label={t('Search technicians')}
          className="h-10 w-full rounded-lg border border-border bg-inset px-3 text-[13px] text-heading outline-none focus:border-salis-blue"
        />
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(x) => x.name}
          loading={isLoading}
          mobileCard={(x) => (
            <>
              <MobileCardHeader title={x.name} trailing={rating(x.rating)} />
              <MobileCardRow>{t(x.specialty)}</MobileCardRow>
              <MobileCardRow label={t('Active Jobs')}>{x.jobs}</MobileCardRow>
            </>
          )}
          empty={
            <NoMatches
              query={query}
              icon="Wrench"
              title="No technicians yet"
              description="Add technicians to assign work."
            />
          }
        />
        {techForm ? (
          <TechnicianFormModal open onClose={() => setTechForm(false)} />
        ) : null}
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Technicians')}
        search={{ value: query, onChange: setQuery }}
        actions={
          can('technicians', 'c') ? (
            <Button size="md" onClick={() => setTechForm(true)}>
              <Icon name="Plus" size={16} />
              {t('Add Technician')}
            </Button>
          ) : null
        }
      />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(x) => x.name}
        loading={isLoading}
        mobileCard={(x) => (
          <>
            <MobileCardHeader title={x.name} trailing={rating(x.rating)} />
            <MobileCardRow>{t(x.specialty)}</MobileCardRow>
            <MobileCardRow label={t('Active Jobs')}>{x.jobs}</MobileCardRow>
          </>
        )}
        empty={
          <NoMatches
            query={query}
            icon="Wrench"
            title="No technicians yet"
            description="Add technicians to assign work."
          />
        }
      />

      {techForm ? (
        <TechnicianFormModal open onClose={() => setTechForm(false)} />
      ) : null}
    </>
  )
}

// ── Fleets ──────────────────────────────────────────────────────────────────
type Fleet = RowOf<'fleets'>

export function FleetManagement() {
  const { t } = usePreferences()
  const { can } = useSession()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { data: fleets = [], isLoading } = useCollection('fleets')
  const { query, setQuery, filtered } = useSearch(fleets, (f) => [f.name])
  const [fleetForm, setFleetForm] = useState(false)

  const contractBadge = (value: string) => <FleetContractBadge value={value} />

  const columns: Column<Fleet>[] = [
    { header: 'Name', cell: (f) => f.name },
    { header: 'Vehicles Count', cell: (f) => f.vehicles },
    { header: 'Active Jobs', cell: (f) => f.active },
    { header: 'Status', cell: (f) => contractBadge(f.contract) },
  ]

  if (isMobile) {
    return (
      <>
        <MobilePageHeader icon="Truck" title={t('Fleet Management')} />
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(f) => f.name}
          loading={isLoading}
          onRowClick={(f) => navigate(`/fleet-contract?name=${encodeURIComponent(f.name)}`)}
          mobileCard={(f) => (
            <>
              <MobileCardHeader title={f.name} trailing={contractBadge(f.contract)} />
              <MobileCardRow label={t('Vehicles Count')}>{f.vehicles}</MobileCardRow>
              <MobileCardRow label={t('Active Jobs')}>{f.active}</MobileCardRow>
            </>
          )}
          empty={<EmptyState icon="Truck" title={t('No fleet accounts yet')} />}
        />
      </>
    )
  }

  return (
    <>
      <ListPageHeader
        title={t('Fleet Management')}
        search={{ value: query, onChange: setQuery }}
        actions={
          can('vehicles', 'c') ? (
            <Button size="md" onClick={() => setFleetForm(true)}>
              <Icon name="Plus" size={16} />
              {t('Add Fleet Account')}
            </Button>
          ) : null
        }
      />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(f) => f.name}
        loading={isLoading}
        onRowClick={(f) => navigate(`/fleet-contract?name=${encodeURIComponent(f.name)}`)}
        mobileCard={(f) => (
          <>
            <MobileCardHeader title={f.name} trailing={contractBadge(f.contract)} />
            <MobileCardRow label={t('Vehicles Count')}>{f.vehicles}</MobileCardRow>
            <MobileCardRow label={t('Active Jobs')}>{f.active}</MobileCardRow>
          </>
        )}
        empty={
          <NoMatches
            query={query}
            icon="Truck"
            title="No fleet accounts yet"
            description="Fleet accounts group vehicles under one contract."
          />
        }
      />

      {fleetForm ? (
        <FleetAccountFormModal open onClose={() => setFleetForm(false)} />
      ) : null}
    </>
  )
}
