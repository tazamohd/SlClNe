import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListPageHeader } from '@/components/shell/ListPage'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, parseSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

/** The designed registry screens: customers, vehicles, estimates, technicians
 *  and fleets. Each is a filtered table on desktop and the designed card list
 *  on mobile, sharing one search-and-filter path.
 *
 *  Column headers are the design's own (`Vehicles Count`, `Estimate #`,
 *  `Make & Model`), so the Arabic dictionary already carries translations. */

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

function NoMatches({ query, icon, title, description }: {
  query: string
  icon: string
  title: string
  description: string
}) {
  const { t } = usePreferences()
  return query ? (
    <EmptyState
      icon="SearchX"
      title={t('No results')}
      description={t('Nothing matches the current filters.')}
    />
  ) : (
    <EmptyState icon={icon} title={t(title)} description={t(description)} />
  )
}

// ── Customers ───────────────────────────────────────────────────────────────
type Customer = RowOf<'customers'>

export function Customers() {
  const { t } = usePreferences()
  const { can, fieldHidden } = useSession()
  const navigate = useNavigate()
  const { data: customers = [], isLoading } = useCollection('customers')
  const { query, setQuery, filtered } = useSearch(customers, (c) => [c.name, c.phone])

  // Technicians, QC and suppliers may not see customer contact details.
  const hideContact = fieldHidden('Customer contact details')

  const columns: Column<Customer>[] = [
    { header: 'Name', cell: (c) => c.name },
    ...(hideContact
      ? []
      : [{ header: 'Phone', cell: (c: Customer) => c.phone, code: true }]),
    { header: 'Vehicles Count', cell: (c) => c.vehicles },
    { header: 'Total Spent', cell: (c) => <Money sar={parseSar(c.spent)} className="font-semibold" /> },
    { header: 'Last Visit', cell: (c) => c.last },
  ]

  return (
    <>
      <ListPageHeader
        title={t('Customers')}
        search={{ value: query, onChange: setQuery }}
        actions={
          can('customers', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add Customer')}
            </Button>
          ) : null
        }
      />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(c) => c.name}
        loading={isLoading}
        onRowClick={(c) => navigate(`/customer-detail?name=${encodeURIComponent(c.name)}`)}
        mobileCard={(c) => (
          <>
            <MobileCardHeader title={c.name} />
            {hideContact ? null : (
              <MobileCardRow label={t('Phone')}>
                <span className="font-mono" dir="ltr">{c.phone}</span>
              </MobileCardRow>
            )}
            <MobileCardRow label={t('Vehicles Count')}>{c.vehicles}</MobileCardRow>
            <MobileCardRow label={t('Total Spent')}>
              <Money sar={parseSar(c.spent)} className="font-semibold text-heading" />
            </MobileCardRow>
            <MobileCardRow label={t('Last Visit')}>{c.last}</MobileCardRow>
          </>
        )}
        empty={
          <NoMatches
            query={query}
            icon="Users"
            title="No customers yet"
            description="Customers are created at check-in or from the portal."
          />
        }
      />
    </>
  )
}

// ── Vehicles ────────────────────────────────────────────────────────────────
type Vehicle = RowOf<'vehicles'>

const VEHICLE_STATUS: Record<string, readonly [string, string]> = {
  active: ['rgba(10,94,215,.1)', '#0A5ED7'],
  service: ['rgba(11,179,255,.1)', '#0BB3FF'],
}

export function Vehicles() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const { data: vehicles = [], isLoading } = useCollection('vehicles')
  const { query, setQuery, filtered } = useSearch(vehicles, (v) => [v.plate, v.make, v.owner])

  const statusBadge = (value: string) => {
    const [bg, fg] = VEHICLE_STATUS[value] ?? VEHICLE_STATUS.active
    return (
      <Badge background={bg} color={fg}>
        {t(value === 'service' ? 'In Service' : 'Active')}
      </Badge>
    )
  }

  const columns: Column<Vehicle>[] = [
    { header: 'Plate', cell: (v) => v.plate, code: true },
    { header: 'Make & Model', cell: (v) => v.make },
    { header: 'Owner', cell: (v) => v.owner },
    { header: 'Mileage', cell: (v) => <span className="font-mono text-[13px]" dir="ltr">{v.mileage}</span> },
    { header: 'Last Service', cell: (v) => v.last },
    { header: 'Status', cell: (v) => statusBadge(v.status) },
  ]

  return (
    <>
      <ListPageHeader
        title={t('All Vehicles')}
        search={{ value: query, onChange: setQuery }}
        actions={
          can('vehicles', 'c') ? (
            <Button size="md">
              <Icon name="Plus" size={16} />
              {t('Add New Vehicle')}
            </Button>
          ) : null
        }
      />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(v) => v.plate}
        loading={isLoading}
        onRowClick={(v) => navigate(`/vehicle-detail?plate=${encodeURIComponent(v.plate)}`)}
        mobileCard={(v) => (
          <>
            <MobileCardHeader title={v.plate} code trailing={statusBadge(v.status)} />
            <MobileCardRow>{v.make}</MobileCardRow>
            <MobileCardRow label={t('Owner')}>{v.owner}</MobileCardRow>
            <MobileCardRow label={t('Mileage')}>
              <span className="font-mono" dir="ltr">{v.mileage}</span>
            </MobileCardRow>
            <MobileCardRow label={t('Last Service')}>{v.last}</MobileCardRow>
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
    </>
  )
}

// ── Estimates ───────────────────────────────────────────────────────────────
type Estimate = RowOf<'estimates'>

const ESTIMATE_STATUS: Record<string, readonly [string, string]> = {
  draft: ['rgba(100,116,139,.1)', '#64748B'],
  sent: ['rgba(11,179,255,.1)', '#0BB3FF'],
  approved: ['rgba(10,94,215,.1)', '#0A5ED7'],
}

export function Estimates() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const { data: estimates = [], isLoading } = useCollection('estimates')
  const { query, setQuery, filtered } = useSearch(estimates, (e) => [e.id, e.cust, e.veh])

  const statusBadge = (value: string) => {
    const [bg, fg] = ESTIMATE_STATUS[value] ?? ESTIMATE_STATUS.draft
    return (
      <Badge background={bg} color={fg}>
        {t(value[0].toUpperCase() + value.slice(1))}
      </Badge>
    )
  }

  const columns: Column<Estimate>[] = [
    { header: 'Estimate #', cell: (e) => e.id, code: true },
    { header: 'Customer', cell: (e) => e.cust },
    { header: 'Vehicle', cell: (e) => e.veh },
    { header: 'Amount', cell: (e) => <Money sar={parseSar(e.amount)} className="font-semibold" /> },
    { header: 'Status', cell: (e) => statusBadge(e.status) },
  ]

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
  const { data: techs = [], isLoading } = useCollection('technicians')
  const { query, setQuery, filtered } = useSearch(techs, (x) => [x.name, x.specialty])

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

  return (
    <>
      <ListPageHeader
        title={t('Technicians')}
        search={{ value: query, onChange: setQuery }}
        actions={
          can('technicians', 'c') ? (
            <Button size="md">
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
    </>
  )
}

// ── Fleets ──────────────────────────────────────────────────────────────────
type Fleet = RowOf<'fleets'>

export function FleetManagement() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const { data: fleets = [], isLoading } = useCollection('fleets')
  const { query, setQuery, filtered } = useSearch(fleets, (f) => [f.name])

  const contractBadge = (value: string) =>
    value === 'renewal' ? (
      <Badge background="rgba(249,115,22,.1)" color="#F97316">
        {t('Renewal Due')}
      </Badge>
    ) : (
      <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
        {t('Active')}
      </Badge>
    )

  const columns: Column<Fleet>[] = [
    { header: 'Name', cell: (f) => f.name },
    { header: 'Vehicles Count', cell: (f) => f.vehicles },
    { header: 'Active Jobs', cell: (f) => f.active },
    { header: 'Status', cell: (f) => contractBadge(f.contract) },
  ]

  return (
    <>
      <ListPageHeader
        title={t('Fleet Management')}
        search={{ value: query, onChange: setQuery }}
        actions={
          can('vehicles', 'c') ? (
            <Button size="md">
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
    </>
  )
}
