import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

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
  'Spend Analysis': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)', icon: 'DollarSign' },
  'Supplier Performance': { bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)', icon: 'Star' },
  'Inventory Turnover': { bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)', icon: 'RefreshCw' },
  'Cost Savings': { bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)', icon: 'PiggyBank' },
  Compliance: { bg: 'rgba(107,114,128,.1)', fg: 'rgb(107,114,128)', icon: 'ShieldCheck' },
}

const TREND_STYLES: Record<string, { icon: string; fg: string }> = {
  Up: { icon: 'TrendingUp', fg: 'var(--salis-blue)' },
  Down: { icon: 'TrendingDown', fg: 'var(--salis-orange)' },
  Stable: { icon: 'Minus', fg: 'rgb(107,114,128)' },
}

export function PurchaseAgentReports() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const kpis = [
    { label: t('Total Reports'), value: '24', icon: 'FileText', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('This Month'), value: '4', icon: 'Calendar', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Total Spend YTD'), value: '1.68M', icon: 'DollarSign', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Cost Savings YTD'), value: '42.3K', icon: 'PiggyBank', bg: 'rgba(245,158,11,.1)', fg: 'rgb(245,158,11)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="BarChart3" title={t('Procurement Reports')} subtitle={t('Analytics & insights')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1.5 font-display text-xl font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {REPORTS.map((r, i) => (
          <MobileCard key={`${r.title}-${r.period}-${i}`}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5" style={{ background: TYPE_STYLES[r.type].bg, color: TYPE_STYLES[r.type].fg }} aria-hidden>
                    <Icon name={TYPE_STYLES[r.type].icon} size={14} />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{t(r.title)}</p>
                    <p className="text-xs text-muted">{r.period}</p>
                  </div>
                </div>
              }
              trailing={
                <span style={{ color: TREND_STYLES[r.trend].fg }}>
                  <Icon name={TREND_STYLES[r.trend].icon} size={14} />
                </span>
              }
            />
            <MobileCardRow label={t('Type')} value={t(r.type)} />
            <MobileCardRow label={t('Value')} value={r.value} />
            <MobileCardRow label={t('Generated')} value={r.generatedDate} />
          </MobileCard>
        ))}
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
          <h1 className="font-display text-[30px] font-black text-heading">{t('Procurement Reports')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Spend analysis, supplier performance, and savings')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Report')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Period')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Type')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Key Value')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Trend')}</th>
                <th className="pb-3 text-start font-medium">{t('Generated')}</th>
              </tr>
            </thead>
            <tbody>
              {REPORTS.map((r, i) => (
                <tr key={`${r.title}-${r.period}-${i}`} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{t(r.title)}</td>
                  <td className="py-3 pe-4 text-body">{r.period}</td>
                  <td className="py-3 pe-4">
                    <Badge background={TYPE_STYLES[r.type].bg} color={TYPE_STYLES[r.type].fg}>{t(r.type)}</Badge>
                  </td>
                  <td className="py-3 pe-4 font-mono text-heading" dir="ltr">{r.value}</td>
                  <td className="py-3 pe-4">
                    <span className="flex items-center gap-1" style={{ color: TREND_STYLES[r.trend].fg }}>
                      <Icon name={TREND_STYLES[r.trend].icon} size={14} />
                      <span className="text-xs">{t(r.trend)}</span>
                    </span>
                  </td>
                  <td className="py-3 text-muted">{r.generatedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
