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

interface Claim {
  id: string
  vehicle: string
  insurer: string
  amount: string
  status: 'open' | 'pending' | 'approved' | 'rejected' | 'settled'
  filed: string
}

const TABS = [
  { id: 'all', label: 'All Claims', icon: 'Shield' },
  { id: 'open', label: 'Open', icon: 'Clock' },
  { id: 'pending', label: 'Pending Approval', icon: 'AlertCircle' },
  { id: 'settled', label: 'Settled', icon: 'CheckCircle' },
] as const

const DEMO_CLAIMS: readonly Claim[] = []

function ClaimStatusBadge({ status }: { status: Claim['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'open':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Open')}
        </Badge>
      )
    case 'pending':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Pending')}
        </Badge>
      )
    case 'approved':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Approved')}
        </Badge>
      )
    case 'rejected':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Rejected')}
        </Badge>
      )
    case 'settled':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Settled')}
        </Badge>
      )
  }
}

export function InsuranceClaims() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly Claim[] = DEMO_CLAIMS
    if (tab !== 'all') {
      const statusMap: Record<string, Claim['status'][]> = {
        open: ['open'],
        pending: ['pending'],
        settled: ['settled', 'approved'],
      }
      const statuses = statusMap[tab] ?? []
      rows = rows.filter((c) => statuses.includes(c.status))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((c) =>
        [c.id, c.vehicle, c.insurer].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const openCount = DEMO_CLAIMS.filter((c) => c.status === 'open').length
  const pendingCount = DEMO_CLAIMS.filter((c) => c.status === 'pending').length
  const approvedCount = DEMO_CLAIMS.filter((c) => c.status === 'approved' || c.status === 'settled').length

  const stats: Stat[] = [
    { label: 'Open Claims', value: openCount, caption: 'In progress', highlight: true },
    { label: 'Awaiting Insurer', value: pendingCount, caption: 'Pending approval', tone: 'warning' },
    { label: 'Approved', value: approvedCount, caption: 'This month', tone: 'info' },
    { label: 'Claims Value', value: 'SAR 0.00', caption: 'This month' },
  ]

  const columns: Column<Claim>[] = [
    { header: 'Claim', cell: (c) => c.id, code: true },
    { header: 'Vehicle', cell: (c) => c.vehicle },
    { header: 'Insurer', cell: (c) => c.insurer },
    { header: 'Amount', cell: (c) => c.amount, code: true },
    { header: 'Status', cell: (c) => <ClaimStatusBadge status={c.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Shield"
        title={t('Insurance Claims')}
        subtitle={t('Process and track insurer-funded repairs')}
        actions={
          <Button size="md">
            <Icon name="Plus" size={16} />
            {t('New Claim')}
          </Button>
        }
      />

      <TabBar tabs={TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Claims')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search claims...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(c) => c.id}
          mobileCard={(c) => (
            <>
              <MobileCardHeader title={c.id} trailing={<ClaimStatusBadge status={c.status} />} />
              <MobileCardRow label={t('Vehicle')}>{c.vehicle}</MobileCardRow>
              <MobileCardRow label={t('Insurer')}>{c.insurer}</MobileCardRow>
              <MobileCardRow label={t('Amount')}>
                <span className="font-mono" dir="ltr">{c.amount}</span>
              </MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Shield"
              title={t('No insurance claims yet')}
              description={t('Claims filed with insurers will appear here.')}
            />
          }
        />
      </Section>
    </>
  )
}
