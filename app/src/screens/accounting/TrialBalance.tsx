import { useMemo } from 'react'
import { FeatureHeader, StatRow, type Stat } from '@/components/shell/FeatureScreen'
import { Icon } from '@/components/ui/Icon'
import { Money, formatSar } from '@/components/ui/Money'
import { DataTable, type Column, EmptyState } from '@/components/ui/DataTable'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  MobileCardHeader,
  MobileCardRow,
} from '@/components/shell/MobileShell'

/** Trial Balance screen — spec-only build.
 *
 *  Shows the trial balance with opening balance, period debit/credit, and
 *  closing balance for each account. The bottom row totals confirm the
 *  ledger balances (debits must equal credits). */

interface TrialBalanceRow {
  code: string
  name: string
  opening: number
  debit: number
  credit: number
  closing: number
}

const MOCK_ROWS: readonly TrialBalanceRow[] = [
  { code: '1001', name: 'Cash in Hand', opening: 100000, debit: 245000, credit: 120000, closing: 225000 },
  { code: '1002', name: 'Bank – Al Rajhi', opening: 750000, debit: 1850000, credit: 980000, closing: 1620000 },
  { code: '1003', name: 'Accounts Receivable', opening: 140000, debit: 520000, credit: 340000, closing: 320000 },
  { code: '1004', name: 'Inventory – Parts', opening: 200000, debit: 380000, credit: 195000, closing: 385000 },
  { code: '2001', name: 'Accounts Payable', opening: 180000, debit: 150000, credit: 410000, closing: 440000 },
  { code: '2002', name: 'VAT Payable', opening: 60000, debit: 45000, credit: 128000, closing: 143000 },
  { code: '3001', name: 'Owner Equity', opening: 500000, debit: 0, credit: 0, closing: 500000 },
  { code: '3002', name: 'Retained Earnings', opening: 250000, debit: 0, credit: 70000, closing: 320000 },
  { code: '4001', name: 'Service Revenue', opening: 0, debit: 0, credit: 1450000, closing: 1450000 },
  { code: '4002', name: 'Parts Sales', opening: 0, debit: 0, credit: 680000, closing: 680000 },
  { code: '5001', name: 'Salaries & Wages', opening: 0, debit: 620000, credit: 0, closing: 620000 },
  { code: '5002', name: 'Rent Expense', opening: 0, debit: 180000, credit: 0, closing: 180000 },
  { code: '5003', name: 'Utilities', opening: 0, debit: 45000, credit: 0, closing: 45000 },
  { code: '5004', name: 'Parts Cost of Goods', opening: 0, debit: 480000, credit: 0, closing: 480000 },
]

export function TrialBalance() {
  const { t } = usePreferences()

  const totals = useMemo(() => {
    let debit = 0
    let credit = 0
    for (const row of MOCK_ROWS) {
      debit += row.debit
      credit += row.credit
    }
    return { debit, credit, difference: debit - credit, count: MOCK_ROWS.length }
  }, [])

  const balanced = Math.abs(totals.difference) < 0.005

  const stats: Stat[] = [
    { label: 'Total Debit', value: formatSar(totals.debit), caption: 'Period total', highlight: true },
    { label: 'Total Credit', value: formatSar(totals.credit), caption: 'Period total' },
    {
      label: 'Difference',
      value: formatSar(totals.difference),
      caption: balanced ? 'Balanced' : 'Out of balance',
      tone: balanced ? 'info' : 'warning',
    },
    { label: 'Accounts', value: totals.count, caption: 'In trial balance' },
  ]

  const columns: Column<TrialBalanceRow>[] = [
    { header: 'Account Code', cell: (r) => r.code, code: true },
    { header: 'Account Name', cell: (r) => t(r.name) },
    { header: 'Opening Balance', cell: (r) => <Money sar={r.opening} />, className: 'text-end' },
    { header: 'Debit', cell: (r) => <Money sar={r.debit} />, className: 'text-end' },
    { header: 'Credit', cell: (r) => <Money sar={r.credit} />, className: 'text-end' },
    { header: 'Closing Balance', cell: (r) => <Money sar={r.closing} className="font-semibold" />, className: 'text-end' },
  ]

  return (
    <div className="flex animate-fade-up flex-col gap-6 motion-reduce:animate-none">
      <FeatureHeader
        icon="Scale"
        title={t('Trial Balance')}
        subtitle={t('Debit and credit columns with period totals')}
      />
      <StatRow stats={stats} />

      {!balanced && (
        <div className="flex items-center gap-2 rounded-lg border border-salis-orange/30 bg-salis-orange/[.06] px-4 py-3 text-[13px] text-body">
          <Icon name="AlertTriangle" size={16} className="flex-shrink-0 text-salis-orange" />
          {t('The trial balance does not balance — total debits do not equal total credits.')}
        </div>
      )}

      <DataTable
        caption="Trial balance report"
        columns={columns}
        rows={MOCK_ROWS as TrialBalanceRow[]}
        rowKey={(r) => r.code}
        footer={
          <div className="flex items-center justify-between border-t-2 border-border px-6 py-3 text-[13px] font-bold text-heading">
            <span>{t('Totals')}</span>
            <span className="flex items-center gap-6">
              <Money sar={MOCK_ROWS.reduce((s, r) => s + r.opening, 0)} className="font-bold" />
              <Money sar={totals.debit} className="font-bold" />
              <Money sar={totals.credit} className="font-bold" />
              <Money sar={MOCK_ROWS.reduce((s, r) => s + r.closing, 0)} className="font-bold" />
            </span>
          </div>
        }
        mobileCard={(r) => (
          <>
            <MobileCardHeader title={r.code} code />
            <MobileCardRow>{t(r.name)}</MobileCardRow>
            <MobileCardRow label={t('Closing')}><Money sar={r.closing} className="font-semibold text-heading" /></MobileCardRow>
          </>
        )}
        empty={<EmptyState icon="Scale" title={t('No accounts found')} />}
      />
    </div>
  )
}
