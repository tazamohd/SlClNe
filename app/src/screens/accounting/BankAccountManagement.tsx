import { useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCard, MobileCardHeader, MobilePageHeader } from '@/components/shell/MobileShell'

interface BankAccount {
  bank: string
  accountNo: string
  type: string
  balance: number
  status: string
  lastReconciled: string
}

function useAccounts(t: (s: string) => string): BankAccount[] {
  return useMemo(
    () => [
      { bank: t('Al Rajhi Bank'), accountNo: '****4821', type: t('Current'), balance: 485000, status: t('Reconciled'), lastReconciled: '2026-08-15' },
      { bank: t('Saudi National Bank'), accountNo: '****7312', type: t('Current'), balance: 220000, status: t('Reconciled'), lastReconciled: '2026-08-10' },
      { bank: t('Riyad Bank'), accountNo: '****9045', type: t('Savings'), balance: 150000, status: t('Pending'), lastReconciled: '2026-07-31' },
      { bank: t('Alinma Bank'), accountNo: '****2156', type: t('Current'), balance: 95000, status: t('Reconciled'), lastReconciled: '2026-08-12' },
    ],
    [t],
  )
}

function fmtSar(v: number): string {
  return `SAR ${v.toLocaleString('en-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function BankAccountManagement() {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const accounts = useAccounts(t)

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)
  const reconciled = accounts.filter((a) => a.status === t('Reconciled')).length

  const kpis = [
    { label: t('Total Balance'), value: fmtSar(totalBalance), icon: 'Landmark', bg: 'rgba(10,94,215,.1)', fg: 'var(--salis-blue)' },
    { label: t('Active Accounts'), value: String(accounts.length), icon: 'CreditCard', bg: 'rgba(11,179,255,.1)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Reconciled'), value: `${reconciled}/${accounts.length}`, icon: 'CheckCircle', bg: 'rgba(11,31,59,.1)', fg: 'var(--text-heading)' },
  ]

  if (isMobile) {
    return (
      <div className="flex animate-fade-up flex-col gap-4 motion-reduce:animate-none">
        <MobilePageHeader icon="Landmark" title={t('Bank Accounts')} subtitle={t('Accounting')} />
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((k) => (
            <MobileCard key={k.label}>
              <span className="flex rounded-lg p-1.5" style={{ background: k.bg, color: k.fg }} aria-hidden><Icon name={k.icon} size={14} /></span>
              <p className="mt-1.5 text-[11px] text-muted">{k.label}</p>
              <p dir="ltr" className="font-mono text-sm font-bold text-heading">{k.value}</p>
            </MobileCard>
          ))}
        </div>
        {accounts.map((a) => (
          <MobileCard key={a.accountNo}>
            <MobileCardHeader
              leading={
                <div className="flex items-center gap-2">
                  <span className="flex rounded-lg p-1.5 bg-[rgba(10,94,215,.1)] text-salis-blue" aria-hidden><Icon name="Landmark" size={14} /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-heading">{a.bank}</p>
                    <p className="font-mono text-xs text-muted" dir="ltr">{a.accountNo} · {a.type}</p>
                  </div>
                </div>
              }
            />
            <div className="mt-1.5 flex items-center justify-between">
              <span dir="ltr" className="font-mono text-sm font-bold text-heading">{fmtSar(a.balance)}</span>
              <Badge background={a.status === t('Reconciled') ? 'rgba(10,94,215,.1)' : 'rgba(249,115,22,.1)'}
                color={a.status === t('Reconciled') ? 'var(--salis-blue)' : 'var(--salis-orange)'}>{a.status}</Badge>
            </div>
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
            <Icon name="Landmark" size={28} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[30px] font-black text-heading">{t('Bank Accounts')}</h1>
          <p className="mt-0.5 text-[13px] text-muted">{t('Accounting')}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
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
        <h3 className="mb-4 text-base font-bold text-heading">{t('Bank Accounts')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium text-muted">
                <th className="pb-3 pe-4 text-start font-medium">{t('Bank')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Account')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Type')}</th>
                <th className="pb-3 pe-4 text-end font-medium">{t('Balance')}</th>
                <th className="pb-3 pe-4 text-start font-medium">{t('Status')}</th>
                <th className="pb-3 text-start font-medium">{t('Last Reconciled')}</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.accountNo} className="border-b border-border/50">
                  <td className="py-3 pe-4 font-medium text-heading">{a.bank}</td>
                  <td className="py-3 pe-4 font-mono text-xs text-muted" dir="ltr">{a.accountNo}</td>
                  <td className="py-3 pe-4 text-body">{a.type}</td>
                  <td className="py-3 pe-4 text-end font-mono font-medium text-heading" dir="ltr">{fmtSar(a.balance)}</td>
                  <td className="py-3 pe-4">
                    <Badge background={a.status === t('Reconciled') ? 'rgba(10,94,215,.1)' : 'rgba(249,115,22,.1)'}
                      color={a.status === t('Reconciled') ? 'var(--salis-blue)' : 'var(--salis-orange)'}>{a.status}</Badge>
                  </td>
                  <td className="py-3 text-muted" dir="ltr">{a.lastReconciled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
