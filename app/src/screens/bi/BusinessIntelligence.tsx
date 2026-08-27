import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const MOCK_MODULES = [
  { id: 'BI-001', name: 'Sales Analytics', category: 'Revenue', status: 'Active', reports: 24, lastUpdated: '2026-08-17', accuracy: 96 },
  { id: 'BI-002', name: 'Customer Insights', category: 'CRM', status: 'Active', reports: 18, lastUpdated: '2026-08-16', accuracy: 93 },
  { id: 'BI-003', name: 'Inventory Intelligence', category: 'Operations', status: 'Active', reports: 15, lastUpdated: '2026-08-17', accuracy: 91 },
  { id: 'BI-004', name: 'Financial Forecasting', category: 'Finance', status: 'Beta', reports: 8, lastUpdated: '2026-08-15', accuracy: 88 },
  { id: 'BI-005', name: 'Workforce Analytics', category: 'HR', status: 'Planned', reports: 0, lastUpdated: '—', accuracy: 0 },
  { id: 'BI-006', name: 'Service Performance', category: 'Workshop', status: 'Active', reports: 21, lastUpdated: '2026-08-17', accuracy: 94 },
] as const

const STATUS_COLORS: Record<string, readonly [string, string]> = {
  Active: ['rgba(10,94,215,.1)', 'var(--salis-blue)'],
  Beta: ['rgba(249,115,22,.1)', 'var(--salis-orange)'],
  Planned: ['rgba(100,116,139,.1)', '#64748B'],
}

type ModuleRow = (typeof MOCK_MODULES)[number]

export function BusinessIntelligence() {
  const { t } = usePreferences()

  const active = MOCK_MODULES.filter(m => m.status === 'Active').length
  const totalReports = MOCK_MODULES.reduce((a, m) => a + m.reports, 0)
  const avgAccuracy = Math.round(MOCK_MODULES.filter(m => m.accuracy > 0).reduce((a, m) => a + m.accuracy, 0) / MOCK_MODULES.filter(m => m.accuracy > 0).length)

  const kpis = [
    { label: t('BI Modules'), value: String(MOCK_MODULES.length), icon: 'BarChart3', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(active), icon: 'Activity', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Reports'), value: String(totalReports), icon: 'FileText', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Avg Accuracy'), value: `${avgAccuracy}%`, icon: 'Target', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  const columns: Column<ModuleRow>[] = [
    { header: 'ID', cell: (m) => m.id, code: true },
    { header: 'Module', cell: (m) => t(m.name) },
    { header: 'Category', cell: (m) => t(m.category) },
    { header: 'Status', cell: (m) => { const [bg, fg] = STATUS_COLORS[m.status] ?? STATUS_COLORS.Planned; return <Badge background={bg} color={fg}>{t(m.status)}</Badge> } },
    { header: 'Reports', cell: (m) => `${m.reports}` },
    { header: 'Accuracy', cell: (m) => m.accuracy > 0 ? `${m.accuracy}%` : '—' },
    { header: 'Last Updated', cell: (m) => m.lastUpdated },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="BarChart3" title={t('Business Intelligence')} subtitle={t('Analytics overview and module status')} />

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

      <h3 className="text-[15px] font-bold text-heading">{t('BI Modules')}</h3>
      <DataTable
        caption="Business intelligence modules"
        columns={columns}
        rows={[...MOCK_MODULES]}
        rowKey={(row) => row.id}
        mobileCard={(row) => {
          const [bg, fg] = STATUS_COLORS[row.status] ?? STATUS_COLORS.Planned
          return (
            <>
              <MobileCardHeader title={t(row.name)} trailing={<Badge background={bg} color={fg}>{t(row.status)}</Badge>} />
              <MobileCardRow label={t('Category')}>{t(row.category)}</MobileCardRow>
              <MobileCardRow label={t('Reports')}>{row.reports}</MobileCardRow>
              <MobileCardRow label={t('Accuracy')}>{row.accuracy > 0 ? `${row.accuracy}%` : '—'}</MobileCardRow>
            </>
          )
        }}
      />
    </div>
  )
}
