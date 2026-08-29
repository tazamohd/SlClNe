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

interface Warranty {
  reference: string
  vehicle: string
  coverage: string
  expires: string
  status: 'active' | 'expiring' | 'expired' | 'claimed'
}

const TABS = [
  { id: 'all', label: 'All Warranties', icon: 'ShieldCheck' },
  { id: 'active', label: 'Active', icon: 'CheckCircle' },
  { id: 'expiring', label: 'Expiring Soon', icon: 'AlertCircle' },
  { id: 'claims', label: 'Claims', icon: 'FileText' },
] as const

const DEMO_WARRANTIES: readonly Warranty[] = []

function WarrantyStatusBadge({ status }: { status: Warranty['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'expiring':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Expiring')}
        </Badge>
      )
    case 'expired':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Expired')}
        </Badge>
      )
    case 'claimed':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Claimed')}
        </Badge>
      )
  }
}

export function WarrantyManagement() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly Warranty[] = DEMO_WARRANTIES
    if (tab !== 'all') {
      const statusMap: Record<string, Warranty['status'][]> = {
        active: ['active'],
        expiring: ['expiring'],
        claims: ['claimed'],
      }
      const statuses = statusMap[tab] ?? []
      rows = rows.filter((w) => statuses.includes(w.status))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((w) =>
        [w.reference, w.vehicle, w.coverage].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const activeCount = DEMO_WARRANTIES.filter((w) => w.status === 'active').length
  const expiringCount = DEMO_WARRANTIES.filter((w) => w.status === 'expiring').length
  const claimedCount = DEMO_WARRANTIES.filter((w) => w.status === 'claimed').length

  const stats: Stat[] = [
    { label: 'Active Warranties', value: activeCount, caption: 'In force', highlight: true },
    { label: 'Open Claims', value: claimedCount, caption: 'Being processed', tone: 'info' },
    { label: 'Expiring Soon', value: expiringCount, caption: 'Within 30 days', tone: 'warning' },
    { label: 'Claims Value', value: 'SAR 0.00', caption: 'This year' },
  ]

  const columns: Column<Warranty>[] = [
    { header: 'Reference', cell: (w) => w.reference, code: true },
    { header: 'Vehicle', cell: (w) => w.vehicle },
    { header: 'Coverage', cell: (w) => w.coverage },
    { header: 'Expires', cell: (w) => w.expires },
    { header: 'Status', cell: (w) => <WarrantyStatusBadge status={w.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ShieldCheck"
        title={t('Warranty Management')}
        subtitle={t('Track warranty coverage, claims and expiry')}
        actions={
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('New Warranty')}
          </Button>
        }
      />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Warranties')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search warranties...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(w) => w.reference}
          mobileCard={(w) => (
            <>
              <MobileCardHeader title={w.reference} trailing={<WarrantyStatusBadge status={w.status} />} />
              <MobileCardRow label={t('Vehicle')}>{w.vehicle}</MobileCardRow>
              <MobileCardRow label={t('Coverage')}>{w.coverage}</MobileCardRow>
              <MobileCardRow label={t('Expires')}>{w.expires}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="ShieldCheck"
              title={t('No warranties recorded yet')}
              description={t('Register a warranty to start tracking coverage and claims.')}
            />
          }
        />
      </Section>
    </>
  )
}
