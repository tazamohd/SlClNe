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
import { Button } from '@/components/ui/Button'
import { DataTable, EmptyState, type Column } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'

interface TowDispatch {
  reference: string
  vehicle: string
  pickup: string
  driver: string
  status: 'dispatched' | 'en-route' | 'arrived' | 'completed' | 'delayed'
}

const TABS = [
  { id: 'all', label: 'All Dispatches', icon: 'Truck' },
  { id: 'active', label: 'Active', icon: 'Navigation' },
  { id: 'delayed', label: 'Delayed', icon: 'AlertCircle' },
  { id: 'completed', label: 'Completed', icon: 'CheckCircle' },
] as const

const DEMO_DISPATCHES: readonly TowDispatch[] = []

function DispatchStatusBadge({ status }: { status: TowDispatch['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'dispatched':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Dispatched')}
        </Badge>
      )
    case 'en-route':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('En Route')}
        </Badge>
      )
    case 'arrived':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Arrived')}
        </Badge>
      )
    case 'completed':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Completed')}
        </Badge>
      )
    case 'delayed':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Delayed')}
        </Badge>
      )
  }
}

export function TowingAssistance() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly TowDispatch[] = DEMO_DISPATCHES
    if (tab === 'active') {
      rows = rows.filter((d) => ['dispatched', 'en-route', 'arrived'].includes(d.status))
    } else if (tab === 'delayed') {
      rows = rows.filter((d) => d.status === 'delayed')
    } else if (tab === 'completed') {
      rows = rows.filter((d) => d.status === 'completed')
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((d) =>
        [d.reference, d.vehicle, d.pickup, d.driver].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const activeCount = DEMO_DISPATCHES.filter((d) =>
    ['dispatched', 'en-route', 'arrived'].includes(d.status),
  ).length
  const completedCount = DEMO_DISPATCHES.filter((d) => d.status === 'completed').length
  const delayedCount = DEMO_DISPATCHES.filter((d) => d.status === 'delayed').length

  const stats: Stat[] = [
    { label: 'Active Dispatches', value: activeCount, caption: 'In progress', highlight: true },
    { label: 'Completed Today', value: completedCount, caption: 'Delivered', tone: 'info' },
    { label: 'Delayed', value: delayedCount, caption: 'Past ETA', tone: 'warning' },
    { label: 'Avg Response', value: '0m', caption: 'Request to arrival' },
  ]

  const columns: Column<TowDispatch>[] = [
    { header: 'Reference', cell: (d) => d.reference, code: true },
    { header: 'Vehicle', cell: (d) => d.vehicle },
    { header: 'Pickup', cell: (d) => d.pickup },
    { header: 'Driver', cell: (d) => d.driver || '—' },
    { header: 'Status', cell: (d) => <DispatchStatusBadge status={d.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Truck"
        title={t('Towing Assistance')}
        subtitle={t('Dispatching and tracking towing services')}
        actions={
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('Dispatch Tow')}
          </Button>
        }
      />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Dispatch Board')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search dispatches...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(d) => d.reference}
          mobileCard={(d) => (
            <>
              <MobileCardHeader title={d.reference} trailing={<DispatchStatusBadge status={d.status} />} />
              <MobileCardRow label={t('Vehicle')}>{d.vehicle}</MobileCardRow>
              <MobileCardRow label={t('Pickup')}>{d.pickup}</MobileCardRow>
              <MobileCardRow label={t('Driver')}>{d.driver || '—'}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Truck"
              title={t('No active tow dispatches')}
              description={t('Dispatch a tow truck to start tracking recovery jobs.')}
            />
          }
        />
      </Section>
    </>
  )
}
