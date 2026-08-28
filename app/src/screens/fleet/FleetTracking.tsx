import { useMemo, useState } from 'react'
import {
  FeatureHeader,
  SearchField,
  Section,
  StatRow,
  TabBar,
  type Stat,
} from '@/components/shell/FeatureScreen'
import { Badge } from '@/components/ui/Badge'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection, type RowOf } from '@/data/useCollection'

type Fleet = RowOf<'fleets'>

const TABS = [
  { id: 'all', label: 'All Vehicles', icon: 'CarFront' },
  { id: 'active', label: 'On The Road', icon: 'Navigation' },
  { id: 'service', label: 'In Service', icon: 'Wrench' },
  { id: 'idle', label: 'Idle', icon: 'ParkingCircle' },
] as const

function ContractBadge({ contract }: { contract: string }) {
  const { t } = usePreferences()
  if (contract === 'active') {
    return (
      <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
        {t('Active')}
      </Badge>
    )
  }
  return (
    <Badge background="rgba(249,115,22,.1)" color="#F97316">
      {t('Renewal')}
    </Badge>
  )
}

export function FleetTracking() {
  const { t } = usePreferences()
  const { data: fleets = [], isLoading } = useCollection('fleets')
  const [tab, setTab] = useState<string>(TABS[0].id)
  const [query, setQuery] = useState('')

  const totalVehicles = useMemo(() => fleets.reduce((sum, f) => sum + f.vehicles, 0), [fleets])
  const activeVehicles = useMemo(() => fleets.reduce((sum, f) => sum + f.active, 0), [fleets])
  const inService = useMemo(
    () => fleets.filter((f) => f.active > 0).length,
    [fleets],
  )

  const filtered = useMemo(() => {
    let rows = [...fleets]
    if (tab === 'active') {
      rows = rows.filter((f) => f.active > 0)
    } else if (tab === 'service') {
      rows = rows.filter((f) => f.contract === 'active' && f.active > 0)
    } else if (tab === 'idle') {
      rows = rows.filter((f) => f.active === 0)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((f) => f.name.toLowerCase().includes(needle))
    }
    return rows
  }, [fleets, tab, query])

  const stats: Stat[] = [
    { label: 'Fleet Vehicles', value: totalVehicles, caption: 'Under management', highlight: true },
    { label: 'On The Road', value: activeVehicles, caption: 'Active now', tone: 'info' },
    { label: 'In Service', value: inService, caption: 'At a garage', tone: 'warning' },
    { label: 'Idle', value: totalVehicles - activeVehicles, caption: 'Parked' },
  ]

  const columns: Column<Fleet>[] = [
    { header: 'Fleet', cell: (f) => <span className="font-medium text-heading">{f.name}</span> },
    {
      header: 'Total Vehicles',
      cell: (f) => (
        <span className="font-mono text-[13px]" dir="ltr">
          {f.vehicles}
        </span>
      ),
    },
    {
      header: 'Active',
      cell: (f) => (
        <span className="font-mono text-[13px]" dir="ltr">
          {f.active}
        </span>
      ),
    },
    { header: 'Contract', cell: (f) => <ContractBadge contract={f.contract} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="CarFront"
        title={t('Fleet Tracking')}
        subtitle={t('Real-time dashboard for managed fleet vehicles')}
      />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Fleet Status')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search fleets...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(f) => f.name}
          loading={isLoading}
          mobileCard={(f) => (
            <>
              <MobileCardHeader title={f.name} trailing={<ContractBadge contract={f.contract} />} />
              <MobileCardRow label={t('Vehicles')}>
                <span className="font-mono" dir="ltr">
                  {f.vehicles}
                </span>
              </MobileCardRow>
              <MobileCardRow label={t('Active')}>
                <span className="font-mono" dir="ltr">
                  {f.active}
                </span>
              </MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="CarFront"
              title={t('No fleet vehicles tracked yet')}
              description={t('Add a fleet to start monitoring vehicle status and utilization.')}
            />
          }
        />
      </Section>
    </>
  )
}
