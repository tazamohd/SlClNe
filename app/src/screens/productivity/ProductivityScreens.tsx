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

interface TaskRow {
  task: string
  assignee: string
  priority: string
  due: string
  status: 'open' | 'in-progress' | 'completed' | 'overdue'
}

const TASK_TABS = [
  { id: 'all', label: 'All', icon: 'ListChecks' },
  { id: 'my', label: 'My Tasks', icon: 'User' },
  { id: 'due-today', label: 'Due Today', icon: 'Clock' },
  { id: 'completed', label: 'Completed', icon: 'CheckCircle' },
] as const

const DEMO_TASKS: readonly TaskRow[] = []

function TaskStatusBadge({ status }: { status: TaskRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'open':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Open')}
        </Badge>
      )
    case 'in-progress':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('In Progress')}
        </Badge>
      )
    case 'completed':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Completed')}
        </Badge>
      )
    case 'overdue':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Overdue')}
        </Badge>
      )
  }
}

export function Tasks() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(TASK_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly TaskRow[] = DEMO_TASKS
    if (tab === 'completed') {
      rows = rows.filter((r) => r.status === 'completed')
    } else if (tab !== 'all') {
      rows = rows.filter((r) => r.status === 'open' || r.status === 'in-progress')
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.task, r.assignee, r.priority].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Open Tasks', value: 0, caption: 'To do', highlight: true },
    { label: 'Due Today', value: 0, caption: 'Time-sensitive', tone: 'warning' },
    { label: 'In Progress', value: 0, caption: 'Being worked', tone: 'info' },
    { label: 'Completed', value: 0, caption: 'This week' },
  ]

  const columns: Column<TaskRow>[] = [
    { header: 'Task', cell: (r) => <span className="font-medium text-heading">{r.task}</span> },
    { header: 'Assignee', cell: (r) => r.assignee },
    { header: 'Priority', cell: (r) => r.priority },
    { header: 'Due', cell: (r) => r.due },
    { header: 'Status', cell: (r) => <TaskStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ListChecks"
        title={t('Tasks')}
        subtitle={t('Your to-do list across the business')}
      />

      <TabBar tabs={TASK_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Task List')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search tasks...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.task}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.task} trailing={<TaskStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Assignee')}>{r.assignee}</MobileCardRow>
              <MobileCardRow label={t('Priority')}>{r.priority}</MobileCardRow>
              <MobileCardRow label={t('Due')}>{r.due}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="ListChecks"
              title={t('No tasks yet')}
            />
          }
        />
      </Section>
    </>
  )
}

interface TaskMgmtRow {
  task: string
  assignee: string
  project: string
  due: string
  status: 'open' | 'in-progress' | 'completed' | 'overdue'
}

const TASK_MGMT_TABS = [
  { id: 'all', label: 'All', icon: 'ClipboardList' },
  { id: 'open', label: 'Open', icon: 'Circle' },
  { id: 'in-progress', label: 'In Progress', icon: 'Clock' },
  { id: 'completed', label: 'Completed', icon: 'CheckCircle' },
] as const

const DEMO_TASK_MGMT: readonly TaskMgmtRow[] = []

function TaskMgmtStatusBadge({ status }: { status: TaskMgmtRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'open':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Open')}
        </Badge>
      )
    case 'in-progress':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('In Progress')}
        </Badge>
      )
    case 'completed':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Completed')}
        </Badge>
      )
    case 'overdue':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Overdue')}
        </Badge>
      )
  }
}

export function TaskManagement() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(TASK_MGMT_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly TaskMgmtRow[] = DEMO_TASK_MGMT
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.task, r.assignee, r.project].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Open Tasks', value: 0, caption: 'Across the team', highlight: true },
    { label: 'Overdue', value: 0, caption: 'Past due', tone: 'warning' },
    { label: 'In Progress', value: 0, caption: 'Being worked', tone: 'info' },
    { label: 'Completed', value: 0, caption: 'This week' },
  ]

  const columns: Column<TaskMgmtRow>[] = [
    { header: 'Task', cell: (r) => <span className="font-medium text-heading">{r.task}</span> },
    { header: 'Assignee', cell: (r) => r.assignee },
    { header: 'Project', cell: (r) => r.project },
    { header: 'Due', cell: (r) => r.due },
    { header: 'Status', cell: (r) => <TaskMgmtStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ClipboardList"
        title={t('Task Management')}
        subtitle={t('Assign, track and prioritise team tasks')}
      />

      <TabBar tabs={TASK_MGMT_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('All Tasks')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search tasks...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.task}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.task} trailing={<TaskMgmtStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Assignee')}>{r.assignee}</MobileCardRow>
              <MobileCardRow label={t('Project')}>{r.project}</MobileCardRow>
              <MobileCardRow label={t('Due')}>{r.due}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="ClipboardList"
              title={t('No tasks yet')}
            />
          }
        />
      </Section>
    </>
  )
}

interface ToolRow {
  tool: string
  category: string
  description: string
}

const TOOL_TABS = [
  { id: 'all', label: 'All', icon: 'Hammer' },
  { id: 'pinned', label: 'Pinned', icon: 'Pin' },
  { id: 'recent', label: 'Recent', icon: 'Clock' },
  { id: 'updates', label: 'Updates', icon: 'RefreshCw' },
] as const

const DEMO_TOOLS: readonly ToolRow[] = []

export function Tools() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(TOOL_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly ToolRow[] = DEMO_TOOLS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.category.toLowerCase().includes(tab))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.tool, r.category, r.description].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Available Tools', value: 0, caption: 'In this workspace', highlight: true },
    { label: 'Recently Used', value: 0, caption: 'This week', tone: 'info' },
    { label: 'Pinned', value: 0, caption: 'Favourites' },
    { label: 'Updates', value: 0, caption: 'Available', tone: 'warning' },
  ]

  const columns: Column<ToolRow>[] = [
    { header: 'Tool', cell: (r) => <span className="font-medium text-heading">{r.tool}</span> },
    { header: 'Category', cell: (r) => r.category },
    { header: 'Description', cell: (r) => r.description },
  ]

  return (
    <>
      <FeatureHeader
        icon="Hammer"
        title={t('Tools')}
        subtitle={t('Utilities and shortcuts for the workshop')}
      />

      <TabBar tabs={TOOL_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Toolbox')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search tools...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.tool}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.tool} />
              <MobileCardRow label={t('Category')}>{r.category}</MobileCardRow>
              <MobileCardRow label={t('Description')}>{r.description}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Hammer"
              title={t('No tools available yet')}
            />
          }
        />
      </Section>
    </>
  )
}

interface WidgetRow {
  widget: string
  dataSource: string
  size: string
  status: 'active' | 'available' | 'pinned' | 'unconfigured'
}

const WIDGET_TABS = [
  { id: 'active', label: 'Active', icon: 'LayoutGrid' },
  { id: 'available', label: 'Available', icon: 'Plus' },
  { id: 'pinned', label: 'Pinned', icon: 'Pin' },
  { id: 'all', label: 'All', icon: 'List' },
] as const

const DEMO_WIDGETS: readonly WidgetRow[] = []

function WidgetStatusBadge({ status }: { status: WidgetRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'available':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Available')}
        </Badge>
      )
    case 'pinned':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Pinned')}
        </Badge>
      )
    case 'unconfigured':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Unconfigured')}
        </Badge>
      )
  }
}

export function DashboardWidgets() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(WIDGET_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly WidgetRow[] = DEMO_WIDGETS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.widget, r.dataSource, r.size].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Active Widgets', value: 0, caption: 'On your dashboard', highlight: true },
    { label: 'Available', value: 0, caption: 'To add', tone: 'info' },
    { label: 'Pinned', value: 0, caption: 'Always shown' },
    { label: 'Needs Data Source', value: 0, caption: 'Unconfigured', tone: 'warning' },
  ]

  const columns: Column<WidgetRow>[] = [
    { header: 'Widget', cell: (r) => <span className="font-medium text-heading">{r.widget}</span> },
    { header: 'Data Source', cell: (r) => r.dataSource },
    { header: 'Size', cell: (r) => r.size },
    { header: 'Status', cell: (r) => <WidgetStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="LayoutGrid"
        title={t('Dashboard Widgets')}
        subtitle={t('Configure the widgets shown on your dashboard')}
      />

      <TabBar tabs={WIDGET_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Widgets')}
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.widget}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.widget} trailing={<WidgetStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Data Source')}>{r.dataSource}</MobileCardRow>
              <MobileCardRow label={t('Size')}>{r.size}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="LayoutGrid"
              title={t('No widgets configured yet')}
            />
          }
        />
      </Section>
    </>
  )
}

interface GuideRow {
  guide: string
  category: string
  updated: string
}

const GUIDE_TABS = [
  { id: 'all', label: 'All', icon: 'BookOpen' },
  { id: 'bookmarked', label: 'Bookmarked', icon: 'Bookmark' },
  { id: 'recent', label: 'Recent', icon: 'Clock' },
  { id: 'needs-review', label: 'Needs Review', icon: 'AlertCircle' },
] as const

const DEMO_GUIDES: readonly GuideRow[] = []

export function SalesGuide() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(GUIDE_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly GuideRow[] = DEMO_GUIDES
    if (tab !== 'all') {
      rows = rows.filter((r) => r.category.toLowerCase().includes(tab))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.guide, r.category].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Guides', value: 0, caption: 'Available', highlight: true },
    { label: 'Updated This Month', value: 0, caption: 'Refreshed', tone: 'info' },
    { label: 'Bookmarked', value: 0, caption: 'Saved by you' },
    { label: 'Needs Review', value: 0, caption: 'Stale content', tone: 'warning' },
  ]

  const columns: Column<GuideRow>[] = [
    { header: 'Guide', cell: (r) => <span className="font-medium text-heading">{r.guide}</span> },
    { header: 'Category', cell: (r) => r.category },
    { header: 'Updated', cell: (r) => r.updated },
  ]

  return (
    <>
      <FeatureHeader
        icon="BookOpen"
        title={t('Sales Guide')}
        subtitle={t('Playbooks and scripts for service advisors')}
      />

      <TabBar tabs={GUIDE_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Guides')}
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
          rowKey={(r) => r.guide}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.guide} />
              <MobileCardRow label={t('Category')}>{r.category}</MobileCardRow>
              <MobileCardRow label={t('Updated')}>{r.updated}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="BookOpen"
              title={t('No sales guides available yet')}
            />
          }
        />
      </Section>
    </>
  )
}

interface SignageRow {
  screen: string
  location: string
  nowPlaying: string
  status: 'online' | 'offline' | 'scheduled'
}

const SIGNAGE_TABS = [
  { id: 'all', label: 'All', icon: 'Tablet' },
  { id: 'online', label: 'Online', icon: 'Wifi' },
  { id: 'offline', label: 'Offline', icon: 'WifiOff' },
  { id: 'scheduled', label: 'Playlists', icon: 'ListVideo' },
] as const

const DEMO_SIGNAGE: readonly SignageRow[] = []

function SignageStatusBadge({ status }: { status: SignageRow['status'] }) {
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
    case 'scheduled':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Scheduled')}
        </Badge>
      )
  }
}

export function DigitalSignage() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(SIGNAGE_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly SignageRow[] = DEMO_SIGNAGE
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.screen, r.location, r.nowPlaying].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Screens', value: 0, caption: 'Registered', highlight: true },
    { label: 'Online', value: 0, caption: 'Displaying', tone: 'info' },
    { label: 'Offline', value: 0, caption: 'No signal', tone: 'warning' },
    { label: 'Playlists', value: 0, caption: 'Scheduled' },
  ]

  const columns: Column<SignageRow>[] = [
    { header: 'Screen', cell: (r) => <span className="font-medium text-heading">{r.screen}</span> },
    { header: 'Location', cell: (r) => r.location },
    { header: 'Now Playing', cell: (r) => r.nowPlaying },
    { header: 'Status', cell: (r) => <SignageStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Tablet"
        title={t('Digital Signage')}
        subtitle={t('Manage screens and content across locations')}
      />

      <TabBar tabs={SIGNAGE_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Screens')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search screens...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.screen}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.screen} trailing={<SignageStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Location')}>{r.location}</MobileCardRow>
              <MobileCardRow label={t('Now Playing')}>{r.nowPlaying}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Tablet"
              title={t('No screens registered yet')}
            />
          }
        />
      </Section>
    </>
  )
}
