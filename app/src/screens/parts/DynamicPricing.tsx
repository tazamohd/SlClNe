import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

const RULES = [
  { partCategory: 'Engine Parts', baseMarkup: 25, currentMarkup: 32, demandLevel: 'High', autoAdjust: true, lastUpdated: '2026-08-15' },
  { partCategory: 'Electrical', baseMarkup: 20, currentMarkup: 20, demandLevel: 'Medium', autoAdjust: false, lastUpdated: '2026-08-10' },
  { partCategory: 'Body', baseMarkup: 30, currentMarkup: 38, demandLevel: 'Critical', autoAdjust: true, lastUpdated: '2026-08-17' },
  { partCategory: 'Fluids', baseMarkup: 15, currentMarkup: 15, demandLevel: 'Low', autoAdjust: false, lastUpdated: '2026-08-12' },
  { partCategory: 'Filters', baseMarkup: 22, currentMarkup: 28, demandLevel: 'High', autoAdjust: true, lastUpdated: '2026-08-16' },
  { partCategory: 'Brakes', baseMarkup: 28, currentMarkup: 34, demandLevel: 'Medium', autoAdjust: true, lastUpdated: '2026-08-14' },
] as const

type Rule = (typeof RULES)[number]

function demandColor(level: string) {
  if (level === 'Critical') return { background: 'var(--tint-orange)', color: '#F97316' }
  if (level === 'High') return { background: 'var(--tint-orange)', color: 'var(--salis-orange)' }
  if (level === 'Low') return { background: 'rgba(10,94,215,.08)', color: 'var(--salis-blue)' }
  return { background: 'var(--tint-blue)', color: 'var(--salis-blue)' }
}

export function DynamicPricing() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const avgMarkup = Math.round(RULES.reduce((sum, r) => sum + r.currentMarkup, 0) / RULES.length)
  const revenueImpact = `+${Math.round(RULES.reduce((sum, r) => sum + (r.currentMarkup - r.baseMarkup), 0) / RULES.length)}%`
  const activeRules = RULES.length
  const autoAdjusted = RULES.filter((r) => r.autoAdjust).length

  const kpis = [
    { label: t('Avg Markup'), value: `${avgMarkup}%`, icon: 'Percent', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Revenue Impact'), value: revenueImpact, icon: 'TrendingUp', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Active Rules'), value: String(activeRules), icon: 'Settings', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Auto-Adjusted'), value: String(autoAdjusted), icon: 'Zap', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const columns: Column<Rule>[] = [
    { header: 'Part Category', cell: (rule) => <span className="font-medium text-heading">{t(rule.partCategory)}</span> },
    { header: 'Base Markup', cell: (rule) => <span className="font-mono text-muted" dir="ltr">{rule.baseMarkup}%</span> },
    { header: 'Current Markup', cell: (rule) => <span className="font-mono text-heading" dir="ltr">{rule.currentMarkup}%</span> },
    { header: 'Demand Level', cell: (rule) => <Badge {...demandColor(rule.demandLevel)}>{t(rule.demandLevel)}</Badge> },
    {
      header: 'Auto-Adjust',
      cell: (rule) =>
        rule.autoAdjust
          ? <span className="flex items-center gap-1 text-salis-blue"><Icon name="Check" size={14} /> {t('Yes')}</span>
          : <span className="text-muted">{t('No')}</span>,
    },
    { header: 'Last Updated', cell: (rule) => <span className="font-mono text-xs text-muted" dir="ltr">{rule.lastUpdated}</span> },
  ]

  const table = (
    <DataTable
      caption="Dynamic pricing rules"
      columns={columns}
      rows={RULES as unknown as Rule[]}
      rowKey={(rule) => rule.partCategory}
      mobileCard={(rule) => (
        <>
          <MobileCardHeader
            leading={
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5 bg-[var(--tint-blue)] text-salis-blue" aria-hidden><Icon name="TrendingUp" size={14} /></span>
                <p className="text-[13px] font-semibold text-heading">{t(rule.partCategory)}</p>
              </div>
            }
            trailing={<Badge {...demandColor(rule.demandLevel)}>{t(rule.demandLevel)}</Badge>}
          />
          <MobileCardRow label={t('Base Markup')} value={`${rule.baseMarkup}%`} />
          <MobileCardRow label={t('Current Markup')} value={`${rule.currentMarkup}%`} />
          <MobileCardRow label={t('Auto-Adjust')} value={rule.autoAdjust ? t('Yes') : t('No')} />
          <MobileCardRow label={t('Last Updated')} value={rule.lastUpdated} />
        </>
      )}
    />
  )

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="TrendingUp" title={t('Dynamic Pricing')} subtitle={t('Pricing rules')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <Card key={k.label} className="rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
                <span className="text-[11px] font-medium text-muted">{k.label}</span>
              </div>
              <h4 className="mt-1.5 font-display text-lg font-black text-heading">{k.value}</h4>
            </Card>
          ))}
        </div>
        {table}
      </div>
    )
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="TrendingUp" title={t('Dynamic Pricing')} subtitle={t('Pricing rules and adjustments')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {table}
    </div>
  )
}
