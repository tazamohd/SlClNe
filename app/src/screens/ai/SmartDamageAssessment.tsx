import { useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const MOCK_ASSESSMENTS = [
  { id: 'DA-001', vehicle: '2024 Toyota Camry', plate: 'ABC 1234', severity: 'Major', area: 'Front bumper & hood', confidence: 94, estimatedCost: 'SAR 8,500', status: 'Reviewed', date: '2026-08-17' },
  { id: 'DA-002', vehicle: '2023 Honda Civic', plate: 'DEF 5678', severity: 'Minor', area: 'Rear quarter panel', confidence: 97, estimatedCost: 'SAR 1,200', status: 'Pending', date: '2026-08-17' },
  { id: 'DA-003', vehicle: '2022 Nissan Altima', plate: 'GHI 9012', severity: 'Moderate', area: 'Driver door & mirror', confidence: 91, estimatedCost: 'SAR 3,800', status: 'Reviewed', date: '2026-08-16' },
  { id: 'DA-004', vehicle: '2024 Kia Sportage', plate: 'JKL 3456', severity: 'Major', area: 'Roof & windshield', confidence: 88, estimatedCost: 'SAR 12,000', status: 'Escalated', date: '2026-08-16' },
  { id: 'DA-005', vehicle: '2023 Hyundai Sonata', plate: 'MNO 7890', severity: 'Minor', area: 'Rear bumper scratch', confidence: 98, estimatedCost: 'SAR 650', status: 'Reviewed', date: '2026-08-15' },
  { id: 'DA-006', vehicle: '2021 Lexus RX', plate: 'PQR 2345', severity: 'Moderate', area: 'Fender & headlight', confidence: 92, estimatedCost: 'SAR 5,200', status: 'Pending', date: '2026-08-15' },
] as const

const SEVERITY_COLORS: Record<string, readonly [string, string]> = {
  Major: ['var(--tint-orange)', 'var(--salis-orange)'],
  Moderate: ['var(--tint-blue)', 'var(--salis-blue)'],
  Minor: ['var(--tint-neutral)', 'var(--text-muted)'],
}

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Reviewed: ['var(--tint-blue)', 'var(--salis-blue)'],
  Pending: ['var(--tint-orange)', 'var(--salis-orange)'],
  Escalated: ['var(--tint-neutral)', 'var(--text-muted)'],
}

type AssessmentRow = (typeof MOCK_ASSESSMENTS)[number]

export function SmartDamageAssessment() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? MOCK_ASSESSMENTS : MOCK_ASSESSMENTS.filter(a => a.severity === filter)
  const avgConfidence = Math.round(MOCK_ASSESSMENTS.reduce((a, d) => a + d.confidence, 0) / MOCK_ASSESSMENTS.length)

  const kpis = [
    { label: t('Assessments'), value: String(MOCK_ASSESSMENTS.length), icon: 'ScanEye', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Major Cases'), value: String(MOCK_ASSESSMENTS.filter(a => a.severity === 'Major').length), icon: 'CircleDot', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Avg Confidence'), value: `${avgConfidence}%`, icon: 'Target', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Pending Review'), value: String(MOCK_ASSESSMENTS.filter(a => a.status === 'Pending').length), icon: 'Clock', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<AssessmentRow>[] = [
    { header: 'Vehicle', cell: (a) => a.vehicle },
    { header: 'Plate', cell: (a) => a.plate, code: true },
    { header: 'Severity', cell: (a) => { const [bg, fg] = SEVERITY_COLORS[a.severity] ?? SEVERITY_COLORS.Minor; return <Badge background={bg} color={fg}>{t(a.severity)}</Badge> } },
    { header: 'Damage Area', cell: (a) => t(a.area) },
    { header: 'Confidence', cell: (a) => `${a.confidence}%` },
    { header: 'Est. Cost', cell: (a) => a.estimatedCost },
    { header: 'Status', cell: (a) => { const [bg, fg] = STATUS_COLORS[a.status] ?? STATUS_COLORS.Pending; return <Badge background={bg} color={fg}>{t(a.status)}</Badge> } },
    { header: 'Date', cell: (a) => a.date },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="ScanEye" title={t('Smart Damage Assessment')} subtitle={t('AI-powered damage detection and cost estimation')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-heading">{t('Damage Assessments')}</h3>
        <Select value={filter} onChange={e => setFilter(e.target.value)} aria-label={t('Filter by severity')}>
          <option value="All">{t('All')}</option>
          <option value="Major">{t('Major')}</option>
          <option value="Moderate">{t('Moderate')}</option>
          <option value="Minor">{t('Minor')}</option>
        </Select>
      </div>
      <DataTable
        caption="Damage assessment results"
        columns={columns}
        rows={[...filtered]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = SEVERITY_COLORS[row.severity] ?? SEVERITY_COLORS.Minor
          return (
            <>
              <MobileCardHeader title={row.vehicle} trailing={<Badge background={bg} color={fg}>{t(row.severity)}</Badge>} />
              <MobileCardRow label={t('Damage Area')}>{t(row.area)}</MobileCardRow>
              <MobileCardRow label={t('Confidence')}>{row.confidence}%</MobileCardRow>
              <MobileCardRow label={t('Est. Cost')}>{row.estimatedCost}</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
