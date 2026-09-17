import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
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

/** Trial Balance — the debit/credit column for every account, from
 *  `GET /accounting/reports/trial-balance` (F-028). The server places each
 *  account's balance on its normal side and sums both columns in SQL; there
 *  is no opening-balance or period-movement concept in the schema (accounts
 *  carry one current `balanceHalalas`, not a ledger of movements), so this
 *  shows exactly what the server tracks — code, name, debit, credit — rather
 *  than inventing an opening figure the way the old mock rows did.
 *
 *  This used to be fourteen hand-written rows with a docstring admitting
 *  "spec-only build." There is no fixture fallback: a build with no API
 *  names the gap (`ReportGap`) instead. */

interface TrialBalanceRow {
  code: string
  name: string
  debit: number
  credit: number
}

export function TrialBalance() {
  const { t } = usePreferences()
  const trialBalance = useTrialBalance()

  const rows: readonly TrialBalanceRow[] = (trialBalance.data?.accounts ?? []).map((a) => ({
    code: a.code,
    name: a.name,
    debit: fromHalalas(a.debitHalalas),
    credit: fromHalalas(a.creditHalalas),
  }))

  const totals = trialBalance.data?.totals
  const balanced = trialBalance.data?.balanced ?? true

  const stats: Stat[] = [
    { label: 'Total Debit', value: totals ? formatSar(fromHalalas(totals.debitHalalas)) : '—', caption: 'All accounts', highlight: true },
    { label: 'Total Credit', value: totals ? formatSar(fromHalalas(totals.creditHalalas)) : '—', caption: 'All accounts' },
    {
      label: 'Difference',
      value: totals ? formatSar(fromHalalas(totals.differenceHalalas)) : '—',
      caption: balanced ? 'Balanced' : 'Out of balance',
      tone: balanced ? 'info' : 'warning',
    },
    { label: 'Accounts', value: rows.length, caption: 'In trial balance' },
  ]

  const columns: Column<TrialBalanceRow>[] = [
    { header: 'Account Code', cell: (r) => r.code, code: true },
    { header: 'Account Name', cell: (r) => t(r.name) },
    { header: 'Debit', cell: (r) => <Money sar={r.debit} />, className: 'text-end' },
    { header: 'Credit', cell: (r) => <Money sar={r.credit} />, className: 'text-end' },
  ]

  if (financeReports === null) {
    return (
      <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
        <FeatureHeader
          icon="Scale"
          title={t('Trial Balance')}
          subtitle={t('Debit and credit columns with period totals')}
        />
        <ReportGap
          icon="Scale"
          title={t('Trial Balance')}
          collection={AGGREGATE_GAP.ledger}
          detail={t(
            'The trial balance is summed by the server over your whole organization. Connect the API to see it — no figures are estimated here.',
          )}
        />
      </div>
    )
  }

  if (trialBalance.isLoading) {
    return <Loading label={t('Loading the trial balance…')} />
  }
  if (trialBalance.isError || !trialBalance.data) {
    return <ErrorState description={trialBalance.error?.message} onRetry={() => void trialBalance.refetch()} />
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Scale"
        title={t('Trial Balance')}
        subtitle={t('Debit and credit columns with period totals')}
      />
      <StatRow stats={stats} />
      <ServerTotalsNote endpoint="GET /accounting/reports/trial-balance" />

      {!balanced && (
        <div className="flex items-center gap-2 rounded-lg border border-salis-orange/30 bg-salis-orange/[.06] px-4 py-3 text-[13px] text-body">
          <Icon name="AlertTriangle" size={16} className="flex-shrink-0 text-salis-orange" />
          {t('The trial balance does not balance — total debits do not equal total credits.')}
        </div>
      )}

      <DataTable
        caption="Trial balance report"
        columns={columns}
        rows={rows as TrialBalanceRow[]}
        rowKey={(r) => r.code}
        footer={
          totals ? (
            <div className="flex items-center justify-between border-t-2 border-border px-6 py-3 text-[13px] font-bold text-heading">
              <span>{t('Totals')}</span>
              <span className="flex items-center gap-6">
                <Money sar={fromHalalas(totals.debitHalalas)} className="font-bold" />
                <Money sar={fromHalalas(totals.creditHalalas)} className="font-bold" />
              </span>
            </div>
          ) : undefined
        }
        mobileCard={(r) => (
          <>
            <MobileCardHeader title={r.code} code />
            <MobileCardRow>{t(r.name)}</MobileCardRow>
            <MobileCardRow label={t('Debit')}><Money sar={r.debit} className="font-semibold text-heading" /></MobileCardRow>
            <MobileCardRow label={t('Credit')}><Money sar={r.credit} className="font-semibold text-heading" /></MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Scale" title={t('No accounts found')} />}
      />
    </div>
  )
}
