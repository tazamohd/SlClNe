import { useMemo, useState } from 'react'
import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Money, formatSar } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { ErrorState, Loading } from '@/components/ui/States'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
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

/** General Ledger — every chart-of-accounts row with its debit/credit
 *  placement, read from `GET /accounting/reports/trial-balance` (F-028). That
 *  endpoint already computes this exact breakdown in SQL over the whole
 *  tenant scope, one row per account with the balance placed on its normal
 *  side; the client sums nothing.
 *
 *  This used to be fifteen hand-written rows with a docstring that admitted
 *  "spec-only build, all amounts are mock data." There is no fixture
 *  fallback: a build with no API names the gap (`ReportGap`) rather than
 *  showing the mock again. */

const ACCOUNT_TYPES = ['All', 'Assets', 'Liabilities', 'Equity', 'Revenue', 'Expense'] as const

interface LedgerAccount {
  code: string
  name: string
  type: string
  debit: number
  credit: number
  balance: number
}

const TYPE_PALETTE: Record<string, readonly [string, string]> = {
  Assets: ['var(--tint-blue)', 'var(--salis-blue)'],
  Liabilities: ['var(--tint-orange)', 'var(--salis-orange)'],
  Equity: ['var(--tint-navy)', 'var(--salis-navy)'],
  Revenue: ['var(--tint-bright)', 'var(--salis-blue-bright)'],
  Expense: ['var(--tint-neutral)', 'var(--text-muted)'],
}

export function GeneralLedger() {
  const { t } = usePreferences()
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [query, setQuery] = useState('')
  const trialBalance = useTrialBalance()

  const accounts: readonly LedgerAccount[] = useMemo(
    () =>
      (trialBalance.data?.accounts ?? []).map((a) => ({
        code: a.code,
        name: a.name,
        type: a.type,
        debit: fromHalalas(a.debitHalalas),
        credit: fromHalalas(a.creditHalalas),
        balance: fromHalalas(a.debitHalalas - a.creditHalalas),
      })),
    [trialBalance.data],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return accounts
      .filter((a) => typeFilter === 'All' || a.type === typeFilter)
      .filter(
        (a) => !needle || a.code.toLowerCase().includes(needle) || a.name.toLowerCase().includes(needle),
      )
  }, [accounts, typeFilter, query])

  const totals = trialBalance.data?.totals
  const stats: Stat[] = [
    { label: 'Total Accounts', value: accounts.length, caption: 'In the ledger', highlight: true },
    { label: 'Total Debit', value: totals ? formatSar(fromHalalas(totals.debitHalalas)) : '—', caption: 'All accounts' },
    { label: 'Total Credit', value: totals ? formatSar(fromHalalas(totals.creditHalalas)) : '—', caption: 'All accounts' },
    {
      label: 'Net Balance',
      value: totals ? formatSar(fromHalalas(totals.differenceHalalas)) : '—',
      caption: 'Debit minus credit',
      tone: 'info',
    },
  ]

  const columns: Column<LedgerAccount>[] = [
    { header: 'Account Code', cell: (a) => a.code, code: true },
    { header: 'Account Name', cell: (a) => t(a.name) },
    {
      header: 'Type',
      cell: (a) => {
        const [bg, fg] = TYPE_PALETTE[a.type] ?? TYPE_PALETTE.Expense
        return <Badge background={bg} color={fg}>{t(a.type)}</Badge>
      },
    },
    { header: 'Debit', cell: (a) => <Money sar={a.debit} />, className: 'text-end' },
    { header: 'Credit', cell: (a) => <Money sar={a.credit} />, className: 'text-end' },
    { header: 'Balance', cell: (a) => <Money sar={a.balance} className="font-semibold" />, className: 'text-end' },
  ]

  if (financeReports === null) {
    return (
      <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
        <FeatureHeader
          icon="BookOpen"
          title={t('General Ledger')}
          subtitle={t('Account listing with balances and date filters')}
        />
        <ReportGap
          icon="BookOpen"
          title={t('General Ledger')}
          collection={AGGREGATE_GAP.ledger}
          detail={t(
            'The account listing is computed by the server from the chart of accounts. Connect the API to see it — no accounts are invented here.',
          )}
        />
      </div>
    )
  }

  if (trialBalance.isLoading) {
    return <Loading label={t('Loading the ledger…')} />
  }
  if (trialBalance.isError || !trialBalance.data) {
    return <ErrorState description={trialBalance.error?.message} onRetry={() => void trialBalance.refetch()} />
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="BookOpen"
        title={t('General Ledger')}
        subtitle={t('Account listing with balances and date filters')}
      />
      <StatRow stats={stats} />
      <ServerTotalsNote endpoint="GET /accounting/reports/trial-balance" />

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted">{t('Search')}</span>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Code or name')}
            aria-label={t('Search accounts')}
            inputSize="sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted">{t('Account Type')}</span>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label={t('Filter by account type')}
            size="md"
          >
            {ACCOUNT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'All' ? t('All Types') : t(type)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <DataTable
        caption="General ledger entries"
        columns={columns}
        rows={filtered}
        rowKey={(a) => a.code}
        mobileCard={(a) => {
          const [bg, fg] = TYPE_PALETTE[a.type] ?? TYPE_PALETTE.Expense
          return (
            <>
              <MobileCardHeader title={a.code} code trailing={<Badge background={bg} color={fg}>{t(a.type)}</Badge>} />
              <MobileCardRow>{t(a.name)}</MobileCardRow>
              <MobileCardRow label={t('Balance')}><Money sar={a.balance} className="font-semibold text-heading" /></MobileCardRow>
            </>
          )
        }}
        empty={<EmptyState icon="BookOpen" title={t('No accounts match the filter')} />}
      />
    </div>
  )
}
