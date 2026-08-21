import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  'On Track': ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Exceeded: ['rgba(10,94,215,.15)', 'var(--salis-blue)'],
  'At Risk': ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
}

export function KPIDashboard() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const [category, setCategory] = useState('All')

  const filtered = category === 'All' ? MOCK_KPIS : MOCK_KPIS.filter(k => k.category === category)
  const onTrack = MOCK_KPIS.filter(k => k.status === 'On Track' || k.status === 'Exceeded').length
  const atRisk = MOCK_KPIS.filter(k => k.status === 'At Risk').length

  const summaryKpis = [
    { label: t('Total KPIs'), value: String(MOCK_KPIS.length), icon: 'Target', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('On Track'), value: String(onTrack), icon: 'CheckCircle', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('At Risk'), value: String(atRisk), icon: 'CircleDot', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Categories'), value: '4', icon: 'Layers', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Target" title={t('KPI Dashboard')} subtitle={t('Business Intelligence')} />
        <div className="grid grid-cols-2 gap-3">
          {summaryKpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {filtered.map(k => {
          const [bg, fg] = STATUS_COLORS[k.status] ?? STATUS_COLORS['At Risk']
          return (
            <MobileCard key={k.id}>
              <MobileCardHeader title={t(k.name)} trailing={<Badge background={bg} color={fg}>{t(k.status)}</Badge>} />
              <MobileCardRow label={t('Category')}>{t(k.category)}</MobileCardRow>
              <MobileCardRow label={t('Value')}>{k.value}</MobileCardRow>
              <MobileCardRow label={t('Target')}>{k.target}</MobileCardRow>
              <MobileCardRow label={t('Trend')}>{k.trend}</MobileCardRow>
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
            <Icon name="Target" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('KPI Dashboard')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Key performance indicators at a glance')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {summaryKpis.map(k => (
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
          <h3 className="text-[15px] font-bold text-heading">{t('Performance Indicators')}</h3>
          <select value={category} onChange={e => setCategory(e.target.value)} aria-label={t('Filter by category')} className="h-9 cursor-pointer rounded border border-border bg-card px-3 text-[13px] text-heading outline-none focus:border-salis-blue">
            <option value="All">{t('All Categories')}</option>
            <option value="Quality">{t('Quality')}</option>
            <option value="Operations">{t('Operations')}</option>
            <option value="Financial">{t('Financial')}</option>
            <option value="Inventory">{t('Inventory')}</option>
            <option value="HR">{t('HR')}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('KPI')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Current')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Target')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 text-end font-medium">{t('Trend')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(k => {
                const [bg, fg] = STATUS_COLORS[k.status] ?? STATUS_COLORS['At Risk']
                return (
                  <tr key={k.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 text-[13px] text-heading">{t(k.name)}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{t(k.category)}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{k.value}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-muted">{k.target}</td>
                    <td className="py-3 pe-4"><Badge background={bg} color={fg}>{t(k.status)}</Badge></td>
                    <td className="py-3 text-end font-mono text-[13px] text-heading">{k.trend}</td>
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
