import { useMemo } from 'react'
import { KpiCard } from '@/components/ui/KpiCard'
import { formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { PageHeader } from '@/components/ui/PageHeader'

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


export function BankAccountManagement() {
  const { t } = usePreferences()
  const accounts = useAccounts(t)

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)
  const reconciled = accounts.filter((a) => a.status === t('Reconciled')).length

  const kpis = [
    { label: t('Total Balance'), value: formatSar(totalBalance), icon: 'Landmark', bg: 'var(--tint-blue)', fg: 'var(--salis-blue)' },
    { label: t('Active Accounts'), value: String(accounts.length), icon: 'CreditCard', bg: 'var(--tint-bright)', fg: 'var(--salis-blue-bright, #0BB3FF)' },
    { label: t('Reconciled'), value: `${reconciled}/${accounts.length}`, icon: 'CheckCircle', bg: 'var(--tint-navy)', fg: 'var(--text-heading)' },
  ]

  const columns: Column<BankAccount>[] = [
    { header: 'Bank', cell: (a) => <span className="font-medium text-heading">{a.bank}</span> },
    { header: 'Account', cell: (a) => a.accountNo, code: true },
    { header: 'Type', cell: (a) => a.type },
    { header: 'Balance', cell: (a) => <span dir="ltr" className="font-mono font-medium text-heading">{formatSar(a.balance)}</span>, className: 'text-end' },
    { header: 'Status', cell: (a) => (
      <Badge background={a.status === t('Reconciled') ? 'var(--tint-blue)' : 'var(--tint-orange)'}
        color={a.status === t('Reconciled') ? 'var(--salis-blue)' : 'var(--salis-orange)'}>{a.status}</Badge>
    ) },
    { header: 'Last Reconciled', cell: (a) => <span dir="ltr" className="text-muted">{a.lastReconciled}</span> },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <PageHeader icon="Landmark" title={t('Bank Accounts')} subtitle={t('Accounting')} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} mono />
        ))}
      </div>

      <DataTable
        caption="Bank accounts"
        columns={columns}
        rows={accounts}
        rowKey={(a) => a.accountNo}
        mobileCard={(a) => (
          <>
            <MobileCardHeader
              title={a.bank}
              trailing={
                <Badge background={a.status === t('Reconciled') ? 'var(--tint-blue)' : 'var(--tint-orange)'}
                  color={a.status === t('Reconciled') ? 'var(--salis-blue)' : 'var(--salis-orange)'}>{a.status}</Badge>
              }
            />
            <MobileCardRow label={t('Account')}><span dir="ltr">{a.accountNo} · {a.type}</span></MobileCardRow>
            <MobileCardRow label={t('Balance')}><span dir="ltr" className="font-semibold">{formatSar(a.balance)}</span></MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Landmark" title={t('No bank accounts found')} />}
      />
    </div>
  )
}
