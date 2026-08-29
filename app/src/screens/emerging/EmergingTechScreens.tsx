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

// ─── Emerging Technologies ─────────────────────────────────────────────────────

interface Pilot {
  technology: string
  owner: string
  stage: string
  started: string
  status: 'active' | 'evaluation' | 'blocked' | 'graduated'
}

const PILOT_TABS = [
  { id: 'all', label: 'All', icon: 'Sparkles' },
  { id: 'active', label: 'Active', icon: 'Play' },
  { id: 'evaluation', label: 'Evaluation', icon: 'Search' },
  { id: 'graduated', label: 'Graduated', icon: 'Award' },
] as const

const DEMO_PILOTS: readonly Pilot[] = []

function PilotStatusBadge({ status }: { status: Pilot['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'evaluation':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Evaluation')}
        </Badge>
      )
    case 'blocked':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Blocked')}
        </Badge>
      )
    case 'graduated':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Graduated')}
        </Badge>
      )
  }
}

export function EmergingTechnologies() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(PILOT_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly Pilot[] = DEMO_PILOTS
    if (tab !== 'all') {
      rows = rows.filter((p) => p.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((p) =>
        [p.technology, p.owner, p.stage].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Active Pilots', value: 0, caption: 'Running', highlight: true },
    { label: 'In Evaluation', value: 0, caption: 'Under review', tone: 'info' },
    { label: 'Blocked', value: 0, caption: 'Need attention', tone: 'warning' },
    { label: 'Graduated', value: 0, caption: 'To production' },
  ]

  const columns: Column<Pilot>[] = [
    { header: 'Technology', cell: (p) => <span className="font-medium text-heading">{p.technology}</span> },
    { header: 'Owner', cell: (p) => p.owner },
    { header: 'Stage', cell: (p) => p.stage },
    { header: 'Started', cell: (p) => p.started },
    { header: 'Status', cell: (p) => <PilotStatusBadge status={p.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Sparkles"
        title={t('Emerging Technologies')}
        subtitle={t('Pilot programs and experimental capabilities')}
      />

      <TabBar tabs={PILOT_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Pilots')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search pilots...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(p) => p.technology}
          mobileCard={(p) => (
            <>
              <MobileCardHeader title={p.technology} trailing={<PilotStatusBadge status={p.status} />} />
              <MobileCardRow label={t('Owner')}>{p.owner}</MobileCardRow>
              <MobileCardRow label={t('Stage')}>{p.stage}</MobileCardRow>
              <MobileCardRow label={t('Started')}>{p.started}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Sparkles"
              title={t('No pilots running yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Next-Gen Technologies ─────────────────────────────────────────────────────

interface RoadmapItem {
  capability: string
  category: string
  target: string
  status: 'planned' | 'in-progress' | 'at-risk' | 'shipped'
}

const ROADMAP_TABS = [
  { id: 'all', label: 'All', icon: 'Zap' },
  { id: 'planned', label: 'Planned', icon: 'Calendar' },
  { id: 'in-progress', label: 'In Progress', icon: 'Loader' },
  { id: 'shipped', label: 'Shipped', icon: 'CheckCircle' },
] as const

const DEMO_ROADMAP: readonly RoadmapItem[] = []

function RoadmapStatusBadge({ status }: { status: RoadmapItem['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'planned':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Planned')}
        </Badge>
      )
    case 'in-progress':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('In Progress')}
        </Badge>
      )
    case 'at-risk':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('At Risk')}
        </Badge>
      )
    case 'shipped':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Shipped')}
        </Badge>
      )
  }
}

export function NextGenTechnologies() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(ROADMAP_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly RoadmapItem[] = DEMO_ROADMAP
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.capability, r.category].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'On Roadmap', value: 0, caption: 'Planned', highlight: true },
    { label: 'In Progress', value: 0, caption: 'Being built', tone: 'info' },
    { label: 'At Risk', value: 0, caption: 'Behind plan', tone: 'warning' },
    { label: 'Shipped', value: 0, caption: 'This year' },
  ]

  const columns: Column<RoadmapItem>[] = [
    { header: 'Capability', cell: (r) => <span className="font-medium text-heading">{r.capability}</span> },
    { header: 'Category', cell: (r) => r.category },
    { header: 'Target', cell: (r) => r.target },
    { header: 'Status', cell: (r) => <RoadmapStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Zap"
        title={t('Next-Gen Technologies')}
        subtitle={t('Roadmap of next-generation capabilities')}
      />

      <TabBar tabs={ROADMAP_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Roadmap')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.capability}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.capability} trailing={<RoadmapStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Category')}>{r.category}</MobileCardRow>
              <MobileCardRow label={t('Target')}>{r.target}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Zap"
              title={t('Nothing on the roadmap yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── IoT Dashboard ─────────────────────────────────────────────────────────────

interface IoTDevice {
  device: string
  type: string
  location: string
  lastReport: string
  status: 'online' | 'offline' | 'alert'
}

const IOT_TABS = [
  { id: 'all', label: 'All', icon: 'Webhook' },
  { id: 'online', label: 'Online', icon: 'Wifi' },
  { id: 'offline', label: 'Offline', icon: 'WifiOff' },
  { id: 'alert', label: 'Alerts', icon: 'AlertTriangle' },
] as const

const DEMO_IOT_DEVICES: readonly IoTDevice[] = []

function IoTStatusBadge({ status }: { status: IoTDevice['status'] }) {
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

export function IoTDashboard() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(IOT_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly IoTDevice[] = DEMO_IOT_DEVICES
    if (tab !== 'all') {
      rows = rows.filter((d) => d.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((d) =>
        [d.device, d.type, d.location].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Devices', value: 0, caption: 'Registered', highlight: true },
    { label: 'Online', value: 0, caption: 'Reporting', tone: 'info' },
    { label: 'Alerts', value: 0, caption: 'Active', tone: 'warning' },
    { label: 'Data Points', value: 0, caption: 'Last 24h' },
  ]

  const columns: Column<IoTDevice>[] = [
    { header: 'Device', cell: (d) => <span className="font-medium text-heading">{d.device}</span> },
    { header: 'Type', cell: (d) => d.type },
    { header: 'Location', cell: (d) => d.location },
    { header: 'Last Report', cell: (d) => d.lastReport },
    { header: 'Status', cell: (d) => <IoTStatusBadge status={d.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Webhook"
        title={t('IoT Dashboard')}
        subtitle={t('Connected sensors and device telemetry')}
      />

      <TabBar tabs={IOT_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Connected Devices')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search devices...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(d) => d.device}
          mobileCard={(d) => (
            <>
              <MobileCardHeader title={d.device} trailing={<IoTStatusBadge status={d.status} />} />
              <MobileCardRow label={t('Type')}>{d.type}</MobileCardRow>
              <MobileCardRow label={t('Location')}>{d.location}</MobileCardRow>
              <MobileCardRow label={t('Last Report')}>{d.lastReport}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Webhook"
              title={t('No IoT devices connected')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Edge Computing ────────────────────────────────────────────────────────────

interface EdgeNode {
  node: string
  location: string
  workloads: number
  load: string
  status: 'online' | 'degraded' | 'offline'
}

const EDGE_TABS = [
  { id: 'all', label: 'All', icon: 'Cpu' },
  { id: 'online', label: 'Online', icon: 'CheckCircle' },
  { id: 'degraded', label: 'Degraded', icon: 'AlertTriangle' },
  { id: 'offline', label: 'Offline', icon: 'XCircle' },
] as const

const DEMO_EDGE_NODES: readonly EdgeNode[] = []

function EdgeStatusBadge({ status }: { status: EdgeNode['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'online':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Online')}
        </Badge>
      )
    case 'degraded':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Degraded')}
        </Badge>
      )
    case 'offline':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Offline')}
        </Badge>
      )
  }
}

export function EdgeComputing() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(EDGE_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly EdgeNode[] = DEMO_EDGE_NODES
    if (tab !== 'all') {
      rows = rows.filter((n) => n.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((n) =>
        [n.node, n.location].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Edge Nodes', value: 0, caption: 'Deployed', highlight: true },
    { label: 'Online', value: 0, caption: 'Healthy', tone: 'info' },
    { label: 'Degraded', value: 0, caption: 'Need attention', tone: 'warning' },
    { label: 'Avg Load', value: '0%', caption: 'Across nodes' },
  ]

  const columns: Column<EdgeNode>[] = [
    { header: 'Node', cell: (n) => <span className="font-medium text-heading">{n.node}</span> },
    { header: 'Location', cell: (n) => n.location },
    { header: 'Workloads', cell: (n) => n.workloads },
    { header: 'Load', cell: (n) => n.load },
    { header: 'Status', cell: (n) => <EdgeStatusBadge status={n.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Cpu"
        title={t('Edge Computing')}
        subtitle={t('On-site compute nodes and workloads')}
      />

      <TabBar tabs={EDGE_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Nodes')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(n) => n.node}
          mobileCard={(n) => (
            <>
              <MobileCardHeader title={n.node} trailing={<EdgeStatusBadge status={n.status} />} />
              <MobileCardRow label={t('Location')}>{n.location}</MobileCardRow>
              <MobileCardRow label={t('Workloads')}>{n.workloads}</MobileCardRow>
              <MobileCardRow label={t('Load')}>{n.load}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Cpu"
              title={t('No edge nodes deployed')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Digital Twin Viewer ───────────────────────────────────────────────────────

interface DigitalTwin {
  twin: string
  asset: string
  sync: string
  health: string
  status: 'live' | 'offline' | 'anomaly'
}

const TWIN_TABS = [
  { id: 'all', label: 'All', icon: 'Copy' },
  { id: 'live', label: 'Live', icon: 'Activity' },
  { id: 'offline', label: 'Offline', icon: 'XCircle' },
  { id: 'anomaly', label: 'Anomalies', icon: 'AlertTriangle' },
] as const

const DEMO_TWINS: readonly DigitalTwin[] = []

function TwinStatusBadge({ status }: { status: DigitalTwin['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'live':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Live')}
        </Badge>
      )
    case 'offline':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Offline')}
        </Badge>
      )
    case 'anomaly':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Anomaly')}
        </Badge>
      )
  }
}

export function DigitalTwinViewer() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(TWIN_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly DigitalTwin[] = DEMO_TWINS
    if (tab !== 'all') {
      rows = rows.filter((tw) => tw.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((tw) =>
        [tw.twin, tw.asset].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Digital Twins', value: 0, caption: 'Modelled', highlight: true },
    { label: 'Live-Synced', value: 0, caption: 'Streaming data', tone: 'info' },
    { label: 'Anomalies', value: 0, caption: 'Detected', tone: 'warning' },
    { label: 'Assets Covered', value: 0, caption: 'With a twin' },
  ]

  const columns: Column<DigitalTwin>[] = [
    { header: 'Twin', cell: (tw) => <span className="font-medium text-heading">{tw.twin}</span> },
    { header: 'Asset', cell: (tw) => tw.asset },
    { header: 'Sync', cell: (tw) => tw.sync },
    { header: 'Health', cell: (tw) => tw.health },
    { header: 'Status', cell: (tw) => <TwinStatusBadge status={tw.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Copy"
        title={t('Digital Twin Viewer')}
        subtitle={t('Virtual replica of vehicles and assets')}
      />

      <TabBar tabs={TWIN_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Digital Twins')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search twins...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(tw) => tw.twin}
          mobileCard={(tw) => (
            <>
              <MobileCardHeader title={tw.twin} trailing={<TwinStatusBadge status={tw.status} />} />
              <MobileCardRow label={t('Asset')}>{tw.asset}</MobileCardRow>
              <MobileCardRow label={t('Sync')}>{tw.sync}</MobileCardRow>
              <MobileCardRow label={t('Health')}>{tw.health}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Copy"
              title={t('No digital twins yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Drone Inspection ──────────────────────────────────────────────────────────

interface DroneInspectionRow {
  reference: string
  target: string
  findings: number
  pilot: string
  when: string
}

const DRONE_TABS = [
  { id: 'all', label: 'All', icon: 'Satellite' },
  { id: 'completed', label: 'Completed', icon: 'CheckCircle' },
  { id: 'in-progress', label: 'In Progress', icon: 'Loader' },
  { id: 'scheduled', label: 'Scheduled', icon: 'Calendar' },
] as const

const DEMO_DRONE_INSPECTIONS: readonly DroneInspectionRow[] = []

export function DroneInspection() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(DRONE_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly DroneInspectionRow[] = DEMO_DRONE_INSPECTIONS
    if (tab !== 'all') {
      rows = rows.filter(() => true)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((d) =>
        [d.reference, d.target, d.pilot].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Inspections', value: 0, caption: 'This month', highlight: true },
    { label: 'Findings', value: 0, caption: 'Raised', tone: 'warning' },
    { label: 'Drones Available', value: 0, caption: 'Ready', tone: 'info' },
    { label: 'Images Captured', value: 0, caption: 'This month' },
  ]

  const columns: Column<DroneInspectionRow>[] = [
    { header: 'Reference', cell: (d) => <span className="font-medium text-heading">{d.reference}</span> },
    { header: 'Target', cell: (d) => d.target },
    { header: 'Findings', cell: (d) => d.findings },
    { header: 'Pilot', cell: (d) => d.pilot },
    { header: 'When', cell: (d) => d.when },
  ]

  return (
    <>
      <FeatureHeader
        icon="Satellite"
        title={t('Drone Inspection')}
        subtitle={t('Aerial and remote vehicle inspection')}
      />

      <TabBar tabs={DRONE_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Recent Inspections')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(d) => d.reference}
          mobileCard={(d) => (
            <>
              <MobileCardHeader title={d.reference} />
              <MobileCardRow label={t('Target')}>{d.target}</MobileCardRow>
              <MobileCardRow label={t('Findings')}>{d.findings}</MobileCardRow>
              <MobileCardRow label={t('Pilot')}>{d.pilot}</MobileCardRow>
              <MobileCardRow label={t('When')}>{d.when}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Satellite"
              title={t('No drone inspections yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── AR Repair Guide ───────────────────────────────────────────────────────────

interface ARGuide {
  guide: string
  vehicle: string
  steps: number
  updated: string
}

const AR_GUIDE_TABS = [
  { id: 'all', label: 'All', icon: 'View' },
  { id: 'published', label: 'Published', icon: 'CheckCircle' },
  { id: 'draft', label: 'Draft', icon: 'FileEdit' },
  { id: 'in-production', label: 'In Production', icon: 'Loader' },
] as const

const DEMO_AR_GUIDES: readonly ARGuide[] = []

export function ARRepairGuide() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(AR_GUIDE_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly ARGuide[] = DEMO_AR_GUIDES
    if (tab !== 'all') {
      rows = rows.filter(() => true)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((g) =>
        [g.guide, g.vehicle].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'AR Guides', value: 0, caption: 'Available', highlight: true },
    { label: 'Sessions Today', value: 0, caption: 'Launched', tone: 'info' },
    { label: 'Vehicles Covered', value: 0, caption: 'Supported' },
    { label: 'Pending Guides', value: 0, caption: 'In production', tone: 'warning' },
  ]

  const columns: Column<ARGuide>[] = [
    { header: 'Guide', cell: (g) => <span className="font-medium text-heading">{g.guide}</span> },
    { header: 'Vehicle', cell: (g) => g.vehicle },
    { header: 'Steps', cell: (g) => g.steps },
    { header: 'Updated', cell: (g) => g.updated },
  ]

  return (
    <>
      <FeatureHeader
        icon="View"
        title={t('AR Repair Guide')}
        subtitle={t('Augmented-reality step-by-step repair guidance')}
      />

      <TabBar tabs={AR_GUIDE_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Guide Library')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search guides...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(g) => g.guide}
          mobileCard={(g) => (
            <>
              <MobileCardHeader title={g.guide} />
              <MobileCardRow label={t('Vehicle')}>{g.vehicle}</MobileCardRow>
              <MobileCardRow label={t('Steps')}>{g.steps}</MobileCardRow>
              <MobileCardRow label={t('Updated')}>{g.updated}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="View"
              title={t('No AR guides available yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── AR Overlay ────────────────────────────────────────────────────────────────

interface AROverlayRow {
  overlay: string
  context: string
  device: string
  status: 'active' | 'inactive' | 'calibration'
}

const AR_OVERLAY_TABS = [
  { id: 'all', label: 'All', icon: 'SwitchCamera' },
  { id: 'active', label: 'Active', icon: 'CheckCircle' },
  { id: 'inactive', label: 'Inactive', icon: 'XCircle' },
  { id: 'calibration', label: 'Calibration', icon: 'Settings' },
] as const

const DEMO_AR_OVERLAYS: readonly AROverlayRow[] = []

function AROverlayStatusBadge({ status }: { status: AROverlayRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'inactive':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Inactive')}
        </Badge>
      )
    case 'calibration':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Calibration')}
        </Badge>
      )
  }
}

export function AROverlay() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(AR_OVERLAY_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly AROverlayRow[] = DEMO_AR_OVERLAYS
    if (tab !== 'all') {
      rows = rows.filter((o) => o.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((o) =>
        [o.overlay, o.context, o.device].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Active Overlays', value: 0, caption: 'Configured', highlight: true },
    { label: 'Devices', value: 0, caption: 'AR-capable', tone: 'info' },
    { label: 'Sessions Today', value: 0, caption: 'Launched' },
    { label: 'Calibration Needed', value: 0, caption: 'Devices', tone: 'warning' },
  ]

  const columns: Column<AROverlayRow>[] = [
    { header: 'Overlay', cell: (o) => <span className="font-medium text-heading">{o.overlay}</span> },
    { header: 'Context', cell: (o) => o.context },
    { header: 'Device', cell: (o) => o.device },
    { header: 'Status', cell: (o) => <AROverlayStatusBadge status={o.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="SwitchCamera"
        title={t('AR Overlay')}
        subtitle={t('Live augmented overlays on the workshop floor')}
      />

      <TabBar tabs={AR_OVERLAY_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Overlays')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(o) => o.overlay}
          mobileCard={(o) => (
            <>
              <MobileCardHeader title={o.overlay} trailing={<AROverlayStatusBadge status={o.status} />} />
              <MobileCardRow label={t('Context')}>{o.context}</MobileCardRow>
              <MobileCardRow label={t('Device')}>{o.device}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="SwitchCamera"
              title={t('No overlays configured')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── VR Showroom ───────────────────────────────────────────────────────────────

interface VRShowroomRow {
  showroom: string
  theme: string
  visits: number
  status: 'published' | 'draft' | 'in-production'
}

const VR_TABS = [
  { id: 'all', label: 'All', icon: 'Store' },
  { id: 'published', label: 'Published', icon: 'CheckCircle' },
  { id: 'draft', label: 'Draft', icon: 'FileEdit' },
  { id: 'in-production', label: 'In Production', icon: 'Loader' },
] as const

const DEMO_VR_SHOWROOMS: readonly VRShowroomRow[] = []

function VRShowroomStatusBadge({ status }: { status: VRShowroomRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'published':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Published')}
        </Badge>
      )
    case 'draft':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Draft')}
        </Badge>
      )
    case 'in-production':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('In Production')}
        </Badge>
      )
  }
}

export function VRShowroom() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(VR_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly VRShowroomRow[] = DEMO_VR_SHOWROOMS
    if (tab !== 'all') {
      rows = rows.filter((s) => s.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((s) =>
        [s.showroom, s.theme].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Showrooms', value: 0, caption: 'Published', highlight: true },
    { label: 'Visits This Month', value: 0, caption: 'Sessions', tone: 'info' },
    { label: 'Leads Generated', value: 0, caption: 'From VR' },
    { label: 'In Production', value: 0, caption: 'Not yet live', tone: 'warning' },
  ]

  const columns: Column<VRShowroomRow>[] = [
    { header: 'Showroom', cell: (s) => <span className="font-medium text-heading">{s.showroom}</span> },
    { header: 'Theme', cell: (s) => s.theme },
    { header: 'Visits', cell: (s) => s.visits },
    { header: 'Status', cell: (s) => <VRShowroomStatusBadge status={s.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Store"
        title={t('VR Showroom')}
        subtitle={t('Immersive virtual showroom experiences')}
      />

      <TabBar tabs={VR_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Showrooms')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(s) => s.showroom}
          mobileCard={(s) => (
            <>
              <MobileCardHeader title={s.showroom} trailing={<VRShowroomStatusBadge status={s.status} />} />
              <MobileCardRow label={t('Theme')}>{s.theme}</MobileCardRow>
              <MobileCardRow label={t('Visits')}>{s.visits}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Store"
              title={t('No VR showrooms yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Blockchain Service History ────────────────────────────────────────────────

interface LedgerRecord {
  record: string
  vehicle: string
  hash: string
  recorded: string
  status: 'verified' | 'pending' | 'failed'
}

const LEDGER_TABS = [
  { id: 'all', label: 'All', icon: 'Link' },
  { id: 'verified', label: 'Verified', icon: 'CheckCircle' },
  { id: 'pending', label: 'Pending', icon: 'Clock' },
  { id: 'failed', label: 'Failed', icon: 'XCircle' },
] as const

const DEMO_LEDGER_RECORDS: readonly LedgerRecord[] = []

function LedgerStatusBadge({ status }: { status: LedgerRecord['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'verified':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Verified')}
        </Badge>
      )
    case 'pending':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Pending')}
        </Badge>
      )
    case 'failed':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Failed')}
        </Badge>
      )
  }
}

export function BlockchainServiceHistory() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(LEDGER_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly LedgerRecord[] = DEMO_LEDGER_RECORDS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.record, r.vehicle, r.hash].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Records On Chain', value: 0, caption: 'Immutable', highlight: true },
    { label: 'Verified', value: 0, caption: 'Confirmed', tone: 'info' },
    { label: 'Pending', value: 0, caption: 'Awaiting confirmation', tone: 'warning' },
    { label: 'Vehicles Covered', value: 0, caption: 'With a chain' },
  ]

  const columns: Column<LedgerRecord>[] = [
    { header: 'Record', cell: (r) => <span className="font-medium text-heading">{r.record}</span> },
    { header: 'Vehicle', cell: (r) => r.vehicle },
    { header: 'Hash', cell: (r) => r.hash },
    { header: 'Recorded', cell: (r) => r.recorded },
    { header: 'Status', cell: (r) => <LedgerStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Link"
        title={t('Blockchain Service History')}
        subtitle={t('Tamper-proof service records on a distributed ledger')}
      />

      <TabBar tabs={LEDGER_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Ledger Records')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search records...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.record}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.record} trailing={<LedgerStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Vehicle')}>{r.vehicle}</MobileCardRow>
              <MobileCardRow label={t('Hash')}>{r.hash}</MobileCardRow>
              <MobileCardRow label={t('Recorded')}>{r.recorded}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Link"
              title={t('No records on chain yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Smart Contracts ───────────────────────────────────────────────────────────

interface SmartContractRow {
  contract: string
  parties: string
  trigger: string
  status: 'active' | 'pending' | 'expired'
}

const CONTRACT_TABS = [
  { id: 'all', label: 'All', icon: 'ScrollText' },
  { id: 'active', label: 'Active', icon: 'CheckCircle' },
  { id: 'pending', label: 'Pending', icon: 'Clock' },
  { id: 'expired', label: 'Expired', icon: 'XCircle' },
] as const

const DEMO_CONTRACTS: readonly SmartContractRow[] = []

function ContractStatusBadge({ status }: { status: SmartContractRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'pending':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Pending')}
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

export function SmartContracts() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(CONTRACT_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly SmartContractRow[] = DEMO_CONTRACTS
    if (tab !== 'all') {
      rows = rows.filter((c) => c.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((c) =>
        [c.contract, c.parties, c.trigger].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Active Contracts', value: 0, caption: 'Deployed', highlight: true },
    { label: 'Executions', value: 0, caption: 'This month', tone: 'info' },
    { label: 'Pending Signatures', value: 0, caption: 'Awaiting parties', tone: 'warning' },
    { label: 'Value Locked', value: 'SAR 0.00', caption: 'In escrow' },
  ]

  const columns: Column<SmartContractRow>[] = [
    { header: 'Contract', cell: (c) => <span className="font-medium text-heading">{c.contract}</span> },
    { header: 'Parties', cell: (c) => c.parties },
    { header: 'Trigger', cell: (c) => c.trigger },
    { header: 'Status', cell: (c) => <ContractStatusBadge status={c.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ScrollText"
        title={t('Smart Contracts')}
        subtitle={t('Automated agreements executed on-chain')}
      />

      <TabBar tabs={CONTRACT_TABS} value={tab} onChange={setTab} />
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
          rowKey={(c) => c.contract}
          mobileCard={(c) => (
            <>
              <MobileCardHeader title={c.contract} trailing={<ContractStatusBadge status={c.status} />} />
              <MobileCardRow label={t('Parties')}>{c.parties}</MobileCardRow>
              <MobileCardRow label={t('Trigger')}>{c.trigger}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="ScrollText"
              title={t('No smart contracts deployed')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Quantum Computing ─────────────────────────────────────────────────────────

interface QuantumJob {
  job: string
  problem: string
  backend: string
  submitted: string
  status: 'running' | 'completed' | 'queued' | 'failed'
}

const QUANTUM_TABS = [
  { id: 'all', label: 'All', icon: 'Cpu' },
  { id: 'running', label: 'Running', icon: 'Loader' },
  { id: 'completed', label: 'Completed', icon: 'CheckCircle' },
  { id: 'failed', label: 'Failed', icon: 'XCircle' },
] as const

const DEMO_QUANTUM_JOBS: readonly QuantumJob[] = []

function QuantumStatusBadge({ status }: { status: QuantumJob['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'running':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Running')}
        </Badge>
      )
    case 'completed':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Completed')}
        </Badge>
      )
    case 'queued':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Queued')}
        </Badge>
      )
    case 'failed':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Failed')}
        </Badge>
      )
  }
}

export function QuantumComputing() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(QUANTUM_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly QuantumJob[] = DEMO_QUANTUM_JOBS
    if (tab !== 'all') {
      rows = rows.filter((j) => j.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((j) =>
        [j.job, j.problem, j.backend].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Jobs Submitted', value: 0, caption: 'This month', highlight: true },
    { label: 'Completed', value: 0, caption: 'Returned', tone: 'info' },
    { label: 'Queued', value: 0, caption: 'Awaiting compute', tone: 'warning' },
    { label: 'Backends', value: 0, caption: 'Available' },
  ]

  const columns: Column<QuantumJob>[] = [
    { header: 'Job', cell: (j) => <span className="font-medium text-heading">{j.job}</span> },
    { header: 'Problem', cell: (j) => j.problem },
    { header: 'Backend', cell: (j) => j.backend },
    { header: 'Submitted', cell: (j) => j.submitted },
    { header: 'Status', cell: (j) => <QuantumStatusBadge status={j.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Cpu"
        title={t('Quantum Computing')}
        subtitle={t('Experimental quantum-assisted optimisation')}
      />

      <TabBar tabs={QUANTUM_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Compute Jobs')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(j) => j.job}
          mobileCard={(j) => (
            <>
              <MobileCardHeader title={j.job} trailing={<QuantumStatusBadge status={j.status} />} />
              <MobileCardRow label={t('Problem')}>{j.problem}</MobileCardRow>
              <MobileCardRow label={t('Backend')}>{j.backend}</MobileCardRow>
              <MobileCardRow label={t('Submitted')}>{j.submitted}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Cpu"
              title={t('No quantum jobs submitted')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Sustainable Energy Monitoring ─────────────────────────────────────────────

interface EnergyMeter {
  meter: string
  location: string
  consumption: string
  status: 'active' | 'offline' | 'alert'
}

const ENERGY_TABS = [
  { id: 'all', label: 'All', icon: 'BatteryCharging' },
  { id: 'active', label: 'Active', icon: 'CheckCircle' },
  { id: 'offline', label: 'Offline', icon: 'XCircle' },
  { id: 'alert', label: 'Alerts', icon: 'AlertTriangle' },
] as const

const DEMO_ENERGY_METERS: readonly EnergyMeter[] = []

function EnergyStatusBadge({ status }: { status: EnergyMeter['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
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

export function SustainableEnergyMonitoring() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(ENERGY_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly EnergyMeter[] = DEMO_ENERGY_METERS
    if (tab !== 'all') {
      rows = rows.filter((m) => m.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((m) =>
        [m.meter, m.location].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Consumption Today', value: '0 kWh', caption: 'Total', highlight: true },
    { label: 'Solar Generated', value: '0 kWh', caption: 'Today', tone: 'info' },
    { label: 'Peak Demand', value: '0 kW', caption: 'Today', tone: 'warning' },
    { label: 'CO2 Avoided', value: '0 kg', caption: 'This month' },
  ]

  const columns: Column<EnergyMeter>[] = [
    { header: 'Meter', cell: (m) => <span className="font-medium text-heading">{m.meter}</span> },
    { header: 'Location', cell: (m) => m.location },
    { header: 'Consumption', cell: (m) => m.consumption },
    { header: 'Status', cell: (m) => <EnergyStatusBadge status={m.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="BatteryCharging"
        title={t('Sustainable Energy Monitoring')}
        subtitle={t('Track energy use and renewable generation')}
      />

      <TabBar tabs={ENERGY_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Metering')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(m) => m.meter}
          mobileCard={(m) => (
            <>
              <MobileCardHeader title={m.meter} trailing={<EnergyStatusBadge status={m.status} />} />
              <MobileCardRow label={t('Location')}>{m.location}</MobileCardRow>
              <MobileCardRow label={t('Consumption')}>{m.consumption}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="BatteryCharging"
              title={t('No energy meters connected')}
            />
          }
        />
      </Section>
    </>
  )
}
