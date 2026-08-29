import { useMemo } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { formatSar } from '@/components/ui/Money'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

interface CapitalAccount {
  name: string
  type: string
  invested: number
  currentValue: number
}

function useAccounts(t: (s: string) => string): CapitalAccount[] {
  return useMemo(
    () => [
      { name: t('Workshop Equipment'), type: t('Fixed Asset'), invested: 450000, currentValue: 380000 },
      { name: t('Diagnostic Tools'), type: t('Fixed Asset'), invested: 120000, currentValue: 95000 },
      { name: t('Vehicle Fleet'), type: t('Fixed Asset'), invested: 280000, currentValue: 210000 },
      { name: t('Technology Systems'), type: t('Fixed Asset'), invested: 85000, currentValue: 62000 },
      { name: t('Real Estate'), type: t('Property'), invested: 1200000, currentValue: 1450000 },
      { name: t('Working Capital'), type: t('Operating'), invested: 350000, currentValue: 350000 },
    ],
    [t],
  )
}

const fmtSar = (v: number) => formatSar(v, { decimals: 0 })

export function CapitalManagement() {
  const { t } = usePreferences()
  const accounts = useAccounts(t)

  const totalInvested = accounts.reduce((s, a) => s + a.invested, 0)
  const totalCurrent = accounts.reduce((s, a) => s + a.currentValue, 0)
  const totalReturn = totalCurrent - totalInvested
  const roi = ((totalReturn / totalInvested) * 100).toFixed(1)

  const kpis = [
    { label: t('Total Capital'), value: fmtSar(totalCurrent), icon: 'Briefcase', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Total Invested'), value: fmtSar(totalInvested), icon: 'TrendingUp', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright)' },
    { label: t('Returns'), value: fmtSar(totalReturn), icon: 'ArrowUpRight', bg: totalReturn >= 0 ? 'var(--tint-blue)' : 'var(--tint-orange)', fg: totalReturn >= 0 ? 'var(--salis-blue)' : 'var(--salis-orange)' },
    { label: t('ROI'), value: `${roi}%`, icon: 'Percent', bg: 'var(--tint-navy)', fg: 'var(--text-heading)' },
  ]

  const columns: Column<CapitalAccount>[] = [
    { header: 'Account', cell: (a) => <span className="font-medium text-heading">{a.name}</span> },
    { header: 'Type', cell: (a) => <span className="text-muted">{a.type}</span> },
    { header: 'Invested', cell: (a) => <span dir="ltr" className="font-mono text-muted">{fmtSar(a.invested)}</span>, className: 'text-end' },
    { header: 'Current Value', cell: (a) => <span dir="ltr" className="font-mono font-medium text-heading">{fmtSar(a.currentValue)}</span>, className: 'text-end' },
    { header: 'Return', cell: (a) => {
      const ret = a.currentValue - a.invested
      return (
        <span dir="ltr" className={'font-mono font-medium ' + (ret >= 0 ? 'text-salis-blue' : 'text-salis-orange')}>
          {ret >= 0 ? '+' : ''}{fmtSar(ret)}
        </span>
      )
    }, className: 'text-end' },
    { header: '% Change', cell: (a) => {
      const ret = a.currentValue - a.invested
      const pct = ((ret / a.invested) * 100).toFixed(1)
      return (
        <span dir="ltr" className={'font-mono font-semibold ' + (ret >= 0 ? 'text-salis-blue' : 'text-salis-orange')}>
          {ret >= 0 ? '+' : ''}{pct}%
        </span>
      )
    }, className: 'text-end' },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Briefcase" title={t('Capital Management')} subtitle={t('Accounting')} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} mono />
        ))}
      </div>

      <DataTable
        caption="Capital accounts"
        columns={columns}
        rows={accounts}
        rowKey={(a) => a.name}
        mobileCard={(a) => {
          const ret = a.currentValue - a.invested
          const pct = ((ret / a.invested) * 100).toFixed(1)
          return (
            <>
              <MobileCardHeader
                title={a.name}
                trailing={<span dir="ltr" className={'text-xs font-semibold ' + (ret >= 0 ? 'text-salis-blue' : 'text-salis-orange')}>{ret >= 0 ? '+' : ''}{pct}%</span>}
              />
              <MobileCardRow label={t('Type')}>{a.type}</MobileCardRow>
              <MobileCardRow label={t('Current Value')}><span dir="ltr" className="font-semibold">{fmtSar(a.currentValue)}</span></MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="Briefcase" title={t('No capital accounts found')} />}
      />
    </div>
  )
}
