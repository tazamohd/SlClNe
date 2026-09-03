import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenFrame } from '@/components/shell/ScreenFrame'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Money, parseSar } from '@/components/ui/Money'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useCollection, type RowOf } from '@/data/useCollection'
import { EstimateStatusBadge, FleetContractBadge } from './badges'
import { FleetAccountFormModal } from './FleetAccountFormModal'
import { TechnicianFormModal } from './TechnicianFormModal'
import { NoMatches, useSearch } from './registryShared'

/** The designed registry screens: customers, vehicles, estimates, technicians
 *  and fleets. Each is a filtered, sortable table on desktop and the designed
 *  card list on mobile, sharing one search path and one page header.
 *
 *  Customers and vehicles grew their own files during the UX pass; they are
 *  re-exported here so the route table and the tests keep their import. */
export { Customers } from './Customers'
export { Vehicles } from './Vehicles'

// ── Estimates ───────────────────────────────────────────────────────────────
type Estimate = RowOf<'estimates'>

export function Estimates() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const estimatesQuery = useCollection('estimates')
  const estimates = estimatesQuery.data ?? []
  const { query, setQuery, filtered, searching } = useSearch(estimates, (e) => [e.id, e.cust, e.veh])

  const statusBadge = (value: string) => <EstimateStatusBadge value={value} />

  const columns: Column<Estimate>[] = [
    { header: 'Estimate #', cell: (e) => e.id, code: true, sortValue: (e) => e.id },
    { header: 'Customer', cell: (e) => e.cust, sortValue: (e) => e.cust },
    { header: 'Vehicle', cell: (e) => e.veh, sortValue: (e) => e.veh },
    {
      header: 'Amount',
      cell: (e) => <Money sar={parseSar(e.amount)} className="font-semibold" />,
      numeric: true,
      sortValue: (e) => parseSar(e.amount),
    },
    { header: 'Status', cell: (e) => statusBadge(e.status), sortValue: (e) => e.status },
  ]

  return (
    <ScreenFrame
      variant="quiet"
      eyebrow={t('Front Desk')}
      title={t('Estimates')}
      search={{ value: query, onChange: setQuery, placeholder: t('Search estimates...') }}
      actions={
        can('estimates', 'c') ? (
          <Button size="md" icon="Plus" onClick={() => navigate('/workshop-estimate')}>
            {t('New Estimate')}
          </Button>
        ) : null
      }
      query={estimatesQuery}
      skeleton="table"
    >
      <DataTable
        caption="Service estimates"
        columns={columns}
        rows={filtered}
        rowKey={(e) => e.id}
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
            query={searching}
            icon="FileText"
            title="No estimates yet"
            description="Estimates are raised after inspection."
          />
        }
      />
    </ScreenFrame>
  )
}

// ── Technicians ─────────────────────────────────────────────────────────────
type Tech = RowOf<'technicians'>

export function Technicians() {
  const { t } = usePreferences()
  const { can } = useSession()
  const techsQuery = useCollection('technicians')
  const techs = techsQuery.data ?? []
  const { query, setQuery, filtered, searching } = useSearch(techs, (x) => [x.name, x.specialty])
  const [techForm, setTechForm] = useState(false)

  const rating = (value: string): ReactNode => (
    <span className="inline-flex items-center gap-1">
      <Icon name="Star" size={13} className="text-salis-orange" />
      <span className="font-mono text-[13px]" dir="ltr">{value}</span>
    </span>
  )

  const columns: Column<Tech>[] = [
    { header: 'Name', cell: (x) => x.name, sortValue: (x) => x.name },
    { header: 'Specialty', cell: (x) => t(x.specialty), sortValue: (x) => x.specialty },
    { header: 'Active Jobs', cell: (x) => x.jobs, numeric: true, sortValue: (x) => Number(x.jobs) },
    { header: 'Rating', cell: (x) => rating(x.rating), numeric: true, sortValue: (x) => Number(x.rating) },
  ]

  const addButton = can('technicians', 'c') ? (
    <Button size="md" icon="Plus" onClick={() => setTechForm(true)}>
      {t('Add Technician')}
    </Button>
  ) : null

  return (
    <>
      <ScreenFrame
        variant="quiet"
        eyebrow={t('Workshop')}
        title={t('Technicians')}
        search={{ value: query, onChange: setQuery, placeholder: t('Search technicians...') }}
        actions={addButton}
        query={techsQuery}
        skeleton="table"
      >
        <DataTable
          caption="Technician records"
          columns={columns}
          rows={filtered}
          rowKey={(x) => x.name}
          mobileCard={(x) => (
            <>
              <MobileCardHeader title={x.name} trailing={rating(x.rating)} />
              <MobileCardRow>{t(x.specialty)}</MobileCardRow>
              <MobileCardRow label={t('Active Jobs')}>{x.jobs}</MobileCardRow>
            </>
          )}
          empty={
            <NoMatches
              query={searching}
              icon="Wrench"
              title="No technicians yet"
              description="Add technicians to assign work."
              action={addButton}
            />
          }
        />
      </ScreenFrame>

      {techForm ? <TechnicianFormModal open onClose={() => setTechForm(false)} /> : null}
    </>
  )
}

// ── Fleets ──────────────────────────────────────────────────────────────────
type Fleet = RowOf<'fleets'>

export function FleetManagement() {
  const { t } = usePreferences()
  const { can } = useSession()
  const navigate = useNavigate()
  const fleetsQuery = useCollection('fleets')
  const fleets = fleetsQuery.data ?? []
  const { query, setQuery, filtered, searching } = useSearch(fleets, (f) => [f.name])
  const [fleetForm, setFleetForm] = useState(false)

  const contractBadge = (value: string) => <FleetContractBadge value={value} />

  const columns: Column<Fleet>[] = [
    { header: 'Name', cell: (f) => f.name, sortValue: (f) => f.name },
    { header: 'Vehicles Count', cell: (f) => f.vehicles, numeric: true, sortValue: (f) => Number(f.vehicles) },
    { header: 'Active Jobs', cell: (f) => f.active, numeric: true, sortValue: (f) => Number(f.active) },
    { header: 'Status', cell: (f) => contractBadge(f.contract), sortValue: (f) => f.contract },
  ]

  const addButton = can('vehicles', 'c') ? (
    <Button size="md" icon="Plus" onClick={() => setFleetForm(true)}>
      {t('Add Fleet Account')}
    </Button>
  ) : null

  return (
    <>
      <ScreenFrame
        variant="quiet"
        eyebrow={t('Front Desk')}
        title={t('Fleet Management')}
        search={{ value: query, onChange: setQuery, placeholder: t('Search fleets...') }}
        actions={addButton}
        query={fleetsQuery}
        skeleton="table"
      >
        <DataTable
          caption="Fleet management contracts"
          columns={columns}
          rows={filtered}
          rowKey={(f) => f.name}
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
              query={searching}
              icon="Truck"
              title="No fleet accounts yet"
              description="Fleet accounts group vehicles under one contract."
              action={addButton}
            />
          }
        />
      </ScreenFrame>

      {fleetForm ? <FleetAccountFormModal open onClose={() => setFleetForm(false)} /> : null}
    </>
  )
}
