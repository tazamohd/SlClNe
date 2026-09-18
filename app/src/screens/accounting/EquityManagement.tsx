import { useMemo } from 'react'
import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { ErrorState, Loading } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCardHeader,
  MobileCardRow,
} from '@/components/shell/MobileShell'
import { financeReports } from '@/data/repository'
import { fromHalalas } from '@/screens/finance/money'
import { AGGREGATE_GAP } from './reporting'
import { ReportGap, ServerTotalsNote } from './ReportControls'
import { useTrialBalance } from './useFinanceReports'

/** Equity Management — the equity accounts from
 *  `GET /accounting/reports/trial-balance` (F-028), the same source
 *  `BalanceSheet.tsx`'s equity section reads. Each row is one account's own
 *  server-computed balance; the total is `balanceSheet.equityHalalas` as the
 *  server returned it, never re-summed here.
 *
 *  This used to show a "Paid-in Capital / Retained Earnings / Reserves /
 *  Drawings" sub-classification per account. `chartOfAccounts` carries no
 *  such column — only a top-level `type` (Assets/Liabilities/Equity/Revenue/
 *  Expense) — so that breakdown was invented, and is dropped along with the
 *  KPI tiles that summed by it. There is no fixture fallback: a build with
 *  no API names the gap (`ReportGap`) instead. */

interface EquityRow {
  code: string
  name: string
  balanceHalalas: number
}

export function EquityManagement() {
  const { t } = usePreferences()
  const trialBalance = useTrialBalance()

  const rows: readonly EquityRow[] = useMemo(
    () =>
      (trialBalance.data?.accounts ?? [])
        .filter((a) => a.type === 'Equity')
        .map((a) => ({ code: a.code, name: a.name, balanceHalalas: a.creditHalalas })),
    [trialBalance.data],
  )

  const bs = trialBalance.data?.balanceSheet

  const stats: Stat[] = [
    { label: 'Total Equity', value: bs ? formatSar(fromHalalas(bs.equityHalalas)) : '—', caption: 'Net worth', highlight: true },
    { label: 'Equity Accounts', value: rows.length, caption: 'In the chart of accounts' },
  ]

  const columns: Column<EquityRow>[] = [
    { header: 'Code', cell: (e) => e.code, code: true },
    { header: 'Name', cell: (e) => t(e.name) },
    { header: 'Type', cell: () => <Badge background="var(--tint-navy)" color="var(--salis-navy)">{t('Equity')}</Badge> },
    { header: 'Balance', cell: (e) => <Money sar={fromHalalas(e.balanceHalalas)} className="font-semibold" />, className: 'text-end' },
  ]

  if (financeReports === null) {
    return (
      <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
        <FeatureHeader icon="PiggyBank" title={t('Equity Management')} subtitle={t('Owner equity accounts and reserves')} />
        <ReportGap
          icon="PiggyBank"
          title={t('Equity Management')}
          collection={AGGREGATE_GAP.ledger}
          detail={t(
            'Equity accounts are summed by the server over your whole organization. Connect the API to see it — no figures are estimated here.',
          )}
        />
      </div>
    )
  }

  if (trialBalance.isLoading) {
    return <Loading label={t('Loading equity accounts…')} />
  }
  if (trialBalance.isError || !trialBalance.data) {
    return <ErrorState description={trialBalance.error?.message} onRetry={() => void trialBalance.refetch()} />
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="PiggyBank"
        title={t('Equity Management')}
        subtitle={t('Owner equity accounts and reserves')}
      />
      <StatRow stats={stats} />
      <ServerTotalsNote endpoint="GET /accounting/reports/trial-balance" />

      <DataTable
        caption="Equity accounts"
        columns={columns}
        rows={rows as EquityRow[]}
        rowKey={(e) => e.code}
        mobileCard={(e) => (
          <>
            <MobileCardHeader title={e.code} code trailing={<Badge background="var(--tint-navy)" color="var(--salis-navy)">{t('Equity')}</Badge>} />
            <MobileCardRow>{t(e.name)}</MobileCardRow>
            <MobileCardRow label={t('Balance')}><Money sar={fromHalalas(e.balanceHalalas)} className="font-semibold text-heading" /></MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="PiggyBank" title={t('No equity accounts found')} />}
      />
    </div>
  )
}
