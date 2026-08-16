import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DetailPage,
  type DetailRecord,
  type DetailSection,
  type DetailStat,
} from '@/components/shell/DetailPage'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useCollection, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { FleetContractBadge, VehicleStatusBadge } from './badges'
import { rowId } from './writes'
import { FleetRenewModal } from './FleetRenewModal'

/** Fleet Contract detail — `FleetContract.dc.html` and `.Mobile.dc.html`, on
 *  the shared `DetailPage` frame.
 *
 *  The prototype is a full contract file: type, annual value, start and end
 *  dates, a fleet contact, four fleet stats, an assigned-vehicle list and a
 *  service-history table, with a Renew Contract action. F-027 made almost all of
 *  that real:
 *
 *  - **Contract terms** — type, value, start/end dates, renewal date and the
 *    fleet contact — are now columns on the fleet row (`contractType`,
 *    `contractValue`, `start`, `end`, `renewal`, `contact`, `contactPhone`), so
 *    the Contract Details panel renders each term the row actually carries and
 *    only falls back to "not on record" for a fleet that has none (the demo
 *    fixtures carry the four counts but no terms).
 *  - **Assigned vehicles** are joined the one way the schema allows: a fleet
 *    reaches its vehicles through its customers
 *    (`customers.fleetId → vehicles.customerId`). Now that `customers` present
 *    `fleetId`, the hop is available — this filters customers to the fleet and
 *    lists the vehicles they own.
 *  - **Renew** posts `POST /fleets/:id/renew` (`FleetRenewModal`), gated on the
 *    caller's `customers:e` grant like the collection.
 *
 *  Service history still depends on a join that is not modelled (a job card is
 *  keyed to a vehicle by make, not to a fleet), so it keeps its honest empty
 *  state. Against the fixtures the Renew action refuses honestly with the "set
 *  VITE_API_URL" state rather than faking a renewal. */
type Fleet = RowOf<'fleets'> & {
  _id?: string
  contractType?: string
  contractValue?: string
  start?: string
  end?: string
  renewal?: string
  contact?: string
  contactPhone?: string
}
type Customer = RowOf<'customers'> & { _id?: string; fleetId?: string | null }
type Vehicle = RowOf<'vehicles'> & { customerId?: string | null }

const TYPE_LABEL: Record<string, string> = {
  standard: 'Standard',
  premium: 'Premium',
  enterprise: 'Enterprise',
  custom: 'Custom',
}

export function FleetContract() {
  const { t } = usePreferences()
  const { can } = useSession()
  const [params] = useSearchParams()
  const [renewing, setRenewing] = useState(false)
  const ref = params.get('id') ?? params.get('name') ?? ''

  const fleets = useCollection('fleets')

  const rows = (fleets.data ?? []) as readonly Fleet[]
  const fleet = ref ? rows.find((row) => rowId(row) === ref || row.name === ref) : rows[0]
  const fleetId = fleet ? rowId(fleet) : undefined

  // The fleet → vehicles hop: its customers, then the vehicles they own. The
  // filter runs server-side once the fleet id is known; the fixtures carry no
  // fleetId on customers, so this resolves to an honest empty list there.
  const customers = useCollection('customers', fleetId ? { filter: { fleetId } } : undefined)
  const vehicles = useCollection('vehicles')

  if (fleets.isLoading) return <DetailPage title={t('Fleet Contract')} loading />

  if (fleets.isError) {
    return (
      <DetailPage
        title={t('Fleet Contract')}
        back={{ to: '/fleet-management', label: 'Fleet Management' }}
        error={{ message: fleets.error?.message, onRetry: () => void fleets.refetch() }}
      />
    )
  }

  if (!fleet) {
    return (
      <DetailPage
        title={t('Fleet Contract')}
        back={{ to: '/fleet-management', label: 'Fleet Management' }}
        notFound={{
          title: 'Fleet not found',
          description: 'It may have been removed, or the link is out of date.',
        }}
      />
    )
  }

  const fleetCustomers = (customers.data ?? []) as readonly Customer[]
  const custNames = new Set(fleetCustomers.map((c) => c.name))
  const custIds = new Set(fleetCustomers.map((c) => rowId(c)).filter(Boolean) as string[])
  const assigned = ((vehicles.data ?? []) as readonly Vehicle[]).filter(
    (v) => (v.customerId != null && custIds.has(v.customerId)) || custNames.has(v.owner),
  )

  const summary: DetailStat[] = [
    { label: 'Vehicles', value: fleet.vehicles ?? '—', icon: 'Car' },
    { label: 'Active Jobs', value: fleet.active ?? '—', icon: 'Wrench' },
  ]

  // The contract terms the row actually carries. The presenter sends '' for a
  // term that is not on record, so an empty string is dropped rather than shown
  // as a blank row.
  const terms: { label: string; value: ReactNode; code?: boolean }[] = [
    ...(fleet.contractType
      ? [{ label: 'Contract Type', value: t(TYPE_LABEL[fleet.contractType] ?? fleet.contractType) }]
      : []),
    ...(fleet.contractValue
      ? [{ label: 'Contract Value', value: fleet.contractValue, code: true }]
      : []),
    ...(fleet.start ? [{ label: 'Start Date', value: fleet.start, code: true }] : []),
    ...(fleet.end ? [{ label: 'End Date', value: fleet.end, code: true }] : []),
    ...(fleet.renewal ? [{ label: 'Renewal Date', value: fleet.renewal, code: true }] : []),
    ...(fleet.contact ? [{ label: 'Fleet Contact', value: fleet.contact }] : []),
    ...(fleet.contactPhone
      ? [{ label: 'Contact Phone', value: fleet.contactPhone, code: true }]
      : []),
  ]

  const contractSection: DetailSection = {
    id: 'contract',
    title: 'Contract Details',
    icon: 'FileText',
    span: 'half',
    children: (
      <div className="flex flex-col gap-3">
        <dl className="m-0 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[13px] text-muted">{t('Contract Status')}</dt>
            <dd className="m-0">
              <FleetContractBadge value={fleet.contract} />
            </dd>
          </div>
          {terms.map((term) => (
            <div key={term.label} className="flex items-center justify-between gap-3">
              <dt className="text-[13px] text-muted">{t(term.label)}</dt>
              <dd
                dir={term.code ? 'ltr' : undefined}
                className={term.code ? 'm-0 font-mono text-[13px] text-body' : 'm-0 text-[13px] text-body'}
              >
                {term.value}
              </dd>
            </div>
          ))}
        </dl>
        {terms.length === 0 ? (
          <p className="m-0 rounded-lg border border-border bg-inset px-3 py-2.5 text-[13px] text-muted">
            {t(
              'Contract terms — type, value, start and end dates, and the fleet contact — are not on record for this fleet yet.',
            )}
          </p>
        ) : null}
      </div>
    ),
  }

  const vehicleRecords: DetailRecord[] = assigned.map((vehicle) => ({
    id: vehicle.plate,
    to: `/vehicle-detail?plate=${encodeURIComponent(vehicle.plate)}`,
    icon: 'Car',
    primary: vehicle.make,
    secondary: (
      <span dir="ltr">
        {vehicle.plate} · {vehicle.mileage}
      </span>
    ),
    badge: <VehicleStatusBadge value={vehicle.status} />,
  }))

  const canRenew = can('customers', 'e')

  return (
    <>
      <DetailPage
        back={{ to: '/fleet-management', label: 'Fleet Management' }}
        title={fleet.name}
        subtitle={t('Fleet Contract')}
        avatar={{ icon: 'FileSignature' }}
        status={<FleetContractBadge value={fleet.contract} />}
        actions={
          canRenew ? (
            <Button onClick={() => setRenewing(true)}>
              <Icon name="RefreshCw" size={14} />
              {t('Renew Contract')}
            </Button>
          ) : undefined
        }
        summary={summary}
        sections={[contractSection]}
        related={[
          {
            id: 'vehicles',
            title: 'Assigned Vehicles',
            icon: 'Car',
            span: 'half',
            loading: customers.isLoading || vehicles.isLoading,
            records: vehicleRecords,
            empty: {
              icon: 'Car',
              title: 'No vehicles assigned',
              description:
                'No vehicles are linked to this fleet through its customer accounts yet.',
            },
          },
          {
            id: 'history',
            title: 'Service History',
            icon: 'History',
            span: 'full',
            records: [],
            empty: {
              icon: 'History',
              title: 'No service history',
              description:
                'Service records are keyed to vehicles, not fleets, so they cannot be rolled up here yet.',
            },
          },
        ]}
      />

      {renewing ? (
        <FleetRenewModal
          open
          onClose={() => setRenewing(false)}
          fleetRef={fleetId ?? fleet.name}
          fleetName={fleet.name}
        />
      ) : null}
    </>
  )
}
