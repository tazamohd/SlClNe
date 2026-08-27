import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const INCIDENTS = [
  { id: 'INC-001', date: '2026-08-15', type: 'Injury', severity: 'High', location: 'Workshop A', status: 'Investigating', description: 'Technician sustained minor burn during welding' },
  { id: 'INC-002', date: '2026-08-10', type: 'Near Miss', severity: 'Medium', location: 'Paint Bay', status: 'Resolved', description: 'Loose scaffolding detected before use' },
  { id: 'INC-003', date: '2026-08-05', type: 'Property Damage', severity: 'Low', location: 'Parking Area', status: 'Closed', description: 'Minor dent to customer vehicle during wash' },
  { id: 'INC-004', date: '2026-07-28', type: 'Environmental', severity: 'Medium', location: 'Storage Room', status: 'Resolved', description: 'Oil spill contained in designated area' },
  { id: 'INC-005', date: '2026-08-17', type: 'Near Miss', severity: 'Critical', location: 'Lift Bay 3', status: 'Open', description: 'Hydraulic lift pressure drop during operation' },
  { id: 'INC-006', date: '2026-08-12', type: 'Injury', severity: 'Low', location: 'Workshop B', status: 'Investigating', description: 'Slip on wet floor near drainage area' },
] as const

const SEVERITY_PALETTE: Record<string, { bg: string; fg: string }> = {
  Low: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Medium: { bg: 'rgba(245,158,11,.12)', fg: '#B45309' },
  High: { bg: 'rgba(234,88,12,.1)', fg: '#EA580C' },
  Critical: { bg: 'rgba(11,31,59,.12)', fg: '#0B1F3B' },
}

const STATUS_PALETTE: Record<string, { bg: string; fg: string }> = {
  Open: { bg: 'rgba(234,88,12,.1)', fg: '#EA580C' },
  Investigating: { bg: 'rgba(245,158,11,.12)', fg: '#B45309' },
  Resolved: { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  Closed: { bg: 'rgba(100,116,139,.1)', fg: '#64748B' },
}

type IncidentRow = (typeof INCIDENTS)[number]

export function SafetyIncidents() {
  const { t } = usePreferences()

  const openCount = INCIDENTS.filter((i) => i.status === 'Open' || i.status === 'Investigating').length
  const thisMonth = INCIDENTS.filter((i) => i.date >= '2026-08-01').length

  const kpis = [
    { label: t('Total Incidents'), value: String(INCIDENTS.length), icon: 'AlertTriangle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Open'), value: String(openCount), icon: 'AlertCircle', bg: 'rgba(234,88,12,.1)', fg: '#EA580C' },
    { label: t('This Month'), value: String(thisMonth), icon: 'Calendar', bg: 'rgba(245,158,11,.12)', fg: '#B45309' },
    { label: t('Avg Resolution Days'), value: '4.2', icon: 'Clock', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<IncidentRow>[] = [
    { header: 'ID', cell: (inc) => inc.id, code: true },
    { header: 'Date', cell: (inc) => inc.date },
    { header: 'Type', cell: (inc) => t(inc.type) },
    { header: 'Severity', cell: (inc) => <Badge background={SEVERITY_PALETTE[inc.severity].bg} color={SEVERITY_PALETTE[inc.severity].fg}>{t(inc.severity)}</Badge> },
    { header: 'Location', cell: (inc) => inc.location },
    { header: 'Status', cell: (inc) => <Badge background={STATUS_PALETTE[inc.status].bg} color={STATUS_PALETTE[inc.status].fg}>{t(inc.status)}</Badge> },
    { header: 'Description', cell: (inc) => inc.description },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="AlertTriangle" title={t('Safety Incidents')} subtitle={t('Incident log')} />

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Safety incidents log"
        columns={columns}
        rows={[...INCIDENTS]}
        rowKey={(row) => row.id}
        mobileCard={(row) => (
          <>
            <MobileCardHeader title={row.id} code trailing={<Badge background={SEVERITY_PALETTE[row.severity].bg} color={SEVERITY_PALETTE[row.severity].fg}>{t(row.severity)}</Badge>} />
            <MobileCardRow label={t('Date')}>{row.date}</MobileCardRow>
            <MobileCardRow label={t('Type')}>{t(row.type)}</MobileCardRow>
            <MobileCardRow label={t('Status')}>
              <Badge background={STATUS_PALETTE[row.status].bg} color={STATUS_PALETTE[row.status].fg}>{t(row.status)}</Badge>
            </MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
