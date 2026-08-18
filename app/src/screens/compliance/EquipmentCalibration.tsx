import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const MOCK_EQUIPMENT = [
  { id: 'EQ-001', name: 'Torque Wrench Set', category: 'Mechanical', lastCalibration: '2026-06-15', nextCalibration: '2026-12-15', status: 'Calibrated', accuracy: '±0.5%', technician: 'Ahmed K.' },
  { id: 'EQ-002', name: 'OBD-II Scanner Pro', category: 'Diagnostic', lastCalibration: '2026-05-20', nextCalibration: '2026-11-20', status: 'Calibrated', accuracy: '±0.1%', technician: 'Fahad M.' },
  { id: 'EQ-003', name: 'Wheel Alignment System', category: 'Alignment', lastCalibration: '2026-07-01', nextCalibration: '2026-10-01', status: 'Due Soon', accuracy: '±0.02°', technician: 'Khalid S.' },
  { id: 'EQ-004', name: 'Brake Tester', category: 'Safety', lastCalibration: '2026-04-10', nextCalibration: '2026-10-10', status: 'Due Soon', accuracy: '±1.0%', technician: 'Omar R.' },
  { id: 'EQ-005', name: 'Emission Analyzer', category: 'Environmental', lastCalibration: '2026-03-01', nextCalibration: '2026-09-01', status: 'Overdue', accuracy: '±2.0%', technician: '—' },
  { id: 'EQ-006', name: 'Tire Pressure Gauge Set', category: 'Mechanical', lastCalibration: '2026-07-20', nextCalibration: '2027-01-20', status: 'Calibrated', accuracy: '±0.5 PSI', technician: 'Saeed A.' },
  { id: 'EQ-007', name: 'Battery Load Tester', category: 'Electrical', lastCalibration: '2026-06-05', nextCalibration: '2026-12-05', status: 'Calibrated', accuracy: '±1.0%', technician: 'Ahmed K.' },
  { id: 'EQ-008', name: 'AC Refrigerant Scale', category: 'HVAC', lastCalibration: '2026-02-15', nextCalibration: '2026-08-15', status: 'Overdue', accuracy: '±5g', technician: '—' },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Calibrated: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  'Due Soon': ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Overdue: ['rgba(239,68,68,.1)', '#EF4444'],
}

export function EquipmentCalibration() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? MOCK_EQUIPMENT : MOCK_EQUIPMENT.filter(e => e.status === filter)
  const calibrated = MOCK_EQUIPMENT.filter(e => e.status === 'Calibrated').length
  const dueSoon = MOCK_EQUIPMENT.filter(e => e.status === 'Due Soon').length
  const overdue = MOCK_EQUIPMENT.filter(e => e.status === 'Overdue').length

  const kpis = [
    { label: t('Total Equipment'), value: String(MOCK_EQUIPMENT.length), icon: 'Ruler', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Calibrated'), value: String(calibrated), icon: 'CheckCircle', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Due Soon'), value: String(dueSoon), icon: 'Clock', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Overdue'), value: String(overdue), icon: 'AlertTriangle', bg: 'rgba(239,68,68,.1)', fg: '#EF4444' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Ruler" title={t('Calibration')} subtitle={t('Compliance')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {filtered.map(eq => {
          const [bg, fg] = STATUS_COLORS[eq.status] ?? STATUS_COLORS.Calibrated
          return (
            <MobileCard key={eq.id}>
              <MobileCardHeader title={eq.id} code trailing={<Badge background={bg} color={fg}>{t(eq.status)}</Badge>} />
              <MobileCardRow>{eq.name}</MobileCardRow>
              <MobileCardRow label={t('Category')}>{t(eq.category)}</MobileCardRow>
              <MobileCardRow label={t('Accuracy')}>{eq.accuracy}</MobileCardRow>
              <MobileCardRow label={t('Next Calibration')}>{eq.nextCalibration}</MobileCardRow>
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
            <Icon name="Ruler" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Equipment Calibration')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Calibration tracking and scheduling')}</p>
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
          <h3 className="text-[15px] font-bold text-heading">{t('Equipment Register')}</h3>
          <select value={filter} onChange={e => setFilter(e.target.value)} aria-label={t('Filter by status')} className="h-9 cursor-pointer rounded border border-border bg-card px-3 text-[13px] text-heading outline-none focus:border-salis-blue">
            <option value="All">{t('All')}</option>
            <option value="Calibrated">{t('Calibrated')}</option>
            <option value="Due Soon">{t('Due Soon')}</option>
            <option value="Overdue">{t('Overdue')}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('ID')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Equipment')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Accuracy')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Last Cal.')}</th>
                <th className="pb-3 text-start font-medium">{t('Next Cal.')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(eq => {
                const [bg, fg] = STATUS_COLORS[eq.status] ?? STATUS_COLORS.Calibrated
                return (
                  <tr key={eq.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 font-mono text-[13px] text-heading" dir="ltr">{eq.id}</td>
                    <td className="py-3 pe-4 text-[13px] font-medium text-heading">{eq.name}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{t(eq.category)}</td>
                    <td className="py-3 pe-4 font-mono text-[13px] text-muted" dir="ltr">{eq.accuracy}</td>
                    <td className="py-3 pe-4"><Badge background={bg} color={fg}>{t(eq.status)}</Badge></td>
                    <td className="py-3 pe-4 text-[13px] text-muted" dir="ltr">{eq.lastCalibration}</td>
                    <td className="py-3 text-[13px] text-muted" dir="ltr">{eq.nextCalibration}</td>
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
