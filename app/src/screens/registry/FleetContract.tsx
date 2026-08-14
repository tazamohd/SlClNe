import { useSearchParams } from 'react-router-dom'
import { DetailPage, type DetailStat } from '@/components/shell/DetailPage'
import { useCollection, type RowOf } from '@/data/useCollection'
import { usePreferences } from '@/providers/PreferencesProvider'
import { FleetContractBadge } from './badges'
import { rowId } from './writes'

/** Fleet Contract detail — `FleetContract.dc.html` and `.Mobile.dc.html`, on
 *  the shared `DetailPage` frame.
 *
 *  The prototype is a full contract file: type, annual value, start and end
 *  dates, a fleet contact and phone, a term-progress meter, four fleet stats, an
 *  assigned-vehicle list and a service-history table, with a Renew Contract
 *  action.
 *
 *  What the `fleets` collection carries is `name, vehicles, active, contract`.
 *  So this shows the four things that are real — the fleet's name, its contract
 *  status, its vehicle count and its active-job count — and gaps the rest
 *  honestly:
 *
 *  - **Contract terms** (type, value, dates, contact, phone, renewal date) are
 *    on no fleet row or table anywhere. The panel says the terms are not on
 *    record rather than inventing an annual value.
 *  - **Assigned vehicles** cannot be joined: a fleet reaches its vehicles only
 *    through its customers (`customers.fleetId → vehicles.customerId`), and the
 *    customer collection does not present `fleetId`, so the hop is not available
 *    to the client. An honest empty state stands in.
 *  - **Service history** depends on the same missing join and is gapped the
 *    same way.
 *
 *  The Renew Contract button is not rendered: `fleets` is read-only server-side
 *  (no `writable: true`, no renew route), so it would be a control that cannot
 *  act. `crm-gaps` pins the missing fields and endpoints. */
type Fleet = RowOf<'fleets'> & { _id?: string }

export function FleetContract() {
  const { t } = usePreferences()
  const [params] = useSearchParams()
  const ref = params.get('id') ?? params.get('name') ?? ''

  const fleets = useCollection('fleets')

  const rows = (fleets.data ?? []) as readonly Fleet[]
  const fleet = ref ? rows.find((row) => rowId(row) === ref || row.name === ref) : rows[0]

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

  const summary: DetailStat[] = [
    { label: 'Vehicles', value: fleet.vehicles ?? '—', icon: 'Car' },
    { label: 'Active Jobs', value: fleet.active ?? '—', icon: 'Wrench' },
  ]

  return (
    <DetailPage
      back={{ to: '/fleet-management', label: 'Fleet Management' }}
      title={fleet.name}
      subtitle={t('Fleet Contract')}
      avatar={{ icon: 'FileSignature' }}
      status={<FleetContractBadge value={fleet.contract} />}
      summary={summary}
      sections={[
        {
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
              </dl>
              <p className="m-0 rounded-lg border border-border bg-inset px-3 py-2.5 text-[13px] text-muted">
                {t(
                  'Contract terms — type, value, start and end dates, and the fleet contact — are not on record for this fleet yet.'
                )}
              </p>
            </div>
          ),
        },
      ]}
      related={[
        {
          id: 'vehicles',
          title: 'Assigned Vehicles',
          icon: 'Car',
          span: 'half',
          records: [],
          empty: {
            icon: 'Car',
            title: 'Vehicles not linked',
            description:
              'This fleet is not yet joined to its vehicles, so its assigned vehicles cannot be listed here.',
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
              'Service records for this fleet will appear once its vehicles are linked.',
          },
        },
      ]}
    />
  )
}
