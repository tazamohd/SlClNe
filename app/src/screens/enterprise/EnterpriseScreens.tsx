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

interface FranchiseRow {
  franchise: string
  location: string
  revenueMTD: string
  royalty: string
  status: 'active' | 'onboarding' | 'suspended'
}

const FRANCHISE_TABS = [
  { id: 'all', label: 'All', icon: 'Store' },
  { id: 'active', label: 'Active', icon: 'CheckCircle' },
  { id: 'onboarding', label: 'Onboarding', icon: 'UserPlus' },
  { id: 'suspended', label: 'Suspended', icon: 'XCircle' },
] as const

const DEMO_FRANCHISES: readonly FranchiseRow[] = []

function FranchiseStatusBadge({ status }: { status: FranchiseRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'onboarding':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Onboarding')}
        </Badge>
      )
    case 'suspended':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Suspended')}
        </Badge>
      )
  }
}

export function FranchiseManagement() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(FRANCHISE_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly FranchiseRow[] = DEMO_FRANCHISES
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.franchise, r.location].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Franchises', value: 0, caption: 'Operating', highlight: true },
    { label: 'Royalties Due', value: 'SAR 0.00', caption: 'This month', tone: 'warning' },
    { label: 'Top Performer', value: '—', caption: 'By revenue', tone: 'info' },
    { label: 'Onboarding', value: 0, caption: 'In setup' },
  ]

  const columns: Column<FranchiseRow>[] = [
    { header: 'Franchise', cell: (r) => <span className="font-medium text-heading">{r.franchise}</span> },
    { header: 'Location', cell: (r) => r.location },
    { header: 'Revenue MTD', cell: (r) => r.revenueMTD },
    { header: 'Royalty', cell: (r) => r.royalty },
    { header: 'Status', cell: (r) => <FranchiseStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Store"
        title={t('Franchise Management')}
        subtitle={t('Manage franchise locations and royalties')}
      />

      <TabBar tabs={FRANCHISE_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Franchises')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search franchises...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.franchise}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.franchise} trailing={<FranchiseStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Location')}>{r.location}</MobileCardRow>
              <MobileCardRow label={t('Revenue MTD')}>{r.revenueMTD}</MobileCardRow>
              <MobileCardRow label={t('Royalty')}>{r.royalty}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Store"
              title={t('No franchises yet')}
            />
          }
        />
      </Section>
    </>
  )
}

interface GlobalizationRow {
  region: string
  language: string
  currency: string
  status: 'active' | 'incomplete' | 'disabled'
}

const GLOBALIZATION_TABS = [
  { id: 'all', label: 'Languages', icon: 'Globe' },
  { id: 'currencies', label: 'Currencies', icon: 'DollarSign' },
  { id: 'regions', label: 'Regions', icon: 'Map' },
  { id: 'translations', label: 'Translations', icon: 'Languages' },
] as const

const DEMO_GLOBALIZATION: readonly GlobalizationRow[] = []

function GlobalizationStatusBadge({ status }: { status: GlobalizationRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'incomplete':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Incomplete')}
        </Badge>
      )
    case 'disabled':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Disabled')}
        </Badge>
      )
  }
}

export function GlobalizationLayer() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(GLOBALIZATION_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly GlobalizationRow[] = DEMO_GLOBALIZATION
    if (tab !== 'all') {
      rows = rows.filter((r) => r.region.toLowerCase().includes(tab))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.region, r.language, r.currency].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Languages', value: 0, caption: 'Enabled', highlight: true },
    { label: 'Currencies', value: 0, caption: 'Supported', tone: 'info' },
    { label: 'Regions', value: 0, caption: 'Configured' },
    { label: 'Missing Translations', value: 0, caption: 'To complete', tone: 'warning' },
  ]

  const columns: Column<GlobalizationRow>[] = [
    { header: 'Region', cell: (r) => <span className="font-medium text-heading">{r.region}</span> },
    { header: 'Language', cell: (r) => r.language },
    { header: 'Currency', cell: (r) => r.currency },
    { header: 'Status', cell: (r) => <GlobalizationStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Globe"
        title={t('Globalization Layer')}
        subtitle={t('Languages, currencies and regional settings')}
      />

      <TabBar tabs={GLOBALIZATION_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Regional Settings')}
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.region}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.region} trailing={<GlobalizationStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Language')}>{r.language}</MobileCardRow>
              <MobileCardRow label={t('Currency')}>{r.currency}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Globe"
              title={t('No regional settings configured')}
            />
          }
        />
      </Section>
    </>
  )
}

interface BranchRow {
  branch: string
  jobs: number
  revenueMTD: string
  utilisation: string
  status: 'on-target' | 'below-target' | 'new'
}

const BRANCH_TABS = [
  { id: 'all', label: 'All', icon: 'Building2' },
  { id: 'on-target', label: 'Top Performers', icon: 'Trophy' },
  { id: 'below-target', label: 'Below Target', icon: 'AlertCircle' },
  { id: 'new', label: 'New', icon: 'Plus' },
] as const

const DEMO_BRANCHES: readonly BranchRow[] = []

function BranchStatusBadge({ status }: { status: BranchRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'on-target':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('On Target')}
        </Badge>
      )
    case 'below-target':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Below Target')}
        </Badge>
      )
    case 'new':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('New')}
        </Badge>
      )
  }
}

export function MultiLocationDashboard() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(BRANCH_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly BranchRow[] = DEMO_BRANCHES
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.branch, r.revenueMTD, r.utilisation].some((f) =>
          f.toLowerCase().includes(needle),
        ),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Locations', value: 0, caption: 'Active', highlight: true },
    { label: 'Revenue MTD', value: 'SAR 0.00', caption: 'All branches', tone: 'info' },
    { label: 'Top Branch', value: '—', caption: 'By revenue' },
    { label: 'Below Target', value: 0, caption: 'Branches', tone: 'warning' },
  ]

  const columns: Column<BranchRow>[] = [
    { header: 'Branch', cell: (r) => <span className="font-medium text-heading">{r.branch}</span> },
    { header: 'Jobs', cell: (r) => r.jobs },
    { header: 'Revenue MTD', cell: (r) => r.revenueMTD },
    { header: 'Utilisation', cell: (r) => r.utilisation },
    { header: 'Status', cell: (r) => <BranchStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Building2"
        title={t('Multi-Location Dashboard')}
        subtitle={t('Compare performance across branches')}
      />

      <TabBar tabs={BRANCH_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Branch Performance')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search branches...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.branch}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.branch} trailing={<BranchStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Jobs')}>{r.jobs}</MobileCardRow>
              <MobileCardRow label={t('Revenue MTD')}>{r.revenueMTD}</MobileCardRow>
              <MobileCardRow label={t('Utilisation')}>{r.utilisation}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Building2"
              title={t('No branch data yet')}
            />
          }
        />
      </Section>
    </>
  )
}

interface WearableRow {
  device: string
  wearer: string
  type: string
  lastReport: string
  status: 'online' | 'offline' | 'alert'
}

const WEARABLE_TABS = [
  { id: 'all', label: 'All', icon: 'Activity' },
  { id: 'online', label: 'Online', icon: 'Wifi' },
  { id: 'offline', label: 'Offline', icon: 'WifiOff' },
  { id: 'alert', label: 'Alerts', icon: 'AlertTriangle' },
] as const

const DEMO_WEARABLES: readonly WearableRow[] = []

function WearableStatusBadge({ status }: { status: WearableRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'online':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Online')}
        </Badge>
      )
    case 'offline':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Offline')}
        </Badge>
      )
    case 'alert':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Alert')}
        </Badge>
      )
  }
}

export function WearableIntegration() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(WEARABLE_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly WearableRow[] = DEMO_WEARABLES
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.device, r.wearer, r.type].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Devices Paired', value: 0, caption: 'Registered', highlight: true },
    { label: 'Reporting', value: 0, caption: 'Online now', tone: 'info' },
    { label: 'Safety Alerts', value: 0, caption: 'Today', tone: 'warning' },
    { label: 'Offline', value: 0, caption: 'No signal' },
  ]

  const columns: Column<WearableRow>[] = [
    { header: 'Device', cell: (r) => <span className="font-medium text-heading">{r.device}</span> },
    { header: 'Wearer', cell: (r) => r.wearer },
    { header: 'Type', cell: (r) => r.type },
    { header: 'Last Report', cell: (r) => r.lastReport },
    { header: 'Status', cell: (r) => <WearableStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Activity"
        title={t('Wearable Integration')}
        subtitle={t('Connected wearables for safety and activity')}
      />

      <TabBar tabs={WEARABLE_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Paired Devices')}
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.device}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.device} trailing={<WearableStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Wearer')}>{r.wearer}</MobileCardRow>
              <MobileCardRow label={t('Type')}>{r.type}</MobileCardRow>
              <MobileCardRow label={t('Last Report')}>{r.lastReport}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Activity"
              title={t('No wearables paired yet')}
            />
          }
        />
      </Section>
    </>
  )
}
