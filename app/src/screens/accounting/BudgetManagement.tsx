import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobilePageHeader } from '@/components/shell/MobileShell'

interface BudgetRow {
  category: string
  budget: number
  actual: number
}

function useRows(t: (s: string) => string): BudgetRow[] {
  return useMemo(
    () => [
      { category: t('Parts & Materials'), budget: 250000, actual: 198000 },
      { category: t('Labor'), budget: 180000, actual: 165000 },
      { category: t('Equipment'), budget: 80000, actual: 72000 },
      { category: t('Marketing'), budget: 45000, actual: 38000 },
      { category: t('Rent & Utilities'), budget: 60000, actual: 58500 },
      { category: t('Insurance'), budget: 35000, actual: 35000 },
      { category: t('Training'), budget: 20000, actual: 12000 },
      { category: t('Miscellaneous'), budget: 15000, actual: 8500 },
    ],
    [t],
  )
}

function fmtSar(v: number): string {
  return `SAR ${v.toLocaleString('en-SA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function BudgetManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const rows = useRows(t)

  const totalBudget = rows.reduce((s, r) => s + r.budget, 0)
  const totalActual = rows.reduce((s, r) => s + r.actual, 0)
  const totalRemaining = totalBudget - totalActual
  const utilization = Math.round((totalActual / totalBudget) * 100)

  const kpis = [
    { label: t('Total Budget'), value: fmtSar(totalBudget), icon: 'Target', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Spent'), value: fmtSar(totalActual), icon: 'TrendingUp', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Remaining'), value: fmtSar(totalRemaining), icon: 'Wallet', bg: 'rgba(11,31,59,.1)', fg: 'var(--text-heading)' },
    { label: t('Utilization'), value: `${utilization}%`, icon: 'PieChart', bg: 'rgba(249,115,22,.1)', fg: 'var(--salis-orange)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Target" title={t('Budget Management')} subtitle={t('Accounting')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <MobileCard key={k.label}>
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
              <p className="mt-1.5 text-[11px] text-muted">{k.label}</p>
              <p dir="ltr" className="font-mono text-sm font-bold text-heading">{k.value}</p>
            </MobileCard>
          ))}
        </div>
        {rows.map((r) => {
          const pct = Math.round((r.actual / r.budget) * 100)
          const variance = r.budget - r.actual
          return (
            <MobileCard key={r.category}>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-heading">{r.category}</p>
                <span className="text-xs font-medium text-muted">{pct}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(pct, 100)}%`, background: pct > 90 ? 'var(--salis-orange)' : 'var(--salis-blue)' }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-muted">
                <span dir="ltr">{fmtSar(r.actual)} / {fmtSar(r.budget)}</span>
                <span dir="ltr" className={variance < 0 ? 'text-salis-orange' : 'text-salis-blue'}>{variance >= 0 ? '+' : ''}{fmtSar(variance)}</span>
              </div>
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
          <h1 className="font-display text-[30px] font-black text-heading">{t('Budget Management')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Accounting')}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={16} /></span>
              <span className="text-xs font-medium text-muted">{k.label}</span>
            </div>
            <h4 dir="ltr" className="mt-2 font-mono text-xl font-black text-heading">{k.value}</h4>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-heading">{t('Budget by Category')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Category')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Budget')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Actual')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Variance')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('% Used')}</th>
                <th className="pb-3 font-medium" style={{ width: 120 }}>{t('Progress')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pct = Math.round((r.actual / r.budget) * 100)
                const variance = r.budget - r.actual
                return (
                  <tr key={r.category} className="border-b border-border/50">
                    <td className="py-3 pe-4 font-medium text-heading">{r.category}</td>
                    <td className="py-3 pe-4 text-end font-mono text-muted" dir="ltr">{fmtSar(r.budget)}</td>
                    <td className="py-3 pe-4 text-end font-mono font-medium text-heading" dir="ltr">{fmtSar(r.actual)}</td>
                    <td className={'py-3 pe-4 text-end font-mono font-medium ' + (variance < 0 ? 'text-salis-orange' : 'text-salis-blue')} dir="ltr">
                      {variance >= 0 ? '+' : ''}{fmtSar(variance)}
                    </td>
                    <td className="py-3 pe-4 text-end font-mono text-heading">{pct}%</td>
                    <td className="py-3">
                      <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(10,94,215,.08)]">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: pct > 90 ? 'var(--salis-orange)' : 'var(--salis-blue)' }} />
                      </div>
                    </td>
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
