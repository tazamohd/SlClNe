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

interface Contract {
  name: string
  party: string
  value: string
  renews: string
  status: 'active' | 'renewal' | 'draft' | 'expired'
}

const TABS = [
  { id: 'all', label: 'All Contracts', icon: 'FileSignature' },
  { id: 'active', label: 'Active', icon: 'CheckCircle' },
  { id: 'renewal', label: 'Up For Renewal', icon: 'AlertCircle' },
  { id: 'draft', label: 'Drafts', icon: 'FileEdit' },
] as const

const DEMO_CONTRACTS: readonly Contract[] = []

function ContractStatusBadge({ status }: { status: Contract['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'renewal':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Renewal Due')}
        </Badge>
      )
    case 'draft':
      return (
        <Badge background="rgba(10,94,215,.06)" color="#6B7280">
          {t('Draft')}
        </Badge>
      )
    case 'expired':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Expired')}
        </Badge>
      )
  }
}

export function ContractManagement() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly Contract[] = DEMO_CONTRACTS
    if (tab !== 'all') {
      rows = rows.filter((c) => c.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((c) =>
        [c.name, c.party].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const activeCount = DEMO_CONTRACTS.filter((c) => c.status === 'active').length
  const renewalCount = DEMO_CONTRACTS.filter((c) => c.status === 'renewal').length
  const draftCount = DEMO_CONTRACTS.filter((c) => c.status === 'draft').length

  const stats: Stat[] = [
    { label: 'Active Contracts', value: activeCount, caption: 'In force', highlight: true },
    { label: 'Up For Renewal', value: renewalCount, caption: 'Within 60 days', tone: 'warning' },
    { label: 'Annual Value', value: 'SAR 0.00', caption: 'Committed', tone: 'info' },
    { label: 'Draft', value: draftCount, caption: 'Not signed' },
  ]

  const columns: Column<Contract>[] = [
    { header: 'Contract', cell: (c) => c.name },
    { header: 'Party', cell: (c) => c.party },
    { header: 'Value', cell: (c) => c.value, code: true },
    { header: 'Renews', cell: (c) => c.renews },
    { header: 'Status', cell: (c) => <ContractStatusBadge status={c.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="FileSignature"
        title={t('Contract Management')}
        subtitle={t('Service contracts, renewals and obligations')}
        actions={
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('New Contract')}
          </Button>
        }
      />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Contracts')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search contracts...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(c) => c.name}
          mobileCard={(c) => (
            <>
              <MobileCardHeader title={c.name} trailing={<ContractStatusBadge status={c.status} />} />
              <MobileCardRow label={t('Party')}>{c.party}</MobileCardRow>
              <MobileCardRow label={t('Value')}>
                <span className="font-mono" dir="ltr">{c.value}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Renews')}>{c.renews}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="FileSignature"
              title={t('No contracts on file yet')}
              description={t('Add a service contract to start tracking renewals and obligations.')}
            />
          }
        />
      </Section>
    </>
  )
}
