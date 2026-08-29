import { useMemo } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { formatSar } from '@/components/ui/Money'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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

const fmtSar = (v: number) => formatSar(v, { decimals: 0 })

export function BudgetManagement() {
  const { t } = usePreferences()
  const rows = useRows(t)

  const totalBudget = rows.reduce((s, r) => s + r.budget, 0)
  const totalActual = rows.reduce((s, r) => s + r.actual, 0)
  const totalRemaining = totalBudget - totalActual
  const utilization = Math.round((totalActual / totalBudget) * 100)

  const kpis = [
    { label: t('Total Budget'), value: fmtSar(totalBudget), icon: 'Target', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Spent'), value: fmtSar(totalActual), icon: 'TrendingUp', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Remaining'), value: fmtSar(totalRemaining), icon: 'Wallet', bg: 'var(--tint-navy)', fg: 'var(--text-heading)' },
    { label: t('Utilization'), value: `${utilization}%`, icon: 'PieChart', bg: 'var(--tint-orange)', fg: 'var(--salis-orange)' },
  ]

  const columns: Column<BudgetRow>[] = [
    { header: 'Category', cell: (r) => <span className="font-medium text-heading">{r.category}</span> },
    { header: 'Budget', cell: (r) => <span dir="ltr" className="font-mono text-muted">{fmtSar(r.budget)}</span>, className: 'text-end' },
    { header: 'Actual', cell: (r) => <span dir="ltr" className="font-mono font-medium text-heading">{fmtSar(r.actual)}</span>, className: 'text-end' },
    { header: 'Variance', cell: (r) => {
      const variance = r.budget - r.actual
      return (
        <span dir="ltr" className={'font-mono font-medium ' + (variance < 0 ? 'text-salis-orange' : 'text-salis-blue')}>
          {variance >= 0 ? '+' : ''}{fmtSar(variance)}
        </span>
      )
    }, className: 'text-end' },
    { header: '% Used', cell: (r) => <span className="font-mono text-heading">{Math.round((r.actual / r.budget) * 100)}%</span>, className: 'text-end' },
    { header: 'Progress', cell: (r) => {
      const pct = Math.round((r.actual / r.budget) * 100)
      return (
        <div className="h-1.5 overflow-hidden rounded-full bg-salis-blue/[.08]" style={{ minWidth: 80 }}>
          <div className={`h-full rounded-full ${pct > 90 ? 'bg-salis-orange' : 'bg-salis-blue'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      )
    } },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Target" title={t('Budget Management')} subtitle={t('Accounting')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} mono />
        ))}
      </div>

      <DataTable
        caption="Budget by category"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.category}
        mobileCard={(r) => {
          const pct = Math.round((r.actual / r.budget) * 100)
          const variance = r.budget - r.actual
          return (
            <>
              <MobileCardHeader title={r.category} trailing={<span className="text-xs font-medium text-muted">{pct}%</span>} />
              <MobileCardRow label={t('Spent / Budget')}>
                <span dir="ltr">{fmtSar(r.actual)} / {fmtSar(r.budget)}</span>
              </MobileCardRow>
              <MobileCardRow label={t('Variance')}>
                <span dir="ltr" className={variance < 0 ? 'text-salis-orange' : 'text-salis-blue'}>{variance >= 0 ? '+' : ''}{fmtSar(variance)}</span>
              </MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="Target" title={t('No budget items found')} />}
      />
    </div>
  )
}
