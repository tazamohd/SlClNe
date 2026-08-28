import { useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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
  Calibrated: ['var(--tint-blue)', 'var(--salis-blue)'],
  'Due Soon': ['var(--tint-orange)', 'var(--salis-orange)'],
  Overdue: ['var(--tint-orange)', '#F97316'],
}

type EquipmentRow = (typeof MOCK_EQUIPMENT)[number]

export function EquipmentCalibration() {
  const { t } = usePreferences()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? MOCK_EQUIPMENT : MOCK_EQUIPMENT.filter(e => e.status === filter)
  const calibrated = MOCK_EQUIPMENT.filter(e => e.status === 'Calibrated').length
  const dueSoon = MOCK_EQUIPMENT.filter(e => e.status === 'Due Soon').length
  const overdue = MOCK_EQUIPMENT.filter(e => e.status === 'Overdue').length

  const kpis = [
    { label: t('Total Equipment'), value: String(MOCK_EQUIPMENT.length), icon: 'Ruler', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Calibrated'), value: String(calibrated), icon: 'CheckCircle', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Due Soon'), value: String(dueSoon), icon: 'Clock', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Overdue'), value: String(overdue), icon: 'AlertTriangle', bg: 'var(--tint-orange)', fg: '#F97316' },
  ]

  const columns: Column<EquipmentRow>[] = [
    { header: 'ID', cell: (eq) => eq.id, code: true },
    { header: 'Equipment', cell: (eq) => eq.name },
    { header: 'Category', cell: (eq) => t(eq.category) },
    { header: 'Accuracy', cell: (eq) => eq.accuracy },
    { header: 'Status', cell: (eq) => { const [bg, fg] = STATUS_COLORS[eq.status] ?? STATUS_COLORS.Calibrated; return <Badge background={bg} color={fg}>{t(eq.status)}</Badge> } },
    { header: 'Last Cal.', cell: (eq) => eq.lastCalibration },
    { header: 'Next Cal.', cell: (eq) => eq.nextCalibration },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Ruler" title={t('Equipment Calibration')} subtitle={t('Calibration tracking and scheduling')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-heading">{t('Equipment Register')}</h3>
        <Select value={filter} onChange={e => setFilter(e.target.value)} aria-label={t('Filter by status')}>
          <option value="All">{t('All')}</option>
          <option value="Calibrated">{t('Calibrated')}</option>
          <option value="Due Soon">{t('Due Soon')}</option>
          <option value="Overdue">{t('Overdue')}</option>
        </Select>
      </div>
      <DataTable
        caption="Equipment calibration register"
        columns={columns}
        rows={[...filtered]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_COLORS[row.status] ?? STATUS_COLORS.Calibrated
          return (
            <>
              <MobileCardHeader title={row.id} code trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow>{row.name}</MobileCardRow>
              <MobileCardRow label={t('Category')}>{t(row.category)}</MobileCardRow>
              <MobileCardRow label={t('Next Calibration')}>{row.nextCalibration}</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
