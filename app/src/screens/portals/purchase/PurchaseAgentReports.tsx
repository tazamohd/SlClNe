import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { usePreferences } from '@/providers/PreferencesProvider'
import { PageHeader } from '@/components/ui/PageHeader'

interface ProcurementReport {
  title: string
  period: string
  type: 'Spend Analysis' | 'Supplier Performance' | 'Inventory Turnover' | 'Cost Savings' | 'Compliance'
  generatedDate: string
  value: string
  trend: 'Up' | 'Down' | 'Stable'
}

const REPORTS: ProcurementReport[] = [
  { title: 'Monthly Spend Summary', period: 'Jul 2026', type: 'Spend Analysis', generatedDate: 'Aug 02, 2026', value: '284,500 SAR', trend: 'Up' },
  { title: 'Supplier Scorecard Q2', period: 'Q2 2026', type: 'Supplier Performance', generatedDate: 'Jul 15, 2026', value: '4.2 Avg Rating', trend: 'Up' },
  { title: 'Inventory Turnover Rate', period: 'Jul 2026', type: 'Inventory Turnover', generatedDate: 'Aug 01, 2026', value: '6.8x', trend: 'Stable' },
  { title: 'Cost Savings Report', period: 'H1 2026', type: 'Cost Savings', generatedDate: 'Jul 20, 2026', value: '42,300 SAR', trend: 'Up' },
  { title: 'Compliance Audit Results', period: 'Q2 2026', type: 'Compliance', generatedDate: 'Jul 10, 2026', value: '96% Pass', trend: 'Stable' },
  { title: 'Monthly Spend Summary', period: 'Jun 2026', type: 'Spend Analysis', generatedDate: 'Jul 03, 2026', value: '261,200 SAR', trend: 'Down' },
  { title: 'Top Suppliers by Volume', period: 'H1 2026', type: 'Supplier Performance', generatedDate: 'Jul 18, 2026', value: '8 Suppliers', trend: 'Stable' },
]

const TYPE_STYLES: Record<string, { bg: string; fg: string; icon: string }> = {
  'Spend Analysis': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', icon: 'DollarSign' },
  'Supplier Performance': { bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)', icon: 'Star' },
  'Inventory Turnover': { bg: 'var(--tint-blue)', fg: 'var(--salis-blue)', icon: 'RefreshCw' },
  'Cost Savings': { bg: 'var(--tint-orange)', fg: 'var(--salis-orange)', icon: 'PiggyBank' },
  Compliance: { bg: 'var(--tint-neutral)', fg: 'var(--text-muted)', icon: 'ShieldCheck' },
}

const TREND_STYLES: Record<string, { icon: string; fg: string }> = {
  Up: { icon: 'TrendingUp', fg: 'var(--salis-blue)' },
  Down: { icon: 'TrendingDown', fg: 'var(--salis-orange)' },
  Stable: { icon: 'Minus', fg: 'var(--text-muted)' },
}

export function PurchaseAgentReports() {
  const { t } = usePreferences()

  const kpis = [
    { label: t('Total Reports'), value: '24', icon: 'FileText', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('This Month'), value: '4', icon: 'Calendar', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Total Spend YTD'), value: '1.68M', icon: 'DollarSign', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Cost Savings YTD'), value: '42.3K', icon: 'PiggyBank', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const columns: Column<ProcurementReport>[] = [
    { header: t('Report'), cell: (r) => t(r.title) },
    { header: t('Period'), cell: (r) => r.period },
    { header: t('Type'), cell: (r) => <Badge background={TYPE_STYLES[r.type].bg} color={TYPE_STYLES[r.type].fg}>{t(r.type)}</Badge> },
    { header: t('Key Value'), cell: (r) => r.value },
    { header: t('Trend'), cell: (r) => (
      <span className="flex items-center gap-1" style={{ color: TREND_STYLES[r.trend].fg }}>
        <Icon name={TREND_STYLES[r.trend].icon} size={14} />
        <span className="text-xs">{t(r.trend)}</span>
      </span>
    ) },
    { header: t('Generated'), cell: (r) => r.generatedDate },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="BarChart3" title={t('Procurement Reports')} subtitle={t('Spend analysis, supplier performance, and savings')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <DataTable
        caption="Procurement reports"
        columns={columns}
        rows={REPORTS}
        rowKey={(r, i) => `${r.title}-${r.period}-${i}`}
        mobileCard={(r) => (
          <>
            <MobileCardHeader title={t(r.title)} trailing={<Badge background={TYPE_STYLES[r.type].bg} color={TYPE_STYLES[r.type].fg}>{t(r.type)}</Badge>} />
            <MobileCardRow label={t('Period')}>{r.period}</MobileCardRow>
            <MobileCardRow label={t('Key Value')}>{r.value}</MobileCardRow>
            <MobileCardRow label={t('Generated')}>{r.generatedDate}</MobileCardRow>
          </>
        )}
      />
    </div>
  )
}
