import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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

export function BusinessIntelligence() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const active = MOCK_MODULES.filter(m => m.status === 'Active').length
  const totalReports = MOCK_MODULES.reduce((a, m) => a + m.reports, 0)
  const avgAccuracy = Math.round(MOCK_MODULES.filter(m => m.accuracy > 0).reduce((a, m) => a + m.accuracy, 0) / MOCK_MODULES.filter(m => m.accuracy > 0).length)

  const kpis = [
    { label: t('BI Modules'), value: String(MOCK_MODULES.length), icon: 'BarChart3', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active'), value: String(active), icon: 'Activity', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Reports'), value: String(totalReports), icon: 'FileText', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
    { label: t('Avg Accuracy'), value: `${avgAccuracy}%`, icon: 'Target', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="BarChart3" title={t('Business Intelligence')} subtitle={t('Analytics Overview')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="rounded-lg p-3">
              <p className="text-[11px] font-medium text-muted">{k.label}</p>
              <p className="mt-1 font-display text-lg font-black text-heading">{k.value}</p>
            </Card>
          ))}
        </div>
        {MOCK_MODULES.map(m => {
          const [bg, fg] = STATUS_COLORS[m.status] ?? STATUS_COLORS.Planned
          return (
            <MobileCard key={m.id}>
              <MobileCardHeader title={m.name} trailing={<Badge background={bg} color={fg}>{t(m.status)}</Badge>} />
              <MobileCardRow label={t('Category')}>{t(m.category)}</MobileCardRow>
              <MobileCardRow label={t('Reports')}>{m.reports}</MobileCardRow>
              <MobileCardRow label={t('Accuracy')}>{m.accuracy > 0 ? `${m.accuracy}%` : '—'}</MobileCardRow>
              <MobileCardRow label={t('Last Updated')}>{m.lastUpdated}</MobileCardRow>
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
            <Icon name="BarChart3" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Business Intelligence')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Analytics overview and module status')}</p>
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
        <h3 className="mb-4 text-[15px] font-bold text-heading">{t('BI Modules')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('ID')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Module')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Reports')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Accuracy')}</th>
                <th className="pb-3 text-start font-medium">{t('Last Updated')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_MODULES.map(m => {
                const [bg, fg] = STATUS_COLORS[m.status] ?? STATUS_COLORS.Planned
                return (
                  <tr key={m.id} className="border-b border-border/50">
                    <td className="py-3 pe-4 font-mono text-[13px] text-heading" dir="ltr">{m.id}</td>
                    <td className="py-3 pe-4 text-[13px] text-heading">{t(m.name)}</td>
                    <td className="py-3 pe-4 text-[13px] text-muted">{t(m.category)}</td>
                    <td className="py-3 pe-4"><Badge background={bg} color={fg}>{t(m.status)}</Badge></td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{m.reports}</td>
                    <td className="py-3 pe-4 text-end font-mono text-[13px] text-heading">{m.accuracy > 0 ? `${m.accuracy}%` : '—'}</td>
                    <td className="py-3 text-[13px] text-muted" dir="ltr">{m.lastUpdated}</td>
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
