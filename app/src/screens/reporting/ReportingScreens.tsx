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

// ─── Business Intelligence ─────────────────────────────────────────────────────

interface BIReport {
  report: string
  metric: string
  period: string
  updated: string
}

const BI_TABS = [
  { id: 'all', label: 'All', icon: 'BarChart3' },
  { id: 'revenue', label: 'Revenue', icon: 'DollarSign' },
  { id: 'operations', label: 'Operations', icon: 'Settings' },
  { id: 'custom', label: 'Custom', icon: 'SlidersHorizontal' },
] as const

const DEMO_BI_REPORTS: readonly BIReport[] = []

export function BusinessIntelligence() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(BI_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly BIReport[] = DEMO_BI_REPORTS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.period.toLowerCase().includes(tab))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.report, r.metric, r.period].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Revenue MTD', value: 'SAR 0.00', caption: 'Month to date', highlight: true },
    { label: 'Gross Margin', value: '0%', caption: 'This month', tone: 'info' },
    { label: 'Jobs Completed', value: 0, caption: 'This month' },
    { label: 'Below Target', value: 0, caption: 'KPIs off track', tone: 'warning' },
  ]

  const columns: Column<BIReport>[] = [
    { header: 'Report', cell: (r) => <span className="font-medium text-heading">{r.report}</span> },
    { header: 'Metric', cell: (r) => r.metric },
    { header: 'Period', cell: (r) => r.period },
    { header: 'Updated', cell: (r) => r.updated },
  ]

  return (
    <>
      <FeatureHeader
        icon="BarChart3"
        title={t('Business Intelligence')}
        subtitle={t('Analytics and insight across the business')}
      />

      <TabBar tabs={BI_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Reports')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search reports...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.report}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.report} />
              <MobileCardRow label={t('Metric')}>{r.metric}</MobileCardRow>
              <MobileCardRow label={t('Period')}>{r.period}</MobileCardRow>
              <MobileCardRow label={t('Updated')}>{r.updated}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="BarChart3"
              title={t('No reports available yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── BI Dashboard ───────────────────────────────────────────────────────────────

interface BIDashboardRow {
  metric: string
  value: string
  trend: string
  target: string
}

const BID_TABS = [
  { id: 'all', label: 'Overview', icon: 'PieChart' },
  { id: 'revenue', label: 'Revenue', icon: 'DollarSign' },
  { id: 'operations', label: 'Operations', icon: 'Settings' },
  { id: 'alerts', label: 'Alerts', icon: 'AlertCircle' },
] as const

const DEMO_BID_ROWS: readonly BIDashboardRow[] = []

export function BIDashboard() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(BID_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly BIDashboardRow[] = DEMO_BID_ROWS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.metric.toLowerCase().includes(tab))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.metric, r.value, r.trend, r.target].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Revenue MTD', value: 'SAR 0.00', caption: 'Month to date', highlight: true },
    { label: 'Avg Ticket', value: 'SAR 0.00', caption: 'Per job', tone: 'info' },
    { label: 'Utilisation', value: '0%', caption: 'Workshop' },
    { label: 'Alerts', value: 0, caption: 'Need attention', tone: 'warning' },
  ]

  const columns: Column<BIDashboardRow>[] = [
    { header: 'Metric', cell: (r) => <span className="font-medium text-heading">{r.metric}</span> },
    { header: 'Value', cell: (r) => r.value },
    { header: 'Trend', cell: (r) => r.trend },
    { header: 'Target', cell: (r) => r.target },
  ]

  return (
    <>
      <FeatureHeader
        icon="PieChart"
        title={t('BI Dashboard')}
        subtitle={t('Executive metrics at a glance')}
      />

      <TabBar tabs={BID_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Key Metrics')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search metrics...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.metric}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.metric} />
              <MobileCardRow label={t('Value')}>{r.value}</MobileCardRow>
              <MobileCardRow label={t('Trend')}>{r.trend}</MobileCardRow>
              <MobileCardRow label={t('Target')}>{r.target}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="PieChart"
              title={t('No metrics to display yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Business Heatmaps ──────────────────────────────────────────────────────────

interface HeatmapRow {
  day: string
  hour: string
  bookings: number
  utilisation: string
}

const HEATMAP_TABS = [
  { id: 'all', label: 'Weekly', icon: 'Grid3x3' },
  { id: 'daily', label: 'Daily', icon: 'Calendar' },
  { id: 'monthly', label: 'Monthly', icon: 'CalendarDays' },
  { id: 'custom', label: 'Custom', icon: 'SlidersHorizontal' },
] as const

const DEMO_HEATMAP_ROWS: readonly HeatmapRow[] = []

export function BusinessHeatmaps() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(HEATMAP_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly HeatmapRow[] = DEMO_HEATMAP_ROWS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.day.toLowerCase().includes(tab))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.day, r.hour, r.utilisation].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Peak Day', value: '—', caption: 'Busiest', highlight: true },
    { label: 'Peak Hour', value: '—', caption: 'Busiest', tone: 'info' },
    { label: 'Quietest Slot', value: '—', caption: 'Lowest demand' },
    { label: 'Coverage Gaps', value: 0, caption: 'Understaffed slots', tone: 'warning' },
  ]

  const columns: Column<HeatmapRow>[] = [
    { header: 'Day', cell: (r) => <span className="font-medium text-heading">{r.day}</span> },
    { header: 'Hour', cell: (r) => r.hour },
    { header: 'Bookings', cell: (r) => r.bookings },
    { header: 'Utilisation', cell: (r) => r.utilisation },
  ]

  return (
    <>
      <FeatureHeader
        icon="Grid3x3"
        title={t('Business Heatmaps')}
        subtitle={t('Demand and activity patterns over time')}
      />

      <TabBar tabs={HEATMAP_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Activity By Slot')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search slots...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => `${r.day}-${r.hour}`}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.day} />
              <MobileCardRow label={t('Hour')}>{r.hour}</MobileCardRow>
              <MobileCardRow label={t('Bookings')}>{r.bookings}</MobileCardRow>
              <MobileCardRow label={t('Utilisation')}>{r.utilisation}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Grid3x3"
              title={t('Not enough data to map yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Profit Analysis ────────────────────────────────────────────────────────────

interface ProfitRow {
  category: string
  revenue: string
  cost: string
  profit: string
  margin: string
}

const PROFIT_TABS = [
  { id: 'all', label: 'All', icon: 'TrendingUp' },
  { id: 'services', label: 'Services', icon: 'Wrench' },
  { id: 'parts', label: 'Parts', icon: 'Package' },
  { id: 'branches', label: 'Branches', icon: 'Building2' },
] as const

const DEMO_PROFIT_ROWS: readonly ProfitRow[] = []

export function ProfitAnalysis() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(PROFIT_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly ProfitRow[] = DEMO_PROFIT_ROWS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.category.toLowerCase().includes(tab))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.category, r.revenue, r.cost, r.profit, r.margin].some((f) =>
          f.toLowerCase().includes(needle),
        ),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Gross Profit MTD', value: 'SAR 0.00', caption: 'Month to date', highlight: true },
    { label: 'Margin', value: '0%', caption: 'This month', tone: 'info' },
    { label: 'Labour Margin', value: '0%', caption: 'This month' },
    { label: 'Low-Margin Lines', value: 0, caption: 'Below target', tone: 'warning' },
  ]

  const columns: Column<ProfitRow>[] = [
    { header: 'Category', cell: (r) => <span className="font-medium text-heading">{r.category}</span> },
    { header: 'Revenue', cell: (r) => r.revenue },
    { header: 'Cost', cell: (r) => r.cost },
    { header: 'Profit', cell: (r) => r.profit },
    { header: 'Margin', cell: (r) => r.margin },
  ]

  return (
    <>
      <FeatureHeader
        icon="TrendingUp"
        title={t('Profit Analysis')}
        subtitle={t('Margin breakdown by service, part and branch')}
      />

      <TabBar tabs={PROFIT_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Profit By Category')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search categories...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.category}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.category} />
              <MobileCardRow label={t('Revenue')}>{r.revenue}</MobileCardRow>
              <MobileCardRow label={t('Cost')}>{r.cost}</MobileCardRow>
              <MobileCardRow label={t('Profit')}>{r.profit}</MobileCardRow>
              <MobileCardRow label={t('Margin')}>{r.margin}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="TrendingUp"
              title={t('Not enough data to analyse yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── KPI Dashboard ──────────────────────────────────────────────────────────────

interface KPIRow {
  kpi: string
  current: string
  target: string
  trend: string
  status: 'on-target' | 'off-target' | 'improving'
}

const KPI_TABS = [
  { id: 'all', label: 'All', icon: 'Gauge' },
  { id: 'on-target', label: 'On Target', icon: 'CheckCircle' },
  { id: 'off-target', label: 'Off Target', icon: 'XCircle' },
  { id: 'improving', label: 'Improving', icon: 'TrendingUp' },
] as const

const DEMO_KPI_ROWS: readonly KPIRow[] = []

function KPIStatusBadge({ status }: { status: KPIRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'on-target':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('On Target')}
        </Badge>
      )
    case 'off-target':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Off Target')}
        </Badge>
      )
    case 'improving':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Improving')}
        </Badge>
      )
  }
}

export function KPIDashboard() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(KPI_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly KPIRow[] = DEMO_KPI_ROWS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.kpi, r.current, r.target, r.trend].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'KPIs Tracked', value: 0, caption: 'Configured', highlight: true },
    { label: 'On Target', value: 0, caption: 'Meeting goal', tone: 'info' },
    { label: 'Off Target', value: 0, caption: 'Below goal', tone: 'warning' },
    { label: 'Improving', value: 0, caption: 'Positive trend' },
  ]

  const columns: Column<KPIRow>[] = [
    { header: 'KPI', cell: (r) => <span className="font-medium text-heading">{r.kpi}</span> },
    { header: 'Current', cell: (r) => r.current },
    { header: 'Target', cell: (r) => r.target },
    { header: 'Trend', cell: (r) => r.trend },
    { header: 'Status', cell: (r) => <KPIStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Gauge"
        title={t('KPI Dashboard')}
        subtitle={t('Track performance against targets')}
      />

      <TabBar tabs={KPI_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Indicators')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search indicators...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.kpi}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.kpi} trailing={<KPIStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Current')}>{r.current}</MobileCardRow>
              <MobileCardRow label={t('Target')}>{r.target}</MobileCardRow>
              <MobileCardRow label={t('Trend')}>{r.trend}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Gauge"
              title={t('No KPIs configured yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Productivity Tracker ───────────────────────────────────────────────────────

interface ProductivityRow {
  technician: string
  billable: string
  attended: string
  efficiency: string
}

const PRODUCTIVITY_TABS = [
  { id: 'all', label: 'All', icon: 'Activity' },
  { id: 'top', label: 'Top Performers', icon: 'Trophy' },
  { id: 'below', label: 'Below Target', icon: 'AlertCircle' },
  { id: 'dept', label: 'By Department', icon: 'Building2' },
] as const

const DEMO_PRODUCTIVITY_ROWS: readonly ProductivityRow[] = []

export function ProductivityTracker() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(PRODUCTIVITY_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly ProductivityRow[] = DEMO_PRODUCTIVITY_ROWS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.technician.toLowerCase().includes(tab))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.technician, r.billable, r.attended, r.efficiency].some((f) =>
          f.toLowerCase().includes(needle),
        ),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Billable Hours', value: '0.0', caption: 'This week', highlight: true },
    { label: 'Efficiency', value: '0%', caption: 'Actual vs sold', tone: 'info' },
    { label: 'Idle Time', value: '0.0', caption: 'Hours this week', tone: 'warning' },
    { label: 'Jobs / Day', value: '0.0', caption: 'Average' },
  ]

  const columns: Column<ProductivityRow>[] = [
    { header: 'Technician', cell: (r) => <span className="font-medium text-heading">{r.technician}</span> },
    { header: 'Billable', cell: (r) => r.billable },
    { header: 'Attended', cell: (r) => r.attended },
    { header: 'Efficiency', cell: (r) => r.efficiency },
  ]

  return (
    <>
      <FeatureHeader
        icon="Activity"
        title={t('Productivity Tracker')}
        subtitle={t('Output and efficiency across the workshop')}
      />

      <TabBar tabs={PRODUCTIVITY_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Productivity By Technician')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search technicians...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.technician}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.technician} />
              <MobileCardRow label={t('Billable')}>{r.billable}</MobileCardRow>
              <MobileCardRow label={t('Attended')}>{r.attended}</MobileCardRow>
              <MobileCardRow label={t('Efficiency')}>{r.efficiency}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Activity"
              title={t('No productivity data yet')}
            />
          }
        />
      </Section>
    </>
  )
}
