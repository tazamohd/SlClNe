import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const MOCK_STANDARDS = [
  { id: 'ISO-9001', name: 'Quality Management System', version: '2015', status: 'Certified', lastAudit: '2026-03-15', nextAudit: '2027-03-15', auditor: 'Bureau Veritas', score: 92 },
  { id: 'ISO-14001', name: 'Environmental Management', version: '2015', status: 'Certified', lastAudit: '2026-01-20', nextAudit: '2027-01-20', auditor: 'TÜV SÜD', score: 88 },
  { id: 'ISO-45001', name: 'Occupational Health & Safety', version: '2018', status: 'In Progress', lastAudit: '2025-11-10', nextAudit: '2026-11-10', auditor: 'SGS', score: 75 },
  { id: 'ISO-27001', name: 'Information Security', version: '2022', status: 'Planned', lastAudit: '—', nextAudit: '2027-06-01', auditor: '—', score: 0 },
  { id: 'ISO-50001', name: 'Energy Management', version: '2018', status: 'Certified', lastAudit: '2026-05-08', nextAudit: '2027-05-08', auditor: 'DNV', score: 85 },
  { id: 'IATF-16949', name: 'Automotive Quality', version: '2016', status: 'Certified', lastAudit: '2026-02-28', nextAudit: '2027-02-28', auditor: 'Lloyd\'s Register', score: 90 },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Certified: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  'In Progress': ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Planned: ['rgba(100,116,139,.1)', '#64748B'],
}

export function ISOQualityManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? MOCK_STANDARDS : MOCK_STANDARDS.filter(s => s.status === filter)
  const certified = MOCK_STANDARDS.filter(s => s.status === 'Certified').length
  const avgScore = Math.round(MOCK_STANDARDS.filter(s => s.score > 0).reduce((a, s) => a + s.score, 0) / MOCK_STANDARDS.filter(s => s.score > 0).length)

  const kpis = [
    { label: t('Total Standards'), value: String(MOCK_STANDARDS.length), icon: 'Award', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Certified'), value: String(certified), icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Avg Score'), value: `${avgScore}%`, icon: 'BarChart3', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Next Audit'), value: '2026-11', icon: 'Calendar', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Award" title={t('ISO Quality')} subtitle={t('Compliance')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {filtered.map(s => {
          const [bg, fg] = STATUS_COLORS[s.status] ?? STATUS_COLORS.Planned
          return (
            <MobileCard key={s.id}>
              <MobileCardHeader title={s.id} code trailing={<Badge background={bg} color={fg}>{t(s.status)}</Badge>} />
              <MobileCardRow>{t(s.name)}</MobileCardRow>
              <MobileCardRow label={t('Version')}>{s.version}</MobileCardRow>
              <MobileCardRow label={t('Score')}>{s.score > 0 ? `${s.score}%` : '—'}</MobileCardRow>
              <MobileCardRow label={t('Next Audit')}>{s.nextAudit}</MobileCardRow>
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
            <Icon name="Award" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('ISO Quality Management')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Standards certification and audit tracking')}</p>
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
          <h3 className="text-[15px] font-bold text-heading">{t('Standards & Certifications')}</h3>
          <Select value={filter} onChange={e => setFilter(e.target.value)} aria-label={t('Filter by status')}>
            <option value="All">{t('All')}</option>
            <option value="Certified">{t('Certified')}</option>
            <option value="In Progress">{t('In Progress')}</option>
            <option value="Planned">{t('Planned')}</option>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Standard')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Name')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Version')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Score')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Auditor')}</th>
                <th className="pb-3 text-start font-medium">{t('Next Audit')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const [bg, fg] = STATUS_COLORS[s.status] ?? STATUS_COLORS.Planned
                return (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 font-mono text-[13px] text-heading" dir="ltr">{s.id}</td>
                    <td className="py-3 pe-4 text-[13px] text-body">{t(s.name)}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{s.version}</td>
                    <td className="py-3 pe-4"><Badge background={bg} color={fg}>{t(s.status)}</Badge></td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{s.score > 0 ? `${s.score}%` : '—'}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{s.auditor}</td>
                    <td className="py-3 text-[13px] text-muted" dir="ltr">{s.nextAudit}</td>
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
