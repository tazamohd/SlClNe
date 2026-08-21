import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const MOCK_ASSESSMENTS = [
  { id: 'DA-001', vehicle: '2024 Toyota Camry', plate: 'ABC 1234', severity: 'Major', area: 'Front bumper & hood', confidence: 94, estimatedCost: 'SAR 8,500', status: 'Reviewed', date: '2026-08-17' },
  { id: 'DA-002', vehicle: '2023 Honda Civic', plate: 'DEF 5678', severity: 'Minor', area: 'Rear quarter panel', confidence: 97, estimatedCost: 'SAR 1,200', status: 'Pending', date: '2026-08-17' },
  { id: 'DA-003', vehicle: '2022 Nissan Altima', plate: 'GHI 9012', severity: 'Moderate', area: 'Driver door & mirror', confidence: 91, estimatedCost: 'SAR 3,800', status: 'Reviewed', date: '2026-08-16' },
  { id: 'DA-004', vehicle: '2024 Kia Sportage', plate: 'JKL 3456', severity: 'Major', area: 'Roof & windshield', confidence: 88, estimatedCost: 'SAR 12,000', status: 'Escalated', date: '2026-08-16' },
  { id: 'DA-005', vehicle: '2023 Hyundai Sonata', plate: 'MNO 7890', severity: 'Minor', area: 'Rear bumper scratch', confidence: 98, estimatedCost: 'SAR 650', status: 'Reviewed', date: '2026-08-15' },
  { id: 'DA-006', vehicle: '2021 Lexus RX', plate: 'PQR 2345', severity: 'Moderate', area: 'Fender & headlight', confidence: 92, estimatedCost: 'SAR 5,200', status: 'Pending', date: '2026-08-15' },
] as const

const SEVERITY_COLORS: Record<string, readonly [string, string]> = {
  Major: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Moderate: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Minor: ['rgba(100,116,139,.1)', '#64748B'],
}

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Reviewed: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Pending: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Escalated: ['rgba(100,116,139,.1)', '#64748B'],
}

export function SmartDamageAssessment() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? MOCK_ASSESSMENTS : MOCK_ASSESSMENTS.filter(a => a.severity === filter)
  const avgConfidence = Math.round(MOCK_ASSESSMENTS.reduce((a, d) => a + d.confidence, 0) / MOCK_ASSESSMENTS.length)

  const kpis = [
    { label: t('Assessments'), value: String(MOCK_ASSESSMENTS.length), icon: 'ScanEye', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Major Cases'), value: String(MOCK_ASSESSMENTS.filter(a => a.severity === 'Major').length), icon: 'CircleDot', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Avg Confidence'), value: `${avgConfidence}%`, icon: 'Target', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Pending Review'), value: String(MOCK_ASSESSMENTS.filter(a => a.status === 'Pending').length), icon: 'Clock', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="ScanEye" title={t('Damage Assessment')} subtitle={t('AI Detection')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {filtered.map(a => {
          const [bg, fg] = SEVERITY_COLORS[a.severity] ?? SEVERITY_COLORS.Minor
          return (
            <MobileCard key={a.id}>
              <MobileCardHeader title={a.vehicle} trailing={<Badge background={bg} color={fg}>{t(a.severity)}</Badge>} />
              <MobileCardRow label={t('Plate')}>{a.plate}</MobileCardRow>
              <MobileCardRow label={t('Damage Area')}>{t(a.area)}</MobileCardRow>
              <MobileCardRow label={t('Confidence')}>{a.confidence}%</MobileCardRow>
              <MobileCardRow label={t('Est. Cost')}>{a.estimatedCost}</MobileCardRow>
              <MobileCardRow label={t('Date')}>{a.date}</MobileCardRow>
            </MobileCard>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" />
          <div className="relative flex rounded-2xl bg-salis-gradient p-3 text-white shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]">
            <Icon name="ScanEye" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Smart Damage Assessment')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('AI-powered damage detection and cost estimation')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 className="mt-2 font-display text-2xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-heading">{t('Damage Assessments')}</h3>
          <select value={filter} onChange={e => setFilter(e.target.value)} aria-label={t('Filter by severity')} className="h-9 cursor-pointer rounded border border-border bg-card px-3 text-[13px] text-heading outline-none focus:border-salis-blue">
            <option value="All">{t('All')}</option>
            <option value="Major">{t('Major')}</option>
            <option value="Moderate">{t('Moderate')}</option>
            <option value="Minor">{t('Minor')}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Vehicle')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Plate')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Severity')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Damage Area')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Confidence')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Est. Cost')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 text-start font-medium">{t('Date')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const [sevBg, sevFg] = SEVERITY_COLORS[a.severity] ?? SEVERITY_COLORS.Minor
                const [stBg, stFg] = STATUS_COLORS[a.status] ?? STATUS_COLORS.Pending
                return (
                  <tr key={a.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 text-[13px] text-heading">{a.vehicle}</td>
                    <td className="py-3 pe-4 font-mono text-[13px] text-muted" dir="ltr">{a.plate}</td>
                    <td className="py-3 pe-4"><Badge background={sevBg} color={sevFg}>{t(a.severity)}</Badge></td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{t(a.area)}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{a.confidence}%</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{a.estimatedCost}</td>
                    <td className="py-3 pe-4"><Badge background={stBg} color={stFg}>{t(a.status)}</Badge></td>
                    <td className="py-3 text-[13px] text-muted" dir="ltr">{a.date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
