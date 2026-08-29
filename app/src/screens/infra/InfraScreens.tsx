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

// ─── Security Cameras ──────────────────────────────────────────────────────────

interface CameraRow {
  camera: string
  location: string
  lastEvent: string
  status: 'online' | 'offline' | 'alert'
}

const CAMERA_TABS = [
  { id: 'all', label: 'All', icon: 'Camera' },
  { id: 'online', label: 'Online', icon: 'Wifi' },
  { id: 'offline', label: 'Offline', icon: 'WifiOff' },
  { id: 'alerts', label: 'Alerts', icon: 'AlertCircle' },
] as const

const DEMO_CAMERAS: readonly CameraRow[] = []

function CameraStatusBadge({ status }: { status: CameraRow['status'] }) {
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

export function SecurityCameras() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(CAMERA_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly CameraRow[] = DEMO_CAMERAS
    if (tab !== 'all') {
      const mapped = tab === 'alerts' ? 'alert' : tab
      rows = rows.filter((r) => r.status === mapped)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.camera, r.location].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Cameras', value: 0, caption: 'Installed', highlight: true },
    { label: 'Online', value: 0, caption: 'Streaming', tone: 'info' },
    { label: 'Offline', value: 0, caption: 'No signal', tone: 'warning' },
    { label: 'Motion Events', value: 0, caption: 'Last 24h' },
  ]

  const columns: Column<CameraRow>[] = [
    { header: 'Camera', cell: (r) => <span className="font-medium text-heading">{r.camera}</span> },
    { header: 'Location', cell: (r) => r.location },
    { header: 'Last Event', cell: (r) => r.lastEvent },
    { header: 'Status', cell: (r) => <CameraStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Camera"
        title={t('Security Cameras')}
        subtitle={t('Live feeds and recorded footage across the site')}
      />

      <TabBar tabs={CAMERA_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Cameras')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search cameras...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.camera}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.camera} trailing={<CameraStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Location')}>{r.location}</MobileCardRow>
              <MobileCardRow label={t('Last Event')}>{r.lastEvent}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Camera"
              title={t('No cameras configured')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Mobile Device Management ──────────────────────────────────────────────────

interface MDMRow {
  device: string
  assignedTo: string
  os: string
  lastSeen: string
  status: 'compliant' | 'non-compliant' | 'lost'
}

const MDM_TABS = [
  { id: 'all', label: 'All', icon: 'Smartphone' },
  { id: 'compliant', label: 'Compliant', icon: 'CheckCircle' },
  { id: 'non-compliant', label: 'Non-Compliant', icon: 'AlertCircle' },
  { id: 'lost', label: 'Lost', icon: 'SearchX' },
] as const

const DEMO_MDM: readonly MDMRow[] = []

function MDMStatusBadge({ status }: { status: MDMRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'compliant':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Compliant')}
        </Badge>
      )
    case 'non-compliant':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Non-Compliant')}
        </Badge>
      )
    case 'lost':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Lost')}
        </Badge>
      )
  }
}

export function MobileDeviceManagement() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(MDM_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly MDMRow[] = DEMO_MDM
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.device, r.assignedTo, r.os].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Enrolled Devices', value: 0, caption: 'Managed', highlight: true },
    { label: 'Compliant', value: 0, caption: 'Policy met', tone: 'info' },
    { label: 'Non-Compliant', value: 0, caption: 'Action needed', tone: 'warning' },
    { label: 'Lost / Stolen', value: 0, caption: 'Locked' },
  ]

  const columns: Column<MDMRow>[] = [
    { header: 'Device', cell: (r) => <span className="font-medium text-heading">{r.device}</span> },
    { header: 'Assigned To', cell: (r) => r.assignedTo },
    { header: 'OS', cell: (r) => r.os },
    { header: 'Last Seen', cell: (r) => r.lastSeen },
    { header: 'Status', cell: (r) => <MDMStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Smartphone"
        title={t('Mobile Device Management')}
        subtitle={t('Enrol and manage company mobile devices')}
      />

      <TabBar tabs={MDM_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Devices')}
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
          rowKey={(r) => r.device}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.device} trailing={<MDMStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Assigned To')}>{r.assignedTo}</MobileCardRow>
              <MobileCardRow label={t('OS')}>{r.os}</MobileCardRow>
              <MobileCardRow label={t('Last Seen')}>{r.lastSeen}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Smartphone"
              title={t('No devices enrolled yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Document Management ───────────────────────────────────────────────────────

interface DocRow {
  name: string
  type: string
  owner: string
  modified: string
  status: 'active' | 'shared' | 'expiring' | 'archived'
}

const DOC_TABS = [
  { id: 'all', label: 'All', icon: 'FileText' },
  { id: 'shared', label: 'Shared', icon: 'Share2' },
  { id: 'expiring', label: 'Expiring', icon: 'Clock' },
  { id: 'archived', label: 'Archived', icon: 'Archive' },
] as const

const DEMO_DOCS: readonly DocRow[] = []

function DocStatusBadge({ status }: { status: DocRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'active':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Active')}
        </Badge>
      )
    case 'shared':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Shared')}
        </Badge>
      )
    case 'expiring':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Expiring')}
        </Badge>
      )
    case 'archived':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Archived')}
        </Badge>
      )
  }
}

export function DocumentManagement() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(DOC_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly DocRow[] = DEMO_DOCS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.name, r.type, r.owner].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Documents', value: 0, caption: 'Stored', highlight: true },
    { label: 'Shared', value: 0, caption: 'With others', tone: 'info' },
    { label: 'Expiring Soon', value: 0, caption: 'Need renewal', tone: 'warning' },
    { label: 'Storage Used', value: '0 MB', caption: 'Of quota' },
  ]

  const columns: Column<DocRow>[] = [
    { header: 'Name', cell: (r) => <span className="font-medium text-heading">{r.name}</span> },
    { header: 'Type', cell: (r) => r.type },
    { header: 'Owner', cell: (r) => r.owner },
    { header: 'Modified', cell: (r) => r.modified },
    { header: 'Status', cell: (r) => <DocStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="FileText"
        title={t('Document Management')}
        subtitle={t('Store, organise and share business documents')}
      />

      <TabBar tabs={DOC_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Documents')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search documents...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.name}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.name} trailing={<DocStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Type')}>{r.type}</MobileCardRow>
              <MobileCardRow label={t('Owner')}>{r.owner}</MobileCardRow>
              <MobileCardRow label={t('Modified')}>{r.modified}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="FileText"
              title={t('No documents uploaded yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Document OCR ──────────────────────────────────────────────────────────────

interface OCRRow {
  document: string
  type: string
  fields: number
  confidence: string
  status: 'processed' | 'needs-review' | 'failed'
}

const OCR_TABS = [
  { id: 'all', label: 'All', icon: 'FileType' },
  { id: 'processed', label: 'Processed', icon: 'CheckCircle' },
  { id: 'needs-review', label: 'Needs Review', icon: 'AlertCircle' },
  { id: 'failed', label: 'Failed', icon: 'XCircle' },
] as const

const DEMO_OCR: readonly OCRRow[] = []

function OCRStatusBadge({ status }: { status: OCRRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'processed':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Processed')}
        </Badge>
      )
    case 'needs-review':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Needs Review')}
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

export function DocumentOCR() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(OCR_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly OCRRow[] = DEMO_OCR
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.document, r.type].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Documents Processed', value: 0, caption: 'This month', highlight: true },
    { label: 'Auto-Extracted', value: 0, caption: 'No review needed', tone: 'info' },
    { label: 'Needs Review', value: 0, caption: 'Low confidence', tone: 'warning' },
    { label: 'Avg Confidence', value: '0%', caption: 'Extraction' },
  ]

  const columns: Column<OCRRow>[] = [
    { header: 'Document', cell: (r) => <span className="font-medium text-heading">{r.document}</span> },
    { header: 'Type', cell: (r) => r.type },
    { header: 'Fields', cell: (r) => r.fields },
    { header: 'Confidence', cell: (r) => r.confidence },
    { header: 'Status', cell: (r) => <OCRStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="FileType"
        title={t('Document OCR')}
        subtitle={t('Extract text and data from scanned documents')}
      />

      <TabBar tabs={OCR_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Processed Documents')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.document}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.document} trailing={<OCRStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Type')}>{r.type}</MobileCardRow>
              <MobileCardRow label={t('Fields')}>{r.fields}</MobileCardRow>
              <MobileCardRow label={t('Confidence')}>{r.confidence}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="FileType"
              title={t('No documents processed yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Data Import / Export ──────────────────────────────────────────────────────

interface ImportExportRow {
  job: string
  type: string
  records: number
  started: string
  status: 'completed' | 'running' | 'failed'
}

const IE_TABS = [
  { id: 'all', label: 'All', icon: 'ArrowRightLeft' },
  { id: 'imports', label: 'Imports', icon: 'Download' },
  { id: 'exports', label: 'Exports', icon: 'Upload' },
  { id: 'failed', label: 'Failed', icon: 'XCircle' },
] as const

const DEMO_IE: readonly ImportExportRow[] = []

function IEStatusBadge({ status }: { status: ImportExportRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'completed':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Completed')}
        </Badge>
      )
    case 'running':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Running')}
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

export function DataImportExport() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(IE_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly ImportExportRow[] = DEMO_IE
    if (tab === 'failed') {
      rows = rows.filter((r) => r.status === 'failed')
    } else if (tab === 'imports') {
      rows = rows.filter((r) => r.type.toLowerCase().includes('import'))
    } else if (tab === 'exports') {
      rows = rows.filter((r) => r.type.toLowerCase().includes('export'))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.job, r.type].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Jobs This Month', value: 0, caption: 'Import & export', highlight: true },
    { label: 'Completed', value: 0, caption: 'Succeeded', tone: 'info' },
    { label: 'Failed', value: 0, caption: 'Need attention', tone: 'warning' },
    { label: 'Records Processed', value: 0, caption: 'This month' },
  ]

  const columns: Column<ImportExportRow>[] = [
    { header: 'Job', cell: (r) => <span className="font-medium text-heading">{r.job}</span> },
    { header: 'Type', cell: (r) => r.type },
    { header: 'Records', cell: (r) => r.records },
    { header: 'Started', cell: (r) => r.started },
    { header: 'Status', cell: (r) => <IEStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ArrowRightLeft"
        title={t('Data Import / Export')}
        subtitle={t('Bulk import and export of business data')}
      />

      <TabBar tabs={IE_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Jobs')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.job}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.job} trailing={<IEStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Type')}>{r.type}</MobileCardRow>
              <MobileCardRow label={t('Records')}>{r.records}</MobileCardRow>
              <MobileCardRow label={t('Started')}>{r.started}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="ArrowRightLeft"
              title={t('No import or export jobs yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ─── Data Backup ───────────────────────────────────────────────────────────────

interface BackupRow {
  backup: string
  type: string
  size: string
  taken: string
  status: 'completed' | 'scheduled' | 'failed'
}

const BACKUP_TABS = [
  { id: 'all', label: 'All', icon: 'Database' },
  { id: 'completed', label: 'Completed', icon: 'CheckCircle' },
  { id: 'scheduled', label: 'Scheduled', icon: 'Clock' },
  { id: 'failed', label: 'Failed', icon: 'XCircle' },
] as const

const DEMO_BACKUPS: readonly BackupRow[] = []

function BackupStatusBadge({ status }: { status: BackupRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'completed':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Completed')}
        </Badge>
      )
    case 'scheduled':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Scheduled')}
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

export function DataBackup() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(BACKUP_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly BackupRow[] = DEMO_BACKUPS
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.backup, r.type].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Last Backup', value: '—', caption: 'Most recent', highlight: true },
    { label: 'Restore Points', value: 0, caption: 'Available', tone: 'info' },
    { label: 'Failed Backups', value: 0, caption: 'This month', tone: 'warning' },
    { label: 'Storage Used', value: '0 GB', caption: 'Of quota' },
  ]

  const columns: Column<BackupRow>[] = [
    { header: 'Backup', cell: (r) => <span className="font-medium text-heading">{r.backup}</span> },
    { header: 'Type', cell: (r) => r.type },
    { header: 'Size', cell: (r) => r.size },
    { header: 'Taken', cell: (r) => r.taken },
    { header: 'Status', cell: (r) => <BackupStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Database"
        title={t('Data Backup')}
        subtitle={t('Scheduled backups and restore points')}
      />

      <TabBar tabs={BACKUP_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Backup History')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.backup}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.backup} trailing={<BackupStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Type')}>{r.type}</MobileCardRow>
              <MobileCardRow label={t('Size')}>{r.size}</MobileCardRow>
              <MobileCardRow label={t('Taken')}>{r.taken}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Database"
              title={t('No backups taken yet')}
            />
          }
        />
      </Section>
    </>
  )
}
