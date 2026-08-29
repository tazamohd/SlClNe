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

// ── 1. Compliance Management ───────────────────────────────────────────────

interface ComplianceRow {
  requirement: string
  owner: string
  due: string
  evidence: string
  status: 'compliant' | 'due-soon' | 'overdue'
}

const COMPLIANCE_TABS = [
  { id: 'all', label: 'All', icon: 'ClipboardCheck' },
  { id: 'compliant', label: 'Compliant', icon: 'CheckCircle' },
  { id: 'due-soon', label: 'Due Soon', icon: 'AlertCircle' },
  { id: 'overdue', label: 'Overdue', icon: 'Clock' },
] as const

const DEMO_COMPLIANCE: readonly ComplianceRow[] = []

function ComplianceStatusBadge({ status }: { status: ComplianceRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'compliant':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Compliant')}
        </Badge>
      )
    case 'due-soon':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Due Soon')}
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

export function ComplianceManagement() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(COMPLIANCE_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly ComplianceRow[] = DEMO_COMPLIANCE
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.requirement, r.owner].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Obligations', value: 0, caption: 'Tracked', highlight: true },
    { label: 'Compliant', value: 0, caption: 'Up to date', tone: 'info' },
    { label: 'Due Soon', value: 0, caption: 'Action needed', tone: 'warning' },
    { label: 'Overdue', value: 0, caption: 'Past due', tone: 'warning' },
  ]

  const columns: Column<ComplianceRow>[] = [
    { header: 'Requirement', cell: (r) => r.requirement },
    { header: 'Owner', cell: (r) => r.owner },
    { header: 'Due', cell: (r) => r.due },
    { header: 'Evidence', cell: (r) => r.evidence },
    { header: 'Status', cell: (r) => <ComplianceStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ClipboardCheck"
        title={t('Compliance Management')}
        subtitle={t('Track regulatory obligations and evidence')}
      />

      <TabBar tabs={COMPLIANCE_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Compliance Register')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search compliance...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.requirement}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.requirement} trailing={<ComplianceStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Owner')}>{r.owner}</MobileCardRow>
              <MobileCardRow label={t('Due')}>{r.due}</MobileCardRow>
              <MobileCardRow label={t('Evidence')}>{r.evidence}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="ClipboardCheck"
              title={t('No compliance items tracked yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ── 2. ZATCA Settings ──────────────────────────────────────────────────────

interface ZATCARow {
  setting: string
  value: string
}

const ZATCA_TABS = [
  { id: 'settings', label: 'Settings', icon: 'FileCheck' },
  { id: 'cleared', label: 'Cleared Invoices', icon: 'CheckCircle' },
  { id: 'rejected', label: 'Rejected', icon: 'AlertCircle' },
  { id: 'activity', label: 'Activity Log', icon: 'Clock' },
] as const

const DEMO_ZATCA: readonly ZATCARow[] = []

export function ZATCASettings() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(ZATCA_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly ZATCARow[] = DEMO_ZATCA
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.setting, r.value].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [query])

  const stats: Stat[] = [
    { label: 'Integration', value: 'Not Connected', caption: 'ZATCA portal', highlight: true },
    { label: 'Invoices Cleared', value: 0, caption: 'This month', tone: 'info' },
    { label: 'Rejected', value: 0, caption: 'Need correction', tone: 'warning' },
    { label: 'Phase', value: 'Phase 2', caption: 'Integration' },
  ]

  const columns: Column<ZATCARow>[] = [
    { header: 'Setting', cell: (r) => r.setting },
    { header: 'Value', cell: (r) => r.value },
  ]

  return (
    <>
      <FeatureHeader
        icon="FileCheck"
        title={t('ZATCA Settings')}
        subtitle={t('E-invoicing compliance for the ZATCA mandate')}
      />

      <TabBar tabs={ZATCA_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Configuration')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.setting}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.setting} />
              <MobileCardRow label={t('Value')}>{r.value}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="FileCheck"
              title={t('ZATCA settings appear here')}
            />
          }
        />
      </Section>
    </>
  )
}

// ── 3. VAT Settings ────────────────────────────────────────────────────────

interface VATRow {
  code: string
  description: string
  rate: string
  status: 'active' | 'inactive'
}

const VAT_TABS = [
  { id: 'codes', label: 'Tax Codes', icon: 'Percent' },
  { id: 'returns', label: 'Returns', icon: 'FileText' },
  { id: 'adjustments', label: 'Adjustments', icon: 'Settings' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
] as const

const DEMO_VAT: readonly VATRow[] = []

function VATStatusBadge({ status }: { status: VATRow['status'] }) {
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
  }
}

export function VATSettings() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(VAT_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly VATRow[] = DEMO_VAT
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.code, r.description].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [query])

  const stats: Stat[] = [
    { label: 'Standard Rate', value: '15%', caption: 'Applied by default', highlight: true },
    { label: 'Tax Codes', value: 0, caption: 'Configured', tone: 'info' },
    { label: 'VAT Collected', value: 'SAR 0.00', caption: 'This period' },
    { label: 'Next Return', value: '—', caption: 'Filing due', tone: 'warning' },
  ]

  const columns: Column<VATRow>[] = [
    { header: 'Code', cell: (r) => r.code },
    { header: 'Description', cell: (r) => r.description },
    { header: 'Rate', cell: (r) => r.rate },
    { header: 'Status', cell: (r) => <VATStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Percent"
        title={t('VAT Settings')}
        subtitle={t('Value-added tax rates and reporting')}
      />

      <TabBar tabs={VAT_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Tax Codes')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.code}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.code} trailing={<VATStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Description')}>{r.description}</MobileCardRow>
              <MobileCardRow label={t('Rate')}>{r.rate}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Percent"
              title={t('No tax codes configured yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ── 4. Zakat Settings ──────────────────────────────────────────────────────

interface ZakatRow {
  setting: string
  value: string
}

const ZAKAT_TABS = [
  { id: 'configuration', label: 'Configuration', icon: 'Landmark' },
  { id: 'calculations', label: 'Calculations', icon: 'Calculator' },
  { id: 'filings', label: 'Filings', icon: 'FileText' },
  { id: 'history', label: 'History', icon: 'Clock' },
] as const

const DEMO_ZAKAT: readonly ZakatRow[] = []

export function ZakatSettings() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(ZAKAT_TABS[0].id)
  const [query, _setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly ZakatRow[] = DEMO_ZAKAT
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.setting, r.value].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [query])

  const stats: Stat[] = [
    { label: 'Zakat Base', value: 'SAR 0.00', caption: 'Current period', highlight: true },
    { label: 'Rate', value: '2.5%', caption: 'Applied', tone: 'info' },
    { label: 'Estimated Zakat', value: 'SAR 0.00', caption: 'This year' },
    { label: 'Next Filing', value: '—', caption: 'Due', tone: 'warning' },
  ]

  const columns: Column<ZakatRow>[] = [
    { header: 'Setting', cell: (r) => r.setting },
    { header: 'Value', cell: (r) => r.value },
  ]

  return (
    <>
      <FeatureHeader
        icon="Landmark"
        title={t('Zakat Settings')}
        subtitle={t('Zakat calculation base and reporting')}
      />

      <TabBar tabs={ZAKAT_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section title={t('Configuration')}>
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.setting}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.setting} />
              <MobileCardRow label={t('Value')}>{r.value}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Landmark"
              title={t('Zakat settings appear here')}
            />
          }
        />
      </Section>
    </>
  )
}

// ── 5. Safety Incidents ────────────────────────────────────────────────────

interface SafetyRow {
  reference: string
  type: string
  severity: string
  reported: string
  status: 'open' | 'investigating' | 'closed'
}

const SAFETY_TABS = [
  { id: 'all', label: 'All', icon: 'ShieldAlert' },
  { id: 'open', label: 'Open', icon: 'AlertCircle' },
  { id: 'investigating', label: 'Under Investigation', icon: 'Search' },
  { id: 'closed', label: 'Closed', icon: 'CheckCircle' },
] as const

const DEMO_SAFETY: readonly SafetyRow[] = []

function SafetyStatusBadge({ status }: { status: SafetyRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'open':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Open')}
        </Badge>
      )
    case 'investigating':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Investigating')}
        </Badge>
      )
    case 'closed':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Closed')}
        </Badge>
      )
  }
}

export function SafetyIncidents() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(SAFETY_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly SafetyRow[] = DEMO_SAFETY
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.reference, r.type, r.severity].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Open Incidents', value: 0, caption: 'Under investigation', highlight: true, tone: 'warning' },
    { label: 'This Month', value: 0, caption: 'Reported', tone: 'info' },
    { label: 'Days Since Last', value: 0, caption: 'Incident-free' },
    { label: 'Corrective Actions', value: 0, caption: 'Outstanding', tone: 'warning' },
  ]

  const columns: Column<SafetyRow>[] = [
    { header: 'Reference', cell: (r) => r.reference },
    { header: 'Type', cell: (r) => r.type },
    { header: 'Severity', cell: (r) => r.severity },
    { header: 'Reported', cell: (r) => r.reported },
    { header: 'Status', cell: (r) => <SafetyStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="ShieldAlert"
        title={t('Safety Incidents')}
        subtitle={t('Report and track workplace safety incidents')}
      />

      <TabBar tabs={SAFETY_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Incidents')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search incidents...')}
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
              <MobileCardHeader title={r.reference} trailing={<SafetyStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Type')}>{r.type}</MobileCardRow>
              <MobileCardRow label={t('Severity')}>{r.severity}</MobileCardRow>
              <MobileCardRow label={t('Reported')}>{r.reported}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="ShieldAlert"
              title={t('No safety incidents reported')}
            />
          }
        />
      </Section>
    </>
  )
}

// ── 6. Environmental Compliance ────────────────────────────────────────────

interface EnvironmentalRow {
  item: string
  type: string
  due: string
  owner: string
  status: 'active' | 'expiring' | 'action-required'
}

const ENVIRONMENTAL_TABS = [
  { id: 'all', label: 'All', icon: 'Wind' },
  { id: 'active', label: 'Active', icon: 'CheckCircle' },
  { id: 'expiring', label: 'Expiring', icon: 'AlertCircle' },
  { id: 'actions', label: 'Actions', icon: 'ListChecks' },
] as const

const DEMO_ENVIRONMENTAL: readonly EnvironmentalRow[] = []

function EnvironmentalStatusBadge({ status }: { status: EnvironmentalRow['status'] }) {
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
    case 'action-required':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Action Required')}
        </Badge>
      )
  }
}

export function EnvironmentalCompliance() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(ENVIRONMENTAL_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly EnvironmentalRow[] = DEMO_ENVIRONMENTAL
    if (tab !== 'all') {
      const statusMap: Record<string, EnvironmentalRow['status'][]> = {
        active: ['active'],
        expiring: ['expiring'],
        actions: ['action-required'],
      }
      const statuses = statusMap[tab] ?? []
      rows = rows.filter((r) => statuses.includes(r.status))
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.item, r.type, r.owner].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Permits', value: 0, caption: 'Active', highlight: true },
    { label: 'Expiring Soon', value: 0, caption: 'Within 60 days', tone: 'warning' },
    { label: 'Waste Logged', value: 0, caption: 'Records this month', tone: 'info' },
    { label: 'Open Actions', value: 0, caption: 'Outstanding' },
  ]

  const columns: Column<EnvironmentalRow>[] = [
    { header: 'Item', cell: (r) => r.item },
    { header: 'Type', cell: (r) => r.type },
    { header: 'Due', cell: (r) => r.due },
    { header: 'Owner', cell: (r) => r.owner },
    { header: 'Status', cell: (r) => <EnvironmentalStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="Wind"
        title={t('Environmental Compliance')}
        subtitle={t('Waste handling, emissions and disposal records')}
      />

      <TabBar tabs={ENVIRONMENTAL_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Compliance Records')}
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
          rowKey={(r) => r.item}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.item} trailing={<EnvironmentalStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Type')}>{r.type}</MobileCardRow>
              <MobileCardRow label={t('Due')}>{r.due}</MobileCardRow>
              <MobileCardRow label={t('Owner')}>{r.owner}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="Wind"
              title={t('No environmental records yet')}
            />
          }
        />
      </Section>
    </>
  )
}

// ── 7. ISO Quality Management ──────────────────────────────────────────────

interface ISORow {
  reference: string
  area: string
  raised: string
  owner: string
  status: 'open' | 'in-progress' | 'closed'
}

const ISO_TABS = [
  { id: 'nc', label: 'Non-Conformities', icon: 'BadgeCheck' },
  { id: 'documents', label: 'Documents', icon: 'FileText' },
  { id: 'audits', label: 'Audits', icon: 'ClipboardCheck' },
  { id: 'capa', label: 'CAPA', icon: 'ListChecks' },
] as const

const DEMO_ISO: readonly ISORow[] = []

function ISOStatusBadge({ status }: { status: ISORow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'open':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Open')}
        </Badge>
      )
    case 'in-progress':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('In Progress')}
        </Badge>
      )
    case 'closed':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Closed')}
        </Badge>
      )
  }
}

export function ISOQualityManagement() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(ISO_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly ISORow[] = DEMO_ISO
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.reference, r.area, r.owner].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [query])

  const stats: Stat[] = [
    { label: 'Controlled Documents', value: 0, caption: 'In the QMS', highlight: true },
    { label: 'Open Non-Conformities', value: 0, caption: 'To resolve', tone: 'warning' },
    { label: 'Audits This Year', value: 0, caption: 'Completed', tone: 'info' },
    { label: 'Next Audit', value: '—', caption: 'Scheduled' },
  ]

  const columns: Column<ISORow>[] = [
    { header: 'Reference', cell: (r) => r.reference },
    { header: 'Area', cell: (r) => r.area },
    { header: 'Raised', cell: (r) => r.raised },
    { header: 'Owner', cell: (r) => r.owner },
    { header: 'Status', cell: (r) => <ISOStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="BadgeCheck"
        title={t('ISO Quality Management')}
        subtitle={t('Manage the quality management system and audits')}
      />

      <TabBar tabs={ISO_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Non-Conformities')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search non-conformities...')}
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
              <MobileCardHeader title={r.reference} trailing={<ISOStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Area')}>{r.area}</MobileCardRow>
              <MobileCardRow label={t('Raised')}>{r.raised}</MobileCardRow>
              <MobileCardRow label={t('Owner')}>{r.owner}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="BadgeCheck"
              title={t('No open non-conformities')}
            />
          }
        />
      </Section>
    </>
  )
}

// ── 8. Equipment Calibration ───────────────────────────────────────────────

interface CalibrationRow {
  equipment: string
  serial: string
  lastCalibrated: string
  due: string
  status: 'calibrated' | 'due-soon' | 'overdue'
}

const CALIBRATION_TABS = [
  { id: 'all', label: 'All', icon: 'SlidersHorizontal' },
  { id: 'calibrated', label: 'Calibrated', icon: 'CheckCircle' },
  { id: 'due-soon', label: 'Due Soon', icon: 'AlertCircle' },
  { id: 'overdue', label: 'Overdue', icon: 'Clock' },
] as const

const DEMO_CALIBRATION: readonly CalibrationRow[] = []

function CalibrationStatusBadge({ status }: { status: CalibrationRow['status'] }) {
  const { t } = usePreferences()
  switch (status) {
    case 'calibrated':
      return (
        <Badge background="rgba(10,94,215,.1)" color="#0A5ED7">
          {t('Calibrated')}
        </Badge>
      )
    case 'due-soon':
      return (
        <Badge background="rgba(249,115,22,.1)" color="#F97316">
          {t('Due Soon')}
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

export function EquipmentCalibration() {
  const { t } = usePreferences()
  const [tab, setTab] = useState<string>(CALIBRATION_TABS[0].id)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let rows: readonly CalibrationRow[] = DEMO_CALIBRATION
    if (tab !== 'all') {
      rows = rows.filter((r) => r.status === tab)
    }
    const needle = query.trim().toLowerCase()
    if (needle) {
      rows = rows.filter((r) =>
        [r.equipment, r.serial].some((f) => f.toLowerCase().includes(needle)),
      )
    }
    return rows
  }, [tab, query])

  const stats: Stat[] = [
    { label: 'Equipment', value: 0, caption: 'Tracked', highlight: true },
    { label: 'Calibrated', value: 0, caption: 'In date', tone: 'info' },
    { label: 'Due Soon', value: 0, caption: 'Within 30 days', tone: 'warning' },
    { label: 'Overdue', value: 0, caption: 'Out of calibration', tone: 'warning' },
  ]

  const columns: Column<CalibrationRow>[] = [
    { header: 'Equipment', cell: (r) => r.equipment },
    { header: 'Serial', cell: (r) => r.serial },
    { header: 'Last Calibrated', cell: (r) => r.lastCalibrated },
    { header: 'Due', cell: (r) => r.due },
    { header: 'Status', cell: (r) => <CalibrationStatusBadge status={r.status} /> },
  ]

  return (
    <>
      <FeatureHeader
        icon="SlidersHorizontal"
        title={t('Equipment Calibration')}
        subtitle={t('Track calibration schedules for workshop equipment')}
      />

      <TabBar tabs={CALIBRATION_TABS} value={tab} onChange={setTab} />
      <StatRow stats={stats} />

      <Section
        title={t('Equipment')}
        toolbar={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={t('Search equipment...')}
            className="w-full sm:w-[280px]"
          />
        }
      >
        <DataTable
          className="border-0 shadow-none"
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.equipment}
          mobileCard={(r) => (
            <>
              <MobileCardHeader title={r.equipment} trailing={<CalibrationStatusBadge status={r.status} />} />
              <MobileCardRow label={t('Serial')}>{r.serial}</MobileCardRow>
              <MobileCardRow label={t('Last Calibrated')}>{r.lastCalibrated}</MobileCardRow>
              <MobileCardRow label={t('Due')}>{r.due}</MobileCardRow>
            </>
          )}
          empty={
            <EmptyState
              icon="SlidersHorizontal"
              title={t('No equipment tracked yet')}
            />
          }
        />
      </Section>
    </>
  )
}
