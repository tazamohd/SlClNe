import { useState } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const MOCK_KPIS = [
  { id: 'KPI-01', name: 'Customer Satisfaction', category: 'Quality', value: '4.6/5', target: '4.5/5', status: 'On Track', trend: '+0.2' },
  { id: 'KPI-02', name: 'First-Time Fix Rate', category: 'Operations', value: '89%', target: '92%', status: 'At Risk', trend: '-1.3%' },
  { id: 'KPI-03', name: 'Revenue Growth', category: 'Financial', value: '12.3%', target: '10%', status: 'Exceeded', trend: '+2.3%' },
  { id: 'KPI-04', name: 'Avg Repair Time', category: 'Operations', value: '3.2 hrs', target: '3.0 hrs', status: 'At Risk', trend: '+0.1 hr' },
  { id: 'KPI-05', name: 'Parts Availability', category: 'Inventory', value: '96%', target: '95%', status: 'On Track', trend: '+1%' },
  { id: 'KPI-06', name: 'Employee Utilization', category: 'HR', value: '82%', target: '85%', status: 'At Risk', trend: '-2%' },
  { id: 'KPI-07', name: 'Net Profit Margin', category: 'Financial', value: '18.4%', target: '17%', status: 'Exceeded', trend: '+1.4%' },
  { id: 'KPI-08', name: 'Return Rate', category: 'Quality', value: '2.1%', target: '3%', status: 'On Track', trend: '-0.5%' },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  'On Track': ['var(--tint-blue)', 'var(--salis-blue)'],
  Exceeded: ['rgba(10,94,215,.15)', 'var(--salis-blue)'],
  'At Risk': ['var(--tint-orange)', 'var(--salis-orange)'],
}

type KPIRow = (typeof MOCK_KPIS)[number]

export function KPIDashboard() {
  const { t } = usePreferences()
  const [category, setCategory] = useState('All')

  const filtered = category === 'All' ? MOCK_KPIS : MOCK_KPIS.filter(k => k.category === category)
  const onTrack = MOCK_KPIS.filter(k => k.status === 'On Track' || k.status === 'Exceeded').length
  const atRisk = MOCK_KPIS.filter(k => k.status === 'At Risk').length

  const summaryKpis = [
    { label: t('Total KPIs'), value: String(MOCK_KPIS.length), icon: 'Target', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('On Track'), value: String(onTrack), icon: 'CheckCircle', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('At Risk'), value: String(atRisk), icon: 'CircleDot', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
    { label: t('Categories'), value: '4', icon: 'Layers', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<KPIRow>[] = [
    { header: 'KPI', cell: (k) => t(k.name) },
    { header: 'Category', cell: (k) => t(k.category) },
    { header: 'Current', cell: (k) => k.value },
    { header: 'Target', cell: (k) => k.target },
    { header: 'Status', cell: (k) => { const [bg, fg] = STATUS_COLORS[k.status] ?? STATUS_COLORS['At Risk']; return <Badge background={bg} color={fg}>{t(k.status)}</Badge> } },
    { header: 'Trend', cell: (k) => k.trend },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Target" title={t('KPI Dashboard')} subtitle={t('Key performance indicators at a glance')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {summaryKpis.map(k => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-heading">{t('Performance Indicators')}</h2>
        <Select value={category} onChange={e => setCategory(e.target.value)} aria-label={t('Filter by category')}>
          <option value="All">{t('All Categories')}</option>
          <option value="Quality">{t('Quality')}</option>
          <option value="Operations">{t('Operations')}</option>
          <option value="Financial">{t('Financial')}</option>
          <option value="Inventory">{t('Inventory')}</option>
          <option value="HR">{t('HR')}</option>
        </Select>
      </div>
      <DataTable
        caption="Key performance indicators"
        columns={columns}
        rows={[...filtered]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_COLORS[row.status] ?? STATUS_COLORS['At Risk']
          return (
            <>
              <MobileCardHeader title={t(row.name)} trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow label={t('Category')}>{t(row.category)}</MobileCardRow>
              <MobileCardRow label={t('Value')}>{row.value}</MobileCardRow>
              <MobileCardRow label={t('Trend')}>{row.trend}</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
