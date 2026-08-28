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

interface TowRequest {
  reference: string
  vehicle: string
  pickup: string
  operator: string
  status: 'active' | 'completed' | 'delayed' | 'cancelled'
}

const TABS = [
  { id: 'all', label: 'All Requests', icon: 'Truck' },
  { id: 'active', label: 'Active', icon: 'Navigation' },
  { id: 'completed', label: 'Completed', icon: 'CheckCircle' },
  { id: 'delayed', label: 'Delayed', icon: 'AlertCircle' },
] as const

const DEMO_REQUESTS: readonly TowRequest[] = []

function TowStatusBadge({ status }: { status: TowRequest['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
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
    case 'cancelled':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Cancelled')}
        </Badge>
      )
  }
}

export function TowingServices() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly TowRequest[] = DEMO_REQUESTS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.reference, r.vehicle, r.pickup, r.operator].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const activeCount = DEMO_REQUESTS.filter((r) => r.status === 'active').length
  const completedCount = DEMO_REQUESTS.filter((r) => r.status === 'completed').length
  const delayedCount = DEMO_REQUESTS.filter((r) => r.status === 'delayed').length

  const stats: Stat[] = [
    { label: 'Active Requests', value: activeCount, caption: 'In progress', highlight: true },
    { label: 'Completed', value: completedCount, caption: 'This month', tone: 'info' },
    { label: 'Delayed', value: delayedCount, caption: 'Past ETA', tone: 'warning' },
    { label: 'Avg Response', value: '0m', caption: 'Request to arrival' },
  ]

  const columns: Column<TowRequest>[] = [
    { header: 'Reference', cell: (r) => r.reference, code: true },
    { header: 'Vehicle', cell: (r) => r.vehicle },
    { header: 'Pickup', cell: (r) => r.pickup },
    { header: 'Operator', cell: (r) => r.operator },
    { header: 'Status', cell: (r) => <TowStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Truck"
        title={t('Towing Services')}
        subtitle={t('Recovery jobs and partner tow operators')}
        actions={
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('Request Tow')}
          </Button>
        }
      />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Tow Requests')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search tow requests...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.reference}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.reference} trailing={<TowStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Vehicle')}>{r.vehicle}</MobileCardRow>
              <MobileCardRow label={t('Pickup')}>{r.pickup}</MobileCardRow>
              <MobileCardRow label={t('Operator')}>{r.operator}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Truck"
              title={t('No tow requests')}
              description={t('Request a tow to start managing recovery jobs.')}
            />
          }
        />
      </Section>
    </>
  )
}
