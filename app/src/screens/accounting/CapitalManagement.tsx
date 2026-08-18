import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'

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

function fmtSar(v: number): string {
  return `SAR ${v.toLocaleString('en-SA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function CapitalManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const accounts = useAccounts(t)

  const totalInvested = accounts.reduce((s, a) => s + a.invested, 0)
  const totalCurrent = accounts.reduce((s, a) => s + a.currentValue, 0)
  const totalReturn = totalCurrent - totalInvested
  const roi = ((totalReturn / totalInvested) * 100).toFixed(1)

  const kpis = [
    { label: t('Total Capital'), value: fmtSar(totalCurrent), icon: 'Briefcase', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Total Invested'), value: fmtSar(totalInvested), icon: 'TrendingUp', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Returns'), value: fmtSar(totalReturn), icon: 'ArrowUpRight', bg: totalReturn >= 0 ? 'rgba(10,94,215,.1)' : 'rgba(249,115,22,.1)', fg: totalReturn >= 0 ? 'var(--salis-blue)' : 'var(--salis-orange)' },
    { label: t('ROI'), value: `${roi}%`, icon: 'Percent', bg: 'rgba(11,31,59,.1)', fg: 'var(--text-heading)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Briefcase" title={t('Capital Management')} subtitle={t('Accounting')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <MobileCard key={k.label}>
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
              <p className="mt-1.5 text-[11px] text-muted">{k.label}</p>
              <p dir="ltr" className="font-mono text-sm font-bold text-heading">{k.value}</p>
            </MobileCard>
          ))}
        </div>
        {accounts.map((a) => {
          const ret = a.currentValue - a.invested
          const pct = ((ret / a.invested) * 100).toFixed(1)
          return (
            <MobileCard key={a.name}>
              <MobileCardHeader
                leading={
                  <div className="flex items-center gap-2">
                    <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Briefcase" size={14} /></span>
                    <div>
                      <p className="text-[13px] font-semibold text-heading">{a.name}</p>
                      <p className="text-xs text-muted">{a.type}</p>
                    </div>
                  </div>
                }
              />
              <div className="mt-1.5 flex items-center justify-between">
                <span dir="ltr" className="font-mono text-sm font-bold text-heading">{fmtSar(a.currentValue)}</span>
                <span dir="ltr" className={'text-xs font-semibold ' + (ret >= 0 ? 'text-salis-blue' : 'text-salis-orange')}>{ret >= 0 ? '+' : ''}{pct}%</span>
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
            <Icon name="Briefcase" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Capital Management')}</h1>
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
        <h3 className="mb-4 text-base font-bold text-heading">{t('Capital Accounts')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Account')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Type')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Invested')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Current Value')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Return')}</th>
                <th className="pb-3 text-end font-medium">{t('% Change')}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => {
                const ret = a.currentValue - a.invested
                const pct = ((ret / a.invested) * 100).toFixed(1)
                return (
                  <tr key={a.name} className="border-b border-border/50">
                    <td className="py-3 pe-4 font-medium text-heading">{a.name}</td>
                    <td className="py-3 pe-4 text-muted">{a.type}</td>
                    <td className="py-3 pe-4 text-end font-mono text-muted" dir="ltr">{fmtSar(a.invested)}</td>
                    <td className="py-3 pe-4 text-end font-mono font-medium text-heading" dir="ltr">{fmtSar(a.currentValue)}</td>
                    <td className={'py-3 pe-4 text-end font-mono font-medium ' + (ret >= 0 ? 'text-salis-blue' : 'text-salis-orange')} dir="ltr">
                      {ret >= 0 ? '+' : ''}{fmtSar(ret)}
                    </td>
                    <td className={'py-3 text-end font-mono font-semibold ' + (ret >= 0 ? 'text-salis-blue' : 'text-salis-orange')} dir="ltr">
                      {ret >= 0 ? '+' : ''}{pct}%
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
