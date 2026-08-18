import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobileCardRow, MobilePageHeader } from '@/components/shell/MobileShell'

const RULES = [
  { partCategory: 'Engine Parts', baseMarkup: 25, currentMarkup: 32, demandLevel: 'High', autoAdjust: true, lastUpdated: '2026-08-15' },
  { partCategory: 'Electrical', baseMarkup: 20, currentMarkup: 20, demandLevel: 'Medium', autoAdjust: false, lastUpdated: '2026-08-10' },
  { partCategory: 'Body', baseMarkup: 30, currentMarkup: 38, demandLevel: 'Critical', autoAdjust: true, lastUpdated: '2026-08-17' },
  { partCategory: 'Fluids', baseMarkup: 15, currentMarkup: 15, demandLevel: 'Low', autoAdjust: false, lastUpdated: '2026-08-12' },
  { partCategory: 'Filters', baseMarkup: 22, currentMarkup: 28, demandLevel: 'High', autoAdjust: true, lastUpdated: '2026-08-16' },
  { partCategory: 'Brakes', baseMarkup: 28, currentMarkup: 34, demandLevel: 'Medium', autoAdjust: true, lastUpdated: '2026-08-14' },
] as const

function demandColor(level: string) {
  if (level === 'Critical') return { background: 'rgba(239,68,68,.1)', color: '#EF4444' }
  if (level === 'High') return { background: 'rgba(245,158,11,.1)', color: '#F59E0B' }
  if (level === 'Low') return { background: 'rgba(10,94,215,.08)', color: 'var(--salis-blue)' }
  return { background: 'rgba(10,94,215,.1)', color: 'var(--salis-blue)' }
}

export function DynamicPricing() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()

  const avgMarkup = Math.round(RULES.reduce((sum, r) => sum + r.currentMarkup, 0) / RULES.length)
  const revenueImpact = `+${Math.round(RULES.reduce((sum, r) => sum + (r.currentMarkup - r.baseMarkup), 0) / RULES.length)}%`
  const activeRules = RULES.length
  const autoAdjusted = RULES.filter((r) => r.autoAdjust).length

  const kpis = [
    { label: t('Avg Markup'), value: `${avgMarkup}%`, icon: 'Percent', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Revenue Impact'), value: revenueImpact, icon: 'TrendingUp', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active Rules'), value: String(activeRules), icon: 'Settings', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Auto-Adjusted'), value: String(autoAdjusted), icon: 'Zap', bg: 'rgba(245,158,11,.1)', fg: '#F59E0B' },
  ]

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
        {RULES.map((rule) => (
          <MobileCard key={rule.partCategory}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="TrendingUp" size={14} /></span>
                  <p className="text-[13px] font-semibold text-heading">{t(rule.partCategory)}</p>
                </div>
              }
              trailing={<Badge {...demandColor(rule.demandLevel)}>{t(rule.demandLevel)}</Badge>}
            />
            <MobileCardRow label={t('Base Markup')} value={`${rule.baseMarkup}%`} />
            <MobileCardRow label={t('Current Markup')} value={`${rule.currentMarkup}%`} />
            <MobileCardRow label={t('Auto-Adjust')} value={rule.autoAdjust ? t('Yes') : t('No')} />
            <MobileCardRow label={t('Last Updated')} value={rule.lastUpdated} />
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
            <Icon name="TrendingUp" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Dynamic Pricing')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Pricing rules and adjustments')}</p>
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
                <th className="pb-3 pe-4 text-start font-medium">{t('Part Category')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Base Markup')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Current Markup')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Demand Level')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Auto-Adjust')}</th>
                <th className="pb-3 text-start font-medium">{t('Last Updated')}</th>
              </tr>
            </thead>
            <tbody>
              {RULES.map((rule) => (
                <tr key={rule.partCategory} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{t(rule.partCategory)}</td>
                  <td className="py-3 pe-4 text-end font-mono text-muted" dir="ltr">{rule.baseMarkup}%</td>
                  <td className="py-3 pe-4 text-end font-mono text-heading" dir="ltr">{rule.currentMarkup}%</td>
                  <td className="py-3 pe-4">
                    <Badge {...demandColor(rule.demandLevel)}>{t(rule.demandLevel)}</Badge>
                  </td>
                  <td className="py-3 pe-4 text-body">
                    {rule.autoAdjust
                      ? <span className="flex items-center gap-1 text-salis-blue"><Icon name="Check" size={14} /> {t('Yes')}</span>
                      : <span className="text-muted">{t('No')}</span>
                    }
                  </td>
                  <td className="py-3 font-mono text-xs text-muted" dir="ltr">{rule.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
